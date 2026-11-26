import bpy, math, random, os, sys, re, json
import numpy as np
from mathutils import Vector
from pathlib import Path
from math import sin,cos,pi,sqrt
D=Path(__file__).parent;sys.path.insert(0,str(D))
from forms import CAST
import detail
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version=0
mode=os.environ.get('BUILD_MODE','all')
palette={
'terra':('9d5538','skin'),'slate':('58504a','rock'),'plume':('e2dbcb','feather'),'ochrefur':('b57938','fur'),
'opal':('b9b9a0','opal'),'oxhide':('763e36','skin'),'reef':('407990','skin'),'ochre':('a78050','skin'),
'fawn':('a47850','fur'),'chitin':('735250','chitin'),'turtle':('877954','skin'),'basalt':('282726','rock'),
'coral':('d8927a','opal'),'glasscoral':('e3a487','glass'),'shell':('827e52','chitin'),'stripe':('a16d47','skin'),
'ivory':('c6b69a','cloth'),'brown':('534637','cloth'),'ink':('35434c','cloth'),'canvas':('c6b294','cloth'),
'khaki':('98886b','cloth'),'rust':('8f543b','cloth'),'wine':('66382e','cloth'),'blue':('35476a','cloth'),
'denim':('414854','cloth'),'teal':('315f60','cloth'),'mustard':('a0733f','cloth'),'moss':('595541','cloth'),
'leather':('694d38','leather'),'brass':('b48b4c','metal'),'steel':('959692','metal'),'rope':('9e8156','rope'),
'ivoryhorn':('cbb8a0','horn'),'horn':('695747','horn'),'iris_gold':('9e763b','eye'),'iris_green':('8c9349','eye'),
'iris_plum':('654751','eye'),'obsidian':('252321','eye'),'amber':('59432a','eye'),'vermilion':('be5b38','skin'),
'ear':('bd896d','opal'),'copper':('ae7541','cloth'),'indigo':('3e465a','feather'),'smoke':('414846','eye'),
'glow':('ffbd57','emissive'),'suture':('aa9879','rope'),'darkmetal':('514c48','metal')}
def srgb(v):return ((v+.055)/1.055)**2.4 if v>.04045 else v/12.92
def rgb(h):return tuple(srgb(int(h[k:k+2],16)/255) for k in (0,2,4))+(1,)
def sock(n,k,v):n.inputs[k].default_value=v
def link(nt,n,a,m,b):nt.links.new(n.outputs[a],m.inputs[b])
mats={}
def material(key):
 global tex
 sig=(name,key)
 if sig in mats:return mats[sig]
 he,typ=palette[key];base=np.array(rgb(he)[:3]); m=bpy.data.materials.new(name+' / '+key.title());m.use_nodes=True;m.diffuse_color=tuple(base)+(1,);nt=m.node_tree;n=nt.nodes;bs=n.get('Principled BSDF')
 def node(typ,x,y,lab=''):
  z=n.new(typ);z.location=(x,y);z.label=lab;return z
 bs.location=(720,80);n.get('Material Output').location=(1000,80)
 tx=node('ShaderNodeTexCoord',-1180,0)
 coarse=node('ShaderNodeTexNoise',-930,55,'Dye, grain and plate mottling');sock(coarse,'Scale',17 if typ not in ('rock','chitin') else 42);sock(coarse,'Detail',4.8);sock(coarse,'Roughness',.68);link(nt,tx,'Object',coarse,'Vector')
 ramp=node('ShaderNodeValToRGB',-690,70);ramp.color_ramp.elements[0].position=.18;ramp.color_ramp.elements[0].color=tuple(base*.70)+(1,);ramp.color_ramp.elements[1].position=.82;ramp.color_ramp.elements[1].color=tuple(np.minimum(1,base*1.38+.003))+(1,);link(nt,coarse,'Fac',ramp,'Fac')
 uv=node('ShaderNodeUVMap',-1190,350);uv.uv_map='Concept registration'
 ref=node('ShaderNodeTexImage',-920,340,'Packed, registered concept pigmentation');ref.image=tex;ref.extension='EXTEND';link(nt,uv,'UV',ref,'Vector')
 att=node('ShaderNodeAttribute',-690,450,'Use concept on the reference-facing surface');att.attribute_name='Reference weight'
 mix=node('ShaderNodeMixRGB',-380,180);link(nt,att,'Fac',mix,0);link(nt,ramp,'Color',mix,1);link(nt,ref,'Color',mix,2)
 link(nt,mix,'Color',bs,'Base Color')
 micro=node('ShaderNodeTexNoise',-680,-340,'Micro-surface relief');sock(micro,'Scale',{'skin':850,'cloth':1050,'rock':730,'fur':1250,'chitin':615,'rope':970,'metal':1000}.get(typ,800));sock(micro,'Detail',2.4);link(nt,tx,'Object',micro,'Vector')
 rough={'eye':.19,'glass':.23,'emissive':.28,'opal':.38,'metal':.45,'leather':.61,'chitin':.43,'feather':.50}.get(typ,.75)
 sock(bs,'Roughness',rough);sock(bs,'Metallic',.72 if typ=='metal' else .02)
 if typ in ('skin','opal','glass','fur','ear'):sock(bs,'Subsurface Weight',.055 if typ!='opal' else .16);sock(bs,'Subsurface Scale',.035)
 if typ in ('feather','cloth','fur','rope'):sock(bs,'Sheen Weight',.22)
 if typ in ('eye','chitin','glass','opal'):sock(bs,'Coat Weight',.34)
 if typ=='glass':sock(bs,'Transmission Weight',.38);sock(bs,'IOR',1.37)
 if typ=='emissive':sock(bs,'Emission Color',rgb('ff9e36'));sock(bs,'Emission Strength',1.1)
 bump=node('ShaderNodeBump',340,-125);sock(bump,'Strength',.11 if typ in ('eye','glass','emissive') else .28);sock(bump,'Distance',.00075 if typ in ('eye','cloth') else .0019)
 if typ=='cloth':
  wv=node('ShaderNodeTexWave',-660,-590,'Woven warp');wv.bands_direction='Z';sock(wv,'Scale',320);sock(wv,'Distortion',1.7);link(nt,tx,'Object',wv,'Vector')
  mul=node('ShaderNodeMixRGB',-130,-390);mul.blend_type='MULTIPLY';sock(mul,0,.48);link(nt,micro,'Fac',mul,1);link(nt,wv,'Fac',mul,2);link(nt,mul,'Color',bump,'Height')
 else:link(nt,micro,'Fac',bump,'Height')
 link(nt,bump,'Normal',bs,'Normal')
 # A seamless, physical-scale relief atlas covers the reverse, sides and unpainted hardware.
 tile=bpy.data.images.get('Microrelief / '+typ)
 if not tile:
  tile=bpy.data.images.load(str(D/'micro'/(typ+'.png')));tile.name='Microrelief / '+typ;tile.colorspace_settings.name='Non-Color';tile.pack()
 scale_tex=node('ShaderNodeVectorMath',-1170,-820);scale_tex.operation='SCALE';scale_tex.inputs['Scale'].default_value=4.5 if typ in ('rock','skin','chitin','fur') else 6.8;link(nt,tx,'Object',scale_tex,0)
 maptex=node('ShaderNodeTexImage',-930,-800,'Wear and relief / seamless 3D box projection');maptex.image=tile;maptex.projection='BOX';maptex.projection_blend=.26;link(nt,scale_tex,'Vector',maptex,'Vector')
 aged=node('ShaderNodeValToRGB',-660,-810,'Pigment variation')
 pal=aged.color_ramp;pal.elements[0].position=.26;pal.elements[0].color=tuple(base*.26)+(1,);pal.elements[1].position=.86;pal.elements[1].color=tuple(np.minimum(1,base*1.58+.015))+(1,);mid=pal.elements.new(.61);mid.color=tuple(base*.86)+(1,);link(nt,maptex,'Color',aged,'Fac')
 nat=node('ShaderNodeMixRGB',-250,-40);sock(nat,0,.68 if typ not in ('eye','glass','emissive') else .19);link(nt,ramp,'Color',nat,1);link(nt,aged,'Color',nat,2);link(nt,nat,'Color',mix,1)
 roughvar=node('ShaderNodeMapRange',100,-490);sock(roughvar,'From Min',.22);sock(roughvar,'From Max',.9);sock(roughvar,'To Min',max(.1,rough-.13));sock(roughvar,'To Max',min(.96,rough+.12));link(nt,maptex,'Color',roughvar,'Value');link(nt,roughvar,'Result',bs,'Roughness')
 grainb=node('ShaderNodeBump',50,-200);sock(grainb,'Strength',.38 if typ in ('rock','fur','skin','chitin','leather') else .20);sock(grainb,'Distance',.0020);link(nt,maptex,'Color',grainb,'Height');link(nt,grainb,'Normal',bump,'Normal')
 if key in ('stripe','slate','basalt','shell','ochrefur','ear','turtle','glasscoral'):
  special=node('ShaderNodeMixRGB',-180,-680);sp=0.5
  if key in ('stripe','slate','ear'):
   detail=node('ShaderNodeTexWave',-490,-950);detail.bands_direction='X' if key!='slate' else 'Z';sock(detail,'Scale',9 if key=='stripe' else 20);sock(detail,'Distortion',5 if key!='slate' else 3);sock(detail,'Detail',4);link(nt,tx,'Object',detail,'Vector');signal='Fac';high=(.63,.46,.25) if key=='stripe' else base*1.5;sp=.68 if key=='stripe' else .37
  else:
   detail=node('ShaderNodeTexNoise',-490,-950);sock(detail,'Scale',60 if key!='turtle' else 34);sock(detail,'Detail',4);link(nt,tx,'Object',detail,'Vector');signal='Fac';high={'basalt':(.39,.16,.028),'turtle':(.21,.25,.045),'shell':(.25,.18,.058),'ochrefur':(.37,.19,.042),'glasscoral':(.89,.48,.29)}[key];sp=.73
  col=node('ShaderNodeValToRGB',-310,-1040);rc=col.color_ramp;rc.elements[0].position=.65 if key=='basalt' else .32;rc.elements[0].color=tuple(base*.59)+(1,);rc.elements[1].position=.78 if key=='basalt' else .69;rc.elements[1].color=tuple(high)+(1,);link(nt,detail,signal,col,'Fac');link(nt,nat,'Color',special,1);link(nt,col,'Color',special,2);sock(special,0,sp);link(nt,special,'Color',mix,1)
 n.active=ref
 mats[sig]=m;return m
