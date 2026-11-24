/* Rivet · A copper saucer welder has patinated seams, striped fins and a sample patch. */
SPECIES_EXTRA.rivet = {
  name: 'Rivet',
  kind: 'rivet',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#ba744a',
  hue: 22,
  sat: 45,
  lit: 51,
  syl: ['riv', 'et', 'braz', 'tik', 'sah', 'pat', 'kin', 'zo'],
  voice: {
    wave: 'square',
    base: 287,
    range: 0.53,
    rate: 6.1,
    glide: 0.44,
    vib: 2,
    vibAmt: 5,
    fx: 'chorus',
    amp: 0.24,
  },
  trait: 'Rivet keeps a little scrap of hull plate on hand to test the iron before each repair.',
  chat: [
    'I test the iron on scrap, even when the scrap complains.',
    'A straight seam is a row of very tidy accidents.',
    'The hull plate in my pocket is nearly all patches.',
    'I can tell the night shift by the shape of a weld.',
    'The coffee tin passed a pressure test by mistake.',
  ],
  greet: ["Iron cooling. I've got a free minute.", 'Come alongside the striped fin.'],
  cargo: ['{good}, patched where necessary.', 'Offcuts stamped with their future uses.'],
  joke: ['I welded the complaint box shut. Complaints are down.'],
  nice: ["Thank you. That's a solid joint."],
  bye: ['May your seams hold.'],
  honk: ['That shook a loose rivet out. Useful.'],
  dock: [
    'Welcome to {port}. The orange sparks are mine.',
    'At {port}, let the fresh seam cool before unloading.',
  ],
  rumor: 'Repair crews on {planet} put extra pay on incoming freight.',
  build(T) {
    CastRig.build(T, {
      accent: '#ba744a',
      height: 1.22,
      hover: true,
      head: [0, 0.88, 0],
      headParts:
        /^(Copper hull|Belt rivet|Hull seam|Porthole|Dorsal rudder|Rudder flash|Soldering snout|Hot iron|Heated contact)$/,
      arm: [0.48, 0.88, 0.12, 0.34, 0.06],
      faceShell: [0, 1.1, 0.424, 0.36, 0.154, 0.108],
      shellColor: '#b5774e',
      face: {
        eyes: [
          [-0.242, 1.1, 0.55, 0.105],
          [0.242, 1.1, 0.55, 0.105],
        ],
        mouth: [-0.238, 1.008, 0.585, 0.54],
      },
      signal: '#95e4de',
      props: [
        { parts: /^(Work clamp|Patch under repair)$/, side: 'L', grip: [-0.09, 0.61, 0.8], scale: 0.78 },
      ],
      joints: [
        ['finL', [-0.51, 0.97, -0.12], /^Stabilizer$/, (v) => v.x < 0],
        ['finR', [0.51, 0.97, -0.12], /^Stabilizer$/, (v) => v.x > 0],
      ],
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0.02, 0.075);
        n.finL.rotation.x = 0.19 * Math.sin(p) * a;
        n.finR.rotation.x = -n.finL.rotation.x;
      },
    });
  },
};
