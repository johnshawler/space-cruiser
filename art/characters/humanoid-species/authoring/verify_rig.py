"""Reopen the published Blender master and exercise its saved rigs, without saving any changes."""
import argparse
import json
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Matrix, Vector

def coordinates(obj):
    data=np.empty(3*len(obj.data.vertices),dtype=np.float32)
    obj.data.vertices.foreach_get('co',data)
    return data.reshape(-1,3)

def reset(rig):
    if rig.animation_data:
        rig.animation_data.action=None
    for bone in rig.pose.bones:
        bone.matrix_basis=Matrix.Identity(4)
    for key in rig.keys():
        if key.startswith('IK_'):
            rig[key]=0.0
    rig.update_tag()
    bpy.context.view_layer.update()

def verify(scene,require_previews=False):
    bpy.context.window.scene=scene
    name=scene.name
    collection=bpy.data.collections[name+' | character']
    rig=collection.objects[name+' | Rig']
    meshes=[obj for obj in collection.objects if obj.type=='MESH']
    graph=bpy.context.evaluated_depsgraph_get()
    assert rig.type=='ARMATURE' and rig.animation_data.action is None
    reference={}
    vertex_count=0
    neutral_error=0.
    max_groups=0
    for obj in meshes:
        assert obj.parent==rig and any(m.type=='ARMATURE' and m.object==rig for m in obj.modifiers),obj.name
        assert all(vg.name in rig.data.bones and rig.data.bones[vg.name].use_deform for vg in obj.vertex_groups),obj.name
        for vertex in obj.data.vertices:
            groups=vertex.groups
            assert 1<=len(groups)<=4 and abs(sum(g.weight for g in groups)-1)<1.e-6,(obj.name,vertex.index)
            max_groups=max(max_groups,len(groups))
        vertex_count+=len(obj.data.vertices)
        pts=coordinates(obj)
        reference[obj.name]=pts
        neutral_error=max(neutral_error,float(np.abs(pts-coordinates(obj.evaluated_get(graph))).max()))
    assert neutral_error<.0001,(name,'neutral mesh shift',neutral_error)
    ik_errors={}
    for side in ('.L','.R'):
        for label,end,distal in [('Arm','Forearm','Hand'),('Leg','Shin','Foot')]:
            prop='IK_'+label+'_'+side[-1]
            joint=rig.pose.bones[end+side]
            handle=rig.pose.bones['IK.'+distal+side]
            rest=joint.bone.tail_local.copy()
            rest_joint=joint.bone.head_local.copy()
            proximal=joint.parent.bone.head_local.copy()
            rig[prop]=1.0
            rig.update_tag()
            bpy.context.view_layer.update()
            rest_error=(joint.tail-rest).length
            joint_error=(joint.head-rest_joint).length
            displacement=(proximal-rest)*.11+Vector((0,-.018,.012))
            handle.location=handle.bone.matrix_local.to_quaternion().inverted()@displacement
            bpy.context.view_layer.update()
            error=(joint.tail-handle.head).length
            assert joint.constraints['Two-bone IK'].influence>.999 and (joint.tail-rest).length>.018,(name,prop,'unresponsive')
            assert error<.004 and rest_error<.004 and joint_error<.009,(name,prop,'IK tracking errors',error,rest_error,joint_error)
            ik_errors[prop]=[round(x,6) for x in (error,rest_error,joint_error)]
            reset(rig)
    # Rotate each separately weighted face, digit and species control and measure its own moving skin.
    from mathutils import Quaternion
    tested=0
    by_bone={}
    for obj in meshes:
        for group in obj.vertex_groups:
            by_bone.setdefault(group.name,[]).append(obj)
    for bone in rig.pose.bones:
        if not any(c.name in ('Face','Fingers','Species') for c in bone.bone.collections):continue
        bound=by_bone.get(bone.name,[])
        assert bound,(name,'control has no skin',bone.name)
        bone.rotation_quaternion=Quaternion((1,0,0),.34)
        bpy.context.view_layer.update()
        maximum=max(float(np.linalg.norm(coordinates(obj.evaluated_get(graph))-reference[obj.name],axis=1).max()) for obj in bound)
        assert maximum>.00005,(name,'detail control did not move skin',bone.name,maximum)
        bone.matrix_basis=Matrix.Identity(4)
        bpy.context.view_layer.update()
        tested+=1
    poses={}
    for kind in ('Stride','Seat','Reach'):
        action=bpy.data.actions[name+' | '+kind]
        assert action.asset_data and action.slots,(name,kind)
        if require_previews:assert action.preview and action.preview.image_size[0]>0,(name,kind,'missing thumbnail')
        rig.animation_data.action=action
        scene.frame_set(1)
        # A valid stored pose must move the limb at its actual end effector, plus the bound skin.
        arm=rig.pose.bones['Hand.R']
        foot=rig.pose.bones['Foot.R']
        wrist_motion=(arm.head-arm.bone.head_local).length
        foot_motion=(foot.head-foot.bone.head_local).length
        assert (foot_motion if kind in ('Stride','Seat') else wrist_motion)>.07,(name,kind,wrist_motion,foot_motion)
        moved=0;floor=100.;top=-100.;largest=0.
        for obj in meshes:
            pts=coordinates(obj.evaluated_get(graph))
            assert np.isfinite(pts).all(),(name,kind,obj.name)
            shift=np.linalg.norm(pts-reference[obj.name],axis=1)
            moved+=int(np.count_nonzero(shift>.005))
            floor=min(floor,float(pts[:,2].min()));top=max(top,float(pts[:,2].max()))
            largest=max(largest,float(shift.max()))
        assert moved>vertex_count*.10 and top-floor>.5 and abs(floor)<.0005,(name,kind,moved,vertex_count)
        poses[kind]=dict(movedVertices=moved,floorMetres=round(floor,5),heightMetres=round(top-floor,4),wristTravelMetres=round(wrist_motion,4),footTravelMetres=round(foot_motion,4))
        reset(rig)
    return dict(bones=len(rig.data.bones),detailControlsTested=tested,meshes=len(meshes),vertices=vertex_count,maxInfluences=max_groups,neutralMaxCoordinateError=neutral_error,ikErrorsMetres=ik_errors,poses=poses)

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--report',type=Path,required=True)
    parser.add_argument('--require-previews',action='store_true')
    args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
    results={}
    for scene in bpy.data.scenes:
        if bpy.data.collections.get(scene.name+' | character'):
            results[scene.name]=verify(scene,args.require_previews)
            print('VERIFIED',scene.name,results[scene.name]['bones'],flush=True)
    assert len(results)==16
    args.report.write_text(json.dumps(results,indent=2)+'\n')
