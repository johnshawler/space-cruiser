// Run after npm ci --prefix art/characters, or pass the game’s Three.js CommonJS bundle as an argument.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(new URL('../art/characters/package.json', import.meta.url));
const THREE = require(process.argv[2] || 'three');
const source = readFileSync(new URL('../src/08b-venues.js', import.meta.url), 'utf8');
const util = readFileSync(new URL('../src/02-util.js', import.meta.url), 'utf8');
const venues = JSON.parse(readFileSync(new URL('../assets/storefronts/manifest.json', import.meta.url))).venues;
const group = () => new THREE.Group();
const crate = () => new THREE.Mesh(new THREE.BoxGeometry(.62, .62, .62));
const noop = () => {};
function between(text, from, to) {
  const first = text.indexOf(from), last = text.indexOf(to, first);
  assert(first >= 0 && last > first, `Missing game source: ${from}`);
  return text.slice(first, last);
}

// Exercise the game's two state machines and its falling-box physics in their normal tick order.
// Sound, posing and particle rendering have no bearing on route ownership.
let seed;
function rnd(a,b) { seed=(Math.imul(1664525,seed)+1013904223)>>>0; return a+(b-a)*seed/4294967296; }
const simulation = vm.runInNewContext([
  between(util, 'const _flBox=', '/* text that reads'),
  ...['STORE','SLOTX'].map(k=>source.match(new RegExp(`const ${k}=.*?;`))[0]),
  between(source,'  const P_=','\n'),
  between(source,'  function stepDroid','  /* ---------- particles'),
  between(source,'  function toss','  function clearFx'),
  between(source,'  const once=','\n'),
  between(source,'  const GAGS =','    crane:{')+'};',
  '({stack:GAGS.stack, stepDroid, stepFx})',
].join('\n'), { THREE, V3:THREE.Vector3, clamp:(n,a,b)=>Math.max(a,Math.min(b,n)), rnd,
  Folk:{walk:noop, arms:noop}, api:{react:noop}, Bake:{useProbe:noop},
  snd:noop, puff:noop, bx:crate, M:noop, crateTex:noop });

