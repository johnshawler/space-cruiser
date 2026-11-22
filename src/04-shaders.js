/* ===================== SHADERS ===================== */
const GLSL = {};
GLSL.noise = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p,int oct){ float a=0.5,s=0.0; for(int i=0;i<7;i++){ if(i>=oct)break; s+=a*snoise(p); p=p*2.03+vec3(17.1,3.7,9.2); a*=0.5; } return s; }
float hash13(vec3 p){ p=fract(p*0.1031); p+=dot(p,p.zyx+31.32); return fract((p.x+p.y)*p.z); }
`;

GLSL.planetVert = `
varying vec3 vP; varying vec3 vN; varying vec3 vW;
void main(){ vP=normalize(position); vN=normalize(mat3(modelMatrix)*normal); vW=(modelMatrix*vec4(position,1.0)).xyz;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;

GLSL.rockFrag = `
uniform vec3 uSun; uniform float uTime,uSeed,uSea,uIce,uCloud,uLava,uCity,uAtm,uOct,uBump;
uniform vec3 cDeep,cShal,cA,cB,cC,cD,cAtm,cCloud,cEmis;
varying vec3 vP; varying vec3 vN; varying vec3 vW;
${GLSL.noise}
#define STEP(x,t) smoothstep((t)-0.012,(t)+0.012,(x))
void main(){
  int oct=int(uOct);
  vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vW);
  vec3 p=vP*1.7+uSeed;
  vec3 w=vec3(fbm(p*1.2+11.0,3),fbm(p*1.2+37.0,3),fbm(p*1.2+71.0,3));
  float h=0.5+0.6*fbm(p+w*0.7,oct);
  float fw=fwidth(h);
  float land=smoothstep(uSea-fw,uSea+fw,h);
  float t=clamp((h-uSea)/max(0.001,1.0-uSea)*1.7,0.0,1.0);
  float bio=fbm(p*2.6+50.0,3)*0.5+0.5;
  float ridge=1.0-abs(snoise(p*3.1+w*1.3));
  float q=t+bio*0.15-0.07;
  // flat colour patches with crisp edges, like a painted cel
  vec3 landC=mix(cA,cB,STEP(q,0.12));
  landC=mix(landC,cC,STEP(q,0.42));
  landC=mix(landC,cD,STEP(q+(ridge-0.5)*0.2,0.8));
  float depth=clamp((uSea-h)/0.25,0.0,1.0);
  vec3 seaC=mix(cShal,cDeep,STEP(depth,0.16));
  vec3 alb=mix(seaC,landC,land);
  float ice=STEP(abs(vP.y)+0.12*fbm(p*4.0,3)+land*(h-uSea)*0.25,uIce);
  alb=mix(alb,cD,ice);
  float wet=(1.0-land)*(1.0-ice);
  // three-band cartoon light: night, shade, full sun
  float ndl=dot(N,uSun);
  float L=smoothstep(-0.03,0.03,ndl), M=smoothstep(0.26,0.32,ndl);
  vec3 night=vec3(0.10,0.12,0.30);
  vec3 lightC=mix(night,mix(vec3(0.80,0.82,1.0),vec3(1.0),M)*1.2,L);
  vec3 col=alb*lightC;
  // a hard little glint on the water
  vec3 H=normalize(uSun+V); col=mix(col,vec3(1.5),smoothstep(0.984,0.988,dot(N,H))*wet*(1.0-uLava)*L*0.85);
  // lava seas and cracks
  float crack=STEP(pow(1.0-abs(snoise(p*4.5+w*1.7)),7.0),0.35)*land;
  float glow=(wet*(0.75+0.25*STEP(fbm(p*8.0+uTime*0.02,3),0.1))+crack)*uLava;
  col=mix(col,cEmis*2.2,clamp(glow,0.0,1.0)*0.9);
  // city lights as crisp dots on the night side
  float city=STEP(snoise(vP*38.0+uSeed)*0.5+0.5,0.72)*STEP(snoise(vP*7.0+uSeed*3.0)*0.5+0.5,0.5);
  city*=land*(1.0-ice)*(1.0-STEP(t,0.3));
  // puffy clouds with a shaded rim
  vec3 cp=vP*2.3+w*0.9+vec3(uTime*0.006,0.0,uTime*0.003)+uSeed*2.0;
  float cn=fbm(cp,min(oct,5))*0.62+0.5+0.08*snoise(cp*4.0);
  float cl=STEP(cn,1.05-uCloud), core=STEP(cn,1.13-uCloud);
  col+=cEmis*city*uCity*(1.0-L)*(1.0-cl)*2.2;
  // dark coastline, drawn like an inked border
  float coast=1.0-smoothstep(fw*0.8,fw*1.9,abs(h-uSea));
  col=mix(col,vec3(0.05,0.04,0.11),coast*0.75*(1.0-ice));
  vec3 cloudC=cCloud*mix(night*1.6,vec3(1.12),L);
  col=mix(col,mix(cloudC*0.78,cloudC,core),cl*0.96*(1.0-0.2*uLava));
  // flat atmosphere band around the edge
  float fr=1.0-max(dot(N,V),0.0);
  col=mix(col,cAtm*mix(0.3,1.25,L),smoothstep(0.6,0.65,fr)*0.7*uAtm);
  gl_FragColor=vec4(col,1.0);
}`;

GLSL.gasFrag = `
uniform vec3 uSun; uniform float uTime,uSeed,uBands,uTurb,uAtm,uOct;
uniform vec3 cA,cB,cC,cD,cAtm;
varying vec3 vP; varying vec3 vN; varying vec3 vW;
${GLSL.noise}
#define STEP(x,t) smoothstep((t)-0.015,(t)+0.015,(x))
void main(){
  int oct=int(uOct);
  vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vW);
  vec3 q=vec3(vP.x*1.6,vP.y*5.5,vP.z*1.6)+uSeed+vec3(uTime*0.003,0.0,0.0);
  float turb=fbm(q,min(oct,4));
  float sw=fbm(vP*3.2+uSeed*2.0+turb*1.5,min(oct,4));
  float lat=vP.y*uBands+turb*uTurb*0.8+sw*0.7;
  vec3 alb=mix(cA,cB,STEP(sin(lat)*0.5+0.5,0.5));
  alb=mix(alb,cC,STEP(sin(lat*2.63+1.3)*0.5+0.5,0.72)*0.85);
  alb=mix(alb,cD,STEP(sin(lat*0.37+4.0)*0.5+0.5,0.78)*0.75);
  vec3 sp=normalize(vec3(0.62,-0.33,0.71)); vec3 dv=vP-sp; float d=length(dv*vec3(1.0,2.4,1.0))+0.03*sw;
  float storm=1.0-STEP(d,0.19), eye=1.0-STEP(d,0.1);
  alb=mix(alb,cD,storm); alb=mix(alb,cC,eye*0.9);
  alb=mix(alb,vec3(0.05,0.04,0.11),(STEP(d,0.17)-STEP(d,0.2))*0.6);
  float ndl=dot(N,uSun);
  float L=smoothstep(-0.03,0.03,ndl), M=smoothstep(0.26,0.32,ndl);
  vec3 night=vec3(0.10,0.11,0.28);
  vec3 col=alb*mix(night,mix(vec3(0.8,0.82,1.0),vec3(1.0),M)*1.2,L);
  float fr=1.0-max(dot(N,V),0.0);
  col=mix(col,cAtm*mix(0.3,1.2,L),smoothstep(0.62,0.67,fr)*0.6*uAtm);
  gl_FragColor=vec4(col,1.0);
}`;

GLSL.atmoFrag = `
uniform vec3 uSun; uniform vec3 cAtm; uniform float uEdge,uAtm;
varying vec3 vP; varying vec3 vN; varying vec3 vW;
void main(){ vec3 V=normalize(cameraPosition-vW); vec3 N=normalize(vN);
  float g=clamp(-dot(N,V)/uEdge,0.0,1.0);
  float halo=smoothstep(0.45,0.49,g)*0.2+smoothstep(0.72,0.76,g)*0.22;
  float lit=smoothstep(-0.25,0.05,dot(N,uSun)+0.25*dot(-V,uSun));
  gl_FragColor=vec4(cAtm*halo*(0.12+0.88*lit)*uAtm,1.0); }`;

GLSL.ringVert = `varying vec3 vL; void main(){ vL=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
GLSL.ringFrag = `
uniform vec3 uSunL; uniform vec3 c1,c2; uniform float uIn,uOut,uR,uSeed;
varying vec3 vL;
${GLSL.noise}
void main(){ float r=length(vL.xy); float t=(r-uIn)/(uOut-uIn);
  float a=0.55+0.45*snoise(vec3(t*9.0,uSeed,0.0));
  a=smoothstep(0.36,0.4,a)*0.55+smoothstep(0.66,0.7,a)*0.35;
  a*=smoothstep(0.0,0.02,t)*(1.0-smoothstep(0.97,1.0,t)); a*=1.0-step(abs(t-0.58),0.025);
  vec3 col=mix(c1,c2,step(0.0,snoise(vec3(t*5.0,uSeed,11.0))));
  float tt=dot(vL,uSunL); float d=length(vL-uSunL*tt); float sh=(tt<0.0 && d<uR)?0.25:1.0;
  float lit=0.5+0.5*abs(uSunL.z);
  gl_FragColor=vec4(col*lit*sh*1.5,a*0.95); }`;

GLSL.sunFrag = `
uniform float uTime; varying vec3 vP; varying vec3 vN; varying vec3 vW;
${GLSL.noise}
void main(){ vec3 V=normalize(cameraPosition-vW); float mu=max(dot(normalize(vN),V),0.0);
  float n=fbm(vP*4.0+vec3(0.0,uTime*0.03,0.0),3)*0.5+0.5;
  vec3 col=mix(vec3(1.0,0.42,0.05),vec3(1.0,0.78,0.18),smoothstep(0.3,0.34,mu+n*0.18));
  col=mix(col,vec3(1.0,0.95,0.62),smoothstep(0.74,0.78,mu+n*0.1));
  gl_FragColor=vec4(col*2.4,1.0); }`;

GLSL.skyVert = `varying vec3 vD; void main(){ vD=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
GLSL.skyFrag = `
uniform float uBoost; varying vec3 vD;
${GLSL.noise}
vec3 starLayer(vec3 d,float scale,float thresh,float bright){
  vec3 q=d*scale; vec3 id=floor(q); vec3 f=fract(q)-0.5; float h=hash13(id);
  if(h<thresh) return vec3(0.0);
  vec3 off=vec3(hash13(id+7.1),hash13(id+13.7),hash13(id+29.3))-0.5;
  float s=1.0-smoothstep(0.12,0.16,length(f-off*0.5));
  vec3 c=mix(vec3(1.0,0.85,0.6),vec3(0.75,0.88,1.0),hash13(id+3.3));
  return c*s*bright;
}
void main(){
  vec3 d=normalize(vD);
  vec3 axis=normalize(vec3(0.25,1.0,0.35)); float band=exp(-pow(dot(d,axis)*2.6,2.0));
  vec3 col=mix(vec3(0.016,0.02,0.075),vec3(0.045,0.03,0.11),band);
  float n1=fbm(d*1.6+3.0,4)*0.5+0.5; float n2=fbm(d*2.4+n1*1.2+20.0,4)*0.5+0.5;
  float a1=smoothstep(0.6,0.612,n1), b1=smoothstep(0.69,0.702,n1);
  col=mix(col,vec3(0.13,0.04,0.2),a1); col=mix(col,vec3(0.24,0.07,0.28),b1);
  float a2=smoothstep(0.64,0.652,n2)*(1.0-a1), b2=smoothstep(0.72,0.732,n2)*(1.0-a1);
  col=mix(col,vec3(0.025,0.13,0.2),a2); col=mix(col,vec3(0.05,0.24,0.3),b2);
  col+=starLayer(d,140.0,1.0-0.012*(0.5+band),0.9);
  col+=starLayer(d,300.0,1.0-0.02*(0.5+band),0.4);
  gl_FragColor=vec4(col*uBoost,1.0);
}`;

GLSL.starVert = `attribute float size; attribute vec3 color; varying vec3 vC; varying float vS; uniform float uPx;
void main(){ vC=color; vS=step(6.0,size); gl_PointSize=size*uPx; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
GLSL.starFrag = `varying vec3 vC; varying float vS;
void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c);
  float dotv=1.0-smoothstep(0.13,0.19,d);
  float cr=(1.0-smoothstep(0.02,0.06,abs(c.x)))*(1.0-smoothstep(0.15,0.5,abs(c.y)))+(1.0-smoothstep(0.02,0.06,abs(c.y)))*(1.0-smoothstep(0.15,0.5,abs(c.x)));
  gl_FragColor=vec4(vC*max(dotv,cr*vS),1.0); }`;

GLSL.tunnelVert = `varying vec2 vUv; varying vec3 vL; void main(){ vUv=uv; vL=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
GLSL.tunnelFrag = `
uniform float uTime,uWarp; varying vec2 vUv; varying vec3 vL;
${GLSL.noise}
void main(){ float a=vUv.x*6.2831853; vec2 ring=vec2(cos(a),sin(a))*3.0;
  float n=snoise(vec3(ring*2.2,vUv.y*5.0+uTime*3.5)); float n2=snoise(vec3(ring*7.0,vUv.y*16.0+uTime*9.0));
  float s=smoothstep(0.4,0.44,n*0.6+n2*0.4);
  float fade=smoothstep(0.0,0.25,vUv.y)*(1.0-smoothstep(0.5,1.0,vUv.y));
  vec3 col=mix(vec3(0.2,0.55,1.0),vec3(1.0,0.4,0.95),step(0.0,n2))*s*fade*uWarp*1.5;
  gl_FragColor=vec4(col,1.0); }`;

GLSL.plasmaVert = `varying vec3 vN; varying vec3 vL; varying vec3 vV; void main(){ vL=normalize(position); vec4 mv=modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`;
GLSL.plasmaFrag = `
uniform float uI,uTime; varying vec3 vN; varying vec3 vL; varying vec3 vV;
${GLSL.noise}
void main(){ float nv=abs(dot(normalize(vN),vV)); float body=pow(nv,1.6); float front=smoothstep(-0.9,0.9,-vL.z);
  float n=0.5+0.5*snoise(vec3(vL.xy*4.0,vL.z*1.4-uTime*11.0));
  vec3 col=mix(vec3(1.0,0.2,0.03),vec3(1.0,0.78,0.45),front*front)*body*(0.1+front*front*1.2)*(0.35+0.65*n)*uI*1.5;
  gl_FragColor=vec4(col,1.0); }`;

GLSL.groundSkyFrag = `
uniform vec3 cZen,cHor,uSun,cSun; uniform float uStars,uMax; varying vec3 vD;
${GLSL.noise}
void main(){ vec3 d=normalize(vD); float h=max(d.y,0.0);
  float hb=floor(pow(h,0.55)*5.0+0.5)/5.0;
  vec3 col=mix(cHor,cZen,hb);
  col=mix(col,cHor*0.85,(1.0-smoothstep(-0.25,0.0,d.y)));
  float s=max(dot(d,uSun),0.0);
  col*=0.78; col+=cSun*(smoothstep(0.965,0.968,s)*0.35+smoothstep(0.9975,0.998,s)*6.0);
  float cl=fbm(vec3(d.xz/max(d.y+0.18,0.06)*0.9,3.0),4);
  float cm=smoothstep(0.0,0.25,d.y);
  col=mix(col,mix(cHor,vec3(1.0),0.55)*0.85,smoothstep(0.3,0.33,cl)*cm*0.85);
  col=mix(col,mix(cHor,vec3(1.0),0.8),smoothstep(0.42,0.45,cl)*cm*0.85);
  vec3 q=d*220.0; float st=step(0.992,hash13(floor(q)))*(1.0-smoothstep(0.2,0.3,length(fract(q)-0.5))); col+=vec3(st)*uStars*h;
  col=clamp(col,vec3(0.0),vec3(uMax));
  gl_FragColor=vec4(col,1.0); }`;

GLSL.postVert = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
GLSL.postFrag = `
uniform sampler2D tDiffuse; uniform float uTime,uExposure,uWarp,uFade,uFlash; uniform vec3 uFadeCol;
varying vec2 vUv;
void main(){
  vec2 c=vUv-0.5; float r2=dot(c,c);
  float ca=uWarp*0.02*r2;
  vec3 col=vec3(texture2D(tDiffuse,vUv+c*ca).r, texture2D(tDiffuse,vUv).g, texture2D(tDiffuse,vUv-c*ca).b);
  col=mix(col,col*vec3(0.8,0.9,1.3),uWarp*0.4);
  col+=vec3(0.7,0.85,1.0)*uFlash*2.0;
  col*=uExposure;
  col=1.0-exp(-col*1.4);            // soft clip that keeps flat cartoon colours flat
  col=pow(col,vec3(1.0/2.2));
  float l=dot(col,vec3(0.299,0.587,0.114)); col=clamp(mix(vec3(l),col,1.2),0.0,1.0);
  col*=1.0-r2*0.35;
  col=mix(col,uFadeCol,uFade);
  gl_FragColor=vec4(col,1.0);
}`;
