/* Lyre · A sea-green soundboard carries seven strings between curved resonator horns. */
SPECIES_EXTRA.lyre = {
  name: 'Lyre',
  kind: 'lyre',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#58918b',
  hue: 174,
  sat: 24,
  lit: 46,
  syl: ['ly', 'rai', 'tin', 'la', 'gen', 'vo', 'reh', 'pim'],
  voice: {
    wave: 'sine',
    base: 362,
    range: 0.31,
    rate: 6.6,
    glide: 0.37,
    vib: 3,
    vibAmt: 7,
    fx: 'robot',
    amp: 0.39,
  },
  trait: 'Lyre listens to the fourth string while adjusting the fifth.',
  chat: [
    'The fourth string listens when I tune the fifth.',
    'The tuning fork went flat. Someone parked on it.',
    'One harmonic rattles the teaspoons in the next bay.',
    'I tune before breakfast. Jam changes the pitch.',
    'The note between doors three and four is mine.',
  ],
  greet: ['Give me a pitch and a minute.', 'Soundboard ready. Try a short hello.'],
  cargo: ['{good}, separated by felt strips.', 'A set of strings arranged from hopeful to taut.'],
  joke: ['My lowest note got promoted. It went up a third.'],
  nice: ['Thank you. That rings kindly.'],
  bye: ['Let the last note finish.'],
  honk: ['A brave choice of interval.'],
  dock: ['At {port}, follow the tuned rail.', 'Welcome to {port}. The door chime is still rehearsing.'],
  rumor: 'The instrument shop on {planet} just raised its delivery fee a fifth.',
  build(T) {
    CastRig.build(T, {
      accent: '#58918b',
      height: 1.39,
      head: [0, 0.5, 0.075],
      headParts: /^Lens$/,
      arm: [0.25, 0.57, 0.03, 0.27, 0.052],
      leg: [0.22, 0.37, 0, 0.069, 0.13],
      faceShell: [0, 0.51, 0.108, 0.2, 0.137, 0.087],
      signal: '#b5f1d3',
      face: { eyes: [[0, 0.54, 0.193, 0.07]], mouth: [0, 0.44, 0.185, 0.5] },
      joints: [['strings', [0, 0.55, 0.02], /^Harmonic string$/]],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.53, 0.022, 0.044);
        n.strings.scale.x = 1 + 0.048 * Math.sin(p * 3) * a;
        n.armL.rotation.x += 0.16 * Math.sin(p * 2) * a;
      },
    });
  },
};
