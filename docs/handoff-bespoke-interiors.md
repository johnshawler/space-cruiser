# Handoff: a bespoke cargo depot, garage and cantina for every location

## What John wants

Long Haul is a browser space-trucking game (Three.js r128, one HTML page). When you land, the camera looks across a shop counter into a small room: a cargo depot, a garage, a cantina and so on. Today every planet's depot is the same room in different paint, and the same goes for every garage and every cantina.

**John wants each location's shops to look bespoke**: designed for that planet or station, as if a different architect, culture and climate had built each one. On Scorchmaw's depot you should feel the lava world, and in Brrrindle's cantina you should feel the cold outside. Two depots should never be mistaken for each other, even at a glance.

This job covers the **cargo depot, garage and cantina** at every location that has one: **30 rooms** across 13 locations (listed below). Shipyards, paint shops, outfitters and assay offices stay as they are for now.

You'll design and model the rooms in **Blender** and deliver them as files the game can load. Claude (in the main session) owns the game code and will wire the rooms in, so this job is design, modelling and export only.

- Repo: `github.com/johnshawler/space-cruiser`, branch `main` (live on GitHub Pages).
- **Work on a new branch called `bespoke-interiors`** and open a pull request into `main`. Don't push to `main`, merge or deploy.
- Blender **4.5 LTS**. Build every room from a **Python script** run headless (`blender -b --python …`), so each room is reproducible and editable later. Save the resulting `.blend` too.

## How to work: designs first, then a pilot, then the rest

1. **Design brief for all 30 rooms** (`docs/interiors/briefs.md`). One short section per room: the architectural idea, materials and palette, two or three signature props, the light (warm, cold, glowing, flickering), and how it ties to the planet and the shop's name and keeper. Open the pull request with just this so John can approve or redirect before any modelling.
2. **Pilot: Verdanthia's three rooms** (depot, garage, cantina), fully modelled, exported and rendered. Push them to the same branch and stop for John's review.
3. **The other 27 rooms**, once the pilot is approved.

## The locations and their rooms

Each location has a port name, a character and a home species (now played by the animated cast). Use the planet description, the shop's name and the keeper's job title as your starting point. The humour is dry and gently absurd, and the look is toy-like.

| # | Location | Port | Character | Depot | Garage | Cantina |
|---|---|---|---|---|---|---|
| 0 | Verdanthia | Vendorhaven | A garden world tended by retired vending machines. | Dispatch Bay B4 (dispatch unit) | Fix-O-Matic 3000 (repair unit) | The Coin Slot (bartender, former jukebox) |
| 1 | Scorchmaw | Port Gneiss | Mostly on fire. The locals like it that way. Lava world. | Gravel Freight Yard (yard boss) | Lava Lube & Patch (very fluffy welder) | — |
| 2 | Dunemoor | Bureau Nine | Sand, canyons and the system's longest queue. Desert bureaucracy. | Form 27-B Cargo Office (senior clerk of crates) | — | The Rubber Stamp |
| 3 | Sloshwell | Ladle Harbor | One ocean, a few islands, an alarming amount of broth. | Ladle Harbor Freight (harbourmaster) | — | The Bottomless Bowl (soup sommelier) |
| 4 | Amethyne | Bargain Roost | Violet crystal highlands over teal seas. Everything has a price tag. | Bargain Roost Cargo Perch (perch master) | — | — |
| 5 | Toxibloom | Mellow Hollow | A warm, damp, glowing swamp. Smells like a good idea. | Mellow Hollow Depot (depot keeper, never hurries) | Spore & Bolt | The Damp Log |
| 6 | Candara | Port Lament | A pink gas dwarf. The poets live in the clouds and will not come down. Shops float on platforms in the clouds. | Port Lament Cargo Dock (dockmaster) | — | The Sunk Cost |
| 7 | Jovexa | The Drift | A ringed giant. The locals float in it and think about lunch. Shops float in the clouds. | Drift Cargo Bubble (cargo floater) | Gentle Repairs (hull whisperer) | — |
| 8 | Brrrindle | Fort Snuggle | Ice, snow and nine hundred emergency blankets. | Fort Snuggle Cargo Hut (cargo cuddler) | Warm Wrench Garage | The Warm Mitten (cocoa keeper) |
| 9 | Listening Post Hush | The Quiet Ear | Research station: a dish the size of a county, listening to the universe. Quiet, padded, acoustic. | Hush Receiving Bay | Soft Landing Repairs (dent surveyor) | The Indoor Voice |
| 10 | Cryo Vault Rimeholm | The Freezer Aisle | Research station that keeps one frozen sample of everything. | Cold Storage Intake (intake curator) | Thaw & Patch (defrost mechanic) | — |
| 11 | Calibration Spire | Tolerance Station | Research station that measures the universe to within a whisker. Precise, gauges everywhere. | Precision Freight (tolerance clerk) | Exactly Right Repairs (fitter) | — |
| 12 | Beacon Far Wink | The Last Light | The furthest lighthouse in the system. It blinks at nothing, faithfully. | Last Light Freight Office (signal clerk) | End of the Line Garage | The Final Blink (lamp-keeper and bartender) |

