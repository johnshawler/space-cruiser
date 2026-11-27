"""Nine planetary districts. Each function authors its skyline and physical equipment."""
from math import pi, tau, sin, cos
from dockworks import *

def greenhouse(p,x,y,w,d,h):
    b=.62;r=w/2
    p.box((x,y,b/2),(w+.2,d+.2,b),'stone')
    def arc(v):return [(x+r*cos(pi*i/20),v,b+h*sin(pi*i/20)) for i in range(21)]
    rows=[arc(y-d/2+i*d/6) for i in range(7)]
    p.surface(rows,'glass',True)
    for line in rows:p.wire(line,.066,'gold')
    for i in range(1,20,2):
        p.rod(rows[0][i],rows[-1][i],.032,'rim')
    for side in [-1,1]:
        yy=y+side*d/2
        pts=arc(yy);p.mesh(pts,[list(range(21))],'teal')
        for i in range(-3,4):
            dx=i*r*.22;top=b+h*(1-(dx/r)**2)**.5
            p.box((x+dx,yy-.025,(top+b)/2),(r*.185,.06,top-b-.04),'glass')
    roofhall(p,x,y-d*.53,.01,w*.72,.62,b+.58,'jade','copper')
    for s in [-1,1]:
        for i in range(3):p.ball((x+s*(r-.1),y-d*.40+i*d*.38,b+.12),(.43,.52,.36),'leaf')

def garden(p):
    with p.section('Dispatch conservatory and orchard terraces'):
        greenhouse(p,-3.6,6.1,5.7,4.3,3.0)
        greenhouse(p,3.0,8.15,3.1,2.0,1.56)
        for k in range(3):
            y=6.8+k*1.0;p.box((-7.95,y,.05+k*.22),(3.25,1.15,.65+k*.38),'stone')
            for j in range(3):
                x=-9+j*1.04;z=.38+k*.4;p.rod((x,y,z),(x,y,z+1.1),.1,'brown')
                for dx,dy,dz in [(-.24,0,.82),(.25,.1,1.0),(0,-.18,1.25)]:
                    p.ball((x+dx,y+dy,z+dz),(.42,.42,.43),'leaf' if dx<0 else 'jade',12,6)
        for i in range(2):
            x=-6.75+i*.57;p.box((x,3.71,.60),(.49,.47,1.24),'oxide')
            p.box((x,3.46,.79),(.33,.04,.38),'light');p.box((x,3.46,.28),(.21,.04,.09),'ink')
    x,y,z=-3.65,3.77,2.60
    with p.section('Station clock and dial'):
        p.rod((x,y+.13,z),(x,y-.13,z),.72,'gold',n=46)
        p.rod((x,y-.14,z),(x,y-.16,z),.63,'ivory',n=46)
        for i in range(12):
            a=i*tau/12;p.rod((x+.50*sin(a),y-.19,z+.50*cos(a)),(x+.58*sin(a),y-.19,z+.58*cos(a)),.018,'ink')
    for name,reach,ang,rot,offset in [('Clock_sweep',.51,.2,360,.015),('Clock_pendulum',.34,3.14,0,.035)]:
        yy=y-.208-offset
        if name=='Clock_pendulum': z-=.86
        p.joint_spec(name,(x,yy,z),(0,1,0),[0,rot/4,rot/2,3*rot/4,rot] if rot==360 else [0,19,0,-19,0])
        with p.section(name,name):
            tip=(x+sin(ang)*reach,yy,z+cos(ang)*reach)
            p.rod((x,yy,z),tip,.036,'ink')
            if name=='Clock_pendulum':p.ball(tip,(.14,.06,.14),'gold')
    with p.section('Garden salvage workshop'):roofhall(p,6.65,6.5,0,3.25,2.55,1.55,'aqua','copper','chalk','gable')

