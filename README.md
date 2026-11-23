# Long Haul

A first-person space cargo simulator that runs in the browser. Fly from the cockpit, haul oddly named goods between nine planets, chat with alien pilots, and save up for a bigger ship.

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

Every planet has its own mix of places. Each one sits in its own part of the port, a few hundred metres from the pad and from the others, with its own neighbourhood (warehouses, a hangar and showroom, workshops, paint booths, market stalls, a mine head, a cantina with fairy lights) and its own shopkeeper. Moving between shops is a quick fade to black and back. Click your ship's name (in the port header, the paint shop, or on a shipyard card) to see its specs: every ship lists the same categories (cargo hold, passenger seats, cruise speed, warp speed, fuel tank, handling, price new), and yours adds how it is doing now. Every face in the side panel is rendered from that alien's 3D model. Every shop is a real room: walls with windows, a ceiling with beams and lights, and furniture to suit the trade (pallet racks, workbenches and tyre racks, paint shelves, display cases, ore bins and a boulder scale, cantina booths). The cargo depot is a low shed with a stock room at the back. The shipyard is a hangar hall big enough to park ships in, with display ships roped off, sale banners and the showroom pad, where previewed ships park, inside it. Behind the counter a crew tries to do its job: stacking crates, craning an engine into place, test-firing an engine, painting a panel, opening a mystery box, cracking a rock, or juggling mugs. It usually goes wrong. Sometimes it goes right.

- **Cargo depot** (every port): contracts and fuel.
- **Shipyard** (Verdanthia, Sloshwell, Amethyne, Jovexa): each sells a different range of ships. Your ship is worth half what it cost new, less any hull damage. A new ship comes with a clean hull, no faults, a clean canopy, cool engines, a full tank and factory paint; cargo, passengers and fittings move across. You can also sell your ship outright and leave in a free Rustbucket Mk I.
- **Garage** (Verdanthia, Scorchmaw, Toxibloom, Jovexa, Brrrindle): hull repairs and a canopy wash.
- **Paint shop** (Dunemoor, Amethyne, Jovexa): new paint jobs for your ship.
- **Outfitter** (Scorchmaw, Amethyne, Candara): the mining laser upgrade and the hidden compartment.
- **Assay office** (Scorchmaw, Sloshwell, Candara, Brrrindle): buys mined ore.
- **Cantina** (most ports): gossip, and tips on where deliveries pay extra.

## Port life

Locals stroll around the landing pad, stop to chat, push carts of crates about, and a marshal waves you in with glowing batons. Other ships land on and take off from the neighbouring pads. When you launch with new cargo, the hatch folds down into a ramp and two dockhands carry it aboard. Sometimes the stack falls over and a crate cracks open (you lose half that crate's share of the contract), or the last crate slides back down the ramp and bursts (you lose its whole share). Lost units come off the contract and its pay drops to match; a message after takeoff says what went. Skipping the scene doesn't save the cargo. Sometimes it all goes in without a scratch.

## Your ship

Get up from the pilot's seat (L) and walk around inside: a corridor with handrails and signs over every door, a passenger cabin with cushioned seats under the portholes, a galley with cupboards and a bunk, the cargo hold (its crates match how full it is) and the engine room. Passengers sit in the cabin seats, wave when you come over, and wear how the trip is going on their faces. The ship keeps flying while you walk, on autopilot if it is set. The radio only reaches the pilot's seat: while you walk you hear no chatter and get no calls, and anyone who hails you (a customs cutter, a distress beacon) waits until you sit back down. Your passengers still talk to you. Walking backwards is half speed.

Things break. A coolant leak (fuel use up), a thruster misfire (top speed down), a blown fuse (radio dead), a jammed air scrubber (passengers cross, canopy fogs), a hull crack (hull slowly failing), a snapped cargo strap (cargo loses value faster). Each shows on screen and in the ship itself, at its own fitting with a status screen and light: flashing red and visibly broken (a split, leaking coolant flange; a thruster panel hanging open over a glowing coil; a fuse box with a charred fuse; a scrubber clogged with fluff; a frosting crack; a snapped strap), or steady green and put right (a taped joint, a closed panel, a shut fuse box, a spinning fan with a ribbon in the draught, a riveted patch plate, taut straps). Walk to it and hold F to fix it. It goes slowly while the ship is shaking, above throttle 5 or in warp.

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
- **Asteroid mining.** Three asteroid fields are on the system map. Hold F on a rock to mine ore and sell it at an assay office (Scorchmaw, Sloshwell, Candara or Brrrindle). Slower than hauling, a little dangerous, and it never depends on a job board.
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
