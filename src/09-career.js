/* ===================== A CAREER: RANK, LICENCES, REGULARS, STORIES, MILESTONES, THE LOG ===================== */
/* Four small things that make one delivery lead to the next. None of them is a simulation: they are counters.
   1. A career rank, counted in deliveries. It only goes up. Four of the ranks come with a cargo licence, and a licence
      opens a kind of job (fragile, express, livestock, hazardous). The rank is worked out from G.stats.deliveries, so an
      old save has the rank it has earned.
   2. Regulars: one named person at most ports, who turns up as the recipient again and again and remembers you.
   3. Story runs: a few hand-written jobs that follow one another, offered on the depot shelf marked STORY.
   4. Milestones, best times for each leg, and a captain's log written from what happens at each delivery.
   Kept in the save as G.car. Nothing here touches PLANETS or the prices of ordinary work. */
const RANKS = [
  {min:0,  name:'Probationary Hauler'},
  {min:4,  name:'Box Mover',       lic:'fragile'},
  {min:10, name:'Regular Runner',  lic:'express'},
  {min:18, name:'Line Hauler',     lic:'livestock'},
  {min:30, name:'Senior Hauler',   lic:'hazard'},
  {min:45, name:'Road Captain'},
  {min:65, name:'Master of the Long Haul'}];
/* mul: what the job pays over an ordinary load. w: how often it turns up on a board. */
const LICENCES = {
  fragile:  {name:'Fragile goods',   tag:'FRAGILE',   mul:1.4,  w:0.20, rule:'Throttle 8 and up, and hard turns at speed, will damage it.'},
  express:  {name:'Express',         tag:'EXPRESS',   mul:1.5,  w:0.10, rule:'Wanted in a hurry. The time allowed for full pay is a third shorter.'},
  livestock:{name:'Livestock',       tag:'LIVESTOCK', mul:1.35, w:0.07, rule:'Alive, and nervous. Every knock to the hull upsets them and costs you pay.'},
  hazard:   {name:'Hazardous goods', tag:'HAZARDOUS', mul:1.6,  w:0.07, rule:'While it is aboard, anything that hits the hull does half as much damage again.'}};
/* [name, pay class, label]. Pay class 1 so anyone with the licence may carry them, whatever their name is worth. */
const LIC_GOODS = {
  livestock:[['Free-Range Dust Bunnies',1,'Do not feed after midnight, or before.'],['Ornamental Space Hens',1,'They lay when they feel like it.'],['Pedigree Lap Slugs',1,'Warm lap required at the far end.'],['A Herd of Small Regrets',1,'They follow you about. That is normal.']],
  hazard:[['Unstable Marmalade',1,'Keep level. Keep calm. Keep away from toast.'],['Loose Lightning (Jarred)',1,'Lid on. Lid ON.'],['Concentrated Monday',1,'Do not open before Tuesday.'],['Angry Glitter',1,'It gets everywhere on purpose.']]};

/* One regular a port. home: the place in PLANETS (never changes). drops: what they say the first time, once they know
   you, and once you are an old friend. {good} is what you brought. */