def lava(p):
    with p.section('Basalt cuts and molten channels'):
        for i in range(17):
            x=-10+i*.98;y=8.8+.8*sin(i*.72);h=1.3+2.0*(.5+.5*cos(i*.76))
            stones(p,x,y,-.38,.94,.86,h,'basalt',7)
        for i in range(4):
            x=-8.9+1.18*i;y=6.9
            p.lathe((x,y,0),[(.85,0),(.81,.8+i*.26)],'basalt',6,turn=.23,smooth=False)
        pts=[(-10,-.8,-.23),(-9,1.3,-.23),(-8.45,3.3,-.23),(-7.9,5.9,-.23),(-6.95,8.1,-.23)]
        p.surface([[(x-.26,y,z),(x+.26,y,z)] for x,y,z in pts],'fire')
    with p.section('Smelter and ore receiving yard'):
        roofhall(p,-2.0,6.7,0,4.6,3.3,2.15,'basalt','oxide','copper')
        for j in range(3):stack(p,-3.4+j*1.06,7.3,1.8,2.4+.62*(j==1))
        p.box((-2,4.98,.80),(2.04,.12,1.18),'ink')
        for i in range(7):p.box((-2.83+i*.277,4.89,.76),(.17,.04,.7),'fire')
        for i in range(5):
            a=i*.25
            p.lathe((5.65,6.4,0),[(2.08-.13*i,1.43+a),(1.95-.12*i,1.68+a)],'copper' if i%2 else 'oxide',28,(1,.78))
        roofhall(p,5.65,6.42,0,3.55,2.82,1.4,'brick','iron')
    crane(p,-6.2,4.4,.10,'amber','Ore',2.3)

def canyon(p):
    with p.section('Sandstone canyon terraces'):
        for i in range(9):
            x=-9.8+i*2.0;y=8.1+1.0*sin(i);h=2.9+1.45*cos(i*.84)
            for j in range(3):
                stones(p,x+.11*j,y,-.26+h*j*.28,1.86-.13*j,1.42-.14*j,h*.40,['stone','sand','sand'][j])
    with p.section('Customs office and recessed freight doors'):
        for i in range(4):
            p.box((-2.4,6.75+i*.16,1.0+i*.76),(7.8-i*1.03,4.3-i*.47,2.0),'sand')
        p.box((-2.4,4.55,1.5),(3.5,.24,3.15),'stone');p.box((-2.4,4.40,1.37),(3.12,.14,2.68),'ink')
        for i in range(5):
            for side in [-1,1]:p.box((-2.4+side*(2.0+i*.245),4.53+i*.16,1.34+i*.16),(.20,.43,2.8+i*.28),'chalk')
        for i in range(5):p.box((-2.4,5+i*.5,4.54),(2.1,.19,.25),'stone')
        roofhall(p,6.4,7.1,0,3.65,2.35,1.65,'sand','brick','stone')
        for j in range(3):
            yy=4.1+j*.55;railing(p,(3.2,yy,.03),(5.7,yy,.03),'oxide')
        for i in range(6):
            x=1.65+i*.68;p.rod((x,5.7,0),(x,5.7,1.68),.036,'rail')
        p.surface([[(1.62,5.6,1.75),(5.13,5.6,1.75)],[(1.62,6.55,1.91),(5.13,6.55,1.91)]],'linen')
    for i,(name,dx,sgn) in enumerate([('Gate_west',-.73,-1),('Gate_east',.73,1)]):
        x=-2.4+dx;y=4.28
        p.joint_spec(name,(x,y,0),(1,0,0),[0,0,.93,.93,0],'slide') if sgn>0 else p.joint_spec(name,(x,y,0),(-1,0,0),[0,0,.93,.93,0],'slide')
        with p.section(name,name):
            p.box((x,y,1.32),(1.43,.12,2.56),'iron')
            for j in range(6):p.box((x,y-.07,.24+j*.4),(1.37,.05,.07),'rail')

def harbor(p):
    with p.section('Tidal basin, piers and waterfront'):
        p.lathe((0,2.5,-.24),[(1,-.09),(1,0)],'sea',64,(10.82,7.39))
        for j in range(3):
            x=-9.0+j*1.0;pier(p,x,-.2,0.74,4.3,.03)
        boardwalk(p,-7.1,2.25,-3.1,3.53)
        roofhall(p,6.5,6.5,0,3.4,2.2,1.51,'teal','ivory','blue','gable')
    with p.section('Split bowl shipyard shells'):
        x,y=-2.6,6.8
        for side in [-1,1]:
            for j in range(12):
                a=(.09+j*.075)*pi/2;b=a+.075*pi/2
                def profile(t):return [(x+side*(1.2+2.08*sin(t)),y+v, .12+3.25*(1-cos(t))+.16*(v/2)**2) for v in [-2.15,-1.08,0,1.08,2.15]]
                ra,rb=profile(a),profile(b);p.surface([ra,rb],'blue' if j in (8,11) else 'ivory')
                for aa,bb in zip(ra,rb):p.rod(aa,bb,.038,'gold')
                if j==11:p.wire(rb,.11,'blue')
        pier(p,x,y,3.0,4.5,.12,posts=False)
        for i in range(5):p.box((x,y-1.5+i*.72,.31),(2.18,.18,.35),'iron')
    crane(p,-3.2,8.8,.06,'amber','Ladle',2.6)

