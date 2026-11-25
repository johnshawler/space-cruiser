# Long Haul

A first-person space cargo simulator that runs in the browser. Fly from the cockpit, haul oddly named goods between nine planets and four remote research stations, chat with alien pilots, and save up for a bigger ship.

Play it at https://johnshawler.com/long-haul or https://space-cruiser.johnshawler.com

## Controls

| Key | Action |
| --- | --- |
| W A S D | Steer (W is nose up; the INV PITCH switch flips it) |
| Q / E | Roll |
| 1 – 0 | Throttle, slowest to fastest |
| X | All stop |
| Z | Warp drive |
| T | Next destination |
| P | Autopilot |
| H | Hail the nearest pilot |
| G | Horn |
| Arrows or drag | Look around |
| M | System map (click a world to set your destination) |
| N | Cabin music on / off |
| F (hold) | Mining laser, aimed at a rock in your sights |
| I | Cargo hold: see what is aboard and drop any of it |
| B | Cargo scoop open / closed |
| L | Leave the pilot's seat and walk around the ship (L at the cockpit door to sit) |
| Walking | W A S D to move, Q / E to turn, Shift to hurry, drag or arrows to look, hold F to repair, F to chat |
| 1 – 4 | Pick an answer when a message pops up |
| Double-click | Lean in to any part of the cockpit; double-click again to lean back |
| ? | Help |

### On an iPad or other touch screen

On-screen controls appear by themselves: a steering stick on the left, and a throttle slider plus Warp, Auto, Mine (hold), Horn, Hail, Next, Map, Hold, Walk, Scoop and Help buttons (while walking: Fix · Chat and Seat) on the right. Drag the view to look around, double-tap a panel to lean in, and double-tap open space to lean back. Radio chatter shows as a large caption at the top of the screen. The game fits both landscape and portrait, but landscape shows the whole cockpit.

## Ports

Every planet has its own mix of places. Each one sits in its own part of the port, a few hundred metres from the pad and from the others, with its own neighbourhood (warehouses, a hangar and showroom, workshops, paint booths, market stalls, a mine head, a cantina with fairy lights) and its own shopkeeper. There's no side panel: everything happens in the scene. A wooden signpost beside each counter has an arm for every shop in the port; tap one to go there. What the shop sells sits along the counter as big price tags, each with its button. The shopkeeper speaks in a speech bubble over their head, and in the cantina the locals take turns. Your money, the Hold and Ship buttons and the Launch button sit on a sign in the top-right corner. On a phone the signpost moves up under that sign. The cargo depot has a goods shelf beside the counter with a cartoon model of every contract on the board (a haunted rubber duck, a cheese wedge with opinions, a screaming cactus, a crate of definitely-nothing); hover over one to see what it is and where it's going, and click it to pop up its job ticket above it, with an Accept button. Escort jobs, which have no model, get a price tag on the counter instead. The models live in `src/08e-goods-art.js`. Moving between shops is a quick fade to black and back. Tap Ship on the top-right sign, or Specs on a shipyard card, to see a ship's specs: every ship lists the same categories (cargo hold, passenger seats, cruise speed, warp speed, fuel tank, handling, price new), and yours adds how it is doing now. Every face on a price tag is rendered from that alien's 3D model. Every shop is a real room: walls with windows, a ceiling with beams and lights, and furniture to suit the trade (pallet racks, workbenches and tyre racks, paint shelves, display cases, ore bins and a boulder scale, cantina booths). The cargo depot is a low shed with a stock room at the back. The shipyard is a hangar hall big enough to park ships in, with display ships roped off, sale banners and the showroom pad, where previewed ships park, inside it. Behind the counter a crew tries to do its job: stacking crates, craning an engine into place, test-firing an engine, painting a panel, opening a mystery box, cracking a rock, or juggling mugs. It usually goes wrong. Sometimes it goes right.

