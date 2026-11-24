/* Nim · A blue seed courier wears a straw hat and grips a dandelion parasol. */
SPECIES_EXTRA.nim = {
  name: 'Nim',
  kind: 'nim',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'angular',
  col: '#788dce',
  hue: 225,
  sat: 47,
  lit: 64,
  syl: ['nim', 'pip', 'fa', 'loo', 'sey', 'mer', 'ti', 'da'],
  voice: {
    wave: 'sine',
    base: 454,
    range: 0.58,
    rate: 7.8,
    glide: 0.16,
    vib: 4,
    vibAmt: 4,
    fx: 'bubble',
    amp: 0.39,
  },
  trait:
    'Nim tips the dandelion parasol into a crosswind and lets it carry the mailbag the last few metres.',
  chat: [
    'The wind delivered the letters in reverse order.',
    "I've sewn a little stamp pocket inside my hat.",
    'The urgent envelope keeps leaning into the breeze.',
    'I have a return address for every seed except the adventurous one.',
    'The bag is shut. The hat is negotiable.',
  ],
  greet: ['Post for you, if you can catch it.', 'Step downwind of the mail, please.'],
  cargo: ['{good}. Signed for by a very small gust.', 'Three postcards and a parasol repair kit.'],
  joke: ['Express delivery means I had to chase it.'],
  nice: ["Thanks. I'll save that on the back of a stamp."],
  bye: ["Tailwind's here. That's my ride."],
  honk: ['That gust was addressed to me.'],
  dock: [
    'Welcome to {port}. Letters go under the brick.',
    'At {port}, mind the envelopes crossing the pad.',
  ],
  rumor: 'The postmaster on {planet} put a bonus stamp on incoming loads.',
  build(T) {
    CastRig.build(T, {
      accent: '#788dce',
      height: 1.57,
      headGroup: 'Round head',
      arm: [0.32, 0.89, 0.04, 0.33, 0.075],
      handColor: '#a5addb',
      leg: [0.16, 0.39, 0, 0.073, 0.15],
      omit: /^(Arm|Short leg|Foot|Mitten hand)$/,
      face: {
        eyes: [
          [-0.135, 1.235, 0.302, 0.071],
          [0.135, 1.235, 0.302, 0.071],
        ],
        mouth: [0, 1.12, 0.335, 0.56],
      },
      lip: [1.18, 0.7, 1],
      props: [
        {
          parts: /^(Parasol stalk|Seed head|Seed ray|Silken filament)$/,
          side: 'L',
          grip: [0.42, 0.98, 0.26],
          scale: 0.76,
          turn: [0.1, 0, 0.39],
        },
        {
          parts: /^(Postbag|Envelope flap|Cross-body strap|Rivet)$/,
          side: 'R',
          grip: [0.27, 0.65, 0.16],
          scale: 0.66,
          turn: [-0.05, 1.24, 0],
        },
      ],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.56, 0.04, 0.06);
        n.armL.rotation.x *= 0.14;
        n.head.rotation.z = -0.065 * Math.sin(p) * a;
      },
    });
  },
};
