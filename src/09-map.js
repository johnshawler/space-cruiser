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
  pick(i){ if(i===RESTAURANT.idx){ Restaurant.course(); this.list(); this.draw(Game.time); return; }
    if(i>=100){ const F=FIELDS[i-100]; if(F){ Nav.set({name:F.name.toUpperCase(),sub:'Asteroid field · '+F.ore,pos:F.pos.clone(),dropR:F.R*2.6,arriveR:F.R*1.2,kind:'field',field:F.idx}); this.list(); this.draw(Game.time); } return; }
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
    $('map-list').addEventListener('click',e=>{ const s=e.target.closest('[data-s]'); if(s){ const i=+s.dataset.s; if(this.shopsOpen.has(i)) this.shopsOpen.delete(i); else this.shopsOpen.add(i); if(Sfx.ok()) Sfx.click(); this.list(); return; } const b=e.target.closest('[data-i]'); if(b) this.pick(+b.dataset.i); });
    $('map-close').onclick=()=>this.close();
    const sb=$('map-search'); sb.addEventListener('input',()=>this.list());
    sb.addEventListener('keydown',e=>{ e.stopPropagation();
      if(e.key==='Enter'&&this.first!=null){ this.pick(this.first); e.preventDefault(); }
      else if(e.key==='Escape'){ if(sb.value){ sb.value=''; this.list(); } else { sb.blur(); this.close(); } e.preventDefault(); } });
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

  /* under each world you have landed on: a button that opens the list of shops at its port */
  shopsOpen:new Set(),
  shops(P){ if(!(G.seen||[]).includes(P.idx)) return '<div class="mshops none">Shops unknown · land here to find out</div>';
    const open=this.shopsOpen.has(P.idx), kinds=Venues.defs(P).map(d=>VENUE_TABS[d.k]);
    return `<div class="mshops"><button class="mshop" data-s="${P.idx}" aria-expanded="${open}">${open?'Hide shops':'Show shops'} <b>${kinds.length}</b></button>${open?'<span class="mshop-list">'+kinds.map(k=>'<em>'+esc(k)+'</em>').join('')+'</span>':''}</div>`; },
  list(){
    const T=Nav.target(), docked=G.mode==='port'&&G.docked>=0, dT=this.dist(T);
    $('map-sub').innerHTML=`Destination <b>${esc(T.name)}</b> · ${docked&&G.docked===T.idx?'docked here':fmtDist(dT)+' · '+this.eta(dT)}`;
    const rows=PLANETS.slice().sort((a,b)=>a.orbit-b.orbit).map(P=>{
      const here=docked&&G.docked===P.idx, n=this.cargoFor(P.idx), col=this.colors(P);
      let tags=''; if(P.idx===G.target&&!Nav.wp) tags+='<em class="t">Destination</em>'; if(n) tags+=`<em class="c">${n} crate${n===1?'':'s'} to deliver</em>`; if(G.hot===P.idx) tags+='<em class="h">Rush order: paying +50%</em>'; { const st=Situ.at(P.idx); if(st) tags+=`<em class="h">${esc(Situ.label({s:st}))}</em>`; } if(here) tags+='<em>Docked</em>';
      return `<button class="mrow${P.idx===G.target&&!Nav.wp?' tg':''}" data-i="${P.idx}"><i style="background:radial-gradient(circle at 35% 35%,${col[0]},${col[1]} 60%,${col[2]})${P.station?';border-radius:30%':''}"></i><span class="n">${esc(P.name)}</span><span class="d">${here?'—':fmtDist(this.dist(P))}</span><span class="p">${esc(P.port)} · ${P.station?'research station · <b class="risk r'+P.risk+'">'+RISK[P.risk].name+' risk</b>':esc(SPECIES[P.species].name)}</span>${tags?'<span class="b">'+tags+'</span>':''}</button>${this.shops(P)}`;
    });
    FIELDS.forEach(F=>{ const tg=Nav.wp&&Nav.wp.kind==='field'&&Nav.wp.field===F.idx; rows.push(`<button class="mrow${tg?' tg':''}" data-i="${100+F.idx}"><i style="background:radial-gradient(circle at 35% 35%,#e8dcc8,${F.col} 60%,#3a3040);border-radius:30%"></i><span class="n">${esc(F.name)}</span><span class="d">${fmtDist(Math.max(0,F.pos.distanceTo(G.ship.pos)-F.R))}</span><span class="p">Asteroid field · ${esc(F.ore)}</span>${tg?'<span class="b"><em class="t">Waypoint</em></span>':''}</button>`); });
    { const R=RESTAURANT, ok=Restaurant.canReach(), tg=Nav.wp&&Nav.wp.kind==='restaurant';   // the last place on the chart
      let tags=tg?'<em class="t">Destination</em>':''; tags+=ok?'<em class="c">In range of this ship</em>':`<em class="h">${esc(SHIPS[Restaurant.top()].name)} only</em>`; if(G.won) tags+='<em>Table kept for you</em>';
      rows.push(`<button class="mrow${tg?' tg':''}" data-i="${R.idx}"><i style="background:radial-gradient(circle at 35% 35%,#fff1c8,#ffb454 55%,#3a2a12);border-radius:50% 50% 20% 20%"></i><span class="n">${esc(R.short)}</span><span class="d">${fmtDist(Restaurant.dist())}</span><span class="p">At the end of the galaxy · ${esc(R.port)} · ${ok?'a long way, but you have the fuel':'further than this ship can fly on a full tank'}</span><span class="b">${tags}</span></button>`); }
    // the search box keeps the rows whose name, port, kind or tags match every word typed (Enter flies to the first)
    const q=($('map-search').value||'').toLowerCase().split(/\s+/).filter(Boolean), txt=r=>r.replace(/<[^>]*>/g,' ').toLowerCase();
    const shown=q.length?rows.filter(r=>{ const t=txt(r); return q.every(w=>t.includes(w)); }):rows; this.first=shown.length?+shown[0].match(/data-i="(\d+)"/)[1]:null;
    $('map-list').innerHTML=shown.length?shown.join(''):'<div class="none">Nothing out here by that name.</div>';
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

    // range rings, one per light-second (their numbers are labels too, placed last, only where there's room)
    const rings=[];
    for(let ls=1; this.rad(ls*LS)<=this.maxR/this.zoom*1.3; ls++){ const r=this.rad(ls*LS)*k; if(ls*LS>this.KNEE&&ls%2) continue; x.setLineDash([2,6]); x.strokeStyle='rgba(98,226,255,.16)'; x.beginPath(); x.arc(cx,cy,r,0,TAU); x.stroke(); x.setLineDash([]); rings.push([ls,r]); }
    // orbits
    PLANETS.forEach(P=>{ if(P.station) return; x.strokeStyle=P.idx===G.target?'rgba(255,180,84,.28)':'rgba(220,237,243,.09)'; x.beginPath(); x.arc(cx,cy,this.rad(P.orbit)*k,0,TAU); x.stroke(); });
    // where the patrols stop: beyond this line is deep space, tinted red, and redder again in the far dark
    for(const [R,lab,col] of [[DEEP_R,'END OF PATROLLED SPACE','255,140,70'],[EXTREME_R,'THE FAR DARK','255,90,90']]){ const r=this.rad(R)*k; x.strokeStyle=`rgba(${col},.55)`; x.lineWidth=2; x.setLineDash([10,8]); x.beginPath(); x.arc(cx,cy,r,0,TAU); x.stroke(); x.setLineDash([]); x.lineWidth=1;
      x.fillStyle=`rgba(${col},.05)`; x.beginPath(); x.arc(cx,cy,r+Math.max(w,h)*3,0,TAU); x.arc(cx,cy,r,0,TAU,true); x.fill(); }
    // sun
    const sr=Math.max(9,SUN_R*k*4); let g=x.createRadialGradient(cx,cy,0,cx,cy,sr*3.2); g.addColorStop(0,'rgba(255,246,216,1)'); g.addColorStop(0.22,'rgba(255,214,130,.9)'); g.addColorStop(0.45,'rgba(255,160,60,.28)'); g.addColorStop(1,'rgba(255,140,40,0)');
    x.fillStyle=g; x.beginPath(); x.arc(cx,cy,sr*3.2,0,TAU); x.fill();

    /* places past the edge of the chart (the stations, the far field) are pinned to its rim with an arrow pointing the way */
    const at=(p,far)=>{ const m=this.mp(p), X=cx+m.x*k, Y=cy+m.z*k, l=30, r=w-30, tp=44, bt=h-34; if(!far||(X>=l&&X<=r&&Y>=tp&&Y<=bt)) return [X,Y,false];
      const dx=X-w/2, dy=Y-h/2; let q=1; if(Math.abs(dx)>1e-6) q=Math.min(q,(dx>0?r-w/2:w/2-l)/Math.abs(dx)); if(Math.abs(dy)>1e-6) q=Math.min(q,(dy>0?bt-h/2:h/2-tp)/Math.abs(dy)); return [w/2+dx*q,h/2+dy*q,true]; };
    const farP=P=>P.station, farF=F=>F.orbit>this.KNEE, arrow=(X,Y)=>{ const a=Math.atan2(Y-h/2,X-w/2); x.save(); x.translate(X,Y); x.rotate(a); x.fillStyle='#ffb454'; x.strokeStyle='#04060b'; x.lineWidth=2; x.beginPath(); x.moveTo(26,0); x.lineTo(15,-8); x.lineTo(15,8); x.closePath(); x.stroke(); x.fill(); x.restore(); };
    const [sx,sy]=at(s.pos,true);

    /* ---- pass 1: every icon. Each one is also an obstacle that labels must keep off. ---- */
    const obst=[], labels=[]; const ob=(x0,y0,x1,y1)=>obst.push([x0,y0,x1,y1]);
    ob(cx-sr,cy-sr,cx+sr,cy+sr);
    // course line to the destination, with its distance halfway along
    const [tx,ty]=at(T.pos,T.station||T.isWp||(T.isField&&T.orbit>this.KNEE)), cl=Math.hypot(tx-sx,ty-sy);
    if(cl>16){ x.strokeStyle='rgba(255,180,84,.75)'; x.setLineDash([7,6]); x.lineDashOffset=-t*18; x.beginPath(); x.moveTo(sx,sy); x.lineTo(tx,ty); x.stroke(); x.setLineDash([]); x.lineDashOffset=0;
      if(cl>120) labels.push({pri:90,ax:(sx+tx)/2,ay:(sy+ty)/2,r:0,nolead:true,lines:[{t:fmtDist(this.dist(T)),f:`22px ${FONT_MONO}`,c:'#ffb454'}]}); }
    this.pts.length=0;
    // asteroid fields
    { const R=RESTAURANT, [rx,ry,pf]=at(R.pos,true), tg=Nav.wp&&Nav.wp.kind==='restaurant', hv=this.hover===R.idx; if(pf) arrow(rx,ry);   // a lit dome on a dish, pinned to the rim: it is far off the chart
      x.fillStyle='#ffb454'; x.strokeStyle='#04060b'; x.lineWidth=2; x.beginPath(); x.ellipse(rx,ry+4,15,5,0,0,TAU); x.fill(); x.stroke(); x.fillStyle='#fff1c8'; x.beginPath(); x.arc(rx,ry+1,8,Math.PI,0); x.fill(); x.stroke(); x.lineWidth=1;
      if(tg||hv){ x.strokeStyle=tg?'#ffb454':'#dcedf3'; x.lineWidth=1.5; x.beginPath(); x.arc(rx,ry,22,0,TAU); x.stroke(); x.lineWidth=1; }
      ob(rx-16,ry-16,rx+16,ry+16); this.pts.push({i:R.idx,x:rx,y:ry,r:16});
      labels.push({pri:tg?96:40,ax:rx,ay:ry,r:18,pinned:pf,hv,tg,lines:[{t:R.short.toUpperCase(),f:`600 22px ${FONT_DISP}`,c:tg?'#ffb454':hv?'#ffffff':'#ffe2a6'}],sub:{t:'END OF THE GALAXY',f:`18px ${FONT_MONO}`,c:'rgba(134,162,174,.95)'}}); }
    FIELDS.forEach(F=>{ const [fx,fy,pf]=at(F.pos,farF(F)); if(pf) arrow(fx,fy); const rr=mulberry32(F.idx*31+7), tg=Nav.wp&&Nav.wp.kind==='field'&&Nav.wp.field===F.idx, hv=this.hover===100+F.idx;
      x.fillStyle=F.col; for(let q=0;q<9;q++){ const a=rr()*TAU, d=rr()*13; x.beginPath(); x.arc(fx+Math.cos(a)*d,fy+Math.sin(a)*d,2+rr()*3,0,TAU); x.fill(); }
      if(tg||hv){ x.strokeStyle=tg?'#ffb454':'#dcedf3'; x.lineWidth=1.5; x.beginPath(); x.arc(fx,fy,22,0,TAU); x.stroke(); x.lineWidth=1; }
      ob(fx-16,fy-16,fx+16,fy+16); this.pts.push({i:100+F.idx,x:fx,y:fy,r:16});
      labels.push({pri:tg?95:20,ax:fx,ay:fy,r:18,pinned:pf,hv,tg,lines:[{t:F.name.toUpperCase(),f:`600 22px ${FONT_DISP}`,c:tg?'#ffb454':hv?'#ffffff':'#c9bce8'}],sub:{t:F.ore.toUpperCase(),f:`18px ${FONT_MONO}`,c:'rgba(134,162,174,.95)'}}); });
    // worlds and stations
    PLANETS.forEach(P=>{
      const [px,py,pinned]=at(P.pos,farP(P)); if(pinned) arrow(px,py); const rad=P.station?9:clamp(3.5+P.r/850,6,13), col=this.colors(P), tg=P.idx===G.target&&!Nav.wp, hv=P.idx===this.hover;
      const ux=(px-cx)/(Math.hypot(px-cx,py-cy)||1), uy=(py-cy)/(Math.hypot(px-cx,py-cy)||1);
      this.pts.push({i:P.idx,x:px,y:py,r:rad}); const er=P.ring?rad*1.9:P.station?rad*1.9:rad+2; ob(px-er,py-rad-2,px+er,py+rad+2);
      if(P.ring){ x.strokeStyle='rgba(240,220,180,.75)'; x.lineWidth=2; x.beginPath(); x.ellipse(px,py,rad*1.9,rad*0.62,-0.4,0,TAU); x.stroke(); x.lineWidth=1; }
      if(P.station) this.stationIcon(x,px,py,rad,P,t);
      else { g=x.createRadialGradient(px-ux*rad*0.45,py-uy*rad*0.45,rad*0.1,px,py,rad); g.addColorStop(0,col[0]); g.addColorStop(0.6,col[1]); g.addColorStop(1,col[2]);
      x.fillStyle=g; x.beginPath(); x.arc(px,py,rad,0,TAU); x.fill();
      x.strokeStyle=P.pal.atm; x.globalAlpha=0.7; x.beginPath(); x.arc(px,py,rad+1.5,0,TAU); x.stroke(); x.globalAlpha=1; }
      if(P.ring){ x.strokeStyle='rgba(240,220,180,.9)'; x.lineWidth=2; x.beginPath(); x.ellipse(px,py,rad*1.9,rad*0.62,-0.4,0.15,Math.PI-0.15); x.stroke(); x.lineWidth=1; }
      if(hv&&!tg){ x.strokeStyle='rgba(220,237,243,.9)'; x.beginPath(); x.arc(px,py,rad+7,0,TAU); x.stroke(); }
      if(tg){ const rr=rad+8+Math.sin(t*3)*1.2; x.strokeStyle='#ffb454'; x.lineWidth=1.5; x.beginPath(); x.arc(px,py,rr,0,TAU); x.stroke();
        for(let q=0;q<4;q++){ const a=t*0.6+q*Math.PI/2; x.beginPath(); x.moveTo(px+Math.cos(a)*(rr+2),py+Math.sin(a)*(rr+2)); x.lineTo(px+Math.cos(a)*(rr+8),py+Math.sin(a)*(rr+8)); x.stroke(); } x.lineWidth=1; }
      const n=this.cargoFor(P.idx), hot=G.hot===P.idx, here=docked&&G.docked===P.idx, L=[{t:P.name.toUpperCase(),f:`600 26px ${FONT_DISP}`,c:tg?'#ffb454':hv?'#ffffff':'#dcedf3'}];
      if(n) L.push({t:' ▣ '+n,f:`22px ${FONT_MONO}`,c:'#7dffa8',same:true}); if(hot) L.push({t:' +50%',f:`22px ${FONT_MONO}`,c:'#ffb454',same:true});
      labels.push({pri:tg?95:(here||n||hot)?70:P.station?55:50,ax:px,ay:py,r:rad+(tg?10:4),pinned,hv,tg,lines:L,
        sub:{t:P.station?`STATION · ${RISK[P.risk].name.toUpperCase()} RISK`:P.port.toUpperCase(),f:`20px ${FONT_MONO}`,c:P.station?RISK[P.risk].col:'rgba(134,162,174,.95)'}}); });
    // distress beacon
    if(Nav.wp&&(Nav.wp.kind==='distress'||Nav.wp.kind==='salvage')){ const [bx,by]=at(Nav.wp.pos,true); x.strokeStyle='#ff6f61'; x.lineWidth=2; x.beginPath(); x.moveTo(bx,by-10); x.lineTo(bx+10,by); x.lineTo(bx,by+10); x.lineTo(bx-10,by); x.closePath(); x.stroke(); x.lineWidth=1; ob(bx-12,by-12,bx+12,by+12); }
    // you
    const pulse=(t*0.9)%1; x.strokeStyle=`rgba(98,226,255,${0.6*(1-pulse)})`; x.beginPath(); x.arc(sx,sy,6+pulse*16,0,TAU); x.stroke();
    if(docked){ x.strokeStyle='#62e2ff'; x.lineWidth=1.5; x.beginPath(); x.arc(sx,sy,4,0,TAU); x.stroke(); x.lineWidth=1; }
    else { const f=new V3(0,0,-1).applyQuaternion(s.quat), a=Math.atan2(f.z,f.x); x.save(); x.translate(sx,sy); x.rotate(a); x.fillStyle='#62e2ff'; x.strokeStyle='#04060b'; x.beginPath(); x.moveTo(10,0); x.lineTo(-6,6); x.lineTo(-3,0); x.lineTo(-6,-6); x.closePath(); x.fill(); x.stroke(); x.restore(); }
    ob(sx-12,sy-12,sx+12,sy+12);
    labels.push({pri:85,ax:sx,ay:sy,r:12,you:true,lines:[{t:docked?'DOCKED':s.warpF>0.3?'YOU · WARP':'YOU',f:`20px ${FONT_MONO}`,c:'#62e2ff'}]});
    // zone names and ring numbers: the least important, so they go wherever is left
    for(const [R,lab,col] of [[DEEP_R,'END OF PATROLLED SPACE','255,150,80'],[EXTREME_R,'THE FAR DARK','255,100,100']]){ const r=this.rad(R)*k; labels.push({pri:12,ring:r,angles:[0.78,0.22,1.3,-0.4,2.3,-1.2,2.9,-2.2],lines:[{t:lab,f:`20px ${FONT_MONO}`,c:`rgba(${col},.95)`}]}); }
    for(const [ls,r] of rings) labels.push({pri:5,ring:r,angles:[-Math.PI/2],plain:true,lines:[{t:ls+' LS',f:`20px ${FONT_MONO}`,c:'rgba(134,162,174,.7)'}]});

    /* ---- pass 2: place labels, most important first. A label never covers an icon or another label: it tries spots all
       round its icon, then further out on a leader line; then just its name; then it waits until you point at it. ---- */
    const M=6, top=8, bot=h-8, placed=[];
    const measure=(lines,sub)=>{ let lw=0; for(const l of lines){ x.font=l.f; l.w=x.measureText(l.t).width; } const row=lines.reduce((a,l)=>a+l.w,0); lw=row; if(sub){ x.font=sub.f; sub.w=x.measureText(sub.t).width; lw=Math.max(lw,sub.w); } return [lw+12, sub?56:30]; };
    const free=(b)=>{ if(b[0]<M||b[2]>w-M||b[1]<top||b[3]>bot) return false; for(const o of obst) if(b[0]<o[2]+3&&b[2]>o[0]-3&&b[1]<o[3]+3&&b[3]>o[1]-3) return false; for(const p of placed) if(b[0]<p[2]+4&&b[2]>p[0]-4&&b[1]<p[3]+4&&b[3]>p[1]-4) return false; return true; };
    const spots=(L,bw,bh)=>{ const out=[], {ax,ay,r}=L; const dirs=[[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[.7,-.7],[-.7,.7],[-.7,-.7]];
      if(L.pinned){ const ix=w/2-ax, iy=h/2-ay, il=Math.hypot(ix,iy)||1; dirs.unshift([ix/il,iy/il]); }
      for(const d of [r+8,r+40,r+80,r+130]) for(const [dx,dy] of dirs){ const px=ax+dx*d, py=ay+dy*d; const x0=dx>0.3?px:dx<-0.3?px-bw:px-bw/2, y0=dy>0.3?py:dy<-0.3?py-bh:py-bh/2; out.push([x0,y0,x0+bw,y0+bh,d>r+8]); }
      return out; };
    labels.sort((a,b)=>b.pri-a.pri);
    const draws=[];
    for(const L of labels){
      if(L.ring!=null){ const [bw,bh]=measure(L.lines,null); let ok=null; for(const a of L.angles){ const lx=cx+Math.cos(a)*L.ring, ly=cy+Math.sin(a)*L.ring+(L.plain?-13:0), b=[lx-bw/2,ly-bh/2,lx+bw/2,ly+bh/2]; if(free(b)){ ok=b; break; } }
        if(ok){ placed.push(ok); draws.push({L,b:ok,sub:false}); } continue; }
      if(L.fixed){ const [bw,bh]=measure(L.lines,null), b=[L.ax-bw/2,L.ay-bh/2,L.ax+bw/2,L.ay+bh/2]; if(free(b)||L.pri>=90){ placed.push(b); draws.push({L,b,sub:false}); } continue; }
      let got=null;
      for(const withSub of L.sub?[true,false]:[false]){ const [bw,bh]=measure(L.lines,withSub?L.sub:null); for(const c of spots(L,bw,bh)){ if(free(c)){ got={b:c,sub:withSub,lead:c[4]}; break; } } if(got) break; }
      if(!got&&L.tg){ const [bw,bh]=measure(L.lines,L.sub); const c=spots(L,bw,bh).find(c=>c[0]>=M&&c[2]<=w-M&&c[1]>=top&&c[3]<=bot)||spots(L,bw,bh)[0]; got={b:c,sub:!!L.sub,lead:c[4]}; } // the one you're pointing at, or heading for, always shows
      if(got){ if(L.nolead) got.lead=false; placed.push(got.b); draws.push({L,...got}); }
    }
    // the label under the pointer: if the layout had no room for it, it pops up on top, clear of the icons if it can be
    const H=labels.find(L=>L.hv); if(H&&!draws.some(d=>d.L===H)){ const [bw,bh]=measure(H.lines,H.sub), cs=spots(H,bw,bh), onS=c=>c[0]>=M&&c[2]<=w-M&&c[1]>=top&&c[3]<=bot;
      const c=cs.find(c=>onS(c)&&!obst.some(o=>c[0]<o[2]+3&&c[2]>o[0]-3&&c[1]<o[3]+3&&c[3]>o[1]-3))||cs.find(onS)||cs[0]; draws.push({L:H,b:c,sub:!!H.sub,lead:c[4]}); }
    // leader lines first, then the labels over them; the one under the pointer last, on top of everything
    draws.sort((a,b)=>(a.L.hv?1:0)-(b.L.hv?1:0));
    for(const d of draws) if(d.lead){ const b=d.b, L=d.L, qx=clamp(L.ax,b[0],b[2]), qy=clamp(L.ay,b[1],b[3]); x.strokeStyle=L.tg?'rgba(255,180,84,.7)':'rgba(220,237,243,.45)'; x.lineWidth=1.5; x.beginPath(); const a=Math.atan2(qy-L.ay,qx-L.ax); x.moveTo(L.ax+Math.cos(a)*L.r,L.ay+Math.sin(a)*L.r); x.lineTo(qx,qy); x.stroke(); x.lineWidth=1; }
    for(const d of draws){ const b=d.b, L=d.L; x.textAlign='left';
      if(L.ring==null){ x.fillStyle=L.hv?'#04060b':'rgba(4,6,11,.74)'; x.fillRect(b[0],b[1],b[2]-b[0],b[3]-b[1]); if(L.tg||L.hv){ x.strokeStyle=L.tg?'rgba(255,180,84,.8)':'rgba(220,237,243,.7)'; x.strokeRect(b[0]+0.5,b[1]+0.5,b[2]-b[0]-1,b[3]-b[1]-1); } }
      else { x.fillStyle='rgba(4,6,11,.7)'; x.fillRect(b[0],b[1],b[2]-b[0],b[3]-b[1]); }
      let lx=b[0]+6; const ly=d.sub?b[1]+17:(b[1]+b[3])/2+1; for(const l of L.lines){ x.font=l.f; x.fillStyle=l.c; x.fillText(l.t,lx,ly); lx+=l.w; }
      if(d.sub){ const sb=L.sub; x.font=sb.f; x.fillStyle=sb.c; x.fillText(sb.t,b[0]+6,b[1]+42); } }
  },
};
