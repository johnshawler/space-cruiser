/* ===================== TOUCH (iPad) ===================== */
/* On-screen controls for touch screens: a steering stick on the left, throttle and action buttons on the right,
   placed mid-height where thumbs rest when holding a tablet sideways. Also shows radio chatter as a large caption,
   because the glare-shield translator is too small to read on a tablet. */
const TouchUI = {
  on:false, stick:{x:0,y:0}, fly:null, f:0, capKey:'', rotTold:false,
  detect(){ try{ return (navigator.maxTouchPoints||0)>1 || matchMedia('(pointer:coarse)').matches; }catch(e){ return false; } },
  enable(){ if(this.on) return; this.on=true; document.body.classList.add('touch'); },
  init(){
    if(this.detect()) this.enable();
    window.addEventListener('pointerdown',e=>{ if(e.pointerType==='touch') this.enable(); },true);

    /* steering stick: knob follows the finger, values in -1..1 with a small dead zone */
    const base=$('t-stick'), knob=$('t-knob'); let sid=null;
    const dz=v=>{ const a=Math.abs(v); return a<0.12?0:Math.sign(v)*Math.min(1,(a-0.12)/0.88); };
    const move=e=>{ const r=base.getBoundingClientRect(), R=r.width/2; let dx=(e.clientX-r.left-R)/R, dy=(e.clientY-r.top-R)/R; const m=Math.hypot(dx,dy); if(m>1){ dx/=m; dy/=m; }
      this.stick.x=dz(dx); this.stick.y=dz(-dy); knob.style.transform=`translate(${dx*R*0.62}px,${dy*R*0.62}px)`; };
    base.addEventListener('pointerdown',e=>{ e.preventDefault(); sid=e.pointerId; try{ base.setPointerCapture(sid); }catch(_){} Sfx.init(); base.classList.add('on'); move(e); });
    base.addEventListener('pointermove',e=>{ if(e.pointerId===sid) move(e); });
    const endS=e=>{ if(e.pointerId!==sid) return; sid=null; this.stale=false; this.stick.x=this.stick.y=0; knob.style.transform=''; base.classList.remove('on'); };
    base.addEventListener('pointerup',endS); base.addEventListener('pointercancel',endS);

    /* throttle slider: drag or tap anywhere on it, top is full */
    const thr=$('t-thr'); let tid=null;
    const setT=e=>{ const r=thr.getBoundingClientRect(); Game.setThrottle(Math.round(clamp(1-(e.clientY-r.top-14)/(r.height-28),0,1)*10)); this.sync(true); };
    thr.addEventListener('pointerdown',e=>{ e.preventDefault(); tid=e.pointerId; try{ thr.setPointerCapture(tid); }catch(_){} Sfx.init(); setT(e); });
    thr.addEventListener('pointermove',e=>{ if(e.pointerId===tid) setT(e); });
    const endT=e=>{ if(e.pointerId===tid) tid=null; }; thr.addEventListener('pointerup',endT); thr.addEventListener('pointercancel',endT);

    /* tap buttons */
    const acts={
      warp:()=>Game.toggleWarp(), auto:()=>Game.setAutopilot(!G.sys.autopilot), horn:()=>Game.honk(), hail:()=>Comms.hail(),
      next:()=>Game.setTarget(G.target+1), map:()=>SysMap.toggle(), hold:()=>Hold.toggle(), scoop:()=>Scoop.toggle(), walk:()=>{ G.keys={}; Walk.toggle(); }, help:()=>{ $('help').hidden=false; }, centre:()=>Cockpit.zoomOut(),
    };
    document.querySelectorAll('#touch [data-act]').forEach(b=>{ b.addEventListener('click',()=>{ if(G.mode!=='flight') return; Sfx.init(); acts[b.dataset.act](); this.sync(true); }); });
    /* hold buttons act like holding a key */
    document.querySelectorAll('#touch [data-hold]').forEach(b=>{ const k=b.dataset.hold;
      const dn=e=>{ e.preventDefault(); try{ b.setPointerCapture(e.pointerId); }catch(_){} Sfx.init(); G.keys[k]=true; b.classList.add('lit'); };
      const upH=()=>{ G.keys[k]=false; b.classList.remove('lit'); };
      b.addEventListener('pointerdown',dn); b.addEventListener('pointerup',upH); b.addEventListener('pointercancel',upH); b.addEventListener('contextmenu',e=>e.preventDefault()); });
  },
  /* button lights and throttle readout */
  sync(force){
    const s=G.ship;
    if(force||this.f%6===0){
      $('t-fill').style.height=(s.throttle*10)+'%'; $('t-val').textContent=s.throttle===0?'STOP':String(s.throttle);
      $('t-warp').classList.toggle('lit',!!s.warp); $('t-scoop').classList.toggle('lit',Scoop.open); $('t-auto').classList.toggle('lit',!!G.sys.autopilot);
      $('t-centre').hidden=!G.head.zoomed&&Math.abs(G.head.yawT)<0.05&&Math.abs(G.head.pitchT-G.head.basePitch)<0.05;
    }
  },
  update(dt,t){
    this.f++;
    const fly=G.mode==='flight'; if(fly!==this.fly){ this.fly=fly; document.body.classList.toggle('flying',fly); if(!fly){ this.stick.x=this.stick.y=0; G.keys.KeyF=false; } }
    if(!fly){ this.caption(null); return; }
    if(this.on){ this.sync(false);
      if(!this.rotTold&&innerHeight>innerWidth*1.05){ this.rotTold=true; setTimeout(()=>UI.toast('Turn your iPad sideways to see the whole cockpit'),1500); } }
    if(this.f%3===0) this.caption(Radio.cur);
  },
  /* big readable subtitle for radio chatter, shown when the glare-shield text would be small */
  caption(c){
    const box=$('caption'), want=!!c&&G.sys.power&&!G.head.zoomed&&!Comms.open&&(!Dlg.open||Dlg.mini)&&(this.on||innerWidth<1280||Walk.on);   // walking, the translator screen is out of sight: a passenger's reply shows here
    if(!want){ if(!box.hidden){ box.hidden=true; this.capKey=''; $('toasts').style.top=''; document.body.classList.remove('cap'); } return; }
    const sp=SPECIES[c.sp], frac=clamp(c.t/Math.max(0.5,c.dur*0.8),0,1), on=G.sys.translator;
    const body=on?c.english.slice(0,Math.ceil(c.english.length*frac)):'Translator off · '+c.alien.slice(0,Math.ceil(c.alien.length*frac));
    const key=c.name+'|'+body; if(key===this.capKey) return; this.capKey=key;
    box.style.borderLeftColor=sp.col; box.innerHTML=`<b style="color:${sp.col}">${esc(c.name)}</b> <span>${esc(sp.name)}</span><p class="${on?'':'off'}">${esc(body)}</p>`;
    if(box.hidden){ box.hidden=false; document.body.classList.add('cap'); } $('toasts').style.top=(box.offsetTop+box.offsetHeight+10)+'px';
  },
};
