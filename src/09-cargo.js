/* ===================== CARGO HOLD, SCOOP, FLOATING CARGO, RADIO CALLS ===================== */

const holdUsed=()=>G.cargo.reduce((a,b)=>a+(b.qty||0),0);
const fmtTime=s=>{ s=Math.max(0,Math.round(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };

/* ---------- deliveries lose value the longer they take ---------- */
/* each contract gets an expected trip time from the distance; deliver within it for full pay, after that the pay
   slides down to a floor of 30%. Only flight time counts. Faults (a snapped cargo strap, a jammed air scrubber) make it
   slide faster. Passengers work the same way. */
const SEATS=[2,2,3,4,4];
const Cargo = {
  seats(){ return SEATS[Math.min(SHIPS[G.shipId].model,SEATS.length-1)]; },
  pax(){ return G.cargo.filter(c=>c.kind==='pax'||c.kind==='escort'); },
  decays(c){ return c.to>=0&&c.kind!=='ore'&&c.kind!=='escort'&&!c.quest; },
  est(c){ const from=c.from>=0?PLANETS[c.from]:(World.nearest||PLANETS[0]), d=from.pos.distanceTo(PLANETS[c.to].pos); return Math.round(d/SHIPS[G.shipId].warp*2.2+150); },
  stamp(c){ if(!this.decays(c)||c.est!=null) return; c.est=this.est(c); c.el=0; if(c.pay0==null) c.pay0=c.pay; },
  stampAll(){ for(const c of G.cargo) this.stamp(c); },
  factor(c){ if(!this.decays(c)||c.est==null) return 1; const late=Math.max(0,c.el-c.est); return clamp(1-0.5*late/c.est,0.3,1); },
  value(c){ return this.decays(c)&&c.pay0!=null?Math.max(5,Math.round(c.pay0*this.factor(c)*(1-(c.dmg||0))/5)*5):c.pay; },
  left(c){ return c.est==null?Infinity:c.est-c.el; },
  tick(dt){
    for(const c of G.cargo){ this.stamp(c); if(!this.decays(c)) continue; const was=c.el<=c.est; c.el+=dt*Faults.lagMul(c); c.pay=this.value(c);
      if(was&&c.el>c.est&&!c.told){ c.told=1; UI.toast(c.kind==='pax'?`${c.good} is now running late. Their fare is dropping.`:`${c.qty}× ${c.good} is now late. The pay is dropping.`,'warn'); } } },
  label(c){ if(!this.decays(c)||c.est==null) return ''; const l=this.left(c), fr=c.fragile?` · fragile, ${Math.round((1-(c.dmg||0))*100)}% intact`:''; return (l>0?`on time for ${fmtTime(l)} more`:`late, pay down to ${fmtCr(c.pay)} from ${fmtCr(c.pay0)}`)+fr; },
};
/* hold capacity: the ship's hold, plus one unit under the false floor if a hidden compartment is fitted */
const holdCap=()=>SHIPS[G.shipId].hold+(G.up&&G.up.hidden?1:0);
const holdFree=()=>holdCap()-holdUsed();

/* ---------- things floating in space: cargo you dropped, lost property, missing shipments ---------- */
const Flotsam = {
  list:[], beam:null,
  mesh(kind){
    const g=new THREE.Group();
    if(kind==='lost'){ const pod=new THREE.Mesh(new THREE.IcosahedronGeometry(14,1),new THREE.MeshStandardMaterial({color:C('#d8d0ff'),roughness:0.35,metalness:0.5,emissive:C('#6a4cff'),emissiveIntensity:0.35})); g.add(pod); }
    else { const crate=new THREE.Mesh(new THREE.BoxGeometry(24,24,24),new THREE.MeshStandardMaterial({color:C('#b9823f'),roughness:0.8})); g.add(crate);
      for(const a of [0,1,2]){ const band=new THREE.Mesh(new THREE.BoxGeometry(25,25,4),new THREE.MeshStandardMaterial({color:C('#3d4147'),roughness:0.5,metalness:0.6})); band.rotation.set(a===1?Math.PI/2:0,a===2?Math.PI/2:0,0); g.add(band); } }
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:softDotTex(),color:HDR(kind==='lost'?'#b89cff':'#ffb454',3),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); glow.scale.setScalar(140); g.add(glow); g.userData.glow=glow;
    return g; },
  marker(){ const cv=makeCanvas(384,240), tex=canvasTex(cv), sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,sizeAttenuation:false}));
    sp.scale.set(0.24,0.15,1); sp.center.set(0.5,1-158/240); sp.renderOrder=21; World.universe.add(World.hud(sp)); return {cv,tex,sprite:sp,key:''}; },
  /* item: a cargo entry that goes into G.cargo when scooped. opts: {kind:'crate'|'lost', label, vel, quest} */
  spawn(item, pos, opts){ opts=opts||{}; const kind=opts.kind||'crate', m=this.mesh(kind); m.position.copy(pos); World.universe.add(m);
    const f={item,pos:pos.clone(),vel:(opts.vel||new V3()).clone(),m,mk:this.marker(),kind,label:opts.label||item.good,spin:new V3(Math.random(),Math.random(),Math.random()).multiplyScalar(0.4),dist:1e12,id:Math.random().toString(36).slice(2)};
    this.list.push(f); this.save(); return f; },
  remove(f){ World.universe.remove(f.m); World.universe.remove(f.mk.sprite); f.mk.tex.dispose(); f.mk.sprite.material.dispose(); const i=this.list.indexOf(f); if(i>=0) this.list.splice(i,1); if(Nav.wp&&Nav.wp.flot===f) Nav.clear(true); this.save(); },
  save(){ G.flot=this.list.map(f=>({item:f.item,pos:f.pos.toArray().map(v=>Math.round(v)),vel:f.vel.toArray(),kind:f.kind,label:f.label})); },
  restore(arr){ for(const f of this.list.slice()) this.remove(f); for(const d of arr||[]) this.spawn(d.item,new V3().fromArray(d.pos),{kind:d.kind,label:d.label,vel:new V3().fromArray(d.vel||[0,0,0])}); },
  nearest(){ let b=null; for(const f of this.list) if(!b||f.dist<b.dist) b=f; return b; },
  update(dt){
    const s=G.ship, open=Scoop.open&&G.sys.power;
    if(!this.beam){ const bg=new THREE.CylinderGeometry(0.02,1,1,12,1,true); bg.translate(0,0.5,0); bg.rotateX(-Math.PI/2);
      this.beam=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:HDR('#7fd6ff',2.4),transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); this.beam.frustumCulled=false; this.beam.visible=false; World.space.add(this.beam); }
    let pulled=null;
    for(const f of this.list.slice()){
      f.pos.addScaledVector(f.vel,dt); f.vel.multiplyScalar(Math.exp(-dt*0.05)); f.dist=f.pos.distanceTo(s.pos);
      if(open&&f.dist<Scoop.range&&s.speed<=Scoop.maxSpeed){ const to=s.pos.clone().sub(f.pos).normalize(); f.vel.copy(to).multiplyScalar(Math.max(500,s.speed*1.4)); f.vel.addScaledVector(s.vel,1); if(!pulled||f.dist<pulled.dist) pulled=f;
        if(f.dist<90){ if(Scoop.take(f)) continue; f.vel.copy(to).multiplyScalar(-60); } }
      f.m.position.copy(f.pos); f.m.rotation.x+=f.spin.x*dt; f.m.rotation.y+=f.spin.y*dt; f.m.userData.glow.material.opacity=0.55+0.45*Math.sin(Game.time*5+f.pos.x); }
    this.beam.visible=!!pulled; if(pulled){ const d=pulled.pos.clone().sub(s.pos), start=new V3(0,-1.4,-3).applyQuaternion(s.quat), len=d.length(); this.beam.position.copy(start); this.beam.quaternion.copy(lookQuat(d.clone().sub(start).normalize())); this.beam.scale.set(40,40,len); }
  },
  markers(show){ for(const f of this.list){ const vis=show&&(f.quest||f.kind==='lost'||f.dist<400000); f.mk.sprite.visible=vis; f.mk.sprite.position.copy(f.pos); if(!vis) continue;
    const key=f.label+fmtDist(f.dist); if(f.mk.key===key) continue; f.mk.key=key; const x=f.mk.cv.getContext('2d'); x.clearRect(0,0,384,240); const col=f.kind==='lost'?'#c8b4ff':'#ffc060', cx=192, cy=158;
    x.strokeStyle=x.fillStyle=col; x.lineWidth=4; x.beginPath(); x.arc(cx,cy,20,0,Math.PI*2); x.stroke(); x.beginPath(); x.moveTo(cx-30,cy); x.lineTo(cx-22,cy); x.moveTo(cx+22,cy); x.lineTo(cx+30,cy); x.stroke();
    x.textAlign='center'; x.font=`600 40px ${FONT_DISP}`; plateText(x,f.label.toUpperCase(),cx,cy-80,356,col); x.font=`40px ${FONT_MONO}`; plateText(x,fmtDist(f.dist),cx,cy-34,356,col); f.mk.tex.needsUpdate=true; } },
};

