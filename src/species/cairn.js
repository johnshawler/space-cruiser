/* Cairn · A stack of rounded counterweights rides two runners under a survey pin. */
SPECIES_EXTRA.cairn = {
  name: 'Cairn',
  kind: 'cairn',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#80938e',
  hue: 164,
  sat: 8,
  lit: 54,
  syl: ['kair', 'un', 'dat', 'pin', 'ol', 'set', 'rum', 'vi'],
  voice: {
    wave: 'triangle',
    base: 156,
    range: 0.58,
    rate: 5.1,
    glide: 0.22,
    vib: 4,
    vibAmt: 3,
    fx: 'click',
    amp: 0.39,
  },
  trait: 'Cairn waits for the counterweights to settle before logging a reading.',
  chat: [
    'The top weight settles last. It likes the final word.',
    'I logged zero movement and dated it carefully.',
    'A datum is a promise made by a heavy object.',
    'The benchmark moved. Someone swept under it.',
    'My spare weight is marked Do Not Lean Emotionally.',
  ],
  greet: ['Survey pin steady. Go ahead.', 'I can talk while the lower weight settles.'],
  cargo: [
    '{good}, balanced about the centre mark.',
    'Three counterweights and a surprisingly light instruction slip.',
  ],
  joke: ['I asked for a second opinion. The other weight agreed to within a gram.'],
  nice: ["Thanks. That's a solid reference."],
  bye: ['Leave the little brass mark where it is.'],
  honk: ['The pin moved half a division.'],
  dock: [
    'Welcome to {port}. The white cross marks the datum.',
    'At {port}, measure from the brass stud.',
  ],
  rumor: 'Measured against last week, freight pays better on {planet}.',
  build(T) {
    CastRig.build(T, {
      accent: '#80938e',
      height: 1.19,
      head: [0, 0.94, 0],
      headParts: /^(Level head|Lens|Top survey pin)$/,
      arm: [0.24, 0.58, 0.02, 0.26, 0.047],
      faceShell: [0, 1.062, 0.04, 0.15, 0.095, 0.054],
      face: {
        eyes: [
          [-0.058, 1.08, 0.094, 0.042],
          [0.058, 1.08, 0.094, 0.042],
        ],
        mouth: [0, 1.002, 0.091, 0.38],
      },
      joints: [
        ['upper', [0, 0.62, 0], /^Counterweight 2$/],
        ['left', [-0.18, 0.085, 0], /^Sled runner$/, (v) => v.x < 0],
        ['right', [0.18, 0.085, 0], /^Sled runner$/, (v) => v.x > 0],
      ],
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0.005);
        n.left.position.z = n.left.userData.restZ + 0.057 * Math.sin(p) * a;
        n.right.position.z = n.right.userData.restZ - 0.057 * Math.sin(p) * a;
        n.upper.rotation.y = -0.077 * Math.sin(p) * a;
      },
    });
  },
};