const REGULARS = [
  {id:'pim',   home:0,  seed:4101, name:'Pim Odelay',         role:'who runs the lost property desk at Vendorhaven and has never lost anything',
    drops:["Pim Odelay signs for it and writes your name in a book. \"New,\" they say. \"I shall remember you. I remember everything.\"","Pim Odelay looks up before you reach the desk. \"You again. Good. The last one arrived exactly as you left it.\"","Pim Odelay has your form filled in already. \"I kept you a biscuit,\" they say. It is your favourite. You never told them."]},
  {id:'gra',   home:1,  seed:4102, name:'Foreman Gra-Tok',    role:'who weighs everything at Port Gneiss, including visitors',
    drops:["Foreman Gra-Tok weighs the crate, then weighs you. \"Both acceptable,\" they rumble.","Foreman Gra-Tok weighs you first this time. \"You have been eating at Sloshwell,\" they say. They are right.","Foreman Gra-Tok does not weigh anything. \"I know what you carry,\" they say. \"It is always correct.\" This is the highest praise there is."]},
  {id:'nine',  home:2,  seed:4103, name:'Clerk Ninth-of-Nine', role:'who stamps forms at Bureau Nine and dreams of a tenth stamp',
    drops:["Clerk Ninth-of-Nine stamps the form in nine places and asks whether you would like a receipt for the receipt.","Clerk Ninth-of-Nine has started a file on you. It is thin. \"A good sign,\" they say, and stamp it.","Clerk Ninth-of-Nine shows you a tenth stamp they had made in secret. It says FRIEND. They stamp your hand with it and look around nervously."]},
  {id:'bo',    home:3,  seed:4104, name:'Auntie Bo Ladle',    role:'who feeds every hauler who lands at Ladle Harbor whether they are hungry or not',
    drops:["Auntie Bo Ladle takes the crate with one hand and gives you soup with the other. You did not ask for soup.","Auntie Bo Ladle says you look thin. You are not thin. There is more soup.","Auntie Bo Ladle has named a soup after you. It is on the board. It is mostly noodles and it is very good."]},
  {id:'tik',   home:4,  seed:4105, name:'Tik-Tik Margin',     role:'who buys and sells everything at Bargain Roost and insists each deal is ruining them',
    drops:["Tik-Tik Margin checks the crate and says you are robbing them. They are smiling.","Tik-Tik Margin says they cannot afford to keep doing business with you, and asks when you are next in.","Tik-Tik Margin gives you a discount on something you did not buy. \"For family,\" they say. \"Tell nobody. I have a name to protect.\""]},
  {id:'moss',  home:5,  seed:4106, name:'Slow Moss',          role:'who has been meaning to open a shop in Mellow Hollow for forty years',
    drops:["Slow Moss takes a long time to sign. \"No rush,\" they say. There really is not.","Slow Moss remembers you, eventually. \"You brought the other thing,\" they say. \"That was a good thing.\"","Slow Moss says the shop will open any day now, and that you will be the first customer. They have been saving you a chair."]},
  {id:'eld',   home:6,  seed:4107, name:'Eldrin of the Long Sigh', role:'who writes poems at Port Lament about parcels that never came',
    drops:["Eldrin of the Long Sigh receives the crate and looks faintly let down. \"It came,\" they say. \"I had a poem ready for if it did not.\"","Eldrin of the Long Sigh has written you a short verse. It rhymes \"hauler\" with \"taller\". It is about being on time.","Eldrin of the Long Sigh reads you a whole poem. It is cheerful. They say it is your fault and they will never forgive you."]},
  {id:'oo',    home:7,  seed:4108, name:'The Committee of Oo', role:'who are several people at The Drift and sign for things one letter each',
    drops:["The Committee of Oo signs for it. It takes a while. Every member wants a turn with the pen.","The Committee of Oo greets you all at once and slightly out of time. They have voted. You are welcome.","The Committee of Oo has made you an honorary member. You get one letter of the signature. It is the dot."]},
  {id:'hug',   home:8,  seed:4109, name:'Warden Hugsby',      role:'who keeps Fort Snuggle warm and will not let anyone leave without a scarf',
    drops:["Warden Hugsby signs for the crate and gives you a scarf. It is very long.","Warden Hugsby asks where your scarf is. You have it. They give you another.","Warden Hugsby has knitted a cover for your ship. It does not fit. It is the thought, and the thought weighs a tonne."]},
  {id:'hush',  home:9,  seed:4110, name:'Doctor Vell Hush',   role:'who listens to the dark at The Quiet Ear and would like everyone to stop talking',
    drops:["Doctor Vell Hush signs for it without a word and holds a finger up. You both listen. There is nothing. They nod.","Doctor Vell Hush whispers that you have very quiet engines. From them, this is a love letter.","Doctor Vell Hush plays you a recording of the dark. In the middle there is a faint hum. \"That is you arriving,\" they say. \"I kept it.\""]},
  {id:'frost', home:10, seed:4111, name:'Keeper Frostwick',   role:'who looks after the Freezer Aisle and has not been warm since the last delivery',
    drops:["Keeper Frostwick signs with a mitten and thanks you through three scarves.","Keeper Frostwick has saved you the warm spot by the pipe. It is not warm. It is less cold.","Keeper Frostwick opens a tin they have been keeping for a special day. \"You came,\" they say. \"That is the day.\""]},
  {id:'last',  home:12, seed:4112, name:'Old Wink',           role:'who keeps the lamp at The Last Light and waves at every ship, including the ones that are not there',
    drops:["Old Wink waves until you are well inside the door, then waves a little more to be sure.","Old Wink says they saw you coming two days ago. They put the kettle on then. It is quite cold now.","Old Wink says the lamp is for you, really. \"The others can use it,\" they say. \"But I light it for the ones who come back.\""]},
];

