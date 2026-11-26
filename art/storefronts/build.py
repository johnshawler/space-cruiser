"""Build the native storefront collection, game meshes and optional proof renders.
blender -b -P art/storefronts/build.py -- /path/to/repo [--render]
"""
from pathlib import Path
from math import sin, cos, pi, radians, sqrt
import bpy, bmesh, math, random, sys, json, collections
from mathutils import Vector, Matrix
from functools import lru_cache
exec(compile((Path(__file__).parent/"finish.py").read_text(), "finish.py", "exec"))
exec(compile((Path(__file__).parent/"open_front.py").read_text(), "open_front.py", "exec"))
exec(compile((Path(__file__).parent/"refit.py").read_text(), "refit.py", "exec"))
exec(compile((Path(__file__).parent/"expansion.py").read_text(), "expansion.py", "exec"))
exec(compile((Path(__file__).parent/"freight.py").read_text(), "freight.py", "exec"))
exec(compile((Path(__file__).parent/"garage_bays.py").read_text(), "garage_bays.py", "exec"))
TEXDIR=tempfile.TemporaryDirectory(prefix="long-haul-storefronts-")

args = sys.argv[sys.argv.index('--')+1:]
ROOT = Path(args[0]).resolve()
RENDER = '--render' in args
MODELS = ROOT/'assets/storefronts'
SOURCE = ROOT/'art/storefronts'
MODELS.mkdir(parents=True, exist_ok=True)
SOURCE.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
PAL = {
 'iron':'42484b','dark':'293035','coal':'20262c','edge':'71818a','steel':'a5b3b4','brass':'ce9c4e','gold':'f1c45e',
 'copper':'ac6240','rust':'88503a','cream':'e4d8b2','white':'e4e5db','chalk':'f2e7d1','bone':'c7b69a',
 'green':'396c4d','leaf':'65954d','sage':'87ad85','pine':'244e43','teal':'36877f','aqua':'76d3c8',
 'blue':'38536c','navy':'233748','ice':'abd9df','snow':'edf3ed','purple':'7b497f','lilac':'c18fc3',
 'red':'a3423d','wine':'733344','rose':'c88188','orange':'dc8347','yellow':'dfb943','sand':'be9066',
 'sand2':'dab488','tan':'a87e55','wood':'80563c','mahogany':'674331','basalt':'484348','stone':'756e70',
 'glass':'375d68','light':'ffcb79','cyan':'9ceef2','flame':'ff8140','pearl':'dfd5e2','pink':'de9da5'}
PAL.update(deckplate='777570',upholstery='805141',canvas='9a8e6d',safety='cc9663',workdeck='8b8271',workskin='8c9187')
metal=set('iron dark edge steel brass gold copper rust'.split())
def linear(c):
    q=int(c,16)/255
    return q/12.92 if q<.04045 else ((q+.055)/1.055)**2.4
@lru_cache(None)
def material(k):
    m=bpy.data.materials.new(k.capitalize())
    h=PAL[k]; rgb=tuple(linear(h[i:i+2]) for i in (0,2,4))
    m.diffuse_color=(*rgb,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*rgb,1)
    p.inputs['Metallic'].default_value=.52 if k in metal else .13 if k in ('glass','pearl') else .04
    p.inputs['Roughness'].default_value=.21 if k in ('glass','pearl','ice') else .38 if k in metal else .63
    if k in ('light','cyan','flame'):
        p.inputs['Emission Color'].default_value=(*rgb,1);p.inputs['Emission Strength'].default_value=2.1
    finish_port_material(m,k)
    return m

# Each labeled assembly has its own editable mesh. Parts share vertices only within a solid.
def part(name):
    global current
    current=name
def put(verts,faces,color,smooth=False):
    v,f,cols,sm=parts[current]
    start=len(v);v.extend(tuple(q) for q in verts)
    for face in faces:
        f.append(tuple(start+i for i in face));cols.append(color);sm.append(smooth)
def box(x,y,z,w,d,h,c):
    # A ring at each end gives enamel panels a narrow, actual chamfer.
    b=min(.055,w*.11,d*.11,h*.11)
    vs=[]
    for Z,inset in ((-h/2,b),(-h/2+b,0),(h/2-b,0),(h/2,b)):
        X=w/2-inset;Y=d/2-inset;t=min(max(.0004,b-inset*.85),X*.3,Y*.3)
        vs.extend((x+a,y+u,z+Z) for a,u in [(-X+t,-Y),(X-t,-Y),(X,-Y+t),(X,Y-t),(X-t,Y),(-X+t,Y),(-X,Y-t),(-X,-Y+t)])
    fs=[tuple(reversed(range(8))),tuple(range(24,32))]
    for j in range(3):
        for i in range(8):
            a=j*8+i;b0=j*8+(i+1)%8;fs.append((a,b0,b0+8,a+8))
    put(vs,fs,c)
def cone(a,b,r,s,c,n=12,smooth=True):
    a,b=Vector(a),Vector(b);axis=b-a
    if axis.length<.00001:return
    axis.normalize();u=axis.cross(Vector((0,0,1)) if abs(axis.z)<.9 else Vector((0,1,0))).normalized();v=axis.cross(u)
    pts=[p+(u*cos(i*2*pi/n)+v*sin(i*2*pi/n))*rad for p,rad in ((a,r),(b,s)) for i in range(n)]
    put(pts,[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],c,smooth)
def rod(a,b,r,c,n=10):cone(a,b,r,r,c,n)
def post(x,y,z,h,r,c,n=14):rod((x,y,z),(x,y,z+h),r,c,n)
def cable(pts,r,c):
    for a,b in zip(pts,pts[1:]):rod(a,b,r,c)
def ball(x,y,z,a,b,h,c,n=16,m=8):
    vs=[(x,y,z-h)]
    for j in range(1,m):
        t=-pi/2+pi*j/m
        vs+= [(x+a*cos(t)*cos(i*2*pi/n),y+b*cos(t)*sin(i*2*pi/n),z+h*sin(t)) for i in range(n)]
    vs.append((x,y,z+h));top=len(vs)-1
    fs=[(0,1+(i+1)%n,1+i) for i in range(n)]
    for j in range(m-2):
        for i in range(n):
            k=1+j*n+i;l=1+j*n+(i+1)%n;fs.append((k,l,l+n,k+n))
    fs.extend((top-n+i,top-n+(i+1)%n,top) for i in range(n))
    put(vs,fs,c,True)
def slab(profile,y0,y1,c):
    # Extrude an X/Z outline to build a curved or stepped solid.
    n=len(profile);vs=[(x,y,z) for y in (y0,y1) for x,z in profile]
    put(vs,[tuple(range(n)),tuple(reversed(range(n,2*n)))]+[(i,i+n,(i+1)%n+n,(i+1)%n) for i in range(n)],c)
