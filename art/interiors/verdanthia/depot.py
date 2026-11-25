"""Dispatch Bay B4. Run blender -b --python art/interiors/verdanthia/depot.py."""
import math
import random
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from workshop import Room

r=Room(__file__,'Dispatch Bay B4',{
 'Terracotta':('#bc6249',.64,0,'tile'), 'Pale limestone':('#ece2bd',.59,0,'tile'),
 'Bottle enamel':('#235b4b',.37,.24,'metal'), 'Spruce':('#27443a',.72,0,'wood'),
 'Celadon':('#9ab794',.52,0,'tile'), 'Bark':('#734832',.74,0,'wood'),
 'Leaf':('#538251',.62,0,None,0,1,.17), 'New growth':('#a9c76a',.56,0,None,0,1,.23),
 'Pear':('#edb657',.39,0,None,0,1,.13), 'Brass':('#b98b49',.36,.54,'metal'),
 'Clock light':('#ffcf82',.42,0,None,1.5), 'glass':('#b7e9dc',.19,.08,None,0,.17),
 'Tile grout':('#a18d75',.78), 'Ink':('#203536',.56), 'Porcelain':('#fff6dc',.32,.04,'tile')})
r.floor('Tile grout','Bottle enamel')
r.section('Packing tiles')
# A flush, gridded, staggered tile floor supplies vertices to the game's bake.
for j in range(8):
    y=-3.4+j*1.45
    for i in range(10):
        x=-9.6+i*2.1-(1.05 if j%2 else 0)
        a,b=max(-9.6,x+.012),min(9.6,x+2.088)
        if b>a:r.quad((a,y+.012,.003),(b,y+.012,.003),(b,min(y+1.438,8.2),.003),(a,min(y+1.438,8.2),.003),'Pale limestone')
# Masonry plinths, true window openings and structural glass.
for sign in [-1,1]:
    for y0,y1,cut in [(-17,-3.4,True),(-3.4,8.2,sign==1)]:
        r.section('East glazing' if sign==1 else 'West glazing',cut)
        r.side(sign*9.6,y0,y1,0,1.45,'Celadon')
        r.side(sign*9.6,y0,y1,1.45,7.5,'glass')
        for h in [1.48,4.4,7.42]:r.box((sign*9.54,(y0+y1)/2,h),(.16,y1-y0,.13),'Bottle enamel')
        for k in range(5):
            y=y0+(y1-y0)*k/4
            r.box((sign*9.5,y,3.8),(.19,.16,7.6),'Bottle enamel')
r.section('Stockroom facade')
r.back_panel(-9.6,-1.15,0,1.05,8.2,'Celadon')
r.back_panel(-9.6,-1.15,1.05,3.5,8.2,'glass')
for x0,x1 in [(-1.15,3.4),(5.6,9.6)]:r.back_panel(x0,x1,0,3.5,8.2,'Celadon')
r.back_panel(-9.6,9.6,3.5,4.15,8.2,'Celadon')
r.back_panel(-9.6,9.6,4.15,7.8,8.21,'glass')
for h in [1.08,4.14,7.5]:
    for a,b in ([(-9.6,3.36),(5.64,9.6)] if h<3.5 else [(-9.6,9.6)]):
        r.box(((a+b)/2,8.14,h),(b-a,.12,.13),'Bottle enamel')
for x in [-9.55,-7.25,-4.85,-2.45,0,2.45,4.85,7.25,9.55]:
    r.box((x,8.19,5.9),(.13,.15,3.55),'Bottle enamel')
for x in [-8.3,-5.9,-3.4,-1.1,1.3,3.65,6.0,8.45]:
    r.rod((x-.85,8.16,4.25),(x+.85,8.16,7.45),.038,'Brass')
r.section('Sawtooth roof',True)
for a,b in [(-17,-11),(-11,-5),(-5,1),(1,6),(6,8.2)]:
    r.quad((-9.6,a,7.55),(-9.6,b,9.15),(9.6,b,9.15),(9.6,a,7.55),'glass')
    r.quad((-9.6,b,9.15),(-9.6,b,7.55),(9.6,b,7.55),(9.6,b,9.15),'glass')
    r.box((0,b,7.55),(19.2,.18,.2),'Bottle enamel')
    for x in [-9.5,-4.8,0,4.8,9.5]:r.rod((x,a,7.55),(x,b,9.15),.09,'Bottle enamel')
