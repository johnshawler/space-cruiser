# Sixteen humanoid species for Long Haul

Open the master in Blender 4.5 LTS and choose a species in the Scene selector. Each scene contains one rigged character collection marked as an asset, three studio cameras and packed materials. The file opens with all sixteen rigs in their original neutral positions.

[Blender master](../art/characters/humanoid-species/Long-Haul-Humanoid-Species.blend) · [Expression sheet](../art/characters/humanoid-species/proofs/Long-Haul-Humanoid-Expression-Sheet.jpg) · [Rig pose sheet](../art/characters/humanoid-species/proofs/Long-Haul-Species-Rig-Poses.jpg) · [Original concept](../art/characters/humanoid-species/reference/Original-concept.png) · [Original front proof](../art/characters/humanoid-species/proofs/Long-Haul-Species-Front.jpg) · [Original turnaround proof](../art/characters/humanoid-species/proofs/Long-Haul-Species-Turnarounds.jpg) · [Species catalog and individual renders](../art/characters/humanoid-species/catalog.json)

## Cast

| Row | Species in proof-sheet order |
| --- | --- |
| 1 | Taluun, Orrek, Vessari, Mothren |
| 2 | Ureth, Keld, Sovai, Brunn |
| 3 | Pelrin, Zhavet, Koruun, Eskel |
| 4 | Rhovi, Nemeya, Dathri, Ulnor |

## Posing a species

1. Select the object named for the species, such as **Taluun | Rig**, and enter Pose Mode. Rotate the spine, arm or leg bones for forward kinematics. Use **Root** to move the whole character and **Pelvis** to move the body relative to the limb targets. The source uses metres, Z-up, with the character facing negative Y. Left and right refer to the character.
2. To plant a foot or position a hand, show **IK** under Armature Data Properties → Bone Collections. In Object Properties → Custom Properties, set the corresponding switch to **1**. There are four independent switches named `IK_Arm_L`, `IK_Arm_R`, `IK_Leg_L` and `IK_Leg_R`. Move or rotate the box named `IK.Hand.L` or `IK.Foot.L` (or its right-side counterpart). Move the diamond pole to aim the elbow or knee. At **0**, the limb uses forward kinematics. When switching during animation, align the two sets of controls first and key the switch.
3. Show the **Fingers**, **Face** or **Species** bone collection for fine posing. The controls follow the sculpt. Taluun’s eyes ride their stalks. Pelrin has two ear pivots. Dathri has a hinged right pincer. Mothren’s combs follow its antennae. Rhovi and Ulnor have a curl control for each solid palm. Separate modeled fingers have two joints each.
4. For a starting pose, open the Asset Browser, select **Current File**, and find the species name. Select its rig in Pose Mode, set all four IK switches to **0**, select the pose bones to affect, and apply **Stride**, **Seat** or **Reach**. Each asset is a single pose with its own rendered thumbnail. Clear the transforms with Alt-G, Alt-R and Alt-S if you want to return to neutral after applying a pose.

## Facial expressions

Each species has **Happy**, **Bored** and **Sad** pose assets with portrait thumbnails. In Pose Mode, select the **Expression** bone in the **Expressions** bone collection. In the Asset Browser, choose **Current File** and apply the species’ expression. Its three intensity values are also available under **Bone Properties → Custom Properties**. Set all three to zero for neutral. Hover over a slider and press **I** to key its value. When mixing above a combined intensity of one, the rig scales the contributions proportionally.

Expressions animate the face and head independently of the body. Apply the body pose first, then the expression, or adjust the sliders during a walk or a seated shot. Taluun’s eyestalks rise for Happy and droop for Sad. Pelrin changes its ear carriage, Brunn draws the corners of its muzzle, and Nemeya lifts or contracts the rim of its bell. The bored poses use asymmetric posture and, where the sculpt has eyes, a partly closed upper lid.

## Using the source in the game