def ringpts(rx,rz,z0,lo=0,hi=pi,n=22):
    return [(rx*cos(lo+(hi-lo)*i/n),z0+rz*sin(lo+(hi-lo)*i/n)) for i in range(n+1)]
def vault(rx,rz,z,y0,y1,thick,c,lo=0,hi=pi,n=24):
    a=ringpts(rx,rz,z,lo,hi,n);b=ringpts(rx-thick,rz-thick,z,lo,hi,n)
    for i in range(n):slab([a[i],a[i+1],b[i+1],b[i]],y0,y1,c)
def label(s,x,y,z,height,c='cream',maxw=6):
    curve=bpy.data.curves.new(s,'FONT');curve.body=s;curve.size=height;curve.align_x='CENTER';curve.align_y='CENTER';curve.extrude=.006
    obj=bpy.data.objects.new('Lettering • '+s,curve);col.objects.link(obj);obj.location=(x,y,z);obj.rotation_euler.x=pi/2
    bpy.context.view_layer.update();width=obj.dimensions.x
    if width>maxw:obj.scale.x=maxw/width
    key='Sign ink '+c
    ink=bpy.data.materials.get(key)
    if ink is None:
        ink=bpy.data.materials.new(key);ink.diffuse_color=material(c).diffuse_color
    curve.materials.append(ink)
def board(s,x,y,z,w,h,c='pine'):
    box(x,y,z,w,.12,h,c);label(s,x,y-.073,z,h*.63,maxw=w*.92)
def common_base(c='iron',w=8,d=5):
    part('Foundation and deck edging')
    box(0,.05,.12,w,d,.24,c)
    for x in (-w*.42,w*.42):
        for y in (-d*.35,d*.35):box(x,y,.09,.4,.55,.18,'dark')
def open_shell(c,w=7.3,h=3.4,roof=True):
    part('Envelope • returns and back wall')
    box(0,1.99,h/2+.2,w,.19,h,c)
    for x in (-w*.5,w*.5):box(x,.02,h/2+.2,.19,4,h,c)
    if roof:box(0,.05,h+.22,w+.30,4.2,.20,c)
def counter(x,y,w,c):
    box(x,y,.77,w,.8,1,c);box(x,y,1.31,w+.17,.98,.12,'wood')
    for i in range(max(1,int(w/.65))):box(x-w/2+.35+i*.62,y-.42,.78,.51,.045,.64,'bone' if c=='cream' else c)
def crate(x,y,z,s,c='tan'):
    box(x,y,z+s*.45,s,s*.81,s*.9,c)
    for a in (-.31,.31):box(x+s*a,y,z+s*.45,s*.095,s*.85,s*.94,'iron')
    box(x,y-s*.412,z+s*.57,s*.24,.035,s*.22,'cream')
def rack(x,y,w,c='iron'):
    for dx in (-w/2,w/2):
        for dy in (-.32,.32):box(x+dx,y+dy,1.35,.085,.085,2.35,c)
    for j in range(3):
        z=.42+j*.82;box(x,y,z,w+.12,.77,.09,c)
        for k in range(3):crate(x-w*.31+k*w*.31,y,z+.055,min(.61,w*.24),['tan','sage','cream'][(j+k)%3])
def lamp(x,y,z,w=1,c='light'):
    box(x,y,z,w+.14,.23,.13,'iron');box(x,y-.03,z-.075,w,.18,.045,c)
def tank(x,y,z,r,h,c):
    post(x,y,z+.13,h-.26,r,c,20);ball(x,y,z+.14,r,r,.16,c);ball(x,y,z+h-.14,r,r,.16,c)
    for zz in (.25,h-.32):post(x,y,z+zz,.045,r*1.02,'edge')
    post(x,y,z+h-.03,.13,r*.28,'brass')
def bench(x,y,w):
    for a in (-.42,.42):
        for b in (-.3,.3):box(x+a*w,y+b,.67,.09,.09,.88,'iron')
    box(x,y,1.12,w,.84,.15,'wood')
def fins(x,y,z,r,l,c='steel'):
    rod((x-l*.5,y,z),(x+l*.5,y,z),r*.83,'dark',20)
    for i in range(9):
        u=x-l*.46+l*.115*i
        rod((u,y,z),(u+.055,y,z),r,c,20)
def engine(x,y,z,s=1):
    fins(x,y,z,.62*s,1.63*s)
    cone((x-.85*s,y,z),(x-1.1*s,y,z),.51*s,.69*s,'copper',20)
    rod((x-1.11*s,y,z),(x-1.12*s,y,z),.51*s,'coal',20)
    for t in range(6):
        ang=t*pi/3;dy=.55*s*cos(ang);dz=.55*s*sin(ang)
        rod((x-.67*s,y+dy,z+dz),(x+.73*s,y+dy,z+dz),.037*s,'brass')
    for a in (-.48,.48):box(x+a*s,y,(z+.23)/2,.14,.72,z-.23,'yellow')
    box(x,y,.32,2.45*s,1.03,.16,'edge')
def stepfront(c):
    for i in range(3):box(0,-2.34+i*.20,.12+i*.07,2.25,.67,.16+i*.09,c)
def small_ship(x,y,z,s,c):
    # Asymmetric tapered hull, glazing, wing plates and twin exhausts.
    def pt(x0,y0,z0):return (x+x0*s,y+y0*s,z+z0*s)
    rings=[(-2.3,.11,.13),(-1.5,.48,.40),(-.55,.73,.55),(.92,.76,.53),(1.75,.53,.39)]
    vs=[]
    for xx,ry,rz in rings:
        vs.extend(pt(xx,ry*cos(i*pi/4),rz*sin(i*pi/4)) for i in range(8))
    put(vs,[tuple(range(7,-1,-1)),tuple(range(32,40))]+[(8*j+i,8*j+(i+1)%8,8*(j+1)+(i+1)%8,8*(j+1)+i) for j in range(4) for i in range(8)],c)
    ball(*pt(-1,0,.32),.69*s,.45*s,.27*s,'glass')
    for side in (-1,1):
        poly=[(-1.22,side*.5),(.8,side*1.42),(1.38,side*1.34),(.99,side*.51)]
        vs=[pt(xx,yy,zz) for zz in (-.08,.06) for xx,yy in poly]
        put(vs,[(0,1,2,3),(4,7,6,5)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],'steel')
        cone(pt(.43,side*.78,0),pt(1.83,side*.78,0),.21*s,.33*s,'iron')
        cone(pt(1.84,side*.78,0),pt(1.86,side*.78,0),.23*s,.23*s,'cyan')
        for j in range(4):box(*pt(-.7+j*.4,side*.675,.08),.22*s,.06*s,.16*s,'glass')
    for a in (-1,1):box(x+a*.91*s,y,z/2,.18,.54,z,'edge')
