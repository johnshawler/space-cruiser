/* Ilex · A moss-backed ranger carries small samples in branching antlers. */
SPECIES_EXTRA.ilex = {
  name: 'Ilex',
  kind: 'ilex',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'angular',
  col: '#7d9982',
  hue: 131,
  sat: 12,
  lit: 55,
  syl: ['il', 'eks', 'lor', 'ven', 'ai', 'lok', 'see', 'tet'],
  voice: {
    wave: 'triangle',
    base: 240,
    range: 0.42,
    rate: 5.9,
    glide: 0.44,
    vib: 3,
    vibAmt: 5,
    fx: 'none',
    amp: 0.39,
  },
  trait: 'Ilex carries the smallest field samples between two antler tines.',
  chat: [
    'The lichen in tine two is younger than the label.',
    'A twig joined my field party without a permit.',
    'My north antler points to a very good patch of moss.',
    'We leave one sample where we found it. It writes home.',
    'The slow-growing plot has finally done something.',
  ],
  greet: ['Ranger listening. Keep off the pale patches.', 'Come through the marked clearing.'],
  cargo: ['{good}, beside the field samples.', 'Four squares of moss with their original directions.'],
  joke: ['I applied for a growth chart. They sent me a long calendar.'],
  nice: ['Thank you. The moss appreciates quiet applause.'],
  bye: ['Stay on the marked stones.'],
  honk: ['The lichen will need a moment.'],
  dock: [
    'Welcome to {port}. Land between the survey flags.',
    'At {port}, the soft green patch is a protected resident.',
  ],
  rumor: 'The rangers on {planet} have added a bonus to incoming freight.',
  build(T) {
    CastRig.build(T, {
      accent: '#7d9982',
      height: 1.73,
      arm: [0.24, 0.71, 0.19, 0.59, 0.075],
      leg: [0.24, 0.71, -0.27, 0.078, 0.13],
      skip: (v, m, n) => n.includes('Leg') && m.parent.position.z > 0,
      legParts: /^Leg$/,
      footParts: /^Foot$/,
      mouth: [0, 1.297, 0.448, 0.48],

      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.53, 0.013, 0.022);
        n.armL.rotation.x = -0.5 * Math.sin(p - 0.32) * a;
        n.armR.rotation.x = -n.armL.rotation.x;
        n.head.rotation.x = -0.042 * Math.cos(p * 2) * a;
      },
    });
  },
};
