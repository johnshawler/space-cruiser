"""Game copies of the Codex character masters (16 humanoids, 16 robots).

Each master is far too heavy to draw a dozen at a time (40,000 to 150,000 triangles in 40 to 450 separate pieces, with
procedural materials). This makes the copy the game loads: one skinned mesh of about 12,000 triangles, the materials
baked to three picture maps (colour, occlusion/roughness/metal, surface relief), the skeleton, and the actions sampled
so the leg and arm solving is baked in.

    Blender -b --disable-autoexec <master.blend> --python art/characters/game-copies/make_game_copy.py -- \
        humanoid Taluun assets/characters/species/taluun.glb [work-folder]
    Blender -b --disable-autoexec <models/Thimble.blend> --python art/characters/game-copies/make_game_copy.py -- \
        robot Thimble assets/characters/species/thimble.glb [work-folder]

Humanoids come from motion/Long-Haul-Humanoid-Motion.blend (one scene per species). Their Happy, Bored and Sad morph
targets are kept; the driven head offset and lids are sampled into one-frame Happy/Bored/Sad clips; the eye-aperture
shader is baked open. Robots keep rigid parenting: every part becomes vertices weighted 1.0 to the bone it was parented
to. Hoses on hooks are skinned to the bones their hooks follow, and Nautil's skirt keeps its own weights.

Open the masters with scripts off (--disable-autoexec). Run all.sh for the whole cast.
The colour map is 1024 square; the other maps are half that.
"""
import bpy, bmesh, sys, os, json, math, time
import numpy as np

ARGS = sys.argv[sys.argv.index('--') + 1:]
KIND, NAME, OUT = ARGS[0], ARGS[1], os.path.abspath(ARGS[2])
WORK = os.path.abspath(ARGS[3]) if len(ARGS) > 3 else None
BUDGET = int(os.environ.get('TRIS', 12000 if KIND == 'humanoid' else 10000))
ATLAS = int(os.environ.get('ATLAS', 1024))
T0 = time.time()
INFO = {}


def log(*a):
    print('[copy %5.0fs]' % (time.time() - T0), *a, flush=True)


def tris_of(me):
    return sum(len(p.vertices) - 2 for p in me.polygons)


def activate(o, others=()):
    bpy.ops.object.select_all(action='DESELECT')
    for x in others:
        x.select_set(True)
    o.select_set(True)
    bpy.context.view_layer.objects.active = o


def islands(me):
    """Number of loose pieces in a mesh."""
    parent = list(range(len(me.vertices)))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a
    for e in me.edges:
        a, b = find(e.vertices[0]), find(e.vertices[1])
        if a != b:
            parent[a] = b
    return len({find(i) for i in range(len(parent))})


# ---------------------------------------------------------------- scene
def isolate(scn):
    bpy.context.window.scene = scn
    for s in list(bpy.data.scenes):
        if s is not scn:
            bpy.data.scenes.remove(s)
    return scn


