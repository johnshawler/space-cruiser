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
  const GD = 0.62, GE = 0.62, ENV_K = 0.4, SUN_K = 1.0, AOP = 2, GS = 1.0;
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
    const march = (px, py, pz, dx, dy, dz, maxT, self, step) => { for (let t = step; t < maxT; t += step) { const o = at(px + dx * t, py + dy * t, pz + dz * t);
        if (o && (o !== self || t > cell * 3)) return t; } return Infinity; };

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
      const b = new THREE.MeshBasicMaterial({ color: fold ? new THREE.Color(1, 1, 1) : mat.color.clone().multiplyScalar(1 - (mat.metalness || 0) * 0.5), map: mat.map || null, vertexColors: true, side: mat.side, fog: true });
      b.name = mat.name; conv.set(key, b); return b; };
    let verts = 0; const tx = new THREE.Vector3(), ty = new THREE.Vector3(), up = new THREE.Vector3();
    meshes.forEach((e, id) => {
      const o = e.o, single = !Array.isArray(o.material), fold = single && !o.material.map, M0 = single ? o.material : null;
      const base = fold ? M0.color.clone().multiplyScalar(1 - (M0.metalness || 0) * 0.5) : new THREE.Color(1, 1, 1);
      // the sky's sheen on it: white on plastic and paint, tinted by the metal's own colour on metal
      const rgh = fold ? (M0.roughness ?? 1) : 1, mtl = fold ? (M0.metalness || 0) : 0, gloss = 0.04 + 0.22 * Math.pow(1 - rgh, 2);
      const ksC = fold ? new THREE.Color(gloss, gloss, gloss).lerp(M0.color.clone().multiplyScalar(0.25 + 0.45 * (1 - rgh)), mtl).multiplyScalar(GS) : new THREE.Color(0, 0, 0);
      const geo = subdivide(o.geometry, big ? 2.5 : 0.5); geo.computeVertexNormals && !geo.attributes.normal && geo.computeVertexNormals();
      const pos = geo.attributes.position, nor = geo.attributes.normal, count = pos.count, col = new Float32Array(count * 3), had = geo.attributes.color;
      tmpN.getNormalMatrix(e.m); const self = id + 1;
      for (let i = 0; i < count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(e.m); n.fromBufferAttribute(nor, i).applyMatrix3(tmpN).normalize();
        const off = cell * 0.8, px = v.x + n.x * off, py = v.y + n.y * off, pz = v.z + n.z * off;
        // ambient occlusion: how open the hemisphere above this point is, out to a couple of metres
        up.set(Math.abs(n.y) < 0.9 ? 0 : 1, Math.abs(n.y) < 0.9 ? 1 : 0, 0); tx.crossVectors(up, n).normalize(); ty.crossVectors(n, tx);
        const RAO = big ? 8 : 2.2; let ao = 0;
        for (const [a, b, c] of AO_DIRS) { const dx = tx.x * a + ty.x * b + n.x * c, dy = tx.y * a + ty.y * b + n.y * c, dz = tx.z * a + ty.z * b + n.z * c;
          const hit = march(px, py, pz, dx, dy, dz, RAO, self, cell); ao += hit === Infinity ? 1 : Math.pow(hit / RAO, 0.7); }
        ao /= AO_DIRS.length;
        // direct light from each lamp and the sun, unless something is in the way
        let r = 0, g = 0, bl = 0;
        for (const L of lamps) { const lx = L.p.x - px, ly = L.p.y - py, lz = L.p.z - pz, d = Math.hypot(lx, ly, lz); if (d < 1e-4) continue;
          const ndl = (n.x * lx + n.y * ly + n.z * lz) / d; if (ndl <= 0) continue; const att = L.d > 0 ? Math.pow(Math.max(0, 1 - d / L.d), L.k) : 1; if (att <= 0) continue;
          if (march(px, py, pz, lx / d, ly / d, lz / d, d - 0.35, self, cell * 1.4) !== Infinity) continue;
          const w = ndl * att; r += L.c.r * w; g += L.c.g * w; bl += L.c.b * w; }
        if (sun) { const ndl = n.x * sun.d.x + n.y * sun.d.y + n.z * sun.d.z; if (ndl > 0 && march(px, py, pz, sun.d.x, sun.d.y, sun.d.z, big ? 120 : 40, self, cell * 1.4) === Infinity) { r += sun.c.r * ndl; g += sun.c.g * ndl; bl += sun.c.b * ndl; } }
        // sky light and the sky's reflection, from above and below, through the open part of the hemisphere
        const h = 0.5 + 0.5 * n.y, aoA = Math.pow(ao, AOP) * GE;
        // a touch of contact shadow on the direct light too, so corners read even right under a lamp
        const k = GD * (0.55 + 0.45 * ao), j = i * 3;
        r = r * k + (ground.r + (sky.r - ground.r) * h) * aoA; g = g * k + (ground.g + (sky.g - ground.g) * h) * aoA; bl = bl * k + (ground.b + (sky.b - ground.b) * h) * aoA;
        const sh = 0.35 + 0.65 * ao;
        col[j] = (r * base.r + sky.r * ksC.r * sh) * (had ? had.getX(i) : 1); col[j + 1] = (g * base.g + sky.g * ksC.g * sh) * (had ? had.getY(i) : 1); col[j + 2] = (bl * base.b + sky.b * ksC.b * sh) * (had ? had.getZ(i) : 1);
      }
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); verts += count;
      if (o.geometry !== geo) { o.geometry.dispose(); o.geometry = geo; }
      o.material = Array.isArray(o.material) ? o.material.map(m => keepLive(m) ? m : basic(m, false)) : basic(o.material, fold);
      o.receiveShadow = false; o.userData.baked = true;
    });
    return { meshes: meshes.length, verts, ms: Math.round(performance.now() - t0) };
  }
  return { room };
})();
