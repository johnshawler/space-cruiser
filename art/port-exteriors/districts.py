"""Surrounding freight districts and distance versions of each port's own storefront."""
from math import sin, cos, tau, pi, radians
from mathutils import Vector
from pathlib import Path
import bpy
import numpy as np
from dockworks import *
SHOPS=['bar','garage','livery','bar','livery','garage','outfit','livery','bar','garage','depot','outfit','assay']

def shop_lod(p,idx,folder):
    """Sample the canonical shop's finish into a lightweight, noninteractive exterior."""
    src=Path(folder)/(p.slug+'-'+SHOPS[idx]+'.glb')
    if not src.exists():raise FileNotFoundError(src)
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(src))
    items=list(set(bpy.data.objects)-before)
    geo=[o for o in items if o.type=='MESH'];assert len(geo)==1,src
    o=geo[0];bpy.context.view_layer.objects.active=o
    mod=o.modifiers.new('Street silhouette','DECIMATE');mod.ratio=.27
    bpy.ops.object.modifier_apply(modifier=mod.name)
    m=o.data;world=o.matrix_world.copy();coords=np.array([tuple(world@v.co) for v in m.vertices])
    lo=coords.min(axis=0);hi=coords.max(axis=0);mid=(hi+lo)*.5
    # Street units form the western wharf, clear of the ship cylinder in all thirteen files.
    scale=min(35/(hi-lo)[0],39/(hi-lo)[1])
    turn=radians(20 if idx%3!=1 else 32);pt=np.empty_like(coords)
    u=(coords[:,0]-mid[0])*scale;v=(coords[:,1]-mid[1])*scale
    pt[:,0]=-77+u*cos(turn)-v*sin(turn);pt[:,1]=21+u*sin(turn)+v*cos(turn);pt[:,2]=(coords[:,2]-lo[2])*scale+.65
    data=p.parts.setdefault(('Western wharf | '+SHOPS[idx]+' exterior',None),[[],[],[],[],[]]);data[0].extend(map(tuple,pt))
    uvs=m.uv_layers.active
    facecolors=[];finish=[]
    for mat in m.materials:
        bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
        sock=bs.inputs['Base Color'];color=np.array(sock.default_value[:3]);pixels=None
        if sock.links:
            tex=sock.links[0].from_node
            if tex.type=='TEX_IMAGE' and tex.image:
                im=tex.image;w,h=im.size;pixels=np.empty(w*h*4,dtype=np.float32);im.pixels.foreach_get(pixels);pixels=pixels.reshape((h,w,4))
        facecolors.append((color,pixels));finish.append('Metal' if bs.inputs['Metallic'].default_value>.48 else 'Enamel')
    for f in m.polygons:
        col,im=facecolors[f.material_index]
        if im is not None and uvs:
            uv=uvs.data[f.loop_start].uv;h,w=im.shape[:2];col=im[int(uv[1]*h)%h,int(uv[0]*w)%w,:3]
        data[1].append(tuple(f.vertices));data[2].append(tuple(col)+(1,));data[3].append(finish[f.material_index]);data[4].append(f.use_smooth)
    for obj in items:bpy.data.objects.remove(obj,do_unlink=True)
    bpy.ops.outliner.orphans_purge(do_recursive=True)

def district(p,idx,terrain):
    with p.section('West quay and station service conduits'):
        pier(p,-7.7,2.1,4.55,4.90,.045,'iron' if idx>=9 else 'stone',idx in (3,6,7))
        for side in [-1,1]:
            truss(p,(-7.7+side*2.1,-.31,-.13),(-7.7+side*2.1,4.5,-.13),.42)
        boardwalk(p,-7.6,4.5,-6.7,7.4,.7,.05)
        for j in range(3):
            y=7.84+j*.18
            p.wire([(2.5,y,.21),(3.6,y,.21),(4.15,y+.66,.21),(6.0,y+.66,.21)],.052,['rail','copper','iron'][j])
    with p.section('Fuel manifolds, reel and hose cabinets'):
        pier(p,7.26,.62,3.10,2.2,-.035,'iron',idx<6)
        for k in range(2):
            x=6.9+k*1.05;y=.28+k*.25
            tanks(p,x,y,0,.42,.99+.13*k,['teal','copper'][k])
            p.wire([(x,y,1.13),(x,y-.41,1.13),(x+.26,y-.53,.9),(x+.26,y-.53,.1)],.055,'gold')
        x,y=6.52,1.5;z=.57
        p.rod((x-.39,y,z),(x+.39,y,z),.28,'rubber',n=16)
        for side in [-1,1]:
            p.rod((x+side*.395,y,z),(x+side*.445,y,z),.36,'oxide',n=16)
            p.rod((x+side*.42,y,.03),(x+side*.42,y,z),.048,'iron')
    with p.section('Quayside practical lamps and dock fittings'):
        for k,(x,y) in enumerate([(-6.1,.15),(-6.35,4.2),(5.9,1.2),(7.8,5.5),(1.1,6.0)]):
            high=1.06 if k%2 else 1.48
            p.lathe((x,y,-.01),[(.135,0),(.12,.12),(.055,.23),(.045,high)],'iron',10)
            p.wire([(x,y,high-.15),(x,y,high),(x+.18,y,high+.12),(x+.31,y,high+.12)],.035,'gold')
            p.lathe((x+.30,y,high-.005),[(.11,0),(.15,.085),(.065,.14)],'iron',12);p.ball((x+.30,y,high+.004),(.10,.10,.053),'light')
        for i in range(8):
            x=6.0+i%4*.42;y=6.3+(i//4)*.38;tanks(p,x,y,.03,.154,.43,'oxide' if i%3 else 'blue','gold')
        for side in [-1,1]:
            for k in range(4):
                x=side*(5.78+k*.18);y=-1.05+k*.12;p.box((x,y,.045),(.10,.34,.089),'ochre' if k%2 else 'ink',-.5)
    if idx in [0,1,2,4,5,8]:
        with p.section('Foothills, scree and ground cover'):
            rng=p.random;c=['moss','basalt','sand','sea','violet','moss','plum','gold','ice'][idx]
            for i in range(50):
                a=rng.uniform(.02,pi*.98);r=rng.uniform(8.4,10.85);x=r*cos(a);y=2.6+.76*r*sin(a);z=-.20
                s=rng.uniform(.11,.36)
                if idx in [0,5]:
                    p.ball((x,y,z+s*.50),(s,s*.68,s*.58),'jade' if i%2 else 'leaf',10,4)
                else:stones(p,x,y,z,s,s*.84,s*[1.1,.8,1.6][i%3],c,6)