/* ---------- the cargo scoop: open it, slow down, and anything nearby gets pulled in ---------- */
const Scoop = {
  open:false, range:2500, maxSpeed:450, warnT:0,
  toggle(force){ const v=force==null?!this.open:force; if(v===this.open) return; this.open=v; $('scoop-badge').hidden=!v; if(Sfx.ok()) Sfx.clunk();
    if(v) UI.toast(`Cargo scoop open. Fly within ${fmtDist(this.range)} of floating cargo below ${this.maxSpeed} km/s.`,'good'); else UI.toast('Cargo scoop closed'); TouchUI.sync&&TouchUI.sync(true); },
  update(dt){ this.warnT=Math.max(0,this.warnT-dt); if(!this.open) return; const s=G.ship;
    if(s.warp){ this.toggle(false); UI.toast('Scoop closed for warp. It prefers not to be inside out.','warn'); return; }
    const n=Flotsam.nearest(); if(n&&n.dist<this.range&&s.speed>this.maxSpeed&&this.warnT<=0){ this.warnT=4; UI.toast(`Too fast to scoop. Slow below ${this.maxSpeed} km/s.`,'warn'); } },
  take(f){
    const it=f.item, need=it.qty||0; if(need>holdFree()){ if(this.warnT<=0){ this.warnT=4; UI.toast(`Hold full. ${f.label} needs ${need} unit${need>1?'s':''} of space.`,'warn'); Sfx.deny(); } return false; }
    Flotsam.remove(f); Sfx.thump(0.35); Sfx.cash();
    const same=it.kind==='ore'&&G.cargo.find(x=>x.kind==='ore'&&x.good===it.good); if(same){ same.qty+=it.qty; same.pay=same.qty*same.val; } else G.cargo.push(it);
    if(it.dropped&&it.to>=0&&!it.illegal){ delete it.dropped; Rep.add(2,"Client's cargo recovered"); } delete it.dropped;
    UI.toast(it.quest?`Scooped: ${f.label}. Return it to ${PLANETS[it.to].name}.`:`Scooped: ${it.qty?it.qty+'× ':''}${it.good}`,'good');
    if(it.quest&&!G.cargo.some(c=>c.to===G.target)) Game.setTarget(it.to,true);
    Cockpit.drawManifest(); Hold.render(); return true; },
};