def gauge(x,y,z,r):
    for yy,rr,c in [(y,r,'brass'),(y-.05,r*.88,'cream')]:
        rod((x,yy,z),(x,yy-.065,z),rr,c,32)
    for j in range(12):
        t=j*pi/6;rod((x+.72*r*sin(t),y-.13,z+.72*r*cos(t)),(x+.81*r*sin(t),y-.13,z+.81*r*cos(t)),.018,'dark',6)
    for t,ll in [(1.04,.62),(-.35,.45)]:rod((x,y-.145,z),(x+r*ll*sin(t),y-.145,z+r*ll*cos(t)),.031,'dark',8)
def grain(x,y,z,r,c):
    offs=rng.uniform(-.4,.4); n=7
    vs=[(x+r*.78*cos(i*2*pi/n),y+r*.68*sin(i*2*pi/n),z) for i in range(n)]
    vs += [(x+r*(.64+.11*cos(i*2))*cos(i*2*pi/n+offs),y+r*.66*sin(i*2*pi/n+offs),z+r*(.68+.14*cos(i))) for i in range(n)]
    vs += [(x+r*.12,y+r*.11,z+r*1.28)]
    put(vs,[tuple(reversed(range(n)))]+[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]+[(n+i,n+(i+1)%n,2*n) for i in range(n)],c)
def scale(x,y,z,s=1):
    cone((x,y,z),(x,y,z+.15*s),.48*s,.30*s,'brass');post(x,y,z+.10*s,1.22*s,.10*s,'brass')
    rod((x-.80*s,y,z+1.20*s),(x+.80*s,y,z+1.32*s),.058*s,'brass')
    for j,xx in enumerate((x-.76*s,x+.76*s)):
        Z=z+.36*s+.12*s*j
        cone((xx,y,Z),(xx,y,Z+.10*s),.19*s,.38*s,'brass',20)
        for t in (.0,2.09,4.18):rod((xx,y,z+1.20*s+.12*s*j),(xx+.35*s*cos(t),y+.35*s*sin(t),Z+.1*s),.014*s,'steel',6)
    grain(x-.76*s,y,z+.46*s,.27*s,'stone')
def wall_tools(x,y,z):
    box(x,y,z,1.5,.11,.88,'tan')
    for j in range(6):
        xx=x-.58+j*.23;rod((xx,y-.11,z-.26),(xx+.04,y-.11,z+.20),.029,'steel');ball(xx+.04,y-.11,z+.18,.067,.035,.075,'edge')
def drinks(x,y,z,n):
    for i in range(n):
        xx=x+i*.23;c=['sage','copper','aqua','cream','wine'][i%5];h=.21+(i%3)*.06
        post(xx,y,z,h,.073,c);post(xx,y,z+h,.10,.032,c)
def bulbs(pts):
    cable(pts,.017,'coal')
    for x,y,z in pts:ball(x,y,z-.055,.07,.07,.085,'light',8,5)
def dispatch():
    common_base('bone');open_shell('pine',h=2.65,roof=False)
    part('Glasshouse clerestory and brass glazing bars')
    vault(3.85,1.8,2.81,-1.95,2.18,.075,'glass')
    for y in [-2.04,-1.05,0,1.05,2.13]:vault(3.93,1.87,2.79,y,y+.085,.13,'brass')
    for j in range(1,12):
        t=j*pi/12;x=3.88*cos(t);z=2.81+1.84*sin(t)
        rod((x,-2.06,z),(x,2.18,z),.039,'sage')
    for xx in (-3.6,-1.93,1.95,3.6):box(xx,-1.96,1.57,.14,.20,2.72,'pine')
    box(0,-1.99,2.9,7.6,.17,.22,'green')
    for xx in (-3.32,-2.9,2.9,3.32):box(xx,-1.92,1.76,.36,.09,1.97,'glass')
    part('Freight counter and goods');rack(-2.11,.93,2.0);rack(1.88,1.02,2.1);counter(0,-1.25,3.3,'green')
    gauge(1.64,-2.1,3.27,.78);board('DISPATCH   B4',-.84,-2.10,2.77,3.35,.47)
    part('Contract dispenser and fuel pump')
    for xx,c in [(-2.84,'red'),(2.97,'sage')]:
        box(xx,-2.01,1.24,.91,.78,2.0,c);box(xx,-2.41,1.53,.66,.07,.40,'dark')
        box(xx,-2.45,1.53,.47,.04,.14,'light');box(xx,-2.42,.87,.53,.06,.13,'coal')
    part('Trailing greenhouse plants')
    for side in (-1,1):
        for j in range(5):
            x=side*(2.43+j*.23); y=-1.93+j*.53
            pts=[(x+.10*sin(k+j),y,4.23-.30*k-.15*j) for k in range(7)]
            cable(pts,.025,'wood')
            for k,(a,b,z) in enumerate(pts):ball(a+.12*(-1)**k,b-.05,z,.16,.07,.10,'leaf' if k%2 else 'green',8,5)
def form_office():
    common_base('sand');open_shell('sand',h=3.05)
    part('Canyon strata and stepped civic parapet')
    for side in (-1,1):
        for j in range(14):
            w=1.35+.17*sin(j*2.4+side)
            box(side*(3.73-w*.41),-.03+(j%3)*.04,.35+j*.275,w,4.25+.12*cos(j),.31,['tan','sand','sand2','sand'][j%4])
    for j in range(4):
        box(-1.56+j*.36,-.08,3.42+j*.22,4.38-j*.66,3.83-j*.15,.33,'sand2')
        box(-2.78+j*.32,-1.97,2.36+j*.21,.18,.28,2.48,'bone')
    part('Dispatch window and rolling freight shutter')
    box(1.42,-1.69,1.76,2.93,.20,3.0,'iron')
    for j in range(16):box(1.42,-1.83,.43+j*.17,2.80,.075,.112,'edge')
    label('27-B',1.43,-1.89,1.90,.85,'cream',2.56)
    counter(-1.54,-1.64,1.88,'tan');lamp(-1.55,-1.70,2.64,.93)
    board('CARGO OFFICE',-1.50,-1.94,3.01,2.2,.36,'wood')
    for x in (-2.47,-1.51,-.55):
        for y in (-2.22,-3.03):post(x,y,.11,.76,.055,'brass')
        rod((x,-3.03,.85),(x,-2.22,.85),.047,'brass')
    crate(2.83,-2.14,.24,.81)
