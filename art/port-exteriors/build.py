"""Run with Blender 4.5 LTS, see docs/port-exteriors/README.md."""
from pathlib import Path
import sys, json, math
import bpy
from mathutils import Vector, Quaternion
sys.path.insert(0,str(Path(__file__).resolve().parent))
from meshkit import Port, SCALE
from dockworks import plate
from districts import district,shop_lod
from planet_ports import garden,lava,canyon,harbor,crystal,fungal,cloudport,drift,winter
from station_ports import hush,rime,spire,wink
from math import radians

DEST=Path(__file__).resolve().parents[2]
PORTS=[
    ('Vendorhaven','Verdanthia','garden','moss','chalk',garden),
    ('Port Gneiss','Scorchmaw','lava','basalt','amber',lava),
    ('Bureau Nine','Dunemoor','canyon','sand','oxide',canyon),
    ('Ladle Harbor','Sloshwell','harbor','sand','chalk',harbor),
    ('Bargain Roost','Amethyne','crystal','violet','amber',crystal),
    ('Mellow Hollow','Toxibloom','fungal','mud','chalk',fungal),
    ('Port Lament','Candara','cloud','plum','rose',cloudport),
    ('The Drift','Jovexa','cloud','gold','chalk',drift),
    ('Fort Snuggle','Brrrindle','ice','snow','oxide',winter),
    ('The Quiet Ear','Listening Post Hush','station','blue','ice',hush),
    ('The Freezer Aisle','Cryo Vault Rimeholm','station','ice','amber',rime),
    ('Tolerance Station','Calibration Spire','station','gold','chalk',spire),
    ('The Last Light','Beacon Far Wink','station','brick','amber',wink)]
FRAMES=[1,49,97,145,193]
def shifted(part,dx,dy):
    vs=part[0];vs[:]=[(x+dx*SCALE,y+dy*SCALE,z) for x,y,z in vs]

def set_up_rig(p,objects,root):
    rigdata=bpy.data.armatures.new('Port machinery');rig=bpy.data.objects.new('PortRig',rigdata)
    bpy.context.scene.collection.objects.link(rig);rig.parent=root;rig.show_in_front=True
    bpy.context.view_layer.objects.active=rig;rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    base=rigdata.edit_bones.new('Structure');base.head=(0,0,-4);base.tail=(0,4,-4);base.use_deform=False
    for name,(pivot,axis,values,mode,parent) in p.joints.items():
        bone=rigdata.edit_bones.new(name);bone.head=Vector(pivot)*SCALE;bone.tail=bone.head+Vector((0,3,0))
        bone.parent=rigdata.edit_bones[parent or 'Structure']
    bpy.ops.object.mode_set(mode='OBJECT');rigdata.display_type='STICK'
    for obj,joint in objects:
        if joint:
            group=obj.vertex_groups.new(name=joint);group.add(list(range(len(obj.data.vertices))),1.0,'REPLACE')
            mod=obj.modifiers.new('Rigid bone binding','ARMATURE');mod.object=rig;obj.parent=rig
        else:obj.parent=root
    for name,(pivot,axis,vals,mode,parent) in p.joints.items():
        bone=rig.pose.bones[name];bone.rotation_mode='XYZ'
        # All rest bases are aligned with the authoring axes. Euler keys preserve full revolutions.
        for frame,k in zip(FRAMES,vals):
            if mode=='rotate':
                bone.rotation_euler=tuple(radians(k)*a for a in axis);bone.keyframe_insert(data_path='rotation_euler',frame=frame,group=name)
            else:
                bone.location=Vector(axis)*k*SCALE;bone.keyframe_insert(data_path='location',frame=frame,group=name)
    action=rig.animation_data.action;action.name='Port_Operations'
    for f in action.fcurves:
        for key in f.keyframe_points:key.interpolation='LINEAR'
    return rig

