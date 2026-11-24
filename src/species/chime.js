/* Chime · A brass bell housing stands on metal feet and carries a felt mallet. */
SPECIES_EXTRA.chime = {
  name: 'Chime',
  kind: 'chime',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#a98451',
  hue: 35,
  sat: 35,
  lit: 49,
  syl: ['chim', 'bohm', 'en', 'tol', 'din', 've', 'tuh', 'rik'],
  voice: {
    wave: 'sawtooth',
    base: 321,
    range: 0.47,
    rate: 6.2,
    glide: 0.16,
    vib: 5,
    vibAmt: 4,
    fx: 'robot',
    amp: 0.24,
  },
  trait: 'Chime wraps the mallet after the last shift sounds.',
  chat: [
    'The last shift ends when the felt stops ringing.',
    'I wrap the mallet before I wrap the sandwiches.',
    'A soft strike can travel farther than a loud memo.',
    'The duty roster has a small rest written into it.',
    'I rang once for tea. Nobody needed a second reminder.',
  ],
  greet: ["Bell keeper. We're between shifts.", 'Come in on the decay.'],
  cargo: ['{good}, clear of the swinging mallet.', 'A roll of felt and one properly rested clapper.'],
  joke: ['The bell took a holiday. I covered its shift by humming.'],
  nice: ['Thank you. A fine clear note.'],
  bye: ["That's the last chime from me."],
  honk: ["You've called the unofficial break."],
  dock: [
    'Welcome to {port}. Two strikes mean the ramp is clear.',
    'At {port}, follow the shift bell to dispatch.',
  ],
  rumor: 'The shift board on {planet} rings up a bonus for deliveries.',
  build(T) {
    CastRig.build(T, {
      accent: '#a98451',
      height: 1.37,
      head: [0, 1.16, 0],
      headParts: /^Optics housing$/,
      omit: /^Lens$/,
      arm: [0.25, 0.75, 0.035, 0.28, 0.054],
      leg: [0.22, 0.35, 0, 0.068, 0.14],
      signal: '#ffdf9e',
      face: {
        eyes: [
          [-0.065, 1.18, 0.119, 0.045],
          [0.065, 1.18, 0.119, 0.045],
        ],
        mouth: [0, 1.109, 0.116, 0.4],
      },
      props: [
        {
          parts: /^(Striker shaft|Felt mallet)$/,
          side: 'L',
          grip: [0.42, 0.5, 0.15],
          turn: [0, 0, 0.65],
        },
      ],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.39, 0.021, 0.097);
        n.armL.rotation.x += 0.25 * Math.sin(p * 2) * a;
      },
    });
  },
};