def coords(x,z,d):return ((x-cx)*scale,-d*scale,(c['floor']-z)*scale)
def make(n,key,verts,faces,weights=None,attach=True):
 mesh=bpy.data.meshes.new(n);mesh.from_pydata([coords(*v) for v in verts],[],faces);mesh.update()
 # Face winding is corrected per closed volume before shading.
 if mesh.polygons:
  vv=np.array(verts); fv=faces
  b0=np.array([vv[f[0]] for f in fv]);b1=np.array([vv[f[1]] for f in fv]);b2=np.array([vv[f[2]] for f in fv])
  center=vv.mean(axis=0)
  # (x,z,d) to Blender world has a negative determinant.
  if np.sum(np.einsum('ij,ij->i',b0-center,np.cross(b1-center,b2-center)))>0:mesh.flip_normals()
 for p in mesh.polygons:p.use_smooth=True
 mesh.materials.append(material(key))
 uv=mesh.uv_layers.new(name='Concept registration')
 co=np.array([(max(0,min(.999,(x+.5)/tw)),max(0,min(.999,1-(z+.5)/th))) for x,z,d in verts],dtype=np.float32)
 idx=np.empty(len(mesh.loops),dtype=np.int32);mesh.loops.foreach_get('vertex_index',idx);uv.data.foreach_set('uv',co[idx].flatten())
 attr=mesh.attributes.new(name='Reference weight',type='FLOAT',domain='POINT')
 if weights is None:weights=np.zeros(len(verts),dtype='float32')
 attr.data.foreach_set('value',np.array(weights,dtype=np.float32))
 o=bpy.data.objects.new(n,mesh);target.objects.link(o);return o
def wght(front):return max(0,min(.99,(front-.015)/.52))*.98
def easeval(prof,z):
 # Shape-preserving cubic interpolation of the traced section rings.
 zvals=prof[:,0]; j=max(0,min(len(prof)-2,np.searchsorted(zvals,z,side='right')-1));t=max(0,min(1,(z-zvals[j])/(zvals[j+1]-zvals[j])))
 y1,y2=prof[j,1:],prof[j+1,1:];s=y2-y1
 def slope(i,jj):
  if i<0 or jj>=len(prof):return s
  value=(prof[jj,1:]-prof[i,1:])/(zvals[jj]-zvals[i])*(zvals[j+1]-zvals[j]);return np.where(s*value>0,np.sign(s)*np.minimum(abs(value),abs(s)*2),0)
 a=slope(j-1,j+1);b=slope(j,j+2)
 return y1+(t**3-2*t*t+t)*a+(-2*t**3+3*t*t)*s+(t**3-t*t)*b
