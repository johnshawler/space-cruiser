"""Exercise actual Blender pose-library application, manual blends, and all body/face pairings."""
import argparse
import json
from pathlib import Path
import sys

import bpy
import numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parent))
from expression_rig import CONTROL, MOODS, PERFORMANCE, Face, points

def set_values(model,values):
    control=model.rig.pose.bones[CONTROL]
    for k,value in zip(MOODS,values):control[k]=float(value)
    model.rig.update_tag()
    bpy.context.view_layer.update()

def check(scene,require_previews):
    model=Face(scene);rig=model.rig
    control=rig.pose.bones[CONTROL]
    assert rig.animation_data.action is None and not any(control[k] for k in MOODS),scene.name
    graph=bpy.context.evaluated_depsgraph_get()
    assert all(driver.driver.is_valid for driver in rig.animation_data.drivers)
    face=[o for o in model.meshes if o.data.shape_keys]
    assert face,scene.name
    keys=[(o,k) for o in face for k in o.data.shape_keys.key_blocks if k.name in MOODS]
    neutral_error=max(float(np.abs(points(o)-points(o.evaluated_get(graph))).max()) for o in model.meshes)
    assert neutral_error<.00001,(scene.name,neutral_error)
    actions=[bpy.data.actions[scene.name+' | '+m] for m in MOODS]
    for action in actions:
        assert action.asset_data and len(action.slots)==1
        bag=action.layers[0].strips[0].channelbag(action.slots[0])
        assert {c.data_path for c in bag.fcurves}=={f'pose.bones["{CONTROL}"]["{m}"]' for m in MOODS}
        assert len(bag.fcurves)==3
        if require_previews:assert action.preview and min(action.preview.image_size)>0
    base_meshes=[o for o in model.meshes if not model.facial_mesh(o)]
    protected=[rig.pose.bones[n] for n in ('Root','Pelvis','Spine','Chest','Hand.L','Hand.R','Foot.L','Foot.R','Neck')]
    displacements={}
    bpy.context.view_layer.objects.active=rig;rig.select_set(True)
    for b in rig.data.bones:b.select=(b.name==CONTROL)
    rig.data.bones.active=rig.data.bones[CONTROL]
    for body in ('Stride','Seat','Reach'):
        set_values(model,(0,0,0))
        rig.animation_data.action=bpy.data.actions[scene.name+' | '+body]
        scene.frame_set(1);bpy.context.view_layer.update()
        base={o.name:points(o.evaluated_get(graph)) for o in base_meshes}
        matrices=[np.array(b.matrix) for b in protected]
        skull=model.parts['Cranium'][0]
        before=points(skull.evaluated_get(graph))
        poses=[]
        for i,action in enumerate(actions):
            # The same pose application API used by Blender's bundled Pose Library.
            rig.pose.apply_pose_from_action(action)
            rig.update_tag();bpy.context.view_layer.update()
            expected=[float(j==i) for j in range(3)]
            assert [control[m] for m in MOODS]==expected,(scene.name,body,action.name,dict(control.items()))
            assert rig.animation_data.action.name==scene.name+' | '+body
            assert all(o.data.shape_keys.animation_data and all(d.driver.is_valid for d in o.data.shape_keys.animation_data.drivers) for o in face)
            assert all(abs(k.value-expected[MOODS.index(k.name)])<1.e-5 for _,k in keys)
            delta=max(float(np.max(np.abs(m-np.array(b.matrix)))) for m,b in zip(matrices,protected))
            assert delta<.00002,(scene.name,body,action.name,'body transform',delta)
            drift=max(float(np.max(np.abs(points(o.evaluated_get(graph))-base[o.name]))) for o in base_meshes)
            assert drift<.00002,(scene.name,body,action.name,'body mesh',drift)
            after=points(skull.evaluated_get(graph));poses.append(after)
            distance=float(np.max(np.linalg.norm(after-before,axis=1)))
            assert distance>.01 and np.isfinite(after).all(),(scene.name,body,action.name,distance)
            displacements[body+' / '+MOODS[i]]=round(distance,5)
            for o,_,_ in model.eyes:
                material=o.data.materials[0]
                assert all(d.driver.is_valid for d in material.node_tree.animation_data.drivers)
                threshold=next(n for n in material.node_tree.nodes if n.label=='Upper lid').outputs[0].default_value
                assert threshold<1.,(scene.name,action.name,'eyelid threshold',threshold)
        assert all(np.linalg.norm(poses[i]-poses[j],axis=1).max()>.014 for i in range(3) for j in range(i))
    # The artist can mix intensities on a posed character and recover the original combination exactly.
    set_values(model,(.28,.17,.33))
    assert all(abs(k.value-{'Happy':.28,'Bored':.17,'Sad':.33}[k.name])<1.e-5 for _,k in keys)
    set_values(model,(1,1,1))
    assert all(abs(k.value-1/3)<1.e-5 for _,k in keys)
    set_values(model,(0,0,0))
    assert np.abs(points(skull.evaluated_get(graph))-before).max()<.00002
    return {'facialMeshesWithShapeKeys':len(face),'drivenShapeKeys':len(keys),'eyeGlobes':len(model.eyes),'neutralMaxCoordinateError':neutral_error,'expressionBodyPairs':len(displacements),'maximumSkullTravelMetres':displacements}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--report',type=Path,required=True);p.add_argument('--skip-previews',action='store_true')
    args=p.parse_args(sys.argv[sys.argv.index('--')+1:])
    report={}
    for n in PERFORMANCE:
        report[n]=check(bpy.data.scenes[n],not args.skip_previews)
        print('VERIFIED EXPRESSIONS',n,report[n]['expressionBodyPairs'],flush=True)
    args.report.write_text(json.dumps(report,indent=2)+'\n')

if __name__=='__main__':main()
