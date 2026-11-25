"""Build the rustbucket cockpit with Blender 4.5 LTS."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from fabricate import build
build(__file__)
