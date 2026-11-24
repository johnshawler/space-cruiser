/* Relay · A green receiver cabinet balances an open brass dish above its speaker grille. */
SPECIES_EXTRA.relay = {
  name: 'Relay',
  kind: 'relay',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#64867b',
  hue: 161,
  sat: 15,
  lit: 46,
  syl: ['re', 'lay', 'sin', 'vah', 'tek', 'pul', 'win', 'jo'],
  voice: {
    wave: 'triangle',
    base: 313,
    range: 0.47,
    rate: 6.1,
    glide: 0.44,
    vib: 4,
    vibAmt: 5,
    fx: 'robot',
    amp: 0.39,
  },
  trait: 'Relay tilts its dish until a distant carrier resolves into a whistle.',
  chat: [
    'A carrier came in whistling. I answered in the same key.',
    'Static is what the sky sounds like between appointments.',
    'My dish picked up a recipe from last Tuesday.',
    'The aerial points better after I stop guessing.',
    "I've logged a signal that only broadcasts its lunch break.",
  ],
  greet: ["You're coming through with a little weather.", 'Receiver tuned. Say your call sign slowly.'],
  cargo: ["{good}, outside the aerial's blind spot.", 'An empty frequency, carefully boxed.'],
  joke: ['I tuned in to a silent station. Reception was excellent.'],
  nice: ['Thanks. Five clear bars.'],
  bye: ['Keep a channel open.'],
  honk: ['Loud and admirably local.'],
  dock: [
    'Welcome to {port}. Follow the low carrier tone.',
    'At {port}, the green aerial marks dispatch.',
  ],
  rumor: 'The carrier from {planet} is repeating a higher delivery offer.',
  build(T) {
    CastRig.build(T, {
      accent: '#64867b',
      height: 1.42,
      head: [0, 1.015, 0],
      headParts: /^Dish gimbal$/,
      arm: [0.32, 0.85, 0.04, 0.35, 0.052],
      leg: [0.23, 0.42, 0, 0.076, 0.15],
      face: { eyes: [[0, 1.16, 0.106, 0.083]], mouth: [0, 1.055, 0.105, 0.54] },
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.45, 0.017, 0.04);
        n.head.rotation.y = 0.2 * Math.sin(p * 0.51) * a;
        n.head.rotation.x = -0.08 * Math.cos(p) * a;
      },
    });
  },
};
