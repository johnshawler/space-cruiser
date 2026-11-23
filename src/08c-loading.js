/* ===================== CARGO LOADING (start of the takeoff scene) ===================== */
/* A side hatch on your ship folds down into a ramp, and two local dockhands carry the crates you took on here up into
   the hold. Most of the time something goes wrong: the stack topples, or the last crate slides back down the ramp and
   bursts. Sometimes it all goes in without a scratch. Coordinates are in the ship's frame with y measured from the pad. */
const Loading = (() => {
  // where each player ship's hatch sits: z along the hull, x of the hull side, sill height above the pad
  const DOOR=[{z:10,x:2.8,h:1.6},{z:-3,x:4.0,h:1.4},{z:-5,x:3.6,h:1.2},{z:0,x:4.5,h:1.6},{z:2,x:3.5,h:2.4}];
  const L=4.2, W=3.0, LANE=0.7, CS=0.8, SC=1.25, GRAV=13, WALK=6.5, CLIMB=4.8;
  const M=(hex,r=0.7,m=0.1,ex)=>new THREE.MeshStandardMaterial(Object.assign({color:C(hex),roughness:r,metalness:m},ex||{}));
  const P_=(t,a,b)=>clamp((t-a)/(b-a),0,1), E=x=>x*x*(3-2*x);
  let S=null;

  function crateTex(label, bad){
    const cv=makeCanvas(256,256), x=cv.getContext('2d'); x.fillStyle=bad?'#5d6455':'#b9823f'; x.fillRect(0,0,256,256);
    x.fillStyle='rgba(0,0,0,0.16)'; for(let i=1;i<5;i++) x.fillRect(0,i*51-3,256,6);
    x.strokeStyle=bad?'#2c3028':'#6e4a22'; x.lineWidth=24; x.strokeRect(12,12,232,232);
    x.fillStyle=bad?'#f4f1e4':'#2a1a0c'; x.textAlign='center'; x.textBaseline='middle';
    const words=label.toUpperCase().split(/\s+/); let fs=54, lines;
    for(;fs>=22;fs-=4){ x.font=`700 ${fs}px ${FONT_DISP}`; lines=[]; let cur='';
      for(const w of words){ const t=cur?cur+' '+w:w; if(x.measureText(t).width>196&&cur){ lines.push(cur); cur=w; } else cur=t; } lines.push(cur);
      if(lines.length<=3&&lines.every(l=>x.measureText(l).width<=196)) break; }
    lines.forEach((l,i)=>x.fillText(l,128,128+(i-(lines.length-1)/2)*fs*1.05));
    return canvasTex(cv);
  }
  function hazardTex(){ const cv=makeCanvas(256,128), x=cv.getContext('2d'); x.fillStyle='#2b2d31'; x.fillRect(0,0,256,128); x.fillStyle='#f2c14e';
    for(let i=-2;i<10;i++){ x.beginPath(); x.moveTo(i*32,0); x.lineTo(i*32+16,0); x.lineTo(i*32-16,128); x.lineTo(i*32-32,128); x.fill(); }
    x.fillStyle='#3a3d42'; x.fillRect(0,20,256,88); x.fillStyle='rgba(255,255,255,0.07)'; for(let i=0;i<16;i++) x.fillRect(i*16+4,24,6,80); return canvasTex(cv); }

  function start(P, model, mi, goods){
    stop();
    const D=DOOR[Math.min(mi,DOOR.length-1)], a=Math.asin(Math.min(0.85,D.h/L)), ca=Math.cos(a), sa=Math.sin(a), gh=model.userData.gearH, scn=Cine.surf.scene;
    const root=new THREE.Group(); root.rotation.y=model.rotation.y; scn.add(root);
    const ramp=(s,lane)=>new V3(D.x+0.25+s*ca, D.h+0.16-s*sa, D.z+lane);
    // hatch on the ship itself so it lifts off with it
    const door=new THREE.Group(); door.position.set(0,D.h-gh,0); model.add(door);
    const bay=new THREE.Mesh(new THREE.PlaneGeometry(W-0.3,2.9),new THREE.MeshBasicMaterial({color:C('#2e2418')})); bay.rotation.y=Math.PI/2; bay.position.set(D.x+0.05,1.45,D.z); door.add(bay);
    const lamp=new THREE.Mesh(new THREE.PlaneGeometry(W-0.6,0.16),new THREE.MeshBasicMaterial({color:HDR('#ffd9a0',2.2)})); lamp.rotation.y=Math.PI/2; lamp.position.set(D.x+0.06,2.7,D.z); door.add(lamp);
    for(const sz of [-1,1]){ const post=new THREE.Mesh(new THREE.BoxGeometry(0.22,3.1,0.22),M('#2a2d33',0.5,0.6)); post.position.set(D.x+0.1,1.5,D.z+sz*(W/2-0.05)); door.add(post); }
    const hinge=new THREE.Group(); hinge.position.set(D.x+0.25,0,D.z); door.add(hinge);
    const hull=M('#8d949c',0.45,0.6), tread=M('#ffffff',0.8,0.2,{map:hazardTex()});
    const rg=new THREE.BoxGeometry(L,0.16,W); rg.translate(L/2,0.08,0); const rm=new THREE.Mesh(rg,[hull,hull,tread,hull,hull,hull]); rm.castShadow=true; rm.receiveShadow=true; hinge.add(rm);
    hinge.rotation.z=Math.PI/2;

    // crates, one stencilled with each contract's goods
    const foot=ramp(L,0), stack=new V3(foot.x+1.9,0,D.z+2.7), n=goods.length===1?2:3, crates=[];
    for(let i=0;i<n;i++){ const g=goods[i%goods.length], bad=!!g.illegal;
      const o=new THREE.Mesh(new THREE.BoxGeometry(CS,CS,CS),M('#ffffff',0.85,0.02,{map:crateTex(bad?'Definitely not contraband':g.good,bad)})); o.castShadow=true; o.receiveShadow=true;
      o.position.set(stack.x+(i%2?0.06:-0.05),CS/2+i*CS,stack.z+(i%2?-0.04:0.05)); o.rotation.y=(Math.random()-0.5)*0.25; root.add(o);
      crates.push({o,i,taken:false,phys:null,col:pick(['#ff6b6b','#ffd43b','#51cf66','#4dabf7','#cc5de8','#ff922b','#f8f9fa'])}); }

    // two dockhands from this world
    const seed=P.idx*131+Math.floor(Math.random()*1e5), crew=[0,1].map(k=>{ const F=Folk.make(P.species,seed+k*57,SC); root.add(F);
      const rest=new V3(stack.x+1.7,0,stack.z+(k?1.4:-1.6)); F.position.copy(rest); F.rotation.y=-Math.PI/2;
      return {F,k,rest,st:'wait',wait:k?1.7:0.9,path:null,crate:null,act:null,actT:0,ph:0,onRamp:false}; });

    const r=Math.random(), out=api.force||(r<0.38?'ok':r<0.69?'tumble':'topple');
    S={P,D,a,ca,sa,root,door,hinge,model,ramp,foot,stack,crates,crew,n,out,inCount:0,lost:0,toppled:false,phys:[],parts:[],bits:[],fired:{},closeT:-1,t:0,finished:false,sub:''};
    const u=goods.reduce((s,g)=>s+g.qty,0);
    S.sub=goods.length===1?`${goods[0].qty}× ${goods[0].good}`:`${goods.length} contracts · ${u} units`;
    api.sub=S.sub;
    return true;
  }

  function stop(){
    if(!S) return; const kill=o=>o.traverse(q=>{ if(q.geometry) q.geometry.dispose(); if(q.material){ (Array.isArray(q.material)?q.material:[q.material]).forEach(m=>{ if(m.map) m.map.dispose(); m.dispose(); }); } });
    for(const c of S.crew) S.root.remove(c.F); // their materials are shared with the shop folk
    if(S.root.parent) S.root.parent.remove(S.root); kill(S.root); if(S.door.parent) S.door.parent.remove(S.door); kill(S.door); S=null;
  }

  const once=k=>{ if(S.fired[k]) return false; S.fired[k]=1; return true; };
  const say=line=>Cine.ui(true,'Loading cargo',line);
  const live=()=>G.mode==='takeoff'&&Cine.mode==='L';
  const _fl=new V3();
  function toss(o,v,w,gy,onHit){ const p={o,v:v.clone(),w:w?w.clone():new V3(),gy,hit:0,onHit,rest:0}; S.phys.push(p); return p; }
  function puff(pos,col,n,spd,size,life){ for(let i=0;i<n;i++){ const m=new THREE.MeshBasicMaterial({color:C(col),transparent:true,opacity:0.6,depthWrite:false});
    const o=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),m); o.position.copy(pos); o.scale.setScalar(size*(0.6+Math.random()*0.6)); S.root.add(o);
    S.parts.push({o,v:new V3(rnd(-1,1),rnd(0,0.8),rnd(-1,1)).normalize().multiplyScalar(spd*(0.5+Math.random()*0.8)),life:life*(0.7+Math.random()*0.6),age:0}); } }

  /* a loader walks a list of points; returns true when it arrives */
  function go(c, pts){ c.path={pts,seg:0,u:0}; c.st='walk'; }
  function stepWalk(c, dt){
    const p=c.path, F=c.F; if(p.seg>=p.pts.length){ c.path=null; return true; }
    const tgt=p.pts[p.seg], cur=F.position, d=tgt.clone().sub(cur), hd=Math.hypot(d.x,d.z), ramp=cur.y>0.05||tgt.y>0.05, sp=ramp?CLIMB:WALK, stepL=sp*dt;
    if(hd>0.02) F.rotation.y=Math.atan2(d.x,d.z);
    if(d.length()<=stepL){ cur.copy(tgt); p.seg++; } else cur.addScaledVector(d.normalize(),stepL);
    c.onRamp=cur.y>0.05; c.ph+=dt*10; Folk.walk(F,c.ph,1); return false;
  }
  const carryPos=(c)=>{ const F=c.F, ry=F.rotation.y; return new V3(F.position.x+Math.sin(ry)*0.66,F.position.y+1.06,F.position.z+Math.cos(ry)*0.66); };

  function assign(c){
    const left=S.crates.filter(x=>!x.taken&&!x.phys); if(!left.length) return S.crates.some(x=>!x.taken)?'later':false;
    let k;
    if(S.out==='topple'&&!S.toppled&&!S.fired.pickBottom){ S.fired.pickBottom=1; k=left.reduce((a,b)=>a.o.position.y<b.o.position.y?a:b); k.bottom=true; }
    else k=left.reduce((a,b)=>a.o.position.y>b.o.position.y?a:b);
    k.taken=true; if(S.out==='tumble'&&S.crates.every(x=>x.taken)) k.fail=true;
    c.crate=k; const cp=k.o.position, from=c.F.position, dir=new V3(from.x-cp.x,0,from.z-cp.z); if(dir.lengthSq()<0.01) dir.set(1,0,0); dir.normalize();
    c.pickAt=new V3(cp.x,0,cp.z).addScaledVector(dir,0.95); c.leg='pick'; go(c,[c.pickAt]); return true;
  }

  function topple(except){
    S.toppled=true; S.crates.forEach(x=>{ if(x===except||x.taken) return; const h=x.o.position.y;
      x.phys=toss(x.o,new V3(rnd(0.4,2.4),rnd(0.5,2),rnd(-2.2,2.2)).multiplyScalar(0.6+h*0.35),new V3(rnd(-7,7),rnd(-3,3),rnd(-7,7)),CS/2,p=>{ if(p.hit===1&&live()) Sfx.crash(0.45); }); });
    if(live()) Sfx.crash(0.7); setTimeout(()=>{ if(S&&live()) void 0; },700);
    S.crew.forEach(o=>{ Folk.mood(o.F,'shock'); if(o!==S.crew.find(q=>q.crate===except)){ o.act='gasp'; o.actT=0; } });
    say('The stack had other ideas.');
  }

  function burst(x){
    x.o.visible=false; S.lost++; const at=x.o.position.clone(); if(live()){ Sfx.crash(1); setTimeout(()=>{ if(S&&live()) void 0; },500); }
    puff(at.clone().setY(0.3),'#c9b79a',10,2.2,0.32,1.1);
    for(let i=0;i<12;i++){ const s=0.16+Math.random()*0.16, o=new THREE.Mesh(i%3?new THREE.BoxGeometry(s,s,s):new THREE.SphereGeometry(s*0.6,8,6),M(i%2?x.col:pick(['#ffd43b','#f8f9fa','#4dabf7','#ff6b6b']),0.6,0.05)); o.castShadow=true;
      o.position.copy(at); S.root.add(o); S.bits.push(o); toss(o,new V3(rnd(-1.5,3.5),rnd(2,5),rnd(-3,3)),new V3(rnd(-9,9),rnd(-9,9),rnd(-9,9)),s/2); }
    for(let i=0;i<4;i++){ const o=new THREE.Mesh(new THREE.BoxGeometry(CS,0.08,CS*0.3),M('#b9823f',0.85,0.02)); o.position.copy(at); S.root.add(o); toss(o,new V3(rnd(-2,2),rnd(1.5,3.5),rnd(-2,2)),new V3(rnd(-6,6),rnd(-6,6),rnd(-6,6)),0.04); }
    S.crew.forEach(o=>{ Folk.mood(o.F,o.crate?'shock':'sad'); if(!o.crate){ o.act='facepalm'; o.actT=0; } }); say('One crate took the quick way down. Most of it is still in the box.');
  }

  function update(dt, t, time){
    S.t=t; const D=S.D, H=S.hinge;
    // hatch
    if(S.closeT<0){ const u=P_(t,0.2,1.3); H.rotation.z=lerp(Math.PI/2,-S.a,E(u))+(u>=1?Math.sin((t-1.3)*16)*Math.exp(-(t-1.3)*5)*0.04:0);
      if(t>0.2&&once('hiss')&&live()) Sfx.hiss(1.1,0.14); if(t>1.3&&once('clunk')&&live()) Sfx.clunk(); }
    else { const u=P_(t,S.closeT,S.closeT+1.0); H.rotation.z=lerp(-S.a,Math.PI/2,E(u)); if(u>=1&&once('shut')&&live()) Sfx.clunk(); }

    // dockhands
    for(const c of S.crew){ const F=c.F; Folk.blink(F,time);
      if(c.act){ c.actT+=dt; const k=c.actT;
        if(c.act==='gasp'){ Folk.walk(F,0,0); F.userData.rig.position.y=k<0.3?Math.sin(k/0.3*Math.PI)*0.35:0; Folk.arms(F,[0.4,1.9],[0.4,1.9]); if(k>1.3){ c.act=null; Folk.rest(F); } continue; }
        if(c.act==='facepalm'){ Folk.walk(F,0,0); Folk.arms(F,[2.6,0.4],[k<1.1?2.6:0.2,0.4]); if(k>1.3){ c.act=null; Folk.rest(F); } continue; }
        if(c.act==='cheer'){ F.userData.rig.position.y=Math.abs(Math.sin(k*7))*0.4; Folk.arms(F,[0.3,2.6],[0.3,2.6]); continue; }
        if(c.act==='mop'){ Folk.arms(F,null,[2.5,0.2+Math.sin(k*9)*0.25]); continue; }
        if(c.act==='shrug'){ Folk.arms(F,[0.5,1.1],[0.5,1.1]); F.userData.head.rotation.z=Math.sin(k*3)*0.15; continue; }
        if(c.act==='wave'){ Folk.walk(F,0,0); Folk.arms(F,null,[0.2,2.4+Math.sin(k*9)*0.35]); continue; }
        if(c.act==='pick'){ const u=E(P_(k,0,0.32)); c.crate.o.position.lerpVectors(c.from,carryPos(c),u); c.crate.o.rotation.set(0,lerp(c.crate.o.rotation.y,F.rotation.y,u),0); Folk.walk(F,0,0); Folk.arms(F,[1.35*u,0.1],[1.35*u,0.1]); F.userData.rig.rotation.x=Math.sin(u*Math.PI)*0.3;
          if(c.crate.bottom&&!S.toppled&&k>0.12) topple(c.crate);
          if(k>=0.32){ c.act=null; F.userData.rig.rotation.x=0; c.leg='up'; go(c,[S.ramp(L+0.3,-LANE).setY(0),S.ramp(L,-LANE),S.ramp(0.6,-LANE)]); } continue; }
        if(c.act==='shove'){ const u=E(P_(k,0,0.4)), x=c.crate.o; x.position.lerpVectors(c.from,new V3(D.x-0.9,D.h+0.16+CS/2,D.z-LANE),u); Folk.walk(F,0,0); Folk.arms(F,[1.35+0.25*u,0.1],[1.35+0.25*u,0.1]);
          if(k>=0.4){ x.visible=false; S.inCount++; c.crate=null; c.act=null; if(live()) Sfx.clunk(); c.leg='down'; go(c,[S.ramp(0.6,LANE),S.ramp(L,LANE),S.ramp(L+0.3,LANE).setY(0),c.rest]); } continue; }
        if(c.act==='slip'){ Folk.walk(F,0,0); Folk.arms(F,[1.6,0.6],[1.6,0.6]); F.userData.rig.rotation.x=-0.25; if(k>0.6){ F.userData.rig.rotation.x=0; c.act='facepalm'; c.actT=0; c.afterAct=()=>{ c.leg='down'; go(c,[S.ramp(0.6,LANE),S.ramp(L,LANE),S.ramp(L+0.3,LANE).setY(0),c.rest]); }; } continue; }
      }
      if(c.afterAct&&!c.act){ const f=c.afterAct; c.afterAct=null; f(); }
      if(c.st==='wait'){ c.wait-=dt; Folk.walk(F,0,0); if(c.crate) Folk.arms(F,[1.35,0.1],[1.35,0.1]); if(c.wait<=0){ const r=assign(c); if(r==='later') c.wait=0.2; else if(!r) c.st='done'; } }
      else if(c.st==='walk'){ const arrived=stepWalk(c,dt); if(c.crate&&c.leg!=='pick'){ Folk.arms(F,[1.35,0.1],[1.35,0.1]); const x=c.crate.o; x.position.copy(carryPos(c)); x.rotation.set(0,F.rotation.y,0); }
        if(arrived){ Folk.walk(F,0,0);
          if(c.leg==='pick'){ const cp=c.crate.o.position; F.rotation.y=Math.atan2(cp.x-F.position.x,cp.z-F.position.z); c.from=cp.clone(); c.act='pick'; c.actT=0; }
          else if(c.leg==='up'){ F.rotation.y=-Math.PI/2; c.from=c.crate.o.position.clone();
            if(c.crate.fail){ const x=c.crate; c.crate=null; x.slide={s:0.6,v:0.5}; c.act='slip'; c.actT=0; if(live()) Sfx.boing(); }
            else { c.act='shove'; c.actT=0; } }
          else if(c.leg==='down'){ c.leg=null; c.st='wait'; c.wait=0.15; F.rotation.y=-Math.PI/2; } } }
      else if(c.st==='done'){ Folk.walk(F,0,0); const back=c.F.position.distanceTo(c.rest)>0.1; if(back){ go(c,[c.rest]); c.leg='home'; } }
      if(c.leg==='home'&&c.st==='walk'&&!c.path){ c.leg=null; c.st='done'; }
    }

    { const fy=S.root.localToWorld(_fl.set(0,0,0)).y; for(const c of S.crew) Folk.ground(c.F,fy); }
    // a crate sliding back down the ramp, then flying off the end
    for(const x of S.crates){ if(!x.slide) continue; const sl=x.slide; sl.v+=GRAV*S.sa*0.8*dt; sl.s+=sl.v*dt; const p=S.ramp(Math.min(sl.s,L),-LANE); x.o.position.set(p.x,p.y+CS/2,p.z); x.o.rotation.set(0,0,-S.a); x.o.rotation.x+=Math.sin(t*30)*0.05;
      if(sl.s>=L){ x.slide=null; x.phys=toss(x.o,new V3(sl.v*S.ca*1.1,sl.v*0.35,rnd(-0.6,0.6)),new V3(rnd(-3,3),rnd(-2,2),-9),CS/2,p=>{ if(p.hit===1){ burst(x); p.dead=true; } }); } }

    // physics and dust
    for(let i=S.phys.length-1;i>=0;i--){ const p=S.phys[i]; if(p.dead){ S.phys.splice(i,1); continue; } p.v.y-=GRAV*dt; p.o.position.addScaledVector(p.v,dt); p.o.rotation.x+=p.w.x*dt; p.o.rotation.y+=p.w.y*dt; p.o.rotation.z+=p.w.z*dt;
      const sink=sinkBelow(p.o,S.root.localToWorld(_fl.set(0,0,0)).y+0.004);
      if(sink>0){ p.o.position.y+=sink; if(p.v.y<0){ if(Math.abs(p.v.y)>1.2||!p.hit){ p.hit++; if(p.onHit) p.onHit(p); } p.v.y=-p.v.y*0.3; p.v.x*=0.5; p.v.z*=0.5; p.w.multiplyScalar(0.45); }
        // crates land flat-ish so they can be picked up again
        if(Math.abs(p.v.y)<0.6&&p.v.lengthSq()<0.3){ p.rest+=dt; if(p.rest>0.15){ p.o.rotation.x=Math.round(p.o.rotation.x/(Math.PI/2))*(Math.PI/2); p.o.rotation.z=Math.round(p.o.rotation.z/(Math.PI/2))*(Math.PI/2); S.phys.splice(i,1); const cr=S.crates.find(x=>x.phys===p); if(cr) cr.phys=null; } } } }
    for(let i=S.parts.length-1;i>=0;i--){ const p=S.parts[i]; p.age+=dt; if(p.age>=p.life){ S.root.remove(p.o); p.o.geometry.dispose(); p.o.material.dispose(); S.parts.splice(i,1); continue; }
      p.o.position.addScaledVector(p.v,dt); p.o.scale.multiplyScalar(1+1.6*dt); p.o.material.opacity=0.6*(1-p.age/p.life); }

    // close up once everything is aboard and nobody is on the ramp
    if(S.closeT<0&&S.inCount+S.lost>=S.n&&S.crew.every(c=>!c.onRamp)&&!S.crew.some(c=>c.act==='facepalm'||c.act==='slip')){ S.closeT=t;
      if(S.out==='ok'){ say('Not a scratch on it. The crew can hardly believe it.'); if(live()) void 0; S.crew.forEach(c=>{ c.act='cheer'; c.actT=0; Folk.mood(c.F,'happy'); }); }
      else if(S.out==='topple'){ say('Everything went in anyway. Nobody needs to know.'); S.crew.forEach(c=>{ c.act='mop'; c.actT=0; Folk.mood(c.F,'worried'); }); }
      else { S.crew.forEach(c=>{ c.act='shrug'; c.actT=0; Folk.mood(c.F,'worried'); }); } }
    if(S.closeT>=0&&t>S.closeT+1.2) S.finished=true;
    if(t>24) S.finished=true;
    return {done:S.finished,...cam(t)};
  }

  /* the dockhands wave the ship off while it lifts */
  function linger(dt, time){ if(!S) return; for(const c of S.crew){ if(c.act!=='wave'){ c.act='wave'; c.actT=Math.random(); Folk.rest(c.F); Folk.mood(c.F,'happy'); } c.actT+=dt; Folk.blink(c.F,time);
    const k=c.actT; Folk.arms(c.F,k>2.2?[2.6,0.5]:null,[0.2,2.4+Math.sin(k*9)*0.35]); }
    for(let i=S.parts.length-1;i>=0;i--){ const p=S.parts[i]; p.age+=dt; if(p.age>=p.life){ S.root.remove(p.o); S.parts.splice(i,1); continue; } p.o.position.addScaledVector(p.v,dt); p.o.material.opacity=0.6*(1-p.age/p.life); } }

  function cam(t){ const D=S.D, f=S.foot, R=S.root; R.updateMatrixWorld();
    const pos=new V3(f.x+11.5+t*0.1, 4.6, D.z-9.5+t*0.06), look=new V3(D.x+3.2, D.h*0.4+1.0, D.z+1.6);
    return {pos:R.localToWorld(pos), look:R.localToWorld(look)}; }

  const api={start, stop, update, linger, sub:'', get on(){ return !!S; }};
  return api;
})();
