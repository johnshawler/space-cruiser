# Long Haul: lived-in deck briefs for the five ships

One deck per ship, for the Rustbucket Mk I, Dromedary 400, Stellar Stoat, Opulent Manatee and Quasar Empress. These briefs sit on top of the walkable decks already in PR #7. The cockpits have their own briefs in `docs/cockpits/briefs.md` and are left alone here.

## The plan every hull shares

The game walks all five decks on one plan, so the rooms, doorways and seats stay where they are. The repair spots go from six to seven, one in each room (see below). Fore is the cockpit end. Port is the passenger side.

| Space | Where | Size (m) | Ceiling |
| --- | --- | --- | --- |
| Corridor | centre, cockpit door to hold | 1.8 wide, 6.5 long | 2.3 at the crown, 1.9 at the arch haunches |
| Passenger cabin | port of the corridor | 3.5 by 4.4 | 2.3 |
| Galley and crew bunk | starboard of the corridor | 3.1 by 3.6 | 2.3 |
| Cargo hold | amidships, full beam | 6.8 by 7.0 | 2.3 |
| Engine room | aft | 4.8 by 4.8 | 2.3 |

The hold sits between the bunks and the engine, which is the sound and heat break the brief asks for.

### Three pockets the plan wastes today

The stock plan leaves sealed voids. Each brief below fills them. They are **dressing behind a doorway or grille**, so the walking bounds do not change. Making any of them walkable is a code change in `src/09-walk.js`.

| New space | The void it fills | Size (m) |
| --- | --- | --- |
| **Airlock and suit locker** | starboard, between the galley and the hold | 3.1 by 2.2 |
| **Scrubber bay and head** | port, between the cabin and the hold | 3.5 by 1.4 |
| **Engine crawlways** | either side of the engine room | 1.0 by 4.8 each, 1.2 high |

### Seven repair spots, one per room

Today the game has six spots in five rooms: the engine room has two, and the two new rooms have none. This plan gives every room exactly one.

| Room | Repair spot | Change from today |
| --- | --- | --- |
| Corridor | Hull crack, port wall | none |
| Passenger cabin | Coolant leak, on the heater pipe at the fore wall | **moved** from the engine room |
| Scrubber bay and head | Air scrubber jammed, at the grille | same place, now counted as the bay's |
| Galley and crew bunk | Blown fuse, fore wall | none |
| Airlock and suit locker | **Airlock seal leaking**, at the inner hatch | **new** |
| Cargo hold | Cargo strap snapped, starboard side | none |
| Engine room | Thruster misfire, aft wall | none |

- The cabin heater on every hull runs off the engine's coolant loop, which is why a coolant leak can show up there.
- The airlock spot is worked from the corridor, standing in the airlock's arch, so the walking bounds still hold.
- The scrubber is worked from the cabin side of its grille, as now.

### Rules for all five

- **Doors.** Heavy manual sliders on an overhead rail, with a lever latch and a kick plate. The hold door is double width.
- **Each repair spot** gets a hooded steel bezel so the game's status screen reads as a recessed amber tube, not a floating panel.
- **Controls.** Toggle switches, lit push-buttons, levers and dial gauges only.
- **Readable from a distance.** Clutter is chunky: a mug is a fat cylinder, a checklist is a board 0.3 m wide. Any lettering is 0.25 m tall or more.
- **Working lamps are caged.** Living lamps are shaded. No bare glowing strips anywhere aft of the cockpit door.
- **Passenger places** stay on the four existing anchors along the port wall.

---

## 1. Rustbucket Mk I

*A tug older than its paperwork. Copper trim, soot and amber lamps. Nothing matches because nothing is original.*

### Corridor

