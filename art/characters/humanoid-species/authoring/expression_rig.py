"""Fit three non-destructive, blendable facial expressions to the Long Haul humanoid rigs."""
import argparse
from collections import defaultdict
import math
from pathlib import Path
import re
import sys

import bpy
import numpy as np
from mathutils import Euler, Matrix, Vector

MOODS=('Happy','Bored','Sad')
CONTROL='Expression'
SUPPORT='Head expression offset'
MOUTHS={
    'Taluun':'Sculpted labial ridge','Orrek':'Sculpted labial ridge','Mothren':'Feeding rostrum',
    'Vessari':'Hooked upper beak','Ureth':'Ring mouth','Keld':'Paired labial pad',
    'Sovai':'Sculpted labial ridge','Brunn':'Sculpted labial ridge','Pelrin':'Sculpted labial ridge',
    'Zhavet':'Mandible','Koruun':'Sculpted labial ridge','Eskel':'Sculpted labial ridge',
    'Rhovi':'Sculpted labial ridge','Dathri':'Mouth plate','Ulnor':'Sculpted labial ridge'}
# Per-species performance: head lift, bored lean, sad bow (degrees), mouth corner travel in head heights.
PERFORMANCE={
    'Taluun':(5,7,11,.24),'Orrek':(5,9,13,.19),'Vessari':(9,11,15,.06),
    'Mothren':(7,8,12,.06),'Ureth':(7,8,12,.12),'Keld':(6,10,13,.19),
    'Sovai':(5,10,12,.26),'Brunn':(6,8,14,.20),'Pelrin':(6,8,12,.23),
    'Zhavet':(6,8,13,.05),'Koruun':(5,8,14,.25),'Eskel':(7,11,15,.24),
    'Rhovi':(5,10,13,.20),'Nemeya':(4,9,9,0),'Dathri':(5,8,13,.06),'Ulnor':(6,9,14,.23)}
# Elevation of the appendage relative to its attachment, in degrees, for Happy, Bored, Sad.
# Left-facing crests rotate about their own root; paired elements follow the direction of each sculpt.
FEATURES={
    'EyeStalk':(23,-11,-29),'Ear':(30,-7,-38),'Antenna':(22,-11,-34),
    'Crest':(24,-8,-25),'GillFan':(27,-8,-25),'Sail':(21,-8,-21),
    'Palp':(23,-10,-20),'Mandible':(29,-9,-24),'MouthPlate':(22,-7,-17)}
NOTES={
    'Taluun':'eyestalks and wide mouth','Orrek':'single eye, scutes and jawline',
    'Vessari':'flight crest, beak and eyelids','Mothren':'comb antennae and paired palps',
    'Ureth':'occipital sail, single eye and ring mouth','Keld':'six sensory pits and paired lip pads',
    'Sovai':'gill fans and cheek line','Brunn':'heavy muzzle, cheeks and eyelids',
    'Pelrin':'independent ears and forked muzzle','Zhavet':'antennae and paired mandibles',
    'Koruun':'broad lower lip and orbital folds','Eskel':'basalt cheek and diagonal mouth ridge',
    'Rhovi':'flight quills and tapered muzzle','Nemeya':'bell dome and flexible margin',
    'Dathri':'mouth plates beneath the carapace','Ulnor':'long muzzle and eyelids'}

def key(o):
    return re.sub(r'\.\d+$','',o.name)

def points(obj):
    a=np.empty(len(obj.data.vertices)*3,np.float32)
    obj.data.vertices.foreach_get('co',a)
    return a.reshape(-1,3)

def midpoint(a):
    return (a.min(axis=0)+a.max(axis=0))*.5

def smooth(x,a,b):
    t=np.clip((x-a)/(b-a),0,1)
    return t*t*(3-2*t)

def drive(curve,rig,terms,base=0.):
    driver=curve.driver
    driver.type='SCRIPTED'
    expression=[]
    for prop,amount in zip(MOODS,terms):
        variable=driver.variables.new();variable.name=prop.lower()
        variable.type='SINGLE_PROP'
        variable.targets[0].id=rig
        variable.targets[0].data_path=f'pose.bones["{CONTROL}"]["{prop}"]'
        if abs(amount)>1.e-9:expression.append(f'({amount:.9g}*{variable.name})')
    weighted='+'.join(expression) or '0'
    driver.expression=f'{base:.9g}+({weighted})/max(1.0,happy+bored+sad)'

