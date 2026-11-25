# Lighting the models in Long Haul

The native Blender scenes open with Cycles lighting and a saved camera. Switch the render engine to Eevee to preview the screen-tracing configuration. A GLB carries geometry, texture images, materials and named attachment points. Camera passes, light probes and the enclosing atmosphere belong to the active scene.

## Lighting

1. On room entry, instantiate the lights at the exported markers and run the existing static room bake for diffuse bounce and ambient occlusion. Keep crew, instruments, sliding doors, goods and passengers out of the static bake.
2. Set the exported HDR environment on the scene. Capture a local reflection and diffuse probe after staging the room. Apply the captured lighting to incoming characters. The finish adapter captures a cubemap, computes spherical harmonics for diffuse light and filters the captured image for glossy reflections.
3. Enable PCF soft shadows on the principal light and shadow reception on the stage. The cast retains its contact patches. Choose the beam origin and direction from a real window or fixture. The adapter integrates light along the view ray up to the first visible surface.
4. Keep the exported emissive faces on screens, lamps and indicators. Their bright pixels feed bloom.

## Materials

The GLBs embed base colour, roughness and normal maps. Use the exported values when loading the models. Leave optical parts and moving equipment separate. The cast’s normal and roughness maps encode guard hairs, feather barbs, pores, scales, brushed alloys, dents and fabric weave. Blender scenes apply subsurface scattering to thin living tissue and sheen to fibres. The real-time cast uses a wrapped-light approximation for transmissive tissue.

## Camera and environment

The high-quality adapter uses Three r128’s SSRPass and ray-marches reflections against the current camera’s depth and normal buffers. Select the floor and intended smooth glazing as reflectors. The capture remains available where a reflection leaves the frame. Transparent panes need a depth-writing reflection proxy if the live glass replacement suppresses depth writes.

The camera pass uses shallow depth of field, camera motion vectors, bloom, ACES, a 16³ colour LUT, vignette, grain and FXAA. The LUT uses horizontal blue slices in a 256 × 16 texture. The packaged HDR files hold sky and horizon illumination. The ray-marched light shaft and distance fog are evaluated in the active scene. Set the fog density and beam position per location. In the cockpit, run the pass on the composited world-and-cabin scene or render the cabin against its exterior background to preserve the view through the windshield.

The shared adapter lives at `art/scene-finish.js`. The cast gallery installs it in its high-quality stage. Room and cockpit loading belongs to the game integration handoff. To use it with a separately rendered scene, load the r128 EffectComposer, CopyShader, ShaderPass, LuminosityHighPassShader, UnrealBloomPass, FXAAShader, SSRShader, SSRPass and LightProbeGenerator examples. Set the HDR environment before creating the adapter. Render the interface afterwards so instrument text stays crisp.

```js
const grade = await new THREE.TextureLoader().loadAsync(gradeURL);
const finish = BespokeFinish.create(renderer, scene, camera, {
  reflectors: [floor, ...reflectiveGlass],
  probePosition: new THREE.Vector3(...probePosition),
  lut: grade,
  focus: focusDistance,
  haze: skyColor,
  density: 0.012,
  rayOrigin: windowPosition,
  rayDirection: beamDirection
});
finish?.setSize(viewWidth, viewHeight);
// In the existing render loop, using seconds since start
if (finish) finish.render(elapsed);
else renderer.render(scene, camera);
// When leaving this room
finish?.dispose();
grade.dispose();
```
