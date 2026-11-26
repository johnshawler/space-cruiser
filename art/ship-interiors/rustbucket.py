"""Walkable rooms of the Rustbucket: the game copy of the hand-built deck in source/Rustbucket-Mk-I.blend."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from import_deck import build
# Where the game's live instrument faces sit on the hand-built console: (position, tilt about x, turn about y, scale).
# The main face spans the two scopes; the side faces cover the key clusters; the pedestal face lies on the desk.
PANELS={'panel_main':((0,-.15,-.652),-.05,0,.8),'panel_left':((-.63,-.14,-.74),-.05,.25,.5),'panel_right':((.63,-.14,-.74),-.05,-.25,.5),
        'panel_pedestal':((-.07,-.262,-.44),-1.51,0,.75)}
build(__file__,Path(__file__).resolve().parent/'source'/'Rustbucket-Mk-I.blend','Rustbucket Mk I',panels=PANELS)
