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

  function build(scn, P, cloud, pads, hAt, liq){
    stop(); L={scn,P,cloud,pads:[],folk:[],t:0,cars:[],trucks:[]};
    traffic(scn,P,cloud,hAt,liq==null?-1e9:liq);
    // traffic: each neighbouring pad cycles through parked, lifting off, empty, and a new arrival
    pads.forEach((p,i)=>{ const pad={x:p[0],z:p[1],ry:p[2],m:null,ex:null,st:i%2?'parked':'away',t:0,wait:i%2?8+Math.random()*18:3+Math.random()*10,dir:Math.random()*6.283};
      if(pad.st==='parked'){ newShip(pad); pad.m.position.set(pad.x,pad.m.userData.gearH,pad.z); pad.m.rotation.y=pad.ry; } L.pads.push(pad); });
    // locals
    const spOf=k=>k%3===2?pick(ALIEN_POOL):P.species, rr=mulberry32(P.idx*71+3), ring=()=>spot(rr);
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
    if(!L) return; L.t+=dt; stepTraffic(dt,t);
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

    for(const a of L.folk){ const F=a.F; Folk.blink(F,t); if(F.userData.tent.length) Folk.ground(F,0);
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
  /* ---------- the town at work: roads out to every shop with hover-trucks on them, and air-cars circling the port in
     lanes at different heights. Seen best on the way up, when the whole port is laid out below you. ---------- */
  function roadTex(){ const cv=makeCanvas(64,256), x=cv.getContext('2d'); x.fillStyle='#2b2d31'; x.fillRect(0,0,64,256); x.fillStyle='#d8d4c8'; x.fillRect(2,0,4,256); x.fillRect(58,0,4,256);
    x.fillStyle='#f2c14e'; for(let y=0;y<256;y+=64) x.fillRect(29,y+8,6,36); const t=canvasTex(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; }
  function vehicle(col, truck){ const g=new THREE.Group(), body=new THREE.MeshStandardMaterial({color:C(col),roughness:0.4,metalness:0.4}), dark=new THREE.MeshStandardMaterial({color:C('#1e2126'),roughness:0.6,metalness:0.3});
    const glass=new THREE.MeshStandardMaterial({color:C('#9fd8ff'),roughness:0.1,metalness:0.6}), head=new THREE.MeshBasicMaterial({color:HDR('#fff2c8',3)}), tail=new THREE.MeshBasicMaterial({color:HDR('#ff4030',3)}), under=new THREE.MeshBasicMaterial({color:HDR('#7fd0ff',2)});
    if(truck){ g.add(Folk.rbox(2.6,1.9,5.4,0.3,body,0,1.6,0.6)); g.add(Folk.rbox(2.4,1.5,2.0,0.4,body,0,1.4,-2.6)); g.add(Folk.bx(2.0,0.6,0.1,glass,0,1.7,-3.62)); for(const sx of [-1,1]){ g.add(Folk.bx(0.4,0.25,0.1,head,sx*0.85,1.0,-3.65)); g.add(Folk.bx(0.4,0.25,0.1,tail,sx*0.95,1.0,3.35)); }
      g.add(Folk.bx(2.2,0.15,7.4,under,0,0.45,-0.3)); g.add(Folk.bx(2.66,0.3,5.0,dark,0,0.75,0.6)); }
    else { g.add(Folk.rbox(2.2,1.0,4.2,0.45,body,0,0,0)); g.add(Folk.sph(0.85,glass,0,0.55,-0.3,18,12)); g.children[1].scale.set(1,0.6,1.3); for(const sx of [-1,1]){ g.add(Folk.bx(0.35,0.2,0.1,head,sx*0.7,0,-2.12)); g.add(Folk.bx(0.4,0.2,0.1,tail,sx*0.75,0,2.12)); }
      g.add(Folk.cyl(0.9,0.6,0.25,under,0,-0.6,0,16)); }
    g.traverse(o=>{ if(o.isMesh&&!o.material.isMeshBasicMaterial) o.castShadow=true; }); return g; }
  function traffic(scn, P, cloud, hAt, liq){
    const rr=mulberry32(P.idx*991+17), cols=['#e8eaee','#ffd23f','#ef476f','#26a0d0','#7bd389','#f78c3b','#9b8cff'];
    // air lanes: rings around the port at different heights and speeds, half of them flying the other way
    for(let i=0;i<12;i++){ const m=vehicle(cols[i%cols.length],false); m.scale.setScalar(2.6); scn.add(m); L.cars.push({m,r:140+rr()*520,y:(cloud?10:30)+rr()*240,w:(rr()<0.5?-1:1)*(0.05+rr()*0.06),a:rr()*6.283,bob:rr()*6}); }
    if(cloud||!hAt) return;
    // roads from the pad's edge out to each shop's terrace, laid on the ground (bridged over water)
    const mat=new THREE.MeshStandardMaterial({map:roadTex(),roughness:0.9,metalness:0.05}), W=11;
    for(const V of Venues.list){ const to=V.root.position, d=Math.hypot(to.x,to.z), ux=to.x/d, uz=to.z/d, r0=58, r1=Math.max(r0+20,d-31), n=Math.max(4,Math.ceil((r1-r0)/9)), pts=[];
      for(let k=0;k<=n;k++){ const r=lerp(r0,r1,k/n), x=ux*r, z=uz*r; let y=Math.max(hAt(x,z),liq+0.8); if(k===0) y=Math.max(y,0); if(k>n-3) y=lerp(y,to.y,(k-(n-3))/3); pts.push(new V3(x,y+0.25,z)); }
      const pos=[], uv=[], idx=[]; let len=0; const px=-uz*W/2, pz=ux*W/2;
      pts.forEach((p,k)=>{ if(k) len+=p.distanceTo(pts[k-1]); pos.push(p.x+px,p.y,p.z+pz, p.x-px,p.y,p.z-pz); uv.push(0,len/14, 1,len/14); if(k){ const b=(k-1)*2; idx.push(b,b+2,b+1, b+1,b+2,b+3); } });
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geo.setIndex(idx); geo.computeVertexNormals();
      const road=new THREE.Mesh(geo,mat); road.receiveShadow=true; scn.add(road);
      // street lamps along the way, and a couple of trucks shuttling between the pad and the shop
      for(let k=2;k<pts.length-1;k+=4){ const p=pts[k], sx=k%8?1:-1; const lamp=Folk.cyl(0.15,0.2,6,new THREE.MeshStandardMaterial({color:C('#3d4147'),roughness:0.5,metalness:0.6}),p.x+px*0.62*sx,p.y+3,p.z+pz*0.62*sx,8); scn.add(lamp); scn.add(Folk.sph(0.5,new THREE.MeshBasicMaterial({color:HDR('#ffe2b8',2.4)}),lamp.position.x,p.y+6.2,lamp.position.z,10,8)); }
      for(let j=0;j<2;j++){ const m=vehicle(cols[(j*3+Venues.list.indexOf(V))%cols.length],true); m.scale.setScalar(1.5); scn.add(m); L.trucks.push({m,pts,len,s:rr()*len,dir:j?1:-1,v:9+rr()*5,lane:j?1:-1,ux,uz}); } }
  }
  function stepTraffic(dt, t){
    for(const c of L.cars){ c.a+=c.w*dt; const x=Math.cos(c.a)*c.r, z=Math.sin(c.a)*c.r; c.m.position.set(x,c.y+Math.sin(t*0.8+c.bob)*2,z); c.m.rotation.set(0,Math.atan2(-Math.sin(c.a)*c.w,Math.cos(c.a)*c.w)+Math.PI,-Math.sign(c.w)*0.18); }
    for(const k of L.trucks){ k.s+=k.dir*k.v*dt; if(k.s>k.len){ k.s=k.len; k.dir=-1; } if(k.s<0){ k.s=0; k.dir=1; }
      let acc=0, i=1; for(;i<k.pts.length;i++){ const sl=k.pts[i].distanceTo(k.pts[i-1]); if(acc+sl>=k.s) break; acc+=sl; } i=Math.min(i,k.pts.length-1);
      const a=k.pts[i-1], b=k.pts[i], u=clamp((k.s-acc)/Math.max(0.01,a.distanceTo(b)),0,1), side=k.dir*2.6;
      k.m.position.set(lerp(a.x,b.x,u)+k.uz*side,lerp(a.y,b.y,u)+0.1+Math.sin(t*3+k.s)*0.05,lerp(a.z,b.z,u)-k.ux*side);
      k.m.rotation.set(0,Math.atan2(-(b.x-a.x)*k.dir,-(b.z-a.z)*k.dir),0); }
  }
  function stop(){ L=null; }
  return {build, update, stop, exhaust};
})();