- **Layout.** A ribbed tube with five welded arch frames, none quite evenly spaced. Sliders port to the cabin and starboard to the galley. You see straight from the cockpit door to the hold's hazard stripes.
- **Hardware.** An exposed service spine along the crown: one copper steam line, two cable trays and a hand-cranked emergency bulkhead wheel by the hold door.
- **Repairs.** (1) The hull-crack spot is a square of ship's-biscuit-coloured plate, bolted on with nine bolts of four sizes. (2) One arch frame is a length of dock railing. (3) A cable tray held up with a leather belt.
- **Light.** Three caged work lamps, one with an enamel shade that belongs to a different lamp. Cold grey spill from the hold end.
- **Clutter.** A boot scraper welded to the deck. A chalk tally board of fuel stops. A hook with one oilskin coat. A fire bucket full of sand and one spanner. A laminated "DOOR STICKS, KICK HERE" board with a boot print under it.

### Passenger cabin

- **Layout.** Three round ports in the outer wall. Four seats under them, facing in. A grille in the aft wall looks into the scrubber bay.
- **Hardware.** Four bench seats cut from two different vehicles, bolted to a raised plank floor. A cast-iron radiator on the fore wall, fed from the engine's coolant loop.
- **Repairs.** (1) At the coolant spot, the radiator's feed pipe wears an oversize copper collar over a puddle bucket. (2) Plank flooring patched with a crate lid that still reads "THIS WAY UP", upside down. (3) The scrubber grille is a baking rack on four wing nuts.
- **Light.** One fringed standing lamp chained to the wall, plus daylight or starlight from the ports. Faint haze by the grille.
- **Clutter.** A rag rug nailed down at the corners. A shelf of dog-eared paperbacks behind a bungee cord. A tin of boiled sweets. A framed photograph of the ship when it was merely old. A knitted seat cover on seat three only.

### Scrubber bay and head

- **Layout.** Behind the cabin grille. A fat drum scrubber on the left, a curtained head on the right. Reached by lifting the grille off.
- **Hardware.** A belt-driven fan drum the size of a barrel, with a pull-out filter tray.
- **Repairs.** (1) At the scrubber spot, the drive belt is a pair of braces knotted together. (2) A filter made of a folded blanket. (3) A drip tray that is plainly a roasting tin.
- **Light.** One red pilot lamp and whatever leaks through the grille.
- **Clutter.** A jar of rescued fluff, labelled by year. A spare belt on a nail. A hand-lettered "FLUSH TWICE" board.

### Galley and crew bunk

- **Layout.** One room for cooking, eating and sleeping. Bunk along the outer wall under a round port. Counter along the aft wall. Fuse box on the fore wall.
- **Hardware.** A two-ring stove with fiddle rails. The fuse box: a black steel case with six fat ceramic fuses and a knife switch.
- **Repairs.** (1) One fuse replaced by a bent fork. (2) The stove's missing knob is a cotton reel. (3) A cupboard door hung on rope hinges.
- **Light.** A gimballed brass lamp over the counter and a string of small bulbs round the bunk. Warm, with the fuse box in shadow.
- **Clutter.** Two tin mugs in swinging holders. A patchwork quilt. A pinned paper star chart with rings from mugs. A calendar three years out of date. One sock drying on the stove rail.

### Airlock and suit locker

- **Layout.** A door-less arch off the corridor's starboard side, just fore of the hold. Inner hatch, 1.1 m chamber, outer hatch in the hull.
- **Hardware.** A round inner hatch with a six-spoke handwheel. Two pressure dials and a lever marked EQUALISE.
- **Repairs.** (1) At the seal spot, the hatch seal is doubled with bicycle inner tube. (2) One dial's glass is a jam-jar lid. (3) The suit rack is a coat stand bolted down.
- **Light.** One caged red lamp and one caged white. Frost on the outer hatch.
- **Clutter.** One suit with patched knees and a second helmet used as a plant pot. A boot tray. A checklist board with step four crossed out and "DON'T" written in.

### Cargo hold

