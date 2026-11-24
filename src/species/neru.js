/* Neru · A teal tidal cartographer has branching pink gills and a paddle tail. */
SPECIES_EXTRA.neru = {
  name: 'Neru',
  kind: 'neru',
  family: 'alien',
  skin: 'gloss',
  cast: true,
  script: 'curvy',
  col: '#6cabac',
  hue: 181,
  sat: 28,
  lit: 55,
  syl: ['ne', 'rul', 'wa', 'del', 'shu', 'va', 'kel', 'na'],
  voice: {
    wave: 'sine',
    base: 287,
    range: 0.31,
    rate: 5.9,
    glide: 0.37,
    vib: 3,
    vibAmt: 7,
    fx: 'bubble',
    amp: 0.39,
  },
  trait: 'Neru dips the lowest gill into a current before unfolding the chart.',
  chat: [
    'I drew that channel at low tide. It has since moved house.',
    'My lowest gill votes upstream.',
    'Fold a wet chart wrong and you discover a new lake.',
    'The bend by buoy two tastes faintly of lunch.',
    'The current returned my pencil.',
  ],
  greet: ['Current looks friendly. Come alongside.', "One moment. I'm unfolding the coast."],
  cargo: ['{good}, above the high-water line.', 'Waterproof maps in a thoroughly damp box.'],
  joke: ['My chart of the dry dock is remarkably short.'],
  nice: ["Thanks. That's going in the margin."],
  bye: ['Catch the outgoing current.'],
  honk: ['I have marked that noise as a buoy.'],
  dock: ['Welcome to {port}. Follow the blue shallows.', 'At {port}, the dock floats up to meet you.'],
  rumor: 'Incoming freight earns extra on {planet} before the tide turns.',
  build(T) {
    CastRig.build(T, {
      accent: '#6cabac',
      height: 1.18,
      arm: [0.22, 0.39, 0.21, 0.28, 0.085],
      hand: 'fin',
      leg: [0.22, 0.39, -0.25, 0.075, 0.15],
      skip: (v, m, n) => n.includes('Leg') && m.parent.position.z > 0,
      legParts: /^Leg$/,
      footParts: /^Foot$/,
      mouth: [0, 0.82, 0.58, 0.61],
      joints: [['tail', [0, 0.54, -0.43], /^Paddle tail$/]],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.54, 0.015, 0.045);
        n.armL.rotation.x = -n.legL.rotation.x;
        n.armR.rotation.x = -n.armL.rotation.x;
        n.tail.rotation.y = 0.25 * Math.sin(p) * a;
      },
    });
  },
};
