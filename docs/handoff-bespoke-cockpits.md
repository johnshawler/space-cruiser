# Handoff: a bespoke cockpit for every ship

## What John wants

Long Haul is a browser space-trucking game (Three.js r128, one HTML page). You spend most of the game sitting in your ship's cockpit, looking out through the windshield at planets, traffic and hyperspace. There are five ships you can own, from a battered starter tug to a luxury flagship.

Today the five ships share **one cockpit**. Only its colours change. **John wants each ship's cockpit to be bespoke**: built for that ship, so that buying a new ship feels like moving house. The windshield shape, the frame, the walls, the seat, the consoles and the clutter should all be different. The Rustbucket should feel cramped, patched and loud, and the Quasar Empress should feel like a throne room with a view.

You'll design and model the five cockpits in **Blender** and deliver them as files the game can load. Claude (in the main session) owns the game code and will wire them in, so this job is design, modelling and export only.

- Repo: `github.com/johnshawler/space-cruiser`, branch `main` (live on GitHub Pages).
- **Work on a new branch called `bespoke-cockpits`** and open a pull request into `main`. Don't push to `main`, merge or deploy.
- Blender **4.5 LTS**. Build every cockpit from a **Python script** run headless (`blender -b --python …`), so each one is reproducible and editable later. Save the resulting `.blend` too.

## How to work: designs first, then a pilot, then the rest

1. **Design brief for all five cockpits** (`docs/cockpits/briefs.md`). One section per ship covering:
   - the architectural idea and how it matches the ship's outside;
   - the windshield and window shapes;
   - materials and palette;
   - the seat;
   - three or four signature details;
   - the light and mood.

   Open the pull request with just this, so John can approve or redirect before any modelling.
2. **Pilot: the Rustbucket Mk I** (every player starts in it), fully modelled, exported and rendered. Push it to the same branch and stop for John's review.
3. **The other four**, once the pilot is approved.

## The five ships

Look at each ship's outside in the game: the shipyard in any port shows it, and so does the view as you land and take off. The exterior models are built in `src/05-ships.js`. The `ck` colours in `src/01-data.js` (`SHIPS`) are each cockpit's current palette, so start from them, and keep `glow` as the instrument backlight colour.

| Key | Ship | Its tagline | Outside | Current palette (frame / panel / trim / glow / leather) |
|---|---|---|---|---|
| `rustbucket` | Rustbucket Mk I (free starter) | It flies. Mostly forward. | A battered tug with slung cargo drums, a smokestack and a dish | #3d3a36 / #23211f / #b5651d / #ffb060 / #4a3426 |
| `dromedary` | Dromedary 400 | A box with ambitions. | A humped box hauler with container doors and twin nacelles on pylons | #34383c / #1d2024 / #e0b000 / #ffd27a / #2e2e30 |
| `stoat` | Stellar Stoat | Sleek, quick, slightly smug. | A sleek lathed fuselage, framed bubble canopy, swept wings with tip pods, canted tails | #2a3238 / #161b20 / #19b8a6 / #7ff5e6 / #1e2a30 |
| `manatee` | Opulent Manatee | Heated seats. Heated everything. | A long liner with gold bands, two rows of lit windows, an observation dome and a chrome nose | #33252a / #1a1416 / #c9a24a / #ffd9a0 / #5a1f28 |
| `empress` | Quasar Empress (the dream ship) | The last ship you will ever need to brag about. | A pearl needle hull, a glowing ring on spokes, blade wings with glowing edges, a crown of spines | #9aa1aa / #1b1f26 / #3fd0ff / #9fe8ff / #e8e4dc |

Some starting thoughts, which are yours to improve on:

- **Rustbucket:** cramped, riveted plates, a patched windshield, exposed pipes, tape, a cushion on the seat.
- **Dromedary:** boxy and practical, square windows, hazard stripes, lots of storage.
- **Stoat:** a wraparound bubble canopy with a thin frame and a snug sporty seat.
- **Manatee:** wide windows, wood and leather, gold fittings, a drinks holder that's nicer than the drink.
- **Empress:** a panoramic canopy, pearl and glowing edges, a seat like a throne.

