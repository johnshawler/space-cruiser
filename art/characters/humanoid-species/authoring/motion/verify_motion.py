"""Measure contact in world space on the evaluated skeleton and on the original skinned sole."""
from pathlib import Path
import sys,json,math
import bpy,numpy as np
from mathutils import Vector
d=Path(__file__).resolve().parent
sys.path.insert(0,str(d))
from humanoid_motion import WALK,SIT,REACH,BODY_END,TOTAL,CAST
def check(spec):
    report={}
    for n,s in spec.items():
        sc=bpy.data.scenes[n];bpy.context.window.scene=sc
        rig=bpy.data.objects[n+' | Rig'];p=rig.pose.bones;graph=bpy.context.evaluated_depsgraph_get()
        records={side:{} for side in ('.R','.L')};max_ankle=0.;ground=[];hipx=[];swingheight=[];seat_height=[]
        for t in range(BODY_END):
            sc.frame_set(t+1)
            if t<WALK:hipx.append(p['Pelvis'].head.x)
            if t in (WALK,WALK+SIT-1):seat_height.append(float(p['Pelvis'].head.z))
            for i,side in enumerate(records):
                bone=p['Foot'+side];trg=p['IK.Foot'+side]
                max_ankle=max(max_ankle,(bone.head-trg.head).length)
                b,vi=s['probes'][side];mesh=bpy.data.objects[b].evaluated_get(graph)
                co=np.array(mesh.matrix_world@mesh.data.vertices[vi].co)
                phase=t/s['period']+i*.5
                if t<WALK and phase%1<s['duty']-1e-7 or t>=WALK:
                    block=math.floor(phase) if t<WALK else 'chair'
                    records[side].setdefault(block,[]).append([*bone.head,*co]);ground.append(co[2])
                elif t<WALK:swingheight.append(float(co[2]))
        drift=[np.ptp(points,axis=0) for groups in records.values() for points in groups.values() if len(points)>1]
        r={'maxSupportAnkleTravel':max(np.linalg.norm(v[:3]) for v in drift),'maxSupportSoleTravel':max(np.linalg.norm(v[3:]) for v in drift),
           'maxIKError':max_ankle,'contactAltitudeRange':[min(ground),max(ground)],'lateralWeightTransfer':np.ptp(hipx),
           'highestSwingSole':max(swingheight),'seatedPelvisDrop':seat_height[0]-seat_height[-1]}
        prop=bpy.data.objects[n+' / sample pickup']
        sc.frame_set(WALK+SIT+36);base=prop.matrix_world.translation.copy()
        sc.frame_set(BODY_END);r['samplePickupTravel']=(prop.matrix_world.translation-base).length
        faces=[]
        for t,sel in ((22,'Happy'),(64,'Bored'),(107,'Sad')):
            sc.frame_set(BODY_END+t+1);faces.append(float(p['Expression'][sel]))
        r['expressionPeaks']=faces
        print('CHECKED',n,{k:round(float(v),4) if np.isscalar(v) else v for k,v in r.items()},flush=True)
        report[n]=r
    return report
if __name__=='__main__':
    args=sys.argv[sys.argv.index('--')+1:];data=check(json.loads(Path(args[0]).read_text()));Path(args[1]).write_text(json.dumps(data,indent=2))
