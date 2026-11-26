"""Fit the signed-off fleet drawings. All dimensions and door spans are taken from the editable plans."""
import math
import numpy as np
from .geometry import Model
from .furnish import furniture, seat

def spans(room, deck, p, q):
    x, z = p
    dx, dz = (q[0] - x, q[1] - z)
    length = math.hypot(dx, dz)
    ux, uz = (dx / length, dz / length)
    holes = []
    for door in deck['doors']:
        if room['id'] not in door['rooms']:
            continue
        a, b = door['center']
        u = (a - x) * ux + (b - z) * uz
        if abs((a - x) * uz - (b - z) * ux) > 0.015 or not 0 < u < length:
            continue
        holes.append((u - door['clear_width'] / 2, u + door['clear_width'] / 2, door))
    return (length, ux, uz, sorted(holes, key=lambda h: h[0]))

def motif(m, ship, w, h, technical):
    b = m.box
    if technical:
        b('steel', 0, h * 0.53, 0.093, w * 0.87, h * 0.68, 0.045)
        for i in range(3):
            b('frame', 0, h * 0.38 + i * 0.058, 0.125, w * 0.54, 0.022, 0.02)
        for sign in [-1, 1]:
            b('trim', sign * w * 0.37, h * 0.7, 0.124, 0.025, 0.088, 0.018)
    elif ship == 'dromedary':
        # A pointed mashrabiya niche with a diamond grille.
        a = min(0.59, w * 0.39)
        y = h * 0.7
        m.face([(-a, 0.55, 0.11), (a, 0.55, 0.11), (a, y, 0.11), (a * 0.64, y + 0.16, 0.11), (0, y + 0.35, 0.11), (-a * 0.64, y + 0.16, 0.11), (-a, y, 0.11)], 'timber')
        pts = [(-a, 0.55, 0.128), (-a, y, 0.128), (-a * 0.64, y + 0.16, 0.128), (0, y + 0.35, 0.128), (a * 0.64, y + 0.16, 0.128), (a, y, 0.128), (a, 0.55, 0.128)]
        m.loop('trim', pts, 0.023)
        for row in range(3):
            for col in range(3):
                cx = (col - 1) * a * 0.51
                cy = 0.77 + row * 0.22
                rx = a * 0.215
                m.loop('inlay', [(cx - rx, cy, 0.135), (cx, cy + 0.094, 0.135), (cx + rx, cy, 0.135), (cx, cy - 0.094, 0.135), (cx - rx, cy, 0.135)], 0.009)
    elif ship == 'stoat':
        m.rounded('timber', 0, 0.49, 0.11, w * 0.88, 0.11, 0.19)
        b('cloth', 0, 0.85, 0.089, w * 0.83, 0.53, 0.051)
        b('timber', 0, 1.58, 0.085, w * 0.9, 0.58, 0.065)
        for k in range(2):
            y = 1.32 + k * 0.265
            b('inlay', 0, y, 0.145, w * 0.86, 0.032, 0.16)
            for j in range(7):
                x = w * ((j - 3) / 9)
                bh = 0.13 + 0.076 * ((j * 3 + k) % 5) / 4
                b(['cloth', 'accent', 'timber', 'inlay'][(j + k) % 4], x, y + bh / 2 + 0.018, 0.145, w * 0.084, bh, 0.09)
                b('trim', x, y + bh * 0.36, 0.192, w * 0.072, 0.008, 0.007)
    elif ship == 'manatee':
        a = min(w * 0.34, 0.56)
        cy = h * 0.42
        for i in range(13):
            t = math.radians(20 + 140 * i / 12)
            r = a * (1 - 0.13 * (i % 2))
            m.rod('trim', (0, cy, 0.113), (r * math.cos(t), cy + r * math.sin(t), 0.113), 0.012, 6)
        for j in range(3):
            b('inlay', 0, cy - 0.055 * j, 0.119, w * (0.44 - 0.083 * j), 0.027, 0.025)
        for side in [-1, 1]:
            for j in range(2):
                b('trim', side * (w * 0.42 - j * 0.055), h * 0.49, 0.115, 0.018, h * (0.72 - 0.1 * j), 0.022)
    else:
        b('ceramic', 0, h * 0.57, 0.1, w * 0.82, h * 0.65, 0.028)
        for i in range(5):
            b('timber', (i - 2) * w * 0.2, h * 0.57, 0.133, 0.026, h * 0.68, 0.034)
        for i in range(4):
            b('timber', 0, h * (0.25 + i * 0.213), 0.136, w * 0.84, 0.024, 0.036)
        b('accent', 0, h * 0.19, 0.1, w * 0.89, 0.1, 0.032)

