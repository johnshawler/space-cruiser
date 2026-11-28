/* ===================== THE HIRED MECHANIC ===================== */
/* One alien, hired in a cantina, who rides in the last passenger seat and goes to mend whatever breaks in flight.
   They are slower than doing it yourself, they charge for each repair, and the cheap ones sometimes make it worse first.
   The work itself runs on a clock, so it carries on whether or not anyone is below decks to watch. When you do walk
   the ship, the same clock places the figure: in their seat, on the way, at the fault, or coming back. */
const MECH_TIERS = [
  {key:'careful', label:'Careful', blurb:'Reads the manual. Has read all the manuals.', time:14, botch:0.03, fee:900, wage:60},
  {key:'steady', label:'Steady', blurb:'Gets there in the end, and usually on the first go.', time:22, botch:0.10, fee:450, wage:35},
  {key:'keen', label:'Keen', blurb:'Very cheap, very willing, and holds the spanner by the wrong end.', time:30, botch:0.28, fee:150, wage:15},
];
const MECH_LINES = {
  fixed:['They would like it noted that it was like that when they found it.','They used a part from something else. They will not say what.','They left a small bill and a larger smudge.','They say it will hold. They did not say for how long.','They hit it once, listened, and hit it again more kindly.','They have named the fault. It is called Gerald and it is gone now.','They charged for two parts and used one. The other is a retainer.','They say it was the worst they have seen today.','They left a note. The note is a drawing of the fault, frowning.','They did it properly, which took longer, and said so.','They found your earlier repair and removed it without comment.','They whistled the whole time. You could hear it from the cockpit.','They say it should last. They looked at the ceiling when they said it.','They have added it to a list. The list is long and has your name at the top.','They borrowed your mug to catch the drips. You will want a new mug.','They tested it by kicking it. It passed.','They fixed that, and something next to it that you had not noticed.','They wiped their hands on your seat on the way back.','They want it known that this is not what the tool is for.','They found the fault, named it, and showed it the door.'],
  botch:['There was a bang. They say the bang is part of the process.','It is now broken in a new and more interesting way. They are starting again.','They fitted it backwards. They are taking it off again, whistling.','Something fell off. They have put it in a pocket for later.'],
  beaten:['They arrive to find you have already done it, and look quietly relieved.','You got there first. They pretend they were only passing.'],
  unpaid:['They are sitting on their toolbox until somebody finds the money.','They have downed tools. The tools were already down.'],
  rough:['Ease off the throttle, would you? I am trying to hold a very small screw.','I can fix it or you can fly like that. Not both at once.'],
  idle:['Nothing is broken. I find that suspicious on this ship.','I have been counting the rivets. Some are missing. I am not saying which.','Wake me if something hisses.','Quiet shift. I do not trust it.'],
  going:['On my way. Do not touch it. You will only make it worse.','I can hear it from here. I am coming.'],
  working:['Nearly there. Do not ask what nearly means.','Hold this. No, not you, you are flying. Never mind.','It is one of three things. I have ruled out the cheap one.'],
};
const Mech = {
  F:null, host:null, st:'idle', job:null, t:0, T:0, path:null, told:'', ph:0, chatLock:false, sat:false,
  tier(m){ return MECH_TIERS.find(k=>k.key===(m||G.mech).skill)||MECH_TIERS[1]; },
  /* who is looking for work at this port: the same face each visit */
  offer(P){ const r=mulberry32(P.idx*977+13), sp=ALIEN_POOL[Math.floor(r()*ALIEN_POOL.length)], seed=P.idx*211+7, T=MECH_TIERS[(P.idx*7+3)%3];
    return {sp, seed, name:alienName(sp,seed), skill:T.key, fee:Math.round(T.fee*Econ.scale()/10)*10, wage:T.wage}; },
  /* what a repair costs in the ship you are flying: a bigger ship is a bigger job */
  wage(m){ return Math.round((m||G.mech).wage*Econ.scale()); },
  hire(c){ G.credits-=c.fee; G.mech={sp:c.sp, seed:c.seed, name:c.name, skill:c.skill, wage:c.wage}; this.reset(); },
  fire(){ G.mech=null; this.reset(); },
  reset(){ this.st='idle'; this.job=null; this.t=0; this.path=null; this.told=''; this.drop(); if(typeof Faults!=='undefined'&&$('fault-badge')) Faults.badge(); },
  drop(){ if(this.F&&this.F.parent) this.F.parent.remove(this.F); this.F=null; this.host=null; this.sat=false; },
  say(text, kind){ UI.toast(`🔧 ${G.mech.name}: ${text}`,kind||''); },

  /* ---------- the work, on a clock ---------- */
  update(dt){
    const m=G.mech; if(!m){ if(this.F) this.drop(); return; }
    const L=Faults.list().filter(k=>!FAULT_DEFS[k].garage), tier=this.tier(m);   // hull cracks are a garage's job, not theirs
    if(this.job&&!L.includes(this.job)&&this.st!=='back'){ // somebody else mended it
      if(this.st!=='idle') UI.toast(`🔧 ${m.name}: ${Deck.deal('m:beaten',MECH_LINES.beaten)}`); this.leave(); return; }
    if(this.st==='idle'){
      if(!L.length){ this.told=''; return; }
      if(G.credits<this.wage(m)){ if(this.told!=='unpaid'){ this.told='unpaid'; UI.toast(`🔧 ${m.name} wants ${fmtCr(this.wage(m))} before going near it (${FAULT_DEFS[L[0]].name.toLowerCase()}). ${Deck.deal('m:unpaid',MECH_LINES.unpaid)}`,'warn'); } return; }
      this.told=''; this.job=L[0]; this.st='going'; this.path=null; this.T=this.t=this.legTime(); Faults.badge();
      UI.toast(`🔧 ${m.name} is off to the ${Faults.room(this.job)}: ${FAULT_DEFS[this.job].name.toLowerCase()}.`); return; }
    if(this.st==='going'||this.st==='back'){ this.t-=dt; if(this.t<=0){ if(this.st==='going'){ this.st='work'; this.T=this.t=tier.time; this.path=null; this.botched=false; Faults.badge(); } else { this.st='idle'; this.job=null; this.path=null; } } return; }
    if(this.st==='work'){ const s=G.ship, rough=s.throttle>5||s.warpF>0.2; this.t-=dt*(rough?0.35:1);
      if(rough&&this.told!=='rough'&&this.t<this.T*0.8){ this.told='rough'; this.say(Deck.deal('m:rough',MECH_LINES.rough),'warn'); }
      if(this.t>0) return;
      if(!this.botched&&Math.random()<tier.botch){ this.botched=true; this.T=this.t=tier.time*0.6;   // one mishap a job is funny; two is a chore
        this.told=''; if(Sfx.ok()) Sfx.clunk(); UI.toast(`🔧 ${m.name} is still at it (${FAULT_DEFS[this.job].name.toLowerCase()}). ${Deck.deal('m:botch',MECH_LINES.botch)}`,'warn'); return; }
      const id=this.job; const w=this.wage(m); G.credits=Math.max(0,G.credits-w); this.job=null; Faults.fix(id,{name:m.name,wage:w}); this.leave(); } },
  leave(){ this.job=null; this.st='back'; this.path=null; this.T=this.t=this.legTime(); Faults.badge(); },
  /* how long a walk takes: from the real route when the deck is there to measure, a fair guess when it is not */
  legTime(){ const p=this.route(); if(p){ this.path=p; return Math.max(2.5,p.len/1.25); } return 8; },
  status(){ const m=G.mech; if(!m) return ''; return this.st==='going'?`${m.name} is on the way`:this.st==='work'?`${m.name} is on it`:''; },

  /* ---------- finding a way round the deck ---------- */
  floor(l){ const P=Interior.fitted; return P&&P.layout?P.layout.levels[l].floor:FLOOR; },
  grid(l){ const P=Interior.plan(), w=P?(P.layout?P.layout.levels[l].walk:P.walk):null;
    return w?{x0:w.x0,z0:w.z0,cell:w.cell,nx:w.nx,nz:w.nz}:{x0:-4.2,z0:0.8,cell:0.1,nx:84,nz:186}; },
  /* the nearest place to stand to a point on a level */
  near(x,z,l){ if(Interior.inside(x,z,l)) return [x,z]; for(let r=0.1;r<2.4;r+=0.1) for(let a=0;a<16;a++){ const px=x+Math.cos(a*Math.PI/8)*r, pz=z+Math.sin(a*Math.PI/8)*r; if(Interior.inside(px,pz,l)) return [px,pz]; } return null; },
  clear(a,b,l){ const d=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.ceil(d/0.05); for(let i=1;i<n;i++){ const k=i/n; if(!Interior.inside(a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,l)) return false; } return true; },
  /* breadth-first over the deck's own map of where you can stand, then pulled straight wherever there is a clear line */
  walkTo(a,b,l){ const g=this.grid(l), {x0,z0,cell,nx,nz}=g, ci=p=>[clamp(Math.floor((p[0]-x0)/cell),0,nx-1),clamp(Math.floor((p[1]-z0)/cell),0,nz-1)];
    const ok=(i,j)=>i>=0&&j>=0&&i<nx&&j<nz&&Interior.inside(x0+(i+0.5)*cell,z0+(j+0.5)*cell,l), [si,sj]=ci(a), [ti,tj]=ci(b);
    const prev=new Int32Array(nx*nz).fill(-1), q=new Int32Array(nx*nz); let h=0, n=0; const s=sj*nx+si, e=tj*nx+ti; prev[s]=s; q[n++]=s;
    while(h<n&&prev[e]<0){ const k=q[h++], i=k%nx, j=(k-i)/nx; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ii=i+di, jj=j+dj, kk=jj*nx+ii; if(ok(ii,jj)&&prev[kk]<0){ prev[kk]=k; q[n++]=kk; } } }
    if(prev[e]<0) return [a,b];
    const cells=[]; for(let k=e;k!==s;k=prev[k]) cells.push([x0+(k%nx+0.5)*cell,z0+(Math.floor(k/nx)+0.5)*cell]); cells.push(a); cells.reverse(); cells.push(b);
    const out=[cells[0]]; let i=0; while(i<cells.length-1){ let j=cells.length-1; while(j>i+1&&!this.clear(cells[i],cells[j],l)) j--; out.push(cells[j]); i=j; } return out; },
  seatSpot(){ const S=Interior.seats[Interior.seats.length-1]; if(!S) return null; const l=S.userData.deck||0, p=this.near(S.position.x+0.55*Math.cos(S.rotation.y),S.position.z-0.55*Math.sin(S.rotation.y),l)||this.near(S.position.x,S.position.z,l); return p&&{p,l}; },
  faultSpot(id){ const f=Interior.fx[id]; if(!f) return null; const l=Interior.fitted&&Interior.fitted.layout?Interior.fitted.layout.spots[id].level:0, q=f.grp.position, p=this.near(q.x,q.z,l); return p&&{p,l,face:[q.x,q.z]}; },
  /* the walk for this leg of the job: seat to fault, or fault back to seat, taking a lift if they are on different decks */
  route(){ if(!Interior.group||Interior.shipId!==G.shipId||!this.job&&this.st!=='back') return null;
    const seat=this.seatSpot(), at=this.job?this.faultSpot(this.job):this.last; if(!seat||!at) return null; if(this.job) this.last=at;
    const from=this.st==='back'?at:seat, to=this.st==='back'?seat:at, pts=[];
    const leg=(a,b,l)=>{ for(const p of this.walkTo(a,b,l)) pts.push({x:p[0],z:p[1],l}); };
    if(from.l===to.l) leg(from.p,to.p,from.l);
    else { const lifts=Interior.fitted.layout.lifts.filter(k=>k.decks.includes(from.l)&&k.decks.includes(to.l)); if(!lifts.length) return null;
      const lf=lifts.reduce((a,b)=>Math.hypot(a.position[0]-from.p[0],a.position[1]-from.p[1])<Math.hypot(b.position[0]-from.p[0],b.position[1]-from.p[1])?a:b);
      const a=this.near(lf.position[0],lf.position[1],from.l), b=this.near(lf.position[0],lf.position[1],to.l); if(!a||!b) return null; leg(from.p,a,from.l); leg(b,to.p,to.l); }
    let len=0; pts[0].s=0; for(let i=1;i<pts.length;i++){ if(pts[i].l===pts[i-1].l) len+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z); pts[i].s=len; }
    return {pts,len,face:to.face}; },

  /* ---------- the figure, when there is somebody below decks to see it ---------- */
  figure(){ const m=G.mech, key=m.sp+':'+m.seed; if(this.F&&this.host===Interior.group&&this.F.userData.mkey===key) return this.F;
    this.drop(); const F=this.F=Folk.make(m.sp,m.seed,0.66); F.userData.mkey=key; this.host=Interior.group;
    const tool=new THREE.Group(), steel=new THREE.MeshStandardMaterial({color:C('#b9bec6'),roughness:0.35,metalness:0.9}); tool.add(Folk.bx(0.035,0.26,0.02,steel,0,-0.08,0)); tool.add(Folk.bx(0.09,0.06,0.02,steel,0,-0.23,0)); Folk.hold(F,tool,1); F.userData.tool=tool; return F; },
  sit(F){ const S=Interior.seats[Interior.seats.length-1], U=F.userData; if(!S){ F.visible=false; return; } if(this.sat&&F.parent===S) return; this.sat=true; F.visible=true; Folk.rest(F); U.tool.visible=false;
    const hip=U.legs[0]?U.legs[0].position.y*0.66:0.06; F.scale.setScalar(0.66); F.position.set(0.04,FLOOR+0.49-hip+0.02,0); F.rotation.set(0,Math.PI/2,0); for(const l of U.legs) l.rotation.x=-1.45;
    if(U.model){ const sa=U.seatAt; if(sa){ U.sit(true); F.position.set(0.04-sa.z*0.66,FLOOR+0.49-sa.y*0.66+0.02,sa.x*0.66); } else { F.scale.setScalar(0.42); F.position.set(0.04,FLOOR+0.51,0); } }
    else Folk.arms(F,[0.55,0.28],[0.55,0.28]); S.add(F); },
  stand(F){ if(!this.sat&&F.parent===Interior.group) return; this.sat=false; const U=F.userData; if(U.model&&U.seatAt&&U.sit) U.sit(false); Folk.rest(F); F.scale.setScalar(0.66); F.rotation.set(0,0,0); U.tool.visible=true; Interior.group.add(F); F.visible=true; },
  show(dt, t){
    const m=G.mech; if(!m||!Interior.group||Interior.shipId!==G.shipId){ if(this.F) this.drop(); return; }
    const F=this.figure(), U=F.userData; Folk.blink(F,t); this.level=null;
    if(this.st==='idle'){ this.sit(F); const S=F.parent; this.level=S&&S.userData.deck||0; U.rig.scale.y=1+Math.sin(t*1.6+U.ph)*0.012;
      const me=Walk.pos, wp=new V3().setFromMatrixPosition(S.matrix), d=Math.hypot(me.x-wp.x,me.z-wp.z); U.head.rotation.y=lerp(U.head.rotation.y,d<3.5?clamp(Math.atan2(me.x-wp.x,me.z-wp.z)-Math.PI/2,-0.9,0.9):Math.sin(t*0.3+U.ph)*0.3,1-Math.exp(-dt*4)); return; }
    if(!this.path){ this.path=this.route(); if(!this.path){ F.visible=false; return; } }
    this.stand(F); const P=this.path, pts=P.pts;
    if(this.st==='work'){ const e=pts[pts.length-1]; F.position.set(e.x,this.floor(e.l),e.z); this.level=e.l; if(P.face) F.rotation.y=Math.atan2(P.face[0]-e.x,P.face[1]-e.z);
      Folk.walk(F,0,0); const k=Math.sin(t*9); Folk.arms(F,[0.9,0.15],[1.35+k*0.45,0.1]); U.rig.rotation.x=0.12+Math.max(0,k)*0.05; U.head.rotation.x=0.18;
      if(k>0.96&&!this.tick){ this.tick=true; const me=Walk.pos; if(Walk.on&&Math.hypot(me.x-e.x,me.z-e.z)<6&&Walk.level===e.l) Sfx.click(); } if(k<0) this.tick=false; return; }
    // walking: how far along the route the clock says they are
    const s=clamp(1-this.t/this.T,0,1)*P.len; let i=1; while(i<pts.length-1&&pts[i].s<s) i++; const a=pts[i-1], b=pts[i], span=b.s-a.s, k=span>1e-4?clamp((s-a.s)/span,0,1):1;
    F.position.set(lerp(a.x,b.x,k),this.floor(span>1e-4?a.l:b.l),lerp(a.z,b.z,k)); this.level=span>1e-4?a.l:b.l;
    if(span>1e-4){ const want=Math.atan2(b.x-a.x,b.z-a.z); let d=((want-F.rotation.y+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI; F.rotation.y+=d*(1-Math.exp(-dt*9)); }
    this.ph+=dt*7.5; U.rig.rotation.x=0; U.head.rotation.x=0; Folk.walk(F,this.ph,0.9); },
  /* looked at from close by: a word with the mechanic */
  aim(eye, dir){ const F=this.F; if(!F||!F.visible||!G.mech||(Interior.fitted&&this.level!==Walk.level)) return null; const q=new V3(); F.getWorldPosition(q); Interior.group.worldToLocal(q); q.y+=0.75; const to=q.sub(eye), d=to.length(), dot=to.normalize().dot(dir); return d<3.2&&dot>0.85?{kind:'mech',d}:null; },
  prompt(pr, held){ const m=G.mech, T=this.tier(m); pr.hidden=false; pr.innerHTML=`<b>${esc(m.name)}</b><span>Your mechanic · ${TouchUI.on?'Tap Fix':'Press '+Controls.k('mine')} to chat${this.status()?' · '+esc(this.st==='work'?'working':'on the way'):''}</span>`;
    if(held&&!this.chatLock){ this.chatLock=true; setTimeout(()=>{ this.chatLock=false; },2500);
      const line=G.credits<this.wage(m)&&Faults.list().length?`I am owed ${this.wage(m)} credits a job. I checked. I have a little book.`:Deck.deal('m:chat:'+this.st,MECH_LINES[this.st==='work'?'working':this.st==='going'?'going':'idle']);
      Radio.play({sp:m.sp,seed:m.seed,name:`${m.name} · ${T.label} mechanic`,english:line}); } },
};
