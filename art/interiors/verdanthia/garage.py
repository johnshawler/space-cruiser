"""Vendorhaven repair unit's unfolded service cabinet."""
import math, sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from workshop import Room
r=Room(__file__,'Fix-O-Matic 3000',{
 'Cobalt':('#315b91',.39,.32,'metal'),'Petrol':('#203c51',.53,.23,'metal'),
 'Porcelain':('#e6d9ae',.48,.12,'tile'),'Copper':('#cb784a',.32,.58,'metal'),
 'Iron':('#38454d',.56,.45,'metal'),'Ink':('#192f37',.72),'Orange':('#f8863b',.39,.12),
 'Mint':('#79b6a4',.48,0,'tile'),'Velvet':('#963e54',.87,0,'felt',0,1,.10),
 'Ivory light':('#fff3cd',.32,0,None,2.7),'Moss':('#8ca655',.78,0,None,0,1,.22),
 'glass':('#b6dece',.2,.04,None,0,.18),'Oiled steel':('#566268',.48,.46,'metal')})
r.floor('Oiled steel','Petrol')
# Box folded open, with bright inside faces, dark rebate and visible hinge barrels.
r.section('Cabinet back')
r.back_panel(-9.6,9.6,0,8.25,7.15,'Cobalt')
r.back_panel(-8.9,8.9,.68,7.55,7.08,'Petrol')
r.back_panel(-6.65,6.65,1,6.95,7.01,'Porcelain')
for x in [-8.8,8.8]:
    r.box((x,6.92,4.0),(.64,.36,7.7),'Cobalt',.19)
    for z in [1.05,3.82,6.62]:r.rod((x,6.65,z-.4),(x,6.65,z+.4),.22,'Copper')
for side in [-1,1]:
    for y0,y1,cut in [(-17,-3.4,True),(-3.4,7.15,side==1)]:
        r.section('Folded service leaves',cut)
        r.side(9.6*side,y0,y1,0,8.25,'Cobalt')
        for z in [.55,7.7]:
            r.box((9.48*side,(y0+y1)/2,z),(.22,y1-y0,.37),'Petrol')
    r.section('Enamel tool door')
    # Angled door cheeks face inward and toward the counter.
    rot=side*math.radians(22);x=side*7.67
    r.box((x,5.73,3.96),(3.12,.50,6.60),'Petrol',.20,rot=(0,0,rot))
    r.box((x,5.43,3.96),(2.90,.27,6.30),'Cobalt',.21,rot=(0,0,rot))
    r.box((x,5.25,3.89),(2.53,.22,5.55),'Porcelain',.17,rot=(0,0,rot))
r.section('Service roof',True)
r.quad((-9.6,-17,8.25),(-9.6,7.15,8.25),(9.6,7.15,8.25),(9.6,-17,8.25),'Petrol')
for y in [-9,-1,5.15]:r.box((0,y,7.99),(19.1,.33,.46),'Cobalt',.1)
r.section('Copper radiator')
r.box((.1,6.79,4.33),(10.6,.37,4.40),'Iron',.24)
for x in [-4.62+i*.54 for i in range(18)]:
    r.box((x,6.53,4.36),(.17,.23,3.56),'Petrol',.07)
# Single continuous serpentine return, with full radius bends.
path=[(-4.58,6.24,5.57),(3.67,6.24,5.57)]
for i in range(3):
    xx=3.67 if i%2==0 else -3.67
    for k in range(1,9):
        a=k*math.pi/8
        path.append((xx+(1 if i%2==0 else -1)*.4*math.sin(a),6.24,5.57-i*.8-.4*(1-math.cos(a))))
    path.append((-xx,6.24,5.57-(i+1)*.8))
r.wire(path,.115,'Copper',False)
for x in [-2.5,2.5]:
    for z in [3.17,4.77,5.57]:r.box((x,6.23,z),(.14,.30,.32),'Porcelain',.04)
r.section('Inspection lights')
for x in [-5.72,5.72]:
    r.box((x,6.69,4.35),(.58,.36,4.80),'Cobalt',.19)
    r.box((x,6.41,4.35),(.25,.20,4.15),'Ivory light',.10)
r.section('Sprung mallet')
r.box((-7.6,5.03,3.7),(1.87,.27,2.84),'Petrol',.18)
r.rod((-7.95,4.77,2.55),(-7.37,4.77,4.35),.11,'Copper')
r.rod((-8.08,4.77,4.57),(-6.77,4.77,4.15),.25,'Orange')
for a in range(5):r.ring(-7.97+a*.04,4.67,2.39+a*.095,.18,.031,'Iron')
r.section('Apology cushion')
r.box((7.59,5.00,3.80),(1.86,.25,2.36),'Petrol',.17)
r.box((7.59,4.78,3.82),(1.45,.42,1.40),'Velvet',.19)
for x in [7.17,8.01]:r.disc(x,4.555,3.83,.07,.08,'Copper',16)
r.label('SORRY',(7.59,4.81,2.29),.32,'Ink')
r.section('Vent and serial plate')
r.box((0,6.78,7.05),(7.9,.34,.86),'Petrol',.1)
for i in range(14):r.box((-3.57+i*.55,6.53,7.08),(.36,.14,.4),'glass',.06,rot=(0,.25,0))
for i in range(15):
    x=-3.48+i*.43;r.ball((x,6.55,7.49+.05*math.sin(i)),(.26,.11,.13+.06*math.sin(i*.68)),'Moss')
r.box((0,6.66,1.25),(4.86,.20,.83),'Cobalt',.12)
r.label('F / 3000',(0,6.51,1.27),.52,'Porcelain')
r.section('Work floor markings')
for x in [-4.90,4.90]:
    for y in [.8,2,3.2,4.4,5.6]:r.box((x,y,.008),(.11,.66,.01),'Orange',.004)
for i in range(8):
    r.box((-6.7+i*.12,2.60+(i%3)*.11,.013),(.35,.035,.008),'Ink',.003,rot=(0,0,.42))
r.counter('Cobalt','Porcelain','Petrol','Orange')
r.marker('inspection_left',(-5.72,6.07,4.45),'#fff2cc',1.15,22)
r.marker('inspection_right',(5.72,6.07,4.45),'#fff2cc',1.15,22)
r.marker('workbay',(0,1.6,7.5),'#dbe7ff',1.25,28)
r.end()
