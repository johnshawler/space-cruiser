/* ===================== UI: toasts, port, comms, radio ===================== */
const el = (tag, cls, html) => { const e=document.createElement(tag); if(cls) e.className=cls; if(html!==undefined) e.innerHTML=html; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const UI = {
  tab:'jobs', arrival:null,
  toast(msg, cls){ const t=el('div','toast'+(cls?' '+cls:''),esc(msg)); const box=$('toasts'); box.appendChild(t); while(box.children.length>3) box.removeChild(box.firstChild); setTimeout(()=>t.remove(),5200); },
  quote(spKey, seed, who, text){ const q=el('div','quote'); q.appendChild(portraitCanvas(spKey,seed,128)); const d=el('div'); d.innerHTML=`<div class="who">${esc(who)}</div><div class="alien">${esc(alienWords(spKey,text,seed))}</div><div class="say">${esc(text)}</div>`; q.appendChild(d); return q; },
  showPort(P, arrival){
    this.P=P; this.arrival=arrival; this.tab='jobs'; $('port').hidden=false; $('keys').hidden=true;
    $('port-name').textContent=P.name; $('port-sub').textContent=P.port+' · '+P.desc;
    const tabs=$('port-tabs'); tabs.innerHTML=''; [['jobs','Job board'],['yard','Shipyard'],['svc','Services'],['bar','Cantina']].forEach(([k,n])=>{ const b=el('button','',n); b.dataset.k=k; b.onclick=()=>{ Sfx.click(); this.tab=k; Cine.setPreview(null); this.render(); }; tabs.appendChild(b); });
    this.render();
  },
  hidePort(){ $('port').hidden=true; },
  stats(){ const d=SHIPS[G.shipId]; let used=0; G.cargo.forEach(c=>used+=c.qty); $('port-stats').innerHTML=`<span>Credits <b>${fmtCr(G.credits)}</b></span><span>Hold <b>${used}/${d.hold}</b></span><span>Fuel <b>${Math.round(G.fuel/d.fuel*100)}%</b></span><span>Ship <b>${esc(d.name)}</b></span>`;
    $('port-foot').textContent=G.cargo.length?`${G.cargo.length} delivery${G.cargo.length>1?' contracts':' contract'} aboard`:'Hold empty. Take a job before you launch.'; },
  render(){
    const P=this.P, body=$('port-body'), d=SHIPS[G.shipId]; body.innerHTML=''; this.stats(); let used=0; G.cargo.forEach(c=>used+=c.qty);
    for(const b of $('port-tabs').children) b.classList.toggle('on',b.dataset.k===this.tab);
    if(this.tab==='jobs'){
      const a=this.arrival;
      if(a){ body.appendChild(this.quote(P.species,P.idx*7+1,'Dockmaster · '+SPECIES[P.species].name,a.greet));
        if(a.paid.length){ const L=el('div','ledger'); a.paid.forEach(c=>{ L.appendChild(el('span','',`${c.qty}× ${esc(c.good)}`)); L.appendChild(el('span','',fmtCr(c.pay))); }); if(a.fee){ L.appendChild(el('span','','Tow fee')); L.appendChild(el('span','','−'+fmtCr(a.fee))); }
          L.appendChild(el('span','tot','Delivered and paid')); L.appendChild(el('span','tot',fmtCr(a.total))); body.appendChild(L); }
        else if(a.fee){ const L=el('div','ledger'); L.appendChild(el('span','','Tow fee')); L.appendChild(el('span','','−'+fmtCr(a.fee))); body.appendChild(L); } }
      body.appendChild(el('div','note',`Contracts out of ${esc(P.port)}. Cargo is loaded when you accept and paid for when you land at the destination.`));
      if(!G.jobs.length) body.appendChild(el('div','note','The board is empty. Fly somewhere else and come back.'));
      G.jobs.forEach(j=>{ const c=el('div','card'); c.appendChild(portraitCanvas(j.sp,j.seed,128)); const T=PLANETS[j.to], dist=P.pos.distanceTo(T.pos);
        const mid=el('div','mid',`<h3>${j.qty}× ${esc(j.good)}${j.hot?'<span class="tag">HOT +50%</span>':''}</h3><p>${esc(j.note)}</p><div class="meta">To <i>${esc(T.name)}</i> · ${(dist/LS).toFixed(1)} ls · for ${esc(alienName(j.sp,j.seed))}</div>`); c.appendChild(mid);
        const r=el('div','right'); r.appendChild(el('div','pay',fmtCr(j.pay))); const fits=used+j.qty<=d.hold; const b=el('button','btn',fits?'Accept':'No room'); b.disabled=!fits;
        b.onclick=()=>{ G.cargo.push({good:j.good,qty:j.qty,to:j.to,pay:j.pay,from:P.idx}); G.jobs.splice(G.jobs.indexOf(j),1); Sfx.clunk(); if(!G.cargo.some(c=>c.to===G.target)) Game.setTarget(j.to,true); Cockpit.drawManifest(); Game.save(); this.render(); };
        r.appendChild(b); c.appendChild(r); body.appendChild(c); });
      if(G.cargo.length){ body.appendChild(el('div','note','In your hold:')); const L=el('div','ledger'); G.cargo.forEach(c=>{ L.appendChild(el('span','',`${c.qty}× ${esc(c.good)} → ${esc(PLANETS[c.to].name)}`)); L.appendChild(el('span','',fmtCr(c.pay))); }); body.appendChild(L); }
    } else if(this.tab==='yard'){
      body.appendChild(el('div','note','Trade-in is half of what your current ship cost new. Cargo moves across for free. Preview parks the ship on the pad so you can look at it.'));
      SHIPS.forEach((sh,i)=>{ const c=el('div','card'); const cv=makeCanvas(128,128), x=cv.getContext('2d'); x.fillStyle='#0b1620'; x.fillRect(0,0,128,128); x.fillStyle=sh.ck.trim; x.font=`700 76px ${FONT_DISP}`; x.textAlign='center'; x.textBaseline='middle'; x.fillText(['I','II','III','IV','V'][i],64,68); c.appendChild(cv);
        const net=Math.max(0,sh.price-Math.round(d.price/2)), mine=i===G.shipId;
        c.appendChild(el('div','mid',`<h3>${esc(sh.name)}${mine?'<span class="tag">YOURS</span>':''}</h3><p>${esc(sh.tag)}</p><div class="meta">Hold <i>${sh.hold}</i> · Cruise <i>${sh.cruise}</i> km/s · Warp <i>${(sh.warp/LS).toFixed(2)}c</i> · Tank <i>${sh.fuel}</i></div>`));
        const r=el('div','right'); r.appendChild(el('div','pay',mine?'—':fmtCr(net)));
        const pv=el('button','btn','Preview'); pv.onclick=()=>{ Sfx.click(); Cine.setPreview(i); }; r.appendChild(pv);
        if(!mine){ const b=el('button','btn','Buy'); b.disabled=G.credits<net||used>sh.hold; b.onclick=()=>{ G.credits-=net; G.shipId=i; G.fuel=sh.fuel; Sfx.cash(); Cine.setPreview(null); Cine.setModel(i); Cine.dock(P); Cockpit.build(sh); UI.toast('You now own the '+sh.name,'good'); Game.genJobs(P.idx); Game.save(); this.render(); }; r.appendChild(b); }
        c.appendChild(r); body.appendChild(c); });
    } else if(this.tab==='svc'){
      const need=Math.ceil(d.fuel-G.fuel), cost=need*3;
      const fc=el('div','card'); fc.appendChild(this.icon('⛽')); fc.appendChild(el('div','mid',`<h3>Fuel</h3><p>Tank at ${Math.round(G.fuel/d.fuel*100)}%. Warp drinks it. Cruising sips it.</p><div class="meta">3 cr per unit</div>`));
      const r=el('div','right'); r.appendChild(el('div','pay',need>0?fmtCr(cost):'Full')); const b=el('button','btn',need<=0?'Full':G.credits>=cost?'Fill tank':G.credits>=3?'Buy what I can':'Beg'); b.disabled=need<=0;
      b.onclick=()=>{ if(G.credits>=cost){ G.credits-=cost; G.fuel=d.fuel; } else if(G.credits>=3){ const u=Math.floor(G.credits/3); G.fuel+=u; G.credits-=u*3; } else { G.fuel=Math.max(G.fuel,d.fuel*0.4); UI.toast('The dockmaster sighs and tops you up to 40%','good'); } Sfx.hiss(1,0.2); Game.save(); this.render(); };
      r.appendChild(b); fc.appendChild(r); body.appendChild(fc);
      const wc=el('div','card'); wc.appendChild(this.icon('✦')); wc.appendChild(el('div','mid',`<h3>Canopy wash</h3><p>Warp travel leaves the glass filthy. ${G.sys.dirt>0.3?'Yours is a disgrace.':'Yours is fine, honestly.'}</p><div class="meta">Or use the wipers. They sort of work.</div>`));
      const r2=el('div','right'); r2.appendChild(el('div','pay',fmtCr(20))); const b2=el('button','btn','Wash'); b2.disabled=G.credits<20||G.sys.dirt<0.05; b2.onclick=()=>{ G.credits-=20; G.sys.dirt=0; Sfx.hiss(1.5,0.2); Game.save(); this.render(); }; r2.appendChild(b2); wc.appendChild(r2); body.appendChild(wc);
    } else {
      body.appendChild(el('div','note',`The cantina at ${esc(P.port)}. It smells like ${pick(['engine grease and cinnamon','warm batteries','somebody else\'s lunch','rain on hot metal','ozone and toast'])}.`));
      const r=mulberry32(P.idx*31+G.stats.deliveries); const locals=[P.species, SPECIES_KEYS[Math.floor(r()*SPECIES_KEYS.length)], SPECIES_KEYS[Math.floor(r()*SPECIES_KEYS.length)]];
      locals.forEach((sp,i)=>{ const seed=P.idx*100+i*17+G.stats.deliveries; const S=SPECIES[sp]; const line=fill(S.chat[Math.floor(r()*S.chat.length)],{planet:PLANETS[Math.floor(r()*PLANETS.length)].name,good:GOODS[Math.floor(r()*GOODS.length)][0]}); body.appendChild(this.quote(sp,seed,alienName(sp,seed)+' · '+S.name,line)); });
      const c=el('div','card'); c.appendChild(this.icon('☕')); c.appendChild(el('div','mid',`<h3>Buy a round</h3><p>Pilots talk when someone else is paying. You might hear where the money is.</p><div class="meta">${G.hot!=null?'Current tip: <i>'+esc(PLANETS[G.hot].name)+'</i> pays +50%':'No tip yet'}</div>`));
      const rr=el('div','right'); rr.appendChild(el('div','pay',fmtCr(30))); const b=el('button','btn','Buy'); b.disabled=G.credits<30;
      b.onclick=()=>{ G.credits-=30; let h; do{ h=Math.floor(Math.random()*PLANETS.length); }while(h===P.idx); G.hot=h; const sp=pick(locals); Sfx.speak(SPECIES[sp].voice,2.5,true); Game.genJobs(P.idx); Game.save(); this.render(); $('port-body').insertBefore(this.quote(sp,Math.floor(Math.random()*999),'Overheard · '+SPECIES[sp].name,fill(SPECIES[sp].rumor,{planet:PLANETS[h].name})),$('port-body').children[1]); };
      rr.appendChild(b); c.appendChild(rr); body.appendChild(c);
    }
  },
  icon(ch){ const cv=makeCanvas(128,128), x=cv.getContext('2d'); x.fillStyle='#0b1620'; x.fillRect(0,0,128,128); x.fillStyle='#ffb454'; x.font='72px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(ch,64,70); return cv; },
};

/* ---------- radio chatter ---------- */
const Radio = {
  cur:null, wait:4, last:'',
  retune(){ this.cur=null; this.wait=1.0; if(Sfx.ok()) Sfx.click(); },
  subs(){ return {planet:pick(PLANETS).name, good:pick(GOODS)[0]}; },
  play(m){ m.alien=alienWords(m.sp,m.english,Math.floor(Math.random()*1e6)); m.t=0; m.dur=clamp(m.english.length*0.058,2.4,7.5); this.cur=m; if(G.sys.power&&G.sys.radioVol>0.01) Sfx.speak(SPECIES[m.sp].voice,m.dur); },
  next(){
    const ch=G.sys.channel, near=World.nearest||PLANETS[0]; let m;
    const pilotLine=()=>{ const cands=Npc.list.filter(n=>n.dist<40000); const pl=cands.length&&Math.random()<0.75?pick(cands).pilot:Npc.pilot(); const S=SPECIES[pl.sp]; return {sp:pl.sp,seed:pl.seed,name:pl.name,english:fill(pick(S.chat),this.subs())}; };
    const portLine=()=>({sp:near.species,seed:near.idx*7+1,name:near.port+' Control',english:fill(pick(CHATTER.port),{port:near.port,planet:near.name})});
    const tradeLine=()=>{ const sp=pick(['qeeble','zkthar','beepul']); return {sp,seed:4242,name:'Trade Net',english:G.hot!=null&&Math.random()<0.3?`Trade Net bulletin: ${PLANETS[G.hot].name} is paying bonus rates on all deliveries.`:fill(pick(CHATTER.trade),this.subs())}; };
    if(ch===0){ const r=Math.random(); m=r<0.72?pilotLine():r<0.86?portLine():tradeLine(); } else if(ch===1) m=tradeLine(); else if(ch===2) m=portLine(); else m={sp:'blorpax',seed:808,name:'DJ Glorp',english:fill(pick(CHATTER.dj),this.subs())};
    if(m.english===this.last){ this.wait=0.2; return; } this.last=m.english; this.play(m);
  },
  update(dt){
    if(Comms.open){ if(this.cur) this.cur.t+=dt; return; } if(this.cur){ this.cur.t+=dt; if(this.cur.t>this.cur.dur+2.6){ this.cur=null; this.wait=rnd(1.5,4.5); } return; }
    if(!G.sys.power) return; this.wait-=dt; if(this.wait<=0) this.next();
  },
};

/* ---------- hailing other pilots ---------- */
const Comms = {
  target:null, open:false, typer:0, text:'', asked:{},
  OPTS:['Any news on the lanes?','What are you hauling?','Nice ship.','Tell me a joke.','Safe travels.'],
  hail(){
    if(G.mode!=='flight') return; if(this.open){ this.close(); return; } if(!G.sys.power){ Sfx.deny(); return; }
    const n=Npc.nearest(7000); if(!n){ UI.toast('No ships in hailing range','warn'); Sfx.deny(); return; }
    this.target=n; this.open=true; this.asked={}; const pl=n.pilot, S=SPECIES[pl.sp]; $('comms').hidden=false; Sfx.beep(660);
    const x=$('comms-face').getContext('2d'); drawAlien(x,pl.sp,pl.seed,0,0,192);
    $('comms-who').textContent=`${pl.name} · ${S.name} · ${pl.ship}`;
    const o=$('comms-opts'); o.innerHTML=''; this.OPTS.forEach((t,i)=>{ const b=el('button','opt',`<b>${i+1}</b>${esc(t)}`); b.onclick=()=>this.choose(i); o.appendChild(b); });
    this.say(pick(S.greet));
  },
  say(tpl){
    const pl=this.target.pilot, S=SPECIES[pl.sp]; const english=fill(tpl,{planet:pick(PLANETS).name,good:pl.cargo,port:''}); const alien=alienWords(pl.sp,english,Math.floor(Math.random()*1e6));
    this.text=G.sys.translator?english:alien; this.typer=0; const gc=$('comms-glyph'), gx=gc.getContext('2d'); gx.clearRect(0,0,gc.width,gc.height); drawGlyphs(gx,alien,4,8,36,pl.sp,S.col,gc.width-8);
    const dur=clamp(english.length*0.055,2,7); Sfx.speak(S.voice,dur); Radio.cur={sp:pl.sp,seed:pl.seed,name:pl.name,english,alien,t:0,dur};
  },
  choose(i){
    if(!this.open) return; const pl=this.target.pilot, S=SPECIES[pl.sp]; Sfx.click();
    if(i===0){ if(this.asked.news){ this.say("I told you already. It was good news the first time."); return; } this.asked.news=1; let h; do{ h=Math.floor(Math.random()*PLANETS.length); }while(World.nearest&&h===World.nearest.idx&&World.nearest.dist<World.nearest.dropR); G.hot=h; this.say(fill(S.rumor,{planet:PLANETS[h].name})); UI.toast('Tip logged: '+PLANETS[h].name+' deliveries pay +50%','good'); }
    else if(i===1) this.say(pick(S.cargo));
    else if(i===2){ this.say(pick(S.nice)); if(!this.asked.nice&&Math.random()<0.3){ const tip=20+Math.floor(Math.random()*9)*10; G.credits+=tip; setTimeout(()=>{ UI.toast(pl.name+' wired you '+fmtCr(tip)+' for being nice','good'); Sfx.cash(); },1800); } this.asked.nice=1; }
    else if(i===3) this.say(pick(S.joke));
    else { this.say(pick(S.bye)); setTimeout(()=>this.close(),2600); }
  },
  update(dt){ if(!this.open) return; if(!this.target||Npc.list.indexOf(this.target)<0||this.target.dist>12000){ UI.toast('Signal lost','warn'); this.close(); return; }
    if(this.typer<this.text.length){ this.typer=Math.min(this.text.length,this.typer+dt*42); $('comms-text').textContent=this.text.slice(0,Math.floor(this.typer)); } },
  close(silent){ if(!this.open) return; this.open=false; this.target=null; $('comms').hidden=true; if(!silent&&Sfx.ok()) Sfx.beep(440); Radio.cur=null; Radio.wait=2; },
};
