# Long Haul model and placement guide

Long Haul lives in this repository, `johnshawler/space-cruiser`. Residents and landmark facilities stand around each port as scenery. There are no Residents or Landmarks tabs: they were removed at the player's request, and the signpost lists only the shops. The panel and camera code for meeting a resident or inspecting a facility is still in the modules, unused, if a way in is wanted later. Each of the nine planetary ports has about 55 residents and two or three facilities. The four far research stations (Listening Post Hush, Cryo Vault Rimeholm, Calibration Spire, Beacon Far Wink) each have five posted residents and one annex landmark.

**Original designs only.** Characters, facilities and props must not recreate or reference characters, logos, products or designs from films, games, brands or toys, and the definitions carry no "inspired by" titles. Tally, Nim and Orris were redesigned for this reason.

| Looking for | Start here |
| --- | --- |
| 50 base characters and 500 named variants | [Interactive character gallery](docs/character-models/index.html) |
| 10 outposts and 10 research facilities | [Interactive station gallery](docs/outposts/index.html) |
| Standalone character models | [50 GLBs](assets/characters/) · [Named residents and homeworlds](assets/characters/residents.json) |
| Standalone station models | [20 GLBs](assets/stations/models/) · [20 editable Blender scenes](assets/stations/blender/) |
| Character geometry and roles | [Character registry and builder](art/characters/src/characters.js) · [Expanded cast](art/characters/src/new-cast.js) |
| Resident names, dimensions, finishes and homeworlds | [Resident definitions](art/characters/src/residents.js) |
| Facility names and architecture | [Station definitions and layouts](art/stations/stations.mjs) · [Three.js builder](art/stations/three-stations.mjs) |
| Physical placement and camera | [Resident district](src/08f-residents.js) · [Facility-to-planet map](src/08g-station-sites.js) |
| Port scene and menus | [Venue construction](src/08b-venues.js) · [Camera](src/08-cine.js) · [Port UI](src/09-ui.js) |

## Place a model

For a named character, look up the stable resident ID in the JSON roster. For example, `obo-01` is Pip Reed. The base geometry is [obo.glb](assets/characters/obo.glb). Open the [gallery with Pip selected](docs/character-models/index.html?model=obo-01) and choose **Download GLB** to export the named finish and proportions. The gallery supports either a base ID or a resident ID. Three.js uses Y up and character feet near ground level. Hovering designs have an intentional gap. The characters are static poses.

In the game, the roster is deterministic and available as `ResidentModels.residents`. Port construction calls `ResidentDistrict.populate`; residents occupy promenade positions relative to an existing venue. Facilities are built once per surface with `StationModels.buildStation(id)`. Edit `places` in `src/08g-station-sites.js` to move a facility between ports; a research station's entry is shown as an annex. Edit `postings` in `src/08f-residents.js` to post residents to a research station: their `home` stays the same and they appear at the station instead. For example, Sloshwell hosts [Brineglass](assets/stations/blender/brineglass.blend). Its Blender collection contains separate editable architectural meshes. The Blender build converts the Three.js coordinates to Blender's Z-up convention.

The existing `src/species/` registry and `Folk.make` supply animated crew, passengers and job givers. A new resident's mesh and name already appear through the port district. To give one dialogue or a mission, look it up by its persistent resident ID in the encounter code. To animate a resident as crew, give that design an appropriate rig or motion adapter before registering it with the crew system.

## Build and review

From the repository root run `bash build.sh`. It regenerates `index.html` and `long-haul.html`. The production game uses Three.js r128. [The game bundler](tools/bundle-residents.sh) adapts the shared constructors to that version, so visiting a port does not require loading external GLBs. Character geometry is built on approach or selection and batched into one vertex-coloured mesh per individual. The independent gallery uses Three.js 0.187.0 and exports the full-detail masters.

To regenerate the interactive galleries and roster, run `npm install` followed by `npm run build` in `art/characters/`. To rebuild editable station scenes after changing a layout, run the following from the repository root with Blender 4.5 installed.

```sh
node art/stations/write-recipes.mjs
blender -b --python art/stations/build-blender.py -- "$PWD"
```

The generator verifies the mesh count of each saved scene by reopening its Blender library. To review the game, serve the repository root over HTTP, open `index.html`, dock at a port, then select a resident and a landmark. For offline model review, open either gallery's HTML directly. The Blender download buttons resolve against the adjacent repository asset folders.

## Keep clear of the game's economy

Residents and landmarks are scenery and camera targets only. Jobs, risk, fuel, deep-space events and docking key on the `station` flag in `PLANETS` and on distance from the sun, never on these modules. Don't add the research stations to `homeworlds`, and keep `PLANETS` in its order: saves store planet indices.

## The animated cast plays every alien

The 50 designs are animated species in `src/species/<id>.js` (marked `cast:true`). `CAST_FOR` in `src/01-data.js` maps each of the 30 earlier species keys to the design that now plays it, by replacing `SPECIES[oldKey]` with the design's entry. Keep using the old keys in data (planets, venues, customs, lost property, saves): they resolve to the new models, names, voices and lines. The 20 designs not in `CAST_FOR` are added to `ALIEN_POOL`. Residents are built with `Folk.make(base, seed)` in `src/08f-residents.js`.
