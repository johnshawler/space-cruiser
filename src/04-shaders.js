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
void main(){
  int oct=int(uOct);
  vec3 N0=normalize(vN); vec3 V=normalize(cameraPosition-vW);
  vec3 p=vP*1.7+uSeed;
  vec3 w=vec3(fbm(p*1.2+11.0,3),fbm(p*1.2+37.0,3),fbm(p*1.2+71.0,3));
  float cont=fbm(p+w*0.7,oct);
  float h=0.5+0.6*cont;
  float ridge=1.0-abs(snoise(p*3.1+w*1.3)); ridge*=ridge;
  float land=smoothstep(uSea-0.004,uSea+0.012,h);
  h+=land*(ridge-0.35)*0.16*smoothstep(uSea,uSea+0.25,h);
  float t=clamp((h-uSea)/max(0.001,1.0-uSea)*1.7,0.0,1.0);
  float bio=fbm(p*2.6+50.0,min(oct,4))*0.5+0.5;
  vec3 landC=mix(cA,cB,smoothstep(0.03,0.22,t+bio*0.12));
  landC=mix(landC,cC,smoothstep(0.25,0.55,t+(bio-0.5)*0.3));
  landC=mix(landC,cD,smoothstep(0.62,0.9,t+(ridge-0.5)*0.2));
  float depth=clamp((uSea-h)/0.25,0.0,1.0);
  vec3 seaC=mix(cShal,cDeep,smoothstep(0.0,0.6,depth));
  vec3 alb=mix(seaC,landC,land);
  float ice=smoothstep(uIce-0.06,uIce+0.04,abs(vP.y)+0.12*fbm(p*4.0,3)+land*(h-uSea)*0.25);
  alb=mix(alb,cD,ice);
  float wet=(1.0-land)*(1.0-ice);
  // bump from height derivatives
  vec3 N=N0;
  if(uBump>0.0){
    float hb=h*(land+ice*0.3);
    vec3 dpx=dFdx(vW), dpy=dFdy(vW); float dhx=dFdx(hb), dhy=dFdy(hb);
    vec3 r1=cross(dpy,N0), r2=cross(N0,dpx); float det=dot(dpx,r1);
    vec3 grad=sign(det)*(dhx*r1+dhy*r2);
    N=normalize(abs(det)*N0-uBump*grad);
  }
  float ndl0=dot(N0,uSun); float ndl=dot(N,uSun);
  float day=smoothstep(-0.12,0.22,ndl0);
  vec3 sunC=mix(vec3(1.0,0.42,0.18),vec3(1.0,0.97,0.92),smoothstep(-0.05,0.4,ndl0))*1.45;
  vec3 col=alb*max(ndl,0.0)*sunC*day;
  vec3 H=normalize(uSun+V);
  col+=sunC*pow(max(dot(N0,H),0.0),160.0)*0.45*wet*(1.0-uLava)*day;
  // molten seas and cracks
  float crack=pow(1.0-abs(snoise(p*4.5+w*1.7)),7.0)*land;
  float glow=(wet*(0.55+0.45*fbm(p*8.0+uTime*0.02,3))+crack*1.4)*uLava;
  col+=cEmis*glow*3.2;
  // city lights
  float city=smoothstep(0.55,0.85,snoise(vP*38.0+uSeed)*0.5+0.5)*smoothstep(0.35,0.65,snoise(vP*7.0+uSeed*3.0)*0.5+0.5);
  city*=land*(1.0-ice)*(1.0-smoothstep(0.05,0.5,t));
  // clouds
  vec3 cp=vP*2.3+w*0.9+vec3(uTime*0.006,0.0,uTime*0.003)+uSeed*2.0;
  float cl=smoothstep(1.0-uCloud,1.25-uCloud,fbm(cp,oct)*0.62+0.5+0.12*snoise(cp*5.0));
  col+=cEmis*city*uCity*(1.0-day)*(1.0-cl*0.85)*2.4;
  vec3 cloudLit=cCloud*max(ndl0+0.08,0.0)*sunC*day*0.78;
  col=mix(col,cloudLit,cl*0.94);
  col*=1.0-0.25*cl*uLava;
  // atmosphere limb
  float fr=pow(1.0-max(dot(N0,V),0.0),3.2);
  col+=cAtm*fr*(0.06+1.5*day)*uAtm;
  col+=alb*0.006;
  gl_FragColor=vec4(col,1.0);
}`;

GLSL.gasFrag = `
uniform vec3 uSun; uniform float uTime,uSeed,uBands,uTurb,uAtm,uOct;
uniform vec3 cA,cB,cC,cD,cAtm;
varying vec3 vP; varying vec3 vN; varying vec3 vW;
${GLSL.noise}
void main(){
  int oct=int(uOct);
  vec3 N0=normalize(vN); vec3 V=normalize(cameraPosition-vW);
  vec3 q=vec3(vP.x*1.6,vP.y*5.5,vP.z*1.6)+uSeed+vec3(uTime*0.003,0.0,0.0);
  float turb=fbm(q,oct);
  float sw=fbm(vP*3.2+uSeed*2.0+turb*1.5,oct);
  float lat=vP.y*uBands+turb*uTurb+sw*0.9;
  float t=sin(lat)*0.5+0.5; float t2=sin(lat*2.63+1.3)*0.5+0.5; float t3=sin(lat*0.37+4.0)*0.5+0.5;
  vec3 alb=mix(cA,cB,smoothstep(0.2,0.8,t));
  alb=mix(alb,cC,t2*0.45);
  alb=mix(alb,cD,smoothstep(0.55,0.95,t3)*0.55);
  alb=mix(alb,cD,smoothstep(0.25,0.7,fbm(vP*vec3(2.0,11.0,2.0)+5.0+uSeed,oct))*0.35);
  vec3 sp=normalize(vec3(0.62,-0.33,0.71)); vec3 dv=vP-sp; float d=length(dv*vec3(1.0,2.4,1.0));
  float storm=(1.0-smoothstep(0.08,0.24,d+0.04*sw)); alb=mix(alb,mix(cD,cC,0.3+0.3*sin(d*40.0+turb*6.0)),storm*0.85);
  alb*=1.0-0.35*pow(abs(vP.y),6.0);
  float ndl=dot(N0,uSun); float day=smoothstep(-0.1,0.25,ndl);
  vec3 sunC=mix(vec3(1.0,0.45,0.2),vec3(1.0,0.97,0.92),smoothstep(-0.05,0.4,ndl))*1.45;
  vec3 col=alb*pow(max(ndl,0.0),0.85)*sunC*day;
  float fr=pow(1.0-max(dot(N0,V),0.0),3.0);
  col+=cAtm*fr*(0.04+1.2*day)*uAtm;
  col+=alb*0.004;
  gl_FragColor=vec4(col,1.0);
}`;

GLSL.atmoFrag = `
uniform vec3 uSun; uniform vec3 cAtm; uniform float uEdge,uAtm;
varying vec3 vP; varying vec3 vN; varying vec3 vW;
void main(){ vec3 V=normalize(cameraPosition-vW); vec3 N=normalize(vN);
  float g=pow(clamp(-dot(N,V)/uEdge,0.0,1.0),2.6);
  float lit=smoothstep(-0.45,0.35,dot(N,uSun)+0.25*dot(-V,uSun));
  gl_FragColor=vec4(cAtm*g*lit*1.6*uAtm,1.0); }`;

GLSL.ringVert = `varying vec3 vL; void main(){ vL=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
GLSL.ringFrag = `
uniform vec3 uSunL; uniform vec3 c1,c2; uniform float uIn,uOut,uR,uSeed;
varying vec3 vL;
${GLSL.noise}
void main(){ float r=length(vL.xy); float t=(r-uIn)/(uOut-uIn);
  float a=0.55+0.45*snoise(vec3(t*14.0,uSeed,0.0)); a*=0.6+0.4*snoise(vec3(t*61.0,uSeed,3.0)); a*=0.8+0.2*snoise(vec3(t*240.0,uSeed,7.0));
  a*=smoothstep(0.0,0.04,t)*(1.0-smoothstep(0.93,1.0,t)); a*=1.0-0.85*(1.0-smoothstep(0.0,0.03,abs(t-0.58))); a=clamp(a,0.0,1.0);
  vec3 col=mix(c1,c2,0.5+0.5*snoise(vec3(t*7.0,uSeed,11.0)));
  float tt=dot(vL,uSunL); float d=length(vL-uSunL*tt); float sh=(tt<0.0 && d<uR)?0.06:1.0;
  float lit=0.35+0.65*abs(uSunL.z);
  gl_FragColor=vec4(col*lit*sh*1.7,a*0.92); }`;

GLSL.sunFrag = `
uniform float uTime; varying vec3 vP; varying vec3 vN; varying vec3 vW;
${GLSL.noise}
void main(){ vec3 V=normalize(cameraPosition-vW); float mu=max(dot(normalize(vN),V),0.0);
  float n=fbm(vP*6.0+vec3(0.0,uTime*0.03,0.0),5)*0.5+0.5; float n2=fbm(vP*22.0+uTime*0.05,4)*0.5+0.5;
  vec3 col=mix(vec3(1.0,0.45,0.08),vec3(1.0,0.92,0.7),n*0.7+n2*0.3);
  col*=(0.55+0.45*pow(mu,0.5))*9.0;
  gl_FragColor=vec4(col,1.0); }`;

GLSL.skyVert = `varying vec3 vD; void main(){ vD=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
GLSL.skyFrag = `
uniform float uBoost; varying vec3 vD;
${GLSL.noise}
vec3 starLayer(vec3 d,float scale,float thresh,float bright){
  vec3 q=d*scale; vec3 id=floor(q); vec3 f=fract(q)-0.5; float h=hash13(id);
  if(h<thresh) return vec3(0.0);
  vec3 off=vec3(hash13(id+7.1),hash13(id+13.7),hash13(id+29.3))-0.5;
  float s=(1.0-smoothstep(0.0,0.22,length(f-off*0.5)));
  float tcol=hash13(id+3.3);
  vec3 c=mix(vec3(1.0,0.72,0.5),vec3(0.65,0.8,1.0),tcol);
  return c*s*s*bright*(0.3+2.0*pow(hash13(id+91.0),6.0));
}
void main(){
  vec3 d=normalize(vD);
  vec3 axis=normalize(vec3(0.25,1.0,0.35));
  float band=exp(-pow(dot(d,axis)*3.2,2.0));
  float n1=fbm(d*1.4+3.0,6)*0.5+0.5; float n2=fbm(d*2.3+n1*1.6+20.0,6)*0.5+0.5; float n3=fbm(d*3.1+n2*2.0+60.0,6)*0.5+0.5;
  vec3 col=vec3(0.0);
  col+=vec3(0.30,0.07,0.42)*pow(n1,3.5)*0.9;
  col+=vec3(0.04,0.26,0.42)*pow(n2,4.5)*1.3;
  col+=vec3(0.55,0.18,0.10)*pow(n3,6.0)*1.1*(0.3+band);
  float dust=fbm(d*6.0+7.0,5)*0.5+0.5;
  col+=band*vec3(0.34,0.29,0.24)*(0.15+0.85*dust)*0.32;
  col*=1.0-band*smoothstep(0.42,0.75,fbm(d*4.5+40.0,5)*0.5+0.5)*0.8;
  col*=0.55;
  float dens=0.35+band*1.3;
  col+=starLayer(d,160.0,1.0-0.012*dens,1.2);
  col+=starLayer(d,330.0,1.0-0.02*dens,0.55);
  col+=starLayer(d,520.0,1.0-0.03*dens,0.25);
  gl_FragColor=vec4(col*uBoost,1.0);
}`;

GLSL.starVert = `attribute float size; attribute vec3 color; varying vec3 vC; uniform float uPx;
void main(){ vC=color; gl_PointSize=size*uPx; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
GLSL.starFrag = `varying vec3 vC; void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); float a=(1.0-smoothstep(0.0,0.5,d)); gl_FragColor=vec4(vC*a*a,1.0); }`;

GLSL.tunnelVert = `varying vec2 vUv; varying vec3 vL; void main(){ vUv=uv; vL=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
GLSL.tunnelFrag = `
uniform float uTime,uWarp; varying vec2 vUv; varying vec3 vL;
${GLSL.noise}
void main(){ float a=vUv.x*6.2831853; vec2 ring=vec2(cos(a),sin(a))*3.0;
  float n=snoise(vec3(ring*2.2,vUv.y*5.0+uTime*3.5)); float n2=snoise(vec3(ring*7.0,vUv.y*16.0+uTime*9.0));
  float s=pow(max(n*0.6+n2*0.4,0.0),2.2);
  float fade=smoothstep(0.0,0.25,vUv.y)*(1.0-smoothstep(0.5,1.0,vUv.y));
  vec3 col=mix(vec3(0.15,0.35,1.0),vec3(0.75,0.5,1.0),n2*0.5+0.5)*s*fade*uWarp*2.4;
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
uniform vec3 cZen,cHor,uSun,cSun; uniform float uStars,uMax,uCloud,uAtmo; varying vec3 vD;
${GLSL.noise}
void main(){ vec3 d=normalize(vD); float h=max(d.y,0.0);
  vec3 col=mix(cHor,cZen,pow(h,0.55));
  col=mix(col,cHor*0.85,(1.0-smoothstep(-0.25,0.0,d.y)));
  float s=max(dot(d,uSun),0.0);
  col*=0.72; col+=cSun*(pow(s,8.0)*0.10+pow(s,64.0)*0.5+pow(s,1400.0)*30.0);
  // atmospheric scattering: thick air toward the horizon brightens and hazes the sky; light scattered forward makes a broad
  // glow round the sun; when the sun is low its side of the horizon reddens and the far side cools
  if(uAtmo>0.0){ float band=pow(1.0-h,5.0)*smoothstep(-0.2,0.02,d.y), low=1.0-smoothstep(0.02,0.5,uSun.y), toward=pow(s,2.5);
    vec3 warm=vec3(1.0,0.52,0.26);
    col=mix(col,mix(cHor,vec3(1.0),0.3),band*0.4*uAtmo);
    col+=cSun*warm*(band*toward*low*0.65+pow(s,4.0)*0.16*(0.4+0.6*low))*uAtmo;
    col=mix(col,col*vec3(0.9,0.86,1.06)+vec3(0.04,0.03,0.07)*low,band*(1.0-toward)*0.45*uAtmo); }
  float cl=fbm(vec3(d.xz/max(d.y+0.18,0.06)*0.9,3.0),5); col=mix(col,mix(cHor,vec3(1.0),0.6)*0.85,smoothstep(0.1,0.6,cl)*smoothstep(0.0,0.25,d.y)*0.55*uCloud);
  vec3 q=d*220.0; float st=step(0.992,hash13(floor(q)))*(1.0-smoothstep(0.0,0.35,length(fract(q)-0.5))); col+=vec3(st)*uStars*h;
  col=clamp(col,vec3(0.0),vec3(uMax));
  gl_FragColor=vec4(col,1.0); }`;

GLSL.postVert = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
GLSL.postFrag = `
uniform sampler2D tDiffuse; uniform float uTime,uExposure,uWarp,uFade,uFlash,uBlur,uSat,uContrast; uniform vec3 uFadeCol,uLift,uGain;
varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
void main(){
  vec2 c=vUv-0.5; float r2=dot(c,c);
  float ca=(0.0035+uWarp*0.02)*r2;
  vec3 col=vec3(texture2D(tDiffuse,vUv+c*ca).r, texture2D(tDiffuse,vUv).g, texture2D(tDiffuse,vUv-c*ca).b);
  // motion blur: at speed the picture streaks outwards from the middle, more towards the edges
  if(uBlur>0.001){ vec3 acc=col; float k=uBlur*sqrt(r2)*0.09; for(int i=1;i<7;i++){ acc+=texture2D(tDiffuse,vUv-c*k*float(i)).rgb; } col=acc/7.0; }
  col=mix(col,col*vec3(0.75,0.9,1.35),uWarp*0.5);
  col+=vec3(0.7,0.85,1.0)*uFlash*2.0;
  col*=uExposure;
  col=aces(col);
  col=pow(col,vec3(1.0/2.2));
  // colour grading: each planet's own mood (saturation, contrast, tinted shadows and highlights)
  float lum=dot(col,vec3(0.299,0.587,0.114)); col=mix(vec3(lum),col,uSat); col=(col-0.5)*uContrast+0.5; col=clamp(col,0.0,1.0)*uGain+uLift*(1.0-clamp(col,0.0,1.0));
  col*=1.0-r2*0.75;
  col+=(h21(vUv*vec2(1920.0,1080.0)+fract(uTime)*91.7)-0.5)*0.03;
  col=mix(col,uFadeCol,uFade);
  gl_FragColor=vec4(col,1.0);
}`;

/* depth of field: things well behind what you're looking at go soft, using a depth picture of the scene */
GLSL.dofFrag = `
#include <packing>
uniform sampler2D tDiffuse, tDepth; uniform float uNear, uFar, uFocus, uMax; uniform vec2 uPx; varying vec2 vUv;
float distAt(vec2 uv){ float d=unpackRGBAToDepth(texture2D(tDepth,uv)); return -perspectiveDepthToViewZ(d,uNear,uFar); }
float cocAt(vec2 uv){ return clamp((distAt(uv)-uFocus-1.5)/(uFocus*0.8+4.0),0.0,1.0); }
void main(){
  vec4 base=texture2D(tDiffuse,vUv); float coc=cocAt(vUv)*uMax; if(coc<0.4){ gl_FragColor=base; return; }
  vec3 acc=base.rgb; float w=1.0;
  for(int i=0;i<16;i++){ float a=float(i)*2.39996, r=sqrt(float(i)+0.5)/4.0; vec2 o=vec2(cos(a),sin(a))*r*coc*uPx;
    float cs=cocAt(vUv+o); float ww=smoothstep(0.0,0.35,cs); acc+=texture2D(tDiffuse,vUv+o).rgb*ww; w+=ww; }
  gl_FragColor=vec4(acc/w,base.a); }`;
