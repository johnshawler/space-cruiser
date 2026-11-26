"""Limb controls and reusable single-frame Blender pose assets for the fitted character rigs."""
import math
import bpy
import numpy as np
from mathutils import Matrix,Quaternion,Vector

def update():
    bpy.context.view_layer.update()

def reset(rig):
    if rig.animation_data:rig.animation_data.action=None
    for p in rig.pose.bones:p.matrix_basis=Matrix.Identity(4)
    for prop in list(rig.keys()):
        if prop.startswith('IK_'):rig[prop]=0.0
    rig.update_tag();update()

def rotate(rig,name,x=0,y=0,z=0):
    pb=rig.pose.bones.get(name)
    if not pb:return
    rest=pb.bone.matrix_local.to_quaternion()
    rotation=Quaternion((0,0,1),math.radians(z))@Quaternion((0,1,0),math.radians(y))@Quaternion((1,0,0),math.radians(x))
    pb.rotation_mode='QUATERNION';pb.rotation_quaternion=rest.inverted()@rotation@rest

def floor_pose(model):
    rig=model.rig; update();deg=bpy.context.evaluated_depsgraph_get();minimum=100.
    for mesh in model.meshes:
        vertices=mesh.evaluated_get(deg).data.vertices
        values=np.empty(len(vertices)*3,np.float32)
        vertices.foreach_get('co',values)
        minimum=min(minimum,float(values[2::3].min()))
    if minimum<90:
        p=rig.pose.bones['Pelvis'];p.location+=p.bone.matrix_local.to_quaternion().inverted()@Vector((0,0,-minimum))
    update()

def drive(constraint,rig,prop):
    driver=constraint.driver_add('influence').driver
    driver.type='AVERAGE';v=driver.variables.new();v.name='switch';v.type='SINGLE_PROP'
    v.targets[0].id=rig;v.targets[0].data_path='["'+prop+'"]'

def handle_shape(kind):
    name='LH handle / '+kind
    cached=bpy.data.objects.get(name)
    if cached:return cached
    if kind=='pole':
        verts=[(0,0,.6),(.5,0,0),(0,.5,0),(-.5,0,0),(0,-.5,0),(0,0,-.6)]
        edges=[(0,i) for i in range(1,5)]+[(5,i) for i in range(1,5)]+[(1,2),(2,3),(3,4),(4,1)]
    elif kind=='root':
        verts=[(math.cos(i*2*math.pi/32)*1.5,math.sin(i*2*math.pi/32)*1.5,0) for i in range(32)]
        edges=[(i,(i+1)%32) for i in range(32)];verts.extend([(0,1.5,0),(-.24,1.8,0),(.24,1.8,0)]);edges.extend([(32,33),(33,34),(34,32)])
    else:
        verts=[(x,y,z) for x in (-.48,.48) for y in (-.18,1.1) for z in (-.30,.30)]
        edges=[(i,j) for i in range(8) for j in range(i+1,8) if bin(i^j).count('1')==1]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,edges,[]);mesh.update()
    return bpy.data.objects.new(name,mesh)

def install_ik(model):
    rig=model.rig
    for limb,eff,target,pole,distal in model.ik:
        prop='IK_'+limb.replace('.','_')
        rig[prop]=0.0
        rig.id_properties_ui(prop).update(min=0.,max=1.,soft_min=0.,soft_max=1.,description='0 = FK. 1 = hand or foot IK target with elbow or knee pole.')
        pb=rig.pose.bones[eff];con=pb.constraints.new('IK');con.name='Two-bone IK';con.target=rig;con.subtarget=target;con.chain_count=2
        con.pole_target=rig;con.pole_subtarget=pole;con.use_stretch=False;con.iterations=72;con.influence=0.
        drive(con,rig,prop)
        tip=rig.pose.bones[distal];orient=tip.constraints.new('COPY_ROTATION');orient.name='IK end orientation'
        orient.target=rig;orient.subtarget=target;orient.owner_space='POSE';orient.target_space='POSE';drive(orient,rig,prop)
        rig.pose.bones[target].custom_shape=handle_shape('effector')
        rig.pose.bones[pole].custom_shape=handle_shape('pole')
        # Calibrate roll around the actual rest chain. This keeps the joint in place when enabling IK.
        rig[prop]=1.;rig.update_tag();update()
        a=pb.parent.bone.head_local;c=pb.bone.tail_local;axis=(c-a).normalized()
        def radial(p):
            v=p-a
            return (v-axis*v.dot(axis)).normalized()
        desired=radial(pb.bone.head_local)
        con.pole_angle=0.;update();first=radial(pb.head.copy())
        con.pole_angle=math.pi/2;update();second=radial(pb.head.copy())
        sign=1 if axis.dot(first.cross(second))>0 else -1
        new=math.atan2(axis.dot(first.cross(desired)),first.dot(desired))*sign
        def measure(angle):
            con.pole_angle=(angle+math.pi)%(2*math.pi)-math.pi
            update()
            return (pb.head-pb.bone.head_local).length
        drift=measure(new)
        if drift>.0001:
            # Blender's roll and pole convention changes at the wrap for some bent-limb rest poses.
            candidates=[(measure(i*math.pi/8),i*math.pi/8) for i in range(-8,8)]
            _,new=min(candidates)
            step=math.pi/16
            for _ in range(13):
                _,new=min((measure(a),a) for a in (new-step,new,new+step))
                step*=.5
            drift=measure(new)
        if drift>.001:
            print('IK rest calibration',model.name,prop,round(drift,6),flush=True)
        rig[prop]=0.;rig.update_tag();update()
    rig.pose.bones['Root'].custom_shape=handle_shape('root')