Append the species' character collection to retain the armature, meshes, weights, constraints and materials. Append the three body actions and three facial expression actions separately to use their presets in another Blender file. The [catalog](../art/characters/humanoid-species/catalog.json) records scene, collection, rig, action names, dimensions and polygon counts for all sixteen species.

For a game export, duplicate the collection and preserve the bone names and skin weights as you reduce geometry and draw calls. Bake the Blender materials to game textures. The registered concept pigmentation blends with procedural skin, cloth and metal, and masked areas reveal the underlying fabric as a limb moves. For IK-driven motion, bake the evaluated deform-bone transforms to sampled animation before export. The three starting poses can be used to author walking, seated and gesture clips. For expressions, retain the Happy, Bored and Sad morph targets, sample the driven head offset into the head animation, and recreate the eye-aperture shader or bake its appearances. The iris coverage and local eyelid pigmentation are Blender material effects. The authoring controls use ordinary pose-bone custom properties. Runtime registration and animation playback are separate integration work.

The original reference provides one angle per species. The three-dimensional anatomy on the sides and back was interpreted for the Blender master. The reference, profile and rear three-quarter cameras remain available for comparison.

## Verification

The reopened rigged file contains 16 armatures, 876 bones and 1,397 character meshes with 994,132 weighted vertices and 1,045,126 faces. Each vertex has one to four normalized deform-bone weights. Verification measures neutral positions, moves each of the 64 IK targets, individually rotates all 364 finger, face and species controls, and applies all 48 saved body poses. The pose proof was rendered with the rigs driving the meshes. The original sculpt checks also covered closed mesh edges, zero-area faces, packed textures and contact between parts in neutral.

Blender reopened the delivery master and applied each of the 48 facial expression assets over Stride, Seat and Reach, exercising 144 combinations. Verification checked the selected expression’s exact slider values, the driven eyelids and morph targets, the body mesh positions, a partial blend, a full-strength three-way blend, and return to neutral.

[Per-file digests](../art/characters/humanoid-species/SHA256SUMS)

## Rebuilding the editable source

From the species directory, use Python with Pillow and NumPy, and Blender 4.5 on the executable path. The first five commands build the static sculpt. The remaining commands fit the rigs, render the 48 pose previews, pack the previews into a neutral copy, and verify that copy. The final three commands add the facial rigs, render their thumbnails and check expression layering.

```sh
python3 authoring/maketex.py
python3 authoring/surfaces.py
blender -b --factory-startup --python-exit-code 1 -P authoring/engine.py
blender -b authoring/Rebuilt-Humanoid-Species.blend --python-exit-code 1 -P authoring/seat.py
blender -b authoring/Rebuilt-Humanoid-Species.blend --python-exit-code 1 -P authoring/profile_sculpt.py
blender -b authoring/Rebuilt-Humanoid-Species.blend --python-exit-code 1 -P authoring/rig_species.py -- --output authoring/Rigged.blend
blender -b authoring/Rigged.blend --python-exit-code 1 -P authoring/publish_poses.py -- --renders authoring/pose-renders --output authoring/Rebuilt-Rigged-Humanoid-Species.blend
blender -b authoring/Rebuilt-Rigged-Humanoid-Species.blend --python-exit-code 1 -P authoring/verify_rig.py -- --report authoring/rig-verification.json --require-previews
blender -b authoring/Rebuilt-Rigged-Humanoid-Species.blend --python-exit-code 1 -P authoring/expression_rig.py -- --output authoring/Expression-Rigs.blend
blender -b authoring/Expression-Rigs.blend --python-exit-code 1 -P authoring/expression_proofs.py -- --renders authoring/expression-renders --output authoring/Rebuilt-Humanoid-Expressions.blend
blender -b authoring/Rebuilt-Humanoid-Expressions.blend --python-exit-code 1 -P authoring/verify_expressions.py -- --report authoring/expression-verification.json
```
