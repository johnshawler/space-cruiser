/* Tally · A brass weighing drum balances on one wheel below a shallow scale pan. */
SPECIES_EXTRA.tally = {
  name: 'Tally',
  kind: 'tally',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#c39140',
  hue: 37,
  sat: 52,
  lit: 51,
  syl: ['tal', 'tik', 'wei', 'din', 'bal', 'nok', 'ko', 'tin'],
  voice: {
    wave: 'square',
    base: 211,
    range: 0.31,
    rate: 5.2,
    glide: 0.16,
    vib: 2,
    vibAmt: 4,
    fx: 'robot',
    amp: 0.24,
  },
  trait: 'Tally weighs every bent teaspoon before deciding whether it belongs back in the galley.',
  chat: [
    'A bent teaspoon weighs the same after a stern talking-to.',
    'My pan is zeroed, apart from a little optimism.',
    'The galley denies owning nineteen left-handed spoons.',
    'I weigh the dust before I brush it off.',
    'The needle moved. Someone looked at the sample too heavily.',
  ],
  greet: ['Scale desk. Nothing on the pan, please.', "Hello. I've deducted the weight of the greeting."],
  cargo: [
    '{good}, less the weight of the string.',
    'A sack of spoons sorted by how much soup they remember.',
  ],
  joke: ['The teaspoon was underweight. It had skipped dessert.'],
  nice: ["Thanks. I'll give that full weight."],
  bye: ['Scales clear. Safe travels.'],
  honk: ['That added half a graduation.'],
  dock: [
    'Welcome to {port}. One axle on the scale at a time.',
    'At {port}, spare cutlery goes in the brass pan.',
  ],
  rumor: 'The salvage scales on {planet} are tipping toward higher freight pay.',
  build(T) {
    CastRig.build(T, {
      accent: '#c39140',
      height: 1.55,
      head: [0, 1.03, 0.391],
      headParts: /^(Spring scale face|Eye lamp)$/,
      arm: [0.46, 1.15, 0.02, 0.41, 0.074],
      omit: /^(Picking jaw|Tally counter)$/,
      signal: '#a9ecdb',
      face: {
        eyes: [
          [-0.14, 1.13, 0.495, 0.071],
          [0.14, 1.13, 0.495, 0.071],
        ],
        mouth: [0, 0.93, 0.491, 0.66],
      },
      props: [
        { parts: /^Teaspoon (handle|bowl)$/, side: 'L', grip: [-0.394, 1.562, 0.34], scale: 0.88 },
      ],
      joints: [
        ['wheel', [0, 0.37, 0], /^(Drive wheel|Wheel hub)$/],
        ['standL', [-0.34, 0.78, -0.06], /^Kickstand/, (v) => v.x < 0],
        ['standR', [0.34, 0.78, -0.06], /^Kickstand/, (v) => v.x > 0],
      ],
      gait(n, p, a) {
        CastRig.roll(n, p, a, ['wheel'], 1.8);
        n.standL.rotation.x = n.standR.rotation.x = 0.31 * a;
        n.rig.rotation.x = 0.032 * Math.sin(p) * a;
      },
    });
  },
};