/* ---------- the hold panel: see what is aboard and drop any of it ---------- */
const Hold = {
  open:false, confirm:null,
  toggle(v){ v=v==null?!this.open:v; this.open=v; $('hold').hidden=!v; this.confirm=null; if(v){ if(SysMap.open) SysMap.close(); this.render(); } if(Sfx.ok()) Sfx.click(); },
  render(){ if(!this.open) return; const d=SHIPS[G.shipId], list=$('hold-list'); list.innerHTML=''; Cargo.stampAll();
    $('hold-cap').textContent=`${holdUsed()} of ${holdCap()} units · ${Cargo.pax().length} of ${Cargo.seats()} seats`;
    if(!G.cargo.length) list.appendChild(el('p','hold-empty','The hold is empty. It echoes slightly.'));
    G.cargo.forEach((c,i)=>{ const row=el('div','hrow'), info=el('div','');
      const what=c.kind==='escort'||c.kind==='pax'?esc(c.good):`${c.qty}× ${esc(c.good)}`, tag=c.illegal?'<span class="tag bad">CONTRABAND</span>':c.quest?'<span class="tag esc">LOST PROPERTY</span>':c.kind==='ore'?'<span class="tag">ORE</span>':c.kind==='pax'?'<span class="tag">PASSENGER</span>':'';
      const dest=c.kind==='escort'?`Escorting to ${PLANETS[c.to].name}`:c.kind==='ore'?'Sell at an assay office':`To ${PLANETS[c.to].name} · pays ${fmtCr(c.pay)}`, lab=Cargo.label(c), late=Cargo.decays(c)&&Cargo.left(c)<=0;
      info.innerHTML=`<b>${what}</b>${tag}<small>${esc(dest)}</small>${lab?`<small class="${late?'late':'due'}">${esc(lab)}</small>`:''}`; row.appendChild(info);
      if(c.kind==='escort'){ row.appendChild(el('span','hnote',`A VIP in your cabin · calm ${Math.round(c.hp)}%`)); }
      else if(c.kind==='pax'&&G.mode!=='port'){ row.appendChild(el('span','hnote','Seated in the cabin. Let them off at a port.')); }
      else { const sure=this.confirm===c, b=el('button','btn'+(sure?' danger':''),sure?(c.kind==='pax'?'Sure? Let them off':'Sure? Drop it'):(c.kind==='pax'?'Let off here':'Drop')); b.onclick=()=>{ if(this.confirm===c) this.drop(c); else { this.confirm=c; this.render(); } }; row.appendChild(b); }
      list.appendChild(row); });
    const fl=G.mode==='flight', n=Flotsam.nearest();
    $('hold-foot').innerHTML=fl?`Scoop: <b>${Scoop.open?'OPEN':'closed'}</b>${n?` · nearest floating cargo ${esc(n.label)}, ${fmtDist(n.dist)}`:''}`:'Dropping cargo here leaves it on the pad.';
    const sb=$('hold-scoop'); sb.hidden=!fl; sb.textContent=Scoop.open?'Close scoop · B':'Open scoop · B'; },
  drop(c){
    const i=G.cargo.indexOf(c); if(i<0) return; G.cargo.splice(i,1); this.confirm=null; const contract=c.to>=0&&!c.illegal&&!c.quest&&c.kind!=='ore';
    if(c.kind==='pax'){ UI.toast(`${c.good} gets off here, muttering. They will find another ride. Probably soup-related.`); Rep.add(-2,'You put a passenger off early'); Cockpit.drawManifest(); this.render(); if(G.mode==='port'){ UI.render(); Game.save(); } return; }
    if(G.mode==='flight'){ const s=G.ship, back=new V3(0,0,1).applyQuaternion(s.quat), down=new V3(0,-1,0).applyQuaternion(s.quat);
      c.dropped=contract; Flotsam.spawn(c,s.pos.clone().addScaledVector(back,220).addScaledVector(down,60),{vel:back.multiplyScalar(40).addScaledVector(s.vel,0.02),label:c.quest?c.good:`${c.qty}× ${c.good}`,kind:c.quest?'lost':'crate'});
      Sfx.hiss(0.6,0.12); UI.toast(`Dropped ${c.quest?c.good:c.qty+'× '+c.good}. It floats off, looking betrayed.`); }
    else UI.toast(`Left ${c.quest?c.good:c.qty+'× '+c.good} on the pad. Someone will find a use for it. Probably soup.`);
    if(contract) Rep.add(-2,"You dropped a client's cargo");
    Cockpit.drawManifest(); this.render(); if(G.mode==='port'){ UI.render(); Game.save(); } },
};

/* ---------- lost property: real objects floating near a planet, worth returning ---------- */
const LOST_ITEMS = {
  blorpax:['a soup lid','a ladle of sentimental value','a spare wobble'], zkthar:['a rubber stamp (official)','the original of Form 9','a laminated permit'], momwump:['a favourite blanket','a hug-shaped cushion','a pom-pom named Gerald'],
  vrell:['a tentacle warmer','a book of unfinished poems','an opinion'], grondar:['a pet pebble','a smaller rock','their good gravel'], qeeble:['a whistle','a shiny button','the other shiny button'],
  ooloo:['one of us','our spare thought','a collective sock'], sporrin:['a spore jar','a nap timetable','the good compost'], beepul:['a spare personality chip','a sense of humour module','a remote control for something'],
};
const Lost = {
  start(ctx, item, reward, home){
    const P=ctx.P, dir=new V3(Math.random()-0.5,(Math.random()-0.5)*0.4,Math.random()-0.5).normalize(), pos=P.pos.clone().addScaledVector(dir,P.r*3.2+1800);
    const nm=item.replace(/^(a|an|the) /i,''), cargo={good:nm.charAt(0).toUpperCase()+nm.slice(1),qty:1,to:home,pay:reward,from:-1,quest:true,owner:ctx.name};
    const f=Flotsam.spawn(cargo,pos,{kind:'lost',label:cargo.good});
    if(!Nav.wp){ Nav.set({name:cargo.good.toUpperCase(),sub:'Lost property',kind:'lost',pos:pos.clone(),dropR:P.dropR+4000,arriveR:0,flot:f}); }
    UI.toast(`Marked: ${cargo.good}, floating near ${P.name}. Open the scoop (${TouchUI.on?'Scoop':'B'}) when you get close.`,'good'); },
};

