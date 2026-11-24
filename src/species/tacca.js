/* Tacca · A long-eared tunnel listener wears a brass-grilled seismic receiver. */
SPECIES_EXTRA.tacca = {
  name: 'Tacca',
  kind: 'tacca',
  family: 'alien',
  skin: 'fuzzy',
  cast: true,
  script: 'curvy',
  col: '#ad8c71',
  hue: 27,
  sat: 27,
  lit: 56,
  syl: ['tak', 'ka', 'tik', 'ven', 'ra', 'tap', 'ul', 'di'],
  voice: {
    wave: 'triangle',
    base: 387,
    range: 0.31,
    rate: 6.8,
    glide: 0.08,
    vib: 3,
    vibAmt: 8,
    fx: 'click',
    amp: 0.39,
  },
  trait: 'Tacca angles one long ear toward the track and keeps the other on the crew.',
  chat: [
    'The left ear hears trains. The right hears excuses.',
    'We found a tunnel by listening to a missing echo.',
    'My receiver clicked. Someone dropped a biscuit three platforms away.',
    'The crew asked me to stop listening during lunch.',
    'A quiet track has an impressive amount to say.',
  ],
  greet: ['One ear on you, one on the rail.', 'Receiver open. Stamp once if you can hear me.'],
  cargo: [
    '{good}, lashed down against low frequencies.',
    'Spare grille cloth. The old one learned to hum.',
  ],
  joke: ['My ear defenders need their own ear defenders.'],
  nice: ['Thank you. Perfectly audible.'],
  bye: ["I'll hear you coming back."],
  honk: ['Both ears got that one.'],
  dock: [
    'At {port}, the hollow platform is closed.',
    'Welcome to {port}. The track says you arrived early.',
  ],
  rumor: 'The tunnel crews on {planet} pay a premium for freight.',
  build(T) {
    CastRig.build(T, {
      accent: '#ad8c71',
      height: 1.48,
      arm: [0.245, 0.77, 0, 0.34, 0.07],
      leg: [0.18, 0.39, 0, 0.067, 0.15],
      legParts: /^Leg$/,
      footParts: /^Foot$/,
      mouth: [0, 1.041, 0.263, 0.53],
      joints: [
        ['earL', [-0.17, 1.32, 0.017], /^(Resonating ear|Ear lining)$/, (v) => v.x < 0, 'head'],
        ['earR', [0.17, 1.32, 0.017], /^(Resonating ear|Ear lining)$/, (v) => v.x > 0, 'head'],
      ],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.5, 0.075, 0.03);
        n.earL.rotation.x = -0.2 * Math.sin(p * 2) * a;
        n.earR.rotation.x = -0.14 * Math.sin(p * 2 - 0.45) * a;
      },
    });
  },
};
