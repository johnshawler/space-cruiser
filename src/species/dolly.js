/* Dolly · A plum parcel cart balances strapped packages in front of its brass push bar. */
SPECIES_EXTRA.dolly = {
  name: 'Dolly',
  kind: 'dolly',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#9e6d80',
  hue: 337,
  sat: 20,
  lit: 52,
  syl: ['dol', 'li', 'kar', 'pos', 'kin', 'tag', 'bin', 'oh'],
  voice: {
    wave: 'triangle',
    base: 228,
    range: 0.36,
    rate: 5.6,
    glide: 0.08,
    vib: 4,
    vibAmt: 8,
    fx: 'chorus',
    amp: 0.39,
  },
  trait: 'Dolly balances the fragile parcel where it can see the corners.',
  chat: [
    'All four corners are visible. We can leave now.',
    'The fragile label arrived with a crease. Awkward.',
    'A parcel marked This Side Up has six strong opinions.',
    "I've got a small box for keeping spare small boxes.",
    'The top parcel is just here for the view.',
  ],
  greet: ['Parcel desk. How many corners can you see?', "I've made room on the deck for a hello."],
  cargo: ['{good}, label facing the aisle.', 'A remarkably delicate box of packing advice.'],
  joke: ['I signed for a signature. The paperwork doubled.'],
  nice: ["Thanks. I'll stick that beside the good handling sticker."],
  bye: ['Clear wheels. Rolling out.'],
  honk: ['All corners still present.'],
  dock: [
    'Welcome to {port}. Trolleys turn at the yellow line.',
    'At {port}, show me the fragile corner first.',
  ],
  rumor: 'The parcel office on {planet} is paying extra per delivery.',
  build(T) {
    CastRig.build(T, {
      accent: '#9e6d80',
      height: 1.15,
      head: [0, 0.71, -0.085],
      arm: [0.3, 0.41, 0.055, 0.22, 0.043],
      omit: /^Lens$/,
      faceShell: [0, 0.778, -0.06, 0.16, 0.104, 0.1],
      face: {
        eyes: [
          [-0.06, 0.807, 0.042, 0.047],
          [0.06, 0.807, 0.042, 0.047],
        ],
        mouth: [0, 0.735, 0.042, 0.43],
      },
      joints: [
        ['front', [0, 0.108, 0.24], /^(Rubber wheel|Wheel hub)$/, (v) => v.z > 0],
        ['rear', [0, 0.108, -0.24], /^(Rubber wheel|Wheel hub)$/, (v) => v.z < 0],
        ['parcel', [-0.04, 0.55, 0.02], /^(Upper parcel|Strap)$/],
      ],
      gait(n, p, a) {
        CastRig.roll(n, p, a, ['front', 'rear'], 3.1);
        n.parcel.rotation.z = 0.039 * Math.sin(p * 2) * a;
      },
    });
  },
};
