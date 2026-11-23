/* ===================== COCKPIT ===================== */
const CHANNELS = ['OPEN BAND','TRADE NET','PORT CTRL','RADIO GLORP'];
const RANGES = [5000, 25000, 150000, 3000000];
const Cockpit = {
  PX:2200, group:null, hits:[], ctrls:{}, screens:{}, glowMats:[], screenMats:[], gauges:{}, ray:new THREE.Raycaster(), frame:0, drag:null, hover:null,

  build(def){
    if(this.group){ World.cock.remove(this.group); this.group.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material){ if(o.material.map) o.material.map.dispose(); if(o.material.emissiveMap) o.material.emissiveMap.dispose(); o.material.dispose(); } }); }
    const g=this.group=new THREE.Group(); World.cock.add(g);
    this.hits=[]; this.ctrls={}; this.screens={}; this.glowMats=[]; this.screenMats=[]; this.gauges={}; this.strips=[];
    const ck=def.ck, bump=panelBumpTex(), self=this;
    const std=(hex,rough,metal,extra)=>new THREE.MeshStandardMaterial(Object.assign({color:C(hex),roughness:rough,metalness:metal},extra||{}));
    const M={ frame:std(ck.frame,0.55,0.55,{bumpMap:bump,bumpScale:0.0015}), panel:std(ck.panel,0.7,0.3,{bumpMap:bump,bumpScale:0.001}), trim:std(ck.trim,0.32,0.9),
      rubber:std('#0c0c0d',0.95,0), leather:std(ck.leather,0.62,0.05,{bumpMap:bump,bumpScale:0.0008}), knob:std('#141416',0.42,0.25), alu:std('#b9bdc4',0.28,0.95),
      ptr:new THREE.MeshBasicMaterial({color:new THREE.Color(1.3,1.3,1.3)}), needle:new THREE.MeshBasicMaterial({color:HDR('#ff8a30',2.2)}),
      hit:new THREE.MeshBasicMaterial({visible:false}), wallDS:std(ck.frame,0.6,0.5,{side:THREE.DoubleSide}),
      // screen covers ignore the lights, so the sun never flares on the displays
      screenGlass:new THREE.MeshBasicMaterial({color:0xb8c8d8,transparent:true,opacity:0.035,depthWrite:false}),
      glass:new THREE.MeshStandardMaterial({color:0xffffff,metalness:1,roughness:0.22,transparent:true,opacity:0.06,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:1.6}),
      canopy:new THREE.MeshStandardMaterial({color:0xffffff,metalness:1,roughness:0.4,transparent:true,opacity:0.045,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:1.8}) };
    this.M=M;
    const add=(m,cast=true,parent=g)=>{ m.castShadow=cast; m.receiveShadow=true; parent.add(m); return m; };
    const bx=(w,h,d,mat,x,y,z,parent)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); return add(m,true,parent||g); };
    const cylZ=(rt,rb,h,seg=28)=>{ const q=new THREE.CylinderGeometry(rt,rb,h,seg); q.rotateX(Math.PI/2); return q; };

    /* ---- shell ---- */
    bx(2.1,0.04,2.2,M.panel,0,-0.97,-0.38); bx(0.05,0.74,2.1,M.frame,-1.0,-0.62,-0.38); bx(0.05,0.74,2.1,M.frame,1.0,-0.62,-0.38);
    bx(2.1,0.78,0.05,M.frame,0,-0.62,-1.43); bx(0.63,1.8,0.05,M.frame,-0.735,-0.1,0.68); bx(0.63,1.8,0.05,M.frame,0.735,-0.1,0.68); bx(0.84,0.18,0.05,M.frame,0,0.71,0.68); bx(2.0,0.03,0.62,M.rubber,0,-0.238,-1.12);
    this.door=bx(0.84,1.59,0.035,M.panel,0,-0.175,0.665); this.doorT=0; for(const yy of [-0.6,0.2]) bx(0.5,0.04,0.012,M.trim,0,yy,0.645,this.door).position.set(0,yy+0.175,-0.02);
    bx(1.9,0.5,0.05,M.panel,0,-0.74,-0.98);
    const A1=s=>new V3(s*0.96,-0.23,-1.41), A2=s=>new V3(s*0.6,0.64,-0.45), B1=s=>new V3(s*1.0,-0.26,0.3), B2=s=>new V3(s*0.62,0.64,0.3);
    const th=ck.cage?0.085:0.06;
    for(const s of [-1,1]){
      add(beamBetween(A1(s),A2(s),th,M.frame)); add(beamBetween(B1(s),B2(s),th,M.frame)); add(beamBetween(A1(s),B1(s),0.06,M.frame)); add(beamBetween(A2(s),B2(s),0.07,M.frame));
      add(new THREE.Mesh(quadGeo(B1(s),new V3(s*1.0,-0.26,0.68),new V3(s*0.62,0.64,0.68),B2(s)),M.wallDS));
      const sg=add(new THREE.Mesh(quadGeo(A1(s),B1(s),B2(s),A2(s)),M.canopy),false); sg.userData.glass=true; sg.renderOrder=3;
      if(!ck.cage){ for(const [p,q] of [[A1(s),B1(s)],[A2(s),B2(s)]]){ const st=beamBetween(p.clone().add(new V3(-s*0.04,0.012,0)),q.clone().add(new V3(-s*0.04,0.012,0)),0.012,new THREE.MeshBasicMaterial({color:0xffffff})); g.add(st); this.strips.push(st.material); } }
    }
    add(beamBetween(A2(-1),A2(1),0.08,M.frame)); bx(1.32,0.05,1.2,M.frame,0,0.665,0.1);
    if(ck.cage){ for(const s of [-1,1]){ const p=A1(s).lerp(A2(s),0.74), q=A2(-s).lerp(A2(s),0.5+s*0.2); add(beamBetween(p,q,0.04,M.frame)); } }
    // windshield layers: tint, dirt, reflection
    const wq=quadGeo(A1(-1),A1(1),A2(1),A2(-1));
    this.visorMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
    const dcv=makeCanvas(1024,512), dx=dcv.getContext('2d'), dr=mulberry32(5);
    for(let i=0;i<900;i++){ dx.fillStyle=`rgba(255,240,220,${dr()*0.5})`; dx.beginPath(); dx.arc(dr()*1024,dr()*512,dr()*2.2+0.3,0,7); dx.fill(); }
    for(let i=0;i<40;i++){ const px=dr()*1024, py=dr()*512; const gr=dx.createRadialGradient(px,py,0,px,py,40+dr()*90); gr.addColorStop(0,`rgba(255,235,210,${0.1+dr()*0.14})`); gr.addColorStop(1,'rgba(255,235,210,0)'); dx.fillStyle=gr; dx.fillRect(px-140,py-140,280,280); }
    this.dirtMat=new THREE.MeshBasicMaterial({map:canvasTex(dcv),transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
    const v1=new THREE.Mesh(wq,this.visorMat), v2=new THREE.Mesh(wq,this.dirtMat), v3=new THREE.Mesh(wq,M.canopy); v1.renderOrder=1; v2.renderOrder=2; v3.renderOrder=3; v3.userData.glass=true; g.add(v1,v2,v3);
    // seat + consoles
    bx(0.52,0.1,0.5,M.leather,0,-0.76,0.06); bx(0.5,0.95,0.1,M.leather,0,-0.3,0.36); bx(0.3,0.2,0.08,M.leather,0,0.26,0.33);
    for(const s of [-1,1]){ bx(0.34,0.52,1.25,M.frame,s*0.81,-0.69,-0.3); bx(0.35,0.012,1.26,M.panel,s*0.81,-0.424,-0.3); bx(0.02,0.012,1.26,M.trim,s*0.635,-0.42,-0.3); }
    bx(0.26,0.5,0.44,M.frame,0,-0.88,-0.56);
    // side-stick
    const stickBase=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.045,0.03,24),M.rubber); stickBase.position.set(0.74,-0.405,-0.5); add(stickBase);
    this.stick=new THREE.Group(); this.stick.position.set(0.74,-0.39,-0.5); g.add(this.stick);
    const st=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.016,0.15,16),M.knob); st.position.y=0.075; add(st,true,this.stick);
    const gr=new THREE.Mesh(new THREE.SphereGeometry(0.026,16,12),M.leather); gr.scale.set(1,1.5,1.1); gr.position.y=0.16; add(gr,true,this.stick);
    const tb=new THREE.Mesh(new THREE.SphereGeometry(0.008,10,8),std('#c02020',0.4,0.2)); tb.position.set(0,0.2,-0.008); this.stick.add(tb);
    // mug
    const mug=new THREE.Mesh(new THREE.CylinderGeometry(0.036,0.032,0.085,24,1,true),std('#d8d2c4',0.4,0,{side:THREE.DoubleSide})); mug.position.set(-0.74,-0.375,-0.66); add(mug);
    const coffee=new THREE.Mesh(new THREE.CircleGeometry(0.034,24),std('#1c0f08',0.15,0)); coffee.rotation.x=-Math.PI/2; coffee.position.set(-0.74,-0.345,-0.66); g.add(coffee);
    const hd=new THREE.Mesh(new THREE.TorusGeometry(0.024,0.006,8,16,Math.PI),mug.material); hd.rotation.z=-Math.PI/2; hd.position.set(-0.704,-0.375,-0.66); g.add(hd);

    /* ---- panel + control factories ---- */
    const panel=(w,h)=>{
      const px=this.PX, cw=Math.round(w*px), ch=Math.round(h*px), cv=makeCanvas(cw,ch), gv=makeCanvas(cw,ch), ctx=cv.getContext('2d'), gctx=gv.getContext('2d');
      ctx.fillStyle=ck.panel; ctx.fillRect(0,0,cw,ch); const r=mulberry32(cw*31+ch);
      for(let i=0;i<cw*ch/300;i++){ ctx.fillStyle=`rgba(255,255,255,${r()*0.04})`; ctx.fillRect(r()*cw,r()*ch,2,2); }
      ctx.strokeStyle='rgba(255,255,255,.1)'; ctx.lineWidth=3; ctx.strokeRect(8,8,cw-16,ch-16); ctx.strokeStyle='rgba(0,0,0,.55)'; ctx.strokeRect(11,11,cw-22,ch-22);
      for(const [sx,sy] of [[28,28],[cw-28,28],[28,ch-28],[cw-28,ch-28]]){ ctx.fillStyle='#8a8e94'; ctx.beginPath(); ctx.arc(sx,sy,9,0,7); ctx.fill(); ctx.strokeStyle='#222'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(sx-6,sy-3); ctx.lineTo(sx+6,sy+3); ctx.stroke(); }
      gctx.fillStyle='#000'; gctx.fillRect(0,0,cw,ch);
      const tex=canvasTex(cv), gtex=canvasTex(gv);
      const mat=new THREE.MeshStandardMaterial({map:tex,emissiveMap:gtex,emissive:C(ck.glow),emissiveIntensity:1,roughness:0.6,metalness:0.35});
      const pg=new THREE.Group(); const face=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); face.receiveShadow=true; pg.add(face);
      bx(w+0.014,h+0.014,0.05,M.frame,0,0,-0.0262,pg); this.glowMats.push(mat); g.add(pg);
      const P={g:pg,w,h,px,ctx,gctx,tex,gtex, xy:(x,y)=>[(x+w/2)*px,(h/2-y)*px],
        text(x,y,str,size,align,dim){ const [cx,cy]=P.xy(x,y); for(const c of [ctx,gctx]){ c.font=`600 ${Math.round(size*px)}px ${FONT_DISP}`; c.textAlign=align||'center'; c.textBaseline='middle'; c.fillStyle=c===ctx?(dim?'#737b82':'#c9cdd2'):(dim?'#555':'#fff'); c.fillText(str,cx,cy); } },
        hood(){ bx(w+0.03,0.014,0.11,M.rubber,0,h/2+0.007,0.045,pg); },
        done(){ tex.needsUpdate=true; gtex.needsUpdate=true; } };
      return P;
    };
    const reg=(ctrl,meshes)=>{ this.ctrls[ctrl.id]=ctrl; for(const m of meshes){ m.userData.ctrl=ctrl; this.hits.push(m); } return ctrl; };
    const knob=(P,x,y,r,o)=>{
      const [cx,cy]=P.xy(x,y), R=r*P.px, n=o.wrap?o.max+1:(o.step?Math.round((o.max-o.min)/o.step)+1:11);
      for(const c of [P.ctx,P.gctx]){ c.strokeStyle=c.fillStyle=c===P.ctx?'#aeb4ba':'#fff'; c.lineWidth=Math.max(2,R*0.07);
        for(let i=0;i<n;i++){ const a=(o.wrap?i/n*360:-135+270*i/(n-1))*Math.PI/180, sn=Math.sin(a), co=-Math.cos(a); c.beginPath(); c.moveTo(cx+sn*R*1.4,cy+co*R*1.4); c.lineTo(cx+sn*R*1.65,cy+co*R*1.65); c.stroke();
          if(o.ticks&&o.ticks[i]){ c.font=`${Math.round(R*0.52)}px ${FONT_MONO}`; c.textAlign='center'; c.textBaseline='middle'; c.fillText(o.ticks[i],cx+sn*R*2.2,cy+co*R*2.2); } } }
      P.ctx.fillStyle='rgba(0,0,0,.5)'; P.ctx.beginPath(); P.ctx.arc(cx,cy,R*1.28,0,7); P.ctx.fill();
      P.text(x,y-r*(o.ticks?3.2:2.5),o.label,Math.max(0.0085,r*0.55));
      const grp=new THREE.Group(); grp.position.set(x,y,0); P.g.add(grp); const rot=new THREE.Group(); grp.add(rot);
      const sk=new THREE.Mesh(cylZ(r*1.16,r*1.22,0.004),M.alu); sk.position.z=0.002; add(sk,false,grp);
      const body=new THREE.Mesh(cylZ(r*0.8,r,0.026),M.knob); body.position.z=0.017; add(body,true,rot);
      const cap=new THREE.Mesh(cylZ(r*0.6,r*0.6,0.002),M.alu); cap.position.z=0.031; rot.add(cap);
      const ptr=new THREE.Mesh(new THREE.BoxGeometry(r*0.14,r*0.72,0.003),M.ptr); ptr.position.set(0,r*0.46,0.0325); rot.add(ptr);
      const hit=new THREE.Mesh(cylZ(r*1.35,r*1.35,0.04,10),M.hit); hit.position.z=0.02; grp.add(hit);
      return reg(Object.assign({type:'knob',rot,cur:0,angle(v){ return o.wrap? v/(o.max+1)*Math.PI*2 : (-135+270*(v-o.min)/(o.max-o.min))*Math.PI/180; }},o),[hit,body]);
    };
    const toggle=(P,x,y,o)=>{
      P.text(x,y+0.034,o.label,0.0085); P.text(x,y-0.03,o.off||'OFF',0.006,'center',true);
      const grp=new THREE.Group(); grp.position.set(x,y,0); P.g.add(grp);
      bx(0.022,0.03,0.004,M.alu,0,0,0.002,grp); const nut=new THREE.Mesh(cylZ(0.0065,0.0065,0.006,6),M.alu); nut.position.z=0.006; grp.add(nut);
      const piv=new THREE.Group(); piv.position.z=0.006; grp.add(piv); const lq=cylZ(0.0028,0.0042,0.03,10); lq.translate(0,0,0.015); const lv=new THREE.Mesh(lq,M.alu); add(lv,true,piv);
      const led=new THREE.Mesh(new THREE.SphereGeometry(0.0032,8,6),new THREE.MeshBasicMaterial({color:0x111111})); led.position.set(0.016,0.012,0.003); grp.add(led);
      const hit=new THREE.Mesh(new THREE.BoxGeometry(0.034,0.05,0.045),M.hit); hit.position.z=0.02; grp.add(hit);
      return reg(Object.assign({type:'switch',piv,led},o),[hit]);
    };
    const button=(P,x,y,r,o)=>{
      P.text(x,y-r-0.012,o.label,0.0085);
      const grp=new THREE.Group(); grp.position.set(x,y,0); P.g.add(grp);
      const bz=new THREE.Mesh(cylZ(r*1.2,r*1.28,0.006),M.alu); bz.position.z=0.003; add(bz,false,grp);
      const mat=new THREE.MeshStandardMaterial({color:C(o.color),emissive:C(o.color),emissiveIntensity:0.15,roughness:0.35,metalness:0.1});
      const cap=new THREE.Mesh(cylZ(r*0.94,r,0.012),mat); cap.position.z=0.011; add(cap,true,grp);
      const hit=new THREE.Mesh(cylZ(r*1.3,r*1.3,0.04,10),M.hit); hit.position.z=0.02; grp.add(hit);
      return reg(Object.assign({type:'button',cap,mat,down:0},o),[hit]);
    };
    const gauge=(P,x,y,r,o)=>{
      const [cx,cy]=P.xy(x,y), R=r*P.px;
      for(const c of [P.ctx,P.gctx]){ const face=c===P.ctx; c.fillStyle=face?'#07080a':'#000'; c.beginPath(); c.arc(cx,cy,R,0,7); c.fill();
        for(const z of (o.zones||[])){ c.strokeStyle=face?z[2]:z[2]; c.lineWidth=R*0.09; c.beginPath(); c.arc(cx,cy,R*0.9,(-225+270*z[0])*Math.PI/180,(-225+270*z[1])*Math.PI/180); c.stroke(); }
        const n=o.ticks.length; c.strokeStyle=c.fillStyle=face?'#d5d9de':'#fff';
        for(let i=0;i<=(n-1)*5;i++){ const a=(-135+270*i/((n-1)*5))*Math.PI/180, sn=Math.sin(a), co=-Math.cos(a), major=i%5===0; c.lineWidth=major?R*0.045:R*0.02; c.beginPath(); c.moveTo(cx+sn*R*(major?0.7:0.78),cy+co*R*(major?0.7:0.78)); c.lineTo(cx+sn*R*0.86,cy+co*R*0.86); c.stroke();
          if(major){ c.font=`${Math.round(R*0.2)}px ${FONT_MONO}`; c.textAlign='center'; c.textBaseline='middle'; c.fillText(o.ticks[i/5],cx+sn*R*0.5,cy+co*R*0.5); } }
        c.font=`600 ${Math.round(R*0.16)}px ${FONT_DISP}`; c.fillText(o.label,cx,cy+R*0.6); if(o.unit){ c.font=`${Math.round(R*0.11)}px ${FONT_MONO}`; c.fillText(o.unit,cx,cy+R*0.78); } }
      const grp=new THREE.Group(); grp.position.set(x,y,0); P.g.add(grp);
      const bz=new THREE.Mesh(new THREE.TorusGeometry(r*1.03,r*0.065,10,44),M.alu); bz.position.z=0.006; add(bz,false,grp);
      const piv=new THREE.Group(); piv.position.z=0.008; grp.add(piv); const nd=new THREE.Mesh(new THREE.BoxGeometry(r*0.05,r*0.92,0.0015),M.needle); nd.position.y=r*0.33; piv.add(nd);
      const hub=new THREE.Mesh(cylZ(r*0.11,r*0.11,0.005,16),M.knob); hub.position.z=0.01; grp.add(hub);
      const gl=new THREE.Mesh(new THREE.CircleGeometry(r,36),M.screenGlass); gl.position.z=0.014; gl.renderOrder=3; grp.add(gl);
      return this.gauges[o.id]={piv,val:0,target:0};
    };
    const screen=(P,x,y,w,h,cw,ch,name,round)=>{
      const cv=makeCanvas(cw,ch), tex=canvasTex(cv), mat=new THREE.MeshBasicMaterial({map:tex});
      const m=new THREE.Mesh(round?new THREE.CircleGeometry(w/2,48):new THREE.PlaneGeometry(w,h),mat); m.position.set(x,y,0.003); P.g.add(m);
      const [cx,cy]=P.xy(x,y); P.ctx.fillStyle='#050506'; if(round){ P.ctx.beginPath(); P.ctx.arc(cx,cy,w/2*P.px+10,0,7); P.ctx.fill(); } else P.ctx.fillRect(cx-w/2*P.px-10,cy-h/2*P.px-10,w*P.px+20,h*P.px+20);
      if(round){ const bz=new THREE.Mesh(new THREE.TorusGeometry(w/2*1.03,w*0.022,10,48),M.rubber); bz.position.set(x,y,0.006); add(bz,false,P.g); }
      else { const t=0.008; bx(w+2*t,t,0.012,M.rubber,x,y+h/2+t/2,0.004,P.g); bx(w+2*t,t,0.012,M.rubber,x,y-h/2-t/2,0.004,P.g); bx(t,h,0.012,M.rubber,x-w/2-t/2,y,0.004,P.g); bx(t,h,0.012,M.rubber,x+w/2+t/2,y,0.004,P.g); }
      const gl=new THREE.Mesh(round?new THREE.CircleGeometry(w/2,48):new THREE.PlaneGeometry(w,h),M.screenGlass); gl.position.set(x,y,0.0065); gl.renderOrder=3; P.g.add(gl);
      this.screenMats.push(mat); return this.screens[name]={cv,ctx:cv.getContext('2d'),tex,mat,w:cw,h:ch};
    };

    /* ---- centre dash ---- */
    const PC=panel(0.62,0.34); PC.g.position.set(0,-0.37,-0.80); PC.g.rotation.set(-0.38,0,0); PC.hood();
    screen(PC,0.005,0.03,0.34,0.24,680,480,'mfd'); screen(PC,-0.24,0.035,0.085,0.2,170,400,'ann');
    ['NAV','CARGO','SYS'].forEach((lb,i)=>button(PC,-0.11+i*0.075,-0.118,0.014,{id:'page'+i,label:lb,color:'#3fb8ff',press(){ G.sys.mfdPage=i; },lit:()=>G.sys.mfdPage===i,tip:'MFD page'}));
    knob(PC,0.245,0.065,0.03,{id:'target',label:'DESTINATION',wrap:true,min:0,max:PLANETS.length-1,step:1,get:()=>G.target,set:v=>Game.setTarget(v),fmt:v=>PLANETS[v].name});
    button(PC,0.245,-0.07,0.02,{id:'hail',label:'HAIL',color:'#2fd45a',press(){ Comms.hail(); },lit:()=>!!Npc.nearest(7000),tip:'Hail nearest pilot'});
    PC.text(0.13,-0.118,'LONG HAUL FREIGHT SYS',0.0075,'center',true); PC.done();

    /* ---- left wing: flight gauges + radar ---- */
    const PL=panel(0.46,0.34); PL.g.rotation.order='YXZ'; PL.g.rotation.set(-0.38,0.62,0); PL.g.position.set(-0.497,-0.37,-0.666); PL.hood();
    gauge(PL,-0.145,0.088,0.058,{id:'speed',label:'SPEED',unit:'km/s',ticks:['0','','.6k','','1.2k','','1.8k'],zones:[[0.9,1,'#36c']]});
    gauge(PL,0,0.088,0.058,{id:'fuel',label:'FUEL',unit:'%',ticks:['E','','½','','F'],zones:[[0,0.15,'#c33'],[0.15,0.3,'#c90']]});
    gauge(PL,0.145,0.088,0.058,{id:'temp',label:'CORE',unit:'temp',ticks:['C','','','','H'],zones:[[0.8,1,'#c33'],[0.6,0.8,'#c90']]});
    screen(PL,-0.12,-0.082,0.15,0.15,300,300,'radar',true);
    knob(PL,0.02,-0.06,0.02,{id:'range',label:'SCAN RANGE',min:0,max:3,step:1,ticks:['5k','25k','150k','SYS'],get:()=>G.sys.radarRange,set:v=>G.sys.radarRange=v,fmt:v=>['5,000 km','25,000 km','150,000 km','Whole system'][v]});
    screen(PL,0.145,-0.045,0.13,0.042,260,84,'clock'); screen(PL,0.145,-0.115,0.13,0.042,260,84,'hold'); PL.done();

    /* ---- right wing: attitude + radio ---- */
    const PR=panel(0.46,0.34); PR.g.rotation.order='YXZ'; PR.g.rotation.set(-0.38,-0.62,0); PR.g.position.set(0.497,-0.37,-0.666); PR.hood();
    screen(PR,-0.13,0.07,0.15,0.15,300,300,'att',true); PR.text(-0.13,-0.022,'ATTITUDE',0.0085);
    screen(PR,0.085,0.118,0.21,0.046,420,92,'radio');
    knob(PR,0.01,0.03,0.02,{id:'vol',label:'VOLUME',min:0,max:1,get:()=>G.sys.radioVol,set:v=>{ G.sys.radioVol=v; Sfx.setRadioVol(G.sys.power?v:0); },fmt:v=>Math.round(v*100)+'%'});
    knob(PR,0.095,0.03,0.02,{id:'chan',label:'CHANNEL',min:0,max:3,step:1,ticks:['1','2','3','4'],get:()=>G.sys.channel,set:v=>{ G.sys.channel=v; Radio.retune(); },fmt:v=>CHANNELS[v]});
    toggle(PR,0.18,0.03,{id:'xlate',label:'XLATE',get:()=>G.sys.translator,set:v=>G.sys.translator=v,tip:'Translator'});
    button(PR,0.03,-0.095,0.022,{id:'horn',label:'HORN',color:'#e03a2a',press(){ Game.honk(); },lit:()=>false,tip:'Horn'});
    toggle(PR,0.11,-0.09,{id:'hud',label:'HUD',get:()=>G.sys.hud,set:v=>G.sys.hud=v,tip:'Target markers'});
    toggle(PR,0.18,-0.09,{id:'wipe',label:'WIPERS',get:()=>G.sys.wipers,set:v=>G.sys.wipers=v,tip:'Canopy wipers'});
    toggle(PR,-0.17,-0.09,{id:'invert',label:'INV PITCH',off:'NORM',get:()=>G.sys.invert,set:v=>G.sys.invert=v,tip:'Invert W/S'});
    toggle(PR,-0.09,-0.09,{id:'ap',label:'AUTOPILOT',get:()=>G.sys.autopilot,set:v=>Game.setAutopilot(v),tip:'Steer to destination'});
    PR.done();

    /* ---- pedestal: throttle + warp ---- */
    const PP=panel(0.24,0.44); PP.g.position.set(0,-0.60,-0.56); PP.g.rotation.set(-1.17,0,0);
    screen(PP,0,0.185,0.2,0.04,400,80,'thr');
    { // throttle lever
      const x=-0.055, y=-0.02, len=0.3, [cx,cy]=PP.xy(x,y), L=len*PP.px;
      for(const c of [PP.ctx,PP.gctx]){ c.fillStyle=c===PP.ctx?'#030304':'#000'; c.fillRect(cx-12,cy-L/2-14,24,L+28); c.fillStyle=c.strokeStyle=c===PP.ctx?'#c9cdd2':'#fff'; c.lineWidth=3;
        for(let i=0;i<=10;i++){ const ty=cy+L/2-L*i/10; c.beginPath(); c.moveTo(cx+22,ty); c.lineTo(cx+(i%5?34:44),ty); c.stroke(); c.font=`${i===10||i===0||i===5?34:26}px ${FONT_MONO}`; c.textAlign='left'; c.textBaseline='middle'; c.fillText(i===0?'STOP':String(i),cx+52,ty); } }
      PP.text(x+0.02,y+len/2+0.03,'THROTTLE',0.01);
      const h=new THREE.Group(); h.position.set(x,y,0); PP.g.add(h); bx(0.012,0.012,0.06,M.alu,0,0,0.03,h); const grip=bx(0.056,0.024,0.03,M.rubber,0,0,0.07,h); bx(0.058,0.006,0.031,M.trim,0,0,0.07,h);
      const hit=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.04,0.1),M.hit); hit.position.z=0.05; h.add(hit);
      reg({type:'lever',id:'throttle',label:'THROTTLE',handle:h,y0:y-len/2,len,min:0,max:10,step:1,get:()=>G.ship.throttle,set:v=>Game.setThrottle(v),fmt:v=>v===0?'Stop':v+' / 10'},[hit,grip]);
    }
    { // warp handle
      const x=0.065, y=0.06; PP.text(x,y+0.075,'WARP DRIVE',0.01); PP.text(x,y-0.062,'PULL TO ENGAGE',0.0065,'center',true);
      const [cx,cy]=PP.xy(x,y); for(const c of [PP.ctx,PP.gctx]){ c.strokeStyle=c===PP.ctx?'#d8a020':'#fa0'; c.lineWidth=5; c.setLineDash([16,10]); c.strokeRect(cx-70,cy-105,140,210); c.setLineDash([]); }
      const piv=new THREE.Group(); piv.position.set(x,y,0.004); PP.g.add(piv); bx(0.05,0.03,0.008,M.alu,x,y,0.004,PP.g);
      bx(0.014,0.014,0.085,M.alu,0,0,0.045,piv); const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.013,0.013,0.085,16),M.knob); bar.rotation.z=Math.PI/2; bar.position.z=0.09; add(bar,true,piv);
      const wm=new THREE.MeshBasicMaterial({color:0x000000}); const lamp=new THREE.Mesh(new THREE.CylinderGeometry(0.0135,0.0135,0.02,16),wm); lamp.rotation.z=Math.PI/2; lamp.position.z=0.09; piv.add(lamp);
      const hit=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.12),M.hit); hit.position.z=0.06; piv.add(hit);
      reg({type:'switch',id:'warp',label:'WARP DRIVE',piv,led:lamp,amp:0.55,ledOn:HDR('#60b0ff',4),get:()=>G.ship.warp,set:()=>Game.toggleWarp(),fmt:v=>v?'Engaged':'Standby'},[hit,bar]);
    }
    button(PP,0.035,-0.115,0.02,{id:'stop',label:'ALL STOP',color:'#e0a020',press(){ Game.setThrottle(0); if(G.ship.warp) Game.toggleWarp(); },lit:()=>G.ship.throttle===0,tip:'Cut engines'});
    button(PP,0.09,-0.115,0.016,{id:'next',label:'NEXT',color:'#3fb8ff',press(){ Game.setTarget((G.target+1)%PLANETS.length); },lit:()=>false,tip:'Next destination'});
    PP.done();

    /* ---- overhead ---- */
    const PO=panel(0.62,0.2); PO.g.position.set(0,0.565,-0.33); PO.g.rotation.set(0.927,0,0);
    toggle(PO,-0.245,0.0,{id:'power',label:'MASTER PWR',get:()=>G.sys.power,set:v=>Game.setPower(v),tip:'Master power'});
    knob(PO,-0.15,0.01,0.022,{id:'cabin',label:'CABIN LIGHTS',min:0,max:1,get:()=>G.sys.cabin,set:v=>G.sys.cabin=v,fmt:v=>Math.round(v*100)+'%'});
    knob(PO,-0.05,0.01,0.022,{id:'instr',label:'INSTR LIGHTS',min:0,max:1,get:()=>G.sys.instr,set:v=>G.sys.instr=v,fmt:v=>Math.round(v*100)+'%'});
    knob(PO,0.05,0.01,0.022,{id:'visor',label:'SUN VISOR',min:0,max:1,get:()=>G.sys.visor,set:v=>G.sys.visor=v,fmt:v=>Math.round(v*100)+'%'});
    knob(PO,0.15,0.01,0.022,{id:'music',label:'CABIN MUSIC',min:0,max:1,get:()=>G.sys.music,set:v=>{ G.sys.music=v; Sfx.setMusicVol(v); },fmt:v=>Math.round(v*100)+'%'});
    button(PO,0.25,0.01,0.018,{id:'center',label:'CENTRE VIEW',color:'#c8c8c8',press(){ self.zoomOut(); },lit:()=>false,tip:'Reset view'});
    PO.done();
    // dome lamps
    this.lampMat=new THREE.MeshBasicMaterial({color:0xffffff});
    for(const s of [-1,1]){ const lm=new THREE.Mesh(new THREE.CircleGeometry(0.04,20),this.lampMat); lm.rotation.x=Math.PI/2; lm.position.set(s*0.38,0.638,0.05); g.add(lm); }
    this.cabinLights=[-1,1].map(s=>{ const l=new THREE.PointLight(C('#ffd9b0'),0,3.2,1.6); l.position.set(s*0.38,0.56,0.02); g.add(l); return l; });
    this.glowLight=new THREE.PointLight(C(ck.glow),0,1.8,1.5); this.glowLight.position.set(0,-0.22,-0.55); g.add(this.glowLight);

    /* ---- translator display on the glare shield ---- */
    const PT=panel(1.0,0.16); PT.g.position.set(0,-0.118,-0.915); PT.g.rotation.set(-0.2,0,0);
    screen(PT,0,0,0.97,0.135,1940,270,'xl'); PT.done();

    /* ---- manifest clipboard ---- */
    { const cv=makeCanvas(400,560); const tex=canvasTex(cv); const board=new THREE.Group(); board.position.set(-0.81,-0.412,-0.32); board.rotation.y=0.18; g.add(board);
      bx(0.2,0.008,0.28,std('#5a4026',0.8,0),0,0,0,board); const pm=new THREE.Mesh(new THREE.PlaneGeometry(0.18,0.252),new THREE.MeshStandardMaterial({map:tex,roughness:0.9,metalness:0})); pm.rotation.x=-Math.PI/2; pm.position.y=0.0046; pm.receiveShadow=true; board.add(pm);
      bx(0.07,0.012,0.02,M.alu,0,0.008,-0.125,board); this.screens.manifest={cv,ctx:cv.getContext('2d'),tex,w:400,h:560}; }

    /* ---- wipers ---- */
    { const base=new V3(0,-0.23,-1.41), top=new V3(0,0.64,-0.45), u=top.clone().sub(base).normalize(), rgt=new V3(1,0,0), nn=new V3().crossVectors(rgt,u);
      const q=new Q4().setFromRotationMatrix(new THREE.Matrix4().makeBasis(rgt,u,nn)); this.wipers=[];
      for(const s of [-0.42,0.12]){ const w=new THREE.Group(); w.position.copy(base).addScaledVector(u,0.035).addScaledVector(nn,0.014).addScaledVector(rgt,s); w.quaternion.copy(q); g.add(w);
        const piv=new THREE.Group(); w.add(piv); bx(0.012,0.5,0.008,M.knob,0,0.25,0,piv); bx(0.02,0.4,0.006,M.rubber,0,0.3,-0.005,piv); piv.rotation.z=-1.47; this.wipers.push(piv); } this.wipePh=0; }

    /* ---- dashboard mascot ---- */
    { const b=new THREE.Group(); b.position.set(0.5,-0.2,-0.84); g.add(b); const gm=std('#58d058',0.35,0); const body=new THREE.Mesh(new THREE.SphereGeometry(0.022,14,10),gm); body.scale.y=1.2; body.position.y=0.022; add(body,true,b);
      const head=new THREE.Group(); head.position.y=0.05; b.add(head); const hm=new THREE.Mesh(new THREE.SphereGeometry(0.024,16,12),gm); hm.position.y=0.02; add(hm,true,head);
      for(const s of [-1,0,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(0.0065,8,6),std('#ffffff',0.2,0)); e.position.set(s*0.012,0.026+(s?0:0.008),0.02); head.add(e); const p=new THREE.Mesh(new THREE.SphereGeometry(0.003,6,6),std('#000000',0.2,0)); p.position.set(s*0.012,0.026+(s?0:0.008),0.0255); head.add(p); }
      this.bobble=head; this.bobV=new THREE.Vector2(); this.bobA=new THREE.Vector2(); }

    this.drawManifest(); this.frame=0;
  },

  /* ---------- per-frame ---------- */
  setDoor(v){ this.doorT=v; if(Sfx.ok()) Sfx.hiss(0.4,0.08); },
  update(dt, t){
    const s=G.ship, sys=G.sys, pw=sys.power?1:0, def=SHIPS[G.shipId]; this.frame++;
    if(this.door) this.door.position.x=damp(this.door.position.x,this.doorT?0.86:0,9,dt);
    for(const id in this.ctrls){ const c=this.ctrls[id];
      if(c.type==='knob'){ let a=-c.angle(c.get()), d=a-c.cur; if(c.wrap){ d=((d+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI; } c.cur+=d*(1-Math.exp(-dt*16)); c.rot.rotation.z=c.cur; }
      else if(c.type==='switch'){ const on=c.get(), amp=c.amp||0.5; c.piv.rotation.x=damp(c.piv.rotation.x,on?-amp:amp,18,dt); if(c.ledOn){ c.led.material.color.copy(c.ledOn).multiplyScalar(on?(0.7+0.3*Math.sin(t*9)):s.warpF>0?0.3:(Game.canWarp()===true?0.25+0.12*Math.sin(t*3):0.02)); } else c.led.material.color.setRGB(on&&pw?0.3:0.02,on&&pw?2.2:0.03,on&&pw?0.5:0.02); }
      else if(c.type==='button'){ c.down=Math.max(0,c.down-dt*5); c.cap.position.z=0.011-Math.min(1,c.down)*0.005; c.mat.emissiveIntensity=pw*sys.instr*(c.lit()?1.6:0.12)+c.down*1.2; }
      else if(c.type==='lever'){ const ty=c.y0+c.len*(c.get()-c.min)/(c.max-c.min); c.handle.position.y=damp(c.handle.position.y,ty,14,dt); }
    }
    // gauges
    const gz=this.gauges; gz.speed.target=s.warpF>0.2?1:clamp(s.speed/1800,0,1);
    gz.fuel.target=G.fuel/def.fuel; gz.temp.target=s.temp;
    for(const k in gz){ const q=gz[k]; q.val=damp(q.val,pw?q.target:0,5,dt); q.piv.rotation.z=-(-135+270*q.val)*Math.PI/180+(k==='temp'||s.warpF>0.5?Math.sin(t*31+k.length)*0.008:0); }
    // lighting
    const ins=pw*sys.instr; for(const m of this.glowMats) m.emissiveIntensity=ins*0.9; for(const m of this.screenMats) m.color.setScalar(0.25+ins*1.15);
    for(const l of this.cabinLights) l.intensity=pw*sys.cabin*0.9; this.lampMat.color.setScalar(0.05+pw*sys.cabin*2.2); this.glowLight.intensity=ins*0.35;
    const gc=C(def.ck.glow).multiplyScalar(0.2+pw*sys.cabin*1.6); for(const m of this.strips) m.color.copy(gc);
    // canopy
    this.visorMat.opacity=sys.visor*0.72; if(s.warpF>0.5) sys.dirt=Math.min(1,sys.dirt+dt*0.012); else sys.dirt=Math.min(1,sys.dirt+dt*0.0015);
    if(sys.wipers&&pw){ this.wipePh+=dt*3.2; sys.dirt=Math.max(0,sys.dirt-dt*0.22); } else { const m=this.wipePh%(Math.PI*2); if(m>0.05) this.wipePh+=dt*3.2; if(this.wipePh%(Math.PI*2)<m) this.wipePh=0; }
    const wa=-1.47+(0.5-0.5*Math.cos(this.wipePh))*1.75; for(const w of this.wipers) w.rotation.z=wa;
    this.dirtMat.opacity=sys.dirt*0.5;
    // stick + mascot follow the controls
    this.stick.rotation.x=damp(this.stick.rotation.x,-s.ctl.x*0.28,10,dt); this.stick.rotation.z=damp(this.stick.rotation.z,s.ctl.y*0.28+s.ctl.z*0.12,10,dt);
    this.bobV.x+=(-this.bobA.x*60-this.bobV.x*3+s.angVel.x*14)*dt; this.bobV.y+=(-this.bobA.y*60-this.bobV.y*3-s.angVel.y*14+(s.warpF>0.5?Math.sin(t*23)*2:0))*dt; this.bobA.addScaledVector(this.bobV,dt); this.bobble.rotation.set(this.bobA.x,0,this.bobA.y);
    // screens, staggered
    const f=this.frame; if(!pw){ if(f%20===0) for(const k of ['mfd','ann','radar','att','radio','thr','clock','hold','xl']) this.blank(k); return; }
    if(f%8===0) this.drawMFD(t); if(f%8===4) this.drawAnn(t); if(f%5===1) this.drawRadar(t); if(f%3===2) this.drawAtt(); if(f%4===3) this.drawXl(t);
    if(f%10===5){ this.drawRadio(); this.drawThr(); } if(f%30===7){ this.drawClock(t); this.drawHold(); }
  },
  blank(k){ const s=this.screens[k]; s.ctx.fillStyle='#000'; s.ctx.fillRect(0,0,s.w,s.h); s.tex.needsUpdate=true; },
  targetLocal(){ const P=Nav.target(), s=G.ship; const v=new V3().subVectors(P.pos,s.pos); const d=v.length(); v.normalize().applyQuaternion(s.quat.clone().invert()); return {P,d,v,ang:Math.acos(clamp(-v.z,-1,1))}; },

  drawMFD(t){
    const S=this.screens.mfd, x=S.ctx, W=S.w, H=S.h, s=G.ship, def=SHIPS[G.shipId], page=G.sys.mfdPage;
    x.fillStyle='#03131b'; x.fillRect(0,0,W,H); x.textBaseline='alphabetic';
    x.fillStyle='#0a2a38'; x.fillRect(0,0,W,76); x.font=`600 42px ${FONT_DISP}`; x.textAlign='left'; let tx=18;
    ['NAV','CARGO','SYS'].forEach((n,i)=>{ const w=x.measureText(n).width; x.fillStyle=i===page?'#62e2ff':'#3a7388'; x.fillText(n,tx,52); if(i===page) x.fillRect(tx,62,w,5); tx+=w+26; });
    x.textAlign='right'; x.fillStyle='#7dffa8'; x.font=`40px ${FONT_MONO}`; x.fillText(fmtCr(G.credits),W-16,53,W-tx-24);
    if(page===0){
      const T=this.targetLocal(), P=T.P; x.textAlign='left'; x.fillStyle='#ffb454'; x.font=`700 64px ${FONT_DISP}`; x.fillText(P.name.toUpperCase(),18,142,W-36);
      x.fillStyle='#86a2ae'; x.font=`38px ${FONT_MONO}`; x.fillText(P.port,20,186,W-40);
      // bearing scope
      const cx=108, cy=304, R=84; x.strokeStyle='#1d5a70'; x.lineWidth=2; for(const k of [1,0.66,0.33]){ x.beginPath(); x.arc(cx,cy,R*k,0,7); x.stroke(); } x.beginPath(); x.moveTo(cx-R,cy); x.lineTo(cx+R,cy); x.moveTo(cx,cy-R); x.lineTo(cx,cy+R); x.stroke();
      const ph=Math.atan2(T.v.y,T.v.x), rr=Math.min(T.ang/(Math.PI/2),1)*R, behind=T.v.z>0, px=cx+Math.cos(ph)*rr, py=cy-Math.sin(ph)*rr;
      x.fillStyle=behind?'#ff6f61':(T.ang<0.12?'#7dffa8':'#ffb454'); x.beginPath(); x.arc(px,py,13,0,7); x.fill(); x.strokeStyle=x.fillStyle; x.lineWidth=4; x.beginPath(); x.moveTo(cx,cy); x.lineTo(px,py); x.stroke();
      // numbers
      x.textAlign='left'; const row=(lab,val,y,col)=>{ x.fillStyle='#5f8fa0'; x.font=`42px ${FONT_MONO}`; x.fillText(lab,226,y); x.fillStyle=col||'#dcedf3'; x.font=`60px ${FONT_MONO}`; x.fillText(val,226,y+58,W-240); };
      row(behind?'BEHIND YOU':'DISTANCE',fmtDist(T.d),234,behind?'#ff6f61':null); const eta=s.speed>5?T.d/s.speed:Infinity; row('ETA',eta===Infinity?'--:--':eta>5999?'>99 min':String(Math.floor(eta/60)).padStart(2,'0')+':'+String(Math.floor(eta%60)).padStart(2,'0'),346);
      const cw=Game.canWarp(); let msg, col='#62e2ff';
      if(s.warp){ msg='WARP ACTIVE'; col='#9fc0ff'; } else if(cw!==true){ msg=cw; col='#ffb454'; } else if(P.isWp&&P.dist<P.arriveR*4){ msg='ARRIVING'; col='#7dffa8'; } else if(!P.isWp&&P.dist<P.dropR){ msg='AUTO-LAND IN '+fmtDist(Math.max(0,P.dist-P.landR)); col='#7dffa8'; }
      else if(T.ang<0.14){ msg='ALIGNED · PRESS Z TO WARP'; col='#7dffa8'; } else msg='TURN TO DESTINATION';
      if(Math.floor(t*2)%2||col!=='#7dffa8'){ x.fillStyle=col; x.font=`42px ${FONT_MONO}`; x.textAlign='center'; x.fillText(msg,W/2,H-12,W-24); }
    } else if(page===1){
      x.textAlign='left'; let used=0; G.cargo.forEach(c=>used+=c.qty); x.fillStyle='#ffb454'; x.font=`600 48px ${FONT_DISP}`; const ht=`HOLD ${used} / ${holdCap()}`; x.fillText(ht,18,132); const bx=18+x.measureText(ht).width+28;
      x.fillStyle='#0a2a38'; x.fillRect(bx,100,W-bx-18,32); x.fillStyle='#ffb454'; x.fillRect(bx,100,(W-bx-18)*Math.min(1,used/holdCap()),32);
      x.font=`40px ${FONT_MONO}`;
      if(!G.cargo.length){ x.fillStyle='#5f8fa0'; x.fillText('Hold is empty.',18,214); x.fillText('Take a job at a port.',18,266,W-36); }
      const show=G.cargo.length>3?2:3;
      G.cargo.slice(0,show).forEach((c,i)=>{ const y=200+i*98; x.textAlign='left'; x.fillStyle='#dcedf3'; x.fillText(c.kind==='escort'?c.good:`${c.qty}× ${c.good}`,18,y,W-36);
        x.fillStyle=c.to===G.target?'#ffb454':'#5f8fa0'; x.fillText('→ '+Ev.cargoDest(c),18,y+46); x.fillStyle='#7dffa8'; x.textAlign='right'; x.fillText(fmtCr(c.pay),W-18,y+46); x.textAlign='left'; });
      if(G.cargo.length>show){ x.fillStyle='#5f8fa0'; x.fillText(`+ ${G.cargo.length-show} more aboard`,18,H-22,W-36); }
    } else {
      x.textAlign='left'; x.fillStyle='#ffb454'; x.font=`600 48px ${FONT_DISP}`; x.fillText(def.name.toUpperCase(),18,132,W-36);
      const rows=[['FUEL',Math.round(G.fuel/def.fuel*100)+' %'],['HULL',Math.round(G.hull)+' %'],['CORE TEMP',Math.round(s.temp*100)+' %'],['REP',Rep.label()+' '+(G.rep>0?'+':'')+G.rep],['HOT TIP',G.hot!=null?PLANETS[G.hot].name+' +50%':'none']];
      x.font=`42px ${FONT_MONO}`; rows.forEach((r,i)=>{ const y=200+i*62; x.fillStyle='#5f8fa0'; x.textAlign='left'; x.fillText(r[0],18,y); const lw=x.measureText(r[0]).width; x.fillStyle='#dcedf3'; x.textAlign='right'; x.fillText(r[1],W-18,y,W-60-lw); });
      x.textAlign='left';
    }
    S.tex.needsUpdate=true;
  },
  drawAnn(t){
    const S=this.screens.ann, x=S.ctx, s=G.ship, def=SHIPS[G.shipId]; x.fillStyle='#050608'; x.fillRect(0,0,S.w,S.h); const bl=Math.floor(t*3)%2;
    const lamps=[['WARP',s.warp,'#6ab8ff'],['MASS LOCK',Game.massLock()&&!s.warp,'#ffb454'],['AUTO PILOT',G.sys.autopilot,'#7dffa8'],['FUEL LOW',G.fuel/def.fuel<0.2&&bl,'#ff6f61'],['HULL LOW',G.hull<35&&bl,'#ff6f61'],[Escort.npc?'ESCORT':'COMMS',Escort.npc?(Game.escortAlarm?bl:true):(Radio.cur&&Radio.cur.t<Radio.cur.dur),Game.escortAlarm?'#ff6f61':'#62e2ff']];
    lamps.forEach((l,i)=>{ const y=6+i*65, w=l[0].split(' '); x.fillStyle=l[1]?l[2]:'#12181c'; x.fillRect(8,y,S.w-16,58); x.fillStyle=l[1]?'#041018':'#2c3a42'; x.textAlign='center'; x.textBaseline='middle';
      if(w.length>1){ x.font=`600 28px ${FONT_DISP}`; x.fillText(w[0],S.w/2,y+17,S.w-24); x.fillText(w[1],S.w/2,y+43,S.w-24); } else { x.font=`600 40px ${FONT_DISP}`; x.fillText(l[0],S.w/2,y+31,S.w-26); } });
    S.tex.needsUpdate=true;
  },
  drawRadar(t){
    const S=this.screens.radar, x=S.ctx, s=G.ship, R=140, cx=150, cy=150, range=RANGES[G.sys.radarRange], qi=s.quat.clone().invert();
    x.fillStyle='#02100a'; x.fillRect(0,0,300,300); x.strokeStyle='#0f5a3a'; x.lineWidth=1.5; for(const k of [1,0.66,0.33]){ x.beginPath(); x.arc(cx,cy,R*k,0,7); x.stroke(); }
    x.beginPath(); x.moveTo(cx-R,cy); x.lineTo(cx+R,cy); x.moveTo(cx,cy-R); x.lineTo(cx,cy+R); x.stroke();
    const sw=t*2.2; const gr=x.createLinearGradient(cx,cy,cx+Math.cos(sw)*R,cy+Math.sin(sw)*R); gr.addColorStop(0,'rgba(60,255,160,0)'); gr.addColorStop(1,'rgba(60,255,160,.7)'); x.strokeStyle=gr; x.lineWidth=3; x.beginPath(); x.moveTo(cx,cy); x.lineTo(cx+Math.cos(sw)*R,cy+Math.sin(sw)*R); x.stroke();
    const plot=(pos)=>{ const v=new V3().subVectors(pos,s.pos).applyQuaternion(qi); let px=v.x/range, py=v.z/range; const m=Math.hypot(px,py); let edge=false; if(m>1){ px/=m; py/=m; edge=true; } return [cx+px*R,cy+py*R,edge,v.y]; };
    const sp=plot(new V3(0,0,0)); x.fillStyle='#ffe066'; x.beginPath(); x.arc(sp[0],sp[1],sp[2]?4:7,0,7); x.fill();
    PLANETS.forEach((P,i)=>{ const p=plot(P.pos), tg=i===G.target; x.fillStyle=tg?'#ffb454':'#45d0ff'; x.strokeStyle=x.fillStyle; x.lineWidth=2.5; x.beginPath(); x.arc(p[0],p[1],tg?8:5,0,7); if(p[2]) x.stroke(); else x.fill(); if(tg){ x.beginPath(); x.arc(p[0],p[1],13,0,7); x.stroke(); } });
    for(const n of Npc.list){ const p=plot(n.pos); if(p[2]) continue; x.fillStyle=SPECIES[n.pilot.sp].col; x.beginPath(); x.moveTo(p[0],p[1]-6); x.lineTo(p[0]+5,p[1]+4); x.lineTo(p[0]-5,p[1]+4); x.fill(); }
    x.fillStyle='#b8ffd8'; x.beginPath(); x.moveTo(cx,cy-8); x.lineTo(cx+6,cy+6); x.lineTo(cx-6,cy+6); x.fill();
    S.tex.needsUpdate=true;
  },
  drawAtt(){
    const S=this.screens.att, x=S.ctx, q=G.ship.quat, f=new V3(0,0,-1).applyQuaternion(q), r=new V3(1,0,0).applyQuaternion(q), u=new V3(0,1,0).applyQuaternion(q);
    const pitch=Math.asin(clamp(f.y,-1,1)), roll=Math.atan2(r.y,u.y), k=150/(Math.PI/3.2);
    x.save(); x.fillStyle='#000'; x.fillRect(0,0,300,300); x.translate(150,150); x.rotate(roll); x.translate(0,pitch*k);
    x.fillStyle='#1f5fae'; x.fillRect(-400,-800,800,800); x.fillStyle='#6a4526'; x.fillRect(-400,0,800,800); x.strokeStyle='#fff'; x.lineWidth=3; x.beginPath(); x.moveTo(-400,0); x.lineTo(400,0); x.stroke();
    x.font=`18px ${FONT_MONO}`; x.fillStyle='#fff'; x.textAlign='center'; x.textBaseline='middle'; x.lineWidth=2;
    for(let d=-80;d<=80;d+=10){ if(!d) continue; const y=-d*Math.PI/180*k, w=d%20?22:44; x.beginPath(); x.moveTo(-w,y); x.lineTo(w,y); x.stroke(); if(d%20===0){ x.fillText(Math.abs(d),-w-18,y); x.fillText(Math.abs(d),w+18,y); } }
    x.restore(); x.strokeStyle='#ffb454'; x.lineWidth=5; x.beginPath(); x.moveTo(84,150); x.lineTo(126,150); x.lineTo(138,164); x.moveTo(216,150); x.lineTo(174,150); x.lineTo(162,164); x.stroke(); x.fillStyle='#ffb454'; x.fillRect(146,146,8,8);
    const hdg=(Math.atan2(f.x,-f.z)*180/Math.PI+360)%360; x.fillStyle='rgba(0,0,0,.6)'; x.fillRect(108,14,84,34); x.fillStyle='#62e2ff'; x.font=`26px ${FONT_MONO}`; x.textAlign='center'; x.textBaseline='middle'; x.fillText(String(Math.round(hdg)).padStart(3,'0')+'°',150,32);
    S.tex.needsUpdate=true;
  },
  drawXl(t){
    // Wide and low so it stays under the dead-ahead sightline. Words are drawn at twice their original size.
    const S=this.screens.xl, x=S.ctx, W=S.w, H=S.h, c=Radio.cur; x.fillStyle='#04121a'; x.fillRect(0,0,W,H); x.textBaseline='alphabetic';
    x.strokeStyle='#123846'; x.lineWidth=3; x.strokeRect(6,6,W-12,H-12); const live=c&&c.t<c.dur, PX=20, PY=16, PS=170, TX=PX+PS+30;
    if(!c){ for(let i=0;i<9;i++){ x.fillStyle='#1d5a70'; x.fillRect(PX+10+i*17,H/2+20,11,7); }
      x.textAlign='left'; x.fillStyle='#3a7388'; x.font=`60px ${FONT_MONO}`; x.fillText(G.sys.radioVol<0.02?'RADIO MUTED':'LISTENING'+'.'.repeat(1+Math.floor(t*2)%3),TX,H/2+22); S.tex.needsUpdate=true; return; }
    const sp=SPECIES[c.sp]; drawAlien(x,c.sp,c.seed,PX,PY,PS); x.strokeStyle=sp.col; x.strokeRect(PX,PY,PS,PS);
    x.textAlign='center'; x.fillStyle=sp.col; x.font=`600 40px ${FONT_DISP}`; x.fillText(sp.name.toUpperCase(),PX+PS/2,H-26,PS+8); x.textAlign='left';
    const frac=clamp(c.t/Math.max(0.5,c.dur*0.8),0,1), heard=c.alien.slice(0,Math.ceil(c.alien.length*frac));
    drawGlyphs(x,heard,TX,12,26,c.sp,sp.col,W-TX-170);
    for(let i=0;i<7;i++){ const hh=live?6+Math.abs(Math.sin(t*(9+i*1.7)+i))*22:5; x.fillStyle=live?'#62e2ff':'#1d5a70'; x.fillRect(W-140+i*15,40-hh,10,hh); }
    const who=c.name.toUpperCase()+': ', on=G.sys.translator, full=on?c.english:'TRANSLATOR OFF · '+c.alien, shown=on?c.english.slice(0,Math.ceil(c.english.length*frac)):'TRANSLATOR OFF · '+heard;
    const wrap=(str,fs)=>{ x.font=`${fs}px ${FONT_MONO}`; const lh=Math.round(fs*1.17), max=W-TX-26, out=[]; let line='', y=44+fs*0.87;
      for(const w of str.split(' ')){ const tl=line?line+' '+w:w; if(line&&x.measureText(tl).width>max){ out.push([line,y]); y+=lh; line=w; } else line=tl; }
      out.push([line,y]); return out; };
    let fs=60; for(const f of [60,54,48,42]){ fs=f; const l=wrap(who+full,f); if(l[l.length-1][1]<=H-20) break; }
    const lines=wrap(who+shown,fs); let left=who.length-1;
    lines.forEach((l,i)=>{ let s=l[0], xx=TX; if(left>0){ const head=s.slice(0,left); x.fillStyle=sp.col; x.fillText(head,xx,l[1]); xx+=x.measureText(head).width; s=s.slice(left); left-=head.length+1; }
      x.fillStyle=on?'#eaf6fa':'#ffb454'; x.fillText(s+(i===lines.length-1&&frac<1&&Math.floor(t*6)%2?'▌':''),xx,l[1]); });
    S.tex.needsUpdate=true;
  },
  drawRadio(){ const S=this.screens.radio, x=S.ctx; x.fillStyle='#0a1a10'; x.fillRect(0,0,S.w,S.h); x.fillStyle='#8dff9a'; x.font=`54px ${FONT_MONO}`; x.textAlign='left'; x.textBaseline='middle'; x.fillText(`CH${G.sys.channel+1} ${CHANNELS[G.sys.channel]}`,12,34,S.w-24);
    for(let i=0;i<10;i++){ x.fillStyle=i<Math.round(G.sys.radioVol*10)?'#8dff9a':'#1c3a24'; x.fillRect(14+i*40,70,32,14); } S.tex.needsUpdate=true; },
  drawThr(){ const S=this.screens.thr, x=S.ctx, s=G.ship; x.fillStyle='#160d04'; x.fillRect(0,0,S.w,S.h); x.fillStyle='#ffb454'; x.font=`40px ${FONT_MONO}`; x.textBaseline='middle'; x.textAlign='left'; x.fillText('THR '+String(s.throttle).padStart(2,'0'),14,42);
    x.textAlign='right'; const cw=Game.canWarp(); x.fillStyle=s.warp?'#6ab8ff':cw===true?'#7dffa8':'#ff6f61'; x.fillText(s.warp?'WARP ON':cw===true?'WARP RDY':'WARP LOCK',S.w-14,42); S.tex.needsUpdate=true; },
  drawClock(t){ const S=this.screens.clock, x=S.ctx, m=Math.floor(G.playTime/60), sc=Math.floor(G.playTime%60); x.fillStyle='#0a1a10'; x.fillRect(0,0,S.w,S.h); x.fillStyle='#8dff9a'; x.font=`44px ${FONT_MONO}`; x.textAlign='center'; x.textBaseline='middle';
    x.fillText('T+'+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')+':'+String(sc).padStart(2,'0'),S.w/2,44); S.tex.needsUpdate=true; },
  drawHold(){ const S=this.screens.hold, x=S.ctx; let used=0; G.cargo.forEach(c=>used+=c.qty); x.fillStyle='#160d04'; x.fillRect(0,0,S.w,S.h); x.fillStyle='#ffb454'; x.font=`44px ${FONT_MONO}`; x.textAlign='center'; x.textBaseline='middle'; x.fillText(`HOLD ${used}/${holdCap()}`,S.w/2,44); S.tex.needsUpdate=true; },
  drawManifest(){
    const S=this.screens.manifest; if(!S) return; const x=S.ctx; x.fillStyle='#efe8d6'; x.fillRect(0,0,400,560); x.fillStyle='#222'; x.font=`700 30px ${FONT_DISP}`; x.textAlign='left'; x.textBaseline='alphabetic'; x.fillText('CARGO MANIFEST',24,50);
    x.strokeStyle='#222'; x.lineWidth=2; x.beginPath(); x.moveTo(24,62); x.lineTo(376,62); x.stroke(); x.font=`17px ${FONT_MONO}`;
    if(!G.cargo.length){ x.fillStyle='#666'; x.fillText('(nothing aboard)',24,100); }
    G.cargo.slice(0,9).forEach((c,i)=>{ const y=96+i*50; x.fillStyle='#111'; let nm=c.kind==='escort'?c.good:`${c.qty}x ${c.illegal?'Personal Effects (honest)':c.good}`; if(nm.length>34) nm=nm.slice(0,33)+'…'; x.fillText(nm,24,y); x.fillStyle='#8a1c1c'; x.fillText(`${c.kind==='ore'?'sell anywhere':'to '+PLANETS[c.to].name} — ${fmtCr(c.pay)}`,40,y+20); });
    x.fillStyle='#8a1c1c'; x.font=`italic 18px ${FONT_MONO}`; x.save(); x.translate(250,520); x.rotate(-0.12); x.fillText('do NOT shake',0,0); x.restore(); S.tex.needsUpdate=true;
  },

  /* ---------- view + interaction ---------- */
  zoomOut(){ const H=G.head; H.posT.set(0,0,0); H.yawT=0; H.pitchT=H.basePitch; H.fovT=72; H.zoomed=null; },
  zoomAt(nd){
    const H=G.head; if(H.zoomed){ this.zoomOut(); return; }
    this.ray.setFromCamera(nd,World.cockCam); const hs=this.ray.intersectObject(this.group,true); if(!hs.length) return;
    const h=hs[0], L=this.group.worldToLocal(h.point.clone());
    const aim=(d)=>{ H.yawT=Math.atan2(-d.x,-d.z); H.pitchT=Math.atan2(d.y,Math.hypot(d.x,d.z)); };
    if(h.object.userData.glass){ aim(L.clone().sub(H.pos)); H.posT.set(0,0,0); H.fovT=24; H.zoomed='glass'; return; }
    const len=L.length(); H.posT.copy(L).multiplyScalar(Math.max(0,1-0.3/len)); aim(L); H.fovT=46; H.zoomed='panel'; H.zoomPt=L.clone();
  },
  pick(nd){ this.ray.setFromCamera(nd,World.cockCam); const hs=this.ray.intersectObjects(this.hits,false); return hs.length?hs[0].object.userData.ctrl:null; },
  stepCtrl(c, dir){
    if(c.type==='knob'||c.type==='lever'){ let v=c.get(); if(c.step){ v+=dir*c.step; if(c.wrap) v=(v+c.max+1)%(c.max+1); else v=clamp(v,c.min,c.max); } else v=clamp(v+dir*(c.max-c.min)*0.1,c.min,c.max); if(v!==c.get()){ c.set(v); Sfx.click(); } }
  },
  bindInput(cv){
    const tip=$('tooltip');
    const nd=e=>{ const r=cv.getBoundingClientRect(); return new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1); };
    const showTip=(c,e)=>{ if(!c){ tip.hidden=true; cv.style.cursor=this.drag&&this.drag.look?'grabbing':'default'; return; } const v=c.get?c.get():null; tip.innerHTML=c.label+(c.fmt&&v!==null?' <b>'+c.fmt(v)+'</b>':c.type==='switch'&&v!==null?' <b>'+(v?'ON':'OFF')+'</b>':c.tip?' <b>'+c.tip+'</b>':'');
      tip.hidden=false; const r=cv.getBoundingClientRect(); tip.style.left=Math.min(e.clientX-r.left+16,r.width-tip.offsetWidth-8)+'px'; tip.style.top=(e.clientY-r.top+18)+'px'; cv.style.cursor='pointer'; };
    cv.addEventListener('pointerdown',e=>{ this.lastType=e.pointerType; if(G.mode!=='flight'||e.button!==0) return; Sfx.init(); cv.focus(); const c=Walk.on?null:this.pick(nd(e));
      this.drag=c?{c,x:e.clientX,y:e.clientY,moved:0,acc:0,start:c.get?c.get():0}:{look:true,x:e.clientX,y:e.clientY,moved:0}; if(c&&c.type==='button'){ c.down=1.4; } try{ cv.setPointerCapture(e.pointerId); }catch(_){} });
    cv.addEventListener('pointermove',e=>{ if(G.mode!=='flight'){ tip.hidden=true; return; } const d=this.drag;
      if(!d){ if(Walk.on){ tip.hidden=true; return; } const c=this.pick(nd(e)); this.hover=c; showTip(c,e); return; }
      const dx=e.clientX-d.x, dy=e.clientY-d.y; d.x=e.clientX; d.y=e.clientY; d.moved+=Math.abs(dx)+Math.abs(dy);
      if(d.look&&Walk.on){ Walk.look(dx,dy); return; }
      if(d.look){ const H=G.head, k=0.0032*(H.fov/72); H.yawT=clamp(H.yawT-dx*k,-2.5,2.5); H.pitchT=clamp(H.pitchT-dy*k,-1.25,1.3); cv.style.cursor='grabbing'; return; }
      const c=d.c; if(c.type==='knob'||c.type==='lever'){ const delta=c.type==='lever'?-dy:(dx-dy);
        if(c.step){ d.acc+=delta; const stepPx=c.type==='lever'?14:24; while(Math.abs(d.acc)>=stepPx){ const dir=Math.sign(d.acc); d.acc-=dir*stepPx; this.stepCtrl(c,dir); } }
        else c.set(clamp(c.get()+delta/170*(c.max-c.min),c.min,c.max)); showTip(c,e); } });
    const up=e=>{ const d=this.drag; this.drag=null; if(!d||G.mode!=='flight') return; cv.style.cursor='default'; const touch=e.pointerType==='touch', tap=d.moved<(touch?12:5);
      if(touch){ clearTimeout(this.tipT); this.tipT=setTimeout(()=>{ tip.hidden=true; },1600);
        // finger double-tap on open space or a panel face leans in (or back out); taps on controls just work the control
        if(!d.c&&tap&&!Walk.on){ const now=performance.now(), L=this.lastTap; if(L&&now-L.t<380&&Math.hypot(e.clientX-L.x,e.clientY-L.y)<60){ this.lastTap=null; this.zoomAt(nd(e)); } else this.lastTap={t:now,x:e.clientX,y:e.clientY}; } }
      if(d.c&&tap){ const c=d.c; if(c.type==='switch'){ c.set(!c.get()); Sfx.clunk(); } else if(c.type==='button'){ Sfx.click(); c.press(); } else if(c.step) this.stepCtrl(c,e.shiftKey?-1:1); showTip(c,e); } };
    cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',()=>{ this.drag=null; });
    cv.addEventListener('wheel',e=>{ if(G.mode!=='flight') return; const c=this.pick(nd(e)); if(c){ e.preventDefault(); this.stepCtrl(c,e.deltaY<0?1:-1); showTip(c,e); } },{passive:false});
    cv.addEventListener('dblclick',e=>{ if(G.mode!=='flight'||this.lastType==='touch'||Walk.on) return; this.zoomAt(nd(e)); });
    cv.addEventListener('pointerleave',()=>{ tip.hidden=true; });
  },
};
