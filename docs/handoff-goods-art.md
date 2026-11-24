# Handoff: cartoon models of the trade goods for Long Haul

## What you are building

Long Haul is a browser space-trucking game (Three.js r128, one HTML page, built by a shell script). In each port's cargo depot there is now a **goods shelf** beside the counter: a wooden display labelled "Today's goods" holding one small cartoon model per contract on the job board. Players hover a model to see what it is and click it to open that job.

Every good already has a **first-pass model**. They work, but they are quick sketches. Your job is to make all 26 of them **delightful**: richer, funnier, more readable, more clearly "that thing", while staying in the game's toy-like style and inside the size, performance and code rules below. You are only improving the models. The shelf, clicking, hover, layout and everything else stay as they are; Claude (in the main session) owns those.

- Repo: `github.com/johnshawler/space-cruiser`, branch `main` (live on GitHub Pages).
- **Work on a new branch called `goods-art`** and finish with a pull request into `main`. Do not push to `main`, do not deploy.
- Touch only the files listed under "Files you will create or edit". Other work is going on in other files.

## How the project is put together

- All game code is in `src/*.js`, concatenated by `./build.sh` into one `<script>` in `long-haul.html` and `index.html`. No modules or imports: every top-level `const` and `function` is a shared global.
- Run it locally: `./build.sh`, then `python3 -m http.server 8765` in the repo root and open `http://localhost:8765/`.
- The models live in **`src/08e-goods-art.js`**, in the `GoodsArt` module. That file is yours.
- The shelf that uses them is in `src/08b-venues.js` (`makeShelf`, `syncShelf`, `stepShelf`). Read it to see how your models are placed and animated, but don't change it.
- The goods themselves (names, value and a one-line handling note each) are in `src/01-data.js`, `const GOODS`. The note is a good source of jokes for the model, for example "Do not mix with right-handed wormholes."
- Each good also has a pickup and delivery story in `src/09-story.js` (`STORY_GOODS`). Read them: the best models nod to the story too.

## The contract (do not change these)

The rest of the game calls exactly one thing:

```js
GoodsArt.build(name, shady)   // returns a THREE.Group
```

- `name` is the good's exact name from `GOODS` (for example `'Haunted Rubber Ducks'`).
- `shady` is `true` for contraband. Contraband must stay the **suspicious "NOTHING" crate** (the current `crate(g, true)`): hiding what it really is is part of the game. Don't model contraband goods individually.
- Any name with no model of its own falls back to the plain goods crate. Keep that fallback.
- Keep `GoodsArt.has(name)`.
- Keep the module shape: an IIFE assigning `const GoodsArt`, with the per-good builders in the `ART` map keyed by exact good name. One builder per good keeps them easy to find and change later.

## Size, placement and how they're seen

- **Origin at the base, centred**: the model stands on y = 0, centred on x and z, and faces **+z** (the front faces the player).
- **At scale 1, fit inside 0.7 m wide × 0.75 m tall × 0.6 m deep.** The shelf scales models by 1.45, and each slot is about 1.05 m wide and 1.15 m tall, so anything bigger pokes into its neighbours or the shelf above.
- **How players see them:** from the front and a little above, about 15–20 m away, so each model is roughly **50–80 px tall on screen**. The game's owner has low vision. Design for that size: bold silhouettes, big shapes, strong colour contrast against the brown wooden shelf, and features you can read at a glance. Tiny text or fine detail disappears.
- **How they move:** each model slowly turns ±0.35 rad around y. On hover it grows 18% and wiggles; on click it hops. So it must look good from slightly left and right too, not just head on.
- Labels are fine when they are big and short (one word, like `SOUP`, `DECAF`, `WATER`). Use the existing `label()` helper.

## Style

Match the game's characters and props. Open the game, land at any port, go to the cargo depot and look at the shelf, the aliens and the crates.

- **Toy-like and glossy**: smooth primitives (spheres, capsules, rounded boxes via `Folk.rbox`, cylinders, cones, tori, simple extrusions), clearcoat sheen, saturated cheerful colours. No textures beyond small canvas labels, no realism, nothing scary.
- **Character where it's funny.** Several goods are alive or behave oddly: Sentient Cheese has opinions, Screaming Cactus screams, Haunted Rubber Ducks are haunted, Emotional Support Asteroids are supportive, Mildly Cursed Furniture glares. Give those faces using the googly-eye helper (`eye()`) and `smile()`. Inanimate goods should still have a visual gag: Dehydrated Water is an empty bottle labelled WATER; Bottled Uncomfortable Silence holds nothing but "…".
- **Glow sparingly** with `G(hex, k)` (an HDR material that blooms): magical, glowing or energetic things only (starlight, plasma, wormholes, static, antimatter). A little goes a long way.
- **One clear idea per good**, and a different silhouette for each, so the shelf reads as a varied collection and not a row of jars.
- **Original designs only:** no characters, logos or products from films, games, brands or toys.

## Performance

Up to 12 models are on screen at once, on iPads too.

- Aim for **25 meshes or fewer per model** (40 at the very most).
- Keep sphere and cylinder segments modest (8–24).
- Use the cached material helpers `P()`, `T()` and `G()` so materials are shared, not recreated per mesh.
- No textures except small canvas labels (keep them 256 px wide or less), no extra lights, no external assets, no new libraries.

