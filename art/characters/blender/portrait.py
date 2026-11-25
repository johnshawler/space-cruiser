"""Render an editable Cycles studio portrait of a finished resident GLB."""
import json, math, sys
from pathlib import Path
import bpy
import numpy as np
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[3]
arg = sys.argv.index('--')
species = sys.argv[arg + 1]
scene_path = ROOT/'art/characters/blender/scenes'/f'{species}.blend'
preview = ROOT/'docs/character-surfaces'/f'{species}.png'
scene_path.parent.mkdir(parents=True,exist_ok=True)
preview.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/characters'/f'{species}.glb'))
subjects=[o for o in scene.objects if o.type=='MESH']
assert subjects
for mat in bpy.data.materials:
    if not mat.use_nodes:continue
    bs=next((n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if not bs:continue
    role=mat.get('surfaceRole')
    if role:
        bs.inputs['Subsurface Weight'].default_value=mat.get('subsurfaceWeight',0.)
        bs.inputs['Subsurface Scale'].default_value=.017
    if role in ('fur','feather','canvas'):
        bs.inputs['Sheen Weight'].default_value=.39 if role=='fur' else .23
        bs.inputs['Sheen Roughness'].default_value=.62
    if role=='feather':
        bs.inputs['Iridescence Weight'].default_value=.13 if species=='pavo' else .025
    if role in ('pitted','alloy'):
        bs.inputs['Coat Weight'].default_value=.10 if role=='pitted' else .19
pts=[o.matrix_world@Vector(v) for o in subjects for v in o.bound_box]
lo=Vector([min(v[i] for v in pts) for i in range(3)])
hi=Vector([max(v[i] for v in pts) for i in range(3)])
mid=(lo+hi)*.5; span=max(hi.z-lo.z,(hi.x-lo.x)*1.25,(hi.y-lo.y)*.77)
def aim(obj,point):obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()
def area(name,offset,color,power,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power*span**2;data.color=color;data.shape='DISK';data.size=size*span
    ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=mid+Vector(offset)*span;aim(ob,mid)
def material(name,color,rough,metal):
    m=bpy.data.materials.new(name);m.use_nodes=True;s=m.node_tree.nodes.get('Principled BSDF')
    s.inputs['Base Color'].default_value=(*color,1);s.inputs['Roughness'].default_value=rough;s.inputs['Metallic'].default_value=metal
    return m
area('Warm key',(-1.3,-1.6,1.7),(1,.85,.67),155,1.35)
area('Cool fill',(.9,-1.1,.45),(.61,.80,1),62,1.2)
area('Edge light',(.65,.8,1.15),(.72,.91,1),189,.72)
world=bpy.data.worlds.new('Studio environment');scene.world=world;world.use_nodes=True
w,h=256,128;y,x=np.mgrid[0:h,0:w];u=x/w;v=y/h
sky=np.zeros((h,w,4),dtype=np.float32);sky[:,:,:3]=[.055,.080,.13];sky[:,:,3]=1
for cx,cy,dx,dy,col in [(.18,.72,.09,.18,[2.4,1.85,1.30]),(.63,.66,.065,.12,[.85,1.36,2.1]),(.86,.56,.025,.19,[.85,1.10,1.35])]:
    a=np.exp(-((u-cx)/dx)**4-((v-cy)/dy)**4)
    sky[:,:,:3]+=a[:,:,None]*np.array(col)
im=bpy.data.images.new('High dynamic range studio',w,h,float_buffer=True);im.pixels.foreach_set(sky.ravel());im.pack()
nt=world.node_tree;e=nt.nodes.new('ShaderNodeTexEnvironment');e.image=im;nt.links.new(e.outputs[0],nt.nodes['Background'].inputs[0]);nt.nodes['Background'].inputs[1].default_value=.27
bpy.ops.mesh.primitive_plane_add(size=span*180,location=(mid.x,mid.y,min(0,lo.z)-.006))
bpy.context.object.name='Studio floor';bpy.context.object.data.materials.append(material('Midnight blue mineral floor',(.034,.059,.071),.39,.18))
# Participating air catches the rim; the volume is deliberately local to the set.
bpy.ops.mesh.primitive_cube_add(size=1,location=mid);air=bpy.context.object;air.name='Studio air'
air.dimensions=(span*4,span*4,span*3);air.display_type='WIRE'
m=bpy.data.materials.new('Fine haze');m.use_nodes=True;nt=m.node_tree;nt.nodes.remove(nt.nodes['Principled BSDF'])
volume=nt.nodes.new('ShaderNodeVolumeScatter');volume.inputs['Density'].default_value=.0065/span
volume.inputs['Anisotropy'].default_value=.37;nt.links.new(volume.outputs[0],nt.nodes['Material Output'].inputs['Volume']);air.data.materials.append(m)
probe=bpy.data.lightprobes.new('Stage reflection probe','SPHERE');po=bpy.data.objects.new(probe.name,probe);scene.collection.objects.link(po);po.location=mid
scene.eevee.use_raytracing=True;scene.eevee.ray_tracing_method='SCREEN'
camera=bpy.data.cameras.new('Portrait');ob=bpy.data.objects.new('Portrait',camera);scene.collection.objects.link(ob);scene.camera=ob
angle=math.radians(-12 if species in ('neru','marlo','kepp') else 14)
ob.location=mid+Vector((math.sin(angle)*2.65,-math.cos(angle)*2.65,.36))*span;aim(ob,mid)
camera.type='ORTHO';camera.ortho_scale=1.32*span;camera.dof.use_dof=True
camera.dof.focus_distance=(ob.location-mid).length;camera.dof.aperture_fstop=9
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=36;scene.cycles.max_bounces=7;scene.cycles.use_denoising=True
scene.view_settings.view_transform='Filmic';scene.render.image_settings.color_mode='RGB'
scene.render.resolution_x=660;scene.render.resolution_y=760;scene.render.resolution_percentage=100
scene.render.use_motion_blur=True;scene.render.motion_blur_shutter=.13
scene.use_nodes=True;nt=scene.node_tree;nt.nodes.clear();layer=nt.nodes.new('CompositorNodeRLayers')
glow=nt.nodes.new('CompositorNodeGlare');glow.glare_type='FOG_GLOW';glow.quality='MEDIUM'
if glow.inputs.get('Threshold'):glow.inputs['Threshold'].default_value=1.55
nt.links.new(layer.outputs['Image'],glow.inputs['Image']);nt.links.new(glow.outputs['Image'],nt.nodes.new('CompositorNodeComposite').inputs['Image'])
bpy.context.preferences.filepaths.save_version=0;scene.render.filepath='//../../../../docs/character-surfaces/'+species+'.png'
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(scene_path),compress=True)
scene.render.filepath=str(preview);bpy.ops.render.render(write_still=True)
print('CYCLES PORTRAIT',species,len(subjects),preview.stat().st_size)
