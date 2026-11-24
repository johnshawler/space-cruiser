/* Orlo · Nested brass and blue gimbals hang above a compact gyro base. */
SPECIES_EXTRA.orlo = {
  name: 'Orlo',
  kind: 'orlo',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#667c9a',
  hue: 215,
  sat: 20,
  lit: 50,
  syl: ['or', 'lo', 'gym', 'bal', 'tir', 'axi', 'ro', 'nul'],
  voice: {
    wave: 'sine',
    base: 254,
    range: 0.42,
    rate: 6.0,
    glide: 0.44,
    vib: 3,
    vibAmt: 5,
    fx: 'click',
    amp: 0.39,
  },
  trait: 'Orlo holds the inner gimbal still while the platform settles.',
  chat: [
    'The platform moved. My inner ring has lodged a protest.',
    'Level is a local custom.',
    "I keep yesterday's vertical in the log for comparison.",
    'My calibration chair has one short leg for training.',
    'Three rings agreed at once. I checked the power.',
  ],
  greet: ["Hold still if that's convenient.", 'Reference frame open. Which way is up today?'],
  cargo: ['{good}, suspended at the approved angle.', 'A replacement axis. It travels flat.'],
  joke: ['I took a balanced view. The shelf was crooked.'],
  nice: ['Thank you. Equilibrium restored.'],
  bye: ['Keep the shiny axis upright.'],
  honk: ['The outer ring disagrees with your rhythm.'],
  dock: [
    'At {port}, the level stripe is almost level.',
    'Welcome to {port}. Wait for the platform to settle.',
  ],
  rumor: 'My readings confirm a positive freight adjustment on {planet}.',
  build(T) {
    CastRig.build(T, {
      accent: '#667c9a',
      height: 1.37,
      head: [0, 0.83, 0],
      headParts: /^(Pendulum core|Lens)$/,
      arm: [0.205, 0.56, 0.04, 0.29, 0.048],
      face: { eyes: [[0, 0.852, 0.168, 0.073]], mouth: [0, 0.767, 0.143, 0.44] },
      joints: [
        ['outer', [0, 0.83, 0], /^Gimbal$/, (v, m) => m.material.name.startsWith('#667c9a')],
        ['inner', [0, 0.83, 0], /^Gimbal$/, (v, m) => m.material.name.startsWith('#c4964e')],
      ],
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0);
        n.rig.rotation.z = 0.074 * Math.sin(p) * a;
        n.outer.rotation.y = 0.38 * Math.sin(p) * a;
        n.inner.rotation.x = 0.29 * Math.cos(p) * a;
      },
    });
  },
};
