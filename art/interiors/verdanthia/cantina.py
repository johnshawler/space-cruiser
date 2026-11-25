"""The Coin Slot, an orchard listening pavilion."""
import math,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from workshop import Room
r=Room(__file__,'The Coin Slot',{
 'Pearwood':('#b97a4d',.52,.02,'wood'),'Sapwood':('#e3ba7e',.53,0,'wood'),
 'Walnut':('#6d4638',.55,0,'wood'),'Night plum':('#513651',.86,0,'felt'),
 'Mulberry':('#8e536b',.82,0,'felt'),'Burgundy':('#7e384e',.6,0,'felt'),
 'Brass':('#c69a52',.34,.57,'metal'),'Vinyl':('#24333a',.29,.24,'metal'),
 'Rose light':('#ff899c',.35,0,None,2.0),'Honey light':('#ffdc93',.37,0,None,1.55),
 'Celadon':('#83a886',.58,0,None,0,1,.22),'glass':('#c5dace',.19,.02,None,0,.14)})
r.floor('Walnut','Brass')
r.section('Parquet')
for i in range(16):
    x=-9.6+i*1.2
    for j in range(3):
        y=-3.4+j*3.52;r.quad((x+.015,y+.012,.004),(x+1.185,y+.012,.004),
            (x+1.185,min(7.15,y+3.5),.004),(x+.015,min(7.15,y+3.5),.004),'Pearwood')
r.section('Acoustic backing')
r.back_panel(-9.6,9.6,0,8.5,7.15,'Night plum')
for side in [-1,1]:
    for a,b,cut in [(-17,-3.4,True),(-3.4,7.15,side==1)]:
        r.section('Garden windows',cut)
        r.side(side*9.6,a,b,0,1.52,'Walnut');r.side(side*9.6,a,b,1.52,7.8,'glass')
        for h in [1.49,7.65]:r.box((side*9.54,(a+b)/2,h),(.16,b-a,.19),'Sapwood')
        for i in range(4):r.box((side*9.5,a+(b-a)*i/3,4.56),(.19,.14,6.15),'Pearwood')
r.section('Pavilion roof',True)
r.quad((-9.6,-17,8),(-9.6,7.15,8.5),(9.6,7.15,8.5),(9.6,-17,8),'Night plum')
# A two-dimensional fan is extended into a folded acoustic shell. The folds
# alternate in depth and curl out at their tips to catch light from the eaves.
r.section('Fan shell')
ox,oz=1.2,2.49
outline=[(-9.55,3.55),(-9.5,5.18),(-7.8,6.88),(-5.15,7.8),(-2.03,8.22),
         (1.2,8.37),(4.07,8.12),(6.7,7.45),(8.68,6.34),(9.47,4.74),(9.55,3.35)]
for i,((x1,z1),(x2,z2)) in enumerate(zip(outline,outline[1:])):
    xmid=(x1+x2)*.5;zmid=(z1+z2)*.5
    def point(x,z,t,y):return (ox+(x-ox)*t,y,oz+(z-oz)*t)
    for a,b in [(0.16,.52),(.52,.78),(.78,1.)]:
        r.quad(point(x1,z1,a,6.70),point(xmid,zmid,a,6.90),point(xmid,zmid,b,6.90),point(x1,z1,b,6.70),'Mulberry')
        r.quad(point(xmid,zmid,a,6.90),point(x2,z2,a,6.70),point(x2,z2,b,6.70),point(xmid,zmid,b,6.90),'Night plum')
for x,z in outline:
    pts=[(ox,6.48,oz),(ox+(x-ox)*.38,6.54,oz+(z-oz)*.41),(ox+(x-ox)*.78,6.50,oz+(z-oz)*.84),(x,6.15,z)]
    r.wire(pts,.125,'Sapwood');r.ball((x,6.12,z),(.14,.16,.14),'Brass')
r.disc(ox,6.49,oz,.79,.28,'Walnut');r.ring(ox,6.28,oz,.64,.075,'Brass')
r.disc(ox,6.23,oz,.41,.14,'Brass')
r.section('Single record rack')
r.box((-5.79,6.29,3.45),(3.9,.45,2.95),'Walnut',.23)
r.box((-5.79,6.00,3.44),(3.56,.18,2.56),'Vinyl',.16)
r.disc(-6.40,5.79,3.56,1.00,.12,'Vinyl');r.ring(-6.40,5.70,3.56,.95,.035,'Brass')
for rad in [.80,.70,.60]:r.ring(-6.4,5.70,3.56,rad,.015,'Night plum')
r.disc(-6.4,5.66,3.56,.30,.055,'Rose light');r.disc(-6.4,5.61,3.56,.06,.025,'Vinyl',20)
for x in [-5.13,-4.8,-4.47]:r.box((x,5.84,3.50),(.07,.14,1.97),'Sapwood')
r.label('01',(-5.82,5.69,1.62),.34,'Honey light')
r.section('Coin return')
r.box((7.18,6.40,3.20),(3.10,.35,4.13),'Walnut',.24)
r.box((7.18,6.18,3.20),(2.77,.13,3.80),'Night plum',.17)
r.box((7.6,5.99,4.78),(1.42,.22,.33),'Brass',.10)
r.box((7.6,5.85,4.78),(.85,.03,.095),'Vinyl',.035)
pts=[(7.55,5.93,4.50),(7.88,5.89,4.09),(7.67,5.83,3.68),(6.68,5.83,3.38),
     (6.42,5.82,3.03),(6.68,5.8,2.65),(7.36,5.75,2.47),(7.54,5.65,2.09)]
for off in [-.095,.095]:r.wire([(x,y,z+off) for x,y,z in pts],.045,'Brass')
for x,z in [(7.64,3.83),(6.66,3.30),(7.23,2.56)]:r.disc(x,5.79,z,.15,.045,'Honey light',24)
r.rod((7.52,5.67,1.56),(7.52,5.67,1.80),.25,'Brass',.48,36)
r.section('Side booths')
for sign in [-1,1]:
    for x,h,d in [(8.45,.57,1.05),(9.0,1.30,.36)]:
        r.box((sign*x,2.12,h),(d,3.9,.52 if h<1 else 1.24),'Burgundy',.22)
    r.box((sign*8.48,2.12,.23),(1.14,3.9,.40),'Walnut',.13)
    r.box((sign*8.18,3.28,1.22),(1.31,.77,.12),'Sapwood',.045)
r.section('Wear at the tips')
for i in range(3):r.ring(7.18+i*.17,6.03,2.23+i*.04,.12,.016,'Walnut')
r.counter('Pearwood','Sapwood','Night plum','Brass')
r.marker('reading',(-6.4,5.43,4.6),'#ffabb9',1.1,19)
r.marker('spindle',(1.2,5.35,4.9),'#ffd9a0',1.0,23)
r.marker('orchard',(7.9,1,6.8),'#ffe8bb',.95,24)
r.end()
