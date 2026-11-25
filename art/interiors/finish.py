"""Blender look development and portable room data. Textures are authored offline."""
import json
import math
import struct
import tempfile
from pathlib import Path
import bpy
import numpy as np
from mathutils import Vector

_CACHE = {}
_TMP = Path(tempfile.mkdtemp(prefix='long-haul-interior-'))

def srgb_linear(v):
    return np.where(v<=.04045,v/12.92,((v+.055)/1.055)**2.4)

def linear_srgb(v):
    return np.where(v<=.0031308,12.92*v,1.055*np.maximum(v,0)**(1/2.4)-.055)

def rgba_image(name, rgb, data=True, hdr=False):
    h,w=rgb.shape[:2]
    im=bpy.data.images.new(name,w,h,alpha=False,float_buffer=hdr)
    im.colorspace_settings.name='Non-Color' if data else 'Linear Rec.709'
    rgba=np.ones((h,w,4),dtype=np.float32); rgba[:,:,:3]=rgb
    im.pixels.foreach_set(rgba.flatten())
    im.filepath_raw=str(_TMP/(name+('.hdr' if hdr else '.png')))
    im.file_format='HDR' if hdr else 'PNG'
    im.save(); im.pack()
    return im

def surface_maps(kind):
    if kind in _CACHE:return _CACHE[kind]
    y,x=np.mgrid[0:64,0:64]*2*math.pi/64
    if kind=='wood':h=.26*np.sin(3*x+.75*np.sin(y))+.10*np.sin(11*x+2*np.sin(y))
    elif kind=='felt':h=.25*np.cos(16*x)*np.cos(16*y)+.10*np.sin(8*x+8*y)
    elif kind=='metal':h=.08*np.sin(15*y+np.cos(x))+.1*np.maximum(0,np.cos(3*x+5*y))**30
    elif kind=='tile':h=.13*np.sin(5*x+np.sin(3*y))*.6+.07*np.cos(5*y+2*x)
    else:h=.16*np.sin(4*x+np.cos(y))+.035*np.cos(8*y)
    dx=(np.roll(h,-1,1)-np.roll(h,1,1))*.35
    dy=(np.roll(h,-1,0)-np.roll(h,1,0))*.35
    n=np.stack((-dx,-dy,np.ones_like(dx)),axis=-1)
    n/=np.linalg.norm(n,axis=-1,keepdims=True)
    normal=rgba_image(kind+'-normal',n*.5+.5)
    _CACHE[kind]=(normal,h)
    return _CACHE[kind]

def make_material(name, color, rough=.58, metal=0, kind=None, emission=0, alpha=1, sss=0):
    from workshop import rgb
    m=bpy.data.materials.new(name); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    c=(*rgb(color),1)
    for field,val in [('Base Color',c),('Roughness',rough),('Metallic',metal),('Alpha',alpha),
        ('Emission Color',c),('Emission Strength',emission),('Subsurface Weight',sss)]:
        p.inputs[field].default_value=val
    m.diffuse_color=(*c[:3],alpha)
    if sss:
        m['subsurfaceWeight']=sss
        p.inputs['Subsurface Scale'].default_value=.085
    if alpha<1:
        m.surface_render_method='BLENDED'; m.use_backface_culling=False
    if kind:
        nimg,h=surface_maps(kind)
        key=kind+str(round(rough*100))+'-rough'
        if key not in _CACHE:
            _CACHE[key]=rgba_image(key,np.repeat(np.clip(rough+h*.24,.08,.94)[:,:,None],3,axis=2))
        links=m.node_tree.links; nodes=m.node_tree.nodes
        n=nodes.new('ShaderNodeTexImage'); n.image=nimg
        norm=nodes.new('ShaderNodeNormalMap'); norm.inputs['Strength'].default_value=.45
        r=nodes.new('ShaderNodeTexImage'); r.image=_CACHE[key]
        links.new(n.outputs['Color'],norm.inputs['Color']); links.new(norm.outputs['Normal'],p.inputs['Normal'])
        links.new(r.outputs['Color'],p.inputs['Roughness'])
    return m

def camera(scene,name,pt,aim):
    data=bpy.data.cameras.new(name); obj=bpy.data.objects.new(name,data); scene.collection.objects.link(obj)
    obj.location=pt; obj.rotation_euler=(Vector(aim)-Vector(pt)).to_track_quat('-Z','Y').to_euler()
    return obj

def area(scene,name,pos,target,color,watts,size):
    from workshop import rgb
    lamp=bpy.data.lights.new(name,'AREA'); lamp.energy=watts; lamp.shape='DISK'; lamp.size=size
    lamp.color=rgb(color)
    obj=bpy.data.objects.new(name,lamp); scene.collection.objects.link(obj)
    obj.location=pos; obj.rotation_euler=(Vector(target)-Vector(pos)).to_track_quat('-Z','Y').to_euler()
    return obj

