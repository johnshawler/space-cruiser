/* ===================== SHIP MODELS ===================== */
/* All models: nose toward -Z, roughly 20-40 units long, origin near centre of mass. */
const Models = (() => {
  const SCHEMES = [
    {hull:'#d9733a',trim:'#3d6f8e',glow:'#ffb060',wear:1.0},
    {hull:'#f0c22e',trim:'#2f4a7d',glow:'#ffd27a',wear:0.7},
    {hull:'#eef4f6',trim:'#18b0a0',glow:'#7ff5e6',wear:0.25},
    {hull:'#b3304d',trim:'#f2c55a',glow:'#ffcf8a',wear:0.15},
    {hull:'#f6f7fb',trim:'#7552c9',glow:'#5fd8ff',wear:0.05},
  ];
  function mats(s){
    const hull=Toon.mat({color:C(s.hull),side:THREE.DoubleSide});
    const trim=Toon.mat({color:C(s.trim)});
    const dark=Toon.mat({color:C('#3a3550')});
    const glass=Toon.mat({color:C('#7fe0ff'),emissive:C('#1d6a8a'),emissiveIntensity:0.6});
    const glow=new THREE.MeshBasicMaterial({color:HDR(s.glow,6)});
    const win=new THREE.MeshBasicMaterial({color:HDR('#ffe6b0',2.2)});
    return {hull,trim,dark,glass,glow,win};
  }
  const box=(w,h,d,m,x=0,y=0,z=0)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); return o; };
  const cylZ=(r1,r2,len,m,x=0,y=0,z=0,seg=20)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg),m); o.rotation.x=Math.PI/2; o.position.set(x,y,z); return o; }; // r1 at -Z? (top maps to -Z after rot)
  function lathe(profile, m, sx=1, sy=1){ // profile: [[radius, z]] from nose (-z) to tail (+z)
    const pts=profile.map(p=>new THREE.Vector2(Math.max(p[0],0.001),p[1])); const g=new THREE.LatheGeometry(pts,28); g.rotateX(Math.PI/2); g.scale(sx,sy,1); g.computeVertexNormals();
    const o=new THREE.Mesh(g,m); return o;
  }
  function wing(pts, thick, m){ // pts in XZ plane [[x,z],...]
    const sh=new THREE.Shape(); sh.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) sh.lineTo(pts[i][0],pts[i][1]); sh.closePath();
    const g=new THREE.ExtrudeGeometry(sh,{depth:thick,bevelEnabled:true,bevelSize:thick*0.3,bevelThickness:thick*0.3,bevelSegments:1}); g.rotateX(Math.PI/2); g.translate(0,thick/2,0);
    return new THREE.Mesh(g,m);
  }
  function engine(G, M, r, x, y, z, len=5){
    const g=new THREE.Group(); g.position.set(x,y,z);
    g.add(cylZ(r*0.85,r,len,M.trim)); g.add(cylZ(r*1.02,r*1.08,len*0.18,M.dark,0,0,len*0.42));
    const disc=new THREE.Mesh(new THREE.CircleGeometry(r*0.82,20),M.glow); disc.position.z=len*0.49; g.add(disc);
    const plume=new THREE.Mesh(new THREE.ConeGeometry(r*0.8,r*9,16,1,true), new THREE.MeshBasicMaterial({color:M.glow.color.clone().multiplyScalar(0.35),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    plume.rotation.x=Math.PI/2; plume.position.z=len*0.5+r*4.5; g.add(plume);
    G.add(g); G.userData.engines.push({disc,plume,base:M.glow.color.clone()});
  }
  function navLight(G, x,y,z, hex){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.35,8,6), new THREE.MeshBasicMaterial({color:HDR(hex,5)})); m.position.set(x,y,z); G.add(m); G.userData.blinkers.push(m); }
  function gear(G, M, pts, h){ const gg=new THREE.Group(); for(const [x,z] of pts){ const leg=cylZ(0.28,0.28,h,M.dark,x,-h/2,z,8); leg.rotation.x=0; gg.add(leg); const foot=new THREE.Mesh(new THREE.CylinderGeometry(1,1.2,0.3,12),M.dark); foot.position.set(x,-h,z); gg.add(foot); } G.add(gg); G.userData.gear=gg; G.userData.gearH=h; }

  const builders = [
    // 0 Rustbucket: a tug with slung cargo drums
    (G,M)=>{ G.add(box(6,5,13,M.hull,0,0,0)); G.add(box(5,3.2,5,M.hull,0,0.4,-8.5)); G.add(box(4.4,1.6,2.6,M.glass,0,1.5,-10.2)); G.add(box(6.6,0.6,13.6,M.trim,0,-2.6,0));
      for(const sx of [-1,1]){ const d=cylZ(1.9,1.9,9,M.trim,sx*5.1,-0.6,1,14); G.add(d); G.add(box(1.4,0.6,2,M.dark,sx*3.6,-0.4,-1)); G.add(box(1.4,0.6,2,M.dark,sx*3.6,-0.4,3)); }
      G.add(box(1.2,2.2,3,M.trim,1.6,3.4,2)); const mast=cylZ(0.12,0.12,5,M.dark,-1.8,5,3,6); mast.rotation.x=0; G.add(mast);
      engine(G,M,2.1,0,0.2,8.5,5); engine(G,M,0.9,-2.2,-1.6,8,3.4); engine(G,M,0.9,2.2,-1.6,8,3.4);
      navLight(G,-6.9,-0.6,1,'#ff3020'); navLight(G,6.9,-0.6,1,'#30ff50'); navLight(G,-1.8,7.6,3,'#ffffff'); gear(G,M,[[-3,-4],[3,-4],[-3,5],[3,5]],3.6); G.userData.h=3; },
    // 1 Dromedary: humped box hauler, twin nacelles
    (G,M)=>{ G.add(box(8,6,18,M.hull,0,0,0)); G.add(box(7,3,10,M.hull,0,4,2)); G.add(box(6,3.4,5,M.trim,0,0.6,-11)); G.add(box(5.2,1.5,2.4,M.glass,0,1.8,-12.6));
      G.add(box(8.3,0.9,18.3,M.trim,0,-1.2,0)); for(let i=0;i<4;i++) G.add(box(8.4,5.2,0.5,M.dark,0,0.2,-6+i*4.2));
      for(const sx of [-1,1]){ G.add(box(3.4,0.8,4,M.trim,sx*5.4,1,5)); engine(G,M,2,sx*7.6,1,6.5,9); navLight(G,sx*9.8,1,3,sx<0?'#ff3020':'#30ff50'); }
      engine(G,M,1.3,0,-1,10,3); navLight(G,0,5.8,2,'#ffffff'); gear(G,M,[[-3.4,-7],[3.4,-7],[-3.4,7],[3.4,7]],4.2); G.userData.h=3.6; },
    // 2 Stoat: sleek lathe fuselage, swept wings
    (G,M)=>{ G.add(lathe([[0,-17],[1.2,-14],[2.6,-9],[3.3,-2],[3.4,6],[2.8,11],[2.2,13]],M.hull,1.25,0.8));
      const cp=new THREE.Mesh(new THREE.SphereGeometry(2.1,20,12),M.glass); cp.scale.set(0.9,0.55,2.2); cp.position.set(0,1.7,-7.5); G.add(cp);
      for(const sx of [-1,1]){ const w=wing([[0,-4],[sx*13,7],[sx*13,10],[0,9]],0.5,M.hull); w.position.y=-0.4; G.add(w); const t=wing([[0,0],[sx*1.2,5],[sx*1.2,7],[0,6]],0.3,M.trim); t.rotation.z=sx*-1.1; t.position.set(sx*2.4,1.6,5); G.add(t);
        engine(G,M,1.5,sx*4.2,-0.2,10.5,6); G.add(box(0.5,0.5,9,M.trim,sx*13,-0.4,7.5)); navLight(G,sx*13,-0.4,12.2,sx<0?'#ff3020':'#30ff50'); }
      G.add(box(0.4,0.3,20,M.trim,0,2.75,0)); gear(G,M,[[0,-10],[-4,7],[4,7]],3.2); G.userData.h=2.8; },
    // 3 Manatee: long liner hull, ring of engines, gold trim, window rows
    (G,M)=>{ G.add(lathe([[0,-24],[2,-21],[4.2,-14],[5,-4],[5,10],[4.2,17],[3,20]],M.hull,1.15,0.9));
      for(const z of [-14,-4,10]){ const b=cylZ(5.9,5.9,0.7,M.trim,0,0,z,32); b.scale.set(1,0.79,1); G.add(b); }
      for(const sx of [-1,1]) for(let i=0;i<9;i++) G.add(box(0.2,0.5,1,M.win,sx*5.72,1.2,-11+i*2.4));
      const cp=new THREE.Mesh(new THREE.SphereGeometry(2.8,20,12),M.glass); cp.scale.set(1,0.5,2); cp.position.set(0,2.6,-13); G.add(cp);
      const fin=wing([[0,0],[5,9],[5,13],[0,12]],0.5,M.trim); fin.rotation.z=Math.PI/2; fin.position.set(0,3.5,6); G.add(fin);
      for(let i=0;i<4;i++){ const a=i*Math.PI/2+Math.PI/4; engine(G,M,1.7,Math.cos(a)*5.6,Math.sin(a)*4.6,18,8); }
      for(const sx of [-1,1]){ const w=wing([[0,0],[sx*9,8],[sx*9,11],[0,10]],0.5,M.hull); w.position.set(sx*4.5,-1,2); G.add(w); navLight(G,sx*13.6,-1,12,sx<0?'#ff3020':'#30ff50'); }
      gear(G,M,[[0,-14],[-5,10],[5,10]],5.5); G.userData.h=4.6; },
    // 4 Empress: pearl needle hull, glowing ring, blade wings
    (G,M)=>{ G.add(lathe([[0,-34],[0.8,-28],[2.4,-18],[4.2,-6],[4.6,6],[3.6,16],[2.4,20]],M.hull,1.2,0.75));
      const ring=new THREE.Mesh(new THREE.TorusGeometry(11,0.9,12,48),M.hull); ring.position.z=6; G.add(ring);
      const seam=new THREE.Mesh(new THREE.TorusGeometry(11,0.25,8,64),M.glow); seam.position.z=6; seam.scale.set(1.085,1.085,1); G.add(seam);
      for(let i=0;i<4;i++){ const a=i*Math.PI/2; const sp=box(0.6,7.4,2.6,M.trim,Math.cos(a+Math.PI/2)*7.4,Math.sin(a+Math.PI/2)*7.4,6); sp.rotation.z=a; G.add(sp); }
      const cp=new THREE.Mesh(new THREE.SphereGeometry(2.2,20,12),M.glass); cp.scale.set(1,0.55,3.4); cp.position.set(0,1.8,-14); G.add(cp);
      for(const sx of [-1,1]){ const w=wing([[0,-6],[sx*5,14],[sx*4,17],[0,10]],0.35,M.hull); w.position.set(sx*4,-0.4,-2); G.add(w); G.add(box(0.25,0.25,30,M.glow,sx*2.9,2.05,-2)); navLight(G,sx*9,-0.4,15,sx<0?'#ff3020':'#30ff50'); }
      for(let i=0;i<6;i++){ const a=i*Math.PI/3; engine(G,M,1.25,Math.cos(a)*3.2,Math.sin(a)*2.3,21,7); }
      gear(G,M,[[0,-16],[-5,12],[5,12]],5.2); G.userData.h=4; },
    // 5 Saucer (NPC)
    (G,M)=>{ const d=lathe([[0,-1.6],[4,-1.4],[11,-0.3],[12,0.4],[8,1.6],[0,2.2]],M.hull,1,1); d.geometry.rotateX(-Math.PI/2); G.add(d);
      const dome=new THREE.Mesh(new THREE.SphereGeometry(4.2,20,12,0,Math.PI*2,0,Math.PI/2),M.glass); dome.position.y=1.2; G.add(dome);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(11.6,0.3,8,48),M.glow); rim.rotation.x=Math.PI/2; rim.position.y=0.1; G.add(rim);
      engine(G,M,1.6,0,-0.4,10,5); navLight(G,0,5.6,0,'#ffffff'); gear(G,M,[[0,-7],[-6,4],[6,4]],3); G.userData.h=2; },
    // 6 Segmented bug-freighter (NPC)
    (G,M)=>{ for(let i=0;i<4;i++){ const s=new THREE.Mesh(new THREE.SphereGeometry(4.2-i*0.3,18,12),i%2?M.trim:M.hull); s.scale.set(1,0.85,1.25); s.position.z=-12+i*8.2; G.add(s); }
      const cp=new THREE.Mesh(new THREE.SphereGeometry(2.4,16,10),M.glass); cp.position.set(0,1.4,-15.4); G.add(cp);
      for(const sx of [-1,1]) for(let i=0;i<3;i++){ const l=box(7,0.4,0.5,M.dark,sx*5.5,-1,-10+i*8); l.rotation.z=sx*0.5; G.add(l); }
      engine(G,M,2,0,0,17,6); navLight(G,-8,-2.6,-2,'#ff3020'); navLight(G,8,-2.6,-2,'#30ff50'); gear(G,M,[[-3,-8],[3,-8],[-3,8],[3,8]],3.6); G.userData.h=3.6; },
  ];
  function build(idx, scheme){
    const G=new THREE.Group(); G.userData={engines:[],blinkers:[]}; const s=scheme||SCHEMES[Math.min(idx,4)]; const M=mats(s);
    builders[idx](G,M); G.userData.glow=s.glow;
    G.traverse(o=>{ if(o.isMesh && !o.material.isMeshBasicMaterial){ o.castShadow=true; o.receiveShadow=true; } });
    return Toon.ink.mark(G);
  }
  /* throttle 0..1 drives exhaust; time drives nav light blink */
  function animate(G, thr, t){
    for(const e of G.userData.engines){ const k=0.25+thr*1.1+Math.sin(t*40+e.plume.id)*0.05; e.disc.material.color.copy(e.base).multiplyScalar(k); e.plume.scale.set(1,0.15+thr*1.1,1); e.plume.position.z=e.plume.geometry.parameters.height*(0.15+thr*1.1)/2+2.5; e.plume.material.color.copy(e.base).multiplyScalar(0.05+thr*0.3); }
    const on=(t%1.4)<0.12; for(const b of G.userData.blinkers) b.visible=on||b.position.y>4.5&&(t%0.7)<0.06;
  }
  return {build, animate, SCHEMES, count:builders.length};
})();
