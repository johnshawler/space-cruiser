"""Keep the original game hull with the fitted deck master as an optional inspection layer."""
import gzip
import json
import os
from pathlib import Path
import bpy
from mathutils import Vector
NAME = 'Exterior hull / fit reference'

def attach(scene, key, target):
    source = os.environ.get('FLEET_HULL_DIR')
    if not source:
        # A normal rebuild can reuse the exterior embedded in the versioned Blender master.
        with bpy.data.libraries.load(str(target)) as (available, selected):
            selected.collections = [NAME] if NAME in available.collections else []
        if not selected.collections:
            raise ValueError('Generate the hull references with hulls.cjs and set FLEET_HULL_DIR')
        scene.collection.children.link(selected.collections[0])
        return selected.collections[0]
    with gzip.open(Path(source) / (key + '.json.gz'), 'rt') as f:
        parts = json.load(f)
    coll = bpy.data.collections.new(NAME)
    scene.collection.children.link(coll)
    materials = {}
    for i, part in enumerate(parts):
        mesh = bpy.data.meshes.new(part['name'])
        points = [(x, -z, y) for x, y, z in part['vertices']]
        indices = part['indices']
        triangles = [indices[j:j + 3] for j in range(0, len(indices), 3) if len(set(indices[j:j + 3])) == 3]
        mesh.from_pydata(points, [], triangles)
        mesh.update()
        ob = bpy.data.objects.new(f"{key} / {i + 1:03} {part['name']}", mesh)
        coll.objects.link(ob)
        tag = (*part['color'], part['metal'], part['rough'])
        if tag not in materials:
            mat = bpy.data.materials.new(key + ' hull finish')
            mat.use_nodes = True
            p = mat.node_tree.nodes.get('Principled BSDF')
            p.inputs['Base Color'].default_value = (*part['color'], 1)
            mat.diffuse_color = (*part['color'], 1)
            p.inputs['Metallic'].default_value = part['metal']
            p.inputs['Roughness'].default_value = part['rough']
            materials[tag] = mat
        mesh.materials.append(materials[tag])
    coll.hide_render = True
    coll.hide_viewport = True
    return coll

def cutaway(scene, ship, folder):
    """Render the furnished decks side by side at the same scale. Changes affect only the proof scene in memory."""
    offset = 5.5 if len(ship['decks']) > 1 else 0
    for i, d in enumerate(ship['decks']):
        delta = offset * (2 * i - 1)
        ids = {r['id'] for r in d['rooms']}
        for c in bpy.data.collections:
            if not c.name[:2] in ids:
                continue
            for o in c.objects:
                o.location.x += delta
                if o.name.startswith('headliner'):
                    o.hide_render = True
    for o in scene.objects:
        if o.type == 'LIGHT':
            o.hide_render = True

    def add(name, data, position, target):
        o = bpy.data.objects.new(name, data)
        scene.collection.objects.link(o)
        o.location = position
        o.rotation_euler = (Vector(target) - o.location).to_track_quat('-Z', 'Y').to_euler()
        return o
    points = [(x + offset * (2 * i - 1), -z, d['floor_y']) for i, d in enumerate(ship['decks']) for r in d['rooms'] for x, z in r['polygon']]
    center = Vector(tuple(((min((p[k] for p in points)) + max((p[k] for p in points))) / 2 for k in range(3))))
    c = bpy.data.cameras.new('Cutaway')
    cam = add(c.name, c, center + Vector((16, -8, 41)), center)
    c.type = 'ORTHO'
    scene.camera = cam
    view = cam.rotation_euler.to_matrix().transposed()
    corners = [view @ (Vector(p) - center) for p in points]
    # Frame the full height of both decks as well as the ceiling-height bulkheads.
    spanx = max((p.x for p in corners)) - min((p.x for p in corners))
    spany = max((p.y for p in corners)) - min((p.y for p in corners))
    c.ortho_scale = max(spanx + 3, (spany + 3) * 1.33)
    for pos, power, size in [((-7, 9, 22), 5800, 14), ((15, -10, 14), 3200, 12)]:
        light = bpy.data.lights.new('Cutaway softbox', 'AREA')
        light.energy = power
        light.shape = 'DISK'
        light.size = size
        add(light.name, light, center + Vector(pos), center)
    scene.world.color = (0.24, 0.26, 0.3)
    scene.cycles.samples = 12
    scene.render.resolution_x = 960
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'JPEG'
    scene.render.image_settings.quality = 90
    scene.render.filepath = str(folder / 'deck-cutaway.jpg')
    bpy.ops.render.render(write_still=True, scene=scene.name)
