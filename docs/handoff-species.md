# Handoff: a species pack for Long Haul

## What you are building

Long Haul is a browser space-trucking game (Three.js r128, one HTML page, no build tools beyond a shell script). Its port crowds, shopkeepers, passengers, radio callers and portraits are all small 3D characters built from code. There are nine species today. Your job is to add **many more**: at least **20 new species**, roughly **two thirds organic aliens and one third robots**. They must look like they belong with the existing nine: the same toy-like, glossy, big-eyed, cartoony style.

You are only building and storing the species. **Do not** put them on planets, in shops, crowds or jobs. Another agent (Claude, in the main session) will wire them into the game later, so they must live in a predictable place with a predictable format. That place and format are defined below; please follow them exactly.

- Repo: `github.com/johnshawler/space-cruiser`, branch `main`.
- **Work on a new branch called `species-pack`**, and finish with a pull request into `main`. Do not push to `main`, do not deploy, do not edit the live site. (`main` is live on GitHub Pages.)
- Touch only the files listed under "Files you will create or edit". Other work is in progress on `main` in other files.

## How the project is put together

- All game code is in `src/*.js`. `./build.sh` concatenates `src/head.html`, `src/body.html`, the Three.js CDN scripts and then every `src/*.js` (in sorted order) into **one** `<script>` block, writing `long-haul.html` and `index.html`. There are no modules and no imports: every top-level `const` and `function` is a global shared by all files.
- Run it locally: `./build.sh`, then `python3 -m http.server 8765` in the repo root and open `http://localhost:8765/`.
- Species data lives in `src/01-data.js` (`const SPECIES = { blorpax:{…}, … }` and `const SPECIES_KEYS = Object.keys(SPECIES)`).
- The 3D characters are built by `Folk.make(speciesKey, seed, scale)` in `src/08b-venues.js` (the `Folk` IIFE near the top, around lines 76–200). `make()` switches on `SPECIES[key].kind` to build a body. **Read that whole `Folk` block before you start.** It is the style reference.
- Portraits (the faces in the side panel, dialogs and the cockpit comms screen) are rendered automatically from the 3D model by `Portrait` (just below `Folk`). If your model builds, its portrait works too; you don't draw portraits by hand.

The existing species, for reference (key, name, body kind):

| key | name | kind |
|---|---|---|
| blorpax | Blorpax | blob (three-eyed jelly bean with stubby arms) |
| zkthar | Zk'tharri | insect (glossy black compound eyes, antennae) |
| momwump | Momwump | fluffy (pink puff covered in tufts, round ears, nose) |
| vrell | Vrell | squid (tall mantle head, six tentacles it stands on) |
| grondar | Grondar | rock (faceted boulder, glowing slit eyes and mouth) |
| qeeble | Qeeble | bird (round body, beak, crest, flipper wings) |
| ooloo | Ooloo | jelly (translucent dome, glowing core, trailing tentacles) |
| sporrin | Sporrin | shroom (spotted cap, cream stalk body) |
| beepul | Beepul | robot (rounded-box body, neck, screen face, antenna) |

Do not change any of these, and do not reuse their keys or kinds.

## Where the new species go (this is the important part)

**One file per species, in a new folder: `src/species/<key>.js`.** For example `src/species/glimmerkin.js`. The key is lowercase letters only, unique, and also used as the species' `kind`.

Each file does exactly one thing: adds one entry to a global catalog, `SPECIES_EXTRA`.

```js
/* Glimmerkin: (one line on what they look like and what they are like) */
SPECIES_EXTRA.glimmerkin = {
  name:'Glimmerkin', kind:'glimmerkin', family:'alien',   // family: 'alien' or 'robot'
  skin:'gloss',                                           // material preset, see below
  script:'dots', col:'#7fd6ff', hue:195, sat:70, lit:58,
  syl:['glim','mer','kin','tink','ree','sha','plo','wim'],
  voice:{wave:'triangle',base:420,range:0.5,rate:6,glide:0.3,vib:5,vibAmt:10,fx:'chirp',amp:0.5},
  trait:'One short line about their personality.',
  chat:[ /* 5 or more */ ], greet:[ /* 2 */ ], cargo:[ /* 2 */ ], joke:[ /* 1–2 */ ],
  nice:[ /* 1 */ ], bye:[ /* 1 */ ], honk:[ /* 1 */ ], dock:[ /* 2 */ ], rumor:'… {planet} …',
  build(T){ /* builds the body, see "The build function" */ },
};
```