def humanoid_parts():
    scn = isolate(bpy.data.scenes[NAME])
    rig = bpy.data.objects[NAME + ' | Rig']
    # where the demonstration stool's cushion is: the Seat pose sits on it, so the game needs its height and place
    pad = bpy.data.objects.get(NAME + ' / stool pad')
    if pad:
        c = [pad.matrix_world @ __import__('mathutils').Vector(v) for v in pad.bound_box]
        INFO['seat'] = [round(sum(v.x for v in c) / 8, 3), round(max(v.z for v in c), 3), round(-sum(v.y for v in c) / 8, 3)]
    keep = [o for o in scn.objects if o.type == 'MESH' and o.parent is rig]
    for o in list(scn.objects):
        if o is not rig and o not in keep:
            bpy.data.objects.remove(o, do_unlink=True)
    rig.animation_data.action = None
    for pb in rig.pose.bones:
        pb.location = (0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
    ex = rig.pose.bones.get('Expression')
    if ex:
        for k in ('Happy', 'Bored', 'Sad'):
            if k in ex:
                ex[k] = 0.0
    scn.frame_set(0)
    return scn, rig, keep


def robot_parts():
    scn = bpy.context.scene
    rig = [o for o in scn.objects if o.type == 'ARMATURE'][0]
    bpy.context.view_layer.objects.active = rig                 # the standalone files open in Pose Mode
    if bpy.context.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    for o in list(scn.objects):
        if o.type in ('CAMERA', 'LIGHT') or (o.type == 'MESH' and o.parent is None and not any(m.type == 'ARMATURE' for m in o.modifiers)):
            bpy.data.objects.remove(o, do_unlink=True)
    # the design pose is frame 0; every track muted so nothing plays while the parts are frozen
    for t in rig.animation_data.nla_tracks:
        t.mute = True
    rig.animation_data.action = None
    scn.frame_set(0)
    bpy.context.view_layer.update()
    parts = []
    for o in [o for o in scn.objects if o.type in ('MESH', 'CURVE')]:
        hooks = [(m.subtarget) for m in o.modifiers if m.type == 'HOOK' and m.subtarget]
        skinned = any(m.type == 'ARMATURE' for m in o.modifiers)
        bone = o.parent_bone if o.parent is rig and o.parent_type == 'BONE' else None
        if o.type == 'MESH' and o.data.users > 1:
            o.data = o.data.copy()
        activate(o)
        if o.type == 'CURVE':
            bpy.ops.object.convert(target='MESH')
            o = bpy.context.view_layer.objects.active
        else:
            for m in list(o.modifiers):
                if m.type == 'ARMATURE':
                    continue
                try:
                    bpy.ops.object.modifier_apply(modifier=m.name)
                except RuntimeError:
                    o.modifiers.remove(m)
        for m in list(o.modifiers):
            if m.type != 'ARMATURE':
                o.modifiers.remove(m)
        if not o.data.polygons:
            bpy.data.objects.remove(o, do_unlink=True)
            continue
        mw = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = mw
        activate(o)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        if skinned:
            pass                                             # Nautil's skirt: its own weights stand
        elif hooks:
            hose_weights(o, rig, hooks)
        else:
            if bone is None:
                bone = rig.data.bones[0].name
            for g in list(o.vertex_groups):
                o.vertex_groups.remove(g)
            o.vertex_groups.new(name=bone).add(range(len(o.data.vertices)), 1.0, 'REPLACE')
        if not skinned:
            o.parent = rig
            md = o.modifiers.new('Armature', 'ARMATURE')
            md.object = rig
        parts.append(o)
    return scn, rig, parts


def hose_weights(o, rig, bones):
    """A flexible lead follows the bones its hooks were tied to: blend by distance to each."""
    for g in list(o.vertex_groups):
        o.vertex_groups.remove(g)
    segs = []
    for b in dict.fromkeys(bones):
        bb = rig.data.bones.get(b)
        if bb:
            segs.append((o.vertex_groups.new(name=b), rig.matrix_world @ bb.head_local, rig.matrix_world @ bb.tail_local))
    for v in o.data.vertices:
        ws = []
        for g, a, b in segs:
            ab = b - a
            t = max(0.0, min(1.0, (v.co - a).dot(ab) / max(ab.length_squared, 1e-9)))
            d = (v.co - (a + ab * t)).length
            ws.append(1.0 / (d * d + 1e-4))
        s = sum(ws)
        for (g, _, _), w in zip(segs, ws):
            if w / s > 0.02:
                g.add([v.index], w / s, 'REPLACE')


# ---------------------------------------------------------------- reduce
def reduce(parts):
    """Share the triangle budget by surface area. Faces (anything with morph targets) get three times the density.
    Specks and rows of stitches or rivets are dropped: they cost thousands of triangles and are a pixel wide in play."""
    rows = []
    for o in list(parts):
        me = o.data
        t = tris_of(me)
        size = max(o.dimensions)
        n = islands(me) if t > 200 else 1
        if size < 0.02 or (n > 15 and t / n < 60 and size < 1.0 and not me.shape_keys):
            parts.remove(o)
            bpy.data.objects.remove(o, do_unlink=True)
            continue
        area = sum(p.area for p in me.polygons)
        rows.append([o, t, area * (3.0 if me.shape_keys else 1.0)])
    total = sum(r[1] for r in rows)
    lo, hi = 0.0, 1e9
    for _ in range(60):
        d = (lo + hi) / 2
        got = sum(min(r[1], max(12, d * r[2])) for r in rows)
        if got > BUDGET:
            hi = d
        else:
            lo = d
    for o, t, w in rows:
        want = min(t, max(12, lo * w))
        if want >= t * 0.9:
            continue
        activate(o)
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        # un-subdivide first: it thins a quad grid evenly, so a cloth shell's inner and outer walls stay apart
        quads = sum(1 for p in o.data.polygons if len(p.vertices) == 4)
        if quads > 0.8 * len(o.data.polygons) and t / want >= 2:
            it = int(math.log2(t / want))
            if it > 0:
                bpy.ops.mesh.unsubdivide(iterations=it)
        bpy.ops.object.mode_set(mode='OBJECT')
        now = tris_of(o.data)
        if now > want * 1.35:
            bpy.ops.object.mode_set(mode='EDIT')
            bpy.ops.mesh.select_all(action='SELECT')
            bpy.ops.mesh.decimate(ratio=max(0.02, want / now))
            bpy.ops.object.mode_set(mode='OBJECT')
    after = sum(tris_of(o.data) for o in parts)
    log('reduced', total, 'to', after, 'triangles in', len(parts), 'parts')
    return after


def join(parts, rig):
    # the part with morph targets leads, so the joined mesh keeps them
    lead = max(parts, key=lambda o: (bool(o.data.shape_keys), tris_of(o.data)))
    for o in parts:
        if o.data.shape_keys and o.data.shape_keys.animation_data:
            o.data.shape_keys.animation_data_clear()
    activate(lead, parts)
    bpy.ops.object.join()
    body = bpy.context.view_layer.objects.active
    body.name = body.data.name = NAME
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.quads_convert_to_tris(quad_method='BEAUTY', ngon_method='BEAUTY')
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.vertex_group_limit_total(group_select_mode='ALL', limit=4)
    bpy.ops.object.vertex_group_normalize_all(group_select_mode='ALL', lock_active=False)
    return body


def unwrap(body):
    me = body.data
    uv = me.uv_layers.new(name='bake')
    me.uv_layers.active = uv
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.0, area_weight=0.0, correct_aspect=True)
    bpy.ops.uv.pack_islands(margin=0.004, rotate=True)
    bpy.ops.object.mode_set(mode='OBJECT')


