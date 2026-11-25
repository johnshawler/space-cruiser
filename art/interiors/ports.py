"""Location-specific scenery for the remaining approved port designs."""
import math
from pathlib import Path
from workshop import Room

# Main wall, deck, ribs, pale worktop, accent, lamp, landscape, secondary colour.
COLOURS={
'scorchmaw':['51403b','372e30','362a31','e9d4a8','ba4e31','ff9a44','743d40','825558'],
'dunemoor':['cc9c72','aa7958','735143','f3dfb0','94475a','ffdb9b','d9925c','b58e72'],
'sloshwell':['529999','716950','274e5c','f1dfac','cf8549','ffe0a0','599bb0','467f81'],
'amethyne':['9a6cb0','554663','59456e','f6dfdd','dba558','ffe1ad','67bdba','ce8aaf'],
'toxibloom':['74805c','505747','44493f','e1db9d','ac6a54','c6ec89','8da880','697548'],
'candara':['be8aa4','735e79','745773','f4d8c9','9e607e','ffe1b9','f0c4d4','c397ad'],
'jovexa':['d8b892','8e7867','4b6569','f2e2be','c57b50','ffde9c','eed5ad','99b3a7'],
'brrrindle':['9bbdcf','62778a','4e596a','f5e5c3','bc5a53','ffce82','c5dfed','719bb3'],
'listening-post-hush':['788497','4c5568','41475f','d9d4c7','83668e','e5ca9e','232b46','9496ad'],
'cryo-vault-rimeholm':['91afbe','596c7e','445c70','dbe7df','cb8a72','b2e8f5','172a41','a4c8cb'],
'calibration-spire':['9a968c','62666c','474d59','e5ddba','c78544','ffd899','1e2237','798c98'],
'beacon-far-wink':['90818a','58515f','484151','e1d4bd','bb6252','ffd185','171b2c','a08670']}
STATIONS=set(list(COLOURS)[-4:])
def palette(loc):
    a=COLOURS[loc]
    return {key:('#'+a[idx],rough,metal,tex) for key,idx,rough,metal,tex in [
        ('Wall',0,.62,.15,'tile'),('Floor',1,.48,.15,'tile'),('Rib',2,.48,.38,'metal'),
        ('Pale',3,.45,.12,'tile'),('Accent',4,.38,.28,'metal'),('Secondary',7,.61,.03,'wood')]} | {
        'Lamp':('#'+a[5],.38,0,None,1.7),'Glass rim':('#'+a[6],.42,.2),
        'glass':('#d1e6e0',.20,.06,None,0,.14),'Dark':('#2e303b',.68,.08,'felt'),
        'Brass':('#c1975e',.38,.54,'metal'),'Soft':('#'+a[4],.82,0,'felt',0,1,.15),
        'Leaf':('#'+a[7],.58,0,None,0,1,.20),'Milk':('#fff0cd',.36,0,None,.42,1,.18)}
def arc(r,cx,y,cz,rx,rz,radius,mat,start=0,end=math.pi):
    r.wire([(cx+rx*math.cos(start+(end-start)*i/24),y,cz+rz*math.sin(start+(end-start)*i/24)) for i in range(25)],radius,mat,False)
def hatch(r,x,z,w,h):
    r.box((x,8.05,z),(w,.22,h),'Rib',.14)
    r.box((x,7.90,z),(w-.24,.12,h-.24),'Pale',.095)
def bars(r,x,z,width,n=5):
    for i in range(n):r.box((x,7.71,z+i*.23),(width*(1-i*.075),.09,.10),'Rib',.026)
def gauge(r,x,z,rad=1.0,frac=.63):
    r.disc(x,7.66,z,rad,.22,'Rib');r.disc(x,7.48,z,rad*.84,.12,'Pale')
    for i in range(9):
        a=.25+i*2.65/8
        r.rod((x+math.cos(a)*rad*.62,7.37,z+math.sin(a)*rad*.62),
              (x+math.cos(a)*rad*.77,7.37,z+math.sin(a)*rad*.77),.034,'Rib')
    a=.25+frac*2.65;r.rod((x,7.35,z),(x+math.cos(a)*rad*.65,7.35,z+math.sin(a)*rad*.65),.058,'Accent')
