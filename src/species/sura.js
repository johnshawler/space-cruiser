/* Sura · A golden current reader has a curled anchor tail and coral-like crest. */
SPECIES_EXTRA.sura = {
  name: 'Sura',
  kind: 'sura',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'curvy',
  col: '#daa16b',
  hue: 29,
  sat: 60,
  lit: 64,
  syl: ['soo', 'ra', 'thal', 'ed', 'nu', 'shi', 'lo', 'vin'],
  voice: {
    wave: 'sawtooth',
    base: 305,
    range: 0.31,
    rate: 6.0,
    glide: 0.44,
    vib: 2,
    vibAmt: 5,
    fx: 'bubble',
    amp: 0.24,
  },
  trait: 'Sura anchors a tail curl while reading the eddies around a piling.',
  chat: [
    'The eddy by the piling runs late on market days.',
    'I tie no knots. The tail remembers.',
    'A smooth current makes my notes unusually straight.',
    'Someone numbered the ripples. Admirable optimism.',
    'The red buoy owes me a pencil.',
  ],
  greet: ["Current desk. I'm anchored for a minute.", 'Slip into the quiet water and say hello.'],
  cargo: ['{good}, out of the eddy line.', 'A jar of drift markers. Count them after they settle.'],
  joke: ['I followed a circular current and met myself at lunch.'],
  nice: ["Thanks. I'll pencil a star by this reading."],
  bye: ['Go with the outgoing ripple.'],
  honk: ["That's put a wrinkle in the water."],
  dock: ['At {port}, tie up on the downstream side.', 'Welcome to {port}. The eddy has made room.'],
  rumor: 'The current readers on {planet} report a rising freight premium.',
  build(T) {
    CastRig.build(T, {
      accent: '#daa16b',
      height: 1.52,
      hover: true,
      arm: [0.17, 0.94, 0, 0.27, 0.062],
      hand: 'fin',
      mouth: [0.025, 1.388, 0.442, 0.4],
      lip: [0.8, 1.15, 1],
      omit: /^Snout opening$/,
      joints: [
        ['tail', [0, 0.8, 0], /^Anchor tail$/],
        ['fins', [0, 0.77, -0.16], /^Dorsal ribbon$/],
      ],
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0.033, 0.025);
        n.tail.rotation.x = 0.19 * Math.sin(p) * a;
        n.fins.rotation.y = 0.25 * Math.sin(p * 2) * a;
      },
    });
  },
};
