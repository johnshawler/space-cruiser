"""Walkable rooms of the Rustbucket: the game copy of the hand-built deck in source/Rustbucket-Repair-States.blend
(the fitted deck with the three swappable states of each repair station; Rustbucket-Mk-I.blend is the earlier snapshot)."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from import_deck import build
# Where the game's live instrument faces sit on the hand-built console: (position, tilt about x, turn about y, scale).
# The two wing panels stand on the old switch bays. The radio clears all three live panels.
PANELS={'panel_main':((0,-.097,-.652),-.05,0,.8),'panel_left':((-.407,-.120,-.607),-.19,.21,.76),
        'panel_right':((.407,-.120,-.607),-.19,-.21,.76),'panel_radio':((0,.180,-.94),.095,0,1),
        'panel_pedestal':((-.07,-.262,-.44),-1.51,0,.75)}
# No lettering names a room or points the way: the player learns the ship by walking it. Labels on equipment and cargo
# (case numbers, load limits, chalk tallies, pantry labels, berth numbers) stay.
ROOM_LETTERING=r'^(RB / )?(Corridor identification|Hatch legend|Stencilled marking / (?!MAX)|(Engraved plate|Legend) / (GALLEY|LIFE SUPPORT|PRESSURE SUITS))'
SOURCE=Path(__file__).resolve().parent/'source'
# The pilot operates the game's live instruments. Remove their static counterparts before baking.
# Bolt numbers identify the two gauge hubs, the four nameplates and the obsolete switch plates.
DASH_REMOVALS=(
    r'^RB / (?:(?:Toggle retaining nut|Toggle lever|Wing switch washer|Wing lever|Grease pencil|'
    r'Switch plate bay number|Recessed switch mounting plate|Stick gimbal|Flight stick|Flight grip|'
    r'Throttle gate|Throttle lever|Throttle knob|Bakelite key surround|Illuminated square key|'
    r'CRT cast housing|CRT recessed bezel|CRT anti-glare hood|CRT side shade|Glass mask|Amber raster / [01]|'
    r'Gauge / knurled rim|Attitude pressure instrument|Pressure gauge needle|Radio handset|Curled microphone lead|'
    r'Equipment drawer loop|Status pip|(?:Engraved plate|Legend) / (?:RANGE   /   04|MAIN DRIVE|PORT BUS|STBD BUS))'
    r'(?:\.\d+)?|Hex fastener\.(?:03[67]|49[89]|50[0-5]|61[5-9]|62[0-2]))$'
)
# Some earlier fittings were joined by material in the source. These bounds select their loose
# pieces in game coordinates, leaving the checklist, roof chart and oil can in the same meshes.
UNUSED_FITTINGS={
    'RB / Owner clutter -': [
        ((-.96,-.64,.04),(-.73,-.14,.36)),  # port twin-lever quadrant
        ((-.86,-.23,.45),(-.64,.13,.68)),   # rear main-bus knife switch
    ],
    'RB / Accessory mounts - Frame': [
        ((.70,-.46,-.61),(.84,-.40,-.45)),  # mounting pad of the unused stock stick
    ],
}
build(__file__,SOURCE/'Rustbucket-Repair-States.blend','Rustbucket Mk I',panels=PANELS,drop=ROOM_LETTERING,
      cockpit_drop=DASH_REMOVALS,cockpit_fittings=SOURCE/'Rustbucket-Dash.glb',cockpit_trim=UNUSED_FITTINGS)