/* ---------- radio calls: most chatter now asks you something, and the answer matters ---------- */
const Fx = {
  cr(n, why){ n=Math.round(n); if(n<0&&G.credits<-n) n=-G.credits; G.credits+=n; if(n>0) Sfx.cash(); UI.toast(`${why?why+' · ':''}${n>=0?'+':''}${fmtCr(n)}`,n>=0?'good':'warn'); if(G.mode==='port') UI.stats(); },
  rep(n, why){ Rep.add(n,why); },
  fuel(n, why){ const d=SHIPS[G.shipId]; G.fuel=clamp(G.fuel+n,0,d.fuel); UI.toast(`${why?why+' · ':''}Fuel ${n>0?'+':''}${Math.round(n)}`,n>0?'good':'warn'); },
  hull(n, why){ if(n<0) Hull.hit(-n,why); else { G.hull=Math.min(100,G.hull+n); UI.toast(`${why}. Hull ${Math.round(G.hull)}%`,'good'); } },
  tip(P, why){ G.hot=P.idx; UI.toast(`${why||'Tip logged'}: ${P.name} deliveries pay +50%`,'good'); },
  give(c, why){ if(c.kind==='pax'&&Cargo.pax().length>=Cargo.seats()){ UI.toast('No free seats in the cabin. They say they will wait for the next ship, pointedly.','warn'); return false; }
    if(holdFree()<c.qty){ UI.toast("No room in the hold. They seem relieved, somehow.",'warn'); return false; } G.cargo.push(c); Cockpit.drawManifest(); UI.toast(`${why||'Loaded'}: ${c.kind==='pax'?c.good:c.qty+'× '+c.good} → ${PLANETS[c.to].name} · ${fmtCr(c.pay)}`,'good'); if(!G.cargo.some(x=>x.to===G.target)) Game.setTarget(c.to,true); return true; },
};
const other=()=>{ let P; do{ P=pick(PLANETS); }while(World.nearest&&P===World.nearest&&PLANETS.length>1); return P; };
const r5=v=>Math.round(v/5)*5;

