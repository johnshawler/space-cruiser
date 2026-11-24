/* Wick · A slate beacon carries a guarded amber lantern and pointed canopy. */
SPECIES_EXTRA.wick = {
  name: 'Wick',
  kind: 'wick',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#6b7e86',
  hue: 198,
  sat: 11,
  lit: 47,
  syl: ['wik', 'lam', 'ush', 'voe', 'tin', 'lu', 'har', 'mei'],
  voice: {
    wave: 'sawtooth',
    base: 380,
    range: 0.58,
    rate: 7.1,
    glide: 0.37,
    vib: 5,
    vibAmt: 7,
    fx: 'click',
    amp: 0.24,
  },
  trait: 'Wick trims the lantern as soon as the quay begins to disappear.',
  chat: [
    "The fog remembers every boat except the one I'm looking for.",
    'I trimmed the wick to the regulation cheerful length.',
    'A bright afternoon is an excellent time to practise being a beacon.',
    'The quay disappears from the far end first.',
    'My spare lantern has a tiny OFF sign.',
  ],
  greet: ['Follow the warm light to my desk.', 'Fog beacon here. Still visible your side?'],
  cargo: ['{good}, labelled in big letters for fog.', 'A tin of wicks kept very far from the oil.'],
  joke: ['I lit the fog. It showed up everywhere.'],
  nice: ["Thanks. I'll give you one extra blink."],
  bye: ['Look back for the last flash.'],
  honk: ['Good. The fog now knows where you are.'],
  dock: [
    'At {port}, the amber light marks the quay.',
    'Welcome to {port}. Mind the gap after the second blink.',
  ],
  rumor: 'Fogbound {planet} is paying extra for inbound loads.',
  build(T) {
    CastRig.build(T, {
      accent: '#6b7e86',
      height: 1.43,
      head: [0, 0.876, 0],
      headParts: /^(Crystal lantern|Guard rod|Lantern canopy|Beacon finial)$/,
      arm: [0.19, 0.61, 0.01, 0.25, 0.048],
      leg: [0.16, 0.32, 0, 0.054, 0.12],
      omit: /^Lens$/,
      signal: '#ffdf92',
      face: {
        eyes: [
          [-0.054, 1.078, 0.143, 0.045],
          [0.054, 1.078, 0.143, 0.045],
        ],
        mouth: [0, 0.989, 0.146, 0.43],
      },
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.49, 0.028, 0.043);
        n.head.rotation.y = 0.27 * Math.sin(p * 0.58) * a;
      },
    });
  },
};
