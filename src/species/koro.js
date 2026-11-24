/* Koro · A broad geode carver has an open amethyst seam across the chest. */
SPECIES_EXTRA.koro = {
  name: 'Koro',
  kind: 'koro',
  family: 'alien',
  skin: 'stone',
  cast: true,
  script: 'angular',
  col: '#786867',
  hue: 4,
  sat: 8,
  lit: 44,
  syl: ['ko', 'rum', 'vek', 'dun', 'ge', 'ka', 'rom', 'ul'],
  voice: {
    wave: 'triangle',
    base: 126,
    range: 0.58,
    rate: 4.8,
    glide: 0.37,
    vib: 5,
    vibAmt: 7,
    fx: 'rumble',
    amp: 0.39,
  },
  trait: 'Koro checks every amethyst offcut for a second geode.',
  chat: [
    'Even an offcut might have a little room inside.',
    'The gem cutter invoices by the interesting crack.',
    'My favourite geode has another favourite geode in it.',
    'A polished sample makes a terrible doorstop.',
    'Today the quarry dust is lilac.',
  ],
  greet: ['Come closer. Catch the light in this seam.', 'Stone desk. Speak after the chisel stops.'],
  cargo: ['{good}, wedged with velvet.', 'One uncut mystery and its smaller relatives.'],
  joke: ['I ordered an empty geode. The supplier filled it with paperwork.'],
  nice: ['Many thanks. That has a good facet.'],
  bye: ['Leave me the chips when you go.'],
  honk: ["Don't chip the high notes."],
  dock: ['Welcome to {port}. Follow the purple dust.', 'At {port}, weigh samples before admiring them.'],
  rumor: 'The cutters on {planet} are offering a freight premium.',
  build(T) {
    CastRig.build(T, {
      accent: '#786867',
      height: 1.62,
      arm: [0.46, 1.01, 0, 0.42, 0.106],
      leg: [0.31, 0.54, 0, 0.095, 0.16],
      legParts: /^Leg$/,
      footParts: /^Foot$/,
      mouth: [0, 1.438, 0.24, 0.68],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.31, 0.025, 0.083, 0.024);
        n.armL.rotation.x *= 0.39;
        n.armR.rotation.x *= 0.39;
      },
    });
  },
};
