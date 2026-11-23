/* ===================== EVENTS ===================== */
/* Reputation, hull, waypoints, decision dialogs, and the four side activities:
   distress calls, asteroid mining, contraband runs and escort missions. */

const CONTRABAND = [
  ['Undeclared Joy','It giggles inside the crate. Do not open the crate.'],
  ['Bootleg Gravity','Slightly heavier than the legal limit.'],
  ['Unlicensed Puns','Groan-grade. Dangerously habit-forming.'],
  ['Smuggled Sunsets','Taken from Verdanthia one evening at a time.'],
  ['Black-Market Socks','Unmatched. Untraceable.'],
  ['Forbidden Soup','The recipe is a state secret. So is the smell.'],
  ['Grey-Area Glitter','Gets everywhere, including into court.'],
  ['Pirated Lullabies','Puts customs officers to sleep. Allegedly.'],
];
const STRICT = {zkthar:0.6, beepul:0.45, ooloo:0.35, vrell:0.3, momwump:0.3, grondar:0.25, blorpax:0.2, qeeble:0.15, sporrin:0.1};
const VIPS = [
  {sp:'qeeble', title:'Duchess Plimm of the Wobbly Isles'},
  {sp:'momwump', title:'Grand-Auntie Floof the Fourth'},
  {sp:'zkthar', title:'Sub-Deputy Auditor Krrrx'},
  {sp:'vrell', title:'Ulloweth, the Tragic Poet'},
  {sp:'blorpax', title:'Chef Gloopy of the Soup Barge'},
  {sp:'beepul', title:'Ambassador Unit 7-B'},
  {sp:'sporrin', title:'The Very Relaxed Elder Moss'},
  {sp:'grondar', title:'Pebblemaster Gronk'},
];
const FIELDS = [
  {name:'The Gravel Pit', ore:'Crunchy Iridium', val:46, orbit:505000, ang:0.95, y:-4000, col:'#b08a6e', R:9000, n:110},
  {name:"Grandma's Button Jar", ore:'Antique Moon Buttons', val:38, orbit:735000, ang:3.95, y:9000, col:'#9d8fc2', R:9000, n:110},
  {name:"Sir Reginald's Rubble", ore:'Smug Quartz', val:62, orbit:1025000, ang:2.25, y:-11000, col:'#c27a58', R:10000, n:120},
];
const MAYDAY = [
  "Mayday, mayday! Our drive just coughed and died. We are drifting and the snacks are running low.",
  "Is anyone out there? Our fuel gauge says zero and our pilot says a word I won't translate.",
  "Help! We are adrift with a hold full of nervous geese. Please hurry. The geese are organising.",
  "This is a distress call. Our engine fell off. Well, most of it. Please come quickly.",
];
const PIRATE = [
  "Ha! There's no emergency. There's only us. Hand something over and nobody's afternoon gets ruined.",
  "Surprise! The real distress is the toll you're about to pay.",
  "Thanks for stopping! Very kind. Now, about your wallet.",
];

/* ---------- reputation and hull ---------- */
const Rep = {
  label(v){ v=v==null?G.rep:v; return v<-40?'Notorious':v<-10?'Shady':v<15?'Unknown':v<40?'Decent':v<70?'Trusted':'Legendary'; },
  add(d, why){ if(!d) return; G.rep=clamp(Math.round(G.rep+d),-100,100); UI.toast(`${why?why+'. ':''}Reputation ${d>0?'+':''}${d} (${this.label()})`, d>0?'good':'warn'); },
  payMul(){ return 1+G.rep/400; },
};
const Hull = {
  hit(n, why){ n=Math.round(n); if(n<=0||G.mode!=='flight') return; G.hull=Math.max(0,G.hull-n); Throttle.jolt(n); if(n>=4&&Math.random()<0.35) setTimeout(()=>Faults.add(pick(['crack','coolant','strap','fuse']),'knocked loose'),900); Game.flash=Math.max(Game.flash,0.55); Sfx.thump(0.8);
    UI.toast(`${why}. Hull ${Math.round(G.hull)}%`,'warn'); if(G.hull<=0) this.breach(); },
  breach(){ G.hull=25; Game.tow('Hull breach! Emergency beacon fired. A Grondar tow-barge is on its way.',400); },
};

/* ---------- waypoints: a temporary nav target that outranks the planet destination ---------- */
const Nav = {
  wp:null,
  target(){ return this.wp||PLANETS[G.target]; },
  set(wp){
    this.clear(true); wp.isWp=true; wp.dist=wp.pos.distanceTo(G.ship.pos); wp.landR=0; wp.port=wp.port||wp.sub||'';
    const cv=makeCanvas(384,240), tex=canvasTex(cv), sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,sizeAttenuation:false,blending:THREE.AdditiveBlending}));
    sp.scale.set(0.3,0.1875,1); sp.center.set(0.5,1-158/240); sp.renderOrder=20; sp.position.copy(wp.pos); World.universe.add(sp);
    wp.mk={cv,tex,sprite:sp,key:''}; this.wp=wp; Game.mk=0; if(Sfx.ok()) Sfx.beep(990);
  },
  clear(silent){ const w=this.wp; if(!w) return; this.wp=null; World.universe.remove(w.mk.sprite); w.mk.tex.dispose(); w.mk.sprite.material.dispose(); if(!silent&&w.onCancel) w.onCancel(); },
  update(dt){
    const w=this.wp; if(!w) return; const s=G.ship; w.dist=w.pos.distanceTo(s.pos); w.mk.sprite.position.copy(w.pos);
    if(w.expire!=null){ w.expire-=dt; if(w.expire<=0){ this.clear(); return; } }
    const fwd=new V3(0,0,-1).applyQuaternion(s.quat);
    if(s.warp&&w.dist<w.dropR&&w.pos.clone().sub(s.pos).normalize().dot(fwd)>0.2) Game.dropWarp('Arriving at '+w.name,'good',true);
    if(w.dist<w.arriveR&&s.warpF<0.3){ const f=w.onArrive; this.clear(true); if(f) f(); }
  },
};

