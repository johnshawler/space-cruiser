/* Tempo · A russet metronome rolls below a numbered scale and sliding pendulum weight. */
SPECIES_EXTRA.tempo = {
  name: 'Tempo',
  kind: 'tempo',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#996653',
  hue: 16,
  sat: 30,
  lit: 46,
  syl: ['tem', 'po', 'tik', 'ta', 'lo', 'dro', 'met', 'kai'],
  voice: {
    wave: 'sawtooth',
    base: 279,
    range: 0.36,
    rate: 6.0,
    glide: 0.44,
    vib: 5,
    vibAmt: 5,
    fx: 'chorus',
    amp: 0.24,
  },
  trait: 'Tempo moves the pendulum weight one graduation before every count-in.',
  chat: [
    'One graduation faster and the queue starts dancing.',
    'I count in before I switch myself on.',
    'The slow setting gives biscuits a respectable interval.',
    'A pause is part of the timing sheet.',
    'The scale says brisk. My wheels say after lunch.',
  ],
  greet: ['Come in on the next tick.', "Timer speaking. You've got a whole bar."],
  cargo: ['{good}, stacked in even measures.', 'One sliding weight. No rushing it.'],
  joke: ['Someone asked for spare time. I gave them a rest.'],
  nice: ['Thanks. That landed right on the beat.'],
  bye: ["I'll count you out."],
  honk: ['A little early. Admirably confident.'],
  dock: [
    'Welcome to {port}. Roll in on four.',
    'At {port}, the ticking by the ramp is perfectly intentional.',
  ],
  rumor: 'The freight rate on {planet} went up one graduation.',
  build(T) {
    CastRig.build(T, {
      accent: '#996653',
      height: 1.39,
      head: [0, 1.12, 0.095],
      arm: [0.205, 0.58, 0.035, 0.29, 0.049],
      omit: /^Lens$/,
      faceShell: [0, 1.19, 0.127, 0.137, 0.115, 0.096],
      signal: '#ffe6ab',
      face: {
        eyes: [
          [-0.055, 1.222, 0.218, 0.039],
          [0.055, 1.222, 0.218, 0.039],
        ],
        mouth: [0, 1.15, 0.222, 0.4],
      },
      joints: [
        ['axle', [0, 0.13, 0], /^(Rubber wheel|Wheel hub)$/],
        ['pendulum', [0, 0.39, 0.195], /^(Pendulum|Sliding weight)$/],
      ],
      gait(n, p, a) {
        CastRig.roll(n, p, a, ['axle'], 2.55);
        n.pendulum.rotation.z = (0.25 + 0.35 * Math.sin(p)) * a;
      },
    });
  },
};
