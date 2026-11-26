#!/usr/bin/env node
// Checks the bespoke-model manifests against the files and against the game's own data:
//   node tools/check-assets.mjs
// - every manifest entry's GLB exists, parses, matches its recorded size, triangle and mesh counts, and stays in budget
// - each room belongs to a real shop at a real port, all 30 are there, and its finish files (HDR, grade) exist
// - each cockpit has the six panels and every fitting anchor, plus windshield, canopy and door meshes
// - each walkable deck's repair spots, passenger places and cockpit door sit where the game puts them
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p));
const bad = [], ok = [];
const fail = m => bad.push(m), pass = m => ok.push(m);

function glb(file) {
  const b = read(file);
  if (b.readUInt32LE(0) !== 0x46546c67) throw new Error('not a GLB');
  const j = JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString());
  let tris = 0;
  for (const m of j.meshes || []) for (const p of m.primitives) {
    const acc = j.accessors[p.indices ?? p.attributes.POSITION]; tris += (p.mode ?? 4) === 4 ? acc.count / 3 : 0;
  }
  return { j, bytes: b.length, tris: Math.round(tris), meshes: j.nodes.filter(n => n.mesh != null).length, materials: (j.materials || []).length };
}
// world-space translation of a named node (the scenes are flat or one level deep)
function nodePos(j, name) {
  const parent = new Map(); j.nodes.forEach((n, i) => (n.children || []).forEach(c => parent.set(c, i)));
  let i = j.nodes.findIndex(n => n.name === name); if (i < 0) return null;
  const p = [0, 0, 0]; while (i != null) { const t = j.nodes[i].translation || [0, 0, 0]; p[0] += t[0]; p[1] += t[1]; p[2] += t[2]; i = parent.get(i); }
  return p;
}
const near = (a, b, tol) => a && b && Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) <= tol;
function common(e, budget) {
  if (!fs.existsSync(path.join(root, e.file))) { fail(`${e.file}: missing`); return null; }
  let g; try { g = glb(e.file); } catch (x) { fail(`${e.file}: ${x.message}`); return null; }
  if (e.bytes !== g.bytes) fail(`${e.file}: manifest says ${e.bytes} bytes, file is ${g.bytes}`);
  if (e.triangles && Math.abs(e.triangles - g.tris) > 2) fail(`${e.file}: manifest says ${e.triangles} triangles, file has ${g.tris}`);
  if (e.meshes && e.meshes !== g.meshes) fail(`${e.file}: manifest says ${e.meshes} meshes, file has ${g.meshes}`);
  if (g.tris > budget.tris || g.meshes > budget.meshes || g.materials > budget.materials || g.bytes > budget.bytes)
    fail(`${e.file}: over budget (${g.tris} tris, ${g.meshes} meshes, ${g.materials} materials, ${g.bytes} bytes)`);
  return g;
}

