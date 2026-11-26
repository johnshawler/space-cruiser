"""Fit Long Haul's sixteen character armatures to the final painted meshes in Blender 4.5."""
import argparse
from collections import defaultdict
from pathlib import Path
import re
import sys

import bpy
import numpy as np
from mathutils import Vector

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from forms import CAST
import detail  # populates the sculpted appendages used to register proof-sheet coordinates
from rig_poses import finish_rig

# Shoulder, elbow, wrist and knuckles, traced on the reference. R is the character's right.
# Final joint depth comes from cross-sections of the actual sculpt, including the staggered stance.
ARM = {
'Taluun': ((145,67,123,117,122,160,121,178),(206,72,219,119,231,158,235,176)),
'Orrek': ((97,66,66,125,69,158,70,177),(190,69,226,121,239,158,243,173)),
'Vessari': ((124,74,100,117,99,163,104,182),(171,76,178,124,189,165,191,180)),
'Mothren': ((119,91,98,133,95,160,95,176),(178,94,195,138,202,169,204,183)),
'Ureth': ((150,94,139,140,133,176,133,193),(197,94,213,151,224,183,224,199)),
'Keld': ((91,81,73,135,75,168,77,184),(203,89,226,133,236,164,236,181)),
'Sovai': ((132,72,107,122,96,166,97,182),(166,78,181,128,195,166,198,181)),
'Brunn': ((90,73,63,136,61,169,57,189),(200,73,227,141,242,177,239,197)),
'Pelrin': ((151,91,137,125,131,160,129,175),(204,89,217,128,228,166,231,179)),
'Zhavet': ((136,71,101,114,76,167,70,184),(180,71,192,117,215,160,218,181)),
'Koruun': ((95,82,62,132,103,128,119,137),(200,82,230,119,241,158,242,178)),
'Eskel': ((132,79,121,133,120,168,123,187),(178,82,187,138,194,168,197,185)),
'Rhovi': ((150,77,129,119,141,141,151,150),(208,81,224,117,224,137,220,145)),
'Nemeya': ((127,88,109,126,98,163,99,180),(180,89,189,132,204,164,207,179)),
'Dathri': ((118,82,95,104,84,119,81,147),(185,89,204,124,215,154,221,167)),
'Ulnor': ((124,76,105,120,117,138,124,145),(193,82,201,122,207,145,211,159))}
# Pelvis, knees and ankles in the traced elevation. X is measured independently on each leg.
LEG = {'Taluun':(145,206,245),'Orrek':(160,209,246),'Vessari':(142,200,255),'Mothren':(162,211,247),
'Ureth':(145,202,251),'Keld':(150,206,247),'Sovai':(145,214,252),'Brunn':(148,203,240),
'Pelrin':(141,195,235),'Zhavet':(128,177,237),'Koruun':(161,209,237),'Eskel':(126,180,236),
'Rhovi':(143,192,232),'Nemeya':(143,198,248),'Dathri':(144,199,246),'Ulnor':(140,199,249)}
SECTIONS = ('Body','Arms','Legs','Fingers','Face','Species','IK')
COLORS = dict(Body='THEME04',Arms='THEME03',Legs='THEME03',Fingers='THEME06',Face='THEME09',Species='THEME02',IK='THEME01')


def key(o):
    return re.sub(r'\.\d+$','',o.name)

def coords(o):
    values=np.empty(len(o.data.vertices)*3,np.float32)
    o.data.vertices.foreach_get('co',values)
    return values.reshape(-1,3)

def unit(v):
    return v/max(np.linalg.norm(v),1.e-9)

def ramp(v,a,b):
    t=np.clip((v-a)/(b-a),0,1)
    return t*t*(3-2*t)

def center(p):
    return (p.min(0)+p.max(0))*.5

def pdf_joint(pts, guess, span):
    delta=((pts[:,0]-guess[0])*.62)**2+(pts[:,2]-guess[2])**2
    near=pts[delta<=delta.min()+span**2]
    return np.array([guess[0],(near[:,1].min()+near[:,1].max())*.5,guess[2]])

def add_weights(weights,bone,amount):
    weights[bone]=weights.get(bone,0)+amount