# ---------------------------------------------------------------- bake
def gpu(sc):
    sc.render.engine = 'CYCLES'
    try:
        p = bpy.context.preferences.addons['cycles'].preferences
        p.compute_device_type = 'METAL'
        p.get_devices()
        for d in p.devices:
            d.use = True
        sc.cycles.device = 'GPU'
    except Exception as e:
        log('GPU not used:', e)


def source(nt, sock, key, made):
    """The socket (or a constant) that feeds one property of the surface shader plugged into `sock`."""
    if not sock.is_linked:
        return None
    n = sock.links[0].from_node
    if n.type == 'BSDF_PRINCIPLED':
        i = n.inputs[key]
        if i.is_linked:
            return i.links[0].from_socket
        c = nt.nodes.new('ShaderNodeRGB'); made.append(c)
        v = i.default_value
        c.outputs[0].default_value = tuple(v) if hasattr(v, '__len__') else (v, v, v, 1)
        return c.outputs[0]
    if n.type == 'MIX_SHADER':
        a, b = source(nt, n.inputs[1], key, made), source(nt, n.inputs[2], key, made)
        if a is None or b is None:
            return a or b
        m = nt.nodes.new('ShaderNodeMixRGB'); made.append(m)
        if n.inputs[0].is_linked:
            nt.links.new(n.inputs[0].links[0].from_socket, m.inputs[0])
        else:
            m.inputs[0].default_value = n.inputs[0].default_value
        nt.links.new(a, m.inputs[1]); nt.links.new(b, m.inputs[2])
        return m.outputs[0]
    if n.type == 'ADD_SHADER':
        return source(nt, n.inputs[0], key, made) or source(nt, n.inputs[1], key, made)
    if n.type == 'BSDF_TRANSPARENT':
        return None                                          # see-through share of a mix: the game copy is solid
    if n.type == 'BSDF_GLASS' and key == 'Base Color' and not n.inputs['Color'].is_linked:
        # solid glass reads deeper than its surface tint: light passes through its thickness
        c = nt.nodes.new('ShaderNodeRGB'); made.append(c)
        v = n.inputs['Color'].default_value
        c.outputs[0].default_value = (v[0] ** 2, v[1] ** 2, v[2] ** 2, 1)
        return c.outputs[0]
    c = nt.nodes.new('ShaderNodeRGB'); made.append(c)
    if key == 'Base Color' and 'Color' in n.inputs:
        col = n.inputs['Color']
        if col.is_linked:
            nt.nodes.remove(c); made.pop()
            return col.links[0].from_socket
        c.outputs[0].default_value = tuple(col.default_value)
    else:
        v = {'Roughness': 0.1 if n.type in ('BSDF_GLASS', 'BSDF_GLOSSY') else 0.6, 'Metallic': 1.0 if n.type == 'BSDF_GLOSSY' else 0.0}.get(key, 0.5)
        c.outputs[0].default_value = (v, v, v, 1)
    return c.outputs[0]


