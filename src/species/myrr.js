/* Myrr · A mushroom kitchen steward wears a green apron under a cream-gilled cap. */
SPECIES_EXTRA.myrr = {
  name: 'Myrr',
  kind: 'myrr',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'curvy',
  col: '#d8b58e',
  hue: 32,
  sat: 49,
  lit: 70,
  syl: ['my', 'reh', 'gus', 'vel', 'um', 'pa', 'sep', 'nou'],
  voice: {
    wave: 'sine',
    base: 257,
    range: 0.31,
    rate: 5.6,
    glide: 0.22,
    vib: 2,
    vibAmt: 3,
    fx: 'none',
    amp: 0.39,
  },
  trait: 'Myrr hides the tasting spoon under a broad mushroom cap.',
  chat: [
    'One clean spoon for every soup. There are more soups than spoons.',
    'The broth grew a tiny umbrella overnight.',
    'A pinch of seasoning is a licensed unit here.',
    'The lunch queue has asked for seconds in advance.',
    'I keep the tasting spoon under my cap when it rains.',
  ],
  greet: ["Stew's on. Are you calling about portions?", 'Hello. The kettle has the other line.'],
  cargo: [
    '{good}, marked clearly as ingredients or furniture.',
    'Six jars of stock and a ladle on parole.',
  ],
  joke: ['The soup was too quiet. I added a little thyme to talk.'],
  nice: ['Thank you. Have the crunchy bit.'],
  bye: ['Mind the steam on your way out.'],
  honk: ['The kettle can manage its own whistle.'],
  dock: [
    'Welcome to {port}. Lunch is through the blue door.',
    'At {port}, return the spoons to the little hatch.',
  ],
  rumor: 'Full kitchens on {planet} are paying extra for deliveries.',
  build(T) {
    CastRig.build(T, {
      offsets: [[/^(Bell cap|Cream gill)$/, [0, 0.12, 0]]],
      accent: '#d8b58e',
      height: 1.36,
      arm: [0.23, 0.72, 0.02, 0.31, 0.058],
      leg: [0.17, 0.37, 0, 0.064, 0.13],
      legParts: /^Leg$/,
      footParts: /^Foot$/,
      mouth: [0, 1.048, 0.18, 0.48],
      props: [
        {
          parts: /^(Tasting spoon|Spoon bowl)$/,
          side: 'L',
          grip: [0.27, 0.62, 0.2],
          scale: 0.92,
          turn: [0, -1.42, 0],
        },
      ],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.46, 0.026, 0.075);
        n.head.rotation.z = -0.085 * Math.sin(p - 0.25) * a;
      },
    });
  },
};
