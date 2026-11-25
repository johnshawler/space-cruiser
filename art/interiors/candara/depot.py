"""Port Lament Cargo Dock, candara. Build with Blender 4.5 LTS."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ports import make, sail

make(__file__, 'Port Lament Cargo Dock', sail)
