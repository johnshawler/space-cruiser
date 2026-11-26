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
const plans=JSON.parse(read('docs/ship-interiors/fleet-blueprints/editable/Fleet-Deck-Geometry.json')).ships;
const planFor=key=>plans.find(s=>s.id===key);
const helmDoor=plan=>plan.decks[0].doors.find(d=>d.rooms.includes('01')&&d.rooms.includes('02')).center;
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
  const door = nodePos(g.j, 'door'); const plan=planFor(key), pilot=plan?.decks[0].fixtures.find(f=>f.kind==='pilot').center;
  const expectedDoor=c.fitted?[helmDoor(plan)[0]-pilot[0],-.32,helmDoor(plan)[1]-pilot[1]]:[0,-.175,.69];
  if (!near(door, expectedDoor, 0.04)) fail(`cockpit ${key}: door not in the doorway (${door})`);
  for (const f of ['space.hdr', 'grade.png']) if (!fs.existsSync(path.join(root, 'assets/cockpits/finish', key, f))) fail(`cockpit ${key}: ${f} missing`);
}
pass(`${CK.ships.length} cockpits with ${ANCH.length} anchors each`);

// ---- walkable decks ----
const DK = JSON.parse(read('assets/ship-interiors/manifest.json'));
for (const key of SHIPS) {
  const d = DK.ships.find(s => s.ship === key); if (!d) { fail(`deck ${key}: missing`); continue; }
  // a hand-built deck (baked: one image map per room) is far heavier in triangles and lighter in materials
  const g = common(d, d.layout ? { tris: 100000, meshes: 48, materials: 30, bytes: 6e6 } : d.baked ? { tris: 220000, meshes: 16, materials: 16, bytes: 9e6 } : { tris: 60000, meshes: 120, materials: 18, bytes: d.light ? 5e6 : 3e6 });
  for (const f of Object.values(d.baked || {})) if (!fs.existsSync(path.join(root, f))) fail(`deck ${key}: baked map ${f} missing`);
  for (const [id, r] of Object.entries(d.repairs || {})) { if (!faults[id]) fail(`deck ${key}: repair fitting for unknown fault ${id}`); else if (!near(r.pos, faults[id], 0.05)) fail(`deck ${key}: repair fitting ${id} is not at the game's repair spot`);
    for (const st of ['working', 'broken', 'repaired']) if (!r.models[st] || !fs.existsSync(path.join(root, r.models[st]))) fail(`deck ${key}: repair fitting ${id} has no ${st} model`); }   // a deck with a baked light map also carries its own surface textures
  if (d.light && !fs.existsSync(path.join(root, d.light))) fail(`deck ${key}: light map ${d.light} missing`);
  if(d.layout){
    const plan=planFor(key), names=new Set(g.j.nodes.map(n=>n.name));
    if(d.layout.levels.length!==plan.decks.length) fail(key+' is missing a deck');
    let seats=0;
    for(const [i,deck] of plan.decks.entries()){
      const level=d.layout.levels[i], w=level.walk, bits=Buffer.from(w.bits,'base64');
      if(level.floor!==deck.floor_y || bits.length!==Math.ceil(w.nx*w.nz/8)) fail(key+' has an invalid walking grid');
      const start=i===0?d.layout.spawn:plan.lifts.find(l=>l.decks.includes(i)).position;
      const cell=([x,z])=>Math.floor((z-w.z0)/w.cell)*w.nx+Math.floor((x-w.x0)/w.cell);
      const open=k=>k>=0&&k<w.nx*w.nz&&(bits[k>>3]&(128>>(k&7)));
      const first=cell(start), found=new Set(), queue=[];
      if(open(first)){found.add(first);queue.push(first);}
      for(let p=0;p<queue.length;p++){const k=queue[p];
        for(const n of [k-w.nx,k+w.nx,k-1,k+1]) if(open(n)&&!found.has(n)){found.add(n);queue.push(n);}
      }
      const reachable=([x,z],radius)=>queue.some(k=>Math.hypot(w.x0+(k%w.nx+.5)*w.cell-x,w.z0+(Math.floor(k/w.nx)+.5)*w.cell-z)<radius);
      for(const r of deck.rooms){if(!names.has('room_'+r.id)||!reachable(r.label,1.4)) fail(key+' missing or unreachable room '+r.name);}
      for(const a of deck.anchors){
        const seat=a.kind.startsWith('seat_'), name=seat?a.kind.replace('seat','passenger'):'fault_'+a.kind;
        if(!near(nodePos(g.j,name),[a.position[0],level.floor+(seat?0:.87),a.position[1]],.006)||!reachable(a.position,1.2)) fail(key+' misplaced or unreachable '+name);
        if(seat) seats++; else for(const state of ['working','broken','repaired']) if(!names.has('state_'+a.kind+'_'+state)) fail(key+' missing '+a.kind+' '+state);
        if(d.layout.spots[a.kind]?.level!==i) fail(key+' interaction on wrong deck '+name);
      }
      for(const lift of plan.lifts.filter(l=>l.decks.includes(i))) if(!found.has(cell(lift.position))) fail(key+' inaccessible lift '+lift.id);
    }
    if(seats!==plan.passenger_capacity) fail(key+' passenger capacity mismatch');
    if(!Object.keys(faults).every(id=>names.has('fault_'+id))) fail(key+' missing repair');
    const [dx,dz]=helmDoor(plan);
    if(!near(nodePos(g.j,'cockpit_door'),[dx,plan.decks[0].floor_y+.91,dz],.006)) fail(key+' misplaced bridge door');
    continue;
  }
  for (const [id, pos] of Object.entries(faults)) if (!near(nodePos(g.j, 'fault_' + id), pos, 0.05)) fail(`deck ${key}: fault_${id} is not at the game's repair spot ${pos}`);
  for (let i = 0; i < 4; i++) if (!near(nodePos(g.j, 'passenger_' + (i + 1)), [-3.8, 0, 1.95 + i * 1.15], 0.05)) fail(`deck ${key}: passenger_${i + 1} is not at a passenger seat`);
  if (!near(nodePos(g.j, 'cockpit_door'), [0, -0.175, 0.68], 0.05)) fail(`deck ${key}: cockpit_door anchor is off the doorway`);
  if (![...g.j.nodes].some(n => /^lamp_/.test(n.name))) fail(`deck ${key}: no lamp markers`);
  for (const f of ['space.hdr', 'grade.png']) if (!fs.existsSync(path.join(root, 'assets/ship-interiors/finish', key, f))) fail(`deck ${key}: ${f} missing`);
}
pass(`${DK.ships.length} walkable decks against ${Object.keys(faults).length} repair spots and blueprint passenger capacities`);