Keeping one file per species means Claude can find, list, change or turn on any one of them later without touching the others. `Object.keys(SPECIES_EXTRA)` is the full list.

### The integration (do these once)

1. **`build.sh`**: inside the `{ … }` block, just after `echo '<script>'` and **before** `cat src/*.js`, add:
   ```bash
   echo 'const SPECIES_EXTRA={};'
   cat src/species/*.js 2>/dev/null
   ```
   This puts the catalog first in the script, so every species file runs before anything else uses it. Load order then no longer matters.

2. **`src/01-data.js`**: directly **after** the existing line `const SPECIES_KEYS = Object.keys(SPECIES);` add:
   ```js
   /* the species pack (src/species/*.js): known to the game by key, but not in the random pools until wired in */
   Object.assign(SPECIES, SPECIES_EXTRA);
   const SPECIES_EXTRA_KEYS = Object.keys(SPECIES_EXTRA);
   ```
   This matters: `SPECIES_KEYS` is the pool the game picks random aliens from (crowds, NPC pilots, passengers). Because it is computed *before* the merge, the new species are fully usable by key (`Folk.make('glimmerkin', …)`, portraits, alien speech, voices) but **won't appear in the game yet**. Claude will decide where they show up.

3. **`src/08b-venues.js`, inside `Folk.make()`**: let a species from the pack build itself. Two small edits:
   - Where `body` is created, use the species' `skin` preset when it has one. Keep the existing expressions as they are; just choose between them:
     | `skin` | material (copy the existing code) |
     |---|---|
     | `gloss` | `phys(hsl(S.lit))` (the default glossy toy look) |
     | `metal` | the robot one: `phys(…,{roughness:0.3,metalness:0.55,clearcoat:0.8,clearcoatRoughness:0.15})` |
     | `fuzzy` | the fluffy one (`MeshPhysicalMaterial` with `sheen`, `roughness:0.95`) |
     | `stone` | the rock one (`MeshStandardMaterial`, `roughness:0.85`, `flatShading:true`) |
     | `jelly` | `phys(…)` then the jelly tweaks (`transparent`, `opacity:0.8`, `clearcoat:1`, `roughness:0.15`) |
     | `matte` | `new THREE.MeshStandardMaterial({color:C(hsl(S.lit)),roughness:0.8})` |
   - Replace `switch(K){ … }` with:
     ```js
     const X=SPECIES_EXTRA[sp];
     if(X&&X.build) X.build({S,rand:r,hsl,iris,rig,head,U,body,dark,light,browM,sph,cyl,bx,rbox,limb,eye,brow,mouth,blush,phys,catchM,
       glow:(hex,k)=>new THREE.MeshBasicMaterial({color:HDR(hex,k==null?2:k)})});
     else switch(K){ … unchanged … }
     ```
   Everything after the switch (scale, `low0`, shadows, `mood(F,'neutral')`) stays as it is and applies to your species too.

4. **`src/99-species-gallery.js`** (new): a viewer for checking your work, active only when the URL has `?gallery`. Details below.

### Files you will create or edit

- create `src/species/*.js` (one per species)
- create `src/99-species-gallery.js`
- edit `build.sh` (two lines), `src/01-data.js` (three lines), `src/08b-venues.js` (only the `body` material choice and the `switch` hook inside `Folk.make`)
- rebuild, so `long-haul.html` and `index.html` change too
- add a short "Species pack" section to `README.md` that lists every new species with its one-line description

Nothing else.

## The build function

