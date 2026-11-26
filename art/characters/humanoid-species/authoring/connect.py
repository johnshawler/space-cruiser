import bpy, json,math,sys,numpy as np
from pathlib import Path
from mathutils.bvhtree import BVHTree
from mathutils import Vector
D=Path(__file__).resolve().parent;sys.path.insert(0,str(D))
from forms import CAST
def components(collection):
 obs=list(collection.objects);trees=[];mins=[];maxs=[];vs=[];root=list(range(len(obs)))
 def parent(i):
  while root[i]!=i:root[i]=root[root[i]];i=root[i]
  return i
 for o in obs:
  m=o.data; co=np.empty(len(m.vertices)*3,np.float32);m.vertices.foreach_get('co',co);co=co.reshape(-1,3);vs.append(co);mins.append(co.min(0));maxs.append(co.max(0));trees.append(BVHTree.FromPolygons([v.co.copy() for v in m.vertices],[p.vertices[:] for p in m.polygons],epsilon=.00015))
 aa=np.array(mins);bb=np.array(maxs)
 for i in range(len(obs)):
  near=np.flatnonzero(np.all((aa[i]<=bb+.0008)&(aa<=bb[i]+.0008),axis=1));near=sorted([j for j in near if j<i],key=lambda j:-len(vs[j]))
  for j in near:
   if parent(i)==parent(j):continue
   if trees[i].overlap(trees[j]):root[parent(i)]=parent(j);continue
   # Accept a sealed part buried wholly within another mesh.
   for small,large in [(i,j),(j,i)]:
    if np.any(aa[large]-.0008>aa[small]) or np.any(bb[large]+.0008<bb[small]):continue
    pt=Vector(vs[small][0]);loc,n,idx,dist=trees[large].find_nearest(pt)
    if loc and (pt-loc).dot(n)<=.0008:root[parent(i)]=parent(j);break
 groups={}
 for i,o in enumerate(obs):groups.setdefault(parent(i),[]).append(i)
 groups=sorted(groups.values(),key=lambda a:-len(a))
 return groups,obs,vs,trees
def run():
 output={}
 for name in CAST:
  groups,obs,vs,trees=components(bpy.data.collections[name+' | character'])
  output[name]=[[obs[i].name for i in group] for group in groups[1:]]
 (D/'groups.json').write_text(json.dumps(output,indent=1))
if __name__=='__main__':run()
