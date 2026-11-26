"""Bake the fitted Blender masters and export the game copies, preserving live sockets."""
import json
import math
import struct
import sys
import tempfile
from pathlib import Path
import bpy
import numpy as np
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from fleet.build import ROOT, blueprints

def select(objects):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:
        o.select_set(True)
    if objects:
        bpy.context.view_layer.objects.active = objects[0]

def merge(objects, name):
    select(objects)
    if len(objects) > 1:
        bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = name
    return ob

def bake_room(scene, parts, name, size, folder):
    ob = merge(parts, name)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.003, margin_method='FRACTION', area_weight=0.2)
    bpy.ops.object.mode_set(mode='OBJECT')
    img = bpy.data.images.new(name + ' light', size, size, alpha=False, float_buffer=True)
    extra = []
    for m in set(ob.data.materials):
        node = m.node_tree.nodes.new('ShaderNodeTexImage')
        node.image = img
        m.node_tree.nodes.active = node
        extra.append((m, node))
    # Include material, lamp emission and bounced light. Metals keep the diffuse colour of their alloy in the atlas.
    metal = []
    for m, _ in extra:
        p = m.node_tree.nodes.get('Principled BSDF')
        if p:
            socket = p.inputs['Metallic']
            metal.append((socket, socket.default_value))
            socket.default_value *= 0.22
    bpy.ops.object.bake(type='COMBINED', pass_filter={'DIFFUSE', 'DIRECT', 'INDIRECT', 'COLOR', 'EMIT'}, margin=3)
    for socket, val in metal:
        socket.default_value = val
    for m, node in extra:
        m.node_tree.nodes.remove(node)
    dest = folder / (name + '.jpg')
    img.save_render(str(dest), scene=scene)
    bpy.data.images.remove(img)
    m = bpy.data.materials.new('baked ' + name)
    m.use_nodes = True
    nodes = m.node_tree.nodes
    links = m.node_tree.links
    nodes.clear()
    surface = nodes.new('ShaderNodeOutputMaterial')
    unlit = nodes.new('ShaderNodeEmission')
    # Preserve the Cycles lighting in an embedded emissive JPEG.
    tex = nodes.new('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(str(dest))
    links.new(tex.outputs['Color'], unlit.inputs[0])
    links.new(unlit.outputs[0], surface.inputs[0])
    ob.data.materials.clear()
    ob.data.materials.append(m)
    return ob

def export(ship, flight, folder):
    key = ship['id']
    group = 'cockpits' if flight else 'ship-interiors'
    source = ROOT / 'art' / group / (key + '.blend')
    bpy.ops.wm.open_mainfile(filepath=str(source), use_scripts=False)
    scene = next((s for s in bpy.data.scenes if len(s.objects) > 0))
    bpy.context.window.scene = scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 10
    scene.cycles.max_bounces = 4
    scene.render.image_settings.file_format = 'JPEG'
    scene.render.image_settings.quality = 87
    scene.render.image_settings.color_mode = 'RGB'
    baked = []
    marks = [o for o in scene.objects if o.type == 'EMPTY']
    other = []
    # Group by the authored room collections, never by spatial proximity between decks.
    for d in ship['decks'][:1 if flight else None]:
        for room in d['rooms']:
            if flight and room['id'] != '01':
                continue
            coll = next((c for c in bpy.data.collections if c.name.startswith(room['id'] + ' ')))
            parts = []
            for o in list(coll.objects):
                if o.type != 'MESH':
                    continue
                name = o.name.split('.')[0]
                if name.startswith('state_'):
                    # Exclude all variants from light bakes so a broken fitting leaves no permanent shadow.
                    o.animation_data_clear()
                    o.hide_render = True
                    o.hide_viewport = False
                    other.append(o)
                elif name in ('windshield', 'canopy_left', 'canopy_right', 'door'):
                    o.name = name
                    other.append(o)
                    if not o.data.uv_layers:
                        uv = o.data.uv_layers.new()
                        for face in o.data.polygons:
                            for i, li in enumerate(face.loop_indices):
                                uv.data[li].uv = ((0, 0), (1, 0), (1, 1), (0, 1))[i % 4]
                else:
                    parts.append(o)
            baked.append(bake_room(scene, parts, 'room_' + room['id'], 1024 if flight else 768, folder))
            print('FLEET baked', key, group, room['name'], flush=True)
    for o in other:
        o.hide_render = False
        # Only the base PBR values travel with hardware. Procedural textures are already in the room bakes.
        for m in o.data.materials:
            p = m.node_tree.nodes.get('Principled BSDF') if m.use_nodes else None
            if p:
                for k in ('Base Color', 'Normal'):
                    for link in list(p.inputs[k].links):
                        m.node_tree.links.remove(link)
        if o.name == 'door':
            # Move the origin onto the panel for the game's door slide.
            from mathutils import Vector
            center = sum((v.co for v in o.data.vertices), Vector()) / len(o.data.vertices)
            for v in o.data.vertices:
                v.co -= center
            o.location += center
    select(baked + marks + other)
    dest = ROOT / 'assets' / group / (key + '.glb')
    bpy.ops.export_scene.gltf(filepath=str(dest), export_format='GLB', use_selection=True, export_normals=False, export_animations=False, export_extras=False, export_cameras=False, export_lights=False, export_image_format='AUTO')
    raw = dest.read_bytes()
    j = json.loads(raw[20:20 + struct.unpack_from('<I', raw, 12)[0]])
    anchors = {n['name']: dict(position=n.get('translation', [0, 0, 0]), quaternion=n.get('rotation', [0, 0, 0, 1])) for n in j['nodes'] if 'mesh' not in n}
    triangles = sum((j['accessors'][p['indices']]['count'] // 3 for m in j['meshes'] for p in m['primitives']))
    record = dict(ship=key, name=ship['name'], file=dest.relative_to(ROOT).as_posix(), triangles=triangles, meshes=len(j['meshes']), materials=len(j['materials']), bytes=len(raw), anchors=anchors, fitted=True)
    if not flight:
        from fleet.navigation import layout
        record.update(layout(ship))
    mf = dest.parent / 'manifest.json'
    data = json.loads(mf.read_text())
    data['ships'] = [record if s['ship'] == key else s for s in data['ships']]
    mf.write_text(json.dumps(data, indent=2) + '\n')
    print('FLEET exported', key, group, triangles, len(raw), flush=True)

def game(key):
    ship = next((s for s in blueprints() if s['id'] == key))
    with tempfile.TemporaryDirectory() as temp:
        for flight in (True, False):
            export(ship, flight, Path(temp))
if __name__ == '__main__':
    for k in sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [s['id'] for s in blueprints()]:
        game(k)
