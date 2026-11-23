/* ===================== SHIP MODELS ===================== */
/* All models: nose toward -Z, roughly 20-40 units long, origin near centre of mass.
   Built from smooth lathed hulls, rounded panels, engine bells, framed canopies and surface detail. */
const Models = (() => {
  const SCHEMES = [
    {hull:'#8a5a3c',trim:'#3a3a3c',glow:'#ffb060',wear:1.0},
    {hull:'#c9a21e',trim:'#2a2a2c',glow:'#ffd27a',wear:0.7},
    {hull:'#e8eef0',trim:'#19a898',glow:'#7ff5e6',wear:0.25},
    {hull:'#7a1f2c',trim:'#c9a24a',glow:'#ffcf8a',wear:0.15},
    {hull:'#f4f6f8',trim:'#30363c',glow:'#5fd8ff',wear:0.05},
  ];
  function mats(s){
    const bump=panelBumpTex();
    const hull=new THREE.MeshStandardMaterial({map:hullTex(s.hull,s.wear),bumpMap:bump,bumpScale:0.06,roughness:0.42+s.wear*0.3,metalness:0.55-s.wear*0.25,color:0xffffff,side:THREE.DoubleSide,envMapIntensity:1.2});
    const trim=new THREE.MeshStandardMaterial({map:hullTex(s.trim,s.wear*0.6),bumpMap:bump,bumpScale:0.05,roughness:0.38,metalness:0.7,envMapIntensity:1.2});
    const dark=new THREE.MeshStandardMaterial({color:C('#17191d'),roughness:0.55,metalness:0.6});
    const metal=new THREE.MeshStandardMaterial({color:C('#c4c9d2'),roughness:0.22,metalness:1.0,envMapIntensity:1.5});
    const glass=new THREE.MeshStandardMaterial({color:C('#0b1826'),roughness:0.05,metalness:0.9,envMapIntensity:2.4});
    const glow=new THREE.MeshBasicMaterial({color:HDR(s.glow,6)});
    const win=new THREE.MeshBasicMaterial({color:HDR('#ffe6b0',2.2)});
    const bell=new THREE.MeshStandardMaterial({color:C('#2a2c30'),roughness:0.35,metalness:0.9,side:THREE.DoubleSide});
    return {hull,trim,dark,metal,glass,glow,win,bell};
  }
  const V2=THREE.Vector2;
  const box=(w,h,d,m,x=0,y=0,z=0)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); return o; };
  /* cylinder along Z; r1 is the +Z end */
  const cylZ=(r1,r2,len,m,x=0,y=0,z=0,seg=24)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg),m); o.rotation.x=Math.PI/2; o.position.set(x,y,z); return o; };
  const cylY=(r1,r2,len,m,x=0,y=0,z=0,seg=16)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg),m); o.position.set(x,y,z); return o; };
  const ball=(r,m,x=0,y=0,z=0,sx=1,sy=1,sz=1)=>{ const o=new THREE.Mesh(new THREE.SphereGeometry(r,28,18),m); o.position.set(x,y,z); o.scale.set(sx,sy,sz); return o; };
  /* box with rounded edges */
  function rbox(w,h,d,r,m,x=0,y=0,z=0){
    const b=Math.min(r*0.6,w/4,h/4,d/4), iw=w-2*b, ih=h-2*b, rr=Math.min(r-b*0.5,iw/2,ih/2), hw=iw/2, hh=ih/2, s=new THREE.Shape();
    s.moveTo(-hw+rr,-hh); s.lineTo(hw-rr,-hh); s.quadraticCurveTo(hw,-hh,hw,-hh+rr); s.lineTo(hw,hh-rr); s.quadraticCurveTo(hw,hh,hw-rr,hh); s.lineTo(-hw+rr,hh); s.quadraticCurveTo(-hw,hh,-hw,hh-rr); s.lineTo(-hw,-hh+rr); s.quadraticCurveTo(-hw,-hh,-hw+rr,-hh);
    const dd=Math.max(0.01,d-2*b), g=new THREE.ExtrudeGeometry(s,{depth:dd,bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:3,curveSegments:5}); g.translate(0,0,-dd/2); g.computeVertexNormals();
    const o=new THREE.Mesh(g,m); o.position.set(x,y,z); return o; }
  /* smooth body of revolution. profile: [[radius, z]] from nose (-z) to tail (+z) */
  function lathe(profile, m, sx=1, sy=1, smooth=true){
    let pts=profile.map(p=>new V2(Math.max(p[0],0.001),p[1])); if(smooth&&pts.length>2) pts=new THREE.SplineCurve(pts).getPoints(Math.max(24,pts.length*8)).map(p=>new V2(Math.max(p.x,0.001),p.y));
    const g=new THREE.LatheGeometry(pts,48); g.rotateX(Math.PI/2); g.scale(sx,sy,1); g.computeVertexNormals(); return new THREE.Mesh(g,m); }
  function wing(pts, thick, m){ // pts in XZ plane [[x,z],...]
    const sh=new THREE.Shape(); sh.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) sh.lineTo(pts[i][0],pts[i][1]); sh.closePath();
    const g=new THREE.ExtrudeGeometry(sh,{depth:thick,bevelEnabled:true,bevelSize:thick*0.45,bevelThickness:thick*0.45,bevelSegments:3}); g.rotateX(Math.PI/2); g.translate(0,thick/2,0); g.computeVertexNormals();
    return new THREE.Mesh(g,m); }
  /* framed bubble canopy */
  function canopy(G, M, w, h, len, x, y, z, ribs=3){
    G.add(ball(1,M.glass,x,y,z,w,h,len));
    for(let i=0;i<ribs;i++){ const t=(i+1)/(ribs+1)*2-1, k=Math.sqrt(1-t*t), rib=new THREE.Mesh(new THREE.TorusGeometry(1,0.045,6,28,Math.PI),M.metal); rib.scale.set(w*k*1.01,h*k*1.03,1); rib.position.set(x,y,z+t*len); G.add(rib); }
    const sp=new THREE.Mesh(new THREE.TorusGeometry(1,0.05,6,40,Math.PI),M.metal); sp.rotation.y=Math.PI/2; sp.scale.set(len*1.01,h*1.03,1); sp.position.set(x,y,z); G.add(sp); }
  function engine(G, M, r, x, y, z, len=5){
    const g=new THREE.Group(); g.position.set(x,y,z);
    g.add(lathe([[r*0.62,-len/2],[r*0.98,-len*0.32],[r*1.04,len*0.05],[r*0.96,len*0.34]],M.trim));
    g.add(cylZ(r*1.06,r*1.06,len*0.1,M.metal,0,0,-len*0.12,28)); g.add(cylZ(r*1.0,r*1.0,len*0.06,M.dark,0,0,len*0.22,28));
    const bl=lathe([[r*0.55,len*0.3],[r*0.6,len*0.36],[r*0.82,len*0.48],[r*0.98,len*0.58]],M.bell,1,1); g.add(bl);
    const disc=new THREE.Mesh(new THREE.CircleGeometry(r*0.56,24),M.glow); disc.position.z=len*0.33; g.add(disc);
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; g.add(box(r*0.12,r*0.12,len*0.5,M.dark,Math.cos(a)*r*1.0,Math.sin(a)*r*1.0,-len*0.05)); }
    const plume=new THREE.Mesh(new THREE.ConeGeometry(r*0.8,r*9,16,1,true), new THREE.MeshBasicMaterial({color:M.glow.color.clone().multiplyScalar(0.35),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    plume.rotation.x=Math.PI/2; plume.position.z=len*0.5+r*4.5; g.add(plume);
    G.add(g); G.userData.engines.push({disc,plume,base:M.glow.color.clone()}); return g;
  }
  function navLight(G, x,y,z, hex){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.35,10,8), new THREE.MeshBasicMaterial({color:HDR(hex,5)})); m.position.set(x,y,z); G.add(m); G.userData.blinkers.push(m); }
  function antenna(G, M, x, y, z, h, dish){ G.add(cylY(0.06,0.1,h,M.dark,x,y+h/2,z,8)); if(dish){ const d=new THREE.Mesh(new THREE.SphereGeometry(dish,18,8,0,Math.PI*2,0,Math.PI*0.32),M.metal); d.rotation.x=Math.PI*0.75; d.position.set(x,y+h,z); G.add(d); } else G.add(ball(0.14,M.metal,x,y+h,z)); }
  function vents(G, M, n, x, y, z, w, step, axis='z'){ for(let i=0;i<n;i++){ const o=axis==='z'?box(w,0.12,0.22,M.dark,x,y,z+i*step):box(0.12,0.22,w,M.dark,x+i*step,y,z); G.add(o); } }
  function gear(G, M, pts, h){ const gg=new THREE.Group(); for(const [x,z] of pts){ const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,h,10),M.dark); leg.position.set(x,-h/2,z); gg.add(leg); const foot=new THREE.Mesh(new THREE.CylinderGeometry(1,1.2,0.3,16),M.dark); foot.position.set(x,-h,z); gg.add(foot); } G.add(gg); G.userData.gear=gg; G.userData.gearH=h;
    for(const [x,z] of pts){ G.add(cylY(0.42,0.42,0.6,M.metal,x,-0.2,z,12)); } }

  const builders = [
    // 0 Rustbucket: a battered tug with slung cargo drums, a smokestack and a dish
    (G,M)=>{ G.add(rbox(6,5,13,1.0,M.hull)); G.add(rbox(5,3.4,5.6,0.9,M.hull,0,0.5,-8.4)); G.add(rbox(6.6,0.7,13.8,0.3,M.trim,0,-2.6,0)); G.add(rbox(5.2,0.8,0.9,0.35,M.dark,0,-1.0,-11.3));
      const ws=rbox(4.4,1.5,0.35,0.25,M.glass,0,1.6,-11.05); ws.rotation.x=-0.42; G.add(ws); for(const i of [-1.1,0,1.1]){ const b=box(0.12,1.65,0.42,M.dark,i,1.6,-11.05); b.rotation.x=-0.42; G.add(b); }
      for(const sx of [-1,1]){ G.add(box(0.12,0.7,1.5,M.win,sx*2.55,1.1,-8.6)); G.add(cylZ(0.18,0.18,11,M.metal,sx*3.15,1.7,0.6,8));
        G.add(cylZ(1.9,1.9,9,M.trim,sx*5.1,-0.6,1,28)); for(const z of [-3.6,5.6]) G.add(cylZ(1.97,1.97,0.35,M.metal,sx*5.1,-0.6,z,28)); for(const z of [-1.4,1,3.4]){ const t=new THREE.Mesh(new THREE.TorusGeometry(1.96,0.12,8,32),M.dark); t.position.set(sx*5.1,-0.6,z); G.add(t); }
        G.add(box(1.4,0.6,2,M.dark,sx*3.6,-0.4,-1)); G.add(box(1.4,0.6,2,M.dark,sx*3.6,-0.4,3)); vents(G,M,5,sx*3.03,-1.4,-3,0.1,0.5); }
      G.add(cylY(0.45,0.58,2.8,M.dark,-1.6,3.6,3.6,14)); G.add(cylY(0.62,0.62,0.22,M.metal,-1.6,5.05,3.6,14)); G.add(rbox(2.2,0.18,2.6,0.08,M.trim,0.6,2.55,1));
      G.add(box(3,0.25,0.5,M.dark,0,2.35,-8.0)); for(const x of [-1,0,1]) G.add(ball(0.16,M.win,x,2.5,-8.0)); antenna(G,M,1.8,2.5,4.2,2.4,0.8);
      engine(G,M,2.1,0,0.2,8.5,5); engine(G,M,0.9,-2.2,-1.6,8,3.4); engine(G,M,0.9,2.2,-1.6,8,3.4);
      navLight(G,-6.9,-0.6,1,'#ff3020'); navLight(G,6.9,-0.6,1,'#30ff50'); navLight(G,1.8,7.6,4.2,'#ffffff'); gear(G,M,[[-3,-4],[3,-4],[-3,5],[3,5]],3.6); G.userData.h=3; },
    // 1 Dromedary: humped box hauler with container doors, twin nacelles on pylons
    (G,M)=>{ G.add(rbox(8,6,18,1.1,M.hull)); G.add(rbox(7,3.2,10,1.4,M.hull,0,4,2)); G.add(rbox(6.4,3.6,5.2,1.2,M.trim,0,0.6,-11)); G.add(rbox(8.4,1.0,18.4,0.4,M.trim,0,-1.3,0));
      const ws=rbox(5,1.6,0.35,0.25,M.glass,0,1.95,-13.45); ws.rotation.x=-0.5; G.add(ws); for(const sx of [-1,1]) G.add(rbox(0.3,1.3,2.2,0.12,M.glass,sx*3.15,1.9,-11.6));
      for(let i=0;i<4;i++) G.add(rbox(8.5,5.5,0.6,0.25,M.dark,0,0.25,-6+i*4.2));
      for(const sx of [-1,1]) for(let i=0;i<3;i++){ G.add(box(0.12,3.6,3.2,M.trim,sx*4.03,0.7,-3.9+i*4.2)); G.add(box(0.14,0.12,2.6,M.metal,sx*4.08,1.4,-3.9+i*4.2)); G.add(box(0.14,0.12,2.6,M.metal,sx*4.08,0,-3.9+i*4.2)); }
      vents(G,M,7,0,5.66,-1.5,4.6,0.9); antenna(G,M,-2.2,5.6,5.5,2,0); antenna(G,M,2.2,5.6,5.5,1.4,0.6);
      for(const sx of [-1,1]){ G.add(box(1.0,0.5,0.4,M.dark,sx*2.2,-0.6,-13.4)); G.add(ball(0.28,M.win,sx*2.2,-0.6,-13.65));
        G.add(rbox(3.6,0.8,4,0.3,M.trim,sx*5.4,1,5)); G.add(lathe([[0.2,-1.5],[1.6,0],[2.15,2.5],[2.1,6],[1.8,7.5]],M.hull).translateX(sx*7.6).translateY(1));
        G.add(cylZ(2.18,2.18,0.3,M.metal,sx*7.6,1,2.4,28)); engine(G,M,2,sx*7.6,1,9.8,3.4); navLight(G,sx*9.8,1,3,sx<0?'#ff3020':'#30ff50'); }
      engine(G,M,1.3,0,-1,10,3); navLight(G,0,5.8,-2.5,'#ffffff'); gear(G,M,[[-3.4,-7],[3.4,-7],[-3.4,7],[3.4,7]],4.2); G.userData.h=3.6; },
    // 2 Stoat: sleek lathed fuselage, framed bubble canopy, swept wings with tip pods, canted tails
    (G,M)=>{ G.add(lathe([[0.05,-17.5],[1.2,-14.5],[2.6,-9],[3.3,-2],[3.4,5],[3.0,9.5],[2.3,12.5],[2.0,13.2]],M.hull,1.25,0.8));
      canopy(G,M,1.9,1.15,4.6,0,1.75,-7.6,3); G.add(box(0.5,0.22,19,M.trim,0,2.72,1.5));
      for(const sx of [-1,1]){ const w=wing([[0,-4],[sx*13,6],[sx*13.6,8.6],[sx*12.6,10],[0,9]],0.5,M.hull); w.position.y=-0.4; G.add(w);
        const st=wing([[sx*3,0.5],[sx*12.4,7.2],[sx*12.6,8.2],[sx*3,2.2]],0.12,M.trim); st.position.y=0.28; G.add(st);
        const pod=lathe([[0.05,-2.6],[0.45,-1.4],[0.5,2],[0.35,3.2]],M.trim); pod.position.set(sx*13.1,-0.15,7.8); G.add(pod); navLight(G,sx*13.1,-0.15,4.9,sx<0?'#ff3020':'#30ff50');
        const t=wing([[0,0],[sx*1.3,5],[sx*1.4,7],[0,6]],0.3,M.trim); t.rotation.z=sx*-1.05; t.position.set(sx*2.3,1.6,5); G.add(t);
        G.add(rbox(1.3,1.1,3.2,0.35,M.dark,sx*3.75,-0.1,-2.6)); G.add(box(0.9,0.7,0.1,M.bell,sx*3.75,-0.1,-4.25));
        engine(G,M,1.5,sx*4.2,-0.2,10.5,6); }
      vents(G,M,4,0,-2.3,-4,2,1.2); gear(G,M,[[0,-10],[-4,7],[4,7]],3.2); G.userData.h=2.8; },
    // 3 Manatee: long liner with gold bands, two rows of lit windows, an observation dome and chrome nose
    (G,M)=>{ G.add(lathe([[0.05,-24],[1.9,-21.5],[4.2,-14],[5,-4],[5,10],[4.2,17],[3,20.2]],M.hull,1.15,0.9));
      const nose=lathe([[0.05,-24.6],[1.2,-23.2],[1.95,-21.4]],M.metal,1.15,0.9); G.add(nose);
      for(const z of [-14,-4,10]){ const b=new THREE.Mesh(new THREE.TorusGeometry(5.05,0.28,10,48),M.trim); b.scale.set(1.15,0.9,1); b.position.z=z; G.add(b); }
      for(const sx of [-1,1]) for(const [y,n] of [[1.4,10],[-0.4,8]]) for(let i=0;i<n;i++) G.add(rbox(0.22,0.55,1.0,0.1,M.win,sx*5.63,y,-11+i*2.4+(y<0?1.2:0)));
      canopy(G,M,2.4,1.25,4.6,0,2.9,-13.2,3); const dome=new THREE.Mesh(new THREE.SphereGeometry(2.6,28,14,0,Math.PI*2,0,Math.PI/2),M.glass); dome.position.set(0,4.2,3); dome.scale.y=0.6; G.add(dome); G.add(cylY(2.75,2.75,0.25,M.trim,0,4.2,3,32));
      const fin=wing([[0,0],[5,9],[5.2,13],[0,12]],0.5,M.trim); fin.rotation.z=Math.PI/2; fin.position.set(0,3.5,6); G.add(fin);
      for(let i=0;i<4;i++){ const a=i*Math.PI/2+Math.PI/4; engine(G,M,1.7,Math.cos(a)*5.6,Math.sin(a)*4.6,18,8); }
      for(const sx of [-1,1]){ const w=wing([[0,0],[sx*9,8],[sx*9.2,11],[0,10]],0.5,M.hull); w.position.set(sx*4.5,-1,2); G.add(w); const pod=lathe([[0.05,-2],[0.7,-0.6],[0.8,3],[0.5,4.4]],M.trim); pod.position.set(sx*13.6,-0.85,9.6); G.add(pod); navLight(G,sx*13.6,-0.85,7.2,sx<0?'#ff3020':'#30ff50'); }
      antenna(G,M,0,4.2,-6,2.2,0); gear(G,M,[[0,-14],[-5,10],[5,10]],5.5); G.userData.h=4.6; },
    // 4 Empress: pearl needle hull, glowing ring on spokes, blade wings with glowing edges, a crown of spines
    (G,M)=>{ G.add(lathe([[0.02,-35],[0.8,-29],[2.4,-18],[4.2,-6],[4.6,6],[3.6,16],[2.4,20.4]],M.hull,1.2,0.75));
      const ring=new THREE.Mesh(new THREE.TorusGeometry(11,0.9,16,72),M.hull); ring.position.z=6; G.add(ring);
      const seam=new THREE.Mesh(new THREE.TorusGeometry(11,0.22,8,96),M.glow); seam.position.z=6; seam.scale.set(1.085,1.085,1); G.add(seam);
      const seam2=new THREE.Mesh(new THREE.TorusGeometry(11,0.18,8,96),M.glow); seam2.position.z=6; seam2.scale.set(0.915,0.915,1); G.add(seam2);
      for(let i=0;i<4;i++){ const a=i*Math.PI/2; const sp=rbox(0.7,7.4,2.6,0.3,M.trim,Math.cos(a+Math.PI/2)*7.4,Math.sin(a+Math.PI/2)*7.4,6); sp.rotation.z=a; G.add(sp); }
      canopy(G,M,2.1,1.2,7.2,0,1.85,-14,4);
      for(const sx of [-1,1]){ const w=wing([[0,-6],[sx*5,14],[sx*4,17],[0,10]],0.35,M.hull); w.position.set(sx*4,-0.4,-2); G.add(w); G.add(box(0.22,0.22,30,M.glow,sx*2.9,2.05,-2)); navLight(G,sx*9,-0.4,15,sx<0?'#ff3020':'#30ff50');
        const edge=box(0.14,0.14,21.5,M.glow,sx*6.5,-0.2,4); edge.rotation.y=-sx*0.245; G.add(edge); }
      for(let i=0;i<5;i++){ const s=new THREE.Mesh(new THREE.ConeGeometry(0.22,2.2-Math.abs(i-2)*0.4,10),M.metal); s.position.set(0,3.6+(2-Math.abs(i-2))*0.15,-4+i*2); s.rotation.x=-0.3; G.add(s); }
      for(let i=0;i<6;i++){ const a=i*Math.PI/3; engine(G,M,1.25,Math.cos(a)*3.2,Math.sin(a)*2.3,21,7); }
      gear(G,M,[[0,-16],[-5,12],[5,12]],5.2); G.userData.h=4; },
    // 5 Saucer (NPC): smooth disc, glass dome, a ring of rim lights
    (G,M)=>{ const d=lathe([[0.05,-1.7],[4,-1.5],[10,-0.6],[12,0.3],[9,1.5],[0.05,2.2]],M.hull,1,1,true); d.geometry.rotateX(-Math.PI/2); G.add(d);
      const dome=new THREE.Mesh(new THREE.SphereGeometry(4.2,28,14,0,Math.PI*2,0,Math.PI/2),M.glass); dome.position.y=1.2; G.add(dome); const db=new THREE.Mesh(new THREE.TorusGeometry(4.25,0.22,8,40),M.trim); db.rotation.x=Math.PI/2; db.position.y=1.25; G.add(db);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(11.6,0.28,8,64),M.trim); rim.rotation.x=Math.PI/2; rim.position.y=0.1; G.add(rim);
      for(let i=0;i<16;i++){ const a=i/16*Math.PI*2; G.add(ball(0.32,i%2?M.glow:M.win,Math.cos(a)*11.95,0.1,Math.sin(a)*11.95)); }
      const under=new THREE.Mesh(new THREE.CircleGeometry(3,28),M.glow); under.rotation.x=Math.PI/2; under.position.y=-1.72; G.add(under);
      engine(G,M,1.6,0,-0.4,10,5); navLight(G,0,5.6,0,'#ffffff'); gear(G,M,[[0,-7],[-6,4],[6,4]],3); G.userData.h=2; },
    // 6 Segmented bug-freighter (NPC): armoured segments, jointed legs, a bulging glass head
    (G,M)=>{ for(let i=0;i<4;i++){ const s=ball(4.2-i*0.3,i%2?M.trim:M.hull,0,0,-12+i*8.2,1,0.85,1.25); G.add(s); if(i<3){ G.add(cylZ(2.2-i*0.2,2.4-i*0.2,4,M.dark,0,0,-12+i*8.2+4.1,24)); const band=new THREE.Mesh(new THREE.TorusGeometry(2.4-i*0.2,0.22,8,32),M.metal); band.position.z=-12+i*8.2+4.1; G.add(band); } }
      canopy(G,M,2.4,1.8,2.4,0,1.4,-15.4,2);
      for(const sx of [-1,1]) for(let i=0;i<3;i++){ const l=rbox(7,0.45,0.6,0.2,M.dark,sx*5.5,-1,-10+i*8); l.rotation.z=sx*0.5; G.add(l); const k=ball(0.5,M.metal,sx*8.4,-2.6,-10+i*8); G.add(k); const f=cylY(0.18,0.1,2.2,M.dark,sx*8.9,-3.6,-10+i*8,8); f.rotation.z=-sx*0.3; G.add(f); }
      for(let i=0;i<3;i++) G.add(cylY(0.08,0.12,1.6,M.dark,0,3.8-i*0.2,-12+i*8.2,8));
      engine(G,M,2,0,0,17,6); navLight(G,-8,-2.6,-2,'#ff3020'); navLight(G,8,-2.6,-2,'#30ff50'); gear(G,M,[[-3,-8],[3,-8],[-3,8],[3,8]],3.6); G.userData.h=3.6; },
  ];
  function build(idx, scheme){
    const G=new THREE.Group(); G.userData={engines:[],blinkers:[]}; const s=scheme||SCHEMES[Math.min(idx,4)]; const M=mats(s);
    builders[idx](G,M); G.userData.glow=s.glow;
    G.traverse(o=>{ if(o.isMesh && !o.material.isMeshBasicMaterial){ o.castShadow=true; o.receiveShadow=true; } });
    return G;
  }
  /* throttle 0..1 drives exhaust; time drives nav light blink */
  function animate(G, thr, t){
    for(const e of G.userData.engines){ const k=0.25+thr*1.1+Math.sin(t*40+e.plume.id)*0.05; e.disc.material.color.copy(e.base).multiplyScalar(k); e.plume.scale.set(1,0.15+thr*1.1,1); e.plume.position.z=e.plume.geometry.parameters.height*(0.15+thr*1.1)/2+2.5; e.plume.material.color.copy(e.base).multiplyScalar(0.05+thr*0.3); }
    const on=(t%1.4)<0.12; for(const b of G.userData.blinkers) b.visible=on||b.position.y>4.5&&(t%0.7)<0.06;
  }
  return {build, animate, SCHEMES, count:builders.length};
})();