`build(T)` receives a toolkit and must add meshes to `T.rig` (the body) and `T.head` (the face), and fill in parts of `T.U` so the game can animate the character. Everything is in metres, before scaling.

### The toolkit

| name | what it is |
|---|---|
| `T.S` | this species' data (hue, sat, lit, …) |
| `T.rand()` | seeded random number in [0,1). **Use only this for randomness**, never `Math.random`: the same seed must always give the same alien (portraits are cached by seed). |
| `T.hsl(l, sat?)` | a colour string in this individual's hue (the hue is already jittered ±13° per seed). `T.hsl(T.S.lit)` is the base colour. |
| `T.iris` | this individual's iris colour |
| `T.rig`, `T.head` | groups to build into. `head` is a child of `rig`; **set `T.head.position.y`** to where the face sits. |
| `T.U` | the character's animation record (see contract) |
| `T.body`, `T.dark`, `T.light`, `T.browM` | the body material from `skin`, plus darker (lit × 0.55) and lighter (lit × 1.28) glossy tones and a brow colour. Prefer these over new colours so every individual's palette hangs together. |
| `T.sph(r,m,x,y,z,ws,hs)` | sphere mesh (positioned; add it yourself) |
| `T.cyl(r1,r2,h,m,x,y,z,seg)` | cylinder mesh |
| `T.bx(w,h,d,m,x,y,z)` | box mesh |
| `T.rbox(w,h,d,r,m,x,y,z)` | rounded box mesh (robots) |
| `T.limb(parent,x,y,z,len,r,m,hand,foot)` | an arm, leg or tentacle that hangs down from a pivot at (x,y,z), with an optional round hand (material) or flat oval foot (material). It is added to `parent` and returned. |
| `T.eye(parent,U,x,y,z,r,lidMat,iris)` | the house eye: white ball, coloured iris, pupil, two catchlights, a blinking upper lid (in `lidMat`, default the body). Registers itself for blinking, looking around and moods. |
| `T.brow(parent,U,x,y,z,len,thick,m,side)` | a capsule eyebrow; `side` is -1 (left) or 1 (right). Registers for moods. |
| `T.mouth(parent,U,x,y,z,size,glowMat?)` | the house mouth: a smile arc plus an "o" for surprise, with a tongue. Pass a glow material for robot or glowing mouths. Registers for moods. |
| `T.blush(parent,x,y,z,r)` | two translucent pink cheek spots |
| `T.phys(hex, extra?)` | a glossy clearcoat material in any colour (for accents: beaks, horns, spots) |
| `T.glow(hex, k?)` | an HDR glowing material (screens, robot eyes, cores, antenna tips). It blooms, so use it sparingly. |
| `T.catchM` | the white catchlight material, for custom eyes |

Look at how each existing `case` in `Folk.make` uses these. Copying their proportions is the fastest way to match the style.

### The contract (the game relies on all of this)

- **Feet on the ground, facing forward.** The origin is between the feet at floor level (y = 0), and the character faces **+z**. Nothing should sit below y = 0 at rest (a centimetre or two for feet is fine).
- **Size.** Standing height **1.1–1.9 m**, width **under 1.3 m** across the arms, depth **under 1.0 m**. The game scales them 1.2–1.4× in port, and 0.66× when seated in the passenger cabin's 0.68 m wide seats.
- **Head.** The face is built on `T.head`, with the eyes on its +z side. The game bobs the head, turns it up to ±0.9 rad to look at you, and nods it (rotation.x).
- **Exactly two arms in `U.arms`**, as limbs that hang straight down from shoulder pivots, `[left, right]`. The game swings them while walking, raises them to wave, cheer, clap or facepalm (rotation.x and .z up to about ±2.8 rad), and attaches props (hammer, mugs, batons) at the end of the right arm. If the species has tentacles, put them all in `U.tent` and pick two of them as `U.arms` (see the `squid` and `jelly` cases). Tentacles not used as arms wave idly.
- **Legs: zero or two in `U.legs`**, as limbs hanging from hip pivots with feet (`T.limb(…, null, footMaterial)`). The walk cycle swings them ±0.7 rad; seated passengers rotate them −1.45 rad to sit. Legless species (hovering, blob-bottomed, tentacle-standers) leave `U.legs` empty and simply glide.
- **Eyes.** Use `T.eye(...)` for organic eyes. For glowing, screen or compound eyes, make the mesh yourself, set `mesh.userData.sy` to its resting y-scale and push it to `U.eyes`; blinking squashes it vertically. Every species needs a way to blink.
- **Brows and mouth.** Every species needs `T.mouth(...)` and two brows (`T.brow(...)`, or your own meshes pushed as `{b:mesh,side:-1|1,y:restY}` to `U.brows`). Moods (neutral, happy, sad, shock, worried) move these. Expressions are a big part of the charm, so make sure they read.
- **Optional:** a beak-like lower jaw can go in `U.beak` (a group that opens on shock; see `bird`).
- Don't set `F.scale`, `U.base`, `U.low0` or shadows yourself; `make()` handles them after your build.

