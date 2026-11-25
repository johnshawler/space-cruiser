#!/bin/sh
# Assemble the authoring constructors into the existing single-page, r128 build.
# Their one-line ESM imports are represented by the surrounding shared scope.
set -eu
printf '%s\n' 'const ResidentModels = (() => {'
cat art/characters/game-compat.js
for unit in finish surface-atlas surface-materials sculpt anatomy aliens robots outer-aliens outer-robots new-cast characters residents; do
  sed -e '/^import /d' -e 's/^export //' -e 's/SphereGeometry(1,24,16)/SphereGeometry(1,12,8)/' "art/characters/src/$unit.js"
done
printf '%s\n' 'return {cast,residents,homeworlds,buildCharacter,surfaceRole,roleMaterial};})();'
printf '%s\n' 'const StationModels = (() => {' 'const RoundedBoxGeometry = class extends THREE.BoxGeometry {constructor(w,h,d){super(w,h,d);}};'
for unit in stations three-stations; do sed -e '/^import /d' -e 's/^export //' "art/stations/$unit.mjs"; done
printf '%s\n' 'return {stations,buildStation};})();'
