/* ===================== THE HAUL-O-PEDIA ===================== */
/* Everything the game does, explained in one place. Two rules keep it honest:
   1. Every figure is read from the game's own tables and rules when a page is opened (ship prices, pay rates, what each
      reputation is worth, where the ore is), so the book cannot fall out of step with the game.
   2. It starts with only what a new pilot needs: how to fly, how a contract pays, what it costs. Everything else is
      written in as you meet it. See a fault and the Faults page appears; walk into a cantina and the mechanic is in the
      book. What you know is kept in the save (G.know: 1 = new and unread, 2 = read). */
const PEDIA_TOPICS = {
  ports:'Ports and shops', garage:'Garages and hull repairs', bar:'Cantinas: passengers, mechanics and tips', ships:'Ships', outfit:'Ship fittings',
  rep:'Reputation', faults:'Faults and repairs', crack:'Hull cracks', tow:'Tows', fragile:'Fragile cargo', storm:'Meteor storms',
  escort:'VIP escorts', customs:'Customs and contraband', mayday:'Maydays', deep:'Deep space', mining:'Mining', end:'The end of the galaxy' };
const Pedia = {
  open:false, page:0, t:0,
  has(k){ return !k||!!(G.know&&G.know[k]); },
  fresh(k){ return !!(k&&G.know&&G.know[k]===1); },
  /* write a topic into the book the first time you meet it */
  learn(k, quiet){ if(!PEDIA_TOPICS[k]) return; const K=G.know||(G.know={}); if(K[k]) return; K[k]=quiet?2:1;
    if(!quiet&&G.mode!=='title'&&G.mode!=='boot') setTimeout(()=>UI.toast(`📖 Haul-O-Pedia: new entry, ${PEDIA_TOPICS[k]}. Press O to read it.`,'good'),1200); },
  /* what walking into each kind of shop teaches you */
  visit(tab){ this.learn('ports'); const k={garage:'garage',bar:'bar',yard:'ships',outfit:'outfit',assay:'mining'}[tab]; if(k) this.learn(k);
    if(tab==='depot'){ if((G.jobs||[]).some(j=>j.kind==='contra')) this.learn('customs'); if((G.jobs||[]).some(j=>j.kind==='escort')) this.learn('escort'); if((G.jobs||[]).some(j=>j.fragile)) this.learn('fragile'); } },
  /* things you only meet in flight, looked for about once a second */
  update(dt){ this.t-=dt; if(this.t>0) return; this.t=1;
    if(Deep.z>0) this.learn('deep'); if(Deep.storm) this.learn('storm'); if(Distress.cur) this.learn('mayday'); if(Customs.cur) this.learn('customs');
    if(Nav.wp&&Nav.wp.kind==='field'||G.cargo.some(c=>c.kind==='ore')) this.learn('mining'); if(G.cargo.some(c=>c.fragile)) this.learn('fragile');
    if(G.shipId>=Restaurant.top()-1||Nav.wp&&Nav.wp.kind==='restaurant') this.learn('end'); },
  /* a save from before the book kept track: a seasoned pilot knows it all, a new one starts from the beginning */
  restore(know, d){ if(know&&typeof know==='object'){ G.know={}; for(const k in PEDIA_TOPICS) if(know[k]) G.know[k]=know[k]===1?1:2; G.know.fseen=Array.isArray(know.fseen)?know.fseen.filter(k=>FAULT_DEFS[k]):[]; return; }
    G.know={fseen:[]}; if(d&&d.stats&&d.stats.deliveries>=10){ for(const k in PEDIA_TOPICS) G.know[k]=2; G.know.fseen=Object.keys(FAULT_DEFS); } },
  /* a kind of fault met for the first time gets its own line on the Faults page */
  fault(id){ const K=G.know||(G.know={}), L=K.fseen||(K.fseen=[]); if(!L.includes(id)){ L.push(id); if(K.faults) K.faults=1; } this.learn('faults'); if(FAULT_DEFS[id].garage) this.learn('crack'); },
  count(){ return Object.keys(PEDIA_TOPICS).filter(k=>this.has(k)).length; },

  /* small builders: a table, a list of terms, a paragraph. Rows that are false (not yet discovered) are dropped */
  tbl(head, rows){ return `<div class="ptbl"><table><thead><tr>${head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.filter(Boolean).map(r=>`<tr>${r.map((c,i)=>`<td${i?'':' class="k"'}>${esc(String(c))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; },
  dl(rows){ rows=rows.filter(Boolean); return rows.length?`<dl class="pdl">${rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`:''; },
  p(...t){ return t.filter(Boolean).map(x=>`<p>${esc(x)}</p>`).join(''); },
  h(t){ return `<h3>${esc(t)}</h3>`; },
  pct(v){ return (v>=0?'+':'')+Math.round(v*100)+'%'; },
  ls(d){ return (d/LS).toFixed(1)+' ls'; },
  /* run something as if you flew ship i, or stood at reputation v, and put things back */
  asShip(i, fn){ const k=G.shipId; G.shipId=i; try{ return fn(); } finally { G.shipId=k; } },
  asRep(v, fn){ const k=G.rep; G.rep=v; try{ return fn(); } finally { G.rep=k; } },

  /* every page there is. need: the topic that puts it in the book (none: there from the start) */
  pages(){ const T=this, K=k=>T.has(k), top=Restaurant.top(), goods=GOODS.map(g=>g[1]), far=['Patrolled space','Frontier','Deep space','The far dark'], seen=G.seen||[];
    return [
    {t:'Start here', f:()=>T.p('You own one tired freighter. People pay you to move things from one port to another. Do it well and you can buy a bigger ship, which gets bigger contracts, which buys a bigger ship still.')
      +T.h('One trip, start to finish')+T.dl([['1. Take work','At a port, open the Cargo depot and take contracts. Each says where it goes and what it pays.'],['2. Launch','Press Launch. The port lifts you off.'],['3. Fly there','Point at your destination, set the throttle and switch on the warp drive. It drops out on its own near a planet.'],['4. Land','Keep flying toward the planet. The port brings you down automatically.'],['5. Get paid','Deliveries pay the moment you land.'],['6. Spend it','Refuel before you leave. Save what is left.']])
      +T.h('Where to look things up')+T.dl([['This book','Press O at any time, or the Pedia button in a port.'],['The controls','Press ? or F1 for the flight manual. They are also on the Flying page here.'],['The map','Press M. Click a world to set your course.'],K('rep')&&['Your standing','The REP page of the cockpit\'s centre display, or the button with your reputation on it in any port.'],['Your ship','The Ship button in any port.']])
      +T.h('This book grows')+T.p(`It starts with what you need to fly your first contract. New pages and entries are written in as you meet things: ${T.count()} of ${Object.keys(PEDIA_TOPICS).length} discovered so far. A page marked NEW has something you have not read.`)},

    {t:'Flying', f:()=>T.p('Steer, set a speed, and use the warp drive for anything further than the next rock. The drive will not engage close to a planet or the sun: fly clear first.')
      +T.h('Things worth knowing')+T.dl([['Warp','Fast, and thirsty: it burns 1.5 units of fuel every second. Normal flight burns almost nothing.'],['Autopilot','Steers you to your destination. It does not manage your speed or your fuel.'],['Arriving','The drive drops out near a planet. Fly on in and the port lands you.'],['Out of fuel','You drift until a tow-barge brings you in, for a fee. Refuel before you launch.'],K('fragile')&&['Fragile cargo','Throttle 8 and above, and hard turns at speed, damage it.'],K('storm')&&['Meteor storms','Drop to throttle 4 or lower and stay out of warp until it passes.'],K('faults')&&['Walking about','Press L to leave your seat. Walk back to the cockpit door and press L to sit.']])
      +T.h('Keys')+`<div class="pkeys">${[...document.querySelectorAll('#help dl')].map(d=>`<dl class="${d.className}">${d.innerHTML}</dl>`).join('')}</div>`},

    {t:'Contracts and pay', f:()=>T.p('A contract pays for how much you carry and how far you carry it. Everything else is a multiplier on top.')
      +T.h('How a cargo contract is priced')+T.dl([['Per unit of cargo',`${Econ.unitPay(0)} cr, plus ${Econ.unitPay(1)-Econ.unitPay(0)} cr for every light-second of distance`],['The goods',`Some pay more than others: from ×${Math.min(...goods)} to ×${Math.max(...goods)}`],['The route\'s risk',(K('deep')?RISK:RISK.slice(0,2)).map(r=>`${r.name} ×${r.mul}`).join(' · ')+(K('deep')?'':' · and more, further out')],K('bar')&&['A hot tip','+50% to one world. Buy a round in a cantina to hear which.'],K('rep')&&['Your reputation',`From ${T.pct(T.asRep(-100,()=>Rep.payMul())-1)} to ${T.pct(T.asRep(100,()=>Rep.payMul())-1)}. See Reputation.`],K('fragile')&&['Fragile cargo','Pays 40% more, and loses value if you fly roughly.'],['Luck','Every offer is 15% under to 20% over the going rate.']])
      +T.h('Size')+T.p('Contracts are sized to your hold. A bigger ship is offered bigger loads, so it earns more on every trip.')
      +T.h('Being late')+T.p('Most contracts have a time they expect to arrive. Miss it and the pay starts to drop, down to as little as 30% of what was agreed.'+(K('rep')?' Very late deliveries also cost you reputation.':''))
      +(K('bar')||K('escort')||K('customs')||K('mining')||K('mayday')?T.h('Other work')+T.dl([K('bar')&&['Passengers','Offered in cantinas. Each takes a seat, not hold space. Fares start at 170 cr and rise with distance.'],K('escort')&&['VIP escorts','Fly with a nervous VIP and keep them calm. Starts at 400 cr and pays well over distance. Not offered to a bad name.'],K('customs')&&['Back-room contracts','Contraband. It pays for the chance of being caught. See Customs and contraband.'],K('mining')&&['Mining','Cut ore from asteroid fields and sell it at an Assay office. See Mining.'],K('mayday')&&['Maydays','Stop for a ship in trouble, or do not. Rescues are worth reputation. Flying past costs it.']]):'')},

    {t:'Your ship', need:null, hide:()=>K('ships'), f:()=>{ const i=G.shipId, s=SHIPS[i]; return T.p('This is the '+s.name+'. '+s.tag)
      +T.dl([['Hold',s.hold+' units'],['Passenger seats',String(SEATS[Math.min(s.model,SEATS.length-1)])],['Warp speed',Math.round(s.warp/1000)+'k km a second'],['Fuel tank',s.fuel+' units'],['Range on a full tank',T.ls(Restaurant.range(i))+' at warp'],['Breakdowns',Specs.reliability(s.faults)]])
      +T.p('There are other ships. Find a Shipyard to see them.'); }},

    {t:'Ships', need:'ships', f:()=>T.p('Five ships, each about twice the last. A yard gives you half a ship\'s price back in trade, less the cost of mending its hull.')
      +T.tbl(['Ship','Price','Hold','Seats','Warp speed','Tank','Range','Breakdowns'],SHIPS.map((s,i)=>[s.name+(i===G.shipId?' (yours)':''),s.price?fmtCr(s.price):'Free',s.hold+' units',SEATS[Math.min(s.model,SEATS.length-1)],Math.round(s.warp/1000)+'k km/s',s.fuel,T.ls(Restaurant.range(i)),Specs.reliability(s.faults)]))
      +T.h('What each costs to run')+T.tbl(['Ship','Fuel, a unit','Fuel at a far station','Hull repair, a point','A full tank'],SHIPS.map((s,i)=>T.asShip(i,()=>[s.name,Econ.fuelPrice(PLANETS[0])+' cr',Econ.fuelPrice({station:true})+' cr',T.asRep(0,()=>Rep.repairPrice())+' cr',fmtCr(s.fuel*Econ.fuelPrice(PLANETS[0]))])))
      +T.p('Range is how far a full tank takes you at warp. Running costs rise with the ship, so they stay about the same share of what a trip earns.')
      +(K('outfit')||K('tow')?T.h('Fittings')+T.dl([K('outfit')&&['Hidden compartment','2,500 cr at an Outfitter. One more unit of hold, and contraband is half as likely to be found.'],K('outfit')&&['Mining laser Mk II','1,800 cr at an Outfitter. Cuts rock nearly twice as fast and runs cooler.'],K('tow')&&['Towing insurance','90 cr, offered over the radio now and then. Your next tow is free.']]):'')},

    {t:'Ports and shops', need:'ports', f:()=>{ const kinds=new Set(); PLANETS.forEach(P=>{ if(seen.includes(P.idx)) Venues.defs(P).forEach(d=>kinds.add(d.k)); }); const unseen=PLANETS.filter(P=>!seen.includes(P.idx)).length;
      const what={depot:'Contracts, and fuel.',yard:'Buy and sell ships.',garage:'Hull repairs and a canopy wash.',bar:'Passengers, a mechanic for hire, and rumours if you buy a round.',outfit:'Fittings for your ship.',livery:'A new coat of paint. It changes how you look and nothing else.',assay:'Sells your ore.'};
      return T.p('Every port has a Cargo depot. The rest varies, and you only learn what a port has by landing there. The map remembers.')
      +T.h('The kinds of shop you have found')+T.dl(Object.keys(VENUE_TABS).filter(k=>kinds.has(k)).map(k=>[VENUE_TABS[k],what[k]||'']))
      +T.h('The ports you have landed at')+T.tbl(['World','Port','Who lives there','Kind','Shops'],PLANETS.slice().sort((a,b)=>a.orbit-b.orbit).filter(P=>seen.includes(P.idx)).map(P=>[P.name,P.port,SPECIES[P.species].name,P.station?`Research station, ${RISK[P.risk].name.toLowerCase()} risk`:'Planet',Venues.defs(P).map(d=>VENUE_TABS[d.k]).join(', ')]))
      +T.p(unseen?`${unseen} more place${unseen===1?'':'s'} on the map that you have not landed at yet.`:'You have landed everywhere there is a port.'); }},

    {t:'Running costs', f:()=>T.p('These are the prices for the ship you are flying now, the '+SHIPS[G.shipId].name+'.')
      +T.dl([['Fuel',`${Econ.fuelPrice(PLANETS[0])} cr a unit at a planet`+(seen.some(i=>PLANETS[i].station)?`, ${Econ.fuelPrice({station:true})} cr at a far station`:'')],['A full tank',fmtCr(SHIPS[G.shipId].fuel*Econ.fuelPrice(PLANETS[0]))],K('garage')&&['Hull repair',K('rep')?`${Rep.repairPrice()} cr a point at your reputation (${T.asRep(0,()=>Rep.repairPrice())} cr is the usual rate)`:`${Rep.repairPrice()} cr a point`],K('crack')&&['Welding a hull crack',fmtCr(Math.round(40*Econ.scale()))],K('tow')&&['A tow, out of fuel',`${fmtCr(Math.round(150*Econ.scale()/10)*10)} near the worlds`+(K('deep')?`, up to ${fmtCr(Math.round(150*3.6*Econ.scale()/10)*10)} in the far dark`:'')],K('tow')&&K('faults')&&['A tow, after a hull breach',`From ${fmtCr(Math.round(400*Econ.scale()/10)*10)}, and it leaves you at 25% hull`],K('garage')&&['Canopy wash','20 cr'],['If you are broke','The dockmaster will top a dry tank up to 40% for nothing, with a sigh.']])},

    {t:'Reputation', need:'rep', f:()=>T.p('One number from -100 to +100, and six names for where it puts you. You are '+Rep.label()+' at '+Rep.signed()+'. The button with your name on it in any port shows what it is doing for you right now.')
      +T.h('What each name is worth')+T.tbl(['Name','From','Pay','Customs','A quiet fee works','VIPs','Passengers','Back-room work'],REP_TIERS.map(t=>T.asRep(t.min,()=>[t.name,(t.min>0?'+':'')+t.min,T.pct(Rep.payMul()-1),T.pct(Rep.customsMul()-1),Math.round(Rep.bribeTake()*100)+'%',Rep.vips()?'Yes':'No',Rep.paxMax()?'Up to '+Rep.paxMax():'None',Math.round(Rep.contraChance()*100)+'% of visits'+(Rep.contraMul()>1?', '+T.pct(Rep.contraMul()-1)+' pay':'')])))
      +T.p('Pay, customs and the quiet fee slide smoothly with the number. The table shows them at the bottom of each name. Hull repairs also get cheaper as your name improves.')
      +T.h('Earning it')+T.dl([['Deliver on time and in one piece','+2'],['On time, a little knocked about','+1'],K('mayday')&&['Finish a rescue','+6'],K('escort')&&['Bring a VIP in safely','+5'],['Recover cargo you dropped','+2']])
      +T.h('Losing it')+T.dl([['Deliver very late','-2'],['Deliver badly damaged','-1 more'],['Dump cargo, or put a passenger off','-2'],['Speed on approach to a port','-1'],K('mayday')&&['Fly past a mayday','-3'],K('escort')&&['Lose a VIP contract','-6 to -8'],K('customs')&&['Get caught with contraband','-6 to -10'],K('customs')&&['Flee customs, or bribe badly','-4 to -6']])
      +T.p('Past +70 every gain is halved. A bad name is a way of playing too: honest work dries up, and the back room comes looking for you.')},

    {t:'Faults and repairs', need:'faults', f:()=>T.p('Things break in flight. On the '+SHIPS[0].name+' something goes wrong every couple of minutes. Dearer ships break down far less, and a battered hull breaks down more. No more than three things are broken at once.')
      +T.h('The faults you have met')+T.tbl(['Fault','What it does','Who can fix it'],Object.entries(FAULT_DEFS).filter(([id])=>(G.fixed||[]).includes(id)||(G.faults||[]).includes(id)||(G.know.fseen||[]).includes(id)).map(([id,d])=>[d.name,d.effect[0].toUpperCase()+d.effect.slice(1),d.garage?'A garage only':K('bar')?'You, or a hired mechanic':'You']))
      +T.p((()=>{ const n=Object.keys(FAULT_DEFS).length-Object.keys(FAULT_DEFS).filter(id=>(G.fixed||[]).includes(id)||(G.faults||[]).includes(id)||(G.know.fseen||[]).includes(id)).length; return n?`There are ${n} more kinds of fault you have not met.`:'That is every kind of fault there is.'; })())
      +T.h('Fixing one yourself')+T.p('Press L to leave your seat, walk to the fault, look at it and hold F for about three seconds. It goes much slower above throttle 5 or in warp, because the ship is shaking.')
      +T.h('Hull damage')+T.p('Hull is lost to anything that hits you. Only a garage restores it.',K('crack')&&'A hull crack leaks hull slowly until a garage welds it shut, and nobody aboard can patch one.','At 0% the hull breaches and you are towed in.')},

    {t:'The mechanic', need:'bar', f:()=>T.p('Every cantina has one mechanic looking for a berth. Hire them and they ride in one of your passenger seats, walk to whatever breaks, fix it, and charge you for it. They are slower than doing it yourself, and slower still if you fly hard. If you cannot pay, they sit on their toolbox until you can.')
      +T.tbl(['Kind','To hire','Each repair','Time on a job','Mishaps'],MECH_TIERS.map(k=>[k.label,fmtCr(Math.round(k.fee*Econ.scale()/10)*10),fmtCr(Math.round(k.wage*Econ.scale())),'About '+k.time+' seconds',Math.round(k.botch*100)+'% of jobs']))
      +T.p('Those prices are for the ship you are flying now. You can still fix anything yourself: get there first and you pay nothing. Let them go from the same cantina card, at any port.',K('crack')&&'They will not touch a hull crack.')},

    {t:'Customs and contraband', need:'customs', f:()=>T.p('Back-room contracts pay several times an honest load, because you may be caught. Customs can scan you at the dock, and cutters stop ships in flight.')
      +T.h('How strict each people are')+T.tbl(['Who','Strictness','Their ports'],Object.keys(STRICT).sort((a,b)=>STRICT[b]-STRICT[a]).filter(k=>PLANETS.some(P=>P.species===k&&seen.includes(P.idx))).map(k=>[SPECIES[k]?SPECIES[k].name:k,Math.round(STRICT[k]*100)+'%',PLANETS.filter(P=>P.species===k&&seen.includes(P.idx)).map(P=>P.name).join(', ')]))
      +T.p('This lists the peoples whose ports you have landed at. The stricter the docks at both ends, the more a run pays.')
      +T.h('When a cutter stops you')+T.dl([['Submit to a scan','Your odds are shown.'+(K('outfit')?' A hidden compartment halves them.':'')+' A bad name raises them, and a good one lowers them.'],['Offer a fee','Costs about a fifth of the cargo\'s worth. It works more often for a clean name.'],['Run for it','Better in a faster ship. Costs reputation even if you get away.']])
      +T.h('If you are caught')+T.p('You lose the cargo, pay a fine of 40% of what it would have paid, and lose 6 to 10 reputation.')},

    {t:'Deep space', need:'deep', f:()=>T.p('Patrols stop a little past the last planet. Beyond that the pay is better and so is the chance of trouble.')
      +T.tbl(['Region','Begins at','Risk','Pay'],[[far[0],'The sun',RISK[0].name,'×'+RISK[0].mul],[far[1],T.ls(FRONTIER_R),RISK[1].name,'×'+RISK[1].mul],[far[2],T.ls(DEEP_R),RISK[2].name,'×'+RISK[2].mul],[far[3],T.ls(EXTREME_R),(RISK[3]||RISK[2]).name,'×'+(RISK[3]||RISK[2]).mul]])
      +T.dl([['Pirates','They want a toll, or a fight.'+(K('mayday')?' Some maydays out here are bait.':'')],K('storm')&&['Meteor storms','Throttle 4 or lower, no warp, until it passes.'],K('tow')&&['Tows','Charged by the distance: up to 3.6 times the usual fee in the far dark.'],['Fuel','Far stations charge double. Check the tank before you leave.']])},

    {t:'Mining', need:'mining', f:()=>T.p('Pick a field on the map, fly into it, put a rock in your sights and hold F. Open the cargo scoop with B and slow down to collect what breaks off. Sell ore at any Assay office: prices differ from port to port.')
      +T.tbl(['Field','Ore','Worth, about','How far out'],FIELDS.map(F=>[F.name,F.ore,F.val+' cr a unit',T.ls(F.orbit)]))
      +T.p('Ore takes hold space like any cargo.',K('outfit')&&'The Mining laser Mk II nearly doubles your cutting speed.')},

    {t:'The end of the galaxy', need:'end', f:()=>T.p(RESTAURANT.name+' is '+T.ls(RESTAURANT.orbit)+' from the sun, out past '+PLANETS[PLANETS.length-1].name+'. It is on the map, at the rim of the chart. Arrive, and you have finished the game. You can keep flying afterwards.')
      +T.h('Who can get there')+T.tbl(['Ship','Range on a full tank','Reaches it'],SHIPS.map((s,i)=>(K('ships')||i===G.shipId)&&[s.name,T.ls(Restaurant.range(i)),i===top?'Yes':'No']))
      +T.p('Only the '+SHIPS[top].name+' carries the fuel. The map will not plot the course for anything less, and a ship that tries anyway runs dry and is towed home. The trip takes about three minutes at warp. Fill the tank first.',K('faults')&&'Mend any coolant leak before you go: a leak burns fuel 70% faster.')},
    ].filter(p=>T.has(p.need)&&!(p.hide&&p.hide())); },

  show(i){ if(!G.know) G.know={}; const P=this.pages(); if(i!=null) this.page=i; this.page=clamp(this.page,0,P.length-1); this.open=true; $('pedia').hidden=false; const cur=P[this.page];
    if(cur.need&&this.fresh(cur.need)){ G.know[cur.need]=2; if(G.mode!=='title') Game.save(); }
    const left=Object.keys(PEDIA_TOPICS).length-this.count();
    $('pedia-nav').innerHTML=P.map((p,k)=>`<button class="pnav${k===this.page?' on':''}" data-p="${k}"${k===this.page?' aria-current="page"':''}>${esc(p.t)}${this.fresh(p.need)?'<em>New</em>':''}</button>`).join('')+`<div class="pmore">${left?`${left} more entr${left===1?'y':'ies'} to discover`:'The book is complete'}</div>`;
    const b=$('pedia-body'); b.innerHTML=`<h2>${esc(cur.t)}</h2>${cur.f()}`; b.scrollTop=0; },
  /* open at a topic's page, if it is in the book */
  close(){ if(!this.open) return; this.open=false; $('pedia').hidden=true; if(Sfx.ok()) Sfx.click(); const g=$('gl'); if(g) g.focus(); },
  toggle(){ if(this.open) this.close(); else { if(Sfx.ok()) Sfx.click(); this.show(); } },
  bind(){ $('pedia-nav').addEventListener('click',e=>{ const b=e.target.closest('[data-p]'); if(b){ if(Sfx.ok()) Sfx.click(); this.show(+b.dataset.p); } }); $('pedia-close').onclick=()=>this.close();
    for(const id of ['btn-pedia','help-pedia']){ const b=$(id); if(b) b.onclick=()=>{ if(id==='help-pedia') $('help').hidden=true; this.show(); }; } },
};
