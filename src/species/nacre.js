/* Nacre · A rose reef acoustician stands on six soft feet in front of a ribbed shell fan. */
SPECIES_EXTRA.nacre = {
  name: 'Nacre',
  kind: 'nacre',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'angular',
  col: '#ae817e',
  hue: 4,
  sat: 23,
  lit: 59,
  syl: ['nak', 'reh', 'lum', 'sho', 'ti', 'lam', 'ah', 'sui'],
  voice: {
    wave: 'sawtooth',
    base: 269,
    range: 0.58,
    rate: 6.1,
    glide: 0.22,
    vib: 4,
    vibAmt: 3,
    fx: 'chorus',
    amp: 0.24,
  },
  trait: 'Nacre presses a shell rib to a wall to hear the tide beyond it.',
  chat: [
    'The reef sounds different after the lunch bell.',
    'I heard a tide through six walls and a biscuit tin.',
    'Each shell rib is tuned to a different inlet.',
    'The harbour echo came back with a request.',
    'A quiet room still has a shoreline somewhere.',
  ],
  greet: ['Speak into the wide end of the shell.', 'Reef station. I can hear your wake.'],
  cargo: [
    '{good}, packed between sound-deadening towels.',
    'A collection of tides. The shells are included.',
  ],
  joke: ["I held a shell to a shell and now they're corresponding."],
  nice: ['Thank you. Lovely overtones.'],
  bye: ['May your wake sound gentle.'],
  honk: ['I shall file that under sudden tides.'],
  dock: [
    'Welcome to {port}. Listen for the hollow pilings.',
    'At {port}, the round wall carries announcements best.',
  ],
  rumor: 'The reef survey on {planet} is paying extra for deliveries.',
  build(T) {
    CastRig.build(T, {
      tent: Array.from({ length: 6 }, (_, i) => 'pod' + i),
      accent: '#ae817e',
      height: 1.29,
      arm: [0.23, 0.68, 0.06, 0.35, 0.069],
      hand: 'fin',
      mouth: [0, 0.897, 0.388, 0.47],
      joints: Array.from({ length: 6 }, (_, i) => {
        const t = (i * Math.PI) / 3;
        return [
          'pod' + i,
          [Math.cos(t) * 0.17, 0.57, Math.sin(t) * 0.13],
          /^Shell foot$/,
          (v) =>
            Math.round((Math.atan2(v.z / 0.37, v.x / 0.44) + Math.PI * 2) / (Math.PI / 3)) % 6 === i,
        ];
      }),
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0.011);
        for (let i = 0; i < 6; i++) {
          const beat = p + (i * Math.PI) / 3;
          n['pod' + i].rotation.x = 0.28 * Math.sin(beat) * a;
          n['pod' + i].rotation.z = 0.12 * Math.cos(beat) * a;
        }
      },
    });
  },
};
