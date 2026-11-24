# Handoff: make the 50 character designs fully animated

## What you are building

Long Haul's port is full of animated aliens: shopkeepers who talk and react, crew acting out little jobs behind the counter, crowds strolling and pushing carts round the landing pad, passengers who sit in your cabin, and faces on the comms screen. Today those are the 30 species built by `Folk.make()`.

The 50 character designs you made for PR #2 (`art/characters/src/`, with 500 named residents in `assets/characters/residents.json`) are now in the game, but only as **static sculptures**. They can't walk, wave, blink, change expression, sit or hold things, so they can't take over from the current aliens.

**Your job: rebuild each of the 50 designs as a fully animated species**, in the same format as the species pack, so the game can animate them exactly like the current aliens. Claude (in the main session) will then swap them in for the current models in shops, crews, crowds and passengers.

- Repo: `github.com/johnshawler/space-cruiser`, branch `main` (live on GitHub Pages).
- **Work on a new branch called `animated-cast`** and finish with a pull request into `main`. Do not push to `main`, do not deploy.
- Touch only the files listed under "Files you will create or edit".

## Read these first

1. **`docs/handoff-species.md`**: the species-pack brief. Its sections "The build function", "The toolkit", "The contract", "Performance", "The style" and "The words" are the rules for this job too. Everything there applies unless this file says otherwise.
2. **`Folk` in `src/08b-venues.js`**: how the game animates a character (`walk`, `arms`, `mood`, `blink`, `hold`, `rest`, `ground`).
3. **Three or four files in `src/species/`** (for example `bobbinor.js`, `gaugekin.js`, `parasolum.js`): working examples of `build(T)`, including a custom `U.gait`.
4. **Your own sculpt code**: `art/characters/src/` (`characters.js`, `new-cast.js`, `aliens.js`, `robots.js`, `outer-aliens.js`, `outer-robots.js`, `sculpt.js`). These are the looks to keep.

## Where they go

**One file per design: `src/species/<id>.js`**, using the design's existing id as the species key (`orris`, `vela`, `tally`, `relay`, …: all 50). None of the 50 ids clashes with an existing species key. Each file adds one entry to `SPECIES_EXTRA`, exactly like the species pack:

```js
/* Orris: a green field botanist with leafy ears, always carrying a seed tray */
SPECIES_EXTRA.orris = {
  name:'Orris', kind:'orris', family:'alien', skin:'gloss', cast:true,   // cast:true keeps it out of the crowds until Claude swaps it in
  script:'curvy', col:'#7fc8a0', hue:160, sat:35, lit:52,
  syl:[ … ], voice:{ … }, trait:'…',
  chat:[ … ], greet:[ … ], cargo:[ … ], joke:[ … ], nice:[ … ], bye:[ … ], honk:[ … ], dock:[ … ], rumor:'… {planet} …',
  build(T){ … },
};
```

The species-pack integration in `build.sh`, `src/01-data.js` and `Folk.make()` is already done, so a new file in `src/species/` is picked up automatically. You don't need to edit those files. **Every one of the 50 entries must have `cast:true`**: species in `SPECIES_EXTRA` join the random crowds and encounters automatically, and `cast:true` keeps these out until the swap.

## Keep the look, add the joints

The game must be able to move these parts, so the sculpture has to be split into them. Inside each part the look should stay as close to the gallery master as you can.

| Part | What the game does with it | What to build |
|---|---|---|
| **Body** (`T.rig`) | bobs, leans and sways while walking and idling | everything that doesn't move on its own |
| **Head** (`T.head`, a child of the rig; set `T.head.position.y`) | turns up to ±0.9 rad to look at you, nods, bobs | the face, facing **+z** |
| **Two arms** (`U.arms = [left, right]`) | swing while walking; raised to wave, cheer, clap or facepalm (rotation.x and .z up to about ±2.8 rad); props are attached at the end of the **right** arm | a pivot group at each shoulder with the arm hanging straight **down** at rest and a hand at the end. Use `T.limb(...)` or build your own group that behaves the same way. Designs with more arms or tentacles: two go in `U.arms`, the rest in `U.tent` (they wave idly). |
| **Legs** (`U.legs`, zero or two) | swing ±0.7 rad in the walk cycle; rotated to −1.45 rad to sit in a cabin seat | hip pivots with the leg hanging down and a foot. Hovering, rolling, tracked or tentacle-standing designs leave `U.legs` empty and use `U.gait` instead. |
| **Eyes** (`U.eyes`) | blink (squash in y) and dart about | `T.eye(...)` for organic eyes; for screens, lenses or compound eyes, your own mesh with `mesh.userData.sy` set and pushed to `U.eyes` |
| **Brows** (`U.brows`, two) and **mouth** (`T.mouth`) | the five moods: neutral, happy, sad, shock, worried | every design needs both, robots included. Glowing screen brows and mouth are fine for robots. A design without a visible mouth today needs one added in a way that suits it. |
| **Gait** (`U.gait(phase, amount)`, optional) | called every frame while walking | each design's own way of moving: hopping, waddling, rolling on its wheel, hovering with a bob, crawling on tracks. Give every design a characteristic one. |

