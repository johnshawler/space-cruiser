"""Walkable rooms of the Rustbucket: the game copy of the hand-built deck in source/Rustbucket-Repair-States.blend
(the fitted deck with the three swappable states of each repair station; Rustbucket-Mk-I.blend is the earlier snapshot)."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from import_deck import build
# Where the game's live instrument faces sit on the hand-built console: (position, tilt about x, turn about y, scale).
# The two wing panels stand on the old switch bays. The radio clears their hoods and the central CRT.
PANELS={'panel_main':((0,-.15,-.652),-.05,0,.8),'panel_left':((-.407,-.120,-.607),-.19,.21,.76),
        'panel_right':((.407,-.120,-.607),-.19,-.21,.76),'panel_radio':((0,.180,-.94),.095,0,1),
        'panel_pedestal':((-.07,-.262,-.44),-1.51,0,.75)}
# No lettering names a room or points the way: the player learns the ship by walking it. Labels on equipment and cargo
# (case numbers, load limits, chalk tallies, pantry labels, berth numbers) stay.
ROOM_LETTERING=r'^(RB / )?(Corridor identification|Hatch legend|Stencilled marking / (?!MAX)|(Engraved plate|Legend) / (GALLEY|LIFE SUPPORT|PRESSURE SUITS))'
SOURCE=Path(__file__).resolve().parent/'source'
# The numbered fasteners belong to the two switch plates, not the panel or the nearby stick gimbals.
DASH_REMOVALS=(r'^RB / (?:(?:Toggle retaining nut|Toggle lever|Wing switch washer|Wing lever|'
              r'Grease pencil|Switch plate bay number|Recessed switch mounting plate)(?:\.\d+)?|Hex fastener\.(?:61[5-9]|62[0-2]))$')
build(__file__,SOURCE/'Rustbucket-Repair-States.blend','Rustbucket Mk I',panels=PANELS,drop=ROOM_LETTERING,
      cockpit_drop=DASH_REMOVALS,cockpit_fittings=SOURCE/'Rustbucket-Dash.glb')