def bake(body, scn):
    gpu(scn)
    scn.cycles.samples = 8
    scn.cycles.use_denoising = False
    bk = scn.render.bake
    bk.margin = 6; bk.use_selected_to_active = False; bk.target = 'IMAGE_TEXTURES'; bk.use_clear = True
    mats = [s.material for s in body.material_slots if s.material and s.material.node_tree]
    img = bpy.data.images.new('bake', ATLAS, ATLAS, alpha=False, float_buffer=True)
    img.colorspace_settings.name = 'Non-Color'
    targets = []
    for m in mats:
        t = m.node_tree.nodes.new('ShaderNodeTexImage'); t.image = img
        m.node_tree.nodes.active = t; t.select = True
        targets.append((m, t))
    activate(body)

    def grab():
        a = np.empty(ATLAS * ATLAS * 4, dtype=np.float32)
        img.pixels.foreach_get(a)
        return a.reshape(ATLAS, ATLAS, 4)[:, :, :3].copy()

    def emit(key):
        undo = []
        for m in mats:
            nt = m.node_tree
            out = nt.get_output_node('CYCLES')
            made = []
            src = source(nt, out.inputs['Surface'], key, made)
            was = out.inputs['Surface'].links[0].from_socket if out.inputs['Surface'].is_linked else None
            e = nt.nodes.new('ShaderNodeEmission'); made.append(e)
            if src is not None:
                nt.links.new(src, e.inputs['Color'])
            nt.links.new(e.outputs[0], out.inputs['Surface'])
            undo.append((nt, out, was, made))
        for m, t in targets:
            m.node_tree.nodes.active = t
        bpy.ops.object.bake(type='EMIT')
        res = grab()
        for nt, out, was, made in undo:
            if was:
                nt.links.new(was, out.inputs['Surface'])
            for n in made:
                nt.nodes.remove(n)
        return res

    maps = {}
    maps['colour'] = emit('Base Color'); log('baked colour')
    maps['rough'] = emit('Roughness'); maps['metal'] = emit('Metallic'); log('baked roughness and metal')
    bpy.ops.object.bake(type='EMIT'); maps['glow'] = grab()
    bpy.ops.object.bake(type='NORMAL'); maps['normal'] = grab(); log('baked relief')
    scn.cycles.samples = 48
    bpy.ops.object.bake(type='AO'); maps['ao'] = grab(); log('baked occlusion')
    for m, t in targets:
        m.node_tree.nodes.remove(t)
    bpy.data.images.remove(img)
    return maps


