/* ===================== SYSTEM MAP ===================== */
/* Top-down chart of the system. M toggles it in flight and in port; click a world to set the destination. */
const SysMap = {
  open:false, f:0, hover:-1, pts:[], listT:0, maxR:0, zoom:1, ox:0, oz:0, base:1,
  toggle(){ if(this.open) this.close(); else this.show(); },
  show(){
    if(this.open) return; this.open=true; this.hover=-1; this.f=0; this.listT=0.5;
    if(!this.maxR){ PLANETS.forEach(P=>{ if(!P.station) this.maxR=Math.max(this.maxR,this.rad(P.orbit)); }); this.maxR*=1.06; }
    // out in deep space (or docked at a station) the chart opens zoomed out far enough to show where you are
    const far=this.rad(Math.hypot(G.ship.pos.x,G.ship.pos.z)); if(far>this.maxR*0.92){ this.zoom=clamp(this.maxR*0.92/far,this.MINZ,1); this.ox=0; this.oz=0; } else if(this.zoom<1){ this.zoom=1; this.ox=0; this.oz=0; }
    $('map').hidden=false; $('tooltip').hidden=true; if(Sfx.ok()) Sfx.beep(760); this.list(); this.draw(Game.time);
  },
  close(){ if(!this.open) return; this.open=false; $('map').hidden=true; if(Sfx.ok()) Sfx.click(); const g=$('gl'); if(g) g.focus(); },
  pick(i){ if(i>=100){ const F=FIELDS[i-100]; if(F){ Nav.set({name:F.name.toUpperCase(),sub:'Asteroid field · '+F.ore,pos:F.pos.clone(),dropR:F.R*2.6,arriveR:F.R*1.2,kind:'field',field:F.idx}); this.list(); this.draw(Game.time); } return; }
    if(i<0||i>=PLANETS.length) return; Game.setTarget(i); this.list(); this.draw(Game.time); },
  /* the chart is to scale out to the edge of patrolled space, then squeezed, so the far stations fit without
     crushing the planets into the middle */
  KNEE:1300000, SQ:0.3, MINZ:0.5,
  rad(r){ return r<=this.KNEE?r:this.KNEE+(r-this.KNEE)*this.SQ; },
  mp(p){ const d=Math.hypot(p.x,p.z); if(d<1) return {x:0,z:0}; const f=this.rad(d)/d; return {x:p.x*f,z:p.z*f}; },
  colors(P){ const p=P.pal; if(P.type==='gas') return [p.a,p.b,p.d]; if(P.lava>0.2) return [p.shal,p.deep,p.a]; if(P.sea>0.4) return [p.shal,p.deep,p.b]; return [p.d||p.a,p.a,p.c]; },
  cargoFor(i){ let n=0; G.cargo.forEach(c=>{ if(c.to===i) n+=c.qty; }); return n; },
  dist(P){ return Math.max(0,P.pos.distanceTo(G.ship.pos)-(P.r||0)); },
  eta(d){ const s=d/SHIPS[G.shipId].warp; return s<90?'≈ '+Math.max(1,Math.round(s))+' s at warp':'≈ '+(s/60).toFixed(1)+' min at warp'; },

  /* a little station: a ring around a hub, with solar wings and a blinking light */
  stationIcon(x, px, py, rad, P, t){ x.strokeStyle='#04060b'; x.lineWidth=5; x.beginPath(); x.moveTo(px-rad*1.9,py); x.lineTo(px+rad*1.9,py); x.stroke();
    x.strokeStyle=P.pal.b; x.lineWidth=2; x.beginPath(); x.moveTo(px-rad*1.9,py); x.lineTo(px+rad*1.9,py); x.stroke();
    x.fillStyle='#2a4a8a'; for(const s of [-1,1]) x.fillRect(px+s*rad*1.25-rad*0.4,py-rad*0.5,rad*0.8,rad);
    x.strokeStyle=P.pal.a; x.lineWidth=3; x.beginPath(); x.arc(px,py,rad*0.85,0,Math.PI*2); x.stroke(); x.fillStyle=P.pal.a; x.beginPath(); x.arc(px,py,rad*0.35,0,Math.PI*2); x.fill();
    if((t*1.5)%1<0.5){ x.fillStyle=P.light; x.beginPath(); x.arc(px,py-rad*0.85,2.5,0,Math.PI*2); x.fill(); } x.lineWidth=1; },
  bind(){
    const cv=$('map-cv');
    const at=e=>{ const r=cv.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top; let best=-1, bd=1e9; this.pts.forEach(p=>{ const d=Math.hypot(p.x-mx,p.y-my); if(d<Math.max(p.r+12,20)&&d<bd){ bd=d; best=p.i; } }); return best; };
    cv.addEventListener('pointermove',e=>{ const h=at(e); if(h!==this.hover){ this.hover=h; cv.style.cursor=h>=0?'pointer':'default'; this.draw(Game.time); } });
    cv.addEventListener('pointerleave',()=>{ if(this.hover!==-1){ this.hover=-1; this.draw(Game.time); } });
    cv.addEventListener('click',e=>{ if(this.dragged){ this.dragged=false; return; } const h=at(e); if(h>=0) this.pick(h); });
    $('map-list').addEventListener('click',e=>{ const b=e.target.closest('[data-i]'); if(b) this.pick(+b.dataset.i); });
    $('map-close').onclick=()=>this.close();
    /* zoom: mouse wheel (toward the pointer), pinch on a touch screen; drag to pan; double-click to reset */
    const zoomAt=(f,mx,my)=>{ const r=cv.getBoundingClientRect(), w=r.width, h=r.height, k0=this.base*this.zoom, wx=this.ox+(mx-w/2)/k0, wz=this.oz+(my-h/2)/k0;
      this.zoom=clamp(this.zoom*f,this.MINZ,14); const k1=this.base*this.zoom; this.ox=wx-(mx-w/2)/k1; this.oz=wz-(my-h/2)/k1; if(this.zoom<=1.001){ this.ox=0; this.oz=0; } this.draw(Game.time); };
    cv.addEventListener('wheel',e=>{ if(!this.open) return; e.preventDefault(); const r=cv.getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY*(e.deltaMode===1?0.05:0.0016)),e.clientX-r.left,e.clientY-r.top); },{passive:false});
    const ptrs=new Map(); let drag=null, pinch=null;
    cv.addEventListener('pointerdown',e=>{ ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); try{ cv.setPointerCapture(e.pointerId); }catch(_){}
      if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y)}; drag=null; } else drag={x:e.clientX,y:e.clientY,moved:0}; });
    cv.addEventListener('pointermove',e=>{ if(!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pinch&&ptrs.size===2){ const [a,b]=[...ptrs.values()], d=Math.hypot(a.x-b.x,a.y-b.y), r=cv.getBoundingClientRect(); if(pinch.d>10) zoomAt(d/pinch.d,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top); pinch.d=d; return; }
      if(drag){ const dx=e.clientX-drag.x, dy=e.clientY-drag.y; drag.x=e.clientX; drag.y=e.clientY; drag.moved+=Math.abs(dx)+Math.abs(dy); if(this.zoom>1&&drag.moved>6){ const k=this.base*this.zoom; this.ox-=dx/k; this.oz-=dy/k; cv.style.cursor='grabbing'; this.draw(Game.time); } } });
    const up=e=>{ ptrs.delete(e.pointerId); if(ptrs.size<2) pinch=null; if(!ptrs.size){ this.dragged=drag&&drag.moved>6; drag=null; cv.style.cursor='default'; } };
    cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
    cv.addEventListener('dblclick',()=>{ this.zoom=1; this.ox=0; this.oz=0; this.draw(Game.time); });
  },

  update(dt,t){
    if(!this.open) return;
    if(G.mode!=='flight'&&G.mode!=='port'){ this.close(); return; }
    if((this.f++%2)===0) this.draw(t);
    this.listT-=dt; if(this.listT<=0){ this.listT=0.5; this.list(); }
  },

  list(){
    const T=Nav.target(), docked=G.mode==='port'&&G.docked>=0, dT=this.dist(T);
    $('map-sub').innerHTML=`Destination <b>${esc(T.name)}</b> · ${docked&&G.docked===T.idx?'docked here':fmtDist(dT)+' · '+this.eta(dT)}`;
    const rows=PLANETS.slice().sort((a,b)=>a.orbit-b.orbit).map(P=>{
      const here=docked&&G.docked===P.idx, n=this.cargoFor(P.idx), col=this.colors(P);
      let tags=''; if(P.idx===G.target&&!Nav.wp) tags+='<em class="t">Destination</em>'; if(n) tags+=`<em class="c">${n} crate${n===1?'':'s'} to deliver</em>`; if(G.hot===P.idx) tags+='<em class="h">Paying +50%</em>'; if(here) tags+='<em>Docked</em>';
      return `<button class="mrow${P.idx===G.target&&!Nav.wp?' tg':''}" data-i="${P.idx}"><i style="background:radial-gradient(circle at 35% 35%,${col[0]},${col[1]} 60%,${col[2]})${P.station?';border-radius:30%':''}"></i><span class="n">${esc(P.name)}</span><span class="d">${here?'—':fmtDist(this.dist(P))}</span><span class="p">${esc(P.port)} · ${P.station?'research station · <b class="risk r'+P.risk+'">'+RISK[P.risk].name+' risk</b>':esc(SPECIES[P.species].name)}</span>${tags?'<span class="b">'+tags+'</span>':''}</button>`;
    });
    FIELDS.forEach(F=>{ const tg=Nav.wp&&Nav.wp.kind==='field'&&Nav.wp.field===F.idx; rows.push(`<button class="mrow${tg?' tg':''}" data-i="${100+F.idx}"><i style="background:radial-gradient(circle at 35% 35%,#e8dcc8,${F.col} 60%,#3a3040);border-radius:30%"></i><span class="n">${esc(F.name)}</span><span class="d">${fmtDist(Math.max(0,F.pos.distanceTo(G.ship.pos)-F.R))}</span><span class="p">Asteroid field · ${esc(F.ore)}</span>${tg?'<span class="b"><em class="t">Waypoint</em></span>':''}</button>`); });
    $('map-list').innerHTML=rows.join('');
    const nT=G.mode==='flight'?Npc.list.length:0;
    $('map-foot').textContent=(G.mode==='port'?'Docked at '+PLANETS[G.docked>=0?G.docked:G.target].port:nT+' ship'+(nT===1?'':'s')+' on local scan')+(TouchUI.on?' · Tap a world or field to set your course · pinch to zoom, drag to pan':' · Click a world or field to set your course · scroll to zoom (out for deep space), drag to pan, double-click to reset · M or Esc to close');
  },

  draw(t){
    const cv=$('map-cv'), box=cv.parentNode, w=box.clientWidth, h=box.clientHeight; if(w<20||h<20) return;
    const dpr=Math.min(window.devicePixelRatio||1,2), W=Math.round(w*dpr), Hh=Math.round(h*dpr); if(cv.width!==W||cv.height!==Hh){ cv.width=W; cv.height=Hh; }
    const x=cv.getContext('2d'); x.setTransform(dpr,0,0,dpr,0,0); x.clearRect(0,0,w,h);
    const R=Math.max(70,Math.min(w,h)/2-44); this.base=R/this.maxR; const k=this.base*this.zoom, cx=w/2-this.ox*k, cy=h/2-this.oz*k, TAU=Math.PI*2;
    const s=G.ship, docked=G.mode==='port'&&G.docked>=0, T=Nav.target();
    x.lineWidth=1; x.textBaseline='middle';

    // range rings, one per light-second
    x.font=`20px ${FONT_MONO}`; x.textAlign='center';
    for(let ls=1; this.rad(ls*LS)<=this.maxR/this.zoom*1.3; ls++){ const r=this.rad(ls*LS)*k; if(ls*LS>this.KNEE&&ls%2) continue; x.setLineDash([2,6]); x.strokeStyle='rgba(98,226,255,.16)'; x.beginPath(); x.arc(cx,cy,r,0,TAU); x.stroke(); x.setLineDash([]);
      x.fillStyle='rgba(134,162,174,.7)'; x.fillText(ls+' LS',cx,cy-r-13); }
    // orbits
    PLANETS.forEach(P=>{ if(P.station) return; x.strokeStyle=P.idx===G.target?'rgba(255,180,84,.28)':'rgba(220,237,243,.09)'; x.beginPath(); x.arc(cx,cy,this.rad(P.orbit)*k,0,TAU); x.stroke(); });
    // where the patrols stop: beyond this line is deep space, tinted red, and redder again in the far dark
    for(const [R,lab,col] of [[DEEP_R,'END OF PATROLLED SPACE','255,140,70'],[EXTREME_R,'THE FAR DARK','255,90,90']]){ const r=this.rad(R)*k; x.strokeStyle=`rgba(${col},.55)`; x.lineWidth=2; x.setLineDash([10,8]); x.beginPath(); x.arc(cx,cy,r,0,TAU); x.stroke(); x.setLineDash([]); x.lineWidth=1;
      x.fillStyle=`rgba(${col},.05)`; x.beginPath(); x.arc(cx,cy,r+Math.max(w,h)*3,0,TAU); x.arc(cx,cy,r,0,TAU,true); x.fill(); }
    // sun
    const sr=Math.max(9,SUN_R*k*4); let g=x.createRadialGradient(cx,cy,0,cx,cy,sr*3.2); g.addColorStop(0,'rgba(255,246,216,1)'); g.addColorStop(0.22,'rgba(255,214,130,.9)'); g.addColorStop(0.45,'rgba(255,160,60,.28)'); g.addColorStop(1,'rgba(255,140,40,0)');
    x.fillStyle=g; x.beginPath(); x.arc(cx,cy,sr*3.2,0,TAU); x.fill();

    // ship position on the chart
    /* places past the edge of the chart (the stations, the far field) are pinned to its rim with an arrow pointing the way */
    const at=(p,far)=>{ const m=this.mp(p), X=cx+m.x*k, Y=cy+m.z*k, l=30, r=w-30, tp=44, bt=h-34; if(!far||(X>=l&&X<=r&&Y>=tp&&Y<=bt)) return [X,Y,false];
      const dx=X-w/2, dy=Y-h/2; let q=1; if(Math.abs(dx)>1e-6) q=Math.min(q,(dx>0?r-w/2:w/2-l)/Math.abs(dx)); if(Math.abs(dy)>1e-6) q=Math.min(q,(dy>0?bt-h/2:h/2-tp)/Math.abs(dy)); return [w/2+dx*q,h/2+dy*q,true]; };
    const farP=P=>P.station, farF=F=>F.orbit>this.KNEE, arrow=(X,Y)=>{ const a=Math.atan2(Y-h/2,X-w/2); x.save(); x.translate(X,Y); x.rotate(a); x.fillStyle='#ffb454'; x.strokeStyle='#04060b'; x.lineWidth=2; x.beginPath(); x.moveTo(26,0); x.lineTo(15,-8); x.lineTo(15,8); x.closePath(); x.stroke(); x.fill(); x.restore(); };
    const [sx,sy]=at(s.pos,true);
    const boxes=PLANETS.map(P=>{ const [ax,ay]=at(P.pos,farP(P)); return [ax-13,ay-13,ax+13,ay+13]; }); boxes.push([sx-16,sy-16,sx+16,sy+44]);
    /* label placement: the first candidate spot that is on screen and clear; failing that, the one that overlaps least */
    const place=(cands,lw,hh,dx,dy)=>{ let best=null, bs=1e18; for(const [ax,ay] of cands){ if(ax<6||ax+lw>w-6||ay<34||ay>h-34) continue; let o=0;
        for(const b of boxes){ const ox=Math.min(ax+lw+8,b[2])-Math.max(ax-8,b[0]), oy=Math.min(ay+hh,b[3])-Math.max(ay-hh,b[1]); if(ox>0&&oy>0) o+=ox*oy; }
        if(o===0) return [ax,ay]; if(o<bs){ bs=o; best=[ax,ay]; } } return best||[dx,dy]; };
    // zone names sit on their rings, low on the right, and the world labels steer around them
    x.font=`20px ${FONT_MONO}`; x.textAlign='center';
    for(const [R,lab,col,a] of [[DEEP_R,'END OF PATROLLED SPACE','255,150,80',0.78],[EXTREME_R,'THE FAR DARK','255,100,100',0.22]]){ const r=this.rad(R)*k, lx=cx+Math.cos(a)*r, ly=cy+Math.sin(a)*r, tw=x.measureText(lab).width+12;
      if(lx-tw/2<4||lx+tw/2>w-4||ly<20||ly>h-14) continue; x.fillStyle='rgba(4,6,11,.8)'; x.fillRect(lx-tw/2,ly-13,tw,26); x.fillStyle=`rgba(${col},.95)`; x.fillText(lab,lx,ly+1); boxes.push([lx-tw/2,ly-13,lx+tw/2,ly+13]); }
    // course line to the destination
    const [tx,ty]=at(T.pos,T.station||T.isWp||(T.isField&&T.orbit>this.KNEE)), cl=Math.hypot(tx-sx,ty-sy);
    if(cl>16){ x.strokeStyle='rgba(255,180,84,.75)'; x.setLineDash([7,6]); x.lineDashOffset=-t*18; x.beginPath(); x.moveTo(sx,sy); x.lineTo(tx,ty); x.stroke(); x.setLineDash([]); x.lineDashOffset=0;
      if(cl>90){ const mx=(sx+tx)/2, my=(sy+ty)/2, lab=fmtDist(this.dist(T)); x.font=`22px ${FONT_MONO}`; const tw=x.measureText(lab).width+18; x.fillStyle='rgba(4,6,11,.85)'; x.fillRect(mx-tw/2,my-16,tw,32); boxes.push([mx-tw/2,my-16,mx+tw/2,my+16]); x.fillStyle='#ffb454'; x.textAlign='center'; x.fillText(lab,mx,my+1); } }

    // asteroid fields: their icons are kept clear here, their labels are drawn after the worlds
    this.pts.length=0;
    FIELDS.forEach(F=>{ const [fx,fy]=at(F.pos,farF(F)); boxes.push([fx-16,fy-16,fx+16,fy+16]); });
    // worlds (the stations first, so the ones pinned to the rim get their label space before the crowd in the middle)
    PLANETS.slice().sort((a,b)=>(b.station?1:0)-(a.station?1:0)).forEach(P=>{
      const [px,py,pinned]=at(P.pos,farP(P)); if(pinned) arrow(px,py); const rad=P.station?9:clamp(3.5+P.r/850,6,13), col=this.colors(P), tg=P.idx===G.target, hv=P.idx===this.hover;
      const ux=(px-cx)/(Math.hypot(px-cx,py-cy)||1), uy=(py-cy)/(Math.hypot(px-cx,py-cy)||1);
      this.pts.push({i:P.idx,x:px,y:py,r:rad});
      if(P.ring){ x.strokeStyle='rgba(240,220,180,.75)'; x.lineWidth=2; x.beginPath(); x.ellipse(px,py,rad*1.9,rad*0.62,-0.4,0,TAU); x.stroke(); x.lineWidth=1; }
      if(P.station) this.stationIcon(x,px,py,rad,P,t);
      else { g=x.createRadialGradient(px-ux*rad*0.45,py-uy*rad*0.45,rad*0.1,px,py,rad); g.addColorStop(0,col[0]); g.addColorStop(0.6,col[1]); g.addColorStop(1,col[2]);
      x.fillStyle=g; x.beginPath(); x.arc(px,py,rad,0,TAU); x.fill();
      x.strokeStyle=P.pal.atm; x.globalAlpha=0.7; x.beginPath(); x.arc(px,py,rad+1.5,0,TAU); x.stroke(); x.globalAlpha=1; }
      if(P.ring){ x.strokeStyle='rgba(240,220,180,.9)'; x.lineWidth=2; x.beginPath(); x.ellipse(px,py,rad*1.9,rad*0.62,-0.4,0.15,Math.PI-0.15); x.stroke(); x.lineWidth=1; }
      if(hv&&!tg){ x.strokeStyle='rgba(220,237,243,.9)'; x.beginPath(); x.arc(px,py,rad+7,0,TAU); x.stroke(); }
      if(tg){ const rr=rad+8+Math.sin(t*3)*1.2; x.strokeStyle='#ffb454'; x.lineWidth=1.5; x.beginPath(); x.arc(px,py,rr,0,TAU); x.stroke();
        for(let q=0;q<4;q++){ const a=t*0.6+q*Math.PI/2; x.beginPath(); x.moveTo(px+Math.cos(a)*(rr+2),py+Math.sin(a)*(rr+2)); x.lineTo(px+Math.cos(a)*(rr+8),py+Math.sin(a)*(rr+8)); x.stroke(); } x.lineWidth=1; }
      // label: name, port, badges
      const n=this.cargoFor(P.idx), hot=G.hot===P.idx, name=P.name.toUpperCase(), sub=P.station?`STATION · ${RISK[P.risk].name.toUpperCase()} RISK`:P.port.toUpperCase(); let badge=''; if(n) badge+='  ▣ '+n; if(hot) badge+='  +50%';
      x.font=`600 26px ${FONT_DISP}`; const nw=x.measureText(name).width; x.font=`22px ${FONT_MONO}`; const bw=badge?x.measureText(badge).width:0; x.font=`20px ${FONT_MONO}`; const pw=x.measureText(sub).width;
      const lw=Math.max(nw+bw,pw), off=rad+(tg?20:12); let lx=px+off+lw>w-6?px-off-lw:px+off, ly=py; x.textAlign='left';
      // keep labels off each other: try right, left, below, above
      const cands=[[px+off,py],[px-off-lw,py],[px-lw/2,py+off+30],[px-lw/2,py-off-30],[px+off,py+off+28],[px-off-lw,py-off-28],[px+off,py-off-28],[px-off-lw,py+off+28]];
      if(pinned){ const ix=w/2-px, iy=h/2-py, il=Math.hypot(ix,iy)||1; for(const d of [70,130,190]) cands.push([px+ix/il*d-lw/2,py+iy/il*d]); }
      [lx,ly]=place(cands,lw,30,lx,ly);
      boxes.push([lx-6,ly-28,lx+lw+6,ly+28]);
      x.fillStyle='rgba(4,6,11,.66)'; x.fillRect(lx-6,ly-28,lw+12,56);
      x.font=`600 26px ${FONT_DISP}`; x.fillStyle=tg?'#ffb454':hv?'#ffffff':'#dcedf3'; x.fillText(name,lx,ly-11);
      if(badge){ x.font=`22px ${FONT_MONO}`; let bx=lx+nw; if(n){ const s1='  ▣ '+n; x.fillStyle='#7dffa8'; x.fillText(s1,bx,ly-11); bx+=x.measureText(s1).width; } if(hot){ x.fillStyle='#ffb454'; x.fillText('  +50%',bx,ly-11); } }
      x.font=`20px ${FONT_MONO}`; x.fillStyle=P.station?RISK[P.risk].col:'rgba(134,162,174,.95)'; x.fillText(sub,lx,ly+15);
    });

    // asteroid fields: their labels give way to the worlds'
    FIELDS.forEach(F=>{ const [fx,fy,pf]=at(F.pos,farF(F)); if(pf) arrow(fx,fy); const rr=mulberry32(F.idx*31+7), tg=Nav.wp&&Nav.wp.kind==='field'&&Nav.wp.field===F.idx, hv=this.hover===100+F.idx;
      x.fillStyle=F.col; for(let q=0;q<9;q++){ const a=rr()*TAU, d=rr()*13; x.beginPath(); x.arc(fx+Math.cos(a)*d,fy+Math.sin(a)*d,2+rr()*3,0,TAU); x.fill(); }
      if(tg||hv){ x.strokeStyle=tg?'#ffb454':'#dcedf3'; x.lineWidth=1.5; x.beginPath(); x.arc(fx,fy,22,0,TAU); x.stroke(); x.lineWidth=1; }
      const nm=F.name.toUpperCase(), ore=F.ore.toUpperCase(); x.font=`600 22px ${FONT_DISP}`; const nw=x.measureText(nm).width; x.font=`18px ${FONT_MONO}`; const lw=Math.max(nw,x.measureText(ore).width);
      let lx=fx+26, ly=fy;
      [lx,ly]=place([[fx+26,fy],[fx-26-lw,fy],[fx-lw/2,fy+50],[fx-lw/2,fy-50],[fx+26,fy+52],[fx-26-lw,fy-52]],lw,28,lx,ly);
      boxes.push([lx-6,ly-26,lx+lw+6,ly+26]);
      x.textAlign='left'; x.fillStyle='rgba(4,6,11,.66)'; x.fillRect(lx-6,ly-26,lw+12,52); x.font=`600 22px ${FONT_DISP}`; x.fillStyle=tg?'#ffb454':'#c9bce8'; x.fillText(nm,lx,ly-10); x.font=`18px ${FONT_MONO}`; x.fillStyle='rgba(134,162,174,.95)'; x.fillText(ore,lx,ly+13);
      this.pts.push({i:100+F.idx,x:fx,y:fy,r:16}); });
    // distress beacon
    if(Nav.wp&&(Nav.wp.kind==='distress'||Nav.wp.kind==='salvage')){ const [bx,by]=at(Nav.wp.pos,true); x.strokeStyle='#ff6f61'; x.lineWidth=2; x.beginPath(); x.moveTo(bx,by-10); x.lineTo(bx+10,by); x.lineTo(bx,by+10); x.lineTo(bx-10,by); x.closePath(); x.stroke(); x.lineWidth=1; }
    // you
    const pulse=(t*0.9)%1; x.strokeStyle=`rgba(98,226,255,${0.6*(1-pulse)})`; x.beginPath(); x.arc(sx,sy,6+pulse*16,0,TAU); x.stroke();
    if(docked){ x.strokeStyle='#62e2ff'; x.lineWidth=1.5; x.beginPath(); x.arc(sx,sy,4,0,TAU); x.stroke(); x.lineWidth=1; }
    else { const f=new V3(0,0,-1).applyQuaternion(s.quat), a=Math.atan2(f.z,f.x); x.save(); x.translate(sx,sy); x.rotate(a); x.fillStyle='#62e2ff'; x.strokeStyle='#04060b'; x.beginPath(); x.moveTo(10,0); x.lineTo(-6,6); x.lineTo(-3,0); x.lineTo(-6,-6); x.closePath(); x.fill(); x.stroke(); x.restore(); }
    x.font=`20px ${FONT_MONO}`; x.textAlign='center'; const yl=docked?'DOCKED':s.warpF>0.3?'YOU · WARP':'YOU'; const yw=x.measureText(yl).width+14, yy=sy+(sy>h-50?-30:30);
    x.fillStyle='rgba(4,6,11,.7)'; x.fillRect(sx-yw/2,yy-14,yw,28); x.fillStyle='#62e2ff'; x.fillText(yl,sx,yy+1);
  },
};
