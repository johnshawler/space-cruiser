"""Render street-level views from the individually saved Blender shop projects."""
import json
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def area_light(scene, name, location, target, power, size, color):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = power
    data.shape = 'DISK'
    data.size = size
    data.color = color
    light = bpy.data.objects.new(name, data)
    scene.collection.objects.link(light)
    light.location = location
    light.rotation_euler = (Vector(target) - light.location).to_track_quat('-Z', 'Y').to_euler()


def photograph(repo, folder, filename, detail=False):
    source = repo / 'art/storefronts/models' / filename.with_suffix('.blend')
    bpy.ops.wm.open_mainfile(filepath=str(source))
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 16
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 5
    scene.render.resolution_x = 900
    scene.render.resolution_y = 515
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Medium High Contrast'
    scene.world = bpy.data.worlds.new('Port skylight')
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get('Background')
    background.inputs[0].default_value = (.37, .48, .54, 1)
    background.inputs[1].default_value = .18
    area_light(scene, 'Daylight through the open loading apron', (-4,-6,7), (0,5,1), 1780, 6.5, (.81,.91,1))
    area_light(scene, 'Warm service light behind counter', (3.3,4.8,5.3), (1,4,1.1), 560, 2.7, (1,.71,.45))
    area_light(scene, 'Rear workbench lighting', (-1.5,11,5.0), (0,16,1.5), 1450, 4.3, (1,.83,.63))
    area_light(scene, 'Skylight return', (4.5,12.5,6.9), (2,9.5,1.9), 880, 3.2, (.67,.83,1))

    # Keep the lens and target constant so the public work area is comparable across trades.
    bpy.ops.object.camera_add()
    camera = bpy.context.object
    scene.camera = camera
    camera.location = (-2.55, -9.8, 3.32)
    camera.rotation_euler = (Vector((.45, 7.1, 2.75)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.lens = 23.8
    camera.data.clip_end = 100
    if detail:
        # Step inside the public bay so the register and depot shelves do not mask the display.
        if filename.stem.endswith('-depot'):
            target = (-6.05, 4.28, 1.72)
            camera.location = (-2.95, 1.64, 2.25)
        else:
            target = (-4.68, 4.30, 1.80)
            camera.location = (-2.38, -.58, 2.58)
        camera.rotation_euler = (Vector(target)-camera.location).to_track_quat('-Z', 'Y').to_euler()
        camera.data.lens = 29.5
        scene.render.resolution_x = 435
    scene.render.image_settings.file_format = 'JPEG'
    scene.render.image_settings.quality = 93
    scene.render.filepath = str(folder / filename.with_suffix('.jpg'))
    bpy.ops.render.render(write_still=True)


if __name__ == '__main__':
    args = sys.argv[sys.argv.index('--') + 1:]
    repo, folder = (Path(path).resolve() for path in args[:2])
    folder.mkdir(parents=True, exist_ok=True)
    detail = '--details' in args[2:]
    filenames = [item for item in args[2:] if item != '--details']
    if not filenames:
        manifest = json.loads((repo / 'assets/storefronts/manifest.json').read_text())
        filenames = [shop['file'] for shops in manifest['venues'].values() for shop in shops.values()
                     if any(light.get('name') == 'port_sconce_left' for light in shop.get('lights', []))]
    for filename in filenames:
        photograph(repo, folder, Path(filename), detail=detail)
