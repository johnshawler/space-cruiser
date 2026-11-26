"""Create fully editable Blender scenes without modifying the currently open scene."""
import bpy
from mathutils import Vector
from .geometry import PALETTES, SURFACES

def linear(color):
    return tuple((((v / 255 + 0.055) / 1.055) ** 2.4 if v > 10 else v / 3294.6 for v in bytes.fromhex(color)))

def material(ship, role, color):
    m = bpy.data.materials.new(ship + ' / ' + role)
    m.use_nodes = True
    nodes = m.node_tree.nodes
    links = m.node_tree.links
    shader = nodes.get('Principled BSDF')
    rgba = (*linear(color), 0.14 if role == 'glass' else 1)
    m.diffuse_color = rgba
    shader.inputs['Base Color'].default_value = rgba
    shader.inputs['Roughness'].default_value = {'trim': 0.31, 'steel': 0.42, 'ceramic': 0.27, 'glass': 0.09, 'cloth': 0.89, 'timber': 0.43}.get(role, 0.65)
    shader.inputs['Metallic'].default_value = {'trim': 0.75, 'steel': 0.68, 'utility': 0.42}.get(role, 0)
    if role == 'glass':
        shader.inputs['Alpha'].default_value = 0.14
    if role == 'lamp':
        shader.inputs['Emission Color'].default_value = rgba
        shader.inputs['Emission Strength'].default_value = 2
    if role in ('timber', 'cloth', 'deck', 'plaster', 'steel', 'inlay'):
        tex = nodes.new('ShaderNodeTexNoise')
        tex.inputs['Scale'].default_value = {'cloth': 180, 'timber': 12, 'deck': 50}.get(role, 38)
        mapping = nodes.new('ShaderNodeVectorMath')
        mapping.operation = 'MULTIPLY'
        mapping.inputs[1].default_value = (1.5, 15, 3) if role == 'timber' else (1, 1, 1)
        links.new(nodes.new('ShaderNodeTexCoord').outputs['Object'], mapping.inputs[0])
        links.new(mapping.outputs[0], tex.inputs['Vector'])
        ramp = nodes.new('ShaderNodeValToRGB')
        ramp.color_ramp.elements[0].color = tuple((v * 0.73 for v in rgba[:3])) + (1,)
        ramp.color_ramp.elements[1].color = tuple((min(1, v * 1.16) for v in rgba[:3])) + (1,)
        links.new(tex.outputs['Fac'], ramp.inputs[0])
        links.new(ramp.outputs[0], shader.inputs['Base Color'])
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = 0.17
        bump.inputs['Distance'].default_value = 0.004
        links.new(tex.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs[0], shader.inputs['Normal'])
    return m

