/* ===================== WORLD ===================== */
function ScenesPass(){ this.enabled=true; this.needsSwap=false; this.clear=true; this.renderToScreen=false; this.list=[]; }
ScenesPass.prototype.setSize=function(){};
ScenesPass.prototype.render=function(renderer, wb, rb){
  renderer.setRenderTarget(this.renderToScreen?null:rb); renderer.autoClear=false; renderer.clear(true,true,true);
  for(let i=0;i<this.list.length;i++){ if(i>0) renderer.clearDepth(); renderer.render(this.list[i].scene, this.list[i].camera); }
};

const World = {
  dpr:1, frameMs:16, slowT:0, sunDir:new V3(1,0,0), time:0,
  init(canvas){
    const r=this.renderer=new THREE.WebGLRenderer({canvas, antialias:false, powerPreference:'high-performance'});
    this.dpr=Math.min(window.devicePixelRatio||1,1.5); r.setPixelRatio(this.dpr);
    r.shadowMap.enabled=true; r.shadowMap.type=THREE.PCFSoftShadowMap; r.autoClear=false;
    this.space=new THREE.Scene(); this.cock=new THREE.Scene();
    this.spaceCam=new THREE.PerspectiveCamera(72,1,3,3e7); this.cockCam=new THREE.PerspectiveCamera(72,1,0.02,80);
    this.universe=new THREE.Group(); this.space.add(this.universe);
    this.shipFrame=new THREE.Group(); this.space.add(this.shipFrame);
    // lights
    this.sunLight=new THREE.DirectionalLight(C('#fff3e0'),3.0); this.space.add(this.sunLight); this.space.add(this.sunLight.target);
    this.space.add(new THREE.AmbientLight(C('#8090b0'),0.10));
    this.bounce=new THREE.DirectionalLight(0xffffff,0); this.space.add(this.bounce); this.space.add(this.bounce.target);
    this.cSun=new THREE.DirectionalLight(C('#fff1dc'),2.3); this.cSun.castShadow=true; const sh=this.cSun.shadow; sh.mapSize.set(2048,2048);
    sh.camera.left=-1.9; sh.camera.right=1.9; sh.camera.top=1.9; sh.camera.bottom=-1.9; sh.camera.near=0.5; sh.camera.far=14; sh.bias=-0.0006; sh.normalBias=0.012; sh.radius=3;
    this.cock.add(this.cSun); this.cock.add(this.cSun.target);
    this.cHemi=new THREE.HemisphereLight(C('#7a8cb0'),C('#2a2018'),0.22); this.cock.add(this.cHemi);
    this.cBounce=new THREE.DirectionalLight(0xffffff,0); this.cock.add(this.cBounce); this.cock.add(this.cBounce.target);
    this.buildSky(); this.buildStars(); this.buildSun(); this.buildPlanets(); this.buildDust(); this.buildTunnel();
    this.buildComposer(); this.resize();
    window.addEventListener('resize',()=>this.resize());
  },
  buildSky(){
    const r=this.renderer, scn=new THREE.Scene();
    const mat=new THREE.ShaderMaterial({vertexShader:GLSL.skyVert,fragmentShader:GLSL.skyFrag,uniforms:{uBoost:{value:1}},side:THREE.BackSide});
    scn.add(new THREE.Mesh(new THREE.SphereGeometry(50,64,40),mat));
    const opts={type:THREE.HalfFloatType,format:THREE.RGBAFormat,generateMipmaps:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter};
    const rt=new THREE.WebGLCubeRenderTarget(1024,opts); new THREE.CubeCamera(1,200,rt).update(r,scn); this.space.background=rt.texture; this.skyRT=rt;
    mat.uniforms.uBoost.value=9; const rt2=new THREE.WebGLCubeRenderTarget(256,opts); new THREE.CubeCamera(1,200,rt2).update(r,scn);
    const pm=new THREE.PMREMGenerator(r); this.env=pm.fromCubemap(rt2.texture).texture; pm.dispose(); rt2.dispose();
    this.cock.environment=this.env; this.space.environment=this.env; mat.dispose();
  },
  buildStars(){
    const n=2600, pos=new Float32Array(n*3), col=new Float32Array(n*3), size=new Float32Array(n), rr=mulberry32(4242);
    for(let i=0;i<n;i++){ const u=rr()*2-1, a=rr()*6.283, s=Math.sqrt(1-u*u); pos[i*3]=s*Math.cos(a)*9e6; pos[i*3+1]=u*9e6; pos[i*3+2]=s*Math.sin(a)*9e6;
      const b=Math.pow(rr(),7)*5+0.35, t=rr(); const c=t<0.3?[1,0.75,0.55]:t<0.75?[1,0.97,0.92]:[0.7,0.82,1]; col[i*3]=c[0]*b; col[i*3+1]=c[1]*b; col[i*3+2]=c[2]*b; size[i]=1.4+Math.pow(rr(),5)*3.2; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setAttribute('size',new THREE.BufferAttribute(size,1));
    this.starMat=new THREE.ShaderMaterial({vertexShader:GLSL.starVert,fragmentShader:GLSL.starFrag,uniforms:{uPx:{value:this.dpr}},blending:THREE.AdditiveBlending,depthWrite:false,depthTest:true,transparent:true});
    const p=new THREE.Points(g,this.starMat); p.frustumCulled=false; this.space.add(p);
  },
  buildSun(){
    this.sunMat=new THREE.ShaderMaterial({vertexShader:GLSL.planetVert,fragmentShader:GLSL.sunFrag,uniforms:{uTime:{value:0}}});
    this.universe.add(new THREE.Mesh(new THREE.SphereGeometry(SUN_R,64,40),this.sunMat));
    const corona=new THREE.Sprite(new THREE.SpriteMaterial({map:glareTex(),color:new THREE.Color(3,2.1,1.2),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); corona.scale.setScalar(SUN_R*11); this.universe.add(corona);
    const far=new THREE.Sprite(new THREE.SpriteMaterial({map:glareTex(),color:new THREE.Color(2.2,1.9,1.5),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,sizeAttenuation:false})); far.scale.setScalar(0.22); this.universe.add(far);
  },
  buildPlanets(){
    PLANETS.forEach((P,i)=>{
      P.idx=i; P.pos=new V3(Math.cos(P.ang)*P.orbit,P.y,Math.sin(P.ang)*P.orbit); P.sunDir=P.pos.clone().negate().normalize();
      P.landR=P.r*2+500; P.dropR=P.r*5+2000; P.lockR=P.r*3.5;
      const g=new THREE.Group(); g.position.copy(P.pos); g.rotation.z=0.15+0.25*Math.sin(i*2.1); g.rotation.x=0.1*Math.cos(i*1.3); this.universe.add(g); P.group=g;
      if(P.station){ P.landR=P.r*2.4+600; P.dropR=P.r*7+3000; this.buildStation(P,g); this.marker(P); return; }
      const pal=P.pal, seed=i*13.37+2.5; let u;
      if(P.type==='gas'){
        u={uSun:{value:P.sunDir},uTime:{value:0},uSeed:{value:seed},uBands:{value:P.bands},uTurb:{value:P.turb},uAtm:{value:P.atm},uOct:{value:4},cA:{value:C(pal.a)},cB:{value:C(pal.b)},cC:{value:C(pal.c)},cD:{value:C(pal.d)},cAtm:{value:C(pal.atm)}};
      } else {
        u={uSun:{value:P.sunDir},uTime:{value:0},uSeed:{value:seed},uSea:{value:P.sea},uIce:{value:P.ice},uCloud:{value:P.cloud},uLava:{value:P.lava},uCity:{value:P.city},uAtm:{value:P.atm},uOct:{value:4},uBump:{value:0},
          cDeep:{value:C(pal.deep)},cShal:{value:C(pal.shal)},cA:{value:C(pal.a)},cB:{value:C(pal.b)},cC:{value:C(pal.c)},cD:{value:C(pal.d)},cAtm:{value:C(pal.atm)},cCloud:{value:C(pal.cloud)},cEmis:{value:C(pal.emis)}};
      }
      P.mat=new THREE.ShaderMaterial({vertexShader:GLSL.planetVert,fragmentShader:P.type==='gas'?GLSL.gasFrag:GLSL.rockFrag,uniforms:u,extensions:{derivatives:true}});
      P.mesh=new THREE.Mesh(new THREE.SphereGeometry(P.r,160,96),P.mat); g.add(P.mesh);
      const ar=1.09; P.atmo=new THREE.Mesh(new THREE.SphereGeometry(P.r*ar,96,48),new THREE.ShaderMaterial({vertexShader:GLSL.planetVert,fragmentShader:GLSL.atmoFrag,
        uniforms:{uSun:{value:P.sunDir},cAtm:{value:C(pal.atm)},uEdge:{value:Math.sqrt(1-1/(ar*ar))},uAtm:{value:P.atm}},side:THREE.BackSide,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
      g.add(P.atmo);
      if(P.ring){
        const rm=new THREE.Mesh(new THREE.RingGeometry(P.r*P.ring.in,P.r*P.ring.out,200,1),new THREE.ShaderMaterial({vertexShader:GLSL.ringVert,fragmentShader:GLSL.ringFrag,
          uniforms:{uSunL:{value:new V3()},c1:{value:C(P.ring.c1)},c2:{value:C(P.ring.c2)},uIn:{value:P.r*P.ring.in},uOut:{value:P.r*P.ring.out},uR:{value:P.r},uSeed:{value:seed}},side:THREE.DoubleSide,transparent:true,depthWrite:false}));
        rm.rotation.x=Math.PI/2-0.32; g.add(rm); g.updateMatrixWorld(true);
        const q=new Q4(); rm.getWorldQuaternion(q); rm.material.uniforms.uSunL.value.copy(P.sunDir).applyQuaternion(q.invert()); P.ringMesh=rm;
      }
      this.marker(P);
    });
  },
  /* HUD marker */
  marker(P){ P.mk={cv:makeCanvas(384,240)}; P.mk.tex=canvasTex(P.mk.cv); P.mk.sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:P.mk.tex,transparent:true,depthTest:false,depthWrite:false,sizeAttenuation:false}));
    P.mk.sprite.scale.set(0.24,0.15,1); P.mk.sprite.center.set(0.5,1-158/240); P.mk.sprite.renderOrder=20; P.mk.sprite.position.copy(P.pos); this.universe.add(P.mk.sprite); P.mk.key=''; },
  /* a research station seen from space: a hub, a slowly turning ring on spokes, solar wings, blinking lights, and
     each one's speciality (a listening dish, frozen-sample tanks, a measuring spire, a lighthouse lamp) */
  buildStation(P, g){
    const r=P.r, M=(hex,ro=0.45,me=0.55)=>new THREE.MeshStandardMaterial({color:C(hex),roughness:ro,metalness:me,envMapIntensity:1.2}), mk=(geo,mat,x=0,y=0,z=0)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); g.add(m); return m; };
    const hull=M(P.pal.a), dark=M(P.pal.c,0.6,0.4), trim=M(P.pal.b), glow=new THREE.MeshBasicMaterial({color:HDR(P.light,3.2)}), solar=M('#1d3566',0.3,0.8);
    mk(new THREE.SphereGeometry(r*0.26,32,20),hull); mk(new THREE.CylinderGeometry(r*0.12,r*0.12,r*1.5,20),trim);
    for(const s of [-1,1]){ mk(new THREE.CylinderGeometry(r*0.2,r*0.14,r*0.22,20),dark,0,s*r*0.8,0); mk(new THREE.SphereGeometry(r*0.05,10,8),glow,0,s*r*0.93,0); }
    // the ring and its spokes turn together; it stands in for the planet mesh, which World.update spins
    const spin=new THREE.Group(), ring=new THREE.Group(); g.add(spin); spin.add(ring); ring.rotation.x=Math.PI/2; ring.add(new THREE.Mesh(new THREE.TorusGeometry(r*0.85,r*0.085,14,72),hull));
    const band=new THREE.Mesh(new THREE.TorusGeometry(r*0.85,r*0.088,6,72,Math.PI*2),new THREE.MeshBasicMaterial({color:HDR(P.light,1.4),wireframe:true,transparent:true,opacity:0.35})); ring.add(band);
    for(let k=0;k<4;k++){ const a=k*Math.PI/2+Math.PI/4, sp=new THREE.Mesh(new THREE.CylinderGeometry(r*0.025,r*0.025,r*0.6,8),dark); sp.position.set(Math.cos(a)*r*0.55,Math.sin(a)*r*0.55,0); sp.rotation.z=a-Math.PI/2; ring.add(sp); }
    P.blink=[]; for(let k=0;k<12;k++){ const a=k/12*Math.PI*2, l=new THREE.Mesh(new THREE.SphereGeometry(r*0.035,8,6),new THREE.MeshBasicMaterial({color:HDR(k%3?'#ffffff':'#ff4030',3)})); l.position.set(Math.cos(a)*r*0.85,Math.sin(a)*r*0.85,r*0.09); ring.add(l); P.blink.push(l); }
    // solar wings on a long boom
    mk(new THREE.CylinderGeometry(r*0.02,r*0.02,r*3.2,8),dark).rotation.z=Math.PI/2;
    for(const s of [-1,1]) for(const q of [0.95,1.4]){ const w=mk(new THREE.BoxGeometry(r*0.42,r*0.012,r*0.55),solar,s*r*q,0,0); w.rotation.x=0.35; mk(new THREE.BoxGeometry(r*0.43,r*0.014,r*0.02),trim,s*r*q,0,0).rotation.x=0.35; }
    if(P.dish){ const d=mk(new THREE.SphereGeometry(r*0.7,28,12,0,Math.PI*2,0,0.75),M('#e8eef4',0.35,0.3),0,r*1.55,0); d.material.side=THREE.DoubleSide; d.rotation.x=Math.PI; mk(new THREE.CylinderGeometry(r*0.02,r*0.02,r*0.6,8),dark,0,r*1.2,0); mk(new THREE.SphereGeometry(r*0.06,10,8),glow,0,r*1.35,0); }
    if(P.tanks) for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; mk(new THREE.SphereGeometry(r*0.13,16,12),M('#f4fbff',0.2,0.2),Math.cos(a)*r*0.3,-r*1.05,Math.sin(a)*r*0.3).scale.set(1,1.6,1); }
    if(P.spire){ mk(new THREE.ConeGeometry(r*0.1,r*1.8,12),trim,0,r*1.7,0); for(let k=1;k<6;k++){ const t=mk(new THREE.TorusGeometry(r*(0.12-k*0.016),r*0.012,6,24),glow,0,r*(0.85+k*0.28),0); t.rotation.x=Math.PI/2; } }
    if(P.beacon){ mk(new THREE.CylinderGeometry(r*0.07,r*0.12,r*1.1,14),M('#f4ece8',0.4,0.2),0,r*1.35,0); P.lamp=mk(new THREE.SphereGeometry(r*0.16,18,12),new THREE.MeshBasicMaterial({color:HDR(P.light,6)}),0,r*1.95,0);
      P.flare=new THREE.Sprite(new THREE.SpriteMaterial({map:glareTex(),color:HDR(P.light,2.5),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); P.flare.scale.setScalar(r*5); P.flare.position.set(0,r*1.95,0); g.add(P.flare); }
    // a soft glow so it can be found from a long way off
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glareTex(),color:HDR(P.light,0.9),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); halo.scale.setScalar(r*4.5); g.add(halo); P.halo=halo;
    P.mesh=spin; P.mat={uniforms:{uTime:{value:0},uOct:{value:3}}};
  },
  drawMarker(P, isTarget, dist){
    const key=(isTarget?'T':'')+(isTarget?fmtDist(dist):''); if(P.mk.key===key) return; P.mk.key=key;
    const x=P.mk.cv.getContext('2d'); x.clearRect(0,0,384,240); const col=isTarget?'#ffc060':'#58c8e8', cx=192, cy=158, s=isTarget?38:22;
    x.strokeStyle=col; x.lineWidth=isTarget?4:2.5; x.globalAlpha=isTarget?1:0.7;
    const br=()=>{ for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){ x.beginPath(); x.moveTo(cx+sx*s,cy+sy*(s-14)); x.lineTo(cx+sx*s,cy+sy*s); x.lineTo(cx+sx*(s-14),cy+sy*s); x.stroke(); } };
    const lw=x.lineWidth, ga=x.globalAlpha; x.strokeStyle='rgba(0,0,0,0.75)'; x.lineWidth=lw+4; x.lineCap='round'; br(); x.strokeStyle=col; x.lineWidth=lw; x.globalAlpha=ga; br();
    x.globalAlpha=1; x.textAlign='center'; x.font=`600 ${isTarget?58:46}px ${FONT_DISP}`; plateText(x,P.name.toUpperCase(),cx,cy-s-(isTarget?64:14),356,col);   // label sits above the bracket so the dash never hides it
    if(isTarget){ x.font=`46px ${FONT_MONO}`; plateText(x,fmtDist(dist),cx,cy-s-14,356,col); }
    P.mk.tex.needsUpdate=true;
  },
  buildDust(){
    const n=this.dustN=520, R=this.dustR=520; this.dustP=new Float32Array(n*3); const rr=mulberry32(99);
    for(let i=0;i<n*3;i++) this.dustP[i]=(rr()*2-1)*R;
    const g=new THREE.BufferGeometry(); this.dustPos=new THREE.BufferAttribute(new Float32Array(n*6),3); this.dustCol=new THREE.BufferAttribute(new Float32Array(n*6),3);
    g.setAttribute('position',this.dustPos); g.setAttribute('color',this.dustCol);
    const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false})); l.frustumCulled=false; this.space.add(l); this.dust=l;
  },
  updateDust(vel, dt, warpF){
    const n=this.dustN, R=this.dustR, P=this.dustP, pos=this.dustPos.array, col=this.dustCol.array; const sp=vel.length();
    const eff=Math.min(sp,5000+warpF*9000); const dx=sp>0?vel.x/sp:0, dy=sp>0?vel.y/sp:0, dz=sp>0?vel.z/sp:-1; const mv=eff*dt;
    const len=clamp(sp*0.035,0,40)+warpF*520; const b=clamp(sp/900,0,1)*0.55+warpF*1.3;
    for(let i=0;i<n;i++){ const k=i*3; let x=P[k]-dx*mv, y=P[k+1]-dy*mv, z=P[k+2]-dz*mv;
      if(x>R)x-=2*R; else if(x<-R)x+=2*R; if(y>R)y-=2*R; else if(y<-R)y+=2*R; if(z>R)z-=2*R; else if(z<-R)z+=2*R; P[k]=x; P[k+1]=y; P[k+2]=z;
      const j=i*6; pos[j]=x; pos[j+1]=y; pos[j+2]=z; pos[j+3]=x+dx*len; pos[j+4]=y+dy*len; pos[j+5]=z+dz*len;
      const f=b*(0.4+((i*37)%10)/10); col[j]=0.55*f; col[j+1]=0.7*f; col[j+2]=f; col[j+3]=col[j+4]=col[j+5]=0; }
    this.dustPos.needsUpdate=true; this.dustCol.needsUpdate=true;
  },
  buildTunnel(){
    const g=new THREE.CylinderGeometry(140,140,7000,48,1,true); g.rotateX(Math.PI/2);
    this.tunnelMat=new THREE.ShaderMaterial({vertexShader:GLSL.tunnelVert,fragmentShader:GLSL.tunnelFrag,uniforms:{uTime:{value:0},uWarp:{value:0}},side:THREE.BackSide,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false});
    this.tunnel=new THREE.Mesh(g,this.tunnelMat); this.tunnel.position.z=-3300; this.tunnel.visible=false; this.tunnel.frustumCulled=false; this.shipFrame.add(this.tunnel);
  },
  buildComposer(){
    const r=this.renderer; this.scenes=new ScenesPass();
    if(!THREE.EffectComposer || !THREE.UnrealBloomPass){ this.composer=null; r.toneMapping=THREE.ACESFilmicToneMapping; r.outputEncoding=THREE.sRGBEncoding; return; }
    const rt=new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,format:THREE.RGBAFormat,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
    this.composer=new THREE.EffectComposer(r,rt); this.composer.addPass(this.scenes);
    this.bloom=new THREE.UnrealBloomPass(new THREE.Vector2(256,256),0.75,0.6,1.0);
    this.composer.addPass(this.bloom);
    this.post=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null},uTime:{value:0},uExposure:{value:1},uWarp:{value:0},uFade:{value:0},uFlash:{value:0},uFadeCol:{value:new THREE.Color(0,0,0)}},vertexShader:GLSL.postVert,fragmentShader:GLSL.postFrag});
    this.composer.addPass(this.post);
    if(THREE.FXAAShader){ this.fxaa=new THREE.ShaderPass(THREE.FXAAShader); this.composer.addPass(this.fxaa); }
  },
  resize(){
    const cv=this.renderer.domElement, w=Math.max(2,cv.clientWidth), h=Math.max(2,cv.clientHeight); this.w=w; this.h=h;
    this.renderer.setPixelRatio(this.dpr); this.renderer.setSize(w,h,false);
    for(const c of [this.spaceCam,this.cockCam]){ c.aspect=w/h; c.updateProjectionMatrix(); }
    if(typeof Cine!=='undefined' && Cine.cam){ Cine.cam.aspect=w/h; Cine.cam.updateProjectionMatrix(); }
    const pw=Math.round(w*this.dpr), ph=Math.round(h*this.dpr);
    if(this.composer){ this.composer.setSize(pw,ph); if(this.fxaa) this.fxaa.material.uniforms.resolution.value.set(1/pw,1/ph); }
    if(this.starMat) this.starMat.uniforms.uPx.value=this.dpr;
  },
  /* the cockpit was framed for a 16:10 window; on narrower screens (iPad, portrait) widen the vertical view so the sides still fit */
  fit(f){ const a=(this.w||16)/(this.h||10), k=Math.min(1.7,Math.max(1,1.6/a)); return k===1?f:Math.atan(Math.tan(f*Math.PI/360)*k)*360/Math.PI; },
  setFov(f){ f=this.fit(f); for(const c of [this.spaceCam,this.cockCam]){ if(Math.abs(c.fov-f)>0.01){ c.fov=f; c.updateProjectionMatrix(); } } },
  /* per-frame world update. shipPos: true world position of the floating origin */
  update(dt, shipPos, camFov){
    this.time+=dt; const t=this.time;
    this.universe.position.copy(shipPos).negate();
    this.sunDir.copy(shipPos).negate(); const sd=this.sunDir.length(); this.sunDir.multiplyScalar(1/Math.max(sd,1));
    this.sunLight.position.copy(this.sunDir).multiplyScalar(100); this.cSun.position.copy(this.sunDir).multiplyScalar(6);
    this.sunMat.uniforms.uTime.value=t;
    let near=null, nd=1e12; const tanH=Math.tan(this.fit(camFov)*Math.PI/360);
    for(const P of PLANETS){
      const d=P.pos.distanceTo(shipPos); P.dist=d; if(d<nd){ nd=d; near=P; }
      P.mesh.rotation.y+=dt*(P.station?0.05:P.type==='gas'?0.006:0.0035);
      if(P.station){ P.halo.material.opacity=clamp((d/P.r-8)/30,0,1); if(d<P.r*400){ const b=Math.floor(t*1.6); P.blink.forEach((l,k)=>{ l.visible=(b+k)%3===0; }); if(P.lamp){ const k=0.5+0.5*Math.sin(t*2.2); P.lamp.material.color.copy(HDR(P.light,2+k*6)); P.flare.material.opacity=0.35+0.65*k; } } }
      const px=P.r/d/tanH*this.h*0.5; P.px=px; const u=P.mat.uniforms; u.uTime.value=t;
      u.uOct.value=clamp(Math.floor(Math.log2(Math.max(px,1)))-2,3,7); if(u.uBump) u.uBump.value=px>120?P.r*0.22:0;
    }
    this.nearest=near;
    if(near){ const k=clamp(Math.pow(near.r/nd,2)*3,0,0.9), day=clamp(new V3().subVectors(shipPos,near.pos).normalize().dot(near.sunDir)*0.6+0.5,0.08,1);
      const dir=new V3().subVectors(near.pos,shipPos).normalize(); const col=C(near.pal.atm);
      for(const L of [this.bounce,this.cBounce]){ L.color.copy(col); L.intensity=k*day*(L===this.cBounce?1.3:1.0); L.position.copy(dir).multiplyScalar(50); } }
    this.tunnelMat.uniforms.uTime.value=t;
    if(this.post){ this.post.uniforms.uTime.value=t; }
    // adaptive resolution
    const now=performance.now(), raw=now-(this.lastNow||now); this.lastNow=now;
    if(raw>0&&raw<200&&!document.hidden){ this.frameMs=lerp(this.frameMs,raw,0.05); if(this.frameMs>24&&this.dpr>1){ this.slowT+=raw/1000; if(this.slowT>3){ this.dpr=Math.max(1,this.dpr-0.25); this.slowT=0; this.frameMs=16; this.resize(); } } else this.slowT=0; }
  },
  render(){ if(this.composer) this.composer.render(); else { this.scenes.renderToScreen=true; this.scenes.render(this.renderer,null,null); } },
  /* set a post-processing uniform if the chain exists */
  fx(name, v){ if(this.post){ const u=this.post.uniforms[name]; if(u.value && u.value.isColor) u.value.copy(v); else u.value=v; } },
};

