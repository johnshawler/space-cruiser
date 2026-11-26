# Handoff for Fable: Long Haul, 25 November 2026

## Where things stand

Long Haul is a browser space-trucking game. It uses Three.js r128 and is one HTML page built from the files in `src/`.

- **Repo:** `github.com/johnshawler/space-cruiser`. Read `CLAUDE.md` first: it covers the model guide, the economy rules, the lighting bake and the bespoke rooms.
- **Live:** **v0.40** on `main`, commit `a0059a7`. It's published at https://space-cruiser.johnshawler.com (GitHub Pages) and https://johnshawler.com/long-haul/.
  - The second address is a Cloudflare Worker that proxies GitHub `main` and serves only the page. It doesn't serve the `assets/` folder.
- **Open PR:** [johnshawler/space-cruiser#7](https://github.com/johnshawler/space-cruiser/pull/7). It merges branch `long-haul-integration` (head `27c8b9d`) into `main`.
  - It's mergeable, and it already contains everything up to v0.39 plus the v0.40 warp radio fix.
  - **Merging and publishing it is John's decision. Don't merge it.**

### What PR #7 does

It wires the Blender models into play:

- **Shops:** 30 bespoke depots, garages and cantinas, each with its own lights, HDR sky and colour grade.
- **Cockpits:** 5 bespoke cockpits, with the six panels and the fittings moved onto the model's anchors.
- **Decks:** 5 walkable decks, keeping the repair spots, passenger seats and crates.
- **Cast:** finished materials on the animated cast.

The main code:

| Code | What it does |
| --- | --- |
| `src/02b-assets.js` | Loads the models and assets |
| `Venues.bespoke` / `swapRoom` in `src/08b-venues.js` | Swaps in the bespoke shop room |
| `Cockpit.bespoke` in `src/07-cockpit.js` | Swaps in the bespoke cockpit |
| `Interior.bespoke` in `src/09-walk.js` | Swaps in the walkable deck |
| `tools/check-assets.mjs` | Validates the manifests (passes) |

Known gaps in PR #7:

- The johnshawler.com copy only gets the models after the merge and the Pages redeploy, because the loader falls back to the Pages copy. The alternative is for the Worker to serve `assets/`.
- Decks always show four passenger seats, even on smaller hulls.
- No test on a real iPad.
- Most of the 30 rooms were checked only by the validator, not by eye.

### Merge v0.40 into the integration branch

`main` now has a v0.40 commit that the integration branch lacks (just the byline and the built pages). Before review, merge `origin/main` into `long-haul-integration`. Expect the only conflicts in `src/body.html`, `index.html` and `long-haul.html`. Then rebuild.

## Two small tasks John just asked for (not started)

Make these on `main` as a quick release, then merge `main` into the integration branch. Follow "Push and publish" below.

### 1. Show the landing message only on the first landing of a game

The message is in `src/10-main.js`, in the planet loop of the flight update (around line 97):

```js
if(!s.warp&&s.warpF<0.2&&d<P.landR&&s.departed!==P.idx){ UI.toast(P.port+' has you. Landing is automatic.','good'); Cine.startLanding(P); return; }
```

Show the toast only the first time in a game. Keep `Cine.startLanding(P)` every time.

- **Where to keep the flag:** put it in `G.stats`, for example `G.stats.landed=true`.
  - `G.stats` is saved: `Game.save()` writes `stats` to `localStorage` key `longhaul.v1`.
  - It's reset to `{deliveries:0,earned:0}` on a new game (the reset is in `src/10-main.js` around line 143), so the message comes back for each new game.
- **Old saves:** they have no flag. Treat `G.stats.deliveries>0` as "already seen" so returning players don't get it again.

### 2. A "your ship's specs" button on the shipyard screen

The shipyard tab is built in `src/09-ui.js`, in the port tab code (`this.tab==='yard'`, around line 117).

- Each ship for sale already has **Preview** and **Specs** buttons, passed in as the extra-buttons array, the last argument of `this.card(...)`.
- The first card, "Sell your …", has no Specs button. Your own ship only appears in the list if that yard sells it.
- `Specs.show(i)` is in `src/09-cargo.js`, around line 268. Called with no argument, it shows your current ship.

Add a **Specs** button to the "Sell your …" card. Use the same pattern: `const sp=el('button','btn','Specs'); sp.onclick=()=>Specs.show();`, passed as `[sp]`. The Rustbucket's sell card should get the button too.

## Push and publish (John's routine)

When John says "push and publish":

1. **Bump the byline** in `src/body.html`: "By John Shawler & Claude · v0.NN". The next one is **v0.41**.
2. **Build:** `bash build.sh`, which regenerates `index.html` and `long-haul.html`.
3. **Syntax-check:** compile each inline `<script>` block of both pages with `new Function(...)` in node. There should be 0 errors.
4. **Commit** with a short summary of the changes. End the message with the trailer line from your attribution instructions.
5. **Push to `main`.**
6. **Poll both live sites** with a cache-busting query until both show the new version twice in a row. Pages can take a minute or two.
   - If the GitHub Pages deploy fails with HTTP 500, `POST repos/johnshawler/space-cruiser/pages/builds` has worked when a rerun didn't.
7. **Check the console:** open the live page and confirm there are no console errors.
8. **Changelog:** give John a short changelog with links.

## Working rules

- **Commit and push only when John asks.** PR bodies end with the "Generated with Claude Code" line.
- **Large text.** John has low vision: use large text in anything you build, and keep replies plainly laid out.
- **Original designs only.** No characters, logos or designs from films, games, brands or toys.
- **Keep the economy separate.** Residents and landmarks are scenery only. Keep `PLANETS` in its order, because saves store planet indices.
- **Never run `localStorage.clear()` on the live sites.** It wipes John's save.
- **Local servers:** port 8765 belongs to other sessions. Use a temporary `.claude/launch.json` entry on another port, and run `git checkout -- .claude/launch.json` before committing. Don't kill other sessions' processes.
- **Measuring smoothness:** the in-app browser pane runs at about 1 fps when hidden. To measure stutter, time each blocking step rather than the frame rate.
- **Shader recompiles:** adding or removing a live light in a port scene recompiles every material, which stalls for seconds. Bespoke rooms keep the stock room's two live lights for this reason.

## Testing tips

- Serve the repo root over HTTP and open `index.html`. Fly toward a planet to land, or use the dev hooks in `src/10-main.js`.
- `?nobake` shows the live lighting, `?noassets` turns off the bespoke models, and `?assets=<url>` picks where models load from.
- To check the johnshawler.com setup locally, serve the page under `/long-haul/` without `assets/` beside it. The loader should fall back to the Pages copy.
