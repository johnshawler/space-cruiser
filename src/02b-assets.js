/* ===================== BESPOKE MODELS: LOADING ===================== */
/* The shop rooms, cockpits and walkable decks are Blender models (GLB) with their own sky lighting (HDR) and colour
   grade (a 16x16x16 colour table laid out as a 256x16 picture). The manifests are built into the page (ASSET_MANIFESTS,
   written by build.sh); the models themselves are fetched when they are first needed, so the page stays small.

   Where they come from: next to the page, as on GitHub Pages and a local server. The copy at johnshawler.com/long-haul/
   is served by a Worker that only knows about the page itself, so if the assets folder isn't next to the page the
   loader falls back to the GitHub Pages copy (which allows cross-site loading). ?assets=<url> picks a base by hand.
   If nothing loads, every place keeps its hand-built model and the game carries on. */
const Assets = (() => {
  const FALLBACK = 'https://space-cruiser.johnshawler.com/';
  const M = (typeof ASSET_MANIFESTS !== 'undefined' && ASSET_MANIFESTS) || { interiors: { rooms: [] }, cockpits: { ships: [] }, decks: { ships: [] }, species: { models: [] } };
  const off = /[?&]noassets\b/.test(location.search);
  const cache = new Map();
  let baseP = null;
  /* the folder the assets folder lives in: next to the page if it's there, else the GitHub Pages copy */
  function base() {
    if (baseP) return baseP;
    const q = location.search.match(/[?&]assets=([^&]+)/);
    if (q) { const b = decodeURIComponent(q[1]); return baseP = Promise.resolve(b.endsWith('/') ? b : b + '/'); }
    const probe = 'assets/interiors/manifest.json';
    baseP = (location.protocol === 'file:' ? Promise.resolve(false) : fetch(probe, { method: 'HEAD', cache: 'no-store' }).then(r => r.ok && !/text\/html/.test(r.headers.get('content-type') || ''), () => false))
      .then(here => here ? '' : FALLBACK);
    return baseP;
  }
  const url = p => base().then(b => b + p);
  function once(key, make) { if (!cache.has(key)) { const p = make(); p.catch(e => { console.warn('Bespoke model not loaded:', key, e && e.message || e); cache.delete(key); }); cache.set(key, p); } return cache.get(key); }

  /* a GLB, with the emissive strengths (KHR_materials_emissive_strength, newer than this copy of three.js) put back */
  function glb(path) {
    if (off) return Promise.reject(new Error('assets off'));
    if (!THREE.GLTFLoader) return Promise.reject(new Error('no GLTFLoader'));
    return once(path, () => url(path).then(u => new Promise((ok, no) => new THREE.GLTFLoader().load(u, ok, undefined, no))).then(gl => {
      const defs = (gl.parser && gl.parser.json && gl.parser.json.materials) || [], strength = {};
      defs.forEach(d => { const s = d.extensions && d.extensions.KHR_materials_emissive_strength; if (s) strength[d.name] = s.emissiveStrength; });
      gl.scene.traverse(o => { if (!o.isMesh) return; for (const m of [].concat(o.material)) if (m && strength[m.name] != null && !m.userData.strength) { m.emissiveIntensity = strength[m.name]; m.userData.strength = true; } });
      gl.scene.userData.clips = gl.animations || [];   // character models carry their actions
      return gl.scene;
    }));
  }
  /* named empties (anchors and light markers) in a loaded model, in the model's own frame */
  function anchors(root) { const out = {}; root.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    root.traverse(o => { if (o === root || o.isMesh || !o.name) return; const m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); m.decompose(p, q, s); out[o.name] = { position: p, quaternion: q, node: o , scale: s }; });
    return out; }
  /* an HDR sky as a reflection and fill-light map */
  function env(path) {
    if (off || !THREE.RGBELoader || typeof World === 'undefined' || !World.renderer) return Promise.reject(new Error('no HDR'));
    return once(path, () => url(path).then(u => new Promise((ok, no) => { const L = new THREE.RGBELoader(); if (L.setDataType) L.setDataType(THREE.UnsignedByteType); L.load(u, ok, undefined, no); })).then(t => {
      const pm = new THREE.PMREMGenerator(World.renderer), e = pm.fromEquirectangular(t).texture; pm.dispose(); t.dispose(); return e; }));
  }
  /* a colour grade */
  function lut(path) {
    if (off) return Promise.reject(new Error('assets off'));
    return once(path, () => url(path).then(u => new Promise((ok, no) => new THREE.TextureLoader().load(u, ok, undefined, no))).then(t => {
      t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; }));
  }
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const SHOP = { depot: 'depot', garage: 'garage', bar: 'cantina' };
  const SHIP_KEYS = ['rustbucket', 'dromedary', 'stoat', 'manatee', 'empress'];
  return {
    enabled: !off, manifests: M, base, glb, env, lut, anchors, slug,
    /* the bespoke room for this shop at this port, if there is one */
    room(P, k) { const s = SHOP[k]; if (!s || !P) return null; const loc = slug(P.name); return M.interiors.rooms.find(r => r.location === loc && r.shop === s) || null; },
    shipKey(id) { return SHIP_KEYS[id] || null; },
    cockpit(id) { const key = SHIP_KEYS[id]; return key && M.cockpits.ships.find(s => s.ship === key) || null; },
    deck(id) { const key = SHIP_KEYS[id]; return key && M.decks.ships.find(s => s.ship === key) || null; },
    /* a model's surfaces: shadows on, and a sensible amount of sky reflection (the game's skies are bright; plain
       painted surfaces at full strength glow) */
    prepare(root, envMap) {
      root.traverse(o => { if (!o.isMesh) return; o.castShadow = o.receiveShadow = true;
        for (const m of [].concat(o.material)) { if (!m || !m.isMeshStandardMaterial) continue;
          if (envMap) m.envMap = envMap; m.envMapIntensity = m.transparent ? 1.2 : 0.18 + 0.7 * (m.metalness || 0);
          if (m.map) m.map.anisotropy = 4; m.needsUpdate = true; } });
      return root;
    },
  };
})();
