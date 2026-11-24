# Long Haul model and placement guide

Long Haul lives in this repository, `johnshawler/space-cruiser`. Dock at any planet and open **Residents** to meet someone or **Stations** to inspect a facility. Both views move the port camera to the selected object's physical location. Each of the nine ports has 55 or 56 residents and two or three facilities.

| Looking for | Start here |
| --- | --- |
| 50 base characters and 500 named variants | [Interactive character gallery](docs/character-models/index.html) · [50-design proof sheet](docs/character-models/proof-sheet.pdf) |
| 10 outposts and 10 research stations | [Interactive station gallery](docs/outposts/index.html) · [20-design proof sheet](docs/outposts/proof-sheet.pdf) |
| Standalone character models | [50 GLBs](assets/characters/) · [Named residents and homeworlds](assets/characters/residents.json) |
| Standalone station models | [20 GLBs](assets/stations/models/) · [20 editable Blender scenes](assets/stations/blender/) |
| Character geometry, roles and media influences | [Character registry and builder](art/characters/src/characters.js) · [Expanded cast](art/characters/src/new-cast.js) |
| Resident names, dimensions, finishes and homeworlds | [Resident definitions](art/characters/src/residents.js) |
| Facility names, media influences and architecture | [Station definitions and layouts](art/stations/stations.mjs) · [Three.js builder](art/stations/three-stations.mjs) |
| Physical placement and camera | [Resident district](src/08f-residents.js) · [Facility-to-planet map](src/08g-station-sites.js) |
| Port scene and menus | [Venue construction](src/08b-venues.js) · [Camera](src/08-cine.js) · [Port UI](src/09-ui.js) |

## Place a model

For a named character, look up the stable resident ID in the JSON roster. For example, `obo-01` is Pip Reed. The base geometry is [obo.glb](assets/characters/obo.glb). Open the [gallery with Pip selected](docs/character-models/index.html?model=obo-01) and choose **Download GLB** to export the named finish and proportions. The gallery supports either a base ID or a resident ID. Three.js uses Y up and character feet near ground level. Hovering designs have an intentional gap. The characters are static poses.

In the game, the roster is deterministic and available as `ResidentModels.residents`. Port construction calls `ResidentDistrict.populate`; residents occupy promenade positions relative to an existing venue. Facilities are built once per surface with `StationModels.buildStation(id)`. Edit `places` in `src/08g-station-sites.js` to move a facility between planets. For example, Sloshwell hosts [Brineglass](assets/stations/blender/brineglass.blend). Its Blender collection contains separate editable architectural meshes. The Blender build converts the Three.js coordinates to Blender's Z-up convention.

The existing `src/species/` registry and `Folk.make` supply animated crew, passengers and job givers. A new resident's mesh and name already appear through the port district. To give one dialogue or a mission, look it up by its persistent resident ID in the encounter code. To animate a resident as crew, give that design an appropriate rig or motion adapter before registering it with the crew system.

## Build and review

From the repository root run `bash build.sh`. It regenerates `index.html` and `long-haul.html`. The production game uses Three.js r128. [The game bundler](tools/bundle-residents.sh) adapts the shared constructors to that version, so visiting a port does not require loading external GLBs. Character geometry is built on approach or selection and batched into one vertex-coloured mesh per individual. The independent gallery uses Three.js 0.187.0 and exports the full-detail masters.

To regenerate the interactive galleries and roster, run `npm install` followed by `npm run build` in `art/characters/`. To rebuild editable station scenes after changing a layout, run the following from the repository root with Blender 4.5 installed.

```sh
node art/stations/write-recipes.mjs
blender -b --python art/stations/build-blender.py -- "$PWD"
```

The generator verifies the mesh count of each saved scene by reopening its Blender library. To review the game, serve the repository root over HTTP, open `index.html`, dock at a port, then select a resident and a station. For offline model review, open either gallery's HTML directly. The Blender download buttons resolve against the adjacent repository asset folders.
