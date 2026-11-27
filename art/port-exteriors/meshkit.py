"""Small mesh-authoring vocabulary for the port model sheets. Coordinates here are decametres."""
import math
import random
from pathlib import Path
from collections import defaultdict
from contextlib import contextmanager
import bpy
from mathutils import Vector
from math import sin, cos, pi, tau

SCALE = 10.0
PAINT = {
    'ink':'293238','iron':'49535a','rail':'849092','rim':'b8b8a8','chalk':'dfd4b6',
    'ivory':'ebe3c9','amber':'e8ac53','gold':'bd9358','ochre':'b7773e','oxide':'a9573e',
    'brick':'8e463b','copper':'bc764d','slate':'556777','blue':'3e657e','aqua':'5a9d9d',
    'glass':'83b4b5','teal':'31777c','navy':'334854','midnight':'30303c','violet':'9564af',
    'plum':'6c465f','rose':'bd7d92','pink':'dfa6b0','moss':'6f8051','jade':'50724b',
    'leaf':'8ba85a','pine':'385c51','brown':'735746','wood':'a88762','sand':'c29667',
    'stone':'a27862','basalt':'4c474b','tuff':'69584e','ice':'a4cfdb','snow':'e9f0ef',
    'cool':'a7d9e8','fire':'ff8538','light':'ffe1a0','redlamp':'ff6949','lime':'c8e790',
    'white':'f4ead7','rubber':'373d40','sea':'559d9a','mud':'697955','linen':'c5ab83'
}
FINISH = {k:v for v,ks in {'Metal':'iron rail rim gold copper','Glazing':'glass cool',
    'Lamp':'fire light redlamp lime','Earth':'sand stone basalt tuff moss jade leaf pine mud wood snow ice sea',
    'Cloth':'linen plum rose pink'}.items() for k in ks.split()}

def linear(v):
    return ((v+.055)/1.055)**2.4 if v>.04045 else v/12.92

