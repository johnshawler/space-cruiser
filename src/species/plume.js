/* Plume · A blue sampler hovers below a crown of staggered intake tubes. */
SPECIES_EXTRA.plume = {
  name: 'Plume',
  kind: 'plume',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#698e9a',
  hue: 195,
  sat: 20,
  lit: 51,
  syl: ['plu', 'um', 'veh', 'cir', 'pah', 'gas', 'ni', 'hu'],
  voice: {
    wave: 'sawtooth',
    base: 352,
    range: 0.58,
    rate: 6.9,
    glide: 0.08,
    vib: 5,
    vibAmt: 8,
    fx: 'click',
    amp: 0.24,
  },
  trait: 'Plume uncaps the tallest tube to sample air above the engine wash.',
  chat: [
    "The tallest tube is for air that hasn't met an engine.",
    'Sample four smells like sample three going past a bakery.',
    'I label the empty vials before filling them with different emptiness.',
    'The engine wash has opinions about breakfast.',
    'A still day makes the air queue nicely.',
  ],
  greet: ['Sampling desk. Breathe to the left, please.', "I've capped the sensitive tube. Say hello."],
  cargo: ['{good}, well away from the intake.', 'Five sealed samples of approximately here.'],
  joke: ['I bottled a breeze. Accounts charged for the draught.'],
  nice: ['Thank you. Perfectly clear reading.'],
  bye: ['Safe air ahead.'],
  honk: ['That put exhaust in the polite tube.'],
  dock: [
    'Welcome to {port}. Idle engines beyond the sample rack.',
    'At {port}, the tallest tube points to dispatch.',
  ],
  rumor: 'The atmosphere team on {planet} added a premium to incoming freight.',
  build(T) {
    CastRig.build(T, {
      accent: '#698e9a',
      height: 1.3,
      hover: true,
      head: [0, 0.71, 0],
      headParts: /^(Air sampler|Lens|Sample tube)$/,
      arm: [0.3, 0.7, 0.055, 0.26, 0.049],
      face: { eyes: [[0, 0.787, 0.257, 0.08]], mouth: [0, 0.681, 0.255, 0.5] },
      joints: [
        ['jetL', [-0.26, 0.72, 0], /^(Jet pod|Exhaust lip)$/, (v) => v.x < 0],
        ['jetR', [0.26, 0.72, 0], /^(Jet pod|Exhaust lip)$/, (v) => v.x > 0],
      ],
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0.038, 0.054);
        n.jetL.rotation.x = (-0.19 + 0.12 * Math.sin(p)) * a;
        n.jetR.rotation.x = (-0.19 - 0.12 * Math.sin(p)) * a;
      },
    });
  },
};
