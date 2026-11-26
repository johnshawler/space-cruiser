"""Soft Landing Repairs, listening-post-hush. Build with Blender 4.5 LTS."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ports import make, wedges

make(__file__, 'Soft Landing Repairs', wedges)