def add_control(model):
    rig=model.rig
    bpy.context.view_layer.objects.active=rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bones=rig.data.edit_bones
    head=bones['Head'];parent=head.parent
    rest=head.matrix.copy()
    support=bones.new(SUPPORT);support.head=head.head.copy();support.tail=head.tail.copy()
    support.roll=head.roll;support.use_deform=False;support.parent=parent
    head.use_connect=False;head.parent=support;head.matrix=rest
    ctrl=bones.new(CONTROL)
    ctrl.head=(model.hi[0]+model.height*.22,model.center[1],model.center[2])
    ctrl.tail=ctrl.head+Vector((0,0,model.height*.30));ctrl.use_deform=False;ctrl.parent=head
    bpy.ops.object.mode_set(mode='OBJECT')
    for bone_name,coll_name in [(SUPPORT,'Expression support'),(CONTROL,'Expressions')]:
        coll=rig.data.collections.get(coll_name) or rig.data.collections.new(coll_name)
        bone=rig.data.bones[bone_name]
        for old in list(bone.collections):old.unassign(bone)
        coll.assign(bone);bone.color.palette='THEME09'
    rig.data.collections['Expression support'].is_visible=False
    control=rig.pose.bones[CONTROL]
    control.lock_location=control.lock_rotation=control.lock_scale=(True,True,True)
    for mood in MOODS:
        control[mood]=0.0
        control.id_properties_ui(mood).update(min=0.,max=1.,soft_min=0.,soft_max=1.,
            description=mood+' expression intensity. Set all three to 0 for neutral.')
    helper=rig.pose.bones[SUPPORT];helper.rotation_mode='XYZ'
    lift,lean,bow,_=PERFORMANCE[model.name]
    # Convert the performance from sculpt space into the support bone's rest axes.
    rotations=[(-lift,-2,-3),(3,lean,13),(bow,-4,-4)]
    rest=helper.bone.matrix_local.to_quaternion()
    local=[(rest.inverted()@Euler(tuple(math.radians(v) for v in values)).to_quaternion()@rest).to_euler('XYZ') for values in rotations]
    for axis in range(3):
        drive(helper.driver_add('rotation_euler',axis),rig,[v[axis] for v in local])

def eye_parameters(name,side):
    # Aperture measured as a fraction of the globe radius from its centre. Upper and lower contours
    # each have a central height and horizontal tilt. Closed eyelids converge inside [-1,1].
    strong=.70 if name=='Zhavet' else 1.
    asym=.15 if side<0 else -.12
    return [
        (.89,-.025,-.42,.03),
        (-.10+asym,.17,-.85,.04),
        (.42,-.35*side,-.62,-.08*side),
    ] if strong==1. else [(.80,0,-.50,0),(.30+asym,.08,-.88,0),(.63,-.16*side,-.81,0)]

