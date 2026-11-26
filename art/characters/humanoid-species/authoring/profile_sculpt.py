import bpy, math,numpy as np,sys
from pathlib import Path
D=Path(__file__).resolve().parent;sys.path.insert(0,str(D));from forms import CAST
import detail
# One continuous deformation field per species preserves fitted joints and front registration.
# Tuples describe projected anatomical landmarks, their smooth falloff, and their depth in proof pixels.
landmarks={
'Taluun':[(188,36,34,16,6),(141,28,24,12,-4),(239,26,25,12,-5)],
'Orrek':[(175,52,25,17,8),(113,26,24,14,-7)],
'Vessari':[(197,35,19,15,28),(162,24,18,17,4),(91,33,41,36,-28),(107,9,38,21,-14)],
'Mothren':[(158,78,20,20,9),(66,26,40,22,-12),(246,24,37,22,-10)],
'Ureth':[(204,25,14,13,12),(112,40,38,26,-27),(146,16,25,12,-9)],
'Keld':[(173,59,30,18,9),(98,35,22,23,-6)],
'Sovai':[(180,25,20,14,11),(111,39,26,28,-12),(140,51,13,15,-5)],
'Brunn':[(171,48,25,19,12),(130,52,21,23,4),(201,49,19,18,3)],
'Pelrin':[(192,44,18,12,12),(110,27,30,26,-12),(244,23,28,22,-15)],
'Zhavet':[(177,36,19,12,10),(151,21,13,12,6),(188,20,11,13,-2)],
'Koruun':[(178,53,34,17,12),(95,37,30,20,-13),(130,18,41,19,-6)],
'Eskel':[(163,24,18,15,4),(130,15,12,12,-6)],
'Rhovi':[(215,32,18,12,18),(106,27,42,39,-29),(142,12,27,18,-12)],
'Nemeya':[(118,39,22,19,-4),(199,41,23,16,-4),(159,32,28,15,5)],
'Dathri':[(174,59,25,15,15),(95,35,29,20,-13),(76,165,26,32,12)],
'Ulnor':[(182,31,17,14,15),(116,13,23,14,-27),(144,18,19,16,-8)]}
for n,c in CAST.items():
 collection=bpy.data.collections[n+' | character']
 if collection.get('Sagittal sculpt')==1:continue
 vals=[(v[1],v[2]) for p in c['parts'] for v in p[4]]+[(p[0]-p[3],p[0]+p[3]) for k in ['lines','blades'] for entry in c.get(k,[]) for p in entry[2]]
 cx=(min(v[0] for v in vals)+max(v[1] for v in vals))*.5;scale=c['height']/c['floor']
 legs=[p for p in c['parts'] if 'trouser leg' in p[0]];ankles=[sum(p[4][-1][1:3])/2 for p in legs];middle=sum(ankles)/len(ankles);spacing=max(5,abs(ankles[0]-ankles[1])*.38)
 for ob in collection.objects:
  m=ob.data;a=np.empty(len(m.vertices)*3,np.float32);m.vertices.foreach_get('co',a);a=a.reshape(-1,3)
  x=a[:,0]/scale+cx;z=c['floor']-a[:,2]/scale
  u=np.clip((z/c['floor']-.54)/.36,0,1);u=u*u*(3-2*u)
  d=-np.tanh((x-middle)/spacing)*u*(11 if n not in ('Vessari','Zhavet','Eskel') else 14)
  for px,pz,rx,rz,delta in landmarks[n]:d+=delta*np.exp(-.5*(((x-px)/rx)**2+((z-pz)/rz)**2))
  a[:,1]-=d*scale;m.vertices.foreach_set('co',a.flatten());m.update()
 collection['Sagittal sculpt']=1
for m in bpy.data.materials:
 if m.name.endswith('/ Slate'):
  for node in m.node_tree.nodes:
   if node.type=='TEX_WAVE':node.inputs['Distortion'].default_value=12;node.inputs['Scale'].default_value=11;node.inputs['Detail Scale'].default_value=2.4
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(D/'Rebuilt-Humanoid-Species.blend'),compress=True)