- **Layout.** Grated deck over a shallow bilge. Stanchions in two rows leave a 3.1 m aisle. Double slider fore, engine door aft.
- **Hardware.** An overhead chain hoist on an I-beam running the length of the hold. Tie-down rings in the deck.
- **Repairs.** (1) At the strap spot, a snapped ratchet replaced with knotted towing rope. (2) Two deck grates are cattle grid. (3) A stanchion splinted with angle iron and three hose clamps.
- **Light.** Four caged work lamps, one flickering. Cold. Oil sheen in the bilge.
- **Clutter.** A hand truck with one odd wheel. A stack of dunnage planks. A dart board on the engine bulkhead. A tarpaulin over something nobody has asked about. A chalked "MIND THE BOXES".

### Engine room and crawlways

- **Layout.** Reactor in the centre, 1.3 m walkway all round. Coolant runs on the port wall, console at the aft wall. Knee-high hatches either side open onto the crawlways.
- **Hardware.** A riveted boiler-shaped reactor with a round sight glass. A lever console with six worn levers and a row of dial gauges.
- **Repairs.** (1) A steam line lagged with rolled newspaper and string. (2) At the thruster spot, an access panel held shut with a G-clamp. (3) One reactor band is a cargo strap.
- **Light.** Blue-white glow from the sight glass against amber gauge faces. Steam at shin height.
- **Clutter.** A deck chair facing the gauges. A mug hook welded to the console. A hammer on a lanyard, labelled "TOOL". A row of leftover screws in a muffin tin. A crawlway hatch propped open with a paperback.

---

## 2. Dromedary 400

*A working hauler run by the book, for fifteen years, by people who then wrote in the book. Charcoal steel and safety yellow. Everything is square.*

### Corridor

- **Layout.** A box-section passage with squared arch frames and a tie-down rail at hip height down both sides.
- **Hardware.** Yellow grab rails. A wall-mounted manifest rack with a clipboard for each of the 14 hold units.
- **Repairs.** (1) The hull-crack spot is a neat yellow patch plate with an inspection tag, and a second, less neat one beside it. (2) A tread panel swapped for one in a different company's green. (3) A rail bracket replaced with a tow shackle.
- **Light.** Square caged lamps set in the frames. Even, slightly cold.
- **Clutter.** A numbered key board with two keys missing. A first-aid box used as a lunch box. A height chart for a crew member's child, pencilled on the frame. A wheel chock in its labelled cubby and another on the floor. A whistle on a hook.

### Passenger cabin

- **Layout.** Square ports in deep frames. Four fold-down jump seats on the outer wall.
- **Hardware.** Slab jump seats on steel arms with yellow release handles. Overhead luggage cage. A finned heater pipe along the fore wall.
- **Repairs.** (1) One seat pad re-covered in mail sack. (2) The luggage cage door wired shut with a coat hanger. (3) At the coolant spot, the heater pipe bypassed with a loop of garden hose in jubilee clips.
- **Light.** Two shaded reading lamps on flexible arms. A draught-excluder curtain glows amber on the hold side.
- **Clutter.** A fold-down card table with a permanent game laid out. Lost-property crate. A thermos chained to the wall. A cross-stitch reading "LOAD EVENLY". A blanket in company colours, darned.

### Scrubber bay and head

- **Layout.** Behind a square louvred panel in the cabin's aft wall.
- **Hardware.** A cabinet scrubber with three pull-out filter drawers and a big green RUN button.
- **Repairs.** (1) At the scrubber spot, one filter drawer front missing, the gap filled with cardboard. (2) A fan guard made from a fridge shelf. (3) A hose joined with two different couplings and tape.
- **Light.** The green RUN button and a caged lamp on a pull cord.
- **Clutter.** A filter-change log with every entry in a different pen. A spare filter still in its wrapper, used as a shelf. A calendar of forklift trucks.

### Galley and crew bunk

