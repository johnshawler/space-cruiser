/* ===================== PORT NEWS: THE WORLD ANSWERS BACK ===================== */
/* Every so often a port falls into a named situation. It changes what pays there, the news says so, and some of them
   end early because of what you deliver, with a line in the news saying it was you.
   It is a small table and a counter, not a simulation. Time is counted in your landings ("trips"), so nothing moves
   while the game is closed. One situation a port at most; about three in the system at once.
   Kept in the save as G.situ: { portIndex: {k, cat, left, need, done} }, with G.sitLog for the last few headlines.
   The old "hot tip" is still G.hot (several things set it); it now runs out after a few trips like everything else. */
const SIT_CATS = {food:'food and drink', comforts:'small comforts', household:'household goods', science:'scientific supplies'};
const GOOD_CAT = {
  'Self-Heating Soup Bricks':'food','Dehydrated Water':'food','Fermented Starlight':'food','Decaf Plasma':'food','Sentient Cheese (Mild)':'food','Certified Pre-Chewed Gum':'food','Antimatter Sprinkles':'food',
  'Unlicensed Nostalgia':'comforts','Second-Hand Sunsets':'comforts','Emotional Support Asteroids':'comforts','Bottled Uncomfortable Silence':'comforts','Slightly Used Tomorrows':'comforts','Glow-in-the-Dark Shadows':'comforts',
  'Mildly Cursed Furniture':'household','Quantum Socks (Unpaired)':'household','Zero-G Hair Gel':'household','Recreational Bubble Wrap':'household','Bulk Googly Eyes':'household','Haunted Rubber Ducks':'household','Screaming Cactus Seedlings':'household',
  'Artisanal Gravity (Small Batch)':'science','Left-Handed Wormholes':'science','Novelty Oversized Atoms':'science','Pre-Owned Moon Dust':'science','Tax-Deductible Fog':'science','Organic Free-Range Static':'science' };
/* name: what the map and tags call it. trips: how long it lasts if nobody ends it. fix: can deliveries end it?
   start/over/fixed: the headlines. greet: what the cargo keeper says while it lasts. */