def section(n,m,cy,rd,profile,cloth=False,project=True):
 pf=np.asarray(profile);native=pf[:,2]-pf[:,1];maxw=max(native);vs=[];fs=[];weights=[]
 rng=random.Random(n);ph=rng.random()*5;typ=palette[m][1]
 rows=sorted(set([float(a[0]) for a in pf]+list(np.arange(pf[0,0]+1.15,pf[-1,0],1.7 if typ not in ('cloth','leather') else 2.1))))
 seg=64 if maxw>65 else 48 if maxw>28 else 32
 for j,z in enumerate(rows):
  l,r=easeval(pf,z);mid=(r+l)/2;rad=max(.25,(r-l)/2);hrel=(z-pf[0,0])/(pf[-1,0]-pf[0,0]+.001)
  dep=max(.35,rd*(max(.01,2*rad/maxw)**.63))
  # Soften ends of main anatomical forms. Garment hems retain their cut edges.
  if not cloth and m not in ('brass','steel') and len(pf)>3:
   dep*=.48+.52*min(1,hrel*9,(1-hrel)*9)**.48
  for k in range(seg):
   a=2*pi*k/seg;si=sin(a);v=cos(a)
   amp=min(1.1,rad*.047) if cloth else min(.36,rad*.012)
   noise=amp*(sin(a*9+z*.029+ph)+.44*sin(a*13-z*.042)+.27*sin(a*4+z*.136)) if rad>2 else 0
   x=mid+(rad+noise*.42)*si
   d=cy+(dep+noise)*v
   # Profile sculpting preserves the traced front contour while shaping the sagittal plane.
   if 'boot' in n.lower():
    toe=max(0,(hrel-.42)/.58);d+=rd*toe*.88+rd*toe*.62*v
   if n in ('Near arm','Far arm'):
    isnear=n=='Near arm';d+=rd*((.67 if isnear else -.22)*hrel-.42*sin(pi*hrel))
   if n=='Cranium':d+=rd*(.20+.19*sin(pi*hrel))*(1 if v>=0 else .20)+rd*v*.14
   if n in ('Left trouser leg','Right trouser leg'):d+=rd*.25*sin(hrel*pi*1.65)
   if cloth and rad>9 and 'belt' not in n.lower():
    # Pressed cloth at elbows, falling folds at hems, and diagonal creases over the back.
    wide=abs(v)**.6
    back=max(0,-v)
    fold=(sin(9*a+2.6*hrel)+.54*sin(15*a-2*hrel+ph))*rad*.062*(.3+.70*hrel**1.5)
    bunch=sin(z*.44+4*a+ph)*(.3+.7*sin(2*pi*hrel+ph)**4)*min(2.9,rd*.08)
    d+=v*(fold+bunch)*(0.25+.75*back)*wide
    d-=back*rad*.055*sin(a*3+z*.065+ph)
   if n=='Cranium' and typ=='rock':d+=.9*v*sin(a*4+z*.37)+.45*v*sin(a*9-z*.49)
   # Carved muzzle and brow relief from the painted tonal field, limited to sub-pixel displacement.
   if project and typ in ('rock','skin','chitin','leather','cloth') and v>0 and z>1:
    bump=lum[int(np.clip(z,1,th-2)),int(np.clip(x,1,tw-2))]
    d+=max(0,v)*min(rd*.045,1.1)*bump
   vs.append((x,z,d));weights.append(wght(v) if project else 0)
   if j and k>=0:
    a0=(j-1)*seg+k;a1=(j-1)*seg+(k+1)%seg;b0=a0+seg;b1=a1+seg;fs.append((a0,a1,b1,b0))
 for j in (0,len(rows)-1):
  vs.append(((pf[0 if j==0 else -1,1]+pf[0 if j==0 else -1,2])/2,rows[j],cy));weights.append(.25 if project else 0)
  pole=len(vs)-1
  for k in range(seg):
   a0=j*seg+k;a1=j*seg+(k+1)%seg;fs.append((pole,a1,a0) if j==0 else (pole,a0,a1))
 return make(n,m,vs,fs,weights)
def ell_data(x,z,d,rx,rz,rd,project=True,nseg=28,nring=16):
 vs=[];fs=[];weights=[]
 for i in range(1,nring):
  a=pi*i/nring
  for k in range(nseg):
   b=k*2*pi/nseg;v=sin(a)*cos(b)
   vs.append((x+rx*sin(a)*sin(b),z-rz*cos(a),d+rd*v));weights.append(wght(v) if project else 0)
   if i>1:
    v0=(i-2)*nseg+k;v1=(i-2)*nseg+(k+1)%nseg;fs.append((v0,v1,v1+nseg,v0+nseg))
 for i,zz in enumerate((z-rz,z+rz)):
  vs.append((x,zz,d));weights.append(.3 if project else 0);p=len(vs)-1;base=0 if i==0 else (nring-2)*nseg
  for k in range(nseg):
   a=base+k;b=base+(k+1)%nseg;fs.append((p,b,a) if i==0 else (p,a,b))
 return vs,fs,weights
def ball(n,m,x,z,d,rx,rz,rd,project=True):
 return make(n,m,*ell_data(x,z,d,rx,rz,rd,project))
def tubedata(pts,frac=1,project=True,seg=12,steps=4):
 p=np.array(pts,dtype=float);samples=[]
 for j in range(len(p)-1):
  a=p[max(0,j-1)];b=p[j];cc=p[j+1];e=p[min(len(p)-1,j+2)]
  for k in range(steps):
   t=k/steps
   val=.5*((2*b)+(-a+cc)*t+(2*a-5*b+4*cc-e)*t*t+(-a+3*b-3*cc+e)*t*t*t)
   val[3]=max(.08,min(max(b[3],cc[3])*1.10,val[3]));samples.append(val)
 samples.append(p[-1]);vs=[];fs=[];weights=[];prev=None
 for j,(x,z,d,r) in enumerate(samples):
  tangent=Vector(samples[min(len(samples)-1,j+1)][:3]-samples[max(0,j-1)][:3]);tangent.normalize()
  side=Vector((-tangent.y,tangent.x,0))
  if side.length<.001:side=Vector((1,0,0))
  side.normalize()
  if prev is not None and prev.dot(side)<0:side.negate()
  prev=side
  forward=tangent.cross(side).normalized()
  if forward.z<0:forward.negate()
  for k in range(seg):
   a=2*pi*k/seg;off=side*(sin(a)*r)+forward*(cos(a)*r*frac)
   vs.append((x+off.x,z+off.y,d+off.z));weights.append(wght(cos(a)) if project else 0)
   if j:
    aa=(j-1)*seg+k;bb=(j-1)*seg+(k+1)%seg;fs.append((aa,bb,bb+seg,aa+seg))
 for j in (0,len(samples)-1):
  vs.append(tuple(samples[j][:3]));weights.append(0);q=len(vs)-1
  for k in range(seg):
   a=j*seg+k;b=j*seg+(k+1)%seg;fs.append((q,b,a) if j==0 else (q,a,b))
 return vs,fs,weights
def tube(n,m,pts,frac=1,project=True):return make(n,m,*tubedata(pts,frac,project,12 if max(p[3] for p in pts)<2 else 20,5))
def merged(n,m,items):
 if not items:return
 vs=[];fs=[];wt=[]
 for v,f,w in items:
  off=len(vs);vs+=v;fs.extend(tuple(k+off for k in ff) for ff in f);wt+=w
 return make(n,m,vs,fs,wt)
def surface(pf,x,z,dep,cy,back=False):
 p=np.array(pf);l,r=easeval(p,min(p[-1,0],max(p[0,0],z)));half=(r-l)/2;u=(x-(r+l)*.5)/max(.1,half)
 return cy+(-1 if back else 1)*dep*(max(.02,2*half/max(p[:,2]-p[:,1]))**.63)*sqrt(max(.04,1-u*u))
