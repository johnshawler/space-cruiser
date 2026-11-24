/* Yarro · A teal thermal scout spreads ochre sails under a narrow head crest. */
SPECIES_EXTRA.yarro = {
  name: 'Yarro',
  kind: 'yarro',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'dots',
  col: '#488c91',
  hue: 184,
  sat: 34,
  lit: 43,
  syl: ['yar', 'oh', 'tsi', 'vane', 'ha', 'lu', 'feh', 'wi'],
  voice: {
    wave: 'triangle',
    base: 316,
    range: 0.53,
    rate: 6.3,
    glide: 0.37,
    vib: 2,
    vibAmt: 7,
    fx: 'chirp',
    amp: 0.39,
  },
  trait: 'Yarro opens one sail first to see which way the warm air leans.',
  chat: [
    'I test a thermal with the cheap sail first.',
    'Warm air gathers over the bakery. Entirely coincidental.',
    'The updraft permit blew away during inspection.',
    'I mapped a spiral in the sky. Looks like lunch.',
    'A calm day is excellent for mending seams.',
  ],
  greet: ['Thermal scout. Got a little lift for you.', 'Pull alongside on the warm side.'],
  cargo: ['{good}, tucked out of the slipstream.', 'A roll of sailcloth and three very light buckles.'],
  joke: ['My report on rising air has gone over well.'],
  nice: ["Thanks. That's put some lift in the day."],
  bye: ['Catch the next warm column.'],
  honk: ['That gust has a remarkable brass section.'],
  dock: ['At {port}, come in below the pennants.', 'Welcome to {port}. The last updraft carries left.'],
  rumor: 'The freight bonus on {planet} is rising faster than the thermals.',
  build(T) {
    CastRig.build(T, {
      accent: '#488c91',
      height: 1.59,
      arm: [0.25, 1.04, 0.075, 0.34, 0.068],
      hand: 'fin',
      leg: [0.2, 0.58, 0, 0.072, 0.14],
      legParts: /^Leg$/,
      footParts: /^Foot$/,
      mouth: [0, 1.409, 0.304, 0.56],
      joints: [
        ['sailL', [-0.2, 1.02, -0.045], /^Gliding sail$/, (v) => v.x < 0],
        ['sailR', [0.2, 1.02, -0.045], /^Gliding sail$/, (v) => v.x > 0],
      ],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.64, 0.043, 0.042);
        n.sailL.rotation.y = 0.29 * (1 - Math.cos(p)) * a;
        n.sailR.rotation.y = -0.29 * (1 - Math.cos(p + 0.5)) * a;
      },
    });
  },
};