def studio(scene,world,name):
    studio=bpy.data.collections.new('Review camera and lighting');scene.collection.children.link(studio)
    scene.world=bpy.data.worlds.new('Cyclorama');scene.world.use_nodes=True
    bg=scene.world.node_tree.nodes.get('Background')
    bg.inputs[0].default_value=(.47,.55,.64,1);bg.inputs[1].default_value=.60
    n=scene.world.node_tree.nodes;links=scene.world.node_tree.links
    mix=n.new('ShaderNodeMixShader');ambient=n.new('ShaderNodeBackground')
    colors={'lava':(.13,.10,.09,1),'garden':(.22,.28,.24,1),'canyon':(.36,.28,.20,1),
            'harbor':(.16,.29,.33,1),'crystal':(.26,.20,.32,1),'fungal':(.21,.28,.21,1),
            'ice':(.28,.35,.40,1),'cloud':(.30,.235,.25,1),'station':(.035,.047,.069,1)}
    ambient.inputs[0].default_value=colors[world];ambient.inputs[1].default_value=.82
    path=n.new('ShaderNodeLightPath');links.new(path.outputs['Is Camera Ray'],mix.inputs[0]);links.new(bg.outputs[0],mix.inputs[1]);links.new(ambient.outputs[0],mix.inputs[2]);links.new(mix.outputs[0],n.get('World Output').inputs[0])
    def make(n,data,pos,target):
        o=bpy.data.objects.new(n,data);studio.objects.link(o);o.location=pos;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
    look=(0,37,13)
    for nm,pos,energy,size,color in [('Warm gantry softbox',(-115,-126,210),840000,125,(1,.87,.72)),('Dome fill',(146,-46,106),460000,110,(.76,.87,1)),('Back edge',(-55,183,124),880000,105,(1,.80,.59))]:
        d=bpy.data.lights.new(nm,'AREA');d.energy=energy;d.shape='DISK';d.size=size;d.color=color;make(nm,d,pos,look)
    d=bpy.data.cameras.new('Port survey');cam=make('Port survey',d,(112,-249,156),look);d.type='ORTHO';d.ortho_scale=254;d.clip_end=1600;scene.camera=cam
    scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=10;scene.cycles.use_denoising=True;scene.cycles.max_bounces=4
    scene.render.resolution_x=760;scene.render.resolution_y=520;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=91
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type=='VIEW_3D':
                s=area.spaces.active;s.region_3d.view_perspective='CAMERA';s.region_3d.view_camera_zoom=0
                s.shading.color_type='VERTEX';s.overlay.show_overlays=False;s.clip_end=2000
    return cam

def build(idx,proofdir,storefronts):
    name,world,typ,soil,trim,design=PORTS[idx];slug=world.lower().replace(' ','-')
    bpy.ops.wm.read_factory_settings(use_empty=True);bpy.context.preferences.filepaths.save_version=0
    scene=bpy.context.scene;scene.name=name;scene.unit_settings.system='METRIC';scene.render.fps=24;scene.frame_start=1;scene.frame_end=192
    p=Port(slug);plate(p,typ,soil,trim);fixed=set(p.parts)
    for k in fixed:
        if k[0]=='Freight apron and cargo':shifted(p.parts[k],1.35,0)
        if k[0]=='Site geology and shoreline':
            vs=p.parts[k][0];vs[:]=[(x,y*1.15+7,z) for x,y,z in vs]
        if k[0]=='Dock spar and pressure decking':
            vs=p.parts[k][0];vs[:]=[(x,y*1.30+1,z) for x,y,z in vs]
    p.marks['freight_quay']=(7.15,3.7,0)
    design(p)
    for k in set(p.parts)-fixed:shifted(p.parts[k],0,2.05)
    p.joints={n:((xyz[0],xyz[1]+2.05,xyz[2]),*rest) for n,(xyz,*rest) in p.joints.items()}
    district(p,idx,typ);shop_lod(p,idx,storefronts)
    objects=p.finish()
    root=bpy.data.objects.new('PortExterior',None);scene.collection.objects.link(root)
    root['world']=world;root['port']=name;root['gameIndex']=idx;root['landingRadiusMetres']=50.
    for label,point in p.marks.items():
        m=bpy.data.objects.new(label,None);scene.collection.objects.link(m);m.parent=root;m.location=Vector(point)*SCALE;m.empty_display_type='PLAIN_AXES';m.empty_display_size=2.
    rig=set_up_rig(p,objects,root);scene.frame_set(1)
    for f,label in zip(FRAMES,['Start','Outbound','Far stop','Return','Loop']):scene.timeline_markers.new(label,frame=f)
    rig.select_set(False)
    for obj in scene.objects:obj.select_set(True)
    glb=DEST/'assets/port-exteriors'/f'{slug}.glb'
    bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',use_selection=True,export_extras=True,
        export_skins=True,export_animations=True,export_animation_mode='ACTIVE_ACTIONS',export_anim_single_armature=True,
        export_frame_range=False,export_anim_slide_to_zero=True,export_nla_strips_merged_animation_name='Port_Operations',
        export_force_sampling=True,export_yup=True,export_texcoords=True,export_tangents=False)
    studio(scene,typ,name)
    bpy.ops.object.select_all(action='DESELECT');bpy.context.view_layer.objects.active=rig
    blend=DEST/'art/port-exteriors/source'/f'{slug}.blend'
    scene.render.filepath='//'+slug+'.jpg';bpy.ops.wm.save_as_mainfile(filepath=str(blend),compress=True)
    if proofdir:
        folder=Path(proofdir);folder.mkdir(parents=True,exist_ok=True)
        scene.render.filepath=str(folder/(slug+'.jpg'));bpy.ops.render.render(write_still=True)
    print('PORT COMPLETE',idx,name,flush=True)

if __name__=='__main__':
    import argparse
    ap=argparse.ArgumentParser();ap.add_argument('--index',type=int,nargs='*',default=list(range(13)));ap.add_argument('--renders');ap.add_argument('--storefronts',default=str(DEST/'assets/storefronts'))
    args=ap.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
    for idx in args.index:build(idx,args.renders,args.storefronts)
