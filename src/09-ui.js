/* ===================== UI: toasts, port, comms, radio ===================== */
const el = (tag, cls, html) => { const e=document.createElement(tag); if(cls) e.className=cls; if(html!==undefined) e.innerHTML=html; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const UI = {
  tab:'jobs', arrival:null,
  toast(msg, cls){ const t=el('div','toast'+(cls?' '+cls:''),esc(msg)); const box=$('toasts'); box.appendChild(t); while(box.children.length>3) box.removeChild(box.firstChild); setTimeout(()=>t.remove(),5200); },
  /* a story beat: who it happened to, and what happened (narration, so no alien speech line) */
  tale(t){ const q=el('div','quote tale'); q.appendChild(portraitCanvas(t.sp,t.seed,128)); const d=el('div'); d.innerHTML=`<div class="who">${esc(t.who)}</div><div class="say">${esc(t.text)}</div>`; q.appendChild(d); return q; },
  tell(e){ if(!e||!e.drop) return; (this.told=this.told||[]).unshift({sp:e.to.sp,seed:e.to.seed,who:e.to.name,text:e.drop}); if(this.told.length>3) this.told.length=3; },
  quote(spKey, seed, who, text){ const q=el('div','quote'); q.appendChild(portraitCanvas(spKey,seed,128)); const d=el('div'); d.innerHTML=`<div class="who">${esc(who)}</div><div class="alien">${esc(alienWords(spKey,text,seed))}</div><div class="say">${esc(text)}</div>`; q.appendChild(d); return q; },
  /* ---------- the port, in the scene: no side panel. A signpost beside each counter takes you between shops,
     the shop's offers sit along the counter as big price tags, contracts pop up as tickets over their model on
     the shelf, and the launch sign hangs in the corner. ---------- */
  showPort(P, arrival){
    this.P=P; this.arrival=arrival; this.told=null; this.tab='depot'; this.ticket=null; this.hushed=null; $('port').hidden=false; $('keys').hidden=true;
    this.render();
    if(arrival&&arrival.fee) setTimeout(()=>UI.toast(`Tow fee −${fmtCr(arrival.fee)}`,'warn'),900);
    if(!this.shelfHint){ this.shelfHint=true; setTimeout(()=>{ if(G.mode==='port'&&this.tab==='depot'&&G.jobs.length) UI.toast('Jobs are on the shelf. Tap a model to see its job.'); },2600); }
  },
  hidePort(){ $('port').hidden=true; $('bubble').hidden=true; $('shelf-tip').hidden=true; this.closeTicket(); this.chatStop(); },
  /* what is aboard for this port (contraband goes through the unloading crew instead) */
  due(P){ return P?G.cargo.filter(c=>c.to===P.idx&&!c.illegal&&c.kind!=='ore'):[]; },
  payFor(c){ return c.kind==='escort'?Math.round(c.pay*(0.5+0.5*c.hp/100)/5)*5:c.pay; },
  deliver(c, P, quiet){
    let pay, name; const end=Story.ending(c,P);
    if(c.kind==='escort'){ const r=Escort.land(P); if(!r){ Cockpit.drawManifest(); this.render(); return 0; } pay=r.pay; name=c.vip.title; }
    else { const i=G.cargo.indexOf(c); if(i<0) return 0; G.cargo.splice(i,1); pay=c.pay; name=c.kind==='pax'?c.good:`${c.qty}× ${c.good}`; G.rep=clamp(G.rep+1,-100,100); }
    G.credits+=pay; G.stats.deliveries++; G.stats.earned+=pay; this.tell(end);
    if(!quiet){ Sfx.clunk(); setTimeout(()=>Sfx.cash(),160); Venues.react('cash'); this.paidFx(pay); UI.toast(`${c.kind==='pax'||c.kind==='escort'?'Seen off':'Delivered'}: ${name} · +${fmtCr(pay)}`,'good'); Cockpit.drawManifest(); Game.save(); this.render(); }
    return pay; },
  deliverAll(P){ const due=this.due(P); let sum=0; for(const c of due) sum+=this.deliver(c,P,true); if(!due.length) return;
    Sfx.clunk(); setTimeout(()=>Sfx.cash(),160); setTimeout(()=>Sfx.cash(),420); Venues.react('cash'); this.paidFx(sum); UI.toast(`Delivered ${due.length} · +${fmtCr(sum)}`,'good'); Cockpit.drawManifest(); Game.save(); this.render(); },
  /* the money floats up from the counter */
  paidFx(n){ const f=el('div','paidfx','+'+fmtCr(n)); $('port').appendChild(f); setTimeout(()=>f.remove(),1900); },
  /* the launch sign: money, what's aboard, the hold and ship buttons, and Launch */
  stats(){ const used=G.cargo.reduce((s,c)=>s+c.qty,0);
    $('port-foot').innerHTML=`<b class="cr">${fmtCr(G.credits)}</b><span>${G.cargo.length?`${G.cargo.length} contract${G.cargo.length>1?'s':''} · ${used} of ${holdCap()} units`:'Hold empty'}</span>`;
    const t=$('port-top-btns'); t.innerHTML=''; const hb=el('button','btn','Hold'); hb.onclick=()=>Hold.toggle(true); const sb=el('button','btn','Ship'); sb.title="Your ship's specs"; sb.onclick=()=>Specs.show(); t.append(hb,sb); },
  shipLink(){ const b=el('button','shiplink',esc(SHIPS[G.shipId].name)); b.title="Show this ship's specs"; b.onclick=()=>Specs.show(); return b; },
  /* the shopkeeper's hello, in the speech bubble over their head */
  keeper(d, line){ const P=this.P, seed=Venues.keeperSeed(P,d), S=SPECIES[d.sp];
    this.bubble={who:`${Venues.keeperName(P,d)} · ${d.title}`,say:line||d.hi[(G.stats.deliveries+seed)%d.hi.length],quirk:`${S.name}. ${d.quirk}`}; this.showBubble(); },
  say(who, text, quirk){ this.bubble={who,say:text,quirk:quirk||''}; this.showBubble(); },
  /* tap a speech bubble to dismiss it; tap the alien who said it to bring it back */
  hush(){ const V=Venues.active; if(!V) return; this.hushed=V; $('bubble').hidden=true; if(Sfx.ok()) Sfx.click(); },
  showBubble(){ const b=$('bubble'), q=this.bubble; if(!b||!q) return; b.querySelector('.who').textContent=q.who; b.querySelector('.say').textContent=q.say; },
  /* the signpost beside the counter: one arm per place in this port */
  post(){ const P=this.P, nav=$('port-tabs'); nav.innerHTML=''; const arms=Venues.defs(P).map(d=>[d.k,VENUE_TABS[d.k]]);
    // residents and landmarks are scenery around the port; the signpost only lists places you can do business
    arms.forEach(([k,label],i)=>{ const b=el('button','arm '+(i%2?'r':'l')+(k===this.tab?' on':''),esc(label)); b.dataset.k=k; if(k===this.tab) b.setAttribute('aria-current','true');
      b.onclick=()=>this.go(k); nav.appendChild(b); }); },
  go(k){ if(this.tab===k) return; Sfx.click(); this.tab=k; this.closeTicket(); Cine.setPreview(null); this.render(); },
  /* contracts: tapping a model on the shelf pops up its ticket above it */
  focusJob(j){ if(this.tab!=='depot') this.go('depot'); this.openTicket(j); },
  openTicket(j){ const P=this.P; if(!P||G.jobs.indexOf(j)<0) return; this.ticket=j; const box=$('port-card'); box.innerHTML=''; box.hidden=false; box.className='ticket'+(j.kind==='contra'?' shady':'');
    const T=PLANETS[j.to], dist=P.pos.distanceTo(T.pos), rk=Econ.risk(P,T), rtag=rk>=2?`<span class="tag r${rk}">${RISK[rk].name.toUpperCase()} RISK</span>`:'';
    let h3, meta; let used=0; G.cargo.forEach(c=>used+=c.qty);
    if(j.kind==='escort'){ h3=`Escort ${esc(j.vip.title)}<span class="tag esc">ESCORT</span>${rtag}`; meta=`To <i>${esc(T.name)}</i> · ${(dist/LS).toFixed(1)} ls · ${Econ.riskLine(P,T)} · needs a free seat`; }
    else if(j.kind==='contra'){ h3=`${j.qty}× ${esc(j.good)}<span class="tag bad">CONTRABAND</span>${rtag}`; meta=`To <i>${esc(T.name)}</i> · ${Econ.riskLine(P,T)} · caught loading ${Math.round(Customs.risk(P)*100)}% · unloading ${Math.round(Customs.risk(T)*100)}%`; }
    else { h3=`${j.qty}× ${esc(j.good)}${j.hot?'<span class="tag">HOT +50%</span>':''}${j.fragile?'<span class="tag bad">FRAGILE</span>':''}${rtag}`; meta=`To <i>${esc(T.name)}</i> · ${(dist/LS).toFixed(1)} ls · ${Econ.riskLine(P,T)} · full pay within ${fmtTime(Cargo.est({from:P.idx,to:j.to}))}`; }
    const x=el('button','close','✕'); x.setAttribute('aria-label','Close'); x.onclick=()=>{ Sfx.click(); this.closeTicket(); }; box.appendChild(x);
    box.appendChild(el('div','mid',`<h3>${h3}</h3><div class="meta">${meta}</div><p>${esc(j.story?j.story.pick:j.note)}</p>${j.story?`<p class="lbl">${j.kind==='escort'?'':'Label: '}${esc(j.note)}</p>`:''}`));
    const busy=j.kind==='escort'&&G.cargo.some(c=>c.kind==='escort'), noSeat=j.kind==='escort'&&Cargo.pax().length>=Cargo.seats(), fits=used+j.qty<=holdCap()&&!busy&&!noSeat;
    const r=el('div','right'); r.appendChild(el('div','pay',fmtCr(j.pay))); const b=el('button','big',busy?'One at a time':noSeat?'No seats':fits?'Accept':'No room'); b.disabled=!fits;
    b.onclick=()=>{ this.closeTicket(); if(j.kind==='contra'){ Customs.load(j,P); return; }
      if(j.kind==='escort') G.cargo.push({kind:'escort',good:j.good,qty:0,to:j.to,pay:j.pay,from:P.idx,vip:j.vip,hp:100,story:j.story});
      else { G.cargo.push({good:j.good,qty:j.qty,to:j.to,pay:j.pay,from:P.idx,fresh:true,fragile:!!j.fragile,story:j.story}); Venues.fetch(j.good,j); }
      G.jobs.splice(G.jobs.indexOf(j),1); Sfx.clunk(); Venues.react('clap'); if(!G.cargo.some(c=>c.to===G.target)) Game.setTarget(j.to,true); Cockpit.drawManifest(); Game.save(); this.render(); };
    r.appendChild(b); box.appendChild(r); Venues.hopShelf(j); if(Sfx.ok()) Sfx.click(); },
  closeTicket(){ this.ticket=null; const b=$('port-card'); if(b){ b.hidden=true; b.innerHTML=''; } },
  /* a price tag on the counter: icon, name, a short line, price and button(s) */
  card(body, ic, title, desc, meta, price, label, dis, fn, more){ const c=el('div','card'); const head=el('div','head'); head.appendChild(typeof ic==='string'?this.icon(ic):ic); head.appendChild(el('h3','',title)); c.appendChild(head);
    if(desc) c.appendChild(el('p','',desc)); if(meta) c.appendChild(el('div','meta',meta));
    const r=el('div','right'); r.appendChild(el('div','pay',price)); (more||[]).forEach(m=>r.appendChild(m));
    if(label){ const b=el('button','btn',label); b.disabled=dis; b.onclick=()=>{ fn(); Game.save(); this.render(); }; r.appendChild(b); } c.appendChild(r); body.appendChild(c); return c; },
  /* who else is here: residents or landmarks, one name plate with arrows to step through them */
  plate(body){ const res=this.tab==='residents', mod=res?ResidentDistrict:PortSites;
    const list=res?mod.entries.slice().sort((a,b)=>a.person.name.localeCompare(b.person.name)):mod.entries.slice(); if(!list.length) return;
    if(!mod.selected){ if(res) mod.choose(list[0].person.id); else mod.pick(list[0]); }
    const cur=mod.selected, i=Math.max(0,list.indexOf(cur)), step=d=>{ const n=list[(i+d+list.length)%list.length]; Sfx.click(); if(res) mod.choose(n.person.id); else mod.pick(n); this.render(); };
    const c=el('div','card plate'); const prev=el('button','btn step','◀'), next=el('button','btn step','▶'); prev.setAttribute('aria-label','Previous'); next.setAttribute('aria-label','Next'); prev.onclick=()=>step(-1); next.onclick=()=>step(1);
    let title, line;
    if(res){ const r=cur.person, m=ResidentModels.cast.find(x=>x.id===r.base); title=esc(r.name); line=`${esc(m.role)} · ${esc(m.name)}<br>${esc(cur.venue.def.name)}`; }
    else { title=esc(cur.name); line=(cur.annex?`The ${esc(cur.annex)} annex, built to the same plans as the planetside original. `:'')+esc(PortSites.kind(cur.info.type))+' · '+esc(cur.info.habit); }
    const mid=el('div','mid',`<h3>${title}</h3><p>${line}</p><div class="meta">${i+1} of ${list.length}</div>`);
    if(list.length>1) c.appendChild(prev); c.appendChild(mid); if(list.length>1) c.appendChild(next); body.appendChild(c); },
  /* cantina chatter: the locals take turns in the speech bubble */
  chatStop(){ if(this.chatT){ clearInterval(this.chatT); this.chatT=null; } },
  chat(lines){ this.chatStop(); let k=0; this.chatT=setInterval(()=>{ if(G.mode!=='port'||this.tab!=='bar'){ this.chatStop(); return; } const L=lines[k++%lines.length]; this.say(L.who,L.text); },7000); },
  render(){
    const P=this.P, body=$('port-body'); if(!P) return; body.innerHTML=''; this.stats(); this.chatStop();
    if(this.ticket&&G.jobs.indexOf(this.ticket)<0) this.closeTicket();
    if(this.tab==='residents'||this.tab==='stations'){ this.bubble=null; $('bubble').hidden=true; this.post(); this.plate(body); body.classList.toggle('empty',!body.children.length); return; }
    const d=SHIPS[G.shipId], v=Venues.def(P,this.tab)||Venues.defs(P)[0]; this.tab=v.k; this.post(); let used=0; G.cargo.forEach(c=>used+=c.qty);
    const cash=()=>{ Sfx.cash(); Venues.react('cash'); };
    if(this.tab==='depot'){
      const a=this.arrival; this.keeper(v,a?a.greet:null);
      // what happened to the last deliveries: the recipient has a word, in the bubble
      if(this.told&&this.told.length){ const t=this.told[0]; this.say(t.who,t.text,'What happened next'); }
      // deliveries for this port, handed over one at a time
      const due=this.due(P);
      due.forEach(c=>{ const person=c.kind==='pax'||c.kind==='escort', sp=c.kind==='escort'?c.vip.sp:c.sp, seed=c.kind==='escort'?c.vip.seed:c.seed;
        const title=c.kind==='escort'?esc(c.vip.title):person?esc(c.good):`${c.qty}× ${esc(c.good)}`;
        const desc=c.kind==='escort'?`Your VIP, calm ${Math.round(c.hp)}%.`:c.kind==='pax'?'Your passenger, ready to get off.':c.story?`For ${esc(c.story.to.name)}.`:'Delivery for this port.';
        this.card(body,person?portraitCanvas(sp,seed,128):'📦',title,desc,'',fmtCr(this.payFor(c)),person?'See them off':'Hand it over',false,()=>this.deliver(c,P)).classList.add('due'); });
      if(due.length>1){ const sum=due.reduce((s,c)=>s+this.payFor(c),0); this.card(body,'✔','Hand over everything',`${due.length} deliveries for ${esc(P.port)}.`,'',fmtCr(sum),'Hand over all',false,()=>this.deliverAll(P)).classList.add('due'); }
      const ppu=Econ.fuelPrice(P), need=Math.ceil(d.fuel-G.fuel), cost=need*ppu;
      // the fuel tag only shows while there's room in the tank
      if(need>0) this.card(body,'⛽','Fuel',`Tank at ${Math.round(G.fuel/d.fuel*100)}%. ${ppu} cr a unit${P.station?', the price of being far away':''}.`,'',need>0?fmtCr(cost):'Full',need<=0?'Full':G.credits>=cost?'Fill tank':G.credits>=ppu?'Buy what I can':'Beg',need<=0,()=>{
        if(G.credits>=cost){ G.credits-=cost; G.fuel=d.fuel; } else if(G.credits>=ppu){ const u=Math.floor(G.credits/ppu); G.fuel+=u; G.credits-=u*ppu; } else { G.fuel=Math.max(G.fuel,d.fuel*0.4); UI.toast('The dockmaster sighs and tops you up to 40%','good'); } Sfx.hiss(1,0.2); });
      // jobs with no model on the shelf (escorts, or a board too long for it) get a ticket button here
      const onShelf=new Set(G.jobs.filter(j=>j.kind!=='escort').slice(0,12));
      G.jobs.filter(j=>!onShelf.has(j)).forEach(j=>{ const T=PLANETS[j.to]; const c=this.card(body,portraitCanvas(j.sp,j.seed,128),j.kind==='escort'?`Escort ${esc(j.vip.title)}`:`${j.qty}× ${esc(j.good)}`,`To ${esc(T.name)}.`,'',fmtCr(j.pay),'',false,null,[]);
        const b=el('button','btn','Details'); b.onclick=()=>this.openTicket(j); c.querySelector('.right').appendChild(b); });
      if(!G.jobs.length) this.card(body,'🗒','No contracts','The board is empty. Fly somewhere else and come back.','','','',true,null);
    } else if(this.tab==='yard'){
      this.keeper(v); const val=Specs.value();
      { const can=G.shipId!==0&&Specs.fits(0); this.card(body,'🏷',`Sell your ${esc(d.name)}`,G.shipId===0?'Nobody buys a Rustbucket.':can?`You get ${fmtCr(val)} and a free Rustbucket to get home in.`:'Deliver some cargo first: it won\'t fit in a Rustbucket.','',G.shipId===0?'—':fmtCr(val),'Sell',!can,()=>{ const name=d.name; G.credits+=val; Specs.change(0,P); cash(); UI.toast(`Sold the ${name} for ${fmtCr(val)}. The Rustbucket rattles in a way that sounds pleased.`,'good'); }); }
      v.ships.forEach(i=>{ const sh=SHIPS[i]; const cv=makeCanvas(128,128), x=cv.getContext('2d'); x.fillStyle='#0b1620'; x.fillRect(0,0,128,128); x.fillStyle=sh.ck.trim; x.font=`700 76px ${FONT_DISP}`; x.textAlign='center'; x.textBaseline='middle'; x.fillText(['I','II','III','IV','V'][i],64,68);
        const net=Math.max(0,sh.price-val), mine=i===G.shipId; const pv=el('button','btn','Preview'); pv.onclick=()=>{ Sfx.click(); Cine.setPreview(i); }; const sp=el('button','btn','Specs'); sp.onclick=()=>Specs.show(i);
        const c=this.card(body,cv,esc(sh.name)+(mine?'<span class="tag">YOURS</span>':''),esc(sh.tag),mine?'':`After trade-in`,mine?'—':fmtCr(net),mine?'':Specs.fits(i)?'Buy':'Too small',G.credits<net||!Specs.fits(i),()=>{ G.credits-=net; Specs.change(i,P); cash(); UI.toast('You now own the '+sh.name+'. New ship smell included.','good'); },[pv,sp]); });
    } else if(this.tab==='garage'){
      const hn=Math.ceil(100-G.hull), hc=hn*5, dirty=G.sys.dirt>=0.05; this.keeper(v,hn<=0&&!dirty?'Not a scratch on her, and the glass is clean. Come back when you hit something.':null);
      // each tag only shows while there's something to fix
      if(hn>0) this.card(body,'🔧','Hull repairs',`Hull at ${Math.round(G.hull)}%. ${G.hull<50?'It whistles when you turn.':G.hull<100?'A few dents.':'Not a scratch.'}`,'5 cr a point',hn>0?fmtCr(hc):'Fine',hn<=0?'Fine':G.credits>=hc?'Repair':'Patch what I can',hn<=0||G.credits<5,()=>{ const pts=Math.min(hn,Math.floor(G.credits/5)); G.credits-=pts*5; G.hull=Math.min(100,G.hull+pts); Sfx.clunk(); Venues.react('clap'); });
      if(dirty) this.card(body,'✦','Canopy wash',G.sys.dirt>0.3?'Yours is a disgrace.':'Yours is fine, honestly.','',fmtCr(20),'Wash',G.credits<20||G.sys.dirt<0.05,()=>{ G.credits-=20; G.sys.dirt=0; Sfx.hiss(1.5,0.2); Venues.react('clap'); });
    } else if(this.tab==='livery'){
      this.keeper(v,`${G.paint?'Currently wearing '+G.paint.name+'.':'Factory finish, is it?'} Pick a colour.`);
      const sw=(hull,trim)=>{ const cv=makeCanvas(128,128), x=cv.getContext('2d'); x.fillStyle=hull; x.fillRect(0,0,128,128); x.fillStyle=trim; x.fillRect(0,78,128,22); x.fillRect(0,108,128,8); x.strokeStyle='rgba(0,0,0,.35)'; x.lineWidth=4; x.strokeRect(2,2,124,124); return cv; };
      const apply=(pt)=>{ G.paint=pt; Cine.setModel(G.shipId); Cine.dock(P); };
      v.paints.forEach(k=>{ const pt=PAINTS[k], on=G.paint&&G.paint.name===pt.name; this.card(body,sw(pt.hull,pt.trim),esc(pt.name)+(on?'<span class="tag">ON</span>':''),esc(pt.note),'',fmtCr(pt.price),on?'Applied':'Paint it',on||G.credits<pt.price,()=>{ G.credits-=pt.price; apply({name:pt.name,hull:pt.hull,trim:pt.trim}); cash(); UI.toast(`Your ship is now ${pt.name}`,'good'); }); });
      const f=Models.SCHEMES[Math.min(SHIPS[G.shipId].model,4)]; this.card(body,sw(f.hull,f.trim),'Factory finish','How it left the factory.','',fmtCr(100),G.paint?'Restore':'Applied',!G.paint||G.credits<100,()=>{ G.credits-=100; apply(null); cash(); });
    } else if(this.tab==='outfit'){
      this.keeper(v);
      const items={ hidden:()=>this.card(body,'🗄','Hidden compartment','Halves the chance of contraband being found, and adds one unit of hold.','',G.up.hidden?'Installed':fmtCr(2500),G.up.hidden?'Installed':'Install',G.up.hidden||G.credits<2500,()=>{ G.credits-=2500; G.up.hidden=true; cash(); }),
        laser:()=>this.card(body,'⚡','Mining laser Mk II','Cuts rock nearly twice as fast and runs cooler.','',G.up.laser>1?'Installed':fmtCr(1800),G.up.laser>1?'Installed':'Install',G.up.laser>1||G.credits<1800,()=>{ G.credits-=1800; G.up.laser=2; cash(); }) };
      v.items.forEach(k=>items[k]());
    } else if(this.tab==='assay'){
      const ores=G.cargo.filter(c=>c.kind==='ore'); this.keeper(v,ores.length?null:'No ore? Mine some in the asteroid fields and bring it here. Prices differ from port to port.');
      ores.forEach(c=>{ const pr=Mining.price(c,P); this.card(body,'⛏',`${c.qty}× ${esc(c.good)}`,`${fmtCr(pr)} a unit today.`,'',fmtCr(c.qty*pr),'Sell',false,()=>{ const cr=Mining.sell(c,P); G.stats.earned+=cr; cash(); UI.toast(`Sold for ${fmtCr(cr)}`,'good'); Cockpit.drawManifest(); }); });
    } else {
      this.keeper(v);
      const r=mulberry32(P.idx*31+G.stats.deliveries); const locals=[P.species, ALIEN_POOL[Math.floor(r()*ALIEN_POOL.length)], ALIEN_POOL[Math.floor(r()*ALIEN_POOL.length)]];
      const lines=locals.map((sp,i)=>{ const seed=P.idx*100+i*17+G.stats.deliveries, S=SPECIES[sp]; return {who:alienName(sp,seed)+' · '+S.name,text:fill(S.chat[Math.floor(r()*S.chat.length)],{planet:PLANETS[Math.floor(r()*PLANETS.length)].name,good:GOODS[Math.floor(r()*GOODS.length)][0]})}; });
      lines.unshift({who:this.bubble.who,text:this.bubble.say}); this.chat(lines);
      this.card(body,'☕','Buy a round','Pilots talk when someone else is paying.',G.hot!=null?'Tip: <i>'+esc(PLANETS[G.hot].name)+'</i> pays +50%':'',fmtCr(30),'Buy',G.credits<30,()=>{ G.credits-=30; let h; do{ h=Math.floor(Math.random()*PLANETS.length); }while(h===P.idx); G.hot=h; const sp=pick(locals); Sfx.speak(SPECIES[sp].voice,2.5,true); Venues.react('cash'); Game.genJobs(P.idx);
        setTimeout(()=>{ this.chatStop(); this.say('Overheard · '+SPECIES[sp].name,fill(SPECIES[sp].rumor,{planet:PLANETS[h].name})); },0); });
      // passengers looking for a ride
      const seats=Cargo.seats(), taken=Cargo.pax().length;
      (G.paxJobs||[]).forEach(j=>{ const T=PLANETS[j.to];
        this.card(body,portraitCanvas(j.sp,j.seed,128),esc(j.good)+'<span class="tag">PASSENGER</span>',`${esc(SPECIES[j.sp].name)}, ${esc(j.why)}.`,`To <i>${esc(T.name)}</i> · ${Econ.line(P,T)} · ${seats-taken} of ${seats} seats free`,fmtCr(j.pay),taken>=seats?'No seats':'Take them',taken>=seats,()=>{
          G.cargo.push({kind:'pax',good:j.good,sp:j.sp,seed:j.seed,qty:0,to:j.to,pay:j.pay,from:P.idx,story:j.story}); G.paxJobs.splice(G.paxJobs.indexOf(j),1); Sfx.clunk(); Venues.react('clap'); if(!G.cargo.some(c=>c.to===G.target)) Game.setTarget(j.to,true); Cockpit.drawManifest(); }); });
    }
    body.classList.toggle('empty',!body.children.length); Venues.syncShelf(G.jobs);
    if(this.ticket) this.openTicket(this.ticket);
  },
  /* keep the signpost and the ticket pinned to the scene; called every frame from the port camera */
  place(V, cam){ const W=World.w, H=World.h, nav=$('port-tabs'), body=$('port-body'), floor=H-(body.classList.contains('empty')?0:body.offsetHeight)-8, top=$('port-bar').getBoundingClientRect().bottom+10;
    const p=new V3(); let x=W-nav.offsetWidth/2-20, y=top+nav.offsetHeight;
    // on a narrow screen the signpost docks under the top bar instead of standing beside the counter
    const dock=W<760; nav.classList.toggle('dock',dock); if(dock){ x=W/2; }
    else if(V&&V.post&&this.tab!=='residents'&&this.tab!=='stations'&&!(Cine.preview&&V.show)){ V.post.getWorldPosition(p); const v=p.project(cam); if(v.z<1){ x=(v.x+1)/2*W; y=(1-v.y)/2*H; } }
    x=clamp(x,nav.offsetWidth/2+12,W-nav.offsetWidth/2-12); y=clamp(y,top+nav.offsetHeight,floor); nav.style.left=x+'px'; nav.style.top=y+'px';
    const box=$('port-card'); if(this.ticket&&!box.hidden){ const it=V&&V.shelf&&V.shelf.items.find(i=>i.job===this.ticket); let tx=W/2, ty=floor;
      if(it){ it.o.getWorldPosition(p); p.y+=1.3; const v=p.project(cam); if(v.z<1){ tx=(v.x+1)/2*W; ty=(1-v.y)/2*H; } }
      const bw=box.offsetWidth, bh=box.offsetHeight; tx=clamp(tx,bw/2+12,W-bw/2-12); ty=clamp(ty,top+bh,floor); box.style.left=tx+'px'; box.style.top=ty+'px'; } },
  icon(ch){ const cv=makeCanvas(128,128), x=cv.getContext('2d'); x.fillStyle='#0b1620'; x.fillRect(0,0,128,128); x.fillStyle='#ffb454'; x.font='72px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(ch,64,70); return cv; },
};

/* ---------- radio chatter ---------- */
const Radio = {
  cur:null, wait:4, last:'',
  retune(){ this.cur=null; this.wait=Math.max(this.wait,2); if(Sfx.ok()) Sfx.click(); },
  subs(){ return {planet:pick(PLANETS).name, good:pick(GOODS)[0]}; },
  play(m){ m.alien=alienWords(m.sp,m.english,Math.floor(Math.random()*1e6)); m.t=0; m.dur=clamp(m.english.length*0.058,2.4,7.5); this.cur=m; if(G.sys.power&&G.sys.radioVol>0.01) Sfx.speak(SPECIES[m.sp].voice,m.dur); },
  next(){
    this.wait=30; if(Math.random()<0.88&&Calls.ring()) return;
    const ch=G.sys.channel, near=World.nearest||PLANETS[0]; let m;
    const pilotLine=()=>{ const cands=Npc.list.filter(n=>n.dist<40000); const pl=cands.length&&Math.random()<0.75?pick(cands).pilot:Npc.pilot(); const S=SPECIES[pl.sp]; return {sp:pl.sp,seed:pl.seed,name:pl.name,english:fill(pick(S.chat),this.subs())}; };
    const portLine=()=>({sp:near.species,seed:near.idx*7+1,name:near.port+' Control',english:fill(pick(CHATTER.port),{port:near.port,planet:near.name})});
    const tradeLine=()=>{ const sp=pick(['qeeble','zkthar','beepul']); return {sp,seed:4242,name:'Trade Net',english:G.hot!=null&&Math.random()<0.3?`Trade Net bulletin: ${PLANETS[G.hot].name} is paying bonus rates on all deliveries.`:fill(pick(CHATTER.trade),this.subs())}; };
    if(ch===0){ const r=Math.random(); m=r<0.72?pilotLine():r<0.86?portLine():tradeLine(); } else if(ch===1) m=tradeLine(); else if(ch===2) m=portLine(); else m={sp:'blorpax',seed:808,name:'DJ Glorp',english:fill(pick(CHATTER.dj),this.subs())};
    if(m.english===this.last) return; this.last=m.english; this.play(m);
  },
  update(dt){
    // away from the cockpit you hear nothing from the radio; only a passenger you are talking to shows up
    if(Walk.on){ if(this.cur){ this.cur.t+=dt; if(this.cur.t>this.cur.dur+2.6) this.cur=null; } return; }
    if(Comms.open){ if(this.cur) this.cur.t+=dt; return; } this.wait-=dt; if(this.cur){ this.cur.t+=dt; if(this.cur.t>this.cur.dur+2.6&&!(Dlg.open&&Dlg.mini)) this.cur=null; return; }
    if(!G.sys.power||Dlg.open||Faults.has('fuse')) return; if(this.wait<=0) this.next();
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