def vessel(r,x,y,z,rad,mat='Brass'):
    r.rod((x,y,z),(x,y,z+rad*.80),rad*.43,mat,rad,32)
    r.rod((x,y,z+rad*.82),(x,y,z+rad*.84),rad*.86,'Dark',n=32)
def sign(r,x,z,word,w=3.2):
    r.box((x,7.58,z),(w,.14,.84),'Rib',.09);r.label(word,(x,7.49,z),.37,'Milk')
def window_strip(r,x0,x1,z0,z1):
    r.back_panel(x0,x1,z0,z1,8.22,'glass')
    for x in [x0,x1]:r.box((x,8.16,(z0+z1)/2),(.12,.14,z1-z0),'Rib')
    for z in [z0,z1]:r.box(((x0+x1)/2,8.16,z),(x1-x0,.14,.14),'Rib')
def shed(r,loc,style):
    r.floor('Floor','Rib');r.section('Hull sides')
    for side in [-1,1]:
        for a,b,cut in [(-17,-3.4,True),(-3.4,8.2,side==1)]:
            r.section('Starboard wall' if side==1 else 'Port wall',cut)
            r.side(side*9.6,a,b,0,2.1,'Wall');r.side(side*9.6,a,b,2.1,6.35,'glass')
            r.side(side*9.6,a,b,6.35,8.45,'Wall')
            for y in [a,(a+b)/2,b]:
                r.box((side*9.53,y,4.15),(.2,.26,8.3),'Rib',.075)
            for z in [2.1,6.35]:r.box((side*9.53,(a+b)/2,z),(.2,b-a,.18),'Rib')
    r.section('Rear bulkhead')
    if r.key=='depot':
        for a,b in [(-9.6,3.4),(5.6,9.6)]:r.back_panel(a,b,0,3.5,8.2,'Wall')
        r.back_panel(-9.6,9.6,3.5,4.3,8.2,'Wall')
    else:r.back_panel(-9.6,9.6,0,4.3,8.2,'Wall')
    r.back_panel(-9.6,-7.1,4.3,8.45,8.2,'Wall');r.back_panel(7.1,9.6,4.3,8.45,8.2,'Wall')
    window_strip(r,-7.1,7.1,4.3,7.6);r.back_panel(-7.1,7.1,7.6,8.45,8.2,'Wall')
    r.section('Roof panels',True)
    r.quad((-9.6,-17,8.45),(-9.6,8.2,8.45),(9.6,8.2,8.45),(9.6,-17,8.45),'Wall')
    r.section('Deck inlay')
    for x in [-7.8,7.8]:
        r.box((x,2.0,.007),(.08,8,.01),'Secondary',.003)
        for k in range(3):r.box((x+k*.10,3.45+k*.085,.014),(.34,.023,.008),'Rib',.002,rot=(0,0,.34))
    r.section('Outside the glazing')
    if loc in STATIONS:
        # The station's own truss interrupts the star field outside the windows.
        for x in [-8.6,8.8]:
            r.rod((x,10,3.5),(x+1.5,12,8.6),.17,'Rib')
        for i in range(24):
            x=-16+(i*7.921)%32;z=4+(i*2.129)%5.5
            if r.key=='depot' and 1.4<x<7.6:continue
            r.disc(x,17,z,.028+(i%3)*.013,.014,'Milk',8)
    elif loc in ['candara','jovexa']:
        for i in range(9):
            x=-17+i*4.1;r.ball((x,17+(i%3),3.6+.8*math.sin(i*1.9)),(3.45,1.4,.65+(i%3)*.14),'Glass rim')
    else:
        for i in range(7):
            x=-16+i*5.0
            if r.key=='depot' and 1.0<x<8:continue
            r.rod((x,18,-.5),(x+.4,18,3.7+1.5*math.sin(i*1.83)),3.6,'Glass rim',.25,7)
