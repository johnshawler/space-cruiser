/* Rusk · A low kiln inspector carries overlapping fired plates down an armored back. */
SPECIES_EXTRA.rusk = {
  name: 'Rusk',
  kind: 'rusk',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'angular',
  col: '#b77553',
  hue: 20,
  sat: 41,
  lit: 52,
  syl: ['rus', 'kor', 'tile', 'ba', 'rok', 'du', 'kum', 'ash'],
  voice: {
    wave: 'sine',
    base: 139,
    range: 0.42,
    rate: 5.0,
    glide: 0.08,
    vib: 2,
    vibAmt: 8,
    fx: 'rumble',
    amp: 0.39,
  },
  trait: 'Rusk taps the cooled tiles with a back plate and listens for a crack.',
  chat: [
    'A cracked tile rings like a spoon in a sock.',
    'The kiln reached biscuit temperature. No biscuits appeared.',
    'My back plates make a useful second opinion.',
    'I keep the faulty tile that taught me to listen.',
    'The new glaze is called Almost Dry.',
  ],
  greet: ["Tap twice if you're carrying ceramics.", 'Inspector here. Your hull sounds promising.'],
  cargo: ['{good}, with felt between the layers.', 'A carton of tiles graded by their singing voices.'],
  joke: ['The floor passed inspection. It was on the level.'],
  nice: ['That has a nice clear ring. Thanks.'],
  bye: ['Give the glaze time to cool.'],
  honk: ['Hairline crack or enthusiastic horn?'],
  dock: [
    'Welcome to {port}. Avoid the wet tessellation.',
    'At {port}, the warm pad is for cooling pots.',
  ],
  rumor: 'The kilns on {planet} are paying a premium for incoming loads.',
  build(T) {
    CastRig.build(T, {
      accent: '#b77553',
      height: 1.2,
      arm: [0.32, 0.54, 0.14, 0.42, 0.098],
      leg: [0.32, 0.54, -0.32, 0.085, 0.16],
      skip: (v, m, n) => n.includes('Leg') && m.parent.position.z > 0,
      legParts: /^Leg$/,
      footParts: /^Foot$/,
      mouth: [0.012, 0.82, 0.874, 0.5],
      joints: [['tail', [0, 0.7, -0.52], /^Armored tail$/]],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.4, 0.008, 0.052);
        n.armL.rotation.x = -n.legL.rotation.x;
        n.armR.rotation.x = -n.armL.rotation.x;
        n.tail.rotation.y = -0.14 * Math.sin(p) * a;
      },
    });
  },
};