def picture(name, rgb, srgb, size=None):
    im = bpy.data.images.new(name, ATLAS, ATLAS, alpha=False)
    im.colorspace_settings.name = 'sRGB' if srgb else 'Non-Color'
    a = np.clip(rgb, 0, 1)
    if srgb:
        a = np.where(a <= 0.0031308, a * 12.92, 1.055 * np.power(a, 1 / 2.4) - 0.055)
    px = np.ones((ATLAS, ATLAS, 4), dtype=np.float32); px[:, :, :3] = a
    im.pixels.foreach_set(px.ravel())
    if size and size != ATLAS:
        im.scale(size, size)
    if WORK:
        im.filepath_raw = os.path.join(WORK, name + '.png'); im.file_format = 'PNG'; im.save()
    im.pack()
    return im


def finish(body, maps):
    me = body.data
    # contact shading goes a little way into the colour too: the game's ports are lit mostly by sky
    ao = maps['ao'][:, :, :1]
    colour = maps['colour'] * (0.78 + 0.22 * ao)
    orm = np.concatenate([ao, maps['rough'][:, :, :1], maps['metal'][:, :, :1]], axis=2)
    glow = maps['glow'] if float(maps['glow'].max()) > 0.05 else None
    m = bpy.data.materials.new(NAME + ' game')
    m.use_nodes = True
    nt = m.node_tree
    p = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')

    def tex(im):
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = im; return t
    nt.links.new(tex(picture(NAME + ' colour', colour, True)).outputs[0], p.inputs['Base Color'])
    o = tex(picture(NAME + ' orm', orm, False, ATLAS // 2))
    sep = nt.nodes.new('ShaderNodeSeparateColor')
    nt.links.new(o.outputs[0], sep.inputs[0])
    nt.links.new(sep.outputs[1], p.inputs['Roughness']); nt.links.new(sep.outputs[2], p.inputs['Metallic'])
    nm = nt.nodes.new('ShaderNodeNormalMap')
    nt.links.new(tex(picture(NAME + ' relief', maps['normal'], False, ATLAS // 2)).outputs[0], nm.inputs['Color'])
    nt.links.new(nm.outputs[0], p.inputs['Normal'])
    grp = bpy.data.node_groups.new('glTF Material Output', 'ShaderNodeTree')
    grp.interface.new_socket('Occlusion', in_out='INPUT', socket_type='NodeSocketFloat')
    g = nt.nodes.new('ShaderNodeGroup'); g.node_tree = grp
    nt.links.new(sep.outputs[0], g.inputs[0])
    if glow is not None:
        nt.links.new(tex(picture(NAME + ' glow', glow, True, ATLAS // 2)).outputs[0], p.inputs['Emission Color'])
        p.inputs['Emission Strength'].default_value = 1.0
    me.materials.clear()
    me.materials.append(m)
    for p_ in me.polygons:
        p_.material_index = 0
    # by name, one at a time: removing a layer moves the others, so held references go stale
    for n in [u.name for u in me.uv_layers if u.name != 'bake']:
        me.uv_layers.remove(me.uv_layers[n])
    groups = {g.name for g in body.vertex_groups}
    for n in [a.name for a in me.attributes if not a.is_internal and not a.is_required and a.name not in groups
              and a.name not in ('bake', 'sharp_face', 'sharp_edge') and a.data_type in ('FLOAT', 'FLOAT_VECTOR', 'FLOAT_COLOR', 'BYTE_COLOR')]:
        if n in me.attributes:
            me.attributes.remove(me.attributes[n])
    me.uv_layers.active = me.uv_layers['bake']
    me.uv_layers['bake'].active_render = True
    return glow is not None


# ---------------------------------------------------------------- actions
def humanoid_actions(rig):
    want = {'Walk cycle': 'Walk', 'Seat': 'Seat', 'Reach': 'Reach', 'Stride': 'Stride', 'Happy': 'Happy', 'Bored': 'Bored', 'Sad': 'Sad'}
    kept = []
    for a in list(bpy.data.actions):
        tag = a.name.split(' | ')[-1] if a.name.startswith(NAME + ' | ') else None
        if tag in want:
            a.name = want[tag]; kept.append(a)
        else:
            bpy.data.actions.remove(a)
    for a in kept:
        if a.name == 'Walk':
            # the game moves the character: take the walk's forward travel off the root so it steps in place
            for fc in [fc for fc in a.fcurves if fc.data_path == 'pose.bones["Root"].location']:
                a.fcurves.remove(fc)
            lo, hi = a.frame_range
            a.use_frame_range = True; a.frame_start = lo; a.frame_end = hi
    # the saved poses are forward-kinematic: Codex's notes say to set the four IK switches to 0 before applying one.
    # The walk keys its own switches; give every other action switches held at 0 so it is sampled as authored.
    for a in kept:
        have = {fc.data_path for fc in a.fcurves}
        for sw in ('IK_Arm_L', 'IK_Arm_R', 'IK_Leg_L', 'IK_Leg_R'):
            path = '["%s"]' % sw
            if path not in have and sw in rig:
                fc = a.fcurves.new(path)
                fc.keyframe_points.insert(a.frame_range[0], 0.0)
    seat = next((a for a in kept if a.name == 'Seat'), None)
    if seat and 'seat' in INFO:
        # the Seat pose sits where it stands (the stool in the motion study is elsewhere): keep the stool's height, take the hips' place
        rig.animation_data.action = seat
        bpy.context.scene.frame_set(int(seat.frame_range[0]))
        bpy.context.view_layer.update()
        h = rig.matrix_world @ rig.pose.bones['Pelvis'].head
        INFO['seat'] = [round(h.x, 3), INFO['seat'][1], round(-h.y, 3)]
    rig.animation_data.action = next(a for a in kept if a.name == 'Walk')
    return [a.name for a in kept]


def export(body, rig, robot):
    for o in list(bpy.context.scene.objects):
        if o is not body and o is not rig:
            bpy.data.objects.remove(o, do_unlink=True)
    rig.name = NAME + ' rig'
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    body.data.validate()
    bpy.ops.export_scene.gltf(
        filepath=OUT, export_format='GLB', export_yup=True, export_apply=False,
        export_animations=True, export_animation_mode='NLA_TRACKS' if robot else 'ACTIONS', export_force_sampling=True,
        export_def_bones=not robot, export_optimize_animation_size=True, export_anim_slide_to_zero=True,
        export_skins=True, export_morph=True, export_morph_normal=False, export_tangents=False,
        export_image_format='JPEG', export_jpeg_quality=86, export_materials='EXPORT', export_extras=False)
    log('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')


def main():
    robot = KIND == 'robot'
    scn, rig, parts = robot_parts() if robot else humanoid_parts()
    log(NAME, len(parts), 'parts,', sum(tris_of(o.data) for o in parts), 'triangles')
    tris = reduce(parts)
    body = join(parts, rig)
    unwrap(body)
    if WORK:
        os.makedirs(WORK, exist_ok=True)
    maps = bake(body, scn)
    glow = finish(body, maps)
    if robot:
        for t in rig.animation_data.nla_tracks:
            t.mute = False
        clips = [t.name for t in rig.animation_data.nla_tracks]
    else:
        clips = humanoid_actions(rig)
    if WORK:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(WORK, NAME + '-game.blend'), copy=True)
    bpy.context.view_layer.update()
    box = [body.matrix_world @ v.co for v in body.data.vertices]
    lo = [min(v[i] for v in box) for i in range(3)]; hi = [max(v[i] for v in box) for i in range(3)]
    export(body, rig, robot)
    info = {'id': os.path.basename(OUT)[:-4], 'name': NAME, 'kind': KIND, 'triangles': tris_of(body.data), 'kb': os.path.getsize(OUT) // 1024,
            'clips': clips, 'glow': glow, 'morphs': [k.name for k in body.data.shape_keys.key_blocks][1:] if body.data.shape_keys else [],
            # game axes: x right, y up, z forward (Blender x, z, -y)
            'min': [round(lo[0], 3), round(lo[2], 3), round(-hi[1], 3)], 'max': [round(hi[0], 3), round(hi[2], 3), round(-lo[1], 3)]}
    info.update(INFO)
    with open(OUT[:-4] + '.json', 'w') as f:
        json.dump(info, f, indent=1)
    log('done', json.dumps(info))


main()