def store_room(r):
    r.section('Goods shelf')
    for x in [-6.49,-2.41]:
        for y in [.51,1.29]:r.box((x,y,2.2),(.12,.12,4.4),'Rib',.025)
    for z in [1,2.15,3.3]:r.box((-4.45,.9,z-.06),(4.2,.9,.12),'Pale',.025)
    r.box((-4.45,1.27,4.36),(4.2,.14,.08),'Accent',.04)
    r.section('Stockroom')
    r.quad((1.6,8.2,0),(7.4,8.2,0),(7.4,14.6,0),(1.6,14.6,0),'Floor')
    r.back_panel(1.6,7.4,0,4.7,14.6,'Wall')
    for x in [1.6,7.4]:r.side(x,8.2,14.6,0,4.7,'Wall')
    for x in [2.1,6.9]:
        for z in [.95,2.18,3.36]:r.box((x,11.55,z),(.92,5.7,.13),'Pale')
        for y in [8.85,14.25]:r.box((x,y,1.82),(.15,.15,3.64),'Rib')
    r.box((4.5,13.6,1.185),(2.6,.8,.13),'Pale')
    for x in [3.4,5.6]:r.box((x,13.6,.58),(.14,.62,1.16),'Rib')
    r.section('Store lid',True)
    r.quad((1.6,8.2,4.7),(1.6,14.6,4.7),(7.4,14.6,4.7),(7.4,8.2,4.7),'Wall')
    r.section('Stockroom surround')
    for x in [3.29,5.71]:r.box((x,8.25,1.77),(.20,.20,3.54),'Rib')
    r.box((4.5,8.24,3.62),(2.6,.22,.24),'Accent')
    r.marker('packing',(4.5,13.1,4.25),'#ffe0ba',.90,15)
def arch_ribs(r,mat='Rib',count=4):
    for i in range(count):
        y=-2.3+i*3.15
        arc(r,0,y,3.1,9.12,4.85,.17,mat)
def roof_frames(r,shape,accent='Accent'):
    for y in [-2.5,1.5,5.70]:
        if shape=='peak':pts=[(-9.4,y,2.6),(-8.4,y,4.9),(0,y,8.65),(8.4,y,4.9),(9.4,y,2.6)]
        elif shape=='square':pts=[(-9.4,y,2.5),(-9.4,y,6.4),(-8.3,y,7.65),(8.3,y,7.65),(9.4,y,6.4),(9.4,y,2.5)]
        else:pts=[(-9.3,y,2.4),(-8.0,y,6.5),(-4.0,y,7.2),(3.1,y,7.78),(8.6,y,6.9),(9.3,y,2.4)]
        r.wire(pts,.15,accent,False)
def make(script,title,design):
    loc=Path(script).parent.name;r=Room(script,title,palette(loc));r.back=8.2
    shed(r,loc,design)
    if r.key=='depot':store_room(r)
    r.counter('Secondary','Pale','Rib','Accent')
    r.section('Signature architecture');design(r)
    r.section('Task lights')
    for x in [-7.55,7.55]:r.box((x,7.54,5.45),(.24,.24,1.18),'Lamp')
    r.marker('left',(-7.55,7.15,5.48),'#'+COLOURS[loc][5],1.12,24)
    r.marker('soffit',(0,1.0,7.1),'#e5eafa',1.05,28)
    r.marker('right',(7.55,7.15,5.48),'#'+COLOURS[loc][5],.85,20)
    r.end()

def quarry(r):
    for s in [-1,1]:
        for n in range(4):
            x=s*(8.4+n*.24);h=1.35+n*1.15
            r.rod((x,5.8,0),(x+.12,5.9,h),1.02,'Secondary' if n%2 else 'Rib',.88,6)
    r.box((0,6.8,6.4),(17.1,1.8,.72),'Accent',.12)
    for x in [-7,-4,-1,2,5,8]:r.box((x,6.8,6.90),(.16,1.8,.36),'Rib')
    gauge(r,-3.5,4.8,1.45);vessel(r,-7.5,5.72,1.04,1.02)
    r.rod((-8,6.8,1.1),(-7.72,6.8,1.72),.35,'Pale',.25,6)