## The goods (all 26)

| Good | Handling note (from `GOODS`) | First-pass model |
|---|---|---|
| Self-Heating Soup Bricks | Keep away from other soup. | stack of orange bricks, SOUP label, steam curls |
| Pre-Owned Moon Dust | Some dust may have settled in transit. | jar of grey dust with a glowing crescent |
| Artisanal Gravity (Small Batch) | This side down. Obviously. | glass jar with a heavy ball, G label, glowing ring |
| Unlicensed Nostalgia | Do not open near old photographs. | sepia snow globe with a little house |
| Left-Handed Wormholes | Do not mix with right-handed wormholes. | purple spiral of rings with a left arrow |
| Emotional Support Asteroids | Speak kindly to them. | smiling grey rock with a pink heart |
| Dehydrated Water | Just add water. | empty WATER bottle with dry flakes |
| Glow-in-the-Dark Shadows | Store in a well-lit dark place. | black blob with a glowing rim and eyes |
| Mildly Cursed Furniture | The ottoman is fine. Avoid the wardrobe. | small wardrobe with glowing red eyes |
| Bulk Googly Eyes | They are watching. They cannot help it. | blue bowl full of googly eyes |
| Fermented Starlight | Best before the heat death of the universe. | dark bottle with a glowing star inside |
| Decaf Plasma | All of the burn, none of the buzz. | DECAF mug of glowing blue plasma |
| Second-Hand Sunsets | Slight fading is normal. | framed sunset picture with a USED tag |
| Quantum Socks (Unpaired) | Count may vary when observed. | one striped sock and a see-through twin |
| Sentient Cheese (Mild) | It has opinions. Do not engage. | cheese wedge with holes, googly eyes, frown |
| Recreational Bubble Wrap | Do not pop. We will know. | roll of bubble wrap |
| Screaming Cactus Seedlings | Earplugs provided. Not enough earplugs provided. | potted cactus with an open mouth |
| Zero-G Hair Gel | Hold: infinite. | gel tub with floating blobs |
| Certified Pre-Chewed Gum | Certificate enclosed. | pink gum on a certificate with a seal |
| Novelty Oversized Atoms | Do not split. Seriously. | nucleus with three orbit rings |
| Bottled Uncomfortable Silence | Open only at parties. | empty bottle with a "…" label |
| Antimatter Sprinkles | Do not put on matter ice cream. | ⚠ ANTI shaker with glowing sprinkles |
| Tax-Deductible Fog | Receipts in the fog. Somewhere. | jar of fog with a receipt sticking out |
| Haunted Rubber Ducks | They float. They also remember. | translucent glowing duck with a ghostly aura |
| Slightly Used Tomorrows | No refunds on Tuesdays. | TOMORROW calendar with a "?" page |
| Organic Free-Range Static | May cling. | fluffy ball with eyes and lightning |

Improve every one. You may reinvent any model completely if you have a better idea, as long as it stays recognisably that good.

## A gallery for checking (`?goods`)

Create `src/99-goods-gallery.js`. It does nothing unless the page URL contains `?goods`. When it does, it covers the game with its own small Three.js view (its own `WebGLRenderer`, scene, lights similar to the depot's, and a wooden shelf backdrop) showing:

1. **All 26 goods plus both crates** (plain and `shady`) in a grid, each at shelf scale (×1.45), slowly turning, with the good's name under each in large text (at least 20 px; the owner has low vision).
2. **A "shelf view" toggle** that switches the camera to the game's real viewing angle and distance (from the front and a little above, about 15–20 m away, with the models scaled so they appear about 50–80 px tall), so you can judge readability as players will see it.
3. **A mesh-count readout** per model, so the performance budget is easy to check.

Keep it self-contained: it may call `GoodsArt`, `GOODS` and `Folk`, and must not change anything else.

## Files you will create or edit

- edit `src/08e-goods-art.js` (the models: yours)
- create `src/99-goods-gallery.js`
- add a short "Goods models" section to `README.md` (one line per good describing its model)
- rebuild, so `long-haul.html` and `index.html` change too

Nothing else.

## Checking your work

In `?goods`:

- [ ] every good builds with no console errors, and so do the plain and shady crates
- [ ] each model is within the size box at scale 1, stands on y = 0 and faces +z
- [ ] in shelf view, each good is recognisable at a glance at about 60 px tall, and no two look alike
- [ ] it looks right from the front and when turned ±0.35 rad
- [ ] mesh counts are 25 or fewer (40 at most)

In the game (no `?goods`):

- [ ] land at a port, open the cargo depot, and check the shelf: models sit inside their slots without overlapping each other or the shelf boards
- [ ] hovering still enlarges and wiggles a model with a tooltip; clicking still opens its job
- [ ] contraband still shows as the "NOTHING" crate
- [ ] no console errors

## When you're done

Open a pull request from `goods-art` into `main` titled "Goods models: richer cartoon versions of all 26 goods". In the description, list each good with a one-line description of its new model, note anything you couldn't get right, and include a screenshot of the gallery grid and one of the real depot shelf. Don't merge it yourself.

For Claude, later: the shelf calls `GoodsArt.build(job.good, job.kind==='contra')`, scales by 1.45, and keeps one model per contract (`syncShelf` in `src/08b-venues.js`). Merging this PR changes only how the models look.
