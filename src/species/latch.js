/* Latch · A green lock body carries a silver U-shackle above brass-hub wheels. */
SPECIES_EXTRA.latch = {
  name: 'Latch',
  kind: 'latch',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#718a77',
  hue: 134,
  sat: 10,
  lit: 49,
  syl: ['lat', 'cha', 'tur', 'kik', 'seh', 'ward', 'lo', 'fen'],
  voice: {
    wave: 'sine',
    base: 189,
    range: 0.53,
    rate: 5.2,
    glide: 0.22,
    vib: 3,
    vibAmt: 3,
    fx: 'chorus',
    amp: 0.39,
  },
  trait: 'Latch tries the shackle twice before admitting a seal is sound.',
  chat: [
    'I try every shackle twice. Once is a rumour.',
    'The key blank has excellent potential.',
    'A good seal makes a particular little sigh.',
    'My locked drawer contains the spare drawer.',
    'The airlock passed until someone tried it with a sandwich.',
  ],
  greet: ['Locksmith here. Are you inside or outside?', 'Wait for the second click.'],
  cargo: [
    '{good}, with the spare key in a separate envelope.',
    "Uncut keys sorted by the locks they haven't met.",
  ],
  joke: ['The lock asked for privacy. I turned the key politely.'],
  nice: ["Thank you. That's clicked into place."],
  bye: ['Give the handle one last try.'],
  honk: ['I thought that was the pressure alarm.'],
  dock: [
    'Welcome to {port}. Wait for both green seals.',
    'At {port}, the brass handle opens toward you.',
  ],
  rumor: 'The airlock crew on {planet} has unlocked a higher freight rate.',
  build(T) {
    CastRig.build(T, {
      accent: '#718a77',
      height: 1.26,
      head: [0, 0.55, 0.13],
      headParts: /^Lens$/,
      arm: [0.31, 0.61, 0.025, 0.26, 0.054],
      faceShell: [0, 0.56, 0.155, 0.158, 0.13, 0.071],
      face: { eyes: [[0, 0.59, 0.225, 0.072]], mouth: [0, 0.489, 0.218, 0.44] },
      joints: [
        ['axle', [0, 0.185, 0], /^(Rubber wheel|Wheel hub)$/],
        ['shackle', [-0.19, 0.68, 0], /^U-shaped shackle$/],
      ],
      gait(n, p, a) {
        CastRig.roll(n, p, a, ['axle'], 2.35);
        n.shackle.rotation.y = 0.055 * (1 - Math.cos(p * 2)) * a;
      },
    });
  },
};
