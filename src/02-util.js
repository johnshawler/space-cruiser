/* ===================== UTIL ===================== */
const V3 = THREE.Vector3, Q4 = THREE.Quaternion;
const $ = id => document.getElementById(id);
const clamp = (x,a,b) => Math.max(a, Math.min(b, x));
const lerp = (a,b,t) => a + (b-a)*t;
const smooth = (a,b,x) => { x = clamp((x-a)/(b-a),0,1); return x*x*(3-2*x); };
const damp = (cur,target,rate,dt) => cur + (target-cur)*(1-Math.exp(-rate*dt));
const rnd = (a=1,b) => b===undefined ? Math.random()*a : a + Math.random()*(b-a);
const pick = a => a[Math.floor(Math.random()*a.length)];
const C = hex => new THREE.Color(hex).convertSRGBToLinear();
const HDR = (hex,k) => C(hex).multiplyScalar(k);
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hashStr(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }

function vnoise(x,y,seed){
  const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi, u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
  const h=(i,j)=>{ let n=Math.imul(i,374761393)+Math.imul(j,668265263)+Math.imul(seed,1274126177); n=Math.imul(n^(n>>>13),1274126177); return ((n^(n>>>16))>>>0)/4294967296; };
  return lerp(lerp(h(xi,yi),h(xi+1,yi),u), lerp(h(xi,yi+1),h(xi+1,yi+1),u), v);
}
function fbm2(x,y,seed,oct=5){ let a=0.5,s=0,f=1; for(let i=0;i<oct;i++){ s+=a*vnoise(x*f,y*f,seed+i*17); a*=0.5; f*=2.03; } return s; }

function fmtDist(d){ if(d<1000) return Math.round(d)+' km'; if(d<100000) return (d/1000).toFixed(1)+'k km'; return (d/LS).toFixed(2)+' ls'; }
function fmtNum(n){ return Math.round(n).toLocaleString('en-US'); }
function fmtCr(n){ return Math.round(n).toLocaleString('en-US')+' cr'; }
function fill(tpl, o){ return tpl.replace(/\{(\w+)\}/g, (m,k)=> o[k]!==undefined ? o[k] : m); }

/* ---------- canvas + textures ---------- */
/* how far an object dips below a floor at world height y, measured on its real (rotated) bounding box; 0 if it does not */
const _flBox=new THREE.Box3();
function sinkBelow(o, y){ o.updateMatrixWorld(true); _flBox.setFromObject(o); return Math.max(0,y-_flBox.min.y); }
/* text that reads over anything (a bright planet, a sunlit sky): a dark plate behind it and a dark outline around the letters.
   Uses the context's current font and textAlign; y is the baseline. */
function plateText(x, str, cx, y, maxW, col, pad=10){ const w=Math.min(maxW||1e9,x.measureText(str).width), fs=parseInt(x.font.match(/(\d+)px/)[1],10), a=x.textAlign;
  const left=a==='center'?cx-w/2:a==='right'||a==='end'?cx-w:cx; x.save(); x.globalAlpha=1; x.fillStyle='rgba(4,8,12,0.68)'; const r=Math.min(14,fs*0.3);
  x.beginPath(); if(x.roundRect) x.roundRect(left-pad,y-fs*0.86,w+pad*2,fs*1.16,r); else x.rect(left-pad,y-fs*0.86,w+pad*2,fs*1.16); x.fill();
  x.lineJoin='round'; x.lineWidth=Math.max(3,fs*0.14); x.strokeStyle='rgba(0,0,0,0.85)'; x.strokeText(str,cx,y,maxW); x.fillStyle=col; x.fillText(str,cx,y,maxW); x.restore(); }