- **Layout.** Bunk over a row of equipment drawers. Counter aft, fuse box fore.
- **Hardware.** A fold-flat steel counter with a clamp-down hotplate. The fuse box: a grey cabinet with a row of chunky breakers and a brass padlock, open.
- **Repairs.** (1) One breaker held on with a clothes peg. (2) A drawer handle replaced with a loop of ratchet strap. (3) The tap is a garden tap.
- **Light.** An enamel pendant on a short chain over the counter. A clip lamp at the bunk head.
- **Clutter.** A rota on a board, with one name in every slot. Mismatched mugs on hooks, each with a tape label. A rug cut from loading-bay matting. A pencil held in a tie-down buckle. A jar of teabags marked "SECOND USE".

### Airlock and suit locker

- **Layout.** A squared arch off the corridor. Rectangular hatches with rounded corners.
- **Hardware.** A lever-dogged hatch with four long handles. A pump with a hand lever for when the power is out.
- **Repairs.** (1) At the seal spot, one hatch handle is a wheel brace and the gasket is packed with rag. (2) A gauge taped over, "READS HIGH" written on the tape. (3) A locker door from a gym.
- **Light.** One amber caged lamp, one red. Yellow floor box, scuffed through to steel.
- **Clutter.** Two suits on numbered pegs, three numbered pegs. A sign-out board. Glove pairs clipped together with pegs. A magnet-boot rack holding ordinary boots.

### Cargo hold

- **Layout.** Floor rails for container sleds run fore to aft. Lashing bars on both walls.
- **Hardware.** A gantry crane with a yellow pendant control of four fat buttons. A deck scale by the fore door.
- **Repairs.** (1) At the strap spot, a strap spliced with a row of bulldog clips. (2) A floor rail section replaced in bare unpainted steel. (3) The scale's dial needle is a teaspoon.
- **Light.** Rows of caged floods, two dead. Dust in the beams.
- **Clutter.** A pallet jack with a name painted on it. A chalk hopscotch grid in the aisle. A broom worn to a wedge. Stacked empty crates used as a desk. A hard hat with a sticker collection.

### Engine room and crawlways

- **Layout.** Square reactor housing in a railed pit one step down. Crawlways behind yellow grille doors.
- **Hardware.** A slab-sided reactor with four bolted inspection doors. A stand-up console with breakers, two amber tubes and a dead-man lever.
- **Repairs.** (1) A reactor inspection door held shut with a ratchet strap. (2) At the thruster spot, a panel replaced with a road sign, blank side out. (3) A railing section made of scaffolding.
- **Light.** Blue glow through the inspection slots, amber breakers, cold caged floods above.
- **Clutter.** A maintenance log chained to the console. Ear defenders on a hook. A swear jar, nearly full. A torch taped to a broom handle for the crawlway. A crate marked "SPARES (ASSORTED, UNKNOWN)".

---

## 3. Stellar Stoat

*A fast courier that has been driven fast for fifteen years. Curved hull, teal trim, everything folds away, and half of it no longer folds back.*

### Corridor

- **Layout.** An oval tunnel with a ribbed rubber heel trough down the middle. Pocket doors slide into the walls.
- **Hardware.** Flush recessed lockers along both walls with finger-pull latches. A fold-out jump step at the cockpit door.
- **Repairs.** (1) The hull-crack spot is a teal patch cut to follow the curve, riveted from inside. (2) One locker door replaced with a flat steel plate that does not follow the curve. (3) A pocket door off its track, propped with a wing strut.
- **Light.** Small shaded dome lamps in the rib crowns. Dim, so the cabin looks warm from the tunnel.
- **Clutter.** A row of race pennants, faded. Scuffed heel marks worn pale down the trough. A helmet bag hanging from a locker latch. A speed record card in a frame. A coiled tow strap.

### Passenger cabin

