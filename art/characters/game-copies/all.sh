#!/bin/bash
# Game copies of all 32 Codex characters. From the repository root:
#   bash art/characters/game-copies/all.sh <humanoid-motion.blend> <robot-models-folder> [names...]
# e.g. art/characters/humanoid-species/motion/Long-Haul-Humanoid-Motion.blend art/characters/blender/robot-species/models
# About 15 seconds a character. The tracked robot Cairn is written as robot-cairn (the cast already has a cairn).
set -u
B="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"; H="$1"; R="$2"; shift 2
OUT=assets/characters/species; S=art/characters/game-copies/make_game_copy.py
HUM="Taluun Orrek Vessari Mothren Ureth Keld Sovai Brunn Pelrin Zhavet Koruun Eskel Rhovi Nemeya Dathri Ulnor"
ROB="Bellwrought Selvedge Gimbal Mudlark Folio Spoolback Lamplume Cairn Latchling Velour Nautil Trestle Prismwake Millipress Basaltine Thimble"
want(){ [ $# -eq 0 ] && return 0; local n="$1"; shift; for x in "$@"; do [ "$x" = "$n" ] && return 0; done; return 1; }
for n in $HUM; do if [ $# -eq 0 ] || want "$n" "$@"; then id=$(echo "$n" | tr A-Z a-z)
  "$B" -b --disable-autoexec "$H" --python "$S" -- humanoid "$n" "$OUT/$id.glb" ${WORK:-} 2>&1 | grep "copy.*done\|Traceback\|Error:\|  File " || echo "FAILED $n"; fi; done
for n in $ROB; do if [ $# -eq 0 ] || want "$n" "$@"; then id=$(echo "$n" | tr A-Z a-z); [ "$n" = Cairn ] && id=robot-cairn
  "$B" -b --disable-autoexec "$R/$n.blend" --python "$S" -- robot "$n" "$OUT/$id.glb" ${WORK:-} 2>&1 | grep "copy.*done\|Traceback\|Error:\|  File " || echo "FAILED $n"; fi; done
python3 art/characters/game-copies/manifest.py
