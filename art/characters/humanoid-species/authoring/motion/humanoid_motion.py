"""Author root-motion walks, chaired reaches and facial performances on the existing humanoid rigs."""
from pathlib import Path
import argparse, json, math, sys
import bpy
import numpy as np
from mathutils import Vector,Quaternion,Euler,Matrix

FPS=24
WALK=96
SIT=48
REACH=66
FACE=126
BODY_END=WALK+SIT+REACH
TOTAL=BODY_END+FACE
SIDES=('.R','.L')
# Frames per stride, stride / leg length, double-support fraction (per foot stance above one half),
# swing clearance / leg length, lateral weight transfer / leg, arm swing, chest pitch and head compensation.
CAST={
'Taluun':(33,1.10,.61,.105,.073,18,5,3),
'Orrek':(41,.91,.67,.095,.105,12,8,2),
'Vessari':(29,1.31,.55,.195,.060,22,9,7),
'Mothren':(27,1.08,.57,.145,.062,17,5,4),
'Ureth':(40,1.12,.64,.090,.047,10,4,2),
'Keld':(38,.95,.66,.090,.110,13,7,2),
'Sovai':(32,1.16,.60,.135,.083,22,6,5),
'Brunn':(43,.99,.67,.103,.119,17,9,3),
'Pelrin':(26,1.21,.56,.168,.076,24,8,5),
'Zhavet':(34,1.30,.57,.179,.053,15,10,5),
'Koruun':(37,.88,.66,.094,.114,10,7,2),
'Eskel':(36,1.18,.62,.100,.052,11,5,3),
'Rhovi':(28,1.20,.57,.155,.077,17,9,6),
'Nemeya':(39,1.06,.65,.090,.055,14,3,2),
'Dathri':(37,.99,.65,.120,.094,15,8,3),
'Ulnor':(42,1.16,.66,.090,.060,10,4,2)}
def sm(t):
    t=max(0.,min(1.,t));return t*t*(3-2*t)
def prog(t,a,b):return sm((t-a)/(b-a))
def mix(a,b,t):return a+(b-a)*t
def unit(x):return x.normalized() if x.length>.00001 else Vector((0,-1,0))
def Q(x=0,y=0,z=0):return Euler(tuple(map(math.radians,(x,y,z)))).to_quaternion()
def coords(o):
    a=np.empty(len(o.data.vertices)*3,'f');o.data.vertices.foreach_get('co',a);return a.reshape(-1,3)
def material(n,c,rough,metal):
    obj=bpy.data.materials.get(n)
    if obj:return obj
    obj=bpy.data.materials.new(n);obj.diffuse_color=(*c,1);obj.use_nodes=True
    p=obj.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    if n.endswith('signal'):
        p.inputs['Emission Color'].default_value=(*c,1);p.inputs['Emission Strength'].default_value=.55
    return obj
def cylinder(coll,name,start,end,r1,r2,mat,segments=40):
    a=Vector(start);b=Vector(end);axis=unit(b-a);x=unit(axis.cross(Vector((0,1,0)) if abs(axis.y)<.85 else Vector((1,0,0))));y=axis.cross(x)
    verts=[tuple(p+(x*math.cos(2*math.pi*i/segments)+y*math.sin(2*math.pi*i/segments))*r) for p,r in ((a,r1),(b,r2)) for i in range(segments)]
    faces=[tuple(range(segments-1,-1,-1)),tuple(range(segments,segments*2))]
    faces.extend((i,(i+1)%segments,(i+1)%segments+segments,i+segments) for i in range(segments))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.materials.append(mat);mesh.update()
    for f in list(mesh.polygons)[2:]:f.use_smooth=True
    ob=bpy.data.objects.new(name,mesh);coll.objects.link(ob);return ob
