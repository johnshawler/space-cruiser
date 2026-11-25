"""The Bottomless Bowl, sloshwell. Build with Blender 4.5 LTS."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ports import make, tureen

make(__file__, 'The Bottomless Bowl', tureen)
