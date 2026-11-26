# Codex characters in the game

Status, 25 November 2026: **all 32 are in the game.** Every one of the 50 cast designs and 30 earlier species keys is played by a Blender character, in shops, crews, port crowds, residents, cabin seats and portraits. Branch `codex-characters-in-game`, off `long-haul-integration`. Not committed or pushed.

## What to look at

Pictures and clips from the local build are in the session folder beside the repository clone, under `codex-trial/` (the two-character trial) and `codex-trial/all-32/` (line-ups of all 32, robots mid-walk, humanoids seated, portraits, and an old-format save loaded at Amethyne and in the cabin).

Live: serve the repository root and open `index.html`. `?gallery` shows any design on a turntable. `?noassets` shows the fallback (the old hand-built figures).

## Checked

- All 32 load, walk, and (humanoids) sit, raise their arms and change expression; Latchling's hoses, Nautil's skirt and Cairn's tracks move with their bones.
- A save written with the old keys (`blorpax`, `zkthar`, `momwump`, docked at Amethyne) loads; its passengers sit in the cabin as Koruun and Zhavet.
- Portraits fill in for all species once their model is fetched.
- No page errors in port, shop, cabin, gallery or with `?noassets`. `node tools/check-assets.mjs` passes and now covers the models, their clips and the mapping.
- Shop view frame rate with the new characters was the same as with the old ones (15 against 14 frames a second in a hidden browser pane on high quality).

## Cost of a game copy

| | Codex master | Game copy |
| --- | --- | --- |
| Taluun | 127,960 triangles, 88 meshes, procedural materials | 14,481 triangles, 1 skinned mesh, 3 picture maps at 1024, 1.6 MB |
| Thimble | 46,862 triangles, 174 parts | 10,140 triangles, 1 skinned mesh, 3 picture maps at 1024, 1.3 MB |

About 15 seconds each to convert. The colour map is 1024 square and the other maps 512. All 32 come to 42 MB, fetched one species at a time when first needed. (The table is from the trial, before the smaller maps.)

What survives:

- **Humanoids:** the 50 deform bones and skin weights; the Walk cycle with the leg and arm solving sampled (forward travel taken off the root, so the game moves the character); the Seat, Reach and Stride poses; the Happy, Bored and Sad morph targets; and one-frame Happy/Bored/Sad clips that carry the driven head offset and lid bones. The eye-aperture shader is baked open, so there is no blink yet.
- **Robots:** rigid parenting is kept by weighting each part 1.0 to the bone it was parented to. Idle, Travel and Operate export from their NLA tracks. Curves (springs) are converted to meshes first. Hoses on hooks are skinned to the bones their hooks follow, and Nautil's skirt keeps its own weights: both are written but untested, because Thimble has neither.
- Dropped from the game copies: rows of stitches and specks under 2 cm (press studs).

Things learned the hard way:

- The saved poses are forward-kinematic. Sample them with the four IK switches at 0 or the legs fold wrongly.
- Remove UV layers by name, one at a time: held references go stale and the wrong layer survives.
- The robot files open in Pose Mode.
- Metal has no diffuse colour in Cycles, so colour, roughness and metal are baked through an emission shader.

## How it is wired

- `art/characters/game-copies/make_game_copy.py`: the conversion (reduce by area, join, unwrap, bake, export). Run with Blender 4.5 and `--disable-autoexec`.
- `art/characters/game-copies/manifest.py`: gathers each `<id>.json` into `assets/characters/species/manifest.json`, which `build.sh` embeds as `ASSET_MANIFESTS.species`.
- `src/08a-folk-models.js` (`FolkModels`): a species entry with `model:'<id>'` is drawn from its GLB. `Folk.make` stays instant; the model drops in when its file arrives, and the game keeps driving the same head and arm handles.
- `MODEL_FOR` in `src/01-data.js`: which model plays which species key.

## Known gaps

- Voices, lines and trait text are still those of the designs being replaced, so some lines do not suit the new look or name.
- No blinking: the eye-aperture shader is baked open.
- Robots cannot sit: they stand on the seat at a smaller size. Robots without arm bones carry held props beside the body.
- Six robots are modelled side-on and are turned a quarter turn in `FolkModels` (`YAW`): Lamplume, Latchling, Nautil, robot-cairn, Millipress, Mudlark. Cairn's and Millipress's direction of travel is a judgement from the model.
- Long robots are scaled to fit (Millipress stands about 0.56 m tall and 2.6 m long).
- Prismwake's crystal is solid pale blue, not see-through. Lamplume's glass vanes do not glow.
- The 32 files total 42 MB (0.9 to 1.8 MB each), fetched per species. A busy port can fetch 20 of them.
- The old species code in `src/species/` stays: it holds the voices and lines, and its figures are the fallback.
- Not from this work: on the Rustbucket's hand-built deck, passengers sink into the bunks; and the status screens and seat labels are removed only on `rustbucket-repairs-integration`.

## The mapping: all 50 cast keys

Saves, planets, shops and jobs refer to the 30 legacy species keys; `CAST_FOR` already points each of those at one of the 50 cast designs. The proposal keeps every key and changes only who plays it, so old saves load unchanged. Several designs share one new species, and every one of the 32 is used at least once.

**Homeworld** marks the 13 keys that own a port, so those choices show most. "robot-cairn" is the new tracked robot, kept distinct from the existing `cairn` key.

