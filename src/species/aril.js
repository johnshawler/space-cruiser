// Shared by the fifty cast builders. The animation joints point into the existing
// sculpture; only the posed limbs and facial controls need new geometry.
// Bake once per design. Seeds share geometry, never pivots, expressions or paint.
const CastRig = (() => {
  const templates = new Map(),
    palette = new Map();
  const mechLink =
    /^(Upper link|Shoulder bearing|Elbow bearing|Forearm piston|Forearm sleeve|Wrist bearing|Jaw|Sole)$/;
  const oldFace =
    /^(Eye|Dark oval eye|Catchlight|Smiling mouth|Mouth opening|Pursed lower lip|Mouth slit|Lip crease|Snout seam|Brow armor|Amber eye|Operator lamp|Vertical face lamp|Eye lamp|Eye glint|Optical glass|Blue lens|Aquamarine lens)$/;

  function group(parent, name, xyz) {
    const g = new THREE.Group();
    g.name = name;
    g.position.fromArray(xyz);
    parent.add(g);
    return g;
  }
  function paint(color) {
    if (!palette.has(color)) {
      const m = new THREE.MeshStandardMaterial({ color: color === 'accent' ? 0xffffff : color });
      m.name = color;
      palette.set(color, m);
    }
    return palette.get(color);
  }
  function ellipsoid(parent, name, color, xyz, radii) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), paint(color));
    m.name = name;
    m.position.fromArray(xyz);
    m.scale.fromArray(radii);
    parent.add(m);
    return m;
  }
  function rod(parent, name, color, start, end, lower, upper) {
    const v = new THREE.Vector3().fromArray(start),
      w = new THREE.Vector3().fromArray(end);
    const delta = w.sub(v),
      m = new THREE.Mesh(new THREE.CylinderGeometry(upper, lower, delta.length(), 10), paint(color));
    m.name = name;
    m.position.copy(v).addScaledVector(delta, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    parent.add(m);
  }
  function arm(parent, side, length, radius, style, handColor) {
    const joint = style === 'tool',
      wing = style === 'wing',
      fin = style === 'fin';
    const elbow = [side * radius * 0.38, -length * 0.51, radius * 0.25],
      hand = [0, -length, 0];
    if (wing || fin) {
      const vane = ellipsoid(
        parent,
        'Folded forelimb',
        'accent',
        [0, -length * 0.48, 0],
        [radius * 1.1, length * 0.56, radius * (wing ? 1.65 : 0.82)],
      );
      vane.rotation.x = wing ? 0.19 : -0.13;
      for (let j = 0; j < 3; j++)
        ellipsoid(
          parent,
          'Trailing digits',
          handColor,
          [side * radius * 0.12, -length * (0.71 + j * 0.08), radius * (j - 1) * 0.62],
          [radius * 0.52, length * 0.16, radius * 0.4],
        );
    } else {
      rod(parent, 'Upper arm', 'accent', [0, 0, 0], elbow, radius * 1.05, radius * 0.81);
      ellipsoid(parent, 'Elbow', joint ? '#b49566' : 'accent', elbow, [
        radius * 0.86,
        radius * 0.86,
        radius * 0.86,
      ]);
      rod(parent, 'Forearm', joint ? '#63747a' : 'accent', elbow, hand, radius * 0.81, radius * 0.62);
    }
    ellipsoid(parent, 'Gripping palm', handColor, hand, [radius * 0.99, radius * 0.78, radius * 0.75]);
    for (const i of [-1, 1]) {
      const a = [i * 0.57 * radius, -length, 0.16 * radius],
        b = [i * 0.66 * radius, -length - radius * 0.85, radius * 0.54];
      rod(parent, 'Finger', handColor, a, b, radius * 0.28, radius * 0.18);
      ellipsoid(parent, 'Fingertip', handColor, b, [radius * 0.19, radius * 0.23, radius * 0.21]);
    }
  }
  function include(pattern, names) {
    return pattern && names.some((n) => pattern.test(n));
  }

  // Copy source coordinates into an axis-aligned joint's local space. Indexed
  // triangles, original vertex colours and transformed normals all survive batching.
  const simplified = new WeakMap();
  function gameGeometry(original) {
    if (simplified.has(original)) return simplified.get(original);
    const p = original.parameters;
    let result = original;
    if (p && original.type.startsWith('Torus') && (p.tubularSegments > 24 || p.radialSegments > 7))
      result = new THREE.TorusGeometry(
        p.radius,
        p.tube,
        Math.min(7, p.radialSegments),
        Math.min(24, p.tubularSegments),
        p.arc,
      );
    else if (p && original.type.startsWith('Cylinder') && p.radialSegments > 20)
      result = new THREE.CylinderGeometry(
        p.radiusTop,
        p.radiusBottom,
        p.height,
        20,
        p.heightSegments,
        p.openEnded,
        p.thetaStart,
        p.thetaLength,
      );
    simplified.set(original, result);
    return result;
  }
  function batch(meshes, joint, scale, accentColor, linear = false, species = null) {
    const out = new Map(),
      pt = new THREE.Vector3(),
      norm = new THREE.Vector3(),
      mat = new THREE.Matrix4();
    const toJoint = new THREE.Matrix4()
      .makeScale(...scale)
      .multiply(new THREE.Matrix4().makeTranslation(...joint.map((v) => -v)));
    for (const mesh of meshes) {
      const source = mesh.material,
        paint = source.userData.basePaint || source.name,
        accent = paint === 'accent' || paint.split('/')[0] === accentColor,
        role = species ? source.userData.surfaceRole || ResidentModels.surfaceRole(species, mesh.name, mesh.parent?.name || '', paint) : null,
        emission = !linear && (source.emissive?.getHex() || 0),
        key = [accent,role,emission].join('|');
      if (!out.has(key)) out.set(key, { accent,role,emission,pos: [], normal: [], uv: [], color: [], indices: [] });
      const dst = out.get(key),
        g = gameGeometry(mesh.geometry),
        a = g.attributes.position,
        n = g.attributes.normal,
        tint = g.attributes.color;
      const base = accent ? new THREE.Color(0xffffff) : source.color.clone();
      if (!accent && !linear) base.convertSRGBToLinear();
      mat.multiplyMatrices(toJoint, mesh.matrixWorld);
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(mat),
        offset = dst.pos.length / 3;
      for (let i = 0; i < a.count; i++) {
        pt.fromBufferAttribute(a, i).applyMatrix4(mat);
        dst.pos.push(pt.x, pt.y, pt.z);
        const uv = g.attributes.uv;
        dst.uv.push(uv ? uv.getX(i) : pt.x*2, uv ? uv.getY(i) : pt.y*2);
        norm.fromBufferAttribute(n, i).applyMatrix3(normalMatrix).normalize();
        dst.normal.push(norm.x, norm.y, norm.z);
        dst.color.push(
          base.r * (tint ? tint.getX(i) : 1),
          base.g * (tint ? tint.getY(i) : 1),
          base.b * (tint ? tint.getZ(i) : 1),
        );
      }
      for (let i = 0; i < (g.index ? g.index.count : a.count); i++)
        dst.indices.push(offset + (g.index ? g.index.getX(i) : i));
    }
    return [...out.values()].map((d) => {
      const g = new THREE.BufferGeometry();
      for (const [name, data] of [
        ['position', d.pos],
        ['normal', d.normal],
        ['color', d.color],
      ])
        g.setAttribute(name, new THREE.Float32BufferAttribute(data, 3));
      const uv=new THREE.Float32BufferAttribute(d.uv,2);
      g.setAttribute('uv',uv);g.setAttribute('uv2',uv);
      g.setIndex(d.indices);
      g.computeBoundingSphere();
      return { geometry:g, accent:d.accent, role:d.role, emission:d.emission };
    });
  }

  function prepare(id, c, robot) {
    if (templates.has(id)) return templates.get(id);
    const master = ResidentModels.buildCharacter(id).children[0];
    master.position.set(0, 0, 0);
    const sourceHead = master.children.find((o) => o.name === (c.headGroup || 'Head') && o.isGroup);
    if (sourceHead) sourceHead.rotation.set(0, 0, 0);
    master.updateMatrixWorld(true);
    const pivots = new Map(),
      chunks = new Map(),
      working = new THREE.Group(),
      eyes = [];
    function addJoint(key, position, parent = 'rig') {
      pivots.set(key, { position, parent });
      chunks.set(key, []);
    }
    const headPos = c.head || sourceHead.position.toArray(),
      [shoulderX, shoulderY, shoulderZ, length, radius] = c.arm;
    addJoint('rig', [0, 0, 0]);
    addJoint('head', headPos);
    function generated(key, fn) {
      const g = group(working, key, pivots.get(key).position);
      fn(g);
      g.updateWorldMatrix(true, true);
      g.traverse((m) => {
        if (m.isMesh) chunks.get(key).push(m);
      });
    }
    for (const [i, side] of [-1, 1].entries()) {
      // A rounded socket bridges the torso and the shoulder through the whole wave.
      generated('rig', (g) => {
        const socket = [side * shoulderX, shoulderY, shoulderZ];
        rod(
          g,
          'Shoulder link',
          c.socketColor || 'accent',
          [side * shoulderX * 0.52, shoulderY, shoulderZ],
          socket,
          radius * 0.91,
          radius * 0.76,
        );
        ellipsoid(g, 'Shoulder socket', c.socketColor || 'accent', socket, [
          radius * 1.08,
          radius * 1.1,
          radius * 1.08,
        ]);
      });
      const suffix = i ? 'R' : 'L';
      addJoint('arm' + suffix, [side * shoulderX, shoulderY, shoulderZ]);
      generated('arm' + suffix, (g) =>
        arm(
          g,
          side,
          length,
          radius,
          c.hand || (robot ? 'tool' : 'palm'),
          c.handColor || (robot ? '#b6a584' : 'accent'),
        ),
      );
      if (c.leg) {
        const [x, y, z, r, footLength] = c.leg;
        const ankle = r * 0.6;
        addJoint('leg' + suffix, [side * x, y, z]);
        addJoint('foot' + suffix, [side * x, ankle, z], 'leg' + suffix);
        if (!c.legParts) {
          generated('leg' + suffix, (g) => {
            const knee = [side * r * 0.16, -(y - ankle) * 0.5, r * (robot ? 0.43 : 0.28)];
            rod(g, 'Thigh', 'accent', [0, 0, 0], knee, r * 1.19, r * 0.83);
            ellipsoid(g, 'Knee', robot ? '#6e7980' : 'accent', knee, [r * 0.94, r * 0.94, r * 0.94]);
            rod(g, 'Shin', robot ? '#879197' : 'accent', knee, [0, ankle - y, 0], r * 0.79, r * 0.65);
          });
        }
        if (!c.legParts || !c.footParts)
          generated('foot' + suffix, (g) =>
            ellipsoid(
              g,
              'Foot',
              c.footColor || (robot ? '#464b53' : 'accent'),
              [0, 0, footLength * 0.2],
              [r * 1.24, ankle, footLength],
            ),
          );
      }
    }
    for (const j of c.joints || []) addJoint(j[0], j[1], j[4] || 'rig');
    const getCenter = (m) => {
      const b = m.geometry.boundingBox || (m.geometry.computeBoundingBox(), m.geometry.boundingBox);
      return b.getCenter(new THREE.Vector3()).applyMatrix4(m.matrixWorld);
    };
    if (c.faceShell) {
      const [x, y, z, rx, ry, rz] = c.faceShell;
      generated('head', (g) =>
        ellipsoid(
          g,
          'Optical housing',
          c.shellColor || 'accent',
          [x - headPos[0], y - headPos[1], z - headPos[2]],
          [rx, ry, rz],
        ),
      );
      generated('rig', (g) =>
        rod(
          g,
          'Swivel neck',
          robot ? '#a78a62' : 'accent',
          [headPos[0], headPos[1] - 0.1, headPos[2] - 0.08],
          headPos,
          ry * 0.63,
          ry * 0.52,
        ),
      );
    }
    if (c.extra) c.extra({ joint: generated, rod, oval: ellipsoid });
    const acc = c.accent;
    master.traverse((mesh) => {
      if (!mesh.isMesh) return;
      const names = [];
      for (let o = mesh; o && o !== master; o = o.parent) names.push(o.name);
      const at = getCenter(mesh),
        sign = at.x < 0 ? 'L' : 'R',
        top = names[names.length - 1];
      if (mesh.name === 'Sclera') {
        const ball = mesh.getWorldPosition(new THREE.Vector3()),
          size = mesh.getWorldScale(new THREE.Vector3());
        eyes.push([ball.x, ball.y, ball.z, size.x]);
      }
      if (include(oldFace, names) || include(c.omit, names) || (c.skip && c.skip(at, mesh, names)))
        return;
      let key = 'rig';
      const prop = (c.props || []).find((p) => include(p.parts, names));
      if (prop) {
        const hand = pivots.get('arm' + prop.side).position,
          grip = prop.grip,
          k = prop.scale || 1;
        const target = new THREE.Vector3(hand[0], hand[1] - length, hand[2] + radius * 0.4);
        const transform = new THREE.Matrix4()
          .compose(
            target,
            new THREE.Quaternion().setFromEuler(new THREE.Euler(...(prop.turn || [0, 0, 0]))),
            new THREE.Vector3(k, k, k),
          )
          .multiply(new THREE.Matrix4().makeTranslation(-grip[0], -grip[1], -grip[2]));
        const copy = new THREE.Mesh(mesh.geometry, mesh.material);
        copy.matrixWorld.multiplyMatrices(transform, mesh.matrixWorld);
        chunks.get('arm' + prop.side).push(copy);
        return;
      }
      const moving = (c.joints || []).find(
        (j) => include(j[2], names) && (!j[3] || j[3](at, mesh, names)),
      );
      if (moving) key = moving[0];
      else if (c.legParts && include(c.legParts, names))
        key = (include(c.footParts, names) ? 'foot' : 'leg') + sign;
      else if (top === sourceHead?.name || include(c.headParts, names)) key = 'head';
      else if (top === 'Arm' || top === 'Leg' || mechLink.test(top)) return;
      const offset = c.offsets?.find(([pattern]) => include(pattern, names));
      if (offset) {
        const translated = new THREE.Mesh(mesh.geometry, mesh.material);
        translated.matrixWorld.multiplyMatrices(
          new THREE.Matrix4().makeTranslation(...offset[1]),
          mesh.matrixWorld,
        );
        chunks.get(key).push(translated);
      } else chunks.get(key).push(mesh);
      if (moving && /^(Rubber wheel|Drive wheel|Caster)$/.test(mesh.name)) {
        const [x, y, z] = moving[1],
          b = new THREE.Box3().setFromObject(mesh),
          h = b.max.y - at.y;
        generated(key, (g) => {
          for (const s of [-1, 1])
            ellipsoid(
              g,
              'Wheel witness mark',
              '#d8ae71',
              [(s < 0 ? b.min.x : b.max.x) - x + s * 0.003, at.y - y + h * 0.63, at.z - z],
              [0.008, h * 0.17, h * 0.064],
            );
        });
      }
    });
    // Native dimensions are fitted here, before the pivot rotations are applied.
    const bounds = new THREE.Box3(),
      v = new THREE.Vector3();
    for (const list of chunks.values())
      for (const m of list) {
        const a = m.geometry.attributes.position;
        for (let i = 0; i < a.count; i++)
          bounds.expandByPoint(v.fromBufferAttribute(a, i).applyMatrix4(m.matrixWorld));
      }
    const dim = bounds.getSize(new THREE.Vector3()),
      sy = c.height / dim.y;
    const scale = [Math.min(sy, 1.235 / dim.x), sy, Math.min(sy, (c.depth || 0.91) / dim.z)];
    const center = bounds.getCenter(new THREE.Vector3()),
      ground = c.hover ? 0.13 : 0;
    const origin = [center.x, bounds.min.y - ground / sy, center.z];
    const jointData = [...pivots].map(([key, { position, parent }]) => ({
      key,
      parent,
      position: position.map(
        (v, i) =>
          (v -
            (key === 'rig'
              ? origin[i]
              : parent === 'rig'
                ? origin[i]
                : pivots.get(parent).position[i])) *
          scale[i],
      ),
      parts: batch(chunks.get(key), key === 'rig' ? origin : position, scale, acc, false, id),
    }));
    const data = { jointData, scale, headPos, eyes, length: length * sy };
    templates.set(id, data);
    return data;
  }

  // Pack the pupil, iris and corneal highlights together in gaze-local space.
  // Folk keeps the gaze and lid pivots so the house blink/look controls still work.
  function packEye(parent, material) {
    const list = parent.children.filter((m) => m.isMesh);
    if (list.length < 2) return;
    for (const m of list) {
      m.updateMatrix();
      m.matrixWorld.copy(m.matrix);
    }
    const layers = batch(list, [0, 0, 0], [1, 1, 1], null, true);
    for (const m of list) {
      parent.remove(m);
      m.geometry.dispose();
    }
    const mesh = new THREE.Mesh(layers[0].geometry, material);
    parent.add(mesh);
  }

  function face(T, c, data) {
    const { head, U } = T,
      dims = data.scale,
      origin = data.headPos;
    const local = (p) => p.map((v, i) => (v - origin[i]) * dims[i]);
    const f = c.face,
      raw = f ? f.eyes : data.eyes,
      robot = T.S.family === 'robot';
    const signal = robot ? T.glow(c.signal || '#a4eee5', 1.18) : null;
    const enamel = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.31,
      metalness: 0.05,
    });
    const eyePaint = robot ? T.phys(T.iris) : null;
    const first = raw[0],
      avg = raw.reduce((sum, e) => sum + e[0], 0) / raw.length;
    // Preserve single optics, side-set eyes and the source's asymmetric eye spacing.
    for (const [x, y, z, rawR] of raw) {
      const pos = local([x, y, z]),
        r = Math.min(0.128, Math.max(robot ? 0.04 : 0.054, rawR * Math.min(dims[0], dims[1])));
      if (!robot) {
        const socket = T.eye(head, U, ...pos, r, T.body, T.iris);
        // Match the house eye shape with the cast's lower segment budget.
        socket.traverse((m) => {
          if (!m.isMesh) return;
          const g = m.geometry,
            o = g.parameters;
          if (!o || o.radius == null) return;
          m.geometry = new THREE.SphereGeometry(
            o.radius,
            14,
            8,
            o.phiStart,
            o.phiLength,
            o.thetaStart,
            o.thetaLength,
          );
          g.dispose();
        });
        const look = U.looks[U.looks.length - 1];
        socket.name = 'House eye';
        for (const glint of socket.children.filter((m) => m.isMesh && m.material === T.catchM))
          look.add(glint);
        packEye(look, enamel);
        continue;
      }
      const gaze = group(head, 'Gaze', pos);
      const blinkGroup = group(gaze, 'Blink', [0, 0, 0]);
      const lens = T.sph(1, signal, 0, 0, r * 0.28, 14, 10);
      lens.scale.set(r, r * (robot ? 0.77 : 0.91), r * 0.62);
      blinkGroup.add(lens);
      const look = group(blinkGroup, 'Look', [0, 0, 0]);
      U.looks.push(look);
      const iris = T.sph(1, eyePaint, 0, 0, r * 0.77, 12, 8);
      iris.scale.set(r * 0.68, r * 0.7, r * 0.21);
      look.add(iris);
      const pupil = T.sph(1, T.browM, 0, 0, r * 0.93, 12, 8);
      pupil.scale.set(r * 0.35, r * 0.46, r * 0.12);
      look.add(pupil);
      const spark = T.sph(r * 0.17, T.catchM, -r * 0.2, r * 0.26, r * 1.03, 8, 6);
      look.add(spark);
      packEye(look, enamel);
      blinkGroup.userData.sy = 1;
      U.eyes.push(blinkGroup);
    }
    for (const side of [-1, 1]) {
      const e = raw.length === 1 ? first : raw[side < 0 ? 0 : raw.length - 1],
        p = local([raw.length === 1 ? avg + side * e[3] * 0.53 : e[0], e[1], e[2]]);
      const r = Math.min(0.128, Math.max(robot ? 0.04 : 0.054, e[3] * Math.min(dims[0], dims[1])));
      const b = T.sph(1, robot ? signal : T.browM, p[0], p[1] + r * 0.92, p[2] + r * 0.62, 12, 8);
      b.scale.set(r * (raw.length === 1 ? 0.55 : 0.88), Math.max(0.012, r * 0.21), r * 0.25);
      head.add(b);
      U.brows.push({ b, side, y: b.position.y });
    }
    const m = f?.mouth ||
      c.mouth || [
        avg,
        first[1] - first[3] * 1.42,
        Math.max(...raw.map((e) => e[2])) + first[3] * 0.6,
        first[3] * 6.7,
      ];
    const pos = local(m.slice(0, 3)),
      size = Math.min(1.03, Math.max(0.29, m[3] * dims[0]));
    const g = T.mouth(head, U, ...pos, size, signal);
    if (c.lip) g.scale.set(...c.lip);
  }

  function build(T, c) {
    const robot = T.S.family === 'robot',
      d = prepare(T.S.kind, c, robot),
      nodes = { rig: T.rig, head: T.head };
    const fixed = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: robot ? 0.48 : 0.69,
      metalness: robot ? 0.32 : 0.035,
    });
    const accent = T.body;
    accent.name = 'accent';
    accent.color.copy(C(T.hsl(T.S.lit + (T.rand() - 0.5) * 5)));
    const paints=new Map();
    const seededSize = 0.98 + T.rand() * 0.04;
    for (const j of d.jointData) {
      const node = nodes[j.key] || (nodes[j.key] = group(nodes[j.parent], j.key, j.position));
      if (j.key === 'head') node.position.fromArray(j.position);
      node.userData.restX = node.position.x;
      node.userData.restY = node.position.y;
      node.userData.restZ = node.position.z;
      for (const part of j.parts) {
        const key=[part.accent,part.role,part.emission].join('|');
        if(!paints.has(key)){
          const base=part.accent?accent:fixed;
          const mat=part.role?ResidentModels.roleMaterial(base,part.role):part.emission?base.clone():base;
          mat.vertexColors=true;
          if(part.accent)mat.color=accent.color;
          if(part.emission){mat.emissive.setHex(part.emission);mat.emissiveIntensity=.75;}
          paints.set(key,mat);
        }
        const m = new THREE.Mesh(part.geometry, paints.get(key));
        m.name = j.key + ' paint';
        node.add(m);
      }
    }
    T.U.arms = [nodes.armL, nodes.armR];
    for (const a of T.U.arms) a.userData.len = d.length;
    if (nodes.legL) {
      T.U.legs = [nodes.legL, nodes.legR];
      nodes.legL.userData.foot = nodes.footL;
      nodes.legR.userData.foot = nodes.footR;
    }
    if (c.tent)
      for (const [i, k] of c.tent.entries()) {
        const n = nodes[k],
          idle = group(n.parent, 'Idle flex', n.position.toArray());
        idle.add(n);
        n.position.set(0, 0, 0);
        idle.userData.a = (i * Math.PI * 2) / c.tent.length;
        T.U.tent.push(idle);
      }
    face(T, c, d);
    // A small change in ear/eye spacing is visible even between similarly tinted seeds.
    for (const gaze of T.U.looks) gaze.parent.position.x *= seededSize;
    const gait = c.gait;
    T.U.gait = (phase, amount) => gait(nodes, phase, amount);
  }

  function steps(n, p, a, stride, lift, roll = 0, pitch = 0) {
    const s = Math.sin(p),
      k = stride * s * a;
    n.rig.position.y = Math.abs(s) * lift * a;
    n.rig.rotation.z = roll * s * a;
    n.rig.rotation.x = pitch * Math.cos(p * 2) * a;
    for (const [i, key] of ['L', 'R'].entries()) {
      const direction = i ? -1 : 1,
        leg = n['leg' + key],
        foot = n['foot' + key];
      const angle = k * direction;
      leg.rotation.x = angle;
      foot.rotation.x = -angle;
      // Cancel the rise of the planted ankle. The returning foot alone clears
      // the ground, with a longer clearance on a high-stepping design.
      const naturalRise = foot.position.y * (Math.cos(angle) - 1) - foot.position.z * Math.sin(angle);
      const clearance = Math.max(0, direction * Math.cos(p)) * (0.023 + lift * 1.4) * a;
      leg.position.y =
        leg.userData.restY +
        clearance -
        naturalRise -
        n.rig.position.y -
        leg.position.x * Math.sin(n.rig.rotation.z);
      n['arm' + key].rotation.x = -angle * 0.62;
    }
  }
  function glide(n, p, a, lift, bank = 0) {
    n.rig.position.y = (1 - Math.cos(p)) * lift * a;
    n.rig.rotation.z = Math.sin(p) * bank * a;
    n.armL.rotation.x = -Math.sin(p) * 0.11 * a;
    n.armR.rotation.x = Math.sin(p) * 0.11 * a;
  }
  function roll(n, p, a, keys, ratio) {
    n.rig.position.y = 0;
    n.rig.rotation.z = 0;
    for (const key of keys) n[key].rotation.x = p * ratio * a;
  }
  return { build, steps, glide, roll };
})();