function makeCanvas(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
function canvasTex(cv, srgb=true){ const t=new THREE.CanvasTexture(cv); if(srgb) t.encoding=THREE.sRGBEncoding; t.anisotropy=8; return t; }
const FONT_MONO = '"Share Tech Mono","SF Mono",Menlo,Consolas,monospace';
const FONT_DISP = '"Chakra Petch","Avenir Next Condensed","Trebuchet MS",sans-serif';

const _texCache = {};
/* grey noise + panel lines, used as bump/roughness */
function panelBumpTex(){
  if(_texCache.bump) return _texCache.bump;
  const s=512, cv=makeCanvas(s,s), x=cv.getContext('2d'); x.fillStyle='#808080'; x.fillRect(0,0,s,s);
  const r=mulberry32(77); const img=x.getImageData(0,0,s,s);
  for(let i=0;i<img.data.length;i+=4){ const n=128+(r()-0.5)*26; img.data[i]=img.data[i+1]=img.data[i+2]=n; }
  x.putImageData(img,0,0);
  x.strokeStyle='#404040'; x.lineWidth=2;
  for(let i=0;i<26;i++){ const px=Math.floor(r()*8)*64, py=Math.floor(r()*8)*64, w=(1+Math.floor(r()*3))*64, h=(1+Math.floor(r()*2))*64; x.strokeRect(px+1,py+1,w,h); }
  x.fillStyle='#a8a8a8'; for(let i=0;i<120;i++){ x.beginPath(); x.arc(Math.floor(r()*16)*32+6,Math.floor(r()*16)*32+6,1.6,0,7); x.fill(); }
  const t=canvasTex(cv,false); t.wrapS=t.wrapT=THREE.RepeatWrapping; return _texCache.bump=t;
}
/* painted hull plating with wear */
function hullTex(hex, wear=0.4, stripe=null){
  const key='h'+hex+wear+stripe; if(_texCache[key]) return _texCache[key];
  const s=512, cv=makeCanvas(s,s), x=cv.getContext('2d'), r=mulberry32(hashStr(key));
  x.fillStyle=hex; x.fillRect(0,0,s,s);
  for(let i=0;i<60;i++){ const px=Math.floor(r()*16)*32, py=Math.floor(r()*16)*32, w=(1+Math.floor(r()*4))*32, h=(1+Math.floor(r()*3))*32;
    const tone=r()<0.5?255:0; x.fillStyle=`rgba(${tone},${tone},${tone},${0.015+r()*0.045})`; x.fillRect(px,py,w,h);
    x.strokeStyle='rgba(0,0,0,0.28)'; x.lineWidth=1.5; x.strokeRect(px+0.5,py+0.5,w,h); }
  if(stripe){ x.fillStyle=stripe; x.fillRect(0,s*0.42,s,s*0.1); x.fillStyle='rgba(0,0,0,.25)'; x.fillRect(0,s*0.52,s,3); }
  for(let i=0;i<wear*260;i++){ const px=r()*s, py=r()*s, len=10+r()*70; const g=x.createLinearGradient(px,py,px,py+len);
    g.addColorStop(0,`rgba(20,12,8,${0.10+r()*0.25*wear})`); g.addColorStop(1,'rgba(20,12,8,0)'); x.fillStyle=g; x.fillRect(px,py,1+r()*5,len); }
  for(let i=0;i<wear*500;i++){ x.fillStyle=`rgba(${120+r()*60},${60+r()*40},${30},${r()*0.25*wear})`; x.beginPath(); x.arc(r()*s,r()*s,r()*5*wear+0.5,0,7); x.fill(); }
  const t=canvasTex(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; return _texCache[key]=t;
}
function softDotTex(){
  if(_texCache.dot) return _texCache.dot;
  const cv=makeCanvas(64,64), x=cv.getContext('2d'), g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.35,'rgba(255,255,255,.5)'); g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g; x.fillRect(0,0,64,64); return _texCache.dot=canvasTex(cv,false);
}
function glareTex(){
  if(_texCache.glare) return _texCache.glare;
  const s=256, cv=makeCanvas(s,s), x=cv.getContext('2d'); let g=x.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.08,'rgba(255,240,210,.8)'); g.addColorStop(0.3,'rgba(255,200,140,.18)'); g.addColorStop(1,'rgba(255,180,120,0)');
  x.fillStyle=g; x.fillRect(0,0,s,s); x.globalCompositeOperation='lighter';
  for(const a of [0,Math.PI/2,Math.PI/3.2,-Math.PI/3.2]){ x.save(); x.translate(s/2,s/2); x.rotate(a); g=x.createLinearGradient(-s/2,0,s/2,0);
    g.addColorStop(0,'rgba(255,220,180,0)'); g.addColorStop(0.5,'rgba(255,235,210,.55)'); g.addColorStop(1,'rgba(255,220,180,0)'); x.fillStyle=g; x.fillRect(-s/2,-1.2,s,2.4); x.restore(); }
  return _texCache.glare=canvasTex(cv,false);
}