// ---- the game's data, read from the source ----
const data = read('src/01-data.js').toString(), venues = read('src/08b-venues.js').toString(), walk = read('src/09-walk.js').toString();
const planets = [...data.matchAll(/\{ name:'([^']+)', port:'/g)].map(m => m[1]);
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const shopsAt = {};
for (const m of venues.matchAll(/\/\* (\d+) ([^·]+?) · [\s\S]*?(?=\/\* \d+ |\];\s*\nconst VENUE_GAG)/g)) {
  shopsAt[slug(m[2].trim())] = [...m[0].matchAll(/\{k:'(\w+)'/g)].map(k => k[1]);
}
const SHOP = { depot: 'depot', garage: 'garage', cantina: 'bar' };
const faults = Object.fromEntries([...walk.matchAll(/(\w+):\{name:'[^']+', where:'[^']+', effect:'[^']+', pos:\[([-\d.,]+)\]/g)].map(m => [m[1], m[2].split(',').map(Number)]));

// ---- shop rooms ----
const I = JSON.parse(read('assets/interiors/manifest.json'));
const want = Object.entries(shopsAt).flatMap(([loc, ks]) => ks.filter(k => Object.values(SHOP).includes(k)).map(k => loc + '/' + k));
const have = new Set();
for (const r of I.rooms) {
  const key = r.location + '/' + SHOP[r.shop];
  if (!planets.map(slug).includes(r.location)) fail(`room ${r.location}/${r.shop}: no such port`);
  else if (!(shopsAt[r.location] || []).includes(SHOP[r.shop])) fail(`room ${r.location}/${r.shop}: that port has no ${r.shop}`);
  if (have.has(key)) fail(`room ${key}: listed twice`); have.add(key);
  const g = common(r, { tris: 80000, meshes: 120, materials: 16, bytes: 1.5e6 }); if (!g) continue;
  for (const f of ['environment.hdr', 'grade.png']) if (!fs.existsSync(path.join(root, path.dirname(r.file), f))) fail(`room ${key}: ${f} missing`);
  if (!(r.lights || []).length) fail(`room ${key}: no light markers`);
  for (const L of r.lights || []) if (!near(nodePos(g.j, L.name), L.position, 0.02)) fail(`room ${key}: light ${L.name} is not where the GLB puts it`);
  if (r.shop === 'depot') { const s = nodePos(g.j, 'shelf'); if (!near(s, [-4.45, 0, -0.9], 0.05)) fail(`room ${key}: shelf not at (-4.45, 0, -0.9)`); }
}
for (const k of want) if (!have.has(k)) fail(`room ${k}: the game has this shop but the manifest has no room`);
pass(`${I.rooms.length} shop rooms (the game has ${want.length} depots, garages and cantinas at ${new Set(want.map(k => k.split('/')[0])).size} ports)`);

// ---- cockpits ----
const SHIPS = ['rustbucket', 'dromedary', 'stoat', 'manatee', 'empress'];
const CK = JSON.parse(read('assets/cockpits/manifest.json'));
const ANCH = ['panel_main', 'panel_left', 'panel_right', 'panel_pedestal', 'panel_overhead', 'panel_radio', 'stick', 'mug', 'clipboard', 'mascot', 'wiper_left', 'wiper_right', 'lamp_port', 'lamp_starboard', 'glow'];
for (const key of SHIPS) {
  const c = CK.ships.find(s => s.ship === key); if (!c) { fail(`cockpit ${key}: missing`); continue; }
  const g = common(c, { tris: 60000, meshes: 80, materials: 14, bytes: 1.5e6 });
  if (c.baked && !fs.existsSync(path.join(root, c.baked))) fail(`cockpit ${c.ship}: baked map ${c.baked} missing`); if (!g) continue;
  const names = new Set(g.j.nodes.map(n => n.name));
  for (const a of ANCH) { if (!names.has(a)) fail(`cockpit ${key}: no ${a} anchor`); else if (!near(nodePos(g.j, a), c.anchors[a]?.position, 0.002)) fail(`cockpit ${key}: ${a} differs between manifest and GLB`); }
  for (const m of ['windshield', 'canopy_left', 'canopy_right', 'door']) if (!names.has(m)) fail(`cockpit ${key}: no ${m} mesh`);
  const ws = g.j.nodes.find(n => n.name === 'windshield'); if (ws && !g.j.meshes[ws.mesh].primitives[0].attributes.TEXCOORD_0) fail(`cockpit ${key}: windshield has no UVs`);
  const door = nodePos(g.j, 'door'); if (!near(door, [0, -0.175, 0.69], 0.04)) fail(`cockpit ${key}: door not in the doorway (${door})`);
  for (const f of ['space.hdr', 'grade.png']) if (!fs.existsSync(path.join(root, 'assets/cockpits/finish', key, f))) fail(`cockpit ${key}: ${f} missing`);
}
pass(`${CK.ships.length} cockpits with ${ANCH.length} anchors each`);

// ---- walkable decks ----
const DK = JSON.parse(read('assets/ship-interiors/manifest.json'));
for (const key of SHIPS) {
  const d = DK.ships.find(s => s.ship === key); if (!d) { fail(`deck ${key}: missing`); continue; }
  // a hand-built deck (baked: one image map per room) is far heavier in triangles and lighter in materials
  const g = common(d, d.baked ? { tris: 220000, meshes: 16, materials: 16, bytes: 9e6 } : { tris: 60000, meshes: 120, materials: 18, bytes: d.light ? 5e6 : 3e6 });
  for (const f of Object.values(d.baked || {})) if (!fs.existsSync(path.join(root, f))) fail(`deck ${key}: baked map ${f} missing`);
  for (const [id, r] of Object.entries(d.repairs || {})) { if (!faults[id]) fail(`deck ${key}: repair fitting for unknown fault ${id}`); else if (!near(r.pos, faults[id], 0.05)) fail(`deck ${key}: repair fitting ${id} is not at the game's repair spot`);
    for (const st of ['working', 'broken', 'repaired']) if (!r.models[st] || !fs.existsSync(path.join(root, r.models[st]))) fail(`deck ${key}: repair fitting ${id} has no ${st} model`); }   // a deck with a baked light map also carries its own surface textures
  if (d.light && !fs.existsSync(path.join(root, d.light))) fail(`deck ${key}: light map ${d.light} missing`);
  for (const [id, pos] of Object.entries(faults)) if (!near(nodePos(g.j, 'fault_' + id), pos, 0.05)) fail(`deck ${key}: fault_${id} is not at the game's repair spot ${pos}`);
  for (let i = 0; i < 4; i++) if (!near(nodePos(g.j, 'passenger_' + (i + 1)), [-3.8, 0, 1.95 + i * 1.15], 0.05)) fail(`deck ${key}: passenger_${i + 1} is not at a passenger seat`);
  if (!near(nodePos(g.j, 'cockpit_door'), [0, -0.175, 0.68], 0.05)) fail(`deck ${key}: cockpit_door anchor is off the doorway`);
  if (![...g.j.nodes].some(n => /^lamp_/.test(n.name))) fail(`deck ${key}: no lamp markers`);
  for (const f of ['space.hdr', 'grade.png']) if (!fs.existsSync(path.join(root, 'assets/ship-interiors/finish', key, f))) fail(`deck ${key}: ${f} missing`);
}
pass(`${DK.ships.length} walkable decks against ${Object.keys(faults).length} repair spots and 4 passenger seats`);

for (const m of ok) console.log('ok   ' + m);
for (const m of bad) console.log('FAIL ' + m);
process.exit(bad.length ? 1 : 0);