- **Cargo depot** (every port and station): contracts and fuel.
- **Shipyard** (Verdanthia, Sloshwell, Amethyne, Jovexa): each sells a different range of ships. Your ship is worth half what it cost new, less any hull damage. A new ship comes with a clean hull, no faults, a clean canopy, cool engines, a full tank and factory paint; cargo, passengers and fittings move across. You can also sell your ship outright and leave in a free Rustbucket Mk I.
- **Garage** (Verdanthia, Scorchmaw, Toxibloom, Jovexa, Brrrindle and all four stations): hull repairs and a canopy wash.
- **Paint shop** (Dunemoor, Amethyne, Jovexa): new paint jobs for your ship.
- **Outfitter** (Scorchmaw, Amethyne, Candara, Calibration Spire): the mining laser upgrade and the hidden compartment.
- **Assay office** (Scorchmaw, Sloshwell, Candara, Brrrindle, Beacon Far Wink): buys mined ore.
- **Cantina** (most ports): gossip, and tips on where deliveries pay extra.

## Port life

Locals stroll around the landing pad, stop to chat, push carts of crates about, and a marshal waves you in with glowing batons. Other ships land on and take off from the neighbouring pads. When you launch with new cargo, the hatch folds down into a ramp and two dockhands carry it aboard. Most loads (70%) go in cleanly. Sometimes (20%) the stack falls over and a crate cracks open (you lose half that crate's share of the contract), or, more rarely (10%), the last crate slides back down the ramp and bursts (you lose its whole share). Lost units come off the contract and its pay drops to match; a message after takeoff says what went. Fragile cargo gets a red FRAGILE stamp and is far more likely to come to grief: with anything fragile in the load the odds are 50% clean, 20% topple, 30% burst, and the fragile crate is the one that breaks. Skipping the scene doesn't save the cargo. Then you blast off: the camera rides above the ship looking down, and the port shrinks away underneath you, with roads running out to the shops, hover-trucks on them, air-cars circling in lanes, ships on the neighbouring pads and the crowd on the apron, until it all disappears into the haze.

## Your ship

Get up from the pilot's seat (L) and walk around inside: a corridor with handrails and signs over every door, a passenger cabin with cushioned seats under the portholes, a galley with cupboards and a bunk, the cargo hold (its crates match how full it is) and the engine room. Passengers sit in the cabin seats, wave when you come over, and wear how the trip is going on their faces. The ship keeps flying while you walk, on autopilot if it is set. The radio only reaches the pilot's seat: while you walk you hear no chatter and get no calls, and anyone who hails you (a customs cutter, a distress beacon) waits until you sit back down. Your passengers still talk to you. Walking backwards is half speed.

Things break. A coolant leak (fuel use up), a thruster misfire (top speed down), a blown fuse (radio dead), a jammed air scrubber (passengers cross, canopy fogs), a hull crack (hull slowly failing), a snapped cargo strap (cargo loses value faster). Each shows on screen and in the ship itself, at its own fitting with a status screen and light: flashing red and visibly broken (a split, leaking coolant flange; a thruster panel hanging open over a glowing coil; a fuse box with a charred fuse; a scrubber clogged with fluff; a frosting crack; a snapped strap), or steady green and put right (a taped joint, a closed panel, a shut fuse box, a spinning fan with a ribbon in the draught, a riveted patch plate, taut straps). Walk to it and hold F to fix it. It goes slowly while the ship is shaking, above throttle 5 or in warp.

## Research stations and deep space

Four research stations sit far out past the planets, from 1.75 to 3.2 million km from the sun: **Listening Post Hush** (a giant listening dish), **Cryo Vault Rimeholm** (frozen samples of everything), **Calibration Spire** (measures the universe) and **Beacon Far Wink** (the furthest lighthouse). From space each is a hub with a turning ring, solar wings and blinking lights. You dock on an open metal deck with the station's wheel overhead and a planet in the sky. They're crewed by the newer species and have a cargo depot (fuel costs 6 cr a unit out here instead of 3), a garage, and a cantina, outfitter or assay office depending on the station. A fourth asteroid field, **The Back of Beyond**, lies near Far Wink and has the best ore in the system.

Space has three zones, shown in the top-left corner while you fly and as dashed rings on the system map:

- **Patrolled** (inside 1 million km): the planets you know.
- **Frontier** (1 to 1.45 million km, around Jovexa and Brrrindle): the odd raider.
- **Deep space** (past 1.45 million km) and **the far dark** (past 2.5 million km): no patrols and no customs, but raiders who demand a toll, meteor storms (keep the throttle at 4 or lower until it passes and you take no damage, and may scoop up Meteor Glass), derelict survey probes worth salvaging (some booby-trapped), riskier maydays with bigger rewards, and much dearer tows. Events come more often in the far dark.

Every route has a risk level, the riskier of its two ends: **Low** (×1 pay), **Medium** (×1.2), **High** (×1.5) or **Extreme** (×1.9). The job board shows it on every contract, along with how much of a full tank the trip takes, and warns when it needs more than one tank. From a planet, the first couple of jobs always stay in safer space. Contraband now pays more the stricter the customs at both ends. The system map opens framed on the planets, with the stations pinned to its edge; scroll out to see deep space.

## Deliveries

Every job has a story: who is sending it, who it is for and why. You read it on the contract. When you accept a crate, the depot's stock droid goes into the stock room and carries it out to the counter. When you hand it over at the far end, you find out how it turned out, under "What happened next". Passengers, VIPs, lost property and the crates nobody mentions all get an ending too.

When you land at a destination, nothing is paid automatically. Go to the cargo depot and hand each delivery over yourself (or see your passengers off) to get paid, or hand over everything at once. If you try to launch with deliveries still aboard, the depot asks first.

## Time and throttle

Every delivery has an on-time window based on the distance. Deliver within it for full pay; after that the pay slides, down to 30%. Only flight time counts. Passengers work the same way.

Full throttle is not always the answer:
- Ports keep a 400 km/s inbound speed limit in their approach zone. Speeding gets you a fine when you land.
- Throttle 9 and 10 heat the engines. Keep it up and something in the engine room breaks.
- Fragile cargo (better paid) takes damage at throttle 8 and above, and when you turn hard at speed.
- Repairs, the scoop and mining all want you going slowly.

## Side work

- **Passengers.** Cantinas have people wanting a ride. They sit in your cabin (two to four seats, by ship), and you can go back and chat. Their fare drops if the trip runs long.

- **Radio calls.** About every 30 seconds someone calls on the band you are tuned to, and most calls come with up to four answers. A call shows only on the cockpit's radio screen, with a flashing bar and a countdown; click that screen (or press Enter) to open the answers, then pick one (keys 1 – 4). Leave it and the caller gives up. The answers matter: fees, fines, tips, small jobs, fuel, reputation, races, hugs.
- **Lost property.** Pilots who have lost something, and Trade Net bulletins about missing shipments, put a real object in space near the planet they name. Open the scoop, fly up to it slowly, and take it to its owner's world to get paid.
- **Cargo hold and scoop.** Press I to see your hold and drop anything in it. Dropped cargo floats where you left it and can be scooped back up (B opens the scoop; slow below 450 km/s). Dropping a client's cargo costs reputation, which you get back if you recover it. Dumping contraband before a customs stop is allowed, if not encouraged.

- **Distress calls.** Maydays come in mid-route. Answering costs time and fuel and might pay off, or it might be a pirate ambush. Ignoring one costs reputation.
- **Asteroid mining.** Four asteroid fields are on the system map, the last of them in the far dark. Hold F on a rock to mine ore and sell it at an assay office (Scorchmaw, Sloshwell, Candara, Brrrindle or Beacon Far Wink). Slower than hauling, a little dangerous, and it never depends on a job board.
- **Contraband.** High-paying, illegal cargo with a discovery roll at three points: loading, a customs stop on the way, and unloading. Bribes and a hidden compartment change the odds; the compartment also adds one unit of hold space.
- **Escorts.** Protect a nervous VIP's ship to its destination. Keep close, scare off pirates with the horn, slow down for debris, and talk them down when they panic.

Your reputation changes what jobs pay and how closely customs look at you.

Every gauge, knob, switch and lever in the cockpit works. Landing is automatic. Progress saves in the browser at each port.

## Building

Everything is generated in code with Three.js r128; there are no art or sound assets.

```bash
./build.sh
```

This bundles `src/` into `index.html`. To run it locally:

```bash
python3 -m http.server 8765
```

## Species pack

Open `?gallery` to compare three portraits per species and inspect the animated models at full scale. Select **Walk** and **Silhouette** to compare movement and outlines. The 21 additions live in `src/species/<key>.js`. Use `SPECIES_EXTRA_KEYS` to enumerate them or `Folk.make(key, seed, 1)` to preview one. All 30 species now turn up in random encounters (`ALIEN_POOL`): passing pilots you can hail, radio callers, maydays, port crowds and shop crews, cantina regulars, job senders, passengers and the people your deliveries are for. Each planet's own species and the named shopkeepers stay as they were. The original nine's updated models and individual movement cycles are in `src/08a-original-folk.js`. The gallery, radio portraits, and port characters all use the same builders.

| Key | Species | Family | Appearance and personality |
| --- | --- | --- | --- |
| `bractillo` | Bractillo | alien | A walking seed pod with overlapping leaves packs lunches for migrating birds. |
| `cuspiro` | Cuspiro | alien | A crescent-headed dune grazer lends the space between its horns to small birds. |
| `loamlet` | Loamlet | alien | A terracotta burrower with chimney ears grows a different garden in each pocket. |
| `nacrelle` | Nacrelle | alien | A pearl nestled in a fan shell listens for the quietest noise in each port. |
| `parasolum` | Parasolum | alien | A scalloped umbrella glider insures picnics against excessive sunshine. |
| `pipettle` | Pipettle | alien | A kettle-bellied marsh grazer whistles politely when the queue should move. |
| `pluvindle` | Pluvindle | alien | A low raincloud on dangling droplet legs measures weather in teaspoons. |
| `rilloon` | Rilloon | alien | A bellows-bellied singer takes attendance at every echo. |
| `rimebud` | Rimebud | alien | A faceted ice bud keeps souvenirs of weather in cold storage. |
| `tessettle` | Tessettle | alien | A broad gliding ray with a patchwork back remembers routes as quilt patterns. |
| `timbrelk` | Timbrelk | alien | A drum-bodied walker with padded mallets counts the rests between noises. |
| `velveteel` | Velveteel | alien | A long-necked velvet swimmer with ribbon fins takes lost currents home. |
| `whorloo` | Whorloo | alien | A round-footed courier with a great spiral shell rents out the spare room. |
| `wickindle` | Wickindle | alien | A waxy little night gardener carries a steady pearl of light in a curling wick. |
| `bobbinor` | Bobbinor | robot | A one-wheeled reel robot winds up the loose ends of other people's errands. |
| `gaugekin` | Gaugekin | robot | A caliper-headed mechanic measures the gaps left by missing things. |
| `hushcone` | Hushcone | robot | A horn-eared recording robot makes field recordings of things finishing. |
| `linticker` | Linticker | robot | A cabinet robot with a bright pendulum grants time off to overworked clocks. |
| `sealump` | Sealump | robot | A spring-footed stamp robot collects impressions of perfectly ordinary floors. |
| `tarestep` | Tarestep | robot | A two-pan hover scale weighs compliments before passing them along. |
| `winkmast` | Winkmast | robot | A little tracked lighthouse keeps a diary of ships that wink back. |

## Model galleries and port residents

The nine ports host 500 named residents and 20 landmark facilities. They stand around the ports as scenery: the residents on the promenades in front of the shops, the facilities nearby. Each of the four research stations has five residents posted there as staff, and an annex of a planetside landmark: Meridian Array at Hush, Lumen Vault at Rimeholm, Heliograph Observatory at Calibration Spire and Kestrel Spindle at Far Wink. All the characters and facilities are original designs. The [model placement guide](CLAUDE.md) maps the Three.js sources, downloadable GLBs, editable Blender scenes and game hooks. Browse the [character gallery](docs/character-models/index.html) or the [outpost and research station gallery](docs/outposts/index.html).

## Animated cast

The animated cast now plays every alien in the game: shopkeepers, crews, crowds, passengers, pilots and callers. Each of the 30 earlier species is played by one cast design, and the other 20 designs join the crowds:

| Was | Now | Was | Now | Was | Now |
|---|---|---|---|---|---|
| Beepul | Lichen | Bobbinor | Shuttle | Pluvindle | Plume |
| Grondar | Rusk | Bractillo | Nim | Rilloon | Obo |
| Zk'tharri | Kipp | Cuspiro | Silt | Rimebud | Sova |
| Blorpax | Neru | Gaugekin | Parallax | Sealump | Cairn |
| Qeeble | Pavo | Hushcone | Relay | Tarestep | Tally |
| Sporrin | Myrr | Linticker | Tempo | Tessettle | Sura |
| Vrell | Vela | Loamlet | Aril | Timbrelk | Chime |
| Ooloo | Fenn | Nacrelle | Nacre | Velveteel | Sarra |
| Momwump | Marlo | Parasolum | Yarro | Wickindle | Caelo |
| | | Pipettle | Plover | Whorloo | Kepp |
| | | | | Winkmast | Wick |

The species keys stay the same underneath (`CAST_FOR` in `src/01-data.js`), so homeworlds, customs, saves and shop staffing are unchanged. The 500 named residents are built from the same animated designs, tinted with their own accent colours.

Open `?gallery` and choose **Animated cast** to inspect the 50 articulated designs. Each species uses its existing resident ID, carries the `cast: true` flag and can be built with `Folk.make(id, seed, scale)`. The shared rigging code lives at the top of `src/species/aril.js`.

| Design | Appearance and movement |
| --- | --- |
| Orris | A leafy-eared botanist in a rust vest carries a tray of seedlings. A broad webbed waddle keeps the tray level. |
| Vela | A violet fan mantle floats above curling ribbons and an inscribed tablet. A siphon pulse lifts the mantle while the four free ribbons trail. |
| Obo | A cricket in a linen dinner jacket carries a bell-ended reed instrument. Long heel-led steps keep time while the instrument hand stays quiet. |
| Silt | A red sand burrower wears a saddle roll behind its ring of pale mouth plates. Four digging feet take short diagonal steps under the listening fork. |
| Mica | A plated, copper-beaked surveyor wears a travel cape and carries a sextant. Long measured bootsteps leave the sighting hand steady. |
| Nim | A blue seed courier wears a straw hat and grips a dandelion parasol. Quick skips let the parasol hand ride through the crosswind. |
| Neru | A teal tidal cartographer has branching pink gills and a paddle tail. Four webbed limbs paddle in diagonals and the tail steers. |
| Caelo | A velvet moth lantern keeper has comb antennae and four eyespotted wings. Paired wings fold around the lantern on each short stride. |
| Rusk | A low kiln inspector carries overlapping fired plates down an armored back. A deliberate four-foot plod swings the tail opposite each step. |
| Plover | A blue long-legged wader carries a chart bag below its curved sounding bill. High steps clear the reeds and the bill dips on each measured pace. |
| Fenn | A russet pressure bladder suspends a weather basket between small fins. Side fins scull as the hanging basket lags behind the lift. |
| Koro | A broad geode carver has an open amethyst seam across the chest. Short broad steps transfer the stone weight from boot to boot. |
| Myrr | A mushroom kitchen steward wears a green apron under a cream-gilled cap. A short heel-toe shuffle lets the cap settle over the spoon. |
| Sarra | A jade, hooded glassblower balances on a coil beside a glowing gather. The belly coil reaches and draws the body forward in a low slither. |
| Ilex | A moss-backed ranger carries small samples in branching antlers. A quiet diagonal trot keeps the antler samples level. |
| Kepp | A pale trail keeper carries a spiral shell over a broad muscular foot. The foot extends, grips and draws the shell after it. |
| Yarro | A teal thermal scout spreads ochre sails under a narrow head crest. One sail catches the rising air a beat before the other. |
| Nacre | A rose reef acoustician stands on six soft feet in front of a ribbed shell fan. Six shell feet plant in sequence in a rippling crawl. |
| Tacca | A long-eared tunnel listener wears a brass-grilled seismic receiver. A double-beat hop settles the ears at different times. |
| Sova | An owl-like archivist tucks a folio beneath round facial disks. Small quiet steps keep the folio tucked and the head scanning. |
| Pavo | A turquoise herald carries a crowned head in front of an eyespotted feather fan. A high ceremonial march turns the fan slightly after each footfall. |
| Kipp | A six-footed bridge inspector wears studded wing cases. Alternating tripods test and bear weight on successive beats. |
| Marlo | A tusked ice harbormaster wears a wool scarf over a heavy coat. A low, wide shuffle transfers weight without jolting the ice. |
| Aril | A green canopy gardener walks on forked roots below curled seed leaves. Each stilt plants its toes before the other root lifts. |
| Sura | A golden current reader has a curled anchor tail and coral-like crest. Dorsal fins steer a hovering glide while the tail trims the pitch. |
| Tally | A brass weighing drum balances on one wheel below a shallow scale pan. The drive wheel turns as the two kickstands tuck back. |
| Lichen | A porcelain mask and pale joint caps frame a moss-green conservatory keeper. Long ceramic steps let the fern on one shoulder settle softly. |
| Parallax | An ivory C-gauge suspends a calibration cube opposite a blue camera barrel. A level hover turns around the cube as it slowly rotates. |
| Hush | A blue boiler-bodied listener carries a brass clockwork bird on one gauntlet. Slow cushioned bootsteps keep the bird hand steady. |
| Rivet | A copper saucer welder has patinated seams, striped fins and a sample patch. Opposing stabilizers bank the hovering hull into each correction. |
| Spool | An art-deco plum switchboard rolls beneath a curved receiver head. Caster rows roll together as the receiver checks the next socket. |
| Lyre | A sea-green soundboard carries seven strings between curved resonator horns. A light syncopated step sets the strings and plucking wrist moving. |
| Iris | A bellows camera stands on a three-point brass and steel tripod. Three struts lift and plant in sequence while the lens stays aimed. |
| Crimp | A twin-wheeled cable splicer carries a working vice under its raised optic. The axle rolls while the sliding jaw tests its clearance. |
| Relay | A green receiver cabinet balances an open brass dish above its speaker grille. Short marching steps leave the dish free to scan across the signal. |
| Kiln | A russet furnace tender rolls on four wheels beneath a lipped chimney. Paired axles turn and the furnace rocks gently on its suspension. |
| Wick | A slate beacon carries a guarded amber lantern and pointed canopy. Quick paired steps carry a slow sweeping lantern beam. |
| Fathom | A bronze bathysphere wears a pressure seam, twin skids and a periscope. The ballast skids alternate in a deliberate seabed shuffle. |
| Dolly | A plum parcel cart balances strapped packages in front of its brass push bar. Four little wheels turn while the top parcel takes up the slack. |
| Orlo | Nested brass and blue gimbals hang above a compact gyro base. The base rocks on its rim while two gimbals counter-rotate. |
| Chime | A brass bell housing stands on metal feet and carries a felt mallet. A measured rocking march brings the mallet in on alternate beats. |
| Shuttle | A silver weaving shuttle carries a red bobbin inside its open well. Alternating banks send the hovering shuttle across the moving thread. |
| Cairn | A stack of rounded counterweights rides two runners under a survey pin. The runners advance alternately and the upper weight corrects the twist. |
| Pinion | A copper aerial gearbox has ivory wings and twin propellers. Counter-rotating propellers drive a banked crosswind hover. |
| Tempo | A russet metronome rolls below a numbered scale and sliding pendulum weight. The axle rolls under a pendulum that marks every beat. |
| Glint | A blue mirror yoke carries a six-sided reflector over three landing struts. The rear strut catches each step while the mirror tracks its beam. |
| Purl | A rose yarn drum carries two knitting needles under a small optic. Short paired steps set the needle hand to a double stitch. |
| Latch | A green lock body carries a silver U-shackle above brass-hub wheels. The axle turns as the shackle tests its travel twice. |
| Plume | A blue sampler hovers below a crown of staggered intake tubes. Two jet pods vector in opposite directions to trim the climb. |
| Prong | A yellow cargo tug has upright mast rails and two narrow lifting tines. Four wheels turn while the fork carriage takes up its slack. |

## Bespoke interiors

[Shop render gallery](docs/interiors/index.md) · [Model and light manifest](assets/interiors/manifest.json)

- **Dispatch Bay B4** (Verdanthia) — Potting shed with a freight clock.
- **Fix-O-Matic 3000** (Verdanthia) — Unfolded vending-machine service cabinet.
- **The Coin Slot** (Verdanthia) — Orchard listening pavilion.
- **Gravel Freight Yard** (Scorchmaw) — Basalt quarry under a weighbridge.
- **Lava Lube & Patch** (Scorchmaw) — Ceramic heat shield curled around a forge.
- **Form 27-B Cargo Office** (Dunemoor) — A civic archive cut into canyon strata.
- **The Rubber Stamp** (Dunemoor) — Three ink-pad booths in a desert cellar.
- **Ladle Harbor Freight** (Sloshwell) — A tide lock with a floating freight gauge.
- **The Bottomless Bowl** (Sloshwell) — A tasting room inside a double-walled tureen.
- **Bargain Roost Cargo Perch** (Amethyne) — A cantilevered crystal auction balcony.
- **Mellow Hollow Depot** (Toxibloom) — A freight basket caught between mangrove roots.
- **Spore & Bolt** (Toxibloom) — A workshop under one bracket fungus.
- **The Damp Log** (Toxibloom) — A taproom in the split seam of a fallen trunk.
- **Port Lament Cargo Dock** (Candara) — A flying dock under a slack sail.
- **The Sunk Cost** (Candara) — The listing saloon of a failed cloud ferry.
- **Drift Cargo Bubble** (Jovexa) — An inflated freight envelope tied to a rigid deck.
- **Gentle Repairs** (Jovexa) — A hull cradle suspended in a cloud veranda.
- **Fort Snuggle Cargo Hut** (Brrrindle) — A scarf-bound emergency A-frame.
- **Warm Wrench Garage** (Brrrindle) — A thaw shed built around a radiator.
- **The Warm Mitten** (Brrrindle) — A cocoa parlour tucked into a snowbank.
- **Hush Receiving Bay** (Listening Post Hush) — A loading lock hung inside a second hull.
- **Soft Landing Repairs** (Listening Post Hush) — An acoustic test chamber with a wall of dent casts.
- **The Indoor Voice** (Listening Post Hush) — A quilted whispering gallery.
- **Cold Storage Intake** (Cryo Vault Rimeholm) — A rolling specimen archive in a freezer lock.
- **Thaw & Patch** (Cryo Vault Rimeholm) — A defrost tunnel lined with split heater collars.
- **Precision Freight** (Calibration Spire) — A cargo hall inside a square measuring jig.
- **Exactly Right Repairs** (Calibration Spire) — A torque laboratory built like a dial.
- **Last Light Freight Office** (Beacon Far Wink) — A signal box astride a freight airlock.
- **End of the Line Garage** (Beacon Far Wink) — A dead-end rail shed on the lamp service deck.
- **The Final Blink** (Beacon Far Wink) — The lighthouse lantern room after hours.

## Bespoke cockpits

[Cockpit renders](docs/cockpits/index.md) · [Walkable deck renders](docs/ship-interiors/index.md)

- **Rustbucket Mk I** — Riveted salvage cab with a patched windscreen and exposed copper lines. The walkable deck adds exposed service lines, patched berths and a repair gantry.
- **Dromedary 400** — Freight cab with yellow load rails and recessed drawer handles. The walkable deck adds industrial tie-down rails, stowage and a freight-handling spine.
- **Stellar Stoat** — Close-fitting courier canopy with turquoise edging and shoulder bolsters. The walkable deck adds compact foldaway furnishings and a streamlined service tunnel.
- **Opulent Manatee** — Walnut instrument cabinets and upholstered seating inside a bowed observation bay. The walkable deck adds upholstered berths, walnut cabinetry and a brass-trimmed passenger lounge.
- **Quasar Empress** — Pale ceramic arches framing a panoramic bridge and a suspended pilot chair. The walkable deck adds illuminated structural arches and a ringed reactor gallery.