def crystal(p):
    with p.section('Crystal headlands'):
        rng=p.random
        for i in range(38):
            side=-1 if i%2 else 1;x=side*rng.uniform(7.25,10);y=rng.uniform(1,9);h=rng.uniform(1.0,4.7)
            p.lathe((x,y,-.33),[(.36,0),(.40,h*.68),(.23,h*.83),(.018,h)],['violet','plum','rose'][i%3],5,(1,.83),rng.random()*4,False)
    with p.section('Feather market and cargo perches'):
        for j,(x,y,z) in enumerate([(-3,6,.90),(4.3,6.9,1.35)]):
            pier(p,x,y,4.9,3.7,z,'gold');roofhall(p,x,y,z,3.45,2.6,1.4,'plum','violet','gold')
            for i in range(5):
                u=x-2.1+i*.86;v=y+.36
                rows=[]
                for t in [0,.16,.36,.60,.82,1]:
                    w=.70*(sin(pi*t)**.65) if t<1 else .008
                    rows.append([(u+1.14*t*t+q*w,v+.66*t+q*.16,z+1.18+2.82*t+.13*(1-abs(q))) for q in [-1,0,1]])
                p.surface(rows,['plum','violet','copper','teal','chalk'][i])
                p.wire([r[1] for r in rows],.045,'gold')
                for k in range(1,5):p.rod(rows[k][1],rows[k][0],.018,'gold')
        boardwalk(p,-1.2,6.2,2.25,6.2,1,1.00)
    crane(p,6.5,5.5,.12,'copper','Perch',1.9)

def cap(p,x,y,z,r,h,c):
    p.lathe((x,y,z),[(.33*r,0),(.22*r,.35*h),(.16*r,.65*h),(.27*r,.77*h)],'linen',22,(1,.88))
    rng=p.random;n=42
    variation=[rng.uniform(.95,1.06) for i in range(n)]
    rows=[]
    for rr,hh in [(.20,.70),(.64,.68),(1,.73),(1.02,.77),(.8,.87),(.38,.97),(.05,1)]:
        rows.append([(x+r*rr*v*cos(tau*i/n),y+r*.87*rr*v*sin(tau*i/n),z+h*hh+.08*rr*sin(i*.99)) for i,v in enumerate(variation)])
    for j in range(6):p.surface(rows[j:j+2], 'linen' if j<2 else c,True,True)
    for i in range(0,n,2):p.wire([rows[0][i],rows[1][i],rows[2][i]],.032,'chalk')

def fungal(p):
    with p.section('Cantharelle roofs and damp-log depot'):
        for i,(x,y,r,h) in enumerate([(-3.7,6.7,3.15,4.4),(-6.5,5.8,2.12,3.1),(-1.3,7.5,1.96,4.60),(5.5,7,2.55,3.35),(7.5,6.3,1.2,2.55)]):
            cap(p,x,y,0,r,h,['ochre','copper','amber'][i%3])
        roofhall(p,-3.4,5.75,0,3.95,1.82,1.91,'teal','moss','wood')
        roofhall(p,5.50,6.5,0,3.5,2.0,1.4,'wood','pine','moss','gable')
        boardwalk(p,-7.9,1.4,-4.9,4.75,.95);boardwalk(p,2.4,6.05,5.95,5.25)
        rng=p.random
        for i in range(27):
            x=rng.choice([-1,1])*rng.uniform(7.1,9.6);y=rng.uniform(-1.1,6);h=rng.uniform(.28,.75)
            cap(p,x,y,-.25,h*.8,h,'lime' if i%4==0 else 'ochre')
    # A two-bucket vertical chain lift travels between goods deck and canopy.
    x,y=-6.05,5.1
    with p.section('Spore lift scaffold'):
        for dx in [-.46,.46]:p.rod((x+dx,y,0),(x+dx,y,2.82),.07,'wood')
        p.rod((x-.59,y,2.84),(x+.59,y,2.84),.09,'iron')
    for name,xoff,k in [('Harvest_basket',-.31,[0,.7,1.41,.72,0]),('Counterweight',.31,[0,-.7,-1.41,-.72,0])]:
        z=.38 if xoff<0 else 2.03;p.joint_spec(name,(x+xoff,y,z),(0,0,1),k,'slide')
        with p.section(name,name):
            p.lathe((x+xoff,y,z),[(.22,0),(.31,.28),(.29,.42)],'copper' if xoff<0 else 'iron',12)
            p.rod((x+xoff,y,z+.39),(x+xoff,y,z+.77),.027,'gold')
    with p.section('Lift guide chains'):
        for dx in [-.31,.31]:p.rod((x+dx,y,.32),(x+dx,y,2.84),.017,'iron')

