/* Orris · A leafy-eared botanist in a rust vest carries a tray of seedlings. */
SPECIES_EXTRA.orris = {
  name: 'Orris',
  kind: 'orris',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'curvy',
  col: '#5f9d8b',
  hue: 163,
  sat: 25,
  lit: 49,
  syl: ['or', 'ris', 'fen', 'loa', 'thu', 'bea', 'iss', 'pon'],
  voice: {
    wave: 'triangle',
    base: 228,
    range: 0.31,
    rate: 5.4,
    glide: 0.16,
    vib: 2,
    vibAmt: 4,
    fx: 'chirp',
    amp: 0.39,
  },
  trait: 'Orris turns every leaf over before declaring a seedling healthy.',
  chat: [
    'A seedling has requested a window seat.',
    'Turn that leaf over. The underside has opinions.',
    'My tray passed customs. The soil is still answering questions.',
    'Three pots sprouted. I only packed two.',
    'The watering roster includes a day off for the watering can.',
  ],
  greet: [
    'Botany desk. How much sun does your cabin get?',
    'Come aboard. Wipe your boots on the way out. I need the soil.',
  ],
  cargo: [
    '{good}. Please keep the drainage holes clear.',
    'Six quiet seedlings and their noisy little labels.',
  ],
  joke: ['The vine climbed the career ladder. Now nobody can reach the scissors.'],
  nice: ['Thank you. I shall tell the compost.'],
  bye: ['Goodbye. Watch where the roots cross the ramp.'],
  honk: ['That loosened the pollen.'],
  dock: [
    'Welcome to {port}. The fern has stamped your slip.',
    'At {port}, green shoots have right of way.',
  ],
  rumor: 'The nurseries on {planet} are paying extra for a prompt arrival.',
  build(T) {
    CastRig.build(T, {
      accent: '#5f9d8b',
      height: 1.65,
      headGroup: 'Neck and head',
      arm: [0.7, 1.51, 0.055, 0.62, 0.13],
      handColor: '#b9d79f',
      leg: [0.44, 0.49, 0, 0.16, 0.33],
      legParts: /^(Haunch|Webbed foot|Toe pad)$/,
      footParts: /^(Webbed foot|Toe pad)$/,
      omit: /^(Supporting arm|Inspecting arm|Palm|Finger|Fingertip|Curled forefinger|Thumb)$/,
      mouth: [0, 2.125, 0.369, 0.87],
      lip: [1.18, 0.64, 0.88],
      props: [
        {
          parts: /^Seed tray$/,
          side: 'L',
          grip: [0.24, 1.12, 0.52],
          scale: 0.8,
          turn: [-0.19, 0.15, 0.14],
        },
      ],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.38, 0.034, 0.065);
        n.armL.rotation.x *= 0.18;
      },
    });
  },
};