- **Layout.** Long oval ports. Four narrow shell seats angled slightly inward.
- **Hardware.** Moulded two-piece shell seats on single pedestals, with teal belts on spools. A slim heater duct along the fore wall.
- **Repairs.** (1) One seat shell cracked and stitched with wire. (2) At the coolant spot, the heater's braided line replaced with plain rubber hose. (3) A fold-down table that is now permanently down, on a broomstick leg.
- **Light.** Low shaded sconces under the ports. Cool teal dial light from the corridor end.
- **Clutter.** A sick-bag dispenser, well stocked. A cushion with a racing number. A net of oranges. Trophies in a locker with a cracked door. A blanket strapped to the ceiling.

### Scrubber bay and head

- **Layout.** Behind an oval mesh panel.
- **Hardware.** A slim turbine scrubber on its side, with a quick-release cartridge.
- **Repairs.** (1) At the scrubber spot, the cartridge held in with a bungee. (2) An intake scoop cut from a mudguard. (3) A cracked duct wrapped in racing tape.
- **Light.** A teal pilot lamp behind a domed lens.
- **Clutter.** A stopwatch on a nail, for timing filter swaps. A spare cartridge. A sticker: "IF HUMMING, FINE".

### Galley and crew bunk

- **Layout.** Bunk folds up against the outer wall. Counter folds down over it. You have one or the other.
- **Hardware.** A fold-down counter with a single recessed burner. The fuse box: a slim panel of push-in fuses behind a sprung door.
- **Repairs.** (1) The sprung door gone, a tea towel in its place. (2) The bunk latch replaced with a seat belt buckle. (3) A burner knob from a different, larger stove.
- **Light.** One swing-arm lamp with a teal enamel shade. String lights along the bunk rail.
- **Clutter.** A mug that fits the cockpit holder and nothing else. A hammock of dry laundry. A pinned course chart with a line in red pencil. A small rug, bolted. A tin of something labelled "FAST FOOD".

### Airlock and suit locker

- **Layout.** An oval arch off the tunnel. The tightest airlock in the fleet: one person, sideways.
- **Hardware.** An oval plug hatch on a swing arm with a single long lever.
- **Repairs.** (1) The lever grip rewrapped in handlebar tape. (2) At the seal spot, the hatch gasket built up with racing tape. (3) The suit hanger is a wing-pod fairing.
- **Light.** One caged amber lamp. Condensation on the hatch.
- **Clutter.** A slim racing suit with sponsor patches unpicked. A helmet with a tinted visor and a spare visor sleeve. Chalk bag. A tally of spacewalks scratched in the paint.

### Cargo hold

- **Layout.** Curved walls with net bays between the ribs. A flat grated centre aisle.
- **Hardware.** Cargo nets on sliding rails. A winch drum at the fore end with a foot pedal.
- **Repairs.** (1) At the strap spot, a net mended with shoelaces. (2) A rib fairing missing, wiring bundle zip-tied in view. (3) A grate swapped for a ladder section.
- **Light.** Caged lamps in the rib bays. Sharp shadows from the nets.
- **Clutter.** A dismantled wing pod under a sheet. A crate of spare canopy frames. A skateboard used as a creeper. A "FRAGILE (THE SHIP)" stencil. A hanging tyre nobody can explain.

### Engine room and crawlways

- **Layout.** A long narrow reactor on its side would not fit, so it stands upright in a teardrop shroud. Crawlways are oval tubes.
- **Hardware.** A finned turbine reactor in a shroud with a hinged cowl. A sit-down console with a tachometer the size of a dinner plate.
- **Repairs.** (1) A fuel line sleeved in a length of garden hose. (2) At the thruster spot, a blown gasket rebuilt from a cereal box. (3) The cowl held up by a prop rod that is a ski pole.
- **Light.** Blue-white glow through the fins. Teal dials. Heat shimmer rather than steam.
- **Clutter.** A pit-crew stool on castors. A tool roll laid out in order, one gap. A lucky bolt on a string. Tuning notes written on the shroud in grease pencil. A cold cup of coffee on the tachometer.