def freezer():
    common_base();part('Insulated pressure bulkhead')
    prof=[(-3.65,.22),(-3.65,3.23),(-2.64,4.20),(2.64,4.20),(3.65,3.23),(3.65,.22)]
    slab(prof,1.86,2.16,'ice')
    for j in range(5):
        a,b=prof[j:j+2];inner=lambda p:(p[0]*.74,.23+(p[1]-.23)*.76)
        slab([a,b,inner(b),inner(a)],-1.9,2.04,'white')
        for yy in (-2.05,-.95,.76,1.94):
            rod((a[0],yy,a[1]),(b[0],yy,b[1]),.098,'edge')
    for side in (-1,1):
        for j in range(7):box(side*3.63,-1.59+j*.51,1.62,.18,.12,2.54,'edge')
    part('Specimen handling');rack(-1.65,1.16,2.31);box(.58,-.8,.54,2.95,1.30,.18,'iron')
    for x in (-.46,1.54):
        for y in (-1.33,-.26):ball(x,y,.34,.17,.085,.16,'coal')
    for i in range(4):
        x=-.45+i*.69;tank(x,-.83,.65,.27,.92,'teal');box(x,-1.08,1.13,.35,.05,.28,'ice')
    board('COLD STORAGE',0,-2.06,3.70,3.53,.43,'navy');lamp(0,-1.98,3.28,2.3,'cyan')
    part('Roof refrigeration plant')
    for i in range(3):fins(-1.78+i*1.54,.53,4.36,.32,1.27)
    for i in range(22):
        x=-2.17+.20*i;h=.12+rng.random()*.37
        cone((x,-2.07,3.24),(x+.016,-2.08,3.24-h),.055,.002,'ice',6)
def bowlworks():
    common_base('blue',9,5.5);part('Split ceramic drydock shell')
    for side in (-1,1):
        # Compound-curved bowl segments are open toward the quay.
        for i in range(17):
            a=-.65+i*1.84/17;b=a+1.84/17
            for j in range(5):
                v=j/5;w=(j+1)/5
                def pt(t,k):
                    return (side*(2.82+1.36*k)*cos(t),.32+(1.70+.62*k)*sin(t),.23+k*(2.72+.50*sin(t+.4)))
                put([pt(a,v),pt(b,v),pt(b,w),pt(a,w)],[(0,1,2,3)],'blue' if j==4 else 'cream')
            rod(pt(a,1),pt(b,1),.075,'brass')
    part('Orbital hauler on slipway');small_ship(-.17,-.69,1.60,1.13,'cream')
    part('Gantry hoist and sales booth')
    for x in (-2.61,2.61):
        post(x,1.05,.23,3.82,.12,'yellow');rod((x,1.05,2.98),(x*.75,1.05,4.07),.09,'yellow')
    rod((-2.71,1.05,4.07),(2.71,1.05,4.07),.11,'yellow')
    rod((.58,1.05,4.05),(.58,.99,3.21),.035,'dark');ball(.58,.99,3.16,.33,.23,.12,'brass')
    box(3.22,-1.67,.98,1.25,1.2,1.45,'chalk');box(3.22,-2.29,1.18,.84,.05,.54,'glass')
    board('BOATWORKS',3.22,-2.29,1.77,1.47,.29,'blue')
    for x in (-3,-1.5,0,1.5,3):
        post(x,-2.55,.22,.43,.055,'brass')
    rod((-3,-2.55,.64),(3,-2.55,.64),.04,'brass')
def currents():
    common_base('cream',9,5.5)
    part('Buoyancy pontoons'); 
    for x in (-3.1,3.1):
        ball(x,-.05,.43,.80,2.52,.48,'gold')
        for y in (-1.31,1.29):box(x,y,.48,1.38,.12,.61,'brass')
    box(0,0,.85,8.79,5.14,.28,'white')
    part('Swept cantilever roof blades')
    for x in (-3.48,-.18,3.15):
        yz=[(1.84,.99),(2.22,.99),(2.09,2.30),(1.45,3.43),(.48,4.15),(-.92,4.56),(-2.37,4.68),(-2.09,4.48),(-.60,4.14),(.51,3.60),(1.29,2.81)]
        for j in range(len(yz)-1):
            y,z=yz[j];yy,zz=yz[j+1]
            put([(x-.37,y,z),(x+.37,y,z),(x+.37,yy,zz),(x-.37,yy,zz)],[(0,1,2,3)],'white')
        for side in (-1,1):
            put([(x+.37*side,y,z) for y,z in yz],[tuple(range(len(yz)))],'bone')
        cable([(x,-2.06,4.46),(x,-.62,4.11),(x,.49,3.58),(x,1.27,2.77)],.046,'light')
    part('Showroom and display hull');small_ship(.12,-.28,2.01,1.27,'white')
    board('CURRENT AFFAIRS',0,-2.55,.89,3.50,.35,'navy')
    for x in (-4.12,4.12):
        for y in (-1.91,-.3,1.5):post(x,y,1,.76,.045,'brass')
        rod((x,-1.91,1.74),(x,1.5,1.74),.035,'brass')
def lava():
    common_base('basalt');open_shell('basalt',h=2.55,roof=False)
    part('Overlapping ceramic armour vault')
    for j in range(5):
        y=-2.16+j*.89; shift=(j%2)*.10
        for i in range(8):
            a=i*pi/8+.009;b=(i+1)*pi/8-.009
            vault(3.95+shift,1.55+shift,2.54,y,y+1.02,.15,['rust','orange','copper','red'][(j+2*i)%4],a,b,4)
    for side in (-1,1):
        for j in range(5):box(side*3.58,-1.68+j*.83,1.37,.31,.75,2.24,'rust')
    part('Patch workshop and portal');engine(.49,-.62,1.42,1.17)
    wall_tools(-2.07,1.73,1.77);tank(-2.81,-1.32,.24,.36,1.72,'yellow')
    for i in range(7):box(2.75+i*.10,-1.89,1.81,.13,.19,2.81,'red' if i%2 else 'rust')
    for x in (-2.95,2.98):lamp(x,-1.45,2.58,.65)
    board('LAVA LUBE  &  PATCH',0,-2.12,3.35,3.56,.44,'rust')
