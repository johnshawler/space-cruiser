"""Walkable rooms of the rustbucket."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from build_deck import build
build(__file__)
