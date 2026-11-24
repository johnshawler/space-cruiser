/* Fathom · A bronze bathysphere wears a pressure seam, twin skids and a periscope. */
SPECIES_EXTRA.fathom = {
  name: 'Fathom',
  kind: 'fathom',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#aa8452',
  hue: 34,
  sat: 35,
  lit: 49,
  syl: ['fath', 'om', 'sum', 'dep', 'kel', 'vo', 'bol', 'ten'],
  voice: {
    wave: 'square',
    base: 143,
    range: 0.31,
    rate: 4.6,
    glide: 0.22,
    vib: 2,
    vibAmt: 3,
    fx: 'robot',
    amp: 0.24,
  },
  trait: 'Fathom checks the pressure seam before every dive.',
  chat: [
    'I check the seam before every dive, even in the washbasin.',
    'The pressure gauge has a favourite depth.',
    'My periscope saw a perfectly ordinary ceiling today.',
    'The hull sings before it leaks. I prefer humming.',
    'The dive log dried into the shape of a wave.',
  ],
  greet: ['Diver here. Sound travels well down here.', 'Speak up to the periscope.'],
  cargo: ['{good}, sealed all the way round.', 'Pressure gaskets packed at room confidence.'],
  joke: ['I sank a sample invoice. It had hidden depths.'],
  nice: ['Thanks. That holds water.'],
  bye: ['Safe pressure on both sides.'],
  honk: ['That went straight through the ballast.'],
  dock: [
    'Welcome to {port}. The dry skid goes nearest the wall.',
    'At {port}, the dive bell rings only underwater.',
  ],
  rumor: 'The divers on {planet} are raising the freight rate from the bottom up.',
  build(T) {
    CastRig.build(T, {
      accent: '#aa8452',
      height: 1.3,
      depth: 0.84,
      head: [0, 0.68, 0.01],
      headParts: /^(Bathysphere|Pressure seam|Lens|Periscope|Scope mirror)$/,
      arm: [0.36, 0.67, 0, 0.27, 0.064],
      face: { eyes: [[0, 0.775, 0.379, 0.123]], mouth: [0, 0.626, 0.354, 0.63] },
      joints: [
        ['skidL', [-0.19, 0.47, 0], /^(Landing skid|Ballast strut)$/, (v) => v.x < 0],
        ['skidR', [0.19, 0.47, 0], /^(Landing skid|Ballast strut)$/, (v) => v.x > 0],
      ],
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0.012, 0.037);
        n.skidL.rotation.x = 0.24 * Math.sin(p) * a;
        n.skidR.rotation.x = -n.skidL.rotation.x;
      },
    });
  },
};
