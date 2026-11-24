/* Marlo · A tusked ice harbormaster wears a wool scarf over a heavy coat. */
SPECIES_EXTRA.marlo = {
  name: 'Marlo',
  kind: 'marlo',
  family: 'alien',
  skin: 'matte',
  cast: true,
  script: 'dots',
  col: '#91a5a4',
  hue: 177,
  sat: 10,
  lit: 61,
  syl: ['mar', 'loh', 'hum', 'voi', 'nu', 'bal', 'iss', 'ro'],
  voice: {
    wave: 'sine',
    base: 146,
    range: 0.53,
    rate: 4.8,
    glide: 0.22,
    vib: 3,
    vibAmt: 3,
    fx: 'rumble',
    amp: 0.39,
  },
  trait: 'Marlo tests the ice with a tusk before sending out a tug.',
  chat: [
    'Clear ice rings. Cloudy ice offers a second opinion.',
    'The scarf is regulation wool, privately darned.',
    "Our smallest tug fits inside yesterday's bootprint.",
    'The harbour thawed early and misplaced pier three.',
    'I test ice before I test the kettle.',
  ],
  greet: ["Ice office. You're clear to speak.", 'Come alongside the warm piling.'],
  cargo: ['{good}, kept away from the thawing edge.', 'A box of mittens sized for tugboat work.'],
  joke: ['My frozen timetable has a very firm departure time.'],
  nice: ["Thanks. That's warmer than the office."],
  bye: ['Easy on the ice at the bend.'],
  honk: ['The tugs are awake now.'],
  dock: [
    'At {port}, the white flags mark firm ice.',
    "Welcome to {port}. I'll send a tug with mittens.",
  ],
  rumor: 'The ice harbour on {planet} has raised its freight allowance.',
  build(T) {
    CastRig.build(T, {
      accent: '#91a5a4',
      height: 1.59,
      arm: [0.4, 0.91, 0.025, 0.42, 0.1],
      leg: [0.28, 0.38, 0, 0.089, 0.15],
      legParts: /^Leg$/,
      footParts: /^Foot$/,
      mouth: [0, 1.262, 0.32, 0.6],
      lip: [1.12, 0.68, 1],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.28, 0.015, 0.085);
        n.armL.rotation.z = -0.06 * Math.abs(Math.sin(p)) * a;
        n.armR.rotation.z = -n.armL.rotation.z;
      },
    });
  },
};