| Cast key | Legacy alias | Today's design | Proposed species | Kind | Homeworld |
| --- | --- | --- | --- | --- | --- |
| aril | loamlet | canopy gardener on forked roots | Sovai | humanoid | |
| caelo | wickindle | velvet moth lantern keeper | Mothren | humanoid | |
| cairn | sealump | stack of counterweights on runners | robot-cairn | robot | |
| chime | timbrelk | brass bell with a felt mallet | Bellwrought | robot | |
| crimp | | twin-wheeled cable splicer | Spoolback | robot | |
| dolly | | parcel cart | Millipress | robot | |
| fathom | | bronze bathysphere with a periscope | Nautil | robot | |
| fenn | ooloo | pressure bladder with a weather basket | Nemeya | humanoid | Jovexa |
| glint | | mirror yoke on three struts | Prismwake | robot | |
| hush | | boiler-bodied listener | Velour | robot | |
| ilex | | moss-backed ranger | Koruun | humanoid | |
| iris | | bellows camera on a tripod | Latchling | robot | |
| kepp | whorloo | trail keeper with a spiral shell | Nautil | robot | |
| kiln | | furnace tender | Basaltine | robot | |
| kipp | zkthar | six-footed bridge inspector | Zhavet | humanoid | Dunemoor |
| koro | | broad geode carver | Orrek | humanoid | |
| latch | | lock body with a shackle | Latchling | robot | |
| lichen | beepul | porcelain-masked conservatory keeper | Thimble | robot | Verdanthia |
| lyre | | soundboard with seven strings | Bellwrought | robot | |
| marlo | momwump | tusked ice harbormaster | Brunn | humanoid | Brrrindle |
| mica | | plated, beaked surveyor | Vessari | humanoid | |
| myrr | sporrin | mushroom kitchen steward | Keld | humanoid | Toxibloom |
| nacre | nacrelle | reef acoustician with a shell fan | Velour | robot | Listening Post Hush |
| neru | blorpax | tidal cartographer with gills | Koruun | humanoid | Sloshwell |
| nim | bractillo | seed courier with a parasol | Pelrin | humanoid | |
| obo | rilloon | cricket in a dinner jacket | Rhovi | humanoid | |
| orlo | | nested gimbals on a gyro base | Gimbal | robot | |
| orris | | leafy-eared botanist | Pelrin | humanoid | |
| parallax | gaugekin | calibration gauge and camera barrel | Gimbal | robot | Calibration Spire |
| pavo | qeeble | herald with a feather fan | Vessari | humanoid | Amethyne |
| pinion | | aerial gearbox with wings | Prismwake | robot | |
| plover | pipettle | long-legged wader with a chart bag | Sovai | humanoid | |
| plume | pluvindle | hovering sampler | Mudlark | robot | |
| prong | | cargo tug with lifting tines | Trestle | robot | |
| purl | | yarn drum with knitting needles | Selvedge | robot | |
| relay | hushcone | receiver cabinet with a dish | Folio | robot | |
| rivet | | saucer welder | Basaltine | robot | |
| rusk | grondar | armoured kiln inspector | Orrek | humanoid | Scorchmaw |
| sarra | velveteel | hooded glassblower | Ulnor | humanoid | |
| shuttle | bobbinor | weaving shuttle | Selvedge | robot | |
| silt | cuspiro | sand burrower | Dathri | humanoid | |
| sova | rimebud | owl-like archivist | Ureth | humanoid | Cryo Vault Rimeholm |
| spool | | switchboard | Spoolback | robot | |
| sura | tessettle | current reader with a crest | Taluun | humanoid | |
| tacca | | long-eared tunnel listener | Mothren | humanoid | |
| tally | tarestep | weighing drum on one wheel | Thimble | robot | |
| tempo | linticker | metronome | Millipress | robot | |
| vela | vrell | fan mantle with ribbons | Eskel | humanoid | Candara |
| wick | winkmast | beacon with an amber lantern | Lamplume | robot | Beacon Far Wink |
| yarro | parasolum | thermal scout with sails | Taluun | humanoid | |

### The same mapping, by new species

| New species | Kind | Plays (cast keys) |
| --- | --- | --- |
| Taluun | humanoid | sura, yarro |
| Orrek | humanoid | rusk, koro |
| Vessari | humanoid | pavo, mica |
| Mothren | humanoid | caelo, tacca |
| Ureth | humanoid | sova |
| Keld | humanoid | myrr |
| Sovai | humanoid | aril, plover |
| Brunn | humanoid | marlo |
| Pelrin | humanoid | nim, orris |
| Zhavet | humanoid | kipp |
| Koruun | humanoid | neru, ilex |
| Eskel | humanoid | vela |
| Rhovi | humanoid | obo |
| Nemeya | humanoid | fenn |
| Dathri | humanoid | silt |
| Ulnor | humanoid | sarra |
| Bellwrought | robot | chime, lyre |
| Selvedge | robot | shuttle, purl |
| Gimbal | robot | parallax, orlo |
| Mudlark | robot | plume |
| Folio | robot | relay |
| Spoolback | robot | crimp, spool |
| Lamplume | robot | wick |
| robot-cairn | robot | cairn |
| Latchling | robot | iris, latch |
| Velour | robot | nacre, hush |
| Nautil | robot | fathom, kepp |
| Trestle | robot | prong |
| Prismwake | robot | glint, pinion |
| Millipress | robot | dolly, tempo |
| Basaltine | robot | kiln, rivet |
| Thimble | robot | lichen, tally |

Two places where a living design would be played by a robot: `nacre` (the Listening Post Hush homeworld species) by Velour, and `kepp` by Nautil. Both were chosen for the look (listening horn; spiral shell).

## Still John's to decide

1. Whether to write new voices and lines for the 32, to replace the inherited ones.
2. Whether the robot sizes suit, the long ones especially.