def finish_details():
 rng=random.Random(name);parts=c['parts']
 # Build a continuous back panel underneath the split fronts of the long coats.
 if name in ('Eskel','Ureth','Ulnor','Nemeya'):
  extra={
   'Eskel':('ivory',-7,13,[(62,136,165),(82,123,182),(106,116,188),(135,110,180),(164,103,161),(192,102,137),(205,105,116)]),
   'Ureth':('wine',-7,17,[(84,146,197),(120,135,207),(153,133,210),(196,126,215),(228,118,217),(253,109,211),(267,107,195)]),
   'Ulnor':('wine',-8,21,[(56,132,177),(78,116,192),(105,115,199),(137,113,203),(179,109,211),(213,100,218),(245,92,222),(252,101,212)]),
   'Nemeya':('teal',-5,13,[(74,132,174),(92,122,182),(119,123,181),(144,120,183),(170,117,184),(193,120,184)])}
  ma,dy,dd,p=extra[name];section('Back skirt and lining',ma,dy,dd,p,True,False)
 torso=next(p for p in parts if p[5] and not any(s in p[0].lower() for s in ['leg','arm','sleeve']))
 _,ma,cy,rd,pf,_=torso;zp=np.array(pf);top=zp[0,0];bot=zp[-1,0];h=bot-top
 def at(t,u,e=0,back=True,cy=cy,rd=rd):
  z=top+h*t;l,r=easeval(zp,z);x=(r+l)/2+u*(r-l)/2
  return (x,z,surface(pf,x,z,rd,cy,back)+(-e if back else e))
 def drawseam(label,points,rad=.7,mat=None):
  tube(label,mat or ma,[(*p,rad) for p in points],.9,False)
 def stitches(label,points,mat):
  el=[]
  for f,g in zip(points[:-1],points[1:]):
   a=np.array(f);b=np.array(g);ln=np.linalg.norm(b-a);num=max(1,int(ln/3))
   for j in range(num):
    if ln<.05:continue
    f0=a+(b-a)*(j+.12)/num;f1=a+(b-a)*(j+.67)/num
    el.append(tubedata([(*f0,.22),(*f1,.22)],1,False,5,1))
  merged(label,mat,el)
 if name not in ('Zhavet',):
  for u in [-.76,.74]:
   ps=[at(t,u+.05*sin(t*pi),.35) for t in np.linspace(.20,.93,12)]
   drawseam('Back panel welt',ps,.75)
   stitches('Back panel topstitch',[(x+1.1,z,d-.24) for x,z,d in ps],'suture')
  ps=[at(.23+.055*(1-abs(u)),u,.65) for u in np.linspace(-.90,.90,15)]
  drawseam('Shoulder yoke seam',ps,.9);stitches('Shoulder yoke topstitch',[(x,z+1.45,d-.3) for x,z,d in ps],'suture')
  for back in [True, False]:
   ps=[at(.973,u,.5,back) for u in np.linspace(-.90,.90,19)]
   drawseam('Sewn hem facing',ps,.6)
 # Individual seams and stacked creases on the limbs wrap in three dimensions.
 for nm,ma,cy,rd,profile,cloth in parts:
  if 'trouser' not in nm.lower() or palette[ma][1]!='cloth':continue
  p=np.array(profile);zs=p[:,0];vs=[]
  for u in np.linspace(.13,.95,18):
   z=zs[0]+(zs[-1]-zs[0])*u;l,r=easeval(p,z);x=l+(r-l)*.14
   vs.append((x,z,surface(profile,x,z,rd,cy,True)-.45))
  drawseam(nm+' outseam',vs,.56,ma);stitches(nm+' seam stitches',vs,'suture')
 # Front paws consist of separate knuckles and tapered digits, with a turned thumb.
 handspec={
 'Taluun':[(121,177,7,10,24,1),(235,176,2,6,20,-1)],
 'Orrek':[(70,177,8,24,32,1),(243,173,6,17,39,-1)],
 'Vessari':[(104,182,8,5,12,1),(191,180,0,4.5,13,-1)],
 'Mothren':[(95,176,8,10,24,1),(204,183,3,6,19,-1)],
 'Ureth':[(133,193,7,4.7,20,1),(224,199,1,3.6,14,-1)],
 'Keld':[(77,184,11,15,29,1),(236,181,9,12,29,-1)],
 'Sovai':[(97,182,7,4.7,18,1),(198,181,2,4,16,-1)],
 'Brunn':[(57,189,11,13,27,1),(239,197,9,13,28,-1)],
 'Pelrin':[(129,175,8,7,19,1),(231,179,3,5.8,18,-1)],
 'Koruun':[(119,137,38,12,14,1),(242,178,12,10,23,-1)],
 'Eskel':[(123,187,8,4.5,18,1),(197,185,2,4.1,16,-1)],
 'Dathri':[(221,167,5,5.5,18,-1)]}
 for x,z,d,w,ll,sg in handspec.get(name,[]):
  for k in range(4):
   xx=x+(k-1.5)*w*.43;end=ll*(.7+.28*sin((k+.6)*pi/4))
   pts=[(xx,z,d,w*.25),(xx+sg*.8,z+end*.34,d+1,w*.27),(xx+sg*1.6,z+end*.68,d+2,w*.22),(xx+sg*3,z+end,d+3,w*.12)]
   tube('Digit '+str(k+1),c['main'],pts,.94,True)
  pts=[(x+sg*w*.7,z-2,d,w*.40),(x+sg*w*1.13,z+ll*.22,d+2,w*.29),(x+sg*w*1.04,z+ll*.57,d+4,w*.20)]
  tube('Opposable thumb',c['main'],pts,1,True)
 # Each main eye is a convex globe with a surrounding raised eyelid and separate cornea reflection.
 for nm,ma,x,z,d,rx,rz,rd,pr in c['beads']:
  if not nm.startswith('Eye globe'):continue
  for s in (-1,1):
   pts=[]
   for u in np.linspace(-1,1,11):
    dx=u*rx;dz=s*rz*sqrt(max(.01,1-u*u))*.87
    pts.append((x+dx,z+dz,d+rd*.38, max(.25,rz*(.115 if s<0 else .076))))
   tube('Upper eyelid' if s<0 else 'Lower eyelid',c['main'],pts,.9,True)
 # Geometry-based surface characters. All marks follow their backing surface.
 for nm,ma,cy,rd,profile,cloth in parts:
  if nm not in ('Cranium','Neck','Near arm','Far arm','Major chela body','Layered carapace crown','Lichen-covered cranial shield'):continue
  typ=palette[ma][1]
  if typ not in ('rock','fur','skin','chitin','feather'):continue
  p=np.array(profile); z0,z1=p[0,0],p[-1,0];wmax=max(p[:,2]-p[:,1]);area=wmax*(z1-z0)
  if typ=='fur':number=int(area*.093)
  elif typ=='feather':number=int(area*.016)
  else:number=int(area*.020)
  tuft=[]; flecks=[]
  for i in range(min(740,number)):
   a=rng.uniform(-pi,pi);z=rng.uniform(z0+(z1-z0)*.15,z1-(z1-z0)*.12);l,r=easeval(p,z);half=(r-l)/2;x=(r+l)/2+half*sin(a)
   skin=rd*(max(.01,2*half/wmax)**.63); dd=cy+skin*cos(a);sense=1 if cos(a)>0 else -1
   if typ in ('fur','feather'):
    length=rng.uniform(1.5,4.1) if typ=='fur' else rng.uniform(2.5,7.5)
    if cos(a)>.5 and nm=='Cranium' and z<(z0+z1)*.59:continue
    w=rng.uniform(.18,.52) if typ=='fur' else rng.uniform(.6,1.2)
    endx=x+sin(a)*length*.65
    vec=[(x,z,dd,w*.75),(x+sin(a)*.55,z+length*.42,dd+cos(a)*.6,w),(endx,z+length,dd+cos(a)*.94,.06)]
    tuft.append(tubedata(vec,.57,cos(a)>.12,5,1))
   elif abs(cos(a))<.4 or cos(a)<0 or rng.random()<.35:
    rad=rng.uniform(.32,1.07) if typ!='rock' else rng.uniform(.42,1.38)
    flecks.append(ell_data(x,z,dd,rad,rad*.65,rad*.44,cos(a)>.22,7,4))
  merged(nm+' / groomed fibres',ma,tuft);merged(nm+' / raised integument',ma,flecks)
 # Individually designed rear fittings: useful in reverse and profile.
 rear={
 'Taluun':('rope','rope keeper'), 'Orrek':('leather','cross braces'), 'Vessari':('blue','radio pack'),
 'Mothren':('leather','cross braces'), 'Ureth':('wine','hood'), 'Keld':('leather','cross braces'),
 'Sovai':('canvas','apron ties'), 'Brunn':('denim','cross braces'), 'Pelrin':('leather','courier sling'),
 'Zhavet':('copper','survey sash'), 'Koruun':('rust','cook’s yoke'), 'Eskel':('ivory','mantle folds'),
 'Rhovi':('mustard','jacket pleats'), 'Nemeya':('teal','waistcoat tabs'), 'Dathri':('denim','cross braces'),
 'Ulnor':('wine','storm flap')}
 ma,what=rear[name]
 if what in ('cross braces','courier sling','survey sash','rope keeper'):
  for s in ((-1,1) if what=='cross braces' else (1,)):
   pts=[at(t,s*(.68-1.27*t),1.1) for t in np.linspace(.04,.81,13)]
   width=3.8 if what!='rope keeper' else 1.7
   tube(what.title(),ma,[(*q,width) for q in pts],.35,False)
 elif what=='radio pack':
  xx,zz,dd=at(.47,0,1);section('Radio pack rear housing','leather',dd-3,5,[(zz-15,xx-9,xx+9),(zz-12,xx-13,xx+13),(zz+13,xx-13,xx+13),(zz+16,xx-10,xx+10)],False,False)
  for j in range(4):drawseam('Radio back grille',[(xx-7,zz-5+j*3,dd-8),(xx+7,zz-5+j*3,dd-8)],.6,'darkmetal')
 elif what=='apron ties':
  x,z,dd=at(.44,0,1.5)
  for s in (-1,1):tube('Tied apron bow','canvas',[(x,z,dd,2),(x+s*8,z-3,dd-1,2),(x+s*12,z-1,dd-1,1.6),(x+s*7,z+4,dd-2,1.3),(x,z,dd,1.3),(x+s*6,z+13,dd-2,1.7)],.42,False)
 else:
  for j in range(3 if what in ('mantle folds','hood') else 2):
   ps=[at(.14+j*.06+.08*(1-u*u),u,1) for u in np.linspace(-.74,.73,16)]
   tube(what.title(),ma,[(*q,1.6 if what in ('hood','mantle folds') else 1.0) for q in ps],.64,False)
 # Engraved buttons on front garments, recovered from the photographic placement.
 buttons={'Pelrin':[(192,z) for z in (100,122,147,171,197)],'Rhovi':[(193,z) for z in (94,108,122)],'Ulnor':[(151,z) for z in (112,137,161,184,205,226)],'Koruun':[(151,z) for z in (97,117,141,164,188)],'Eskel':[]}
 for x,z in buttons.get(name,[]):
  d=surface(pf,x,z,torso[3],torso[2])+.9;ball('Garment fastener','brass',x,z,d,1.65,1.65,.72)
