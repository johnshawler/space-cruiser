/* Sova · An owl-like archivist tucks a folio beneath round facial disks. */
SPECIES_EXTRA.sova = {
  name: 'Sova',
  kind: 'sova',
  family: 'alien',
  skin: 'fuzzy',
  cast: true,
  script: 'dots',
  col: '#927c6b',
  hue: 26,
  sat: 15,
  lit: 50,
  syl: ['soh', 'vah', 'fol', 'hush', 'in', 'reh', 'ya', 'lu'],
  voice: {
    wave: 'sine',
    base: 184,
    range: 0.36,
    rate: 5.2,
    glide: 0.44,
    vib: 5,
    vibAmt: 5,
    fx: 'none',
    amp: 0.39,
  },
  trait: 'Sova marks the last page read with a down feather.',
  chat: [
    'Page forty smells faintly of midnight.',
    'I bookmark with down. It never creases the paper.',
    'The index to lost books is missing its index.',
    'Returning a book quietly still counts as returning it.',
    'A reader left a moon chart in the poetry.',
  ],
  greet: ['Night archive. Whisper if convenient.', "I've kept your place at the desk."],
  cargo: ['{good}. Shelf marks face outward.', 'A box of bookmarks filed by feather weight.'],
  joke: ['I shelved a book on silence. Nobody complained.'],
  nice: ["Much appreciated. I'll enter that in pencil."],
  bye: ["Good night, whichever side of the planet you're on."],
  honk: ['That belongs in the loud collection.'],
  dock: [
    'Welcome to {port}. The returns slot is still open.',
    'At {port}, the night desk stamps in blue.',
  ],
  rumor: 'The night archive on {planet} offers extra for incoming loads.',
  build(T) {
    CastRig.build(T, {
      accent: '#927c6b',
      height: 1.35,
      arm: [0.26, 0.86, 0, 0.37, 0.095],
      hand: 'wing',
      leg: [0.17, 0.36, 0, 0.065, 0.12],
      legParts: /^Leg$/,
      footParts: /^Foot$/,
      omit: /^Tucked wing$/,
      mouth: [0, 1.136, 0.345, 0.55],
      props: [
        {
          parts: /^(Archive folio|Paper edges)$/,
          side: 'L',
          grip: [0.115, 0.67, 0.245],
          scale: 0.88,
          turn: [0, 0.35, 0.09],
        },
      ],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.36, 0.014, 0.062);
        n.head.rotation.y = 0.1 * Math.sin(p * 0.5) * a;
        n.armL.rotation.x *= 0.25;
      },
    });
  },
};
