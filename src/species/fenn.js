/* Fenn · A russet pressure bladder suspends a weather basket between small fins. */
SPECIES_EXTRA.fenn = {
  name: 'Fenn',
  kind: 'fenn',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'dots',
  col: '#cf9b63',
  hue: 31,
  sat: 53,
  lit: 60,
  syl: ['fen', 'pum', 'wa', 'bar', 'too', 'vuh', 'nim', 'su'],
  voice: {
    wave: 'sawtooth',
    base: 313,
    range: 0.53,
    rate: 6.3,
    glide: 0.16,
    vib: 3,
    vibAmt: 4,
    fx: 'bubble',
    amp: 0.24,
  },
  trait: 'Fenn knows the weather has turned when the little basket lifts.',
  chat: [
    'The basket rises just before a squall. I rise with it.',
    'My barometer predicts a queue at customs.',
    'I let a little air out to fit under this awning.',
    'The forecast was right about the existence of weather.',
    'Someone put an umbrella on the wind vane.',
  ],
  greet: ['Pressure steady. Speak freely.', 'Weather desk here. Hold onto your hat.'],
  cargo: ['{good}. Lash down the light bits.', 'A basket of instruments and the air around them.'],
  joke: ['I tried to take the pressure off. Floated into the ceiling.'],
  nice: ["That's lifted my spirits another centimetre."],
  bye: ['Clear skies and low doorframes.'],
  honk: ['That registered on three instruments.'],
  dock: [
    'At {port}, tie up below the wind sock.',
    'Welcome to {port}. The forecast includes your ship.',
  ],
  rumor: 'The weather office on {planet} predicts unusually high delivery pay.',
  build(T) {
    CastRig.build(T, {
      accent: '#cf9b63',
      height: 1.42,
      hover: true,
      arm: [0.41, 0.91, 0, 0.32, 0.075],
      hand: 'fin',
      omit: /^Stabilizing fin$/,
      mouth: [0, 1.322, 0.451, 0.55],
      joints: [['basket', [0, 0.74, 0.06], /^(Basket cord|Weather instrument basket)$/]],
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0.046, 0.043);
        n.basket.rotation.z = -0.15 * Math.sin(p - 0.64) * a;
        n.armL.rotation.x = 0.34 * Math.sin(p) * a;
        n.armR.rotation.x = n.armL.rotation.x;
      },
    });
  },
};