def extra_detail():
 from mathutils.bvhtree import BVHTree
 import bisect
 core=c['parts'];primary=set()
 for title,mat,y,r,pro,cloth in core:
  if title in ('Cranium','Neck','Left trouser leg','Right trouser leg','Left boot','Right boot','Near arm','Far arm','Major chela body','Near hand','Far hand') or (cloth and r>=14) or title in ('Thoracic carapace','Translucent occipital sail','Layered carapace crown','Lichen-covered cranial shield','Quilted shoulder guard','Fitted jerkin'):
   primary.add(title)
 core_names=primary|{'Back skirt and lining'}
 def basekey(obj):return re.sub(r'\.\d+$','',obj.name)
 objs=list(target.objects)
 def tree(select):
  verts=[];faces=[]
  for ob in objs:
   key=basekey(ob)
   if not select(key):continue
   off=len(verts);verts.extend(v.co.copy() for v in ob.data.vertices);faces.extend(tuple(i+off for i in p.vertices) for p in ob.data.polygons)
  return BVHTree.FromPolygons(verts,faces) if faces else None
 treeall=tree(lambda k:k in core_names)
 headtree=tree(lambda k:k in {'Cranium','Neck','Lichen-covered cranial shield','Layered carapace crown'})
 trunk=next(p for p in core if p[5] and not any(t in p[0].lower() for t in ('leg','arm','sleeve')))
 trunk_tree=tree(lambda k:k==trunk[0] or k=='Back skirt and lining')
 def hit(x,z,back=False,tree=None):
  db=-1 if back else 1;start=Vector(coords(x,z,db*180))
  pos,normal,idx,dist=(tree or treeall).ray_cast(start,(0,db,0),3.5)
  return -pos.y/scale if pos else None
 def pxvert(v):return (v.co.x/scale+cx,c['floor']-v.co.z/scale,-v.co.y/scale)
 def addpad(n,ma,x,z,rx,rz,deep=2,back=False,tree=None):
  d=hit(x,z,back,tree);sg=-1 if back else 1
  if d is not None:ball(n,ma,x,z,d+sg*.12,rx,rz,deep,not back)
 def against(n,ma,coords2,rr=.9,back=False,tree=None,project=None,flat=1.0):
  pts=[];sg=-1 if back else 1
  for q in coords2:
   x,z=q[:2];r=q[2] if len(q)>=3 else rr;dd=hit(x,z,back,tree)
   if dd is not None:pts.append((x,z,dd+sg*min(r*.3,.65),r))
  if len(pts)>=2:tube(n,ma,pts,flat,(not back) if project is None else project)
 # Place the sculpted eyes and lids, facial pits, and hardware on the finished surface, including the curved hull of the body.
 for ob in objs:
  k=basekey(ob)
  eyes=k.startswith('Eye globe')
  lids=k in ('Upper eyelid','Lower eyelid')
  face=eyes or lids or k.startswith('Sensory pit') or k in ('Ring mouth','Forked muzzle','Raised upper lip','Paired labial pad')
  fabric=k in ('Towing shoulder strap','Apron shoulder strap','Suspender','Bib brace','Left indigo lapel','Right indigo lapel','Courier crossbody strap','Woven surveyor baldric','Brocade lapel','Crossbody lanyard','Draped cowl','Mantle bias fold','Towing shoulder strap')
  # Filaments, claws and other free ends keep their independently sculpted depth.
  if not (face or fabric):continue
  xyz=np.array([pxvert(v) for v in ob.data.vertices]);xc=(xyz[:,0].min()+xyz[:,0].max())/2;zc=(xyz[:,1].min()+xyz[:,1].max())/2
  dc=(xyz[:,2].min()+xyz[:,2].max())/2;ref=hit(xc,zc,False,headtree if face else trunk_tree)
  if ref is None:continue
  if face:
   if eyes:
    depth=xyz[:,2].ptp() if hasattr(xyz[:,2],'ptp') else np.ptp(xyz[:,2]);offset=ref-depth*.19-dc
   elif lids:offset=ref+1.2-dc
   else:offset=ref-.25-dc
   for v in ob.data.vertices:v.co.y-=scale*offset
  else:
   for v,(x,z,dd) in zip(ob.data.vertices,xyz):
    dep=hit(float(x),float(z),False,trunk_tree)
    if dep is None:continue
    v.co.y=-scale*(dep+.28+.18*(dd-dc))
  ob.data.update()
 # An individually shaped mouth projects from the cheek mass so it reads from a side view.
 mouth={
 'Taluun':[(167,40,1.0),(181,40,1.55),(196,39,1.45),(208,39,1.15),(215,40,.65)],
 'Orrek':[(153,52,1.5),(162,49,1.5),(175,48,1.7),(186,49,1.4),(193,50,1)],
 'Brunn':[(157,55,1.2),(162,52,1.5),(171,51,2.1),(181,55,1.65),(185,59,.9)],
 'Rhovi':[(184,39,1.1),(197,37,1.5),(209,36,1.4),(219,35,.8)],
 'Ulnor':[(159,34,1.4),(167,35,1.5),(183,34,1.3),(192,34,1)],
 'Sovai':[(154,32,1),(163,33,1.2),(171,32,1),(180,32,.7)],
 'Pelrin':[(179,49,.7),(187,51,1.15),(194,48,1),(201,49,.8)],
 'Eskel':[(148,28,.7),(152,27,.9),(159,24,.9),(168,22,.55)],
 'Koruun':[(130,51,1.4),(139,57,1.8),(151,62,2.5),(171,64,2.7),(188,61,2.5),(201,57,1.8),(208,50,1)]}
 if name in mouth:against('Sculpted labial ridge',c['main'],mouth[name],tree=headtree)
 for n,ma,x,z,rx,rz,rd in {
 'Brunn':[('Broad nasal bridge','ochre',169,39,13,11,8)],'Rhovi':[('Tapered flight muzzle','fawn',203,32,14,6,9)],
 'Ulnor':[('Muzzle pad','stripe',180,29,12,9,9)],'Pelrin':[('Nasal cartilage','fawn',192,43,6,4.3,4)],
 'Orrek':[('Axial lower jaw scute','slate',173,58,19,7,6)],'Mothren':[('Feeding rostrum','ochrefur',160,77,7,6,6)],
 'Dathri':[('Buccal scutum','shell',164,56,9,7,6)]}.get(name,[]):addpad(n,ma,x,z,rx,rz,rd,tree=headtree)
 # Boots have heel cups, circumferential welts, crossed lacing and ground-contact tread.
 for nm,m,cy,rd,pf,cloth in core:
  if nm not in ('Left boot','Right boot') or m!='leather':continue
  boot_tree=tree(lambda k:k==nm);p=np.array(pf);z0,z1=p[0,0],p[-1,0];height=z1-z0
  z=z1-max(.6,height*.055);l,r=easeval(p,z);mid=(l+r)/2;wid=(r-l)/2
  bits=[]
  coords1=[]
  for k in range(29):
   a=2*pi*k/28;x=mid+wid*.978*sin(a);dd=hit(x,z,cos(a)<0,boot_tree)
   if dd is not None:coords1.append((x,z,dd, max(.5,min(1.15,height*.044))))
  if len(coords1)>8:tube(nm+' sole welt','darkmetal',coords1,.85,False)
  if height<15:continue
  for j in range(3):
   zz=z0+height*(.21+j*.135);l,r=easeval(p,zz);xc=(l+r)/2;w=(r-l)*.22
   for s in (-1,1):against('Crossed boot lace','rope',[(xc-w*s,zz,.48),(xc,zz+1.5,.52),(xc+w*s,zz+2.9,.5)],tree=boot_tree,project=False)
  # Rear layered heel counter with a stitched upper edge.
  zz=z0+height*.64;l,r=easeval(p,zz);xs=np.linspace(l+(r-l)*.09,r-(r-l)*.09,13)
  against('Stitched heel counter','leather',[(x,zz+2.0*(1-((x-mid)/(wid+.01))**2),.68) for x in xs],back=True,tree=boot_tree)
 # Proper rear faces for the translucent ear and antenna sheets.
 rng=random.Random('finish'+name)
 if name=='Pelrin':
  for x,tip in [(165,98),(205,255)]:
   sign=1 if tip>x else -1
   for k in range(9):
    a=-.9+k*.222;ex=x+sign*(40+11*cos(a*2));ey=26+sin(a)*23
    tube('Reverse pinna branching vessel','fawn',[(x,34,-2,.72),(x+sign*20,31+sin(a)*5,-6.3,.73),(ex,ey,-8,.27)],.7,False)
 if name in ('Orrek','Dathri','Koruun'):
  cp=next(q[4] for q in core if q[0]==('Cranium' if name=='Orrek' else 'Layered carapace crown' if name=='Dathri' else 'Lichen-covered cranial shield'));p=np.array(cp);width=max(p[:,2]-p[:,1]);h=p[-1,0]-p[0,0]
  for row in range(3 if name=='Orrek' else 4):
   t=.24+row*(.17 if name=='Orrek' else .16);zz=p[0,0]+h*t;l,r=easeval(p,zz)
   for j in range(6 if name!='Orrek' else 5):
    xx=l+(r-l)*(.13+.14*j+(row%2)*.044);ww=width*(.083 if name!='Orrek' else .092);back_d=hit(xx,zz,True,headtree)
    if back_d is None:continue
    ball('Dorsal overlapping head plate',c['main'],xx,zz,back_d+.6,ww,h*.095,1.8+ww*.21,False)
    if name=='Koruun' and rng.random()<.68:
     for kk in range(3):
      ball('Lichen rosette','shell',xx+rng.uniform(-ww*.6,ww*.6),zz+rng.uniform(-2,2),back_d-2,1.15,.9,.72,False)
 if name=='Nemeya':
  for j in range(9):
   ang=(j+.5)/9*pi*1.7-.35*pi
   pts=[]
   for k in range(10):
    t=k/9;zz=8+t*35;x=157+sin(ang)*(15+31*t)+2*sin(t*6+j)
    dd=hit(x,zz,True,headtree)
    if dd is not None:pts.append((x,zz,dd-.18,.24+.34*sin(t*pi)))
   if len(pts)>2:tube('Subdermal bell vessel','coral',pts,.65,False)
 # Rear garment panels are mesh overlays conformed over the actual final garment.
 p=np.array(trunk[4]);top=p[0,0];h=p[-1,0]-top
 def panelpt(t,u):
  z=top+h*t;l,r=easeval(p,z);return ((l+r)/2+u*(r-l)/2,z)
 def fitted_patch(label,ma,t0,t1,u0,u1,depth,pleat=False):
  vs=[];faces=[];nu,nv=12,11;snap=[]
  for side in (0,1):
   for iz in range(nv):
    v=iz/(nv-1);t=t0+(t1-t0)*v
    for ix in range(nu):
     f=ix/(nu-1);u=u0+(u1-u0)*f;x,z=panelpt(t,u)
     z+=2.3*sin(pi*f)*(1-v)**2
     dd=hit(x,z,True,trunk_tree)
     if dd is None:dd=surface(trunk[4],x,z,trunk[3],trunk[2],True)
     amount=(.48 if side==0 else .48+depth*(.21+.79*(sin(pi*f)*sin(pi*v))**.52)) if side else -.35
     if side and pleat:amount+=1.6*max(0,1-abs(f-.52)*10)*sin(pi*v)
     vs.append((x,z,dd-amount))
  L=nu*nv
  for j in range(nv-1):
   for i in range(nu-1):
    q=j*nu+i
    faces.extend([(q,q+1,q+1+nu,q+nu),(q+L+nu,q+L+nu+1,q+L+1,q+L)])
  border=[*range(nu),*(i*nu+nu-1 for i in range(1,nv)),*range(L-2,L-nu-1,-1),*(i*nu for i in range(nv-2,0,-1))]
  for k,a in enumerate(border):b=border[(k+1)%len(border)];faces.append((a,b,b+L,a+L))
  make(label,ma,vs,faces)
  edging=[(*vs[i+L],.45) for i in border+[border[0]]];tube(label+' bound edge',ma,edging,.8,False)
  emb=[]
  for aa,bb in zip(edging[:-1],edging[1:]):
   a=np.array(aa[:3]);b=np.array(bb[:3]);ln=np.linalg.norm(b-a);cnt=max(1,round(ln/3.2))
   for k in range(cnt):emb.append(tubedata([(*(a+(b-a)*(k+.12)/cnt),.17),(*(a+(b-a)*(k+.65)/cnt),.17)],1,False,5,1))
  merged(label+' saddle stitching','suture',emb)
  return panelpt((t0+t1)*.5,(u0+u1)*.5)
 specs={
 'Taluun':[('Reinforced rigging shoulder','khaki',.12,.37,.15,.75,2,1),('Line pouch','leather',.55,.74,-.73,-.21,4,1)],
 'Orrek':[('Kidney tool pocket','rust',.51,.78,.10,.71,3,1),('Reinforced apron bib','leather',.22,.42,-.34,.34,1,0)],
 'Vessari':[('Transmitter mounting pad','blue',.22,.72,-.65,.65,1.5,0)],
 'Mothren':[('Service pocket','brown',.55,.87,-.62,-.05,3,1),('Spare wick pocket','brown',.62,.86,.1,.6,2,0)],
 'Ureth':[('Draped back hood','wine',.045,.42,-.75,.68,5,1),('Mantle facing','copper',.42,.46,-.68,.62,.4,0)],
 'Keld':[('Utility pocket','moss',.64,.94,-.69,-.09,2.8,1),('Repair patch','khaki',.33,.52,.24,.67,1,0)],
 'Sovai':[('Apron neck facing','canvas',.16,.27,-.63,.62,1,0)],
 'Brunn':[('Tow plate mounting pad','leather',.34,.67,-.44,.44,3,1)],
 'Pelrin':[('Storm cape','ink',.03,.34,-.85,.82,2.8,1),('Rear map pocket','ink',.62,.79,-.55,.57,2,0)],
 'Zhavet':[('Sash keeper','copper',.35,.51,-.03,.60,1.3,0)],
 'Koruun':[('Double-layer kitchen yoke','rust',.10,.33,-.75,.75,1.8,1)],
 'Eskel':[('Overlap of thermal wrap','ivory',.10,.38,-.80,.64,3,1)],
 'Rhovi':[('Pleated flight-jacket back','mustard',.16,.68,-.72,.71,2.8,1),('Ribbed rear waistband','brown',.82,.95,-.65,.64,1.8,0)],
 'Nemeya':[('Split waistcoat back','teal',.18,.62,-.63,.63,1.3,1)],
 'Dathri':[('Reinforced bib back','denim',.22,.60,-.52,.52,2,0),('Repair patch','denim',.68,.89,.12,.60,2.2,1)],
 'Ulnor':[('Portmaster storm shield','wine',.09,.32,-.86,.84,2.5,1),('Rear half belt','leather',.38,.43,-.62,.63,1.6,0)]}
 for record in specs[name]:fitted_patch(*record)
 if name=='Brunn':
  xx,zz=panelpt(.51,0);dd=hit(xx,zz,True,trunk_tree)
  if dd is not None:
   pts=[(xx+9*cos(a),zz+8*sin(a),dd-4.6,1.7) for a in np.linspace(0,2*pi,25)]
   tube('Rear forged tow ring','brass',pts,.95,False)
 if name=='Taluun':
  # Rope hank secured to the back keeper, with five distinct ropes and a binding.
  xx,zz=panelpt(.42,.34);dd=hit(xx,zz,True,trunk_tree)
  if dd is not None:
   for k in range(4):
    tube('Rear service line hank','rope',[(xx+(7+k*.5)*cos(a),zz+(17+k*.2)*sin(a),dd-1-k*.55,.83) for a in np.linspace(0,2*pi,26)],.95,False)
 if name=='Zhavet':
  for j in range(5):
   zz=79+j*9
   against('Thoracic segment ridge','chitin',[(145,zz-1,1.4),(152,zz+1,2),(163,zz+2,2.5),(173,zz,1.6)],back=True,tree=trunk_tree)

 # Re-seat groom roots, textural nodules and rear strap loops on the final sculpt.
 # Directions are evaluated against each parent's horizontal cross-section; this also works at the silhouette.
 for ob in list(target.objects):
  k=basekey(ob)
  if ' / ' not in k or not (k.endswith('groomed fibres') or k.endswith('raised integument')):continue
  nm=k.split(' / ')[0];parent=next((q for q in core if q[0]==nm),None)
  if not parent:continue
  _,mat,cy,rd,pf,_=parent;one_tree=tree(lambda key:key==nm);pp=np.array(pf)
  if not one_tree:continue
  size=17 if k.endswith('groomed fibres') else 23
  # The primitive builders produce four five-point tube rings? Three path stations, plus the two caps.
  if len(ob.data.vertices)%size:continue
  for start in range(0,len(ob.data.vertices),size):
   group=list(ob.data.vertices[start:start+size])
   if k.endswith('groomed fibres'):
    x,z,dd=pxvert(group[-2])
   else:
    v=np.array([pxvert(q) for q in group]);x,z,dd=(v.max(0)+v.min(0))/2
   l,r=easeval(pp,max(pp[0,0],min(pp[-1,0],z)));mid=(l+r)*.5
   direction=Vector(((x-mid)*scale,-(dd-cy)*scale,0))
   if direction.length<.00001:continue
   direction.normalize();center=Vector(coords(mid,z,cy));loc,no,ix,dist=one_tree.ray_cast(center+direction*1.1,-direction,2.2)
   if loc is None:continue
   old=Vector(coords(x,z,dd));delta=loc-old-direction*(.14*scale)
   for q in group:q.co+=delta
  ob.data.update()
 # Cover the rear faces of head plates with fitted shapes; the woven braces and garment seams stay proud of cloth folds.
 rearkeys={'Back panel welt','Back panel topstitch','Shoulder yoke seam','Shoulder yoke topstitch','Cross Braces','Survey Sash','Courier Sling','Rope Keeper','Mantle Folds','Hood','Cook’S Yoke','Storm Flap','Waistcoat Tabs','Jacket Pleats'}
 for ob in list(target.objects):
  k=basekey(ob)
  if k not in rearkeys:continue
  vls=[pxvert(v) for v in ob.data.vertices];xs=[q[0] for q in vls];zs=[q[1] for q in vls];ds=[q[2] for q in vls]
  if np.mean(ds)>0:continue
  for v,(x,z,dd) in zip(ob.data.vertices,vls):
   surf=hit(x,z,True,trunk_tree)
   if surf is None:continue
   o=1 if k in ('Cross Braces','Survey Sash','Courier Sling','Rope Keeper') else .48
   zref=surface(trunk[4],x,z,trunk[3],trunk[2],True)
   residual=max(-o,min(o*.80,dd-zref+o))
   v.co.y=-(surf-o+residual)*scale
  ob.data.update()
 if name=='Zhavet':
  obj=next(o for o in target.objects if basekey(o)=='Survey dial')
  sash=tree(lambda k:k=='Brocade survey sash');x,z=116,149;dd=hit(x,z,False,sash)
  if dd is not None:
   for v in obj.data.vertices:v.co.y+=(20-dd-1.1)*scale
   obj.data.update()

