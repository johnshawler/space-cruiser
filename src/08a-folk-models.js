/* ===================== CHARACTER MODELS ===================== */
/* The 32 Blender characters (16 humanoids, 16 robots). Each is one skinned mesh with baked picture maps in
   assets/characters/species/<id>.glb, made by art/characters/game-copies/make_game_copy.py and listed in
   assets/characters/species/manifest.json (built into the page as ASSET_MANIFESTS.species).

   A species entry with `model:'<id>'` is drawn from its model instead of being built from code. Folk.make stays
   instant: it returns the usual group with the usual handles (rig, head, arms) straight away, sized from the manifest,
   and the model drops in when its file arrives. The game goes on driving the same handles:
     - head: a pivot spliced in above the head bone, so the game's nods and turns work in the character's own axes
     - arms: the same at each shoulder (Folk.arms, Folk.hold)
     - walking: the model's own walk (humanoids) or Travel (robots) clip, stepped by the game's stride phase
     - moods: the Happy / Bored / Sad morph targets, with the head and lid pose that goes with each
     - sitting: U.sit(true) holds the Seat pose (humanoids); robots park
   Robots play Idle when standing and Operate when the game raises their arms. */
const FolkModels = (() => {
  const LIST = (typeof ASSET_MANIFESTS !== 'undefined' && ASSET_MANIFESTS.species && ASSET_MANIFESTS.species.models) || [];
  const INFO = {}; for (const m of LIST) INFO[m.id] = m;
  const file = id => 'assets/characters/species/' + id + '.glb';
  const bone = (root, n) => root.getObjectByName(n.replace(/[\s]/g, '_').replace(/[\[\]\.:\/]/g, ''));
  const FACE = /^(Head|Jaw|Neck|Lid|Eye|Ear|Antenna|Comb|Brow|Bell|Muzzle)/;
  const MOODS = { neutral: {}, happy: { Happy: 1 }, sad: { Sad: 1 }, shock: { Happy: 0.4, Sad: 0.25 }, worried: { Sad: 0.6 }, bored: { Bored: 1 } };
  /* how big a robot stands in the game: the masters are up to 3.5 m long, the game's people about 1.7 m tall */
  /* some robots are modelled side-on: quarter turns that point them down the game's forward axis (+z) */
  const YAW = { lamplume: -1, latchling: -1, nautil: -1, 'robot-cairn': -1, millipress: 1, mudlark: 1 };
  const span = m => { const a = m.max[0] - m.min[0], b = m.max[2] - m.min[2]; return YAW[m.id] ? [b, a] : [a, b]; };   // [across, along]
  function fit(m) { if (m.kind !== 'robot') return 1; const [w, d] = span(m); return Math.min(1.7 / m.max[1], 1.7 / w, 2.6 / d, 1); }

  /* a pivot above `b` that turns about the joint in the character's axes, and is the identity at rest (so clips still fit) */
  function splice(b, P, model) {
    const par = b.parent; model.updateMatrixWorld(true);
    const qm = new THREE.Quaternion(), qp = new THREE.Quaternion(); model.getWorldQuaternion(qm); par.getWorldQuaternion(qp);
    const Q = qp.invert().multiply(qm), A = new THREE.Group(), B = new THREE.Group();
    A.position.copy(b.position); A.quaternion.copy(Q);
    B.quaternion.copy(Q).invert(); B.position.copy(b.position).applyQuaternion(B.quaternion).negate();
    par.add(A); P.position.set(0, 0, 0); P.rotation.set(0, 0, 0); P.scale.set(1, 1, 1); A.add(P); P.add(B); B.add(b);
  }

  /* called by Folk.make in place of a species' build(T) */
  function build(T) {
    const { S, U, rig, head, rand } = T, m = INFO[S.model]; if (!m) return;
    const k = fit(m) * (0.95 + rand() * 0.1), h = m.max[1] * k, [w0, d0] = span(m), w = w0 * k, d = d0 * k, robot = m.kind === 'robot';
    // an unseen box the size of the character: portraits, counters and shadows measure it before the model arrives
    const box = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, h, d * 0.7), new THREE.MeshBasicMaterial({ visible: false })); box.position.y = h / 2; box.visible = false; box.userData.contact = true; rig.add(box);
    head.position.y = h * (robot ? 0.95 : 0.88);
    const arm = sx => { const a = new THREE.Group(); a.position.set(sx * w * 0.4, h * 0.75, 0); a.userData.len = h * 0.32; rig.add(a); return a; };
    U.arms = [arm(-1), arm(1)]; U.model = S.model; U.robot = robot;
    const st = { mood: {}, want: {}, seat: 0, walk: 0, op: 0, t: 0 };
    U.gait = (ph, amt) => { st.ph = ph; st.walk = amt; };
    U.sit = on => { st.seat = on ? 1 : 0; };
    U.onMood = mo => { st.want = MOODS[mo] || {}; };
    U.onArms = (l, r) => { st.opWant = Math.max(l ? l[0] : 0, r ? r[0] : 0) > 0.5 ? 1 : 0; };
    U.seatAt = m.seat ? { y: (m.seat[1] - m.min[1]) * k, x: (m.seat[0] - (m.min[0] + m.max[0]) / 2) * k, z: m.seat[2] * k } : null;
    U.tick = t => { st.t = t; if (st.apply) st.apply(); };
    const attach = src => {
      const model = THREE.SkeletonUtils.clone(src), clips = src.userData.clips || []; let mesh = null;
      model.traverse(o => { if (o.isSkinnedMesh) mesh = o; }); if (!mesh) return;
      mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = false;
      // each individual: a slightly different cast to the colour
      const mat = mesh.material = mesh.material.clone(); mat.color.setHSL(rand(), 0.16, 0.93); mat.envMapIntensity = 0.25 + 0.6 * (robot ? 1 : 0);
      mat.skinning = true; mat.morphTargets = !!mesh.morphTargetInfluences; if (mat.map) mat.map.anisotropy = 4;
      model.scale.setScalar(k); { const yaw = (YAW[m.id] || 0) * Math.PI / 2, c = new THREE.Vector3((m.min[0] + m.max[0]) / 2, 0, robot ? (m.min[2] + m.max[2]) / 2 : 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw); model.rotation.y = yaw; model.position.set(-c.x * k, -m.min[1] * k, -c.z * k); }
      rig.add(model);
      const hb = !robot && bone(model, 'Head'), al = bone(model, robot ? 'Arm.1.Upper' : 'UpperArm.R'), ar = bone(model, robot ? 'Arm.2.Upper' : 'UpperArm.L');
      if (hb) { splice(hb, head, model); U.headY = 0; }
      if (al && ar && !robot) { for (const [b, P] of [[al, U.arms[0]], [ar, U.arms[1]]]) { const kids = P.children.slice(); splice(b, P, model); for (const c of kids) P.add(c); P.userData.len /= k; } }
      // clips
      const mixer = new THREE.AnimationMixer(model), act = {};
      for (const c of clips) {
        let clip = c;
        if (/^(Happy|Bored|Sad)$/.test(c.name)) clip = new THREE.AnimationClip(c.name, c.duration, c.tracks.filter(tr => FACE.test(tr.name) && /quaternion$/.test(tr.name)));
        const a = mixer.clipAction(clip); a.play(); a.setEffectiveWeight(0); act[c.name] = a;
      }
      const dict = mesh.morphTargetDictionary || {}, infl = mesh.morphTargetInfluences || [];
      st.apply = () => {
        const e = 0.18;
        for (const n of ['Happy', 'Bored', 'Sad']) { const v = st.mood[n] = (st.mood[n] || 0) + ((st.want[n] || 0) - (st.mood[n] || 0)) * e; if (dict[n] != null) infl[dict[n]] = v; if (act[n]) act[n].setEffectiveWeight(v); }
        st.op += ((st.opWant || 0) - st.op) * 0.1;
        const cyc = ((st.ph || 0) / (Math.PI * 2)) % 1;
        if (robot) {
          if (act.Travel) { act.Travel.time = cyc * act.Travel.getClip().duration; act.Travel.setEffectiveWeight(st.walk); }
          if (act.Operate) { act.Operate.time = (st.t + U.ph) % act.Operate.getClip().duration; act.Operate.setEffectiveWeight(st.op * (1 - st.walk)); }
          if (act.Idle) { act.Idle.time = (st.t + U.ph) % act.Idle.getClip().duration; act.Idle.setEffectiveWeight(Math.max(0.001, (1 - st.walk) * (1 - st.op))); }
        } else {
          if (act.Walk) { act.Walk.time = cyc * act.Walk.getClip().duration; act.Walk.setEffectiveWeight(st.walk * (1 - st.seat)); }
          if (act.Seat) act.Seat.setEffectiveWeight(st.seat);
        }
        mixer.update(0);
      };
      st.apply(); U.loaded = true; if (U.onLoad) U.onLoad();
    };
    // already fetched: the model is there at once (portraits are rendered in the same breath as Folk.make)
    if (READY[S.model]) { attach(READY[S.model]); return; }
    ready(S.model).then(attach).catch(() => {
      // no model to be had (offline, ?noassets): the design's own hand-built figure stands in
      try { rig.remove(box); for (const a of U.arms) rig.remove(a); U.arms = []; U.gait = null; U.sit = U.onMood = U.onArms = U.tick = null; U.model = null; U.seatAt = null;
        const old = S.build || (typeof OriginalFolk !== 'undefined' && OriginalFolk[U.sp]); if (old) { old(T); U.headY = head.position.y; if (U.onFallback) U.onFallback(); } } catch (e) { console.warn('Character fallback failed:', U.sp, e && e.message); }
    });
  }
  const READY = {};
  const FAILED = {};
  function ready(id) { return Assets.glb(file(id)).then(src => (READY[id] = src), e => { FAILED[id] = true; throw e; }); }
  return { build, info: id => INFO[id], list: LIST, file, ready, loaded: id => !!READY[id], failed: id => !!FAILED[id] };
})();
