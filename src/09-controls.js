/* ===================== CONTROLS ===================== */
/* Key and controller bindings, the Options screen that sets them, relative mouse steering and controller support.
   - Keys are remapped at the door: a pressed key becomes its action's original code (KeyW, KeyF, Space…), so the rest
     of the game keeps reading G.keys.KeyW and friends whatever the player has bound.
   - Steering, rolling and looking are analogue: controller sticks and triggers write Controls.an (0..1 per action), and
     the flight and walking code add that to the keys.
   - Relative mouse steering: click open space in the cockpit and the mouse is captured; moving it pushes a virtual
     stick (Controls.ms), drawn as a ring in the middle of the screen. Esc gives the mouse back.
   - In menus (title, ports, any open panel) the controller moves the focus between buttons: D-pad or left stick to
     move, A to press, B to go back. */
const CTL_ACTIONS = [
  // id, group, label, the code the game reads, default keys, default controller inputs, analogue?
  ['pitchUp',  'Flying', 'Nose up · walk forward',     'KeyW',      ['KeyW'],      ['A1-'], 1],
  ['pitchDown','Flying', 'Nose down · walk back',      'KeyS',      ['KeyS'],      ['A1+'], 1],
  ['yawLeft',  'Flying', 'Turn left · step left',      'KeyA',      ['KeyA'],      ['A0-'], 1],
  ['yawRight', 'Flying', 'Turn right · step right',    'KeyD',      ['KeyD'],      ['A0+'], 1],
  ['rollLeft', 'Flying', 'Roll left · turn left on foot','KeyQ',    ['KeyQ'],      ['B4'],  1],
  ['rollRight','Flying', 'Roll right · turn right on foot','KeyE',  ['KeyE'],      ['B5'],  1],
  ['thrUp',    'Flying', 'Throttle up',                'ThrUp',     ['Equal'],     ['B7']],
  ['thrDown',  'Flying', 'Throttle down',              'ThrDown',   ['Minus'],     ['B6']],
  ['stop',     'Flying', 'Full stop',                  'KeyX',      ['KeyX'],      []],
  ['warp',     'Flying', 'Warp drive on / off',        'KeyZ',      ['KeyZ'],      ['B3']],
  ['auto',     'Flying', 'Autopilot',                  'KeyP',      ['KeyP'],      ['B10']],
  ['next',     'Flying', 'Next destination (with Shift: previous)','KeyT',['KeyT'],['B12']],
  ['lookLeft', 'Looking','Look left',                  'ArrowLeft', ['ArrowLeft'], ['A2-'], 1],
  ['lookRight','Looking','Look right',                 'ArrowRight',['ArrowRight'],['A2+'], 1],
  ['lookUp',   'Looking','Look up',                    'ArrowUp',   ['ArrowUp'],   ['A3-'], 1],
  ['lookDown', 'Looking','Look down',                  'ArrowDown', ['ArrowDown'], ['A3+'], 1],
  ['centre',   'Looking','Centre the view',            'KeyC',      ['KeyC'],      ['B11']],
  ['hail',     'Radio and ship','Hail the nearest pilot','KeyH',    ['KeyH'],      ['B14']],
  ['horn',     'Radio and ship','Horn',                'KeyG',      ['KeyG'],      []],
  ['map',      'Radio and ship','System map',          'KeyM',      ['KeyM'],      ['B8']],
  ['hold',     'Radio and ship','Cargo hold',          'KeyI',      ['KeyI'],      []],
  ['scoop',    'Radio and ship','Cargo scoop open / closed','KeyB', ['KeyB'],      []],
  ['music',    'Radio and ship','Cabin music on / off','KeyN',      ['KeyN'],      []],
  ['pedia',    'Radio and ship','Haul-O-Pedia',        'KeyO',      ['KeyO'],      []],
  ['help',     'Radio and ship','Flight manual',       'F1',        ['F1'],        ['B9']],
  ['mine',     'Mining',  'Mining laser (hold) · fix or chat on foot','KeyF',['KeyF'],['B0']],
  ['survey',   'Mining',  'Survey the rocks',          'KeyR',      ['KeyR'],      ['B15']],
  ['rock',     'Mining',  'Choose another rock',       'KeyV',      ['KeyV'],      []],
  ['strike',   'Mining',  'Strike a crack',            'Space',     ['Space'],     ['B2']],
  ['walk',     'On foot', 'Get up / sit down',         'KeyL',      ['KeyL'],      ['B13']],
  ['run',      'On foot', 'Run (hold)',                'ShiftLeft', ['ShiftLeft','ShiftRight'], []],
  ['back',     'On foot', 'Back · close · hang up',    'Escape',    ['Escape'],    ['B1']],
];
// keys the game keeps for itself: Enter answers calls, the number row sets the throttle and picks answers
const CTL_FIXED = /^(Escape|Enter|NumpadEnter|Tab|Digit\d|Numpad\d|Meta\w*|ContextMenu|CapsLock|F5|F11|F12)$/;
const KEY_NAMES = { Space:'Space', Equal:'=', Minus:'−', BracketLeft:'[', BracketRight:']', Semicolon:';', Quote:"'", Comma:',', Period:'.', Slash:'/', Backslash:'\\', Backquote:'`',
  ArrowLeft:'←', ArrowRight:'→', ArrowUp:'↑', ArrowDown:'↓', ShiftLeft:'Left Shift', ShiftRight:'Right Shift', ControlLeft:'Left Ctrl', ControlRight:'Right Ctrl', AltLeft:'Left Alt', AltRight:'Right Alt',
  Escape:'Esc', Backspace:'Backspace', Delete:'Delete', Insert:'Insert', Home:'Home', End:'End', PageUp:'Page Up', PageDown:'Page Down', NumpadAdd:'Num +', NumpadSubtract:'Num −', NumpadMultiply:'Num *', NumpadDivide:'Num /', NumpadDecimal:'Num .' };