const SITS = {
  shortage:{name:'Shortage', trips:[5,7], w:3, fix:true, needsCat:true,
    start:(P,c)=>`${P.port} has run short of ${c}. Deliveries of it there pay 60% over the odds.`, over:(P,c)=>`The shortage of ${c} at ${P.port} has passed. Somebody found a cupboard.`, fixed:(P,c,who)=>`The shortage of ${c} at ${P.port} is over, thanks to the ${who}.`,
    greet:c=>`We are out of ${c}. Completely. I have checked behind everything.`},
  glut:{name:'Glut', trips:[3,5], w:2, needsCat:true,
    start:(P,c)=>`${P.port} is drowning in ${c}. Bring more and they will pay you 30% less to take it off you.`, over:(P,c)=>`The glut of ${c} at ${P.port} has cleared. Most of it was eaten, sat on or lost.`,
    greet:c=>`Please. No more ${c}. We are using it as furniture.`},
  festival:{name:'Festival', trips:[3,5], w:2,
    start:P=>`It is festival week at ${P.port}. Passengers going there are paying half as much again.`, over:P=>`The festival at ${P.port} is over. The cleaning has begun.`,
    greet:()=>`Festival week. Everybody is very happy and nobody is at work.`},
  quarantine:{name:'Quarantine', trips:[4,6], w:1.5, fix:true, cat:'comforts',
    start:(P,c)=>`${P.port} is under quarantine: a sniffle, they say. No passengers in or out. ${c[0].toUpperCase()+c.slice(1)} for the bored pay double.`, over:(P)=>`The quarantine at ${P.port} has lifted. It was a sniffle.`, fixed:(P,c,who)=>`The quarantine at ${P.port} lifted early. Morale held, thanks to the ${who}.`,
    greet:()=>`Stand over there, please. Further. It is only a sniffle, but it is a very official sniffle.`},
  strike:{name:'Dock strike', trips:[3,5], w:1.5, fix:true,
    start:P=>`The dockers at ${P.port} are on strike. Fuel and repairs there cost half as much again until somebody brings the strike pay.`, over:P=>`The dock strike at ${P.port} is over. Nobody can remember what it was about.`, fixed:(P,c,who)=>`The dock strike at ${P.port} is settled. The strike pay arrived aboard the ${who}.`,
    greet:()=>`I am not working. I am standing here in a personal capacity.`},
  boom:{name:'Boom', trips:[3,5], w:2,
    start:P=>`Business is booming at ${P.port}. Every contract out of there pays 25% more.`, over:P=>`The boom at ${P.port} has settled down. The bunting stays up.`,
    greet:()=>`Business has never been better. I have bought a second hat.`},
};
const Situ = {
  all(){ return G.situ||(G.situ={}); },
  at(i){ return (G.situ||{})[i]||null; },
  cat(s){ return SIT_CATS[s.cat]||''; },
  list(){ return Object.keys(this.all()).map(i=>({i:+i,s:G.situ[i],P:PLANETS[+i]})).filter(e=>e.P&&SITS[e.s.k]); },
  log(text){ (G.sitLog||(G.sitLog=[])).unshift(text); G.sitLog.length=Math.min(G.sitLog.length,6); },
  /* ---- what a situation does ---- */
  /* a cargo contract of this kind, from here to there */
  payMul(cat, from, to){ const a=this.at(to), b=this.at(from); let m=1;
    if(a&&a.k==='shortage'&&a.cat===cat) m*=1.6; if(a&&a.k==='quarantine'&&a.cat===cat) m*=2; if(a&&a.k==='glut'&&a.cat===cat) m*=0.7; if(b&&b.k==='boom') m*=1.25; return m; },
  /* the label a job card wears */
  tag(cat, from, to){ const a=this.at(to), b=this.at(from);
    if(a&&a.k==='shortage'&&a.cat===cat) return 'SHORTAGE +60%'; if(a&&a.k==='quarantine'&&a.cat===cat) return 'QUARANTINE ×2'; if(a&&a.k==='glut'&&a.cat===cat) return 'GLUT −30%'; if(b&&b.k==='boom') return 'BOOM +25%'; return ''; },
  paxMul(to){ const a=this.at(to); return a&&a.k==='festival'?1.5:1; },
  paxOk(from, to){ const a=this.at(from), b=this.at(to); return !(a&&a.k==='quarantine')&&!(b&&b.k==='quarantine'); },
  /* fuel and repairs at a port */
  costMul(P){ const a=P&&P.idx!=null?this.at(P.idx):null; return a&&a.k==='strike'?1.5:1; },
  /* a short label for the map and the news card */
  label(e){ const s=e.s, D=SITS[s.k]; return D.name+(s.cat&&D.needsCat?': '+this.cat(s):'')+(D.fix&&s.need?` · ${Math.min(s.done,s.need)} of ${s.need}`:'')+` · ${s.left} trip${s.left===1?'':'s'} left`; },
  effect(e){ const s=e.s, c=this.cat(s); return {shortage:`Deliveries of ${c} there pay +60%. Bring ${s.need} units to end it.`, glut:`Deliveries of ${c} there pay 30% less.`, festival:'Passengers going there pay +50%.', quarantine:`No passengers in or out. ${c[0]?c[0].toUpperCase()+c.slice(1):''} pay double. Bring ${s.need} units to end it.`, strike:'Fuel and repairs there cost +50%. Deliver the strike pay to end it.', boom:'Contracts out of there pay +25%.'}[s.k]; },

  /* ---- how they come and go: once each landing ---- */
  start(i, k){ const D=SITS[k], P=PLANETS[i], hold=holdCap(), s={k,left:D.trips[0]+Math.floor(Math.random()*(D.trips[1]-D.trips[0]+1)),done:0,need:0};
    if(D.needsCat) s.cat=pick(Object.keys(SIT_CATS)); else if(D.cat) s.cat=D.cat;
    if(k==='shortage') s.need=Math.max(6,Math.round(hold*1.5)); if(k==='quarantine') s.need=Math.max(4,Math.round(hold*0.75)); if(k==='strike') s.need=1;
    this.all()[i]=s; const text=D.start(P,this.cat(s)); this.log(text); return text; },
  tick(P){ const A=this.all(), out=[], first=G.sitDay==null; G.sitDay=(G.sitDay||0)+1; Pedia.learn('news');
    for(const e of this.list()){ e.s.left--; if(e.s.left<=0){ const t=SITS[e.s.k].over(e.P,this.cat(e.s)); delete A[e.i]; this.log(t); out.push(t); } }
    // the hot tip is a rush order with an end, like everything else
    if(G.hot!=null){ if(G.hotSeen!==G.hot){ G.hotSeen=G.hot; G.hotLeft=4; } else if(--G.hotLeft<=0){ const t=`The rush at ${PLANETS[G.hot].port} is over. Deliveries there pay the usual rate again.`; G.hot=null; G.hotSeen=null; this.log(t); out.push(t); } } else G.hotSeen=null;
    // about three going at once; a brand-new save starts with two so there is news on the first day
    const want=first?2:3; let n=this.list().length, guard=0;
    while(n<want&&guard++<6&&(first||Math.random()<0.55)){ const free=PLANETS.map(p=>p.idx).filter(i=>!A[i]&&i!==G.hot); if(!free.length) break;
      const keys=Object.keys(SITS).filter(k=>!this.list().some(e=>e.s.k===k)||k==='shortage'), tot=keys.reduce((a,k)=>a+SITS[k].w,0); let r=Math.random()*tot, k=keys[0]; for(const q of keys){ r-=SITS[q].w; if(r<=0){ k=q; break; } }
      out.push(this.start(pick(free),k)); n++; }
    return out; },
  /* what a delivery here does about it */
  delivered(c, P){ const s=this.at(P.idx); if(!s||!SITS[s.k].fix||c.kind) return;
    if(s.k==='strike'){ if(c.ends!=='strike') return; s.done=s.need; } else if(c.cat===s.cat) s.done+=c.qty; else return;
    if(s.done<s.need){ UI.toast(`📰 ${SITS[s.k].name} at ${P.port}: ${s.done} of ${s.need} delivered.`,'good'); return; }
    const who=SHIPS[G.shipId].name, text=SITS[s.k].fixed(P,this.cat(s),who); delete this.all()[P.idx]; this.log(text); G.stats.fixed=(G.stats.fixed||0)+1;
    setTimeout(()=>{ UI.toast('📰 '+text,'good'); Rep.add(3,`You ended the ${SITS[s.k].name.toLowerCase()} at ${P.port}`); },700); },
  /* a troubled port elsewhere that this board could send something to */
  wanted(pi){ return this.list().filter(e=>e.i!==pi&&(e.s.k==='shortage'||e.s.k==='quarantine')); },
  strikeAway(pi){ return this.list().find(e=>e.i!==pi&&e.s.k==='strike'&&!G.cargo.some(c=>c.ends==='strike'&&c.to===e.i)); },
  goodOf(cat){ return pick(GOODS.filter(g=>GOOD_CAT[g[0]]===cat)); },
  restore(d){ G.situ={}; const src=d&&d.situ; if(src&&typeof src==='object') for(const i in src){ const s=src[i]; if(PLANETS[+i]&&s&&SITS[s.k]) G.situ[i]={k:s.k,cat:SIT_CATS[s.cat]?s.cat:undefined,left:Math.max(1,s.left|0),need:s.need|0,done:s.done|0}; }
    G.sitLog=Array.isArray(d&&d.sitLog)?d.sitLog.slice(0,6):[]; G.sitDay=d&&d.sitDay!=null?d.sitDay:null; G.hotLeft=d&&d.hotLeft||4; G.hotSeen=G.hot!=null?G.hot:null; },
};