/* ---------- decision dialog (flight and port) ---------- */
const Dlg = {
  open:false, opts:[], timer:0, onTimeout:null, held:null,
  /* back in the seat: whatever came in over the radio while you were away */
  flush(){ const o=this.held; this.held=null; if(o&&!this.open&&G.mode==='flight') this.show(o); },
  show(o){
    if(Walk.on&&!o.onboard){ if(!this.held) this.held=o; return; }
    Comms.close(true); if(SysMap.open) SysMap.close(); this.open=true; this.opts=o.opts||[{t:'OK'}]; this.timer=o.timeout||0; this.onTimeout=o.onTimeout||null; this.total=this.timer;
    const box=$('dlg'); box.hidden=false; this.mini=!!o.mini; box.className=(o.tone||'')+(this.mini?' mini':''); box.onclick=()=>this.expand();
    $('dlg-hint').textContent='';
    const x=$('dlg-face').getContext('2d'); x.clearRect(0,0,192,192); if(o.sp) drawAlien(x,o.sp,o.seed||1,0,0,192); else { x.fillStyle='#1d2a3a'; x.fillRect(0,0,192,192); x.font='120px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(o.icon||'⚠',96,104); }
    $('dlg-who').textContent=o.who||''; $('dlg-text').textContent=o.text||''; $('dlg-bar').style.width=this.timer?'100%':'0';
    const box2=$('dlg-opts'); box2.innerHTML='';
    this.opts.forEach((op,i)=>{ const b=el('button','opt',`<b>${i+1}</b>${esc(op.t)}${op.sub?'<small>'+esc(op.sub)+'</small>':''}`); b.disabled=!!op.disabled; b.onclick=()=>this.choose(i); box2.appendChild(b); });
    if(o.sp&&Sfx.ok()) Sfx.speak(SPECIES[o.sp].voice,clamp((o.text||'').length*0.05,1.6,5),G.mode!=='flight'); else if(Sfx.ok()) Sfx.beep(520);
  },
  info(o){ o.opts=[{t:o.ok||'OK',fn:o.then}]; this.show(o); },
  /* open a waiting call card up into the full panel with its replies */
  expand(){ if(!this.open||!this.mini) return; this.mini=false; $('dlg').classList.remove('mini'); if(Sfx.ok()) Sfx.click(); },
  choose(i){ const op=this.opts[i]; if(!this.open||!op||op.disabled) return; Sfx.click(); this.close(); if(op.fn) op.fn(); },
  close(){ this.open=false; this.mini=false; this.timer=0; $('dlg').hidden=true; },
  update(dt){ if(!this.open||!this.timer) return; this.timer-=dt; $('dlg-bar').style.width=Math.max(0,this.timer/this.total*100)+'%';
    if(this.timer<=0){ const f=this.onTimeout; this.close(); if(f) f(); } },
};

/* ---------- helpers ---------- */
const Ev = {
  hold:0,          // seconds the ship is tethered (fuel transfer etc.)
  cargoDest(c){ return c.kind==='ore'?'Sell at an assay office':PLANETS[c.to].name; },
  clearOfPlanets(k){ const P=World.nearest; return !P||P.dist>P.r*(k||9); },
  around(pos, d){ return pos.clone().add(new V3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize().multiplyScalar(d)); },
  npc(kind, pos, pilot, extra){ const n=Npc.spawn(kind,pos,new V3(),Object.assign({keep:true},extra||{})); if(pilot) Object.assign(n.pilot,pilot); Npc.label(n); return n; },
  dismiss(n, away){ if(!n||Npc.list.indexOf(n)<0) return; n.keep=false; n.age=200; const d=away||new V3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize(); n.vel.copy(d).multiplyScalar(2600); },
  fuelUnits(f){ return Math.max(1,Math.round(f)); },
  update(dt){
    if(this.hold>0){ this.hold-=dt; G.ship.throttle=0; if(G.ship.warp) Game.dropWarp(); }
    Nav.update(dt); Distress.update(dt); Mining.update(dt); Customs.update(dt); Escort.update(dt); Flotsam.update(dt); Scoop.update(dt); Calls.update(); if(Hold.open&&Math.floor(Game.time*2)!==Math.floor((Game.time-dt)*2)) Hold.render();
  },
};

/* ---------- distress calls ---------- */
const Distress = {
  t:80, cur:null,
  update(dt){
    if(this.arrived&&!Walk.on){ this.arrived=false; this.arrive(); return; }
    if(this.cur||Dlg.open||Escort.hazard||Customs.cur||Walk.on) return;
    if(!Ev.clearOfPlanets(12)||G.playTime<45) return;
    this.t-=dt; if(this.t>0) return; this.t=rnd(110,190);
    if(Math.random()<0.75) this.call();
  },
  call(){
    const sp=pick(SPECIES_KEYS), seed=Math.floor(Math.random()*1e9), c=this.cur={sp,seed,name:alienName(sp,seed),ship:shipName(seed),ambush:Math.random()<(G.rep>40?0.32:0.25)};
    Radio.cur=null; Radio.wait=20;
    Dlg.show({sp,seed,tone:'alert',who:`Mayday · ${c.name} · ${SPECIES[sp].name} · ${c.ship}`,text:pick(MAYDAY),timeout:30,onTimeout:()=>this.ignore(),
      opts:[{t:'Answer the call',sub:'A detour. Costs time and fuel.',fn:()=>this.answer()},{t:'Keep flying',sub:'Somebody else will help. Probably.',fn:()=>this.ignore()}]});
  },
  ignore(){ this.cur=null; Rep.add(-3,'You flew past a mayday'); },
  answer(){
    const c=this.cur, s=G.ship; if(s.warp) Game.dropWarp('Dropping out of warp to answer the mayday','warn');
    const fwd=new V3(0,0,-1).applyQuaternion(s.quat), side=new V3(1,0,0).applyQuaternion(s.quat);
    const pos=s.pos.clone().addScaledVector(fwd,rnd(16000,26000)).addScaledVector(side,rnd(-9000,9000));
    c.npc=Ev.npc('derelict',pos,{sp:c.sp,seed:c.seed,name:c.name,ship:c.ship});
    Nav.set({name:c.ship.toUpperCase(),sub:'Distress beacon',kind:'distress',pos,dropR:9000,arriveR:1200,expire:300,onArrive:()=>{ if(Walk.on) this.arrived=true; else this.arrive(); },onCancel:()=>{ Ev.dismiss(c.npc); this.cur=null; Rep.add(-2,'You abandoned the rescue'); }});
    UI.toast('Beacon locked. Press P for autopilot.','good');
  },
  arrive(){
    const c=this.cur; if(!c) return; G.ship.throttle=0;
    if(c.ambush) return this.ambush(c);
    const f=Ev.fuelUnits(SHIPS[G.shipId].fuel*rnd(0.12,0.18));
    Dlg.show({sp:c.sp,seed:c.seed,who:`${c.name} · ${c.ship}`,text:"Oh, thank the stars. Our tank is bone dry. Could you spare some fuel? We will make it worth your while. Probably.",
      opts:[{t:'Transfer fuel',sub:`Gives away ${f} units and takes a minute`,disabled:G.fuel<f+4,fn:()=>{ G.fuel-=f; Ev.hold=6; UI.toast('Fuel line connected. Hold still…'); Sfx.hiss(5,0.18); setTimeout(()=>this.reward(c,f),6000); }},
            {t:"Sorry, I can't spare it",sub:'They will remember',fn:()=>{ Rep.add(-2,'You left them adrift'); Ev.dismiss(c.npc); this.cur=null; }}]});
  },
  reward(c, f){
    if(G.mode!=='flight'){ this.cur=null; return; } const r=Math.random(); let text;
    if(r<0.5){ const cr=Math.round(f*rnd(9,14)/5)*5; G.credits+=cr; Sfx.cash(); text=`Engines are humming! Here's ${fmtCr(cr)} for the trouble. You're a star. Not literally. Stars are hot.`; }
    else if(r<0.8){ let h; do{ h=Math.floor(Math.random()*PLANETS.length); }while(h===G.target&&PLANETS.length>1); G.hot=h; text=`We can't pay much, but here's a secret: ${PLANETS[h].name} is paying a fat bonus on deliveries right now.`; }
    else { const to=Math.floor(Math.random()*PLANETS.length), used=G.cargo.reduce((a,b)=>a+b.qty,0);
      if(used+1<=holdCap()){ G.cargo.push({good:'Thank-You Fruitcake',qty:1,to,pay:Math.round(rnd(220,380)/5)*5,from:-1}); Cockpit.drawManifest(); text=`Please take this fruitcake to ${PLANETS[to].name}. They'll pay you for it. Nobody has ever eaten one.`; }
      else { const cr=150; G.credits+=cr; Sfx.cash(); text=`Here's ${fmtCr(cr)}. We wanted to give you a fruitcake but your hold is full. Lucky you.`; } }
    Dlg.info({sp:c.sp,seed:c.seed,who:`${c.name} · ${c.ship}`,text,then:()=>{ Rep.add(6,'Rescue complete'); Ev.dismiss(c.npc); this.cur=null; }});
  },
  ambush(c){
    Ev.dismiss(c.npc); const fwd=new V3(0,0,-1).applyQuaternion(G.ship.quat);
    c.pirates=[0,1].map(()=>Ev.npc('pirate',G.ship.pos.clone().addScaledVector(fwd,rnd(600,1200)).add(Ev.around(new V3(),rnd(250,600))),{sp:pick(['grondar','zkthar','vrell','blorpax']),name:'Pirate',ship:shipName(Math.floor(Math.random()*1e9))}));
    const toll=Math.round(clamp(G.credits*0.25,120,600)/10)*10, big=G.cargo.filter(x=>x.qty>0&&x.kind!=='escort').sort((a,b)=>b.pay-a.pay)[0];
    const esc=clamp(0.3+G.shipId*0.09+(Game.massLock()?0:0.15),0.2,0.85);
    const end=()=>{ c.pirates.forEach(p=>Ev.dismiss(p)); this.cur=null; };
    Dlg.show({sp:c.pirates[0].pilot.sp,seed:c.pirates[0].pilot.seed,tone:'alert',who:`${c.name} · actually pirates`,text:pick(PIRATE),
      opts:[{t:'Pay the toll',sub:G.credits>=toll?fmtCr(toll):`All you have: ${fmtCr(G.credits)}`,fn:()=>{ G.credits-=Math.min(G.credits,toll); Sfx.cash(); UI.toast('They take the money and leave, laughing.','warn'); end(); }},
            {t:'Hand over some cargo',sub:big?`${big.qty}× ${big.good}`:'Your hold is empty',disabled:!big,fn:()=>{ G.cargo.splice(G.cargo.indexOf(big),1); Cockpit.drawManifest(); Rep.add(-3,'A client lost their cargo'); end(); }},
            {t:'Punch it!',sub:`${Math.round(esc*100)}% chance to get away`,fn:()=>{ G.ship.throttle=10; if(Math.random()<esc){ Hull.hit(rnd(4,9),'You got away with a few scorch marks'); G.fuel=Math.max(0,G.fuel-6); }
              else { Hull.hit(rnd(15,25),'They caught you'); const t=Math.min(G.credits,Math.round(toll*1.5)); G.credits-=t; UI.toast(`They took ${fmtCr(t)} as a lesson`,'warn'); } end(); }}]});
  },
};

/* ---------- asteroid mining ---------- */
const Mining = {
  fields:[], field:null, target:null, heat:0, lock:0, prog:0, hitCD:0, pebT:0, msgT:0, got:0, gotT:0,
  build(){
    const geo=new THREE.IcosahedronGeometry(1,1), pos=geo.attributes.position, v=new V3();
    for(let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i); const k=1+0.22*Math.sin(v.x*5.1+v.y*3.3)+0.16*Math.sin(v.z*6.7-v.x*2.1); v.multiplyScalar(k); pos.setXYZ(i,v.x,v.y*0.82,v.z); }
    geo.computeVertexNormals(); this.m4=new THREE.Matrix4(); this.q=new Q4(); this.sc=new V3();
    FIELDS.forEach((F,fi)=>{
      F.idx=fi; F.pos=new V3(Math.cos(F.ang)*F.orbit,F.y,Math.sin(F.ang)*F.orbit); F.dist=1e12; F.port='Asteroid field · '+F.ore; F.isField=true;
      const rr=mulberry32(900+fi*77), mat=Toon.mat({color:0xffffff}), im=new THREE.InstancedMesh(geo,mat,F.n); im.frustumCulled=false;
      F.rocks=[]; const base=C(F.col);
      for(let i=0;i<F.n;i++){ const u=rr()*2-1, a=rr()*6.283, s=Math.sqrt(1-u*u), d=Math.cbrt(rr())*F.R;
        const p=new V3(s*Math.cos(a)*d,u*d*0.35,s*Math.sin(a)*d), r=30+Math.pow(rr(),2.2)*190;
        const rock={p:p.clone().add(F.pos),local:p,r,r0:r,ore:Math.max(1,Math.round(r/38)),ore0:0,rot:new THREE.Euler(rr()*6,rr()*6,rr()*6),i}; rock.ore0=rock.ore; F.rocks.push(rock);
        im.setColorAt(i,base.clone().multiplyScalar(0.75+rr()*0.5)); }
      F.im=im; const g=new THREE.Group(); g.position.copy(F.pos); g.add(im); World.universe.add(g); F.group=g; Toon.ink.mark(g);
      for(const k of F.rocks) this.place(F,k);
      im.instanceColor.needsUpdate=true;
      const cv=makeCanvas(384,240), tex=canvasTex(cv), sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,sizeAttenuation:false,blending:THREE.AdditiveBlending}));
      sp.scale.set(0.22,0.1375,1); sp.center.set(0.5,1-158/240); sp.renderOrder=20; sp.position.copy(F.pos); World.universe.add(sp); F.mk={cv,tex,sprite:sp,key:''};
    });
    this.fields=FIELDS;
    // the beam: a cone from just under the nose to the rock
    const bg=new THREE.CylinderGeometry(1,0.012,1,10,1,true); bg.translate(0,0.5,0); bg.rotateX(-Math.PI/2); // narrow at the ship (z=0), wide at the rock (z=-1)
    this.beam=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:HDR('#7dffb0',3),transparent:true,opacity:0.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    this.beam.visible=false; this.beam.frustumCulled=false; World.space.add(this.beam);
    this.spark=new THREE.Sprite(new THREE.SpriteMaterial({map:softDotTex(),color:HDR('#b8ffd0',4),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); this.spark.visible=false; World.space.add(this.spark);
    // rock sights
    const cv=makeCanvas(384,240); this.sightTex=canvasTex(cv); this.sightCv=cv; this.sight=new THREE.Sprite(new THREE.SpriteMaterial({map:this.sightTex,transparent:true,depthTest:false,depthWrite:false,sizeAttenuation:false,blending:THREE.AdditiveBlending}));
    this.sight.scale.set(0.26,0.1625,1); this.sight.center.set(0.5,1-158/240); this.sight.renderOrder=22; this.sight.visible=false; World.universe.add(this.sight); this.sightKey='';
  },
  place(F,k){ const s=k.ore>0?k.r:0.0001; this.q.setFromEuler(k.rot); this.sc.set(s,s,s); this.m4.compose(k.local,this.q,this.sc); F.im.setMatrixAt(k.i,this.m4); F.im.instanceMatrix.needsUpdate=true; },
  rate(){ return G.up.laser>1?1.25:0.7; },
  drawSight(k,d){
    const key=k?k.i+':'+k.ore+':'+fmtDist(d):''; if(key===this.sightKey) return; this.sightKey=key; const x=this.sightCv.getContext('2d'); x.clearRect(0,0,384,240); if(!k) return;
    x.strokeStyle='#7dffb0'; x.fillStyle='#7dffb0'; x.lineWidth=4; const cx=192, cy=158, s=34; x.beginPath(); x.arc(cx,cy,s,0,Math.PI*2); x.stroke();
    for(const a of [0,1,2,3]){ const an=a*Math.PI/2; x.beginPath(); x.moveTo(cx+Math.cos(an)*(s-10),cy+Math.sin(an)*(s-10)); x.lineTo(cx+Math.cos(an)*(s+12),cy+Math.sin(an)*(s+12)); x.stroke(); }
    x.textAlign='center'; x.font=`600 46px ${FONT_DISP}`; x.fillText(`ORE ${k.ore}`,cx,cy-s-62); x.font=`40px ${FONT_MONO}`; x.fillText(fmtDist(d),cx,cy-s-16); this.sightTex.needsUpdate=true;
  },
  addOre(F){
    const used=G.cargo.reduce((a,b)=>a+b.qty,0); if(used>=holdCap()) return false;
    let c=G.cargo.find(x=>x.kind==='ore'&&x.good===F.ore); if(!c){ c={kind:'ore',good:F.ore,qty:0,to:-1,pay:0,val:F.val,from:-1}; G.cargo.push(c); }
    c.qty++; c.pay=c.qty*F.val; this.got++; this.gotT=1.2; Cockpit.drawManifest(); return true;
  },
  update(dt){
    const s=G.ship, fire=!!G.keys.KeyF&&G.sys.power&&this.lock<=0&&!Dlg.open&&!Walk.on;
    this.lock=Math.max(0,this.lock-dt); this.hitCD=Math.max(0,this.hitCD-dt); this.msgT=Math.max(0,this.msgT-dt);
    let field=null; for(const F of this.fields){ F.dist=F.pos.distanceTo(s.pos); if(F.dist<F.R*1.4) field=F; F.group.visible=F.dist<400000; }
    if(field!==this.field){ this.field=field; if(field){ UI.toast(`Entering ${field.name}. Aim at a rock and hold ${TouchUI.on?'MINE':'F'} to mine ${field.ore}.`,'good'); if(s.warp) Game.dropWarp('Asteroid field. Warp disengaged.','warn',true); } }
    // dropping out of warp on the way in
    for(const F of this.fields){ if(s.warp&&F.dist<F.R*2.6&&F.pos.clone().sub(s.pos).normalize().dot(new V3(0,0,-1).applyQuaternion(s.quat))>0.2) Game.dropWarp(F.name+'. Warp disengaged.','good',true); }
    // heat
    this.heat=clamp(this.heat+(fire&&this.target?dt*(G.up.laser>1?0.07:0.1):-dt*0.08),0,1);
    if(this.heat>=1){ this.lock=7; this.heat=0.75; Hull.hit(4,'Mining laser overheated'); }
    if(this.gotT>0){ this.gotT-=dt; if(this.gotT<=0&&this.got){ const c=G.cargo.find(x=>x.kind==='ore'); UI.toast(`+${this.got} ${field?field.ore:'ore'} · ${c?c.qty:this.got} in the hold`,'good'); Sfx.cash(); this.got=0; } }
    if(!field){ this.target=null; this.beam.visible=false; this.spark.visible=false; this.sight.visible=false; return; }
    // collisions and pebbles
    const fwd=new V3(0,0,-1).applyQuaternion(s.quat); let best=null, bd=0.1;
    for(const k of field.rocks){ if(k.ore<=0) continue; const to=k.p.clone().sub(s.pos), d=to.length();
      if(d-k.r<7){ s.pos.copy(k.p).addScaledVector(to.normalize().negate(),k.r+7.5); if(this.hitCD<=0){ this.hitCD=1.2; const dmg=clamp(s.speed/28,3,35); if(s.speed>40) Hull.hit(dmg,'Bonk! You hit an asteroid'); s.cruise*=0.15; s.throttle=Math.min(s.throttle,2); } continue; }
      if(d<3000+k.r){ const ang=Math.acos(clamp(to.dot(fwd)/d,-1,1))-Math.atan(k.r/d); if(ang<bd){ bd=ang; best=k; } } }
    this.pebT-=dt; if(this.pebT<=0){ this.pebT=1; if(Math.random()<clamp(s.speed/1400,0,0.4)*0.3) Hull.hit(rnd(1,3),'Pebble strike'); }
    this.target=best; this.sight.visible=!!best&&G.sys.hud; if(best){ this.sight.position.copy(best.p); this.drawSight(best,best.p.distanceTo(s.pos)-best.r); }
    if(G.keys.KeyF&&!best&&this.msgT<=0){ this.msgT=3; UI.toast('No rock in the sights. Point the nose at one within 3,000 km.','warn'); }
    if(G.keys.KeyF&&this.lock>0&&this.msgT<=0){ this.msgT=3; UI.toast('Laser cooling down','warn'); }
    const on=fire&&best; this.beam.visible=!!on; this.spark.visible=!!on;
    if(on){
      const start=new V3(2.4,0.35,-4.2).applyQuaternion(s.quat), end=best.p.clone().sub(s.pos), dir=end.clone().sub(start), len=dir.length()-best.r*0.6;
      this.beam.position.copy(start); this.beam.quaternion.copy(lookQuat(dir.normalize())); this.beam.scale.set(9+Math.sin(Game.time*40)*2.5,9+Math.cos(Game.time*37)*2.5,len);
      this.spark.position.copy(start).addScaledVector(dir,len); this.spark.scale.setScalar(best.r*(0.9+Math.random()*0.5));
      this.prog+=dt*this.rate(); if(Math.floor(Game.time*6)!==Math.floor((Game.time-dt)*6)) Sfx.hiss(0.18,0.06);
      while(this.prog>=1){ this.prog-=1; if(!this.addOre(field)){ if(this.msgT<=0){ this.msgT=3; UI.toast('Hold full. Sell the ore at an assay office.','warn'); } this.prog=0; break; }
        best.ore--; best.r=best.r0*(0.45+0.55*best.ore/best.ore0); this.place(field,best); if(best.ore<=0){ UI.toast('Rock cracked open and emptied','good'); Sfx.thump(0.4); } }
    } else this.prog=Math.max(0,this.prog-dt*0.5);
  },
  marker(F, show){ F.mk.sprite.visible=show&&F.dist>F.R*1.6; if(!F.mk.sprite.visible) return;
    const key=fmtDist(F.dist); if(F.mk.key===key) return; F.mk.key=key; const x=F.mk.cv.getContext('2d'); x.clearRect(0,0,384,240); const cx=192, cy=158;
    x.strokeStyle=x.fillStyle='#b8a4ff'; x.globalAlpha=0.85; x.lineWidth=3; x.beginPath(); x.moveTo(cx,cy-22); x.lineTo(cx+22,cy); x.lineTo(cx,cy+22); x.lineTo(cx-22,cy); x.closePath(); x.stroke();
    x.textAlign='center'; x.font=`600 40px ${FONT_DISP}`; x.fillText(F.name.toUpperCase(),cx,cy-36,376); F.mk.tex.needsUpdate=true; },
  sell(c, P){ const m=this.price(c,P); const cr=Math.round(c.qty*m); G.credits+=cr; G.cargo.splice(G.cargo.indexOf(c),1); return cr; },
  price(c, P){ const r=mulberry32(hashStr(c.good+P.name))(); return c.val*(0.75+r*0.6); },
};