/* each call: ch = channels it plays on (0 open band, 1 trade net, 2 port control, 3 Radio Glorp), who = 'pilot'|'port'|'trade'|'dj', optional sp and ok(), text(ctx), opts(ctx) */
const CALLS = [
  { ch:[0], who:'pilot', text:c=>`This is the ${c.ship}. Has anyone seen ${c.item}? I lost it somewhere near ${c.P.name}. It is irreplaceable. Also replaceable, but I would rather not.`,
    pre:c=>{ c.item=pick(LOST_ITEMS[c.sp]); c.reward=r5(rnd(260,520)); c.home=PLANETS.findIndex(P=>P.species===c.sp); if(c.home<0) c.home=other().idx; },
    opts:c=>[{t:"I'll look for it",sub:`Pays ${fmtCr(c.reward)} on return to ${PLANETS[c.home].name}`,fn:()=>{ Lost.start(c,c.item,c.reward,c.home); Calls.reply(c,'Really? You are a credit to your species. Whichever one that is.'); }},
             {t:'Wish them luck',sub:'Costs nothing. Occasionally counts.',fn:()=>{ Calls.reply(c,'Luck received. I will put it with my other luck. Which I have also lost.'); if(Math.random()<0.5) Fx.rep(1,'Kind words'); }},
             {t:'Suggest they look where they left it',sub:'Helpful, technically',fn:()=>{ Calls.reply(c,'That is where I looked first. It was not there. It never is.'); Fx.rep(-1,'Unhelpful helpfulness'); }}] },
  { ch:[1], who:'trade', text:c=>`Trade Net: a shipment of ${c.good} has gone missing near ${c.P.name}. A finder's fee is offered. A finder's sense of achievement is not included.`,
    pre:c=>{ c.reward=r5(rnd(300,560)); c.home=other().idx; },
    opts:c=>[{t:'Mark it on my nav',sub:`${fmtCr(c.reward)} delivered to ${PLANETS[c.home].name}`,fn:()=>{ Lost.start(c,'a crate of '+c.good,c.reward,c.home); }},
             {t:'Ask if it is dangerous',sub:'It is good to know',fn:()=>{ Calls.reply(c,'Trade Net cannot comment on whether the crate is dangerous. The crate has also declined to comment.'); }},
             {t:'Ignore it',fn:()=>{}}] },
  { ch:[0], who:'pilot', sp:'zkthar', text:c=>`Attention, vessel. This lane now requires a Form 9 Transit Waiver. The fee is ${fmtCr(c.fee)}. Non-payment will result in further forms.`, pre:c=>{ c.fee=r5(rnd(30,60)); },
    opts:c=>[{t:'Pay the fee',sub:`${fmtCr(c.fee)} · they like that`,fn:()=>{ Fx.cr(-c.fee,'Form 9 filed'); Fx.rep(2,'Paperwork in order'); Calls.reply(c,'Payment received, stamped, and admired. You may continue existing in this lane.'); }},
             {t:'Ask what happens if you do not',fn:()=>{ Calls.reply(c,'Then nothing happens. But it happens to you, officially.'); if(Math.random()<0.5) Fx.rep(-1,'Logged as uncooperative'); }},
             {t:'Pretend the radio is broken',sub:'50/50',fn:()=>{ if(Math.random()<0.5){ Calls.reply(c,'Hello? Hello? Very well. I will file a report about your radio.'); } else { Calls.reply(c,'Your radio was observed working. That is a second offence.'); Fx.cr(-c.fee*2,'Fine for pretending'); } }}] },
  { ch:[0], who:'pilot', sp:'qeeble', text:c=>`Race you to ${c.P.name}! Loser pays the winner ${fmtCr(c.stake)}! Go! No, wait. Go!`, pre:c=>{ c.stake=r5(rnd(80,160)); c.P=other(); }, ok:()=>!G.bet,
    opts:c=>[{t:"You're on",sub:`Land at ${c.P.name} within ${Math.round(Calls.raceTime(c.P)/60)} min`,fn:()=>{ G.bet={to:c.P.idx,until:G.playTime+Calls.raceTime(c.P),stake:c.stake,who:c.name}; Game.setTarget(c.P.idx,true); Calls.reply(c,'Hee! Already winning! I think! Which way is it?'); }},
             {t:'Decline with dignity',fn:()=>{ Calls.reply(c,'Dignity! Ha! I had some once. I traded it for a button.'); }}] },
  { ch:[0], who:'pilot', sp:'vrell', text:c=>`I have written a poem about your ship. Would you like to hear it, or would you like to pay me not to read it?`,
    opts:c=>[{t:'Read it',sub:'Bravely',fn:()=>{ Calls.reply(c,pick(["O freighter. You are mostly beige. Your engines cough like a tired page. The end. There is no more. I could not bear it.","Thy hull is dented, thy paint is sad. Thy pilot, I assume, is glad. Is that right? It does not scan."])); Fx.rep(2,'You listened to the whole poem'); }},
             {t:'Pay them not to',sub:'20 cr',fn:()=>{ Fx.cr(-20,'Silence purchased'); Calls.reply(c,'Very well. The poem will now haunt only me.'); }},
             {t:'Offer constructive criticism',fn:()=>{ Calls.reply(c,'Constructive. CONSTRUCTIVE. I will be in my shell.'); Fx.rep(-2,'Vrell are sensitive about meter'); }}] },
  { ch:[0], who:'pilot', sp:'sporrin', text:c=>`We have more fuel than sense. Would anyone like some fuel? We would like some sense.`,
    opts:c=>[{t:'Buy 25 fuel',sub:'60 cr',disabled:()=>G.credits<60,fn:()=>{ Fx.cr(-60,'Fuel bought'); Fx.fuel(25,'Mid-lane top-up'); Calls.reply(c,'Pumping now. Please ignore the mushrooms in the line. They are friendly.'); }},
             {t:'Give them some sense',sub:'Advice is free',fn:()=>{ const P=other(); Calls.reply(c,`Oh! That was very sensible. In return: ${P.name} is paying extra this week. We heard it from a spore.`); Fx.tip(P,'Spore-borne tip'); }},
             {t:'No thanks',fn:()=>{}}] },
  { ch:[2], who:'port', text:c=>`${c.port} Control: we are conducting a survey. How would you rate your flight today, on a scale of one to four?`, ok:c=>!!c.near,
    opts:c=>[{t:'One',fn:()=>{ Calls.reply(c,'One. We see. We will pass that on to the flight. It will be very upset.'); Fx.rep(-1,'Control is hurt'); }},
             {t:'Two',fn:()=>{ Calls.reply(c,'Two. Honest. Refreshing. Disappointing.'); }},
             {t:'Three',fn:()=>{ Calls.reply(c,'Three! Wonderful. That is our highest ever score.'); Fx.rep(1,'Control is delighted'); }},
             {t:'Four',fn:()=>{ Calls.reply(c,'Four. Suspicious, but flattering. Have a fuel voucher.'); Fx.fuel(10,'Flattery voucher'); }}] },
  { ch:[2], who:'port', text:c=>`${c.port} Control: we need someone to carry a sack of urgent mail to ${c.P.name}. It is not urgent. It is just heavy.`, pre:c=>{ c.P=other(); c.pay=r5(rnd(140,240)); }, ok:c=>!!c.near,
    opts:c=>[{t:'Take the mail',sub:`1 unit · ${fmtCr(c.pay)}`,fn:()=>{ if(Fx.give({good:'Sack of Mostly Urgent Mail',qty:1,to:c.P.idx,pay:c.pay,from:-1},'Mail aboard')) Calls.reply(c,'Thank you. Some of it is birthday cards. Most of it is complaints about birthday cards.'); }},
             {t:'Decline',fn:()=>{ Calls.reply(c,'Understood. The mail will wait. It is very good at waiting.'); }}] },
  { ch:[1], who:'trade', text:c=>`Trade Net: ${c.P.name} reports a shortage of ${c.good}. Prices are expected to do something. Analysts are not sure what.`, pre:c=>{ c.P=other(); },
    opts:c=>[{t:'Buy the rumour',sub:'25 cr · deliveries there pay +50%',disabled:()=>G.credits<25,fn:()=>{ Fx.cr(-25,'Rumour purchased'); Fx.tip(c.P,'Rumour confirmed, probably'); }},
             {t:'Ignore it',fn:()=>{}}] },
  { ch:[1], who:'trade', text:c=>`Trade Net: hauler wanted urgently for the ${c.P.name} run. Two units of ${c.good}. First to reply gets it.`, pre:c=>{ c.P=other(); c.pay=r5(rnd(320,480)); },
    opts:c=>[{t:'Reply first',sub:`2 units · ${fmtCr(c.pay)}`,fn:()=>{ Fx.give({good:c.good,qty:2,to:c.P.idx,pay:c.pay,from:-1},'Contract won'); }},
             {t:'Reply second',sub:'On purpose',fn:()=>{ Calls.reply(c,'Trade Net: the job has gone to a faster hauler. They would like you to know they are faster.'); }}] },
  { ch:[3], who:'dj', text:c=>`Radio Glorp phone-in! Name this song: it goes "woooOOOoo". First right answer wins ${fmtCr(c.prize)}!`, pre:c=>{ c.prize=r5(rnd(80,140)); c.right=Math.floor(Math.random()*3); },
    opts:c=>['My Heart Is a Decaying Orbit','Forty Minutes of Whale','Woooo (Remix)'].map((t,i)=>({t:`"${t}"`,fn:()=>{ if(i===c.right){ Calls.reply(c,'CORRECT! Nobody has ever got that right! Not even me!'); Fx.cr(c.prize,'Radio Glorp prize'); } else Calls.reply(c,'Wrong, but enthusiastically wrong. We respect that.'); }})).concat([{t:'Hang up',fn:()=>{}}]) },
  { ch:[3], who:'dj', text:c=>`Requests line is open. What shall we play for the hauler in the slightly rusty ship?`,
    opts:c=>[{t:'Something calming',sub:'Cabin music on',fn:()=>{ G.sys.music=0.45; Sfx.setMusicVol(G.sys.music); Calls.reply(c,'Coming up: three hours of a nebula breathing. Relax.'); }},
             {t:'Silence, please',sub:'Cabin music off',fn:()=>{ G.sys.music=0; Sfx.setMusicVol(0); Calls.reply(c,'One silence, coming up. It is a classic.'); }},
             {t:'A shout-out',sub:'Fame, of a sort',fn:()=>{ Calls.reply(c,'This one goes out to the rusty one. Wash your ship. We love you.'); Fx.rep(1,'Briefly famous'); }}] },
  { ch:[0], who:'pilot', sp:'grondar', text:c=>`Your ship is very small. My ship is a rock. Do you want to bump? It is how Grondar say hello.`,
    opts:c=>[{t:'Bump',sub:'Respect, at a price',fn:()=>{ Fx.hull(-5,'Bonk. Hello'); Fx.rep(3,'Grondar respect you now'); Calls.reply(c,'HELLO. Good bump. Strong little ship.'); }},
             {t:'Honk instead',fn:()=>{ Game.honk(); }},
             {t:'Decline politely',fn:()=>{ Calls.reply(c,'Polite. Like a pebble. Fine.'); }}] },
  { ch:[0], who:'pilot', sp:'ooloo', text:c=>`We foresee that your next delivery will be late. Or early. Or on time. We are rarely wrong.`,
    opts:c=>[{t:'Ask for a better prophecy',sub:'30 cr',disabled:()=>G.credits<30,fn:()=>{ const P=other(); Fx.cr(-30,'Prophecy fee'); Calls.reply(c,`We see... ${P.name}. We see money there. We also see a hat. Ignore the hat.`); Fx.tip(P,'Prophecy'); }},
             {t:'Thank them',fn:()=>{ Calls.reply(c,'You are welcome. We foresaw that too.'); if(Math.random()<0.6) Fx.rep(1,'Gratitude noted by many'); }}] },
  { ch:[0], who:'pilot', sp:'momwump', text:c=>`Sending a long-distance hug to everyone on this band! Please accept or decline your hug.`,
    opts:c=>[{t:'Accept the hug',sub:'Somehow good for you',fn:()=>{ Calls.reply(c,'Hug delivered! Squeeeeze!'); Fx.hull(3,'Morale repairs, inexplicably'); }},
             {t:'Decline the hug',fn:()=>{ Calls.reply(c,'Oh. That is fine. That is completely fine.'); Fx.rep(-1,'A Momwump is sad, briefly'); }}] },
  { ch:[0], who:'pilot', sp:'beepul', text:c=>`SYSTEM UPDATE AVAILABLE FOR YOUR SHIP. INSTALL NOW? YES. NO. MAYBE. WHAT.`,
    opts:c=>[{t:'Yes',sub:'Probably fine',fn:()=>{ if(Math.random()<0.6){ Fx.fuel(12,'Efficiency patch installed'); Calls.reply(c,'UPDATE COMPLETE. YOUR SHIP IS NOW 4% MORE EFFICIENT AND 2% MORE SMUG.'); } else { Fx.hull(-4,'Patch notes: oops'); Calls.reply(c,'UPDATE COMPLETE. SOME PARTS ARE NOW IN DIFFERENT PLACES.'); } }},
             {t:'No',fn:()=>{ Calls.reply(c,'UPDATE DEFERRED. I WILL ASK AGAIN. FOREVER.'); }},
             {t:'Maybe',fn:()=>{ Calls.reply(c,'MAYBE INSTALLED. YOUR SHIP MAY NOW BE DIFFERENT.'); if(Math.random()<0.5) Fx.cr(15,'Maybe refund'); }},
             {t:'What',fn:()=>{ Calls.reply(c,'WHAT IS AN EXCELLENT QUESTION. I DO NOT KNOW EITHER.'); }}] },
  { ch:[0], who:'pilot', text:c=>`Our coffee machine has exploded. This is not a mayday. It is more of a may-I. May I have some sympathy?`,
    opts:c=>[{t:'Send 30 cr for a new one',fn:()=>{ Fx.cr(-30,'Coffee fund'); Fx.rep(3,'Generous with coffee'); Calls.reply(c,'You beautiful stranger. We will name the next one after you.'); }},
             {t:'Send sympathy',sub:'Free',fn:()=>{ Calls.reply(c,'Sympathy received. It does not make coffee, but it is warm.'); if(Math.random()<0.5) Fx.rep(1,'Sympathy noted'); }},
             {t:'Ignore them',fn:()=>{}}] },
  { ch:[0], who:'pilot', sp:'zkthar', text:c=>`Would you like towing insurance? It covers everything except things that happen. And towing. No, it covers towing.`, ok:()=>!G.up.tow,
    opts:c=>[{t:'Buy it',sub:'90 cr · your next tow is free',disabled:()=>G.credits<90,fn:()=>{ Fx.cr(-90,'Towing insurance'); G.up.tow=1; Calls.reply(c,'Policy issued. Please do not read it.'); }},
             {t:'Ask what it does not cover',fn:()=>{ Calls.reply(c,'Acts of gods, acts of soup, and anything that occurs.'); }},
             {t:'No',fn:()=>{}}] },
  { ch:[0], who:'pilot', text:c=>`This is a perfectly normal ship. Please drop some cargo for a perfectly normal inspection. We will look at it from very far away.`, ok:()=>G.cargo.some(x=>x.qty>0&&x.kind!=='escort'),
    opts:c=>[{t:'Drop your cheapest crate',fn:()=>{ const x=G.cargo.filter(y=>y.qty>0&&y.kind!=='escort').sort((a,b)=>a.pay-b.pay)[0]; Hold.drop(x); Calls.reply(c,'Inspection complete. It was very normal. Goodbye forever.'); }},
             {t:'Refuse',sub:'They might be bluffing',fn:()=>{ if(Math.random()<0.6) Calls.reply(c,'Fine. We were bluffing. We do not even have a gun. It is a hairdryer.'); else { Fx.hull(-8,'Warning shot. It was not a hairdryer'); } }},
             {t:'Honk aggressively',fn:()=>{ Game.honk(); if(Math.random()<0.6) Calls.reply(c,'Aaah! A horn! Leaving! Leaving!'); else Fx.hull(-5,'They did not like the horn'); }}] },
  { ch:[0], who:'pilot', text:c=>`Excuse me. I am hitchhiking to ${c.P.name}. I can pay in money, or in a long story about my cousin. Mostly money.`, pre:c=>{ c.P=other(); c.pay=r5(rnd(150,260)); },
    opts:c=>[{t:'Pick them up',sub:`A cabin seat · ${fmtCr(c.pay)}`,fn:()=>{ if(Fx.give({kind:'pax',good:`${c.name} (hitchhiker)`,sp:c.sp,seed:c.seed,qty:0,to:c.P.idx,pay:c.pay,from:-1},'Passenger aboard')) Calls.reply(c,'Thank you. I will sit in the back. So. My cousin.'); }},
             {t:'Ask about the cousin',fn:()=>{ Calls.reply(c,'Well, my cousin once ate a moon. A small one. Nobody was using it. That is the whole story.'); }},
             {t:'No passengers',fn:()=>{ Calls.reply(c,'Understood. I will continue standing in space. It is fine.'); }}] },
  { ch:[2], who:'port', text:c=>`This is an automated call about your ship's extended warranty. Press one to speak to an agent.`, ok:c=>!!c.near,
    opts:c=>[{t:'Speak to an agent',fn:()=>{ Calls.reply(c,'All of our agents are currently existing. Please hold. Forever.'); }},
             {t:'Buy the warranty',sub:'120 cr · your next tow is free',disabled:()=>G.credits<120||G.up.tow,fn:()=>{ Fx.cr(-120,'Warranty bought'); G.up.tow=1; }},
             {t:'Scream',fn:()=>{ Sfx.wah(); Calls.reply(c,'Your scream is important to us.'); }},
             {t:'Hang up',fn:()=>{}}] },
];