def kiln(r):
    for i in range(13):
        a=i*math.pi/12
        x=8.9*math.cos(a);h=2+5.65*math.sin(a)
        r.box((x,5.5,h),(2.23,4.05,.43),'Pale',.18,rot=(0,a-math.pi/2,0))
    r.wire([(-7.8,6.8,1.6),(-7.8,6.8,4.7),(-5.7,7.4,5.8),(-2.6,7.6,5.8)],.23,'Lamp')
    hatch(r,6.7,3.0,3.6,3.8)
    for x in [6.15,7.2]:
        r.ball((x,7.52,3.3),(.44,.19,.72),'Soft');r.ball((x-.30,7.48,3.43),(.22,.18,.26),'Soft')
def archive(r):
    for i in range(6):
        x=-8.5+i*2.9;z=4.0+(i%3)*.5
        r.box((x,7.96,z),(2.75,.45,1.85),'Secondary',.08)
        r.box((x-.62,7.92,z+1.08),(1.10,.45,.42),'Pale',.07)
        r.box((x,7.67,z),(1.05,.14,.22),'Rib',.04)
    r.disc(-6.15,7.32,6.12,.79,.46,'Pale')
    r.box((-4.55,7.35,6.0),(2.40,.11,.68),'Pale')
    sign(r,-2,5.47,'4111',2.9)
    for dz,mat in [(0,'Secondary'),(.19,'Accent'),(.31,'Pale')]:
        r.box((7.80,7.22,1.82+dz),(1.02,.71,.17),mat,.09)
def triplicate(r):
    for x in [-6.3,0,6.3]:
        arc(r,x,6.65,2.2,3.05,3.05,.43,'Pale')
        arc(r,x,6.94,2.2,2.62,2.69,.23,'Secondary')
        r.ball((x,6.69,4.18),(.26,.26,.38),'Milk')
        if x:r.box((x,6.75,.67),(3.55,.92,.55),'Soft',.23)
    r.rod((-6.3,6.3,2.15),(-6.3,6.3,3.32),.14,'Brass')
    r.box((-6.3,6.2,3.37),(1.55,.38,.50),'Rib',.20)
    for x in [-6.9,-6.3,-5.7]:vessel(r,x,6.09,1.37,.26,'Pale')
def lock(r):
    for x in [-6.55,-2.5,1.15,7.55]:
        r.box((x,7.89,2.45),(2.58,.45,4.82),'Secondary',.11)
        for z in [1,2.6,4.05]:r.box((x,7.62,z),(2.62,.18,.19),'Pale')
    r.box((-6.95,7.38,4.17),(1.55,.21,5.46),'Rib')
    for i in range(6):r.box((-6.88,7.17,2.13+i*.72),(.72,.13,.065),'Pale')
    r.rod((-6.98,6.97,3.7),(-6.72,6.97,5.52),.11,'Brass')
    r.disc(-6.67,6.96,5.66,.39,.15,'Lamp')
    r.rod((7.65,6.72,.5),(7.65,6.72,1.76),.59,'Rib',n=24)
def tureen(r):
    arch_ribs(r,'Pale',3)
    for x in [-8.55,8.55]:
        arc(r,x,6,3.6,.89,1.60,.22,'Rib',0,math.tau)
    for i in range(3):r.ring(-5.80,7.34-i*.08,3.88,1.80-i*.42,.13,'Pale' if i%2==0 else 'Rib')
    for i in range(3):
        x=5.90+i*.86;z=3.15+abs(i-1)*.35
        r.rod((x,7.47,z),(x+(i-1)*.45,7.49,z+2),.095,'Brass');r.disc(x,7.38,z,.36,.21,'Milk')
