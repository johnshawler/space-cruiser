/* Purl · A rose yarn drum carries two knitting needles under a small optic. */
SPECIES_EXTRA.purl = {
  name: 'Purl',
  kind: 'purl',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#9e7982',
  hue: 345,
  sat: 16,
  lit: 55,
  syl: ['pur', 'ul', 'rib', 'su', 'hem', 'nit', 'kai', 'vo'],
  voice: {
    wave: 'triangle',
    base: 275,
    range: 0.47,
    rate: 5.8,
    glide: 0.37,
    vib: 4,
    vibAmt: 7,
    fx: 'robot',
    amp: 0.39,
  },
  trait: 'Purl counts the stitches between the pressure seams of a glove.',
  chat: [
    'One stitch loose and the glove develops a spare thumb.',
    'I count the pressure seams before I count the fingers.',
    'The yarn remembers the last shape it was in.',
    'I knitted a sample of the inside of a pocket.',
    'The pattern calls for patience in two colours.',
  ],
  greet: ['Just let me finish this row.', 'Suit-liner desk. Which hand are we discussing?'],
  cargo: ['{good}, cushioned in spare ribbing.', 'A pair of liners. The left one has an address label.'],
  joke: ['I dropped a stitch. It asked for a lift back up.'],
  nice: ["Thank you. I'll knit you a warmer cuff."],
  bye: ['Keep the loose thread tucked in.'],
  honk: ['I counted that as a stitch.'],
  dock: [
    'At {port}, the wool stripe marks the safe rail.',
    'Welcome to {port}. The returns basket is hand knitted.',
  ],
  rumor: 'The suit shop on {planet} has stitched in a freight bonus.',
  build(T) {
    CastRig.build(T, {
      accent: '#9e7982',
      height: 1.23,
      head: [0, 0.99, 0],
      headParts: /^Optics housing$/,
      omit: /^Lens$/,
      arm: [0.254, 0.68, 0.027, 0.26, 0.053],
      leg: [0.16, 0.37, 0, 0.066, 0.11],
      signal: '#ffd5bb',
      face: {
        eyes: [
          [-0.064, 1.01, 0.119, 0.044],
          [0.064, 1.01, 0.119, 0.044],
        ],
        mouth: [0, 0.936, 0.119, 0.44],
      },
      props: [
        {
          parts: /^Knitting needle$/,
          side: 'L',
          grip: [0, 0.9, 0.24],
          scale: 0.68,
          turn: [-0.1, 0, 1.0],
        },
      ],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.43, 0.019, 0.049);
        n.armL.rotation.x = 0.2 * Math.sin(p * 2) * a;
        n.armR.rotation.x = -0.16 * Math.sin(p * 2) * a;
      },
    });
  },
};