const Calls = {
  raceTime(P){ const d=P.pos.distanceTo(G.ship.pos), w=SHIPS[G.shipId].warp; return clamp(d/w*1.8+90,120,600); },
  ctx(call){
    const ch=G.sys.channel, near=World.nearest&&World.nearest.dist<World.nearest.r*60?World.nearest:null, c={P:other(),near,good:pick(GOODS)[0]};
    if(call.who==='port'){ const N=near||PLANETS[0]; c.sp=N.species; c.seed=N.idx*7+1; c.name=N.port+' Control'; c.port=N.port; c.whoLine=`${N.port} Control`; }
    else if(call.who==='trade'){ c.sp=pick(['qeeble','zkthar','beepul']); c.seed=4242; c.name='Trade Net'; c.whoLine='Trade Net · bulletin'; }
    else if(call.who==='dj'){ c.sp='blorpax'; c.seed=808; c.name='DJ Glorp'; c.whoLine='Radio Glorp · phone-in'; }
    else { const cands=Npc.list.filter(n=>n.dist<40000&&(!call.sp||n.pilot.sp===call.sp)); const pl=cands.length&&Math.random()<0.7?pick(cands).pilot:null;
      c.sp=call.sp||(pl?pl.sp:pick(ALIEN_POOL)); c.seed=pl?pl.seed:Math.floor(Math.random()*1e9); c.name=pl?pl.name:alienName(c.sp,c.seed); c.ship=pl?pl.ship:shipName(c.seed); c.whoLine=`${c.name} · ${SPECIES[c.sp].name} · ${c.ship}`; }
    return c; },
  /* place a call; returns false if none fits right now */
  ring(){
    if(Walk.on||Dlg.open||Comms.open||Distress.cur||Customs.cur||Escort.hazard||Hold.open||SysMap.open) return false;
    const ch=G.sys.channel, fits=CALLS.filter(k=>k.ch.includes(ch)); if(!fits.length) return false;
    for(let tries=0;tries<8;tries++){ const call=pick(fits), c=this.ctx(call); if(call.pre) call.pre(c); if(call.ok&&!call.ok(c)) continue; if(call===this.lastCall) continue; this.lastCall=call;
      const text=call.text(c), opts=call.opts(c).map(o=>({t:o.t,sub:o.sub,disabled:o.disabled?o.disabled():false,fn:o.fn}));
      const alien=alienWords(c.sp,text,Math.floor(Math.random()*1e6)); Radio.cur={sp:c.sp,seed:c.seed,name:c.name,english:text,alien,t:0,dur:clamp(text.length*0.058,2.4,7.5)};
      Dlg.show({sp:c.sp,seed:c.seed,tone:'radio',mini:true,who:c.whoLine,text,timeout:24,opts,onTimeout:()=>{}}); return true; }
    return false; },
  reply(c, text){ setTimeout(()=>{ if(G.mode==='flight'||G.mode==='port') Radio.play({sp:c.sp,seed:c.seed,name:c.name,english:text}); },350); },
  /* races: check on landing, and give up when time runs out */
  landed(P){ const b=G.bet; if(!b) return; G.bet=null; if(P.idx===b.to&&G.playTime<=b.until) setTimeout(()=>Fx.cr(b.stake,`You beat ${b.who} to ${P.name}`),1200); else if(P.idx===b.to) setTimeout(()=>Fx.cr(-b.stake,`${b.who} got there first`),1200); else G.bet=b; },
  update(){ const b=G.bet; if(b&&G.playTime>b.until){ G.bet=null; Fx.cr(-b.stake,`${b.who} won the race to ${PLANETS[b.to].name}`); } },
};