def spores():
    common_base('wood');open_shell('teal',h=2.65,roof=False)
    part('Load-bearing fungus caps and gills')
    for x,y,z,w,d in [(-1.52,.60,3.31,2.55,2.04),(1.67,.51,3.66,2.06,1.92),(-.42,-1.09,3.48,2.62,1.49),(-3.1,-.81,2.79,1.16,1.4),(2.96,-1.24,2.91,1.11,1.26)]:
        cone((x+.17,y+.13,.25),(x,y,z-.22),.23,.39,'tan',13)
        ball(x,y,z,w,d,.52,'orange',24,8)
        for j in range(34):
            t=j*2*pi/34
            cable([(x+w*f*cos(t),y+d*f*sin(t),z-.51*sqrt(max(0,1-f*f))) for f in (.21,.48,.75,.95)],.031,'sand2')
    part('Repair bay and freight gantry')
    engine(-.46,-.78,1.44,.92)
    for x in (-1.85,1.01):box(x,-.36,1.66,.10,.11,2.79,'yellow')
    box(-.43,-.36,2.98,3.03,.14,.14,'yellow');rod((.05,-.36,2.94),(.05,-.36,2.11),.022,'dark')
    for i in range(4):
        box(1.9+i*.28,-1.32+i*.09,1.02,.23,.20,1.47,'edge' if i%2 else 'teal')
    board('SPORE & BOLT',1.88,-1.71,2.47,2,.37,'pine')
    for i in range(18):
        x=rng.choice([-1,1])*rng.uniform(2.71,3.77);y=rng.uniform(-2.12,1.63);h=rng.uniform(.17,.51)
        post(x,y,.22,h,.043,'sage',8);ball(x,y,.22+h,.13,.13,.097,'aqua' if i%4 else 'cyan',9,5)
def acoustic():
    common_base('edge');open_shell('blue',h=3.44)
    part('Soundproof wedges and folded jambs')
    for i in range(12):
        for j in range(6):
            x=-3.19+i*.58;z=.57+j*.51
            vs=[(x+dx,1.79,z+dz) for dx,dz in [(-.28,-.24),(.28,-.24),(.28,.24),(-.28,.24)]]+[(x-.11 if j%2 else x,1.37,z),(x+.11 if j%2 else x,1.37,z+.12)]
            put(vs,[(0,1,5,4),(1,2,5),(2,3,4,5),(3,0,4)],'iron' if (j+i)%3 else 'stone')
    for j in range(4):
        for side in (-1,1):
            box(side*(3.54-j*.15),-1.93+j*.11,1.83,.20,.30,3.16-j*.12,'edge' if j%2 else 'navy')
        box(0,-1.93+j*.11,3.43-j*.10,7.08-j*.32,.30,.13,'edge' if j%2 else 'navy')
    part('Hull dent jig and service cart')
    bench(.49,-.57,3.35)
    for side in (-1,1):box(.49+side*1.27,-.57,1.50,.14,.21,.8,'yellow')
    for i in range(13):
        x=-.80+i*.205;dz=.29*cos(i*pi/12)
        slab([(x,1.24),(x+.209,1.24),(x+.209,2.18+dz),(x,2.2+dz)],-.73+.12*cos(i*.6),-.66+.12*cos(i*.6),'steel')
    tank(-2.49,-1.09,.28,.31,.93,'navy');lamp(1.77,-1.03,3.06)
    board('SOFT LANDING',-1.07,-2.09,3.56,2.8,.36,'navy')
def paint_dept():
    common_base('sand');open_shell('sand2',h=2.76)
    part('Stepped limestone facade and inspection booth')
    box(-1.57,-1.92,1.72,3.75,.32,3.04,'sand2')
    for k in range(3):
        box(.40+k*.38,-.19,2.19+k*.18,.32,3.83,3.77+k*.39,'bone')
        box(-1.91,-2.12,2.77+k*.15,2.59-k*.34,.07,.075,'rust')
    for j,c in enumerate(('bone','red','navy','yellow')):
        x=-2.9+.78*j;box(x,-2.16,1.54,.60,.13,1.11,c)
        box(x,-2.25,.85,.50,.04,.13,'cream')
        if j==3:rod((x-.19,-2.24,1.16),(x+.19,-2.24,1.88),.057,'dark',6)
    bench(2.20,-.1,1.83);ball(2.31,-.17,1.32,.70,.38,.32,'pearl')
    pts=[(1.36,.76,1.18),(1.38,.65,1.99),(1.87,.41,2.34),(2.33,-.05,2.17)]
    cable(pts,.09,'yellow')
    for p in pts[1:3]:ball(*p,.15,.15,.15,'iron')
    board('COLOUR COMPLIANCE',-1.76,-2.14,2.42,3.29,.35,'wood')
    post(-2.84,1.13,3.02,.84,.18,'copper');post(-2.84,1.13,3.80,.11,.25,'edge')
def plumage():
    common_base('purple');open_shell('lilac',h=2.58)
    part('Five folded enamel feather panels')
    for j,(c,length) in enumerate(zip(('purple','rose','orange','sage','pearl'),(2.60,3.02,3.17,2.98,2.66))):
        x0=-3.19+j*1.16;z0=2.52;lean=.44+j*.14
        def point(t,side):
            width=(sin(pi*t)**.72)*.58
            return (x0+lean*t+side*width,-2.09+.32*t+abs(side)*.13,z0+length*t-side*.19*width)
        for i in range(12):
            t=i/12;u=(i+1)/12
            for side in (-1,1):
                put([point(t,0),point(u,0),point(u,side),point(t,side)],[(0,1,2,3)],c)
            if i not in (0,11):
                for s in (-1,1):rod(point(t,0),point(min(.98,t+.11),s),.014,'brass')
        cable([point(k/8,0) for k in range(9)],.028,'brass')
    part('Paint bench and sample bottles')
    bench(.76,-.62,3.0);ball(.78,-.61,1.34,1.07,.68,.51,'purple')
    for x in (-2.7,2.86):
        for j in range(3):
            z=.58+j*.60;box(x,-.97,z,.91,.56,.08,'cream')
            for k in range(3):post(x-.29+k*.26,-.99,z+.04,.28,.099,['orange','sage','pearl','purple'][(k+j)%4])
    board('PLUMAGE',0,-2.12,2.59,2.58,.45,'purple')
    for i in range(12):grain(-3.16+rng.uniform(-.5,.5),-1.61+rng.uniform(-.5,.4),.23,rng.uniform(.22,.51),'lilac')
def quiet_supplies():
    common_base('dark',8.35,5);part('Lift pontoons and deck')
    for x in (-2.96,0,2.96):
        ball(x,-.05,.59,1.25,2.40,.57,'pink',20)
        for y in (-1.33,.85):
            box(x,y,.63,2.22,.13,.71,'copper')
    box(0,.03,1.12,7.94,4.53,.25,'mahogany')
    for j in range(7):box(0,.2,1.36+j*.30,6.75,3.47,.20,'iron' if j%2 else 'dark')
    part('Awning counter and false-floor samples')
    box(0,-1.68,2.39,4.38,.14,1.00,'glass');counter(-.07,-1.63,3.73,'wood')
    for k in range(14):
        x=-3.31+k*.475
        slab([(x,3.35),(x+.47,3.35),(x+.47,3.39),(x,3.39)],-1.40,-1.28,'iron')
        put([(x,-1.39,3.37),(x+.47,-1.39,3.37),(x+.47,-2.35,2.99),(x,-2.35,2.99)],[(0,1,2,3)],'rose' if k%2 else 'cream')
        box(x+.235,-2.34,2.91,.47,.035,.15,'rose' if k%2 else 'cream')
    box(.3,-2.18,1.34,1.85,.69,.16,'coal')
    for x in (-.63,1.23):box(x,-2.16,1.36,.07,.72,.26,'brass')
    put([(-.6,-1.83,1.39),(1.2,-1.83,1.39),(1.2,-1.52,2.08),(-.6,-1.52,2.08)],[(0,1,2,3)],'wood')
    for i in range(4):box(2.57,-1.8,1.39+i*.11,.90,.69,.09,'steel')
    board('SUPPLIES',-2.28,-1.89,2.29,1.26,.28,'coal')
