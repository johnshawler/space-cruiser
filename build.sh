#!/bin/bash
# Bundles src/ into a single self-contained page.
set -e
cd "$(dirname "$0")"
{
  cat src/head.html
  cat src/body.html
  echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
  for f in postprocessing/EffectComposer shaders/CopyShader postprocessing/ShaderPass shaders/LuminosityHighPassShader postprocessing/UnrealBloomPass shaders/FXAAShader shaders/SSRShader postprocessing/SSRPass lights/LightProbeGenerator utils/BufferGeometryUtils objects/Reflector; do
    echo "<script src=\"https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/$f.js\"></script>"
  done
  echo '<script>'
  echo 'const SPECIES_EXTRA={};'
  cat src/species/*.js 2>/dev/null
  sh tools/bundle-residents.sh
  cat art/scene-finish.js
  cat src/*.js
  echo '</script>'
} > long-haul.html
wc -c long-haul.html
# local test copy with the document skeleton the publisher normally adds
{ echo '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>'; cat long-haul.html; echo '</body></html>'; } > index.html