def edge(m, r, d, p, q, ship, idx):
    h = d['clear_height']
    L, ux, uz, holes = spans(r, d, p, q)
    m.offset = (p[0], 0, p[1])
    m.heading = -math.atan2(uz, ux)
    tech = r['use'] in ('freight', 'engineering') or r['name'] in ('Airlock', 'Pressure lock', 'Air plant', 'Baggage lock', 'Filter workshop')
    window = {0: 'windshield', 1: 'canopy_right', len(r['polygon']) - 1: 'canopy_left'}.get(idx) if r['use'] == 'flight' else None
    m.section('bulkhead ' + str(idx))
    b = m.box

    def run(a, c):
        if c - a < 0.008:
            return
        mid = (a + c) / 2
        w = c - a
        skin = 'steel' if tech else 'plaster'
        if window:
            sill = 0.85
            top = h - 0.18
            b('frame', mid, sill / 2, 0.04, w, sill, 0.08)
            b('frame', mid, h - 0.09, 0.04, w, 0.18, 0.08)
            for s in [a + 0.07, c - 0.07]:
                b('trim', s, (top + sill) / 2, 0.044, 0.076, top - sill, 0.1)
            m.section(window)
            m.face([(a, sill, 0.014), (c, sill, 0.014), (c, top, 0.014), (a, top, 0.014)], 'glass')
            m.section('bulkhead ' + str(idx))
            return
        b(skin, mid, h / 2, 0.038, w, h, 0.073)
        b('frame', mid, 0.071, 0.083, w, 0.14, 0.067)
        b('timber' if not tech else 'utility', mid, 0.44, 0.082, w, 0.51, 0.053)
        b('trim', mid, 0.71, 0.1, w, 0.039, 0.063)
        b('inlay', mid, h - 0.17, 0.086, w, 0.047, 0.059)
        n = max(1, int(w / 1.65))
        step = w / n
        for k in range(n):
            u = a + (k + 0.5) * step
            b('frame' if tech else 'timber', a + (k + 0.055) * step, h * 0.5, 0.092, 0.042, h - 0.12, 0.053)
            if step > 0.95 and (k % 2 == 0 or r['use'] == 'living'):
                m.offset = (p[0] + ux * u, 0, p[1] + uz * u)
                motif(m, ship, step * 0.91, h, tech)
                m.offset = (p[0], 0, p[1])
    start = 0.0
    for a, c, door in holes:
        run(start, a)
        dh = min(2.04, h - 0.075)
        b('frame', (a + c) / 2, (dh + h) / 2, 0.042, c - a, h - dh, 0.08)
        for x in [a - 0.022, c + 0.022]:
            b('trim', x, dh / 2, 0.08, 0.046, dh, 0.1)
        b('trim', (a + c) / 2, dh + 0.018, 0.083, c - a + 0.1, 0.048, 0.1)
        if 'OUT' in door['rooms'] or 'TRUNK' in door['rooms']:
            b('utility', (a + c) / 2, dh / 2, 0.02, c - a, dh, 0.064)
            b('inlay', (a + c) / 2, dh * 0.65, 0.064, c - a - 0.08, 0.028, 0.027)
        start = c
    run(start, L)
    m.heading = 0.0
    m.offset = (0, 0, 0)