---

## 4. Opulent Manatee

*A liner that was luxurious when new and has been comfortable ever since. Walnut, brass and oxblood, all rubbed pale where hands and feet go.*

### Corridor

- **Layout.** A panelled passage with shallow brass-edged arches and a carpet runner.
- **Hardware.** Walnut wainscot with brass grab rail. A speaking tube to the cockpit with a cork on a chain.
- **Repairs.** (1) The hull-crack spot is a steel plate with a framed picture hung over it, slightly too small. (2) A walnut panel replaced in plywood and stained the wrong brown. (3) The runner worn through at the cabin door and patched with a doormat.
- **Light.** Shaded brass sconces, one shade a replacement in a different green. Warm throughout.
- **Clutter.** An umbrella stand. A brass bell marked "SERVICE", with no clapper. A rack of passenger slippers. A barometer. A dish of mints.

### Passenger cabin

- **Layout.** Tall ports with tasselled half-curtains. Four club chairs along the outer wall.
- **Hardware.** Heated oxblood club chairs, bolted through the carpet. A walnut drinks cabinet with a fiddle rail. A brass heater with a grille on the fore wall.
- **Repairs.** (1) One chair arm mended with a brown leather elbow patch. (2) At the coolant spot, the heater's brass union replaced with a steel one and wrapped in a towel. (3) A curtain rail held up with a brass coat hook.
- **Light.** Fringed table lamps and the glow of a small heater grille. A faint warm haze.
- **Clutter.** A chess set with a salt cellar for a rook. Antimacassars. A stack of old periodicals. A footstool with a dip in it. A towel warmer holding one glove.

### Scrubber bay and head

- **Layout.** Behind a brass fretwork grille. The head has a proper door, and a proper queue hook.
- **Hardware.** A scrubber in a walnut cabinet with a brass wind-up timer.
- **Repairs.** (1) At the scrubber spot, the fretwork cracked and backed with tights. (2) A cabinet door tied shut with a dressing-gown cord. (3) A brass pipe elbow replaced in grey plastic.
- **Light.** A small shaded lamp over the washbasin.
- **Clutter.** Lavender bags hung in the intake. A soap on a rope. A sign: "PLEASE DO NOT TIP THE SCRUBBER".

### Galley and crew bunk

- **Layout.** A pantry with a proper range. The crew bunk is behind a curtain, noticeably plainer than anything a passenger sees.
- **Hardware.** A cream enamel range with a brass rail. The fuse box: a walnut cabinet with brass-capped fuses and an engraved plate.
- **Repairs.** (1) A fuse replaced with a teaspoon, silver. (2) The range door held with a wooden spoon through the handle. (3) A cracked tile filled with a different pattern.
- **Light.** A pendant with a pleated shade over the counter. A bare caged lamp behind the bunk curtain.
- **Clutter.** A tea trolley with one wheel in a slipper. A row of copper pans, one dented flat. A plate rack. The crew's own mugs, chipped, behind the good china. A hot-water bottle.

### Airlock and suit locker

- **Layout.** An arch with a velvet rope across it. Behind the rope it is plain steel again.
- **Hardware.** A round hatch with a brass handwheel, polished on the passenger side only.
- **Repairs.** (1) The rope stanchion bolted to the deck through the carpet, off centre. (2) A pressure dial with a hand-painted face. (3) At the seal spot, the hatch rim packed with a rolled napkin and candle wax.
- **Light.** One brass sconce outside, one caged red lamp inside.
- **Clutter.** A suit on a wooden valet stand, with a carnation hole. A shoehorn for magnet boots. A cloakroom ticket board. A deck quoits set.

### Cargo hold