The four research stations (9–12) sit on metal decks in deep space: their windows look out on stars, not sky. The shop names, keepers and their lines are in `src/08b-venues.js` (`VENUES`). The planet colours (`surf.zen`, `surf.hor`, `surf.g`) are in `src/01-data.js`; use them as a starting palette.

## Style

- **Toy-like and readable.** Chunky shapes, generous bevels, saturated colour, clear silhouettes. The world is cartoon sci-fi, not realism. Look at the live game (land anywhere and visit the shops) and at the character gallery (`?gallery`).
- **The game's owner has low vision.** The room is seen from 8–15 m away: big readable forms and strong value contrast matter more than fine detail. Any lettering you model must be large (at least 0.25 m tall). Prefer big shapes and props to small clutter.
- **Bespoke, not reskinned.** Vary the architecture itself, not just colours: room shape (vaulted, domed, round, A-frame, cave, hull section, greenhouse, submarine, lighthouse lamp room), wall construction (logs, ice blocks, basalt, brass panels, quilted padding, crystal), ceilings, windows and props.
- **Original designs only.** No characters, logos, brands, products or recognisable places from films, games, books or toys, even renamed.
- **Lighting is baked by the game.** Model surfaces with their true colours; don't paint in shading. Glowing things (lamps, screens, lava, fungus) should be **emissive** materials. Real light sources are separate (see "Lights" below).

## The room's frame and what has to fit (important)

Every room is **modelled in the shop's own frame**, in metres. In the game, +Y is up, the counter is at the origin, and the camera looks from +Z towards -Z. In Blender, game X = Blender X, game up (+Y) = Blender +Z, and towards the camera (+Z) = Blender **-Y**. The glTF exporter's "+Y up" option does the conversion, so in Blender the counter sits at the origin and the camera is towards -Y.

The game puts several things at fixed positions in every shop. Your room must leave space for them, and must have floor where they stand. All positions below are in the **game frame** (x right, y up, z towards the camera).

### Every room