def ceiling_lamp(m, ship, cx, cz, h, technical):
    m.section('overhead lighting')
    if technical or ship == 'stoat':
        m.rounded('frame', cx, h - 0.072, cz, 0.76, 0.1, 0.37)
        m.rounded('lamp', cx, h - 0.132, cz, 0.65, 0.045, 0.25)
    elif ship == 'dromedary':
        m.lathe('trim', cx, h - 0.37, cz, [(0, 0.041), (0.075, 0.136), (0.255, 0.13), (0.31, 0.065), (0.37, 0.045)], 8)
        m.lathe('lamp', cx, h - 0.35, cz, [(0, 0.047), (0.064, 0.137), (0.213, 0.137), (0.25, 0.09)], 8)
        for j in range(8):
            a = j * math.tau / 8
            u = 0.137 * math.cos(a)
            v = 0.137 * math.sin(a)
            m.rod('trim', (cx + u, h - 0.295, cz + v), (cx + u, h - 0.116, cz + v), 0.009, 5)
    elif ship == 'manatee':
        for j in range(4):
            m.lathe('trim' if j % 2 == 0 else 'lamp', cx, h - 0.24 + 0.06 * j, cz, [(0, 0.19 + j * 0.045), (0.056, 0.195 + j * 0.045)], 24)
    else:
        m.rounded('lamp', cx, h - 0.155, cz, 0.34, 0.24, 0.34, 0.022)
        for dx in [-0.165, 0.165]:
            for dz in [-0.165, 0.165]:
                m.box('timber', cx + dx, h - 0.155, cz + dz, 0.018, 0.25, 0.018)
        for yy in [-0.285, -0.035]:
            m.box('frame', cx, h + yy, cz, 0.37, 0.028, 0.37)
    m.lights.append([m.room, cx, m.level + h - 0.34, cz])

def rug(m, ship, cx, cz, w, d):
    m.section('floor inlay')
    top = 0.011
    m.box('cloth', cx, top, cz, w, 0.014, d)
    for s in [-1, 1]:
        for i in [0, 1]:
            m.box('inlay', cx + s * (w * 0.5 - 0.045 - 0.038 * i), top + 0.009, cz, 0.015, 0.004, d - 0.08)
            m.box('inlay', cx, top + 0.009, cz + s * (d * 0.5 - 0.045 - 0.038 * i), w - 0.08, 0.004, 0.015)
    if ship == 'dromedary':
        for j in range(5):
            z = cz + (j - 2) * d * 0.145
            for i in [-1, 0, 1]:
                x = cx + i * w * 0.26
                rx = w * 0.085
                rz = d * 0.06
                m.face([(x - rx, 0.023, z), (x, 0.023, z + rz), (x + rx, 0.023, z), (x, 0.023, z - rz)], 'accent' if i else 'inlay')
    elif ship == 'manatee':
        for i in range(12):
            a = i * math.tau / 12
            b = (i + 1) * math.tau / 12
            m.face([(cx, 0.024, cz), (cx + math.cos(a) * w * 0.32, 0.024, cz + math.sin(a) * d * 0.32), (cx + math.cos(b) * w * 0.2, 0.024, cz + math.sin(b) * d * 0.2)], 'inlay')
    elif ship == 'empress':
        for j in [-1, 0, 1]:
            m.box('inlay', cx, top + 0.01, cz + j * d / 4, w - 0.1, 0.007, 0.023)

def bridge(m, ship, x, z):
    m.section('helm furniture')
    b = m.rounded
    b('timber', x, 0.47, z - 0.66, 1.54, 0.72, 0.37, 0.06)
    b('frame', x, 0.85, z - 0.66, 1.7, 0.11, 0.53, 0.07)
    for side in [-1, 1]:
        b('trim', x + side * 0.53, 0.93, z - 0.69, 0.13, 0.13, 0.13, 0.025)
        b('timber', x + side * 0.7, 0.61, z - 0.24, 0.22, 0.49, 0.69, 0.055)
        b('cloth', x + side * 0.7, 0.88, z - 0.26, 0.22, 0.055, 0.63, 0.045)
    m.section('instrument supports')
    for x0, y, z0, w, h, d in [(0, 1.05, -0.69, 0.24, 0.41, 0.13), (-0.407, 1.02, -0.66, 0.11, 0.4, 0.09), (0.407, 1.02, -0.66, 0.11, 0.4, 0.09), (0, 1.3, -0.98, 0.1, 0.46, 0.075), (0, 0.96, -0.45, 0.15, 0.32, 0.27)]:
        b('frame', x + x0, y, z + z0, w, h, d, 0.024)