def crystal(r):
    for i in range(7):
        x=-8.9+i*1.32;z=5.0+1.25*math.sin(i*.8)
        r.rod((x,6.68,z-.88),(x-.45,7.15,z+.60),.96,'Secondary' if i%2 else 'Wall',.16,5)
    r.wire([(-8.7,6.0,5.25),(-6.9,6.0,5.7),(-3.5,6.1,5.4)],.18,'Brass')
    r.rod((-.7,7.45,4.95),(-.7,7.45,6.95),.13,'Rib')
    r.rod((-2.48,7.42,6.59),(1.07,7.42,6.25),.12,'Brass')
    for x,z in [(-2.45,6.55),(1.02,6.25)]:
        r.rod((x,7.4,z-1.1),(x,7.4,z),.044,'Brass');vessel(r,x,7.4,z-1.45,.55)
    r.box((-2.45,7.25,5.58),(.47,.11,.64),'Pale',.04,rot=(0,.30,0))
def roots(r):
    for i in range(6):
        x=-9+i*3.5;y=6.85+(i%2)*.34
        r.wire([(x*.9,y,7.3),(x+.60,y,6.2),(x-.39,y,5.1),(x*.99,y,4.55)],.31,'Secondary')
    for row in range(5):
        pts=[(-9+j*1.5,7.86+.16*math.cos(j+row),4.0+row*.58+.16*math.sin(j+row*.7)) for j in range(13)]
        r.wire(pts,.14,'Pale')
    r.ball((-6.8,7.0,4.65),(.58,.43,.72),'Accent')
    r.box((-7.70,6.6,1.8),(1.6,.66,1.55),'Secondary',.13,rot=(0,.16,0))
    for i in range(5):r.ball((2.65+i*.81,7.87,4.02),(.25,.23,.17),'Lamp')
def fungus(r):
    body=[(-9.3,7.55,3.9),(-8.8,6.7,6.25),(-6.5,4.5,7.15),(-2.6,3.88,7.64),(1.8,4.81,7.25),(4.25,6.25,6.82)]
    for j in range(10):
        a=j/9;end=(-6.4+11.1*a,4.3+2.15*abs(a-.4),6.25+.9*math.sin(a*math.pi))
        r.wire([(-9.25,7.3,4.45),(-7.45,7.09,5.63),((-8+end[0])/2,6.3,end[2]-.29),end],.16,'Pale')
    r.wire(body,.42,'Secondary')
    hatch(r,6.65,3.31,3.46,4.26);r.rod((6.65,7.48,2.5),(6.65,7.48,4.45),.14,'Brass')
    r.box((6.65,7.42,4.5),(1.8,.22,.16),'Rib');r.ball((6.63,7.39,2.38),(.73,.23,.28),'Accent')
def trunk(r):
    for x in [-8.9,8.9]:
        for z in [1.0,2.45,4.05,5.55]:
            r.rod((x,-3,z),(x,7.4,z+.32),.62,'Secondary',.50,8)
    for rad in [3.45,2.82,2.18,1.50,.80]:
        arc(r,-1.4,7.92,3.81,rad*1.55,rad,.12,'Secondary' if rad>2 else 'Pale',0,math.tau)
    for x in [6.83,8.07]:
        r.ball((x,7.13,3.18),(.72,.42,.89),'Leaf');r.rod((x,6.8,2.98),(x,6.28,2.98),.09,'Brass')
    vessel(r,6.82,6.45,1.50,.50,'Pale');r.box((8.08,6.54,3.29),(1.12,.14,1.1),'Soft',.15)
def sail(r):
    for x in [-8.9,8.9]:r.rod((x,5.8,0),(x,5.8,8.4),.23,'Brass')
    for i in range(12):
        xa=-9+i*1.5;xb=xa+1.5
        def z(x):return 5.5+2.65*(abs(x)/9)**1.65
        r.quad((xa,2.1,z(xa)),(xa,6.7,z(xa)+.35),(xb,6.7,z(xb)+.35),(xb,2.1,z(xb)),'Soft' if i%3 else 'Secondary')
    r.rod((-7.85,6.25,4.5),(-6.05,6.25,4.11),.57,'Pale',.13,12)
    r.disc(7.36,7.36,2.76,1.12,.52,'Accent')
    for h in [2.52,2.74,2.96]:r.wire([(6.53,7.02,h),(7.35,6.97,h+.13),(8.16,7.02,h)],.065,'Brass')