// Horizontal separating-axis test with the largest Mudlark instance from the game manifest.
// The droid envelope includes its raised forks and the packed crate in front of its body.
const mud=JSON.parse(readFileSync(new URL('../assets/characters/species/mudlark.json', import.meta.url)));
const long=mud.max[0]-mud.min[0], across=mud.max[2]-mud.min[2];
const folkSource=readFileSync(new URL('../src/08a-folk-models.js', import.meta.url), 'utf8');
const fit=vm.runInNewContext(between(folkSource,'  const YAW =','  /* a pivot')+';fit');
const scale=1.2*1.05*fit(mud); // venue crew scale and maximum individual size variation
function rect(actor,w,h,offset=0){
  const s=Math.sin(actor.rotation.y),c=Math.cos(actor.rotation.y);
  return {x:actor.position.x+s*offset,z:actor.position.z+c*offset,axes:[[c,-s,w/2],[s,c,h/2]]};
}
const radius=(r,x,z)=>r.axes.reduce((a,[u,v,half])=>a+half*Math.abs(u*x+v*z),0);
function gap(a,b){return Math.max(...[...a.axes,...b.axes].map(([u,v])=>Math.abs((a.x-b.x)*u+(a.z-b.z)*v)-radius(a,u,v)-radius(b,u,v)));}
const bodyGap=(actor,droid)=>gap(rect(actor,across*scale,long*scale),rect(droid,1.14,1.61,.335));
let meshMin=Infinity;
function run(entry, spills, orderFrame, firstOnShelf, orders=1) {
  seed=orderFrame+201;
  const marks=entry.markers, root=group(), A=group(), B=group();
  A.userData.rig=group(); A.add(A.userData.rig);
  const d={grp:group(),rig:group(),eye:group(),head:group(),lift:group(),n:0,i:0,t:0,q:[],slots:[]};
  d.grp.position.fromArray(marks.droid_home); root.add(A,B,d.grp); d.grp.add(d.rig); d.rig.add(d.lift,d.head);
  const boxes=Array.from({length:4},crate); root.add(...boxes);
  const V={root,A,B,t:0,ok:!spills,frontShop:entry,g:{crates:boxes},droid:d,parts:[],phys:[],fired:{}};
  const {stack,stepDroid,stepFx}=simulation;
  stack.reset(V);
  const dt=1/30;
  let cycles=0, completed=0, min=Infinity, sawSpill=false, waitingCrew=false, waitingDroid=false;
  for(let frame=0; frame<18000; frame++) {
    if(frame===orderFrame) {
      for(let i=0;i<orders;i++) {
        const job={name:'Cargo '+i};
        if((i%2===0)===firstOnShelf){
          const o=crate(); root.add(o);
          o.position.fromArray(marks['goods_'+String((i+frame)%12+1).padStart(2,'0')]); job.item={o};
        }
        d.q.push(job);
      }
    }
    V.t+=dt;
    if(V.t>(V.gagDur||stack.dur)) {
      assert.equal(V.g.st,'back','the stack animation must finish naturally');
      cycles++; V.t=0; V.gagDur=0; V.fired={}; V.phys.length=0; stack.reset(V);
    }
    stack.update(V,V.t,dt); stepFx(V,dt,frame*dt);
    root.updateMatrixWorld(true);
    const last=d.cur;
    stepDroid(V,dt,frame*dt);
    if(last&&!d.cur) completed++;
    for(const actor of [A,B]) {
      const gap=Math.hypot(actor.position.x-d.grp.position.x,actor.position.z-d.grp.position.z);
      assert(gap>=1.8,`${entry.name}: ${V.g.st} crew/droid separation ${gap.toFixed(2)} m at frame ${frame}`);
      min=Math.min(min,gap);
      const separation=bodyGap(actor,d.grp);
      meshMin=Math.min(meshMin,separation);
      assert(separation>0,`${entry.name}: Mudlark envelope overlaps droid at ${V.g.st}, ${frame}: ${separation}`);
    }
    sawSpill ||= V.g.spilt;
    waitingCrew ||= V.g.wp===1 && V.g.st==='out' && !V.g.crewInAisle && !!d.cur;
    waitingDroid ||= d.cur?.steps[d.i]?.[0]==='stockDoor' && V.g.crewInAisle;
    if(completed===orders && cycles && (!spills||sawSpill) && !d.cur && !d.q.length) {
      assert(d.grp.position.distanceTo(new THREE.Vector3(...marks.droid_home))<.03);
      assert(d.slots.filter(Boolean).length===Math.min(orders,3));
      return {min,waitingCrew,waitingDroid};
    }
  }
  throw new Error(`Stalled traffic in ${entry.name}, ${V.g.st}, ${completed}/${orders} deliveries`);
}

let scenarios=0, minimum=Infinity, deliveries=0, crewYielded=false, droidYielded=false;
for(const shop of [venues.verdanthia.depot, venues.amethyne.depot]) {
  for(const spills of [true,false]) for(const shelf of [true,false]) for(const frame of [0,60,109,180,260,360,485]) {
    const orders=frame===180?4:1;
    const r=run(shop,spills,frame,shelf,orders);
    scenarios++; deliveries+=orders; minimum=Math.min(minimum,r.min);
    crewYielded ||= r.waitingCrew; droidYielded ||= r.waitingDroid;
  }
}
assert(crewYielded && droidYielded);
console.log(`${scenarios} depot scenarios passed, ${deliveries} deliveries, minimum crew/droid center separation ${minimum.toFixed(2)} m.`);

console.log(`Minimum Mudlark body/forks footprint clearance ${meshMin.toFixed(2)} m`);