def setup_world(sc):
 sc.render.engine='CYCLES';sc.cycles.samples=10;sc.cycles.use_denoising=True
 sc.render.resolution_x=470;sc.render.resolution_y=510;sc.render.resolution_percentage=100
 sc.render.image_settings.file_format='PNG';sc.render.film_transparent=True
 w=bpy.data.worlds.get('Neutral studio fill') or bpy.data.worlds.new('Neutral studio fill');w.use_nodes=True
 bg=w.node_tree.nodes.get('Background');bg.inputs[0].default_value=(.78,.79,.83,1);bg.inputs[1].default_value=.46;sc.world=w
 sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast';sc.view_settings.exposure=-.10
 sc.unit_settings.system='METRIC';sc.render.image_settings.color_mode='RGBA'
def aim(ob,where):ob.rotation_euler=(Vector(where)-ob.location).to_track_quat('-Z','Y').to_euler()
def studio(sc,c):
 st=bpy.data.collections.new(name+' • studio');sc.collection.children.link(st)
 h=c['height'];ct=(0,0,h*.50)
 for lab,pos,power,size,col in [('Softbox',(-2.7,-3.6,4.7),460,4.2,(1,.91,.8)),('Bounce',(3,-2,2.8),225,3.5,(.83,.91,1)),('Rim',(1.2,2.5,3.9),390,2.8,(1,.86,.70))]:
  dat=bpy.data.lights.new(name+' '+lab,'AREA');dat.shape='DISK';dat.energy=power;dat.size=size;dat.color=col;ob=bpy.data.objects.new(name+' '+lab,dat);st.objects.link(ob);ob.location=pos;aim(ob,ct);ob.hide_set(True) if ob.name in bpy.context.view_layer.objects else None
 cams=[]
 for tag,loc,rise in [('Reference',(0,-6),0),('Rear three-quarter',(3.9,4.8),.30),('Profile',(-6,.1),.06)]:
  dat=bpy.data.cameras.new(name+' / '+tag);dat.type='ORTHO';dat.ortho_scale=h*1.145
  ob=bpy.data.objects.new(name+' / '+tag,dat);st.objects.link(ob);ob.location=(*loc,h*.50+rise);aim(ob,ct);cams.append(ob)
 sc.camera=cams[0]
