/* Plover · A blue long-legged wader carries a chart bag below its curved sounding bill. */
SPECIES_EXTRA.plover = {
  name: 'Plover',
  kind: 'plover',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'curvy',
  col: '#699ba3',
  hue: 188,
  sat: 24,
  lit: 53,
  syl: ['plo', 'ver', 'shee', 'tak', 'wi', 'sol', 'ai', 'chu'],
  voice: {
    wave: 'triangle',
    base: 337,
    range: 0.47,
    rate: 6.3,
    glide: 0.44,
    vib: 4,
    vibAmt: 5,
    fx: 'chirp',
    amp: 0.39,
  },
  trait: 'Plover marks a sounding with the tip of a very long bill.',
  chat: [
    'I measured that puddle. It is technically a harbour.',
    'The red reeds mark the old channel on Thursdays.',
    'My bill has a scratch at one metre.',
    'The marsh archive is mostly waterproof excuses.',
    "One bootprint and I've got another pond to survey.",
  ],
  greet: ['Soundings desk. How deep is your question?', 'Come off the mud and say hello.'],
  cargo: [
    '{good}, stowed above the reed line.',
    'A chart roll and one extremely long measuring string.',
  ],
  joke: ['I took a shallow reading. The pond was offended.'],
  nice: ["Thanks. I'll mark a star beside that."],
  bye: ["Mind the last step. I haven't measured it."],
  honk: ['That startled the measuring reeds.'],
  dock: [
    'Welcome to {port}. The blue posts are dry.',
    'At {port}, sound the water beside the third piling.',
  ],
  rumor: 'Survey crews on {planet} are offering extra for the next load.',
  build(T) {
    CastRig.build(T, {
      accent: '#699ba3',
      height: 1.78,
      arm: [0.21, 1.19, 0.035, 0.39, 0.061],
      hand: 'wing',
      leg: [0.15, 0.92, 0, 0.06, 0.18],
      legParts: /^Leg$/,
      footParts: /^Foot$/,
      omit: /^Folded wing$/,
      mouth: [0, 1.65, 0.48, 0.46],
      lip: [1.15, 0.52, 1],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.76, 0.022, 0.024);
        n.footL.rotation.x += 0.27 * Math.max(0, -Math.cos(p)) * a;
        n.footR.rotation.x += 0.27 * Math.max(0, Math.cos(p)) * a;
        n.head.rotation.x = 0.12 * Math.cos(2 * p) * a;
      },
    });
  },
};
