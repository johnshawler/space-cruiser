/* ===================== SYSTEM MAP ===================== */
/* Top-down chart of the system. M toggles it in flight and in port; click a world to set the destination. */
const SysMap = {
  open:false, f:0, hover:-1, pts:[], listT:0, maxR:0,
  toggle(){ if(this.open) this.close(); else this.show(); },
  show(){
    if(this.open) return; this.open=true; this.hover=-1; this.f=0; this.listT=0.5;
    if(!this.maxR){ PLANETS.forEach(P=>{ this.maxR=Math.max(this.maxR,P.orbit); }); this.maxR*=1.05; }
    $('map').hidden=false; $('tooltip').hidden=true; if(Sfx.ok()) Sfx.beep(760); this.list(); this.draw(Game.time);
  },
  close(){ if(!this.open) return; this.open=false; $('map').hidden=true; if(Sfx.ok()) Sfx.click(); const g=$('gl'); if(g) g.focus(); },
  pick(i){ if(i<0||i>=PLANETS.length) return; Game.setTarget(i); this.list(); this.draw(Game.time); },
  colors(P){ const p=P.pal; if(P.type==='gas') return [p.a,p.b,p.d]; if(P.lava>0.2) return [p.shal,p.deep,p.a]; if(P.sea>0.4) return [p.shal,p.deep,p.b]; return [p.d||p.a,p.a,p.c]; },
  cargoFor(i){ let n=0; G.cargo.forEach(c=>{ if(c.to===i) n+=c.qty; }); return n; },
  dist(P){ return Math.max(0,P.pos.distanceTo(G.ship.pos)-P.r); },
  eta(d){ const s=d/SHIPS[G.shipId].warp; return s<90?'≈ '+Math.max(1,Math.round(s))+' s at warp':'≈ '+(s/60).toFixed(1)+' min at warp'; },

  bind(){
    const cv=$('map-cv');
    const at=e=>{ const r=cv.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top; let best=-1, bd=1e9; this.pts.forEach(p=>{ const d=Math.hypot(p.x-mx,p.y-my); if(d<Math.max(p.r+12,20)&&d<bd){ bd=d; best=p.i; } }); return best; };
    cv.addEventListener('pointermove',e=>{ const h=at(e); if(h!==this.hover){ this.hover=h; cv.style.cursor=h>=0?'pointer':'default'; this.draw(Game.time); } });
    cv.addEventListener('pointerleave',()=>{ if(this.hover!==-1){ this.hover=-1; this.draw(Game.time); } });
    cv.addEventListener('click',e=>{ const h=at(e); if(h>=0) this.pick(h); });
    $('map-list').addEventListener('click',e=>{ const b=e.target.closest('[data-i]'); if(b) this.pick(+b.dataset.i); });
    $('map-close').onclick=()=>this.close();
  },

  update(dt,t){
    if(!this.open) return;
    if(G.mode!=='flight'&&G.mode!=='port'){ this.close(); return; }
    if((this.f++%2)===0) this.draw(t);
    this.listT-=dt; if(this.listT<=0){ this.listT=0.5; this.list(); }
  },

  list(){
    const T=PLANETS[G.target], docked=G.mode==='port'&&G.docked>=0, dT=this.dist(T);
    $('map-sub').innerHTML=`Destination <b>${esc(T.name)}</b> · ${docked&&G.docked===T.idx?'docked here':fmtDist(dT)+' · '+this.eta(dT)}`;
    const rows=PLANETS.slice().sort((a,b)=>a.orbit-b.orbit).map(P=>{
      const here=docked&&G.docked===P.idx, n=this.cargoFor(P.idx), col=this.colors(P);
      let tags=''; if(P.idx===G.target) tags+='<em class="t">Destination</em>'; if(n) tags+=`<em class="c">${n} crate${n===1?'':'s'} to deliver</em>`; if(G.hot===P.idx) tags+='<em class="h">Paying +50%</em>'; if(here) tags+='<em>Docked</em>';
      return `<button class="mrow${P.idx===G.target?' tg':''}" data-i="${P.idx}"><i style="background:radial-gradient(circle at 35% 35%,${col[0]},${col[1]} 60%,${col[2]})"></i><span class="n">${esc(P.name)}</span><span class="d">${here?'—':fmtDist(this.dist(P))}</span><span class="p">${esc(P.port)} · ${esc(SPECIES[P.species].name)}</span>${tags?'<span class="b">'+tags+'</span>':''}</button>`;
    });
    $('map-list').innerHTML=rows.join('');
    const nT=G.mode==='flight'?Npc.list.length:0;
    $('map-foot').textContent=(G.mode==='port'?'Docked at '+PLANETS[G.docked>=0?G.docked:G.target].port:nT+' ship'+(nT===1?'':'s')+' on local scan')+' · Click a world to set your destination · M or Esc to close';
  },

  draw(t){
    const cv=$('map-cv'), box=cv.parentNode, w=box.clientWidth, h=box.clientHeight; if(w<20||h<20) return;
    const dpr=Math.min(window.devicePixelRatio||1,2), W=Math.round(w*dpr), Hh=Math.round(h*dpr); if(cv.width!==W||cv.height!==Hh){ cv.width=W; cv.height=Hh; }
    const x=cv.getContext('2d'); x.setTransform(dpr,0,0,dpr,0,0); x.clearRect(0,0,w,h);
    const cx=w/2, cy=h/2, R=Math.max(70,Math.min(w,h)/2-44), k=R/this.maxR, TAU=Math.PI*2;
    const s=G.ship, docked=G.mode==='port'&&G.docked>=0, T=PLANETS[G.target];
    x.lineWidth=1; x.textBaseline='middle';

    // range rings, one per light-second
    x.font=`20px ${FONT_MONO}`; x.textAlign='center';
    for(let ls=1; ls*LS<=this.maxR; ls++){ const r=ls*LS*k; x.setLineDash([2,6]); x.strokeStyle='rgba(98,226,255,.16)'; x.beginPath(); x.arc(cx,cy,r,0,TAU); x.stroke(); x.setLineDash([]);
      x.fillStyle='rgba(134,162,174,.7)'; x.fillText(ls+' LS',cx,cy-r-13); }
    // orbits
    PLANETS.forEach(P=>{ x.strokeStyle=P.idx===G.target?'rgba(255,180,84,.28)':'rgba(220,237,243,.09)'; x.beginPath(); x.arc(cx,cy,P.orbit*k,0,TAU); x.stroke(); });
    // sun
    const sr=Math.max(9,SUN_R*k*4); let g=x.createRadialGradient(cx,cy,0,cx,cy,sr*3.2); g.addColorStop(0,'rgba(255,246,216,1)'); g.addColorStop(0.22,'rgba(255,214,130,.9)'); g.addColorStop(0.45,'rgba(255,160,60,.28)'); g.addColorStop(1,'rgba(255,140,40,0)');
    x.fillStyle=g; x.beginPath(); x.arc(cx,cy,sr*3.2,0,TAU); x.fill();

    // ship position on the chart
    const sx=cx+s.pos.x*k, sy=cy+s.pos.z*k;
    const boxes=PLANETS.map(P=>{ const ax=cx+P.pos.x*k, ay=cy+P.pos.z*k; return [ax-13,ay-13,ax+13,ay+13]; }); boxes.push([sx-16,sy-16,sx+16,sy+44]);
    // course line to the destination
    const tx=cx+T.pos.x*k, ty=cy+T.pos.z*k, cl=Math.hypot(tx-sx,ty-sy);
    if(cl>16){ x.strokeStyle='rgba(255,180,84,.75)'; x.setLineDash([7,6]); x.lineDashOffset=-t*18; x.beginPath(); x.moveTo(sx,sy); x.lineTo(tx,ty); x.stroke(); x.setLineDash([]); x.lineDashOffset=0;
      if(cl>90){ const mx=(sx+tx)/2, my=(sy+ty)/2, lab=fmtDist(this.dist(T)); x.font=`22px ${FONT_MONO}`; const tw=x.measureText(lab).width+18; x.fillStyle='rgba(4,6,11,.85)'; x.fillRect(mx-tw/2,my-16,tw,32); boxes.push([mx-tw/2,my-16,mx+tw/2,my+16]); x.fillStyle='#ffb454'; x.textAlign='center'; x.fillText(lab,mx,my+1); } }

    // worlds
    this.pts.length=0;
    PLANETS.forEach(P=>{
      const px=cx+P.pos.x*k, py=cy+P.pos.z*k, rad=clamp(3.5+P.r/850,6,13), col=this.colors(P), tg=P.idx===G.target, hv=P.idx===this.hover;
      const ux=(px-cx)/(Math.hypot(px-cx,py-cy)||1), uy=(py-cy)/(Math.hypot(px-cx,py-cy)||1);
      this.pts.push({i:P.idx,x:px,y:py,r:rad});
      if(P.ring){ x.strokeStyle='rgba(240,220,180,.75)'; x.lineWidth=2; x.beginPath(); x.ellipse(px,py,rad*1.9,rad*0.62,-0.4,0,TAU); x.stroke(); x.lineWidth=1; }
      g=x.createRadialGradient(px-ux*rad*0.45,py-uy*rad*0.45,rad*0.1,px,py,rad); g.addColorStop(0,col[0]); g.addColorStop(0.6,col[1]); g.addColorStop(1,col[2]);
      x.fillStyle=g; x.beginPath(); x.arc(px,py,rad,0,TAU); x.fill();
      x.strokeStyle=P.pal.atm; x.globalAlpha=0.7; x.beginPath(); x.arc(px,py,rad+1.5,0,TAU); x.stroke(); x.globalAlpha=1;
      if(P.ring){ x.strokeStyle='rgba(240,220,180,.9)'; x.lineWidth=2; x.beginPath(); x.ellipse(px,py,rad*1.9,rad*0.62,-0.4,0.15,Math.PI-0.15); x.stroke(); x.lineWidth=1; }
      if(hv&&!tg){ x.strokeStyle='rgba(220,237,243,.9)'; x.beginPath(); x.arc(px,py,rad+7,0,TAU); x.stroke(); }
      if(tg){ const rr=rad+8+Math.sin(t*3)*1.2; x.strokeStyle='#ffb454'; x.lineWidth=1.5; x.beginPath(); x.arc(px,py,rr,0,TAU); x.stroke();
        for(let q=0;q<4;q++){ const a=t*0.6+q*Math.PI/2; x.beginPath(); x.moveTo(px+Math.cos(a)*(rr+2),py+Math.sin(a)*(rr+2)); x.lineTo(px+Math.cos(a)*(rr+8),py+Math.sin(a)*(rr+8)); x.stroke(); } x.lineWidth=1; }
      // label: name, port, badges
      const n=this.cargoFor(P.idx), hot=G.hot===P.idx, name=P.name.toUpperCase(); let badge=''; if(n) badge+='  ▣ '+n; if(hot) badge+='  +50%';
      x.font=`600 26px ${FONT_DISP}`; const nw=x.measureText(name).width; x.font=`22px ${FONT_MONO}`; const bw=badge?x.measureText(badge).width:0; x.font=`20px ${FONT_MONO}`; const pw=x.measureText(P.port.toUpperCase()).width;
      const lw=Math.max(nw+bw,pw), off=rad+(tg?20:12); let lx=px+off+lw>w-6?px-off-lw:px+off, ly=py; x.textAlign='left';
      // keep labels off each other: try right, left, below, above
      for(const [ax,ay] of [[px+off,py],[px-off-lw,py],[px-lw/2,py+off+30],[px-lw/2,py-off-30]]){ if(ax<6||ax+lw>w-6||ay<34||ay>h-34) continue; if(!boxes.some(b=>ax-8<b[2]&&ax+lw+8>b[0]&&ay-30<b[3]&&ay+30>b[1])){ lx=ax; ly=ay; break; } }
      boxes.push([lx-6,ly-28,lx+lw+6,ly+28]);
      x.fillStyle='rgba(4,6,11,.66)'; x.fillRect(lx-6,ly-28,lw+12,56);
      x.font=`600 26px ${FONT_DISP}`; x.fillStyle=tg?'#ffb454':hv?'#ffffff':'#dcedf3'; x.fillText(name,lx,ly-11);
      if(badge){ x.font=`22px ${FONT_MONO}`; let bx=lx+nw; if(n){ const s1='  ▣ '+n; x.fillStyle='#7dffa8'; x.fillText(s1,bx,ly-11); bx+=x.measureText(s1).width; } if(hot){ x.fillStyle='#ffb454'; x.fillText('  +50%',bx,ly-11); } }
      x.font=`20px ${FONT_MONO}`; x.fillStyle='rgba(134,162,174,.95)'; x.fillText(P.port.toUpperCase(),lx,ly+15);
    });

    // you
    const pulse=(t*0.9)%1; x.strokeStyle=`rgba(98,226,255,${0.6*(1-pulse)})`; x.beginPath(); x.arc(sx,sy,6+pulse*16,0,TAU); x.stroke();
    if(docked){ x.strokeStyle='#62e2ff'; x.lineWidth=1.5; x.beginPath(); x.arc(sx,sy,4,0,TAU); x.stroke(); x.lineWidth=1; }
    else { const f=new V3(0,0,-1).applyQuaternion(s.quat), a=Math.atan2(f.z,f.x); x.save(); x.translate(sx,sy); x.rotate(a); x.fillStyle='#62e2ff'; x.strokeStyle='#04060b'; x.beginPath(); x.moveTo(10,0); x.lineTo(-6,6); x.lineTo(-3,0); x.lineTo(-6,-6); x.closePath(); x.fill(); x.stroke(); x.restore(); }
    x.font=`20px ${FONT_MONO}`; x.textAlign='center'; const yl=docked?'DOCKED':s.warpF>0.3?'YOU · WARP':'YOU'; const yw=x.measureText(yl).width+14, yy=sy+(sy>h-50?-30:30);
    x.fillStyle='rgba(4,6,11,.7)'; x.fillRect(sx-yw/2,yy-14,yw,28); x.fillStyle='#62e2ff'; x.fillText(yl,sx,yy+1);
  },
};
