"""Render identically framed portraits and pack the 48 expression thumbnails into a neutral master."""
import argparse
from pathlib import Path
import sys

import bpy
import numpy as np
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).resolve().parent))
from expression_rig import CONTROL, MOODS, PERFORMANCE, Face, key, points

def apply_action(scene,rig,mood):
    rig.animation_data.action=None
    for prop in MOODS:rig.pose.bones[CONTROL][prop]=0.
    if mood:
        rig.animation_data.action=bpy.data.actions[scene.name+' | '+mood]
        scene.frame_set(1)
    rig.update_tag()
    bpy.context.view_layer.update()

def portraits(scene,directory,samples):
    model=Face(scene);rig=model.rig
    face_meshes=[o for o in model.meshes if model.facial_mesh(o) and not key(o).startswith('Neck') and key(o)!='Fluted gular rib']
    camera=scene.camera
    direction=Vector((-.035,-1,.045)).normalized()
    rot=(-direction).to_track_quat('-Z','Y')
    axes=np.array([list(rot@Vector(v)) for v in ((1,0,0),(0,1,0),(0,0,1))])
    graph=bpy.context.evaluated_depsgraph_get()
    bounds=[]
    for mood in (None,*MOODS):
        apply_action(scene,rig,mood)
        coords=np.concatenate([points(o.evaluated_get(graph)) for o in face_meshes])
        projected=np.einsum('ij,kj->ik',coords,axes)
        bounds.extend([projected.min(0),projected.max(0)])
    lo,hi=np.min(bounds,0),np.max(bounds,0)
    lo[1]-=model.height*.16;hi[1]+=model.height*.045
    center=(hi+lo)*.5
    camera.location=Vector(center@axes)+direction*5.
    camera.rotation_euler=rot.to_euler();camera.data.type='ORTHO'
    aspect=1.18
    camera.data.ortho_scale=max((hi[0]-lo[0])*1.055,(hi[1]-lo[1])*aspect*1.035)
    scene.render.resolution_x=472;scene.render.resolution_y=400
    scene.render.resolution_percentage=100
    scene.render.film_transparent=True
    scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
    scene.cycles.samples=samples;scene.cycles.device='CPU'
    files={}
    for mood in (None,*MOODS):
        apply_action(scene,rig,mood)
        p=directory/(scene.name+'-'+(mood or 'Neutral')+'.png')
        scene.render.filepath=str(p)
        bpy.ops.render.render(scene=scene.name,write_still=True)
        if mood:files[scene.name+' | '+mood]=str(p)
        print('PORTRAIT',scene.name,mood or 'Neutral',flush=True)
    return files

def main():
    par=argparse.ArgumentParser()
    par.add_argument('--renders',type=Path,required=True);par.add_argument('--output',type=Path,required=True)
    par.add_argument('--pack-existing',action='store_true',help='Pack existing portraits rendered from the same facial shapes and camera settings')
    par.add_argument('--only',nargs='*');par.add_argument('--samples',type=int,default=18)
    args=par.parse_args(sys.argv[sys.argv.index('--')+1:])
    source=bpy.data.filepath;directory=args.renders.resolve();directory.mkdir(parents=True,exist_ok=True)
    files={}
    for name in PERFORMANCE:
        if args.only and name not in args.only:continue
        if args.pack_existing:
            for mood in MOODS:
                path=directory/(name+'-'+mood+'.png')
                if not path.is_file():raise FileNotFoundError(path)
                files[name+' | '+mood]=str(path)
        else:
            files.update(portraits(bpy.data.scenes[name],directory,args.samples))
    bpy.ops.wm.open_mainfile(filepath=source)
    for name,path in files.items():
        action=bpy.data.actions[name]
        with bpy.context.temp_override(id=action):bpy.ops.ed.lib_id_load_custom_preview(filepath=path)
        assert action.preview.image_size[0]>0,name
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(args.output.resolve()),compress=True)

if __name__=='__main__':main()
