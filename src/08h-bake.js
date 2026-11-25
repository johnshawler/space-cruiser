/* ===================== BAKED SHOP LIGHTING ===================== */
/* Each shop room is lit once, when the port is built, and the result is painted into the room's vertex colours:
   the ceiling lamps and the counter light (with shadows from the counter, shelves, racks and beams), sunlight through
   the windows, and the sky light, all darkened in corners, under shelves and behind things by ambient occlusion.
   The walls, floor, ceiling and furniture then draw with no live lighting at all. Anything that moves or shines
   (characters, the droid, crates in a crew's act, goods on the shelf, glass, chrome, glowing lamps, lit signs) keeps
   its live lighting.

   Light travels through a coarse occupancy grid of the room (a quarter-metre cells; a metre in the shipyard hall)
   rather than the real triangles, which keeps the bake to a fraction of a second per shop. */
const Bake = (() => {
  const tmpM = new THREE.Matrix4(), tmpN = new THREE.Matrix3(), box = new THREE.Box3(), v = new THREE.Vector3(), n = new THREE.Vector3();
  // balance against the live lighting it replaces: lamps and sun, then sky light (hemisphere plus the sky's reflection)
  const GD = 0.52, GE = 0.5, ENV_K = 0.4, SUN_K = 1.0, AOP = 2, GS = 1.0, GI_K = 0.55;
  // a dozen fixed directions spread over a hemisphere (around +z), for ambient occlusion
  const AO_DIRS = (() => { const out = [], N = 12, ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) { const z = Math.sqrt(1 - (i + 0.5) / N), r = Math.sqrt(1 - z * z), a = i * ga; out.push([Math.cos(a) * r, Math.sin(a) * r, z]); } return out; })();

  /* things that move, glow or reflect keep live lighting */
  function excluded(V) {
    const out = new Set(), add = o => { if (o && o.isObject3D) out.add(o); else if (Array.isArray(o)) o.forEach(add); else if (o && typeof o === 'object') Object.values(o).forEach(add); };
    add([V.keeper, V.A, V.B, V.spin]); if (V.droid) add(V.droid.grp); if (V.g) add(V.g); return out;
  }
  function keepLive(mat) {
    if (!mat || !mat.isMeshStandardMaterial) return true;              // basic (glowing) and custom materials stay as they are
    if (mat.transparent || mat.opacity < 1) return true;                 // glass
    if (mat.metalness > 0.6) return true;                                // chrome and polished metal need their reflections
    if (mat.emissiveMap || (mat.emissive && mat.emissiveIntensity > 0 && mat.emissive.getHex() !== 0)) return true;   // lit signs
    return false;
  }
  /* big flat faces get more vertices, so a lamp's pool of light or a shadow has somewhere to land */
  function subdivide(geo, cell) {
    const p = geo.parameters, k = q => Math.max(1, Math.min(48, Math.ceil(q / cell)));
    if (geo.type === 'BoxGeometry' && p && p.widthSegments === 1 && p.heightSegments === 1 && p.depthSegments === 1)
      return new THREE.BoxGeometry(p.width, p.height, p.depth, k(p.width), k(p.height), k(p.depth));
    if (geo.type === 'PlaneGeometry' && p && p.widthSegments === 1 && p.heightSegments === 1)
      return new THREE.PlaneGeometry(p.width, p.height, k(p.width), k(p.height));
    return geo.clone();
  }

  function room(V, scn, P) {
    const S = V.room; if (!S || !scn) return 0; const t0 = performance.now();
    const R = V.root; R.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(R.matrixWorld).invert();
    const big = S.h > 20, cell = big ? 1.0 : 0.25, T = big ? 1.2 : 0.4;
    const x0 = S.x0 - T - 1, x1 = S.x1 + T + 1, y0 = -0.6, y1 = S.h + T + 0.6, z0 = (S.store ? -15.2 : S.z0) - T - 1, z1 = S.z1 + T + 1;
    const nx = Math.ceil((x1 - x0) / cell), ny = Math.ceil((y1 - y0) / cell), nz = Math.ceil((z1 - z0) / cell);
    const occ = new Uint16Array(nx * ny * nz);          // 0 empty, otherwise 1 + index of the mesh filling the cell
    const at = (x, y, z) => { const i = Math.floor((x - x0) / cell), j = Math.floor((y - y0) / cell), k = Math.floor((z - z0) / cell);
      return i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz ? 0 : occ[(k * ny + j) * nx + i]; };

    // the static meshes inside the room
    const skip = excluded(V), meshes = [];
    const walk = o => { if (skip.has(o)) return; if (o.isMesh && !o.isInstancedMesh) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        if (!mats.every(keepLive)) { o.geometry.computeBoundingBox(); tmpM.multiplyMatrices(inv, o.matrixWorld); box.copy(o.geometry.boundingBox).applyMatrix4(tmpM);
          const c = box.getCenter(v); if (c.x > x0 && c.x < x1 && c.z > z0 && c.z < z1 && c.y > -1 && c.y < y1) meshes.push({ o, mats, box: box.clone(), m: tmpM.clone() }); } }
      for (const ch of o.children) walk(ch); };
    walk(R);
    if (meshes.length > 65000) meshes.length = 65000;
    // fill the grid: every cell a mesh's box overlaps
    meshes.forEach((e, id) => { const b = e.box;
      const i0 = Math.max(0, Math.floor((b.min.x - x0) / cell)), i1 = Math.min(nx - 1, Math.floor((b.max.x - x0) / cell));
      const j0 = Math.max(0, Math.floor((b.min.y - y0) / cell)), j1 = Math.min(ny - 1, Math.floor((b.max.y - y0) / cell));
      const k0 = Math.max(0, Math.floor((b.min.z - z0) / cell)), k1 = Math.min(nz - 1, Math.floor((b.max.z - z0) / cell));
      for (let k = k0; k <= k1; k++) for (let j = j0; j <= j1; j++) { const row = (k * ny + j) * nx; for (let i = i0; i <= i1; i++) occ[row + i] = id + 1; } });

    // a ray through the grid: the distance to the first filled cell that isn't the surface it starts on, or Infinity
    const cellOf = (x, y, z) => { const i = Math.floor((x - x0) / cell), j = Math.floor((y - y0) / cell), k = Math.floor((z - z0) / cell);
      return i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz ? -1 : (k * ny + j) * nx + i; };
    let hitCell = -1;   // the cell the last ray stopped in, for the bounce-light pass
    const march = (px, py, pz, dx, dy, dz, maxT, self, step) => { for (let t = step; t < maxT; t += step) { const x = px + dx * t, y = py + dy * t, z = pz + dz * t, o = at(x, y, z);
        if (o && (o !== self || t > cell * 3)) { hitCell = cellOf(x, y, z); return t; } } hitCell = -1; return Infinity; };

    // the lights: the room's own lamps (in the shop's frame), the sun, the sky light and an approximation of the sky's reflection
    const lamps = []; R.traverse(o => { if (o.isPointLight && !skip.has(o.parent)) { o.updateMatrixWorld(true); const p = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld).applyMatrix4(inv);
        if (p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1) lamps.push({ p, c: o.color.clone().multiplyScalar(o.intensity), d: o.distance, k: o.decay }); } });
    let sun = null, hemi = []; scn.traverse(o => { if (o.isDirectionalLight && !sun) { const d = new THREE.Vector3().subVectors(o.position, o.target.position).normalize().transformDirection(inv); sun = { d, c: o.color.clone().multiplyScalar(o.intensity * SUN_K) }; }
      else if (o.isHemisphereLight && !o.parent.isMesh) hemi.push({ sky: o.color.clone().multiplyScalar(o.intensity), ground: o.groundColor.clone().multiplyScalar(o.intensity) }); });
    const surf = P && P.surf || {}, envSky = new THREE.Color().copy(C(surf.zen || '#8fb4d8')).lerp(C(surf.hor || '#cfe0ee'), 0.5).multiplyScalar(ENV_K),
      envGround = C(surf.g ? surf.g[1] : '#55504a').multiplyScalar(ENV_K * 0.6);
    const sky = new THREE.Color(), ground = new THREE.Color(); for (const h of hemi) { sky.add(h.sky); ground.add(h.ground); } sky.add(envSky); ground.add(envGround);

    // a plain surface has its own colour folded into the vertex colours (so the sky's sheen can be added on top, untinted);
    // a textured one, or a mesh with several materials, keeps its colour on the material and gets light only
    const conv = new Map(), basic = (mat, fold) => { const key = mat.uuid + (fold ? 'f' : ''); if (conv.has(key)) return conv.get(key);
      const b = new THREE.MeshBasicMaterial({ color: fold ? new THREE.Color(1, 1, 1) : mat.color.clone().multiplyScalar(1 - (mat.metalness || 0) * 0.5), map: mat.map || (fold ? detailTex() : null), vertexColors: true, side: mat.side, fog: true });
      b.name = mat.name; conv.set(key, b); return b; };
    let verts = 0; const tx = new THREE.Vector3(), ty = new THREE.Vector3(), up = new THREE.Vector3(), RAO = big ? 8 : 2.2, ND = AO_DIRS.length;
    /* pass 1: at every vertex, the light arriving straight from the lamps and the sun, the sky light, how open the
       surroundings are, and where each of those openness rays ran into something */
    const jobs = meshes.map((e, id) => {
      const o = e.o, single = !Array.isArray(o.material), fold = single && !o.material.map, M0 = single ? o.material : null;
      const base = fold ? M0.color.clone().multiplyScalar(1 - (M0.metalness || 0) * 0.5) : new THREE.Color(1, 1, 1);
      // what colour it reflects onto its neighbours (a textured surface counts as a bit darker than its tint)
      const firstMat = single ? M0 : o.material.find(m => !keepLive(m)) || o.material[0], albedo = fold ? base.clone() : firstMat.color.clone().multiplyScalar(firstMat.map ? 0.6 : 1);
      // the sky's sheen on it: white on plastic and paint, tinted by the metal's own colour on metal
      const rgh = fold ? (M0.roughness ?? 1) : 1, mtl = fold ? (M0.metalness || 0) : 0, gloss = 0.04 + 0.22 * Math.pow(1 - rgh, 2);
      const ksC = fold ? new THREE.Color(gloss, gloss, gloss).lerp(M0.color.clone().multiplyScalar(0.25 + 0.45 * (1 - rgh)), mtl).multiplyScalar(GS) : new THREE.Color(0, 0, 0);
      const geo = subdivide(o.geometry, big ? 2.5 : 0.5); geo.computeVertexNormals && !geo.attributes.normal && geo.computeVertexNormals();
      const pos = geo.attributes.position, nor = geo.attributes.normal, count = pos.count;
      const E = new Float32Array(count * 3), AO = new Float32Array(count), hits = new Int32Array(count * ND), surf = new Int32Array(count);
      tmpN.getNormalMatrix(e.m); const self = id + 1;
      for (let i = 0; i < count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(e.m); n.fromBufferAttribute(nor, i).applyMatrix3(tmpN).normalize();
        const off = cell * 0.8, px = v.x + n.x * off, py = v.y + n.y * off, pz = v.z + n.z * off;
        surf[i] = cellOf(v.x - n.x * cell * 0.3, v.y - n.y * cell * 0.3, v.z - n.z * cell * 0.3);
        // ambient occlusion: how open the hemisphere above this point is, out to a couple of metres
        up.set(Math.abs(n.y) < 0.9 ? 0 : 1, Math.abs(n.y) < 0.9 ? 1 : 0, 0); tx.crossVectors(up, n).normalize(); ty.crossVectors(n, tx);
        let ao = 0;
        AO_DIRS.forEach(([a, b, c], d) => { const dx = tx.x * a + ty.x * b + n.x * c, dy = tx.y * a + ty.y * b + n.y * c, dz = tx.z * a + ty.z * b + n.z * c;
          const hit = march(px, py, pz, dx, dy, dz, RAO * 1.6, self, cell); hits[i * ND + d] = hitCell; ao += hit >= RAO ? 1 : Math.pow(hit / RAO, 0.7); });
        ao /= ND; AO[i] = ao;
        // direct light from each lamp and the sun, unless something is in the way
        let r = 0, g = 0, bl = 0;
        for (const L of lamps) { const lx = L.p.x - px, ly = L.p.y - py, lz = L.p.z - pz, d = Math.hypot(lx, ly, lz); if (d < 1e-4) continue;
          const ndl = (n.x * lx + n.y * ly + n.z * lz) / d; if (ndl <= 0) continue; const att = L.d > 0 ? Math.pow(Math.max(0, 1 - d / L.d), L.k) : 1; if (att <= 0) continue;
          if (march(px, py, pz, lx / d, ly / d, lz / d, d - 0.35, self, cell * 1.4) !== Infinity) continue;
          const w = ndl * att; r += L.c.r * w; g += L.c.g * w; bl += L.c.b * w; }
        if (sun) { const ndl = n.x * sun.d.x + n.y * sun.d.y + n.z * sun.d.z; if (ndl > 0 && march(px, py, pz, sun.d.x, sun.d.y, sun.d.z, big ? 120 : 40, self, cell * 1.4) === Infinity) { r += sun.c.r * ndl; g += sun.c.g * ndl; bl += sun.c.b * ndl; } }
        // sky light and the sky's reflection, from above and below, through the open part of the hemisphere;
        // a touch of contact shadow on the direct light too, so corners read even right under a lamp
        const h = 0.5 + 0.5 * n.y, aoA = Math.pow(ao, AOP) * GE, k = GD * (0.55 + 0.45 * ao), j = i * 3;
        E[j] = r * k + (ground.r + (sky.r - ground.r) * h) * aoA; E[j + 1] = g * k + (ground.g + (sky.g - ground.g) * h) * aoA; E[j + 2] = bl * k + (ground.b + (sky.b - ground.b) * h) * aoA;
      }
      return { e, o, fold, base, albedo, ksC, geo, count, E, AO, hits, surf };
    });
    /* global illumination, one bounce: every surface cell gives off its own colour times the light falling on it, and
       each vertex gathers that from whatever its openness rays ran into, so a red wall warms the floor beside it */
    const rad = new Float32Array(nx * ny * nz * 3), radN = new Uint16Array(nx * ny * nz);
    for (const J of jobs) for (let i = 0; i < J.count; i++) { const c = J.surf[i]; if (c < 0) continue; const j = i * 3;
      rad[c * 3] += J.E[j] * J.albedo.r; rad[c * 3 + 1] += J.E[j + 1] * J.albedo.g; rad[c * 3 + 2] += J.E[j + 2] * J.albedo.b; if (radN[c] < 65535) radN[c]++; }
    for (const J of jobs) {
      const { o, fold, base, ksC, geo, count, E, AO, hits } = J, col = new Float32Array(count * 3), had = geo.attributes.color, pos = geo.attributes.position, nor = geo.attributes.normal;
      const uv = fold ? new Float32Array(count * 2) : null; tmpN.getNormalMatrix(J.e.m); const seed = (V.seed || 1) % 997;
      for (let i = 0; i < count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(J.e.m); n.fromBufferAttribute(nor, i).applyMatrix3(tmpN).normalize();
        // fine surface detail: a tiling grain-and-seams texture, laid flat on whichever way the face points
        if (uv) { const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z), q = 0.42;
          if (ay >= ax && ay >= az) { uv[i * 2] = v.x * q; uv[i * 2 + 1] = v.z * q; } else if (ax >= az) { uv[i * 2] = v.z * q; uv[i * 2 + 1] = v.y * q; } else { uv[i * 2] = v.x * q; uv[i * 2 + 1] = v.y * q; } }
        // grime: dirt in corners and creases, a dirty band along the bottom of walls, scuffs and stains on the floor,
        // faint streaks down the walls
        const vert = Math.abs(n.y) < 0.5, floorUp = n.y > 0.7;
        let dirt = 0.22 * Math.pow(1 - AO[i], 1.4);
        if (vert) dirt += 0.16 * Math.max(0, Math.min(1, 1 - (v.y - 0.02) / 0.9)) + 0.07 * Math.max(0, Math.min(1, (vnoise((v.x + v.z) * 0.55, v.y * 0.12, seed + 7) - 0.58) * 4));
        if (floorUp && v.y < 0.4) dirt += 0.13 * Math.max(0, Math.min(1, (vnoise(v.x * 0.32, v.z * 0.32, seed) - 0.55) * 3.5)) + 0.05 * vnoise(v.x * 1.7, v.z * 1.7, seed + 3);
        const gm = 1 - Math.min(0.42, dirt), gR = gm * (1 - dirt * 0.05), gB = gm * (1 - dirt * 0.18);   // dirt is a touch brown

        let br = 0, bg = 0, bb = 0; for (let d = 0; d < ND; d++) { const c = hits[i * ND + d]; if (c < 0 || !radN[c]) continue; const w = 1 / radN[c]; br += rad[c * 3] * w; bg += rad[c * 3 + 1] * w; bb += rad[c * 3 + 2] * w; }
        const j = i * 3, gk = GI_K / ND, r = E[j] + br * gk, g = E[j + 1] + bg * gk, bl = E[j + 2] + bb * gk, sh = 0.35 + 0.65 * AO[i];
        col[j] = (r * base.r * gR + sky.r * ksC.r * sh * gm) * (had ? had.getX(i) : 1); col[j + 1] = (g * base.g * gm + sky.g * ksC.g * sh * gm) * (had ? had.getY(i) : 1); col[j + 2] = (bl * base.b * gB + sky.b * ksC.b * sh * gm) * (had ? had.getZ(i) : 1);
      }
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); if (uv) geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); verts += count;
      if (o.geometry !== geo) { o.geometry.dispose(); o.geometry = geo; }
      o.material = Array.isArray(o.material) ? o.material.map(m => keepLive(m) ? m : basic(m, false)) : basic(o.material, fold);
      o.receiveShadow = false; o.userData.baked = true;
    }
    return { meshes: meshes.length, verts, ms: Math.round(performance.now() - t0) };
  }
  /* procedural surface textures, made once */
  let _detail = null, _nrm = null, _rough = null;
  function noiseCanvas(S, seed, oct) { const cv = makeCanvas(S, S), x = cv.getContext('2d'), im = x.createImageData(S, S), r = mulberry32(seed), L = [];
    for (let o = 0; o < oct; o++) { const n = 4 << o, g = new Float32Array((n + 1) * (n + 1)); for (let i = 0; i < g.length; i++) g[i] = r(); for (let i = 0; i <= n; i++) { g[i * (n + 1) + n] = g[i * (n + 1)]; g[n * (n + 1) + i] = g[i]; } L.push({ n, g }); }
    const h = new Float32Array(S * S); for (let y = 0; y < S; y++) for (let xx = 0; xx < S; xx++) { let v = 0, a = 0.5, t = 0;
      for (const { n, g } of L) { const fx = xx / S * n, fy = y / S * n, ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, w = fy - iy, s = q => q * q * (3 - 2 * q), i0 = iy * (n + 1) + ix;
        v += a * (g[i0] * (1 - s(u)) * (1 - s(w)) + g[i0 + 1] * s(u) * (1 - s(w)) + g[i0 + n + 1] * (1 - s(u)) * s(w) + g[i0 + n + 2] * s(u) * s(w)); t += a; a *= 0.5; }
      h[y * S + xx] = v / t; } return { cv, x, im, h }; }
  function detailTex() { if (_detail) return _detail; const S = 256, { cv, x, im, h } = noiseCanvas(S, 11, 5);
    for (let i = 0; i < S * S; i++) { const px = i % S, py = (i / S) | 0, seam = (px % 128 < 2 || py % 128 < 2) ? 0.9 : 1, scratch = (Math.abs(((px * 0.37 + py * 0.91) % 41) - 20) < 0.5 && h[i] > 0.62) ? 0.94 : 1;
      const v = Math.round(255 * Math.min(1, (0.9 + (h[i] - 0.5) * 0.2) * seam * scratch / 0.97)); im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    x.putImageData(im, 0, 0); _detail = new THREE.CanvasTexture(cv); _detail.wrapS = _detail.wrapT = THREE.RepeatWrapping; _detail.anisotropy = 4; return _detail; }
  function normalTex() { if (_nrm) return _nrm; const S = 256, { cv, x, im, h } = noiseCanvas(S, 23, 6), k = 2.2;
    for (let y = 0; y < S; y++) for (let xx = 0; xx < S; xx++) { const hx = h[y * S + (xx + 1) % S] - h[y * S + (xx + S - 1) % S], hy = h[((y + 1) % S) * S + xx] - h[((y + S - 1) % S) * S + xx];
      const nx = -hx * k * 8, ny = -hy * k * 8, l = Math.hypot(nx, ny, 1), i = (y * S + xx) * 4; im.data[i] = (nx / l * 0.5 + 0.5) * 255; im.data[i + 1] = (ny / l * 0.5 + 0.5) * 255; im.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); _nrm = new THREE.CanvasTexture(cv); _nrm.wrapS = _nrm.wrapT = THREE.RepeatWrapping; return _nrm; }
  function roughTex() { if (_rough) return _rough; const S = 256, { cv, x, im, h } = noiseCanvas(S, 37, 5);
    for (let i = 0; i < S * S; i++) { const v = Math.round(255 * (0.72 + h[i] * 0.28)); im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    x.putImageData(im, 0, 0); _rough = new THREE.CanvasTexture(cv); _rough.wrapS = _rough.wrapT = THREE.RepeatWrapping; return _rough; }
  /* normal and roughness maps for the port's live surfaces outdoors: buildings, pads, terrain, parked ships. Characters
     keep their smooth toy finish. */
  function detailLive(scn) { const done = new Set(), isChar = o => { for (let p = o; p; p = p.parent) if (p.userData && p.userData.rig) return true; return false; };
    scn.traverse(o => { if (!o.isMesh || o.userData.baked || o.userData.fx || !o.geometry.attributes.uv) return; for (const m of [].concat(o.material)) {
        if (!m || !m.isMeshStandardMaterial || done.has(m) || m.normalMap || m.transparent || m.vertexColors && !m.map) continue; if (isChar(o)) continue;
        done.add(m); m.normalMap = normalTex(); m.normalScale = new THREE.Vector2(0.35, 0.35); m.roughnessMap = roughTex(); m.needsUpdate = true; } }); }
  /* decals on the shop floor: oil in the garage and shipyard, scuffs and tyre marks at the depot, drink rings in the cantina */
  const _decalTex = {};
  function decalTex(kind) { if (_decalTex[kind]) return _decalTex[kind]; const S = 128, cv = makeCanvas(S, S), x = cv.getContext('2d'), r = mulberry32(kind.length * 97);
    if (kind === 'ring') { for (let k = 0; k < 2; k++) { x.strokeStyle = 'rgba(60,30,15,0.5)'; x.lineWidth = 6; x.beginPath(); x.arc(64 + (k ? 18 : -6), 64 + (k ? -10 : 4), 28 - k * 6, 0, 7); x.stroke(); } }
    else if (kind === 'track') { x.fillStyle = 'rgba(20,20,20,0.5)'; for (let i = 0; i < 14; i++) x.fillRect(30, i * 9 + 2, 18, 5); for (let i = 0; i < 14; i++) x.fillRect(80, i * 9 + 6, 18, 5); }
    else { for (let i = 0; i < 9; i++) { const g = x.createRadialGradient(64 + (r() - 0.5) * 50, 64 + (r() - 0.5) * 50, 2, 64, 64, 30 + r() * 30); g.addColorStop(0, kind === 'oil' ? 'rgba(10,12,16,0.55)' : 'rgba(40,32,24,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S); } }
    const t = new THREE.CanvasTexture(cv); return _decalTex[kind] = t; }
  function decals(V) { const S = V.room; if (!S) return; const kinds = { garage: 'oil', yard: 'oil', depot: 'scuff', bar: 'ring' }, kind = kinds[V.k] || 'scuff', r = mulberry32((V.seed || 1) + 17), big = S.h > 20;
    for (let i = 0; i < (big ? 14 : 7); i++) { let x = 0, z = 0, ok = false; for (let t = 0; t < 12 && !ok; t++) { x = S.x0 + 1.5 + r() * (S.x1 - S.x0 - 3); z = S.z0 + 1.5 + r() * (Math.min(S.z1, 9) - S.z0 - 3); ok = !(Math.abs(x) < 3.2 && Math.abs(z) < 1.6) && !(x < -2 && x > -7 && z > -2 && z < 0.5); }
      if (!ok) continue; const sz = (kind === 'ring' ? 0.6 : kind === 'track' ? 2.2 : 1.6 + r() * 1.6) * (big ? 3 : 1);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(sz, kind === 'track' ? sz * 1.8 : sz), new THREE.MeshBasicMaterial({ map: decalTex(kind), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
      m.rotation.set(-Math.PI / 2, 0, r() * 6.28); m.position.set(x, 0.01, z); m.renderOrder = 1; m.userData.fx = true; V.root.add(m); } }
  /* floor reflections: a faint mirror image of the room on the shop floor, stronger at shallow angles like a polished
     floor. It draws the room a second time, so it runs only on 'high' quality and only in the shop you are in. */
  function floorMirror(V) { const S = V.room; if (!S || !THREE.Reflector) return;
    const W = S.x1 - S.x0, D = S.z1 - S.z0, big = S.h > 20;
    const shader = { uniforms: { color: { value: new THREE.Color(1, 1, 1) }, tDiffuse: { value: null }, textureMatrix: { value: null } },
      vertexShader: 'uniform mat4 textureMatrix; varying vec4 vUv; varying float vF; void main(){ vUv=textureMatrix*vec4(position,1.0); vec4 w=modelMatrix*vec4(position,1.0); vec3 v=normalize(cameraPosition-w.xyz); vF=pow(1.0-abs(v.y),2.0); gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader: 'uniform vec3 color; uniform sampler2D tDiffuse; varying vec4 vUv; varying float vF; void main(){ vec4 b=texture2DProj(tDiffuse,vUv); gl_FragColor=vec4(b.rgb*color,0.05+0.32*vF); }' };
    const m = new THREE.Reflector(new THREE.PlaneGeometry(W, D), { textureWidth: big ? 512 : 384, textureHeight: big ? 512 : 384, clipBias: 0.003, shader });
    m.material.transparent = true; m.material.depthWrite = false; m.rotation.x = -Math.PI / 2; m.position.set((S.x0 + S.x1) / 2, 0.006, (S.z0 + S.z1) / 2);
    m.renderOrder = 0; m.visible = false; m.userData.fx = true; V.root.add(m); V.mirror = m; }
  /* light and reflection probe: a small 360-degree picture of the finished room, taken from behind the counter, which the
     shop's live things (keeper, crew, droid, crates, goods on the shelf, chrome) use for their reflections and soft fill
     light, so they sit in the room's light instead of the open sky's */
  function probe(V, scn) {
    const r = typeof World !== 'undefined' && World.renderer; if (!r || !V.room) return null;
    const rt = new THREE.WebGLCubeRenderTarget(64, { type: THREE.HalfFloatType, generateMipmaps: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    const cam = new THREE.CubeCamera(0.3, 400, rt); cam.position.copy(V.root.localToWorld(new THREE.Vector3(0, 2.2, -0.6)));
    const hide = [V.keeper, V.A, V.B].filter(Boolean); hide.forEach(o => o.visible = false);
    const prevTarget = r.getRenderTarget(), prevAuto = r.autoClear; r.autoClear = true;
    scn.add(cam); cam.update(r, scn); scn.remove(cam); r.setRenderTarget(prevTarget); r.autoClear = prevAuto; hide.forEach(o => o.visible = true);
    const pm = new THREE.PMREMGenerator(r), env = pm.fromCubemap(rt.texture).texture; pm.dispose(); rt.dispose();
    V.env = env; useProbe(V, V.root, true); return env;
  }
  /* give a shop's live things its probe (call again for anything added to the shop later) */
  function useProbe(V, obj, inRoomOnly) {
    if (!V || !V.env) return; const S = V.room, inv = new THREE.Matrix4().copy(V.root.matrixWorld).invert(), c = new THREE.Vector3();
    obj.traverse(o => { if (!o.isMesh || o.userData.baked) return;
      if (inRoomOnly) { c.setFromMatrixPosition(o.matrixWorld).applyMatrix4(inv); if (c.x < S.x0 - 1 || c.x > S.x1 + 1 || c.z < (S.store ? -15.2 : S.z0) - 1 || c.z > S.z1 + 1 || c.y > S.h + 1) return; }
      for (const m of [].concat(o.material)) if (m && m.isMeshStandardMaterial && m.envMap !== V.env) { m.envMap = V.env; m.needsUpdate = true; } });
  }
  /* volumetric light, faked with soft glowing volumes: sunbeams slanting in through each window the sun shines into, and a
     cone of light hanging under each ceiling lamp. They brighten what's behind them, fading along their length and at
     their edges, and never write depth, so they read as light in the air rather than as objects. */
  let shaftMat = null;
  function beamMaterial() { if (shaftMat) return shaftMat;
    // each beam is a strip that turns about its own axis to face the camera, so it can never be seen edge-on
    shaftMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
      vertexShader: 'attribute vec3 aStart; attribute vec3 aAxis; attribute vec2 aW; attribute vec2 aUV; attribute vec3 aCol; varying vec2 vUV; varying vec3 vCol;'
        + 'void main(){ vUV=aUV; vCol=aCol; vec3 s=(modelMatrix*vec4(aStart,1.0)).xyz, ax=mat3(modelMatrix)*aAxis, p=s+ax*aUV.y;'
        + ' vec3 side=normalize(cross(normalize(ax),normalize(cameraPosition-p))); float w=mix(aW.x,aW.y,aUV.y); gl_Position=projectionMatrix*viewMatrix*vec4(p+side*aUV.x*w,1.0); }',
      fragmentShader: 'varying vec2 vUV; varying vec3 vCol; void main(){ float v=vUV.y, u=vUV.x; float a=pow(1.0-v,1.5)*smoothstep(0.0,0.15,v)*pow(max(0.0,1.0-u*u),1.6); gl_FragColor=vec4(vCol*a,1.0); }' });
    return shaftMat; }
  function beams(V, scn) {
    const S = V.room; if (!S) return; const R = V.root, inv = new THREE.Matrix4().copy(R.matrixWorld).invert(), B = [];
    if (V.beams) { R.remove(V.beams); V.beams.geometry.dispose(); V.beams = null; }   // built again when a bespoke room arrives
    // a bespoke room's ceiling lamps (from its light markers)
    for (const s of V.beamSpots || []) { const down = Math.min(S.h, s.y) * 0.66, w = 0.55;
      B.push({ s: new THREE.Vector3(s.x, s.y - 0.3, s.z), ax: new THREE.Vector3(0, -down, 0), w0: w * 0.9, w1: w + down * 0.32, col: s.col.clone().multiplyScalar(0.07) }); }
    let sun = null; scn.traverse(o => { if (o.isDirectionalLight && !sun) sun = { d: new THREE.Vector3().subVectors(o.position, o.target.position).normalize().transformDirection(inv), c: o.color.clone().multiplyScalar(o.intensity) }; });
    R.traverse(o => { if (!o.isMesh || !o.material || o.userData.baked) return; const m = o.material;
      // sunbeams through the windows (the hall only: in the small shops the camera stands too close to the windows)
      if (sun && S.h > 20 && m.transparent && m.opacity < 0.3 && o.geometry.type === 'PlaneGeometry') { const p = o.geometry.parameters;
        o.updateMatrixWorld(true); const M = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld), nIn = new THREE.Vector3(0, 0, 1).transformDirection(M), c = new THREE.Vector3().setFromMatrixPosition(M);
        if ((c.x - (S.x0 + S.x1) / 2) * nIn.x + (c.z - (S.z0 + S.z1) / 2) * nIn.z > 0) nIn.negate();
        const light = sun.d.clone().negate(); if (light.dot(nIn) < 0.12 || light.y > -0.3) return;
        const len = Math.min(S.h * 2.2, (c.y + p.height / 2) / -light.y * 1.05), w = Math.max(p.width, p.height) * 0.5;
        B.push({ s: c, ax: light.multiplyScalar(len), w0: w, w1: w * 1.15, col: sun.c.clone().multiplyScalar(0.07) }); }
      // a cone of light under each ceiling lamp, towards the back of the shop
      else if (m.isMeshBasicMaterial && o.geometry.type === 'BoxGeometry' && o.position.y > S.h - 0.4 && !m.transparent) { const p = o.geometry.parameters; if (p.height > 0.2) return;
        o.updateMatrixWorld(true); const c = new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld)); if (c.z > (S.h > 20 ? 10 : 1.5)) return;
        const down = S.h * 0.66, w = Math.max(p.width, p.depth) * 0.5;
        B.push({ s: c.clone().setY(c.y - 0.05), ax: new THREE.Vector3(0, -down, 0), w0: w * 0.9, w1: w + down * 0.32, col: m.color.clone().multiplyScalar(S.h > 20 ? 0.02 : 0.09) }); } });
    if (!B.length) return; const n = B.length * 4, st = new Float32Array(n * 3), ax = new Float32Array(n * 3), ww = new Float32Array(n * 2), uv = new Float32Array(n * 2), cl = new Float32Array(n * 3), idx = [];
    B.forEach((b, i) => { [[-1, 0], [1, 0], [1, 1], [-1, 1]].forEach(([u, t], k) => { const j = i * 4 + k; st.set([b.s.x, b.s.y, b.s.z], j * 3); ax.set([b.ax.x, b.ax.y, b.ax.z], j * 3); ww.set([b.w0, b.w1], j * 2); uv.set([u, t], j * 2); cl.set([b.col.r, b.col.g, b.col.b], j * 3); });
      idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('aStart', new THREE.BufferAttribute(st, 3)); g.setAttribute('aAxis', new THREE.BufferAttribute(ax, 3));
    g.setAttribute('aW', new THREE.BufferAttribute(ww, 2)); g.setAttribute('aUV', new THREE.BufferAttribute(uv, 2)); g.setAttribute('aCol', new THREE.BufferAttribute(cl, 3)); g.setIndex(idx);
    const mesh = new THREE.Mesh(g, beamMaterial()); mesh.renderOrder = 5; mesh.frustumCulled = false; mesh.userData.fx = true; R.add(mesh); V.beams = mesh; }
  return { room, probe, useProbe, beams, decals, detailLive, floorMirror };
})();
