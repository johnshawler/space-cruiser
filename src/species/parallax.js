/* Parallax · An ivory C-gauge suspends a calibration cube opposite a blue camera barrel. */
SPECIES_EXTRA.parallax = {
  name: 'Parallax',
  kind: 'parallax',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#e2d7bc',
  hue: 43,
  sat: 40,
  lit: 81,
  syl: ['par', 'eks', 'nul', 'vek', 'ti', 'kal', 'so', 'lim'],
  voice: {
    wave: 'sine',
    base: 343,
    range: 0.42,
    rate: 6.8,
    glide: 0.22,
    vib: 3,
    vibAmt: 3,
    fx: 'click',
    amp: 0.39,
  },
  trait: 'Parallax checks the calibration cube again if anyone breathes near the gauge.',
  chat: [
    'I checked the cube before and after that sneeze.',
    'Five faces agree. The sixth would like a witness.',
    'The empty gap measures precisely one empty gap.',
    'The calibration certificate needs its own calibration.',
    'I have a spare straight edge for emergencies involving corners.',
  ],
  greet: ['Stand where both marks overlap.', 'Survey line open. Breathe toward the ceiling.'],
  cargo: [
    '{good}, measured in three directions.',
    'One reference cube. Please stack nothing on its corners.',
  ],
  joke: ['I squared the invoice. Accounts said it was already a rectangle.'],
  nice: ['Thank you. Within a pleasing tolerance.'],
  bye: ['Keep your reference point in sight.'],
  honk: ['Measured the sound. Definitely wide.'],
  dock: [
    'At {port}, line your hull up with both marks.',
    'Welcome to {port}. Please leave the white cube where you found it.',
  ],
  rumor: 'The survey bench on {planet} measured a sizeable freight bonus.',
  build(T) {
    CastRig.build(T, {
      accent: '#e2d7bc',
      height: 1.52,
      hover: true,
      head: [-0.73, 1.07, 0.11],
      headParts: /^(Camera barrel|Lens bezel)$/,
      arm: [0.49, 1.04, 0.145, 0.44, 0.071],
      faceShell: [-0.73, 1.002, 0.213, 0.154, 0.181, 0.092],
      shellColor: '#58636b',
      face: { eyes: [[-0.73, 1.09, 0.301, 0.113]], mouth: [-0.73, 0.941, 0.309, 0.53] },
      lip: [0.85, 0.72, 1],
      signal: '#8fdfef',
      joints: [['cube', [0.615, 1.07, 0], /^Calibration glass$/]],
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0.022);
        n.cube.rotation.y = 0.24 * Math.sin(p) * a;
        n.rig.rotation.y = 0.09 * Math.sin(p * 0.5) * a;
      },
    });
  },
};
