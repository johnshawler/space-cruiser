# Long Haul ship design handoff

## Rustbucket Mk I

The [editable fitted deck](../../../art/ship-interiors/source/Rustbucket-Repair-States.blend) contains the seven original interaction anchors. Each `fault_<id>` empty has a `repair_state` property. Select 0 for working, 1 for broken or 2 for repaired. Each station has an inspection camera in the walkable scene. The [proof sheet](../rustbucket/repair-states.jpg) shows the three versions of every fitting.

| Game fault | Location | Field repair |
| --- | --- | --- |
| coolant | Passenger cabin | Bolted sleeve on the heater return |
| thruster | Engine room | Injector cover cleats and rerouted jumper |
| fuse | Galley | Blue-banded replacement radio fuse |
| scrubber | Scrubber bay | Cleared fan and new guard retaining rim |
| crack | Corridor | Riveted and sealed salvage plate |
| strap | Cargo hold | Replacement webbing and cross-lacing |
| seal | Airlock | New sealing cord and four keeper clips |

The [runtime manifest](../../../assets/ship-interiors/rustbucket-repairs/manifest.json) holds the 21 GLB paths, game-space positions, yaw angles and superseded fitted parts. Use the [installation notes](../../../assets/ship-interiors/rustbucket-repairs/README.md) alongside the current deck bake. Exclude **all three swappable state collections** from the static room bake. Keep the stationary heater pipe extensions. Attach exactly one state mesh per fault at its anchor. Preserve the existing fault effects, status screens and interaction points. Scope this change to the Rustbucket.

The original fitted Rustbucket is already checked in alongside this Blender file. The [room renders](../rustbucket/fitted/room-proof.jpg) and [scaled cutaway](../rustbucket/fitted/deck-cutaway.jpg) show that source. Claude’s integration commit `0c1729b` already uses the fitted deck. Preserve subsequent bedding, seating and bake fixes when bringing across the selectable fittings.

The source build inspected at `8f156a73be7c80144347d71f617453710ffc15cd` tracked active faults. To retain the visible field repair, save repair history per owned hull. Give active faults precedence, show repaired for previously fixed inactive faults, and show working for the remainder. Check current integration progress before editing the game or repeating any bake.

The [reimport check](../rustbucket/repair-glb-check.json) covers all 21 GLBs. The [placement check](../rustbucket/repair-placement-check.json) found each state visible from inside its room and zero hits at 90 doorway samples per variant. Game integration and a playtest are separate from these asset checks.

## Fleet floor plans and concept art

Open the [nine-sheet blueprint set](Long-Haul-Fleet-Blueprints.pdf) to compare the five ships. The Rustbucket sheet records its existing deck. The four more valuable ships use these distinct room arrangements. The [geometry source](editable/Fleet-Deck-Geometry.json) provides hull-local room polygons, doors, fixtures, lifts, passenger seats and repair points. The [SVG drawings](editable/) are editable.

| Ship | Layout | Design direction |
| --- | --- | --- |
| Dromedary 400 | Side-loaded freight deck and a residential deck in the raised hump | A Levantine family sitting room with two facing divans, a coffee galley and textile accents |
| Stellar Stoat | A single-deck courier with two bypass passages around a sealed cargo pod | Warm, book-lined captain’s quarters |
| Opulent Manatee | Passenger promenade and dome lounge above a separate service and baggage deck | Streamline Art Deco |
| Quasar Empress | An axial state deck and ring gallery over two cargo vaults | Japanese imperial-villa joinery and black lacquer |

The [Dromedary concept sheet](../dromedary/Dromedary-400-Concept.png) informed its two-deck model. The [early Empress study](../empress/early-shared-deck-study.png) records the initial material direction.

## Fitted fleet models

The deck masters include the exterior game meshes in a collection named `Exterior hull / fit reference`. Enable that collection in the Outliner to inspect the hull at full scale. Each numbered room contains its editable shell, joinery, furnishings and lights. Select a `fault_` empty and set its `repair_state` property to 0, 1 or 2 to inspect the working, broken or repaired fitting.

| Ship | Blender masters | Rendered views |
| --- | --- | --- |
| Dromedary 400 | [Fitted ship](../../../art/ship-interiors/dromedary.blend) · [Cockpit](../../../art/cockpits/dromedary.blend) | [Room](../dromedary/fitted-room.jpg) · [Cutaway](../dromedary/deck-cutaway.jpg) |
| Stellar Stoat | [Fitted ship](../../../art/ship-interiors/stoat.blend) · [Cockpit](../../../art/cockpits/stoat.blend) | [Room](../stoat/fitted-room.jpg) · [Cutaway](../stoat/deck-cutaway.jpg) |
| Opulent Manatee | [Fitted ship](../../../art/ship-interiors/manatee.blend) · [Cockpit](../../../art/cockpits/manatee.blend) | [Room](../manatee/fitted-room.jpg) · [Cutaway](../manatee/deck-cutaway.jpg) |
| Quasar Empress | [Fitted ship](../../../art/ship-interiors/empress.blend) · [Cockpit](../../../art/cockpits/empress.blend) | [Room](../empress/fitted-room.jpg) · [Cutaway](../empress/deck-cutaway.jpg) |

The exterior fit check sampled bulkhead edges every 25 cm at five heights from floor to ceiling. The Dromedary’s main enclosure extends 0.5 m farther forward around the dispatch room. All four fitted plans cleared the sampled hull surfaces.

Use **L** at the cockpit doorway to sit down. Stand on a lit lift platform and press **F**, or tap **Fix** on touchscreens, to change decks. Repair prompts and passenger conversations follow their assigned deck. Each cockpit and each room carries its own baked Cycles lighting in the game GLB.

Rebuild one ship with Blender 4.5 LTS. Replace `dromedary` with the ship’s filename.

```sh
blender -b --factory-startup --python-exit-code 1 -P art/cockpits/dromedary.py
blender -b --factory-startup --python-exit-code 1 -P art/ship-interiors/dromedary.py
bash build.sh
node tools/check-assets.mjs
```

A normal rebuild reuses the hull embedded in the deck master. After editing the Three.js exterior, run `node art/ship-interiors/fleet/hulls.cjs /path/to/three-r128.cjs /tmp/fleet-hulls` and set `FLEET_HULL_DIR=/tmp/fleet-hulls` for the Blender rebuild.
