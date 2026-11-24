/* Prong · A yellow cargo tug has upright mast rails and two narrow lifting tines. */
SPECIES_EXTRA.prong = {
  name: 'Prong',
  kind: 'prong',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#c68c49',
  hue: 32,
  sat: 52,
  lit: 53,
  syl: ['pro', 'ong', 'lif', 'tek', 'pal', 'skah', 'dra', 'wun'],
  voice: {
    wave: 'square',
    base: 165,
    range: 0.31,
    rate: 4.8,
    glide: 0.44,
    vib: 2,
    vibAmt: 5,
    fx: 'robot',
    amp: 0.24,
  },
  trait: 'Prong slides the tines beneath a crate without disturbing the dust.',
  chat: [
    'If the dust moved, I approached too fast.',
    'I can lift an empty pallet without waking its echo.',
    'The forks have agreed on a common height.',
    'A crate marked Featherweight is testing that claim.',
    'I practise on a stack of unsigned forms.',
  ],
  greet: ["Forks down. You're clear to talk.", 'Stevedore here. Which face of the crate is forward?'],
  cargo: ['{good}, lifted from the stamped side.', 'A pallet of spare pallet corners.'],
  joke: ['I picked up a shift. It was lighter than the crate.'],
  nice: ['Thanks. The dust stayed exactly where it was.'],
  bye: ['Keep your toes behind the stripe.'],
  honk: ['Both tines heard you.'],
  dock: [
    'At {port}, line up with the fork slots.',
    'Welcome to {port}. The unmoved dust marks your bay.',
  ],
  rumor: 'The loading gang on {planet} is paying extra per arriving load.',
  build(T) {
    CastRig.build(T, {
      accent: '#c68c49',
      height: 1.19,
      head: [0, 0.84, -0.14],
      headParts: /^Optics housing$/,
      omit: /^Lens$/,
      arm: [0.308, 0.48, 0.025, 0.25, 0.045],
      face: {
        eyes: [
          [-0.068, 0.862, -0.014, 0.045],
          [0.068, 0.862, -0.014, 0.045],
        ],
        mouth: [0, 0.79, -0.013, 0.44],
      },
      joints: [
        ['front', [0, 0.14, 0.21], /^(Rubber wheel|Wheel hub)$/, (v) => v.z > 0],
        ['rear', [0, 0.14, -0.21], /^(Rubber wheel|Wheel hub)$/, (v) => v.z < 0],
        ['carriage', [0, 0.29, 0.31], /^(Lifting tine|Fork heel|Lift carriage)$/],
      ],
      gait(n, p, a) {
        CastRig.roll(n, p, a, ['front', 'rear'], 2.65);
        n.carriage.position.y = n.carriage.userData.restY + 0.04 * (1 - Math.cos(p)) * a;
      },
    });
  },
};