const PAD_NAMES = { xbox:['A','B','X','Y','LB','RB','LT','RT','View','Menu','Left stick click','Right stick click','D-pad ↑','D-pad ↓','D-pad ←','D-pad →','Guide'],
  ps:['✕ Cross','○ Circle','□ Square','△ Triangle','L1','R1','L2','R2','Create','Options','L3','R3','D-pad ↑','D-pad ↓','D-pad ←','D-pad →','PS'] };

const Controls = {
  list:[], A:{}, cfg:null, map:{}, an:{}, open:false, wait:null, last:'key', pad:null, ps:{}, held:{}, nav:{}, navOn:false,
  ms:{on:false, drag:false, x:0, y:0, look:false, fire:false},
  MOUSE:{steer:false, sens:1, centre:true},

  init(){
    this.list=CTL_ACTIONS.map(([id,group,label,code,keys,pad,analog])=>({id,group,label,code,keys,pad,analog:!!analog}));
    for(const a of this.list){ this.A[a.id]=a; this.an[a.id]=0; }
    this.load(); this.rebuild(); this.bindMouse(); this.bindOptions();
    window.addEventListener('gamepadconnected',e=>{ if(e.gamepad&&G.mode!=='boot') UI.toast(`Controller connected: ${this.padName(e.gamepad.id)}`,'good'); this.render&&this.open&&this.render(); });
    window.addEventListener('gamepaddisconnected',()=>{ UI.toast('Controller disconnected','warn'); this.releasePad(); if(this.open) this.render(); });
    this.refreshLabels();
  },
  /* ---------- the saved bindings (one per browser, not per career) ---------- */
  load(){ let d=null; try{ d=JSON.parse(localStorage.getItem('lh-controls')||'null'); }catch(e){}
    this.cfg={keys:{},pad:{},mouse:Object.assign({},this.MOUSE)};
    for(const a of this.list){ this.cfg.keys[a.id]=a.keys.slice(); this.cfg.pad[a.id]=a.pad.slice(); }
    if(d&&d.v===1){ for(const a of this.list){ if(Array.isArray(d.keys?.[a.id])) this.cfg.keys[a.id]=d.keys[a.id].filter(k=>typeof k==='string').slice(0,2);
        if(Array.isArray(d.pad?.[a.id])) this.cfg.pad[a.id]=d.pad[a.id].filter(k=>/^(B\d+|A\d+[+-])$/.test(k)).slice(0,2); }
      if(d.mouse) Object.assign(this.cfg.mouse,{steer:!!d.mouse.steer,sens:clamp(+d.mouse.sens||1,0.3,3),centre:d.mouse.centre!==false}); }
    this.cfg.keys.back=['Escape']; },
  save(){ try{ localStorage.setItem('lh-controls',JSON.stringify(Object.assign({v:1},this.cfg))); }catch(e){} },
  rebuild(){ const m={}; for(const a of this.list) m[a.code]=null; for(const a of this.list) for(const k of this.cfg.keys[a.id]) m[k]=a.code; this.map=m; },
  /* the code the game should see for a pressed key: its action's code, nothing if the key is now unbound */
  code(phys){ return phys in this.map?this.map[phys]:phys; },

  /* ---------- names for keys and buttons, for prompts and lists ---------- */
  keyName(c){ return KEY_NAMES[c]||c.replace(/^Key|^Digit/,'').replace(/^Numpad/,'Num ').replace(/^(Shift|Control|Alt)(Left|Right)$/,'$1'); },
  padName(id){ id=id||''; const n=id.replace(/\s*\(.*\)\s*/g,' ').replace(/\s+/g,' ').trim(); return n||'Controller'; },
  // Sony pads name themselves “Wireless Controller” (vendor 054c); Xbox ones say Xbox
  isPS(id){ return /054c|playstation|dualsense|dualshock/i.test(id)||/wireless controller/i.test(id)&&!/xbox|045e/i.test(id); },
  padKind(){ return this.pad&&this.pad.ps?'ps':'xbox'; },
  inputName(inp){ if(inp[0]==='B'){ const i=+inp.slice(1); return PAD_NAMES[this.padKind()][i]||'Button '+i; }
    const m=inp.match(/^A(\d+)([+-])$/), ax=+m[1], s=m[2]==='+'; const st=ax<2?(this.padKind()==='ps'?'Left stick':'Left stick'):ax<4?'Right stick':'Axis '+ax;
    return ax<4?`${st} ${ax%2?(s?'↓':'↑'):(s?'→':'←')}`:`${st} ${s?'+':'−'}`; },
  /* the key (or, after a controller was last used, the button) for an action, for on-screen prompts */
  k(id, dev){ const a=this.A[id]; if(!a) return id; const pad=this.cfg.pad[id][0], key=this.cfg.keys[id][0];
    if((dev||this.last)==='pad'&&pad&&this.pad) return this.inputName(pad); return key?this.keyName(key):pad?this.inputName(pad):'(unbound)'; },
  fill(s, dev){ return String(s).replace(/\{(\w+)\}/g,(m,id)=>this.A[id]?this.k(id,dev):m); },
  refreshLabels(){ document.querySelectorAll('[data-k]').forEach(e=>{ e.textContent=this.fill(e.dataset.k,'key'); }); },

  /* ---------- every frame ---------- */
  update(dt){
    this.poll(dt);
    const M=this.ms;
    if(M.on&&(G.mode!=='flight'||this.panelOpen())) this.unlock(); if(M.drag&&G.mode!=='flight') M.drag=false;
    const act=(M.on||M.drag)&&!Walk.on;
    if(act){ if(this.cfg.mouse.centre&&!M.moved){ const k=Math.exp(-dt*1.7); M.x*=k; M.y*=k; } M.moved=false;
      const r=Math.hypot(M.x,M.y); if(r<0.02){ M.x=M.y=0; } }
    // what steering sees: a small dead zone in the middle so the ship can be held straight
    const r=Math.hypot(M.x,M.y), dz=0.06, g=r>dz?(r-dz)/(1-dz)/r:0; M.ox=act?M.x*g:0; M.oy=act?M.y*g:0; if(!act&&!M.on){ M.x=M.y=0; }
    const ring=$('msteer'), show=act&&G.mode==='flight';
    if(ring.hidden===show) ring.hidden=!show;
    if(show) $('msteer-dot').style.transform=`translate(${(M.x*78).toFixed(1)}px,${(-M.y*78).toFixed(1)}px)`;
  },
  /* a panel that needs the pointer free (or, for the controller, means menu mode) */
  panelOpen(){ return this.open||!$('help').hidden||Pedia.open||SysMap.open||Hold.open||Specs.open||(Dlg.open&&!Dlg.mini); },

  /* ---------- relative mouse steering ---------- */
  bindMouse(){
    const gl=$('gl');
    document.addEventListener('pointerlockchange',()=>{ const on=document.pointerLockElement===gl; if(on===this.ms.on) return; this.ms.on=on; this.ms.x=this.ms.y=0; if(on){ this.ms.drag=false; Cockpit.drag=null; }
      if(!on){ if(this.ms.fire){ G.keys.KeyF=false; this.ms.fire=false; } this.ms.look=false; return; }
      $('tooltip').hidden=true; this.last='key';
      if(!this.toldLock){ this.toldLock=true; UI.toast('Mouse steering. Move to turn, wheel for throttle, left button mines, right button looks around. Esc frees the mouse.','good'); } });
    document.addEventListener('pointerlockerror',()=>{ const n=performance.now(); if(this.lockErr&&n-this.lockErr<20000) return; this.lockErr=n;
      UI.toast('This browser will not hand over the mouse. Hold the left button and drag to steer instead.','warn'); });
    document.addEventListener('mousemove',e=>{ if(this.navOn&&(e.movementX||e.movementY)&&!this.ms.on) this.padNav(false); if(!this.ms.on) return; this.move(e.movementX||0,e.movementY||0); });
    gl.addEventListener('contextmenu',e=>{ if(this.ms.on) e.preventDefault(); });
  },
  move(dx, dy){ const M=this.ms, s=this.cfg.mouse.sens;
    if(Walk.on){ Walk.look(dx*s,dy*s); return; }
    if(M.look){ const H=G.head, k=0.0032*(H.fov/72)*s; H.yawT=clamp(H.yawT-dx*k,-2.5,2.5); H.pitchT=clamp(H.pitchT-dy*k,-1.25,1.3); return; }
    const k=0.0042*s; M.x+=dx*k; M.y-=dy*k; const r=Math.hypot(M.x,M.y); if(r>1){ M.x/=r; M.y/=r; } M.moved=true; },
  /* the cockpit asks: should this click take the mouse? (steering is on and the click was on open space) */
  wantLock(e){ return this.cfg.mouse.steer&&e.pointerType==='mouse'&&e.button===0&&G.mode==='flight'&&!this.panelOpen(); },
  // raw mouse movement where the browser offers it, plain otherwise; a refusal arrives as pointerlockerror
  lock(){ const gl=$('gl'), plain=()=>{ try{ const q=gl.requestPointerLock(); if(q&&q.catch) q.catch(()=>{}); }catch(_){} };
    try{ const p=gl.requestPointerLock({unadjustedMovement:true}); if(p&&p.catch) p.catch(e=>{ if(e&&e.name==='NotSupportedError') plain(); }); }catch(e){ plain(); } },
  unlock(){ if(document.pointerLockElement) document.exitPointerLock(); },
  /* buttons and the wheel while the mouse is captured; true when handled */
  mouseDown(e){ if(!this.ms.on) return false; if(e.button===0){ G.keys.KeyF=true; this.ms.fire=true; } else if(e.button===2) this.ms.look=true; return true; },
  mouseUp(e){ if(!this.ms.on) return false; if(e.button===0&&this.ms.fire){ G.keys.KeyF=false; this.ms.fire=false; } else if(e.button===2) this.ms.look=false; return true; },
  wheel(e){ if(!this.ms.on) return false; e.preventDefault(); if(!Walk.on) Game.setThrottle(G.ship.throttle+(e.deltaY<0?1:-1)); return true; },

  /* ---------- controller ---------- */
  gp(){ let list=[]; try{ list=navigator.getGamepads?navigator.getGamepads():[]; }catch(e){} let best=null;
    for(const g of list) if(g&&g.connected&&(!best||g.timestamp>best.timestamp)) best=g; return best; },
  val(gp, inp){ if(inp[0]==='B'){ const b=gp.buttons[+inp.slice(1)]; return b?Math.max(b.value||0,b.pressed?1:0):0; }
    const m=inp.match(/^A(\d+)([+-])$/); if(!m) return 0; let v=gp.axes[+m[1]]||0; if(m[2]==='-') v=-v; const dz=0.18; return v>dz?(v-dz)/(1-dz):0; },
  releasePad(){ for(const id in this.held) if(this.held[id]){ this.held[id]=false; const a=this.A[id]; if(a&&!a.analog) Game.keyUp(a.code); } for(const id in this.an) this.an[id]=0; this.pad=null; },
  poll(dt){
    const gp=this.gp(); if(!gp){ if(this.pad) this.releasePad(); return; }
    if(!this.pad||this.pad.id!==gp.id){ this.pad={id:gp.id,ps:this.isPS(gp.id)}; }
    // anything pressed or pushed makes the controller the one prompts talk about
    let any=false; for(const b of gp.buttons) if(b&&(b.pressed||b.value>0.5)) any=true; for(const a of gp.axes) if(Math.abs(a)>0.5) any=true; if(any) this.last='pad';
    if(this.wait&&this.wait.dev==='pad'){ this.listenPad(gp); return; }
    const menu=this.menuMode(), skip=G.mode==='landing'||G.mode==='takeoff', flying=G.mode==='flight';
    // in menus A, B and the D-pad move the focus instead (and the left stick too, when the ship isn't flying)
    const reserved=inp=>(menu||skip)&&(/^B(0|1|1[2-5])$/.test(inp)||!flying&&/^A[01][+-]$/.test(inp));
    for(const a of this.list){ let v=0; for(const inp of this.cfg.pad[a.id]) if(!reserved(inp)) v=Math.max(v,this.val(gp,inp));
      if(a.analog){ this.an[a.id]=flying?Math.pow(v,1.5):0; continue; }
      const was=!!this.held[a.id], now=was?v>0.35:v>0.6; if(now===was){ if(now&&(a.id==='thrUp'||a.id==='thrDown')){ this.ps[a.id]=(this.ps[a.id]||0)-dt; if(this.ps[a.id]<=0){ this.ps[a.id]=0.18; Game.onKey(this.fake(true),a.code); } } continue; }
      this.held[a.id]=now; if(now){ this.ps[a.id]=0.45; Game.onKey(this.fake(false),a.code); } else Game.keyUp(a.code); }
    if(skip){ if(this.edge(gp,'B0')||this.edge(gp,'B1')) Game.onKey(this.fake(false),'Space'); return; }
    if(menu) this.menuPad(gp,dt,flying); else { this.edge(gp,'B0'); this.edge(gp,'B1'); }
  },
  fake(rep){ return {repeat:!!rep,shiftKey:false,metaKey:false,ctrlKey:false,altKey:false,target:null,preventDefault(){}}; },
  /* true on the frame a button goes down */
  edge(gp, inp){ const v=this.val(gp,inp)>0.6, was=!!this.nav[inp]; this.nav[inp]=v; return v&&!was; },
  /* ---------- the controller in menus: move the focus, press, go back ---------- */
  menuMode(){ return G.mode==='title'||G.mode==='port'||this.panelOpen()||Dlg.open||Comms.open; },
  navRoot(){ if(this.open) return $('options'); if(Pedia.open) return $('pedia'); if(!$('help').hidden) return $('help'); if(Specs.open) return $('specs'); if(Hold.open) return $('hold');
    if(SysMap.open) return $('map'); if(Dlg.open) return $('dlg'); if(Comms.open) return $('comms'); if(G.mode==='title') return $('title'); return document.body; },
  padNav(on){ if(on===this.navOn) return; this.navOn=on; document.body.classList.toggle('pad-nav',on); },
  menuPad(gp, dt, flying){
    const dirs=[['B12',0,-1],['B13',0,1],['B14',-1,0],['B15',1,0]]; let d=null;
    for(const [b,x,y] of dirs) if(this.val(gp,b)>0.6) d=[x,y];
    if(!d&&!flying){ const ax=gp.axes[0]||0, ay=gp.axes[1]||0; if(Math.hypot(ax,ay)>0.6) d=Math.abs(ax)>Math.abs(ay)?[Math.sign(ax),0]:[0,Math.sign(ay)]; }
    const key=d?d.join(','):''; if(key!==this.nav.dir){ this.nav.dir=key; this.nav.rep=0.42; if(d) this.step(d); }
    else if(d){ this.nav.rep-=dt; if(this.nav.rep<=0){ this.nav.rep=0.13; this.step(d); } }
    if(this.edge(gp,'B0')) this.press();
    if(this.edge(gp,'B1')) this.back();
    // the right stick scrolls long pages (the manual, the Pedia, the shop lists)
    const sy=gp.axes[3]||0; if(Math.abs(sy)>0.25&&!flying){ const sc=this.scroller(); if(sc) sc.scrollTop+=sy*dt*900; }
  },
  // everything that can be pressed (buttons scrolled out of a long panel count too: focusing one scrolls it into view)
  cands(root){
    return [...root.querySelectorAll('button,a[href],input,select,[tabindex]:not([tabindex="-1"])')].filter(e=>{ if(e.disabled||e.tagName==='CANVAS'||!e.getClientRects().length) return false;
      const r=e.getBoundingClientRect(); if(r.width<2||r.height<2) return false; const cs=getComputedStyle(e); return cs.visibility!=='hidden'&&cs.pointerEvents!=='none'; }); },
  step(d){ this.padNav(true); const root=this.navRoot(), C=this.cands(root); if(!C.length) return; let cur=document.activeElement;
    if(cur&&cur.type==='range'&&d[0]&&C.includes(cur)){ cur.value=+cur.value+d[0]*(+cur.step||1); cur.dispatchEvent(new Event('input',{bubbles:true})); return; }
    if(!cur||!C.includes(cur)){ this.focus(this.first(C)); return; }
    // up and down go to the nearest row, then the closest button across it; left and right stay on the same row if they can
    const a=cur.getBoundingClientRect(), ox=a.left+a.width/2, oy=a.top+a.height/2, V=[];
    for(const c of C){ if(c===cur) continue; const r=c.getBoundingClientRect(), dx=r.left+r.width/2-ox, dy=r.top+r.height/2-oy, along=d[0]?dx*d[0]:dy*d[1]; if(along<=2) continue;
      const gap=Math.max(0,d[0]?(d[0]>0?r.left-a.right:a.left-r.right):(d[1]>0?r.top-a.bottom:a.top-r.bottom));
      const off=d[0]?Math.max(0,Math.max(r.top,a.top)-Math.min(r.bottom,a.bottom)):Math.max(0,Math.max(r.left,a.left)-Math.min(r.right,a.right));
      V.push({c,gap,off,perp:Math.abs(d[0]?dy:dx),along}); }
    let pool=V, score;
    if(d[1]){ const g0=Math.min(...V.map(v=>v.gap)); pool=V.filter(v=>v.gap<=g0+24); score=v=>v.off+v.perp*0.2; }
    else { const row=V.filter(v=>v.off===0); pool=row.length?row:V.filter(v=>v.perp<v.along); score=v=>v.gap+v.off*3+v.perp*0.25; }
    let best=null, bs=1e9; for(const v of pool){ const sc=score(v); if(sc<bs){ bs=sc; best=v.c; } }
    if(best) this.focus(best); },
  first(C){ return C.slice().sort((p,q)=>{ const a=p.getBoundingClientRect(), b=q.getBoundingClientRect(); return Math.abs(a.top-b.top)>8?a.top-b.top:a.left-b.left; })[0]; },
  focus(e){ if(!e) return; try{ e.focus({preventScroll:true}); }catch(_){ e.focus(); } e.scrollIntoView({block:'nearest',inline:'nearest'}); if(Sfx.ok()) Sfx.click(); },
  press(){ this.padNav(true); Sfx.init();
    if(Dlg.open&&Dlg.mini){ Dlg.expand(); const o=$('dlg-opts').querySelector('button:not([disabled])'); if(o) this.focus(o); return; }
    const root=this.navRoot(), C=this.cands(root), cur=document.activeElement;
    if(cur&&C.includes(cur)){ if(cur.type!=='range') cur.click(); return; }
    this.focus(this.first(C)); },
  back(){ this.padNav(true);
    if(this.open){ if(this.wait) this.stopListen(); else this.close(); return; }
    if(Specs.open){ Specs.close(); return; } if(Hold.open){ Hold.toggle(false); return; }
    if(G.mode==='port'&&!this.panelOpen()&&!Dlg.open){ const L=$('launch'); if(document.activeElement!==L&&this.cands(document.body).includes(L)) this.focus(L); return; }
    Game.onKey(this.fake(false),'Escape'); },
  scroller(){ let e=document.activeElement; const root=this.navRoot();
    for(;e&&e!==document.body;e=e.parentElement){ const cs=getComputedStyle(e); if(/(auto|scroll)/.test(cs.overflowY)&&e.scrollHeight>e.clientHeight+4) return e; }
    for(const s of root.querySelectorAll('*')){ const cs=getComputedStyle(s); if(/(auto|scroll)/.test(cs.overflowY)&&s.scrollHeight>s.clientHeight+4) return s; }
    return /(auto|scroll)/.test(getComputedStyle(root).overflowY)?root:null; },

  /* ---------- the Options screen ---------- */
  bindOptions(){
    for(const id of ['btn-options','help-options']){ const b=$(id); if(b) b.onclick=()=>this.show(); }
    $('opt-close').onclick=()=>this.close(); $('options').onclick=e=>{ if(e.target.id==='options') this.close(); };
    // while the screen is open it has the keyboard: the game behind it hears nothing
    window.addEventListener('keydown',e=>{ if(!this.open) return; e.stopImmediatePropagation();
      if(this.wait&&this.wait.dev==='key'){ e.preventDefault(); this.listenKey(e); return; }
      if(this.wait&&e.code==='Escape'){ e.preventDefault(); this.stopListen(); return; }
      if(e.code==='Escape'){ e.preventDefault(); this.close(); } },true);
    window.addEventListener('keyup',e=>{ if(this.open) e.stopImmediatePropagation(); },true);
  },
  show(){ this.open=true; this.wait=null; this.say(''); $('options').hidden=false; this.unlock(); this.render(); if(Sfx.ok()) Sfx.click();
    if(this.navOn) this.focus($('opt-close')); else $('opt-close').focus({preventScroll:true}); },
  close(){ if(!this.open) return; this.open=false; this.wait=null; $('options').hidden=true; this.refreshLabels(); if(Sfx.ok()) Sfx.click();
    const back=!$('help').hidden?$('help-options'):G.mode==='title'?$('btn-options'):null; if(back&&this.navOn) this.focus(back); },
  say(t, warn){ const m=$('opt-msg'); m.textContent=t; m.classList.toggle('warn',!!warn); },
  render(){
    const body=$('opt-body'), M=this.cfg.mouse, gp=this.gp(), kind=gp?(this.isPS(gp.id)?'ps':'xbox'):this.padKind();
    if(gp&&(!this.pad||this.pad.id!==gp.id)) this.pad={id:gp.id,ps:kind==='ps'};
    const two=(lab,on,a,b,fa,fb)=>{ const r=el('div','orow'); r.appendChild(el('span','',lab)); const x=el('button','btn'+(on?' on':''),a), y=el('button','btn'+(on?'':' on'),b);
      x.setAttribute('aria-pressed',on); y.setAttribute('aria-pressed',!on); x.onclick=fa; y.onclick=fb; r.append(x,y); return r; };
    const set=(k,v)=>{ M[k]=v; this.save(); this.render(); if(Sfx.ok()) Sfx.click(); };
    body.innerHTML='';
    body.appendChild(el('h3','','Mouse'));
    body.appendChild(two('In the cockpit, the mouse',!M.steer,'Drags to look','Steers the ship',()=>set('steer',false),()=>set('steer',true)));
    { const r=el('div','orow'); r.appendChild(el('span','','Steering sensitivity')); const i=document.createElement('input'); i.type='range'; i.min='0.3'; i.max='3'; i.step='0.1'; i.value=M.sens; i.setAttribute('aria-label','Steering sensitivity');
      const v=el('b','',M.sens.toFixed(1)); i.oninput=()=>{ M.sens=clamp(+i.value,0.3,3); v.textContent=M.sens.toFixed(1); this.save(); }; r.append(i,v); body.appendChild(r); }
    body.appendChild(two('When you stop moving the mouse',M.centre,'Ship stops turning','Ship keeps turning',()=>set('centre',true),()=>set('centre',false)));
    body.appendChild(el('p','note',M.steer?`Click open space in the cockpit to take the mouse. Move it to turn: the ring in the middle of the screen shows how hard. The wheel sets the throttle, the left button fires the mining laser and the right button looks around. Esc gives the mouse back. Controls on the panels need the mouse free.`
      :`Choose “Steers the ship” to fly with the mouse. Dragging still looks around, and the panels still work with clicks.`));
    body.appendChild(el('h3','','Controller'));
    body.appendChild(el('p','note pad-status',gp?`Connected: <b>${esc(this.padName(gp.id))}</b>.`:'No controller found. Connect one and press any button on it.'));
    body.appendChild(el('p','note','In menus and shops: the D-pad or left stick moves between buttons, A presses, B goes back, and the right stick scrolls.'));
    body.appendChild(el('h3','','Keys and buttons'));
    body.appendChild(el('p','note','Choose a box, then press the key or controller button you want. Esc cancels, Backspace clears. A key that is already in use moves to the new job. The number keys, Enter and Esc stay as they are.'));
    const tb=document.createElement('table'); tb.innerHTML='<thead><tr><th>Action</th><th>Key</th><th>Second key</th><th>Controller</th></tr></thead>'; const tbody=document.createElement('tbody'); let grp='';
    const slot=(a,dev,i)=>{ const v=dev==='key'?this.cfg.keys[a.id][i]:this.cfg.pad[a.id][i], w=this.wait&&this.wait.id===a.id&&this.wait.dev===dev&&this.wait.i===i;
      const b=el('button','slot'+(w?' wait':'')+(v?'':' none'),w?(dev==='key'?'Press a key…':'Press a button…'):v?esc(dev==='key'?this.keyName(v):this.inputName(v)):'—');
      b.setAttribute('aria-label',`${a.label}, ${dev==='key'?(i?'second key':'key'):'controller'}: ${v?(dev==='key'?this.keyName(v):this.inputName(v)):'none'}`);
      if(a.id==='back'&&dev==='key') b.disabled=true; else b.onclick=()=>this.listen(a.id,dev,i); return b; };
    for(const a of this.list){ if(a.group!==grp){ grp=a.group; const r=document.createElement('tr'), c=document.createElement('td'); c.colSpan=4; c.className='grp'; c.textContent=grp; r.appendChild(c); tbody.appendChild(r); }
      const r=document.createElement('tr'); const n=document.createElement('td'); n.textContent=a.label; r.appendChild(n);
      for(const [dev,i] of [['key',0],['key',1],['pad',0]]){ const c=document.createElement('td'); c.appendChild(slot(a,dev,i)); r.appendChild(c); } tbody.appendChild(r); }
    tb.appendChild(tbody); body.appendChild(tb);
    const foot=el('div','orow'); const rs=el('button','btn','Reset everything to the defaults'); rs.onclick=()=>{ if(!this.sure){ this.sure=true; rs.textContent='Press again to reset'; setTimeout(()=>{ this.sure=false; if(rs.isConnected) rs.textContent='Reset everything to the defaults'; },3000); return; }
      this.sure=false; try{ localStorage.removeItem('lh-controls'); }catch(e){} this.load(); this.rebuild(); this.render(); this.say('Back to the defaults.'); if(Sfx.ok()) Sfx.click(); };
    foot.appendChild(rs); body.appendChild(foot);
  },
  listen(id, dev, i){ const a=this.A[id]; if(dev==='pad'&&!this.gp()){ this.say('Connect a controller first, then press any button on it.',true); return; }
    this.wait={id,dev,i,armed:false,t0:performance.now()}; this.say(dev==='key'?`Press a key for “${a.label}”. Esc cancels, Backspace clears.`:`Press a button or push a stick for “${a.label}”. If nothing comes in 8 seconds, nothing changes.`); this.render();
    const s=$('opt-body').querySelector('.slot.wait'); if(s) s.focus({preventScroll:true}); },
  stopListen(msg){ const w=this.wait; this.wait=null; this.say(msg||''); this.render(); if(w){ const s=[...$('opt-body').querySelectorAll('.slot')].find(b=>b.getAttribute('aria-label').startsWith(this.A[w.id].label+',')); if(s) s.focus({preventScroll:true}); } },
  listenKey(e){ const w=this.wait, a=this.A[w.id], c=e.code; if(!c) return;
    if(c==='Escape'){ this.stopListen('Nothing changed.'); return; }
    if(c==='Backspace'||c==='Delete'){ this.cfg.keys[a.id].splice(w.i,1); this.done(`“${a.label}” has ${this.cfg.keys[a.id].length?'one key now':'no key now'}.`); return; }
    if(CTL_FIXED.test(c)){ this.say(`${this.keyName(c)} is kept for the game. Choose another key.`,true); return; }
    let took=''; for(const b of this.list) if(b!==a){ const j=this.cfg.keys[b.id].indexOf(c); if(j>=0){ this.cfg.keys[b.id].splice(j,1); took=b.label; } }
    const ks=this.cfg.keys[a.id].slice(); ks[w.i]=c; this.cfg.keys[a.id]=ks.filter((k,j)=>k&&ks.indexOf(k)===j).slice(0,2);
    this.done(`“${a.label}” is ${this.keyName(c)}.`+(took?` It was on “${took}”, which no longer has it.`:'')); },
  listenPad(gp){ const w=this.wait; if(performance.now()-w.t0>8000){ this.stopListen('Nothing changed.'); return; } const all=[...gp.buttons.map((b,i)=>'B'+i),...gp.axes.flatMap((x,i)=>['A'+i+'+','A'+i+'-'])];
    // wait until everything is let go (the press that chose the box), then take the first thing pressed
    if(!w.armed){ if(all.every(inp=>this.val(gp,inp)<0.3)) w.armed=true; return; }
    const inp=all.find(x=>this.val(gp,x)>0.7); if(!inp) return; const a=this.A[w.id];
    let took=''; for(const b of this.list) if(b!==a){ const j=this.cfg.pad[b.id].indexOf(inp); if(j>=0){ this.cfg.pad[b.id].splice(j,1); took=b.label; } }
    this.cfg.pad[a.id]=[inp]; for(const x of all) this.nav[x]=this.val(gp,x)>0.6;   // so letting go of it doesn't also press the box again
    this.done(`“${a.label}” is ${this.inputName(inp)}.`+(took?` It was on “${took}”, which no longer has it.`:'')); },
  done(msg){ this.save(); this.rebuild(); if(Sfx.ok()) Sfx.click(); this.stopListen(msg); },
};
