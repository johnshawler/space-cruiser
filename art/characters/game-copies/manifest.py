"""Gathers assets/characters/species/<id>.json (written by make_game_copy.py) into manifest.json, which build.sh
embeds in the page. Run from the repository root: python3 art/characters/game-copies/manifest.py"""
import json, glob, os
d = 'assets/characters/species'
models = [json.load(open(f)) for f in sorted(glob.glob(d + '/*.json')) if not f.endswith('manifest.json')]
for m in models:
    m['bytes'] = os.path.getsize(os.path.join(d, m['id'] + '.glb'))
json.dump({'models': models}, open(d + '/manifest.json', 'w'), separators=(',', ':'))
print(len(models), 'models')