class Tracks:
    def __init__(self):self.channels={};self.frame=1
    def put(self,path,value):
        vals=tuple(value) if not isinstance(value,(int,float,np.floating)) else (float(value),)
        self.channels.setdefault(path,{})[self.frame]=vals
    def action(self,rig,name,first=1,last=TOTAL,cycle=False):
        action=bpy.data.actions.new(name);action.use_fake_user=True
        slot=action.slots.new('OBJECT',rig.name);bag=action.layers.new('Performance').strips.new(type='KEYFRAME').channelbags.new(slot)
        for path,keys in self.channels.items():
            pairs=[(t,v) for t,v in keys.items() if first<=t<=last]
            if not pairs:continue
            t=np.array([v[0] for v in pairs],'f');values=np.array([v[1] for v in pairs],'f')
            for i,vs in enumerate(values.T):
                # Keep constant, first, last and discontinuity keys; smooth sampled motion is linear between frames.
                keep=np.ones(len(t),dtype=bool)
                if len(t)>2:keep[1:-1]=~((abs(vs[:-2]-vs[1:-1])<1e-8)&(abs(vs[1:-1]-vs[2:])<1e-8))
                c=bag.fcurves.new(path,index=i);ts=t[keep];ys=vs[keep];ks=c.keyframe_points;ks.add(len(ts))
                ks.foreach_set('co',np.column_stack((ts,ys)).ravel())
                for k in ks:k.interpolation='LINEAR'
                c.update()
                if cycle:
                    mod=c.modifiers.new('CYCLES')
                    if path=='pose.bones["Root"].location':mod.mode_before=mod.mode_after='REPEAT_OFFSET'
        action.asset_mark();action.asset_data.tags.new('Animation');return action
