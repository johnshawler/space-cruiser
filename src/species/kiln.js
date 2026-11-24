/* Kiln · A russet furnace tender rolls on four wheels beneath a lipped chimney. */
SPECIES_EXTRA.kiln = {
  name: 'Kiln',
  kind: 'kiln',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#b96d49',
  hue: 19,
  sat: 44,
  lit: 51,
  syl: ['kil', 'in', 'fu', 'gra', 'sin', 'pek', 'um', 'dor'],
  voice: {
    wave: 'sine',
    base: 126,
    range: 0.53,
    rate: 4.6,
    glide: 0.16,
    vib: 3,
    vibAmt: 4,
    fx: 'chorus',
    amp: 0.39,
  },
  trait: 'Kiln watches the glaze change colour through a barred hearth door.',
  chat: [
    'The glaze is almost blue. Almost blue takes ages.',
    'My flue hat is purely practical except on holidays.',
    'The warm shelf is reserved for mugs with cold handles.',
    'One firing log contains an actual fire mark.',
    "Today's sample cooled into a very small roof.",
  ],
  greet: ['Watch the hot door while we talk.', "Furnace desk. I've turned down the draught."],
  cargo: ['{good}, between heatproof spacers.', 'Ceramic test tiles in eleven shades of nearly done.'],
  joke: ['My first pot was fired twice. It keeps asking for a reference.'],
  nice: ["Thank you. I'll put your mug on the good shelf."],
  bye: ['Give the tiles a minute.'],
  honk: ['The flame leaned left. Excellent bellows.'],
  dock: ['Welcome to {port}. The hot rack is roped off.', 'At {port}, unload on the cool bricks.'],
  rumor: 'The potters on {planet} are offering extra pay before the next firing.',
  build(T) {
    CastRig.build(T, {
      accent: '#b96d49',
      height: 1.39,
      head: [-0.083, 0.85, 0.218],
      headParts: /^Lens$/,
      arm: [0.36, 0.68, 0.04, 0.32, 0.062],
      faceShell: [-0.083, 0.86, 0.24, 0.16, 0.13, 0.074],
      signal: '#ffc474',
      face: { eyes: [[-0.083, 0.889, 0.31, 0.074]], mouth: [-0.083, 0.792, 0.302, 0.47] },
      joints: [
        ['front', [0, 0.15, 0.12], /^(Rubber wheel|Wheel hub)$/, (v) => v.z > 0],
        ['rear', [0, 0.15, -0.12], /^(Rubber wheel|Wheel hub)$/, (v) => v.z < 0],
      ],
      gait(n, p, a) {
        CastRig.roll(n, p, a, ['front', 'rear'], 2.7);
        n.rig.rotation.x = 0.024 * Math.sin(p * 2) * a;
      },
    });
  },
};
