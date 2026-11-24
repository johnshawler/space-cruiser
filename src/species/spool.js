/* Spool · An art-deco plum switchboard rolls beneath a curved receiver head. */
SPECIES_EXTRA.spool = {
  name: 'Spool',
  kind: 'spool',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#844458',
  hue: 341,
  sat: 32,
  lit: 39,
  syl: ['spu', 'ul', 'klak', 'rin', 'pa', 'nex', 'deb', 'wi'],
  voice: {
    wave: 'triangle',
    base: 231,
    range: 0.58,
    rate: 5.8,
    glide: 0.16,
    vib: 4,
    vibAmt: 4,
    fx: 'click',
    amp: 0.39,
  },
  trait: 'Spool patches through the late call with one hand while the other catches the slack.',
  chat: [
    'The late call is still holding. It sounds remarkably patient.',
    'Socket three answers only when socket four is busy.',
    'I wound up a conversation that had crossed the corridor.',
    'One loose loop is reserved for emergencies and gossip.',
    'The dial tone had a day off. I hummed.',
  ],
  greet: ['Exchange here. Which end would you like?', 'I have a clear line and a spare plug.'],
  cargo: ['{good}. Connect the red label to dispatch.', 'Six leads and two calls awaiting collection.'],
  joke: ['I crossed my own lines. Had a lovely chat.'],
  nice: ["Thanks. I'll pass that down the line."],
  bye: ['Disconnecting gently.'],
  honk: ['I can put you through to a quieter horn.'],
  dock: [
    'Welcome to {port}. Patch in by the yellow lamp.',
    'At {port}, ring once for a free loading bay.',
  ],
  rumor: 'The exchange on {planet} just patched through a higher freight offer.',
  build(T) {
    CastRig.build(T, {
      accent: '#844458',
      height: 1.6,
      headGroup: 'Receiver head',
      arm: [0.34, 1.37, 0, 0.49, 0.063],
      handColor: '#c79650',
      omit: /^(Plug-hand|Finger|Fingertip)$/,
      face: {
        eyes: [
          [-0.073, 2.001, 0.101, 0.047],
          [0.073, 2.001, 0.101, 0.047],
        ],
        mouth: [0, 1.955, 0.108, 0.44],
      },
      signal: '#eec56f',
      props: [
        {
          parts: /^(Braided patch cable|Patch plug)$/,
          side: 'L',
          grip: [0.26, 1.2, 0.385],
          scale: 0.7,
          turn: [0.06, 1.28, 0],
        },
      ],
      joints: [
        ['front', [0, 0.113, 0.16], /^Caster$/, (v) => v.z > 0],
        ['rear', [0, 0.113, -0.16], /^Caster$/, (v) => v.z < 0],
      ],
      gait(n, p, a) {
        CastRig.roll(n, p, a, ['front', 'rear'], 3.0);
        n.head.rotation.y = 0.11 * Math.sin(p) * a;
        n.armL.rotation.x *= 0.25;
      },
    });
  },
};