def cloudport(p):
    with p.section('Buoyant pontoons and hanging wharves'):
        for y in [0,3.8,6.8]:
            for x in [-5.8,5.8]:
                p.ball((x,y,-1.34),(1.55,1.32,.85),'rose')
                for dx in [-.8,0,.8]:p.ring((x+dx,y,-1.34),.85,.064,'gold',(1,0,0),24)
        pier(p,-4.1,6.1,6.7,3.1,.04,'wood',False);pier(p,4.0,6.5,4.65,2.8,.15,'wood',False)
        roofhall(p,-4.25,6.5,.04,4.45,2.25,1.95,'brown','plum','copper')
        roofhall(p,4.15,6.70,.15,3.63,2.12,1.52,'stone','rose','wood','gable')
        for j in range(8):
            x=-6.49+j*.58;c='rose' if j%2 else 'plum'
            p.surface([[(x,5.35,1.8),(x+.57,5.35,1.8)],[(x,4.35,1.55),(x+.57,4.35,1.55)],[(x,4.31,1.34),(x+.57,4.31,1.34)]],c)
        for x in [-7,-2.2,2.1,6.4]:
            p.rod((x,5.4,0),(x,5.4,2.37),.061,'copper')
        for l,r in [(-7,-2.2),(-2.2,2.1),(2.1,6.4)]:
            p.wire([(l+(r-l)*i/10,5.39,2.35-.44*sin(pi*i/10)) for i in range(11)],.029,'gold')
        boardwalk(p,-2.0,5.5,2.2,6.05,.85,.36)
    for name,x,y,z in [('West_windvane',-5.8,6.7,2.60),('East_windvane',5.0,6.8,2.26)]:
        with p.section('Vane spindles'):p.rod((x,y,z-.3),(x,y,z+1.45),.052,'copper')
        p.joint_spec(name,(x,y,z+1.45),(0,0,1),[0,37,-15,-27,0])
        with p.section(name,name):
            p.rod((x-.72,y,z+1.45),(x+.7,y,z+1.45),.043,'gold')
            p.mesh([(x-.73,y,z+1.82),(x-.12,y,z+1.46),(x-.73,y,z+1.14)],[(0,1,2)],'plum')
            p.ball((x+.59,y,z+1.45),(.12,.11,.11),'gold')

