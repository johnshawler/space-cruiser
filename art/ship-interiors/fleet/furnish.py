"""Furniture, vessels, upholstery and machinery, fitted inside the blueprint footprints."""
import math
from .geometry import Model

def seat(m, w, d, side, ship):
    b = m.rounded
    b('frame', 0, 0.18, 0, w * 0.91, 0.28, d * 0.92)
    b('timber', 0, 0.34, 0, w, 0.1, d)
    b('inlay', 0, 0.387, 0, w * 0.98, 0.018, d * 0.98)
    count = max(1, round(d / 0.72))
    for j in range(count):
        z = d * ((j + 0.5) / count - 0.5)
        b('cloth', 0, 0.47, z, w * 0.95, 0.155, d / count * 0.96, 0.095)
        b('accent', side * w * 0.4, 0.72, z, w * 0.17, 0.47, d / count * 0.94, 0.065)
        if ship == 'dromedary':
            b('inlay', side * w * 0.29, 0.62, z, d * 0.035, 0.038, d / count * 0.6, 0.015)
            b('cloth', side * w * 0.29, 0.7, z, w * 0.17, 0.23, d / count * 0.55, 0.06)
    for sign in [-1, 1]:
        b('timber', 0, 0.58, sign * d * 0.47, w * 0.88, 0.12, d * 0.065, 0.03)

def vase(m, x, y, z, r, mat='ceramic'):
    m.lathe(mat, x, y, z, [(0, r * 0.56), (0.035, r * 0.55), (r * 0.6, r), (r * 1.2, r * 0.85), (r * 1.53, r * 0.42), (r * 1.78, r * 0.4), (r * 1.8, r * 0.54)], 18)
    m.lathe('trim', x, y + r * 0.79, z, [(0, r * 0.976), (0.014, r * 0.96)], 18)

def tea(m, x, y, z, ship):
    m.rounded('trim', x, y + 0.016, z, 0.36, 0.025, 0.25)
    if ship == 'dromedary':
        m.lathe('trim', x - 0.07, y + 0.027, z, [(0, 0.048), (0.02, 0.062), (0.09, 0.056), (0.128, 0.038), (0.15, 0.057), (0.164, 0.019)], 18)
        m.loop('trim', [(x - 0.115, y + 0.08, z), (x - 0.175, y + 0.055, z), (x - 0.19, y + 0.13, z), (x - 0.13, y + 0.14, z)], 0.009)
        m.loop('trim', [(x - 0.022, y + 0.068, z), (x + 0.013, y + 0.09, z), (x + 0.047, y + 0.14, z)], 0.011)
    else:
        vase(m, x - 0.07, y + 0.028, z, 0.048, 'accent')
    for off in [-0.055, 0.05]:
        m.lathe('ceramic', x + 0.09, y + 0.03, z + off, [(0, 0.02), (0.046, 0.032), (0.052, 0.033)], 14)

