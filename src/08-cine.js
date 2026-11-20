/* ===================== CUTSCENES + SPACEPORT ===================== */
const Cine = {
  cam:new THREE.PerspectiveCamera(42,1,1,3e7), mode:null, t:0, P:null, surf:null, model:null, modelId:-1, fade:0, fadeCol:new THREE.Color(0,0,0), shake:0, landed:false, orbit:0, preview:null,

  setModel(shipId){
    if(this.model && this.model.parent) this.model.parent.remove(this.model);
    const m=this.model=Models.build(SHIPS[shipId].model); this.modelId=shipId; m.visible=false; World.space.add(m);
    const glow=HDR(m.userData.glow,2.4), fx=new THREE.Group(); m.add(fx); m.userData.fx=fx; m.userData.flames=[];
    const feet=m.userData.gear.children.filter((c,i)=>i%2===1).map(c=>c.position);
    for(const p of feet){ const f=new THREE.Mesh(new THREE.ConeGeometry(1.5,12,14,1,true),new THREE.MeshBasicMaterial({color:glow.clone(),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
      f.rotation.x=Math.PI; f.position.set(p.x*0.8,-m.userData.gearH*0.4-6,p.z*0.8); fx.add(f); m.userData.flames.push(f); }
    const pl=new THREE.PointLight(C(m.userData.glow),0,160,1.5); pl.position.y=-8; fx.add(pl); m.userData.fxLight=pl; fx.visible=false;
    this.plasmaMat=new THREE.ShaderMaterial({vertexShader:GLSL.plasmaVert,fragmentShader:GLSL.plasmaFrag,uniforms:{uI:{value:0},uTime:{value:0}},transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const box=new THREE.Box3().setFromObject(m), sz=box.getSize(new V3());
    this.plasma=new THREE.Mesh(new THREE.SphereGeometry(1,28,18),this.plasmaMat); this.plasma.scale.set(sz.x*0.6,sz.y*0.8,sz.z*0.8); this.plasma.position.z=sz.z*0.14; this.plasma.visible=false; m.add(this.plasma);
  },

  /* ---------- surface ---------- */
  buildSurface(P){
    if(this.surf){ if(this.model && this.model.parent===this.surf.scene) World.space.add(this.model); if(this.preview){ this.preview=null; }
      this.surf.scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material){ const ms=Array.isArray(o.material)?o.material:[o.material]; ms.forEach(m=>m.dispose()); } }); if(this.surf.env) this.surf.env.dispose(); }
    const S=P.surf, scn=new THREE.Scene(), seed=P.idx*977+5, rr=mulberry32(seed), cloud=!!S.cloudsea, spc=SPECIES[P.species];
    const sunDir=new V3(Math.cos(P.idx*1.7)*0.75,0.36+0.16*Math.sin(P.idx*2.3),Math.sin(P.idx*1.7)*0.75).normalize();
    const skyU={cZen:{value:C(S.zen)},cHor:{value:C(S.hor)},uSun:{value:sunDir},cSun:{value:C('#fff0d8')},uStars:{value:P.atm<0.75?1:0.15},uMax:{value:3}};
    const skyMat=new THREE.ShaderMaterial({vertexShader:GLSL.skyVert,fragmentShader:GLSL.groundSkyFrag,uniforms:skyU,side:THREE.BackSide,depthWrite:false});
    const sky=new THREE.Mesh(new THREE.SphereGeometry(26000,48,32),skyMat); scn.add(sky);
    // reflection map: render the sky to a float cube first (a raw shader cannot be fed to PMREM's fromScene directly)
    const es=new THREE.Scene(); es.add(new THREE.Mesh(sky.geometry,skyMat)); const crt=new THREE.WebGLCubeRenderTarget(128,{type:THREE.HalfFloatType,format:THREE.RGBAFormat,generateMipmaps:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
    new THREE.CubeCamera(10,60000,crt).update(World.renderer,es); const pm=new THREE.PMREMGenerator(World.renderer); const env=pm.fromCubemap(crt.texture).texture; pm.dispose(); crt.dispose(); scn.environment=env; skyU.uMax.value=40;
    scn.fog=new THREE.FogExp2(C(S.hor),S.fog);
    scn.add(new THREE.HemisphereLight(C(S.hor),C(S.g[0]),0.32));
    const sun=new THREE.DirectionalLight(C('#fff2dc'),S.lava?1.1:1.9); sun.position.copy(sunDir).multiplyScalar(320); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
    const sc=sun.shadow.camera; sc.left=-110; sc.right=110; sc.top=110; sc.bottom=-110; sc.near=60; sc.far=800; sun.shadow.bias=-0.0005; sun.shadow.normalBias=0.4; sun.shadow.radius=3; scn.add(sun); scn.add(sun.target);
    const liq=S.liquid?-20:-1e9;
    const hAt=(x,z)=>{ const d=Math.hypot(x,z), n=fbm2(x*0.0011+31,z*0.0011+17,seed,5), rd=1-Math.abs(2*fbm2(x*0.0023+5,z*0.0023+9,seed+3,4)-1);
      const h=(n*0.75+rd*0.25-0.5)*S.amp*2.4+smooth(1200,4300,d)*S.amp*1.6*n; return cloud? -560+h*0.55 : h*smooth(150,800,d); };
    // terrain
    const seg=190, size=10000, tg=new THREE.PlaneGeometry(size,size,seg,seg); tg.rotateX(-Math.PI/2); const pa=tg.attributes.position, cols=new Float32Array(pa.count*3), g0=C(S.g[0]), g1=C(S.g[1]), g2=C(S.g[2]), tc=new THREE.Color();
    for(let i=0;i<pa.count;i++){ const x=pa.getX(i), z=pa.getZ(i), h=hAt(x,z); pa.setY(i,h); let t=clamp(0.5+(cloud?(h+560):h)/(S.amp*2.0)+(vnoise(x*0.02,z*0.02,seed)-0.5)*0.3,0,1);
      if(t<0.5) tc.copy(g0).lerp(g1,t*2); else tc.copy(g1).lerp(g2,(t-0.5)*2); cols[i*3]=tc.r; cols[i*3+1]=tc.g; cols[i*3+2]=tc.b; }
    tg.setAttribute('color',new THREE.BufferAttribute(cols,3)); tg.computeVertexNormals();
    const gcv=makeCanvas(256,256), gx=gcv.getContext('2d'), gi=gx.createImageData(256,256), gr=mulberry32(3); for(let i=0;i<gi.data.length;i+=4){ const v=222+gr()*33; gi.data[i]=gi.data[i+1]=gi.data[i+2]=v; gi.data[i+3]=255; } gx.putImageData(gi,0,0);
    const gt=canvasTex(gcv); gt.wrapS=gt.wrapT=THREE.RepeatWrapping; gt.repeat.set(90,90);
    const terr=new THREE.Mesh(tg,new THREE.MeshStandardMaterial({vertexColors:true,map:gt,roughness:cloud?1:0.94,metalness:0})); terr.receiveShadow=true; scn.add(terr);
    if(S.liquid){ const lm=S.lava?new THREE.MeshBasicMaterial({color:HDR(S.liquid,2.6)}):new THREE.MeshStandardMaterial({color:C(S.liquid),roughness:0.06,metalness:0.55,envMapIntensity:1.4});
      const l=new THREE.Mesh(new THREE.PlaneGeometry(26000,26000),lm); l.rotation.x=-Math.PI/2; l.position.y=liq; scn.add(l); if(S.lava){ const ll=new THREE.HemisphereLight(C('#000000'),C(S.liquid),1.1); scn.add(ll); } }
    // pad
    const pcv=makeCanvas(512,512), px=pcv.getContext('2d'); px.fillStyle='#34363a'; px.fillRect(0,0,512,512); const pr=mulberry32(seed+1);
    for(let i=0;i<5000;i++){ px.fillStyle=`rgba(${pr()<0.5?0:255},${pr()<0.5?0:255},${pr()<0.5?0:255},${pr()*0.06})`; px.fillRect(pr()*512,pr()*512,3,3); }
    px.strokeStyle='#e8b820'; px.lineWidth=14; px.beginPath(); px.arc(256,256,214,0,7); px.stroke(); px.lineWidth=6; px.beginPath(); px.arc(256,256,120,0,7); px.stroke();
    for(let i=0;i<24;i++){ const a=i/24*6.283; px.save(); px.translate(256+Math.cos(a)*238,256+Math.sin(a)*238); px.rotate(a); px.fillStyle=i%2?'#e8b820':'#1a1a1a'; px.fillRect(-10,-16,20,32); px.restore(); }
    drawGlyphs(px,P.port.slice(0,3),190,210,90,P.species,'#f2f2f2',200);
    const padTop=new THREE.MeshStandardMaterial({map:canvasTex(pcv),roughness:0.85,metalness:0.1}), padSide=new THREE.MeshStandardMaterial({color:C('#2a2c30'),roughness:0.8,metalness:0.3});
    const pad=new THREE.Mesh(new THREE.CylinderGeometry(50,54,5,56),[padSide,padTop,padSide]); pad.position.y=-2.5; pad.receiveShadow=true; scn.add(pad);
    if(cloud){ const py=new THREE.Mesh(new THREE.CylinderGeometry(9,16,900,20),padSide); py.position.y=-455; scn.add(py); const rg=new THREE.Mesh(new THREE.TorusGeometry(58,3,10,48),padSide); rg.rotation.x=Math.PI/2; rg.position.y=-6; scn.add(rg); }
    const lamps=[]; for(let i=0;i<20;i++){ const a=i/20*6.283, lm=new THREE.Mesh(new THREE.SphereGeometry(0.45,8,6),new THREE.MeshBasicMaterial({color:0xffffff})); lm.position.set(Math.cos(a)*47,0.35,Math.sin(a)*47); scn.add(lm); lamps.push(lm); }
    // buildings
    const bm=(hex,rough=0.7,metal=0.2,ex)=>new THREE.MeshStandardMaterial(Object.assign({color:C(hex),roughness:rough,metalness:metal},ex||{}));
    const win=new THREE.MeshBasicMaterial({color:HDR(spc.col,1.8)}), warm=new THREE.MeshBasicMaterial({color:HDR('#ffd9a0',2)});
    const mk=(geo,mat,x=0,y=0,z=0)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; return m; };
    const building=()=>{ const b=new THREE.Group(), st=S.style;
      if(st==='block'){ const w=14+rr()*18, h=16+rr()*60, d=14+rr()*18; b.add(mk(new THREE.BoxGeometry(w,h,d),bm(pick(['#c9c4b8','#8a9098','#b55a4a','#d8d4c8']),0.6,0.3),0,h/2,0)); for(let y=5;y<h-3;y+=7) b.add(mk(new THREE.BoxGeometry(w+0.3,1.6,d+0.3),rr()<0.7?warm:win,0,y,0)); b.add(mk(new THREE.BoxGeometry(w*0.5,h*0.25,0.4),win,0,h*0.5,d/2+0.3)); }
      else if(st==='slab'){ for(let i=0;i<3;i++){ const h=30+rr()*80, s=mk(new THREE.BoxGeometry(10+rr()*16,h,6+rr()*10),bm('#2a221e',0.9,0.1),(rr()-0.5)*20,h/2-4,(rr()-0.5)*20); s.rotation.set((rr()-0.5)*0.3,rr()*3,(rr()-0.5)*0.4); b.add(s); const cr=mk(new THREE.BoxGeometry(1,h*0.7,0.6),new THREE.MeshBasicMaterial({color:HDR('#ff5a10',3)}),s.position.x,h/2-4,s.position.z); cr.rotation.copy(s.rotation); cr.translateZ(5.2+rr()*3); b.add(cr); } }
      else if(st==='spire'){ const h=60+rr()*130, r=6+rr()*8; b.add(mk(new THREE.CylinderGeometry(r*0.25,r,h,10),bm(pick([S.g[1],S.g[2],'#e8dcc8']),0.5,0.4),0,h/2,0)); for(let k=1;k<4;k++){ const rg=mk(new THREE.TorusGeometry(r*(1.3-k*0.22),0.8,6,24),win,0,h*k/4.2,0); rg.rotation.x=Math.PI/2; b.add(rg); } b.add(mk(new THREE.SphereGeometry(2,10,8),warm,0,h+1,0)); }
      else if(st==='bubble'){ const n=2+Math.floor(rr()*3); for(let i=0;i<n;i++){ const r=10+rr()*18, x=(rr()-0.5)*30, z=(rr()-0.5)*30; b.add(mk(new THREE.SphereGeometry(r,24,16),bm(spc.col,0.08,0.3,{transparent:true,opacity:0.5,envMapIntensity:2}),x,r*0.6,z)); b.add(mk(new THREE.SphereGeometry(r*0.3,10,8),win,x,r*0.55,z)); } }
      else if(st==='shroom'){ const h=20+rr()*60, r=10+rr()*22; b.add(mk(new THREE.CylinderGeometry(r*0.18,r*0.28,h,10),bm('#e9dcc0',0.8,0),0,h/2,0)); const cap=mk(new THREE.SphereGeometry(r,20,12,0,6.3,0,Math.PI/2),bm(pick(['#b5503a','#c98a3a','#7a5ca0']),0.7,0),0,h-2,0); cap.scale.y=0.6; b.add(cap); for(let i=0;i<7;i++){ const a=rr()*6.28, e=0.3+rr()*0.9; b.add(mk(new THREE.SphereGeometry(r*0.09,8,6),win,Math.cos(a)*Math.sin(e)*r,h-2+Math.cos(e)*r*0.6,Math.sin(a)*Math.sin(e)*r)); } }
      else { const r=12+rr()*16; b.add(mk(new THREE.SphereGeometry(r,24,14,0,6.3,0,Math.PI/2),bm('#f2f4f6',0.5,0.1),0,0,0)); const band=mk(new THREE.CylinderGeometry(r*0.985,r*0.985,1.8,32,1,true),warm,0,r*0.2,0); b.add(band); b.add(mk(new THREE.CylinderGeometry(1.2,1.2,r*0.7,8),bm('#8a9098'),r*0.4,r*0.9,0)); }
      return b; };
    for(let i=0;i<16;i++){ const a=rr()*6.283, d=170+rr()*380, x=Math.cos(a)*d, z=Math.sin(a)*d; let y=hAt(x,z); const b=building();
      if(cloud){ y=-10-rr()*60; const pf=mk(new THREE.CylinderGeometry(40,30,8,24),padSide,0,-4,0); b.add(pf); b.add(mk(new THREE.CylinderGeometry(4,8,700,10),padSide,0,-358,0)); } else if(y<liq+2 && S.style!=='bubble') continue; else if(y<liq+2) y=liq-4;
      b.position.set(x,y-2,z); b.rotation.y=rr()*6.28; scn.add(b); }
    // control tower + beacon
    const tw=new THREE.Group(); tw.add(mk(new THREE.CylinderGeometry(3,5,64,12),bm('#9aa0a8',0.5,0.5),0,32,0)); tw.add(mk(new THREE.CylinderGeometry(9,6,8,16),bm('#d8dce0',0.4,0.5),0,68,0)); tw.add(mk(new THREE.CylinderGeometry(9.1,7.6,3,16,1,true),warm,0,68,0));
    const beacon=mk(new THREE.SphereGeometry(1.4,10,8),new THREE.MeshBasicMaterial({color:HDR('#ff3020',6)}),0,76,0); tw.add(beacon); tw.position.set(-96,cloud?-3:0,-70); scn.add(tw);
    // neighbours parked nearby
    const parked=[]; for(const [x,z,ry] of [[118,74,2.2],[-60,128,-0.6]]){ const idx=Math.floor(rr()*Models.count), n=Models.build(idx); n.position.set(x,n.userData.gearH+(cloud?0:0),z); n.rotation.y=ry; scn.add(n); parked.push(n);
      const pp=mk(new THREE.CylinderGeometry(30,32,3,32),padSide,x,-1.6,z); pp.castShadow=false; scn.add(pp); if(cloud) scn.add(mk(new THREE.CylinderGeometry(5,9,700,10),padSide,x,-353,z)); }
    const flyby=Models.build(Math.floor(rr()*5)); flyby.scale.setScalar(1.5); scn.add(flyby);
    // dust
    const dn=380, dp=new Float32Array(dn*3), dseed=new Float32Array(dn*3); for(let i=0;i<dn;i++){ dseed[i*3]=rr()*6.283; dseed[i*3+1]=rr(); dseed[i*3+2]=rr(); }
    const dg=new THREE.BufferGeometry(); dg.setAttribute('position',new THREE.BufferAttribute(dp,3));
    const dustMat=new THREE.PointsMaterial({map:softDotTex(),size:16,transparent:true,opacity:0,depthWrite:false,color:cloud?C('#ffffff'):C(S.g[1]).multiplyScalar(1.6),sizeAttenuation:true}); const dust=new THREE.Points(dg,dustMat); dust.frustumCulled=false; scn.add(dust);
    this.surf={scene:scn,env,lamps,beacon,parked,flyby,dust,dp,dseed,dn,dustMat,P,dustI:0};
  },
  updateSurface(dt, t, alt){
    const s=this.surf; if(!s) return;
    s.lamps.forEach((l,i)=>{ const on=((i+Math.floor(t*10))%5)===0; l.material.color.setRGB(on?3.2:0.35,on?2.6:0.28,on?1.2:0.12); });
    s.beacon.visible=(t%1.6)<0.25;
    const ft=(t*0.02)%1; s.flyby.position.set(-2600+ft*5200,520+Math.sin(ft*6)*60,-1700); s.flyby.rotation.y=-Math.PI/2; Models.animate(s.flyby,0.8,t);
    for(const p of s.parked) Models.animate(p,0,t);
    s.dustMat.opacity=s.dustI*0.42;
    if(s.dustI>0.01){ for(let i=0;i<s.dn;i++){ const a=s.dseed[i*3], ph=(s.dseed[i*3+1]+t*(0.35+s.dseed[i*3+2]*0.35))%1, r=8+ph*95; s.dp[i*3]=Math.cos(a+ph*0.8)*r; s.dp[i*3+1]=0.5+ph*ph*22*s.dseed[i*3+2]; s.dp[i*3+2]=Math.sin(a+ph*0.8)*r; } s.dust.geometry.attributes.position.needsUpdate=true; }
  },
  setThrust(k, t){ const m=this.model; if(!m) return; m.userData.fx.visible=k>0.01; for(const f of m.userData.flames){ const fl=0.85+0.15*Math.sin(t*50+f.id); f.scale.set(1,k*fl,1); f.position.y=-m.userData.gearH*0.4-6*k*fl; f.material.color.copy(HDR(m.userData.glow,1.2+k*2)); } m.userData.fxLight.intensity=k*5; },

  /* ---------- sequences ---------- */
  ui(on, title, sub){ document.body.classList.toggle('cine',on); $('skip').hidden=!on; if(on) $('keys').hidden=true; if(title){ $('cine-h').textContent=title; $('cine-p').textContent=sub; } $('cine-title').classList.toggle('on',!!title); },
  startLanding(P){
    G.mode='landing'; this.mode='A'; this.t=0; this.P=P; this.landed=false; $('tooltip').hidden=true; Comms.close(true); G.ship.warp=false; G.ship.warpF=0;
    if(this.modelId!==G.shipId||!this.model) this.setModel(G.shipId);
    this.buildSurface(P); World.space.add(this.model); this.model.visible=true; this.model.position.set(0,0,0); this.model.rotation.set(0,0,0); this.plasma.visible=false; this.setThrust(0,0);
    const s=G.ship, out=this.out=new V3().subVectors(s.pos,P.pos).normalize(); let up=new V3(0,1,0); if(Math.abs(out.y)>0.9) up.set(1,0,0);
    this.side=new V3().crossVectors(out,up).normalize(); this.up=new V3().crossVectors(this.side,out).normalize();
    this.hA=out.clone().negate().addScaledVector(this.side,0.42).normalize(); this.baseA=P.pos.clone().addScaledVector(out,P.r*2.25); this.qA=lookQuat(this.hA,this.up);
    this.camA=this.baseA.clone().addScaledVector(this.side,19).addScaledVector(this.up,6.5).addScaledVector(this.hA,-6);
    for(const n of Npc.list) n.mk.visible=false; for(const Q of PLANETS) Q.mk.sprite.visible=false;
    this.fade=1; this.fadeCol.setRGB(0,0,0); this.ui(true); Sfx.roar(8.5,0.45); Sfx.sting(); World.scenes.list=[{scene:World.space,camera:this.cam}];
  },
  startTakeoff(){
    G.mode='takeoff'; this.mode='T'; this.t=0; UI.hidePort(); this.ui(true); this.setPreview(null); this.model.visible=true; Sfx.roar(4.5,0.6); Sfx.hiss(1.2,0.2);
  },
  /* drop straight into the port, no descent (used by Continue and Skip) */
  dock(P){
    if(!this.surf||this.surf.P!==P) this.buildSurface(P); if(this.modelId!==G.shipId||!this.model) this.setModel(G.shipId);
    this.P=P; const m=this.model; this.surf.scene.add(m); m.visible=true; m.position.set(0,m.userData.gearH,0); m.rotation.set(0,0.6,0); this.plasma.visible=false; this.setThrust(0,0); this.surf.dustI=0;
    this.mode='port'; this.fade=0; this.shake=0; this.ui(false); World.scenes.list=[{scene:this.surf.scene,camera:this.cam}]; if(!this.landed){ this.landed=true; Game.onLanded(P); }
  },
  skip(){ if(this.mode==='A'||this.mode==='B'||this.mode==='C'){ this.fadeCol.setRGB(0,0,0); this.dock(this.P); this.fade=1; } else if(this.mode==='T'){ this.t=99; } },
  setPreview(shipId){
    if(this.preview){ this.surf.scene.remove(this.preview); this.preview=null; } if(!this.model) return;
    if(shipId==null||shipId===G.shipId){ this.model.visible=true; return; }
    const p=this.preview=Models.build(SHIPS[shipId].model); p.position.set(0,p.userData.gearH,0); p.rotation.y=0.6; this.surf.scene.add(p); this.model.visible=false;
  },
  update(dt, time){
    this.t+=dt; const t=this.t, P=this.P, s=G.ship, cam=this.cam, m=this.model; let fov=42;
    if(this.mode==='A'){
      s.pos.copy(this.baseA).addScaledVector(this.hA,-165+72*t); m.quaternion.copy(this.qA); Models.animate(m,0.85,time);
      cam.position.copy(this.camA).sub(s.pos); cam.up.copy(this.up); cam.lookAt(0,0,0); fov=36; this.fade=Math.max(0,1-t/0.7);
      World.updateDust(this.hA.clone().multiplyScalar(500),dt,0);
      if(t>=4.3){ this.mode='B'; this.t=0; this.fade=0; }
    } else if(this.mode==='B'){
      const alt=P.r*lerp(1.13,1.05,smooth(0,4.2,t)), along=-420+250*t; const lu=this.out.clone().addScaledVector(this.side,along/alt).normalize(); s.pos.copy(P.pos).addScaledVector(lu,alt);
      const tan=this.side.clone().addScaledVector(lu,-this.side.dot(lu)).normalize(), h=tan.clone().addScaledVector(lu,-0.1).normalize(), rgt=new V3().crossVectors(h,lu).normalize();
      m.quaternion.copy(lookQuat(h,lu)); m.rotateZ(Math.sin(time*2.1)*0.04); Models.animate(m,0.3,time);
      const I=smooth(0.2,1.8,t); this.plasma.visible=true; this.plasmaMat.uniforms.uI.value=I; this.plasmaMat.uniforms.uTime.value=time; this.shake=I*0.55;
      cam.up.copy(lu); cam.position.copy(h).multiplyScalar(-36).addScaledVector(lu,9).addScaledVector(rgt,27); cam.lookAt(h.clone().multiplyScalar(8)); fov=lerp(46,54,I);
      World.updateDust(h.clone().multiplyScalar(3200),dt,0);
      this.fadeCol.copy(C(P.surf.hor)).lerp(new THREE.Color(1,1,1),0.35); this.fade=smooth(3.3,4.1,t);
      if(t>=4.2){ this.mode='C'; this.t=0; this.plasma.visible=false; this.surf.scene.add(m); World.scenes.list=[{scene:this.surf.scene,camera:cam}]; this.orbit=0.9; this.td=false; Sfx.hiss(3,0.12); }
    } else if(this.mode==='C'){
      const u=clamp(t/5.8,0,1), k=Math.pow(1-u,2.4), rest=m.userData.gearH; m.position.set(26*k,rest+215*k,-18*k); m.rotation.set(0.07*(1-u)*Math.sin(time*1.3),0.6+(1-u)*0.9,0.05*(1-u)*Math.sin(time*1.7));
      Models.animate(m,0.04,time); this.setThrust(u<1?0.5+0.5*(1-u):Math.max(0,1-(t-5.8)*2.5)*0.5,time); this.surf.dustI=smooth(80,6,m.position.y-rest)*(u<1?1:Math.max(0,1-(t-5.8)*0.6));
      if(u>=1&&!this.td){ this.td=true; Sfx.thump(1); this.shake=0.7; } this.shake=Math.max(0,this.shake-dt*1.2);
      this.fade=Math.max(0,1-t/1.0); const a=this.orbit+u*0.8, R=128-40*u; cam.up.set(0,1,0); cam.position.set(Math.cos(a)*R,5+11*(1-u),Math.sin(a)*R); cam.lookAt(m.position.x,m.position.y*0.8+3,m.position.z); fov=40;
      if(t>1.4&&t<7) this.ui(true,P.name,P.port+' · '+SPECIES[P.species].name+' territory'); this.orbit2=a;
      if(t>=7.6){ this.dock(P); this.orbit=this.orbit2; }
    } else if(this.mode==='port'){
      this.orbit+=dt*0.05; const a=this.orbit, R=88; cam.up.set(0,1,0); cam.position.set(Math.cos(a)*R,8+2*Math.sin(time*0.2),Math.sin(a)*R); cam.lookAt(0,m.userData.gearH+2,0);
      const wide=World.w>900; if(wide) cam.rotateY(0.2); fov=wide?42:50; Models.animate(m,0,time); this.fade=Math.max(0,this.fade-dt*1.5); this.surf.dustI=Math.max(0,this.surf.dustI-dt*0.3); if(this.preview){ this.preview.rotation.y+=dt*0.25; Models.animate(this.preview,0,time); }
    } else if(this.mode==='T'){
      const rest=m.userData.gearH, y=rest+(t>0.6?Math.pow(t-0.6,2.3)*16:0); m.position.set(0,y,0); m.rotation.x=smooth(1.2,4,t)*0.45; this.setThrust(smooth(0,0.7,t),time); this.surf.dustI=smooth(0,0.6,t)*smooth(90,10,y-rest);
      this.shake=0.25*smooth(0,0.8,t); const a=this.orbit; cam.up.set(0,1,0); cam.position.set(Math.cos(a)*88,8,Math.sin(a)*88); cam.lookAt(0,y*0.85+3,0); fov=44;
      this.fadeCol.set(1,1,1); this.fade=smooth(3.1,3.9,t); if(t>=4){ this.setThrust(0,0); this.shake=0; this.ui(false); World.space.add(m); m.visible=false; Game.enterFlight(P,true); return; }
    }
    if(this.mode!=='A'&&this.mode!=='B') this.updateSurface(dt,time);
    if(this.shake>0){ cam.position.x+=(Math.random()-0.5)*this.shake; cam.position.y+=(Math.random()-0.5)*this.shake; cam.rotateZ((Math.random()-0.5)*this.shake*0.012); }
    if(Math.abs(cam.fov-fov)>0.01){ cam.fov=fov; cam.updateProjectionMatrix(); }
    World.fx('uFade',this.fade); World.fx('uFadeCol',this.fadeCol); World.fx('uExposure',this.mode==='A'||this.mode==='B'?1:0.74);
  },
};