def chain_weights(p, names, pivots, widths):
    """Adjacent layers share a smooth transition across the bisecting plane of each joint."""
    weights={}
    active=np.ones(len(p))
    for i,w in enumerate(widths):
        at=pivots[i+1]
        before=unit(at-pivots[i]); after=unit(pivots[i+2]-at)
        axis=unit(before+after)
        passed=active*ramp(np.einsum('ij,j->i',p-at,axis),-w,w)
        weights[names[i]]=active-passed
        active=passed
    weights[names[-1]]=active
    return weights


class FittedRig:
    def __init__(self,name):
        self.name=name
        self.scene=bpy.data.scenes[name];bpy.context.window.scene=self.scene
        self.col=bpy.data.collections[name+' | character']
        self.meshes=[o for o in self.col.objects if o.type=='MESH']
        self.points={o.name:coords(o) for o in self.meshes}
        self.parts=defaultdict(list)
        for o in self.meshes:self.parts[key(o)].append(o)
        c=CAST[name];self.h=c['height'];self.floor=c['floor'];self.scale=self.h/self.floor
        limits=[(v[1],v[2]) for p in c['parts'] for v in p[4]]
        limits += [(v[0]-v[3],v[0]+v[3]) for kind in ('lines','blades') for item in c.get(kind,[]) for v in item[2]]
        self.cx=(min(l for l,r in limits)+max(r for l,r in limits))/2
        arm=bpy.data.armatures.new(name+' skeleton')
        self.rig=bpy.data.objects.new(name+' | Rig',arm);self.col.objects.link(self.rig)
        self.rig.show_in_front=True;arm.display_type='OCTAHEDRAL'
        self.spec={};self.rule={};self.arms={};self.legs={};self.digits=defaultdict(list)
        self.detail_features=[]; self.ik=[];self.jaw=None

    def shape(self,*keys):
        return np.concatenate([self.points[o.name] for k in keys for o in self.parts[k]])

    def data(self,obj):return self.points[obj.name]

    def point(self,x,pixel,pts):
        guess=np.array([(x-self.cx)*self.scale,0,(self.floor-pixel)*self.scale])
        return pdf_joint(pts,guess,self.scale*3.)

    def bone(self,name,base,tip,parent,group,deform=True,connected=False):
        a,b=np.asarray(base,dtype=float),np.asarray(tip,dtype=float)
        if np.linalg.norm(b-a)<.001:b=a+np.array([0,-.006,0])
        self.spec[name]=(a,b,parent,group,deform,connected)
        return name

    def build_body(self):
        base=self.shape('Cranium'); neck=self.shape('Neck'); self.head_bounds=(base.min(0),base.max(0))
        self.head_mid=center(base)
        for i,(suffix,term,legname) in enumerate([('.R','Near arm','Left trouser leg'),('.L','Far arm','Right trouser leg')]):
            a=self.shape(term)
            if self.name=='Koruun':a=np.vstack([a,self.shape('Near hand' if i==0 else 'Far hand')])
            if self.name=='Dathri' and i==0:a=np.vstack([a,self.shape('Major chela body')])
            s,e,w,h=[self.point(x,z,a) for x,z in zip(ARM[self.name][i][::2],ARM[self.name][i][1::2])]
            # Preserve a stable elbow bend in the least flexed arms.
            e[1]+=self.h*.012
            self.arms[suffix]=[s,e,w,h]
            leg=self.shape(legname);bootname='Left boot' if i==0 else 'Right boot'
            foot=self.shape(bootname) if self.parts[bootname] else leg
            hip_px,knee_px,ankle_px=LEG[self.name]
            def at(px,p):
                z=(self.floor-px)*self.scale
                diff=np.abs(p[:,2]-z)
                sl=p[diff<=diff.min()+self.scale*1.9]
                middle=center(sl);middle[2]=z
                return middle
            hip=at(hip_px,leg);knee=at(knee_px,leg);ankle=at(ankle_px,foot)
            knee[1]-=.015*self.h;ankle[1]+=.007*self.h
            # Ball and toe orient along the actual shoe's long ground-plane axis.
            low=foot[foot[:,2]<=foot[:,2].min()+self.h*.032]
            ball=center(low);ball[1]-=self.h*.012;ball[2]=max(.014*self.h,ball[2])
            if np.linalg.norm((ball-ankle)[:2])<.03*self.h:ball[1]=ankle[1]-.045*self.h
            direction=unit(np.array([ball[0]-ankle[0],ball[1]-ankle[1],0]))
            tip=ball+direction*(self.h*.041);tip[2]=max(self.h*.006,ball[2]-.009*self.h)
            self.legs[suffix]=[hip,knee,ankle,ball,tip]
        pelvis=(self.legs['.L'][0]+self.legs['.R'][0])/2
        shoulders=(self.arms['.L'][0]+self.arms['.R'][0])/2
        chest=pelvis*.39+shoulders*.61; waist=pelvis*.71+shoulders*.29
        neckbase=shoulders.copy();neckbase[0]=center(neck)[0];neckbase[2]+=self.h*.008
        skull=center(base);skull[2]=base[:,2].min()+.19*np.ptp(base[:,2])
        if skull[2]<neckbase[2]+.016*self.h:skull[2]=neckbase[2]+.016*self.h
        crown=np.array([self.head_mid[0],self.head_mid[1],base[:,2].max()])
        self.torso=[pelvis,waist,chest,neckbase,skull,crown]
        self.bone('Root',(pelvis[0],0,0),(pelvis[0],-.14*self.h,0),None,'Body',False)
        for i,(n,parent) in enumerate([('Pelvis','Root'),('Spine','Pelvis'),('Chest','Spine'),('Neck','Chest'),('Head','Neck')]):
            self.bone(n,self.torso[i],self.torso[i+1],parent,'Body',True,i>0)
        for side in ('.R','.L'):
            s,e,w,h=self.arms[side];hip,knee,ank,ball,tip=self.legs[side]
            self.bone('Clavicle'+side,neckbase,s,'Chest','Arms')
            for j,(n,par) in enumerate([('UpperArm','Clavicle'),('Forearm','UpperArm'),('Hand','Forearm')]):
                self.bone(n+side,self.arms[side][j],self.arms[side][j+1],par+side,'Arms',True,True)
            for j,n in enumerate(('Thigh','Shin','Foot','Toe')):
                par='Pelvis' if j==0 else ('Thigh','Shin','Foot')[j-1]+side
                self.bone(n+side,self.legs[side][j],self.legs[side][j+1],par,'Legs',True,j>0)
            for label,chain,distal,eff in [('Arm',[s,e,w],'Hand','Forearm'),('Leg',[hip,knee,ank],'Foot','Shin')]:
                a,b,c=chain;axis=unit(c-a);bend=b-a-axis*np.dot(b-a,axis)
                if np.linalg.norm(bend)<self.h*.006:
                    bend=np.array([0,1 if label=='Arm' else -1,0.])
                    bend-=axis*np.dot(bend,axis)
                pole=b+unit(bend)*self.h*.29
                control=self.bone('IK.'+distal+side,*self.spec[distal+side][:2],'Root','IK',False)
                pcontrol=self.bone('Pole.'+('Elbow' if label=='Arm' else 'Knee')+side,pole,pole+[0,0,self.h*.043],'Root','IK',False)
                self.ik.append((label+side,eff+side,control,pcontrol,distal+side))
        self.build_fingers()
        for side,part in [('.R','Near palm'),('.L','Far palm')]:
            if self.digits[side] or not self.parts[part]:continue
            palm=self.shape(part)
            wrist=self.arms[side][2]
            direction=unit(center(palm)-wrist)
            axis=np.einsum('ij,j->i',palm-wrist,direction)
            start=wrist+direction*np.percentile(axis,48)
            end=wrist+direction*np.percentile(axis,98)
            curl=self.bone('PalmCurl'+side,start,end,'Hand'+side,'Fingers')
            for obj in self.parts[part]:self.rule[obj.name]=('palm',side,curl,start,end)
        self.build_features()

    def build_fingers(self):
        wanted=['Digit 1','Digit 2','Digit 3','Digit 4','Opposable thumb','Fine grasping digit','Tapered long finger']
        grouped=defaultdict(list)
        for k in wanted:
            for o in self.parts[k]:
                p=self.data(o);side=min(self.arms,key=lambda s:np.linalg.norm(p[-2]-self.arms[s][-1]))
                grouped[side].append((k,o))
        for side,ds in grouped.items():
            ds.sort(key=lambda t: self.data(t[1])[-2,0],reverse=side=='.L')
            for i,(k,o) in enumerate(ds):
                label={'Digit 1':'Index','Digit 2':'Middle','Digit 3':'Ring','Digit 4':'Little','Opposable thumb':'Thumb'}.get(k,'Digit'+str(i+1))
                p=self.data(o);base=p[-2];end=p[-1]
                # The parametric tubes store their end caps last; the centre ring retains curved finger anatomy.
                mid=p[int((len(p)-2)*.50):int((len(p)-2)*.50)+6].mean(0)
                if np.linalg.norm(mid-base)<.002:mid=(base+end)/2
                first=self.bone(label+'.01'+side,base,mid,'Hand'+side,'Fingers')
                last=self.bone(label+'.02'+side,mid,end,first,'Fingers',True,True)
                self.rule[o.name]=('digit',('Hand'+side,first,last),[base+(base-mid)*.4,base,mid,end])
                self.digits[side].append((base,mid,end,first,last))

    def build_features(self):
        name=self.name;base=self.shape('Cranium');lo,hi=self.head_bounds;h=hi[2]-lo[2]
        # Bind each feature to a dedicated pivot; its attached surface details follow the same controller.
        def feature(label,keys,groups=1,tube=False,parent='Head',keyprefix=None):
            objs=[o for k in keys for o in self.parts[k]]
            if keyprefix:objs += [o for o in self.meshes if key(o).startswith(keyprefix)]
            if not objs:return []
            sets=[objs]
            if groups==2:
                sets=[[],[]]
                centers=np.array([center(self.data(o))[0] for o in objs]);split=(max(centers)+min(centers))*.5
                for o,x in zip(objs,centers):sets[int(x>split)].append(o)
            names=[]
            for i,ss in enumerate(sets):
                if not ss:continue
                sidesuffix=('.R','.L')[i] if groups==2 else ''
                poly=np.concatenate([self.data(o) for o in ss]);cent=center(poly)
                if tube:
                    apex=np.mean([self.data(o)[-2] for o in ss],axis=0);end=np.mean([self.data(o)[-1] for o in ss],axis=0)
                else:
                    inner=poly[np.argsort(abs(poly[:,0]-self.head_mid[0]))[:max(4,len(poly)//12)]]
                    apex=center(inner);end=cent+(cent-apex)*.6
                n=self.bone(label+sidesuffix,apex,end,parent,'Species')
                for o in ss:self.rule[o.name]=('rigid',n)
                names.append(n);self.detail_features.append(n)
            return names
        if name=='Taluun':
            for part,side in [('L orbital process','.R'),('R orbital process','.L')]:
                p=self.data(self.parts[part][0]);n=self.bone('EyeStalk'+side,p[-2],p[-1],'Head','Species')
                self.rule[self.parts[part][0].name]=('rigid',n);self.detail_features.append(n)
        if name=='Mothren':
            shafts=feature('Antenna',['Antennal shaft'],2,True)
            for o in self.parts['Antenna comb filament']:
                self.rule[o.name]=('rigid',min(shafts,key=lambda b:np.linalg.norm(center(self.data(o))-self.spec[b][1])))
            feature('Palp',['Curved feeding palp'],2,True)
        if name=='Vessari':feature('Crest',[],tube=True,keyprefix='Occipital flight plume')
        if name=='Ureth':feature('Sail',['Translucent occipital sail','Sail cartilage'])
        if name=='Sovai':feature('GillFan',['External gill'],2,True)
        if name=='Pelrin':feature('Ear',['Translucent ear pinna','Auricular vessel','Reverse pinna branching vessel'],2)
        if name=='Zhavet':
            feature('Antenna',['Sensory antenna'],2,True);feature('Mandible',['Mandible'],2,True)
        if name=='Rhovi':feature('Crest',[],tube=True,keyprefix='Indigo crown quill')
        if name=='Nemeya':
            # Independent margin banks let the soft rim move while the bell and light organ remain together.
            groups=sorted(self.parts['Bell margin lappet'], key=lambda o:self.data(o)[-2,0])
            for j,ss in enumerate(np.array_split(np.arange(len(groups)),3)):
                obs=[groups[k] for k in ss];a=np.mean([self.data(o)[-2] for o in obs],0);b=np.mean([self.data(o)[-1] for o in obs],0)
                n=self.bone(('Lappets.R','Lappets.Center','Lappets.L')[j],a,b,'Head','Species')
                self.detail_features.append(n)
                for o in obs:self.rule[o.name]=('rigid',n)
        if name=='Dathri':
            o=self.parts['Opposing chela digit'][0];p=self.data(o)
            n=self.bone('Pincer.R',p[-2],p[-1],'Hand.R','Species');self.rule[o.name]=('rigid',n)
            self.detail_features.append(n);feature('MouthPlate',['Mouth plate'],2,True)
        eyes=sorted([o for o in self.meshes if key(o).startswith('Eye globe')],key=lambda o:center(self.data(o))[0])
        for i,o in enumerate(eyes):
            suffix=('.R','.L')[i] if len(eyes)==2 else '.Center';p=self.data(o);at=center(p)
            par='EyeStalk'+suffix if name=='Taluun' else 'Head'
            n=self.bone('Eye'+suffix,at,at+[0,-max(self.h*.012,np.ptp(p[:,0])*.53),0],par,'Face')
            self.rule[o.name]=('rigid',n)
            for k in ('Upper eyelid','Lower eyelid','Orbital pupil'):
                matches=[lid for lid in self.parts[k] if min(eyes,key=lambda e:np.linalg.norm(center(self.data(lid))-center(self.data(e))))==o]
                for lid in matches:
                    if k=='Orbital pupil':self.rule[lid.name]=('rigid',n);continue
                    name_lid=('LidUpper' if k=='Upper eyelid' else 'LidLower')+suffix
                    if name_lid not in self.spec:self.bone(name_lid,at,center(self.data(lid)),par,'Face')
                    self.rule[lid.name]=('rigid',name_lid)
        mouths=[o for o in self.meshes if key(o) in ('Sculpted labial ridge','Raised upper lip','Paired labial pad','Wide lower lip','Axial lower jaw scute','Ring mouth')]
        if mouths:
            tip=np.mean([center(self.data(o)) for o in mouths],axis=0)
            pivot=np.array([self.head_mid[0],self.head_mid[1]+.16*(hi[1]-lo[1]),lo[2]+.40*h])
            self.jaw=self.bone('Jaw',pivot,tip,'Head','Face')
            for o in mouths:self.rule[o.name]=('rigid','Jaw')

    def install(self):
        self.scene.view_layers[0].objects.active=self.rig;self.rig.select_set(True)
        bpy.ops.object.mode_set(mode='EDIT')
        for n,(a,b,par,collection,deform,connected) in self.spec.items():
            eb=self.rig.data.edit_bones.new(n);eb.head=a;eb.tail=b;eb.use_deform=deform
            if par:eb.parent=self.rig.data.edit_bones[par];eb.use_connect=connected
        bpy.ops.object.mode_set(mode='OBJECT')
        for section in SECTIONS:self.rig.data.collections.new(section)
        for n,(_,_,_,sec,_,_) in self.spec.items():
            b=self.rig.data.bones[n]
            for c in list(b.collections):c.unassign(b)
            self.rig.data.collections[sec].assign(b);b.color.palette=COLORS[sec]
        for coll in list(self.rig.data.collections):
            if not coll.bones:self.rig.data.collections.remove(coll)
        self.clean_occluded_paint()
        for o in self.meshes:self.bind(o)
        finish_rig(self)
        self.rig['Species']=self.name
        self.rig['Rig version']=1
        self.col.asset_data.description=self.name+' — rigged humanoid with per-limb IK, independently weighted meshes and pose assets.'
        return self.rig

    def clean_occluded_paint(self):
        """Reveal the original fabric shader wherever the concept projects an arm or apron onto a lower layer."""
        parts=CAST[self.name]['parts']
        arm_shapes={'Near arm','Far arm','Near hand','Far hand','Major chela body'}
        arm_profiles=[part[4] for part in parts if part[0] in arm_shapes]
        # Only a torso garment that overlaps the top of the legs may obscure their fabric.
        outer_profiles=[part[4] for part in parts if part[5] and part[0] not in arm_shapes
                        and 'leg' not in part[0].lower() and len(part[4])>=4
                        and part[4][-1][0]>LEG[self.name][0] and part[4][0][0]<LEG[self.name][0]-15]
        for obj in self.meshes:
            k=key(obj)
            body_part=next((part for part in parts if part[0]==k),None)
            if not body_part or k in arm_shapes or not (body_part[5] or 'trouser leg' in k):continue
            attr=obj.data.attributes.get('Reference weight')
            if not attr:continue
            points=self.data(obj)
            x=points[:,0]/self.scale+self.cx
            z=self.floor-points[:,2]/self.scale
            mask=np.zeros(len(x))
            for profile in arm_profiles+(outer_profiles if 'trouser leg' in k else []):
                zz,left,right=np.array(profile).T
                edge=np.minimum.reduce([x-np.interp(z,zz,left),np.interp(z,zz,right)-x,z-zz[0],zz[-1]-z])
                mask=np.maximum(mask,ramp(edge,-2.8,.8))
            if mask.max()==0:continue
            val=np.empty(len(points),np.float32)
            attr.data.foreach_get('value',val)
            attr.data.foreach_set('value',np.asarray(val*(1-mask),dtype=np.float32))
            obj.data.update()

    def arm_weights(self,p,side):
        s,e,w,h=self.arms[side];scale=self.h
        # The clavicle transition lies inside the sleeve cap.
        lead=s+unit(s-e)*scale*.045
        v=chain_weights(p,['Clavicle'+side,'UpperArm'+side,'Forearm'+side,'Hand'+side],
                        [lead,s,e,w,h],[scale*.033,scale*.043,scale*.024])
        digits=self.digits[side]
        if digits:
            # Palm material superimposed on individual digit roots follows the nearby finger.
            distances=[]; fractions=[]
            for base,mid,end,first,last in digits:
                vec=end-base; t=np.clip(np.einsum('ij,j->i',p-base,vec)/max(vec@vec,1e-12),0,1)
                distances.append(np.linalg.norm(p-base-t[:,None]*vec,axis=1))
                fractions.append(np.einsum('ij,j->i',p-base,unit(vec))/max(np.linalg.norm(vec),1e-6))
            distances=np.array(distances);idx=distances.argmin(axis=0);ii=np.arange(len(p))
            dist=distances[idx,ii];t=np.array(fractions)[idx,ii]
            amount=(1-ramp(dist,scale*.012,scale*.048))*ramp(t,.01,.56)*v['Hand'+side]
            v['Hand'+side]-=amount
            for j,(_,_,_,first,last) in enumerate(digits):
                active=amount*(idx==j);bend=ramp(t,.32,.82)
                add_weights(v,first,active*(1-bend));add_weights(v,last,active*bend)
        return v

    def leg_weights(self,p,side):
        hip,knee,ank,ball,tip=self.legs[side]
        lead=hip+unit(hip-knee)*self.h*.1
        return chain_weights(p,['Pelvis','Thigh'+side,'Shin'+side,'Foot'+side,'Toe'+side],
                             [lead,hip,knee,ank,ball,tip],np.array([.058,.045,.027,.022])*self.h)

    def body_weights(self,p):
        pelvis,waist,chest,shoulder,skull,crown=self.torso
        # The coat and all of its seams share one field, including the panels that drape over the legs.
        z=p[:,2];h=self.h
        sw=ramp(z,waist[2]-.055*h,waist[2]+.055*h)
        cw=ramp(z,chest[2]-.063*h,chest[2]+.063*h)
        v={'Pelvis':(1-sw)*(1-cw),'Spine':sw*(1-cw),'Chest':cw}
        legmix=1-ramp(z,pelvis[2]-.10*h,pelvis[2]+.035*h)
        if np.any(legmix):
            for k in v:v[k]=v[k]*(1-legmix)
            xr=self.legs['.R'][0][0];xl=self.legs['.L'][0][0]
            left=ramp(p[:,0],xr-(xl-xr)*.3,xl+(xl-xr)*.3)
            for side,frac in [('.L',left),('.R',1-left)]:
                # Fabrics extending below the knee also follow shin flexion.
                weights=self.leg_weights(p,side)
                for n,val in weights.items():add_weights(v,n,val*legmix*frac)
        return v

    def facial_weights(self,p):
        if not self.jaw:return {'Head':np.ones(len(p))}
        lo,hi=self.head_bounds;z=(p[:,2]-lo[2])/(hi[2]-lo[2]);front=(hi[1]-p[:,1])/(hi[1]-lo[1]+1.e-7)
        w=(1-ramp(z,.12,.58))*ramp(front,.26,.82)*.87
        return {'Head':1-w,'Jaw':w}

    def classify(self,o,p):
        k=key(o);lower=k.lower();point=center(p)
        def nearest_foot():
            return min(self.legs,key=lambda s:np.linalg.norm(point-self.legs[s][3]))
        if o.name in self.rule:
            r=self.rule[o.name]
            if r[0]=='rigid':return {r[1]:np.ones(len(p))}
            if r[0]=='palm':
                _,side,bone,base,tip=r
                weights=self.arm_weights(p,side)
                length=max(.001,np.linalg.norm(tip-base))
                t=np.einsum('ij,j->i',p-base,unit(tip-base))
                weights[bone]=weights['Hand'+side]*ramp(t,-.25*length,.75*length)
                weights['Hand'+side]-=weights[bone]
                return weights
            pos=r[2];size=np.linalg.norm(pos[-1]-pos[1])
            return chain_weights(p,r[1],pos,[max(.001,size*.15),max(.001,size*.19)])
        if k.startswith('Near arm') or k.startswith('Far arm'):
            side='.R' if k.startswith('Near') else '.L'
            return self.arm_weights(p,side)
        if k in ('Near hand','Near palm','Far palm','Far hand'):
            return self.arm_weights(p,'.R' if k.startswith('Near') else '.L')
        if 'shoulder guard' in lower or k in ('Pad quilting','Articulated shoulder plate'):
            return self.arm_weights(p,'.R')
        if k.startswith('Secondary forearm quill') or k=='Folded kitchen towel':
            if k=='Folded kitchen towel':return {'Forearm.R':np.ones(len(p))}
            return self.arm_weights(p,'.R')
        if k.startswith('Major chela body') or k=='Fixed chela digit':return {'Hand.R':np.ones(len(p))}
        if 'trouser leg' in lower:
            return self.leg_weights(p,'.R' if k.startswith('Left') else '.L')
        if 'boot' in lower or lower in ('stitched heel counter','webbed toe','articulated talon'):
            side='.R' if k.startswith('Left') else '.L' if k.startswith('Right') else nearest_foot()
            return self.leg_weights(p,side)
        if k.startswith('Neck') or k=='Fluted gular rib':
            start=self.torso[3];end=self.torso[4]
            t=np.einsum('ij,j->i',p-start,unit(end-start))/max(.001,np.linalg.norm(end-start))
            w=ramp(t,-.48,.17);top=ramp(t,.77,1.26)
            return {'Chest':1-w,'Neck':w*(1-top),'Head':w*top}
        headterms=('cranium','cranial','carapace crown','carapace overlapping','head plate','crown scute','sensory pit','nasal','cheek tusk','muzzle','beak','rostrum','scute 0','bell vessel','central organ','buccal','lichen rosette')
        if any(x in lower for x in headterms):
            if k.startswith('Cranium') or 'muzzle' in lower:return self.facial_weights(p)
            return {'Head':np.ones(len(p))}
        # Rigid tools move together with their mount; cloth seams use the same per-vertex field as the cloth.
        mount=None
        families=[
          (('spanner','riveted tool pocket'),'Riveted tool pocket'),
          (('utensil','cutlery pocket'),'Utensil pocket' if self.name=='Koruun' else 'Cutlery pocket'),
          (('lantern','burner glass'),'Lantern housing'),(('astrolabe face','astrolabe spoke','instrument chain'),'Astrolabe belt'),
          (('goggle','smoked glass'),'Goggle bridge'),(('receiver louvre','receiver'),'Receiver'),
          (('radio pack','radio back grille'),'Radio pack rear housing'),(('survey dial',),'Survey dial'),
          (('line knife sheath',),'Line knife sheath'),(('dispatch satchel',),'Dispatch satchel'),
          (('coiled tow line',),'Load harness belt'),(('coiled mooring rope',),'Coiled mooring rope 1'),
          (('rear service line hank',),'Rear service line hank'),(('rear forged tow ring',),'Tow plate mounting pad')]
        for terms,mkey in families:
            if any(t in lower for t in terms) and self.parts[mkey]:
                mount=min(self.parts[mkey],key=lambda q:abs(center(self.data(q))[0]-point[0]));break
        if mount:
            anchor=center(self.data(mount))[None,:]
            return {bn:np.full(len(p),float(x[0])) for bn,x in self.body_weights(anchor).items()}
        return self.body_weights(p)

    def bind(self,o):
        p=self.data(o);weights=self.classify(o,p)
        names=list(weights);w=np.column_stack([np.broadcast_to(val,(len(p),)) for val in weights.values()])
        w[w<.0005]=0
        if len(names)>4:
            cut=np.argsort(w,axis=1)[:,:-4];np.put_along_axis(w,cut,0,axis=1)
        totals=w.sum(axis=1,keepdims=True)
        if not np.isfinite(w).all() or (totals<.99e-6).any():raise ValueError('Unbound vertices: '+o.name)
        w=w/totals;quant=np.floor(w*1024+.5).astype(np.int32)
        # Integer weights sum exactly to 1024, including across colour, seam and material boundaries.
        j=w.argmax(1);quant[np.arange(len(p)),j]+=1024-quant.sum(1)
        for i,name in enumerate(names):
            vals=quant[:,i]
            if vals.max()==0:continue
            vg=o.vertex_groups.new(name=name)
            inds=np.argsort(vals);sortedvals=vals[inds];breaks=np.flatnonzero(np.diff(sortedvals))+1
            for block in np.split(inds,breaks):
                q=vals[block[0]]
                if q>0:vg.add(block.tolist(),q/1024,'REPLACE')
        o.parent=self.rig
        modifier=o.modifiers.new('Character armature','ARMATURE');modifier.object=self.rig
        modifier.use_deform_preserve_volume=True


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--only',nargs='*',default=[])
    args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
    model_names=args.only or list(CAST)
    for name in model_names:
        if bpy.data.objects.get(name+' | Rig'):raise ValueError('Source already contains the rig for '+name)
        model=FittedRig(name);model.build_body();model.install()
        print('RIGGED',name,len(model.spec),'bones;',len(model.meshes),'meshes',flush=True)
    bpy.context.window.scene=bpy.data.scenes[model_names[0]]
    guide=bpy.data.texts.get('START HERE • species studio')
    if guide:
        guide.clear();guide.write('LONG HAUL / RIGGED HUMANOIDS\n\nPick a species in the Scene selector. Select its “| Rig” object and enter Pose Mode. Each limb supports FK by default. Set the armature custom property IK_Arm_L, IK_Arm_R, IK_Leg_L, or IK_Leg_R to 1 to use the corresponding hand or foot target and pole. The target rotation orients the hand or foot.\n\nIn Armature Data Properties, the Fingers, Face, Species and IK bone collections can be toggled independently. The three single-pose actions per species are named Stride, Seat and Reach. Use the Asset Browser, Current File, in Pose Mode to apply a pose. The source opens in its original neutral position.\n\nThe Reference, Profile and Rear three-quarter cameras, packed materials and character collections are included. Side and rear anatomy was interpreted from the original single-angle concept.\n')
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(args.output.resolve()),compress=True)

if __name__=='__main__':main()
