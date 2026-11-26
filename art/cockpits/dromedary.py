"""Rebuild the dromedary cockpit in Blender."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "ship-interiors"))
from fleet.build import rebuild_entry

rebuild_entry(__file__, True)
