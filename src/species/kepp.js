/* Kepp · A pale trail keeper carries a spiral shell over a broad muscular foot. */
SPECIES_EXTRA.kepp = {
  name: 'Kepp',
  kind: 'kepp',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'curvy',
  col: '#85a79b',
  hue: 159,
  sat: 16,
  lit: 59,
  syl: ['kep', 'loh', 'shel', 'nev', 'oo', 'nar', 'pel', 'am'],
  voice: {
    wave: 'sine',
    base: 153,
    range: 0.47,
    rate: 4.7,
    glide: 0.16,
    vib: 5,
    vibAmt: 4,
    fx: 'none',
    amp: 0.39,
  },
  trait: 'Kepp can trace the way home along the spiral on the shell.',
  chat: [
    'The third bend on my shell is a useful shortcut.',
    'I leave route corrections behind me in silver.',
    'The express lane was slippery when I found it.',
    'A map folded into a shell always opens the right way.',
    'Nobody has overtaken my trail. They just follow it.',
  ],
  greet: ["You've reached the slow desk.", 'Hello. I set off when I heard you dial.'],
  cargo: ['{good}, lightly polished underneath.', 'A spool of trail markers. Silver, naturally.'],
  joke: ['My quickest route takes ages to explain.'],
  nice: ["Thanks. I'll put that on the scenic loop."],
  bye: ["I'll leave a line back to the gate."],
  honk: ['That counts as overtaking.'],
  dock: ['At {port}, follow the fresh silver line.', 'Welcome to {port}. My map says we both made it.'],
  rumor: 'The long way to {planet} still earns the higher freight rate.',
  build(T) {
    CastRig.build(T, {
      accent: '#85a79b',
      height: 1.12,
      arm: [0.18, 0.43, 0.47, 0.25, 0.06],
      hand: 'fin',
      mouth: [0, 0.548, 0.737, 0.48],
      joints: [
        ['sole', [0, 0.14, 0.47], /^Muscular foot$/],
        ['shell', [0, 0.32, -0.17], /^(Shell|Shell spiral)$/],
      ],
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0);
        const reach = (1 - Math.cos(p)) * 0.5 * a;
        n.sole.scale.z = 1 + 0.1 * reach;
        n.shell.rotation.x = -0.067 * reach;
        n.head.rotation.x = 0.045 * reach;
      },
    });
  },
};
