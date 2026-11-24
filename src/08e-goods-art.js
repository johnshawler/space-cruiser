/* ===================== GOODS ON THE SHELF ===================== */
/* A small cartoon model of each trade good, for the depot's display shelf. Each sits on y=0, centred, about 0.7 m tall,
   in the same glossy toy style as the aliens. Anything not listed (contraband, odd one-offs) gets a suspicious crate. */
const GoodsArt = (() => {
  const mats={}; const P=(hex,o)=>{ const k=hex+JSON.stringify(o||{}); return mats[k]||(mats[k]=new THREE.MeshPhysicalMaterial(Object.assign({color:C(hex),roughness:0.38,metalness:0,clearcoat:0.6,clearcoatRoughness:0.25},o||{}))); };
  const G=(hex,k)=>new THREE.MeshBasicMaterial({color:HDR(hex,k==null?2:k)});
  const T=(hex,op,o)=>new THREE.MeshPhysicalMaterial(Object.assign({color:C(hex),roughness:0.08,metalness:0,clearcoat:1,transparent:true,opacity:op,depthWrite:false},o||{}));
  const S=(g,r,m,x=0,y=0,z=0,ws=24,hs=16)=>{ const o=new THREE.Mesh(new THREE.SphereGeometry(r,ws,hs),m); o.position.set(x,y,z); g.add(o); return o; };
  const Cy=(g,r1,r2,h,m,x=0,y=0,z=0,seg=24)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m); o.position.set(x,y,z); g.add(o); return o; };
  const B=(g,w,h,d,m,x=0,y=0,z=0)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); g.add(o); return o; };
  const R=(g,w,h,d,r,m,x=0,y=0,z=0)=>{ const o=Folk.rbox(w,h,d,r,m,x,y,z); g.add(o); return o; };
  const Tor=(g,r,t,m,x=0,y=0,z=0,arc)=>{ const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,10,32,arc||Math.PI*2),m); o.position.set(x,y,z); g.add(o); return o; };
  const Cone=(g,r,h,m,x=0,y=0,z=0)=>{ const o=new THREE.Mesh(new THREE.ConeGeometry(r,h,20),m); o.position.set(x,y,z); g.add(o); return o; };
  const white=()=>P('#fbfbf6'), ink=()=>P('#141418',{roughness:0.2});
  /* the house googly eye, so goods can have a face */
  const eye=(g,r,x,y,z)=>{ S(g,r,white(),x,y,z,16,12); const p=S(g,r*0.5,ink(),x,y-r*0.15,z+r*0.62,12,8); p.scale.z=0.5; return p; };
  const smile=(g,r,x,y,z,frown)=>{ const m=Tor(g,r,r*0.18,P('#3a1420'),x,y,z,Math.PI); m.rotation.z=frown?0:Math.PI; return m; };
  /* a stencilled label on a curved or flat surface */
  const label=(g,text,w,h,x,y,z,bg,fg)=>{ const cv=makeCanvas(256,Math.round(256*h/w)), c=cv.getContext('2d'); c.fillStyle=bg||'#f4efe2'; c.fillRect(0,0,cv.width,cv.height); c.fillStyle=fg||'#2a1a0c'; c.textAlign='center'; c.textBaseline='middle';
    let fs=Math.round(cv.height*0.62); do{ c.font=`800 ${fs}px ${FONT_DISP}`; fs-=2; }while(c.measureText(text).width>236&&fs>10); c.fillText(text,128,cv.height/2+2); const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:canvasTex(cv),roughness:0.7})); o.position.set(x,y,z); g.add(o); return o; };
  const jar=(g,col,h=0.5,r=0.2)=>{ Cy(g,r,r,h,T('#dff2ff',0.28),0,h/2,0); Cy(g,r*1.02,r*1.02,0.08,P(col),0,h+0.04,0); };
  const bottle=(g,glass,h=0.5)=>{ Cy(g,0.14,0.15,h*0.62,glass,0,h*0.31,0); Cy(g,0.14,0.06,h*0.16,glass,0,h*0.7,0); Cy(g,0.05,0.05,h*0.18,glass,0,h*0.86,0); Cy(g,0.055,0.05,0.07,P('#a8743f',{roughness:0.8,clearcoat:0}),0,h*0.98,0); };

  const ART = {
    'Self-Heating Soup Bricks'(g){ for(let i=0;i<3;i++){ const b=R(g,0.42,0.18,0.28,0.05,P(['#e8913a','#d9772a','#f0a54e'][i]),(i%2?0.03:-0.02),0.09+i*0.19,0); b.rotation.y=(i-1)*0.15; }
      label(g,'SOUP',0.3,0.1,0,0.47,0.145); for(let i=0;i<3;i++){ const s=Tor(g,0.06,0.016,T('#ffffff',0.5),-0.1+i*0.1,0.66+i*0.04,0,Math.PI); s.rotation.z=Math.PI/2+i*0.3; } },
    'Pre-Owned Moon Dust'(g){ jar(g,'#6a6f78',0.46,0.19); Cy(g,0.18,0.18,0.2,P('#b9bcc2',{roughness:0.9,clearcoat:0}),0,0.1,0); const m=Tor(g,0.07,0.035,G('#fff2c0',1.4),0,0.3,0.2,Math.PI*1.2); m.rotation.z=0.9; },
    'Artisanal Gravity (Small Batch)'(g){ Cy(g,0.2,0.22,0.36,T('#bfe4ff',0.3),0,0.18,0); S(g,0.13,P('#2a2f3a',{metalness:0.5}),0,0.13,0); Cy(g,0.13,0.2,0.08,P('#7a5236'),0,0.4,0); label(g,'G',0.12,0.12,0,0.22,0.215,'#d8b04a','#2a1a0c'); Tor(g,0.26,0.012,G('#ffd27a',1.2),0,0.18,0).rotation.x=Math.PI/2; },
    'Unlicensed Nostalgia'(g){ Cy(g,0.2,0.24,0.12,P('#5a3a22'),0,0.06,0); S(g,0.22,T('#fff0d8',0.3),0,0.32,0); B(g,0.14,0.1,0.1,P('#c9a36a'),0,0.2,0); Cone(g,0.11,0.08,P('#8a3a2a'),0,0.29,0); for(let i=0;i<8;i++) S(g,0.012,white(),Math.sin(i*2.1)*0.13,0.3+Math.cos(i*1.7)*0.1,Math.cos(i*2.6)*0.1,6,4); },
    'Left-Handed Wormholes'(g){ for(let i=0;i<4;i++){ const t=Tor(g,0.26-i*0.055,0.03,P(['#7a3cff','#9b5cff','#c084ff','#e6c7ff'][i]),0,0.32,0); t.rotation.x=Math.PI/2-0.5; t.position.y=0.32-i*0.03; }
      S(g,0.06,ink(),0,0.22,0); const ar=Cone(g,0.07,0.16,G('#ffd23f',1.6),-0.34,0.42,0); ar.rotation.z=Math.PI/2; },
    'Emotional Support Asteroids'(g){ const a=new THREE.Mesh(new THREE.DodecahedronGeometry(0.28,1),P('#8a8478',{roughness:0.85,clearcoat:0.1,flatShading:true})); a.position.y=0.3; a.scale.set(1,0.9,0.95); g.add(a);
      eye(g,0.06,-0.09,0.36,0.22); eye(g,0.06,0.09,0.36,0.22); smile(g,0.06,0,0.24,0.25); const h=new THREE.Shape(); h.moveTo(0,0); h.bezierCurveTo(0,0.04,-0.06,0.06,-0.06,0.02); h.bezierCurveTo(-0.06,-0.02,0,-0.04,0,-0.07); h.bezierCurveTo(0,-0.04,0.06,-0.02,0.06,0.02); h.bezierCurveTo(0.06,0.06,0,0.04,0,0);
      const hm=new THREE.Mesh(new THREE.ExtrudeGeometry(h,{depth:0.03,bevelEnabled:false}),P('#ff5a7a')); hm.position.set(0.22,0.6,0); g.add(hm); },
    'Dehydrated Water'(g){ bottle(g,T('#dff2ff',0.3),0.6); label(g,'WATER',0.24,0.1,0,0.2,0.152); S(g,0.025,P('#e8d8b0',{roughness:0.9}),0.02,0.03,0.04,8,6); B(g,0.18,0.04,0.08,P('#e8d8b0',{roughness:0.9}),0,0.02,0); },
    'Glow-in-the-Dark Shadows'(g){ const s=S(g,0.26,P('#0c0c12',{roughness:0.6,clearcoat:0.2}),0,0.28,0); s.scale.set(1,1.1,0.6); const rim=S(g,0.28,G('#7dffb0',1.2),0,0.28,-0.02); rim.scale.set(1,1.1,0.55);
      S(g,0.05,G('#c8ffe0',2),-0.08,0.34,0.15,12,8); S(g,0.05,G('#c8ffe0',2),0.08,0.34,0.15,12,8); },
    'Mildly Cursed Furniture'(g){ R(g,0.42,0.62,0.26,0.04,P('#6b4426',{roughness:0.6}),0,0.33,0); B(g,0.01,0.5,0.01,P('#3a2414'),0,0.33,0.13); for(const s of [-1,1]){ S(g,0.02,P('#d8b04a',{metalness:0.8}),s*0.04,0.33,0.14,8,6); B(g,0.05,0.06,0.05,P('#3a2414'),s*0.17,0.03,0); }
      S(g,0.035,G('#ff3a3a',2.6),-0.08,0.52,0.135,10,8); S(g,0.035,G('#ff3a3a',2.6),0.08,0.52,0.135,10,8); },
    'Bulk Googly Eyes'(g){ const bowl=new THREE.Mesh(new THREE.SphereGeometry(0.26,24,12,0,Math.PI*2,Math.PI/2,Math.PI/2),P('#4dabf7')); bowl.position.y=0.26; g.add(bowl);
      for(let i=0;i<9;i++){ const a=i*2.4, r=i?0.13:0; const e=eye(g,0.055,Math.cos(a)*r,0.27+((i*7)%3)*0.03,Math.sin(a)*r); } },
    'Fermented Starlight'(g){ bottle(g,T('#3a2a7a',0.55),0.66); S(g,0.07,G('#fff2a0',3),0,0.2,0,12,8); for(let i=0;i<5;i++){ const st=Cone(g,0.03,0.08,G('#ffe27a',2.4),Math.cos(i*1.26)*0.08,0.2+Math.sin(i*1.26)*0.08,0); st.rotation.z=i*1.26; } label(g,'1874',0.2,0.07,0,0.08,0.152,'#e8dcc0','#3a2a7a'); },
    'Decaf Plasma'(g){ Cy(g,0.17,0.15,0.3,P('#f4efe4'),0,0.15,0); Tor(g,0.08,0.025,P('#f4efe4'),0.19,0.16,0).rotation.y=0; Cy(g,0.155,0.155,0.02,G('#5fd8ff',2.2),0,0.29,0); label(g,'DECAF',0.18,0.07,0,0.15,0.162,'#f4efe4','#2a6ea8');
      for(let i=0;i<3;i++){ const z=Tor(g,0.03,0.008,G('#8fe8ff',2),-0.05+i*0.05,0.36+i*0.04,0,Math.PI); z.rotation.z=i*0.8; } },
    'Second-Hand Sunsets'(g){ const cv=makeCanvas(128,128), c=cv.getContext('2d'), gr=c.createLinearGradient(0,0,0,128); gr.addColorStop(0,'#3a2a7a'); gr.addColorStop(0.5,'#ff6a4a'); gr.addColorStop(0.75,'#ffd23f'); gr.addColorStop(1,'#2a1a3a'); c.fillStyle=gr; c.fillRect(0,0,128,128); c.fillStyle='#ffe07a'; c.beginPath(); c.arc(64,96,26,Math.PI,0); c.fill();
      B(g,0.5,0.4,0.04,P('#b9823f'),0,0.25,0); const pic=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.32),new THREE.MeshBasicMaterial({map:canvasTex(cv)})); pic.position.set(0,0.25,0.022); g.add(pic); B(g,0.12,0.06,0.18,P('#b9823f'),0,0.03,-0.04); label(g,'USED',0.16,0.06,0.13,0.08,0.03,'#ff6a4a','#ffffff').rotation.z=0.3; },
    'Quantum Socks (Unpaired)'(g){ const sock=(m,x,ry)=>{ const s=new THREE.Group(); s.position.set(x,0,0); s.rotation.y=ry; g.add(s); for(let i=0;i<4;i++) Cy(s,0.08,0.08,0.1,i%2?m[1]:m[0],0,0.38-i*0.1,0,16); const f=R(s,0.16,0.1,0.3,0.05,m[0],0,0.05,0.08); return s; };
      sock([P('#ff6a4a'),P('#ffd23f')],-0.08,0.2); sock([T('#ff6a4a',0.25),T('#ffd23f',0.25)],0.14,-0.3); },
    'Sentient Cheese (Mild)'(g){ const sh=new THREE.Shape(); sh.moveTo(-0.3,0); sh.lineTo(0.3,0); sh.lineTo(0.3,0.32); sh.closePath(); const ch=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:0.3,bevelEnabled:true,bevelThickness:0.02,bevelSize:0.02,bevelSegments:2}),P('#ffd23f',{roughness:0.5}));
      ch.position.set(0,0.02,-0.15); g.add(ch); for(const [x,y,r] of [[0.1,0.08,0.04],[0.2,0.18,0.035],[-0.12,0.05,0.03]]) S(g,r,P('#e0a820',{roughness:0.7}),x,y,0.16,10,8).scale.z=0.3; eye(g,0.05,0.08,0.18,0.17); eye(g,0.05,0.2,0.24,0.17); smile(g,0.04,0.16,0.08,0.17,true); },
    'Recreational Bubble Wrap'(g){ const r=Cy(g,0.17,0.17,0.46,T('#e8f6ff',0.55),0,0.17,0); r.rotation.z=Math.PI/2; Cy(g,0.05,0.05,0.48,P('#c9a36a'),0,0.17,0).rotation.z=Math.PI/2;
      for(let i=0;i<5;i++) for(let j=0;j<6;j++){ const a=j/6*Math.PI*2; S(g,0.035,T('#ffffff',0.55),-0.18+i*0.09,0.17+Math.cos(a)*0.17,Math.sin(a)*0.17,8,6); } B(g,0.4,0.005,0.2,T('#e8f6ff',0.45),0.1,0.005,0.2); },
    'Screaming Cactus Seedlings'(g){ Cy(g,0.17,0.13,0.2,P('#c8653a',{roughness:0.7,clearcoat:0.1}),0,0.1,0); Cy(g,0.16,0.16,0.02,P('#5a3a22',{roughness:1,clearcoat:0}),0,0.2,0); const c=S(g,0.13,P('#5cb85c'),0,0.36,0); c.scale.set(1,1.4,1);
      const arm=S(g,0.05,P('#5cb85c'),0.14,0.4,0); arm.scale.set(1,1.8,1); eye(g,0.035,-0.05,0.44,0.11); eye(g,0.035,0.05,0.44,0.11); const m=S(g,0.045,P('#3a1420'),0,0.33,0.12,12,8); m.scale.set(1,1.4,0.5); S(g,0.04,P('#ff8ac8'),0,0.56,0,10,8); },
    'Zero-G Hair Gel'(g){ Cy(g,0.17,0.17,0.18,P('#26a0d0'),0,0.09,0); Cy(g,0.18,0.18,0.05,P('#ffffff'),0,0.2,0); label(g,'HOLD ∞',0.24,0.08,0,0.09,0.172,'#26a0d0','#ffffff');
      for(let i=0;i<4;i++) S(g,0.04+i*0.008,T('#9fe8ff',0.6),-0.08+i*0.06,0.32+i*0.08,Math.sin(i)*0.05,12,8); },
    'Certified Pre-Chewed Gum'(g){ B(g,0.42,0.01,0.3,P('#f4efe4',{roughness:0.8,clearcoat:0}),0,0.005,0); label(g,'CERTIFIED',0.3,0.07,0,0.012,0.06).rotation.x=-Math.PI/2; S(g,0.07,P('#cc2a2a'),0.14,0.02,-0.08,12,8).scale.y=0.2;
      const gm=S(g,0.13,P('#ff8ac8',{roughness:0.3}),-0.02,0.14,-0.02); gm.scale.set(1.2,0.8,1); for(let i=0;i<4;i++) S(g,0.04,P('#ff9ad0'),Math.cos(i*1.7)*0.12,0.12+i*0.03,Math.sin(i*1.7)*0.1,10,8); },
    'Novelty Oversized Atoms'(g){ for(let i=0;i<6;i++) S(g,0.07,P(i%2?'#ef476f':'#26a0d0'),Math.cos(i*1.1)*0.05,0.34+Math.sin(i*1.7)*0.05,Math.sin(i*1.1)*0.05,16,12);
      for(let k=0;k<3;k++){ const o=Tor(g,0.28,0.012,P('#f4efe4'),0,0.34,0); o.rotation.set(Math.PI/2+k*1.0,k*1.05,0); S(g,0.035,G('#7dffb0',2),Math.cos(k*2.1)*0.28,0.34+Math.sin(k*2.1)*0.12,Math.sin(k*2.1)*0.2,10,8); } },
    'Bottled Uncomfortable Silence'(g){ bottle(g,T('#e8f6ff',0.28),0.6); label(g,'. . .',0.22,0.1,0,0.2,0.152,'#2a2f3a','#ffffff'); },
    'Antimatter Sprinkles'(g){ Cy(g,0.13,0.15,0.4,P('#2a2f3a',{metalness:0.4}),0,0.2,0); Cy(g,0.14,0.14,0.08,P('#c9ccd4',{metalness:0.8}),0,0.43,0); label(g,'⚠ ANTI',0.2,0.08,0,0.22,0.152,'#ffd23f','#2a2f3a');
      const cols=['#ff6a4a','#ffd23f','#7dffb0','#5fd8ff','#c084ff']; for(let i=0;i<10;i++){ const s=Cy(g,0.012,0.012,0.05,G(cols[i%5],2.2),Math.cos(i*2.3)*0.12,0.5+((i*3)%5)*0.03,Math.sin(i*2.3)*0.12,6); s.rotation.set(i,i*2,0); } },
    'Tax-Deductible Fog'(g){ jar(g,'#8a9098',0.5,0.2); for(let i=0;i<5;i++) S(g,0.08+((i*3)%3)*0.02,T('#ffffff',0.45),Math.sin(i*2.3)*0.07,0.12+i*0.07,Math.cos(i*2.3)*0.06,12,8); const r=B(g,0.1,0.14,0.005,P('#ffffff',{clearcoat:0}),0.05,0.62,0.02); r.rotation.z=0.4; },
    'Haunted Rubber Ducks'(g){ const duck=new THREE.Group(); g.add(duck); const ym=T('#ffe03a',0.7,{emissive:C('#9fe8ff'),emissiveIntensity:0.25}); const b=S(duck,0.2,ym,0,0.18,0); b.scale.set(1,0.85,1.2); S(duck,0.13,ym,0,0.38,0.12);
      const bk=Cone(duck,0.05,0.12,T('#ff8a20',0.75),0,0.36,0.27); bk.rotation.x=Math.PI/2; eye(duck,0.03,-0.05,0.42,0.22); eye(duck,0.03,0.05,0.42,0.22); const tail=Cone(duck,0.06,0.12,ym,0,0.26,-0.25); tail.rotation.x=-0.9;
      const glow=S(g,0.34,G('#9fe8ff',0.35),0,0.28,0); glow.material.transparent=true; glow.material.opacity=0.18; glow.material.depthWrite=false; },
    'Slightly Used Tomorrows'(g){ R(g,0.4,0.42,0.12,0.03,P('#f4efe4',{clearcoat:0.2}),0,0.22,0); B(g,0.4,0.1,0.13,P('#cc2a2a'),0,0.4,0); for(const s of [-1,1]) Cy(g,0.015,0.015,0.08,P('#c9ccd4',{metalness:0.8}),s*0.1,0.47,0);
      label(g,'TOMORROW',0.34,0.08,0,0.4,0.067,'#cc2a2a','#ffffff'); label(g,'?',0.16,0.18,0,0.22,0.062,'#f4efe4','#2a2f3a'); const c=B(g,0.3,0.02,0.1,P('#f4efe4'),0.05,0.04,0.12); c.rotation.z=-0.3; },
    'Organic Free-Range Static'(g){ for(let i=0;i<10;i++) S(g,0.1,P('#e8e0f8',{roughness:0.9,clearcoat:0,sheen:C('#ffffff')}),Math.cos(i*2.4)*0.13,0.25+Math.sin(i*1.3)*0.1,Math.sin(i*2.4)*0.1,12,8);
      eye(g,0.04,-0.05,0.3,0.2); eye(g,0.04,0.05,0.3,0.2); for(let i=0;i<4;i++){ const z=B(g,0.02,0.14,0.02,G('#ffe03a',2.6),Math.cos(i*1.6)*0.28,0.3+Math.sin(i*1.6)*0.15,0); z.rotation.z=i*0.8; } },
  };
  /* contraband and anything without its own model: a crate that is trying very hard to look innocent */
  function crate(g, shady){ R(g,0.5,0.46,0.42,0.04,P(shady?'#5d6455':'#b9823f',{roughness:0.8,clearcoat:0}),0,0.23,0); label(g,shady?'NOTHING':'GOODS',0.36,0.1,0,0.26,0.215,shady?'#2c3028':'#e8d8b0',shady?'#f4f1e4':'#2a1a0c');
    if(shady){ const s=label(g,'?',0.12,0.12,0.16,0.4,0.215,'#2c3028','#ffd23f'); } }
  return { build(name, shady){ const g=new THREE.Group(); (ART[name]&&!shady?ART[name]:gg=>crate(gg,shady))(g); g.traverse(o=>{ if(o.isMesh&&!o.material.isMeshBasicMaterial) o.castShadow=true; }); return g; }, has:n=>!!ART[n] };
})();
