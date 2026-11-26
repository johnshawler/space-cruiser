# Sixteen humanoid species for Long Haul

The Blender master contains the sixteen new species commissioned from the original humanoid proof sheet. Open the file in Blender 4.5 LTS and use the Scene selector to choose a species. Each scene contains one editable character collection marked as an asset. The reference, profile and rear three-quarter cameras show the same meshes. All images used by the materials are packed.

[Blender master](../art/characters/humanoid-species/Long-Haul-Humanoid-Species.blend) · [Original concept](../art/characters/humanoid-species/reference/Original-concept.png) · [Front proof](../art/characters/humanoid-species/proofs/Long-Haul-Species-Front.jpg) · [Turnaround proof](../art/characters/humanoid-species/proofs/Long-Haul-Species-Turnarounds.jpg) · [Species catalog and individual renders](../art/characters/humanoid-species/catalog.json)

## Cast

| Row | Species in proof-sheet order |
| --- | --- |
| 1 | Taluun, Orrek, Vessari, Mothren |
| 2 | Ureth, Keld, Sovai, Brunn |
| 3 | Pelrin, Zhavet, Koruun, Eskel |
| 4 | Rhovi, Nemeya, Dathri, Ulnor |

## Using the source in the game

These are static art masters with 1,397 editable mesh objects and 1,045,126 polygon faces across the set. Blender uses metres and Z-up. Species IDs, collection names, dimensions, polygon counts, and links to the 48 transparent PNG renders are recorded in the catalog.

For game integration, duplicate the character collection and work from that copy. Bake the complete Blender material graphs to ordinary game textures before glTF export. The reference-facing pigmentation uses a mesh attribute and registered UVs combined with procedural materials on the sides and back. A plain image-texture export loses that blend. The reference records one angle per species. The hidden surfaces and physical proportions were designed to complete each figure in three dimensions.

Reduce geometry and draw calls for the intended viewing distance, keep separate parts needed for expression and motion, and rig the game copy for walking, sitting, gestures and facial actions as needed. Compare its front and reverse renders against the proofs under neutral lighting. The existing cast and encounter registrations can be reviewed separately when deciding where each new species appears.

## Verification

The saved master was reopened in Blender. All sixteen species had three working cameras, packed image textures, valid mesh data, closed mesh edges, and no zero-area polygons. The part-contact check placed every species in one connected assembly of overlapping or nested parts. Front, profile and rear views were rendered from the reopened file. File digests are in [SHA256SUMS](../art/characters/humanoid-species/SHA256SUMS).

## Rebuilding the editable source

The checked-in master opens directly. To regenerate it, run the following from the species directory using Python with Pillow and NumPy and a Blender 4.5 executable on your path. The scripts write the regenerated project and intermediate textures in the authoring directory. The published master stays available for comparison.

```sh
python3 authoring/maketex.py
python3 authoring/surfaces.py
blender -b --factory-startup --python-exit-code 1 -P authoring/engine.py
blender -b authoring/Rebuilt-Humanoid-Species.blend --python-exit-code 1 -P authoring/seat.py
blender -b authoring/Rebuilt-Humanoid-Species.blend --python-exit-code 1 -P authoring/profile_sculpt.py
```