def drift(p):
    with p.section('Cloud floats and shipwright slip'):
        for i in range(7):
            x=-7+i*2.3;y=4.2+.38*cos(i);p.ball((x,y,-1.28),(1.38,1.35,1.27),'gold',22,10)
            p.ring((x,y,-1.24),1.35,.065,'iron');p.rod((x,y,-.52),(x,y,.18),.16,'rail')
        pier(p,-2,6.7,8.0,4.0,.09,'ivory',False)
        roofhall(p,6.25,6.9,0,3.63,2.34,1.61,'ivory','teal','gold')
        for i in range(4):
            x=-6.1+i*1.88;rows=[]
            for t in [0,.13,.29,.48,.68,.86,1]:
                w=(.65*(1-t)**.5+.03)
                rows.append([(x+4*t*t+q*w,6.1+1.38*t+q*.44,.13+4.64*sin(t*pi*.51)+.15*(1-abs(q))) for q in [-1,0,1]])
            p.surface(rows,'ivory',True);p.wire([a[0] for a in rows],.063,'gold');p.wire([a[2] for a in rows],.064,'gold')
            for k in [1,2,3,4]:p.rod(rows[k][0],rows[k][2],.035,'gold')
        for i in range(6):p.box((-4.8+i*1.03,5.9,.41),(.2,2.1,.52),'slate')
    for name,x,y in [('Trim_impeller_port',-7.42,3.65),('Trim_impeller_starboard',7.37,3.65)]:
        z=-.86
        with p.section('Thruster shrouds'):
            p.ring((x,y,z),.77,.12,'gold',(0,1,0));p.rod((x,y+.13,z),(x,y+.7,z),.23,'iron')
        p.joint_spec(name,(x,y,z),(0,1,0),[0,90,180,270,360])
        with p.section(name,name):
            for i in range(5):
                a=tau*i/5
                def q(r,b,off):return (x+r*cos(a+b),y+off,z+r*sin(a+b))
                p.mesh([q(.12,0,0),q(.71,.15,0),q(.70,.54,.035),q(.32,.65,.08)],[(0,1,2,3)],'chalk')
            p.ball((x,y-.09,z),(.20,.16,.20),'copper')

def winter(p):
    with p.section('Blue ice ridge and covered polar huts'):
        for i in range(12):
            x=-10+i*1.65;h=1.7+1.7*(.5+.5*cos(i*1.45))
            stones(p,x,8.6,-.3,1.5,1,h,'ice',7)
            stones(p,x+.1,8.6,h*.72,1.0,.75,h*.32,'snow',7)
        for k,(x,y,r) in enumerate([(-4.6,5.9,2.50),(-.4,7.6,1.86),(5.45,6.6,2.05)]):
            p.lathe((x,y,0),[(r,0),(r,.72),(r*.9,1.26),(r*.68,1.76),(r*.30,2.16),(.08,2.23)],'chalk',32,(1,.85))
            p.lathe((x,y,0),[(r*.965,.88),(r*.91,1.30),(r*.70,1.85),(r*.32,2.20),(.09,2.28)],'snow',32,(1,.85))
            for i in range(9):
                a=pi+i*pi/8
                p.wire([(x+r*rr*cos(a),y+r*.85*rr*sin(a),h) for rr,h in [(1,.18),(.99,.8),(.9,1.3),(.7,1.82),(.32,2.19)]],.055,'slate')
            for j in [-1,0,1]:
                u=x+j*.58;v=y-r*.83-.02
                p.box((u,v,.64),(.51,.16,.58),'copper');p.box((u,v-.11,.65),(.39,.06,.42),'light')
            stack(p,x+r*.49,y+.12,1.62,1.32,.15)
        for i in range(2):roofhall(p,(-2.2,2.7)[i],6.9,0,2.15,1.12,.96,'oxide','snow','rim','gable')
    with p.section('Blanket dispatch rail'):
        for y in [3.5,3.98]:
            p.rod((-4.5,y,.09),(-.75,y,.09),.049,'iron')
        for i in range(12):p.box((-4.5+i*.34,3.74,.015),(.08,.70,.08),'brown')
    p.joint_spec('Blanket_trolley',(-4.1,3.74,.15),(1,0,0),[0,1.24,2.7,1.24,0],'slide')
    with p.section('Cargo trolley and wrapped parcels','Blanket_trolley'):
        x,y=-4.1,3.74;p.box((x,y,.30),(.78,.59,.19),'oxide')
        for a in [-.25,.25]:
            for b in [-.24,.24]:p.rod((x+a,y+b-.04,.17),(x+a,y+b+.04,.17),.13,'ink')
        for i in range(3):p.box((x+.03*i,y,.48+i*.13),(.58,.43,.13),['rose','plum','oxide'][i])
    x,y=5.4,5.0
    p.joint_spec('Weather_rotor',(x,y,3.18),(0,0,1),[0,90,180,270,360])
    with p.section('Weather mast'):p.rod((x,y,0),(x,y,3.18),.065,'copper')
    with p.section('Anemometer cups','Weather_rotor'):
        for i in range(3):
            a=i*tau/3;end=(x+.42*cos(a),y+.42*sin(a),3.18)
            p.rod((x,y,3.18),end,.032,'gold');p.ball(end,(.13,.1,.09),'oxide')