Each one should obviously belong to its ship from the outside.

## Style

- **Toy-like and readable.** Chunky shapes, generous bevels, rich colour, clear silhouettes. Cartoon sci-fi, not realism. The humour is dry and gently absurd: small jokes in the clutter are welcome.
- **The game's owner has low vision.** Keep strong contrast between frame, panels and glass. Any lettering you model must be big and clear (at least 2 cm tall at 1 m away).
- **Bespoke, not reskinned.** Vary the structure itself:
  - the windshield shape and how many panes it has;
  - the canopy frame;
  - the side windows (or none);
  - the roof height;
  - the console shapes;
  - the seat;
  - the floor;
  - the back wall.
- **Original designs only.** No cockpits, ships, logos, brands or products from films, games, books or toys, even renamed. Don't recreate any famous fictional spaceship cockpit.

## The cockpit's frame and what has to fit (important)

Units are **metres**, in the cockpit's own frame. The **pilot's eye is at the origin**. In the game, +Y is up and the pilot looks towards -Z. In Blender, game X = Blender X, game up (+Y) = Blender +Z, and game forward (-Z) = Blender **+Y**. Export with glTF "+Y up" so it converts. All positions below are in the **game frame**.

### The view

- The pilot sits looking forward and slightly down (pitch -0.12 rad), with a **72° vertical field of view**, on a 16:10 screen.
- They can turn their head about 140° left and right (yaw ±2.5 rad) and look up and down by about 70°, so the sides, roof and much of the back wall are seen.
- Clicking a panel leans the head up to 0.3 m towards it.
- **The view out is the point of the game.** The windshield must give a wide, clear view ahead: at least the area the current one gives. Today the windshield runs from **y = -0.23 at z = -1.41** (bottom edge, 1.92 m wide) up to **y = 0.64 at z = -0.45** (top edge, 1.2 m wide). Frame bars may cross it, but keep the middle third of the view (straight ahead and slightly down) free of structure.
- The camera's near plane is 2 cm. Keep surfaces at least **0.25 m from the eye**.

### The live instrument panels

The game builds the working instruments itself: dials, needles, screens, knobs, switches, buttons, the throttle and the warp handle, all clickable and animated. **You don't model those.** You model the housings they sit in, and mark each panel's position with an **empty**.

Each panel is a flat rectangle. Its empty sits at the panel's centre. In the game frame, the empty's local +Z is the face normal (pointing at the pilot) and its local +Y is "up" on the panel. Name each empty exactly as below. You may move and tilt panels to suit your design, but:

- each must stay fully readable from the default view (or, for the overhead panel, with a short look up);
- each must stay within the pilot's reach: centre within **1.1 m of the eye**;
- they must not overlap each other or the windshield view.

Leave a flat recess or bezel at least the panel's size, and 5 cm deep, behind each one.

| Empty | Panel | Size (w × h) | Today: position, tilt (x, y rad) | What's on it |
|---|---|---|---|---|
| `panel_main` | Centre dash | 0.62 × 0.34 | (0, -0.37, -0.80), tilt (-0.38, 0) | Navigation screen, warning lights, destination knob, hail button |
| `panel_left` | Left wing | 0.46 × 0.34 | (-0.497, -0.37, -0.666), tilt (-0.38, +0.62) | Speed, fuel and core temperature dials, radar, scan range, clock, hold readout |
| `panel_right` | Right wing | 0.46 × 0.34 | (0.497, -0.37, -0.666), tilt (-0.38, -0.62) | Attitude ball, radio display, volume, channel, toggles, horn |
| `panel_pedestal` | Pedestal between the knees | 0.24 × 0.44 | (0, -0.60, -0.56), tilt (-1.17, 0) | Throttle lever (sticks up 9 cm), warp handle (sticks up 13 cm), all stop, next |
| `panel_overhead` | Overhead | 0.62 × 0.20 | (0, 0.565, -0.33), tilt (+0.927, 0) | Master power, cabin and instrument lights, sun visor, music, centre view |
| `panel_radio` | Translator strip on the glare shield | 1.00 × 0.16 | (0, -0.118, -0.915), tilt (-0.2, 0) | The long radio translator screen and incoming calls |