def eye_shader(obj,rig,eye,params,skin,globe):
    # A lid boundary on the globe can fully cover the pupil without introducing a floating shell.
    # Fixed attribute coordinates follow the globe in its armature and its manual eye controls.
    a=points(obj);c,r=eye
    horizontal=(a[:,0]-c[0])/r[0]
    arc=np.sqrt(np.maximum(.045,1-np.clip(horizontal,-1,1)**2))
    vertical=np.clip((a[:,2]-c[2])/(r[2]*arc),-1.,1.)
    attr=obj.data.attributes.new('Eye aperture','FLOAT_VECTOR','POINT')
    attr.data.foreach_set('vector',np.column_stack((np.clip(horizontal,-1,1),vertical,np.zeros(len(a)))).astype(np.float32).ravel())
    old=obj.data.materials[0]
    mat=old.copy();mat.name=f'{rig.name.split(" |")[0]} / expression / {obj.name}'
    obj.data.materials[0]=mat;tree=mat.node_tree;nodes=tree.nodes;links=tree.links
    def node(kind,label):
        n=nodes.new(kind);n.label=label;return n
    def connect(value,socket):
        if isinstance(value,(int,float)):socket.default_value=value
        else:links.new(value,socket)
    def mathnode(op,a,b):
        n=node('ShaderNodeMath',op.lower());n.operation=op
        connect(a,n.inputs[0]);connect(b,n.inputs[1]);return n.outputs[0]
    xy=node('ShaderNodeAttribute','Resting eye disk');xy.attribute_name=attr.name
    separate=node('ShaderNodeSeparateXYZ','Horizontal and vertical position');links.new(xy.outputs['Vector'],separate.inputs[0])
    x,y=separate.outputs[0],separate.outputs[1]
    vals=[]
    for j,base in enumerate((1.10,0.,-1.10,0.)):
        v=node('ShaderNodeValue',('Upper lid','Upper tilt','Lower lid','Lower tilt')[j])
        v.outputs[0].default_value=base
        drive(v.outputs[0].driver_add('default_value'),rig,[p[j]-base for p in params],base)
        vals.append(v.outputs[0])
    top=mathnode('ADD',vals[0],mathnode('MULTIPLY',x,vals[1]))
    bottom=mathnode('ADD',vals[2],mathnode('MULTIPLY',x,vals[3]))
    mask=mathnode('MAXIMUM',mathnode('SUBTRACT',y,top),mathnode('SUBTRACT',bottom,y))
    edge=node('ShaderNodeMapRange','Soft eyelid edge');edge.clamp=True
    links.new(mask,edge.inputs[0]);edge.inputs[1].default_value=-.025;edge.inputs[2].default_value=.025
    lid=node('ShaderNodeBsdfPrincipled','Eyelid pigment');lid.inputs['Roughness'].default_value=.69
    color=skin.diffuse_color[:3]
    # The carrier's material supplies each creature's actual skin pigment.
    lid.inputs['Base Color'].default_value=tuple(float(min(1,max(.013,v*1.17))) for v in color)+(1.,)
    noise=node('ShaderNodeTexNoise','Eyelid grain');noise.inputs['Scale'].default_value=112.
    bump=node('ShaderNodeBump','Fine lid surface');bump.inputs['Strength'].default_value=.12;bump.inputs['Distance'].default_value=.0004
    links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs[0],lid.inputs['Normal'])
    # Sample a strip of the original pigmentation just over the eye, avoiding a duplicate iris.
    # Narrow per-eye UV islands map the opening to adjoining brow tissue as the lid passes over it.
    donor=next((n for n in skin.node_tree.nodes if n.type=='TEX_IMAGE' and n.image),None)
    if donor is not None:
        mesh=globe.data;uv_data=mesh.uv_layers['Concept registration'].data
        uv=np.empty(len(uv_data)*2,np.float32);uv_data.foreach_get('uv',uv);uv=uv.reshape(-1,2)
        uvc=midpoint(uv);radius=np.ptp(uv,axis=0)*.5
        u=uvc[0]+radius[0]*.67*np.clip(horizontal,-1,1)
        v=uvc[1]+radius[1]*(1.18+.42*(vertical+1)*.5)
        # Protruding stalks have open space above the globe; sample the adjacent stalk instead.
        if rig.name.startswith('Taluun'):
            towards=1 if eye[0][0]<0 else -1
            u=uvc[0]+radius[0]*(towards*1.45+np.clip(horizontal,-1,1)*.30)
            v=uvc[1]+radius[1]*(-.36+vertical*.23)
        layer=obj.data.uv_layers.new(name='Lid tissue')
        indices=np.empty(len(obj.data.loops),np.int32);obj.data.loops.foreach_get('vertex_index',indices)
        layer.data.foreach_set('uv',np.column_stack((u,v))[indices].astype(np.float32).ravel())
        # Keep the original active UV map for all existing materials and exports.
        obj.data.uv_layers.active=obj.data.uv_layers['Concept registration']
        obj.data.uv_layers['Concept registration'].active_render=True
        source=node('ShaderNodeUVMap','Lid sample');source.uv_map=layer.name
        tex=node('ShaderNodeTexImage','Adjoining skin pigmentation');tex.image=donor.image
        links.new(source.outputs[0],tex.inputs['Vector'])
        pigment=node('ShaderNodeMixRGB','Local skin tone');pigment.inputs[0].default_value=.78
        pigment.inputs[1].default_value=tuple(color)+(1.,);links.new(tex.outputs['Color'],pigment.inputs[2])
        links.new(pigment.outputs[0],lid.inputs['Base Color'])
    output=next(n for n in nodes if n.type=='OUTPUT_MATERIAL' and n.is_active_output)
    original=output.inputs['Surface'].links[0].from_socket
    mix=node('ShaderNodeMixShader','Eye / closed lid')
    links.new(edge.outputs[0],mix.inputs[0]);links.new(original,mix.inputs[1]);links.new(lid.outputs[0],mix.inputs[2])
    links.new(mix.outputs[0],output.inputs['Surface'])

