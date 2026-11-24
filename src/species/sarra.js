/* Sarra · A jade, hooded glassblower balances on a coil beside a glowing gather. */
SPECIES_EXTRA.sarra = {
  name: 'Sarra',
  kind: 'sarra',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'dots',
  col: '#719d89',
  hue: 153,
  sat: 18,
  lit: 53,
  syl: ['sar', 'ah', 'sii', 'vel', 'gha', 're', 'shoo', 'es'],
  voice: {
    wave: 'sine',
    base: 192,
    range: 0.36,
    rate: 5.2,
    glide: 0.08,
    vib: 4,
    vibAmt: 8,
    fx: 'chorus',
    amp: 0.39,
  },
  trait: 'Sarra steadies the pipe with a coil until the molten bead rounds over.',
  chat: [
    'That bead was round until somebody complimented it.',
    'The pipe needs a steady hand and a very patient coil.',
    'A bubble in the glass is a window for an ant.',
    'My apprentice blew a vase with the receipt inside.',
    'The annealing oven has asked for a quiet hour.',
  ],
  greet: ['Let me put this gather down.', 'Glass bench here. Gentle voices, please.'],
  cargo: [
    '{good}. Corners padded individually.',
    'A case of empty bubbles with the glass still around them.',
  ],
  joke: ['My first bottle was all neck. Very hard to put down.'],
  nice: ["Thank you. I'll save you the blue bead."],
  bye: ["Cool slowly, wherever you're going."],
  honk: ['There goes a perfectly round bubble.'],
  dock: ['At {port}, leave the orange rack alone.', 'Welcome to {port}. The cool glass is on the left.'],
  rumor: 'The glassworks on {planet} pays more for careful freight.',
  build(T) {
    CastRig.build(T, {
      accent: '#719d89',
      height: 1.38,
      arm: [0.135, 0.92, 0.07, 0.29, 0.063],
      hand: 'fin',
      mouth: [0.04, 1.15, 0.321, 0.54],
      joints: [['coil', [0.01, 0.99, 0.06], /^Coiled body$/]],
      props: [
        {
          parts: /^(Glassblowing pipe|Molten gather)$/,
          side: 'L',
          grip: [0.12, 1.1, 0.48],
          scale: 0.83,
          turn: [-0.75, -0.28, 0.42],
        },
      ],
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0.006);
        n.coil.rotation.y = 0.12 * Math.sin(p) * a;
        n.coil.scale.x = 1 + 0.035 * Math.sin(p) * a;
        n.rig.rotation.y = -0.065 * Math.sin(p) * a;
      },
    });
  },
};