/* ---------- contraband ---------- */
const Customs = {
  armed:false, t:0, cur:null,
  risk(P, mult){ const strict=STRICT[P.species]||0.3; return clamp(strict*0.55*(mult||1)*(G.up.hidden?0.5:1)*(1+Math.max(0,-G.rep)/120),0.03,0.85); },
  illegal(){ return G.cargo.filter(c=>c.illegal); },
  arm(){ this.armed=this.illegal().length>0&&Math.random()<0.7; this.t=rnd(25,60); this.cur=null; },
  caught(items, where){
    let fine=0; items.forEach(c=>{ fine+=Math.round(c.pay*0.4/5)*5; G.cargo.splice(G.cargo.indexOf(c),1); }); const paid=Math.min(G.credits,fine); G.credits-=paid; Cockpit.drawManifest();
    Sfx.deny(); UI.toast(`Contraband confiscated ${where}. Fined ${fmtCr(paid)}.`,'warn'); Rep.add(-10,'Caught smuggling'); if(G.mode==='port') UI.render();
  },
  /* 1. loading, at the port where you take the job */
  load(j, P){
    const r=this.risk(P), bribe=Math.round(j.pay*0.18/10)*10;
    const go=(risk)=>{ if(Math.random()<risk){ const fine=Math.min(G.credits,Math.round(j.pay*0.25/5)*5); G.credits-=fine; G.jobs.splice(G.jobs.indexOf(j),1); Sfx.deny(); Rep.add(-6,'Caught loading contraband');
        Dlg.info({sp:P.species,seed:P.idx*7+1,tone:'alert',who:`${P.port} security`,text:`Well, well. ${j.good}? That's a ${fmtCr(fine)} fine, and the crate stays here.`,then:()=>UI.render()}); return; }
      G.cargo.push({good:j.good,qty:j.qty,to:j.to,pay:j.pay,from:P.idx,illegal:true,fresh:true,story:j.story}); G.jobs.splice(G.jobs.indexOf(j),1); Sfx.clunk(); if(!G.cargo.some(c=>c.to===G.target)) Game.setTarget(j.to,true); Cockpit.drawManifest(); Game.save(); UI.toast('Loaded. Nobody saw a thing. Probably.','good'); UI.render(); };
    Dlg.show({sp:j.sp,seed:j.seed,who:`${alienName(j.sp,j.seed)} · a friend of a friend`,text:`The dock scanner sweeps the bay every few minutes. ${P.port} is ${(STRICT[P.species]||0.3)>0.4?'strict':'fairly relaxed'} about this sort of thing.${G.up.hidden?' Your hidden compartment helps.':''}`,
      opts:[{t:'Load it quietly',sub:`${Math.round(r*100)}% chance of getting caught`,fn:()=>go(r)},
            {t:'Bribe the dockmaster',sub:`${fmtCr(bribe)} · ${Math.round(r*25)}% chance`,disabled:G.credits<bribe,fn:()=>{ G.credits-=bribe; Sfx.cash(); go(r*0.25); }},
            {t:'Walk away',sub:'Leave the job on the board'}]});
  },
  /* 2. the journey: a customs cutter pulls you over */
  update(dt){
    if(!this.armed||this.cur||Dlg.open||Walk.on||!Ev.clearOfPlanets(10)) return;
    if(!this.illegal().length){ this.armed=false; return; }
    this.t-=dt; if(this.t>0) return; this.armed=false; this.stop();
  },
  stop(){
    const s=G.ship, sp=Math.random()<0.6?'zkthar':pick(['beepul','ooloo','momwump']), seed=Math.floor(Math.random()*1e9), fwd=new V3(0,0,-1).applyQuaternion(s.quat);
    if(s.warp) Game.dropWarp('A customs cutter yanks you out of warp','warn',true);
    const n=Ev.npc('customs',s.pos.clone().addScaledVector(fwd,1500).add(Ev.around(new V3(),300)),{sp,seed,name:alienName(sp,seed),ship:'Customs '+shipName(seed)});
    const items=this.illegal(), worth=items.reduce((a,c)=>a+c.pay,0), r=clamp(0.42*(G.up.hidden?0.5:1)*(1+Math.max(0,-G.rep)/120),0.05,0.9), bribe=Math.round(worth*0.22/10)*10, take=clamp(0.75-Math.max(0,G.rep)/300,0.4,0.85);
    const esc=clamp(0.28+G.shipId*0.09+(Game.canWarp()===true?0.15:0),0.15,0.85);
    const done=()=>{ Ev.dismiss(n); this.cur=null; };
    this.cur=n;
    Dlg.show({sp,seed,tone:'alert',who:`Customs cutter · ${n.pilot.name} · ${SPECIES[sp].name}`,text:'Heave to for a routine inspection. It is always routine. Right up until it isn’t.',timeout:25,onTimeout:()=>{ UI.toast('You took too long. They scan you anyway.','warn'); if(Math.random()<r) this.caught(this.illegal(),'by customs'); else UI.toast('Scan clean. They wave you on.','good'); done(); },
      opts:[{t:'Submit to a scan',sub:`${Math.round(r*100)}% chance they find it`,fn:()=>{ if(Math.random()<r) this.caught(this.illegal(),'by customs'); else UI.toast('Scan clean. They wave you on, a little disappointed.','good'); done(); }},
            {t:'Offer a "processing fee"',sub:`${fmtCr(bribe)} · ${Math.round(take*100)}% they take it`,disabled:G.credits<bribe,fn:()=>{ G.credits-=bribe; if(Math.random()<take){ Sfx.cash(); UI.toast('The fee is processed. Nobody saw anything.','good'); } else { Rep.add(-4,'Attempted bribery'); this.caught(this.illegal(),'by customs'); } done(); }},
            {t:'Run for it',sub:`${Math.round(esc*100)}% chance to get away`,fn:()=>{ s.throttle=10; if(Math.random()<esc){ Rep.add(-6,'You fled a customs stop'); } else { Hull.hit(10,'Tractor beam'); this.caught(this.illegal(),'after a chase'); } done(); }}]});
  },
  /* 3. unloading, at the destination port */
  unload(P){
    const items=G.cargo.filter(c=>c.illegal&&c.to===P.idx); if(!items.length) return;
    const pay=items.reduce((a,c)=>a+c.pay,0), r=this.risk(P), bribe=Math.round(pay*0.15/10)*10;
    const go=(risk)=>{ if(Math.random()<risk){ this.caught(items,'at '+P.port); return; } items.forEach(c=>{ UI.tell(Story.ending(c,P)); G.cargo.splice(G.cargo.indexOf(c),1); }); G.credits+=pay; G.stats.earned+=pay; G.stats.deliveries+=items.length; Sfx.cash(); Cockpit.drawManifest(); Game.save(); UI.toast(`Contraband delivered. ${fmtCr(pay)}, no questions asked.`,'good'); UI.render(); };
    Dlg.show({sp:P.species,seed:P.idx*13+5,who:`${P.port} · the unloading crew`,text:`Customs are poking around the bays today. Your special crate${items.length>1?'s are':' is'} still aboard.`,
      opts:[{t:'Unload as normal',sub:`${Math.round(r*100)}% chance of getting caught`,fn:()=>go(r)},
            {t:'Grease the unloading crew',sub:`${fmtCr(bribe)} · ${Math.round(r*25)}% chance`,disabled:G.credits<bribe,fn:()=>{ G.credits-=bribe; go(r*0.25); }}]});
  },
};