/* Aril · A green canopy gardener walks on forked roots below curled seed leaves. */
SPECIES_EXTRA.aril = {
  name: 'Aril',
  kind: 'aril',
  family: 'alien',
  skin: 'matte',
  cast: true,
  script: 'angular',
  col: '#72966c',
  hue: 111,
  sat: 17,
  lit: 51,
  syl: ['ah', 'ril', 'kel', 'sun', 'va', 'li', 'or', 'eth'],
  voice: {
    wave: 'triangle',
    base: 354,
    range: 0.58,
    rate: 6.9,
    glide: 0.08,
    vib: 5,
    vibAmt: 8,
    fx: 'chirp',
    amp: 0.39,
  },
  trait: 'Aril toes the soil with a root before choosing a seedbed.',
  chat: [
    'I test a bed with one toe before planting two seeds.',
    'The canopy allotment has a downstairs neighbour now.',
    'A seed labelled Up grew sideways out of politeness.',
    'My pruning list keeps growing at the bottom.',
    'The new soil has an excellent spring to it.',
  ],
  greet: ['Gardener here. Mind the little shoots.', 'Come in through the gap in the leaves.'],
  cargo: ['{good}, with the seedlings on top.', 'A bag of potting soil and its change of address.'],
  joke: ['I tried to give the vine directions. It took a cutting.'],
  nice: ["Thanks. That's worth a fresh leaf."],
  bye: ['Leave a little room to grow.'],
  honk: ['The seedpods rattled in agreement.'],
  dock: ['At {port}, follow the trimmed branches.', 'Welcome to {port}. The ramp is freshly weeded.'],
  rumor: 'The canopy gardens on {planet} are paying extra for incoming loads.',
  build(T) {
    CastRig.build(T, {
      accent: '#72966c',
      height: 1.47,
      arm: [0.205, 1.09, 0.02, 0.35, 0.066],
      leg: [0.13, 0.77, 0, 0.067, 0.14],
      legParts: /^Root (stilt|foot)$/,
      footParts: /^Root foot$/,
      mouth: [0, 1.387, 0.214, 0.5],
      gait(n, p, a) {
        CastRig.steps(n, p, a, 0.6, 0.028, 0.045);
        n.footL.rotation.x += 0.18 * Math.max(0, Math.cos(p)) * a;
        n.footR.rotation.x += 0.18 * Math.max(0, -Math.cos(p)) * a;
      },
    });
  },
};