def make_scene(root, ship, model, flight=False, proof=False):
    key = ship['id']
    scene = bpy.data.scenes.new(ship['name'] + (' / Cockpit' if flight else ' / Fitted decks'))
    world = bpy.data.worlds.new(key + ' cabin ambient')
    scene.world = world
    world.color = (0.18, 0.15, 0.125)
    palette = dict(zip(SURFACES, PALETTES[key][1]))
    palette['glass'] = 'a0d6df'
    materials = {k: material(key, k, c) for k, c in palette.items()}

    def group(parent, name):
        c = bpy.data.collections.new(name)
        parent.children.link(c)
        return c

    def obj(c, name, data):
        o = bpy.data.objects.new(name, data)
        c.objects.link(o)
        return o
    rooms = {}
    for d in ship['decks'][:1 if flight else None]:
        level = group(scene.collection, d['name'])
        for r in d['rooms']:
            if not flight or r['id'] == '01':
                rooms[r['id']] = group(level, r['id'] + ' ' + r['name'])
    axes = lambda v: (v[0], -v[2], v[1])
    anchors = group(scene.collection, 'Game sockets')
    for name, a in model.anchors.items():
        o = obj(anchors, name, None)
        o.location = axes(a['position'])
        o.empty_display_size = 0.085
        o.rotation_euler = (a['tilt'], 0, a['yaw'])
        o.scale = (a['scale'],) * 3
        if name.startswith('fault_'):
            o['repair_state'] = 0
    for (room, part), (points, faces, roles) in model.objects.items():
        if not faces:
            continue
        verts = []
        indices = {}
        polys = []
        for f in faces:
            poly = []
            for i in f:
                v = tuple((round(float(e), 6) for e in axes(points[i])))
                if v not in indices:
                    indices[v] = len(verts)
                    verts.append(v)
                poly.append(indices[v])
            polys.append(poly)
        mesh = bpy.data.meshes.new(part)
        mesh.from_pydata(verts, [], polys)
        mesh.update()
        o = obj(rooms[room], part, mesh)
        slot = list(dict.fromkeys(roles))
        for name in slot:
            mesh.materials.append(materials[name])
        mesh.polygons.foreach_set('material_index', [slot.index(k) for k in roles])
        if part.startswith('state_'):
            _, fault, state = part.split('_')
            a = next((o for o in anchors.objects if o.name.split('.')[0] == 'fault_' + fault))
            for prop in ('hide_viewport', 'hide_render'):
                driver = o.driver_add(prop).driver
                v = driver.variables.new()
                v.name = 'state'
                v.targets[0].id = a
                v.targets[0].data_path = '["repair_state"]'
                driver.expression = 'state != ' + str(('working', 'broken', 'repaired').index(state))
    camera_group = group(scene.collection, 'Room views and practical lights')

    def camera(name, loc, look):
        data = bpy.data.cameras.new(name)
        cam = obj(camera_group, name, data)
        cam.location = axes(loc)
        cam.rotation_euler = (Vector(axes(look)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
        data.lens = 19
        data.clip_start = 0.02
        return cam
    hero = {'dromedary': '08', 'stoat': '02', 'manatee': '04', 'empress': '06'}[key]
    for d in ship['decks'][:1 if flight else None]:
        for r in d['rooms']:
            if flight and r['id'] != '01':
                continue
            x, z = r['label']
            floor = d['floor_y']
            shift = getattr(model, 'eye', (0, 0, 0))
            x -= shift[0]
            z -= shift[2]
            floor -= shift[1]
            poly = r['polygon']
            p = max(poly, key=lambda p: p[0] + p[1] * 0.7)
            cam = camera('View ' + r['name'], (0.81 * (p[0] - shift[0]) + 0.19 * x, floor + 1.43, 0.81 * (p[1] - shift[2]) + 0.19 * z), (x, floor + 0.96, z))
            if r['id'] == hero or flight:
                scene.camera = cam
            l = bpy.data.lights.new('Practical ' + r['name'], 'AREA')
            light = obj(camera_group, l.name, l)
            light.location = axes((x, floor + d['clear_height'] - 0.17, z))
            l.energy = 105 if r['use'] == 'route' else 175
            l.color = (1, 0.84, 0.67)
            l.shape = 'DISK'
            l.size = 1.2
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 12
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 800
    scene.render.resolution_y = 500
    scene.render.resolution_percentage = 100
    target = root / 'art' / ('cockpits' if flight else 'ship-interiors') / (key + '.blend')
    if not flight:
        from .exterior import attach
        attach(scene, key, target)
    # Writing a library containing a scene includes its materials, collections, cameras and animation drivers.
    bpy.data.libraries.write(str(target), {scene}, fake_user=True, compress=True)
    if proof and (not flight):
        dest = root / 'docs/ship-interiors' / key / 'fitted-room.jpg'
        dest.parent.mkdir(exist_ok=True, parents=True)
        scene.render.image_settings.file_format = 'JPEG'
        scene.render.image_settings.quality = 90
        scene.render.filepath = str(dest)
        bpy.ops.render.render(write_still=True, scene=scene.name)
        from .exterior import cutaway
        cutaway(scene, ship, dest.parent)
    return scene