def listing(r):
    for x in [-8.7,-5.7,-2.7,.3,3.3,6.3]:
        r.rod((x,7.96,.20),(x+1.35,7.96,7.6),.18,'Accent')
        arc(r,x+.79,7.62,4.77,1.06,1.57,.13,'Pale',0,math.tau)
    r.rod((-5.15,7.29,3.75),(-5.15,7.29,6.30),.045,'Brass');r.rod((-5.15,7.29,3.25),(-5.15,7.29,3.81),.02,'Brass',.27)
    r.box((6.55,7.12,3.07),(2.67,.28,1.22),'Rib',.21,rot=(0,-.12,0));sign(r,6.5,3.03,'CLOSED',2.5)
def bubble(r):
    for i in range(6):
        a=i*math.pi/5
        pts=[((-8.9*math.cos(a)),6.90,3.9),(-8.2*math.cos(a),4.7,6.27),(-5.1*math.cos(a),.22,7.65)]
        r.wire(pts,.24,'Pale')
    for i in range(6):
        x=-8+i*3.18;r.ball((x,8.0,5.65),(1.81,.72,1.85),'Pale')
    for x in [-6,0,6]:
        r.wire([(x,6.9,4.7),(x,6.6,6.99),(x*.8,3.3,7.91)],.16,'Accent')
    r.ball((-6.4,6.65,4.62),(.90,.55,.7),'Accent');r.ring(7.0,7.3,3.52,.70,.14,'Brass')
def cradle(r):
    for side in [-1,1]:
        x=side*7.25
        r.wire([(side*8.9,4.85,.35),(side*8.85,4.85,3.85),(x,4.85,5.5),(side*5.7,4.85,5.99)],.42,'Rib')
        for i in range(4):r.ball((x+side*(.95-i*.52),4.78,4.79+i*.31),(.55,.47,.48),'Soft')
    r.disc(-6.9,7.34,2.85,.66,.28,'Pale');r.wire([(-6.9,7.5,3.35),(-7.9,7.1,4.22),(-8.5,7.2,3.41)],.10,'Brass')
    r.box((6.77,7.58,3.05),(1.62,.43,1.08),'Secondary',.22)
def aframe(r):
    roof_frames(r,'peak','Secondary')
    for i in range(4):
        x=-1.8+i*1.2;r.box((x,6.25,7.03+.53*(1-abs(x)/2.2)),(1.25,.82,.58),'Soft',.17,rot=(0,-.38 if x<0 else .38,0))
    r.wire([(-2.1,6.63,6.85),(-3.9,6.96,5.74),(-5.54,7.02,5.39)],.27,'Soft')
    r.disc(-7.4,7.51,3.9,.89,.52,'Accent');r.ring(-7.4,7.16,3.9,.62,.12,'Pale')
    hatch(r,7.2,2.3,1.7,2.8);bars(r,7.2,1.64,1.1)
def radiator(r):
    for i in range(13):
        x=-7.25+i*1.2;r.box((x,7.83,3.32),(.73,.37,5.70),'Secondary' if i%3 else 'Accent',.24)
        r.box((x,7.58,3.32),(.13,.11,4.74),'Lamp',.04)
    hatch(r,-6.75,2.28,2.73,1.32)
    r.box((6.70,7.33,3.37),(2.08,.23,2.24),'Soft',.21)
    for s in [-1,1]:r.box((6.70+s*1.05,7.32,3.89),(.98,.25,.60),'Soft',.20,rot=(0,s*.42,0))
    r.disc(6.93,7.18,3.02,.30,.06,'Dark')
