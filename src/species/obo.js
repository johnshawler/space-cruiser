/* Obo · A cricket in a linen dinner jacket carries a bell-ended reed instrument. */
SPECIES_EXTRA.obo = {
  name: 'Obo',
  kind: 'obo',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'angular',
  col: '#8a9f4c',
  hue: 75,
  sat: 35,
  lit: 46,
  syl: ['ob', 'bo', 'zi', 'kri', 'leh', 'tek', 'ru', 'fi'],
  voice: {
    wave: 'triangle',
    base: 379,
    range: 0.42,
    rate: 7.1,
    glide: 0.22,
    vib: 3,
    vibAmt: 3,
    fx: 'none',
    amp: 0.39,
  },
  trait: 'Obo tests a new reed on the last three notes of the closing-time tune.',
  chat: [
    'The closing tune has three notes. Nobody leaves on two.',
    'This reed plays beautifully when the room is empty.',
    'The floorboards hum a low note under table six.',
    'I keep the emergency encore in my breast pocket.',
    'A freight whistle just stole my entrance.',
  ],
  greet: ['Is that you on the pickup?', 'Come in after four. I shall count loudly.'],
  cargo: [
    '{good}, packed between concert programs.',
    'Fresh reeds. The old ones have formed a quartet.',
  ],
  joke: ['The rest in my solo got an excellent review.'],
  nice: ["Thanks. I'll write that above the difficult bar."],
  bye: ["Last three notes, then I'm off."],
  honk: ['Good pitch. Come back for rehearsal.'],
  dock: ['At {port}, the ramp squeaks in tune.', 'Welcome to {port}. Tip the piano mover.'],
  rumor: 'The house band on {planet} says freight gets an encore fee.',
  build(T) {
    CastRig.build(T, {
      accent: '#8a9f4c',
      height: 1.79,
      arm: [0.37, 1.96, 0.01, 0.66, 0.09],
      handColor: '#58713e',
      leg: [0.25, 1.32, 0, 0.11, 0.28],
      legParts: /^(Cricket thigh|Knee|Shin|Tarsus|Toe claw)$/,
      footParts: /^(Tarsus|Toe claw)$/,
      omit: /^(Bent jacket sleeve|Forearm|Player hand|Finger|Fingertip)$/,
      mouth: [0.015, 2.355, 0.275, 0.63],
      lip: [1.08, 0.72, 1],
      props: [
        {
          parts: /^(Woodwind body|Key ring|Woodwind bell|Bell interior)$/,
          side: 'L',
          grip: [0.57, 2.07, 0.7],
          scale: 0.83,
          turn: [0.2, -1.45, -0.06],
        },
      ],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.78, 0.043, 0.035);
        n.head.rotation.z = 0.047 * Math.sin(p * 2) * a;
      },
    });
  },
};
