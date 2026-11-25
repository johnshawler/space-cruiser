"""Last Light Freight Office, beacon-far-wink. Build with Blender 4.5 LTS."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ports import make, signal

make(__file__, 'Last Light Freight Office', signal)
