/* Iris · A bellows camera stands on a three-point brass and steel tripod. */
SPECIES_EXTRA.iris = {
  name: 'Iris',
  kind: 'iris',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#688694',
  hue: 199,
  sat: 17,
  lit: 49,
  syl: ['ir', 'is', 'klik', 'pla', 'meh', 'lux', 'fru', 'da'],
  voice: {
    wave: 'sawtooth',
    base: 258,
    range: 0.36,
    rate: 5.8,
    glide: 0.22,
    vib: 5,
    vibAmt: 3,
    fx: 'chorus',
    amp: 0.24,
  },
  trait: 'Iris opens the bellows only after all three feet settle.',
  chat: [
    'Two feet steady. The third is considering the subject.',
    'The portrait was perfect until the chair blinked.',
    'I save one exposure for things I forgot to remember.',
    'The plate marked Blank is an excellent picture of fog.',
    'My lens cap has appeared in several early works.',
  ],
  greet: ['Hold that pose while we talk.', 'Camera desk. You may blink between sentences.'],
  cargo: [
    '{good}, kept on the dark side of the hold.',
    'Fresh plates and a box labelled Exposed By Accident.',
  ],
  joke: ['I took a long exposure of a queue. Everybody left.'],
  nice: ["Thank you. That's one for the album."],
  bye: ["I'll wave after the shutter closes."],
  honk: ['Lovely expression. Do it again.'],
  dock: [
    'Welcome to {port}. The painted cross marks your spot.',
    'At {port}, leave the darkroom light alone.',
  ],
  rumor: 'The plate lab on {planet} offers extra for a well-timed delivery.',
  build(T) {
    CastRig.build(T, {
      accent: '#688694',
      height: 1.37,
      head: [0, 0.88, 0],
      headParts: /^(Bellows camera|Bellows fold|Lens|Finder|Cable release)$/,
      arm: [0.28, 0.9, 0.01, 0.32, 0.051],
      face: { eyes: [[0, 1.075, 0.403, 0.111]], mouth: [0, 0.968, 0.393, 0.54] },
      signal: '#a5e6ea',
      joints: [0, 1, 2].map((i) => {
        const t = (i * Math.PI * 2) / 3;
        return [
          'tripod' + i,
          [0, 0.66, 0],
          /^(Camera tripod|Tripod foot)$/,
          (v) => Math.round((Math.atan2(v.z, v.x) + Math.PI * 2) / ((Math.PI * 2) / 3)) % 3 === i,
        ];
      }),
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0.016);
        for (let i = 0; i < 3; i++) {
          const t = p + (i * 2 * Math.PI) / 3;
          n['tripod' + i].rotation.x = 0.2 * Math.sin(t) * a;
          n['tripod' + i].rotation.z = 0.09 * Math.max(0, Math.cos(t)) * a;
        }
      },
    });
  },
};