# Golden pears, bent twigs and broad individually folded leaves in the camera plane.
r.section('Espalier pear')
r.box((-4.7,7.68,.58),(6.2,.67,1.16),'Terracotta',.15)
r.box((-4.7,7.66,1.12),(6.42,.8,.20),'Pale limestone',.08)
r.wire([(-4.75,7.64,1.18),(-4.95,7.55,2.4),(-4.65,7.6,4.3),(-4.4,7.58,6.35)],.15,'Bark')
rng=random.Random(119)
for side in [-1,1]:
    for row in range(3):
        h=2.15+row*1.18; base=-4.8+row*.12
        w=(3.25-row*.38)*side
        r.wire([(base,7.54,h),(base+w*.38,7.54,h+.45),(base+w*.82,7.51,h+.52),(base+w,7.54,h+.98)],.087,'Bark')
        for j in range(6):
            x=base+w*(j+1)/6; z=h+.51+j*.056
            direction=1 if j%2 else -1
            r.rod((x,7.53,z),(x+side*.23,7.50,z+direction*.36),.037,'Bark')
            cx=x+side*.30; cz=z+direction*.49
            verts=[(cx-.39,7.51,cz-.12),(cx-.16,7.53,cz+.20),(cx+.16,7.53,cz+.21),(cx+.39,7.51,cz+.12),
                   (cx+.13,7.50,cz-.18),(cx-.12,7.51,cz-.19),(cx,7.40,cz)]
            r.mesh(verts,[(j,(j+1)%6,6) for j in range(6)],'New growth' if rng.random()<.34 else 'Leaf')
            if j in [1,4]:
                r.ball((x,7.34,z-.23),(.16,.15,.23),'Pear')
                r.ball((x+.015,7.34,z-.13),(.10,.11,.21),'Pear')
for obj in r.items:
    if obj['assembly']=='Espalier pear':obj.location.y+=1.10
r.section('Stockroom')
r.quad((1.6,8.2,0),(7.4,8.2,0),(7.4,14.6,0),(1.6,14.6,0),'Pale limestone')
r.back_panel(1.6,7.4,0,4.7,14.6,'Terracotta')
for x in [1.6,7.4]:r.side(x,8.2,14.6,0,4.7,'Celadon')
r.section('Stockroom roof',True);r.quad((1.6,8.2,4.7),(1.6,14.6,4.7),(7.4,14.6,4.7),(7.4,8.2,4.7),'Pale limestone')
r.section('Packing furniture')
for x in [2.08,6.92]:
    for z in [1.0,2.22,3.42]:r.box((x,11.55,z-.065),(.9,5.45,.13),'Pale limestone')
    for y in [8.95,14.1]:r.box((x,y,1.85),(.12,.15,3.7),'Bottle enamel')
r.box((4.5,13.6,1.175),(2.65,.8,.15),'Bark')
for x in [3.35,5.65]:
    for y in [13.30,13.9]:r.box((x,y,.57),(.14,.12,1.14),'Bottle enamel')
r.section('Freight door')
for x in [3.31,5.69]:r.box((x,8.21,1.82),(.18,.27,3.64),'Bottle enamel',.03)
r.box((4.5,8.2,3.62),(2.56,.27,.24),'Bottle enamel',.04)
# A stamped bay number high enough to see above the signpost.
r.box((4.50,7.98,4.18),(2.42,.19,.85),'Spruce',.12)
r.label('B4',(4.50,7.85,4.18),.52,'Clock light')
r.section('Last dispatch clock')
r.disc(1.25,7.81,5.62,1.00,.22,'Bottle enamel')
r.ring(1.25,7.64,5.62,.87,.08,'Brass')
r.disc(1.25,7.64,5.62,.80,.06,'Clock light')
for i in range(12):
    a=i*math.tau/12;x=1.25+.67*math.sin(a);z=5.62+.67*math.cos(a)
    r.rod((x,7.575,z),(x+.09*math.sin(a),7.575,z+.09*math.cos(a)),.027,'Ink')
for x,h in [(.82,5.9),(1.54,6.20)]:r.rod((1.25,7.54,5.62),(x,7.54,h),.044,'Ink')
r.section('Dispatch and soup outlets')
r.box((7.52,7.96,2.42),(2.3,.37,2.6),'Terracotta',.19)
for x in [7.0,8.05]:
    r.box((x,7.7,2.55),(.85,.18,.44),'Ink',.09)
r.box((7.0,7.54,2.39),(.58,.35,.11),'Porcelain',.02,rot=(.22,0,0))
r.wire([(8.06,7.70,2.54),(8.06,7.47,2.6),(8.06,7.36,2.35)],.09,'Brass')
r.rod((8.06,7.41,1.67),(8.06,7.41,1.99),.18,'Porcelain',.40,28)
r.label('POST',(7.0,7.74,3.16),.27,'Porcelain')
r.label('SOUP',(8.05,7.74,3.16),.27,'Porcelain')
r.section('Goods shelf')
for x in [-6.49,-2.41]:
    for y in [.51,1.29]:r.box((x,y,2.20),(.12,.12,4.4),'Bottle enamel',.025)
for top in [1,2.15,3.3]:r.box((-4.45,.9,top-.06),(4.2,.9,.12),'Pale limestone',.025)
r.box((-4.45,1.27,4.30),(4.2,.14,.20),'Bottle enamel',.035)
r.counter('Terracotta','Porcelain','Spruce','Brass')
r.section('Tile wear')
for x,y in [(-8.35,3.2),(6.78,4.7),(5.9,1.5)]:
    for i in range(3):r.box((x+i*.16,y+i*.10,.007),(.25+i*.09,.022,.005),'Tile grout',.002,rot=(0,0,.2))
r.marker('clock',(1.25,7.25,5.62),'#ffcc86',.8,14)
r.marker('glasshouse',(-5.1,3.6,7.4),'#d8efff',1.3,29)
r.marker('packing',(4.5,13,4.15),'#ffcf94',1.15,16)
r.end()
