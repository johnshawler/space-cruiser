"""Walkable rooms of the Rustbucket: the game copy of the hand-built deck in source/Rustbucket-Repair-States.blend
(the fitted deck with the three swappable states of each repair station; Rustbucket-Mk-I.blend is the earlier snapshot)."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from import_deck import build
# Where the game's live instrument faces sit on the hand-built console: (position, tilt about x, turn about y, scale).
# The main face spans the two scopes; the side faces cover the key clusters; the pedestal face lies on the desk.
PANELS={'panel_main':((0,-.15,-.652),-.05,0,.8),'panel_left':((-.63,-.14,-.74),-.05,.25,.5),'panel_right':((.63,-.14,-.74),-.05,-.25,.5),
        'panel_pedestal':((-.07,-.262,-.44),-1.51,0,.75)}
# No lettering names a room or points the way: the player learns the ship by walking it. Labels on equipment and cargo
# (case numbers, load limits, chalk tallies, pantry labels, berth numbers) stay.
ROOM_LETTERING=r'^(RB / )?(Corridor identification|Hatch legend|Stencilled marking / (?!MAX)|(Engraved plate|Legend) / (GALLEY|LIFE SUPPORT|PRESSURE SUITS))'
build(__file__,Path(__file__).resolve().parent/'source'/'Rustbucket-Repair-States.blend','Rustbucket Mk I',panels=PANELS,drop=ROOM_LETTERING)
