/* ===================== THE DINER AT THE END OF THE GALAXY ===================== */
/* The end of the game: one last place, far out past the last beacon, with a table kept by the window.
   It is not a port and takes no part in the economy, so it is not in PLANETS (saves store planet indices).
   It is a place on the chart, like the asteroid fields, and it is simply a very long way away: about 73 light-seconds
   from the sun. Warp burns 1.5 units of fuel a second, so of the five ships only the dearest carries enough to get
   there from anywhere. The others can try. A tow-barge will bring them back. */
const RESTAURANT = (() => { const ang=2.45, orbit=22000000;   // out beyond Beacon Far Wink, on the same bearing
  return {idx:200, name:'The Diner at the End of the Galaxy', short:'The Diner', port:'Last Orders', orbit, r:900, arriveR:5200, dropR:26000,
    pos:new V3(Math.cos(ang)*orbit,-90000,Math.sin(ang)*orbit)}; })();
const Restaurant = {
  group:null, shown:false, turned:false,
  top(){ return SHIPS.reduce((b,s,i)=>s.price>SHIPS[b].price?i:b,0); },
  canReach(){ return G.shipId===this.top(); },
  /* how far a ship gets on a full tank at warp */
  range(i){ const s=SHIPS[i]; return s.fuel/1.5*s.warp; },
  dist(){ return Math.max(0,RESTAURANT.pos.distanceTo(G.ship.pos)-RESTAURANT.r); },
  course(){ Pedia.learn('end');
    if(!this.canReach()){ UI.toast(`The chart will not plot it. Only a ${SHIPS[this.top()].name} carries the fuel to reach ${RESTAURANT.short}.`,'warn'); if(Sfx.ok()) Sfx.beep(330); return false; }
    const R=RESTAURANT; Nav.set({name:R.short.toUpperCase(),sub:'End of the galaxy · '+R.port,pos:R.pos.clone(),dropR:R.dropR,arriveR:R.arriveR,kind:'restaurant',onArrive:()=>this.arrive()});
    UI.toast(`Course laid in for ${R.name}. It is a long way. Fill the tanks first.`,'good'); return true; },

  /* ---------- what is out there to see ---------- */
  build(){
    const g=this.group=new THREE.Group(), R=RESTAURANT.r, glow=(hex,k)=>new THREE.MeshBasicMaterial({color:HDR(hex,k)}), add=o=>{ g.add(o); return o; };
    g.position.copy(RESTAURANT.pos);
    // the dining hall: a wide, low dish with a lit rim, a glass dome over the middle and a kitchen stack underneath
    const hull=add(new THREE.Mesh(new THREE.SphereGeometry(R,48,24),glow('#3f6f7c',0.95))); hull.scale.y=0.26;
    const rim=add(new THREE.Mesh(new THREE.TorusGeometry(R*0.98,R*0.035,10,96),glow('#ffcf7a',2.4))); rim.rotation.x=Math.PI/2;
    const band=add(new THREE.Mesh(new THREE.TorusGeometry(R*0.74,R*0.02,8,96),glow('#ff8a5c',1.6))); band.rotation.x=Math.PI/2; band.position.y=R*0.17;
    add(new THREE.Mesh(new THREE.SphereGeometry(R*0.46,40,20,0,Math.PI*2,0,Math.PI/2),glow('#ffe2a6',1.25))).position.y=R*0.2;
    add(new THREE.Mesh(new THREE.CylinderGeometry(R*0.2,R*0.3,R*0.7,24),glow('#2c4f59',0.8))).position.y=-R*0.5;
    add(new THREE.Mesh(new THREE.CylinderGeometry(R*0.31,R*0.31,R*0.05,24),glow('#7fe9ff',1.8))).position.y=-R*0.86;
    // three landing arms with a lamp at the end of each
    this.lamps=[]; for(let i=0;i<3;i++){ const a=i*Math.PI*2/3, arm=add(new THREE.Mesh(new THREE.BoxGeometry(R*0.9,R*0.05,R*0.1),glow('#4a7885',0.9))); arm.position.set(Math.cos(a)*R*1.35,-R*0.05,Math.sin(a)*R*1.35); arm.rotation.y=-a;
      const lamp=add(new THREE.Mesh(new THREE.SphereGeometry(R*0.06,12,8),glow('#8dffb0',3))); lamp.position.set(Math.cos(a)*R*1.82,-R*0.02,Math.sin(a)*R*1.82); this.lamps.push(lamp); }
    // the sign: hand-lettered, on a mast, readable from both sides
    const cv=makeCanvas(1024,384), x=cv.getContext('2d'); x.fillStyle='#0b1418'; x.fillRect(0,0,1024,384); x.strokeStyle='#ffcf7a'; x.lineWidth=14; x.strokeRect(14,14,996,356);
    x.textAlign='center'; x.fillStyle='#ffcf7a'; x.font=`700 150px ${FONT_DISP}`; x.fillText('OPEN LATE',512,170); x.fillStyle='#7fe9ff'; x.font=`600 78px ${FONT_DISP}`; x.fillText('LAST ORDERS · ALWAYS',512,300);
    const sign=add(new THREE.Group()), face=new THREE.MeshBasicMaterial({map:canvasTex(cv),color:new THREE.Color(1.7,1.7,1.7)}); sign.position.y=R*1.25; this.sign=sign;
    for(const ry of [0,Math.PI]){ const f=new THREE.Mesh(new THREE.PlaneGeometry(R*1.5,R*0.56),face); f.rotation.y=ry; f.position.z=ry?-R*0.012:R*0.012; sign.add(f); }   // two faces, so it never reads backwards
    add(new THREE.Mesh(new THREE.CylinderGeometry(R*0.02,R*0.02,R*0.75,8),glow('#24454f',0.7))).position.y=R*0.62;
    // a warm point of light to steer by from a long way off
    const far=new THREE.Sprite(new THREE.SpriteMaterial({map:glareTex(),color:new THREE.Color(2.4,1.7,0.9),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,sizeAttenuation:false})); far.scale.setScalar(0.07); g.add(far); this.far=far;
    World.universe.add(g); },
  update(dt, t){
    if(!this.group){ if(!World.universe) return; this.build(); }
    const d=this.dist(), s=G.ship; this.group.rotation.y+=dt*0.02; this.sign.rotation.y-=dt*0.08; const b=Math.floor(t*1.4); this.lamps.forEach((l,i)=>{ l.visible=(b+i)%3!==0; });
    this.far.material.opacity=clamp((d/RESTAURANT.r-6)/40,0,1);
    if(d>RESTAURANT.arriveR*4){ this.turned=false; this.shown=false; }
    if(G.mode==='flight'&&d<RESTAURANT.arriveR&&s.warpF<0.3) this.arrive(); },
  arrive(){
    if(this.shown||this.turned) return;
    if(!this.canReach()){ this.turned=true; UI.toast(`The doorman looks at your ship for some time. "I am so sorry. There is a dress code, and it is a ${SHIPS[this.top()].name}."`,'warn'); return; }
    this.shown=true; if(Nav.wp&&Nav.wp.kind==='restaurant') Nav.clear(true); this.ending(); },

  /* ---------- the ending ---------- */
  ending(){
    const s=G.ship; s.throttle=0; s.warp=false; G.sys.autopilot=false; if(typeof Walk!=='undefined') Walk.exit(true); if(SysMap.open) SysMap.close(); if(Sfx.ok()){ Sfx.cash(); Sfx.beep(660); setTimeout(()=>Sfx.beep(880),260); }
    const first=!G.won; G.won=true; const st=G.stats||{deliveries:0,earned:0}, mins=Math.round((G.playTime||0)/60), time=mins<60?`${mins} min`:`${Math.floor(mins/60)} h ${mins%60} min`;
    const rows=[['Time at the helm',time],['Deliveries made',String(st.deliveries||0)],['Credits earned',fmtCr(st.earned||0)],['Ship',SHIPS[G.shipId].name+(G.paint?' in '+G.paint.name:'')],['Ports visited',`${(G.seen||[]).length} of ${PLANETS.length}`]];
    if(G.mech) rows.push(['Mechanic',`${G.mech.name}, who has already found something to fix in the kitchen`]);
    $('ending-body').innerHTML=`<div class="eyebrow">The end of the galaxy · last orders</div><h1>You <span>made it</span></h1>
      <p class="pitch">${esc(RESTAURANT.name)} has one table by the window, and it has been holding it for you. Nobody here asks what you were carrying. The soup is hot. Out past the glass is everything you ever flew past, all at once and very small.</p>
      <p class="pitch">${first?'That is the long haul, hauled. The galaxy is still out there, and it still needs things moving from one end of it to the other.':'Back again. They kept the table. They always do.'}</p>
      <dl>${rows.map(r=>`<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl>
      <div class="btns"><button class="big" id="ending-stay">Keep flying</button><button class="big ghost" id="ending-new">New career</button></div>`;
    $('ending').hidden=false; Game.save();
    $('ending-stay').onclick=()=>{ $('ending').hidden=true; G.fuel=SHIPS[G.shipId].fuel; Game.save(); UI.toast('The house has filled your tanks. It is the least they could do, and they did check.','good'); const g=$('gl'); if(g) g.focus(); };
    $('ending-new').onclick=()=>{ $('ending').hidden=true; Game.newGame(); }; $('ending-stay').focus(); },
};
