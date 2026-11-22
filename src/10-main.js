/* ===================== GAME ===================== */
const G = {
  mode:'boot', credits:250, shipId:0, cargo:[], jobs:[], fuel:100, target:2, hot:null, docked:-1, playTime:0, stats:{deliveries:0,earned:0}, keys:{},
  ship:{pos:new V3(), quat:new Q4(), vel:new V3(), speed:0, cruise:0, throttle:0, warp:false, warpF:0, angVel:new V3(), ctl:new V3(), temp:0.25, departed:-1},
  sys:{power:true,autopilot:false,hud:true,invert:false,wipers:false,translator:true,radioVol:0.7,channel:0,cabin:0.45,instr:0.8,visor:0,music:0.45,radarRange:1,mfdPage:0,dirt:0.12},
  head:{yaw:0,pitch:-0.12,yawT:0,pitchT:-0.12,basePitch:-0.12,pos:new V3(),posT:new V3(),fov:72,fovT:72,zoomed:null,zoomPt:null},
};
window.G = G;

const Game = {
  clock:new THREE.Clock(), time:0, flash:0, fade:0, fadeCol:new THREE.Color(0,0,0), towFee:0, towing:false, hintT:0, hintI:99, mk:0,
  HINTS:[[2.5,'Steer with W A S D until the amber marker is dead ahead'],[11,'Throttle 1 to 0. Press Z for warp once the nav screen says aligned'],[24,'Double-click any panel to lean in, and again to lean back. Every control works'],[38,'H hails the nearest pilot. The translator is on the glare shield'],[52,'Fly at a planet and the port lands you automatically'],[66,'M opens the system map. Click a world there to set your destination']],

  cruiseSpeed(n){ return SHIPS[G.shipId].cruise*Math.pow(n/10,1.5); },
  setThrottle(n){ n=clamp(Math.round(n),0,10); if(!G.sys.power||G.mode!=='flight') return; if(n!==G.ship.throttle){ G.ship.throttle=n; Sfx.click(); } },
  massLock(){ const s=G.ship; if(s.pos.length()<SUN_R*3) return true; for(const P of PLANETS) if(P.pos.distanceTo(s.pos)<P.lockR) return true; return false; },
  canWarp(){ if(!G.sys.power) return 'NO POWER'; if(G.fuel<=0) return 'OUT OF FUEL'; if(this.massLock()) return 'MASS-LOCKED · FLY CLEAR'; return true; },
  toggleWarp(){ const s=G.ship; if(G.mode!=='flight') return; if(s.warp){ this.dropWarp('Warp disengaged'); return; } const c=this.canWarp(); if(c!==true){ UI.toast(c,'warn'); Sfx.deny(); return; } s.warp=true; Sfx.warpIn(); this.flash=0.5; },
  dropWarp(msg, cls, hard){ const s=G.ship; if(!s.warp) return; s.warp=false; Sfx.warpOut(); this.flash=1; if(hard){ s.warpF=Math.min(s.warpF,0.12); if(s.throttle<7) s.throttle=7; } if(msg) UI.toast(msg,cls); },
  setTarget(i, quiet){ G.target=(i+PLANETS.length)%PLANETS.length; this.mk=0; if(!quiet&&Sfx.ok()) Sfx.beep(990); },
  setAutopilot(v){ if(v&&!G.sys.power) return; G.sys.autopilot=v; UI.toast(v?'Autopilot steering to '+PLANETS[G.target].name:'Autopilot off'); },
  setPower(v){ G.sys.power=v; if(!v){ if(G.ship.warp) this.dropWarp(); G.sys.autopilot=false; G.ship.throttle=0; } Sfx.setRadioVol(v?G.sys.radioVol:0); UI.toast(v?'Systems online':'Master power off',v?'good':'warn'); },
  honk(){ Sfx.honk(); const n=Npc.nearest(5000); if(n&&!Comms.open&&G.sys.power) setTimeout(()=>{ if(G.mode==='flight'&&!Comms.open) Radio.play({sp:n.pilot.sp,seed:n.pilot.seed,name:n.pilot.name,english:pick(SPECIES[n.pilot.sp].honk)}); },700); },

  genJobs(pi){
    const P=PLANETS[pi], hold=SHIPS[G.shipId].hold, jobs=[], n=5+Math.floor(Math.random()*3);
    for(let i=0;i<n;i++){ let to; do{ to=Math.floor(Math.random()*PLANETS.length); }while(to===pi); if(i===0&&G.hot!=null&&G.hot!==pi) to=G.hot;
      const good=pick(GOODS), qty=Math.max(1,Math.round(hold*[0.17,0.34,0.5,0.5,0.67,1,1.5][i===1?0:Math.floor(Math.random()*7)])), dist=P.pos.distanceTo(PLANETS[to].pos)/LS, hot=G.hot===to;
      const pay=qty*(50+dist*36)*good[1]*rnd(0.85,1.2)*(hot?1.5:1), sp=Math.random()<0.55?P.species:pick(SPECIES_KEYS);
      jobs.push({good:good[0],note:good[2],qty,to,pay:Math.max(20,Math.round(pay/5)*5),sp,seed:Math.floor(Math.random()*1e9),hot}); }
    jobs.sort((a,b)=>a.qty-b.qty); G.jobs=jobs;
  },
  onLanded(P){
    G.mode='port'; G.docked=P.idx; const s=G.ship; s.speed=0; s.cruise=0; s.throttle=0; s.warp=false; s.warpF=0; G.sys.autopilot=false; Sfx.setEngine(0,0,false);
    const paid=G.cargo.filter(c=>c.to===P.idx); let total=0; paid.forEach(c=>total+=c.pay); G.cargo=G.cargo.filter(c=>c.to!==P.idx);
    const fee=Math.min(this.towFee,G.credits+total); this.towFee=0; G.credits+=total-fee; G.stats.deliveries+=paid.length; G.stats.earned+=total; if(G.hot===P.idx) G.hot=null;
    this.genJobs(P.idx); const S=SPECIES[P.species]; if(paid.length) Sfx.cash(); Sfx.speak(S.voice,2.4,true);
    if(G.cargo.length&&!G.cargo.some(c=>c.to===G.target)) this.setTarget(G.cargo[0].to,true);
    Cockpit.drawManifest(); UI.showPort(P,{greet:fill(pick(S.dock),{port:P.port}),paid,total,fee}); this.save();
  },
  enterFlight(P, launch){
    const s=G.ship, T=PLANETS[G.target], up=new V3(0,1,0); G.mode='flight'; G.docked=-1; UI.hidePort(); $('keys').hidden=false; $('title').hidden=true;
    const dir=T!==P?T.pos.clone().sub(P.pos).normalize():P.sunDir.clone().negate(), side=new V3().crossVectors(dir,up).normalize();
    s.pos.copy(P.pos).addScaledVector(dir,P.r*3.7).addScaledVector(side,P.r*0.4); s.quat.copy(lookQuat(dir.clone().applyAxisAngle(up,0.36).applyAxisAngle(side,0.1),up));
    s.speed=0; s.cruise=0; s.throttle=0; s.warp=false; s.warpF=0; s.angVel.set(0,0,0); s.departed=P.idx; Npc.clear(); Radio.cur=null; Radio.wait=2.5; Cine.mode=null;
    World.scenes.list=[{scene:World.space,camera:World.spaceCam},{scene:World.cock,camera:World.cockCam}]; Cockpit.zoomOut(); G.head.yaw=G.head.yawT; G.head.pitch=G.head.pitchT; G.head.pos.set(0,0,0);
    this.fade=1; this.fadeCol.setRGB(launch?1:0,launch?1:0,launch?1:0); this.mk=0; this.syncCamera(0.016);
    UI.toast(launch?`Clear of ${P.name}. Destination: ${T.name}`:`Destination: ${T.name}`); this.save();
  },
  tow(){
    if(this.towing) return; this.towing=true; UI.toast('Out of fuel. A Grondar tow-barge has been called. It is not in a hurry.','warn');
    setTimeout(()=>{ this.towing=false; if(G.mode!=='flight') return; const P=World.nearest||PLANETS[0]; this.towFee=150; const out=G.ship.pos.clone().sub(P.pos).normalize(); G.ship.pos.copy(P.pos).addScaledVector(out,P.landR*1.2); G.ship.departed=-1; Cine.startLanding(P); },3500);
  },

  updateFlight(dt){
    const s=G.ship, def=SHIPS[G.shipId], K=G.keys, sys=G.sys;
    let cp=(K.KeyW?1:0)-(K.KeyS?1:0), cy=(K.KeyA?1:0)-(K.KeyD?1:0), cr=(K.KeyQ?1:0)-(K.KeyE?1:0); if(sys.invert) cp=-cp; if(!sys.power) cp=cy=cr=0;
    if(sys.autopilot&&sys.power&&!cp&&!cy&&!cr){ const v=Cockpit.targetLocal().v; cy=clamp(-v.x*4,-1,1); cp=clamp(v.y*4,-1,1); if(v.z>0) cy=v.x<0?1:-1; }
    s.ctl.set(cp,cy,cr); const rate=def.turn*(1-0.82*s.warpF);
    s.angVel.x=damp(s.angVel.x,cp*rate,4.5,dt); s.angVel.y=damp(s.angVel.y,cy*rate,4.5,dt); s.angVel.z=damp(s.angVel.z,cr*rate*1.6,4.5,dt);
    s.quat.multiply(new Q4().setFromEuler(new THREE.Euler(s.angVel.x*dt,s.angVel.y*dt,s.angVel.z*dt))).normalize();
    s.warpF=clamp(s.warpF+(s.warp?dt*0.7:-dt*2.2),0,1);
    s.cruise=damp(s.cruise,sys.power?this.cruiseSpeed(s.throttle):0,1.4,dt); const w=s.warpF*s.warpF*(3-2*s.warpF); s.speed=s.cruise+(def.warp-s.cruise)*w*w;
    const fwd=new V3(0,0,-1).applyQuaternion(s.quat); s.vel.copy(fwd).multiplyScalar(s.speed); s.pos.addScaledVector(fwd,s.speed*dt);
    if(G.fuel>0){ G.fuel=Math.max(0,G.fuel-dt*(s.warp?1.5:0.012*s.throttle)); if(G.fuel<=0){ if(s.warp) this.dropWarp('Fuel exhausted','warn'); else UI.toast('Fuel exhausted. Reserve thrusters only.','warn'); } }
    if(G.fuel<=0&&!s.warp&&(!World.nearest||World.nearest.dist>60000)) this.tow();
    const sunD=s.pos.length(); if(s.warp&&sunD<SUN_R*4) this.dropWarp('Solar gravity well. Warp disengaged.','warn',true);
    if(sunD<SUN_R*1.6){ s.pos.multiplyScalar(SUN_R*1.6/sunD); if(!this.sunWarn||G.playTime-this.sunWarn>6){ this.sunWarn=G.playTime; UI.toast('Hull temperature critical. Turn away from the star.','warn'); Sfx.deny(); } }
    s.temp=damp(s.temp,clamp(0.2+0.45*s.warpF+0.15*s.throttle/10+clamp(SUN_R*4/sunD-0.1,0,0.6),0,1),0.8,dt);
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
    for(const P of PLANETS){ const tg=P.idx===G.target; P.mk.sprite.visible=show&&P.px<(tg?90:40); if(!show) continue; World.drawMarker(P,tg,P.dist); P.mk.sprite.scale.set(tg?0.3:0.22,tg?0.1875:0.1375,1); P.mk.sprite.material.opacity=tg?1:0.6; }
  },

  loop(){
    requestAnimationFrame(()=>this.loop()); this.frame(Math.min(this.clock.getDelta(),0.05));
  },
  frame(dt){
    const t=this.time+=dt, s=G.ship; let fov=72;
    if(G.mode==='flight'){
      G.playTime+=dt; this.updateFlight(dt);
      if(G.mode==='flight'){ Npc.update(dt,t); Radio.update(dt); Comms.update(dt); Cockpit.update(dt,t); this.syncCamera(dt); World.updateDust(s.vel,dt,s.warpF); fov=G.head.fov;
        if(this.hintI<this.HINTS.length){ this.hintT+=dt; if(this.hintT>this.HINTS[this.hintI][0]) UI.toast(this.HINTS[this.hintI++][1]); } }
    } else if(G.mode==='title'){
      s.quat.multiply(new Q4().setFromEuler(new THREE.Euler(0,dt*0.004,dt*0.006))); Cockpit.update(dt,t); this.syncCamera(dt); World.updateDust(new V3(0,0,-1).applyQuaternion(s.quat).multiplyScalar(160),dt,0); fov=G.head.fov;
    }
    if(G.mode==='landing'||G.mode==='port'||G.mode==='takeoff'){ Cine.update(dt,t); if(G.mode!=='flight') fov=Cine.cam.fov; }
    World.update(dt,s.pos,fov);
    if(G.mode==='flight'||G.mode==='title'){
      this.flash=Math.max(0,this.flash-dt*2.2); this.fade=Math.max(0,this.fade-dt*1.1); World.fx('uExposure',1); World.fx('uWarp',s.warpF); World.fx('uFlash',this.flash*this.flash); World.fx('uFade',this.fade); World.fx('uFadeCol',this.fadeCol);
      World.tunnel.visible=s.warpF>0.02; World.tunnelMat.uniforms.uWarp.value=s.warpF; if(World.bloom) World.bloom.strength=0.75+s.warpF*0.7;
    } else { World.fx('uWarp',0); World.fx('uFlash',0); World.tunnel.visible=false; if(World.bloom) World.bloom.strength=Cine.mode==='A'||Cine.mode==='B'?0.7:0.4; }
    SysMap.update(dt,t);
    if((this.mk++%12)===0) this.markers();
    const fly=G.mode==='flight'; Sfx.setEngine(fly?s.throttle/10:0,fly?s.warpF:0,fly&&G.sys.power); Sfx.tick(dt,G.sys,fly);
    World.render();
  },

  /* ---------- persistence ---------- */
  save(){ try{ localStorage.setItem('longhaul.v1',JSON.stringify({credits:G.credits,shipId:G.shipId,cargo:G.cargo,fuel:G.fuel,docked:G.docked,target:G.target,hot:G.hot,stats:G.stats,playTime:G.playTime,sys:G.sys})); }catch(e){} },
  load(){ try{ const d=JSON.parse(localStorage.getItem('longhaul.v1')||'null'); if(!d||typeof d.credits!=='number'||!SHIPS[d.shipId]) return null; return d; }catch(e){ return null; } },
  newGame(){
    Sfx.init(); Object.assign(G,{credits:250,shipId:0,fuel:SHIPS[0].fuel,target:2,hot:null,docked:-1,playTime:0,stats:{deliveries:0,earned:0},jobs:[]});
    G.cargo=[{good:'Self-Heating Soup Bricks',qty:3,to:2,pay:420,from:0}]; Cockpit.build(SHIPS[0]); this.hintI=0; this.hintT=0; this.enterFlight(PLANETS[0],false); this.audioOn();
  },
  continueGame(){
    const d=this.load(); if(!d){ this.newGame(); return; } Sfx.init();
    Object.assign(G,{credits:d.credits,shipId:d.shipId,cargo:d.cargo||[],fuel:d.fuel,target:d.target||0,hot:d.hot==null?null:d.hot,playTime:d.playTime||0,stats:d.stats||{deliveries:0,earned:0}}); Object.assign(G.sys,d.sys||{},{power:true,autopilot:false});
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
      if(c==='F1'||(c==='Slash'&&e.shiftKey)){ if(G.mode!=='title'&&G.mode!=='boot'){ help(true); e.preventDefault(); } return; }
      if(G.mode==='landing'||G.mode==='takeoff'){ if(c==='Space'||c==='Enter'||c==='Escape') Cine.skip(); return; }
      if(c==='KeyM'&&!(e.metaKey||e.ctrlKey||e.altKey)){ if(!e.repeat&&(G.mode==='flight'||G.mode==='port')) SysMap.toggle(); return; }
      if(SysMap.open&&c==='Escape'){ SysMap.close(); return; }
      if(G.mode!=='flight'||e.repeat&&!/^Key[WASDQE]$|^Arrow/.test(c)) return; G.keys[c]=true; if(e.metaKey||e.ctrlKey||e.altKey) return;
      const dm=c.match(/^(?:Digit|Numpad)(\d)$/);
      if(dm){ const n=+dm[1]; if(Comms.open&&n>=1&&n<=5) Comms.choose(n-1); else this.setThrottle(n===0?10:n); return; }
      switch(c){ case 'KeyX': this.setThrottle(0); break; case 'KeyZ': this.toggleWarp(); break; case 'KeyT': this.setTarget(G.target+(e.shiftKey?-1:1)); break; case 'KeyP': this.setAutopilot(!G.sys.autopilot); break;
        case 'KeyH': Comms.hail(); break; case 'KeyG': this.honk(); break; case 'KeyC': Cockpit.zoomOut(); break; case 'Escape': if(Comms.open) Comms.close(); else Cockpit.zoomOut(); break;
        case 'KeyN': G.sys.music=G.sys.music>0.02?0:0.45; Sfx.setMusicVol(G.sys.music); break; }
    });
    window.addEventListener('keyup',e=>{ G.keys[e.code]=false; });
    window.addEventListener('blur',()=>{ G.keys={}; });
    $('help-close').onclick=()=>{ help(false); $('gl').focus(); }; $('skip').onclick=()=>Cine.skip(); $('launch').onclick=()=>{ if(G.mode==='port') Cine.startTakeoff(); };
    document.addEventListener('visibilitychange',()=>{ Sfx.setMaster(document.hidden?0:0.85); });
  },
  async boot(){
    try{ await Promise.race([document.fonts&&document.fonts.load?Promise.all([document.fonts.load(`600 20px ${FONT_DISP}`),document.fonts.load(`20px ${FONT_MONO}`)]):0,new Promise(r=>setTimeout(r,2500))]); }catch(e){}
    try{ World.init($('gl')); }catch(err){ console.error(err); const b=$('btn-new'); b.textContent='This browser cannot start WebGL'; return; }
    Cockpit.build(SHIPS[0]); Cockpit.bindInput($('gl')); SysMap.bind(); this.bind(); this.setupTitle(); this.loop();
  },
};
Game.boot();