def station(m, kind, x, z, yaw, ship):
    """Geometry for each state is independent of the wall and can be toggled in game."""
    m.offset = (x, 0.87, z)
    m.heading = yaw
    for state in ('working', 'broken', 'repaired'):
        m.section('state_' + kind + '_' + state)
        b = m.box
        bad = state == 'broken'
        fix = state == 'repaired'
        b('frame', 0, 0, 0, 0.55, 0.42, 0.115)
        b('steel', 0, 0, 0.065, 0.49, 0.35, 0.032)
        if kind == 'scrubber':
            for j in range(8 if not bad else 5):
                a = j * math.tau / 8
                m.rod('utility', (0.024 * math.cos(a), 0.024 * math.sin(a), 0.105), (0.146 * math.cos(a + 0.41), 0.146 * math.sin(a + 0.41), 0.11), 0.029, 6)
            if fix:
                for i in range(5):
                    b('trim', (i - 2) * 0.068, 0, 0.14, 0.013, 0.27, 0.01)
        elif kind in ('coolant', 'thruster'):
            for a, c in [(-0.255, -0.035 if bad else 0.0), (0.065 if bad else 0.0, 0.255)]:
                m.rod('utility', (a, 0.015, 0.13), (c, -0.046 if bad and a > 0 else 0.015, 0.14), 0.057)
            for xx in [-0.17, 0.15, 0] if fix else [-0.17, 0.15]:
                m.rod('trim', (xx - 0.015, 0.015, 0.134), (xx + 0.015, 0.015, 0.134), 0.077)
        elif kind == 'fuse':
            for i in range(3):
                x0 = (i - 1) * 0.12
                for h in [-0.095, 0.095]:
                    b('trim', x0, h, 0.119, 0.065, 0.037, 0.06)
                if i != 1 or not bad:
                    m.rod('accent' if i == 1 and fix else 'ceramic', (x0, -0.078, 0.12), (x0, 0.08, 0.12), 0.028)
        elif kind in ('strap', 'seal'):
            m.loop('accent' if bad else 'cloth', [(-0.2, -0.13, 0.104), (-0.21, 0.12, 0.104), (0.19, 0.12, 0.104), (0.19, -0.13, 0.104), (0.05 if bad else -0.2, -0.13, 0.104)], 0.023)
            if fix:
                for i in [-1, 1]:
                    b('trim', i * 0.15, 0.1, 0.137, 0.044, 0.075, 0.025)
        else:
            m.loop('frame', [(-0.16, -0.11, 0.095), (-0.06, 0.035, 0.1), (0.012, -0.019, 0.1), (0.14, 0.12, 0.1)], 0.016 if bad else 0.007)
            if not bad:
                b('timber' if fix else 'steel', 0, 0, 0.118, 0.39 if fix else 0.32, 0.22, 0.03)
        for i in [-1, 1]:
            for j in [-1, 1]:
                b('trim', i * 0.214, j * 0.143, 0.113, 0.029, 0.029, 0.017)
        b('accent' if bad else 'lamp', 0.19, 0.105, 0.139, 0.039, 0.02, 0.01)
    m.heading = 0
    m.offset = (0, 0, 0)

def boundary(room, x, z):
    """Find the wall a fitting is backed onto, including angled outer walls."""
    poly = room['polygon']
    result = None
    for a, b in zip(poly, poly[1:] + poly[:1]):
        dx, dz = (b[0] - a[0], b[1] - a[1])
        length = math.hypot(dx, dz)
        t = max(0, min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / length ** 2))
        distance = math.hypot(x - a[0] - t * dx, z - a[1] - t * dz)
        candidate = (distance, math.atan2(-dz, dx))
        if result is None or candidate[0] < result[0]:
            result = candidate
    return result[1]

