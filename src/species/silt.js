/* Silt · A red sand burrower wears a saddle roll behind its ring of pale mouth plates. */
SPECIES_EXTRA.silt = {
  name: 'Silt',
  kind: 'silt',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'curvy',
  col: '#a85256',
  hue: 357,
  sat: 34,
  lit: 49,
  syl: ['sil', 'tor', 'um', 'gak', 'den', 'ruh', 'tap', 'kho'],
  voice: {
    wave: 'sawtooth',
    base: 120,
    range: 0.47,
    rate: 4.4,
    glide: 0.08,
    vib: 5,
    vibAmt: 8,
    fx: 'rumble',
    amp: 0.24,
  },
  trait: 'Silt puts a tuning fork to the sand and waits for the answer through four planted feet.',
  chat: [
    "The sand says there's a hollow under bay two.",
    'Hold still. Your boots are talking over the dune.',
    'I tuned my fork to a particularly reliable pebble.',
    "The quiet patch rattles. That's how I found it.",
    'My bedroll has sand on the inside. Good acoustics.',
  ],
  greet: ['One moment while the echo catches up.', 'Listening post here. Speak toward the ground.'],
  cargo: ['{good}. I sounded every crate.', 'Four sacks of sand labelled by volume. Loudest goes last.'],
  joke: ['A dune told me a secret. It shifts its story daily.'],
  nice: ['Thank you. That rings true.'],
  bye: ['Soft steps until you clear the ridge.'],
  honk: ['Good resonance. Loose bolt near the rear.'],
  dock: ['Welcome to {port}. The quiet pad is yours.', 'At {port}, the sand signs for deliveries.'],
  rumor: 'The dunes on {planet} are humming about a delivery premium.',
  build(T) {
    CastRig.build(T, {
      accent: '#a85256',
      height: 1.23,
      headGroup: 'Ring mouth',
      arm: [0.62, 0.94, 0.43, 0.57, 0.13],
      handColor: '#e1b383',
      leg: [0.43, 0.86, -0.57, 0.16, 0.25],
      legParts: /^(Digging leg|Foot pad|Digging claw)$/,
      footParts: /^(Foot pad|Digging claw)$/,
      omit: /^(Listening forelimb|Gripping palm|Finger|Fingertip)$/,
      mouth: [0, 1.012, 1.04, 1.14],
      lip: [1.0, 1.25, 1],
      joints: [
        ['foreL', [-0.42, 0.86, 0.41], /^Digging (leg|claw)$|^Foot pad$/, (v) => v.z > 0 && v.x < 0],
        ['foreR', [0.42, 0.86, 0.41], /^Digging (leg|claw)$|^Foot pad$/, (v) => v.z > 0 && v.x > 0],
      ],
      props: [
        {
          parts: /^(Fork handle|Fork bridge|Tuning fork tine)$/,
          side: 'L',
          grip: [-0.82, 0.43, 0.82],
          scale: 0.82,
        },
      ],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.34, 0.012, 0.035);
        n.foreL.rotation.x = -n.legL.rotation.x;
        n.foreR.rotation.x = -n.legR.rotation.x;
      },
    });
  },
};