def sky_image():
    # Sky radiance with a Rayleigh-blue zenith, warm Mie horizon and a compact sun.
    h,w=128,256
    az=np.arange(w)[None,:]*2*math.pi/w
    alt=((np.arange(h)[:,None]+.5)/h-.5)*math.pi
    z=np.sin(alt)*np.ones((1,w))
    mu=np.cos(alt)*np.cos(az-.8)*math.cos(.58)+z*math.sin(.58)
    horizon=np.exp(-np.maximum(z,0)*5)
    sky=(1-horizon[:,:,None])*np.array([.24,.54,1.13])+horizon[:,:,None]*np.array([1.38,1.56,1.75])
    sky+=np.maximum(mu,0)[:,:,None]**32*np.array([.91,.65,.4])
    sky+=np.maximum(mu,0)[:,:,None]**2400*np.array([45.,33.,18.])
    sky[z<0]=[.19,.26,.13]
    return rgba_image('orchard-sky',sky,False,True)

def grade_table():
    # 16 blue slices across a 256 x 16 strip. Green increases bottom to top.
    g,x=np.mgrid[:16,:256]
    col=np.stack([x%16,g,x//16],axis=-1)/15
    lum=(col*np.array([.2126,.7152,.0722])).sum(axis=-1,keepdims=True)
    graded=lum+(col-lum)*.98
    graded+= (1-lum)*lum*np.array([.065,.022,-.045])
    return np.clip(graded,0,1)

def prepare_finish(room):
    scene=bpy.context.scene
    # Separate source lights, large emitters and physically shaded surfaces give
    # Cycles colour bounce, occlusion, soft penumbrae and grounding contact.
    directory=room.root/'assets/interiors'/room.place;directory.mkdir(parents=True,exist_ok=True)
    sky=sky_image()
    (directory/'orchard-sky.hdr').write_bytes(Path(bpy.path.abspath(sky.filepath_raw)).read_bytes())
    lut=rgba_image('orchard-grade',grade_table())
    (directory/'orchard-grade.png').write_bytes(Path(bpy.path.abspath(lut.filepath_raw)).read_bytes())
    world=bpy.data.worlds.new('Verdanthia orchard daylight'); scene.world=world; world.use_nodes=True
    n=world.node_tree.nodes.new('ShaderNodeTexEnvironment');n.image=sky
    bg=world.node_tree.nodes['Background']; bg.inputs['Strength'].default_value=.48
    world.node_tree.links.new(n.outputs['Color'],bg.inputs[0])
    for marker in room.markers:
        x,y,z=marker.location
        area(scene,'Preview '+marker.name,(x,y-.16,z),(x*.55,y-3,max(0,z-3.8)),
             marker['color'],marker['intensity']*310,1.8)
    area(scene,'Softbox at open camera side',(1,-8,6.2),(0,4.5,2.7),'#fff3e0',2000,8)
    area(scene,'Reflected skylight',(-7,-1,6.5),(-3,6,3.4),'#d8edff',1050,5)
    area(scene,'Right bounce',(8,-2,5.8),(4,6,3.5),'#ffdfb9',900,4)
    spot=bpy.data.lights.new('Window shaft','SPOT');spot.energy=1150;spot.spot_size=.77
    spot.spot_blend=.62;spot.shadow_soft_size=.28
    pos=bpy.data.objects.new('Window shaft',spot);scene.collection.objects.link(pos)
    pos.location=(-7,4.5,6.9);pos.rotation_euler=(Vector((-2,1,.1))-pos.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.mesh.primitive_cube_add(size=1,location=(0,1.6,4))
    mist=bpy.context.object;mist.name='Preview | interior air';mist.dimensions=(19.1,18.8,7.95)
    m=bpy.data.materials.new('Preview | air');m.use_nodes=True
    nt=m.node_tree;nt.nodes.remove(nt.nodes['Principled BSDF']);v=nt.nodes.new('ShaderNodeVolumeScatter')
    v.inputs['Density'].default_value=.006;v.inputs['Anisotropy'].default_value=.38
    nt.links.new(v.outputs[0],nt.nodes['Material Output'].inputs['Volume']);mist.data.materials.append(m)
    mist.display_type='WIRE'
    scene.view_settings.view_transform='Filmic'
    scene.render.use_motion_blur=True;scene.render.motion_blur_shutter=.18
    scene.use_nodes=True;nt=scene.node_tree;nt.nodes.clear()
    layer=nt.nodes.new('CompositorNodeRLayers'); glow=nt.nodes.new('CompositorNodeGlare')
    glow.glare_type='FOG_GLOW';glow.quality='MEDIUM'
    if glow.inputs.get('Threshold'):glow.inputs['Threshold'].default_value=1.5
    out=nt.nodes.new('CompositorNodeComposite');nt.links.new(layer.outputs['Image'],glow.inputs['Image']);nt.links.new(glow.outputs['Image'],out.inputs['Image'])
    game=camera(scene,'Game camera',(0,-11.5,5.6),(0,2.6,2.1))
    game.data.sensor_fit='VERTICAL';game.data.sensor_height=24
    game.data.lens=12/math.tan(math.radians(22))
    game.data.dof.use_dof=True; game.data.dof.focus_distance=14.4;game.data.dof.aperture_fstop=5.6
    overview=camera(scene,'Cutaway overview',(17,-21,18),(0,3,2.9))
    overview.data.type='ORTHO'; overview.data.ortho_scale=27.6
    scene.camera=game
    room.game_camera,room.overview_camera=game,overview

def grade_png(path):
    im=bpy.data.images.load(str(path),check_existing=False);w,h=im.size
    pixels=np.empty(w*h*4,dtype=np.float32);im.pixels.foreach_get(pixels)
    p=pixels.reshape(h,w,4); c=np.clip(linear_srgb(p[:,:,:3]),0,1)*15
    low=np.minimum(c.astype(int),14); f=c-low
    lut=grade_table(); result=np.zeros_like(c)
    for dr in (0,1):
        for dg in (0,1):
            for db in (0,1):
                weight=np.prod(np.where(np.array([dr,dg,db]),f,1-f),axis=-1)
                result+=lut[low[:,:,1]+dg,(low[:,:,2]+db)*16+low[:,:,0]+dr]*weight[:,:,None]
    y,x=np.mgrid[-1:1:complex(h),-1:1:complex(w)]
    falloff=np.clip((x*x+y*y-.42)/1.58,0,1)**1.7
    grain=np.random.default_rng(380).normal(0,.00155,(h,w))
    p[:,:,:3]=srgb_linear(np.clip(result*(1-.052*falloff[:,:,None])+grain[:,:,None],0,1))
    im.pixels.foreach_set(p.flatten());im.save();bpy.data.images.remove(im)

def render_views(room):
    scene=bpy.context.scene;save=room.root/'docs/interiors'/room.place;save.mkdir(parents=True,exist_ok=True)
    for key,cam in [('game',room.game_camera),('overview',room.overview_camera)]:
        scene.camera=cam
        for obj in room.items:
            obj.hide_render=key=='overview' and bool(obj.get('overview_cut'))
        if key=='overview':
            # The overview has an open roof for the camera and keeps the rear props in place.
            bpy.data.objects['Preview | interior air'].hide_render=True
        path=save/(room.key+'-'+key+'.png');scene.render.filepath=str(path)
        bpy.ops.render.render(write_still=True)
        grade_png(path)
    for ob in room.items:ob.hide_render=False
    scene.camera=room.game_camera

def write_metrics(room,path):
    data=path.read_bytes();n=struct.unpack_from('<I',data,12)[0];g=json.loads(data[20:20+n])
    triangles=sum(g['accessors'][p['indices']]['count']//3 for m in g['meshes'] for p in m['primitives'])
    mats=len(g['materials']);meshes=len(g['meshes'])
    assert triangles<=80000 and meshes<=120 and mats<=16 and len(data)<=1500000,(triangles,meshes,mats,len(data))
    lights=[dict(name=o.name,position=[round(o.location.x,3),round(o.location.z,3),round(-o.location.y,3)],
                 color=o['color'],intensity=o['intensity'],distance=o['distance']) for o in room.markers]
    assert 2<=len(lights)<=5 and any(m['name']=='glass' for m in g['materials'])
    assert any('normalTexture' in m for m in g['materials'])
    assert any('metallicRoughnessTexture' in m.get('pbrMetallicRoughness',{}) for m in g['materials'])
    entry=dict(location=room.place,shop=room.key,name=room.title,file=path.relative_to(room.root).as_posix(),
               triangles=triangles,meshes=meshes,materials=mats,bytes=len(data),lights=lights,
               finishProfile=room.place,probePosition=[0,2,-2.6])
    manifest=path.parent.parent/'manifest.json'
    doc=json.loads(manifest.read_text()) if manifest.exists() else {'rooms':[]}
    doc['rooms']=[e for e in doc['rooms'] if (e['location'],e['shop'])!=(room.place,room.key)]+[entry]
    order={'depot':0,'garage':1,'cantina':2}
    doc['rooms'].sort(key=lambda e:(e['location'],order.get(e['shop'],9)))
    manifest.write_text(json.dumps(doc,indent=2)+'\n')
    print('ROOM METRICS',json.dumps(entry))
