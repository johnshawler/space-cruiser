"""Render the three poses for each species, then pack their previews into a neutral copy."""
import argparse
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

sys.path.insert(0,str(Path(__file__).resolve().parent))
from verify_rig import coordinates, reset

def render_pose(scene,rig,meshes,camera,action,path):
    reset(rig)
    rig.animation_data.action=action
    scene.frame_set(1)
    graph=bpy.context.evaluated_depsgraph_get()
    points=np.concatenate([coordinates(obj.evaluated_get(graph)) for obj in meshes])
    direction=Vector((-.77,-1.,.13)).normalized()
    rotation=(-direction).to_track_quat('-Z','Y')
    camera.rotation_euler=rotation.to_euler()
    axes=np.array([list(rotation@Vector(axis)) for axis in ((1,0,0),(0,1,0),(0,0,1))])
    projected=np.einsum('ij,kj->ik',points,axes)
    lo=projected.min(0)
    hi=projected.max(0)
    camera.location=Vector(((lo+hi)*.5)@axes)+direction*5.
    camera.data.type='ORTHO'
    camera.data.ortho_scale=max(hi[1]-lo[1],(hi[0]-lo[0])*1.22)*1.075
    scene.render.resolution_x=350
    scene.render.resolution_y=427
    scene.render.resolution_percentage=100
    scene.render.film_transparent=True
    scene.render.image_settings.file_format='PNG'
    scene.render.image_settings.color_mode='RGBA'
    scene.cycles.samples=12
    scene.cycles.device='CPU'
    scene.render.filepath=str(path)
    bpy.ops.render.render(scene=scene.name,write_still=True)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--renders',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
    args.renders=args.renders.resolve()
    args.renders.mkdir(parents=True,exist_ok=True)
    source=bpy.data.filepath
    files={}
    for scene in bpy.data.scenes:
        coll=bpy.data.collections.get(scene.name+' | character')
        if not coll:continue
        bpy.context.window.scene=scene
        meshes=[obj for obj in coll.objects if obj.type=='MESH']
        rig=coll.objects[scene.name+' | Rig']
        for kind in ('Stride','Seat','Reach'):
            action=bpy.data.actions[scene.name+' | '+kind]
            path=args.renders/(scene.name+'-'+kind+'.png')
            render_pose(scene,rig,meshes,scene.camera,action,path)
            files[action.name]=str(path)
            print('POSE RENDERED',scene.name,kind,flush=True)
    # Discard all temporary poses, framing and render settings before loading previews.
    bpy.ops.wm.open_mainfile(filepath=source)
    for name,path in files.items():
        with bpy.context.temp_override(id=bpy.data.actions[name]):
            bpy.ops.ed.lib_id_load_custom_preview(filepath=path)
        assert bpy.data.actions[name].preview.image_size[0]>0,name
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(args.output.resolve()),compress=True)

if __name__=='__main__':main()
