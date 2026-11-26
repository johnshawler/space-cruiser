"""Room dressing for the five walkable decks: the repairs, lamps and clutter in docs/ship-interiors/briefs.md.

Everything is placed in game coordinates (x right, y up, z aft) and kept out of the walking rectangles in
src/09-walk.js, off the seven repair spots and their status screens, and off the signs the game hangs itself.
Hand-lettered boards are drawn by the game (DECK_NOTES in src/09-walk.js), not modelled here."""
import math,bpy
from mathutils import Vector
F=-.97
# a wall face: (axis it is square to, where it stands, which way is into the room)
CP=('x',-.9,1);CS=('x',.9,-1)                                             # corridor, port and starboard
KI=('x',-.9,-1);KO=('x',-4.4,1);KF=('z',1.4,1);KA=('z',5.8,-1)            # passenger cabin
GF=('z',1.4,1);GA=('z',5.,-1);GI=('x',.9,1);GO=('x',4.,-1)                # galley
BF=('z',5.8,1);BA=('z',7.2,-1)                                            # scrubber bay
AL=('z',5.26,1);AA=('z',7.2,-1);AI=('x',.9,1);AP=('x',2.9,-1);AQ=('x',2.9,1);AO=('x',4.,-1)   # airlock
HF=('z',7.2,1);HA=('z',14.2,-1);HP=('x',-3.4,1);HS=('x',3.4,-1)           # hold
EF=('z',14.2,1);EA=('z',19.,-1);EP=('x',-2.4,1);ES=('x',2.4,-1)           # engine room
LO=('x',-3.4,1);RO=('x',3.4,-1)                                           # service alleys, outer walls
def dress(r,k,ROOMS,rich=False):
    G=lambda x,y,z:(x,-z,y)
    def low():r.section('Dressing')
    def top():r.section('Overhead dressing',True)
    def b(x,y,z,w,h,d,m,bev=.012,yaw=0,rx=0,ry=0):
        if bev<.01 or min(w,h,d)<.05:bev=0     # small parts stay sharp: a bevel there only costs triangles
        return r.box(G(x,y,z),(w,d,h),m,bev,rot=(rx,ry,yaw) if (rx or ry or yaw) else None)
    def rod(p,q,rad,m,n=8,r2=None):return r.rod(G(*p),G(*q),rad,m,r2,n)
    def ball(p,s,m):return r.ball(G(*p),(s[0],s[2],s[1]),m)
    def ring(p,R,t,m,axis='y',seg=14):
        rot={'y':(0,0,0),'x':(0,math.pi/2,0),'z':(math.pi/2,0,0)}[axis]
        bpy.ops.mesh.primitive_torus_add(major_segments=seg,minor_segments=5,location=G(*p),rotation=rot,major_radius=R,minor_radius=t)
        return r.put(bpy.context.object,m)
    def wire(pts,rad,m,smooth=True):return r.wire([G(*p) for p in pts],rad,m,smooth)
    # ---- shape tools, so props are turned and draped instead of stacked from blocks
    def turn(x,y,z,prof,m,n=14):
        """Turn a profile [(radius,height),...] round an upright axis. Smooth sides, flat ends; a profile that
        comes back down the inside makes a hollow vessel."""
        vs=[];fs=[];rings=[]
        for r_,h in prof:
            rings.append(len(vs))
            for i in range(n):a=2*math.pi*i/n;vs.append(G(x+r_*math.cos(a),y+h,z+r_*math.sin(a)))
        for j in range(len(prof)-1):
            if prof[j]==prof[j+1]:continue
            for i in range(n):a=rings[j]+i;c=rings[j]+(i+1)%n;fs.append((a,a+n,c+n,c))
        for j,rev in((0,False),(len(prof)-1,True)):
            s0=len(vs);vs.extend(vs[rings[j]:rings[j]+n]);idx=list(range(s0,s0+n));fs.append(tuple(idx[::-1] if rev else idx))
        return r.mesh(vs,fs,m,smooth=True)
    def sheet(rows,m,face):
        """A smooth sheet through a grid of points, facing the given direction."""
        nr=len(rows);nc=len(rows[0]);vs=[G(*p) for row in rows for p in row]
        fs=[(j*nc+i,j*nc+i+1,(j+1)*nc+i+1,(j+1)*nc+i) for j in range(nr-1) for i in range(nc-1)]
        k0=(nr//2-1)*nc+nc//2-1;a,c,d=Vector(vs[k0]),Vector(vs[k0+1]),Vector(vs[k0+nc])
        if (c-a).cross(d-a).dot(Vector(G(*face)))<0:fs=[f[::-1] for f in fs]
        return r.mesh(vs,fs,m,smooth=True)
    def lump(x,z,w,h,d,m,y=F,ripple=.03,n=9):
        """Cloth lying over something: a soft-topped mound with steep sides and a few wrinkles."""
        rows=[]
        for j in range(n):
            v=j/(n-1)*2-1;row=[]
            for i in range(n):
                u_=i/(n-1)*2-1;q=(max(0,1-u_**4)*max(0,1-v**4))**.5
                row.append((x+u_*w/2,y+(h+ripple*math.sin(5*u_+3*v))*q,z+v*d/2))
            rows.append(row)
        return sheet(rows,m,(0,1,0))
    # ---- things fixed to a wall face: u runs along the wall, o is the stand-off from it
    def wp(f,u,y,o):a,c,s=f;return (c+s*o,y,u) if a=='x' else (u,y,c+s*o)
    def drape(f,u,y,w,h,m,folds=3,dep=.05,o=.012,nc=13,nr=6):
        """Cloth hanging on a wall from a line at height y: gathered at the top, folds deepening toward the hem."""
        rows=[]
        for j in range(nr):
            t=j/(nr-1);row=[]
            for i in range(nc):
                q=i/(nc-1);edge=math.sin(math.pi*q)**.35
                row.append(wp(f,u+(q-.5)*w*(.86+.14*t),y-t*h,edge*(o+dep*(.35+.65*t)*(.55+.45*math.sin(folds*2*math.pi*q+1.3*t)))))
            rows.append(row)
        return sheet(rows,m,(f[2],0,0) if f[0]=='x' else (0,0,f[2]))
    def wb(f,u,y,o,wu,h,dep,m,bev=.008):
        x,yy,z=wp(f,u,y,o+dep/2)
        return b(x,yy,z,dep if f[0]=='x' else wu,h,wu if f[0]=='x' else dep,m,bev)
    def wr(f,u,y,o0,o1,rad,m,n=8,r2=None):return rod(wp(f,u,y,o0),wp(f,u,y,o1),rad,m,n,r2)
    def wl(f,u0,y0,u1,y1,o,rad,m,n=6):return rod(wp(f,u0,y0,o),wp(f,u1,y1,o),rad,m,n)
    def wring(f,u,y,o,R,t,m,seg=14):return ring(wp(f,u,y,o),R,t,m,f[0],seg)
    def bolts(f,u,y,w,h,o,m='Steel'):
        for du in(-1,1):
            for dy in(-1,1):wr(f,u+du*(w/2-.04),y+dy*(h/2-.04),o,o+.012,.018,m,6)
    def patch(f,u,y,w,h,m,o=0,t=.018,bm='Steel'):wb(f,u,y,o,w,h,t,m,.004);bolts(f,u,y,w,h,o+t,bm)
    def hood(f,u,y,dep=.14,lid=True):      # the steel bezel round a repair spot's status screen
        wb(f,u,y+(.17 if lid else -.17),0,.82,.024,dep,'Steel',.004)
        for d in(-.4,.4):wb(f,u+d,y,0,.024,.34,dep-.02,'Steel',.004)
    def spot(p,m,watts):
        if m in('Glow','Diffuser','Signal'):r.lampspots.append((p,'#ff3a24' if m=='Signal' else None,watts*(.4 if m=='Signal' else 1)))
    def cage(f,u,y,m='Glow'):              # a caged work lamp
        spot(wp(f,u,y,.24),m,9)
        wb(f,u,y,0,.17,.17,.025,'Panel',.006);wr(f,u,y,.025,.15,.05,m,10)
        wring(f,u,y,.16,.07,.007,'Steel',10);wring(f,u,y,.09,.07,.007,'Steel',10)
        for du,dy in((.07,0),(-.07,0),(0,.07),(0,-.07)):wr(f,u+du,y+dy,.02,.165,.006,'Steel',4)
    def shade(f,u,y,m,arm='Trim'):         # a shaded wall lamp
        wr(f,u,y,0,.15,.012,arm,6);x,yy,z=wp(f,u,y,.15);spot((x,yy-.12,z),'Glow',7)
        rod((x,yy-.05,z),(x,yy+.1,z),.12,m,12,.05);ball((x,yy-.03,z),(.045,.045,.045),'Glow')
    def dial(f,u,y,R=.1,rim='Trim',o=0,face='Pale'):
        wr(f,u,y,o,o+.03,R,rim,16);wr(f,u,y,o+.03,o+.036,R*.82,face,16)
        wb(f,u+R*.2,y+R*.25,o+.036,.012,R*.7,.004,'Rubber',0)
    def lever(f,u,y,l=.25,grip='Rubber',o=0):
        wb(f,u,y,o,.07,.1,.03,'Panel',.004);p=wp(f,u,y,o+.03);q=wp(f,u,y+l,o+.03+l*.4)
        rod(p,q,.014,'Steel',6);ball(q,(.035,.035,.035),grip)
    def board(f,u,y,w,h,m='Wood',sheet='Paper',o=0):
        wb(f,u,y,o,w,h,.02,m,.004)
        if sheet:wb(f,u,y,o+.02,w*.8,h*.8,.004,sheet,0)
    def shelf(f,u,y,w,dep=.13,m='Wood'):
        wb(f,u,y,0,w,.025,dep,m,.004)
        for d in(-1,1):wb(f,u+d*(w/2-.05),y-.06,0,.02,.1,dep*.8,'Steel',0)
    def hook(f,u,y):wr(f,u,y,0,.07,.012,'Steel',6)
    def coat(f,u,y,m,w=.34,h=.8):
        e=lambda sx,sy,sz:(sz,sy,sx) if f[0]=='x' else (sx,sy,sz)
        hook(f,u,y);drape(f,u,y-.05,w,h,m,2,.075);ball(wp(f,u,y-.06,.06),e(w*.32,.06,.055),m)
    def picture(f,u,y,w,h,frame='Wood',inner='Paper',o=0):
        wb(f,u,y,o,w,h,.025,frame,.006);wb(f,u,y,o+.025,w-.08,h-.08,.004,inner,0)
    def suit(f,u,y,m,knees=None,w=.5):     # an empty pressure suit hung on a wall, collar at y: rounded limbs, gloves and boots
        e=lambda sx,sy,sz:(sz,sy,sx) if f[0]=='x' else (sx,sy,sz)
        ball(wp(f,u,y-.33,.08),e(w*.5,.34,.085),m);ball(wp(f,u,y-.6,.08),e(w*.46,.14,.08),m)
        for d in(-1,1):
            ball(wp(f,u+d*w*.42,y-.12,.08),e(.08,.08,.07),m)
            rod(wp(f,u+d*w*.42,y-.12,.08),wp(f,u+d*(w*.5+.1),y-.62,.07),.065,m,8,.05);ball(wp(f,u+d*(w*.5+.1),y-.66,.07),e(.055,.07,.05),'Rubber')
            rod(wp(f,u+d*.12,y-.62,.08),wp(f,u+d*.14,y-1.32,.08),.09,m,8,.075);ball(wp(f,u+d*.14,y-1.36,.1),e(.08,.06,.11),'Rubber')
            if knees:ball(wp(f,u+d*.13,y-.98,.13),e(.07,.08,.04),knees)
        wring(f,u,y-.02,.08,.12,.022,'Steel',12);wr(f,u,y+.02,0,.09,.012,'Steel',6)
    def ladder(f,u,y0,y1,o=.03,w=.36):
        for d in(-1,1):wl(f,u+d*w/2,y0,u+d*w/2,y1,o,.018,'Steel')
        for i in range(1,int((y1-y0)/.28)+1):wl(f,u-w/2,y0+i*.28,u+w/2,y0+i*.28,o,.013,'Steel')
    def pennants(f,u0,u1,y,mats):
        n=len(mats);wl(f,u0,y+.05,u1,y+.05,.01,.006,'Rubber',4)
        for i,m in enumerate(mats):wr(f,u0+(i+.5)*(u1-u0)/n,y-.03,0,.012,.09,m,3)
    def slab(f,u,w,h=1.9,m='Panel',kick='Wear',latch=1,o=.012):   # a slider parked open beside its doorway
        wb(f,u,F+h/2+.02,o,w,h,.04,m,.008);wb(f,u,F+.2,o+.04,w-.08,.3,.008,kick,0)
        wb(f,u+latch*(w/2-.1),0,o+.04,.05,.24,.04,'Trim',.01)
        wl(f,u-w/2-.05,F+h+.08,u+w/2+.05,F+h+.08,.05,.02,'Steel')
        for d in(-1,0,1):wb(f,u+d*w/2,F+h+.08,0,.04,.07,.06,'Steel',0)
    def grille(m,bars,n=6,across=False):   # the vent in the cabin's aft wall, looking into the scrubber bay
        for dy in(-.2,.2):wb(KA,-3.,.95+dy,0,.74,.04,.03,m,.004)
        for du in(-.35,.35):wb(KA,-3.+du,.95,0,.04,.44,.03,m,.004)
        wb(KA,-3.,.95,0,.68,.38,.008,'Rubber',0)
        for i in range(n):
            t=(i+.5)/n-.5
            if across:wl(KA,-3.33,.95+t*.38,-2.67,.95+t*.38,.02,.008,bars,4)
            else:wl(KA,-3.+t*.66,.77,-3.+t*.66,1.13,.02,.008,bars,4)
    # ---- things that stand on the floor or on a surface at height y
    def mug(x,y,z,m='Pale'):turn(x,y,z,[(.036,0),(.045,.012),(.045,.1),(.037,.1),(.035,.02)],m,10);ring((x+.052,y+.052,z),.028,.008,m,'z',8)
    def bucket(x,z,m='Steel',fill=None,y=F):
        turn(x,y,z,[(.1,0),(.15,.28),(.135,.28),(.135,.25)] if fill else [(.1,0),(.15,.28),(.135,.28),(.09,.02)],m,12)
        if fill:turn(x,y,z,[(.134,.2),(.134,.25)],fill,12)
        wire([(x-.15,y+.27,z),(x-.1,y+.36,z+.02),(x+.1,y+.36,z+.02),(x+.15,y+.27,z)],.006,'Steel')
    def books(x,y,z,n=4,along='x'):
        cols=['Signal','Moss','Paper','Upholstery','Trim']
        for i in range(n):
            if along=='x':b(x+i*.05,y+.09+.01*(i%2),z,.04,.17+.02*(i%2),.12,cols[i%5],.004)
            else:b(x,y+.09+.01*(i%2),z+i*.05,.12,.17+.02*(i%2),.04,cols[i%5],.004)
    def stack(x,y,z,n,w,d,t,mats,jit=.02):
        for i in range(n):b(x+jit*((i*7)%3-1),y+t*(i+.5),z+jit*((i*5)%3-1),w,t*.9,d,mats[i%len(mats)],.004)
    def crate(x,z,w,h,d,m='Wood',y=F,trim='Steel'):   # battens on the faces that look into the room
        b(x,y+h/2,z,w,h,d,m,.015)
        for sx in(-1,1):
            for sz in(-1,1):b(x+sx*(w/2+.005),y+h/2,z+sz*(d/2-.04),.014,h-.02,.07,'Wear',0)
            b(x+sx*(w/2+.004),y+h/2,z,.012,.07,d*1.25,'Wear',0,rx=sx*math.atan2(h-.1,d-.1))
        if trim:b(x,y+h-.03,z,w+.02,.04,d+.02,trim,.004)
    def rug(x,z,w,d,m,edge=None):
        if edge:b(x,F+.004,z,w,.008,d,edge,0);b(x,F+.008,z,w-.16,.008,d-.16,m,0)
        else:b(x,F+.005,z,w,.01,d,m,0)
    def stool(x,z,m='Leather',leg='Steel',h=.45):
        turn(x,F,z,[(.17,0),(.15,.025),(.035,.045),(.03,h)],leg,10);turn(x,F+h,z,[(.15,0),(.18,.02),(.18,.05),(.13,.08),(.03,.085)],m,14)
    def plant(x,y,z,pot='Trim'):
        turn(x,y,z,[(.07,0),(.11,.16),(.095,.16),(.09,.13)],pot,12)
        for dx,dy,dz,rr in((0,.3,0,.15),(.08,.24,.05,.1),(-.07,.26,-.06,.11),(.02,.4,-.03,.09)):ball((x+dx,y+dy,z+dz),(rr,rr*.9,rr),'Moss')
    def helmet(x,y,z,m='Pale',visor='Rubber',fx=0,fz=-1):
        ball((x,y+.15,z),(.16,.16,.16),m);ball((x+fx*.07,y+.16,z+fz*.07),(.12,.09,.12),visor);ring((x,y+.03,z),.11,.022,'Steel','y',12)
    def boots(x,y,z,m='Rubber'):
        for d in(-.09,.09):turn(x+d,y,z,[(.05,.05),(.058,.26),(.046,.26),(.044,.2)],m,10);ball((x+d,y+.05,z-.05),(.058,.05,.11),m)
    def tarp(x,z,w,h,d,m='Upholstery'):lump(x,z,w+.14,h,d+.16,m,ripple=.04)
    def pendant(x,z,y,m):                  # a shaded lamp hanging from the ceiling, rim at y
        spot((x,y-.08,z),'Glow',12)
        rod((x,1.33,z),(x,y+.14,z),.008,'Rubber',4);rod((x,y,z),(x,y+.15,z),.15,m,12,.04);ball((x,y+.03,z),(.05,.05,.05),'Glow')
    def flamp(x,z,m,h=1.45):               # a standing lamp
        spot((x,F+h-.1,z),'Glow',10)
        rod((x,F,z),(x,F+.03,z),.13,'Trim',10);rod((x,F,z),(x,F+h,z),.015,'Trim',6)
        rod((x,F+h-.02,z),(x,F+h+.2,z),.17,m,12,.09);ball((x,F+h+.02,z),(.05,.05,.05),'Glow')
    def tlamp(x,y,z,m):                    # a table lamp
        spot((x,y+.12,z),'Glow',5)
        ball((x,y+.05,z),(.06,.05,.06),'Trim');rod((x,y+.05,z),(x,y+.2,z),.012,'Trim',6)
        rod((x,y+.17,z),(x,y+.32,z),.12,m,12,.06);ball((x,y+.2,z),(.04,.04,.04),'Glow')
    def htruck(x,z,m='Signal',odd=None):   # a hand truck leaning aft
        for d in(-.16,.16):rod((x+d,F+.12,z),(x+d,F+1.15,z+.3),.018,m,6)
        for t in(.25,.6,1.):rod((x-.16,F+.12+t*1.03,z+t*.3),(x+.16,F+.12+t*1.03,z+t*.3),.014,m,6)
        b(x,F+.03,z-.12,.38,.02,.24,'Steel',.004)
        rod((x-.24,F+.11,z+.02),(x-.18,F+.11,z+.02),.11,'Rubber',10)
        rod((x+.18,F+.15 if odd else F+.11,z+.02),(x+.24,F+.15 if odd else F+.11,z+.02),.15 if odd else .11,odd or 'Rubber',10)
    def hoist(z,m='Steel'):                # an I-beam down the hold with a chain hoist
        top();b(0,1.24,10.7,.05,.1,6.6,m,0)
        for y in(1.19,1.29):b(0,y,10.7,.22,.02,6.6,m,0)
        b(0,1.12,z,.26,.12,.3,'Panel',.02);low()
        rod((0,1.06,z),(0,.98,z),.012,'Steel',4);ring((0,.93,z),.05,.012,'Steel','x',10)
    def console(m,top_m,levers=0,grip='Rubber'):   # under the game's three dials on the engine room's aft wall
        b(1.,-.52,18.7,2.2,.9,.5,m,.03);b(1.,-.06,18.72,2.24,.03,.5,top_m,.008)
        for i in range(levers):
            x=.1+i*1.8/max(1,levers-1);rod((x,-.05,18.78),(x,.17,18.7),.014,'Steel',6);ball((x,.17,18.7),(.04,.04,.04),grip)
    def chair(kind,m='Leather'):           # the engine room seat: Interior.OBST keeps you from walking through it
        cx,cz=-1.55,18.2
        if kind=='deck':
            for d in(-.24,.24):
                rod((cx-.3,F,cz+d),(cx+.25,F+.5,cz+d),.018,'Wood',6);rod((cx+.3,F,cz+d),(cx-.4,F+.95,cz+d),.018,'Wood',6)
            b(cx+.05,F+.36,cz,.42,.02,.46,m,.004,ry=.25);b(cx-.24,F+.66,cz,.02,.56,.46,m,.004,ry=.6)
        elif kind=='stool':
            stool(cx,cz,m,'Steel',.5)
            for a in range(5):p=(cx+.2*math.cos(a*1.257),F+.035,cz+.2*math.sin(a*1.257));rod((cx,F+.07,cz),p,.012,'Steel',4);ball(p,(.035,.035,.035),'Rubber')
        elif kind=='crate':crate(cx,cz,.62,.5,.62,'Wood');b(cx,F+.25,cz-.32,.4,.16,.008,'Paper',0)
        else:
            b(cx,F+.3,cz,.6,.3,.6,m,.08);b(cx-.27,F+.62,cz,.16,.6,.6,m,.07)
            for d in(-.3,.3):b(cx,F+.5,cz+d,.55,.22,.14,m,.06)
            if kind=='throne':
                b(cx-.3,F+1.,cz,.1,1.3,.5,'Pale',.05);b(cx+.03,F+.56,cz,.4,.2,.22,'Signal',.02);wire([(cx-.1,F+.66,cz),(cx+.03,F+.76,cz),(cx+.16,F+.66,cz)],.012,'Steel')
    def gasket(m):                         # what the crew packed round the airlock's inner hatch
        for u in(5.63,6.57):wl(AP,u,F,u,.97,.02,.035,m,8)
        wl(AP,5.6,.99,6.6,.99,.02,.035,m,8)
    def scrub_cab(m,w=1.5,h=1.2,u=-2.55):  # the scrubber's body, against the bay's fore wall under the fan
        wb(BF,u,F+h/2,0,w,h,.18,m,.02)
    low()
    # ---- on every hull: bezels at the seven repair spots, covers on the ceiling lamps, sliders, worn thresholds
    for f,u,y,d in [(KF,-2.95,.07,.14),(GF,2.5,1.03,.16),(BF,-2.15,.83,.14),(EA,.5,.8,.14),(AP,5.37,.95,.18),(('x',1.53,-1),10.85,.65,.1)]:hood(f,u,y,d)
    hood(CP,5.10,.28,.1,False);b(1.57,-.2,10.85,.05,1.55,.05,'Steel',.004)
    top()
    for name,(a,bb,c,d) in ROOMS.items():
        cx=(a+bb)/2;cz=(c+d)/2;w=min(1.1,(bb-a)*.6)
        if name in('passenger cabin','galley'):      # living rooms: a fabric shade
            for s in(-1,1):b(cx,1.24,cz+s*.15,w+.14,.18,.014,'Upholstery',.004);b(cx+s*(w/2+.07),1.24,cz,.014,.18,.3,'Upholstery',.004)
        else:                                         # working rooms: a wire cage
            for dz in(-.1,0,.1):rod((cx-w/2-.03,1.2,cz+dz),(cx+w/2+.03,1.2,cz+dz),.007,'Steel',4)
            for i in range(5):
                x=cx-w/2-.03+i*(w+.06)/4;b(x,1.2,cz,.012,.012,.24,'Steel',0)
                for dz in(-.12,.12):b(x,1.26,cz+dz,.012,.13,.012,'Steel',0)
    low()
    door={'rustbucket':'Panel' if rich else 'Steel','dromedary':'Panel','stoat':'Panel','manatee':'Wood','empress':'Pale'}[k]
    slab(KI,4.83,1.15,m=door,latch=-1);slab(GI,4.3,1.1,m=door,latch=-1)
    for s in(-1,1):slab(HF,s*1.4,.95,1.95,door,latch=-s)
    slab(EF,1.55,1.4,m=door,latch=-1)
    for x,z,w,d in [(-.9,3.6,.3,1.1),(.9,3.1,.3,1.1),(0,7.2,1.7,.3),(0,14.2,1.5,.3),(-.9,6.5,.3,.9),(.9,6.1,.3,.9),(-2.4,15.1,.3,.9),(2.4,15.1,.3,.9)]:
        b(x,F+.004,z,w,.008,d,'Panel' if rich else 'Frame',0)
    for u in(5.2,6.2):wr(AO,6.1+(u-5.7)*.5,(u-5.7)*.4,.15,.158,.11,'Pale',8)   # frost or damp on the outer hatch

    if rich:
        # A steel backing with stand-offs behind every sign and poster the game hangs, so none of them floats.
        # (width, height, x, y, z, quarter turns), as in Interior.decor in src/09-walk.js
        signs=[(.95,.28,.855,1.14,6.1,-1),(.95,.28,-.855,1.14,6.5,1),(.95,.28,2.355,1.14,15.1,-1),(.95,.28,-2.355,1.14,15.1,1),(.5,.3,-.805,.5,1.5,1),
               (1.3,.42,0,1.06,.745,0),(1.1,.32,-.855,1.14,3.6,1),(1.1,.32,.855,1.14,3.1,-1),(1.7,.3,0,1.165,7.155,2),(1.7,.3,0,1.165,7.245,0),
               (1.5,.34,0,1.14,14.155,2),(1.5,.34,0,1.14,14.245,0),(1.1,.32,-.945,1.14,3.6,-1),(1.1,.32,.945,1.14,3.1,1)]
        signs+=[(.34,.13,-3.862,1.16,1.95+i*1.15,1) for i in range(4)]
        for w,h,x,y,z,q in signs:
            y=min(y,1.21-h/2);nx,nz=((0,1),(1,0),(0,-1),(-1,0))[q%4];t=.03
            b(x+nx*.05,y,z+nz*.05,(w+.07) if nz else t,h+.07,t if nz else (w+.07),'Panel',0)
            for d in(-1,1):
                px=x+(d*(w/2-.08) if nz else 0);pz=z+(d*(w/2-.08) if nx else 0)
                if abs(x)>3:rod((px,y+h/2,pz+.0),(px,1.33,pz),.008,'Steel',4)      # the seat numbers hang from the roof
                else:rod((px,y,pz),(px+nx*.05,y,pz+nz*.05),.014,'Steel',6)
        for w,h,x,y,z,q in [(.58,.8,-2.15,.35,1.447,0),(.58,.8,-2.15,.35,5.753,2),(.48,.64,1.78,.35,1.447,0),(.55,.74,-1.45,.5,18.955,2)]:
            nz=1 if q==0 else -1;b(x,y,z+nz*.04,w+.08,h+.08,.036,'Wood',0)

    if k=='rustbucket':
        # corridor: service spine, a railing for an arch, a belted cable tray, caged lamps, coat, bucket, tally board
        top();rod((0,1.27,.8),(0,1.27,7.1),.04,'Trim')
        for x in(-.35,.35):b(x,1.29,3.95,.16,.03,6.3,'Steel',0)
        for y in(1.16,1.06):rod((-.84,y,2.9),(.84,y,2.9),.022,'Steel',6)
        for i in range(7):rod((-.72+i*.24,1.06,2.9),(-.72+i*.24,1.16,2.9),.012,'Steel',4)
        for x in(.26,.44):b(x,1.24,2.2,.02,.16,.05,'Leather',0)
        b(.35,1.16,2.2,.2,.02,.05,'Leather',0);b(.35,1.15,2.2,.06,.05,.06,'Trim',.004);low()
        for x in(-.84,.84):rod((x,F,2.9),(x,1.06,2.9),.022,'Steel',6)
        wring(CS,6.9,.1,.1,.16,.02,'Trim');wr(CS,6.9,.1,0,.12,.03,'Steel');ball(wp(CS,7.06,.1,.14),(.035,.035,.035),'Rubber')
        for a in range(3):wl(CS,6.9-.15*math.cos(a*1.05),.1-.15*math.sin(a*1.05),6.9+.15*math.cos(a*1.05),.1+.15*math.sin(a*1.05),.1,.01,'Trim',4)
        patch(CP,4.5,.55,.34,.44,'Wear');wr(CP,4.5,.55,.018,.03,.03,'Trim',6)
        cage(CS,2.25,.95);cage(CS,4.3,.95);cage(CP,2.4,.95);p=wp(CP,2.4,1.03,.1);rod((p[0],p[1],p[2]),(p[0],p[1]+.1,p[2]),.17,'Pale',12,.06)
        b(.74,F+.07,1.,.2,.02,.05,'Steel',0)
        for d in(-.1,.1):b(.74+d,F+.04,1.,.02,.08,.07,'Steel',0)
        board(CS,5.05,.3,.5,.6,'Rubber',None)
        for i in range(7):wb(CS,4.87+i*.06,.38,.02,.015,.16,.004,'Paper',0)
        wb(CS,1.6,-.62,0,.12,.28,.006,'Rubber',.004);wb(CS,1.6,-.83,0,.1,.09,.006,'Rubber',.004)
        coat(CP,2.5,.75,'Wear');bucket(.74,6.9,'Signal','Wear');b(.74,F+.3,6.9,.05,.02,.24,'Steel',.004,yaw=.5)
        # passenger cabin: radiator, collared pipe over a bucket, crate-lid floor patch, baking-rack grille
        for i in range(7):b(-1.66+i*.08,-.62,1.55,.05,.6,.2,'Steel',.02)
        rod((-1.9,-.35,1.52),(-1.7,-.35,1.52),.05,'Trim');rod((-2.55,-.35,1.52),(-2.32,-.35,1.52),.11,'Trim',12);bucket(-2.44,1.56)
        b(-2.3,F+.012,2.6,.7,.02,.6,'Wood',.004)
        for dz in(-.24,.24):b(-2.3,F+.03,2.6+dz,.7,.02,.08,'Wear',.004)
        b(-2.3,F+.026,2.6,.05,.008,.3,'Rubber',0);b(-2.3,F+.026,2.72,.2,.008,.05,'Rubber',0)
        grille('Steel','Steel',7)
        for du in(-.35,.35):
            for dy in(-.2,.2):ball(wp(KA,-3.+du,.95+dy,.04),(.03,.03,.02),'Trim')
        flamp(-1.05,5.62,'Upholstery');ring((-1.05,F+1.42,5.62),.17,.012,'Signal');wl(KA,-1.05,.2,-1.05,.0,.1,.006,'Steel',4)
        rug(-2.15,4.1,1.5,2.2,'Upholstery','Signal')
        shelf(KI,2.4,.1,.9);books(*wp(KI,2.1,.113,.065),6,'z');wl(KI,1.98,.22,2.82,.22,.125,.008,'Signal',4)
        p=wp(KI,2.68,.113,.065);rod(p,(p[0],p[1]+.1,p[2]),.055,'Signal',10);rod((p[0],p[1]+.1,p[2]),(p[0],p[1]+.115,p[2]),.058,'Trim',10)
        picture(KA,-1.4,.5,.5,.4,'Wood','Wear')
        b(-3.82,-.49,4.25,.62,.03,.68,'Moss',.01);b(-4.06,-.1,4.25,.03,.72,.7,'Moss',.01)
        # scrubber bay: drum fan on a braces belt, blanket filter, roasting-tin drip tray, red pilot lamp
        scrub_cab('Panel',1.3,1.1,-2.6);wr(BF,-2.75,-.3,.18,.2,.42,'Steel',20);wr(BF,-2.75,-.3,.2,.23,.1,'Trim',10)
        wb(BF,-2.75,-.86,.02,.9,.14,.2,'Wear',.01);wr(BF,-1.75,-.3,0,.2,.12,'Steel',12)
        for dy in(-.1,.1):wl(BF,-2.75,-.3+dy,-1.75,-.3+dy*.9,.21,.012,'Signal',4)
        ball(wp(BF,-2.25,-.21,.21),(.04,.03,.03),'Signal')
        drape(BF,-1.7,-.46,.52,.46,'Upholstery',3,.09);b(-1.72,F+.03,5.91,.46,.06,.2,'Steel',.01)
        rod((-3.,.3,5.9),(-3.,.72,5.9),.07,'Steel');cage(BF,-1.42,.2,'Signal')
        shelf(BA,-2.9,-.2,.7);p=wp(BA,-3.05,-.187,.065);rod(p,(p[0],p[1]+.2,p[2]),.06,'Pale',10);rod((p[0],p[1]+.2,p[2]),(p[0],p[1]+.22,p[2]),.064,'Wear',10)
        wring(BA,-1.3,.5,.03,.16,.015,'Rubber');hook(BA,-1.3,.66)
        # galley: two-ring stove with a cotton-reel knob, rope-hinged cupboard, gimbal lamp, bulbs round the bunk
        b(3.45,-.52,1.72,.8,.9,.5,'Steel',.03)
        for x in(3.26,3.64):ring((x,-.06,1.72),.12,.02,'Rubber')
        for x in(3.08,3.82):rod((x,-.07,1.5),(x,.02,1.5),.01,'Trim',4);rod((x,-.07,1.94),(x,.02,1.94),.01,'Trim',4)
        rod((3.08,.02,1.94),(3.82,.02,1.94),.01,'Trim',4)
        rod((3.26,-.2,1.97),(3.26,-.2,2.02),.035,'Rubber');rod((3.64,-.2,1.97),(3.64,-.2,2.04),.03,'Paper');rod((3.64,-.2,2.035),(3.64,-.2,2.045),.045,'Paper')
        b(3.5,-.02,1.95,.07,.14,.015,'Signal',.004)
        wb(GF,3.1,.5,0,.16,.3,.03,'Panel',.004);wb(GF,3.1,.56,.03,.03,.2,.03,'Trim',.004);wb(GF,2.98,.1,0,.04,.24,.012,'Steel',.004)
        f2=('z',4.385,-1);wb(f2,1.75,-.5,0,.5,.6,.025,'Wood',.006)
        for dy in(-.2,.2):wring(f2,1.48,-.5+dy,.02,.04,.012,'Wear',8)
        rod((2.45,1.33,4.55),(2.45,.9,4.55),.01,'Trim',4);ring((2.45,.85,4.55),.1,.012,'Trim','z');rod((2.45,.74,4.55),(2.45,.88,4.55),.11,'Trim',12,.05);ball((2.45,.77,4.55),(.045,.045,.045),'Glow')
        for i in range(8):z=2.05+i*.26;ball(wp(GO,z,.98-.05*math.sin(i*math.pi/7),.03),(.03,.03,.03),'Glow')
        wl(GO,2.05,.99,3.87,.99,.03,.005,'Rubber',4)
        for x in(1.5,1.78):hook(GA,x,.5);p=wp(GA,x,.36,.07);mug(p[0],p[1],p[2],'Steel')
        lump(3.64,3.2,.62,.06,1.34,'Upholstery',y=-.345,ripple=.012)
        for i,m in enumerate(['Signal','Moss','Paper','Wear']):b(3.5+.26*(i%2),-.283,2.8+i*.26,.2,.008,.2,m,0)
        picture(GO,2.5,.55,.7,.5,'Wood','Paper');wring(GO,2.4,.5,.03,.07,.006,'Wear',10);wring(GO,2.62,.62,.03,.07,.006,'Wear',10)
        board(GI,1.95,.35,.34,.46,'Paper',None);wb(GI,1.95,.52,.02,.34,.1,.004,'Signal',0)
        # airlock: handwheel, two dials and a lever, inner-tube seal, coat-stand suit rack, patched suit, plant helmet
        ring((3.8,0,6.1),.42,.028,'Trim','x',20);gasket('Rubber')
        dial(AP,6.72,.55,.1);dial(AP,6.98,.55,.12,'Wear');lever(AP,6.85,.1,.28,'Signal')
        rod((1.04,F,6.97),(1.04,.75,6.97),.025,'Wood',6);rod((1.04,F,6.97),(1.04,F+.03,6.97),.13,'Wood',10)
        for a in range(3):rod((1.04,.68,6.97),(1.04+.1*math.cos(a*2.1+.5),.76,6.97+.1*math.sin(a*2.1+.5)),.012,'Wood',4)
        suit(AA,2.2,.86,'Upholstery','Signal');ball((1.5,-.45,7.03),(.16,.13,.16),'Pale');ball((1.5,-.28,7.03),(.14,.14,.14),'Moss')
        b(3.5,F+.02,7.05,.5,.04,.22,'Steel',.008);boots(3.5,F+.04,7.07);cage(AI,5.3,.95)
        # cargo hold: chain hoist, towing rope, cattle-grid grates, splinted stanchion, caged lamps, clutter
        hoist(10.2)
        for i in range(2):ring((1.64,F+.03+i*.05,10.2),.17-.02*i,.028,'Wear')
        ring((1.57,.2,10.85),.05,.02,'Wear')
        for cx,cz in((0,9.),(-.5,12.4)):
            b(cx,F+.006,cz,1.,.012,.8,'Panel',0)
            for i in range(7):rod((cx-.48,F+.025,cz-.33+i*.11),(cx+.48,F+.025,cz-.33+i*.11),.02,'Steel',6)
        b(-2.9,.1,10.2,.05,1.2,.05,'Wear',0)
        for y in(-.3,.1,.5):ring((-3.12,y,10.2),.225,.014,'Steel')
        for z in(8.6,12.6):cage(HP,z,1.);cage(HS,z,1.)
        htruck(-1.65,8.1,'Signal','Pale');stack(-1.65,F,12.6,5,.3,1.4,.05,['Wood','Wear'])
        wr(HA,-1.5,.5,0,.03,.24,'Rubber',16);wr(HA,-1.5,.5,.03,.036,.17,'Paper',16);wr(HA,-1.5,.5,.036,.042,.07,'Signal',12)
        for du,dy in((.05,.06),(-.1,-.04)):wr(HA,-1.5+du,.5+dy,.04,.14,.008,'Trim',4)
        tarp(1.65,13.,.45,.7,1.1,'Moss')
        # engine room: banded boiler with a strap for one band, lever console, lagged steam line, G-clamp, deck chair
        for y in(-.3,.55):ring((0,y,16.6),.5,.04,'Frame',seg=24)
        ring((0,.12,16.6),.5,.03,'Signal',seg=24);b(0,.12,16.07,.14,.1,.07,'Steel',.01)
        console('Frame','Steel',6)
        rod((2.25,-.1,16.6),(2.25,-.1,17.7),.125,'Paper',10)
        for z in(16.75,17.05,17.35,17.6):ring((2.25,-.1,z),.128,.01,'Wear','z',10)
        wb(EA,1.74,.98,0,.07,.07,.2,'Signal',.01);wb(EA,1.74,.62,0,.07,.07,.2,'Signal',.01);wb(EA,1.74,.8,.14,.07,.42,.06,'Signal',.01);wr(EA,1.62,.62,.05,.17,.014,'Steel',6)
        chair('deck','Signal')
        rod((-.04,-.3,18.44),(-.14,-.3,18.44),.012,'Steel',4);mug(-.14,-.42,18.44,'Steel')
        hook(EA,-.75,.95);wl(EA,-.75,.95,-.75,.55,.06,.005,'Wear',4);wb(EA,-.75,.32,.03,.035,.42,.035,'Wood',.01);wb(EA,-.75,.56,.02,.16,.08,.07,'Steel',.01)
        b(1.9,-.035,18.75,.3,.03,.2,'Steel',.004)
        for i in range(6):rod((1.8+.1*(i%3),-.02,18.7+.1*(i//3)),(1.8+.1*(i%3),-.012,18.7+.1*(i//3)),.035,'Rubber',8)
        for s in(-1,1):
            f=EP if s<0 else ES;wb(f,16.1,F+.92,.04,.85,1.84,.04,door,.008)
            cage(LO if s<0 else RO,16.6,.55);ball((s*2.9,.13,18.66),(.2,.13,.18),'Wear');ring((s*2.9,-.34,18.45),.14,.03,'Rubber')
            for i in range(3):rod((s*3.3,F,17.3+i*.12),(s*3.3,.5+i*.12,17.2+i*.12),.03,'Trim' if i%2 else 'Steel',6)
        b(-2.33,F+.02,15.64,.12,.04,.17,'Signal',.004)

    elif k=='dromedary':
        # corridor: yellow grab rails with one tow-shackle bracket, manifest rack, key board, lunch-box first-aid, chocks
        for f,spans in((CP,[(.8,2.95),(4.25,4.7)]),(CS,[(.8,2.45),(3.75,5.5)])):
            for a,c in spans:
                wl(f,a,-.05,c,-.05,.07,.022,'Trim')
                for u in(a+.05,c-.05):wb(f,u,-.05,0,.04,.04,.07,'Steel',0)
        wring(CS,4.9,-.05,.06,.05,.014,'Steel',10)
        wb(CS,1.6,.38,0,1.3,.5,.02,'Panel',.004)
        for i in range(14):wb(CS,1.06+(i%7)*.18,.5-(i//7)*.24,.02,.13,.19,.012,'Paper',.003);wb(CS,1.06+(i%7)*.18,.58-(i//7)*.24,.03,.07,.03,.012,'Steel',0)
        patch(CP,4.5,.58,.3,.36,'Trim');patch(CP,4.47,.14,.26,.2,'Wear',bm='Trim');wb(CP,4.62,.36,.02,.08,.12,.004,'Paper',0)
        b(0,F+.006,2.2,1.,.01,.8,'Moss',0)
        cage(CS,2.25,.95);cage(CS,4.3,.95);cage(CP,2.4,.95)
        board(CP,2.4,.35,.6,.4,'Panel',None)
        for i in range(10):
            u=2.16+(i%5)*.12;y=.44-(i//5)*.2;hook(CP,u,y)
            if i not in(3,8):wb(CP,u,y-.06,.05,.035,.1,.01,'Trim',0)
        wb(CS,5.05,.3,0,.34,.28,.12,'Pale',.02);wb(CS,5.05,.3,.12,.16,.05,.006,'Signal',0);wb(CS,5.05,.3,.12,.05,.16,.006,'Signal',0)
        wb(CS,4.15,-.72,0,.34,.3,.14,'Panel',.01);wb(CS,4.15,-.76,.02,.2,.16,.1,'Trim',.02);b(.72,F+.08,1.,.2,.16,.24,'Trim',.03,rx=.3)
        hook(CP,1.95,.62);ball(wp(CP,1.95,.54,.07),(.035,.045,.035),'Steel')
        wb(CP,2.92,-.2,0,.08,1.3,.006,'Paper',0)
        for i in range(5):wb(CP,2.92,-.6+i*.22,.006,.07,.012,.004,'Rubber',0)
        # passenger cabin: release handles, luggage cage wired shut, finned heater, hose bypass, mail-sack pad
        for i in range(4):b(-3.5,-.5,2.25+i*1.15,.04,.14,.05,'Trim',.01)
        top()
        for x in(-4.3,-3.95):rod((x,1.02,1.6),(x,1.02,5.6),.014,'Steel',4)
        for i in range(11):b(-4.12,1.02,1.6+i*.4,.36,.012,.012,'Steel',0)
        low()
        for i in range(3):b(-4.1,1.12,2.2+i*1.3,.3,.18,.6,['Leather','Wear','Upholstery'][i],.05)
        wire([(-3.93,1.02,3.4),(-3.9,.9,3.5),(-3.93,1.02,3.6)],.008,'Steel',False)
        for i in range(8):rod((-4.2+i*.1,-.35,1.5),(-4.2+i*.1,-.35,1.54),.13,'Steel',10)
        wire([(-2.55,-.35,1.52),(-2.5,-.8,1.6),(-2.2,-.9,1.62),(-1.95,-.6,1.56),(-1.95,-.35,1.52)],.035,'Moss')
        for x in(-2.55,-1.95):ring((x,-.37,1.52),.085,.014,'Steel','x',10)
        b(-3.82,-.49,3.1,.6,.03,.66,'Wear',.01)
        shade(KO,2.95,.95,'Trim','Steel');shade(KO,4.15,.95,'Trim','Steel')
        crate(-1.42,1.56,.5,.45,.38,'Wood');ball((-1.5,-.45,1.56),(.14,.1,.12),'Signal');b(-1.3,-.47,1.56,.16,.12,.2,'Moss',.03)
        wb(KI,2.4,-.25,0,.7,.03,.14,'Panel',.004)
        for i in range(5):b(-.97,-.228,2.14+i*.11,.07,.006,.09,'Paper',0,yaw=.2*i)
        p=wp(KI,2.68,-.235,.07);rod(p,(p[0],p[1]+.24,p[2]),.045,'Steel',10);rod((p[0],p[1]+.24,p[2]),(p[0],p[1]+.3,p[2]),.035,'Signal',10);wl(KI,2.68,-.1,2.68,.3,.01,.005,'Steel',4)
        lump(-3.82,5.4,.52,.09,.52,'Trim',y=-.5,ripple=.015);b(-3.82,-.43,5.4,.52,.012,.1,'Rubber',0)
        grille('Trim','Steel',6,True)
        # scrubber bay: three-drawer cabinet with a cardboard front, fridge-shelf fan guard, mismatched hose, RUN button
        scrub_cab('Pale',1.4,1.25,-2.55)
        for i,m in enumerate(['Panel','Wear','Panel']):wb(BF,-2.55,-.8+i*.3,.18,1.2,.24,.02,m,.006);wb(BF,-2.55,-.8+i*.3,.2,.3,.03,.03,'Steel' if i!=1 else 'Wear',.004)
        wr(BF,-2.1,.12,.18,.21,.075,'Moss',12);wb(BF,-2.85,.1,.18,.44,.3,.012,'Rubber',0)
        for i in range(5):wl(BF,-3.05+i*.1,-.04,-3.05+i*.1,.24,.2,.006,'Pale',4)
        for y in(-.04,.24):wl(BF,-3.07,y,-2.63,y,.2,.008,'Pale',4)
        wire([(-3.,.28,5.92),(-3.08,.5,5.95),(-3.,.72,5.92)],.045,'Rubber')
        ring((-3.03,.36,5.93),.055,.016,'Trim','y',10);ring((-3.05,.6,5.94),.06,.016,'Steel','y',10);ring((-3.07,.48,5.95),.05,.022,'Signal','y',10)
        cage(BA,-1.3,.95);wl(BA,-1.3,.86,-1.3,.5,.1,.005,'Paper',4);ball(wp(BA,-1.3,.48,.1),(.025,.03,.025),'Wood')
        wb(BA,-2.9,-.25,0,.6,.12,.2,'Paper',.03);p=wp(BA,-2.9,-.19,.1);mug(p[0],p[1],p[2],'Trim')
        board(BA,-1.3,.2,.4,.5,'Pale','Paper');wb(BA,-1.3,.36,.024,.26,.12,.004,'Trim',0)
        # galley: drawer bunk with a strap handle, clamped hotplate, garden tap, pegged breaker, pendant, mugs on hooks
        f2=('x',3.34,-1)
        for i in range(3):
            wb(f2,2.35+i*.6,-.68,0,.54,.42,.02,'Panel',.006)
            if i==1:wring(f2,2.95,-.66,.02,.06,.014,'Trim',10)
            else:wb(f2,2.35+i*.6,-.6,.02,.2,.03,.03,'Steel',.004)
        b(1.6,.02,4.62,.42,.06,.36,'Steel',.01);ring((1.6,.055,4.62),.12,.02,'Rubber')
        for x in(1.4,1.8):b(x,-.03,4.42,.04,.12,.06,'Trim',.006)
        b(3.45,-.42,1.68,.7,1.1,.42,'Pale',.04);rod((3.45,-.5,1.89),(3.45,-.5,2.),.025,'Steel',6);rod((3.45,-.5,1.98),(3.45,-.6,1.98),.02,'Steel',6);ring((3.45,-.44,1.96),.05,.012,'Moss','y',8)
        wb(GF,3.1,.45,0,.16,.42,.06,'Panel',.006)
        for i in range(3):wb(GF,3.1,.31+i*.14,.06,.07,.06,.04,'Steel',.004)
        wb(GF,3.1,.6,.1,.03,.12,.05,'Wood',.004);wb(GF,2.45,-.12,0,.08,.1,.04,'Trim',.01);wring(GF,2.47,-.04,.02,.035,.008,'Trim',8)
        pendant(2.45,4.55,.75,'Pale');shade(GO,2.15,.3,'Trim','Steel')
        for i,m in enumerate(['Signal','Pale','Moss','Trim']):hook(GA,2.1+i*.27,.5);p=wp(GA,2.1+i*.27,.36,.07);mug(p[0],p[1],p[2],m);wb(GA,2.1+i*.27,.62,0,.14,.06,.004,'Paper',0)
        rug(2.,3.,1.2,1.6,'Rubber','Trim');rod((3.3,-.012,4.6),(3.3,.17,4.6),.065,'Pale',10);rod((3.3,.17,4.6),(3.3,.19,4.6),.07,'Steel',10)
        # airlock: four long dogs (one a wheel brace), hand pump, rag gasket, taped gauge, gym locker door, two suits, three pegs
        for a in range(4):
            c,s=math.cos(a*math.pi/2+.4),math.sin(a*math.pi/2+.4)
            if a==2:rod((3.84,.45*s,6.1+.45*c),(3.84,.7*s,6.1+.7*c),.02,'Steel',6);rod((3.84,.7*s-.08,6.1+.7*c),(3.84,.7*s+.08,6.1+.7*c),.02,'Steel',6)
            else:rod((3.84,.42*s,6.1+.42*c),(3.84,.72*s,6.1+.72*c),.03,'Trim',6)
        rod((3.02,F,6.88),(3.02,-.25,6.88),.07,'Panel',10);rod((3.02,-.3,6.88),(3.2,.05,6.8),.016,'Trim',6);ball((3.2,.05,6.8),(.04,.04,.04),'Rubber')
        gasket('Paper');dial(AP,6.85,.6,.12,'Steel');wb(AP,6.85,.6,.04,.26,.05,.004,'Paper',0);lever(AP,6.85,-.2,.26,'Trim')
        wb(AL,1.6,-.05,0,.46,1.72,.02,'Moss',.006)
        for i in range(3):wb(AL,1.6,.55-i*.07,.02,.3,.025,.004,'Rubber',0)
        cage(AI,5.3,.95)
        for x,z,w,d in((1.9,5.55,1.2,.06),(1.9,6.75,1.2,.06),(1.3,6.15,.06,1.2),(2.5,6.15,.06,1.2)):b(x,F+.004,z,w,.008,d,'Trim',0)
        b(1.9,F+.008,6.1,.5,.008,.4,'Wear',0)
        suit(AA,1.4,.86,'Pale');suit(AA,2.2,.86,'Upholstery','Rubber');hook(AA,2.78,.88)
        for x in(1.45,1.75):b(x,-.54,7.03,.12,.06,.18,'Trim',.02);b(x,-.5,7.03,.03,.05,.03,'Wood',0)
        b(3.5,F+.14,7.07,.5,.03,.2,'Steel',.004);boots(3.5,F+.155,7.08,'Leather')
        for x in(3.27,3.73):b(x,F+.07,7.07,.03,.14,.2,'Steel',0)
        # cargo hold: sled rails with a bare section, lashing bars, gantry with a pendant, deck scale, floods, clutter
        for x in(-.7,.7):b(x,F+.012,10.7,.06,.024,6.2,'Steel',0)
        b(.7,F+.014,10.8,.07,.028,1.5,'Wear',0)
        for y in(.2,.85):rod((3.3,y,7.5),(3.3,y,13.9),.02,'Steel',6)
        top();b(0,1.2,8.9,6.4,.14,.16,'Trim',.01);b(1.6,1.1,8.9,.3,.12,.26,'Panel',.02)
        for x in(-3.25,3.25):b(x,1.26,10.7,.1,.06,6.6,'Steel',0)
        low();rod((1.6,1.04,8.9),(1.6,.5,8.9),.01,'Rubber',4);b(1.6,.36,8.9,.12,.3,.08,'Trim',.02)
        for i,m in enumerate(['Signal','Moss','Rubber','Pale']):rod((1.53,.47-i*.07,8.9),(1.55,.47-i*.07,8.9),.028,m,8)
        b(-1.65,F+.04,7.95,.5,.08,.6,'Steel',.01);rod((-1.85,F,7.7),(-1.85,-.15,7.7),.025,'Steel',6)
        f2=('x',-1.85,1);dial(f2,7.7,-.05,.13,'Trim',.02);wb(f2,7.7,-.02,.06,.03,.12,.006,'Pale',.004)
        b(1.57,.25,10.82,.06,.5,.012,'Trim',0)
        for i in range(4):b(1.57,.08+i*.11,10.81,.08,.05,.03,'Steel',.004)
        for i,z in enumerate((8.3,10.2,11.6,13.3)):cage(HP,z,1.,'Panel' if i==1 else 'Glow');cage(HS,z,1.,'Panel' if i==2 else 'Glow')
        for d in(-.13,.13):b(-1.65+d,F+.05,10.1,.12,.04,1.1,'Trim',.008)
        b(-1.65,F+.2,10.75,.36,.34,.24,'Trim',.03);rod((-1.65,F+.3,10.85),(-1.65,F+1.05,11.05),.02,'Rubber',6);ring((-1.65,F+1.1,11.07),.08,.016,'Rubber','z',10)
        for i in range(8):z=11.2+(i//2)*.5+(.25 if i%2 else 0)*0;x=(-.2 if i%2 else .2) if (i//2)%2 else 0
        for i,(x,z) in enumerate([(0,11.1),(-.2,11.5),(.2,11.5),(0,11.9),(-.2,12.3),(.2,12.3),(0,12.7)]):b(x,F+.003,z,.38,.004,.38,'Paper',0);b(x,F+.006,z,.33,.004,.33,'Panel',0)
        wl(HF,-1.7,F,-1.62,.55,.1,.016,'Wood');wb(HF,-1.72,F+.08,.07,.3,.16,.06,'Wear',.02)
        crate(1.65,12.7,.45,.42,.6);crate(1.65,12.72,.42,.4,.55,y=F+.42);b(1.6,-.12,12.7,.26,.012,.34,'Paper',0);mug(1.72,-.14,12.9,'Signal')
        ball((1.62,-.06,12.5),(.14,.1,.14),'Trim');rod((1.62,-.14,12.5),(1.62,-.12,12.5),.17,'Trim',12);b(1.5,-.03,12.5,.01,.05,.06,'Signal',0)
        # engine room: slab housing with a strapped door, scaffold rail, stand-up console, blank road sign, grille doors
        for sx in(-1,1):
            for sz in(-1,1):b(sx*.66,.18,16.6+sz*.66,.16,2.26,.16,'Frame',.02)
        for a in range(4):
            c,s=round(math.cos(a*math.pi/2)),round(math.sin(a*math.pi/2))
            b(c*.66,.1,16.6+s*.66,.05 if c else 1.,.95,.05 if s else 1.,'Panel',.01)
            b(c*.74,.1,16.6+s*.74,.02 if c else 1.36,.07,.02 if s else 1.36,'Trim',0)
        b(.2,.1,15.82,.16,.11,.08,'Steel',.01)
        ring((0,-.15,16.6),1.15,.022,'Trim',seg=32)
        for i in range(8):a=i*math.pi/4+.39;rod((1.15*math.cos(a),F,16.6+1.15*math.sin(a)),(1.15*math.cos(a),-.15,16.6+1.15*math.sin(a)),.02,'Trim',6)
        for y in(-.4,-.1):rod((1.15*math.cos(3.53),y,16.6+1.15*math.sin(3.53)),(1.15*math.cos(4.32),y,16.6+1.15*math.sin(4.32)),.028,'Steel',6)
        console('Frame','Steel',0);b(1.,.2,18.87,2.,.5,.2,'Panel',.02)
        for i in range(8):b(1.3+i*.09,.3,18.75,.05,.1,.05,'Steel',.004)
        for x in(.3,.75):b(x,.22,18.76,.26,.18,.02,'Glow',0);b(x,.33,18.73,.3,.02,.08,'Steel',0)
        rod((-.0,-.05,18.7),(-.0,.3,18.6),.02,'Steel',6);b(0,.32,18.59,.18,.05,.05,'Signal',.02)
        wr(EA,2.,.8,0,.012,.25,'Signal',8);wr(EA,2.,.8,.012,.024,.22,'Pale',8)
        cage(EF,-1.6,1.);cage(EA,-2.1,1.05);chair('crate')
        b(1.85,-.02,18.72,.2,.05,.28,'Signal',.01);wire([(1.85,-.02,18.56),(1.95,-.3,18.44),(2.08,-.5,18.5)],.008,'Steel')
        hook(EA,-2.1,.62);ring(wp(EA,-2.1,.5,.06),.09,.012,'Rubber','z',10)
        for d in(-.09,.09):ball(wp(EA,-2.1+d,.44,.06),(.05,.06,.05),'Trim')
        rod((1.5,-.045,18.74),(1.5,.15,18.74),.06,'Pale',10);rod((1.5,-.04,18.74),(1.5,.1,18.74),.05,'Trim',10)
        rod((-2.3,F,15.8),(-2.34,.75,15.72),.016,'Wood',6);rod((-2.33,.45,15.73),(-2.34,.78,15.72),.03,'Steel',8);ring((-2.335,.55,15.725),.032,.01,'Signal','y',8)
        for s in(-1,1):
            f=EP if s<0 else ES
            for u in(15.68,16.42):wl(f,u,F+.04,u,.86,.04,.02,'Trim')
            for y in(F+.04,.86):wl(f,15.68,y,16.42,y,.04,.02,'Trim')
            for i in range(5):wl(f,15.8+i*.125,F+.04,15.8+i*.125,.86,.04,.01,'Trim',4)
            cage(LO if s<0 else RO,16.6,.55);crate(s*2.9,17.75,.5,.4,.5);rod((s*2.9,.03,18.66),(s*2.9,.3,18.66),.1,'Trim',10)

    elif k=='stoat':
        # corridor: rubber heel trough, flush lockers (one a flat plate), jump step, propped pocket door, pennants
        b(0,F+.004,3.9,.5,.008,6.,'Rubber',0)
        for i in range(20):b(0,F+.012,1.05+i*.3,.5,.008,.04,'Rubber',0)
        for z,x in((2.,.08),(3.3,-.1),(4.7,.1),(6.2,-.06)):b(x,F+.017,z,.14,.004,.3,'Wear',0)
        for u in(1.,1.5,2.):
            if u==1.5:patch(CS,u,-.1,.46,1.4,'Steel',.01)
            else:wb(CS,u,-.1,0,.46,1.4,.012,'Panel',.006);wb(CS,u-.17,.0,.012,.03,.12,.012,'Rubber',0)
        for u in(2.15,2.65):wb(CP,u,-.1,0,.46,1.4,.012,'Panel',.006);wb(CP,u+.17,.0,.012,.03,.12,.012,'Rubber',0)
        wr(CP,2.48,.12,.012,.05,.012,'Steel',6);ball(wp(CP,2.48,-.18,.12),(.12,.24,.14),'Upholstery')
        b(0,F+.08,.8,.5,.03,.16,'Steel',.006)
        for x in(-.22,.22):b(x,F+.04,.8,.03,.08,.03,'Steel',0)
        rod((-1.05,F,4.35),(-1.,.55,4.9),.022,'Trim',6)
        patch(CP,4.5,.55,.32,.42,'Trim');cage(CS,2.4,.98);cage(CP,1.6,1.0)
        top()
        for z in(1.37,4.58):ball((0,1.17,z),(.11,.06,.11),'Pale');ball((0,1.13,z),(.05,.03,.05),'Glow')
        low();pennants(CS,4.75,5.45,.72,['Pale','Upholstery','Wear','Signal','Pale'])
        picture(CS,4.15,.3,.62,.52,'Trim','Rubber')
        for i in range(3):ring((.74,F+.03+i*.05,6.92),.11,.028,'Trim')
        # passenger cabin: belts on spools, a wired seat shell, rubber hose, a table on a broomstick, sconces, trophies
        for i in range(4):
            z=1.95+i*1.15;b(-4.,-.1,z,.02,.8,.07,'Trim',0,rx=.5);rod((-4.08,.3,z+.3),(-4.,.3,z+.3),.05,'Steel',10)
        for i in range(4):wl(('x',-4.075,1),2.95+.08*(i%2),.0+i*.1,3.25-.08*(i%2),.06+i*.1,.0,.008,'Steel',4)
        rod((-2.6,-.35,1.52),(-2.1,-.35,1.52),.088,'Rubber',10)
        for x in(-2.56,-2.14):ring((x,-.35,1.52),.092,.012,'Steel','x',10)
        wb(KI,2.4,-.25,0,.7,.03,.14,'Pale',.006);rod((-1.02,F,2.4),(-1.02,-.26,2.4),.014,'Wood',6)
        shade(KO,2.95,-.25,'Upholstery');shade(KO,4.15,-.25,'Upholstery')
        b(-1.42,-.42,1.56,.5,1.1,.38,'Panel',.03);b(-1.42,-.35,1.76,.4,.8,.012,'Pale',.004)
        wire([(-1.5,.0,1.77),(-1.4,-.2,1.77),(-1.47,-.4,1.77),(-1.36,-.6,1.77)],.008,'Rubber',False)
        for x,h in((-1.55,.2),(-1.3,.14)):rod((x,.13,1.56),(x,.13+h*.4,1.56),.03,'Trim',8);rod((x,.13+h*.4,1.56),(x,.13+h,1.56),.03,'Trim',10,.08)
        wb(KA,-1.4,.4,0,.3,.4,.1,'Pale',.02);wb(KA,-1.4,.18,.03,.22,.1,.02,'Paper',.004)
        b(-3.8,-.43,1.95,.4,.12,.4,'Signal',.05);rod((-3.8,-.37,1.95),(-3.8,-.365,1.95),.12,'Paper',12)
        hook(KI,2.92,.62)
        for i in range(5):ball(wp(KI,2.92+.07*math.cos(i*1.26),.42+.08*math.sin(i*1.26),.09),(.06,.06,.06),'Wear')
        top();b(-2.2,1.26,4.6,.9,.1,.6,'Upholstery',.04)
        for x in(-2.45,-1.95):b(x,1.26,4.6,.05,.12,.64,'Rubber',0)
        low();grille('Pale','Steel',9);rug(-2.15,3.6,1.1,3.2,'Rubber','Trim')
        # scrubber bay: slim turbine with a bungeed cartridge, mudguard scoop, taped duct, teal pilot lamp, spare cartridge
        wb(BF,-2.4,-.25,0,1.6,.5,.18,'Pale',.08);wr(BF,-2.,-.25,.18,.24,.15,'Panel',12);wr(BF,-2.,-.25,.24,.26,.05,'Trim',8)
        for dy in(-.2,.2):wl(BF,-2.3,-.25+dy,-1.7,-.25+dy,.2,.012,'Signal',4);wr(BF,-2.3,-.25+dy,.18,.21,.02,'Steel',6);wr(BF,-1.7,-.25+dy,.18,.21,.02,'Steel',6)
        wb(BF,-3.25,-.25,0,.3,.34,.2,'Rubber',.08)
        rod((-3.,.0,5.9),(-3.,.72,5.9),.06,'Pale',10)
        for y in(.2,.3,.42):rod((-3.,y,5.9),(-3.,y+.06,5.9),.066,'Signal',10)
        wr(BF,-1.42,.2,0,.03,.07,'Steel',10);ball(wp(BF,-1.42,.2,.03),(.05,.05,.04),'Glow')
        wr(BA,-1.3,.5,0,.02,.075,'Steel',12);wr(BA,-1.3,.5,.02,.026,.06,'Paper',12);hook(BA,-1.3,.6)
        rod((-3.05,F+.1,7.05),(-2.55,F+.1,7.05),.1,'Pale',10);ring((-2.8,F+.1,7.05),.102,.014,'Trim','x',10)
        # galley: hinge struts and a seat-belt bunk latch, one burner with an outsize knob, tea-towel door, laundry line
        for z in(2.2,3.7):rod((3.94,.3,z),(3.36,-.34,z),.014,'Steel',6)
        wb(GO,2.6,.2,0,.1,.12,.04,'Steel',.01);wb(GO,2.6,.0,.01,.05,.3,.008,'Trim',0)
        ring((1.7,0,4.62),.11,.02,'Rubber');f2=('z',4.385,-1);wr(f2,1.7,-.2,0,.05,.065,'Pale',10)
        drape(GF,3.1,.6,.32,.5,'Paper',2,.035)
        for y in(.2,.5):wb(GF,3.1,y,.03,.3,.04,.004,'Trim',0)
        wire([(3.,.85,1.45),(3.5,.78,1.7),(3.95,.85,2.)],.006,'Rubber')
        for i,m in enumerate(['Pale','Signal','Upholstery']):b(3.2+i*.25,.62,1.56+i*.14,.16,.3,.02,m,.006,yaw=-.5)
        b(3.45,-.72,1.7,.7,.5,.42,'Panel',.03);rod((3.3,-.47,1.7),(3.3,-.3,1.7),.07,'Signal',10);rod((3.3,-.3,1.7),(3.3,-.29,1.7),.074,'Steel',10)
        shade(GA,2.9,.6,'Trim')
        for i in range(8):ball((3.36,-.25+.03*math.sin(i*1.3),2.1+i*.24),(.028,.028,.028),'Glow')
        rod((3.36,-.26,2.05),(3.36,-.26,3.85),.005,'Rubber',4)
        rod((2.6,-.012,4.6),(2.6,.15,4.6),.035,'Trim',10)
        picture(GI,1.95,.4,.4,.5,'Pale','Paper');wl(GI,1.82,.25,2.08,.55,.03,.007,'Signal',4)
        rug(2.,3.,.9,1.2,'Upholstery')
        for x in(1.6,2.4):
            for z in(2.45,3.55):rod((x,F+.01,z),(x,F+.016,z),.03,'Steel',6)
        # airlock: plug hatch on a swing arm with one taped lever, racing-tape gasket, fairing hanger, slim suit
        b(3.82,0,6.45,.05,.09,.75,'Steel',.01);rod((3.84,F+.3,6.82),(3.84,.5,6.82),.03,'Steel',6)
        rod((3.8,-.3,6.1),(3.72,.45,6.1),.02,'Steel',6);rod((3.74,.25,6.1),(3.72,.45,6.1),.03,'Wear',8)
        gasket('Signal');dial(AP,6.85,.55,.11);lever(AP,6.85,.0,.26,'Trim')
        wb(AA,2.2,.97,0,.62,.1,.14,'Pale',.045);suit(AA,2.2,.86,'Upholstery',None,.42)
        for du,dy in((-.1,-.25),(.1,-.4)):wb(AA,2.2+du,.86+dy,.15,.13,.09,.008,'Pale',0)
        helmet(1.5,-.57,7.03,'Trim','Rubber');wb(AI,5.3,.62,0,.3,.14,.02,'Rubber',.01)
        hook(AI,5.3,.25);ball(wp(AI,5.3,.12,.08),(.07,.09,.07),'Paper');cage(AI,5.3,.95)
        # cargo hold: nets in the rib bays, winch drum with a pedal, exposed wiring, ladder for a grate, clutter
        for s in(-1,1):
            f=HP if s<0 else HS
            for z0 in(8.,11.3):
                for i in range(5):wl(f,z0+i*.45,-.6,z0+i*.45+.45,.9,.1,.007,'Paper',4);wl(f,z0+i*.45+.45,-.6,z0+i*.45,.9,.1,.007,'Paper',4)
                wl(f,z0,.9,z0+2.25,.9,.1,.014,'Steel');cage(f,z0+1.1,1.08)
        b(1.57,.2,10.83,.3,.4,.01,'Rubber',0)
        for i in range(3):b(1.57,.08+i*.12,10.82,.26,.012,.01,'Pale',0,ry=.5 if i%2 else -.5)
        rod((-1.88,F+.25,7.9),(-1.42,F+.25,7.9),.18,'Steel',12);rod((-1.8,F+.25,7.9),(-1.5,F+.25,7.9),.2,'Wear',12)
        for x in(-1.9,-1.4):b(x,F+.24,7.9,.03,.48,.44,'Panel',.01)
        b(-1.65,F+.05,8.25,.2,.03,.26,'Steel',.008,rx=.25)
        wire([(3.32,1.,7.4),(3.3,.95,9.2),(3.32,1.02,11.),(3.3,.96,13.9)],.03,'Rubber')
        for z in(8.3,9.9,11.6,13.2):ring((3.31,.98,z),.036,.012,'Pale','z',8)
        for d in(-.25,.25):b(d,F+.012,9.2,.04,.024,1.3,'Steel',0)
        for i in range(5):b(0,F+.012,8.7+i*.25,.5,.02,.04,'Steel',0)
        tarp(-1.65,10.5,.45,.5,1.6,'Pale');crate(1.65,13.,.45,.5,.8)
        for i in range(3):ring((1.65,-.38,12.8+i*.2),.2,.016,'Trim','z',12)
        b(-1.65,F+.09,12.7,.22,.02,.7,'Wood',.01)
        for z in(12.45,12.95):rod((-1.78,F+.04,z),(-1.52,F+.04,z),.04,'Signal',8)
        top();rod((-1.65,1.33,9.),(-1.65,.9,9.),.012,'Wear',4);low();ring((-1.65,.6,9.),.26,.09,'Rubber','x',16)
        # engine room: finned turbine under a cowl on a ski pole, plate-sized tachometer, hosed fuel line, cereal-box gasket
        for i in range(8):a=i*math.pi/4;b(.64*math.cos(a),.2,16.6+.64*math.sin(a),.3,1.7,.02,'Steel',0,yaw=a)
        b(0,1.06,15.78,.9,.03,.5,'Pale',.01,rx=.45);rod((.4,F,15.52),(.38,.96,15.6),.012,'Signal',6);ring((.4,F+.1,15.52),.05,.008,'Pale','y',8)   # cowl kept above head height, inside the reactor's no-walk circle
        console('Frame','Pale',2,'Trim');f2=('z',18.9,-1);dial(f2,1.,.16,.2);mug(1.25,-.045,18.6,'Pale')
        b(.45,-.04,18.6,.7,.012,.24,'Leather',0)
        for i in range(7):
            if i!=4:rod((.17+i*.09,-.025,18.52),(.17+i*.09,-.025,18.68),.012,'Steel',4)
        rod((2.3,.3,15.9),(2.3,.3,18.5),.03,'Steel',6);rod((2.3,.3,16.5),(2.3,.3,17.5),.05,'Moss',8)
        wb(EA,1.9,.8,0,.26,.26,.008,'Paper',0);wring(EA,1.9,.8,.012,.09,.03,'Signal',12)
        chair('stool','Signal');top();rod((1.9,1.33,18.3),(1.9,.85,18.3),.004,'Wear',4);low();rod((1.9,.8,18.3),(1.9,.86,18.3),.02,'Steel',6)
        cage(EF,-1.6,1.);cage(EA,-2.1,1.05)
        for s in(-1,1):
            f=EP if s<0 else ES;wb(f,16.1,F+.92,.04,.85,1.84,.04,'Panel',.008);cage(LO if s<0 else RO,16.6,.55)
            for z in(14.9,16.6,18.2):wire([(s*2.43,.5,z),(s*2.6,1.12,z),(s*2.9,1.27,z),(s*3.15,1.12,z)],.03,'Trim')
            helmet(s*2.9,.03,18.66,'Pale','Rubber',0,-1)

    elif k=='manatee':
        # corridor: carpet runner with a doormat patch, wainscot with one plywood panel, brass rail, speaking tube, sconces
        rug(0,3.9,1.,6.2,'Leather','Trim');b(-.28,F+.016,3.6,.45,.012,.8,'Wear',0)
        for f,spans in((CP,[(.8,2.95),(4.25,4.7)]),(CS,[(.8,2.45),(3.75,5.5)])):
            for i,(a,c) in enumerate(spans):
                wb(f,(a+c)/2,-.45,0,c-a,1.,.02,'Wear' if (f is CS and i==1) else 'Wood',.006);wl(f,a,.12,c,.12,.07,.022,'Trim')
                for u in(a+.05,c-.05):wb(f,u,.12,0,.04,.04,.07,'Trim',0)
        wr(CP,1.05,.5,0,.1,.03,'Trim',8);wr(CP,1.05,.5,.1,.16,.03,'Trim',10,.06);wl(CP,1.05,.46,1.1,.3,.14,.004,'Trim',4);ball(wp(CP,1.1,.28,.14),(.03,.035,.03),'Wear')
        picture(CP,4.5,.62,.3,.34,'Trim','Moss',.03)
        shade(CS,2.25,.9,'Upholstery');shade(CS,4.3,.9,'Moss');shade(CP,2.4,.9,'Upholstery')
        rod((.74,F,1.),(.74,F+.5,1.),.1,'Trim',12);rod((.72,F+.1,1.),(.7,F+.85,1.02),.012,'Rubber',6);rod((.77,F+.1,.98),(.79,F+.8,.97),.012,'Signal',6)
        ball(wp(CS,1.6,.2,.1),(.07,.07,.07),'Trim');wr(CS,1.6,.3,0,.1,.012,'Trim',6);wl(CS,1.6,.3,1.6,.25,.1,.006,'Trim',4)
        shelf(CS,5.1,-.62,.5,.14)
        for i,m in enumerate(['Upholstery','Pale','Moss']):
            for d in(-.03,.03):b(.82,-.58,4.95+i*.15+d,.1,.05,.045,m,.015)
        wb(CS,4.15,.4,0,.26,.4,.02,'Wood',.01);dial(CS,4.15,.42,.1,'Trim',.02)
        shelf(CS,4.15,-.02,.36,.13);rod((.83,-.005,4.15),(.83,.02,4.15),.07,'Pale',12,.09)
        for i in range(3):ball((.83+.03*math.cos(i*2.1),.035,4.15+.03*math.sin(i*2.1)),(.02,.014,.02),'Paper')
        # passenger cabin: half-curtains on a hooked rail, drinks cabinet, brass heater, towelled union, chess, lamp
        for a,c in((1.95,2.75),(3.15,3.95),(4.35,5.15)):
            for u in(a+.07,c-.07):drape(KO,u,.9,.17,.8,'Upholstery',2,.06,nc=7);ball(wp(KO,u,.08,.08),(.03,.05,.03),'Trim')
        wl(KO,1.85,.92,5.25,.92,.08,.012,'Trim');hook(KO,5.25,.94)
        b(-1.42,-.5,1.56,.5,.94,.38,'Wood',.03)
        for z in(1.39,1.73):rod((-1.65,.02,z),(-1.19,.02,z),.008,'Trim',4)
        rod((-1.55,-.03,1.56),(-1.55,.2,1.56),.04,'Moss',8);rod((-1.55,.2,1.56),(-1.55,.3,1.56),.015,'Moss',6);rod((-1.38,-.03,1.56),(-1.38,.16,1.56),.045,'Trim',8);rod((-1.24,-.03,1.6),(-1.24,.06,1.6),.03,'Pale',8)
        wb(KF,-3.85,-.6,0,.7,.6,.12,'Trim',.02)
        for i in range(5):wb(KF,-4.1+i*.125,-.6,.12,.05,.42,.008,'Glow' if i==2 else 'Rubber',0)
        rod((-2.6,-.35,1.52),(-2.3,-.35,1.52),.105,'Paper',10);rod((-2.3,-.35,1.52),(-2.2,-.35,1.52),.09,'Steel',6)
        b(-3.82,-.4,3.4,.5,.03,.1,'Wear',.01)
        flamp(-1.05,5.62,'Upholstery');ring((-1.05,F+1.42,5.62),.17,.012,'Trim')
        wb(KI,2.4,-.25,0,.7,.03,.14,'Wood',.006);b(-.97,-.225,2.4,.11,.01,.44,'Pale',0)
        for i in range(8):rod((-.97+.03*(i%2)-.015,-.22,2.22+i*.05),(-.97+.03*(i%2)-.015,-.15,2.22+i*.05),.012,'Rubber' if i%2 else 'Paper',6)
        rod((-.97,-.22,2.66),(-.97,-.1,2.66),.02,'Steel',8)
        for i in range(4):b(-4.1,.5,1.95+i*1.15,.18,.03,.4,'Paper',.01)
        stack(-3.75,F,2.52,6,.3,.36,.03,['Paper','Wear','Pale']);rod((-3.6,F,3.68),(-3.6,F+.22,3.68),.17,'Leather',12);rod((-3.6,F+.2,3.68),(-3.6,F+.23,3.68),.12,'Upholstery',12)
        for y in(.2,.4,.6):wl(KA,-1.75,y,-1.05,y,.08,.012,'Trim')
        for u in(-1.75,-1.05):wl(KA,u,.1,u,.7,.08,.012,'Trim')
        wb(KA,-1.5,.36,.09,.3,.4,.02,'Paper',.008);wb(KA,-1.18,.5,.09,.1,.16,.03,'Rubber',.012)
        grille('Trim','Trim',8);wb(KA,-3.,.95,.009,.4,.38,.004,'Wear',0)
        # scrubber bay: walnut cabinet tied with a cord, wind-up timer, plastic elbow, lavender bags, soap on a rope
        scrub_cab('Wood',1.4,1.2,-2.55);wb(BF,-2.55,-.37,.18,.02,1.1,.01,'Rubber',0);dial(BF,-2.1,.05,.1,'Trim',.18);wb(BF,-2.1,.05,.22,.03,.08,.03,'Trim',.004)
        wring(BF,-2.55,-.4,.19,.07,.012,'Signal',10);wl(BF,-2.55,-.47,-2.5,-.7,.2,.012,'Signal',4);ball(wp(BF,-2.5,-.72,.2),(.025,.05,.025),'Signal')
        rod((-3.,.23,5.9),(-3.,.5,5.9),.05,'Trim');rod((-3.,.5,5.9),(-3.,.72,5.9),.06,'Steel');ball((-3.,.5,5.9),(.07,.07,.07),'Steel')
        for i in range(3):wl(BF,-1.6+i*.14,.6,-1.6+i*.14,.45-i*.04,.04,.004,'Paper',4);ball(wp(BF,-1.6+i*.14,.4-i*.04,.05),(.04,.055,.035),'Upholstery')
        shade(BA,-1.9,.7,'Upholstery');hook(BA,-1.5,.25);wl(BA,-1.5,.25,-1.5,.05,.07,.005,'Paper',4);ball(wp(BA,-1.5,.0,.07),(.05,.035,.03),'Pale')
        wr(BA,-3.26,.1,0,.1,.014,'Trim',6);ball(wp(BA,-3.26,.1,.1),(.025,.025,.025),'Trim')
        # galley: cream range with a spoon through the door, tile row with one odd tile, copper pans, plate rack, bunk curtain
        b(3.45,-.52,1.72,.8,.9,.5,'Pale',.04);rod((3.08,-.12,1.99),(3.82,-.12,1.99),.012,'Trim',6);b(3.45,-.6,1.975,.56,.42,.02,'Pale',.02)
        rod((3.1,-.42,2.03),(3.8,-.42,2.03),.014,'Wood',6);ball((3.84,-.42,2.03),(.05,.03,.02),'Wood')
        for x in(3.26,3.64):ring((x,-.06,1.72),.12,.02,'Rubber')
        wb(GF,2.45,-.12,0,.4,.1,.01,'Trim',.004)
        for i in range(9):wb(GA,1.25+i*.3,.2,0,.28,.28,.01,'Moss' if i==5 else 'Pale',.004)
        for i,(rr,flat) in enumerate(((.13,0),(.12,0),(.11,1),(.1,0))):
            hook(GA,1.4+i*.3,.82);wr(GA,1.4+i*.3,.62,.03,.035 if flat else .09,rr,'Trim',14);wb(GA,1.4+i*.3,.76,.04,.03,.14,.012,'Steel',0)
        for i in range(5):rod((2.75+i*.07,.11,4.82),(2.765+i*.07,.11,4.82),.11,'Pale',14)
        b(2.9,.0,4.82,.42,.03,.14,'Wood',.006);mug(1.4,-.012,4.75,'Wear');mug(1.55,-.012,4.82,'Signal')
        pendant(2.45,4.55,.75,'Upholstery')
        top();rod((3.3,1.05,2.),(3.3,1.05,3.9),.012,'Trim',6);low();drape(('x',3.37,-1),2.16,1.04,.36,1.34,'Wear',3,.07);cage(GO,2.6,.95)
        b(3.64,-.3,3.3,.3,.07,.42,'Signal',.03);rod((3.64,-.3,3.52),(3.64,-.3,3.58),.03,'Signal',6)
        # airlock: velvet rope on one post, brass handwheel, hand-painted dial, napkin-and-wax seal, valet-stand suit
        for z,x in((5.72,1.04),(6.52,1.08)):rod((x,F,z),(x,-.05,z),.022,'Trim',8);rod((x,F,z),(x,F+.03,z),.1,'Trim',10);ball((x,-.03,z),(.04,.04,.04),'Trim')
        wire([(1.04,-.12,5.72),(1.08,-.6,5.6),(1.06,F+.03,5.52),(1.2,F+.03,5.42)],.022,'Signal')
        ring((3.8,0,6.1),.42,.028,'Trim','x',20);gasket('Paper')
        for z,y in((5.63,.3),(5.63,-.4),(6.57,.6),(6.1,.99)):ball(wp(AP,z,y,.05),(.03,.06,.03),'Pale')
        dial(AP,6.85,.55,.13,'Trim',0,'Paper');lever(AP,6.85,-.05,.26,'Wood')
        wb(AA,2.2,.95,0,.56,.06,.12,'Wood',.02);suit(AA,2.2,.86,'Pale');ball(wp(AA,2.05,.6,.16),(.04,.04,.03),'Signal')
        b(1.5,-.555,7.03,.36,.02,.06,'Trim',.006,yaw=.3);cage(AI,5.3,.95,'Signal')
        rod((3.5,F,7.05),(3.5,F+.25,7.05),.015,'Wood',6);b(3.5,F+.015,7.05,.24,.03,.24,'Wood',.006)
        for i,m in enumerate(['Wear','Signal','Wear']):ring((3.5,F+.05+i*.04,7.05),.07,.018,m,'y',10)
        # cargo hold: brass-railed luggage rack propped on a hatbox, dumb waiter, chain hoist, rug on the grating, clutter
        for y in(-.45,.15):b(-1.66,y,8.6,.44,.03,1.8,'Wood',.006);rod((-1.45,y+.08,7.72),(-1.45,y+.08,9.48),.01,'Trim',4)
        for z in(7.72,9.48):rod((-1.86,F,z),(-1.86,.25,z),.02,'Trim',6)
        rod((-1.5,F,7.72),(-1.5,.25,7.72),.02,'Trim',6);rod((-1.5,F,9.4),(-1.5,F+.3,9.4),.17,'Pale',12);rod((-1.5,F+.3,9.4),(-1.5,F+.33,9.4),.18,'Signal',12);b(-1.5,-.56,9.4,.06,.16,.06,'Wood',0)
        for z,w,h,m in((8.05,.5,.3,'Leather'),(8.7,.6,.36,'Wear'),(9.2,.3,.24,'Wood')):
            b(-1.66,-.435+h/2,z,.4,h,w,m,.03);b(-1.66,-.435+h/2,z,.41,h+.01,.04,'Trim',0);b(-1.45,-.435+h/2,z+.12,.004,.1,.14,'Paper',0)
        b(-1.66,.165+.14,8.3,.38,.28,.5,'Signal',.03);b(-1.66,.165+.14,8.3,.39,.29,.04,'Trim',0)
        wb(HA,-1.5,.2,0,.62,.8,.05,'Wood',.01);wb(HA,-1.5,.2,.05,.5,.68,.004,'Rubber',0);wb(HA,-1.5,.1,.05,.5,.02,.06,'Wood',0)
        for i in range(3):wr(HA,-1.65+i*.15,.11,.08,.081,.01,'Pale',4);p=wp(HA,-1.65+i*.15,.11,.085);rod(p,(p[0],p[1]+.12,p[2]),.04,'Pale',8)
        hoist(12.5);b(1.57,.3,10.82,.05,.5,.012,'Leather',0);b(1.5,.1,10.82,.05,.34,.01,'Signal',0);b(1.63,.12,10.82,.05,.3,.01,'Moss',0)
        rug(0,11.5,1.2,1.8,'Upholstery','Trim')
        for z in(8.6,12.6):cage(HP,z,1.);cage(HS,z,1.)
        crate(1.65,13.,.45,.5,.6);tlamp(1.65,F+.5,13.,'Upholstery')
        rod((-1.65,F,10.4),(-1.65,-.1,10.4),.015,'Trim',6);rod((-1.65,F,10.4),(-1.65,F+.03,10.4),.12,'Trim',10)
        for y in(-.1,.3):ring((-1.65,y,10.4),.16,.01,'Trim','y',12)
        for i in range(8):a=i*math.pi/4;rod((-1.65+.16*math.cos(a),-.1,10.4+.16*math.sin(a)),(-1.65+.16*math.cos(a),.3,10.4+.16*math.sin(a)),.005,'Trim',4)
        ball((-1.65,.3,10.4),(.16,.1,.16),'Trim');b(-1.48,.1,10.48,.01,.16,.12,'Trim',0,yaw=.6)
        rod((-1.65,F,11.3),(-1.65,-.2,11.3),.015,'Wood',6);rod((-1.65,F,11.3),(-1.65,F+.03,11.3),.12,'Wood',10);ball((-1.65,.1,11.3),(.15,.34,.12),'Paper')
        ball((-1.65,.5,11.3),(.13,.09,.13),'Trim');rod((-1.65,.45,11.3),(-1.65,.47,11.3),.16,'Trim',12)
        for i in range(4):b(-1.65,F+.04+i*.07,12.7,.4,.05,1.,'Wood',.01);b(-1.65,F+.07+i*.07,12.7,.34,.012,.5,'Signal',0)
        htruck(1.65,8.1,'Trim')
        # engine room: brass rail and bands, wooden console desk, door-knob valve, monocle gauge, kettle, armchair
        ring((0,-.1,16.6),1.15,.022,'Trim',seg=32)
        for i in range(8):a=i*math.pi/4+.39;rod((1.15*math.cos(a),F,16.6+1.15*math.sin(a)),(1.15*math.cos(a),-.1,16.6+1.15*math.sin(a)),.02,'Trim',6)
        for y in(-.3,.3,.9):ring((0,y,16.6),.5,.035,'Trim',seg=24)
        console('Wood','Leather',4,'Wood')
        rod((-2.26,.15,16.5),(-2.26,.15,16.72),.11,'Trim',10);rod((-2.26,.15,16.61),(-2.1,.15,16.61),.02,'Trim',6);ball((-2.08,.15,16.61),(.05,.06,.06),'Pale')
        for y in(.62,.98):wb(EA,1.7,y,0,.07,.12,.12,'Trim',.006)
        for i in range(4):dial(ES,16.2+i*.36,.5,.13,'Trim')
        wring(ES,16.92,.5,.04,.12,.012,'Steel',14);wl(ES,16.92,.38,16.98,.1,.04,.004,'Steel',4)
        ball(wp(ES,16.2,.64,.07),(.12,.05,.12),'Rubber');wb(ES,16.2,.6,.14,.16,.02,.08,'Rubber',.008)
        ball((-2.2,.96,17.6),(.11,.09,.11),'Steel');rod((-2.2,.98,17.6),(-2.05,1.06,17.6),.02,'Steel',6);ring((-2.2,1.08,17.6),.06,.01,'Rubber','z',8)
        chair('arm','Leather')
        for i in range(3):ring((-1.25,F+.03+i*.05,18.5),.13,.026,'Signal')
        cage(EF,-1.6,1.,'Glow');cage(EA,-2.1,1.05)
        for s in(-1,1):
            f=EP if s<0 else ES;wb(f,16.1,F+.92,.04,.85,1.84,.04,'Moss',.008);wb(f,16.1,-.05,.08,.6,.02,.01,'Trim',0);cage(LO if s<0 else RO,16.6,.55)
            b(s*2.9,.16,18.66,.36,.26,.3,'Leather',.03);b(s*2.9,.16,18.66,.37,.27,.04,'Trim',0)

    else:
        # corridor: lensed rib lamps with rockers (three are jam jars), primer plate, chequer-plate arc, clutter
        for i,z in enumerate((1.5,4.4,5.3)):
            for f in(CP,CS):
                j=(i+(f is CS))%2
                if j:wr(f,z if f is CS else z-.5,.95,0,.1,.06,'Pale',10);wr(f,z if f is CS else z-.5,.95,0,.03,.07,'Wear',10)
                else:wr(f,z if f is CS else z-.5,.95,0,.03,.1,'Pale',12);wr(f,z if f is CS else z-.5,.95,.03,.045,.08,'Diffuser',12)
                wb(f,z if f is CS else z-.5,.75,0,.05,.09,.02,'Pale',.006);wb(f,z if f is CS else z-.5,.77,.02,.03,.04,.012,'Rubber',0)
        patch(CS,4.15,.3,.62,.52,'Steel')
        for z in(2.,5.):ring((0,F,z),.55,.018,'Trim',seg=28)
        b(.32,F+.008,5.3,.5,.016,.5,'Steel',0)
        for i in range(4):b(.18+i*.1,F+.018,5.3,.03,.004,.4,'Wear',0)
        wb(CS,6.92,-.3,0,.3,.8,.06,'Panel',.01);rod((.78,-.62,6.92),(.78,-.15,6.92),.06,'Wear',10);rod((.78,-.15,6.92),(.78,-.06,6.92),.025,'Rubber',6)
        wb(CP,2.4,.45,0,.5,.6,.04,'Pale',.12);wb(CP,2.4,.5,.04,.34,.1,.006,'Trim',0);wb(CP,2.4,.24,.04,.4,.09,.008,'Paper',0)
        rod((.74,F,1.),(.74,F+.1,1.),.15,'Pale',14);bucket(.74,1.,'Steel',None,F+.1);rod((.7,F+.12,1.),(.82,F+1.3,.98),.012,'Wood',6);ball((.7,F+.2,1.),(.07,.1,.07),'Paper')
        ladder(CS,5.05,F,.45,.04);shelf(CS,1.6,-.1,.5,.14);b(.83,-.07,1.6,.12,.03,.36,'Paper',.006);b(.83,-.085,1.6,.13,.02,.38,'Leather',.006)
        rod((-.84,F+.05,3.05),(-.84,F+.05,4.15),.05,'Upholstery',8);ball((-.84,F+.05,4.18),(.06,.06,.07),'Signal')
        patch(CP,4.5,.58,.3,.36,'Steel')
        # passenger cabin: shoulder fins (one splinted), denim patch, rusty pipe section, credenza, string lights
        for i in range(4):
            z=1.95+i*1.15
            for d in(-1,1):
                if i==2 and d>0:b(-4.12,.3,z+d*.33,.1,.18,.05,'Pale',.02);b(-4.05,.36,z+d*.33,.02,.34,.04,'Wood',0);b(-4.07,.28,z+d*.33,.14,.05,.07,'Signal',0)
                else:b(-4.12,.36,z+d*.33,.1,.32,.05,'Pale',.02)
        b(-3.76,-.495,3.1,.26,.012,.3,'Rubber',0)
        rod((-2.6,-.35,1.52),(-2.05,-.35,1.52),.085,'Wear',10)
        for x in(-2.6,-2.05):rod((x-.02,-.35,1.52),(x+.02,-.35,1.52),.12,'Steel',8)
        b(-1.42,-.57,1.56,.66,.8,.3,'Pale',.03)
        for x in(-1.58,-1.26):b(x,-.5,1.72,.28,.5,.012,'Pale',.006);b(x,-.4,1.73,.1,.02,.02,'Trim',0)
        tlamp(-1.6,-.17,1.56,'Upholstery');rod((-1.3,-.17,1.56),(-1.3,-.12,1.56),.07,'Pale',12,.11);ball((-1.3,-.09,1.56),(.045,.035,.035),'Wear')
        for i in range(12):
            t=i/11;u=3.1+t*.9;y=.92+.06*math.sin(t*math.pi);ball(wp(KO,u,y,.04),(.025,.025,.025),'Glow')
        wl(KO,3.1,.93,4.,.93,.04,.004,'Rubber',4)
        lump(-3.82,1.95,.5,.1,.42,'Signal',y=-.5,ripple=.015);b(-3.82,-.42,1.95,.52,.01,.06,'Paper',0);lump(-3.82,5.4,.5,.1,.42,'Moss',y=-.5,ripple=.015);b(-3.82,-.42,5.4,.06,.01,.42,'Paper',0)
        shelf(KI,2.4,-.2,.8);stack(-.97,-.187,2.4,5,.12,.34,.05,['Signal','Moss','Trim','Paper','Wear'])
        ball((-3.72,F+.13,2.52),(.17,.13,.17),'Pale');ball((-3.72,F+.34,2.52),(.18,.18,.18),'Moss')
        for i,m in enumerate(['Signal','Moss','Trim']):wb(KA,-1.6+i*.2,-.35+.05*i,0,.3,.016,.004,m,0)
        grille('Pale','Pale',6);wb(KA,-2.84,.95,.012,.32,.36,.004,'Steel',0)
        for i in range(5):wl(KA,-2.98+i*.07,.78,-2.98+i*.07,1.12,.02,.004,'Steel',4)
        # scrubber bay: twin ring scrubbers (one stripped for parts), saucepan duct joint, blue pilot lens, stool
        wring(BF,-2.9,-.25,.07,.36,.07,'Pale',22);wr(BF,-2.9,-.25,0,.1,.1,'Pale',12);ball(wp(BF,-2.9,-.25,.1),(.05,.05,.04),'Glow')
        for a in range(3):wl(BF,-2.9-.34*math.cos(a*1.05),-.25-.34*math.sin(a*1.05),-2.9+.34*math.cos(a*1.05),-.25+.34*math.sin(a*1.05),.05,.014,'Pale',4)
        wring(BF,-1.85,-.25,.04,.36,.02,'Steel',22);wl(BF,-2.2,-.25,-1.5,-.25,.04,.012,'Steel',4)
        wire([(-1.7,.05,5.86),(-1.72,-.3,5.9),(-1.6,-.55,5.88)],.01,'Signal');wire([(-2.,.03,5.86),(-1.95,-.2,5.9),(-2.05,-.5,5.88)],.01,'Rubber')
        rod((-3.,.13,5.9),(-3.,.38,5.9),.06,'Pale');rod((-3.,.38,5.9),(-3.,.56,5.9),.1,'Steel',12);rod((-3.,.56,5.9),(-3.,.72,5.9),.06,'Pale');b(-2.82,.52,5.9,.2,.025,.03,'Rubber',.006)
        cage(BA,-1.3,.95);board(BA,-1.3,.25,.4,.55,'Pale','Paper')
        for i in range(6):wb(BA,-1.3,.44-i*.07,.024,.26 if i!=2 else .12,.012,.004,'Rubber',0)
        stool(-3.1,7.04,'Upholstery','Pale',.4)
        # galley: sock drawer, button panel with varnish dots, clamp lamp, camping stove, decanter-rack noodles, sleeping bag
        f2=('z',4.385,-1);wb(f2,3.2,-.3,0,.6,.22,.2,'Pale',.02);ball((3.1,-.2,4.25),(.07,.05,.06),'Signal');ball((3.28,-.2,4.24),(.07,.05,.06),'Moss')
        wb(GF,3.1,.45,0,.22,.5,.04,'Panel',.006)
        for i in range(6):wb(GF,3.04+.12*(i%2),.6-.15*(i//2),.04,.06,.06,.02,'Glow' if i in(0,3,4) else 'Rubber',.004)
        for i in(0,3,4):wb(GF,3.08+.12*(i%2),.63-.15*(i//2),.06,.02,.02,.004,'Signal',0)
        b(3.5,.01,4.45,.08,.05,.08,'Steel',.01);rod((3.5,.03,4.45),(3.42,.35,4.55),.012,'Steel',6);rod((3.42,.35,4.55),(3.2,.42,4.6),.012,'Steel',6);rod((3.2,.34,4.6),(3.2,.44,4.6),.09,'Pale',12,.04);ball((3.2,.36,4.6),(.035,.035,.035),'Glow')
        b(1.7,-.008,4.62,.5,.01,.4,'Rubber',0);rod((1.6,0,4.62),(1.6,.1,4.62),.07,'Signal',10);ring((1.78,.11,4.62),.07,.012,'Steel','y',10)
        for d in(-.06,.06):rod((1.78+d,0,4.62),(1.78+d,.11,4.62),.008,'Steel',4)
        b(2.5,.06,4.8,.44,.14,.14,'Trim',.01)
        for i in range(3):rod((2.36+i*.14,.0,4.8),(2.36+i*.14,.19,4.8),.05,'Paper',10,.06)
        b(3.64,-.335,2.95,.58,.02,1.8,'Pale',.006);lump(3.64,3.1,.54,.16,1.42,'Moss',y=-.325,ripple=.02)
        picture(GO,2.45,.6,.8,.55,'Pale','Upholstery');wb(GO,2.6,.62,.03,.44,.36,.004,'Paper',0)
        for u in(2.4,2.8):ball(wp(GO,u,.78,.035),(.015,.015,.015),'Signal')
        shelf(GA,1.5,.4,.5);p=wp(GA,1.5,.413,.065);rod(p,(p[0],p[1]+.08,p[2]),.012,'Pale',6);rod((p[0],p[1]+.08,p[2]),(p[0],p[1]+.18,p[2]),.02,'Pale',10,.045)
        b(3.45,-.47,1.68,.8,1.,.42,'Pale',.04)
        for y in(-.75,-.45,-.15):b(3.45,y,1.895,.7,.24,.012,'Pale',.008);b(3.45,y,1.905,.2,.025,.02,'Trim',0)
        # airlock: ring hatch with two threaded-rod spokes, taped lever, blue dial, shower-curtain locker, two suits
        ring((3.8,0,6.1),.46,.04,'Pale','x',22)
        for a in(.5,2.6):c,s=math.cos(a),math.sin(a);rod((3.8,-.44*s,6.1-.44*c),(3.8,.44*s,6.1+.44*c),.012,'Steel',6);ball((3.8,.44*s,6.1+.44*c),(.03,.03,.03),'Steel')
        gasket('Paper')
        for z,y in((5.63,.2),(6.57,-.3),(6.57,.5)):ball(wp(AP,z,y,.05),(.03,.06,.03),'Pale')
        lever(AP,6.9,-.1,.3,'Signal');wr(AP,6.72,.55,0,.03,.12,'Pale',16);wr(AP,6.72,.55,.03,.036,.1,'Diffuser',16);wb(AP,6.74,.58,.036,.012,.08,.004,'Rubber',0)
        wl(AL,1.34,.84,1.86,.84,.03,.01,'Steel',4)
        drape(AL,1.6,.83,.52,1.7,'Upholstery',4,.045,nr=5)
        suit(AA,1.4,.86,'Pale')
        for d in(-1,1):wb(AA,1.4+d*.3,.78,.02,.16,.04,.16,'Trim',.01)
        suit(AA,2.2,.86,'Upholstery','Rubber');b(2.5,-.54,7.03,.2,.05,.07,'Wood',.01);b(2.5,-.5,7.03,.18,.03,.06,'Rubber',0)
        rod((1.04,F,6.97),(1.04,F+.22,6.97),.11,'Wear',10,.13);ball((1.02,F+.24,6.95),(.07,.04,.05),'Pale');ball((1.07,F+.25,7.),(.07,.04,.05),'Pale')
        b(1.02,F+.02,6.1,.2,.04,.9,'Pale',.006);cage(AI,5.3,.95)
        # cargo hold: ring track with a gap, trolley hoists, marshalling desk in a warm corner, piano on its side under a tarp
        top();wire([(1.6*math.sin(a*math.pi/12),1.24,10.7-1.6*math.cos(a*math.pi/12)) for a in range(2,23)],.03,'Steel')
        for a in(5,17):b(1.6*math.sin(a*math.pi/12),1.14,10.7-1.6*math.cos(a*math.pi/12),.2,.12,.2,'Panel',.02)
        low()
        for a in(5,17):x=1.6*math.sin(a*math.pi/12);z=10.7-1.6*math.cos(a*math.pi/12);rod((x,1.08,z),(x,1.,z),.012,'Steel',4);ring((x,.96,z),.045,.012,'Steel','z',10)
        b(1.65,-.55,7.95,.45,.84,.7,'Pale',.03)
        for i in range(4):rod((1.6,-.13,7.72+i*.14),(1.52,.07,7.72+i*.14),.012,'Steel',6);ball((1.52,.07,7.72+i*.14),(.03,.03,.03),'Trim')
        tlamp(1.72,-.13,8.2,'Upholstery');rug(1.1,8.,.7,1.,'Signal','Trim')
        b(1.57,.3,10.82,.04,.5,.012,'Signal',0);ball((1.57,.02,10.82),(.03,.06,.03),'Signal')
        for i in range(4):ring((1.57,.48-i*.07,10.8),.025,.007,'Steel','x' if i%2 else 'z',6)
        rod((3.3,-.2,8.4),(3.3,.95,9.4),.03,'Wood',6)
        for t in(.25,.5,.75):ball((3.3,-.2+1.15*t,8.4+t),(.05,.06,.05),'Wood')
        ladder(HA,1.5,F,1.05);b(.8,1.02,9.34,.56,.31,.012,'Signal',0)
        for x in(.6,1.):rod((x,1.17,9.34),(x,1.3,9.34),.006,'Steel',4)
        for z in(8.3,10.2,11.6,13.3):cage(HP,z,1.);cage(HS,z,1.)
        lump(-1.66,10.4,.5,1.44,2.05,'Upholstery',ripple=.035,n=11)
        for z in(9.9,10.9):b(-1.66,F+.7,z,.475,1.42,.04,'Trim',0)
        b(-1.5,F+.2,11.6,.1,.4,.1,'Rubber',.03)
        crate(-1.65,12.6,.45,.5,.6);b(-1.42,F+.25,12.6,.006,.2,.2,'Trim',0,rx=.785)
        for z in(7.7,8.9):rod((-1.65,F,z),(-1.65,.1,z),.015,'Steel',6)
        b(-1.65,-.15,8.3,.01,.44,1.2,'Paper',0);b(-1.65,.08,8.3,.016,.03,1.2,'Pale',0)
        crate(1.65,13.2,.45,.45,.5)
        for i in range(3):rod((1.55+i*.1,-.52,13.1+i*.08),(1.55+i*.1,-.5,13.12+i*.08),.09,'Diffuser',12)
        # engine room: spoked ring with a turnbuckle, ring brake, button console propped on the manual, primer shroud, throne
        for i in range(6):a=i*math.pi/3+.26;rod((.48*math.cos(a),.38,16.6+.48*math.sin(a)),(.88*math.cos(a),.38,16.6+.88*math.sin(a)),.022,'Pale',6)
        a=.26+.2;rod((.5*math.cos(a),.3,16.6+.5*math.sin(a)),(.88*math.cos(a),.3,16.6+.88*math.sin(a)),.008,'Steel',4);b(.69*math.cos(a),.3,16.6+.69*math.sin(a),.1,.035,.035,'Steel',.006,yaw=-a)
        rod((.75,F,15.75),(.75,-.1,15.75),.03,'Pale',8);ring((.75,-.05,15.75),.17,.018,'Trim','y',14)
        for a in range(2):rod((.75-.17*math.cos(a*1.57),-.05,15.75-.17*math.sin(a*1.57)),(.75+.17*math.cos(a*1.57),-.05,15.75+.17*math.sin(a*1.57)),.01,'Trim',4)
        for i,m in enumerate(['Pale','Steel','Pale']):a=-2.1+i*.5;b(1.02*math.cos(a),-.6,16.6+1.02*math.sin(a),.04,.72,.5,m,.01,yaw=-a)
        console('Pale','Panel',0)
        for i in range(18):b(.25+(i%9)*.19,-.035,18.58+(i//9)*.13,.09,.03,.07,'Glow' if (i*5)%7<3 else 'Rubber',.006)
        for x in(.5,1.5):b(x,.08,18.86,.3,.2,.02,'Glow',0);b(x,.2,18.83,.34,.02,.1,'Pale',0)
        b(-.46,-.28,18.75,.72,.07,.4,'Pale',.01);stack(-.5,F,18.75,12,.2,.28,.054,['Signal','Signal','Moss','Signal'],.008)
        wire([(1.85,.95,18.95),(1.95,.6,18.9),(1.82,.25,18.93)],.03,'Rubber')
        for y in(.8,.45):ring((1.92,y,18.91),.036,.01,'Pale','y',8)
        chair('throne','Leather');hook(EA,-2.1,.75);wire([(-2.1,.75,18.93),(-2.2,.45,18.93),(-2.1,.3,18.93),(-2.,.45,18.93),(-2.1,.75,18.93)],.014,'Signal');wb(EA,-2.1,.2,.02,.05,.3,.02,'Steel',.006)
        ring((-1.2,F+.07,18.52),.17,.07,'Upholstery','y',14);b(-1.2,F+.1,18.52,.22,.02,.04,'Steel',.004,yaw=.5)
        cage(EF,-1.6,1.);cage(EA,-2.1,1.05)
        for s in(-1,1):
            f=EP if s<0 else ES
            for u in(14.58,15.62):wl(f,u,F,u,.95,.04,.045,'Pale',8)
            wl(f,14.55,.97,15.65,.97,.04,.045,'Pale',8);cage(LO if s<0 else RO,16.6,.55);crate(s*2.9,17.75,.5,.4,.5,'Pale')
        wb(ES,16.1,F+.92,.04,.85,1.84,.04,'Pale',.008)