def set_pose(model,kind):
    rig=model.rig;reset(rig)
    if kind=='Stride':
        rotate(rig,'Pelvis',z=4);rotate(rig,'Chest',x=4,z=-8);rotate(rig,'Head',z=4)
        for s,thigh,knee,foot,arm,elbow in [('.R',-32,16,15,24,-14),('.L',22,37,-24,-25,-21)]:
            rotate(rig,'Thigh'+s,x=thigh);rotate(rig,'Shin'+s,x=knee);rotate(rig,'Foot'+s,x=foot)
            rotate(rig,'UpperArm'+s,x=arm);rotate(rig,'Forearm'+s,x=elbow)
    elif kind=='Seat':
        rotate(rig,'Pelvis',x=-5);rotate(rig,'Spine',x=7);rotate(rig,'Chest',x=2);rotate(rig,'Head',x=-3)
        for s,side in [('.R',1),('.L',-1)]:
            rotate(rig,'Thigh'+s,x=-80,y=side*5);rotate(rig,'Shin'+s,x=86);rotate(rig,'Foot'+s,x=-4)
            rotate(rig,'UpperArm'+s,x=-15,y=side*8);rotate(rig,'Forearm'+s,x=-56)
    else:
        rotate(rig,'Spine',x=4,z=3);rotate(rig,'Chest',x=5,z=8);rotate(rig,'Head',x=-7,z=-8)
        rotate(rig,'Clavicle.R',y=7,z=8);rotate(rig,'UpperArm.R',x=-63,y=17,z=-10)
        rotate(rig,'Forearm.R',x=-20);rotate(rig,'Hand.R',x=9,z=9)
        rotate(rig,'UpperArm.L',x=11,y=-6);rotate(rig,'Forearm.L',x=-17)
        for s in ('.R','.L'):
            rotate(rig,'PalmCurl'+s,x=-10 if s=='.R' else -20)
            for _,_,_,first,last in model.digits[s]:
                rotate(rig,first,x=-12 if s=='.R' else -18)
                rotate(rig,last,x=-11 if s=='.R' else -22)
        if 'Pincer.R' in rig.pose.bones:rotate(rig,'Pincer.R',y=-15)
    floor_pose(model)

def finish_rig(model):
    rig=model.rig;install_ik(model)
    for kind in ('Stride','Seat','Reach'):
        set_pose(model,kind)
        action=bpy.data.actions.new(model.name+' | '+kind);action.use_fake_user=True
        rig.animation_data_create().action=action
        for bone in rig.pose.bones:
            if bone.name.startswith(('IK.','Pole.')):continue
            bone.keyframe_insert(data_path='rotation_quaternion',frame=1,group=bone.name)
            if bone.name in ('Root','Pelvis'):bone.keyframe_insert(data_path='location',frame=1,group=bone.name)
        action.asset_mark();action.asset_data.description=f'{kind} pose for the {model.name} FK controls'
        action.asset_data.tags.new(model.name);action.asset_data.tags.new('Pose')
    reset(rig)
    for c in ('IK','Face','Fingers','Species'):
        if c in rig.data.collections:rig.data.collections[c].is_visible=False
    for o in bpy.context.selected_objects:o.select_set(False)
    rig.select_set(True);bpy.context.view_layer.objects.active=rig
