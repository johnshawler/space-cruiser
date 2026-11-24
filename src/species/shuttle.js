/* Shuttle · A silver weaving shuttle carries a red bobbin inside its open well. */
SPECIES_EXTRA.shuttle = {
  name: 'Shuttle',
  kind: 'shuttle',
  family: 'robot',
  skin: 'metal',
  cast: true,
  script: 'blocks',
  col: '#7e8181',
  hue: 180,
  sat: 1,
  lit: 50,
  syl: ['shu', 'tel', 'wef', 'ru', 'nim', 'pik', 'wa', 'to'],
  voice: {
    wave: 'square',
    base: 297,
    range: 0.53,
    rate: 6.2,
    glide: 0.37,
    vib: 2,
    vibAmt: 7,
    fx: 'chorus',
    amp: 0.24,
  },
  trait: 'Shuttle draws slack thread back into the bobbin before it snags.',
  chat: [
    'Slack thread finds the only sharp corner in the room.',
    'The loom wove my checklist into a sleeve.',
    'I keep the selvage. It knows where the edge was.',
    "Today's pattern repeats whenever I look away.",
    'An untidy bobbin makes very tidy knots.',
  ],
  greet: ['Loom desk. Let me draw in this thread.', "You've caught me between passes."],
  cargo: ["{good}, tied with a proper weaver's knot.", 'A shuttleful of thread and a sample sleeve.'],
  joke: ['I wove a timetable. Now all my appointments overlap.'],
  nice: ["Thank you. I'll weave that into the border."],
  bye: ['Mind the loose end.'],
  honk: ['That skipped a pick.'],
  dock: [
    'At {port}, follow the striped weave on the floor.',
    'Welcome to {port}. Keep the wrapping twine for me.',
  ],
  rumor: 'The looms on {planet} have woven a premium into freight pay.',
  build(T) {
    CastRig.build(T, {
      accent: '#7e8181',
      height: 1.16,
      hover: true,
      head: [-0.12, 0.7, 0.11],
      omit: /^Lens$/,
      arm: [0.29, 0.58, 0.04, 0.27, 0.043],
      faceShell: [-0.12, 0.735, 0.186, 0.16, 0.104, 0.084],
      face: {
        eyes: [
          [-0.18, 0.765, 0.262, 0.048],
          [-0.06, 0.765, 0.262, 0.048],
        ],
        mouth: [-0.12, 0.69, 0.266, 0.42],
      },
      extra({ joint, rod, oval }) {
        joint('rig', (g) => {
          for (const s of [-1, 1]) {
            rod(g, 'Tension feeler', '#b6a584', [s * 0.39, 0.7, 0], [s * 0.47, 1.01, 0], 0.017, 0.012);
            oval(g, 'Thread guide', '#ad6677', [s * 0.47, 1.012, 0], [0.031, 0.025, 0.022]);
          }
          rod(g, 'Drop spindle', '#b6a584', [0, 0.5, 0], [0, 0.09, 0], 0.027, 0.016);
          oval(g, 'Spindle whorl', 'accent', [0, 0.19, 0], [0.11, 0.042, 0.088]);
        });
      },
      joints: [['bobbin', [0, 0.79, 0], /^(Spool spindle|Thread wrap)$/]],
      gait(n, p, a) {
        CastRig.glide(n, p, a, 0.014, 0.055);
        n.bobbin.rotation.x = p * 2.2 * a;
        n.rig.rotation.y = 0.12 * Math.sin(p) * a;
      },
    });
  },
};
