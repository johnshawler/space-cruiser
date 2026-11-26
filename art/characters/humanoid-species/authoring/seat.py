from pathlib import Path
import bpy,numpy as np,json,sys,re
from mathutils import Vector
D=Path(__file__).resolve().parent;sys.path.insert(0,str(D))
from forms import CAST
from connect import components
rep={}
def base(ob):return re.sub(r'\.\d+$','',ob.name)
def targets(k):
 if 'Press stud' in k:return [k.split(' · ')[-1],'Pocket flap · '+k.split(' · ')[-1]]
 if 'eyelid' in k:return ['Eye globe','Cranium']
 if 'Antenna comb' in k:return ['Antennal shaft']
 if 'Astrolabe spoke' in k:return ['Astrolabe face']
 if k=='Astrolabe face':return ['Navigator wrap coat','Astrolabe belt']
 if k=='Instrument chain':return ['Astrolabe face','Astrolabe belt','Navigator wrap coat']
 if k.startswith('Spanner') or 'spanner' in k:return ['Riveted tool pocket','Pocket flap · Riveted tool pocket']
 if 'Utensil' in k:return ['Utensil pocket','Pocket flap · Utensil pocket']
 if k=='Garment fastener':return ['Dispatch greatcoat','Portmaster greatcoat','Cook’s work jacket','Waxed pilot jacket']
 if k.startswith('Digit') or k=='Opposable thumb':return ['Near arm','Far arm','Near hand','Far hand']
 if k=='Webbed toe':return ['Right trouser leg','Left trouser leg']
 if k=='Right boot':return ['Right trouser leg']
 if k=='Far palm':return ['Far arm']
 if 'lip' in k:return ['Cranium','Sculpted labial ridge']
 return []
def move_to(group,obs,trees,verts,goal):
 sample=[]
 for i in group:
  v=verts[i]
  sample.extend(v[np.linspace(0,len(v)-1,min(len(v),360),dtype=int)])
 candidates=[]
 for i in goal:
  vv=verts[i];mi=vv.min(0)-.001;ma=vv.max(0)+.001;tr=trees[i]
  for v in sample:
   if v[0]<mi[0] or v[0]>ma[0] or v[2]<mi[2] or v[2]>ma[2]:continue
   for sg in (-1,1):
    loc,no,face,dist=tr.ray_cast(Vector(v),(0,sg,0),.20)
    if loc is not None:candidates.append((dist,Vector((0,sg*(dist+.0014),0))))
 if candidates:
  delta=min(candidates,key=lambda t:t[0])[1]
 else:
  best=10;pair=None
  for i in goal:
   for v in sample:
    loc,no,face,di=trees[i].find_nearest(Vector(v),best)
    if loc is not None and di<best:
     best=di;dv=loc-Vector(v);pair=(dv,dv.normalized())
  if pair is None:return 0
  delta=pair[0]+pair[1]*.0014
 for i in group:
  m=obs[i].data
  for v in m.vertices:v.co+=delta
  m.update()
 return delta.length
for name in CAST:
 co=bpy.data.collections[name+' | character'];notes=[]
 for iteration in range(5):
  groups,obs,verts,trees=components(co)
  if len(groups)<=1:break
  main=groups[0]
  for group in groups[1:]:
   k=base(obs[group[0]]);wanted=targets(k)
   preferred=[i for i in main if any(base(obs[i]).startswith(t) for t in wanted)] if wanted else []
   if not preferred and k.startswith('Astrolabe spoke'):continue
   if not preferred:preferred=main
   dd=move_to(group,obs,trees,verts,preferred)
   notes.append((k,round(dd,4)))
 gs,oo,vs,tt=components(co)
 rep[name]=dict(moved=notes,remaining=[[oo[i].name for i in g] for g in gs[1:]])
 # An actual render is also the thumbnail of each portable collection asset.
 with bpy.context.temp_override(id=co):
  bpy.ops.ed.lib_id_load_custom_preview(filepath=str(D.parent/'renders'/name.lower()/'front.png'))
 sc=bpy.data.scenes[name];sc.cycles.samples=48;sc.render.resolution_x=900;sc.render.resolution_y=980;sc.render.filepath='//'+name+'-Studio.png';sc.camera=next(o for o in sc.objects if o.type=='CAMERA' and o.name.endswith('/ Reference'))
(D/'seating-checks.json').write_text(json.dumps(rep,indent=2))
bpy.context.window.scene=bpy.data.scenes['Taluun'];bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(D/'Rebuilt-Humanoid-Species.blend'),compress=True)