/* ===================== NPC TRAFFIC ===================== */
const Npc = {
  list:[], timer:0,
  pilot(){ const sp=pick(ALIEN_POOL), seed=Math.floor(Math.random()*1e9); return {sp, seed, name:alienName(sp,seed), ship:shipName(seed), cargo:pick(GOODS)[0]}; },
  spawn(kind, pos, vel, extra){
    const pl=this.pilot(), S=SPECIES[pl.sp]; const idx=pl.sp==='ooloo'?5:pl.sp==='zkthar'?6:Math.floor(Math.random()*5);
    const hue=Math.floor(Math.random()*360); const scheme={hull:`hsl(${hue},${Math.round(20+Math.random()*45)}%,${Math.round(35+Math.random()*40)}%)`,trim:`hsl(${(hue+180)%360},25%,${Math.round(18+Math.random()*25)}%)`,glow:S.col,wear:Math.random()*0.8};
    scheme.hull='#'+new THREE.Color(scheme.hull).getHexString(); scheme.trim='#'+new THREE.Color(scheme.trim).getHexString();
    const m=Models.build(idx,scheme); m.scale.setScalar(3); World.universe.add(m);
    const cv=makeCanvas(384,96), x=cv.getContext('2d'); x.strokeStyle=S.col; x.fillStyle=S.col; x.lineWidth=3; x.beginPath(); x.moveTo(192,8); x.lineTo(206,22); x.lineTo(192,36); x.lineTo(178,22); x.closePath(); x.stroke();
    x.font=`600 24px ${FONT_DISP}`; x.textAlign='center'; x.fillText(pl.ship.toUpperCase(),192,66); x.font=`18px ${FONT_MONO}`; x.globalAlpha=0.8; x.fillText(S.name+' · '+pl.name,192,88);
    const mk=new THREE.Sprite(new THREE.SpriteMaterial({map:canvasTex(cv),transparent:true,depthTest:false,depthWrite:false,sizeAttenuation:false})); mk.scale.set(0.4,0.1,1); mk.center.set(0.5,0.78); mk.renderOrder=21; World.universe.add(mk);
    const n=Object.assign({m,mk,pos:pos.clone(),vel:vel.clone(),kind,pilot:pl,age:0,dist:0},extra||{}); this.list.push(n); return n;
  },
  label(n, l1, l2, col){ const S=SPECIES[n.pilot.sp], cv=n.mk.material.map.image, x=cv.getContext('2d'); col=col||S.col; x.clearRect(0,0,cv.width,cv.height); x.globalAlpha=1;
    x.strokeStyle=col; x.fillStyle=col; x.lineWidth=3; x.beginPath(); x.moveTo(192,8); x.lineTo(206,22); x.lineTo(192,36); x.lineTo(178,22); x.closePath(); x.stroke();
    x.font=`600 24px ${FONT_DISP}`; x.textAlign='center'; plateText(x,(l1||n.pilot.ship).toUpperCase(),192,66,360,col,6); x.font=`18px ${FONT_MONO}`; plateText(x,l2||(S.name+' · '+n.pilot.name),192,90,360,col,6); n.mk.material.map.needsUpdate=true; },
  remove(n){ World.universe.remove(n.m); World.universe.remove(n.mk); n.mk.material.map.dispose(); n.mk.material.dispose(); const i=this.list.indexOf(n); if(i>=0) this.list.splice(i,1); },
  clear(){ while(this.list.length) this.remove(this.list[0]); },
  count(k){ let c=0; for(const n of this.list) if(n.kind===k) c++; return c; },
  nearest(maxD){ let best=null, bd=maxD; for(const n of this.list){ if(n.dist<bd){ bd=n.dist; best=n; } } return best; },
  update(dt, t){
    const s=G.ship, fwd=new V3(0,0,-1).applyQuaternion(s.quat);
    this.timer-=dt;
    if(this.timer<=0 && this.list.length<10){
      this.timer=0.6+Math.random()*0.8;
      const perp=new V3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).cross(fwd).normalize();
      const P=World.nearest;
      if(s.warpF>0.5){ if(this.count('warp')<4){ const c=rnd(1500,5200), dir=fwd.clone().addScaledVector(perp,rnd(-0.01,0.01)).normalize();
          const pos=s.pos.clone().addScaledVector(fwd,c*rnd(2.5,5)).addScaledVector(perp,rnd(160,900)); this.spawn('warp',pos,dir.multiplyScalar(s.speed-c)); } }
      else if(P && P.dist<P.r*9 && this.count('orbit')<3){
        const u=new V3(Math.random()-0.5,(Math.random()-0.5)*0.4,Math.random()-0.5).normalize(), v=new V3(Math.random()-0.5,(Math.random()-0.5)*0.4,Math.random()-0.5).cross(u).normalize();
        const R=P.r*rnd(1.45,3.0); this.spawn('orbit',P.pos.clone(),new V3(),{P,R,u,v,ph:Math.random()*6.28,w:rnd(140,300)/R*(Math.random()<0.5?-1:1)});
      } else if(this.count('traffic')<5){
        const dir=fwd.clone().addScaledVector(perp,rnd(0,0.5)).normalize(); const pos=s.pos.clone().addScaledVector(dir,rnd(5000,11000));
        const aim=s.pos.clone().addScaledVector(fwd,rnd(0,2600)).addScaledVector(new V3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize(),rnd(70,420));
        this.spawn('traffic',pos,aim.sub(pos).normalize().multiplyScalar(rnd(180,520)));
      }
    }
    const show=G.sys.hud && G.sys.power && G.mode==='flight';
    for(let i=this.list.length-1;i>=0;i--){ const n=this.list[i]; n.age+=dt;
      if(n.kind==='orbit'){ n.ph+=n.w*dt; const c=Math.cos(n.ph), sn=Math.sin(n.ph); n.pos.copy(n.P.pos).addScaledVector(n.u,c*n.R).addScaledVector(n.v,sn*n.R); n.vel.copy(n.u).multiplyScalar(-sn).addScaledVector(n.v,c).multiplyScalar(n.w*n.R); }
      else n.pos.addScaledVector(n.vel,dt);
      n.dist=n.pos.distanceTo(s.pos); n.m.position.copy(n.pos); n.mk.position.copy(n.pos);
      if(n.vel.lengthSq()>1){ n.m.quaternion.copy(lookQuat(n.vel.clone().normalize())); }
      Models.animate(n.m,n.kind==='derelict'?0:0.75,t+i);
      n.mk.visible=show && n.dist>120 && (n.keep||n.dist<9000); n.mk.material.opacity=n===Comms.target?1:0.75;
      const far=n.kind==='warp'?70000:32000; if(!n.keep&&(n.dist>far || n.age>120 && n.dist>9000)) this.remove(n);
    }
  },
};
