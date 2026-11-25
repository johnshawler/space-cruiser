"""Five walkable interiors. Coordinates and active prop sockets follow src/09-walk.js."""
import math,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'cockpits'))
from fabricate import Ship,coord,camera,bpy

ROOMS={'corridor':(-.9,.9,.70,7.20),'passenger cabin':(-4.4,-.9,1.4,5.8),
       'galley':(.9,4.,1.4,5.),'cargo hold':(-3.4,3.4,7.2,14.2),'engine room':(-2.4,2.4,14.2,19.)}
FAULTS={'coolant':(-2.25,.15,16.2),'thruster':(1.3,.35,18.85),'fuse':(2.45,.45,1.46),
        'scrubber':(-3.,.95,5.74),'crack':(-.86,.55,5.15),'strap':(1.55,.1,10.6)}
def build(path):
    r=Ship(path,True);k=r.key
    face='Wood' if k=='manatee' else 'Pale' if k=='empress' else 'Frame'
    def bx(x,z,y,w,d,h,m,bev=.035):return r.box((x,-z,y),(w,d,h),m,bev)
    def pipe(p,q,rad,m):return r.rod(coord(*p),coord(*q),rad,m)
    for name,(a,b,c,d) in ROOMS.items():
        r.section(name+' deck');r.quad((a,-d,-.97),(b,-d,-.97),(b,-c,-.97),(a,-c,-.97),'Leather' if k=='manatee' and name=='passenger cabin' else 'Panel')
        r.section(name+' roof',True);r.quad((a,-c,1.33),(b,-c,1.33),(b,-d,1.33),(a,-d,1.33),face)
        cx=(a+b)/2;cz=(c+d)/2
        r.anchor('lamp_'+name.replace(' ','_'),(cx,1.18,cz))
        bx(cx,cz,1.28,min(1.1,(b-a)*.6),.20,.065,'Diffuser')
        bx(cx,cz,1.24,min(.83,(b-a)*.4),.10,.03,'Glow')
    def lengthwall(x,z0,z1,gaps=(),portholes=()):
        edges=sorted({z0,z1,*[q for ab in gaps for q in ab],*[q for a,b in portholes for q in (a,b)]})
        for za,zb in zip(edges,edges[1:]):
            mid=(za+zb)/2
            if any(a<mid<b for a,b in gaps):low=.97
            elif any(a<mid<b for a,b in portholes):
                r.side(x,-zb,-za,-.97,.02,face);low=.85
                r.glaze('canopy_deck_'+str(len(r.windows)),[(x,-za,.02),(x,-zb,.02),(x,-zb,.85),(x,-za,.85)])
                for z in [za,zb]:bx(x,z,.44,.065,.06,.87,'Trim',.015)
                for y in [.015,.86]:bx(x,mid,y,.065,zb-za,.061,'Trim',.012)
            else:low=-.97
            r.side(x,-zb,-za,low,1.33,face)
    def endwall(z,a,b,gap=None):
        if gap:
            r.back_panel(a,gap[0],-.97,1.33,-z,face);r.back_panel(gap[1],b,-.97,1.33,-z,face)
            r.back_panel(gap[0],gap[1],gap[2],1.33,-z,face)
        else:r.back_panel(a,b,-.97,1.33,-z,face)
    r.section('Hall bulkheads')
    lengthwall(-.9,.7,7.2,[(3.,4.2)]);lengthwall(.9,.7,7.2,[(2.5,3.7)])
    endwall(.70,-.9,.9,(-.42,.42,.62))
    r.section('Cabin glazing');lengthwall(-4.4,1.4,5.8,portholes=[(1.95,2.75),(3.15,3.95),(4.35,5.15)])
    endwall(1.4,-4.4,-.9);endwall(5.8,-4.4,-.9)
    r.section('Galley walls');lengthwall(4.,1.4,5.,portholes=[(3.,3.8)]);endwall(1.4,.9,4);endwall(5.,.9,4)
    r.section('Freight bulkheads');endwall(7.2,-3.4,3.4,(-.90,.90,1.0));endwall(14.2,-3.4,3.4,(-.8,.8,.95))
    for x in [-3.4,3.4]:lengthwall(x,7.2,14.2)
    r.section('Engine bulkheads');endwall(19.,-2.4,2.4)
    for x in [-2.4,2.4]:lengthwall(x,14.2,19.)
    r.section('Passenger furniture')
    for i in range(4):
        z=1.95+i*1.15;r.anchor('passenger_'+str(i+1),(-3.8,0,z))
        bx(-3.82,z,-.565,.60,.66,.13,'Leather',.055)
        bx(-4.13,z,-.14,.11,.69,.86,'Upholstery',.045)
        pipe((-3.79,-.97,z),(-3.79,-.62,z),.105,'Steel')
        if k in ['manatee','empress']:bx(-4.12,z,.37,.15,.52,.23,'Leather',.064)
    r.section('Galley furnishings')
    bx(2.45,4.67,-.52,2.62,.57,.89,face)
    bx(2.45,4.66,-.055,2.68,.65,.085,'Trim')
    bx(3.64,2.95,-.57,.60,1.86,.45,'Leather',.08);bx(3.65,2.17,-.30,.51,.34,.13,'Pale',.05)
    r.section('Reactor')
    r.anchor('reactor',(0,.18,16.6));pipe((0,-.95,16.6),(0,-.72,16.6),.88,'Frame')
    pipe((0,-.72,16.6),(0,1.12,16.6),.48,'Glow');pipe((0,1.11,16.6),(0,1.29,16.6),.88,'Frame')
    for i in range(6):
        a=i*math.pi/3;x=.78*math.cos(a);z=16.6+.78*math.sin(a)
        pipe((x,-.72,z),(x,1.1,z),.059,'Trim')
    r.section('Ship-specific construction')
    if k=='rustbucket':
        for z in [1.38,4.55,6.64]:
            r.wire([(-.81,-z,.77),(-.64,-z,1.14),(.66,-z,1.14),(.82,-z,.78)],.075,'Steel',False)
        for j in range(3):pipe((2.25,-.54+j*.22,14.65),(2.25,-.54+j*.22,18.45),.085,'Trim')
        for x in [-3.12,3.12]:
            for z in [8.1,10.2,12.5]:
                pipe((x,-.65,z),(x,.83,z),.21,'Steel')
        bx(2.4,4.64,.15,.42,.38,.32,'Steel');r.ring(2.57,-4.52,.15,.09,.021,'Trim')
    elif k=='dromedary':
        for z in [1.30,4.60,6.72,7.8,10.6,13.65]:
            w=.78 if z<7 else 3.22
            bx(-w,z,.05,.13,.14,2.05,'Trim');bx(w,z,.05,.13,.14,2.05,'Trim');bx(0,z,1.11,w*2,.15,.16,'Frame')
        for i in range(6):
            bx(-3.23,7.94+i*1.0,.06,.19,.80,1.28,'Pale')
            bx(-3.10,7.94+i*1.0,-.06,.08,.40,.08,'Trim')
        for x in [1.55,2.38,3.22]:bx(x,4.82,.63,.69,.25,.6,'Panel')
    elif k=='stoat':
        for z in [1.37,4.58,6.7]:
            r.wire([(-.81,-z,.63),(-.56,-z,1.12),(0,-z,1.24),(.56,-z,1.12),(.81,-z,.63)],.047,'Trim')
        for x in [-3.19,3.19]:
            r.wire([(x,-7.48,-.51),(x*.98,-10.19,.15),(x,-13.93,.65)],.063,'Trim')
            r.wire([(x,-7.48,-.46),(x*.98,-10.19,.20),(x,-13.93,.70)],.019,'Glow')
        for side in [-1,1]:
            r.box((side*1.9,-17.4,.56),(.19,2.4,.24),'Pale',.075,rot=(.16,0,0))
        for z in [2.45,3.0,3.55]:bx(3.91,z,-.13,.10,.17,.19,'Trim')
    elif k=='manatee':
        for z in [1.30,4.55,6.72]:
            r.wire([(-.82,-z,.70),(-.7,-z,1.03),(0,-z,1.23),(.7,-z,1.03),(.82,-z,.70)],.062,'Wood')
        for z in [2.35,3.55,4.75]:
            for kx in [-4.28,-.99]:bx(kx,z,.84,.08,.74,.13,'Trim')
        for x in [-3.24,3.24]:
            for z in [8.15,10.48,12.83]:bx(x,z,.12,.18,1.8,1.7,'Wood',.075)
        for x in [1.60,2.26,2.92]:
            pipe((x,.02,4.63),(x,.22,4.63),.095,'Pale')
        for h in [-.50,.15,.8]:pipe((-2.26,h,14.6),(-2.26,h,18.8),.069,'Trim')
    else:
        for z in [1.28,4.62,6.72,8.1,11.,13.72]:
            w=.81 if z<7 else 3.23
            for side in [-1,1]:
                r.wire([(side*w,-z,-.57),(side*w,-z,.42),(side*w*.83,-z,1.02),(side*w*.43,-z,1.19)],.074,'Pale')
                r.wire([(side*w*.98,-z,.05),(side*w*.94,-z,.63),(side*w*.74,-z,1.025)],.019,'Glow')
        for z in [2.35,3.55,4.75]:bx(-4.28,z,.92,.08,.80,.06,'Glow')
        for h in [-.55,.38,.89]:
            r.wire([(.88*math.cos(a*math.pi/12),-16.6+.88*math.sin(a*math.pi/12),h) for a in range(25)],.037,'Pale',False)
    r.section('Deck wear')
    for i in range(6):bx(-.68+i*.045,6.12+i*.08,-.966,.11,.019,.004,'Wear',.001)
    for n,pt in FAULTS.items():r.anchor('fault_'+n,pt)
    r.anchor('cockpit_door',(0,-.175,.68));r.anchor('cargo_aisle',(0,-.97,10.6))
    for n,p,a in [('corridor',(0,-1.13,.62),(0,-6.7,.29)),('cabin',(-1.19,-3.60,.62),(-4.35,-3.55,.08)),
                  ('galley',(1.05,-2.77,.62),(3.10,-4.4,.02)),('hold',(0,-7.52,.62),(.15,-13.65,.20)),
                  ('engine',(0,-14.35,.62),(.07,-17.05,.18))]:
        cam=camera(bpy.context.scene,n,p,a);cam.data.lens=18;cam.data.clip_start=.02;r.cams[n]=cam
    cam=camera(bpy.context.scene,'overview',(14,-22,16.5),(0,-9.9,0));cam.data.type='ORTHO';cam.data.ortho_scale=22;r.cams['overview']=cam
    r.finish()