- **Room size.** Inside walls at x = -9.6 to +9.6. Back wall at z = -7.15 (depot: -8.2). The front of the room reaches z = +17, which is behind the camera and never seen. The floor is at y = 0, with ceiling height 7.5 to 10 m. You may change the shape (a rounder back wall, a vaulted ceiling, alcoves) as long as everything listed here still fits and the back wall stays roughly between z = -6 and z = -9.
- **The counter**, which you model (it's part of the look), centred on the origin: **4.4 m wide (x), 0.8 m deep (z), top at y = 1.05**. Its **front face (z = +0.4) needs a flat panel at least 3.0 × 0.8 m centred at y = 0.52**: the game hangs the port's name plate there. The game also puts crates on the counter top at x = 0.4, 1.15 and 1.9, so keep the top clear and flat.
- **The keeper** stands behind the counter at (-1.55, 0, -0.85), up to 2.2 m tall. Keep a 1.2 m circle there clear.
- **The crew act** happens behind the counter: two characters doing a small scene in the area **x = -5 to +5, z = -2.5 to -8**, sometimes throwing things up to 3 m high. Keep that floor flat and clear apart from a few low props at its edges.
- **The signpost** stands at (3.4, 0, 0.7) with arms to its right. Keep a 1 m circle there clear, up to 3.5 m high.
- **What the camera sees.** The camera sits about 5–6 m up and 8–15 m in front of the counter, looking at (0, 2.1, -2.6), with a 44° vertical field of view. It shows the counter, the floor behind it, the back wall and the back halves of the side walls. **Put the bespoke detail there**: back wall, side walls towards the back, ceiling edge, floor behind the counter. The bottom quarter of the screen is covered by the price tags.

### Cargo depot

- **The goods shelf** sits left of the counter: a frame **4.2 m wide, 0.9 m deep, 4.4 m tall**, centred at (-4.45, 0, -0.9), facing +z. It holds 12 goods models in **3 shelves at y = 1.0, 2.15 and 3.3**, 4 columns across the 4.2 m width. Model the shelf in your style (name its root object `shelf`), keeping those exact shelf heights, depth and width, and the space between shelves clear. A **sign reading "Today's goods"** sits on its top edge (the game can supply it).
- **The stock room door** is in the back wall: an opening **2.2 m wide, 3.5 m high, centred at x = 4.5** (x = 3.4 to 5.6).
- **The stock room** lies behind that door: **x = 1.6 to 7.4, z = -8.2 to -14.6, at least 4.6 m high**. It has shelving down both sides and a **packing bench at the back** (top at y = 1.25, around z = -13.6, centred on x = 4.5). Keep a **1.4 m-wide clear lane down x = 4.5** from the door to the bench: the stock droid drives it.
- **The stock droid's other routes.** It parks at (3.6, 0, -1.4). To reach the shelf it drives round the front of the counter along z = +1.5, from x = 3.4 to the shelf, and stops in front of the shelf at z = +0.55. Keep those lanes clear, 1 m wide.
- **The crew's crate run.** A pile of crates at (-4.45, 0, -3.6) gets carried along (2.8, -5.3) → (4.3, -7.0) → through the door. Keep that path clear. A crew member stands at (2.2, 0, -7.5), left of the door.

### Garage

- The crew's act is an engine on a stand around (1.0, 0, -4.0), with characters at (-0.4, -4.0) and (3.3, -3.8). The game supplies the engine. Keep **x = -2 to +4.5, z = -2.5 to -5.5** clear.

### Cantina

- The crew juggle mugs at (-0.55, -3.6) and (2.35, -3.6), up to 3 m high. Keep **x = -2 to +4, z = -2.5 to -5** clear up to 3.5 m.

### Gas giants and stations

- **Candara and Jovexa** shops sit on platforms floating in pink and golden cloud. Anything through the windows is cloud and sky.
- **The four stations** sit on a metal deck in space. Their windows show stars and the station's own structure. Interiors should feel like spacecraft: pressure hulls, ribs, hatches, padding.

## Lights

The game bakes the lighting when you land, then lights the moving characters live. Mark your light sources with **empties** named `light_<anything>`, carrying custom properties `color` (hex string), `intensity` (0.3–1.5) and `distance` in metres (the reach, 10–40). Use 2–5 per room, plus emissive lamp fixtures for the visible glow. Windows should be meshes with a material named `glass` (transparent, low opacity): the game makes them glow with daylight.

## Performance and format

Up to four rooms are loaded at each port, on iPads too.

- **Per room: at most 80,000 triangles, 120 meshes (merge static parts that share a material), 16 materials.**
- **Big flat surfaces need vertices every 0.5 m or so** (floors, walls, ceilings). The game bakes light into vertex colours, so a 10 m wall made of two triangles can't show a lamp's pool of light. Subdivide them (a grid modifier or loop cuts) before export.
- Materials: Principled BSDF only, using base colour, roughness, metallic, emission and alpha. Simple image textures are allowed (1024 px at most, embedded). Don't use procedural node trees: they don't export.
- Keep metallic at 0.6 or below on large surfaces; above that the game treats a surface as chrome and doesn't bake it.
- Export **one `.glb` per room**: `assets/interiors/<location-key>/<shop>.glb` (for example `assets/interiors/verdanthia/depot.glb`), at most **1.5 MB** each. Location keys: lowercase planet or station name with hyphens (`listening-post-hush`).

## Deliverables

For each room:

- `art/interiors/<location-key>/<shop>.py`: the Blender script that builds it from nothing.
- `art/interiors/<location-key>/<shop>.blend`: the saved scene.
- `assets/interiors/<location-key>/<shop>.glb`: the export.
- Two renders in `docs/interiors/<location-key>/`. `<shop>-game.png` uses the game camera: at (0, 5.6, 11.5) looking at (0, 2.1, -2.6) in the game frame, so (0, -11.5, 5.6) looking at (0, 2.6, 2.1) in Blender, with a 44° vertical field of view at 16:10. `<shop>-overview.png` is a three-quarter view from above.

Also provide:

- `assets/interiors/manifest.json`: one entry per room with location, shop, file, triangle and mesh counts, and its lights (from the `light_*` empties).
- `docs/interiors/briefs.md`: the 30 design briefs (step 1).
- `docs/interiors/index.md`: a page of all the game-camera renders, large, with each room's name.
- A short "Bespoke interiors" section in `README.md`: one line per room.

Don't edit `src/` or the built pages (`index.html`, `long-haul.html`). Claude will wire the rooms in: loading each port's rooms on landing, aligning them with the counter, shelf and anchors above, converting the lights and baking them.

## Checking your work

For every room:

- [ ] it builds from its script with no errors in Blender 4.5 headless
- [ ] the counter, name-plate panel, keeper spot, crew act area and signpost spot are where this brief says, and clear
- [ ] (depot) shelf heights 1.0 / 2.15 / 3.3 m, door opening, stock-room lane and bench all match; a 1 m test box can drive the droid's routes without touching anything
- [ ] the game-camera render reads clearly: you can tell which planet it is and which shop it is without the name plate
- [ ] it looks different from every other room, including the other shops at the same location
- [ ] triangle, mesh, material and file-size budgets are met (report the numbers in the manifest)
- [ ] nothing in it resembles an existing film, game, brand or toy

## When you're done

Open the pull request from `bespoke-interiors` into `main` titled "Bespoke interiors: 30 shop rooms" (after step 1 it can be titled "Bespoke interiors: design briefs"). In the description, list each room with a one-line idea and its budget numbers, link `docs/interiors/index.md`, embed a few game-camera renders, and note anything that didn't fit the anchors. Don't merge it yourself.

For Claude, later: rooms load per port from `assets/interiors/<location-key>/<shop>.glb`; replace `room()` and `shell()` for that shop while keeping `SETS`, the crew acts, the droid, the shelf logic, the name plate, the signpost and the bake. The johnshawler.com copy of the game is served by a Cloudflare Worker that serves only `index.html`, so it needs to serve `assets/` too, or the rooms need embedding.