class Actor:
    def __init__(self,name):
        self.name=name;self.sc=bpy.data.scenes[name];bpy.context.window.scene=self.sc
        self.rig=bpy.data.objects[name+' | Rig'];self.rig.animation_data.action=None
        self.col=bpy.data.collections[name+' | character'];self.meshes=[o for o in self.col.objects if o.type=='MESH']
        self.p=self.rig.pose.bones;self.b=self.rig.data.bones
        self.h=float(max(coords(o)[:,2].max() for o in self.meshes))
        self.period,self.stride,self.duty,self.lift,self.sway,self.arm,self.pitch,self.nod=CAST[name]
        self.leg=min(self.b['Thigh'+s].length+self.b['Shin'+s].length for s in SIDES);self.stride*=self.leg
        self.tr=Tracks();self.pel=self.b['Pelvis'].head_local.copy();self.root=Vector((0,0,0));self.poleAngles={}
        self.rest={s:self.b['Foot'+s].head_local.copy() for s in SIDES}
        self.sole={};self.probes={}
        for side in SIDES:
            candidates=[]
            for mesh in self.meshes:
                floorpart=any(k in mesh.name.lower() for k in ('boot','trouser leg','talon','webbed toe','heel counter'))
                if not floorpart:continue
                g={vg.index for vg in mesh.vertex_groups if vg.name in ('Foot'+side,'Toe'+side)}
                if not g:continue
                a=coords(mesh);idx=[v.index for v in mesh.data.vertices if sum(w.weight for w in v.groups if w.group in g)>.93]
                if not idx:continue
                ix=int(idx[np.argmin(a[idx,2])]);candidates.append((float(a[ix,2]),mesh.name,ix))
            floor,key,ix=min(candidates);self.sole[side]=floor;self.probes[side]=(key,ix)
        self.camera=self.sc.camera
        self.startW=None;self.grips=[]
        self.fore=self.b['UpperArm.R'].length+self.b['Forearm.R'].length
        self.gripModel=self.b['Hand.R'].head_local.lerp(self.b['Hand.R'].tail_local,.90)
        if name=='Dathri':
            fixed=next(o for o in self.meshes if o.name.startswith('Fixed chela digit'))
            moving=next(o for o in self.meshes if o.name.startswith('Opposing chela digit'))
            self.gripModel=Vector((coords(fixed)[-1]+coords(moving)[-1])*.5)
        self.gripLocal=self.b['Hand.R'].matrix_local.inverted()@self.gripModel
        self.range=float(self.b['Shin.R'].length)
    def store(self,bone,attr,value):
        p=self.p[bone];setattr(p,attr,value);self.tr.put(p.path_from_id(attr),value)
    def rot(self,bone,x=0,y=0,z=0):
        if bone not in self.p:return
        r=self.b[bone].matrix_local.to_quaternion()
        self.store(bone,'rotation_quaternion',r.inverted()@Q(x,y,z)@r)
    def loc(self,bone,worldDelta):
        self.store(bone,'location',self.b[bone].matrix_local.to_quaternion().inverted()@Vector(worldDelta))
    def target(self,bone,world):
        self.loc(bone,world-self.root-self.b[bone].head_local)
    def prop(self,n,value):
        self.rig[n]=float(value);self.tr.put('["'+n+'"]',float(value));self.rig.update_tag()
    def update(self):
        bpy.context.view_layer.update()
    def pole(self,eff,pole,desired,custom=None):
        pb=self.p[eff];a=pb.parent.head.copy();axis=unit(self.p[desired].head-a)
        front=Vector(custom or (0,-1,0));front=unit(front-axis*front.dot(axis))
        mid=a+axis*pb.parent.length*.67
        if eff not in self.poleAngles:
            self.target(pole,mid+front*(pb.length+pb.parent.length));self.update()
            radial=pb.head-a;radial=unit(radial-axis*radial.dot(axis))
            self.poleAngles[eff]=math.atan2(axis.dot(radial.cross(front)),radial.dot(front))
        self.target(pole,mid+(Quaternion(axis,self.poleAngles[eff])@front)*(pb.length+pb.parent.length))
    def framing(self,at,dir,height):
        direction=unit(Vector(dir));at=Vector(at);cam=self.camera
        cam.location=at+direction*5;cam.rotation_euler=(-direction).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO'
        cam.data.ortho_scale=height*960/480
        for attr in ('location','rotation_euler'):cam.keyframe_insert(data_path=attr,frame=self.tr.frame)
        cam.data.keyframe_insert(data_path='ortho_scale',frame=self.tr.frame)
    def sample(self,frame):
        self.tr.frame=frame;t=frame-1
        walk=t<WALK;chair=WALK<=t<BODY_END
        cycle=t/self.period if walk else 0
        phase=cycle%1;wave=math.sin(2*math.pi*phase)
        self.root=Vector((0,-self.stride*cycle if walk else 0,0));self.loc('Root',self.root)
        st=t-WALK if chair else -1
        sink=prog(st,4,39);settle=math.sin(math.pi*prog(st,36,47))
        lean=math.sin(math.pi*prog(st,0,41))
        reach=prog(st,SIT+4,SIT+35);withdraw=prog(st,SIT+39,SIT+59)
        sw=-math.cos(2*math.pi*(phase-.30)) if walk else 0
        crouch=.14+self.sway*.28
        hipz=-self.leg*(crouch+.029*math.cos(4*math.pi*(phase-.055))) if walk else 0
        seated_z=self.rest['.R'].z+self.range*.90+self.leg*.075
        dy=0 if walk else sink*(self.b['Thigh.R'].length*.81)
        if chair:hipz=(seated_z-self.pel.z)*sink-self.leg*.019*settle-self.leg*.030*lean
        self.loc('Pelvis',(sw*self.sway*self.leg+(-.025*self.h*reach if chair else 0),dy,hipz))
        self.rot('Pelvis',2 if walk else -4*sink,sw*3.8,(-4.3*wave if walk else -3*reach))
        self.rot('Spine',self.pitch*.44 if walk else 15*lean+5*sink+6*reach,0,(-3*wave if walk else 2*reach))
        self.rot('Chest',self.pitch*.56+1.5*math.cos(4*math.pi*phase) if walk else 6*lean-3*sink+4*reach, -sw*2.4,9*wave if walk else 9*reach)
        self.rot('Neck',-self.pitch*.23 if walk else -4*lean+5*reach,0,-3*wave if walk else -5*reach)
        self.rot('Head',-self.pitch*.5+self.nod*.5*math.cos(4*math.pi*phase) if walk else -3*lean+6*reach-7*withdraw,sw if walk else -2*reach,-3*wave if walk else -7*reach)
        self.prop('IK_Leg_R',1.);self.prop('IK_Leg_L',1.);self.prop('IK_Arm_R',reach if chair else 0.);self.prop('IK_Arm_L',0.)
        self.update()
        for i,side in enumerate(SIDES):
            o=.5*i;p=(cycle+o)%1
            swing=max(0.,(p-self.duty)/(1-self.duty)) if walk else 0.
            lift=math.sin(swing*math.pi)**1.55
            anchor=self.rest[side].copy();anchor.z-=self.sole[side]
            if walk:
                anchor.y-=self.stride*(math.floor(cycle+o+1e-9)-o+self.duty*.5+sm(swing))
                anchor.z+=self.leg*self.lift*lift
                anchor.x+=(-1 if i==0 else 1)*self.leg*.020*lift
            self.target('IK.Foot'+side,anchor);self.rot('IK.Foot'+side,x=lift*(13*(1-swing)-9*swing))
            self.rot('Toe'+side,x=-7*lift)
            self.pole('Shin'+side,'Pole.Knee'+side,'IK.Foot'+side,(-.11 if not i else .11,-1,0))
            armwave=math.cos(2*math.pi*(phase+o-.035)) if walk else 0.
            swingarm=self.arm*(.33 if self.name=='Dathri' and not i else .56 if self.name=='Koruun' and not i else 1.)
            self.rot('Clavicle'+side,x=armwave*2,z=armwave*2.5)
            self.rot('UpperArm'+side,x=swingarm*armwave if walk else -15*sink-15*lean+(5*reach if i else 0),
                y=(1 if i==0 else -1)*(3 if walk else 5*sink))
            self.rot('Forearm'+side,x=(-10+min(0.,armwave)*13 if walk else -35*sink-9*lean))
            self.rot('Hand'+side,x=4*armwave if walk else 3*sink)
        # Keep both targets inside the true two-bone reach sphere, including the sculpt's original
        # stagger and unequal sole heights. A tiny knee bend avoids the near-straight IK singularity.
        self.update()
        lower=0.
        for side in SIDES:
            target=self.p['IK.Foot'+side].head
            hip=self.p['Thigh'+side].head
            span=(self.b['Thigh'+side].length+self.b['Shin'+side].length)*.979
            dz=math.sqrt(max(.0001,span**2-(hip.x-target.x)**2-(hip.y-target.y)**2))
            lower=max(lower,hip.z-target.z-dz)
        if lower>0:
            self.loc('Pelvis',(sw*self.sway*self.leg+(-.025*self.h*reach if chair else 0),dy,hipz-lower))
        # Subtle reactions to the step come from the existing species controls.
        for bone in self.p:
            n=bone.name;stem=n.split('.')[0]
            if stem in ('EyeStalk','Antenna','Ear','Crest','GillFan','Sail','Lappets','Palp'):
                sign=-1 if n.endswith('.R') else 1
                self.rot(n,x=(math.sin(4*math.pi*phase-.75)*2.4 if walk else 2.0*lean),y=sign*(2.6*math.sin(2*math.pi*phase-.7) if walk else 2*reach))
            if ((n.endswith('.R') and ('.01.' in n or '.02.' in n)) or n in ('PalmCurl.R','Pincer.R')):
                grip=prog(st,SIT+29,SIT+38) if chair else 0.
                self.rot(n,x=(-17*grip if n!='Pincer.R' else 0),y=(13*grip if n=='Pincer.R' else 0))
        self.update()
        if chair and st==SIT:
            self.startW=self.p['Hand.R'].head.copy();self.startQ=self.p['Hand.R'].matrix.to_quaternion()
            shoulder=self.p['UpperArm.R'].head.copy()
            self.contactW=shoulder+Vector((-.14,-.91,-.27))*self.fore
            self.liftW=shoulder+Vector((-.16,-.60,-.10))*self.fore
        if chair and st>=SIT:
            w=self.startW.lerp(self.contactW,reach).lerp(self.liftW,withdraw)
            self.target('IK.Hand.R',w)
            restQ=self.b['Hand.R'].matrix_local.to_quaternion()
            newDir=unit(Vector((.07,-.71,-.70)))
            newQ=unit(self.b['Hand.R'].tail_local-self.b['Hand.R'].head_local).rotation_difference(newDir)@restQ
            afterQ=Q(-14,7,-7)@newQ
            q=self.startQ.slerp(newQ,reach).slerp(afterQ,withdraw)
            self.store('IK.Hand.R','rotation_quaternion',restQ.inverted()@q)
            self.update();self.pole('Forearm.R','Pole.Elbow.R','IK.Hand.R',(-.95,.24,-.25))
        else:
            self.loc('IK.Hand.R',(0,0,0));self.rot('IK.Hand.R');self.loc('Pole.Elbow.R',(0,0,0))
        for m in ('Happy','Bored','Sad'):
            a=0
            if t>=BODY_END:
                ft=t-BODY_END
                a=(prog(ft,1,16)*(1-prog(ft,38,54)) if m=='Happy' else
                   prog(ft,38,54)*(1-prog(ft,78,95)) if m=='Bored' else prog(ft,78,95))
            self.p['Expression'][m]=float(a);self.tr.put(self.p['Expression'].path_from_id()+f'["{m}"]',a)
        self.rig.update_tag();self.update()
        self.grips.append(self.p['Hand.R'].matrix@self.gripLocal)
        return walk
    def stage(self):
        coll=bpy.data.collections.new(self.name+' | motion stage');self.sc.collection.children.link(coll)
        base=material('Motion / gunmetal',(.070,.095,.096),.36,.65)
        blue=material('Motion / cushion',(.032,.115,.123),.53,.12)
        brass=material('Motion / brass',(.45,.24,.074),.31,.68)
        light=material('Motion / signal',(.98,.42,.058),.24,.28)
        rubber=material('Motion / rubber',(.045,.050,.049),.66,.02)
        h=self.h;z=self.rest['.R'].z+self.range*.90+self.leg*.075-h*.053
        x=self.pel.x;y=self.pel.y+self.b['Thigh.R'].length*.81+h*.039
        radius=max(h*.145,(self.b['Thigh.L'].head_local.x-self.b['Thigh.R'].head_local.x)*.70)
        def disk(n,xx,yy,z0,z1,r0,r1,mat):
            return cylinder(coll,self.name+' / '+n,(xx,yy,z0),(xx,yy,z1),r0,r1,mat)
        seat=[]
        for name,z0,z1,r0,r1,mat in [
            ('stool foot',0,h*.014,radius*.78,radius*.79,rubber),
            ('stool bell',h*.014,h*.045,radius*.79,radius*.39,base),
            ('stool pedestal',h*.045,z-h*.042,radius*.19,radius*.14,base),
            ('stool brass ferrule',z*.53,z*.53+h*.021,radius*.22,radius*.22,brass),
            ('stool bowl',z-h*.048,z-h*.021,radius*.74,radius,base),
            ('stool piping',z-h*.023,z-h*.017,radius*1.008,radius*1.008,brass),
            ('stool pad',z-h*.017,z,radius,radius*.95,blue)]:
            seat.append(disk(name,x,y,z0,z1,r0,r1,mat))
        contact=WALK+SIT+35;holder=self.grips[contact].copy();rad=h*(.030 if self.name!='Dathri' else .037)
        # The center of the sample is at the finger pads. The pedestal terminates at its base.
        hang=Vector((-.32*rad,0,-2.23*rad))
        holder+=hang
        bottom=holder.z-rad*1.36
        px,py=holder.x,holder.y
        for name,z0,z1,r0,r1,mat in [
            ('sample stand base',0,h*.013,rad*2.25,rad*2.18,rubber),('sample stand bevel',h*.013,h*.03,rad*2.15,rad*1.24,base),
            ('sample stand stem',h*.03,bottom-h*.016,rad*.37,rad*.29,base),
            ('sample stand collar',bottom-h*.053,bottom-h*.044,rad*.52,rad*.52,brass),
            ('sample stand top',bottom-h*.016,bottom,rad*1.37,rad*1.45,blue)]:
            seat.append(disk(name,px,py,z0,z1,r0,r1,mat))
        carrier=bpy.data.objects.new(self.name+' / sample pickup',None);coll.objects.link(carrier)
        for n,z0,z1,r0,r1,mat in [
            ('sample heel',-1.36,-1.12,.84,1.03,brass),('sample body',-1.12,.96,.88,.88,blue),
            ('sample window',-.76,.60,.92,.92,light),('sample lower bezel',-.84,-.70,1.,1.,brass),
            ('sample upper bezel',.56,.72,1.,1.,brass),('sample cap',.96,1.16,1.02,.88,brass)]:
            ob=disk(n,0,0,rad*z0,rad*z1,rad*r0,rad*r1,mat);ob.parent=carrier;seat.append(ob)
        axis=Vector((.24,-.97,0))
        loop=[axis*(.85*rad*math.cos(t))+Vector((0,0,rad*(1.08+1.17*math.sin(t)))) for t in np.linspace(0,math.pi,15)]
        for i,(a,b) in enumerate(zip(loop,loop[1:])):
            ob=cylinder(coll,self.name+f' / sample handle {i:02}',a,b,rad*.117,rad*.117,brass,12)
            ob.parent=carrier;seat.append(ob)
        for fr,vis in ((1,False),(WALK+1,True),(BODY_END+1,False)):
            for ob in seat:
                ob.hide_render=not vis;ob.keyframe_insert(data_path='hide_render',frame=fr)
                ob.hide_viewport=not vis;ob.keyframe_insert(data_path='hide_viewport',frame=fr)
        for t in range(TOTAL):
            carrier.location=holder if t<contact else self.grips[t]+hang
            carrier.keyframe_insert(data_path='location',frame=t+1)
        floor=bpy.data.meshes.new('Motion floor');size=18*h
        floor.from_pydata([(-size,-size,-.001),(size,-size,-.001),(size,size,-.001),(-size,size,-.001)],[],[(0,1,2,3)])
        floor.materials.append(material('Motion / floor',(.39,.40,.355),.85,.02))
        floor_obj=bpy.data.objects.new(self.name+' / studio floor',floor);coll.objects.link(floor_obj)
        for f,v in ((1,False),(BODY_END+1,True)):
            floor_obj.hide_render=v;floor_obj.keyframe_insert(data_path='hide_render',frame=f)
            floor_obj.hide_viewport=v;floor_obj.keyframe_insert(data_path='hide_viewport',frame=f)
    def cameras(self):
        self.sc.frame_set(1)
        # Compute a stable close frame across all three expressions and the full span of antennae.
        direction=unit(Vector((-.055,-1,.055)));rot=(-direction).to_track_quat('-Z','Y')
        axes=np.asarray([list(rot@Vector(v)) for v in ((1,0,0),(0,1,0),(0,0,1))])
        bounds=[]
        for fr in (BODY_END+17,BODY_END+60,BODY_END+108):
            self.sc.frame_set(fr);graph=bpy.context.evaluated_depsgraph_get()
            arrays=[]
            for o in self.meshes:
                if o.name.startswith(('Neck','Fluted gular rib')):continue
                if any(g.name=='Head' or any(b.name=='Head' for b in self.b[g.name].parent_recursive) for g in o.vertex_groups):
                    arrays.append(coords(o.evaluated_get(graph)))
            pp=np.einsum('ij,kj->ik',np.concatenate(arrays),axes);bounds.extend([pp.min(0),pp.max(0)])
        lo=np.min(bounds,0);hi=np.max(bounds,0);lo[1]-=.052*self.h;hi[1]+=.01*self.h
        at=Vector(((hi+lo)*.5)@axes);height=max((hi[1]-lo[1])*1.12,(hi[0]-lo[0])*.57)
        for fr in [1,WALK,WALK+1,BODY_END,BODY_END+1,TOTAL]:
            self.tr.frame=fr
            if fr<=WALK:
                y=-(fr-1)/self.period*self.stride
                self.framing((self.pel.x,y-.015*self.h,self.h*.465),(-.92,-.77,.15),self.h*1.115)
            elif fr<=BODY_END:
                self.framing((self.pel.x-.035*self.h,.035*self.h,self.h*.465),(-1.23,-.52,.19),self.h*1.105)
            else:self.framing(at,direction,height)
        for owner in (self.camera,self.camera.data):
            action=owner.animation_data.action
            for layer in action.layers:
                for strip in layer.strips:
                    for bag in strip.channelbags:
                        for curve in bag.fcurves:
                            for k in curve.keyframe_points:k.interpolation='LINEAR'
    def make(self):
        for f in range(1,TOTAL+1):self.sample(f)
        # Root motion repeats with offset, all local controls repeat at their starting transforms.
        walk=self.tr.action(self.rig,self.name+' | Walk cycle',1,self.period+1,True)
        walk.asset_data.description=f'{self.period}-frame root-motion stride; foot targets hold in world space during support.'
        action=self.tr.action(self.rig,self.name+' | Motion study');self.rig.animation_data.action=action
        action.asset_data.description='Walking, sitting down, collecting a sample, and expression close-ups.'
        self.sc.frame_start=1;self.sc.frame_end=TOTAL;self.sc.render.fps=FPS
        self.sc.render.resolution_x=960;self.sc.render.resolution_y=480;self.sc.render.resolution_percentage=100
        self.sc.render.film_transparent=False;self.sc.cycles.samples=24;self.sc.render.filepath='//renders/'+self.name+'-'
        for f,n in [(1,'Walk'),(WALK+1,'Sit down'),(WALK+SIT+1,'Reach and collect'),(BODY_END+1,'Happy'),(BODY_END+39,'Bored'),(BODY_END+79,'Sad')]:
            self.sc.timeline_markers.new(n,frame=f)
        self.stage();self.cameras();self.sc.frame_set(1)
        return {'period':self.period,'stride':self.stride,'duty':self.duty,'probes':self.probes,'height':self.h}
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',required=True,type=Path)
    parser.add_argument('--report',required=True,type=Path);parser.add_argument('--only',nargs='*')
    args=parser.parse_args(sys.argv[sys.argv.index('--')+1:]);report={}
    for name in (args.only or CAST):
        actor=Actor(name);report[name]=actor.make();print('ANIMATED',name,flush=True)
    bpy.context.window.scene=bpy.data.scenes[next(iter(report))];bpy.context.scene.frame_set(1)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(args.output.resolve()),compress=True)
    args.report.write_text(json.dumps(report,indent=2))
if __name__=='__main__':main()