/* ---------- alien writing ---------- */
function alienWords(spKey, english, seed){
  const sp=SPECIES[spKey], r=mulberry32(seed||hashStr(english)); const n=clamp(Math.round(english.split(' ').length*0.8),2,14); const out=[];
  for(let i=0;i<n;i++){ let w=''; const k=1+Math.floor(r()*3); for(let j=0;j<k;j++) w+=sp.syl[Math.floor(r()*sp.syl.length)]; out.push(w); }
  let s=out.join(' '); return s.charAt(0).toUpperCase()+s.slice(1);
}
function alienName(spKey, seed){
  const sp=SPECIES[spKey], r=mulberry32(seed); const part=()=>{ let w=''; const k=1+Math.floor(r()*2); for(let j=0;j<k;j++) w+=sp.syl[Math.floor(r()*sp.syl.length)].toLowerCase().replace(/[^a-z']/g,''); return w.charAt(0).toUpperCase()+w.slice(1); };
  let a=part(), b=part(); if(a.length<3) a+='o'; if(b.length<3) b+='ix'; return a+' '+b;
}
const SHIP_NAMES_A=['Ladle','Regret','Form','Pillow','Sorrow','Pebble','Bargain','Lunch','Mellow','Napkin','Receipt','Crouton','Sigh','Gravel','Discount','Hum','Spore','Beverage'];
const SHIP_NAMES_B=['of Destiny','in Triplicate','Unlimited','Express','Maru','of Doubt','Deluxe','(Probably)','Prime','and Sons','Again','of Tuesday','II','the Lesser'];
function shipName(seed){ const r=mulberry32(seed); return SHIP_NAMES_A[Math.floor(r()*SHIP_NAMES_A.length)]+' '+SHIP_NAMES_B[Math.floor(r()*SHIP_NAMES_B.length)]; }

function drawGlyphs(ctx, str, x, y, h, spKey, color, maxW){
  const style=SPECIES[spKey].script, w=h*0.62; let cx=x;
  ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=Math.max(1.4,h*0.085); ctx.lineCap='round'; ctx.lineJoin='round';
  for(let i=0;i<str.length;i++){
    if(str[i]===' '){ cx+=w*0.75; continue; }
    if(cx+w>x+maxW) break;
    const r=mulberry32(str.charCodeAt(i)*7919+hashStr(style)); const P=()=>[cx+Math.floor(r()*3)*w/2, y+Math.floor(r()*4)*h/3];
    ctx.beginPath();
    if(style==='angular'){ let p=P(); ctx.moveTo(p[0],p[1]); const n=2+Math.floor(r()*3); for(let k=0;k<n;k++){ p=P(); ctx.lineTo(p[0],p[1]); } ctx.stroke(); if(r()<0.4){ const q=P(); ctx.beginPath(); ctx.moveTo(q[0],q[1]); ctx.lineTo(q[0]+w*0.3,q[1]); ctx.stroke(); } }
    else if(style==='curvy'){ let p=P(); ctx.moveTo(p[0],p[1]); const n=1+Math.floor(r()*2); for(let k=0;k<n;k++){ const a=P(), b=P(); ctx.quadraticCurveTo(a[0],a[1],b[0],b[1]); } ctx.stroke(); if(r()<0.6){ const q=P(); ctx.beginPath(); ctx.arc(q[0],q[1],h*0.07,0,7); ctx.fill(); } if(r()<0.35){ ctx.beginPath(); ctx.arc(cx+w/2,y+h*0.5,w*0.3,r()*3,r()*3+3.5); ctx.stroke(); } }
    else if(style==='dots'){ const n=2+Math.floor(r()*4); for(let k=0;k<n;k++){ const q=P(); if(r()<0.5){ ctx.beginPath(); ctx.arc(q[0],q[1],h*0.08,0,7); ctx.fill(); } else { ctx.beginPath(); ctx.moveTo(q[0],q[1]); ctx.lineTo(q[0]+(r()-0.5)*w*0.7,q[1]-h*0.3); ctx.stroke(); } } }
    else { const cs=w/3.4; for(let a=0;a<3;a++) for(let b=0;b<4;b++) if(r()<0.5) ctx.fillRect(cx+a*cs*1.1, y+b*h/4.2, cs, h/5.4); }
    cx+=w*1.25;
  }
  ctx.restore();
}

/* ---------- alien portraits (100x100 design space) ---------- */
/* portraits are rendered from the same 3D models you see in port (Portrait, in the venues file); this flat drawing is only a fallback */
function drawAlien(ctx, spKey, seed, x, y, s){
  // a character model that hasn't been fetched yet: a quiet holding card, and start fetching it
  const md=portraitPending(spKey); if(md){ FolkModels.ready(md).catch(()=>{}); const S=SPECIES[spKey]; ctx.save(); ctx.translate(x,y); ctx.scale(s/100,s/100); const g=ctx.createLinearGradient(0,0,0,100); g.addColorStop(0,'#0a1620'); g.addColorStop(1,'#1b3442'); ctx.fillStyle=g; ctx.fillRect(0,0,100,100);
    ctx.fillStyle=S.col; ctx.globalAlpha=0.5; ctx.beginPath(); ctx.arc(50,40,17,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(50,92,30,28,0,0,7); ctx.fill(); ctx.restore(); return; }
  const im=typeof Portrait!=='undefined'&&Portrait.get(spKey,seed); if(!im){ drawAlien2D(ctx,spKey,seed,x,y,s); return; }
  ctx.save(); ctx.translate(x,y); ctx.scale(s/100,s/100); ctx.beginPath(); ctx.rect(0,0,100,100); ctx.clip(); ctx.drawImage(im,0,0,100,100);
  ctx.fillStyle='rgba(120,220,255,.05)'; for(let i=0;i<100;i+=4) ctx.fillRect(0,i,100,1.5); ctx.restore(); }
function drawAlien2D(ctx, spKey, seed, x, y, s){
  const sp=SPECIES[spKey], r=mulberry32((seed|0)+11); ctx.save(); ctx.translate(x,y); ctx.scale(s/100,s/100);
  ctx.beginPath(); ctx.rect(0,0,100,100); ctx.clip();
  const bg=ctx.createLinearGradient(0,0,0,100); bg.addColorStop(0,'#0a1620'); bg.addColorStop(1,'#1b3442'); ctx.fillStyle=bg; ctx.fillRect(0,0,100,100);
  const hue=sp.hue+(r()-0.5)*26, body=`hsl(${hue},${sp.sat}%,${sp.lit}%)`, dark=`hsl(${hue},${sp.sat}%,${sp.lit*0.6}%)`, light=`hsl(${hue},${sp.sat}%,${Math.min(92,sp.lit*1.3)}%)`;
  const circ=(cx,cy,rr)=>{ ctx.beginPath(); ctx.arc(cx,cy,rr,0,7); ctx.fill(); };
  const eye=(ex,ey,er,lid=0)=>{ ctx.fillStyle='#fdfdf5'; circ(ex,ey,er); ctx.fillStyle='#14141c'; circ(ex+(r()-0.5)*er*0.3,ey+er*0.12,er*0.48); ctx.fillStyle='#fff'; circ(ex-er*0.22,ey-er*0.25,er*0.16);
    if(lid){ ctx.fillStyle=dark; ctx.beginPath(); ctx.arc(ex,ey,er*1.05,Math.PI,2*Math.PI); ctx.lineTo(ex+er*1.05,ey-er*(1-lid*1.2)); ctx.lineTo(ex-er*1.05,ey-er*(1-lid*1.2)); ctx.fill(); } };
  ctx.lineCap='round'; ctx.lineJoin='round';
  switch(sp.kind){
    case 'blob': { ctx.fillStyle=body; ctx.beginPath(); ctx.moveTo(8,100); ctx.bezierCurveTo(6,40,30,14,50,14); ctx.bezierCurveTo(72,14,94,40,92,100); ctx.fill();
      ctx.fillStyle=light; ctx.globalAlpha=0.5; ctx.beginPath(); ctx.ellipse(34,36,9,14,-0.5,0,7); ctx.fill(); ctx.globalAlpha=1;
      eye(34,52,9); eye(66,52,9); eye(50,36,7); ctx.strokeStyle='#123'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(50,66,16,0.15*Math.PI,0.85*Math.PI); ctx.stroke();
      ctx.fillStyle=body; circ(14,30+r()*20,3); circ(86,24+r()*20,2.4); break; }
    case 'insect': { ctx.strokeStyle=dark; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(38,24); ctx.quadraticCurveTo(26,4,14,8); ctx.moveTo(62,24); ctx.quadraticCurveTo(74,4,86,8); ctx.stroke();
      ctx.fillStyle=body; ctx.beginPath(); ctx.moveTo(50,90); ctx.lineTo(20,40); ctx.quadraticCurveTo(50,8,80,40); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#1c2a1c'; ctx.beginPath(); ctx.ellipse(34,44,11,15,-0.4,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(66,44,11,15,0.4,0,7); ctx.fill();
      ctx.fillStyle='rgba(180,255,160,.5)'; for(let i=0;i<8;i++){ circ(28+(i%3)*5,36+Math.floor(i/3)*6,1.4); circ(61+(i%3)*5,36+Math.floor(i/3)*6,1.4); }
      ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(44,78); ctx.lineTo(40,92); ctx.moveTo(56,78); ctx.lineTo(60,92); ctx.stroke();
      ctx.fillStyle='#fff'; ctx.fillRect(40,62,20,4); break; }
    case 'fluffy': { ctx.fillStyle=body; ctx.beginPath(); for(let i=0;i<36;i++){ const a=i/36*6.283, rr=(i%2?38:31)+r()*4; ctx.lineTo(50+Math.cos(a)*rr,56+Math.sin(a)*rr); } ctx.fill();
      ctx.fillStyle=light; circ(22,26,9); circ(78,26,9); ctx.fillStyle='#f7a'; circ(22,26,4.5); circ(78,26,4.5);
      eye(38,50,10); eye(62,50,10); ctx.strokeStyle='#422'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(29,37); ctx.lineTo(43,35); ctx.moveTo(71,37); ctx.lineTo(57,35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(44,72); ctx.quadraticCurveTo(50,68,56,72); ctx.stroke(); ctx.fillStyle='#345'; circ(50,63,2.6); break; }
    case 'squid': { ctx.fillStyle=body; ctx.beginPath(); ctx.moveTo(26,62); ctx.bezierCurveTo(18,10,82,10,74,62); ctx.closePath(); ctx.fill();
      ctx.strokeStyle=body; ctx.lineWidth=7; for(let i=0;i<5;i++){ const tx=30+i*10; ctx.beginPath(); ctx.moveTo(tx,58); ctx.bezierCurveTo(tx-8,74,tx+8,84,tx+(r()-0.5)*14,102); ctx.stroke(); }
      eye(38,44,8,0.5); eye(62,44,8,0.5); ctx.fillStyle=light; ctx.globalAlpha=0.4; ctx.beginPath(); ctx.ellipse(50,22,10,5,0,0,7); ctx.fill(); ctx.globalAlpha=1;
      ctx.fillStyle=dark; for(let i=0;i<5;i++) circ(34+r()*32,14+r()*14,1.6); break; }
    case 'rock': { ctx.fillStyle=body; ctx.beginPath(); ctx.moveTo(18,96); ctx.lineTo(12,52); ctx.lineTo(26,22); ctx.lineTo(52,10); ctx.lineTo(80,24); ctx.lineTo(90,58); ctx.lineTo(82,96); ctx.closePath(); ctx.fill();
      ctx.fillStyle=light; ctx.beginPath(); ctx.moveTo(26,22); ctx.lineTo(52,10); ctx.lineTo(48,34); ctx.closePath(); ctx.fill();
      ctx.fillStyle=dark; ctx.beginPath(); ctx.moveTo(80,24); ctx.lineTo(90,58); ctx.lineTo(70,52); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#ffb040'; ctx.shadowColor='#ffb040'; ctx.shadowBlur=8; ctx.fillRect(30,44,12,5); ctx.fillRect(58,44,12,5); ctx.shadowBlur=0;
      ctx.strokeStyle='#221a16'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(34,70); ctx.lineTo(44,67); ctx.lineTo(54,71); ctx.lineTo(66,68); ctx.stroke(); break; }
    case 'bird': { ctx.fillStyle=dark; ctx.beginPath(); ctx.moveTo(40,22); ctx.lineTo(36,2); ctx.lineTo(48,16); ctx.lineTo(52,0); ctx.lineTo(56,16); ctx.lineTo(66,4); ctx.lineTo(60,24); ctx.fill();
      ctx.fillStyle=body; circ(50,52,32); ctx.fillStyle=light; ctx.beginPath(); ctx.ellipse(50,74,20,12,0,0,7); ctx.fill();
      eye(36,44,11); eye(64,44,11); ctx.fillStyle='#ffb020'; ctx.beginPath(); ctx.moveTo(40,56); ctx.lineTo(60,56); ctx.lineTo(50,78); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#c07810'; ctx.beginPath(); ctx.moveTo(42,60); ctx.lineTo(58,60); ctx.lineTo(50,66); ctx.closePath(); ctx.fill(); break; }
    case 'jelly': { const g=ctx.createRadialGradient(50,40,4,50,44,40); g.addColorStop(0,light); g.addColorStop(1,'hsla('+hue+',70%,45%,.55)'); ctx.fillStyle=g;
      ctx.beginPath(); ctx.moveTo(14,56); ctx.bezierCurveTo(14,2,86,2,86,56); ctx.quadraticCurveTo(74,48,62,58); ctx.quadraticCurveTo(50,48,38,58); ctx.quadraticCurveTo(26,48,14,56); ctx.fill();
      ctx.strokeStyle='hsla('+hue+',80%,70%,.7)'; ctx.lineWidth=2.5; for(let i=0;i<7;i++){ const tx=22+i*9.5; ctx.beginPath(); ctx.moveTo(tx,56); ctx.bezierCurveTo(tx+6,70,tx-6,84,tx+(r()-0.5)*8,100); ctx.stroke(); }
      for(let i=0;i<5;i++) eye(28+i*11,36+(i%2)*7,4.2); ctx.fillStyle='rgba(255,255,255,.6)'; circ(36,18,3); break; }
    case 'shroom': { ctx.fillStyle='#e9dcc0'; ctx.beginPath(); ctx.moveTo(34,100); ctx.quadraticCurveTo(30,60,36,48); ctx.lineTo(64,48); ctx.quadraticCurveTo(70,60,66,100); ctx.fill();
      ctx.fillStyle=body; ctx.beginPath(); ctx.moveTo(6,52); ctx.bezierCurveTo(8,4,92,4,94,52); ctx.quadraticCurveTo(50,62,6,52); ctx.fill();
      ctx.fillStyle=light; for(let i=0;i<6;i++){ ctx.beginPath(); ctx.ellipse(20+r()*60,18+r()*24,4+r()*4,3+r()*3,0,0,7); ctx.fill(); }
      eye(42,68,6,0.55); eye(58,68,6,0.55); ctx.strokeStyle='#654'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.arc(50,80,7,0.2*Math.PI,0.8*Math.PI); ctx.stroke(); break; }
    default: { ctx.strokeStyle='#889'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(50,20); ctx.lineTo(50,6); ctx.stroke(); ctx.fillStyle='#ff5050'; circ(50,6,4);
      ctx.fillStyle=body; ctx.fillRect(18,20,64,62); ctx.fillStyle=dark; ctx.fillRect(18,74,64,8); ctx.fillStyle=light; ctx.fillRect(18,20,64,5);
      ctx.fillStyle='#0c1418'; ctx.fillRect(26,30,48,22); ctx.fillStyle='#5fffd0'; ctx.shadowColor='#5fffd0'; ctx.shadowBlur=6; ctx.fillRect(32,36,10,10); ctx.fillRect(58,36,10,10); ctx.shadowBlur=0;
      ctx.fillStyle='#222'; for(let i=0;i<6;i++) ctx.fillRect(30+i*7,60,4,10); ctx.fillStyle='#ffd24a'; ctx.fillRect(70,84,8,10); ctx.fillStyle='#333'; ctx.fillRect(22,88,40,6); }
  }
  ctx.fillStyle='rgba(120,220,255,.05)'; for(let i=0;i<100;i+=4) ctx.fillRect(0,i,100,1.5);
  ctx.restore();
}
function portraitPending(spKey){ const md=SPECIES[spKey]&&SPECIES[spKey].model; return md&&typeof FolkModels!=='undefined'&&FolkModels.info(md)&&!FolkModels.loaded(md)&&!FolkModels.failed(md)?md:null; }
function portraitCanvas(spKey, seed, px=128){ const cv=makeCanvas(px,px), x=cv.getContext('2d'), md=portraitPending(spKey); drawAlien(x,spKey,seed,0,0,px);
  if(md){ const again=()=>{ x.clearRect(0,0,px,px); drawAlien(x,spKey,seed,0,0,px); }; FolkModels.ready(md).then(again,again); }   // the face fills in when the model arrives
  return cv; }

/* small geometry helpers */
function beamBetween(a,b,thick,mat,depth){
  const d=new V3().subVectors(b,a), len=d.length(); const m=new THREE.Mesh(new THREE.BoxGeometry(thick,len,depth||thick),mat);
  m.position.copy(a).addScaledVector(d,0.5); m.quaternion.setFromUnitVectors(new V3(0,1,0), d.normalize()); return m;
}
function quadGeo(p1,p2,p3,p4){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([p1.x,p1.y,p1.z,p2.x,p2.y,p2.z,p3.x,p3.y,p3.z, p1.x,p1.y,p1.z,p3.x,p3.y,p3.z,p4.x,p4.y,p4.z],3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0,0,1,0,1,1, 0,0,1,1,0,1],2)); g.computeVertexNormals(); return g;
}
function lookQuat(dir, up){ const m=new THREE.Matrix4().lookAt(new V3(0,0,0), dir, up||new V3(0,1,0)); return new Q4().setFromRotationMatrix(m); }
