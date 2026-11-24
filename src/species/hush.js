/* Hush · A blue boiler-bodied listener carries a brass clockwork bird on one gauntlet. */
SPECIES_EXTRA.hush = {
  name: 'Hush',
  kind: 'hush',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#7395a6',
  hue: 200,
  sat: 22,
  lit: 55,
  syl: ['hush', 'dom', 'lum', 'pik', 're', 'ton', 'uv', 'min'],
  voice: {
    wave: 'sawtooth',
    base: 115,
    range: 0.47,
    rate: 4.3,
    glide: 0.08,
    vib: 5,
    vibAmt: 8,
    fx: 'robot',
    amp: 0.24,
  },
  trait: 'Hush cups one ear to hear the smallest tooth on a clockwork bird’s gear.',
  chat: [
    "The bird's smallest cog ticks half a beat early.",
    'A quiet hinge gets my best reference letter.',
    'I lined the toolbox with felt. Now I can hear the screws think.',
    'The bird has one song and several mechanical variations.',
    'The silent shelf squeaks when you point at it.',
  ],
  greet: ['Listening desk. Any volume is fine.', 'I heard you before the lamp came on.'],
  cargo: ['{good}, individually cushioned.', 'A clockwork bird and the key that knows its tune.'],
  joke: ['My request for a quieter bell went unheard.'],
  nice: ['Much obliged. The bird has nodded too.'],
  bye: ["I'll listen for your engines on the way back."],
  honk: ['The bird just learned a second song.'],
  dock: [
    'At {port}, the soft pad is yours.',
    'Welcome to {port}. The little brass bird handles announcements.',
  ],
  rumor: 'The acoustics crew on {planet} quietly raised the freight rate.',
  build(T) {
    CastRig.build(T, {
      accent: '#7395a6',
      height: 1.7,
      headGroup: 'Listening head',
      arm: [0.67, 1.5, 0.04, 0.71, 0.125],
      handColor: '#99b2b7',
      leg: [0.34, 0.9, 0, 0.145, 0.22],
      legParts: /^(Thigh|Knee housing|Calf|Riveted boot|Toe cap)$/,
      footParts: /^(Riveted boot|Toe cap)$/,
      omit: /^(Open palm|Cupped listening hand|Curled gauntlet finger|Finger|Fingertip)$/,
      signal: '#f3bc61',
      face: {
        eyes: [
          [-0.176, 1.913, 0.23, 0.071],
          [0.026, 1.913, 0.23, 0.071],
        ],
        mouth: [-0.075, 1.808, 0.234, 0.57],
      },
      props: [{ parts: /^Clockwork songbird$/, side: 'L', grip: [-0.23, 1.23, 0.577], scale: 1.12 }],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.38, 0.012, 0.047);
        n.armL.rotation.x *= 0.08;
        n.head.rotation.z = -0.09 * Math.sin(p * 0.5) * a;
      },
    });
  },
};