def margins():
    common_base('edge');open_shell('chalk',h=3.43)
    part('Precision frame and calibrated rule')
    for x in (-3.63,3.63):
        box(x,-2.01,1.96,.36,.46,3.55,'cream')
        for j in range(19):box(x-.04,-2.257,.44+j*.162,.20 if j%4==0 else .09,.027,.023,'coal')
    box(0,-1.95,3.64,7.63,.61,.29,'cream');box(0,-2.01,3.42,6.82,.20,.08,'light')
    part('Calibrated parts and industrial mining head')
    counter(-1.65,-1.00,2.99,'cream');fins(-1.60,-.99,1.95,.44,1.10,'yellow')
    cone((-1.04,-.99,1.95),(-.24,-.99,1.95),.43,.055,'steel',12)
    for j in range(4):
        r=.33-j*.06;rod((-.99+j*.15,-.99,1.95),(-.94+j*.15,-.99,1.95),r,'iron')
    counter(1.73,-.38,2.56,'bone');scale(1.65,-.48,1.38,1.10)
    for j in range(3):box(-1.73,1.72,.57+j*.60,2.64,.35,.46,'bone');box(-1.73,1.50,.57+j*.60,.70,.06,.06,'iron')
    board('FINE MARGINS',-.92,-2.26,3.69,3.19,.35,'navy')
def smelter():
    common_base('basalt');open_shell('basalt',h=2.68,roof=False)
    part('Masonry voussoirs and basalt piers')
    for i in range(13):
        t=i*pi/13+.007;u=(i+1)*pi/13-.007
        vault(3.76,1.67,2.16,-2.05,-1.48,.63,'basalt' if i%3 else 'stone',t,u,2)
    for side in (-1,1):
        for j in range(5):box(side*3.43,-1.68,.42+.42*j,.72,.90,.43,'basalt' if j%2 else 'stone')
    part('Smelting furnace and copper flue')
    box(-1.58,.64,1.24,2.10,1.76,2.05,'rust');box(-1.58,-.26,1.19,1.41,.10,1.08,'flame')
    for x in (-2.03,-1.76,-1.48,-1.21):box(x,-.34,1.18,.05,.07,1.11,'coal')
    cone((-2.78,.99,.25),(-2.78,.99,4.97),.47,.29,'copper',20)
    for z in (.71,2.20,3.88,4.94):post(-2.78,.99,z,.10,.42,'iron')
    part('Public ore scale and bins');counter(.99,-1.47,2.85,'wood');scale(.98,-1.45,1.38,1.16)
    for x in (-2.83,2.93):
        cone((x,-1.98,.32),(x,-1.98,.81),.32,.53,'copper',8)
        for i in range(6):grain(x+rng.uniform(-.28,.28),-2+rng.uniform(-.19,.19),.76,rng.uniform(.18,.31),'sand2' if i%2 else 'stone')
    board('GNEISS ASSAY',.52,-2.10,3.43,2.58,.35,'iron')
def far_assay():
    common_base('navy');open_shell('navy',h=2.93,roof=False)
    part('Pressure roof armature and relay beacon')
    vault(3.78,.96,2.94,-1.98,2.1,.19,'navy')
    for y in (-2.02,-1.19,.14,1.51):vault(3.84,1.01,2.94,y,y+.10,.16,'edge')
    for x in (-3.62,-1.1,1.51,3.62):box(x,-1.97,1.57,.17,.23,2.72,'edge')
    tank(-1.87,.34,3.68,.28,.74,'white');ball(-1.87,.34,4.48,.20,.20,.22,'light')
    part('Lit mineral cabinets')
    for j in range(2):
        for i in range(4):
            x=-2.98+i*1.01;z=.47+j*.94;box(x,-1.54,z,.96,.70,.10,'brass')
            grain(x,-1.50,z+.06,.39 if j%2 else .46,['aqua','lilac','gold','ice'][(i+j)%4])
            lamp(x,-1.38,z+.74,.58)
    part('Hanging weigh pan')
    post(3.10,-1.22,.22,3.29,.11,'yellow')
    rod((3.1,-1.22,3.49),(2.29,-2.22,3.49),.10,'yellow')
    for t in (0,2.09,4.18):rod((2.29,-2.22,3.48),(2.29+.49*cos(t),-2.22+.49*sin(t),1.17),.025,'brass')
    cone((2.29,-2.22,1.02),(2.29,-2.22,1.17),.26,.55,'edge')
    grain(2.29,-2.22,1.17,.34,'stone');board('FAR FIELD ASSAY',-.90,-2.02,2.72,3.76,.42,'navy')
def mitten():
    common_base('snow');open_shell('wood',h=2.22,roof=False)
    part('Snow-covered arch and drifts');vault(3.86,1.45,2.19,-2.04,2.18,.31,'snow')
    for side in (-1,1):
        for i in range(5):ball(side*3.51,-1.62+i*.85,.56,.57,.71,.52,'snow',14)
    for i in range(30):
        x=-3.65+i*.25;z=2.19+1.39*sqrt(max(0,1-(x/3.86)**2))
        h=.12+rng.random()*.31;cone((x,-2.07,z),(x,-2.07,z-h),.045,.001,'ice',6)
    part('Amber bow window and cocoa counter')
    for i in range(6):
        x=-2.91+i*.56;y=-2.00-.25*sin(i*pi/5)
        box(x,y,1.62,.54,.07,1.72,'light');box(x,y-.05,1.59,.57,.05,.065,'wood')
        box(x-.28,y-.05,1.62,.065,.09,1.82,'mahogany')
    counter(1.66,-1.72,2.32,'wood');tank(2.33,-1.68,1.39,.25,.74,'copper')
    for i in range(4):post(.88+i*.26,-1.93,1.39,.19,.08,'cream')
    for j in range(7):box(.58+j*.15,-.52,1.77,.18,.15,2.61,'wine' if j%2 else 'red')
    part('Mitten sign')
    rod((3.30,-1.79,2.99),(3.30,-2.56,2.99),.06,'iron')
    box(3.30,-2.55,2.34,.58,.15,.23,'cream');ball(3.30,-2.55,2.65,.34,.12,.39,'red');ball(2.99,-2.55,2.64,.16,.12,.19,'red')
    label('+',3.31,-2.69,2.65,.37)
    board('THE WARM MITTEN',-.22,-2.08,2.78,3.15,.38,'mahogany')
