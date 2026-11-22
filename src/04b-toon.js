/* ===================== CARTOON LOOK ===================== */
/* Toon materials (three flat light bands) and an ink pass that draws comic-book outlines
   wherever surface normals or depth jump. Meshes opt in to outlines with Toon.ink.mark(). */
const Toon = {
  _grad:null,
  grad(){
    if(this._grad) return this._grad;
    const n=32, d=new Uint8Array(n*4);
    // coordinate is dot(N,L)*0.5+0.5: shadow side, a mid band, then full light
    for(let i=0;i<n;i++){ const c=(i+0.5)/n, v=c<0.47?0.34:c<0.64?0.66:1.0; d[i*4]=d[i*4+1]=d[i*4+2]=Math.round(v*255); d[i*4+3]=255; }
    const t=new THREE.DataTexture(d,n,1,THREE.RGBAFormat); t.minFilter=t.magFilter=THREE.NearestFilter; t.generateMipmaps=false; t.needsUpdate=true;
    return this._grad=t;
  },
  /* drop-in for MeshStandardMaterial: keeps colour, maps, emissive and transparency; ignores PBR-only settings */
  mat(p){
    p=Object.assign({},p||{});
    for(const k of ['roughness','metalness','envMapIntensity','envMap','bumpMap','bumpScale','roughnessMap','metalnessMap']) delete p[k];
    p.gradientMap=this.grad();
    return new THREE.MeshToonMaterial(p);
  },
};

Toon.ink = {
  on:true, rt:null, mat:null, pass:null, _c:new THREE.Color(),
  init(){
    this.rt=new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,format:THREE.RGBAFormat,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:true,stencilBuffer:false});
    this.mat=new THREE.ShaderMaterial({
      vertexShader:`#include <common>
varying vec3 vN; varying float vZ;
void main(){
#include <beginnormal_vertex>
#include <defaultnormal_vertex>
#include <begin_vertex>
#include <project_vertex>
  vN=transformedNormal; vZ=-mvPosition.z; }`,
      fragmentShader:`varying vec3 vN; varying float vZ;
void main(){ vec3 n=normalize(vN); if(!gl_FrontFacing) n=-n;
  gl_FragColor=vec4(n*0.5+0.5, clamp((log2(max(vZ,1e-4))+8.0)/34.0,0.0,0.995)); }`,
      side:THREE.DoubleSide });
  },
  /* opt a model (and its children) into outlines; skips see-through, hidden and glow-only parts */
  mark(root){
    root.traverse(o=>{ if(!o.isMesh || o.userData.noInk) return; const m=o.material; if(!m || Array.isArray(m)) return;
      if(m.visible===false || m.transparent || m.depthWrite===false || m.blending===THREE.AdditiveBlending) return; o.layers.enable(1); });
    return root;
  },
  /* normals + log depth of every outlined mesh, for the same scenes the colour pass drew */
  renderNormals(r){
    const list=World.scenes.list; if(!list.length) return;
    r.getClearColor(this._c); const ca=r.getClearAlpha(), au=r.shadowMap.autoUpdate;
    r.shadowMap.autoUpdate=false; r.setRenderTarget(this.rt); r.setClearColor(0x808080,1); r.clear(true,true,false);
    for(let i=0;i<list.length;i++){ const {scene,camera}=list[i]; if(i>0) r.clearDepth();
      const bg=scene.background, ov=scene.overrideMaterial, mask=camera.layers.mask;
      scene.background=null; scene.overrideMaterial=this.mat; camera.layers.set(1);
      r.render(scene,camera);
      scene.background=bg; scene.overrideMaterial=ov; camera.layers.mask=mask; }
    r.setClearColor(this._c,ca); r.shadowMap.autoUpdate=au;
  },
  shader(){ return {
    uniforms:{tDiffuse:{value:null},tN:{value:null},uPx:{value:new THREE.Vector2(1/1280,1/720)},uW:{value:1.5},uOn:{value:1},uInk:{value:new THREE.Color('#17112a')}},
    vertexShader:GLSL.postVert,
    fragmentShader:`uniform sampler2D tDiffuse,tN; uniform vec2 uPx; uniform float uW,uOn; uniform vec3 uInk; varying vec2 vUv;
float bg(vec4 s){ return step(0.994,s.w); }
float nd(vec4 a,vec4 b){ float ba=bg(a), bb=bg(b); if(ba>0.5&&bb>0.5) return 0.0; if(abs(ba-bb)>0.5) return 1.0; return 1.0-dot(a.xyz*2.0-1.0,b.xyz*2.0-1.0); }
void main(){
  vec3 col=texture2D(tDiffuse,vUv).rgb;
  vec4 c=texture2D(tN,vUv);
  vec4 l=texture2D(tN,vUv+vec2(-uPx.x,0.0)*uW), r=texture2D(tN,vUv+vec2(uPx.x,0.0)*uW), u=texture2D(tN,vUv+vec2(0.0,uPx.y)*uW), d=texture2D(tN,vUv+vec2(0.0,-uPx.y)*uW);
  float n=max(max(nd(c,l),nd(c,r)),max(nd(c,u),nd(c,d)));
  float z=c.w*34.0, dz=max(abs(l.w+r.w-2.0*c.w),abs(u.w+d.w-2.0*c.w))*34.0;
  float any=1.0-bg(c)*bg(l)*bg(r)*bg(u)*bg(d);
  float e=max(smoothstep(0.22,0.42,n), smoothstep(0.05,0.11,dz)*any);
  gl_FragColor=vec4(mix(col,uInk,e*uOn*0.94),1.0);
}` }; },
};

/* composer pass that fills the normal buffer; draws nothing to the colour chain */
function InkPrepass(){ this.enabled=true; this.needsSwap=false; this.clear=false; this.renderToScreen=false; }
InkPrepass.prototype.setSize=function(w,h){ Toon.ink.rt.setSize(w,h); };
InkPrepass.prototype.render=function(renderer){ if(Toon.ink.on) Toon.ink.renderNormals(renderer); };

/* cartoon sun rays for the corona sprite */
function sunburstTex(){
  const n=512, cv=makeCanvas(n,n), x=cv.getContext('2d'), c=n/2;
  let g=x.createRadialGradient(c,c,0,c,c,c); g.addColorStop(0,'rgba(255,240,170,1)'); g.addColorStop(0.16,'rgba(255,214,90,0.9)'); g.addColorStop(0.17,'rgba(255,190,60,0.45)'); g.addColorStop(0.3,'rgba(255,160,40,0.18)'); g.addColorStop(1,'rgba(255,140,30,0)');
  x.fillStyle=g; x.fillRect(0,0,n,n);
  for(let i=0;i<16;i++){ const a=i/16*Math.PI*2, L=(i%2?0.62:0.9)*c, w=i%2?0.07:0.1;
    x.fillStyle=i%2?'rgba(255,200,80,0.35)':'rgba(255,225,120,0.5)'; x.beginPath(); x.moveTo(c+Math.cos(a-w)*c*0.18,c+Math.sin(a-w)*c*0.18); x.lineTo(c+Math.cos(a)*L,c+Math.sin(a)*L); x.lineTo(c+Math.cos(a+w)*c*0.18,c+Math.sin(a+w)*c*0.18); x.closePath(); x.fill(); }
  return canvasTex(cv);
}