def furniture(m, f, ship):
    x, z = f['center']
    w, d = (f['width'], f['length'])
    kind = f['kind']
    side = -1 if x < 0 else 1
    m.section(kind + ' ' + f['room'] + ' ' + str(f['center']))
    m.offset = (x, 0, z)
    b = m.box
    roundbox = m.rounded
    if kind in ('divan', 'pilot'):
        seat(m, w, d, side, ship)
    elif kind == 'berth':
        roundbox('timber', 0, 0.25, 0, w, 0.36, d)
        roundbox('ceramic', 0, 0.5, 0, w * 0.97, 0.18, d * 0.97, 0.075)
        roundbox('cloth', 0, 0.61, d * 0.1, w * 0.99, 0.085, d * 0.67, 0.048)
        for i in range(5):
            b('inlay', 0, 0.655, d * (0.08 + i * 0.036), w * 0.95, 0.008, 0.017)
        roundbox('accent', 0, 0.639, -d * 0.31, w * 0.72, 0.11, d * 0.23, 0.09)
    elif kind in ('desk', 'counter', 'basin', 'cabinet', 'table'):
        top = 0.73 if kind in ('desk', 'table') else 0.86
        if kind in ('desk', 'table'):
            for a in [-1, 1]:
                for c in [-1, 1]:
                    b('trim', a * w * 0.37, top * 0.48, c * d * 0.35, 0.045, top * 0.94, 0.045)
        else:
            roundbox('timber', 0, top * 0.49, 0, w * 0.92, top * 0.92, d * 0.92, 0.045)
            for t in [-0.26, 0, 0.26]:
                b('inlay', -side * w * 0.466, top * 0.52, d * t, 0.015, top * 0.63, 0.018)
        roundbox('ceramic' if kind == 'basin' else 'timber', 0, top, 0, w, 0.065, d, 0.07)
        roundbox('trim', 0, top - 0.044, 0, w * 0.99, 0.018, d * 0.99, 0.045)
        if kind == 'basin':
            m.lathe('ceramic', 0, top + 0.03, 0, [(0, 0.105), (0.065, 0.17), (0.086, 0.172)], 24)
            m.loop('steel', [(0, top + 0.04, 0.18), (0, top + 0.26, 0.18), (0, top + 0.26, 0.055)], 0.015)
        elif kind == 'cabinet':
            for j in range(7):
                vase(m, 0, top + 0.036, d * ((j + 0.5) / 7 - 0.5), 0.065, 'ceramic' if j % 2 else 'accent')
        elif ship in ('dromedary', 'empress') or kind == 'table':
            tea(m, 0, top + 0.039, 0, ship)
        elif ship == 'stoat':
            for j in range(3):
                b(['cloth', 'accent', 'inlay'][j], 0, top + 0.056 + j * 0.031, 0, 0.24, 0.029, 0.18)
        else:
            vase(m, 0, top + 0.04, 0, 0.079)
    elif kind == 'rack':
        for a in [-1, 1]:
            for c in [-1, 1]:
                b('trim', a * w * 0.46, 0.88, c * d * 0.47, 0.045, 1.73, 0.06)
        for y in [0.17, 0.81, 1.54]:
            b('steel', 0, y, 0, w, 0.052, d)
            if y < 1:
                n = max(1, int(d / 0.72))
                for j in range(n):
                    zz = d * ((j + 0.5) / n - 0.5)
                    roundbox('utility', 0, y + 0.245, zz, w * 0.75, 0.41, min(0.66, d / n * 0.8), 0.032)
                    for a in [-1, 1]:
                        b('inlay', 0, y + 0.45, zz + a * min(0.18, d / n * 0.2), w * 0.77, 0.012, 0.028)
    elif kind == 'garden':
        roundbox('frame', 0, 0.12, 0, w, 0.22, d)
        roundbox('inlay', 0, 0.24, 0, w * 0.92, 0.024, d * 0.96)
        for j in range(4):
            zz = d * ((j + 0.5) / 4 - 0.5)
            m.lathe('utility', 0, 0.25, zz, [(0, 0.071), (0.095, 0.12), (0.17, 0.08), (0.19, 0.045)], 9)
            m.rod('timber', (0.03, 0.31, zz), (-0.07, 0.88, zz + 0.06), 0.016)
            for k in range(4):
                t = k * 0.117
                m.rod('cloth', (-0.02, 0.49 + t, zz + 0.03), (-0.19 if k % 2 else 0.15, 0.62 + t, zz + 0.07), 0.027, 6)
    else:
        rad = min(w, d) * 0.4
        roundbox('frame', 0, 0.1, 0, w, 0.16, d)
        if kind == 'filter':
            roundbox('utility', 0, 0.69, 0, w * 0.94, 1.04, d * 0.89)
            for j in range(8):
                b('steel', -side * w * 0.48, 0.3 + j * 0.094, 0, 0.027, 0.037, d * 0.72)
        else:
            m.lathe('steel', 0, 0.17, 0, [(0, rad * 0.9), (0.12, rad), (0.25, rad * 0.77), (0.92, rad * 0.77), (1.02, rad), (1.14, rad * 0.83)], 24)
            for h in [0.32, 0.5, 0.68, 0.86, 1.04]:
                m.lathe('trim', 0, h, 0, [(0, rad * 0.81), (0.035, rad * 0.87), (0.053, rad * 0.86)], 24)
            for j in range(8):
                a = j * math.tau / 8
                m.rod('utility', (rad * 0.85 * math.cos(a), 0.24, rad * 0.85 * math.sin(a)), (rad * 0.85 * math.cos(a), 1.25, rad * 0.85 * math.sin(a)), 0.022)
    m.offset = (0, 0, 0)
