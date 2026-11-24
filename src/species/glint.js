/* Glint · A blue mirror yoke carries a six-sided reflector over three landing struts. */
SPECIES_EXTRA.glint = {
  name: 'Glint',
  kind: 'glint',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#8299a5',
  hue: 201,
  sat: 16,
  lit: 58,
  syl: ['glin', 'ti', 'lux', 'sek', 'bea', 'ral', 'ni', 'ga'],
  voice: {
    wave: 'square',
    base: 339,
    range: 0.42,
    rate: 6.8,
    glide: 0.16,
    vib: 2,
    vibAmt: 4,
    fx: 'click',
    amp: 0.24,
  },
  trait: 'Glint finds the edge of a beam with a six-sided mirror.',
  chat: [
    "The beam edge is easier to see on somebody else's wall.",
    'I polished one face and improved six reflections.',
    'A cloud has requested temporary custody of the sunlight.',
    'My aiming mark is the least scorched spot.',
    'I fold the mirror away before anybody serves soup.',
  ],
  greet: ['Solar bench here. Shade your eyes.', 'I see your signal on the calibration card.'],
  cargo: ['{good}, matte side facing the reflector.', 'A mirror cloth with very high standards.'],
  joke: ['I sent a bright idea to dispatch. They lowered the blinds.'],
  nice: ['Thanks. That reflects well on the crew.'],
  bye: ['May the beam just miss your windscreen.'],
  honk: ['The mirror shook six bright spots loose.'],
  dock: [
    'Welcome to {port}. Follow the dull stripe.',
    'At {port}, the bright square is an instrument, not a parking space.',
  ],
  rumor: 'The solar crews on {planet} are offering a bright little freight premium.',
  build(T) {
    CastRig.build(T, {
      accent: '#8299a5',
      height: 1.42,
      head: [0, 0.93, 0],
      headParts: /^Mirror head$/,
      faceShell: [0, 0.955, 0.06, 0.165, 0.115, 0.05],
      shellColor: '#b5ac82',
      arm: [0.22, 0.65, 0.035, 0.28, 0.049],
      leg: [0.12, 0.48, 0, 0.048, 0.093],
      legParts: /^Landing leg$/,
      omit: /^Lens$/,
      face: {
        eyes: [
          [-0.068, 0.973, 0.105, 0.053],
          [0.068, 0.973, 0.105, 0.053],
        ],
        mouth: [0, 0.897, 0.11, 0.5],
      },
      joints: [['rear', [0, 0.48, -0.08], /^Rear support$/]],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.44, 0.017, 0.032);
        n.rear.rotation.x = 0.23 * Math.sin(2 * p) * a;
        n.head.rotation.y = -0.16 * Math.sin(p * 0.5) * a;
      },
    });
  },
};
