/* Caelo · A velvet moth lantern keeper has comb antennae and four eyespotted wings. */
SPECIES_EXTRA.caelo = {
  name: 'Caelo',
  kind: 'caelo',
  family: 'alien',
  skin: 'fuzzy',
  cast: true,
  script: 'dots',
  col: '#817393',
  hue: 266,
  sat: 13,
  lit: 51,
  syl: ['ka', 'eh', 'lo', 'vim', 'ish', 'lum', 'ae', 'shen'],
  voice: {
    wave: 'triangle',
    base: 411,
    range: 0.36,
    rate: 7.2,
    glide: 0.22,
    vib: 5,
    vibAmt: 3,
    fx: 'chirp',
    amp: 0.39,
  },
  trait: 'Caelo shields the lantern with one wing while replacing the wick.',
  chat: [
    'The west lamp is sulking. Its wick is too short.',
    'One wing for the wind and one for the rain.',
    'Last night a moth mistook me for the staff entrance.',
    'The lantern oil smells faintly of toasted pear.',
    'My shadow clocks in before I do.',
  ],
  greet: ['You found my light.', 'Come closer. I trimmed the wick for company.'],
  cargo: ['{good}. Keep the oil tin upright.', 'Two spare wicks and an official pocketful of dark.'],
  joke: ['I polished the glass so well I tried to walk through it.'],
  nice: ["That's very bright of you."],
  bye: ["I'll leave one lamp burning."],
  honk: ['The flame leaned away from that.'],
  dock: [
    'At {port}, the amber lamps mark the ramp.',
    'Welcome to {port}. Shield the last light as you pass.',
  ],
  rumor: 'The night shift on {planet} pays extra for cargo before dawn.',
  build(T) {
    CastRig.build(T, {
      accent: '#817393',
      height: 1.5,
      arm: [0.23, 0.91, 0.035, 0.38, 0.062],
      leg: [0.17, 0.46, 0, 0.07, 0.13],
      legParts: /^Leg$/,
      footParts: /^Foot$/,
      mouth: [0, 1.27, 0.237, 0.52],
      joints: [
        ['wingL', [-0.12, 0.9, -0.12], /^Moth wing$/, (v) => v.x < 0],
        ['wingR', [0.12, 0.9, -0.12], /^Moth wing$/, (v) => v.x > 0],
      ],
      props: [
        {
          parts: /^(Lantern handle|Amber lantern)$/,
          side: 'L',
          grip: [0.36, 0.875, 0.23],
          scale: 1.0,
          turn: [-0.23, 0, -0.25],
        },
      ],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.42, 0.022);
        n.wingL.rotation.y = 0.36 * (1 - Math.cos(2 * p)) * a;
        n.wingR.rotation.y = -n.wingL.rotation.y;
      },
    });
  },
};