### Performance

These characters appear in groups of a dozen or more, on iPads too. Keep each to **about 60 meshes or fewer** and modest sphere segments (the toolkit defaults are fine; tufts and spots can use 10–14 segments). Make materials once per build, not once per mesh. Don't load textures, images or fonts, and don't add libraries.

## The style

Match what's there. Open the game, land anywhere and look at the crowd, the shopkeepers and their portraits.

- **Toy-like and glossy.** Smooth primitives (spheres, capsules, rounded boxes, cones, tori), clearcoat sheen, soft saturated colours. No textures, no realism, no gore, no scary or sharp-toothed faces. Think vinyl collectible figures.
- **Big readable faces.** Eyes are large: 0.12–0.17 m radius on a head of about 0.4–0.6 m, with coloured irises and catchlights. Brows are chunky; the mouth is a simple arc. Most have pink blush cheeks. The face should still read in a 64-pixel portrait.
- **Chunky proportions.** Big head or body, small round hands, little feet or no legs at all. Short stubby limbs are funnier than long ones.
- **A clear silhouette per species.** Each new species should be recognisable from its outline alone, not a recolour of another. Vary body plans: round, tall, wide, segmented, stacked, floating, crawling, many-limbed.
- **One idea per species.** Each has a single strong visual hook (a teapot body, a lighthouse head, an accordion torso, a cloud that rains slightly, a stack of three heads that disagree…).
- **Colour per species.** Each has its own hue (`hue`, `sat`, `lit`). Spread hues across the wheel so the crowds stay varied. `lit` 45–65 works best.
- **Robots** share a family look with `beepul`: rounded boxes or capsules, metallic clearcoat (`skin:'metal'`), a visible neck or joint between head and body, a dark glossy screen or visor with glowing (`T.glow`) eyes, mouth and brows, plus an antenna, light or other small glowing detail. Vary the body plans (wheels, a single bouncing spring, hover jets, tracks, dome tops, cabinet bodies, many arms) and personalities. They should still be cute.
- **Original designs only.** No characters, species or robots from existing films, games, books or toys, even renamed.

## The words

The game's tone is dry, absurd and deadpan, in the spirit of a certain hitchhiking guide to the galaxy but **entirely original**: no quotes, names, numbers or in-jokes from it, or from anything else. Short sentences, gentle bureaucratic absurdity, cheerful aliens with odd priorities. Read the existing species in `src/01-data.js` for the voice; each has a clear personality that runs through all its lines.