def design(s):
    m = Model()
    ship = s['id']
    for level, d in enumerate(s['decks']):
        h = d['clear_height']
        m.level = d['floor_y']
        for r in d['rooms']:
            m.room = r['id']
            poly = r['polygon']
            # All room outlines use the same model-facing winding.
            if sum((p[0] * q[1] - q[0] * p[1] for p, q in zip(poly, poly[1:] + poly[:1]))) < 0:
                poly = poly[::-1]
            m.section('deck')
            m.face([(x, 0, z) for x, z in reversed(poly)], 'deck')
            m.section('headliner')
            m.face([(x, h, z) for x, z in poly], 'plaster')
            for j, (p, q) in enumerate(zip(poly, poly[1:] + poly[:1])):
                edge(m, r, d, p, q, ship, j)
            # Place the carpet well inside the room, including narrow passages and concave rooms.
            x, z = r['label']
            if r['use'] == 'living':
                radius = min((math.dist((x, z), closest((x, z), p, q)) for p, q in zip(poly, poly[1:] + poly[:1])))
                if radius > 0.53:
                    rug(m, ship, x, z, radius * 1.06, radius * 1.37)
            ceiling_lamp(m, ship, x, z, h, r['use'] in ('freight', 'engineering'))
            m.anchor('lamp_' + r['id'], x, m.level + h - 0.3, z)
            fittings = [f for f in d['fixtures'] if f['room'] == r['id']]
            for f in fittings:
                furniture(m, f, ship)
                if f['kind'] == 'pilot':
                    bridge(m, ship, *f['center'])
            for a in (a for a in d['anchors'] if a['room'] == r['id']):
                x, z = a['position']
                k = a['kind']
                yaw = boundary(r, x, z)
                if k.startswith('seat_'):
                    m.anchor(k.replace('seat', 'passenger'), x, m.level, z, yaw)
                    if not any((f['kind'] == 'divan' for f in fittings)):
                        m.section(k)
                        m.heading = yaw + math.pi / 2
                        m.offset = (x, 0, z)
                        seat(m, 0.62, 0.72, 1, ship)
                        m.heading = 0
                        m.offset = (0, 0, 0)
                else:
                    m.anchor('fault_' + k, x, m.level + 0.87, z, yaw)
                    station(m, k, x, z, yaw, ship)
            for lift in s['lifts']:
                if r['id'] not in lift['rooms']:
                    continue
                x, z = lift['position']
                w, dz = lift['size']
                m.section('lift ' + lift['id'])
                m.rounded('steel', x, 0.023, z, w, 0.044, dz)
                for side in [-1, 1]:
                    m.box('lamp', x + side * (w / 2 - 0.045), 0.048, z, 0.026, 0.009, dz - 0.11)
                    m.box('trim', x, 0.049, z + side * (dz / 2 - 0.052), w - 0.12, 0.01, 0.034)
    d = s['decks'][0]
    x, z = next((door['center'] for door in d['doors'] if '01' in door['rooms'] and '02' in door['rooms']))
    m.anchor('cockpit_door', x, d['floor_y'] + 0.91, z)
    return m

def closest(point, a, b):
    ab = np.subtract(b, a)
    t = np.clip(np.dot(np.subtract(point, a), ab) / np.dot(ab, ab), 0, 1)
    return a + ab * t

def cockpit(s, deck):
    pilot = next((f for f in s['decks'][0]['fixtures'] if f['kind'] == 'pilot'))['center']
    eye = np.array([pilot[0], s['decks'][0]['floor_y'] + 1.31, pilot[1]])
    m = Model()
    m.objects = {}
    for (room, part), (v, f, mat) in deck.objects.items():
        if room == '01':
            m.objects[room, part] = [(np.array(v) - eye).tolist(), f, mat]
    m.room = '01'
    m.section('door')
    door = next((d for d in s['decks'][0]['doors'] if set(d['rooms']) == {'01', '02'}))
    x, z = door['center']
    z -= eye[2]
    m.box('timber', x, -0.32, z, door['clear_width'], 1.98, 0.048)
    for dx in [-0.38, 0.38]:
        m.box('trim', x + dx * door['clear_width'], -0.32, z - 0.03, 0.018, 1.86, 0.018)
    # Sockets are in camera-local metres. All six screens are drawn and operated by the flight UI.
    for k, p, rx, ry, scale in [('main', (0, -0.097, -0.652), -0.05, 0, 0.8), ('left', (-0.407, -0.12, -0.607), -0.19, 0.21, 0.76), ('right', (0.407, -0.12, -0.607), -0.19, -0.21, 0.76), ('radio', (0, 0.18, -0.94), 0.095, 0, 1), ('pedestal', (-0.07, -0.262, -0.44), -1.51, 0, 0.75), ('overhead', (0, 0.565, -0.33), 0.927, 0, 1)]:
        m.anchor('panel_' + k, *p, ry, scale, rx)
    front = s['decks'][0]['rooms'][0]['polygon'][0][1] - eye[2]
    for k, p in {'stick': (0.65, -0.42, -0.26), 'mug': (-0.7, -0.39, -0.26), 'mascot': (0.63, -0.37, -0.68), 'clipboard': (-0.69, -0.38, -0.27), 'wiper_left': (-0.45, -0.4, front + 0.035), 'wiper_right': (0.14, -0.4, front + 0.035), 'lamp_port': (-0.55, 0.62, 0.09), 'lamp_starboard': (0.55, 0.62, 0.09), 'glow': (0, -0.33, -0.68)}.items():
        m.anchor(k, *p)
    m.eye = eye.tolist()
    m.door = [x, -0.32, z]
    return m
