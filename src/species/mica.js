/* Mica · A plated, copper-beaked surveyor wears a travel cape and carries a sextant. */
SPECIES_EXTRA.mica = {
  name: 'Mica',
  kind: 'mica',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'dots',
  col: '#537a7a',
  hue: 180,
  sat: 19,
  lit: 40,
  syl: ['mi', 'kar', 'sek', 'tir', 'ven', 'qua', 'sha', 'rei'],
  voice: {
    wave: 'triangle',
    base: 250,
    range: 0.53,
    rate: 5.8,
    glide: 0.44,
    vib: 2,
    vibAmt: 5,
    fx: 'click',
    amp: 0.39,
  },
  trait: 'Mica keeps a brass sextant for the days when the ship insists it knows where it is.',
  chat: [
    'The nav screen insists the horizon is in my pocket.',
    'I checked our heading against a chipped brass screw.',
    'Clouds make poor reference points. They wander off.',
    'My sextant has never asked for a software update.',
    'The shortcut on this chart is an old tea stain.',
  ],
  greet: ['Hold a bearing for me.', 'There you are, one division to starboard.'],
  cargo: ['{good}. I plotted the corners myself.', 'A replacement horizon line. Rolled, of course.'],
  joke: ['I lost my bearings. Luckily the sextant has spares.'],
  nice: ['A precise compliment. Thank you.'],
  bye: ['Fair angles and a steady deck.'],
  honk: ['One short blast puts you just above the horizon.'],
  dock: ['At {port}, line up on the crooked chimney.', 'Welcome to {port}. My chart agrees for once.'],
  rumor: "The brass marks on {planet}'s tariff chart point to a bonus.",
  build(T) {
    CastRig.build(T, {
      accent: '#537a7a',
      height: 1.76,
      headGroup: 'Armored avian head',
      arm: [0.42, 2.09, 0.03, 0.7, 0.1],
      handColor: '#50595b',
      leg: [0.23, 1.52, 0, 0.12, 0.25],
      legParts: /^(Leg|Kneecap|Boot|Foot claw)$/,
      footParts: /^(Boot|Foot claw)$/,
      omit: /^(Surveyor arm|Glove|Finger|Fingertip)$/,
      mouth: [0, 2.53, 0.32, 0.6],
      lip: [1.15, 0.66, 1],
      props: [
        {
          parts: /^Sextant$/,
          side: 'L',
          grip: [0.58, 2.31, 0.61],
          scale: 0.94,
          turn: [-0.05, 0.6, 0.21],
        },
      ],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.55, 0.016, 0.027, 0.018);
        n.armL.rotation.x *= 0.28;
      },
    });
  },
};
