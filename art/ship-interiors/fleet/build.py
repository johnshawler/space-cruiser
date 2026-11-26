"""Rebuild a fitted hull. Run inside Blender with --python this_file -- <ship>."""
import json
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(HERE.parent))
from fleet.design import design, cockpit

def blueprints():
    return json.loads((ROOT / 'docs/ship-interiors/fleet-blueprints/editable/Fleet-Deck-Geometry.json').read_text())['ships']

def native(key, proof=True, views=(False, True)):
    import bpy
    from fleet.native import make_scene
    ship = next((s for s in blueprints() if s['id'] == key))
    model = design(ship)
    for flight in views:
        original = set(bpy.data.user_map())
        try:
            make_scene(ROOT, ship, cockpit(ship, model) if flight else model, flight, proof)
        finally:
            bpy.data.batch_remove(set(bpy.data.user_map()) - original)
if __name__ == '__main__':
    keys = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [s['id'] for s in blueprints()]
    for key in keys:
        native(key)

def rebuild_entry(filename, flight):
    """Entry point for the original per-ship Blender build scripts."""
    import tempfile
    from fleet.bake import export
    key = Path(filename).stem
    ship = next((s for s in blueprints() if s['id'] == key))
    native(key, proof=not flight, views=(flight,))
    with tempfile.TemporaryDirectory() as temp:
        export(ship, flight, Path(temp))
