/* Kipp · A six-footed bridge inspector wears studded wing cases. */
SPECIES_EXTRA.kipp = {
  name: 'Kipp',
  kind: 'kipp',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'curvy',
  col: '#869557',
  hue: 75,
  sat: 26,
  lit: 46,
  syl: ['kip', 'kit', 'tek', 'ta', 'bri', 'chep', 'vun', 'iz'],
  voice: {
    wave: 'triangle',
    base: 294,
    range: 0.47,
    rate: 5.9,
    glide: 0.37,
    vib: 4,
    vibAmt: 7,
    fx: 'click',
    amp: 0.39,
  },
  trait: 'Kipp tests a beam with each foot before giving it a clean bill.',
  chat: [
    'All six feet have to agree before I clear a bridge.',
    'The last plank squeaks in a helpful key.',
    'I put the inspection stamp where nobody can step on it.',
    'A bridge is a path with an opinion about water.',
    'The shortest beam passed first.',
  ],
  greet: ['Inspector on deck. One foot at a time.', "Come across. I've tested this bit."],
  cargo: [
    '{good}. The weight is distributed in sixths.',
    'Six little load gauges and one very long form.',
  ],
  joke: ['The bridge asked for a raise. We put blocks underneath.'],
  nice: ['Thanks. Unanimous approval from the feet.'],
  bye: ['Keep to the tested planks.'],
  honk: ["The railing vibrated. I'll make a note."],
  dock: [
    'At {port}, cross on the stamped boards.',
    "Welcome to {port}. The bridge knows you're coming.",
  ],
  rumor: 'Bridge crews on {planet} are paying extra for freight.',
  build(T) {
    CastRig.build(T, {
      accent: '#869557',
      height: 1.16,
      arm: [0.31, 0.48, 0.41, 0.37, 0.078],
      leg: [0.31, 0.48, -0.51, 0.084, 0.15],
      skip: (v, m, n) => n.includes('Leg') && m.parent.position.z > 0.2,
      legParts: /^Leg$/,
      footParts: /^Foot$/,
      mouth: [0, 0.828, 0.555, 0.55],
      joints: [-1, 1].flatMap((s) => [
        [
          'middle' + (s < 0 ? 'L' : 'R'),
          [s * 0.31, 0.48, -0.05],
          /^Leg$/,
          (v, m, n) => n.includes('Leg') && s * v.x > 0 && Math.abs(m.parent.position.z + 0.05) < 0.2,
        ],
      ]),
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.39, 0.008);
        n.armL.rotation.x = n.legL.rotation.x;
        n.armR.rotation.x = -n.armL.rotation.x;
        n.middleR.rotation.x = n.armL.rotation.x;
        n.middleL.rotation.x = n.armR.rotation.x;
      },
    });
  },
};
