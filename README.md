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
| 1 – 4 | Pick an answer when a message pops up |
| Double-click | Lean in to any part of the cockpit; double-click again to lean back |
| ? | Help |

### On an iPad or other touch screen

On-screen controls appear by themselves: a steering stick on the left, and a throttle slider plus Warp, Auto, Mine (hold), Horn, Hail, Next, Map and Help buttons on the right. Drag the view to look around, double-tap a panel to lean in, and double-tap open space to lean back. Radio chatter shows as a large caption at the top of the screen. The game fits both landscape and portrait, but landscape shows the whole cockpit.

## Ports

Every planet has its own mix of places, each a small set somewhere around the landing pad with its own shopkeeper. Behind the counter a crew tries to do its job: stacking crates, craning an engine into place, test-firing an engine, painting a panel, opening a mystery box, cracking a rock, or juggling mugs. It usually goes wrong. Sometimes it goes right.

- **Cargo depot** (every port): contracts and fuel.
- **Shipyard** (Verdanthia, Sloshwell, Amethyne, Jovexa): each sells a different range of ships.
- **Garage** (Verdanthia, Scorchmaw, Toxibloom, Jovexa, Brrrindle): hull repairs and a canopy wash.
- **Paint shop** (Dunemoor, Amethyne, Jovexa): new paint jobs for your ship.
- **Outfitter** (Scorchmaw, Amethyne, Candara): the mining laser upgrade and the hidden compartment.
- **Assay office** (Scorchmaw, Sloshwell, Candara, Brrrindle): buys mined ore.
- **Cantina** (most ports): gossip, and tips on where deliveries pay extra.

## Side work

- **Distress calls.** Maydays come in mid-route. Answering costs time and fuel and might pay off, or it might be a pirate ambush. Ignoring one costs reputation.
- **Asteroid mining.** Three asteroid fields are on the system map. Hold F on a rock to mine ore and sell it at an assay office (Scorchmaw, Sloshwell, Candara or Brrrindle). Slower than hauling, a little dangerous, and it never depends on a job board.
- **Contraband.** High-paying, illegal cargo with a discovery roll at three points: loading, a customs stop on the way, and unloading. Bribes and a hidden compartment change the odds.
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
