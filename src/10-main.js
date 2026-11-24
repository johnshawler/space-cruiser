/* ===================== GAME ===================== */
const G = {
  mode:'boot', credits:250, shipId:0, cargo:[], jobs:[], fuel:100, target:2, hot:null, docked:-1, playTime:0, stats:{deliveries:0,earned:0}, rep:0, hull:100, up:{hidden:false,laser:1}, paint:null, keys:{},
  ship:{pos:new V3(), quat:new Q4(), vel:new V3(), speed:0, cruise:0, throttle:0, warp:false, warpF:0, angVel:new V3(), ctl:new V3(), temp:0.25, departed:-1},
  sys:{power:true,autopilot:false,hud:true,invert:false,wipers:false,translator:true,radioVol:0.7,channel:0,cabin:0.45,instr:0.8,visor:0,music:0.45,radarRange:1,mfdPage:0,dirt:0.12},
  head:{yaw:0,pitch:-0.12,yawT:0,pitchT:-0.12,basePitch:-0.12,pos:new V3(),posT:new V3(),fov:72,fovT:72,zoomed:null,zoomPt:null},
};
window.G = G;

const Game = {
  clock:new THREE.Clock(), time:0, flash:0, fade:0, fadeCol:new THREE.Color(0,0,0), towFee:0, towing:false, hintT:0, hintI:99, mk:0,
  HINTS:[[2.5,'Steer with W A S D until the amber marker is dead ahead'],[11,'Throttle 1 to 0. Press Z for warp once the nav screen says aligned'],[24,'Double-click any panel to lean in, and again to lean back. Every control works'],[38,'H hails the nearest pilot. The translator is on the glare shield'],[52,'Fly at a planet and the port lands you automatically'],[66,'M opens the system map. Click a world there to set your destination'],[84,'Asteroid fields are on the map. Hold F with a rock in your sights to mine ore']],
  THINTS:[[2.5,'Steer with the stick on the left until the amber marker is dead ahead'],[11,'Slide the throttle on the right. Tap WARP once the nav screen says aligned'],[24,'Double-tap any panel to lean in, and double-tap open space to lean back. Every control works'],[38,'HAIL calls the nearest pilot. What they say shows at the top of the screen'],[52,'Fly at a planet and the port lands you automatically'],[66,'MAP opens the system map. Tap a world there to set your destination'],[84,'Asteroid fields are on the map. Hold MINE with a rock in your sights to mine ore']],

  /* the player's paint job (from a paint shop) on top of the ship's factory finish */
  scheme(){ const b=Models.SCHEMES[Math.min(SHIPS[G.shipId].model,4)]; return G.paint?{hull:G.paint.hull,trim:G.paint.trim,glow:b.glow,wear:Math.min(b.wear,0.2)}:null; },
  cruiseSpeed(n){ return SHIPS[G.shipId].cruise*Math.pow(n/10,1.5)*Faults.speedMul(); },
  setThrottle(n){ n=clamp(Math.round(n),0,10); if(!G.sys.power||G.mode!=='flight') return; if(n!==G.ship.throttle){ G.ship.throttle=n; Sfx.click(); } },
  massLock(){ const s=G.ship; if(s.pos.length()<SUN_R*3) return true; for(const P of PLANETS) if(P.pos.distanceTo(s.pos)<P.lockR) return true; return false; },
  canWarp(){ if(!G.sys.power) return 'NO POWER'; if(G.fuel<=0) return 'OUT OF FUEL'; if(this.massLock()) return 'MASS-LOCKED · FLY CLEAR'; return true; },
  toggleWarp(){ const s=G.ship; if(G.mode!=='flight') return; if(Ev.hold>0&&!s.warp){ UI.toast('Fuel line attached. Hold still.','warn'); Sfx.deny(); return; } if(s.warp){ this.dropWarp('Warp disengaged'); return; } const c=this.canWarp(); if(c!==true){ UI.toast(c,'warn'); Sfx.deny(); return; } s.warp=true; Sfx.warpIn(); this.flash=0.5; },
  dropWarp(msg, cls, hard){ const s=G.ship; if(!s.warp) return; s.warp=false; Sfx.warpOut(); this.flash=1; if(hard){ s.warpF=Math.min(s.warpF,0.12); if(s.throttle<7) s.throttle=7; } if(msg) UI.toast(msg,cls); },
  setTarget(i, quiet){ if(!quiet&&Nav.wp) Nav.clear(); G.target=(i+PLANETS.length)%PLANETS.length; this.mk=0; if(!quiet&&Sfx.ok()) Sfx.beep(990); },
  setAutopilot(v){ if(v&&!G.sys.power) return; G.sys.autopilot=v; UI.toast(v?'Autopilot steering to '+Nav.target().name:'Autopilot off'); },
  setPower(v){ G.sys.power=v; if(!v){ if(G.ship.warp) this.dropWarp(); G.sys.autopilot=false; G.ship.throttle=0; } Sfx.setRadioVol(v?G.sys.radioVol:0); UI.toast(v?'Systems online':'Master power off',v?'good':'warn'); },
  honk(){ Sfx.honk(); Escort.onHonk(); const n=Npc.nearest(5000); if(n&&!Comms.open&&G.sys.power) setTimeout(()=>{ if(G.mode==='flight'&&!Comms.open) Radio.play({sp:n.pilot.sp,seed:n.pilot.seed,name:n.pilot.name,english:pick(SPECIES[n.pilot.sp].honk)}); },700); },

  genJobs(pi){
    const P=PLANETS[pi], hold=holdCap(), jobs=[], n=5+Math.floor(Math.random()*3);
    // from a planet, the first two jobs stay in safe-ish space so there's always something a new hauler can take
    const dest=(i)=>{ let to, k=0; do{ to=Math.floor(Math.random()*PLANETS.length); }while((to===pi||(!P.station&&i<2&&PLANETS[to].risk>1))&&++k<60); return to; };
    for(let i=0;i<n;i++){ let to=dest(i); if(i===0&&G.hot!=null&&G.hot!==pi) to=G.hot;
      const good=pick(GOODS), qty=Math.max(1,Math.round(hold*[0.17,0.34,0.5,0.5,0.67,1,1.5][i===1?0:Math.floor(Math.random()*7)])), dist=P.pos.distanceTo(PLANETS[to].pos)/LS, hot=G.hot===to, risk=Econ.risk(P,PLANETS[to]);
      const pay=qty*(50+dist*36)*good[1]*rnd(0.85,1.2)*(hot?1.5:1)*RISK[risk].mul*Rep.payMul(), sp=Math.random()<0.55?P.species:pick(ALIEN_POOL);
      const fragile=i>0&&Math.random()<0.3;
      jobs.push({good:good[0],note:fragile?'Fragile: throttle 8 and up, and hard turns at speed, will damage it.':good[2],qty,to,pay:Math.max(20,Math.round(pay*(fragile?1.4:1)/5)*5),sp,seed:Math.floor(Math.random()*1e9),hot,fragile,risk}); }
    jobs.sort((a,b)=>a.qty-b.qty);
    const away=()=>{ let to; do{ to=Math.floor(Math.random()*PLANETS.length); }while(to===pi); return to; };
    // contraband pays for the chance of being caught: the stricter the docks at both ends, the more it's worth
    if(Math.random()<0.6){ const to=away(), g=pick(CONTRABAND), qty=Math.max(1,Math.round(hold*rnd(0.15,0.4))), dist=P.pos.distanceTo(PLANETS[to].pos)/LS, catchK=2.1+2.6*(Customs.risk(P)+Customs.risk(PLANETS[to]));
      jobs.push({kind:'contra',good:g[0],note:g[1],qty,to,risk:Econ.risk(P,PLANETS[to]),pay:Math.round(qty*(50+dist*36)*catchK*Econ.mul(P,PLANETS[to])*rnd(0.9,1.2)/5)*5,sp:pick(['vrell','grondar','qeeble','blorpax']),seed:Math.floor(Math.random()*1e9)}); }
    if(!G.cargo.some(c=>c.kind==='escort')&&Math.random()<0.6){ const to=away(), v=pick(VIPS), seed=Math.floor(Math.random()*1e9), dist=P.pos.distanceTo(PLANETS[to].pos)/LS;
      jobs.push({kind:'escort',good:'Escort '+v.title,note:'Keep up, keep close, and keep them calm.',qty:0,to,risk:Econ.risk(P,PLANETS[to]),pay:Math.round((320+dist*190)*rnd(0.9,1.2)*Econ.mul(P,PLANETS[to])*Rep.payMul()/5)*5,sp:v.sp,seed,vip:{sp:v.sp,seed,title:v.title,ship:shipName(seed)}}); }
    for(const j of jobs) j.story=j.kind==='contra'?Story.contra(j):j.kind==='escort'?Story.escort(j):Story.cargo(j);
    G.jobs=jobs;
    // people wanting a ride, offered at cantinas
    const px=[]; if(Venues.has(P,'bar')) for(let i=0,n=1+Math.floor(Math.random()*3);i<n;i++){ const to=away(), sp=Math.random()<0.4?P.species:pick(ALIEN_POOL), seed=Math.floor(Math.random()*1e9), dist=P.pos.distanceTo(PLANETS[to].pos)/LS;
      px.push({kind:'pax',good:alienName(sp,seed),sp,seed,to,qty:0,risk:Econ.risk(P,PLANETS[to]),pay:Math.round((140+dist*60)*rnd(0.85,1.25)*Econ.mul(P,PLANETS[to])*Rep.payMul()/5)*5,why:pick(['visiting a cousin who owes them money','going to a wedding, possibly their own','late for a very important nap','delivering a speech nobody asked for','attending a conference on conferences','running away from a minor embarrassment','going to see a famous rock (the rock is not famous)'])}); }
    for(const j of px){ j.story=Story.pax(j); j.why=j.story.why; }
    G.paxJobs=px;
  },
  onLanded(P){
    G.mode='port'; G.docked=P.idx; const s=G.ship; s.speed=0; s.cruise=0; s.throttle=0; s.warp=false; s.warpF=0; G.sys.autopilot=false; Sfx.setEngine(0,0,false);
    Dlg.close(); if(Nav.wp&&Nav.wp.kind==='distress') Nav.clear(true); Distress.cur=null; Customs.cur=null; Mining.beam.visible=Mining.spark.visible=Mining.sight.visible=false; Game.escortAlarm=false;
    // deliveries are handed over by hand at the cargo depot now; nothing is paid automatically
    const paid=[], total=0, due=UI.due(P);
    if(this.towFee&&G.up.tow){ G.up.tow=0; this.towFee=0; setTimeout(()=>UI.toast('Towing insurance paid the tow. Nobody is more surprised than the insurer.','good'),1500); }
    const fee=Math.min(this.towFee,G.credits); this.towFee=0; Calls.landed(P); Throttle.settle(); Throttle.zone=null; Scoop.open=false; $('scoop-badge').hidden=true; Faults.badge(); $('zone-badge').hidden=true; $('deep-badge').hidden=true; Deep.storm=null; if(Hold.open) Hold.render(); G.credits-=fee; if(G.hot===P.idx) G.hot=null;
    this.genJobs(P.idx); const S=SPECIES[P.species]; if(due.length) setTimeout(()=>UI.toast(`${due.length} deliver${due.length===1?'y':'ies'} for ${P.port}. Hand ${due.length===1?'it':'them'} over at the cargo depot.`,'good'),1200); Sfx.speak(S.voice,2.4,true);
    { const nx=G.cargo.find(c=>c.to>=0); if(nx&&!G.cargo.some(c=>c.to===G.target)) this.setTarget(nx.to,true); }
    Cockpit.drawManifest(); UI.showPort(P,{greet:fill(pick(S.dock),{port:P.port}),paid,total,fee}); this.save();
    if(G.cargo.some(c=>c.illegal&&c.to===P.idx)) setTimeout(()=>{ if(G.mode==='port') Customs.unload(P); },1200);
  },
  enterFlight(P, launch){
    const s=G.ship, T=PLANETS[G.target], up=new V3(0,1,0); G.mode='flight'; G.docked=-1; UI.hidePort(); $('keys').hidden=false; $('title').hidden=true;
    const dir=T!==P?T.pos.clone().sub(P.pos).normalize():P.sunDir.clone().negate(), side=new V3().crossVectors(dir,up).normalize();
    s.pos.copy(P.pos).addScaledVector(dir,P.r*3.7).addScaledVector(side,P.r*0.4); s.quat.copy(lookQuat(dir.clone().applyAxisAngle(up,0.36).applyAxisAngle(side,0.1),up));
    s.speed=0; s.cruise=0; s.throttle=0; s.warp=false; s.warpF=0; s.angVel.set(0,0,0); s.departed=P.idx; Npc.clear(); Distress.cur=null; Ev.hold=0; if(Nav.wp&&Nav.wp.kind==='distress') Nav.clear(true); Customs.arm(); Escort.spawn(); Radio.cur=null; Radio.wait=10; Cine.mode=null; Walk.exit(true); Faults.badge(); Throttle.reset();
    World.scenes.list=[{scene:World.space,camera:World.spaceCam},{scene:World.cock,camera:World.cockCam}]; Cockpit.zoomOut(); G.head.yaw=G.head.yawT; G.head.pitch=G.head.pitchT; G.head.pos.set(0,0,0);
    this.fade=1; this.fadeCol.setRGB(launch?1:0,launch?1:0,launch?1:0); this.mk=0; this.syncCamera(0.016);
    UI.toast(launch?`Clear of ${P.name}. Destination: ${T.name}`:`Destination: ${T.name}`); this.save();
  },
  tow(msg, fee){
    if(this.towing) return; this.towing=true; UI.toast(msg||'Out of fuel. A Grondar tow-barge has been called. It is not in a hurry.','warn');
    const far=[1,1.6,2.6,3.6][Deep.z]; if(far>1) setTimeout(()=>UI.toast(`Deep-space tow. The barge charges by the light-second, and it is a long way out.`,'warn'),1800);
    setTimeout(()=>{ this.towing=false; if(G.mode!=='flight') return; const P=World.nearest||PLANETS[0]; this.towFee=Math.round((fee||150)*far/10)*10; const out=G.ship.pos.clone().sub(P.pos).normalize(); G.ship.pos.copy(P.pos).addScaledVector(out,P.landR*1.2); G.ship.departed=-1; Cine.startLanding(P); },3500);
  },

  updateFlight(dt){
    const s=G.ship, def=SHIPS[G.shipId], K=G.keys, sys=G.sys;
    let cp=(K.KeyW?1:0)-(K.KeyS?1:0), cy=(K.KeyA?1:0)-(K.KeyD?1:0), cr=(K.KeyQ?1:0)-(K.KeyE?1:0); if(!cp&&!cy&&!TouchUI.stale){ cp=TouchUI.stick.y; cy=-TouchUI.stick.x; } if(sys.invert) cp=-cp; if(!sys.power||Walk.on) cp=cy=cr=0;
    if(sys.autopilot&&sys.power&&!cp&&!cy&&!cr){ const v=Cockpit.targetLocal().v; cy=clamp(-v.x*4,-1,1); cp=clamp(v.y*4,-1,1); if(v.z>0) cy=v.x<0?1:-1; }
    s.ctl.set(cp,cy,cr); const rate=def.turn*(1-0.82*s.warpF);
    s.angVel.x=damp(s.angVel.x,cp*rate,4.5,dt); s.angVel.y=damp(s.angVel.y,cy*rate,4.5,dt); s.angVel.z=damp(s.angVel.z,cr*rate*1.6,4.5,dt);
    s.quat.multiply(new Q4().setFromEuler(new THREE.Euler(s.angVel.x*dt,s.angVel.y*dt,s.angVel.z*dt))).normalize();
    s.warpF=clamp(s.warpF+(s.warp?dt*0.7:-dt*2.2),0,1);
    s.cruise=damp(s.cruise,sys.power?this.cruiseSpeed(s.throttle):0,1.4,dt); const w=s.warpF*s.warpF*(3-2*s.warpF); s.speed=s.cruise+(def.warp-s.cruise)*w*w;
    const fwd=new V3(0,0,-1).applyQuaternion(s.quat); s.vel.copy(fwd).multiplyScalar(s.speed); s.pos.addScaledVector(fwd,s.speed*dt);
    if(G.fuel>0){ G.fuel=Math.max(0,G.fuel-dt*(s.warp?1.5:0.012*s.throttle)*Faults.fuelMul()); if(G.fuel<=0){ if(s.warp) this.dropWarp('Fuel exhausted','warn'); else UI.toast('Fuel exhausted. Reserve thrusters only.','warn'); } }
    if(G.fuel<=0&&!s.warp&&(!World.nearest||World.nearest.dist>60000)) this.tow();
    const sunD=s.pos.length(); if(s.warp&&sunD<SUN_R*4) this.dropWarp('Solar gravity well. Warp disengaged.','warn',true);
    if(sunD<SUN_R*1.6){ s.pos.multiplyScalar(SUN_R*1.6/sunD); if(!this.sunWarn||G.playTime-this.sunWarn>6){ this.sunWarn=G.playTime; UI.toast('Hull temperature critical. Turn away from the star.','warn'); Sfx.deny(); } }
    s.temp=damp(s.temp,clamp(0.2+0.45*s.warpF+0.15*s.throttle/10+clamp(SUN_R*4/sunD-0.1,0,0.6)+Mining.heat*0.55+Throttle.heat*0.6,0,1),0.8,dt);
    for(const P of PLANETS){ const d=P.pos.distanceTo(s.pos);
      if(s.warp&&d<P.dropR&&P.pos.clone().sub(s.pos).normalize().dot(fwd)>0.2) this.dropWarp(P.name+' gravity well. Warp disengaged.','good',true);
      if(s.departed===P.idx&&d>P.landR*1.2) s.departed=-1;
      if(!s.warp&&s.warpF<0.2&&d<P.landR&&s.departed!==P.idx){ UI.toast(P.port+' has you. Landing is automatic.','good'); Cine.startLanding(P); return; } }
  },
  syncCamera(dt){
    const H=G.head, s=G.ship, K=G.keys;
    if(G.mode==='flight'){ if(K.ArrowLeft) H.yawT+=dt*1.5; if(K.ArrowRight) H.yawT-=dt*1.5; if(K.ArrowUp) H.pitchT+=dt*1.2; if(K.ArrowDown) H.pitchT-=dt*1.2; H.yawT=clamp(H.yawT,-2.5,2.5); H.pitchT=clamp(H.pitchT,-1.25,1.3); }
    H.yaw=damp(H.yaw,H.yawT,9,dt); H.pitch=damp(H.pitch,H.pitchT,9,dt); H.pos.lerp(H.posT,1-Math.exp(-dt*7)); H.fov=damp(H.fov,H.fovT+(H.zoomed?0:s.warpF*24),5,dt);
    const q=s.quat.clone().multiply(new Q4().setFromEuler(new THREE.Euler(H.pitch,H.yaw,0,'YXZ'))), p=H.pos.clone(), sh=s.warpF*0.003+this.flash*0.012;
    p.x+=(Math.random()-0.5)*sh; p.y+=(Math.random()-0.5)*sh; p.applyQuaternion(s.quat);
    for(const c of [World.spaceCam,World.cockCam]){ c.position.copy(p); c.quaternion.copy(q); }
    World.setFov(H.fov); Cockpit.group.quaternion.copy(s.quat); World.shipFrame.quaternion.copy(s.quat);
  },
  markers(){
    const show=G.mode==='flight'&&G.sys.hud&&G.sys.power;
    if(Nav.wp){ const w=Nav.wp; w.mk.sprite.visible=show; if(show) World.drawMarker(w,true,w.dist); }
    for(const F of FIELDS) if(F.mk) Mining.marker(F,show); Flotsam.markers(show);
    for(const P of PLANETS){ const tg=P.idx===G.target&&!Nav.wp; P.mk.sprite.visible=show&&P.px<(tg?90:40); if(!show) continue; World.drawMarker(P,tg,P.dist); P.mk.sprite.scale.set(tg?0.3:0.22,tg?0.1875:0.1375,1); P.mk.sprite.material.opacity=tg?1:0.6; }
  },

  loop(){
    requestAnimationFrame(()=>this.loop()); this.frame(Math.min(this.clock.getDelta(),0.05));
  },
  frame(dt){
    const t=this.time+=dt, s=G.ship; let fov=72;
    if(G.mode==='flight'){
      G.playTime+=dt; this.updateFlight(dt);
      if(G.mode==='flight'){ Ev.update(dt); Npc.update(dt,t); Radio.update(dt); Comms.update(dt); Cockpit.update(dt,t); Cargo.tick(dt); Faults.update(dt); Throttle.update(dt); this.syncCamera(dt); if(Walk.on){ Walk.update(dt,t); Walk.camera(); } World.updateDust(s.vel,dt,s.warpF); fov=Walk.on?74:G.head.fov;
        const HS=TouchUI.on?this.THINTS:this.HINTS; if(this.hintI<HS.length&&!Walk.on){ this.hintT+=dt; if(this.hintT>HS[this.hintI][0]) UI.toast(HS[this.hintI++][1]); } }
    } else if(G.mode==='title'){
      s.quat.multiply(new Q4().setFromEuler(new THREE.Euler(0,dt*0.004,dt*0.006))); Cockpit.update(dt,t); this.syncCamera(dt); World.updateDust(new V3(0,0,-1).applyQuaternion(s.quat).multiplyScalar(160),dt,0); fov=G.head.fov;
    }
    if(G.mode==='landing'||G.mode==='port'||G.mode==='takeoff'){ Cine.update(dt,t); if(G.mode!=='flight') fov=Cine.fovRaw||Cine.cam.fov; }
    World.update(dt,s.pos,fov);
    if(G.mode==='flight'||G.mode==='title'){
      this.flash=Math.max(0,this.flash-dt*2.2); this.fade=Math.max(0,this.fade-dt*1.1); World.fx('uExposure',1); World.fx('uWarp',s.warpF); World.fx('uFlash',this.flash*this.flash); World.fx('uFade',this.fade); World.fx('uFadeCol',this.fadeCol);
      World.tunnel.visible=s.warpF>0.02; World.tunnelMat.uniforms.uWarp.value=s.warpF; if(World.bloom) World.bloom.strength=Walk.on?0.35:0.75+s.warpF*0.7;
    } else { World.fx('uWarp',0); World.fx('uFlash',0); World.tunnel.visible=false; if(World.bloom) World.bloom.strength=Cine.mode==='A'||Cine.mode==='B'?0.7:0.4; }
    SysMap.update(dt,t); Dlg.update(dt); TouchUI.update(dt,t);
    if((this.mk++%12)===0) this.markers();
    const fly=G.mode==='flight'; Sfx.setEngine(fly?s.throttle/10:0,fly?s.warpF:0,fly&&G.sys.power); Sfx.tick(dt,G.sys,fly);
    World.render();
  },

  /* ---------- persistence ---------- */
  save(){ try{ localStorage.setItem('longhaul.v1',JSON.stringify({credits:G.credits,shipId:G.shipId,cargo:G.cargo,fuel:G.fuel,docked:G.docked,target:G.target,hot:G.hot,stats:G.stats,playTime:G.playTime,sys:G.sys,rep:G.rep,hull:G.hull,up:G.up,paint:G.paint,flot:G.flot||[],bet:G.bet||null,faults:G.faults||[]})); }catch(e){} },
  load(){ try{ const d=JSON.parse(localStorage.getItem('longhaul.v1')||'null'); if(!d||typeof d.credits!=='number'||!SHIPS[d.shipId]) return null; return d; }catch(e){ return null; } },
  newGame(){
    Sfx.init(); Object.assign(G,{credits:250,shipId:0,fuel:SHIPS[0].fuel,target:2,hot:null,docked:-1,playTime:0,stats:{deliveries:0,earned:0},jobs:[],rep:0,hull:100,up:{hidden:false,laser:1},paint:null,bet:null,faults:[]}); Nav.clear(true); Flotsam.restore([]); Walk.exit(true);
    G.cargo=[{good:'Self-Heating Soup Bricks',qty:3,to:2,pay:420,from:0}]; Cockpit.build(SHIPS[0]); this.hintI=0; this.hintT=0; this.enterFlight(PLANETS[0],false); this.audioOn();
  },
  continueGame(){
    const d=this.load(); if(!d){ this.newGame(); return; } Sfx.init();
    Object.assign(G,{credits:d.credits,shipId:d.shipId,cargo:d.cargo||[],fuel:d.fuel,target:d.target||0,hot:d.hot==null?null:d.hot,playTime:d.playTime||0,stats:d.stats||{deliveries:0,earned:0},rep:d.rep||0,hull:d.hull==null?100:d.hull,up:Object.assign({hidden:false,laser:1},d.up||{}),paint:d.paint||null,bet:d.bet||null,faults:(d.faults||[]).filter(k=>FAULT_DEFS[k])}); Flotsam.restore(d.flot||[]); Object.assign(G.sys,d.sys||{},{power:true,autopilot:false});
    Cockpit.build(SHIPS[G.shipId]); $('title').hidden=true; this.audioOn(); Cine.landed=false; Cine.fadeCol.setRGB(0,0,0); Cine.dock(PLANETS[d.docked>=0?d.docked:0]); Cine.fade=1;
  },
  audioOn(){ Sfx.setRadioVol(G.sys.radioVol); Sfx.setMusicVol(G.sys.music); },
  setupTitle(){
    const P=PLANETS[0], s=G.ship, up=new V3(0,1,0), out=P.sunDir.clone().negate().applyAxisAngle(up,2.0); s.pos.copy(P.pos).addScaledVector(out,P.r*3.3).addScaledVector(up,P.r*0.5);
    const side=new V3().crossVectors(out,up).normalize(); s.quat.copy(lookQuat(P.pos.clone().addScaledVector(side,-P.r*1.5).addScaledVector(up,P.r*0.6).sub(s.pos).normalize(),up));
    G.mode='title'; World.scenes.list=[{scene:World.space,camera:World.spaceCam},{scene:World.cock,camera:World.cockCam}];
    const nb=$('btn-new'); nb.disabled=false; nb.textContent='New career'; nb.onclick=()=>this.newGame();
    if(this.load()){ const cb=$('btn-continue'); cb.hidden=false; cb.onclick=()=>this.continueGame(); }
  },
  bind(){
    const help=on=>{ $('help').hidden=!on; };
    window.addEventListener('keydown',e=>{
      if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName)) return; const c=e.code;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(c)) e.preventDefault();
      if(!$('help').hidden){ if(c==='Escape'||c==='Slash'||c==='F1'){ help(false); e.preventDefault(); } return; }
      if(c==='Escape'&&Dlg.hangUp()){ e.preventDefault(); return; }
      if(Dlg.open&&Dlg.mini&&(c==='Enter'||c==='NumpadEnter')){ Dlg.expand(); e.preventDefault(); return; }
      if(Dlg.open&&!Dlg.mini){ const dm=c.match(/^(?:Digit|Numpad)(\d)$/); if(dm){ const n=+dm[1]; if(n>=1&&n<=Dlg.opts.length) Dlg.choose(n-1); e.preventDefault(); return; } }
      if(c==='F1'||(c==='Slash'&&e.shiftKey)){ if(G.mode!=='title'&&G.mode!=='boot'){ help(true); e.preventDefault(); } return; }
      if(G.mode==='landing'||G.mode==='takeoff'){ if(c==='Space'||c==='Enter'||c==='Escape') Cine.skip(); return; }
      if(c==='KeyM'&&!(e.metaKey||e.ctrlKey||e.altKey)){ if(!e.repeat&&(G.mode==='flight'||G.mode==='port')) SysMap.toggle(); return; }
      if(SysMap.open&&c==='Escape'){ SysMap.close(); return; }
      if(c==='KeyI'&&!e.repeat&&(G.mode==='flight'||G.mode==='port')){ Hold.toggle(); return; }
      if(Specs.open&&c==='Escape'){ Specs.close(); return; }
      if(Hold.open&&c==='Escape'){ Hold.toggle(false); return; }
      if(c==='KeyB'&&!e.repeat&&G.mode==='flight'){ Scoop.toggle(); return; }
      // keys still held from walking (W A S D Q E, arrows) must not start flying the ship once you sit: ignore them until let go
      if(c==='KeyL'&&!e.repeat&&G.mode==='flight'){ const held=Object.keys(G.keys).filter(k=>G.keys[k]), was=Walk.on; G.keys={}; Walk.toggle(); if(was&&!Walk.on) held.forEach(k=>Walk.stale.add(k)); return; }
      if(Walk.on&&G.mode==='flight'){ if(!e.repeat) G.keys[c]=true; if(/^(Key[XZTPHGC]|Digit\d|Numpad\d)$/.test(c)&&!e.repeat) UI.toast(`You need to be in the pilot's seat for that. ${TouchUI.on?'Tap Seat':'Press L'}.`,'warn'); if(c==='Escape'){ const held=Object.keys(G.keys).filter(k=>G.keys[k]); Walk.toggle(); if(!Walk.on){ G.keys={}; held.forEach(k=>Walk.stale.add(k)); } } return; }
      if(Walk.stale.has(c)) return;
      if(G.mode!=='flight'||e.repeat&&!/^Key[WASDQE]$|^Arrow/.test(c)) return; G.keys[c]=true; if(e.metaKey||e.ctrlKey||e.altKey) return;
      const dm=c.match(/^(?:Digit|Numpad)(\d)$/);
      if(dm){ const n=+dm[1]; if(Comms.open&&n>=1&&n<=5) Comms.choose(n-1); else this.setThrottle(n===0?10:n); return; }
      switch(c){ case 'KeyX': this.setThrottle(0); break; case 'KeyZ': this.toggleWarp(); break; case 'KeyT': this.setTarget(G.target+(e.shiftKey?-1:1)); break; case 'KeyP': this.setAutopilot(!G.sys.autopilot); break;
        case 'KeyH': Comms.hail(); break; case 'KeyG': this.honk(); break; case 'KeyC': Cockpit.zoomOut(); break; case 'Escape': if(Comms.open) Comms.close(); else if(!Throttle.hideBanner()) Cockpit.zoomOut(); break;
        case 'KeyN': G.sys.music=G.sys.music>0.02?0:0.45; Sfx.setMusicVol(G.sys.music); break; }
    });
    window.addEventListener('keyup',e=>{ G.keys[e.code]=false; Walk.stale.delete(e.code); });
    // in port, the goods shelf answers the mouse: hover for what it is, click to open its contract
    { const gl=$('gl'), tip=$('shelf-tip'); let down=null; const nd=e=>{ const r=gl.getBoundingClientRect(); return new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); };
      const show=(j,e)=>{ if(!j){ if(!tip.hidden) tip.hidden=true; gl.style.cursor=''; Venues.hoverShelf(null); return; } Venues.hoverShelf(j); gl.style.cursor='pointer'; tip.hidden=false;
        tip.innerHTML=`<b>${j.kind==='contra'?j.qty+'× something unmentionable':j.qty+'× '+esc(j.good)}</b>${fmtCr(j.pay)} · to ${esc(PLANETS[j.to].name)}<br><i>${TouchUI.on?'Tap':'Click'} to see the job</i>`; tip.style.left=e.clientX+'px'; tip.style.top=e.clientY+'px'; };
      gl.addEventListener('pointermove',e=>{ if(G.mode!=='port'||e.pointerType==='touch') return; const j=Venues.pickShelf(nd(e)); show(j,e); if(!j&&UI.hushed&&Venues.pickKeeper(nd(e))===UI.hushed) gl.style.cursor='pointer'; });
      gl.addEventListener('pointerleave',()=>show(null));
      gl.addEventListener('pointerdown',e=>{ if(G.mode==='port') down={x:e.clientX,y:e.clientY}; });
      gl.addEventListener('pointerup',e=>{ if(G.mode!=='port'||!down) return; const far=Math.hypot(e.clientX-down.x,e.clientY-down.y)>10; down=null; if(far) return; const j=Venues.pickShelf(nd(e)); if(j){ show(null); UI.focusJob(j); return; }
        // the alien who was talking: tap them to hear them again
        const K=Venues.pickKeeper(nd(e)); if(K&&UI.hushed===K){ UI.hushed=null; if(Sfx.ok()) Sfx.click(); gl.style.cursor=''; } }); }
    window.addEventListener('blur',()=>{ G.keys={}; });
    $('bubble').onclick=()=>UI.hush(); $('zone-badge').onclick=()=>Throttle.hideBanner(); $('help-close').onclick=()=>{ help(false); $('gl').focus(); }; $('hold-close').onclick=()=>Hold.toggle(false); $('specs-close').onclick=()=>Specs.close(); $('specs').onclick=e=>{ if(e.target.id==='specs') Specs.close(); }; $('hold-scoop').onclick=()=>{ Scoop.toggle(); Hold.render(); }; $('skip').onclick=()=>Cine.skip(); $('launch').onclick=()=>{ if(G.mode!=='port') return; const due=UI.due(UI.P);
      if(due.length&&!Dlg.open){ Dlg.show({icon:'📦',who:`${UI.P.port} · cargo depot`,text:`You still have ${due.length} deliver${due.length===1?'y':'ies'} for here. Leave without handing ${due.length===1?'it':'them'} over?`,
        opts:[{t:'Hand everything over first',fn:()=>{ UI.deliverAll(UI.P); }},{t:'Launch anyway',sub:'It stays in your hold',fn:()=>Cine.startTakeoff()}]}); return; }
      Cine.startTakeoff(); };
    document.addEventListener('visibilitychange',()=>{ Sfx.setMaster(document.hidden?0:0.85); });
  },
  async boot(){
    try{ await Promise.race([document.fonts&&document.fonts.load?Promise.all([document.fonts.load(`600 20px ${FONT_DISP}`),document.fonts.load(`20px ${FONT_MONO}`)]):0,new Promise(r=>setTimeout(r,2500))]); }catch(e){}
    try{ World.init($('gl')); Mining.build(); }catch(err){ console.error(err); const b=$('btn-new'); b.textContent='This browser cannot start WebGL'; return; }
    Cockpit.build(SHIPS[0]); Cockpit.bindInput($('gl')); SysMap.bind(); this.bind(); TouchUI.init(); this.setupTitle(); this.loop();
  },
};
Game.boot();