def indoor():
    common_base('dark');open_shell('wine',h=2.38,roof=False)
    part('Rolled upholstered vestibule')
    vault(3.85,1.68,2.41,-2.01,2.17,.29,'wine')
    for y in (-2.08,-1.93,-.88,.21,1.43):vault(3.89,1.74,2.37,y,y+.075,.14,'copper')
    for side in (-1,1):
        for i in range(4):box(side*3.60,-1.54+i*.86,1.32,.25,.81,2.11,'wine')
    part('Padded booths and brass tables')
    for x in (-2.36,-.18):
        box(x,.81,.76,1.86,1.01,.38,'wine');box(x,1.29,1.25,1.94,.32,.96,'red')
        for j in range(6):box(x-.76+j*.30,1.10,1.32,.27,.10,.69,'wine')
        post(x,-.14,.24,.64,.087,'brass');post(x,-.14,.88,.09,.61,'wood',24)
        post(x,-.13,.98,.21,.053,'brass');cone((x,-.13,1.16),(x,-.13,1.39),.27,.14,'light',16)
    counter(2.47,-.55,1.61,'mahogany');drinks(1.94,-.50,1.38,5)
    for j in range(2):box(1.44,1.61,1.80+j*.49,3.08,.49,.08,'wood');drinks(.19,1.51,1.85+j*.49,12)
    part('Quilted back wall and sound meter')
    for i in range(17):
        for j in range(3):
            x=-3.24+i*.395;z=2.04+j*.36
            put([(x,1.73,z-.23),(x+.19,1.73,z),(x,1.73,z+.23),(x-.19,1.73,z),(x,1.63,z)],[(0,1,4),(1,2,4),(2,3,4),(3,0,4)],'wine' if (i+j)%2 else 'red')
    box(-3.33,-2.01,1.52,.48,.20,2.20,'navy')
    for j,c in enumerate(('sage','sage','yellow','orange','red')):box(-3.33,-2.13,1.03+j*.23,.23,.05,.12,c)
    board('THE INDOOR VOICE',0,-2.13,3.56,3.39,.43,'wine')
VENUES=[
 ('Dispatch Bay B4','verdanthia','depot',dispatch),('Form 27-B Cargo Office','dunemoor','depot',form_office),
 ('Cold Storage Intake','cryo-vault-rimeholm','depot',freezer),('Big Bowl Boatworks','sloshwell','yard',bowlworks),
 ('Current Affairs Shipwrights','jovexa','yard',currents),('Lava Lube & Patch','scorchmaw','garage',lava),
 ('Spore & Bolt','toxibloom','garage',spores),('Soft Landing Repairs','listening-post-hush','garage',acoustic),
 ('Department of Approved Colours','dunemoor','livery',paint_dept),('Plumage Paint & Polish','amethyne','livery',plumage),
 ('Nothing To See Here Supplies','candara','outfit',quiet_supplies),('Fine Margins Outfitters','calibration-spire','outfit',margins),
 ('Gneiss Assay & Smelt','scorchmaw','assay',smelter),('Far Field Assay','beacon-far-wink','assay',far_assay),
 ('The Warm Mitten','brrrindle','bar',mitten),('The Indoor Voice','listening-post-hush','bar',indoor)]
def finish_meshes():
    for name,(verts,faces,colors,smooth) in parts.items():
        mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
        palette=list(dict.fromkeys(colors))
        for c in palette:mesh.materials.append(material(c))
        for poly,c,s in zip(mesh.polygons,colors,smooth):
            poly.material_index=palette.index(c);poly.use_smooth=s
        # The solids and exposed profile sheets have independent winding.
        bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(mesh);bm.free()
        mesh.validate();mesh.update()
        uv=mesh.uv_layers.new(name='Surface metres')
        for face in mesh.polygons:
            normal=face.normal;axis=max(range(3),key=lambda j:abs(normal[j]))
            indices=((1,2),(0,2),(0,1))[axis]
            scale=.31 if palette[face.material_index] in ('workdeck','workskin') else .62
            for li in face.loop_indices:
                pos=mesh.vertices[mesh.loops[li].vertex_index].co
                uv.data[li].uv=(pos[indices[0]]*scale,pos[indices[1]]*scale)
        obj=bpy.data.objects.new(name,mesh);col.objects.link(obj)
def stamp_hardware(index):
    part('Countersunk deck fasteners and cleats')
    for side in (-1,1):
        for j in range(8):
            x=side*(3.7 if index not in (3,4) else 4.17);y=-2.10+.61*j
            post(x,y,.237,.021,.056,'steel',8)
    # Little service fittings live on the back return, visible when turned around.
    part('Service access and conduit')
    y=2.18
    for j in range(2):
        x=-2.1+j*.95;box(x,y,1.22,.80,.13,.83,'edge')
        for k in range(6):box(x,y+.080,1.0+k*.075,.58,.05,.033,'iron')
    pts=[(-2.08,y+.12,.76),(-2.08,y+.12,.49),(-1.96,y+.12,.39),(.88,y+.12,.39),(.99,y+.12,.51),(.99,y+.12,1.59)]
    cable(pts,.052,'copper')
    for xx in (-1.65,-.85,.23):box(xx,y+.12,.39,.055,.15,.16,'edge')
def prepare_game_copy(objects):
    bpy.ops.object.select_all(action='DESELECT')
    clones=[]
    for obj in objects:
        clone=obj.copy();clone.data=obj.data.copy()
        scene.collection.objects.link(clone);clone.select_set(True);clones.append(clone)
    bpy.context.view_layer.objects.active=clones[0]
    bpy.ops.object.convert(target='MESH')
    # Converted lettering and workshop meshes start with differently named UV layers. Blender
    # joins by layer name; glTF/Three sample layer zero. Unify the authored UVs before joining.
    for obj in clones:
        uv=obj.data.uv_layers.active
        if uv:uv.name='Surface metres'
    if len(clones)>1:bpy.ops.object.join()
    mesh=bpy.context.object;mesh.name='Facade'
    # Normalize the joined mesh to an identity origin at street center.
    mesh.data.transform(mesh.matrix_world);mesh.matrix_world=Matrix.Identity(4)
    return mesh
