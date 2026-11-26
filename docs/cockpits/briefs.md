# Five cockpits for Long Haul

A player should recognize the ship from the shape of the sky ahead, then discover how its owner lives by turning around. The six live instrument faces keep their own visual language. Contrast comes from the housings, upholstery and window silhouettes around them.

## Rustbucket Mk I

The starter tug has a wheelhouse welded between two drum saddles. Its windshield is one broad, uneven trapezoid. A triangular repair clamp sits at the upper left edge, clear of both the forward sightline and the wiper sweep. The port cheek carries a round inspection window. The starboard cheek has a short horizontal pane squeezed between exhaust pipes. The roof steps up near the smokestack and drops over the left shoulder. A ribbed deck and a patchwork sliding steel door finish the rear.

Three dark steel instrument pans sit on brackets with space visible between them. A battered brown sprung seat has one corduroy replacement cushion tied down with a different-coloured strap. A copper pipe mended with an oversize collar, a soot witness mark below the roof vent and a beautifully clean rectangle where a service plate used to be tell the ship’s history. Copper trim catches an amber cabin lamp. The other lamp wears a mismatched enamel shade. Instrument glow stays **#ffb060** against frame **#3d3a36**, panels **#23211f**, trim **#b5651d** and seat **#4a3426**.

## Dromedary 400

The hump over the container deck becomes a raised box clerestory. The main windshield is a single broad rectangle with clipped upper corners, and each side window is square, set deep in a stacked cargo frame. Two square-section roof rails lead back to the sliding door. The floor is divided into broad, replaceable tread panels. Matching squared instrument cases hook into a continuous rail, leaving a full recess for every working panel.

The charcoal seat has a flat folding arm, a bill-of-lading pocket and a back stitched in broad rectangles. Recessed equipment drawers use full-width yellow handles. A hefty tie-down buckle holds exactly one spare pencil, and a wheel chock lives in its own labelled cubby. Soft amber light from the clerestory picks out the dark panels without reflecting a bright grid in the glass. Instrument glow **#ffd27a**, frame **#34383c**, panels **#1d2024**, trim **#e0b000**, seat **#2e2e30**.

## Stellar Stoat

A long teardrop pressure shell follows the swept exterior. A single gently curved windshield meets two long cheek panes at the outer shoulders. One slender roof bow runs behind the pilot’s brow, leaving the middle third clear. The side consoles sweep forward like the wings but terminate in level pads for the stick and mug. A ribbed rubber heel trough follows the hull back to a smooth, flush pocket door.

A low bucket seat supports the ribs and thighs in two separate curved shells. A teal belt feeds into a recessed spool. An inspection slot in the right sill reveals the tip-pod linkage, while the left console carries a spare visor sleeve cut precisely to shape. Narrow turquoise edge lamps skim the console undersides so the outside view stays dark. Instrument glow **#7ff5e6**, frame **#2a3238**, panels **#161b20**, trim **#19b8a6**, seat **#1e2a30**.

## Opulent Manatee

The forward lounge of the liner wraps a wide three-sided bay around the pilot. The main windshield is gently bowed, flanked by a tall side pane on each side. A shallow roof light echoes the ship’s observation dome. Gold window bands continue inside across the side returns. Low walnut cabinets carry the instruments like writing desks. Thick carpet gives way to a hard threshold at the sliding, leather-inset door.

The heated oxblood club chair has a broad scalloped back and piping visible from the side. A gimballed brass mug cradle has a removable porcelain liner. The clipboard gets a felt-lined blotter, and paired fluted warmers hold folded towels beside the door. Diffuse amber lamps graze the wood from under the upper trim. Keep broad wood and leather satin so stars stay visible through the glass. Instrument glow **#ffd9a0**, frame **#33252a**, panels **#1a1416**, trim **#c9a24a**, seat **#5a1f28**.

## Quasar Empress

A pearl arch splits behind the pilot into three sweeping buttresses, echoing the exterior ring, its spokes and the crown of spines. The forward pane is a wide unbroken panorama. Tapered side lights wrap back past the shoulders, with frame seams outside the forward field. Dark instrument islands rise on slim pearl supports above a raised floor with broad inlaid arcs. An unbroken central aisle meets the tall-looking door, whose opening keeps the shared corridor dimensions.

The ivory throne seat has two separate shoulder fins with dark space between them. A blue light travels along a stationary line of faceted trim when the live lighting changes. The cup socket is suspended in a small ring, and the mascot gets an immaculate plinth long enough for one mascot. Concealed cyan sources light the arch from below. Instrument glow **#9fe8ff**, frame **#9aa1aa**, panels **#1b1f26**, trim **#3fd0ff**, seat **#e8e4dc**.

## Finish and pilot acceptance

1. **Lighting.** Design for live solar and planetary bounce, ambient occlusion in the recesses, local diffuse and reflection probes, soft contact shadows, restrained lamp shafts and emissive fixtures. Space stays clear through the glass. Test in direct sun and with cabin lamps alone.
2. **Materials.** Use Principled PBR, tiling normal and roughness maps, and surface-specific wear. Put scattering on a light diffuser or another translucent piece where it is visible. Keep the main furnishings at roughness 0.45 or higher and preserve the glass as a separate surface.
3. **Camera and finish.** Use filmic or ACES output and a ship-specific grading LUT. Restrict bloom to bright sources. Set focus and motion blur so the live panels, labels and forward flight view can be read. Use restrained vignette and grain with anti-aliasing. The default proof is 16:10 at a 72° vertical field of view. The six live faces get neutral grey stand-ins in the renders.
4. **Environment.** Sample the live space or planetary HDR environment. Put atmosphere at a planet’s limb and localized haze near an interior lamp. Use screen-space reflections on suitable glass and polished trim with the room probe covering off-screen reflections. The cockpit mesh carries no exterior scenery.

The Rustbucket pilot will check the six instrument mounts, lever sweeps, windshield UVs, head clearance, seat-to-door passage and the three-quarter view back into the cabin. Each ship has a ceiling of 60,000 triangles, 80 meshes, 14 materials and 1.5 MB per GLB. The [exterior model builders](../../src/05-ships.js), [ship palettes](../../src/01-data.js) and [live panel assembly](../../src/07-cockpit.js) set the fit.
