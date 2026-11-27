"""Aprons, working dock fittings and freestanding architectural components."""
from math import sin, cos, pi, tau, atan2, hypot
from meshkit import SCALE

def railing(p,a,b,material='rail',height=.38):
    x,y,z=a;X,Y,Z=b;count=max(1,round(hypot(X-x,Y-y)/.95))
    for i in range(count+1):
        t=i/count;u=x+(X-x)*t;v=y+(Y-y)*t;w=z+(Z-z)*t
        p.rod((u,v,w),(u,v,w+height),.032,material)
    for h in [height*.48,height]:p.rod((x,y,z+h),(X,Y,Z+h),.025,material,n=8)

def truss(p,a,b,height=.42,c='rail'):
    x,y,z=a;X,Y,Z=b
    p.rod(a,b,.075,c);p.rod((x,y,z-height),(X,Y,Z-height),.065,c)
    count=max(2,round(hypot(X-x,Y-y)/.7))
    pts=[(x+(X-x)*i/count,y+(Y-y)*i/count,z+(Z-z)*i/count-(height if i%2 else 0)) for i in range(count+1)]
    p.wire(pts,.032,c)

def roofhall(p,x,y,z,w,d,h,wall,roof,trim='rim',kind='clerestory'):
    """Ribbed utility building with window reveals, shutters, downpipes and a monitor ridge."""
    p.box((x,y,z+h*.49),(w,d,h*.98),wall,bevel=.10)
    f=y-d/2
    p.box((x,f-.025,z+h*.45),(w*.42,.10,h*.83),'ink')
    for i in range(7):p.box((x,f-.09,z+h*.11+i*h*.086),(w*.37,.085,.07),'rail')
    for side in [-1,1]:
        u=x+side*w*.365
        p.box((u,f-.045,z+h*.56),(w*.22,.095,h*.31),'ink')
        for i in [-1,0,1]:p.box((u+i*w*.061,f-.102,z+h*.57),(w*.049,.03,h*.19),'light')
    for side in [-1,1]:
        for i in range(5):
            v=y-d*.39+i*d*.194
            p.box((x+side*w*.5,v,z+h*.53),(.07,.10,h*.96),trim)
            if i<4:p.box((x+side*(w*.5+.013),v+d*.093,z+h*.62),(.05,d*.122,h*.24),'glass')
    if kind=='gable':
        for s in [-1,1]:
            p.surface([[(x,y-d*.54,z+h*1.31),(x,y+d*.54,z+h*1.31)],[(x+s*w*.54,y-d*.54,z+h),(x+s*w*.54,y+d*.54,z+h)]],roof)
        p.rod((x,y-d*.54,z+h*1.31),(x,y+d*.54,z+h*1.31),.07,trim)
    else:
        p.box((x,y,z+h),(w*1.05,d*1.06,.17),roof)
        p.box((x+.04,y,z+h+.17),(w*.62,d*.74,.27),trim)
        p.box((x+.04,y,z+h+.33),(w*.67,d*.77,.105),roof)
    for side in [-1,1]:p.wire([(x+side*w*.48,f-.05,z+.04),(x+side*w*.48,f-.05,z+h-.13),(x+side*w*.43,f-.15,z+h)],.07,'copper')

def tanks(p,x,y,z,r,h,c,top='rim'):
    p.lathe((x,y,z),[(r*.84,0),(r,.13),(r,h*.83),(r*.93,h*.93),(r*.68,h),(r*.22,h*1.04)],c)
    for zh in [.10,h*.27,h*.76]:p.ring((x,y,z+zh),r+.012,.043,top)
    p.rod((x,y,z+h),(x,y,z+h+.22),r*.20,top)
    for k in range(2):
        yy=y-r-.052;xx=x+(k-.5)*.28;p.rod((xx,yy,z+.12),(xx,yy,z+h*.88),.024,top,n=6)
    for i in range(max(2,int(h/.22))):p.rod((x-.14,y-r-.053,z+.2+i*.215),(x+.14,y-r-.053,z+.2+i*.215),.014,top,n=6)

