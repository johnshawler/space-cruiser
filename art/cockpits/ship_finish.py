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
    from meshwork import rgb
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
    from meshwork import rgb
    lamp=bpy.data.lights.new(name,'AREA'); lamp.energy=watts; lamp.shape='DISK'; lamp.size=size
    lamp.color=rgb(color)
    obj=bpy.data.objects.new(name,lamp); scene.collection.objects.link(obj)
    obj.location=pos; obj.rotation_euler=(Vector(target)-Vector(pos)).to_track_quat('-Z','Y').to_euler()
    return obj

