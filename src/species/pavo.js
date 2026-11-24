/* Pavo · A turquoise herald carries a crowned head in front of an eyespotted feather fan. */
SPECIES_EXTRA.pavo = {
  name: 'Pavo',
  kind: 'pavo',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'angular',
  col: '#528a89',
  hue: 179,
  sat: 25,
  lit: 43,
  syl: ['pah', 'voh', 'treh', 'la', 'no', 'fi', 'ru', 'dai'],
  voice: {
    wave: 'sine',
    base: 329,
    range: 0.42,
    rate: 6.7,
    glide: 0.16,
    vib: 2,
    vibAmt: 4,
    fx: 'chirp',
    amp: 0.39,
  },
  trait: 'Pavo opens the feather fan before announcing an arrival.',
  chat: [
    'I announced a cart yesterday. It acknowledged with one squeak.',
    'An arrival gets six feathers. A delivery gets seven.',
    'The formal pause in my script is nearly a whole page.',
    'I practise my opening outside the freight lift.',
    "The court approved a shorter word for welcome. It's longer.",
  ],
  greet: [
    'Stand by for an entirely official hello.',
    'Your arrival has been noticed in the proper order.',
  ],
  cargo: [
    '{good}, entering by the ceremonial ramp.',
    'Two velvet ropes and an unusually important hook.',
  ],
  joke: ['I announced myself once. Had to hurry round to the entrance.'],
  nice: ['Your kind remark is duly proclaimed.'],
  bye: ['Exit fanfare follows separately.'],
  honk: ['A fine introduction. I shall take it from here.'],
  dock: [
    'Welcome to {port}. On behalf of the loading ramp, hello.',
    'At {port}, ordinary freight may also bow.',
  ],
  rumor: 'The court on {planet} has proclaimed a higher delivery fee.',
  build(T) {
    CastRig.build(T, {
      accent: '#528a89',
      height: 1.51,
      arm: [0.21, 0.91, 0.033, 0.34, 0.065],
      hand: 'wing',
      leg: [0.16, 0.51, 0, 0.066, 0.15],
      legParts: /^Leg$/,
      footParts: /^Foot$/,
      mouth: [0, 1.25, 0.39, 0.47],
      joints: [['fan', [0, 0.53, -0.16], /^(Fan feather|Feather eye|Eye center)$/]],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.65, 0.031, 0.023);
        n.fan.rotation.y = -0.15 * Math.sin(p) * a;
        n.fan.rotation.x = 0.052 * Math.cos(p * 2) * a;
      },
    });
  },
};