/* ---------- ship specs: one list of categories, used everywhere a ship's specs are shown ---------- */
const Specs = {
  open:false,
  reliability(f){ return f>=0.9?'Breaks down often':f>=0.6?'Fair':f>=0.35?'Good':f>=0.2?'Very good':'Rarely breaks down'; },
  handling(t){ return t<0.85?'Sluggish':t<0.95?'Steady':t<1.05?'Nimble':'Agile'; },
  /* the same categories, in the same order, for every ship */
  rows(i){ const s=SHIPS[i]; return [
    ['Cargo hold',`${s.hold} units`],
    ['Passenger seats',`${SEATS[Math.min(s.model,SEATS.length-1)]}`],
    ['Cruise speed',`${fmtNum(s.cruise)} km/s`],
    ['Warp speed',`${(s.warp/LS).toFixed(2)}c`],
    ['Fuel tank',`${s.fuel} units`],
    ['Handling',`${this.handling(s.turn)} (${s.turn.toFixed(1)})`],
    ['Reliability',this.reliability(s.faults==null?1:s.faults)],
    ['Price new',s.price?fmtCr(s.price):'Free with the job'] ]; },
  /* the short form for shop cards: the same names, minus the price */
  line(i){ return this.rows(i).slice(0,7).map(([k,v])=>`${k} <i>${esc(v)}</i>`).join(' · '); },
  show(i){ i=i==null?G.shipId:i; const s=SHIPS[i], mine=i===G.shipId, box=$('specs-body'); this.open=true; $('specs').hidden=false; if(Sfx.ok()) Sfx.click();
    $('specs-name').textContent=s.name; $('specs-tag').textContent=s.tag;
    const dl=(title,rows)=>`<h3>${title}</h3><dl class="spec">${rows.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
    let html=dl('Specs',this.rows(i));
    if(mine){ const up=[]; if(G.up.hidden) up.push('Hidden compartment (+1 hold)'); if(G.up.laser>1) up.push('Mining laser Mk II'); if(G.up.tow) up.push('Towing insurance');
      html+=dl('Your ship now',[['Paint',G.paint?G.paint.name:'Factory finish'],['Hull',`${Math.round(G.hull)}%`],['Fuel',`${Math.round(G.fuel)} of ${s.fuel} units`],['Cargo aboard',`${holdUsed()} of ${holdCap()} units`],['Passengers aboard',`${Cargo.pax().length} of ${Cargo.seats()}`],['Upgrades',up.length?up.join(', '):'None'],['Trade-in value',fmtCr(Math.round(s.price/2))]]); }
    box.innerHTML=html; },
  close(){ if(!this.open) return; this.open=false; $('specs').hidden=true; if(Sfx.ok()) Sfx.click(); },
  /* what a yard pays for your ship: half its price new, less what the hull damage would cost to fix */
  value(){ const s=SHIPS[G.shipId]; return Math.max(0,Math.round((s.price/2-(100-G.hull)*5)/5)*5); },
  /* does what is aboard fit in ship i? (fittings move across with you) */
  fits(i){ const s=SHIPS[i]; return holdUsed()<=s.hold+(G.up.hidden?1:0)&&Cargo.pax().length<=SEATS[Math.min(s.model,SEATS.length-1)]; },
  /* swap to ship i: a fresh ship, so the old one's damage, faults, grime, heat and paint stay with the old one */
  change(i, P){ const s=SHIPS[i]; Walk.exit(true); G.shipId=i; G.fuel=s.fuel; G.paint=null; G.hull=100; G.faults=[]; G.fixed=[];   // a different hull has no faults and no repair history
    G.sys.dirt=0; Throttle.heat=0; Throttle.hotTold=false;
    Cine.setPreview(null); Cine.setModel(i); Cine.dock(P); Cockpit.build(s); Interior.shipId=-1; Faults.badge(); Game.genJobs(P.idx); Game.save(); },
};