class Port:
    def __init__(self,slug):
        self.slug=slug
        self.random=random.Random(slug)
        self.parts={}; self.name='Foundations'; self.joint=None
        self.joints={}; self.marks={}; self.materials={}
    @contextmanager
    def section(self,name,joint=None):
        last=self.name,self.joint
        self.name,self.joint=name,joint
        try: yield
        finally: self.name,self.joint=last
    def mesh(self,verts,faces,c,smooth=False):
        group=self.parts.setdefault((self.name,self.joint),[[],[],[],[],[]])
        vs,fs,colors,surfaces,normals=group
        off=len(vs);vs.extend([tuple(SCALE*v for v in pt) for pt in verts])
        hexcode=PAINT.get(c,c); rgb=[int(hexcode[k:k+2],16)/255 for k in (0,2,4)]
        finish=FINISH.get(c,'Enamel')
        for f in faces:
            fs.append(tuple(off+i for i in f));surfaces.append(finish);normals.append(smooth)
            g=self.random.uniform(.967,1.035)
            colors.append(tuple(linear(min(1,a*g)) for a in rgb)+(1,))
    def box(self,p,size,c,turn=0,bevel=.035):
        x,y,z=p; w,d,h=[v/2 for v in size];b=min(bevel,w*.32,d*.32,h*.32)
        # A chamfered profile and top chamfer catch edge light even at port-view distance.
        def loop(W,D,B,Z):
            pts=[(-W+B,-D),(W-B,-D),(W,-D+B),(W,D-B),(W-B,D),(-W+B,D),(-W,D-B),(-W,-D+B)]
            return [(x+u*cos(turn)-v*sin(turn),y+u*sin(turn)+v*cos(turn),z+Z) for u,v in pts]
        verts=loop(w-b,d-b,b,-h)+loop(w,d,b,-h+b)+loop(w,d,b,h-b)+loop(w-b,d-b,b,h)
        faces=[list(reversed(range(8))),list(range(24,32))]
        for k in (0,8,16): faces.extend((k+i,k+(i+1)%8,k+8+(i+1)%8,k+8+i) for i in range(8))
        self.mesh(verts,faces,c)
    def surface(self,rows,c,smooth=False,closed=False):
        n=len(rows[0]);verts=[p for row in rows for p in row];fs=[]
        for j in range(len(rows)-1):
            for i in range(n if closed else n-1):
                k=(i+1)%n;fs.append((j*n+i,j*n+k,(j+1)*n+k,(j+1)*n+i))
        self.mesh(verts,fs,c,smooth)
    def lathe(self,p,profile,c,n=28,ell=(1,1),turn=0,smooth=True):
        x,y,z=p;rows=[]
        for r,h in profile:rows.append([(x+r*ell[0]*cos(i*tau/n+turn),y+r*ell[1]*sin(i*tau/n+turn),z+h) for i in range(n)])
        self.surface(rows,c,smooth,True)
        self.mesh(rows[0],[list(reversed(range(n)))],c);self.mesh(rows[-1],[list(range(n))],c)
    def rod(self,a,b,r,c,r2=None,n=10):
        a,b=Vector(a),Vector(b);axis=b-a
        if axis.length<1e-7:return
        norm=axis.normalized();ref=Vector((0,0,1)) if abs(norm.z)<.9 else Vector((0,1,0))
        u=norm.cross(ref).normalized();v=norm.cross(u)
        rings=[[tuple(p+(u*cos(i*tau/n)+v*sin(i*tau/n))*rad) for i in range(n)] for p,rad in [(a,r),(b,r if r2 is None else r2)]]
        self.surface(rings,c,True,True);self.mesh(rings[0],[list(reversed(range(n)))],c);self.mesh(rings[1],[list(range(n))],c)
    def ball(self,p,scale,c,n=16,m=8):
        self.lathe(p,[(max(.001,cos(t*pi/m-pi/2)),sin(t*pi/m-pi/2)*scale[2]) for t in range(m+1)],c,n,scale[:2])
    def wire(self,pts,r,c,n=8):
        for a,b in zip(pts,pts[1:]):self.rod(a,b,r,c,n=n)
    def ring(self,p,r,w,c,normal=(0,0,1),n=36):
        axis=Vector(normal).normalized();u=axis.cross(Vector((0,0,1)) if abs(axis.z)<.9 else Vector((0,1,0))).normalized();v=axis.cross(u)
        rows=[]
        for i in range(n+1):
            dr=u*cos(tau*i/n)+v*sin(tau*i/n)
            rows.append([tuple(Vector(p)+dr*(r+w*cos(j*tau/8))+axis*w*sin(j*tau/8)) for j in range(8)])
        self.surface(rows,c,True,True)
    def joint_spec(self,name,p,axis,keys,mode='rotate',parent=None):
        self.joints[name]=(p,axis,keys,mode,parent)
        return name
    def mat(self,key):
        if key in self.materials:return self.materials[key]
        m=bpy.data.materials.new(key);m.use_nodes=True;n=m.node_tree.nodes;b=n.get('Principled BSDF');v=n.new('ShaderNodeVertexColor');v.layer_name='Finish'
        m.node_tree.links.new(v.outputs['Color'],b.inputs['Base Color'])
        b.inputs['Metallic'].default_value={'Metal':.58,'Enamel':.23,'Glazing':.45,'Earth':.04}.get(key,.03)
        b.inputs['Roughness'].default_value={'Glazing':.19,'Earth':.85,'Metal':.39,'Cloth':.92}.get(key,.47)
        if key in ('Metal','Earth','Enamel','Cloth'):
            image_folder=Path(__file__).resolve().parent/'maps'
            family='rock' if key in ('Earth','Cloth') else 'paint'
            def bitmap(suffix):
                path=image_folder/(family+suffix+'.png')
                img=bpy.data.images.load(str(path),check_existing=True)
                if suffix:img.colorspace_settings.name='Non-Color'
                if not img.packed_file:img.pack()
                tex=n.new('ShaderNodeTexImage');tex.image=img;return tex.outputs['Color']
            mul=n.new('ShaderNodeMix');mul.data_type='RGBA';mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1
            m.node_tree.links.new(bitmap(''),mul.inputs[6]);m.node_tree.links.new(v.outputs['Color'],mul.inputs[7])
            m.node_tree.links.new(mul.outputs[2],b.inputs['Base Color'])
            bump=n.new('ShaderNodeNormalMap');bump.inputs['Strength'].default_value=.36
            m.node_tree.links.new(bitmap('-normal'),bump.inputs['Color']);m.node_tree.links.new(bump.outputs['Normal'],b.inputs['Normal'])
        if key=='Lamp':
            m.node_tree.links.new(v.outputs['Color'],b.inputs['Emission Color']);b.inputs['Emission Strength'].default_value=.78
        self.materials[key]=m;return m
    def finish(self):
        objects=[]
        for (name,joint),(vs,fs,cols,fin,normals) in self.parts.items():
            mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],fs);mesh.update()
            obj=bpy.data.objects.new(name,mesh);bpy.context.scene.collection.objects.link(obj)
            surfaces=list(dict.fromkeys(fin))
            for s in surfaces:mesh.materials.append(self.mat(s))
            mesh.polygons.foreach_set('material_index',[surfaces.index(s) for s in fin]);mesh.polygons.foreach_set('use_smooth',normals)
            color=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
            from array import array
            vals=array('f')
            for face,col in zip(fs,cols):vals.extend(col*len(face))
            color.data.foreach_set('color',vals)
            # Dominant-axis projection in metres keeps panel seams and rock grain consistent across sites.
            import numpy as np
            uv=mesh.uv_layers.new(name='Dock UV'); packed=np.empty((len(mesh.loops),2),dtype=np.float32)
            coords=np.asarray(vs,dtype=np.float32)
            face_norm=np.empty((len(fs),3),dtype=np.float32);mesh.polygons.foreach_get('normal',face_norm.ravel())
            axes=np.argmax(np.abs(face_norm),axis=1)
            corner_index=np.fromiter((i for face in fs for i in face),dtype=np.int32)
            per_corner=np.repeat(axes,[len(face) for face in fs]);points=coords[corner_index]
            packed[:,0]=np.where(per_corner==0,points[:,1],points[:,0])/17
            packed[:,1]=np.where(per_corner==2,points[:,1],points[:,2])/17
            uv.data.foreach_set('uv',packed.ravel())
            objects.append((obj,joint))
        return objects