/* Story runs. Each step is one delivery, offered at any port but the one it goes to, once the step before is done.
   need: the career rank (its place in RANKS) at which the run starts. pay: times an ordinary one-unit load. */
const CHAINS = [
  {id:'kettle', name:'The Wrong Kettle', need:0, who:{sp:'beepul',seed:5201,name:'Dot Tumble'}, steps:[
    {to:3, good:'A Kettle (Wrong One)', pay:1.6, pick:"Dot Tumble at Vendorhaven ordered a kettle and was sent somebody else's. The label says Auntie Bo Ladle, Sloshwell. Dot would like it gone before it boils again. It boils on its own.", drop:"Auntie Bo Ladle looks at the kettle for a long moment. \"That is not mine either,\" they say. \"Mine whistles. This one hums.\" They write a new label."},
    {to:6, good:'A Kettle (Still Wrong)', pay:1.8, pick:"The kettle hums. Auntie Bo Ladle is sure it belongs to a poet on Candara, because only a poet would own a kettle that sad.", drop:"Eldrin of the Long Sigh listens to the kettle and wipes an eye. \"It is not mine,\" they say. \"But I know whose it is. It has been trying to get home.\""},
    {to:0, self:true, good:'A Kettle (The Right One, It Turns Out)', pay:2.4, pick:"Eldrin says the kettle has been Dot Tumble's all along. Dot ordered a new one and never noticed the old one had gone out looking for it. It is going back to Verdanthia.", drop:"Dot Tumble opens the crate. The kettle stops humming and starts to whistle. Dot goes very quiet, then puts it on the shelf next to the new one. They seem to get on."}]},
  {id:'ledger', name:'The Tenth Stamp', need:2, who:{sp:'zkthar',seed:5202,name:'Clerk Ninth-of-Nine'}, steps:[
    {to:4, good:'A Sealed Order for One Stamp', pay:1.8, pick:"Clerk Ninth-of-Nine wants a stamp made. A tenth one. There is no form for ordering a tenth stamp, so there is no form, so nobody may know. Tik-Tik Margin on Amethyne can get anything.", drop:"Tik-Tik Margin reads the order twice. \"A stamp that says what?\" They read it again and stop smiling. \"Oh,\" they say. \"That one I will do at cost.\""},
    {to:1, good:'One Blank Stamp (Heavy)', pay:2.0, pick:"The stamp must be cut from Scorchmaw stone, which does not wear out. Foreman Gra-Tok is the only one who will cut it without asking what it is for.", drop:"Foreman Gra-Tok weighs the blank, cuts it in one stroke and does not ask what it is for. \"It says a good word,\" they rumble. \"I can tell by the weight.\""},
    {to:2, good:'A Small Heavy Box, Not on Any Form', pay:2.6, pick:"The stamp is finished. It has to reach Bureau Nine without appearing on a single form, which at Bureau Nine has never happened to anything.", drop:"Clerk Ninth-of-Nine opens the box under the desk. The stamp says FRIEND. They stamp one form, look at it for a while, and file it under Things That Went Right. The folder is new."}]},
  {id:'lamp', name:'A Light for the Last Light', need:3, who:{sp:'winkmast',seed:5203,name:'Old Wink'}, steps:[
    {to:8, good:'A Letter in Very Large Writing', pay:2.0, pick:"Old Wink, far out at Beacon Far Wink, has written to say the lamp is going dim and they would like a warmer one. The letter is addressed to \"whoever is kind\". Somebody thinks that means Warden Hugsby on Brrrindle.", drop:"Warden Hugsby reads the letter and starts knitting at once. \"A lamp wants a cosy,\" they say. \"But it wants a flame first. Take this to Jovexa.\""},
    {to:7, good:'A Lamp Cosy (Enormous)', pay:2.2, pick:"The cosy is finished and it is the size of a small moon. The Committee of Oo on Jovexa keeps a spare flame, voted on yearly.", drop:"The Committee of Oo votes. It is close. The flame may go, on condition that somebody tells Old Wink it came from all of them, one letter each."},
    {to:12, good:'One Flame, in a Jar, with a Cosy', pay:3.4, pick:"A flame in a jar, wrapped in a cosy the size of a small moon, for the lamp at the very end of the map. It is a long way. It is the last light there is.", drop:"Old Wink lifts the old lamp down and sets the new flame in its place. The whole station goes gold. Out in the dark, something that had been lost for a while turns round and starts for home. Old Wink waves at it."}]},
];