def studio():
    global camera
    scene.world=bpy.data.worlds.new('Warm studio');scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.45,.48,.52,1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value=.48
    scene.render.engine='CYCLES';scene.cycles.samples=10;scene.cycles.use_denoising=True
    scene.cycles.max_bounces=4;scene.render.resolution_x=720;scene.render.resolution_y=490;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
    camera=bpy.data.objects.new('Review camera',bpy.data.cameras.new('Architectural orthographic'));scene.collection.objects.link(camera)
    camera.data.type='ORTHO';camera.data.ortho_scale=10.8;scene.camera=camera
    for name,pos,power,size,colr in [('Key',(-9,-10,20),6600,12,(1,.83,.65)),('Fill',(10,-2,15),4600,10,(.73,.85,1)),('Rim',(4,18,17),7500,10,(1,.89,.72))]:
        light=bpy.data.lights.new(name,'AREA');light.energy=power;light.shape='DISK';light.size=size;light.color=colr
        obj=bpy.data.objects.new(name,light);scene.collection.objects.link(obj);obj.location=pos;obj.rotation_euler=(Vector((0,0,1.5))-obj.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;floor.name='Review ground';floor.location.z=-.62
    floor.data.materials.append(material('bone'))
manifest={'units':'metres','up':'+Y','front':'+Z','venues':{}}
# Each gallery rebuild updates only the venues it owns.
gallery='Long-Haul-Storefronts'
render_folder='storefront-renders'
specs=[]
freight = '--freight' in args
if freight and '--expansion' in args:
    raise ValueError('Choose one storefront collection per build.')
if freight:
    gallery,render_folder='Freight-Storefronts','freight-renders'
    specs=FREIGHT_SHOPS
    workshop,fit_floor=build_service_workshop,fit_service_floor
elif '--expansion' in args:
    gallery,render_folder='Market-Storefronts','market-renders'
    specs=NEW_SHOPS
    workshop,fit_floor=back_workshop,counter_display
if (MODELS/'manifest.json').exists():
    manifest=json.loads((MODELS/'manifest.json').read_text())
if specs:
    VENUES=[(s[0],s[1],s[2],None) for s in specs]
collections_by_id=[]
for i,(title,port,key,fn) in enumerate(VENUES):
    rng=random.Random(950+i);parts=collections.defaultdict(lambda:([],[],[],[]))
    col=bpy.data.collections.new(f'{i+1:02}  {title}');scene.collection.children.link(col)
    if specs:
        spec=specs[i]
        workshop(spec)
        marks=make_open_shop(i,title,port,key,trim=spec[4][1])
        fit_floor(spec)
    else:
        fn();stamp_hardware(i);detail_kit(i);marks=make_open_shop(i,title,port,key)
        forecourt_display(port,key)
    animated = freight and key=='garage'
    if freight:
        freight_deck(key=='depot')
        fixtures=garage_bay(port,marks) if animated else []
    else:
        fixtures=refit_shop(title,port,key)
    finish_meshes()
    original=list(col.objects)
    pivots={port+' '+DRIVE:('drive',DRIVE_AT), port+' '+NOZZLE:('nozzle',NOZZLE_AT)} if animated else {}
    moving={name:col.objects[name] for name in pivots}
    game=prepare_game_copy([o for o in original if o not in moving.values()])
    game.name=f'{port}-{key}';game['venue']=title;game['shopKey']=key;game['locationKey']=port
    game.data.calc_loop_triangles()
    tris=len(game.data.loop_triangles)
    export=[game]
    for name,(role,origin) in pivots.items():
        moving_mesh=prepare_game_copy([moving[name]])
        moving_mesh.data.transform(Matrix.Translation(-Vector(origin)))
        moving_mesh.location=origin
        moving_mesh.name=title+' '+role;moving_mesh['garagePart']=role
        moving_mesh.data.calc_loop_triangles()
        tris+=len(moving_mesh.data.loop_triangles);export.append(moving_mesh)
    assert 1000<tris<80000,(title,tris)
    filename=f'{port}-{key}.glb'
    anchors=create_markers(marks)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in export+anchors:obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(MODELS/filename),export_format='GLB',use_selection=True,export_yup=True,
        export_texcoords=True,export_image_format='JPEG',export_jpeg_quality=82,export_animations=False,export_extras=True,export_cameras=False,export_lights=False,export_normals=True)
    entry={'name':title,'file':filename,'triangles':tris,'port':PORTS[port],'markers':marks}
    if fixtures:entry['lights']=fixtures
    if animated or (not freight and key=='depot'):
        entry['wayfindingMount']='overhead'
    manifest['venues'].setdefault(port,{})[key]=entry
    for obj in export:bpy.data.objects.remove(obj,do_unlink=True)
    lamps=fit_native_lights(fixtures)
    save_one(title,port,key)
    for ob in anchors:ob.name=f'{port}_{key}__{ob.name}'
    original+=anchors+lamps
    collections_by_id.append(col)
    # Keep each shop distinct and directly editable in the master gallery.
    offset=Vector(((i%4-1.5)*22,(1.5-i//4)*30,0))
    for obj in original:obj.location+=offset
    col['gridOffset']=list(offset)
(MODELS/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_distance=112
        area.spaces.active.region_3d.view_rotation=Vector((-0.29,.76,-.69)).to_track_quat('-Z','Y')
        area.spaces.active.overlay.show_overlays=False
        area.spaces.active.shading.color_type='MATERIAL'
bpy.ops.object.select_all(action='DESELECT')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.outliner.orphans_purge(do_recursive=True)
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/(gallery+'.blend')),compress=True)
if RENDER:
    studio()
    review=ROOT/'build'/render_folder;review.mkdir(parents=True,exist_ok=True)
    for c in collections_by_id:c.hide_render=True
    for i,c in enumerate(collections_by_id):
        c.hide_render=False
        for ob in c.objects:ob.location-=Vector(c['gridOffset'])
        bpy.context.view_layer.update()
        pts=[obj.matrix_world @ Vector(corner) for obj in c.objects if obj.type in ('MESH','FONT') for corner in obj.bound_box]
        direction=Vector((-5,-27,10.4)).normalized()
        rotation=(-direction).to_track_quat('-Z','Y')
        right=rotation @ Vector((1,0,0));up=rotation @ Vector((0,1,0))
        mid=sum(pts,Vector())/len(pts)
        xs=[(pt-mid).dot(right) for pt in pts];ys=[(pt-mid).dot(up) for pt in pts]
        target=mid+right*((min(xs)+max(xs))/2)+up*((min(ys)+max(ys))/2)
        camera.location=target+direction*45;camera.rotation_euler=rotation.to_euler()
        camera.data.ortho_scale=1.10*max(max(xs)-min(xs),(max(ys)-min(ys))*720/490)
        scene.render.filepath=str(review/f'{i+1:02}.png');bpy.ops.render.render(write_still=True)
        c.hide_render=True
