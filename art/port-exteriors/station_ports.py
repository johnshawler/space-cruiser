"""Dockable deep-space stations. Each instruments assembly has its own mechanical pivots."""
from math import pi,tau,sin,cos
from mathutils import Vector
from dockworks import *

def spine(p,hull,trim):
    with p.section('Service truss, berth and solar wings'):
        for side in [-1,1]:
            x=side*7.3;y=7.25;z=.55
            p.rod((x-side*1.7,y,z),(x+side*2.45,y,z),.12,'rail')
            for k in range(3):
                xx=x+side*k*.83;yy=y+.93;zz=z+.22
                p.box((xx,yy,zz),(.79,2.9,.09),trim)
                for row in range(5):
                    for col in range(2):p.box((xx+(col-.5)*.325,yy+(row-2)*.51,zz+.058),(.30,.475,.026),'navy')
        roofhall(p,5.78,6.25,0,3.2,2.5,1.38,hull,trim,'rail')
        for i in range(3):p.box((5.62+i*.26,4.9,.78),(.12,.19,1.02),'light')
        truss(p,(-7.7,5.3,.65),(-4.7,7.3,1.15),.44,'iron')

def hush(p):
    spine(p,'slate','blue')
    x,y,z=-2.6,6.25,2.10
    with p.section('Radio telescope azimuth plinth'):
        p.lathe((x,y,0),[(1.77,0),(1.89,.24),(1.35,.45),(.92,1.35),(1.12,1.48)],'slate')
        p.ring((x,y,1.48),1.02,.10,'copper')
        roofhall(p,-6.25,6.35,0,2.9,2,1.45,'blue','slate','iron','gable')
    p.joint_spec('Antenna_azimuth',(x,y,1.48),(0,0,1),[0,16,30,14,0])
    with p.section('Azimuth yoke','Antenna_azimuth'):
        p.lathe((x,y,1.48),[(1.02,0),(.96,.18)],'iron')
        for side in [-1,1]:
            p.wire([(x+side*.87,y-.65,1.6),(x+side*1.31,y,z+1.13),(x+side*.87,y+.65,1.6)],.16,'chalk')
            p.rod((x+side*1.41,y,z+1.14),(x+side*1.16,y,z+1.14),.38,'gold')
    pivot=(x,y,z+1.14)
    p.joint_spec('Dish_elevation',pivot,(1,0,0),[0,5,12,6,0],parent='Antenna_azimuth')
    with p.section('Dish petals, feed and backup truss','Dish_elevation'):
        center=Vector(pivot);normal=Vector((0,-.70,.715)).normalized();u=Vector((1,0,0));v=normal.cross(u)
        def pos(rad,theta,h):return tuple(center+u*(rad*cos(theta))+v*(rad*sin(theta))+normal*h)
        rr=[0,.57,1.15,1.72,2.3,2.85,3.26]
        for i in range(32):
            a=tau*i/32;b=tau*(i+1)/32
            rows=[[pos(r,a,.05+.105*r*r),pos(r,b,.05+.105*r*r)] for r in rr]
            p.surface(rows,'chalk' if i%4==0 else 'ivory',True)
            if i%2==0:p.wire([row[0] for row in rows],.027,'gold')
            if i%4==0:
                p.wire([pos(.24,a,-.20),pos(1.65,a,-.22),pos(3.22,a,1.12)],.07,'rail')
        for r in [1.72,3.27]:
            p.wire([pos(r,tau*i/48,.05+.105*r*r) for i in range(49)],.055,'rim')
        feed=pos(0,0,2.67)
        for i in range(3):p.rod(pos(2.8,tau*i/3,.88),feed,.053,'iron')
        p.ball(feed,(.20,.20,.2),'copper')

def rime(p):
    spine(p,'ice','slate')
    with p.section('Frozen specimen bank and intake'):
        for j,(x,y,r,h) in enumerate([(-5.8,6.2,1.03,3.2),(-3.5,6.8,1.28,4.4),(-.8,7.2,1.16,3.6),(1.57,7.48,.91,2.9)]):
            tanks(p,x,y,0,r,h,'cool','chalk')
            for side in [-1,1]:
                p.rod((x+side*r*.77,y-r*.69,.20),(x+side*r*.77,y-r*.69,h*.82),.095,'ivory')
            p.rod((x,y,h*1.05),(x,y,h*1.05+.27),.27,'slate')
            p.wire([(x,y+r*.5,.42),(x,y+1.65,.42),(x+1.42,y+1.65,.42)],.13,'ice')
        roofhall(p,-2.45,4.83,.0,4.7,1.75,1.45,'ice','snow','slate')
        p.box((-2.44,3.88,.75),(1.62,.16,1.38),'navy')
        for s in [-1,1]:p.box((-2.44+s*.85,3.8,.86),(.095,.11,1.36),'light')
    for name,xx,sgn in [('Pressure_door_A',-2.84,-1),('Pressure_door_B',-2.05,1)]:
        p.joint_spec(name,(xx,3.73,0),(sgn,0,0),[0,0,.67,.67,0],'slide')
        with p.section(name,name):
            p.box((xx,3.74,.72),(.78,.13,1.37),'chalk')
            p.box((xx,3.655,.89),(.45,.035,.35),'blue');p.box((xx,3.643,.37),(.52,.031,.09),'ochre')
    p.joint_spec('Sample_rack',(3.04,5.2,.3),(0,-1,0),[0,.15,1.22,.15,0],'slide')
    with p.section('Specimen shuttle','Sample_rack'):
        p.box((3.04,5.2,.31),(1.35,1.30,.26),'blue')
        for k in range(3):tanks(p,2.6+k*.44,5.2,.47,.18,.68,'cool','rail')