/* An admirer who is always one port ahead of you. at: the delivery count that brings the next note. */
const ADMIRER = [
  {at:6,  t:"There is a note for you at the desk. \"I saw your landing. Very level. A fan.\" No name."},
  {at:14, t:"Another note. \"I was here yesterday. You were not. I have left you a sandwich.\" There is no sandwich. There is a plate."},
  {at:24, t:"A note, and a small drawing of your ship. The ship is smiling. \"Missed you again. You fly faster than I walk.\""},
  {at:36, t:"The desk has a whole envelope for you. Inside is a list of every port you have landed at, in order, with marks out of ten. Most are nines."},
  {at:50, t:"A note in a hurry. \"I am going to wait at one port until you come. I have not decided which. Good luck to us both.\""},
  {at:66, t:"Somebody at the desk stands up when you walk in. They are very small and holding a plate with a sandwich on it. \"Finally,\" they say. \"I am your biggest fan. I am also the Inspector of Landings. You have passed.\""}];

const Career = {
  fresh(){ return {regs:{},ch:{},log:[],best:{},goods:{},ports:{},done:[],chains:0,adm:0,recs:0}; },
  S(){ return G.car||(G.car=this.fresh()); },
  restore(d){ const f=this.fresh(), s=d&&typeof d==='object'?d:{}; for(const k of ['regs','ch','best','goods','ports']) if(s[k]&&typeof s[k]==='object') f[k]=s[k];
    if(Array.isArray(s.log)) f.log=s.log.slice(0,40); if(Array.isArray(s.done)) f.done=s.done; f.chains=s.chains|0; f.adm=s.adm|0; f.recs=s.recs|0; G.car=f; },

  /* ---------- rank and licences ---------- */
  n(){ return (G.stats&&G.stats.deliveries)|0; },
  rank(n){ n=n==null?this.n():n; let k=0; RANKS.forEach((r,i)=>{ if(n>=r.min) k=i; }); return k; },
  name(){ return RANKS[this.rank()].name; },
  next(){ return RANKS[this.rank()+1]||null; },
  rankFor(lic){ return RANKS.findIndex(r=>r.lic===lic); },
  has(lic){ return !lic||this.rank()>=this.rankFor(lic); },
  /* what a locked job says it needs */
  needs(lic){ if(this.has(lic)) return null; const r=RANKS[this.rankFor(lic)]; return {lic:LICENCES[lic].name,rank:r.name,left:r.min-this.n()}; },
  /* which kind of special job, if any, the i-th offer on a board is. The first two are always ordinary, and a kind you
     have no licence for turns up only now and then, as something to work towards */
  roll(i){ if(i<2) return null; let r=Math.random(); for(const k in LICENCES){ r-=LICENCES[k].w; if(r<0) return this.has(k)||Math.random()<0.3?k:null; } return null; },
  payMul(lic){ return lic?LICENCES[lic].mul:1; },
  estMul(c){ return c&&c.lic==='express'?0.65:1; },
  /* a knock to the hull: hazardous cargo makes it worse, and livestock take it badly */
  knock(n){ if(G.cargo.some(c=>c.lic==='hazard')) n=Math.round(n*1.5); let upset=false; for(const c of G.cargo) if(c.lic==='livestock'){ c.dmg=Math.min(0.6,(c.dmg||0)+n*0.02); upset=true; }
    if(upset) setTimeout(()=>UI.toast('The livestock did not like that. Their pay is down.','warn'),900); return n; },
  bar(){ const k=this.rank(), a=RANKS[k], b=RANKS[k+1]; return b?clamp((this.n()-a.min)/(b.min-a.min),0,1):1; },
  barHtml(){ return `<div style="height:16px;border:2px solid var(--line);margin:6px 0 2px"><div style="height:100%;width:${Math.round(this.bar()*100)}%;background:var(--amber)"></div></div>`; },
  sheet(){ const nx=this.next(); return [['Career rank',`${this.name()} · ${this.n()} deliver${this.n()===1?'y':'ies'}`],['Next rank',nx?`${nx.name}, ${nx.min-this.n()} more deliver${nx.min-this.n()===1?'y':'ies'}${nx.lic?' · brings the '+LICENCES[nx.lic].name+' licence':''}`:'There is no higher rank'],['Licences held',Object.keys(LICENCES).filter(k=>this.has(k)).map(k=>LICENCES[k].name).join(', ')||'None yet']]; },

  /* ---------- regulars ---------- */
  regAt(i){ return REGULARS.find(r=>r.home===i)||null; },
  reg(id){ return REGULARS.find(r=>r.id===id)||null; },
  met(id){ return this.S().regs[id]|0; },
  /* a job to a port with a regular is, about two times in five, for them */
  story(j){ const R=this.regAt(j.to); if(!R||Math.random()>0.4) return null; const T=PLANETS[j.to], n=this.met(R.id);
    const pick=n>=5?`${R.name} on ${T.name} asked for you by name. It is ${j.good}, and they will not have anyone else carry it.`:n>=1?`This one is for ${R.name} on ${T.name} again, ${R.role}. They asked whether the same hauler was free.`:`${alienName(j.sp,j.seed)} is sending this to ${R.name} on ${T.name}, ${R.role}.`;
    return {pick,drop:R.drops[0],reg:R.id,to:{sp:T.species,seed:R.seed,name:R.name}}; },

  /* ---------- story runs ---------- */
  step(C){ return this.S().ch[C.id]|0; },
  /* the next story job this board can offer: one at a time, and never to the port you are standing in */
  offer(pi){ if(G.cargo.some(c=>c.chain)) return null;
    for(const C of CHAINS){ const k=this.step(C); if(k>=C.steps.length||this.rank()<C.need) continue; const st=C.steps[k]; if(st.to===pi) continue; if(Math.random()>0.6) return null;
      const T=PLANETS[st.to], dist=PLANETS[pi].pos.distanceTo(T.pos)/LS, R=st.self?null:this.regAt(st.to), to=R?{sp:T.species,seed:R.seed,name:R.name}:C.who;
      return {good:st.good,note:`${C.name}, part ${k+1} of ${C.steps.length}.`,qty:1,to:st.to,pay:Math.round(Econ.unitPay(dist)*st.pay*Econ.scale()*RISK[Econ.risk(PLANETS[pi],T)].mul*Rep.payMul()/5)*5,sp:C.who.sp,seed:C.who.seed,hot:false,fragile:false,risk:Econ.risk(PLANETS[pi],T),sit:'STORY',chain:C.id,step:k,story:{pick:st.pick,drop:st.drop,to}}; }
    return null; },

  /* ---------- what a delivery leaves behind ---------- */
  note(text, where, plus){ const L=this.S().log; L.unshift({n:this.n()+(plus|0),w:where||'',t:text}); if(L.length>40) L.length=40; },
  /* called as a delivery is handed over, before it is counted. Returns the ending to show (a regular's line changes
     as they get to know you) */
  delivered(c, P, end){ const S=this.S(), before=this.rank();
    if(end&&end.reg){ const R=this.reg(end.reg); if(R){ const n=this.met(R.id); end=Object.assign({},end,{drop:R.drops[n>=5?2:n>=1?1:0]}); S.regs[R.id]=n+1; } }
    if(c.kind!=='pax'&&c.kind!=='escort'&&c.kind!=='ore'&&c.good) S.goods[c.good]=(S.goods[c.good]|0)+1;
    S.ports[P.idx]=(S.ports[P.idx]|0)+1;
    if(end&&end.drop) this.note(end.drop,P.name,1);
    if(c.chain){ const C=CHAINS.find(x=>x.id===c.chain); if(C&&this.step(C)===c.step){ S.ch[C.id]=c.step+1; if(c.step+1>=C.steps.length){ S.chains++; this.note(`The end of "${C.name}".`,P.name,1); setTimeout(()=>{ UI.toast(`Story finished: ${C.name}.`,'good'); Rep.add(4,`You saw "${C.name}" through`); },1400); } } }
    // a best time for the leg: only flight time counts, and only your own earlier runs are the competition
    if(c.from>=0&&c.from!==P.idx&&c.el>20&&c.kind!=='escort'){ const key=c.from+'>'+P.idx, was=S.best[key], t=Math.round(c.el);
      if(!was||t<was){ S.best[key]=t; if(was){ S.recs++; setTimeout(()=>UI.toast(`Best time, ${PLANETS[c.from].name} to ${P.name}: ${fmtTime(t)}. It was ${fmtTime(was)}.`,'good'),2200); } } }
    this.pendingRank=before; return end; },
  /* called once the delivery has been counted */
  counted(){ const k=this.rank(), was=this.pendingRank; this.pendingRank=null;
    if(was!=null&&k>was){ const R=RANKS[k]; this.note(`Promoted to ${R.name}.`,''); setTimeout(()=>UI.toast(`Promoted: you are now a ${R.name}.${R.lic?` You hold the ${LICENCES[R.lic].name} licence.`:''}`,'good'),1800); }
    this.check(); },
  /* landing: the admirer may have been here first */
  landed(P){ const S=this.S(), a=ADMIRER[S.adm]; if(a&&this.n()>=a.at){ S.adm++; this.note(a.t,P.name); setTimeout(()=>{ if(G.mode==='port') UI.toast(a.t); },3200); } this.check(true); },

  /* ---------- milestones ---------- */
  miles(){ const S=this.S(), n=this.n(), st=G.stats||{}, ports=PLANETS.length, del=Object.keys(S.ports).length, goods=GOODS.filter(g=>S.goods[g[0]]).length, met=REGULARS.filter(r=>this.met(r.id)).length, friends=REGULARS.filter(r=>this.met(r.id)>=5).length, lic=Object.keys(LICENCES).filter(k=>this.has(k)).length, nb=Object.keys(S.best).length;
    const M=(id,t,have,want)=>({id,t,have:Math.min(have,want),want,ok:have>=want});
    return [M('d1','Make a first delivery',n,1),M('d10','Make 10 deliveries',n,10),M('d25','Make 25 deliveries',n,25),M('d50','Make 50 deliveries',n,50),M('d100','Make 100 deliveries',n,100),
      M('e10','Earn 10,000 credits',st.earned|0,10000),M('e100','Earn 100,000 credits',st.earned|0,100000),
      M('seen','Land at every port',(G.seen||[]).length,ports),M('del','Deliver to every port',del,ports),
      M('goods','Carry every kind of ordinary cargo',goods,GOODS.length),M('lic','Hold every licence',lic,Object.keys(LICENCES).length),
      M('met','Meet every regular',met,REGULARS.length),M('fr1','Become an old friend of one regular',friends,1),M('frall','Become an old friend of every regular',friends,REGULARS.length),
      M('ch1','Finish a story',S.chains,1),M('chall','Finish every story',S.chains,CHAINS.length),
      M('fix1','End a port\'s troubles',st.fixed|0,1),M('fix5','End five ports\' troubles',st.fixed|0,5),
      M('ore1','Mine a first unit of ore',st.mined|0,1),M('ore100','Mine 100 units of ore',st.mined|0,100),M('gem','Cut out the heart of a rock',st.gems|0,1),M('fields','Visit every asteroid field',Object.keys(st.fields||{}).length,FIELDS.length),
      M('legs','Fly 10 different legs with cargo',nb,10),M('rec','Beat your own best time 5 times',S.recs,5),
      M('top','Own the '+SHIPS[SHIPS.length-1].name,G.shipId>=SHIPS.length-1?1:0,1),M('won','Eat at the Diner',G.won?1:0,1)]; },
  /* say so the first time each is reached. quiet: an old save is brought up to date without a string of pop-ups */
  check(quiet){ const S=this.S(), fresh=this.miles().filter(m=>m.ok&&!S.done.includes(m.id)); if(!fresh.length) return; const first=!S.done.length&&fresh.length>2;
    for(const m of fresh){ S.done.push(m.id); if(!first) this.note(`Milestone: ${m.t}.`,''); }
    if(!quiet&&!first) setTimeout(()=>UI.toast(`Milestone: ${fresh[0].t}.${fresh.length>1?` And ${fresh.length-1} more.`:''}`,'good'),2600); },
  /* the mark out of 100 the Diner gives you: mostly what you did, a little for your name and for not dawdling */
  score(){ const M=this.miles(), ok=M.filter(m=>m.ok).length, trips=Math.max(1,G.sitDay||1), s=Math.round(100*(0.6*ok/M.length+0.2*clamp((G.rep||0)/100,0,1)+0.2*clamp(40/trips,0,1)));
    const title=s>=90?'Legend of the Lanes':s>=75?'Hauler of Some Renown':s>=60?'Reliable, Mostly':s>=45?'Got There in the End':s>=30?'Scenic Route Specialist':'Technically a Hauler'; return {s,title,ok,of:M.length,trips}; },

  /* ---------- the book ---------- */
  pages(T){ const S=this.S(), M=this.miles(), met=REGULARS.filter(r=>this.met(r.id));
    return [
    {t:'Career and licences', f:()=>T.p('Every delivery counts towards your career rank. It only ever goes up. You are a '+this.name()+'.')+this.barHtml()+T.dl(this.sheet())
      +T.h('The ranks')+T.tbl(['Rank','Deliveries','Licence it brings'],RANKS.map(r=>[r.name,r.min,r.lic?LICENCES[r.lic].name:'']))
      +T.h('What a licence opens')+T.tbl(['Licence','Pays','The catch'],Object.keys(LICENCES).map(k=>[LICENCES[k].name,T.pct(LICENCES[k].mul-1),LICENCES[k].rule]))
      +T.p('A job you have no licence for may still sit on the shelf, marked with the licence it needs. A licence is separate from your reputation: dear goods still want a good name.')},
    {t:'Regulars', hide:()=>!met.length, f:()=>T.p('Some people at the ports get a lot of parcels. Bring them enough and they start to know you. Five deliveries makes an old friend.')
      +T.tbl(['Who','Where','Deliveries','They think of you as'],met.map(r=>[r.name,PLANETS[r.home].name,this.met(r.id),this.met(r.id)>=5?'An old friend':this.met(r.id)>=2?'A familiar face':'Somebody new']))
      +T.p(met.length<REGULARS.length?`There are ${REGULARS.length-met.length} more regulars you have not met.`:'You have met every regular.')},
    {t:'Stories', hide:()=>!Object.keys(S.ch).length, f:()=>T.p('Some jobs follow one another. They are on the depot shelf marked STORY, one part at a time.')
      +T.tbl(['Story','Parts done'],CHAINS.filter(C=>this.step(C)>0).map(C=>[C.name,this.step(C)>=C.steps.length?'Finished':`${this.step(C)} of ${C.steps.length}`]))},
    {t:'Milestones', f:()=>T.p(`${M.filter(m=>m.ok).length} of ${M.length} reached. None of them is needed to finish the game.`)
      +T.tbl(['Milestone','So far',''],M.map(m=>[m.t,`${m.have.toLocaleString()} of ${m.want.toLocaleString()}`,m.ok?'✔ Done':'']))
      +T.h('Best times')+(Object.keys(S.best).length?T.tbl(['From','To','Best time'],Object.keys(S.best).map(k=>k.split('>').map(Number)).filter(a=>PLANETS[a[0]]&&PLANETS[a[1]]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]).map(a=>[PLANETS[a[0]].name,PLANETS[a[1]].name,fmtTime(S.best[a[0]+'>'+a[1]])])):T.p('Deliver a job to set a time for its leg. Only flight time counts.'))},
    {t:"Captain's log", f:()=>S.log.length?T.tbl(['Delivery','Where','What happened'],S.log.map(e=>[e.n,e.w,e.t])):T.p('Nothing yet. The log writes itself as you make deliveries.')},
    ]; },
};