The tilts are rotations about X then Y, in that order. Keep **12 cm clear in front of the pedestal panel** for the levers, and 4 cm in front of the others.

### Everything else the game places

Mark each of these with an empty of the given name, at a spot that suits your design.

- `stick`: the base of the side-stick (today on the right console at (0.74, -0.39, -0.5)). Leave a flat 10 cm pad and 25 cm clear above it.
- `mug`: a flat spot for the pilot's coffee mug (today (-0.74, -0.375, -0.66)). Leave a 9 cm circle clear.
- `clipboard`: a flat spot for the cargo manifest clipboard, 20 × 28 cm (today (-0.81, -0.412, -0.32) on the left console). Rotate the empty about Y to angle it.
- `mascot`: a spot on the dash for the bobble-head mascot, 6 cm wide and 12 cm tall (today (0.5, -0.2, -0.84)). It must be visible from the default view.
- `wiper_left` and `wiper_right`: the pivot of each windshield wiper at the bottom edge of the windshield, with local +Y running up the glass. Each arm is 0.5 m long. It rests lying along the bottom edge and sweeps up through about 100°. Today the pivots are at x = -0.42 and x = +0.12. If the design has a single wiper or three, add or drop empties; name them `wiper_*`.
- `lamp_*`: one to three cabin lamps (today two on the ceiling at (±0.38, 0.638, 0.05)). Model the lamp fitting too, with an emissive lens.
- `glow`: the instrument backlight, usually just behind the centre dash.

### Windows and glass

- The **windshield** (the main front window) is one mesh named `windshield`. It should be a single surface with simple UVs running 0–1 across it: the game lays its sun-visor tint, its dust and its wipers on it. A flat or gently curved shape is best. If you want a split windshield, make it several meshes named `windshield_*` and say which one carries the wipers.
- **Other windows** (side, roof, a bubble) are meshes named `canopy_*`. The game replaces every window material with its own glass, so their material doesn't matter, but give them their own material called `glass`.
- Windows are see-through to real space. Don't put anything outside them: the game draws space, planets and other ships behind the cockpit.

### Seat, floor and the door to the rest of the ship

- The pilot's seat: the eye is at the origin, so the seat cushion top sits around y = -0.71 and the backrest around z = +0.3 to +0.4. The pilot is never drawn, so the seat is seen only when looking round. Make it characterful.
- The floor is around y = -0.97.
- **The back wall has a door** to the corridor that runs back through the ship (the walk-in interior, which is shared by all ships and not part of this job). The doorway is **0.84 m wide, from the floor (y = -0.97) to y = 0.62, centred on x = 0, in the back wall at z = 0.68**. Model the door itself as a separate mesh named `door`: the game slides it open. The player walks from the seat to the door, so keep a **0.7 m-wide gap from the seat to the door**. Today the seat sits in front of the door and you walk round it.
- The cockpit must be closed all round: no gaps to the void except through glass.

## Lighting, materials and performance

The cockpit is lit **live**: sunlight through the windows with shadows, light bounced off the nearest planet, the cabin lamps and the instrument glow. It's not baked like the shops.