- **Layout.** The carpet stops at the double door. Beyond it, steel grating and luggage racks, with freight behind.
- **Hardware.** Brass-railed luggage racks along the fore wall. A dumb waiter to nowhere, used as a cupboard. Chain hoist aft.
- **Repairs.** (1) At the strap spot, a strap replaced with a trunk belt and two neckties. (2) A rack shelf propped with a hatbox. (3) A grating panel covered with a rolled-out rug.
- **Light.** Caged work lamps, with one stray table lamp on a crate, plugged in.
- **Clutter.** Steamer trunks with destination labels. A birdcage, empty, door open. A deck chair stack. A porter's trolley. A dressmaker's dummy wearing a hard hat.

### Engine room and crawlways

- **Layout.** A reactor with a brass-railed walkway round it, as though tours were once given.
- **Hardware.** A drum reactor banded in brass, with a row of round gauges at eye level. A console desk with a leather inset and levers with turned wooden grips.
- **Repairs.** (1) A brass steam valve with a door knob for a handle. (2) At the thruster spot, a panel screwed shut with cabinet hinges. (3) A gauge glass replaced with a monocle.
- **Light.** Blue glow from the reactor ports, gold from the gauges. Steam drifting over the rail.
- **Clutter.** An armchair retired from the cabin. A tour rope, coiled. A kettle on a coolant pipe. An engineer's cap on a gauge. A plaque: "DAYS SINCE LAST INCIDENT", with the number unscrewed.

---

## 5. Quasar Empress

*A flagship, fifteen years after someone else stopped paying for the upkeep. Pearl arches gone ivory, with grey primer plates where pearl could not be had.*

### Corridor

- **Layout.** Tall-looking pearl arches that split into three ribs at the crown. The ceiling is the same 2.3 m as every other hull. The arches only suggest otherwise.
- **Hardware.** Rib-mounted lamps behind frosted lenses, each with its own rocker switch. A recessed fire point with a brass extinguisher.
- **Repairs.** (1) The hull-crack spot is a grey primer plate, with "PAINT ME" written on it some time ago. (2) Three frosted lenses are jam-jar glass. (3) An inlaid floor arc completed in chequer plate.
- **Light.** Cool white through the lenses, with two lamps a warmer yellow than the rest.
- **Clutter.** A coat of arms with the motto taped over. A mop and bucket parked in an alcove built for a statue. A stepladder. A visitors' book. A draught snake at the cabin door.

### Passenger cabin

- **Layout.** Tapered ports between ribs. Four winged seats on plinths.
- **Hardware.** Ivory seats with shoulder fins. A long credenza along the inner wall. A pearl heating pipe along the fore wall.
- **Repairs.** (1) One fin snapped and splinted with a ruler. (2) Ivory upholstery patched in denim. (3) At the coolant spot, a section of the pearl heating pipe replaced in rusty steel.
- **Light.** A shaded lamp on the credenza and a strand of string lights wound up one rib.
- **Clutter.** A fruit bowl with one lemon. Throw blankets in several tartans. A stack of board games. A potted fern in a helmet. Crayon marks at child height, partly scrubbed.

### Scrubber bay and head

- **Layout.** Behind a pearl lattice screen.
- **Hardware.** Twin ring scrubbers, one running, one donated for parts.
- **Repairs.** (1) The dead ring stripped to its frame. (2) A lattice section replaced with chicken wire. (3) At the scrubber spot, a duct joined with a saucepan with the bottom cut out.
- **Light.** One blue pilot lens and a caged lamp.
- **Clutter.** A parts list with most lines struck through. A stool. A note: "DO NOT BORROW FROM THE GOOD ONE".

### Galley and crew bunk

- **Layout.** A galley built for a steward. The steward's pull-out bunk is now the owner's.
- **Hardware.** A long pearl counter with a built-in warming drawer. The fuse box: a glass-fronted cabinet of blade fuses with lit push-buttons.
- **Repairs.** (1) The cabinet glass cracked and taped in a star. (2) Half the push-buttons dark, the working ones marked with nail varnish. (3) The warming drawer now a sock drawer.
- **Light.** A desk lamp clamped to the counter. Amber fuse buttons.
- **Clutter.** A camping stove on the unused induction plate. Instant noodles in a crystal decanter rack. A sleeping bag on silk sheets. A chart pinned over a fresco. A single good glass.

