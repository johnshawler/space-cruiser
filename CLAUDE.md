# Long Haul model and placement guide

Long Haul lives in this repository, `johnshawler/space-cruiser`. Residents and landmark facilities stand around each port as scenery. There are no Residents or Landmarks tabs: they were removed at the player's request, and the signpost lists only the shops. The panel and camera code for meeting a resident or inspecting a facility is still in the modules, unused, if a way in is wanted later. Each of the nine planetary ports has about 55 residents and two or three facilities. The four far research stations (Listening Post Hush, Cryo Vault Rimeholm, Calibration Spire, Beacon Far Wink) each have five posted residents and one annex landmark.

**Original designs only.** Characters, facilities and props must not recreate or reference characters, logos, products or designs from films, games, brands or toys, and the definitions carry no "inspired by" titles. Tally, Nim and Orris were redesigned for this reason.

| Looking for | Start here |
| --- | --- |
| 50 base characters and 500 named variants | [Interactive character gallery](docs/character-models/index.html) |
| 10 outposts and 10 research facilities | [Interactive station gallery](docs/outposts/index.html) |
| Standalone character models | [50 GLBs](assets/characters/) · [Named residents and homeworlds](assets/characters/residents.json) |
| Standalone station models | [20 GLBs](assets/stations/models/) · [20 editable Blender scenes](assets/stations/blender/) |
| Original robot species (16 rigged Blender masters) | [Rig handoff, animations, proof sheets and individual files](docs/character-models/robot-species/README.md) |
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

## The Blender characters play every design

The 32 Codex characters (16 humanoids, 16 robots) are the look of everyone in the game. Each is one skinned mesh with baked picture maps in `assets/characters/species/<id>.glb`, listed in `assets/characters/species/manifest.json` (embedded by `build.sh` as `ASSET_MANIFESTS.species`). `MODEL_FOR` in `src/01-data.js` maps each of the 50 cast designs to the model that plays it; the 30 earlier species keys follow through `CAST_FOR`. Keys, voices and lines are unchanged, so keep using the old keys in data and saves. The tracked robot is `robot-cairn`, distinct from the cast key `cairn`.

- `FolkModels` (`src/08a-folk-models.js`) draws them. `Folk.make` is still instant: it returns the usual group with head and arm handles sized from the manifest, and the model drops in when its file arrives (at once if already fetched). Walking plays the model's Walk or Travel clip from the game's stride phase; moods drive the Happy, Bored and Sad morph targets; `U.sit(true)` holds the Seat pose; robots play Idle, and Operate when their arms are raised. If a model can't be fetched (`?noassets`, offline) the design's hand-built figure from `src/species/` stands in.
- Portraits show a holding card until the model is fetched, then fill in (`portraitCanvas` in `src/02-util.js`).
- Game copies are made by `art/characters/game-copies/all.sh` (which runs `make_game_copy.py` in Blender 4.5 with `--disable-autoexec`, about 15 seconds a character) from the masters on the art branches `humanoid-species-art` and `art/original-robot-species`. `docs/handoff-codex-characters.md` has the mapping table and the lessons. `node tools/check-assets.mjs` checks the models, their clips and the mapping.

## Shop lighting is baked

`src/08h-bake.js` lights each shop room once, when a port is built, and paints the result into vertex colours: the room's lamps with shadows, sunlight through the windows, the sky light and ambient occlusion. Baked meshes switch to `MeshBasicMaterial` and no longer respond to live lights. Anything that moves, glows or reflects is left live: the keeper and crew, the droid, everything in the crew act's props (`V.g`), `V.spin`, glass, chrome (metalness > 0.6), lit signs and glowing lamps. A new prop that moves must be reachable from `V.g` (or added after the bake). Add `?nobake` to the page URL to see the live lighting for comparison.

## Realism effects

Besides the bake, `src/08h-bake.js` adds per shop: bounce light (global illumination) and grime in the bake, a light/reflection probe (`Bake.probe`, `Bake.useProbe` for things added later), camera-facing light beams (`Bake.beams`), floor decals and a floor mirror (`Bake.floorMirror`, high quality only). `Bake.detailLive` gives outdoor port surfaces normal and roughness maps. Characters get contact shadows and (living ones) a subsurface-scattering patch in `Folk.make`. The post shader (`GLSL.postFrag`) does colour grading (`World.grade`), motion blur (`uBlur`), vignette and grain; `World.render` adds depth of field in shop views (high quality only). `GFX.high` (06-world.js) is the graphics quality setting, switched on the help screen; touch devices start on Balanced.


## Bespoke rooms, cockpits and decks

Each depot, garage and cantina, each ship's cockpit and each walkable deck has a Blender model (GLB) with its own sky (HDR) and colour grade (a 256×16 LUT), listed in `assets/interiors/manifest.json`, `assets/cockpits/manifest.json` and `assets/ship-interiors/manifest.json`. `build.sh` embeds the manifests as `ASSET_MANIFESTS`; `src/02b-assets.js` (`Assets`) fetches models when first needed. Assets load from next to the page; if they aren't there (the johnshawler.com Worker serves only the page) they come from GitHub Pages, and `?assets=<url>` or `?noassets` override that. Until a model arrives, or if it fails, the stock procedural version stays.

- Shops: `Venues` swaps in the room (`swapRoom`) from the per-frame queue, keeps the shelf goods, droid, keeper, crew, name plate, signpost and shop sign, bakes it with its light markers (then keeps only as many live lights as the stock room had: a change in light count recompiles every material in the port) and uses its grade while you're in it.
- Cockpits: `Cockpit.bespoke` moves the six panels and the fittings onto the model's anchors and uses its windshield and door.
- Decks: `Interior.bespoke` keeps the repair spots, passenger places, crates and signs; the walking bounds are unchanged.
  - Every deck has seven rooms and seven repair spots, one per room: corridor (hull crack), passenger cabin (coolant leak), scrubber bay (air scrubber), galley (fuse), airlock (seal), hold (strap) and engine room (thruster), plus a service alley either side of the engine room. The plan is in `Interior.RECTS` and `FAULT_DEFS` (`src/09-walk.js`) and must match `ROOMS` and `FAULTS` in `art/ship-interiors/build_deck.py`. The design briefs are `docs/ship-interiors/briefs.md` and `docs/cockpits/lived-in-briefs.md`.
  - Deck dressing (repairs, lamps, clutter) is `art/ship-interiors/dress.py`. Keep it out of `Interior.RECTS`, off the repair spots and off the game's signs. Lettered boards are `DECK_NOTES` in `src/09-walk.js`. Deck exports bake short-range shading into vertex colours (`bake_grime` in `art/cockpits/fabricate.py`), and the game adds `Interior.grimeTex()` to plain deck materials.
  - The Rustbucket's deck and cockpit are hand-built: `art/ship-interiors/source/Rustbucket-Mk-I.blend`, made into game copies by `art/ship-interiors/import_deck.py` (run through `art/ship-interiors/rustbucket.py`, stages `prep`, `bake`, `export`, `cockpit-prep`, `cockpit-bake`, `cockpit-export`; about 25 minutes in all). Do not run `art/cockpits/rustbucket.py`: it would overwrite the imported cockpit. A baked deck (`baked` in the manifest) is drawn unlit and carries its own walking map (`walk`) and crate places (`crates`); see `Interior.bakedDeck` and `Interior.plan`.
- `node tools/check-assets.mjs` checks the manifests against the files and the game's own shops, repair spots and seats.