class Face:
    def __init__(self,scene):
        self.name=scene.name
        bpy.context.window.scene=scene
        self.collection=bpy.data.collections[self.name+' | character']
        self.rig=self.collection.objects[self.name+' | Rig']
        self.meshes=[o for o in self.collection.objects if o.type=='MESH']
        self.parts=defaultdict(list)
        for obj in self.meshes:self.parts[key(obj)].append(obj)
        skull=points(self.parts['Cranium'][0])
        self.lo=skull.min(0);self.hi=skull.max(0);self.center=midpoint(skull)
        self.height=self.hi[2]-self.lo[2];self.width=self.hi[0]-self.lo[0]
        self.depth=self.hi[1]-self.lo[1]
        self.mouth=None
        if self.name in MOUTHS:
            mouth=np.concatenate([points(o) for o in self.parts[MOUTHS[self.name]]])
            self.mouth=midpoint(mouth)
            self.mouth_width=max(np.ptp(mouth[:,0])*.5,self.width*.095)
            self.mouth_stations=np.linspace(mouth[:,0].min(),mouth[:,0].max(),19)
            self.mouth_line=np.array([np.median(mouth[np.abs(mouth[:,0]-x)<=max(self.mouth_width*.16,.002),2])
                if np.any(np.abs(mouth[:,0]-x)<=max(self.mouth_width*.16,.002)) else self.mouth[2] for x in self.mouth_stations])
        self.eyes=[]
        for obj in sorted([o for o in self.meshes if key(o).startswith('Eye globe')],key=lambda o:midpoint(points(o))[0]):
            a=points(obj);self.eyes.append((obj,midpoint(a),np.ptp(a,axis=0)*.5))

    def facial_mesh(self,obj):
        for g in obj.vertex_groups:
            b=self.rig.data.bones[g.name]
            if b.name=='Head' or any(p.name=='Head' for p in b.parent_recursive):return True
        return False

    def mouth_field(self,p,mood):
        out=np.zeros_like(p)
        if self.mouth is None:return out
        x=(p[:,0]-self.mouth[0])/self.mouth_width
        line=np.interp(p[:,0],self.mouth_stations,self.mouth_line)
        dz=(p[:,2]-line)/self.height
        dy=(p[:,1]-self.mouth[1])/self.depth
        front=np.exp(-((np.maximum(0,dy)/.49)**2))
        band=np.exp(-(dz/np.where(dz>0,.22,.36))**2)*front
        edge=np.exp(-((np.abs(x)-.85)/.56)**2)
        middle=np.exp(-(x/.61)**2)
        side=np.clip(x,-1,1)
        h=self.height
        amplitude=min(h*PERFORMANCE[self.name][3],self.mouth_width*.50)
        arc=(.73-np.exp(-(x/.79)**2))*np.exp(-(x/1.50)**4)
        if mood=='Happy':
            out[:,2]=amplitude*arc*band
            out[:,0]=self.mouth_width*.115*side*band*np.exp(-(.60*x)**4)
            out[:,1]=-h*.022*edge*band
        elif mood=='Sad':
            out[:,2]=amplitude*(-.99*arc+.10*middle)*band
            out[:,0]=-self.mouth_width*.060*side*band*np.exp(-(.60*x)**4)
            out[:,1]=-h*.029*middle*band
        else:
            out[:,2]=amplitude*(.40*side*edge-.13*middle)*band
            out[:,0]=self.mouth_width*.042*band*np.exp(-(.7*x)**4)
        return out

    def soft_field(self,p,mood):
        out=self.mouth_field(p,mood)
        if self.name=='Nemeya':
            u=(p[:,0]-self.center[0])/(self.width*.5)
            zz=(p[:,2]-self.lo[2])/self.height
            rim=1-smooth(zz,.10,.83)
            if mood=='Happy':
                out[:,0]+=(p[:,0]-self.center[0])*(.22*rim-.06*(1-rim))
                out[:,1]+=(p[:,1]-self.center[1])*.17*rim
                out[:,2]+=self.height*(.18*(1-rim)+.34*rim*np.abs(u)**1.35)
            elif mood=='Sad':
                out[:,0]-=(p[:,0]-self.center[0])*.28*rim
                out[:,1]-=(p[:,1]-self.center[1])*.23*rim
                out[:,2]-=self.height*(.12*(1-rim)+.39*rim*np.abs(u)**1.25)
            else:
                out[:,2]+=self.height*((.21*u-.15)*rim-.09*(1-rim))
                out[:,0]-=(p[:,0]-self.center[0])*.05*rim
            return out
        # Shape the orbital tissue with the same smooth field as the cranium and surface detail.
        for _,c,r in self.eyes:
            ux=(p[:,0]-c[0])/max(r[0],self.width*.08)
            uz=(p[:,2]-c[2])/max(r[2],self.height*.075)
            front=np.exp(-((p[:,1]-c[1])/(self.depth*.38))**2)
            brow=np.exp(-((uz-1.28)/1.12)**2-(ux/1.4)**4)*front
            sign=1 if c[0]>=np.mean([v[1][0] for v in self.eyes]) else -1
            if len(self.eyes)==1:sign=1
            amount={'Happy':.27,'Bored':-.30+.17*sign,'Sad':.08-.78*np.clip(ux*sign,-1,1)}[mood]
            out[:,2]+=r[2]*amount*brow
        return out

    def appendage(self,obj,p,mood):
        group=max(obj.vertex_groups,key=lambda g:sum(1 for b in self.rig.data.bones[g.name].parent_recursive if b.name=='Head'),default=None)
        if not group:return np.zeros_like(p)
        ancestry=[self.rig.data.bones[group.name],*self.rig.data.bones[group.name].parent_recursive]
        bone=next((b for b in ancestry if b.name.split('.')[0] in FEATURES),None)
        if not bone:return np.zeros_like(p)
        kind=bone.name.split('.')[0];idx=MOODS.index(mood)
        base=np.array(bone.head_local);tip=np.array(bone.tail_local)
        # Thin plates and palp tips point mostly down. Pivot them outward/inward like a paired fan.
        side=-1 if bone.name.endswith('.R') else 1 if bone.name.endswith('.L') else np.sign((tip-base)[0]) or -1
        angle=FEATURES[kind][idx]
        if mood=='Bored' and bone.name.endswith('.R'):angle-=10
        if kind in ('Mandible','MouthPlate','Palp'):rot_y=-side*angle
        else:rot_y=-np.sign((tip-base)[0] or side)*angle
        # Bending a flexible feature around its base preserves its attachment and surface vessels.
        vec=tip-base
        t=np.einsum('ij,j->i',p-base,vec)/max(np.dot(vec,vec),1.e-9)
        blend=smooth(t,-.10,.55)
        if kind=='EyeStalk' and not key(obj).endswith('orbital process'):blend=np.ones(len(p))
        rot=np.asarray(Euler((0,math.radians(rot_y),0)).to_matrix())
        delta=np.einsum('ij,kj->ik',p-base,rot)-(p-base)
        return delta*blend[:,None]

    def keys(self,obj):
        p=points(obj);k=key(obj)
        ocular=k.startswith('Eye globe') or k in ('Orbital pupil','Upper eyelid','Lower eyelid')
        match=min(self.eyes,key=lambda e:np.linalg.norm(e[1]-midpoint(p))) if ocular else None
        if ocular:
            _,c,r=match
            side=-1 if len(self.eyes)>1 and match is self.eyes[0] else 1
            params=eye_parameters(self.name,side)
            if k.startswith('Eye globe') or k=='Orbital pupil':
                eye_shader(obj,self.rig,(c,r),params,self.parts['Cranium'][0].data.materials[0],match[0])
        for i,mood in enumerate(MOODS):
            d=self.soft_field(p,mood)
            if any(t in k.lower() for t in ('tusk','head plate','scute','nasal','crown','cartilage','feeding rostrum','upper beak')):
                # Horn and keratin retain their silhouette as the soft tissue around them moves.
                d[:]=self.soft_field(midpoint(p)[None,:],mood)[0]*.40
            if ocular:
                # The eye as a unit follows the slight surrounding cheek displacement.
                d[:]=self.soft_field(c[None,:],mood)[0]
                if k in ('Upper eyelid','Lower eyelid'):
                    upper=k=='Upper eyelid';u=np.clip((p[:,0]-c[0])/r[0],-1,1)
                    arc=np.sqrt(np.maximum(.015,1-u*u))
                    t=params[i][0 if upper else 2]+u*params[i][1 if upper else 3]
                    dz=r[2]*arc*(t-(.91 if upper else -.91))
                    # Slide the ridge forward over the convex globe, leaving its corners seated.
                    d[:,2]+=dz
                    d[:,1]-=r[1]*arc*(np.sqrt(np.maximum(.01,1-t*t))-.40)
            d+=self.appendage(obj,p,mood)
            if self.name=='Keld' and k.startswith('Sensory pit'):
                c=midpoint(p)
                d[:,2]+=(p[:,2]-c[2])*{'Happy':-.15,'Bored':-.52,'Sad':-.27}[mood]
            if float(np.max(np.linalg.norm(d,axis=1)))<.00012:continue
            if not obj.data.shape_keys:obj.shape_key_add(name='Basis',from_mix=False)
            block=obj.shape_key_add(name=mood,from_mix=False)
            block.data.foreach_set('co',np.asarray(p+d,dtype=np.float32).ravel())
            weights=[float(m==mood) for m in MOODS]
            drive(block.driver_add('value'),self.rig,weights)

    def install(self):
        if CONTROL in self.rig.pose.bones:raise ValueError(f'{self.name} already has an expression rig')
        add_control(self)
        for obj in self.meshes:
            if self.facial_mesh(obj):self.keys(obj)
        ctrl=self.rig.pose.bones[CONTROL]
        for mood in MOODS:
            action=bpy.data.actions.new(self.name+' | '+mood)
            action.use_fake_user=True;self.rig.animation_data_create().action=action
            for prop in MOODS:
                ctrl[prop]=float(prop==mood);ctrl.keyframe_insert(data_path=f'["{prop}"]',frame=1,group=CONTROL)
            action.asset_mark();action.asset_data.description=f'{mood} expression for {self.name}, using {NOTES[self.name]}.'
            for tag in (self.name,'Expression',mood):action.asset_data.tags.new(tag)
        self.rig.animation_data.action=None
        for prop in MOODS:ctrl[prop]=0.
        self.rig.update_tag();bpy.context.view_layer.update()

def main():
    par=argparse.ArgumentParser()
    par.add_argument('--output',type=Path,required=True);par.add_argument('--only',nargs='*')
    args=par.parse_args(sys.argv[sys.argv.index('--')+1:])
    first=bpy.context.window.scene.name
    for scene in bpy.data.scenes:
        if scene.name not in PERFORMANCE or args.only and scene.name not in args.only:continue
        model=Face(scene);model.install();print('EXPRESSIONS',scene.name,flush=True)
    bpy.context.window.scene=bpy.data.scenes[first]
    guide=bpy.data.texts.get('START HERE • species studio')
    if guide:
        guide.cursor_set(len(guide.lines)-1);guide.write('\nEXPRESSIONS\nSelect the Expression bone in Pose Mode. Its Bone Properties > Custom Properties contain Happy, Bored and Sad. Each ranges from 0 to 1. Zero all three for neutral. In the Asset Browser use Current File and apply the named expression with the Expression bone selected. It layers over the body pose.\n')
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(args.output.resolve()),compress=True)

if __name__=='__main__':main()
