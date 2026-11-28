# Long Haul port exteriors

The nine planetary ports and four remote stations are modeled at the scale of the game's landing pad. Each Blender 4.5 LTS scene opens with a review camera, packed surface maps, and its own machinery armature. Press Space to preview the action. The game exports contain the model, bones, animation and textures in one GLB per destination.

[Model proof sheet](Port-Model-Proof.jpg) · [Machinery in motion](Port-Machinery.mp4) · [Original concept sheet](Port-Concept.png) · [Runtime manifest](../../assets/port-exteriors/manifest.json)

## Models

| Port | World or station | Working machinery | Files |
| --- | --- | --- | --- |
| Vendorhaven | Verdanthia | Clock sweep, Clock pendulum | [Blender](../../art/port-exteriors/source/verdanthia.blend) · [GLB](../../assets/port-exteriors/verdanthia.glb) |
| Port Gneiss | Scorchmaw | Ore slew, Ore hoist | [Blender](../../art/port-exteriors/source/scorchmaw.blend) · [GLB](../../assets/port-exteriors/scorchmaw.glb) |
| Bureau Nine | Dunemoor | Gate west, Gate east | [Blender](../../art/port-exteriors/source/dunemoor.blend) · [GLB](../../assets/port-exteriors/dunemoor.glb) |
| Ladle Harbor | Sloshwell | Ladle slew, Ladle hoist | [Blender](../../art/port-exteriors/source/sloshwell.blend) · [GLB](../../assets/port-exteriors/sloshwell.glb) |
| Bargain Roost | Amethyne | Perch slew, Perch hoist | [Blender](../../art/port-exteriors/source/amethyne.blend) · [GLB](../../assets/port-exteriors/amethyne.glb) |
| Mellow Hollow | Toxibloom | Harvest basket, Counterweight | [Blender](../../art/port-exteriors/source/toxibloom.blend) · [GLB](../../assets/port-exteriors/toxibloom.glb) |
| Port Lament | Candara | West windvane, East windvane | [Blender](../../art/port-exteriors/source/candara.blend) · [GLB](../../assets/port-exteriors/candara.glb) |
| The Drift | Jovexa | Trim impeller port, Trim impeller starboard | [Blender](../../art/port-exteriors/source/jovexa.blend) · [GLB](../../assets/port-exteriors/jovexa.glb) |
| Fort Snuggle | Brrrindle | Blanket trolley, Weather rotor | [Blender](../../art/port-exteriors/source/brrrindle.blend) · [GLB](../../assets/port-exteriors/brrrindle.glb) |
| The Quiet Ear | Listening Post Hush | Antenna azimuth, Dish elevation | [Blender](../../art/port-exteriors/source/listening-post-hush.blend) · [GLB](../../assets/port-exteriors/listening-post-hush.glb) |
| The Freezer Aisle | Cryo Vault Rimeholm | Pressure door A, Pressure door B, Sample rack | [Blender](../../art/port-exteriors/source/cryo-vault-rimeholm.blend) · [GLB](../../assets/port-exteriors/cryo-vault-rimeholm.glb) |
| Tolerance Station | Calibration Spire | Azimuth circle, Meridian circle, Survey alidade | [Blender](../../art/port-exteriors/source/calibration-spire.blend) · [GLB](../../assets/port-exteriors/calibration-spire.glb) |
| The Last Light | Beacon Far Wink | Lantern carriage, Semaphore | [Blender](../../art/port-exteriors/source/beacon-far-wink.blend) · [GLB](../../assets/port-exteriors/beacon-far-wink.glb) |

## Integration for Claude

These are exterior landing districts for the surface cutscene. The port index matches `PLANETS` in `src/01-data.js`. Use one asset per surface, keyed by planet or station name. The editable Blender files use Z up. The GLBs use Three.js Y up in metres. The asset root is `PortExterior`, with `landing_center` at (0, 0, 0), `approach_axis` at (0, 0, 80), and `freight_quay` at (71.5, 0, −37). The central landing disc is 100 m across. The backdrop belongs on the negative-Z side of the pad.

1. Load the destination GLB from `Cine.buildSurface(P)` using `Assets.glb` in `src/02b-assets.js`. A completed fetch may arrive after departure. Check that its surface is still active before attaching it. Keep the procedural surface available during the fetch and on failure.
2. Place the art at the ship pad's centre at unit scale. Choose a single visible central disc. To retain the game's painted port glyph, hide the model's pad assembly (its object name begins with `Pad`) and use the procedural disc. Keep the perimeter lights. Test the terrain, station deck, procedural control tower, parked ships and nearby pads for overlaps in the landing and takeoff cameras. The western wharf storefront is an exterior scenery mesh. The existing interactive shops, residents, shop coordinates and UI continue to use their own systems.
3. The loader exposes clips as `scene.userData.clips`. Each export has one eight-second action, `Port_Operations`. Bind one `THREE.AnimationMixer` to the complete model and advance it with the surface delta time. For multiple simultaneous copies, use a skeleton-aware clone. Stop and uncache the mixer when its surface leaves memory. Keep the moving meshes out of the static lighting bake.
4. A source review camera and studio lights are included in each Blender file. In-game lighting comes from the port scene. The four 256 px maps are embedded. The manifest records transfer size, render primitive count and triangle count for each port. Test the largest asset, Mellow Hollow, on the game's Balanced setting.

The exports were decoded with Three.js r128 and its GLTFLoader. All 28 animated joints carry rigidly weighted mesh geometry. Ten sample times per clip were used to check joint movement and loop closure. Above 0.5 m deck height, the closest sampled hardware vertex was 51.63 m from the pad centre across eight poses for each destination. This check covers the supplied art. A live docking and departure playtest with the procedural scene is the next integration check.

## Rebuild the assets

Run from the repository root with Blender 4.5 LTS. The builder uses existing storefronts in `assets/storefronts` for the west-quay scenery. Omit `--index` to build all 13. The optional render directory receives one overview per port.

```sh
blender -b --factory-startup --python-exit-code 1 -P art/port-exteriors/build.py -- --index 9 --renders /tmp/long-haul-port-renders
```

The authored plate coordinates are converted to metres in `meshkit.py`. Landmark shapes and mechanical pivots are in `planet_ports.py` and `station_ports.py`. The neutral albedo and normal maps under `art/port-exteriors/maps` can be regenerated using `surface_maps.py` with Pillow and NumPy.