def scene_view(sc):
 for screen in bpy.data.screens:
  for area in screen.areas:
   if area.type=='VIEW_3D':
    sp=area.spaces.active;sp.region_3d.view_distance=3.3;sp.region_3d.view_location=(0,0,.88);sp.region_3d.view_rotation=(Vector((0,0,.88))-Vector((.3,-6,1.25))).to_track_quat('-Z','Y');sp.overlay.show_floor=False;sp.overlay.show_axis_x=False;sp.overlay.show_axis_y=False;sp.overlay.show_extras=False;sp.shading.color_type='TEXTURE';sp.shading.light='STUDIO';sp.shading.type='MATERIAL'
catalog=[];log={}
select=os.environ.get('ONLY_SPECIES','').split(',')
for number,(name,c) in enumerate(CAST.items(),1):
 if select!=[''] and name not in select:continue
 target=bpy.data.collections.new(name+' | character');target.asset_mark();target.asset_data.description=f'{name} — full-volume humanoid sculpt with registered proof-sheet pigmentation, finished back and studio views.';target.asset_data.tags.new('Long Haul');target.asset_data.tags.new('Species')
 sc=bpy.data.scenes.new(name) if catalog else bpy.context.scene;sc.name=name;sc.collection.children.link(target);setup_world(sc)
 bpy.context.window.scene=sc
 tex=bpy.data.images.load(str(D/'tex'/(name+'.png')));tex.name=name+' / proof pigmentation';tex.pack()
 tw,th=tex.size;tmp=np.empty(tw*th*4,np.float32);tex.pixels.foreach_get(tmp);gray=tmp.reshape(th,tw,4)[::-1,:,:3].mean(2);lum=np.clip((gray-np.roll(gray,2,axis=1))*3,-1,1)
 pf=[p[4] for p in c['parts'] if p[0]=='Cranium'][0]
 vals=[(v[1],v[2]) for p in c['parts'] for v in p[4]]+[(p[0]-p[3],p[0]+p[3]) for k in ['lines','blades'] for entry in c.get(k,[]) for p in entry[2]]
 cx=(min(v[0] for v in vals)+max(v[1] for v in vals))/2;scale=c['height']/c['floor']
 for item in c['parts']:section(*item)
 for item in c['beads']:ball(*item)
 for n,m,v,pr in c['lines']:tube(n,m,v,1,pr)
 for n,m,v,frac,pr in c.get('blades',[]):tube(n,m,v,frac,pr)
 finish_details()
 extra_detail()
 studio(sc,c);scene_view(sc)
 target['Height in metres']=c['height'];target['Species']=name
 catalog.append((name,sc,target))
 log[name]={'mesh_objects':len(target.objects),'faces':sum(len(q.data.polygons) for q in target.objects),'height_m':c['height']}
 print('MODELED',name,log[name],flush=True)
