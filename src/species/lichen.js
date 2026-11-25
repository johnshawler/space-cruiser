/* Lichen · A porcelain mask and pale joint caps frame a moss-green conservatory keeper. */
SPECIES_EXTRA.lichen = {
  name: 'Lichen',
  kind: 'lichen',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#62816c',
  hue: 139,
  sat: 14,
  lit: 45,
  syl: ['li', 'ken', 'por', 'sa', 'rin', 'ver', 'elu', 'dah'],
  voice: {
    wave: 'triangle',
    base: 287,
    range: 0.36,
    rate: 6.1,
    glide: 0.37,
    vib: 4,
    vibAmt: 7,
    fx: 'chorus',
    amp: 0.39,
  },
  trait: 'Lichen kneels to tuck a stray frond back into the crack in its shoulder.',
  chat: [
    'The fern in my shoulder has requested a larger pot.',
    'The greenhouse has an excellent view of itself.',
    'I water the third shelf and my left hinge together.',
    'A cracked tile makes an excellent nursery.',
    "Today's seed count includes one enthusiastic stowaway.",
  ],
  greet: [
    'Greenhouse speaking. Please close the door behind your voice.',
    'One moment while I tuck this frond in.',
  ],
  cargo: [
    '{good}, watered only if the instructions say so.',
    'Glazed pots. One of them is already occupied.',
  ],
  joke: ['I applied for a garden plot. They inspected my shoulder instead.'],
  nice: ['Thank you. The fern is standing a little taller.'],
  bye: ['Leave the little door ajar for the bees.'],
  honk: ['The humidity gauge just jumped.'],
  dock: [
    'At {port}, follow the greenhouse glass.',
    'Welcome to {port}. Kindly leave the stray frond with me.',
  ],
  rumor: 'The conservatory on {planet} has set aside extra delivery money.',
  build(T) {
    CastRig.build(T, {
      accent: '#62816c',
      height: 1.68,
      headGroup: 'Mask',
      arm: [0.39, 1.6, 0.024, 0.7, 0.083],
      handColor: '#d9ccb1',
      leg: [0.21, 1.07, -0.06, 0.102, 0.2],
      footColor: '#d9ccb1',
      omit: /^(Ceramic foot|Porcelain palm|Finger|Fingertip)$/,
      signal: '#efc66b',
      face: { eyes: [[0.17, 2.071, 0.15, 0.069]], mouth: [0.17, 2.002, 0.15, 0.45] }, // the eye sits in the centre of the mask's dark face socket
      joints: [['fern', [-0.29, 1.72, 0.008], /^Fern (rachis|pinna)$/]],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.54, 0.017, 0.032);
        n.fern.rotation.z = -0.13 * Math.sin(p - 0.35) * a;
        n.head.rotation.x = 0.041 * Math.cos(p) * a;
      },
    });
  },
};
