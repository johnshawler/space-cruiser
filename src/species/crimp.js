/* Crimp · A twin-wheeled cable splicer carries a working vice under its raised optic. */
SPECIES_EXTRA.crimp = {
  name: 'Crimp',
  kind: 'crimp',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#bc765c',
  hue: 16,
  sat: 42,
  lit: 55,
  syl: ['kri', 'imp', 'tek', 'fer', 'vin', 'nak', 'zul', 'ke'],
  voice: {
    wave: 'square',
    base: 151,
    range: 0.42,
    rate: 5.1,
    glide: 0.08,
    vib: 2,
    vibAmt: 8,
    fx: 'click',
    amp: 0.24,
  },
  trait: 'Crimp closes the vice on scrap wire to test the jaw spacing.',
  chat: [
    'I close the vice on scrap before trusting a cable.',
    'This wire is rated for three bends and a misunderstanding.',
    'The spare ferrule fits everything except its own drawer.',
    'I keep the clean cuttings for practice joins.',
    "My best splice is hard to point out. That's the idea.",
  ],
  greet: ['Splicing bench. Is your line intact?', 'Hold the loose end and tell me.'],
  cargo: ['{good}, cinched with a reusable loop.', 'A box of ferrules sorted by inside diameter.'],
  joke: ['I joined the ends of my shift. Now it goes round forever.'],
  nice: ['Thank you. That joint will hold.'],
  bye: ['Release the jaw before you pull away.'],
  honk: ['That found the loose end.'],
  dock: [
    'At {port}, park beyond the cable drum.',
    'Welcome to {port}. Untwist the sling before lifting.',
  ],
  rumor: 'The cable crews on {planet} are splicing a bonus into the freight pay.',
  build(T) {
    CastRig.build(T, {
      accent: '#bc765c',
      height: 1.25,
      head: [0, 1.12, -0.13],
      headParts: /^Optics housing$/,
      omit: /^Lens$/,
      arm: [0.35, 0.48, 0.075, 0.27, 0.052],
      signal: '#99e9df',
      face: {
        eyes: [
          [-0.068, 1.139, 0.006, 0.047],
          [0.068, 1.139, 0.006, 0.047],
        ],
        mouth: [0, 1.064, 0.006, 0.43],
      },
      joints: [
        ['axle', [0, 0.21, 0], /^(Rubber wheel|Wheel hub)$/],
        ['jaw', [0.252, 0.62, 0], /^(Vice jaw|Jaw liner)$/, (v) => v.x > 0],
      ],
      gait(n, p, a) {
        CastRig.roll(n, p, a, ['axle'], 2.35);
        n.jaw.position.x = n.jaw.userData.restX + 0.023 * (1 - Math.cos(p)) * a;
      },
    });
  },
};