# Put a self-contained index and the original comparison sheet in the native file.
book=bpy.data.texts.new('START HERE • species studio')
book.write('LONG HAUL  /  HUMANOID SPECIES\n\nPick a species in the Scene selector at the top right. Each scene contains one editable character collection and three studio cameras. The character collections are also marked as assets. Use the Reference camera to match the concept board, or orbit in Material Preview to inspect the reverse. All colour plates are packed. The front-facing surface carries registered concept pigmentation; the reverse and side surfaces use authored volumes and procedural materials. Heights are artistic estimates in metres. All models are static.\n\n'+'\n'.join(x[0] for x in catalog))
ref=bpy.data.images.load(str((D.parent/'reference'/'Original-concept.png')));ref.name='Art direction / original sixteen-species proof';ref.pack();ref.use_fake_user=True
bpy.context.window.scene=catalog[0][1];scene_view(catalog[0][1])
for sc in bpy.data.screens:
 for ar in sc.areas:
  if ar.type=='VIEW_3D':
   ar.spaces.active.region_3d.view_perspective='CAMERA'
outfile=Path(os.environ.get('OUTFILE',str(D/'Rebuilt-Humanoid-Species.blend')))
bpy.ops.wm.save_as_mainfile(filepath=str(outfile),compress=True)
(D/('counts-'+outfile.stem+'.json')).write_text(json.dumps(log,indent=2))
