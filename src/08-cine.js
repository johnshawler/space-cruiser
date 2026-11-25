/* ===================== CUTSCENES + SPACEPORT ===================== */
const Cine = {
  cam:new THREE.PerspectiveCamera(42,1,1,3e7), mode:null, t:0, P:null, surf:null, model:null, modelId:-1, fade:0, fadeCol:new THREE.Color(0,0,0), shake:0, landed:false, orbit:0, preview:null,

  setModel(shipId){
    if(this.model && this.model.parent) this.model.parent.remove(this.model);
    const m=this.model=Models.build(SHIPS[shipId].model,shipId===G.shipId?Game.scheme():null); this.modelId=shipId; m.visible=false; World.space.add(m);
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
    Loading.stop();
    if(this.surf){ if(this.model && this.model.parent===this.surf.scene) World.space.add(this.model); if(this.preview){ this.preview=null; }
      this.surf.scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material){ const ms=Array.isArray(o.material)?o.material:[o.material]; ms.forEach(m=>m.dispose()); } }); if(this.surf.env) this.surf.env.dispose(); }
    const S=P.surf, scn=new THREE.Scene(), seed=P.idx*977+5, rr=mulberry32(seed), cloud=!!S.cloudsea, deck=!!S.deck, spc=SPECIES[P.species];
    const sunDir=new V3(Math.cos(P.idx*1.7)*0.75,0.36+0.16*Math.sin(P.idx*2.3),Math.sin(P.idx*1.7)*0.75).normalize();
    const skyU={cZen:{value:C(S.zen)},cHor:{value:C(S.hor)},uSun:{value:sunDir},cSun:{value:C('#fff0d8')},uStars:{value:deck||P.atm<0.75?1:0.15},uMax:{value:3},uCloud:{value:deck?0:1},uAtmo:{value:deck?0:clamp(P.atm==null?1:P.atm,0,1)}};
    const skyMat=new THREE.ShaderMaterial({vertexShader:GLSL.skyVert,fragmentShader:GLSL.groundSkyFrag,uniforms:skyU,side:THREE.BackSide,depthWrite:false});
    const sky=new THREE.Mesh(new THREE.SphereGeometry(26000,48,32),skyMat); scn.add(sky);
    // reflection map: render the sky to a float cube first (a raw shader cannot be fed to PMREM's fromScene directly)
    const es=new THREE.Scene(); es.add(new THREE.Mesh(sky.geometry,skyMat)); const crt=new THREE.WebGLCubeRenderTarget(128,{type:THREE.HalfFloatType,format:THREE.RGBAFormat,generateMipmaps:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
    new THREE.CubeCamera(10,60000,crt).update(World.renderer,es); const pm=new THREE.PMREMGenerator(World.renderer); const env=pm.fromCubemap(crt.texture).texture; pm.dispose(); crt.dispose(); scn.environment=env; skyU.uMax.value=40;
    scn.fog=new THREE.FogExp2(C(S.hor),S.fog);
    scn.add(new THREE.HemisphereLight(C(S.hor),C(S.g[0]),0.32));
    const sun=new THREE.DirectionalLight(C('#fff2dc'),S.lava?1.1:1.9); sun.position.copy(sunDir).multiplyScalar(320); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
    const sc=sun.shadow.camera; sc.left=-150; sc.right=150; sc.top=150; sc.bottom=-150; sc.near=60; sc.far=800; sun.shadow.bias=-0.0005; sun.shadow.normalBias=0.4; sun.shadow.radius=3; scn.add(sun); scn.add(sun.target);
    const liq=S.liquid?-20:-1e9;
    const hAt=deck?(()=>0):(x,z)=>{ const d=Math.hypot(x,z), n=fbm2(x*0.0011+31,z*0.0011+17,seed,5), rd=1-Math.abs(2*fbm2(x*0.0023+5,z*0.0023+9,seed+3,4)-1);
      const h=(n*0.75+rd*0.25-0.5)*S.amp*2.4+smooth(1200,4300,d)*S.amp*1.6*n; return cloud? -560+h*0.55 : h*smooth(150,800,d); };
    // terrain (on a station: a metal deck floating in space, with the station's ring arching overhead)
    if(deck) this.buildDeck(scn,P,S,rr); else {
    const seg=190, size=10000, tg=new THREE.PlaneGeometry(size,size,seg,seg); tg.rotateX(-Math.PI/2); const pa=tg.attributes.position, cols=new Float32Array(pa.count*3), g0=C(S.g[0]), g1=C(S.g[1]), g2=C(S.g[2]), tc=new THREE.Color();
    for(let i=0;i<pa.count;i++){ const x=pa.getX(i), z=pa.getZ(i), h=hAt(x,z); pa.setY(i,h); let t=clamp(0.5+(cloud?(h+560):h)/(S.amp*2.0)+(vnoise(x*0.02,z*0.02,seed)-0.5)*0.3,0,1);
      if(t<0.5) tc.copy(g0).lerp(g1,t*2); else tc.copy(g1).lerp(g2,(t-0.5)*2); cols[i*3]=tc.r; cols[i*3+1]=tc.g; cols[i*3+2]=tc.b; }
    tg.setAttribute('color',new THREE.BufferAttribute(cols,3)); tg.computeVertexNormals();
    const gcv=makeCanvas(256,256), gx=gcv.getContext('2d'), gi=gx.createImageData(256,256), gr=mulberry32(3); for(let i=0;i<gi.data.length;i+=4){ const v=222+gr()*33; gi.data[i]=gi.data[i+1]=gi.data[i+2]=v; gi.data[i+3]=255; } gx.putImageData(gi,0,0);
    const gt=canvasTex(gcv); gt.wrapS=gt.wrapT=THREE.RepeatWrapping; gt.repeat.set(90,90);
    const terr=new THREE.Mesh(tg,new THREE.MeshStandardMaterial({vertexColors:true,map:gt,roughness:cloud?1:0.94,metalness:0})); terr.receiveShadow=true; scn.add(terr);
    if(S.liquid){ const lm=S.lava?new THREE.MeshBasicMaterial({color:HDR(S.liquid,2.6)}):new THREE.MeshStandardMaterial({color:C(S.liquid),roughness:0.06,metalness:0.55,envMapIntensity:1.4});
      const l=new THREE.Mesh(new THREE.PlaneGeometry(26000,26000),lm); l.rotation.x=-Math.PI/2; l.position.y=liq; scn.add(l); if(S.lava){ const ll=new THREE.HemisphereLight(C('#000000'),C(S.liquid),1.1); scn.add(ll); } }
    }
    // pad
    const pcv=makeCanvas(512,512), px=pcv.getContext('2d'); px.fillStyle='#34363a'; px.fillRect(0,0,512,512); const pr=mulberry32(seed+1);
    for(let i=0;i<5000;i++){ px.fillStyle=`rgba(${pr()<0.5?0:255},${pr()<0.5?0:255},${pr()<0.5?0:255},${pr()*0.06})`; px.fillRect(pr()*512,pr()*512,3,3); }
    px.strokeStyle='#e8b820'; px.lineWidth=14; px.beginPath(); px.arc(256,256,214,0,7); px.stroke(); px.lineWidth=6; px.beginPath(); px.arc(256,256,120,0,7); px.stroke();
    for(let i=0;i<24;i++){ const a=i/24*6.283; px.save(); px.translate(256+Math.cos(a)*238,256+Math.sin(a)*238); px.rotate(a); px.fillStyle=i%2?'#e8b820':'#1a1a1a'; px.fillRect(-10,-16,20,32); px.restore(); }
    drawGlyphs(px,P.port.slice(0,3),190,210,90,P.species,'#f2f2f2',200);
    const padTop=new THREE.MeshStandardMaterial({map:canvasTex(pcv),roughness:0.85,metalness:0.1}), padSide=new THREE.MeshStandardMaterial({color:C('#2a2c30'),roughness:0.8,metalness:0.3});
    // the pad's top is level with the flattened ground (and with a station's deck), so it is nudged forward in depth to
    // win over them instead of flickering; the neighbours' pads get the same treatment
    padTop.polygonOffset=true; padTop.polygonOffsetFactor=-1; padTop.polygonOffsetUnits=-4;
    const padNbTop=padSide.clone(); padNbTop.polygonOffset=true; padNbTop.polygonOffsetFactor=-1; padNbTop.polygonOffsetUnits=-4; const padNb=[padSide,padNbTop,padSide];
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
      else if(st==='station'){ const kind=rr(), hull=bm(pick(S.g.concat(['#d8dde2','#e8e2d4'])),0.45,0.6), dk=bm('#2a2e34',0.6,0.5);
        if(kind<0.35){ const L=24+rr()*34, R=6+rr()*5, c=mk(new THREE.CylinderGeometry(R,R,L,20),hull,0,R+2,0); c.rotation.z=Math.PI/2; b.add(c); for(const s of [-1,1]) b.add(mk(new THREE.SphereGeometry(R,18,12),hull,s*L/2,R+2,0));
          const wb=mk(new THREE.CylinderGeometry(R*1.02,R*1.02,L*0.8,20,1,true),rr()<0.6?warm:win,0,R+2,0); wb.rotation.z=Math.PI/2; wb.scale.set(1,1,0.18); wb.position.z=R*0.5; b.add(wb); for(const s of [-0.3,0.3]) b.add(mk(new THREE.BoxGeometry(2,R+2,R*1.4),dk,s*L,(R+2)/2,0)); }
        else if(kind<0.58){ const r=14+rr()*12; b.add(mk(new THREE.CylinderGeometry(r*1.04,r*1.08,2.4,28),dk,0,1.2,0)); b.add(mk(new THREE.SphereGeometry(r,26,14,0,6.3,0,Math.PI/2),bm('#bfe8ff',0.05,0.2,{transparent:true,opacity:0.32,envMapIntensity:2.5}),0,2.4,0));
          const leaf=bm(pick(['#3f9a4a','#5fb36a','#2f7a3a']),0.7,0); for(let k=0;k<6;k++){ const a=rr()*6.28, d=rr()*r*0.6, h=3+rr()*r*0.5; b.add(mk(new THREE.SphereGeometry(2+rr()*4,10,8),leaf,Math.cos(a)*d,2.4+h,Math.sin(a)*d)); b.add(mk(new THREE.CylinderGeometry(0.5,0.7,h,6),bm('#7a5a3a',0.9,0),Math.cos(a)*d,2.4+h/2,Math.sin(a)*d)); } }
        else if(kind<0.8){ const h=40+rr()*50; b.add(mk(new THREE.CylinderGeometry(1.2,2.4,h,10),dk,0,h/2,0)); for(let k=1;k<4;k++) b.add(mk(new THREE.BoxGeometry(6-k,0.6,0.6),hull,0,h*k/4,0)); const d=mk(new THREE.SphereGeometry(12,20,10,0,6.3,0,1.0),bm('#e8eef4',0.35,0.3,{side:THREE.DoubleSide}),0,h+6,0); d.rotation.set(Math.PI*0.75,rr()*6,0); b.add(d); b.add(mk(new THREE.SphereGeometry(1.4,10,8),new THREE.MeshBasicMaterial({color:HDR('#ff3020',5)}),0,h+1,0)); }
        else { for(let k=0;k<3;k++){ const r=5+rr()*4, x=(k-1)*r*2.3; b.add(mk(new THREE.SphereGeometry(r,18,12),bm('#f4f8fa',0.25,0.3),x,r*1.5,0)); b.add(mk(new THREE.CylinderGeometry(r*0.5,r*0.7,r*1.5,12),dk,x,r*0.75,0)); b.add(mk(new THREE.TorusGeometry(r*1.01,0.4,6,24),win,x,r*1.5,0)).rotation.x=Math.PI/2; } } }
      else { const r=12+rr()*16; b.add(mk(new THREE.SphereGeometry(r,24,14,0,6.3,0,Math.PI/2),bm('#f2f4f6',0.5,0.1),0,0,0)); const band=mk(new THREE.CylinderGeometry(r*0.985,r*0.985,1.8,32,1,true),warm,0,r*0.2,0); b.add(band); b.add(mk(new THREE.CylinderGeometry(1.2,1.2,r*0.7,8),bm('#8a9098'),r*0.4,r*0.9,0)); }
      return b; };
    Venues.build(scn,P,cloud,padSide,hAt,S.liquid?liq:null);
    for(let i=0;i<34;i++){ const a=rr()*6.283, d=170+rr()*520, x=Math.cos(a)*d, z=Math.sin(a)*d; let y=hAt(x,z); const b=building(); if(Venues.near(x,z,75)) continue;
      if(cloud){ y=-10-rr()*60; const pf=mk(new THREE.CylinderGeometry(40,30,8,24),padSide,0,-4,0); b.add(pf); b.add(mk(new THREE.CylinderGeometry(4,8,700,10),padSide,0,-358,0)); } else if(y<liq+2 && S.style!=='bubble') continue; else if(y<liq+2) y=liq-4;
      b.position.set(x,y-2,z); b.rotation.y=rr()*6.28; scn.add(b); }
    // control tower + beacon
    const tw=new THREE.Group(); tw.add(mk(new THREE.CylinderGeometry(3,5,64,12),bm('#9aa0a8',0.5,0.5),0,32,0)); tw.add(mk(new THREE.CylinderGeometry(9,6,8,16),bm('#d8dce0',0.4,0.5),0,68,0)); tw.add(mk(new THREE.CylinderGeometry(9.1,7.6,3,16,1,true),warm,0,68,0));
    const beacon=mk(new THREE.SphereGeometry(1.4,10,8),new THREE.MeshBasicMaterial({color:HDR('#ff3020',6)}),0,76,0); tw.add(beacon); tw.position.set(-96,cloud?-3:0,-70); scn.add(tw);
    // neighbours parked nearby
    const PADS=[[118,74,2.2],[-60,128,-0.6],[40,-138,1.1],[-136,-12,0.4]], parked=[];
    for(const [x,z] of PADS){ const pp=mk(new THREE.CylinderGeometry(30,32,3,32),padNb,x,-1.35,z); pp.castShadow=false; scn.add(pp); if(cloud) scn.add(mk(new THREE.CylinderGeometry(5,9,700,10),padSide,x,-353,z));
      const ring=new THREE.Mesh(new THREE.TorusGeometry(26,0.6,6,40),new THREE.MeshBasicMaterial({color:HDR('#e8b820',1.2)})); ring.rotation.x=Math.PI/2; ring.position.set(x,0.2,z); scn.add(ring); }
    const flyby=Models.build(Math.floor(rr()*5)); flyby.scale.setScalar(1.5); scn.add(flyby);
    // dust
    const dn=380, dp=new Float32Array(dn*3), dseed=new Float32Array(dn*3); for(let i=0;i<dn;i++){ dseed[i*3]=rr()*6.283; dseed[i*3+1]=rr(); dseed[i*3+2]=rr(); }
    const dg=new THREE.BufferGeometry(); dg.setAttribute('position',new THREE.BufferAttribute(dp,3));
    const dustMat=new THREE.PointsMaterial({map:softDotTex(),size:16,transparent:true,opacity:0,depthWrite:false,color:cloud?C('#ffffff'):C(S.g[1]).multiplyScalar(1.6),sizeAttenuation:true}); const dust=new THREE.Points(dg,dustMat); dust.frustumCulled=false; scn.add(dust);
    Crowd.build(scn,P,cloud,PADS,hAt,S.liquid?liq:null);
    Bake.detailLive(scn);   // dents and grain on the port's buildings, pads and parked ships
    ResidentDistrict.populate(P,Venues.list);
    PortSites.populate(P,Venues.list,hAt,cloud,S.liquid?liq:null);
    // colour grade: each world's own mood, from its sky and ground (stations cooler and crisper)
    const hor=C(deck?'#cfe0ff':S.hor), lum=Math.max(0.05,(hor.r+hor.g+hor.b)/3), gain=new THREE.Color(1,1,1).lerp(hor.clone().multiplyScalar(1/lum),deck?0.12:0.1), lift=C(deck?'#203048':S.g[0]).multiplyScalar(0.06);
    const grade={sat:deck?1.04:1.1,con:1.06,gain,lift};
    this.surf={scene:scn,env,sun,sunDir,lamps,beacon,parked,flyby,dust,dp,dseed,dn,dustMat,P,dustI:0,grade};
  },
  /* a research station's docking deck: a big round metal deck with lamps around its rim, open to space. The station's
     hub and habitat ring loom behind it, and a planet hangs in the sky (they're the system's, seen from very far off). */
  buildDeck(scn, P, S, rr){
    const cv=makeCanvas(1024,1024), x=cv.getContext('2d'); x.fillStyle=S.g[1]; x.fillRect(0,0,1024,1024);
    for(let i=0;i<1400;i++){ x.fillStyle=`rgba(${rr()<0.5?0:255},${rr()<0.5?0:255},${rr()<0.5?0:255},${rr()*0.05})`; x.fillRect(rr()*1024,rr()*1024,6,6); }
    x.strokeStyle='rgba(0,0,0,.35)'; x.lineWidth=4; for(let k=0;k<=1024;k+=128){ x.beginPath(); x.moveTo(k,0); x.lineTo(k,1024); x.moveTo(0,k); x.lineTo(1024,k); x.stroke(); }
    x.fillStyle='rgba(255,255,255,.12)'; for(let a=0;a<8;a++) for(let b=0;b<8;b++){ x.beginPath(); x.arc(a*128+10,b*128+10,4,0,7); x.fill(); }
    const tex=canvasTex(cv); tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(14,14);
    const top=new THREE.MeshStandardMaterial({color:0xffffff,map:tex,roughness:0.55,metalness:0.55,envMapIntensity:1.1}), side=new THREE.MeshStandardMaterial({color:C(S.g[0]),roughness:0.5,metalness:0.6});
    scn.add(new THREE.HemisphereLight(C('#c8d2e4'),C('#3a3e46'),0.55));   // floodlights: there's no sky to light the deck
    const R=980, d=new THREE.Mesh(new THREE.CylinderGeometry(R,R*0.86,90,120),[side,top,side]); d.position.y=-45; d.receiveShadow=true; scn.add(d);
    const glow=new THREE.MeshBasicMaterial({color:HDR(P.light,2.6)});
    const rim=new THREE.Mesh(new THREE.TorusGeometry(R,2.2,8,160),glow); rim.rotation.x=Math.PI/2; rim.position.y=0.6; scn.add(rim);
    for(let i=0;i<64;i++){ const a=i/64*Math.PI*2, p=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.8,7,8),side); p.position.set(Math.cos(a)*(R-6),3.5,Math.sin(a)*(R-6)); scn.add(p);
      const l=new THREE.Mesh(new THREE.SphereGeometry(1.3,8,6),glow); l.position.set(p.position.x,7.4,p.position.z); scn.add(l); }
    // the hub and the habitat ring, a few kilometres off
    const far=(hex,ro=0.45,me=0.5)=>new THREE.MeshStandardMaterial({color:C(hex),roughness:ro,metalness:me,envMapIntensity:1.3});
    const st=new THREE.Group(); st.position.set(0,1300,-4600); st.rotation.y=(rr()-0.5)*0.9; scn.add(st);
    st.add(new THREE.Mesh(new THREE.SphereGeometry(700,40,24),far(P.pal.a)));
    const ring=new THREE.Mesh(new THREE.TorusGeometry(3600,170,20,160),far(P.pal.a)); st.add(ring);
    const band=new THREE.Mesh(new THREE.TorusGeometry(3600,174,6,160),new THREE.MeshBasicMaterial({color:HDR(P.light,1.6),wireframe:true,transparent:true,opacity:0.5})); st.add(band);
    for(let k=0;k<4;k++){ const a=k*Math.PI/2+Math.PI/4, sp=new THREE.Mesh(new THREE.CylinderGeometry(60,60,2900,12),far(P.pal.c,0.6,0.4)); sp.position.set(Math.cos(a)*2150,Math.sin(a)*2150,0); sp.rotation.z=a-Math.PI/2; st.add(sp); }
    for(let k=0;k<24;k++){ const a=k/24*Math.PI*2, l=new THREE.Mesh(new THREE.SphereGeometry(55,8,6),new THREE.MeshBasicMaterial({color:HDR(k%4?'#ffffff':'#ff4030',3)})); l.position.set(Math.cos(a)*3600,Math.sin(a)*3600,175); st.add(l); }
    st.traverse(o=>{ if(o.material) o.material.fog=false; });
    // a planet in the sky, and its glow
    const pd=new V3(0.62,0.3,0.72).normalize().applyAxisAngle(new V3(0,1,0),rr()*1.4), pl=new THREE.Mesh(new THREE.SphereGeometry(3800,48,32),new THREE.MeshStandardMaterial({color:C(S.planet),roughness:0.9,metalness:0,fog:false}));
    pl.position.copy(pd).multiplyScalar(17000); scn.add(pl);
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glareTex(),color:HDR(S.planet,0.6),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false})); halo.scale.setScalar(12500); halo.position.copy(pl.position); scn.add(halo);
  },
  updateSurface(dt, t, alt){
    const s=this.surf; if(!s) return;
    s.lamps.forEach((l,i)=>{ const on=((i+Math.floor(t*10))%5)===0; l.material.color.setRGB(on?3.2:0.35,on?2.6:0.28,on?1.2:0.12); });
    s.beacon.visible=(t%1.6)<0.25;
    const ft=(t*0.02)%1; s.flyby.position.set(-2600+ft*5200,520+Math.sin(ft*6)*60,-1700); s.flyby.rotation.y=-Math.PI/2; Models.animate(s.flyby,0.8,t);
    Crowd.update(dt,t);
    ResidentDistrict.update(this.cam);
    s.dustMat.opacity=s.dustI*0.42;
    if(s.dustI>0.01){ for(let i=0;i<s.dn;i++){ const a=s.dseed[i*3], ph=(s.dseed[i*3+1]+t*(0.35+s.dseed[i*3+2]*0.35))%1, r=8+ph*95; s.dp[i*3]=Math.cos(a+ph*0.8)*r; s.dp[i*3+1]=0.5+ph*ph*22*s.dseed[i*3+2]; s.dp[i*3+2]=Math.sin(a+ph*0.8)*r; } s.dust.geometry.attributes.position.needsUpdate=true; }
  },
  setThrust(k, t){ const m=this.model; if(!m) return; m.userData.fx.visible=k>0.01; for(const f of m.userData.flames){ const fl=0.85+0.15*Math.sin(t*50+f.id); f.scale.set(1,k*fl,1); f.position.y=-m.userData.gearH*0.4-6*k*fl; f.material.color.copy(HDR(m.userData.glow,1.2+k*2)); } m.userData.fxLight.intensity=k*5; },

  /* ---------- sequences ---------- */
  ui(on, title, sub){ document.body.classList.toggle('cine',on); $('skip').hidden=!on; if(on) $('keys').hidden=true; if(title){ $('cine-h').textContent=title; $('cine-p').textContent=sub; } $('cine-title').classList.toggle('on',!!title); },
  startLanding(P){
    Walk.exit(true); G.mode='landing'; this.mode='A'; $('deep-badge').hidden=true; Deep.storm=null; this.t=0; this.P=P; this.landed=false; $('tooltip').hidden=true; Comms.close(true); G.ship.warp=false; G.ship.warpF=0;
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
    G.mode='takeoff'; UI.hidePort(); this.setPreview(null); this.model.visible=true; this.camFrom=null; for(const v of Venues.list) v.root.visible=true;
    // cargo taken on at this port gets carried aboard first
    const goods=G.cargo.filter(c=>c.fresh&&c.qty>0&&c.kind!=='escort'); G.cargo.forEach(c=>{ delete c.fresh; });
    if(goods.length&&Loading.start(this.P,this.model,SHIPS[G.shipId].model,goods)){ this.mode='L'; this.t=0; this.ui(true,'Loading cargo',Loading.sub); return; }
    this.liftoff();
  },
  liftoff(){ this.mode='T'; this.t=0; this.ui(true); Sfx.roar(4.5,0.6); Sfx.hiss(1.2,0.2); },
  /* drop straight into the port, no descent (used by Continue and Skip) */
  dock(P){
    Loading.stop(); if(!this.surf||this.surf.P!==P) this.buildSurface(P); if(this.modelId!==G.shipId||!this.model) this.setModel(G.shipId);
    if(this.mode!=='port') this.camInit=true; this.P=P; const m=this.model; this.surf.scene.add(m); m.visible=true; m.position.set(0,m.userData.gearH,0); m.rotation.set(0,0.6,0); this.plasma.visible=false; this.setThrust(0,0); this.surf.dustI=0;
    this.mode='port'; this.fade=0; this.xf=null; this.shake=0; this.ui(false); World.scenes.list=[{scene:this.surf.scene,camera:this.cam}]; if(!this.landed){ this.landed=true; Game.onLanded(P); }
  },
  skip(){ if(this.mode==='A'||this.mode==='B'||this.mode==='C'){ this.fadeCol.setRGB(0,0,0); this.dock(this.P); this.fade=1; } else if(this.mode==='L'){ Loading.stop(); this.liftoff(); this.t=99; } else if(this.mode==='T'){ this.t=99; } },
  /* previewed ships park on the shipyard's showroom pad, and the port camera swings over to it */
  setPreview(shipId){
    if(this.preview){ this.surf.scene.remove(this.preview); this.preview=null; } if(!this.model) return; this.model.visible=true; this.previewId=shipId;
    if(shipId==null) return;
    const p=this.preview=Models.build(SHIPS[shipId].model,shipId===G.shipId?Game.scheme():null), sr=Venues.showroom();
    if(sr){ p.position.set(sr.pos.x,sr.pos.y+p.userData.gearH,sr.pos.z); p.rotation.y=sr.ry; }
    else { p.position.set(0,p.userData.gearH,0); p.rotation.y=0.6; this.model.visible=false; }
    p.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); this.surf.scene.add(p);
  },
  /* keep the sun's shadow box around whatever the camera is looking at */
  sunAt(v){ const s=this.surf; if(!s||!s.sun) return; s.sun.target.position.copy(v); s.sun.position.copy(v).addScaledVector(s.sunDir,320); },
  /* the part of the screen not covered by the port panel */
  /* the shopkeeper's speech bubble rides above their head, kept clear of the panel and the top of the screen */
  placeBubble(V){ const b=$('bubble'); if(!b) return; if(G.mode!=='port') $('shelf-tip').hidden=true;
    const show=UI.tab!=='residents'&&UI.tab!=='stations'&&G.mode==='port'&&this.mode==='port'&&V&&V.keeper&&UI.bubble&&!UI.ticket&&UI.hushed!==V&&!Venues.moving&&!this.xf&&!(this.preview&&V.show)&&this.fade<0.3&&!$('port').hidden;
    if(!show){ if(!b.hidden) b.hidden=true; return; } const p=new V3(); V.keeper.userData.head.getWorldPosition(p); p.y+=1.0; const v=p.project(this.cam);
    if(v.z>1||v.x<-1.2||v.x>1.2||v.y<-1.2||v.y>1.4){ b.hidden=true; return; } b.hidden=false;
    const W=World.w, H=World.h, bw=b.offsetWidth, bh=b.offsetHeight, top=Math.max($('port-bar').getBoundingClientRect().bottom,$('port-tabs').classList.contains('dock')?$('port-tabs').getBoundingClientRect().bottom:0);
    let x=(v.x+1)/2*W, y=(1-v.y)/2*H; x=clamp(x,bw*0.22+12,W-bw*0.78-12); y=clamp(y,top+bh+30,H-this.strip()-10);
    // keep clear of the signpost: slide left of it if they would overlap
    const n=$('port-tabs').getBoundingClientRect(); if(n.width&&x+bw*0.78>n.left-10&&x-bw*0.22<n.right&&y>n.top&&y-bh<n.bottom) x=Math.max(bw*0.22+12,n.left-10-bw*0.78);
    b.style.left=x+'px'; b.style.top=y+'px'; },
  /* the price tags along the bottom of the screen; the scene is framed in the space above them */
  strip(){ const b=$('port-body'); return !b||$('port').hidden||b.classList.contains('empty')?0:b.offsetHeight; },
  /* the shop is always framed as if the price tags were showing, so the view doesn't zoom in when the counter is bare:
     the last real height of the strip, or a typical one until a strip has been seen at this window size */
  frameStrip(){ const s=this.strip(), H=World.h, guess=clamp(Math.round(H*0.26),160,260); if(!this.lastStrip||this.lastStrip.H!==H) this.lastStrip={s:guess,H}; this.lastStrip.s=Math.max(this.lastStrip.s,s); return this.lastStrip.s; },
  region(){ const W=World.w, H=World.h, el=$('port'); if(!el||el.hidden) return {w:W,h:H,ox:0,oy:0}; const s=this.frameStrip();
    return {w:W,h:Math.max(1,H-s),ox:0,oy:s/2}; },
  update(dt, time){
    this.t+=dt; const t=this.t, P=this.P, s=G.ship, cam=this.cam, m=this.model; let fov=42; if(this.mode!=='port'&&cam.view&&cam.view.enabled) cam.clearViewOffset();
    if(this.mode!=='port'&&this.surf&&this.surf.sun&&this.surf.sun.target.position.lengthSq()>1) this.sunAt(new V3());
    if(this.mode==='A'){
      s.pos.copy(this.baseA).addScaledVector(this.hA,-165+72*t); m.quaternion.copy(this.qA); Models.animate(m,0.85,time);
      cam.position.copy(this.camA).sub(s.pos); cam.up.copy(this.up); cam.lookAt(0,0,0); fov=36; this.fade=Math.max(0,1-t/0.7);
      // a station is small next to a planet: ride behind the ship instead, so the station fills the view ahead of it
      if(P.station){ const toS=P.pos.clone().sub(s.pos).normalize(); cam.position.copy(this.hA).multiplyScalar(-46).addScaledVector(this.up,11).addScaledVector(this.side,13); cam.lookAt(toS.multiplyScalar(40)); fov=50; }
      World.updateDust(this.hA.clone().multiplyScalar(500),dt,0);
      // a station has no atmosphere to burn through: fade to black and come out of it over the docking deck
      if(P.station){ this.fadeCol.setRGB(0,0,0); this.fade=Math.max(this.fade,smooth(3.4,4.25,t)); }
      if(t>=4.3){ if(P.station){ this.mode='C'; this.t=0; this.fade=1; this.surf.scene.add(m); World.scenes.list=[{scene:this.surf.scene,camera:cam}]; this.orbit=0.9; this.td=false; Sfx.hiss(3,0.12); } else { this.mode='B'; this.t=0; this.fade=0; } }
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
      if(t>1.4&&t<7) this.ui(true,P.name,P.station?`${P.port} · research station · ${RISK[P.risk].name} risk`:P.port+' · '+SPECIES[P.species].name+' territory'); this.orbit2=a;
      if(t>=7.6){ this.dock(P); this.orbit=this.orbit2; }
    } else if(this.mode==='port'){
      Models.animate(m,0,time);
      // going to another shop (or to the showroom pad and back) is a quick fade to black and back, not a flight across the port:
      // the old view holds while the screen darkens, the camera cuts at black, and the new view fades in
      const meeting=UI.tab==='residents'&&ResidentDistrict.selected,site=UI.tab==='stations'&&PortSites.selected;
      const Vc=Venues.current(), key=site?'site:'+site.id:meeting?'resident:'+meeting.person.id:Vc?Vc.k+(this.preview&&Vc.show?':show':''):'';
      if(Vc&&this.camP&&!this.camInit&&key!==this.camKey){ if(!this.xf||this.xf.cut) this.xf={t:this.xf?Math.min(0.3,this.fade*0.3):0,key}; else this.xf.key=key; this.fadeCol.setRGB(0,0,0); }
      Venues.moving=!!(this.xf&&!this.xf.cut); Venues.update(dt,time); const V=Venues.active, reg=this.region();
      if(V){ const tg=site?PortSites.camera(reg.w/reg.h):meeting?ResidentDistrict.camera(reg.w/reg.h):Venues.cam(V,reg.w/reg.h,!!this.preview&&!!V.show);
        if(this.camInit||!this.camP){ this.camInit=false; this.camP=tg.pos.clone(); this.camL=tg.look.clone(); this.camKey=key; this.fadeCol.setRGB(0,0,0); this.fade=1; }
        const x=this.xf; if(x){ x.t+=dt; if(x.t>=0.3&&!x.cut){ x.cut=true; this.camP.copy(tg.pos); this.camL.copy(tg.look); this.camKey=x.key; } }
        if(!x||x.cut){ const k=1-Math.exp(-dt*6); this.camP.lerp(tg.pos,k); this.camL.lerp(tg.look,k); }
        cam.up.set(0,1,0); cam.position.copy(this.camP); cam.lookAt(this.camL); this.sunAt(this.camL); cam.updateMatrixWorld(); this.placeBubble(V); UI.place(V,cam);
        // frame the set in the part of the screen the port panel leaves open
        fov=2*Math.atan(Math.tan(tg.fov*Math.PI/360)*World.h/reg.h)*180/Math.PI; this.fovFixed=true; cam.setViewOffset(World.w,World.h,reg.ox,reg.oy,World.w,World.h);
      } else { this.orbit+=dt*0.05; const a=this.orbit, R=88; cam.up.set(0,1,0); cam.position.set(Math.cos(a)*R,8+2*Math.sin(time*0.2),Math.sin(a)*R); cam.lookAt(0,m.userData.gearH+2,0); fov=42; } if(this.xf){ const x=this.xf; this.fade=x.cut?Math.max(0,1-(x.t-0.3)/0.35):Math.max(this.fade,x.t/0.3); if(x.cut&&x.t>0.65) this.xf=null; } else this.fade=Math.max(0,this.fade-dt*1.5); this.surf.dustI=Math.max(0,this.surf.dustI-dt*0.3); if(this.preview){ this.preview.rotation.y+=dt*0.25; Models.animate(this.preview,0,time); }
    } else if(this.mode==='L'){
      Models.animate(m,0,time); const r=Loading.update(dt,t,time); cam.up.set(0,1,0); cam.position.copy(r.pos); cam.lookAt(r.look); fov=40; this.fade=Math.max(0,this.fade-dt*1.5);
      if(r.done){ this.camFrom={pos:r.pos.clone(),look:r.look.clone()}; this.liftoff(); }
    } else if(this.mode==='T'){
      // Blast off: the ship climbs straight up, the camera rides above it looking down, and the port shrinks away underneath,
      // pad, crowds, shops, roads, trucks and air traffic and all, until it is a smudge in the haze and the sky goes white.
      const TT=7.6, rest=m.userData.gearH, y=rest+(t>0.6?Math.pow(t-0.6,2.2)*9:0); m.position.set(0,y,0); m.rotation.set(0,m.rotation.y+dt*0.12*smooth(1,3,t),0);
      this.setThrust(smooth(0,0.7,t),time); this.surf.dustI=smooth(0,0.6,t)*smooth(90,10,y-rest); this.shake=0.25*smooth(0,0.8,t)*(1-smooth(2.5,4,t))+0.05;
      // the ground shot: beside the pad, looking up at the ship as it lifts
      const a=this.orbit; cam.up.set(0,1,0); const g=new V3(Math.cos(a)*70,9,Math.sin(a)*70), gl=new V3(0,Math.min(y,40)*0.85+3,0);
      if(this.camFrom){ const k=smooth(0,2.0,t); g.lerpVectors(this.camFrom.pos,g.clone(),k); gl.lerpVectors(this.camFrom.look,gl,k); }
      // the bird's-eye shot: above and a little behind the ship, slowly circling, looking down past it at the port
      const sp=a+t*0.22, hi=48+(y-rest)*0.05, oh=new V3(m.position.x+Math.cos(sp)*16,y+hi,m.position.z+Math.sin(sp)*16), ol=new V3(m.position.x-Math.cos(sp)*8,y-120,m.position.z-Math.sin(sp)*8);
      const k=smooth(1.0,3.0,t); cam.position.lerpVectors(g,oh,k); const look=new V3().lerpVectors(gl,ol,k);
      cam.lookAt(look); fov=lerp(44,58,smooth(1.5,4,t)); Loading.linger(dt,time); this.sunAt(new V3(0,0,0));
      if(t>1.4&&t<6.2) this.ui(true,'',''); 
      this.fadeCol.set(1,1,1); this.fade=smooth(TT-1.0,TT-0.15,t); if(t>=TT){ this.setThrust(0,0); this.shake=0; this.ui(false); Loading.stop(); this.camFrom=null; World.space.add(m); m.visible=false; Game.enterFlight(P,true); return; }
    }
    if(this.mode!=='A'&&this.mode!=='B') this.updateSurface(dt,time);
    if(this.shake>0){ cam.position.x+=(Math.random()-0.5)*this.shake; cam.position.y+=(Math.random()-0.5)*this.shake; cam.rotateZ((Math.random()-0.5)*this.shake*0.012); }
    // near the ground the camera can see things a metre away; high above the port (take-off) the near plane moves out with
    // it, which keeps the depth buffer precise enough that the ground, pads and roofs don't flicker against each other
    const nearW=this.mode==='A'||this.mode==='B'?1:clamp(Math.abs(cam.position.y)*0.03,1,60);
    // grade, depth of field and motion blur for the scene on screen
    const onSurface=this.mode!=='A'&&this.mode!=='B'&&this.surf; World.grade(onSurface?this.surf.grade:null);
    World.dof=this.mode==='port'&&this.surf&&!this.preview&&this.camL?{scene:this.surf.scene,camera:cam,focus:Math.max(3,cam.position.distanceTo(this.camL)-1.2)}:null;
    World.fx('uBlur',this.mode==='T'?clamp((this.t-1.6)/4,0,0.55):0);
    this.fovRaw=fov; if(!this.fovFixed) fov=World.fit(fov); this.fovFixed=false; if(Math.abs(cam.fov-fov)>0.01||Math.abs(cam.near-nearW)>0.05){ cam.fov=fov; cam.near=nearW; cam.updateProjectionMatrix(); }
    World.fx('uFade',this.fade); World.fx('uFadeCol',this.fadeCol); World.fx('uExposure',this.mode==='A'||this.mode==='B'?1:0.74);
  },
};