- `trait`: one line. `chat`: 5 or more lines of radio small talk. `greet`: 2 (answering a hail). `cargo`: 2 (what they are hauling). `joke`: 1–2. `nice`: 1 (thanks for a compliment). `bye`: 1. `honk`: 1 (when you honk at them). `dock`: 2 (welcoming you to a port). `rumor`: 1 tip saying a planet is paying extra.
- Placeholders the game fills in: `{planet}`, `{good}` (a cargo name), `{port}`. `rumor` must contain `{planet}`; `dock` lines should contain `{port}`.
- Keep each line under about 140 characters, readable aloud, family friendly.
- `syl`: 8–12 short nonsense syllables. The game strings these together as the alien "original" shown above the translation, so they should sound like the species.
- `script`: how their writing looks on the cockpit screen: `'curvy'`, `'angular'`, `'dots'` or `'blocks'` (robots usually use `'blocks'`).
- `voice` (synthesised speech): `wave` is `'sine'`, `'triangle'`, `'square'` or `'sawtooth'`; `base` is the pitch in Hz (80 deep to 600 squeaky); `range` 0.2–0.8; `rate` (syllables per second) 3–9; `glide` 0–0.8; `vib`/`vibAmt` vibrato speed and depth; `fx` is `'none'`, `'bubble'`, `'chirp'`, `'chorus'`, `'click'`, `'robot'` or `'rumble'`; `amp` 0.2–0.7 (square and sawtooth are loud, keep them at 0.3 or less). Copy a similar existing species as a starting point.
- `col` is the species' accent colour in the UI (hex), roughly its body colour but bright.

## The gallery (`?gallery`)

Make `src/99-species-gallery.js`. It does nothing unless the page URL contains `?gallery`. When it does, it covers the game with:

1. **A grid** of every species: the nine originals first, then the pack. Each shows its portrait for three different seeds (use `portraitCanvas(key, seed, 160)`), plus its name and key. Large readable text: the game's owner has low vision, so use at least 20 px labels and big thumbnails.
2. **A turntable viewer** that opens when you click a species. Use its own `THREE.WebGLRenderer` and scene with a floor grid and a 1 m scale marker, and slowly rotate a `Folk.make(key, seed, 1)` model. Add large buttons for:
   - the five moods (`Folk.mood(F, m)`)
   - walk on/off (call `Folk.walk(F, phase, 1)` each frame)
   - wave (`Folk.arms(F, [0.3,2.6],[0.3,2.6])`)
   - sit: rotate `U.legs` to −1.45 and lift the model to seat height, about 0.47 m
   - hold a prop: `Folk.hold(F, someMesh)`
   - next seed

   Keep calling `Folk.blink(F, t)` each frame so the eyes blink and look around. Show the model's height, width and lowest point (`THREE.Box3`) so the size rules are easy to check.
3. A close button that returns to the game.

Keep it self-contained: it may call `Folk`, `portraitCanvas`, `SPECIES`, `SPECIES_KEYS` and `SPECIES_EXTRA_KEYS`, and must not change anything else.

## Checking your work

For every species, in the gallery:

- [ ] it builds with no console errors (check the browser console after opening the gallery and each turntable)
- [ ] it stands on the floor (lowest point within a couple of cm of 0) and is within the size limits
- [ ] it faces +z, with the face clearly readable in the 160 px portrait
- [ ] it blinks, its eyes dart about, and all five moods visibly change its face
- [ ] the walk cycle, wave, sitting and holding a prop all look sane: no limbs through the body, no prop lost inside the body
- [ ] three different seeds give the same species with small colour and iris variations
- [ ] it looks like it belongs next to the existing nine (put them side by side in the grid)

Also, in the normal game (no `?gallery`):

- [ ] the game still starts, lands and flies with no console errors
- [ ] no new species appears in crowds, shops or radio calls yet (that is intended)

## When you're done

Open a pull request from `species-pack` into `main` titled "Species pack: N new species". In the description, list each species (key, name, alien or robot, one-line look and personality), note anything you couldn't get right, and include a screenshot of the gallery grid. Don't merge it yourself.

For Claude, later: the pack is `SPECIES_EXTRA` (one file per species in `src/species/`), merged into `SPECIES` but kept out of `SPECIES_KEYS`; `SPECIES_EXTRA_KEYS` lists them. To bring a species into the game, add its key to the relevant pools (`SPECIES_KEYS` for crowds and NPC pilots, a planet's `species` or a venue's `sp` in `src/01-data.js` and `src/08b-venues.js`).