/* ---------- escort missions ---------- */
const Escort = {
  npc:null, hazard:null, hT:60, farT:0, warnT:0,
  contract(){ return G.cargo.find(c=>c.kind==='escort'); },
  /* the VIP rides in your passenger cabin; your job is to keep the trip calm */
  spawn(){
    const c=this.contract(); this.npc=null; this.hazard=null; this.hT=rnd(35,60); if(!c) return;
    UI.toast(`${c.vip.title} is aboard, in the passenger cabin. Keep the trip calm.`,'good');
  },
  label(){},
  hurt(d, why){ const c=this.contract(); if(!c) return; c.hp=Math.max(0,c.hp-d); this.label(); UI.toast(`${why}. ${c.vip.title}: ${Math.round(c.hp)}%`,'warn'); Sfx.deny();
    if(c.hp<=0){ G.cargo.splice(G.cargo.indexOf(c),1); Cockpit.drawManifest(); Ev.dismiss(this.npc); this.npc=null; this.hazard=null; Rep.add(-8,`${c.vip.title} has locked themselves in the galley and cancelled the contract`); } },
  heal(d){ const c=this.contract(); if(c){ c.hp=Math.min(100,c.hp+d); this.label(); } },
  update(dt){
    const c=this.contract(); if(!c) return; const s=G.ship;
    // hazards
    const h=this.hazard;
    if(h){ h.t-=dt; Game.escortAlarm=true;
      if(h.kind==='debris'){ const slow=s.throttle<=4&&!s.warp&&s.warpF<0.05; h.ok=slow?h.ok+dt:0; if(h.ok>=8){ this.hazard=null; UI.toast(`${c.vip.title} threads the debris safely. Nice flying.`,'good'); this.heal(3); return; } }
      if(Math.floor(h.t/5)!==Math.floor((h.t+dt)/5)&&h.t>0.5) UI.toast(h.nag(Math.ceil(h.t)),'warn');
      if(h.t<=0){ this.hazard=null; h.fail(); } return; }
    Game.escortAlarm=false;
    if(Dlg.open||!Ev.clearOfPlanets(8)) return;
    this.hT-=dt; if(this.hT>0) return; this.hT=rnd(45,80);
    const k=pick(['pirates','debris','panic']);
    if(k==='pirates'){ const fwd=new V3(0,0,-1).applyQuaternion(s.quat), ps=[0,1].map(()=>Ev.npc('pirate',s.pos.clone().addScaledVector(fwd,rnd(900,1500)).add(Ev.around(new V3(),rnd(300,700))),{sp:pick(['grondar','vrell','blorpax']),name:'Pirate',ship:shipName(Math.floor(Math.random()*1e9))}));
      this.hazard={kind:'pirates',t:20,ps,nag:t=>`Pirates are buzzing your ship and ${c.vip.title} is terrified! Sound the horn (${TouchUI.on?'HORN':'G'}) to scare them off. ${t}s`,fail:()=>{ ps.forEach(p=>Ev.dismiss(p)); this.hurt(30,'The pirates rattled the VIP badly'); }};
      UI.toast(this.hazard.nag(20),'warn'); Sfx.deny(); }
    else if(k==='debris'){ this.hazard={kind:'debris',t:22,ok:0,nag:t=>`Debris ahead! Throttle 4 or lower, no warp, for 8 seconds. ${t}s`,fail:()=>this.hurt(20,`${c.vip.title}'s ship took a beating in the debris`)};
      if(s.warp) Game.dropWarp('Debris ahead! Warp disengaged','warn',true); UI.toast(this.hazard.nag(22),'warn'); }
    else if(Walk.on&&!Dlg.open){ this.hT=8; }
    else this.panic(c);
  },
  onHonk(){ const h=this.hazard; if(!h||h.kind!=='pirates') return; h.ps.forEach(p=>Ev.dismiss(p)); this.hazard=null; Game.escortAlarm=false; this.heal(2); setTimeout(()=>UI.toast('The pirates scatter. Your horn is terrifying.','good'),600); },
  /* talking to the VIP in the cabin settles their nerves a little */
  chat(){ const c=this.contract(); if(!c) return null; if(!this.chatT||Game.time-this.chatT>20){ this.chatT=Game.time; this.heal(4); } return c; },
  panic(c){
    const v=c.vip, tough=['grondar','zkthar'].includes(v.sp), jokey=['blorpax','qeeble','sporrin','momwump'].includes(v.sp);
    const out=(good,why)=>{ if(good){ this.heal(6); UI.toast(why,'good'); } else this.hurt(12,why); };
    Dlg.show({sp:v.sp,seed:v.seed,tone:'alert',onboard:true,who:`${v.title} · ${SPECIES[v.sp].name}`,text:pick(["I can't do this! Space is so big and I am so small! Turn back! Turn back!","Was that a noise? That was a noise. Are we exploding? Tell me if we're exploding.","I have changed my mind about this entire journey and possibly about space."]),
      timeout:20,onTimeout:()=>out(false,`${v.title} panicked with nobody to talk to`),
      opts:[{t:"Breathe. You're safe with me.",fn:()=>out(!tough,tough?`${v.title} finds your tone patronising`:`${v.title} calms down`)},
            {t:'Want to hear a joke?',fn:()=>out(jokey,jokey?`${v.title} laughs so hard they forget to panic`:`${v.title} did not want a joke`)},
            {t:'Pull yourself together!',fn:()=>out(tough,tough?`${v.title} respects that. Composure restored`:`${v.title} bursts into tears`)}]});
  },
  /* on landing: pay out if the VIP is with you */
  land(P){
    const c=this.contract(); if(!c||c.to!==P.idx) return null; G.cargo.splice(G.cargo.indexOf(c),1);
    this.npc=null; this.hazard=null;
    if(c.hp<=0){ Rep.add(-6,`${c.vip.title} refused to get off and demanded to go home. Contract failed`); return null; }
    const pay=Math.round(c.pay*(0.5+0.5*c.hp/100)/5)*5; Rep.add(5,`${c.vip.title} arrived safely`); return {good:`Escort of ${c.vip.title} (${Math.round(c.hp)}%)`,qty:0,pay};
  },
};