def mitten(r):
    arch_ribs(r,'Pale')
    for x in [-6.1,6.1]:
        arc(r,x,7.22,2.48,2,2.24,.56,'Soft')
    hatch(r,-6.2,2.85,2.89,2.36)
    for i in range(4):
        r.rod((-7+i*.45,7.47,2.05),(-6.85+i*.43,7.48,2.73+(i%2)*.4),.28,'Lamp',.025,8)
    r.wire([(-6.15,7.5,3.98),(-6.39,7.55,4.48),(-6.72,7.55,4.25)],.045,'Dark')
    r.ball((6.16,7.32,3.17),(.9,.57,1.08),'Brass')
    for x in [5.77,6.55]:vessel(r,x,6.87,1.53,.30,'Pale')
def suspension(r):
    for x in [-7.65,7.65]:
        r.box((x,7.82,4.20),(2.7,.28,6.6),'Dark',.20)
        for z in [2.5,5.87]:
            for i in range(3):r.disc(x,7.49-i*.11,z,.55-i*.055,.16,'Soft',24)
    r.wire([(-8.88,6.85,1.40),(-8.88,6.85,7.18),(8.85,6.85,7.18),(8.85,6.85,1.4)],.24,'Pale',False)
    vessel(r,-6.32,7.26,2.76,.68,'Soft');r.ball((-6.32,7.24,2.80),(.15,.15,.22),'Brass')
def wedges(r):
    for j in range(3):
        for i in range(6):
            x=-8.66+i*1.22;z=1.04+j*1.79
            r.mesh([(x-.55,7.95,z),(x+.55,7.95,z),(x+.55,7.95,z+1.53),(x-.55,7.95,z+1.53),
                    (x,7.12,z+.20),(x,7.12,z+1.36)],[(0,1,4),(1,2,5,4),(2,3,5),(3,0,4,5)],'Secondary' if i%2 else 'Rib')
    for i in range(3):
        x=2.39+i*2.40;r.box((x,7.86,3.5),(2.02,.27,2.19),'Pale',.15)
        r.ball((x-.09,7.65,3.47),(.48+i*.06,.18,.4-i*.07),'Wall',rot=(0,i*.37,0))
def petals(r):
    for i in range(9):
        x=-8.65+i*2.13;z=5.31+1.46*math.cos((i-4)*.34)
        r.ball((x,7.74,z),(1.44,.36,1.10),'Soft' if i%2 else 'Secondary',rot=(0,(i-4)*.13,0))
        r.disc(x,7.30,z-.47,.19,.11,'Lamp',20)
    for x in [-7.8,7.8]:
        r.box((x,5.58,.68),(2.2,1.1,.58),'Soft',.23)
    for i in range(3):vessel(r,-7.70+i*.57,7.39,2.93,.27,'Soft')
    for s in [-1,1]:r.ball((6.7+s*.33,7.16,3.4),(.43,.22,.65),'Pale',rot=(0,s*.32,0))
def archive_ice(r):
    for x in [-8.22,-5.77,-3.32,-.87,7.6]:
        for j in range(3):
            z=.89+j*1.37;r.box((x,7.81,z),(2.23,.5,1.22),'Pale',.17)
            r.box((x,7.50,z+.05),(.80,.18,.18),'Rib',.075)
    r.disc(-4.15,7.64,5.78,1.21,.30,'Glass rim');r.disc(-4.15,7.39,5.78,.76,.13,'Brass')
    r.disc(-1.70,7.46,5.73,.61,.35,'Pale');r.box((-.70,7.40,5.43),(1.68,.09,.56),'Milk')
def heaters(r):
    for i,(y,mat) in enumerate([(-2.65,'Accent'),(1.12,'Brass'),(4.96,'Glass rim')]):
        arc(r,0,y,2.7,8.96,5.12,.35,mat)
        for side in [-1,1]:
            r.rod((side*8.98,y,.26),(side*8.98,y,2.73),.35,mat)
    r.rod((-7.77,7.23,3.6),(-6.07,6.98,3.38),.31,'Pale',.66,24)
    r.box((-7.27,7.12,2.91),(.33,.34,.79),'Accent',.14)
    for s in [-1,1]:r.ball((6.77+s*.52,7.30,3.19),(.48,.27,.99),'Soft',rot=(0,s*.42,0))
