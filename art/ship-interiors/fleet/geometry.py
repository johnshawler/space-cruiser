"""Editable groups of fittings in game metres. Blender conversion is (x,-z,y)."""
import math
from collections import defaultdict
import numpy as np
PALETTES = {'dromedary': ('Cedar and copper', ['d4b58e', '654b3a', '8f563c', 'bd7a47', '254966', '994b37', 'e1c18d', '46352e', 'e0a44e', 'ebe0c0', '69878b', '44565a']), 'stoat': ('Captain’s wardroom', ['c6ab92', '635965', '945a41', 'b4936c', '834856', '5d7282', 'b49070', '464450', 'edba76', 'e8ddc9', '919bb1', '505867']), 'manatee': ('Streamline Moderne', ['ead7ad', '363d44', '77513d', 'd4aa60', '275c61', '99495b', 'cbb180', '202831', 'f5d79c', 'eee5cf', '83afb2', '646873']), 'empress': ('Lacquer and hinoki', ['dfcda5', '30272d', 'a4754d', 'b99348', '525e4a', '944a39', 'bdab7b', '25252a', 'efd39a', 'efe1bd', '76877f', '565550'])}
SURFACES = ['plaster', 'deck', 'timber', 'trim', 'cloth', 'accent', 'inlay', 'frame', 'lamp', 'ceramic', 'utility', 'steel']

class Model:

    def __init__(self):
        self.objects = {}
        self.room = ''
        self.section('structure')
        self.offset = (0, 0, 0)
        self.heading = 0.0
        self.level = 0.0
        self.lights = []
        self.anchors = {}

    def section(self, name):
        self.part = name
        self.objects.setdefault((self.room, name), [[], [], []])

    def face(self, points, material):
        verts, faces, mats = self.objects[self.room, self.part]
        i = len(verts)
        c, s = (math.cos(self.heading), math.sin(self.heading))
        ox, oy, oz = self.offset
        verts.extend(((ox + c * x + s * z, oy + self.level + y, oz - s * x + c * z) for x, y, z in points))
        faces.append(tuple(range(i, i + len(points))))
        mats.append(material)

    def box(self, m, x, y, z, w, h, d):
        a, b, c = (w / 2, h / 2, d / 2)
        v = [(x + i * a, y + j * b, z + k * c) for i, j, k in [(-1, -1, -1), (1, -1, -1), (1, 1, -1), (-1, 1, -1), (-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)]]
        for f in [(3, 2, 1, 0), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]:
            self.face([v[i] for i in f], m)

    def rounded(self, m, x, y, z, w, h, d, r=0.05):
        """Horizontal rings with eased edges and radiused corners, for cushions, cases and joinery."""
        r = min(r, w * 0.42, d * 0.42)
        lip = min(r * 0.32, h * 0.17)
        rings = []
        for yy, inset in [(y - h / 2, lip), (y - h / 2 + lip, 0), (y + h / 2 - lip, 0), (y + h / 2, lip)]:
            ring = []
            for vx, vz, a in [(1, 1, 0), (-1, 1, 90), (-1, -1, 180), (1, -1, 270)]:
                for t in [0, 30, 60, 90]:
                    ang = math.radians(a + t)
                    ring.append((x + vx * (w / 2 - r) + (r - inset) * math.cos(ang), yy, z + vz * (d / 2 - r) + (r - inset) * math.sin(ang)))
            rings.append(ring)
        self.face(rings[0], m)
        self.face(rings[-1][::-1], m)
        for a, b in zip(rings, rings[1:]):
            for i in range(len(a)):
                j = (i + 1) % len(a)
                self.face([a[j], a[i], b[i], b[j]], m)

    def lathe(self, m, x, y, z, profile, n=16, ratio=1):
        rings = [[(x + r * math.cos(i * math.tau / n), y + h, z + ratio * r * math.sin(i * math.tau / n)) for i in range(n)] for h, r in profile]
        self.face(rings[0], m)
        self.face(rings[-1][::-1], m)
        for a, b in zip(rings, rings[1:]):
            for i in range(n):
                j = (i + 1) % n
                self.face([a[j], a[i], b[i], b[j]], m)

    def rod(self, m, a, b, r, n=8):
        a, b = (np.array(a, dtype=float), np.array(b, dtype=float))
        axis = b - a
        axis /= np.linalg.norm(axis)
        side = np.cross(axis, [0.0, 1.0, 0.0] if abs(axis[1]) < 0.9 else [1.0, 0.0, 0.0])
        side /= np.linalg.norm(side)
        other = np.cross(axis, side)
        offsets = [r * (side * math.cos(i * math.tau / n) + other * math.sin(i * math.tau / n)) for i in range(n)]
        u = [a + p for p in offsets]
        v = [b + p for p in offsets]
        self.face(u[::-1], m)
        self.face(v, m)
        for i in range(n):
            j = (i + 1) % n
            self.face([u[i], u[j], v[j], v[i]], m)

    def loop(self, m, points, r):
        for a, b in zip(points, points[1:]):
            self.rod(m, a, b, r, 6)

    def anchor(self, name, x, y, z, yaw=0, scale=1, tilt=0):
        self.anchors[name] = dict(position=[x, y, z], yaw=yaw, scale=scale, tilt=tilt)
