#!/usr/bin/env python3
"""Writes src/09-decksigns.js: a name sign over each side of every doorway on the four fleet decks,
worked out from the deck blueprints. Each sign names the room you are about to walk into.
Run from the repository root:  python3 tools/deck-signs.py"""
import json, math
G = json.load(open('docs/ship-interiors/fleet-blueprints/editable/Fleet-Deck-Geometry.json'))
OFF, H = 0.17, 0.3          # how far the sign hangs clear of the wall line, and its height
out = {}
for s in G['ships']:
    rows = []
    for d in s['decks']:
        rooms = {r['id']: r for r in d['rooms']}
        y = round(d['floor_y'] + d['clear_height'] - 0.22, 3)
        for door in d['doors']:
            a, b = door['rooms']
            if a not in rooms or b not in rooms: continue      # hatches to the outside and cargo shutters
            cx, cz = door['center']; w = round(min(1.45, max(0.95, door['clear_width'] + 0.2)), 2)
            for here, there in ((a, b), (b, a)):
                lx, lz = rooms[here]['label']                    # which side of the wall this room is on
                if door['span_axis'] == 'x':
                    sgn = 1 if lz > cz else -1; x, z, ry = cx, cz + sgn * OFF, (0 if sgn > 0 else math.pi)
                else:
                    sgn = 1 if lx > cx else -1; x, z, ry = cx + sgn * OFF, cz, sgn * math.pi / 2
                rows.append([rooms[there]['name'].upper().replace('’', "'"), round(x, 3), y, round(z, 3), round(ry, 4), w])
    out[s['id']] = rows
with open('src/09-decksigns.js', 'w') as f:
    f.write('/* Room name signs for the four fleet decks: [name, x, y, z, turn, width]. Written by tools/deck-signs.py from the deck blueprints. */\n')
    f.write('const DECK_SIGNS=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print({k: len(v) for k, v in out.items()})
