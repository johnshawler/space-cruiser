# Rustbucket repair fittings

The 21 GLBs are swappable visual parts for the seven Rustbucket fault IDs from `src/09-walk.js` at commit `8f156a73be7c80144347d71f617453710ffc15cd`. Each GLB is a self-contained static mesh with metal/roughness materials. The [editable full-deck Blender file](../../../art/ship-interiors/source/Rustbucket-Repair-States.blend) contains all seven stations. The [comparison sheet](../../../docs/ship-interiors/rustbucket/repair-states.jpg) shows all 21 variants.

## Inspecting an item in Blender

Open the walkable-deck scene. In the Outliner search for the existing empty named `fault_coolant`, `fault_thruster`, `fault_fuse`, `fault_scrubber`, `fault_crack`, `fault_strap` or `fault_seal`. Change its integer **repair_state** under Object Properties → Custom Properties. Choose 0 for the factory working configuration, 1 for the broken configuration, or 2 for the field repair. Each control operates independently in both the walkable and cutaway scenes. The default is 0. Meshes are grouped by fitting and state in the collection **Rustbucket / selectable fault fittings**.

## Fitting the game assets

1. Read the position and yaw for the fault ID from `manifest.json`. Each GLB is local to that anchor, in metres and glTF Y-up. Add a group to the interior at the three position values and set its rotation.y to the supplied yaw. Applying the original procedural effect group's rotation as well would rotate the part twice.
2. Display one of the three GLBs per ID. The existing `FAULT_SPOTS` controls for the screen, sound, effects and hold-to-repair interaction can stay on their original transforms. The original static props that the fitted Blender project supersedes are identified by station in the manifest. Use the fitted Blender file when producing new room bakes so the old working hardware does not remain behind the swapped mesh. Keep the two fixed lengths of heater pipe at the ends of the replacement coupling.
3. Working is the initial state. An active ID in `G.faults` selects broken. After a successful `Faults.fix(id)`, store that ID as repaired on the current hull and display repaired. A repeat fault selects broken again. Older saves with no repair history begin with working parts unless the fault is active. Reset repair history when the player receives a different hull. The current game only records the list of active faults and needs this additional history to show a persistent field repair.
4. Station effects, cockpit announcements, economic penalties and all seven original interaction coordinates remain owned by the game. These models contain static geometry. The current game supplies smoke, steam, sparks and other time-based effects.

The proof sheet was rendered from the three authored mesh variants at a shared camera angle and scale for each station.