def square_jig(r):
    for i in range(3):
        w=9.05-i*1.27;h=7.7-i*.79
        r.wire([(-w,7.65,.33),(-w,7.65,h),(w,7.65,h),(w,7.65,.33)],.18,'Pale' if i%2 else 'Rib',False)
    r.rod((-8.47,7.35,4.76),(-6.63,7.35,4.76),.23,'Brass')
    for i in range(5):r.disc(-8.17+i*.26,7.28,4.73,.25,.14,'Brass')
    r.ring(-3.29,7.32,4.45,1.28,.15,'Brass')
    r.wire([(-4.32,7.25,4.44),(-3.52,7.24,4.64),(-2.26,7.24,4.41)],.05,'Dark')
    hatch(r,7.27,2.73,1.90,2.75);r.box((7.27,7.63,2.7),(1.26,.11,.18),'Lamp')
def torque(r):
    r.disc(-2.05,7.87,3.88,3.65,.28,'Pale',64)
    arc(r,-2.05,7.64,3.88,3.18,3.18,.14,'Rib',0,math.pi)
    for i in range(12):
        a=(i+.5)*math.pi/12;r.rod((-2.05+2.71*math.cos(a),7.59,3.88+2.71*math.sin(a)),
            (-2.05+3.1*math.cos(a),7.59,3.88+3.1*math.sin(a)),.09,'Rib')
    r.rod((-2.05,7.43,3.88),(-.27,7.43,5.82),.16,'Accent',.045)
    r.rod((6.6,7.57,3.39),(6.6,7.57,6.5),.065,'Rib')
    r.rod((6.6,7.57,2.35),(6.6,7.57,3.39),.49,'Brass',.32)
def signal(r):
    r.box((-3.5,7.62,5.60),(9.4,1.01,3.09),'Rib',.19)
    for i in range(6):
        x=-7.25+i*1.49;r.box((x,7.05,5.64),(1.26,.10,2.45),'Glass rim')
        for z in [5.06,5.74,6.42]:r.box((x,6.92,z),(1.26,.15,.28),'Pale',.04,rot=(.30,0,0))
    r.disc(-5.2,6.85,4.07,.31,.15,'Lamp');r.box((-3.72,6.84,4.09),(1.55,.15,.49),'Lamp')
    r.rod((7.1,7.5,2.27),(7.9,7.40,3.31),.13,'Brass');r.ball((7.96,7.38,3.38),(.31,.22,.21),'Accent')
def buffer(r):
    for x in [-2.15,2.15]:
        r.box((x,1.5,6.49),(.34,13.3,.43),'Rib',.065)
        for y in [-2.5,1,4.4,7.3]:r.box((x,y,6.02),(.67,.37,.72),'Pale')
    r.box((0,7.68,6.15),(6.1,.85,1.02),'Accent',.27)
    r.box((-5.4,6.67,5.45),(2.9,.81,.83),'Secondary',.16)
    for x in [-6.4,-4.4]:r.disc(x,6.17,5.92,.35,.14,'Rib')
    hatch(r,6.65,2.84,3.5,3.55)
    r.ball((6.77,7.22,2.71),(.47,.32,.34),'Pale');r.ring(7.24,7.23,2.75,.23,.06,'Brass')
    r.rod((6.44,7.26,2.68),(6.05,7.26,3.03),.13,'Pale',.08)
def lantern(r):
    for x in [-8.55,-5.7,-2.85,0,2.85,5.7,8.55]:
        r.rod((x,7.96,.6),(x*.90,7.96,7.83),.19,'Brass')
    for i in range(5):
        arc(r,-5.66,7.43,4.75,.58+i*.42,.7+i*.49,.09,'Lamp',-.96,2.92)
    r.box((2.5,7.78,3.28),(4.7,.22,4.48),'Dark',.21)
    r.rod((6.61,7.28,2.7),(7.63,7.28,4.02),.14,'Brass')
    r.ball((7.70,7.27,4.11),(.33,.26,.24),'Pale')
    vessel(r,-7.91,6.91,1.61,.45);r.box((-7.94,7.11,2.89),(.79,.37,.94),'Brass',.15)