### Airlock and suit locker

- **Layout.** A ceremonial arch, wide enough for an honour guard of one.
- **Hardware.** A ring hatch on six spokes, echoing the ship's outer ring. A lever in a pearl housing.
- **Repairs.** (1) At the seal spot, two hatch spokes replaced with threaded rod and the rim sealed with candle wax. (2) The lever housing gone, lever wrapped in tape. (3) A suit locker door replaced with a shower curtain.
- **Light.** A caged white lamp. Blue from a single dial.
- **Clutter.** A parade suit with epaulettes and a work suit with knee pads. A boot brush. A guest slipper basket. A hand-written "MIND THE STEP, IT IS DECORATIVE".

### Cargo hold

- **Layout.** A vaulted hold with ribs meeting overhead. The biggest hold in the fleet, with stacking frames two high.
- **Hardware.** Overhead trolley hoists on a ring track. A marshalling desk with a lever bank by the fore door.
- **Repairs.** (1) At the strap spot, a strap replaced with a curtain tie-back and chain. (2) A section of ring track missing, with a painted "STOP" before the gap. (3) A stacking frame braced with a banister.
- **Light.** Caged floods on the ribs. A rug and a lamp by the marshalling desk make one warm corner.
- **Clutter.** A grand piano under a tarpaulin, lashed down. Crates stencilled with a previous owner's crest. A badminton net. A ladder against the gap in the track. A tea chest of spare lenses.

### Engine room and crawlways

- **Layout.** A ringed reactor gallery: the walkway circles the core at deck level, with the ring overhead.
- **Hardware.** A slender core inside a spoked ring, with a hand-cranked ring brake. A horseshoe console with rows of lit buttons and two amber tubes.
- **Repairs.** (1) A pearl shroud panel replaced with a sheet of grey primer steel. (2) At the thruster spot, a panel missing altogether, wiring bundled with zip ties. (3) One ring spoke braced with a turnbuckle.
- **Light.** Blue-white from the core, the one place the old glow survives. Amber buttons. Thin mist at the ring.
- **Clutter.** A throne-like chair with a toolbox on it. The original manual, twelve volumes, propping the console level. A spanner hung on a velvet rope. A list titled "THINGS TO FIX WHEN RICH". A cat bed, occupied only by a wrench.

---

## The submarine audit

- **No dead floor.** The three sealed voids are now the airlock, the scrubber bay and the crawlways. Corridor walls carry lockers, rails or racks on every hull.
- **Maintenance access.** Every room has exactly one repair spot, with a clear place to stand. The thruster spot backs onto a crawlway. The scrubber is reached from the cabin grille, and the airlock seal from the corridor arch.
- **Nothing factory-fresh.** Each space has three visible repairs, and the room's repair spot is one of them, so a fault appears where the ship already looks mended.
- **Noise and heat.** The hold separates the bunk and cabin from the engine on all five.

## Where this brief and the game pull apart

1. **Glow.** The current Stoat and Empress decks use lit edge strips and illuminated arches. These briefs swap them for shaded and lensed lamps. The cockpits keep their glow.
2. **Fine clutter against low vision.** The game's rule is big readable shapes. The clutter here is written to be modelled chunky, and can be thinned to three items a room.
3. **Films as mood only.** The "used-future" feel is kept. No prop, shape or name is taken from any film or series.
4. **Seven repair spots need game changes.** The game has six today. This plan needs a new fault (airlock seal leaking, with an effect to be chosen), the coolant leak moved to the cabin, new anchors in the five deck models, and the asset checker updated. None of that is done yet.
5. **Seats.** All five still use four passenger places, the known gap in PR #7.