// ---------- character models ----------
// - all 32 are in the manifest, each file exists and matches its recorded size, is one skinned mesh within budget,
//   and carries its clips (humanoids also their three morph targets)
// - every design in MODEL_FOR (src/01-data.js) points at a model that exists, and all 50 designs are covered
{
  const SP = JSON.parse(read('assets/characters/species/manifest.json')).models, ids = new Set(SP.map(m => m.id));
  if (SP.length !== 32) fail(`character models: ${SP.length} in the manifest, expected 32`);
  for (const m of SP) {
    const file = `assets/characters/species/${m.id}.glb`;
    if (!fs.existsSync(path.join(root, file))) { fail(`character ${m.id}: ${file} missing`); continue; }
    const g = glb(file), clips = (g.j.animations || []).map(a => a.name);
    if (g.bytes !== m.bytes) fail(`character ${m.id}: file is ${g.bytes} bytes, manifest says ${m.bytes}`);
    if (g.tris > 16000) fail(`character ${m.id}: ${g.tris} triangles is over the 16,000 budget`);
    if (g.bytes > 2.2e6) fail(`character ${m.id}: ${(g.bytes / 1e6).toFixed(2)} MB is over the 2.2 MB budget`);
    if (g.meshes !== 1 || (g.j.skins || []).length !== 1) fail(`character ${m.id}: expected one skinned mesh, found ${g.meshes} meshes and ${(g.j.skins || []).length} skins`);
    const need = m.kind === 'robot' ? ['Idle', 'Travel', 'Operate'] : ['Walk', 'Seat', 'Happy', 'Bored', 'Sad'];
    for (const c of need) if (!clips.includes(c)) fail(`character ${m.id}: clip ${c} missing`);
    if (m.kind === 'humanoid') {
      const names = (g.j.meshes[0].extras && g.j.meshes[0].extras.targetNames) || [];
      for (const t of ['Happy', 'Bored', 'Sad']) if (!names.includes(t)) fail(`character ${m.id}: morph target ${t} missing`);
      if (!m.seat) fail(`character ${m.id}: no seat position`);
    }
    if (!(m.max[1] > 0.5 && m.max[1] < 3)) fail(`character ${m.id}: height ${m.max[1]} m is out of range`);
  }
  const data = read('src/01-data.js').toString(), mf = data.match(/const MODEL_FOR = \{([\s\S]*?)\};/), cf = data.match(/const CAST_FOR = \{([\s\S]*?)\};/);
  const pairs = t => [...t.matchAll(/(\w+):'([\w-]+)'/g)].map(x => [x[1], x[2]]);
  const model = new Map(pairs(mf ? mf[1] : '')), used = new Set(model.values());
  for (const [k, id] of model) if (!ids.has(id)) fail(`MODEL_FOR: ${k} points at ${id}, which has no model`);
  for (const id of ids) if (!used.has(id)) fail(`character ${id}: no design is played by it`);
  const cast = fs.readdirSync(path.join(root, 'src/species')).filter(f => /cast:\s*true/.test(read('src/species/' + f).toString())).map(f => f.replace(/\.js$/, ''));
  for (const k of cast) if (!model.has(k)) fail(`MODEL_FOR: cast design ${k} has no model`);
  for (const [legacy, k] of pairs(cf ? cf[1] : '')) if (!model.has(k)) fail(`species key ${legacy} (played by ${k}) has no model`);
  pass(`${SP.length} character models playing ${model.size} cast designs and ${pairs(cf ? cf[1] : '').length} earlier species keys`);
}

for (const m of ok) console.log('ok   ' + m);
for (const m of bad) console.log('FAIL ' + m);
process.exit(bad.length ? 1 : 0);