**Props the designs already carry** (Orris's seed tray, Tally's teaspoon, Nim's dandelion parasol and mailbag, sextants, lanterns and so on) should be parented to the hand or arm that holds them, so they move with it. The prop must not cover the face. Remember that the game also attaches its own props (mugs, hammers, batons) to the right hand, so keep that hand reachable.

**Fixed poses become neutral poses.** The masters are posed (an arm raised, a lean, a lifted foot). Rebuild each in a neutral standing pose: arms hanging down at their pivots, weight on both feet. Keep its character in the silhouette, head angle and props instead.

## Size and placement

- Origin between the feet at floor level (y = 0), facing **+z**, nothing below y = 0 at rest. Hovering designs keep their small air gap (the masters hover about 0.13 m).
- Standing height **1.1–1.9 m**, width under 1.3 m across the arms, depth under 1.0 m (the game scales them 1.2–1.4× in port and 0.66× in a cabin seat).

## Performance (this matters more than in the species pack)

The masters are detailed: 9 to 129 meshes each (median 29), with smooth 24×16 spheres. The game shows a dozen or more of these at once, on iPads too.

- Aim for **25 draw calls or fewer per character, 40 at most.** The easy way: build each part as before, then **merge all the static meshes inside each moving part into one mesh with vertex colours**. `ResidentDistrict.compile()` in `src/08f-residents.js` shows how the game already merges a whole design into one mesh. Do the same per part (body, head, each arm, each leg, each prop), keeping eyes, lids, brows and mouth as separate meshes so they can animate.
- Spheres 12×8 to 16×12 segments; keep fine detail (filaments, rivets, dial ticks) only where it reads at portrait size.
- Make materials once per build, not once per mesh. No textures, images, fonts or libraries.
- `build(T)` must use **`T.rand()` only**, never `Math.random`, so the same seed always gives the same character.

## Individuals: the 500 residents

Keep `assets/characters/residents.json` exactly as it is (ids, names, homeworlds, accents, heights and widths). The game will build a resident as `Folk.make(resident.base, seed, scale)` and then apply that resident's accent colour and proportions. So:

- Use `T.hsl(...)` (the per-seed hue variation) for the main body colour where it suits the design, so different seeds give recognisably different individuals of the same design.
- Name the main accent-coloured materials (`material.name = 'accent'`), so Claude can tint them to each resident's `accent`.

## The words

Each design becomes a speaking species, so each needs the full set of lines and a voice, written in the game's voice as described under "The words" in `docs/handoff-species.md`. Build each personality from the design's `role` and `habit` in `art/characters/src/` (Orris turns every leaf over before declaring a seedling healthy; Tally weighs every bent teaspoon). Robots use `script:'blocks'`. Spread `hue` values so crowds stay varied.

## Original designs only

These designs carry no film or game references any more, and the game's rule is original designs only. Don't reintroduce "inspired by" fields or titles, and keep each animated version recognisably the gallery design, not drifting towards any existing character. **Tally, Nim and Orris were recently redesigned for this reason. Use the current versions in `art/characters/src/`.**

## The gallery

The existing `?gallery` view (`src/99-species-gallery.js`) lists every species in `SPECIES_EXTRA`, with a turntable and buttons for the five moods, walk, wave, sit, hold a prop and next seed. Your 50 will appear there automatically. Use it to check every design. If it needs a filter or a section header to cope with 80 species, you may edit that file.

## Files you will create or edit

- create `src/species/<id>.js` for all 50 designs
- edit `src/99-species-gallery.js` only if the gallery needs a section for the new designs
- add a short "Animated cast" section to `README.md` (one line per design: its look and how it moves)
- rebuild with `bash build.sh`, so `long-haul.html` and `index.html` change too

Nothing else. In particular, don't change `Folk`, `ResidentDistrict`, `PortSites`, the species pools or any port code: Claude owns the swap-over.

## Checking your work

In `?gallery`, for every one of the 50:

- [ ] it builds with no console errors
- [ ] it stands on the floor (or hovers its small gap), faces +z and fits the size limits
- [ ] it still looks like its gallery master (put them side by side)
- [ ] it blinks, its eyes dart about, and all five moods clearly change its face
- [ ] walk (with its own gait), wave, sit and hold a prop all look right: no limbs through the body, props move with the hand
- [ ] three seeds give three individuals of the same design
- [ ] draw calls are 25 or fewer (40 at most); report each design's count in the pull request

In the normal game: it starts, lands, flies and docks with no console errors, and nothing new appears in crowds or shops yet (that's intended).

## When you're done

Open a pull request from `animated-cast` into `main` titled "Animated cast: 50 designs as animated species". List each design with its family, draw-call count, gait and a one-line description, note anything you couldn't get right, and include a screenshot of the gallery and one of a turntable mid-wave. Don't merge it yourself.

For Claude, later: the 50 designs are `SPECIES_EXTRA` entries keyed by their design id and marked `cast:true` (excluded from `ALIEN_POOL` in `src/01-data.js`). To swap them in, point the shopkeeper and crew choices in `Venues`, the crowd and passenger pools and `SPECIES_KEYS` at these keys. Then build residents with `Folk.make(base, seed)` plus their accent and proportions, and retire the static `ResidentDistrict` meshes.