def spire(p):
    spine(p,'slate','gold');x,y=-2.35,6.15
    with p.section('Measurement tower and datum stage'):
        for s in [-1,1]:
            for d in [-1,1]:
                p.wire([(x+s*2,y+d*1.45,.08),(x+s*.38,y+d*.23,3.25),(x+s*.15,y+d*.09,7.4)],.115,'gold')
        p.lathe((x,y,0),[(1.13,0),(.91,.51),(.47,2.1),(.29,5.33),(.13,7.5),(.03,8.13)],'chalk',22)
        for t,r in [(.68,1.16),(2.44,.79),(5.26,.48),(7.05,.32)]:p.ring((x,y,t),r,.077,'gold')
        roofhall(p,-6.22,6.22,0,2.9,2.25,1.34,'slate','gold','chalk')
    pivot=(x,y,4.14)
    for name,r,normal,axis,values,col,parent in [
        ('Azimuth_circle',2.35,(.15,0,1),(0,0,1),[0,45,90,45,0],'gold',None),
        ('Meridian_circle',1.85,(0,1,.12),(1,0,0),[0,20,48,20,0],'copper','Azimuth_circle'),
        ('Survey_alidade',1.30,(1,0,.3),(0,1,0),[0,-20,-42,-20,0],'chalk','Meridian_circle')]:
        p.joint_spec(name,pivot,axis,values,parent=parent)
        with p.section(name,name):
            p.ring(pivot,r,.083,col,normal,56)
            n=Vector(normal).normalized();u=n.cross(Vector((0,1,0))).normalized();v=n.cross(u)
            for j in range(28):
                dr=u*cos(tau*j/28)+v*sin(tau*j/28)
                p.rod(tuple(Vector(pivot)+dr*r),tuple(Vector(pivot)+dr*(r+(.16 if j%7==0 else .07))),.018,'chalk')
            if name=='Survey_alidade':
                p.rod((x-1.28,y,4.14),(x+1.28,y,4.14),.093,'iron')
                p.ball(pivot,(.44,.44,.44),'amber')

def wink(p):
    spine(p,'brick','gold');x,y=-2.85,6.60
    with p.section('Lighthouse tower, lantern gallery and stairs'):
        profile=[(1.67,0),(1.52,.45),(1.29,1.86),(1.11,3.32),(.93,4.68),(.81,5.70)]
        for j in range(len(profile)-1):p.lathe((x,y,0),profile[j:j+2],'chalk' if j%2==0 else 'oxide',36)
        for k,(r,h) in enumerate(profile[1:]):p.ring((x,y,h),r,.058,'rail')
        for j in range(3):
            h=1.1+j*1.48;r=1.45-j*.21
            p.box((x,y-r+.025,h),(.39,.12,.52),'gold');p.box((x,y-r-.044,h),(.27,.05,.39),'navy')
        p.lathe((x,y,5.52),[(.88,0),(1.42,.18),(1.44,.33)],'iron')
        p.ring((x,y,6.29),1.38,.039,'gold')
        for j in range(18):
            a=tau*j/18;p.rod((x+1.37*cos(a),y+1.37*sin(a),5.84),(x+1.37*cos(a),y+1.37*sin(a),6.30),.032,'gold')
        for j in range(10):
            a=tau*j/10;p.rod((x+.94*cos(a),y+.94*sin(a),5.85),(x+.94*cos(a),y+.94*sin(a),6.98),.053,'copper')
        p.lathe((x,y,6.97),[(1.18,0),(1.22,.095),(.78,.35),(.40,.53),(.11,.56)],'oxide',32)
        p.rod((x,y,7.43),(x,y,8.0),.085,'gold',.012)
        roofhall(p,-6.30,5.7,0,3.2,2.0,1.31,'brick','slate','chalk','gable')
        pier(p,-6.3,3.4,1.1,3,.01,'iron',False)
    p.joint_spec('Lantern_carriage',(x,y,5.83),(0,0,1),[0,90,180,270,360])
    with p.section('Fresnel lamp and rotating bullseye','Lantern_carriage'):
        p.ball((x,y,6.44),(.38,.38,.52),'light')
        for j in range(7):p.ring((x,y,6.10+j*.106),.48-.024*abs(j-3),.04,'amber')
        p.rod((x,y-.42,6.44),(x,y-.57,6.44),.34,'gold')
        p.rod((x,y-.58,6.44),(x,y-.61,6.44),.26,'light')
        p.box((x,y+.59,6.41),(.77,.16,.79),'copper')
    p.joint_spec('Semaphore',(-5.35,4.52,2.05),(0,1,0),[0,0,-48,-48,0])
    with p.section('Signal mast'):p.rod((-5.35,4.52,0),(-5.35,4.52,2.29),.071,'rail')
    with p.section('Freight signal arm','Semaphore'):
        p.box((-4.85,4.52,2.05),(1.12,.12,.18),'oxide')
        p.box((-4.42,4.52,2.05),(.13,.127,.19),'chalk')
