"""Rasterize the signed-off room outlines, open doors and furniture footprints in hull metres."""
import base64
import numpy as np
from .design import spans

def polygon(poly, x, z):
    inside = np.zeros(np.broadcast_shapes(x.shape, z.shape), dtype=bool)
    for (a, b), (c, d) in zip(poly, poly[1:] + poly[:1]):
        if b != d:
            inside ^= ((b > z) != (d > z)) & (x < (c - a) * (z - b) / (d - b) + a)
    return inside

def clearance(x, z, p, q):
    dx, dz = (q[0] - p[0], q[1] - p[1])
    t = np.clip(((x - p[0]) * dx + (z - p[1]) * dz) / (dx * dx + dz * dz), 0, 1)
    return np.hypot(x - p[0] - t * dx, z - p[1] - t * dz)

def grid(deck):
    points = np.concatenate([r['polygon'] for r in deck['rooms']])
    cell = 0.1
    x0, z0 = np.floor(points.min(0) - 0.2)
    x1, z1 = np.ceil(points.max(0) + 0.2)
    x = x0 + (np.arange(round((x1 - x0) / cell)) + 0.5) * cell
    z = z0 + (np.arange(round((z1 - z0) / cell)) + 0.5) * cell
    x, z = np.meshgrid(x, z)
    walk = np.zeros(x.shape, bool)
    walls = walk.copy()
    for r in deck['rooms']:
        poly = r['polygon']
        walk |= polygon(poly, x, z)
        for p, q in zip(poly, poly[1:] + poly[:1]):
            length, ux, uz, doors = spans(r, deck, p, q)
            start = 0
            for a, b, d in doors + [(length, length, None)]:
                if d and ('OUT' in d['rooms'] or 'TRUNK' in d['rooms']):
                    continue
                if a - start > 0.002:
                    walls |= clearance(x, z, [p[0] + ux * start, p[1] + uz * start], [p[0] + ux * a, p[1] + uz * a]) < 0.25
                start = b
    walk &= ~walls

    def rect(cx, cz, w, d, margin=0.15):
        return (abs(x - cx) < w / 2 + margin) & (abs(z - cz) < d / 2 + margin)
    for f in deck['fixtures']:
        cx, cz = f['center']
        walk &= ~rect(cx, cz, f['width'], f['length'])
        if f['kind'] == 'pilot':
            walk &= ~rect(cx, cz - 0.67, 1.7, 0.54)
    for a in deck['anchors']:
        if a['kind'].startswith('seat_'):
            walk &= ~rect(*a['position'], 0.63, 0.67)
    # Loose freight occupies stationary rack shelves. Small parcels sit on the empty top shelf.
    crates = []
    for f in deck['fixtures']:
        if f['kind'] != 'rack' or f['width'] < 0.62:
            continue
        cx, cz = f['center']
        n = max(1, int(f['length'] / 0.94))
        for i in range(n):
            crates.append([cx, round(cz + f['length'] * ((i + 0.5) / n - 0.5), 3), deck['floor_y'] + 1.568, round(min(0.9, f['width'] / 0.82 * 0.8), 3)])
    if not crates:
        for f in deck['fixtures']:
            if f['kind'] == 'rack':
                crates.append([*f['center'], deck['floor_y'] + 1.568, round(min(0.9, f['width'] / 0.82 * 0.8), 3)])
    nz, nx = walk.shape
    return (dict(x0=float(x0), z0=float(z0), cell=cell, nx=nx, nz=nz, bits=base64.b64encode(np.packbits(walk).tobytes()).decode()), crates)

def layout(ship):
    levels = []
    crates = []
    spots = {}
    for i, d in enumerate(ship['decks']):
        nav, slots = grid(d)
        crates += slots
        levels.append(dict(name=d['name'], floor=d['floor_y'], walk=nav))
        rooms = {r['id']: r['name'] for r in d['rooms']}
        for a in d['anchors']:
            spots[a['kind']] = dict(level=i, room=rooms[a['room']])
    x, z = next((d['center'] for d in ship['decks'][0]['doors'] if set(d['rooms']) == {'01', '02'}))
    pilot = next((f['center'] for f in ship['decks'][0]['fixtures'] if f['kind'] == 'pilot'))
    return dict(layout=dict(levels=levels, spots=spots, lifts=ship['lifts'], door=[x, z], spawn=[x, z + 0.44], eye=[pilot[0], levels[0]['floor'] + 1.31, pilot[1]]), crates=crates)
