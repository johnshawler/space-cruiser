# Original robot species

The [gallery project](../../../art/characters/blender/robot-species/Robot-Species.blend) contains all 16 rigged robots from the [original concept sheet](Original-Robot-Species-Concept.png). The [portable collection](../../../art/characters/blender/robot-species/Robot-Species-Blender-Collection.zip) includes the gallery, 16 standalone projects, 32 still renders, two proof sheets and the motion preview.

[Motion preview](Robot-Species-Motion.mp4) · [Front proof](Robot-Species-Model-Proof.jpg) · [Reverse proof](Robot-Species-Reverse-Proof.jpg) · [Dimensions and rig inventory](../../../art/characters/blender/robot-species/inventory.json)

## Pose and play in Blender 4.5 LTS

Open a standalone file to start in Pose Mode with the mechanical armature selected. Frame 0 shows the original design pose. Select a joint to rotate its attached parts. Move the assembly origin to position the entire robot. In the gallery, choose the numbered species scene to reach the same armature.

Press Space to play **Travel**. Each robot has three Actions named `<Species>.Idle`, `<Species>.Travel`, and `<Species>.Operate`. In the NLA Editor, enable the desired track and mute the other two. Frames 1–48 play one two-second cycle at 24 fps. Frame 49 repeats the opening pose and sits outside the playback range. All travel clips run in place so the game can drive world movement.

## Handoff to Claude

Use the species collection and its `<Species> | Rig` armature as the authoring source. Preserve each part’s bone parent, and evaluate the hooks on the flexible leads and the vertex groups on Nautil’s skirt when baking an export. The studio camera, lighting and floor belong to the portrait setup. The three native Actions live on each armature’s NLA tracks. Activate each track by itself when baking it for the game.

The 16 rigs contain 324 bones and retain all 4,344 editable parts and 1,035,230 evaluated source triangles. In Blender, all 48 clips closed at their loop seams, all 16 standalone files reopened in Pose Mode, and sampled mesh positions in the rest pose matched the original sculptures to within 0.000001 Blender units. A separate check evaluated the lowest point of the actual geometry at every integer frame of every Action, including the tread shoes, soles, flexible skirt and hover fins. The front and reverse proofs show the design pose. The reverse surfaces and dimensions are interpretations of the single concept view.

Cairn is the tracked geothermal robot in this collection. The existing cast owns the game identifier `cairn`. Use a distinct identifier such as `robot-cairn` when registering this species. Preserve Prismwake’s hover clearance when setting its origin.

## Models and actions

| Species project | Bones | Travel | Operate | Views |
| --- | ---: | --- | --- | --- |
| [Bellwrought.blend](../../../art/characters/blender/robot-species/models/Bellwrought.blend) | 13 | Tripod walk | Swing the outer hammer and inner clapper | [Front](renders/front/Bellwrought.jpg) · [Reverse](renders/reverse/Bellwrought.jpg) |
| [Selvedge.blend](../../../art/characters/blender/robot-species/models/Selvedge.blend) | 14 | Alternating treadle steps | Throw the shuttle between the bobbins | [Front](renders/front/Selvedge.jpg) · [Reverse](renders/reverse/Selvedge.jpg) |
| [Gimbal.blend](../../../art/characters/blender/robot-species/models/Gimbal.blend) | 6 | Single-wheel roll | Precess the rings and spin the flywheel | [Front](renders/front/Gimbal.jpg) · [Reverse](renders/reverse/Gimbal.jpg) |
| [Mudlark.blend](../../../art/characters/blender/robot-species/models/Mudlark.blend) | 16 | Alternating ski strokes | Tip the sampling screen on its boom | [Front](renders/front/Mudlark.jpg) · [Reverse](renders/reverse/Mudlark.jpg) |
| [Folio.blend](../../../art/characters/blender/robot-species/models/Folio.blend) | 15 | Bookbinder’s walk | Open the covers and reach with the page-turning hands | [Front](renders/front/Folio.jpg) · [Reverse](renders/reverse/Folio.jpg) |
| [Spoolback.blend](../../../art/characters/blender/robot-species/models/Spoolback.blend) | 17 | Four-legged cable-tender walk | Reel the drums in opposite directions | [Front](renders/front/Spoolback.jpg) · [Reverse](renders/reverse/Spoolback.jpg) |
| [Lamplume.blend](../../../art/characters/blender/robot-species/models/Lamplume.blend) | 22 | High wading steps | Fan thirteen glass vanes and dip the beak | [Front](renders/front/Lamplume.jpg) · [Reverse](renders/reverse/Lamplume.jpg) |
| [Cairn.blend](../../../art/characters/blender/robot-species/models/Cairn.blend) | 103 | Circulating track shoes and road wheels | Open the gaps between the thermal shields | [Front](renders/front/Cairn.jpg) · [Reverse](renders/reverse/Cairn.jpg) |
| [Latchling.blend](../../../art/characters/blender/robot-species/models/Latchling.blend) | 20 | Three planted pads alternate while the raised pad probes | Curl the segmented tail probe | [Front](renders/front/Latchling.jpg) · [Reverse](renders/reverse/Latchling.jpg) |
| [Velour.blend](../../../art/characters/blender/robot-species/models/Velour.blend) | 14 | Short, cloaked steps | Turn the listening horn and adjust the cloak | [Front](renders/front/Velour.jpg) · [Reverse](renders/reverse/Velour.jpg) |
| [Nautil.blend](../../../art/characters/blender/robot-species/models/Nautil.blend) | 10 | Six pedal zones contract around the traction skirt | Extend the periscope and pan the rangefinder | [Front](renders/front/Nautil.jpg) · [Reverse](renders/reverse/Nautil.jpg) |
| [Trestle.blend](../../../art/characters/blender/robot-species/models/Trestle.blend) | 16 | Four-legged gantry walk | Traverse the trolley and open its jaws | [Front](renders/front/Trestle.jpg) · [Reverse](renders/reverse/Trestle.jpg) |
| [Prismwake.blend](../../../art/characters/blender/robot-species/models/Prismwake.blend) | 5 | Hover with independent trim vanes | Adjust the foils and turn the dispersion optics | [Front](renders/front/Prismwake.jpg) · [Reverse](renders/reverse/Prismwake.jpg) |
| [Millipress.blend](../../../art/characters/blender/robot-species/models/Millipress.blend) | 27 | Five linked carriages roll through a bend | Turn the ink cylinder as the carriages articulate | [Front](renders/front/Millipress.jpg) · [Reverse](renders/reverse/Millipress.jpg) |
| [Basaltine.blend](../../../art/characters/blender/robot-species/models/Basaltine.blend) | 13 | Short foundry steps | Raise and lower the insulated gauntlets | [Front](renders/front/Basaltine.jpg) · [Reverse](renders/reverse/Basaltine.jpg) |
| [Thimble.blend](../../../art/characters/blender/robot-species/models/Thimble.blend) | 13 | Two-footed spring hop | Unfold the manipulators under the brim | [Front](renders/front/Thimble.jpg) · [Reverse](renders/reverse/Thimble.jpg) |