def boxcargo(p,x,y,z,w=.55,c='ochre',angle=0):
    p.box((x,y,z+w*.37),(w,w*.76,w*.73),c,angle)
    for i in [-1,1]:
        off=i*w*.30;p.box((x+off*cos(angle),y+off*sin(angle),z+w*.37),(w*.075,w*.79,w*.78),'rail',angle)

def pier(p,x,y,w,d,z,c='iron',posts=True):
    p.box((x,y,z-.18),(w,d,.36),c,bevel=.1)
    for side in [-1,1]:
        truss(p,(x+side*w*.49,y-d*.48,z-.22),(x+side*w*.49,y+d*.48,z-.22),.44)
        if posts:
            for i in [-1,0,1]:p.rod((x+side*w*.43,y+i*d*.41,z-1.7),(x+side*w*.43,y+i*d*.41,z-.2),.12,'iron')
    for i in range(1,int(d/.52)):p.box((x,y-d/2+i*.52,z+.008),(w*.97,.023,.015),'rail')

def plate(p,kind,c,accent):
    rng=p.random
    if kind in ('garden','lava','canyon','fungal','ice','crystal','harbor'):
        with p.section('Site geology and shoreline'):
            n=64;outline=[(11.4+1.0*rng.random(),7.8+.7*rng.random()) for _ in range(n)]
            def row(f,h):return [(f*a*cos(tau*i/n),2.5+f*b*sin(tau*i/n),h+(rng.random()-.5)*.10) for i,(a,b) in enumerate(outline)]
            rows=[row(.94,-1.62),row(1,-1.2),row(1,-.65),row(.965,-.3)]
            for i in range(3):p.surface(rows[i:i+2],['tuff',c,c][i],closed=True)
            p.mesh(rows[-1],[list(range(n))],c)
    else:
        with p.section('Dock spar and pressure decking'):
            pier(p,0,4.2,17,7.3,-.32,'slate',False)
            for side in [-1,1]:
                truss(p,(side*7.9,.5,-.8),(side*6,7.8,-1.15),.75)
                for i in range(4):
                    x=side*(1.3+i*1.9)
                    p.rod((x,.9,-.7),(x,7.3,-1.38),.19,'iron')
    with p.section('Pad | removable landing surface'):
        p.lathe((0,0,0),[(4.74,-.8),(5.38,-.51),(5.30,-.16),(5.12,-.025),(5.0,-.035)],'iron',72,smooth=False)
        # Radial plates have their own faces and shallow seams, like an actual flight deck.
        for j in range(4):
            for i in range(24):
                r0=max(.018,j*1.25+.012);r1=(j+1)*1.25-.012
                a=tau*(i+.018)/24;b=tau*(i+.982)/24;m=(a+b)/2
                pts=[(r*cos(t),r*sin(t),-.001) for r,t in [(r0,a),(r1,a),(r1,m),(r1,b),(r0,b),(r0,m)]]
                p.mesh(pts,[(0,1,2,3,4,5)],'slate' if (i+j*7)%11 else 'rail')
        for i in range(44):
            a=tau*i/44
            p.box((4.55*cos(a),4.55*sin(a),.009),(.46,.088,.018),accent,a+pi/2,.006)
        for i in [-1,1]:
            for j in range(3):p.box((i*(3.42+.17*j),0,.011),(.071,1.1-.26*j,.021),'chalk',bevel=.004)
        for s in [-1,1]:
            p.box((s*1.29,0,.010),(.22,2.1,.02),'chalk',bevel=.005)
        p.box((0,0,.012),(2.62,.19,.023),'chalk',bevel=.005)
    with p.section('Perimeter guidance fittings'):
        for i in range(20):
            a=tau*i/20;x=5.23*cos(a);y=5.23*sin(a)
            p.lathe((x,y,-.17),[(.085,0),(.095,.15),(.072,.22)],'ink',8)
            p.ball((x,y,.062),(.067,.067,.047),'light',8,4)
    with p.section('Freight apron and cargo'):
        pier(p,5.8,3.7,3.65,5.3,-.02,posts=False)
        for i in range(11):
            x=5.95+(i%3)*.64;y=1.97+((i//3)%3)*.60;z=.013 if i<9 else .42
            boxcargo(p,x,y,z,.56,['ochre','teal','oxide','wood'][i%4],(i%2)*.08)
        railing(p,(7.59,1.2,-.02),(7.59,5.9,-.02),'rail')
    p.marks={'landing_center':(0,0,0),'approach_axis':(0,-8,0),'freight_quay':(5.8,3.7,0)}

def boardwalk(p,x0,y0,x1,y1,w=.8,z=.08):
    dx=x1-x0;dy=y1-y0;d=hypot(dx,dy);a=atan2(dy,dx)
    p.box(((x0+x1)/2,(y0+y1)/2,z-.08),(d,w,.16),'wood',a)
    for i in range(int(d/.3)):
        t=(i+.5)*.3/d;p.box((x0+dx*t,y0+dy*t,z+.001),(.025,w*.98,.016),'brown',a)
    sx=-dy/d*w/2;sy=dx/d*w/2
    railing(p,(x0+sx,y0+sy,z),(x1+sx,y1+sy,z),'rim',.30)

def stones(p,x,y,z,w,d,h,c,n=8):
    rng=p.random;shape=[(cos(tau*i/n)*rng.uniform(.85,1),sin(tau*i/n)*rng.uniform(.85,1)) for i in range(n)]
    rows=[[(x+u*w*f+dx,y+v*d*f,z+t*h+rng.uniform(-.032,.032)*h) for u,v in shape] for f,dx,t in [(1,0,0),(.96,.025,.45),(.76,.12,.84),(.51,.15,1)]]
    for i in range(3):p.surface(rows[i:i+2],c,closed=True)
    p.mesh(rows[-1],[list(range(n))],c)

def crane(p,x,y,z,scheme='ochre',name='Quay',reach=2.65):
    p.lathe((x,y,z),[(.64,0),(.7,.13),(.43,.3),(.34,1.1),(.46,1.17)],'iron')
    pivot=(x,y,z+1.2);yaw=name+'_slew';hook=name+'_hoist'
    p.joint_spec(yaw,pivot,(0,0,1),[0,-25,0,25,0])
    yp=y-.45
    with p.section(name+' | slewing head and lattice jib',yaw):
        p.box((x,y,z+1.45),(.90,.84,.48),scheme)
        p.box((x-.15,y+.45,z+1.53),(.77,.62,.51),'rail')
        for s in [-1,1]:
            u=x+s*.25
            p.wire([(u,y,z+1.48),(u,y+.30,z+2.72),(u,y-reach,z+3.1),(u,y,z+1.48)],.066,scheme)
            for i in range(5):
                a=i/5;b=(i+1)/5
                p.rod((u,y-(reach*a),z+1.48+a*1.62),(u,y+.3-(reach+.3)*b,z+2.72+b*.38),.036,'iron')
        p.rod((x-.35,y-reach,z+3.1),(x+.35,y-reach,z+3.1),.13,'gold')
    tip=(x,y-reach,z+3.09)
    # Fixed-length cable winds into an opaque sheave housing at the head.
    p.joint_spec(hook,tip,(0,0,1),[0,.30,.55,.30,0],'slide',yaw)
    with p.section(name+' | hook and suspended parcel',hook):
        for s in [-1,1]:p.rod((x+s*.075,y-reach,z+3.04),(x+s*.075,y-reach,z+1.65),.022,'ink')
        p.box((x,y-reach,z+1.57),(.32,.21,.16),scheme)
        for s in [-1,1]:p.rod((x,y-reach,z+1.52),(x+s*.27,y-reach,z+1.23),.019,'rim')
        boxcargo(p,x,y-reach,z+.77,.67,'oxide')

def stack(p,x,y,z,h,r=.36):
    p.lathe((x,y,z),[(r*1.5,0),(r*1.35,.27),(r,h*.40),(r*.67,h*.93),(r*.93,h*.95),(r*.93,h)],'copper',20)
    for q in [.3,.59,.87]:p.ring((x,y,z+h*q),r*(1.10-q*.45),.046,'iron')
    p.lathe((x,y,z+h),[(r*.63,0),(r*.63,.012)],'ink',20)