- Use Principled BSDF only: base colour, roughness, metallic, emission, alpha. Simple image textures are fine (1024 px at most, embedded). Don't use procedural node trees.
- Space has a very bright reflection map. Keep large non-glass surfaces at **roughness 0.45 or above**, so the walls don't turn into mirrors. Chrome and gold accents are fine at small sizes.
- Lamp lenses, indicator strips and any glowing trim should use emission.
- One cockpit is loaded at a time, on iPads too. **Per cockpit: at most 60,000 triangles, 80 meshes (merge static parts that share a material), 14 materials.** Keep the `door`, `windshield` and `canopy_*` meshes separate.
- Export **one `.glb` per ship**: `assets/cockpits/<key>.glb` (for example `assets/cockpits/rustbucket.glb`), at most **1.5 MB** each.

## Deliverables

For each ship:

- `art/cockpits/<key>.py`: the Blender script that builds it from nothing.
- `art/cockpits/<key>.blend`: the saved scene.
- `assets/cockpits/<key>.glb`: the export, with all the empties above.
- Renders in `docs/cockpits/<key>/`. For each, put grey rectangles of the right size on the panel empties, so the layout reads.
  - `pilot.png`: from the eye at the origin, looking forward with pitch -0.12 rad, 72° vertical field of view, 16:10, with a starfield or plain dark-blue background through the glass.
  - `left.png` and `right.png`: looking 90° to each side.
  - `back.png`: looking back at the door.
  - `overview.png`: a cutaway from above and behind, roof hidden.

Also provide:

- `assets/cockpits/manifest.json`: one entry per ship with file, triangle, mesh and material counts, and the position and rotation of every empty in the game frame.
- `docs/cockpits/briefs.md`: the five design briefs (step 1).
- `docs/cockpits/index.md`: all the renders, large, with each ship's name.
- A short "Bespoke cockpits" section in `README.md`: one line per ship.

Don't edit `src/` or the built pages (`index.html`, `long-haul.html`). Claude will wire the cockpits in.

## Checking your work

For every cockpit:

- [ ] it builds from its script with no errors in Blender 4.5 headless
- [ ] the pilot render shows a wide, clear view ahead, with the middle third free of structure
- [ ] all six panel empties are present, the right size, readable from the eye and no more than 1.1 m away, with clearance in front, and none of them overlap
- [ ] `stick`, `mug`, `clipboard`, `mascot`, `wiper_*`, `lamp_*` and `glow` empties are present and sensible
- [ ] the windshield is one mesh named `windshield` with 0–1 UVs; other glass is `canopy_*`
- [ ] the doorway is 0.84 × 1.59 m at z = 0.68 with a separate `door` mesh, and there's a 0.7 m path from the seat to it
- [ ] no gaps to the void; nothing within 0.25 m of the eye
- [ ] it plainly belongs to its ship, and looks different from the other four
- [ ] triangle, mesh, material and file-size budgets are met (report the numbers in the manifest)
- [ ] nothing in it resembles an existing film, game, brand or toy

## When you're done

Open the pull request from `bespoke-cockpits` into `main`. After step 1, title it "Bespoke cockpits: design briefs"; once all five are built, title it "Bespoke cockpits: five ships". In the description:

- list each ship with a one-line idea and its budget numbers;
- link `docs/cockpits/index.md`;
- embed the five pilot renders;
- note anything that didn't fit the layout above.

Don't merge it yourself.

**For Claude, later:**

- Each ship's cockpit loads from `assets/cockpits/<key>.glb`.
- In `Cockpit.build` (`src/07-cockpit.js`), replace the shell, seat, consoles and frame with the GLB. Then place the existing panels (`PC`, `PL`, `PR`, `PP`, `PO`, `PT`), the stick, mug, clipboard, mascot, wipers and lamps on the named empties.
- Swap the window materials for the game's glass, keeping `userData.glass` for click-to-look.
- Lay the visor, dirt and wipers on `windshield`, and drive `door` from `setDoor`.
- Check that the walk-in interior in `src/09-walk.js` still lines up with the doorway.
- The johnshawler.com copy of the game is served by a Cloudflare Worker that serves only `index.html`, so it needs to serve `assets/` too, or the cockpits need embedding.
