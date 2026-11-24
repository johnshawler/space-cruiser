/* Pinion · A copper aerial gearbox has ivory wings and twin propellers. */
SPECIES_EXTRA.pinion = {
  name: 'Pinion',
  kind: 'pinion',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#9a6c56',
  hue: 19,
  sat: 28,
  lit: 47,
  syl: ['pin', 'yon', 'kit', 'aer', 'va', 'slip', 'zen', 'ro'],
  voice: {
    wave: 'sine',
    base: 370,
    range: 0.31,
    rate: 6.6,
    glide: 0.08,
    vib: 3,
    vibAmt: 8,
    fx: 'robot',
    amp: 0.39,
  },
  trait: 'Pinion checks the wing braces before taking the crosswind lane.',
  chat: [
    'I check every brace before I blame the crosswind.',
    'The windsock tried to follow me back to the hangar.',
    'One propeller is always working the opposite shift.',
    'The lane markings look better from underneath.',
    'I carry a folded forecast for use in level flight.',
  ],
  greet: ['Wing inspector here. Which lane are you in?', 'Clear to talk on this heading.'],
  cargo: [
    '{good}, lashed below the crosswind stripe.',
    'Spare braces. The wings stayed attached for collection.',
  ],
  joke: ['The air lane has no potholes, just very sudden suggestions.'],
  nice: ['Thanks. Both wings acknowledge.'],
  bye: ['Keep the crosswind on the painted side.'],
  honk: ['You just moved the windsock.'],
  dock: [
    'At {port}, approach under the white wing marker.',
    'Welcome to {port}. The crosswind lane is yours.',
  ],
  rumor: 'The air-lane crews on {planet} are paying extra for supplies.',
  build(T) {
    CastRig.build(T, {
      accent: '#9a6c56',
      height: 1.16,
      hover: true,
      head: [0, 0.68, 0.17],
      headParts: /^Lens$/,
      arm: [0.22, 0.68, 0.045, 0.24, 0.045],
      faceShell: [0, 0.725, 0.241, 0.153, 0.109, 0.095],
      face: { eyes: [[0, 0.741, 0.324, 0.07]], mouth: [0, 0.651, 0.319, 0.46] },
      extra({ joint, rod, oval }) {
        joint('rig', (g) => {
          rod(g, 'Survey mast', '#b6a584', [0, 0.78, -0.095], [0, 1.29, -0.095], 0.023, 0.011);
          oval(g, 'Wind sensor', '#d2aa72', [0, 1.3, -0.095], [0.043, 0.03, 0.031]);
          for (const s of [-1, 1]) {
            rod(
              g,
              'Undercarriage strut',
              '#657783',
              [s * 0.115, 0.53, 0],
              [s * 0.2, 0.22, 0.025],
              0.028,
              0.019,
            );
            oval(g, 'Runner', 'accent', [s * 0.2, 0.21, 0.018], [0.034, 0.034, 0.124]);
          }
        });
      },
      joints: [
        ['propL', [-0.46, 0.75, 0.22], /^Prop blade$/, (v) => v.x < 0],
        ['propR', [0.46, 0.75, 0.22], /^Prop blade$/, (v) => v.x > 0],
      ],
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0.022, 0.087);
        n.propL.rotation.z = p * 4.7 * a;
        n.propR.rotation.z = -n.propL.rotation.z;
      },
    });
  },
};
