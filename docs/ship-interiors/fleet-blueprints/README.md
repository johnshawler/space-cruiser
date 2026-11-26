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

Open the [nine-sheet blueprint set](Long-Haul-Fleet-Blueprints.pdf) to compare the five ships. The Rustbucket sheet records its existing deck. The four more valuable ships have proposed, distinct room arrangements. The [geometry source](editable/Fleet-Deck-Geometry.json) provides hull-local room polygons, doors, fixtures, lifts, passenger seats and repair points. The [SVG drawings](editable/) are editable.

| Ship | Layout | Design direction |
| --- | --- | --- |
| Dromedary 400 | Side-loaded freight deck and a residential deck in the raised hump | A Levantine family sitting room with two facing divans, a coffee galley and textile accents |
| Stellar Stoat | A single-deck courier with two bypass passages around a sealed cargo pod | Warm, book-lined captain’s quarters |
| Opulent Manatee | Passenger promenade and dome lounge above a separate service and baggage deck | Streamline Art Deco |
| Quasar Empress | An axial state deck and ring gallery over two cargo vaults | Japanese imperial-villa joinery and black lacquer |

John is reviewing the ships one at a time. The [Dromedary concept sheet](../dromedary/Dromedary-400-Concept.png) follows its new two-deck plan. The [earlier Empress image](../empress/early-shared-deck-study.png) is a material and atmosphere study made before the bespoke plans. Use the new Empress drawings for dimensions and layout. The four proposed plans still need 3D hull-fit checks and playtesting.
