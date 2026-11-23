/* ===================== PORT LIFE ===================== */
/* Locals going about their business around your landing pad (strolling, chatting, pushing carts, a marshal waving you
   in with glowing batons) and other ships landing on and taking off from the neighbouring pads. */
const Crowd = (() => {
  let L=null;
  const E=x=>x*x*(3-2*x);
  const ang=(a,b,k)=>{ let d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI; return a+d*k; };

  /* exhaust cones under each landing foot */
  function exhaust(m){ const glow=HDR(m.userData.glow||'#8fd8ff',2.2), fx=new THREE.Group(); m.add(fx); const fl=[];
    for(const p of m.userData.gear.children.filter((c,i)=>i%2===1).map(c=>c.position)){
      const f=new THREE.Mesh(new THREE.ConeGeometry(1.4,10,12,1,true),new THREE.MeshBasicMaterial({color:glow,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
      f.rotation.x=Math.PI; f.position.set(p.x*0.8,-m.userData.gearH*0.4-5,p.z*0.8); fx.add(f); fl.push(f); }
    const pl=new THREE.PointLight(C(m.userData.glow||'#8fd8ff'),0,120,1.5); pl.position.y=-6; fx.add(pl); fx.visible=false; return {fx,fl,pl}; }
  function thrust(sh, k, t){ const x=sh.ex; x.fx.visible=k>0.01; x.fl.forEach((f,i)=>{ const fl=0.85+0.15*Math.sin(t*47+i*2); f.scale.set(1,k*fl,1); f.position.y=-sh.m.userData.gearH*0.4-5*k*fl; }); x.pl.intensity=k*4; }
  function loud(pos, v){ const d=Cine.cam.position.distanceTo(pos); return v*clamp(1-d/520,0,1); }

  function newShip(pad){ if(pad.m){ L.scn.remove(pad.m); } const m=Models.build(Math.floor(Math.random()*Models.count)); m.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    L.scn.add(m); pad.m=m; pad.ex=exhaust(m); return m; }

  function build(scn, P, cloud, pads){
    stop(); L={scn,P,cloud,pads:[],folk:[],t:0};
    // traffic: each neighbouring pad cycles through parked, lifting off, empty, and a new arrival
    pads.forEach((p,i)=>{ const pad={x:p[0],z:p[1],ry:p[2],m:null,ex:null,st:i%2?'parked':'away',t:0,wait:i%2?8+Math.random()*18:3+Math.random()*10,dir:Math.random()*6.283};
      if(pad.st==='parked'){ newShip(pad); pad.m.position.set(pad.x,pad.m.userData.gearH,pad.z); pad.m.rotation.y=pad.ry; } L.pads.push(pad); });
    // locals
    const spOf=k=>k%3===2?pick(SPECIES_KEYS):P.species, rr=mulberry32(P.idx*71+3), ring=()=>spot(rr);
    const add=(kind,pos,sp,seed)=>{ const F=Folk.make(sp,seed,1.3); F.position.copy(pos); F.rotation.y=rr()*6.283; scn.add(F); const a={F,kind,tgt:null,wait:rr()*3,ph:rr()*10,talk:0}; L.folk.push(a); return a; };
    // the marshal stands at the pad edge with glowing batons
    const ma=Math.PI*0.25, M=add('marshal',new V3(Math.cos(ma)*(cloud?46:57),0,Math.sin(ma)*(cloud?46:57)),P.species,P.idx*9+1); M.F.rotation.y=Math.atan2(-M.F.position.x,-M.F.position.z);
    for(const side of [0,1]){ const b=new THREE.Group(); const st=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.7,8),new THREE.MeshBasicMaterial({color:HDR('#ff8a20',3)})); st.position.y=-0.3; b.add(st); Folk.hold(M.F,b,side); }
    for(let i=0;i<5;i++) add('walker',ring(),spOf(i),P.idx*31+i*13);
    for(let j=0;j<2;j++){ const c=ring(), d=new V3(rr()-0.5,0,rr()-0.5).normalize().multiplyScalar(0.95);
      const a=add('chat',c.clone().add(d),spOf(j*2),P.idx*17+j*5), b=add('chat',c.clone().sub(d),spOf(j*2+1),P.idx*17+j*5+2); a.mate=b; b.mate=a; a.talk=1; }
    const cart=add('cart',ring(),P.species,P.idx*5+77), cg=new THREE.Group(); cg.add(Folk.bx(1.1,0.5,0.8,new THREE.MeshStandardMaterial({color:C('#5d6670'),roughness:0.5,metalness:0.5}),0,0.45,0));
    for(const [x,z] of [[-0.4,-0.3],[0.4,-0.3],[-0.4,0.3],[0.4,0.3]]){ const w=Folk.cyl(0.13,0.13,0.08,new THREE.MeshStandardMaterial({color:C('#1c1c1e'),roughness:0.9}),x,0.13,z,14); w.rotation.z=Math.PI/2; cg.add(w); }
    for(let i=0;i<3;i++) cg.add(Folk.bx(0.42,0.42,0.42,new THREE.MeshStandardMaterial({color:C(['#b9823f','#c98d47','#9c6a30'][i]),roughness:0.85}),-0.25+i*0.25,0.92+(i===1?0.42:0),0));
    cg.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); scn.add(cg); cart.cart=cg;
  }
  /* somewhere to stand around the pad: on the ring of ground outside it, clear of the other pads (on a cloud world, the pad rim) */
  function spot(rr){ for(let k=0;k<20;k++){ const a=rr()*6.283, r=L.cloud?41+rr()*6:58+rr()*52, p=new V3(Math.cos(a)*r,0,Math.sin(a)*r);
      if(L.pads.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<38)) continue; if(Math.hypot(p.x+96,p.z+70)<12) continue; return p; } return new V3(60,0,0); }

  function update(dt, t){
    if(!L) return; L.t+=dt;
    for(const pad of L.pads){ pad.t+=dt; const m=pad.m;
      if(pad.st==='parked'){ Models.animate(m,0,t); if(pad.t>pad.wait){ pad.st='up'; pad.t=0; const v=loud(m.position,0.35); if(v>0.02) Sfx.roar(6,v); } }
      else if(pad.st==='up'){ const k=pad.t, gh=m.userData.gearH, y=gh+(k>1?Math.pow(k-1,2.3)*9:0); m.position.set(pad.x,y,pad.z); m.rotation.set(E(clamp((k-1.5)/3,0,1))*0.5,pad.ry+E(clamp((k-1)/4,0,1))*0.6,0);
        // nose over and head off once clear of the pad
        if(k>2){ const fwd=new V3(0,0,-1).applyEuler(m.rotation); m.position.addScaledVector(fwd,Math.pow(k-2,2)*8); }
        thrust(pad,Math.min(1,k/0.6),t); Models.animate(m,0.6,t); if(k>8){ m.visible=false; thrust(pad,0,t); pad.st='away'; pad.t=0; pad.wait=6+Math.random()*16; } }
      else if(pad.st==='away'){ if(pad.t>pad.wait){ newShip(pad); pad.st='down'; pad.t=0; pad.dir=Math.random()*6.283; const v=loud(new V3(pad.x,40,pad.z),0.35); if(v>0.02) Sfx.roar(7,v); } }
      else if(pad.st==='down'){ const D=7.5, u=clamp(pad.t/D,0,1), k=Math.pow(1-u,2.3), gh=m.userData.gearH; m.visible=true;
        m.position.set(pad.x+Math.cos(pad.dir)*170*k,gh+230*k,pad.z+Math.sin(pad.dir)*170*k); m.rotation.set(0.05*(1-u)*Math.sin(t*1.3),pad.ry+(1-u)*1.1,0.04*(1-u)*Math.sin(t*1.7));
        thrust(pad,u<1?0.45+0.55*(1-u):Math.max(0,1-(pad.t-D)*2)*0.45,t); Models.animate(m,0.1,t);
        if(u>=1&&!pad.td){ pad.td=true; const v=loud(m.position,0.6); if(v>0.03) Sfx.thump(v); } if(pad.t>D+0.6){ thrust(pad,0,t); pad.td=false; pad.st='parked'; pad.t=0; pad.wait=14+Math.random()*24; } } }

    for(const a of L.folk){ const F=a.F; Folk.blink(F,t);
      if(a.kind==='marshal'){ const w=Math.sin(t*2.4+a.ph); Folk.arms(F,[0.25,1.5+w*0.9],[0.25,1.5+w*0.9]); F.userData.rig.position.y=Math.abs(Math.sin(t*2.4))*0.04; continue; }
      if(a.kind==='chat'){ const me=a.mate, face=Math.atan2(me.F.position.x-F.position.x,me.F.position.z-F.position.z); F.rotation.y=ang(F.rotation.y,face,1-Math.exp(-dt*4));
        const turn=Math.floor((t+a.ph*0.1)/2.6)%2===(a.talk?0:1);
        if(turn){ const g=Math.sin(t*5+a.ph); Folk.arms(F,[0.7+g*0.4,0.5+Math.max(0,g)*0.6],[0.5-g*0.3,0.3]); F.userData.head.rotation.x=Math.sin(t*6)*0.06; if(F.userData.mood==='neutral'||Math.random()<dt*0.3) Folk.mood(F,pick(['happy','shock','happy','worried'])); }
        else { Folk.arms(F,[0.15,0.15],[0.15,0.15]); F.userData.head.rotation.x=Math.max(0,Math.sin(t*3))*0.15; if(F.userData.mood!=='neutral'&&Math.random()<dt*0.5) Folk.mood(F,Math.random()<0.5?'happy':'neutral'); }
        continue; }
      // walkers and the cart pusher stroll between spots and pause to look around
      if(a.wait>0){ a.wait-=dt; Folk.walk(F,0,0); F.userData.head.rotation.y=Math.sin(t*0.7+a.ph)*0.5; if(a.cart) Folk.arms(F,[1.1,0.15],[1.1,0.15]); }
      else { if(!a.tgt) a.tgt=spot(Math.random); const d=a.tgt.clone().sub(F.position); d.y=0; const dist=d.length(), sp=a.cart?1.6:2.3;
        if(dist<0.3){ a.tgt=null; a.wait=1+Math.random()*4; } else { F.rotation.y=ang(F.rotation.y,Math.atan2(d.x,d.z),1-Math.exp(-dt*5)); const fwd=new V3(Math.sin(F.rotation.y),0,Math.cos(F.rotation.y)); F.position.addScaledVector(fwd,Math.min(dist,sp*dt)); a.ph+=dt*9; Folk.walk(F,a.ph,1); F.userData.head.rotation.y=0; if(a.cart) Folk.arms(F,[1.1,0.15],[1.1,0.15]); } }
      if(a.cart){ const ry=F.rotation.y; a.cart.position.set(F.position.x+Math.sin(ry)*1.5,0,F.position.z+Math.cos(ry)*1.5); a.cart.rotation.y=ry; } }
  }
  function stop(){ L=null; }
  return {build, update, stop, exhaust};
})();
