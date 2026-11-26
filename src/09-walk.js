/* ===================== WALKING AROUND THE SHIP, FAULTS AND REPAIRS ===================== */
/* Ship-local coordinates in metres, same frame as the cockpit: the pilot's eye is at the origin, -z is forward,
   the cockpit floor is at y=-0.97 and its back wall at z=0.68. The rest of the ship is behind that wall:
   a corridor, a passenger cabin (left), a galley (right), the cargo hold, and the engine room at the back. */
const FLOOR=-0.97, CEIL=1.33, EYE=0.62;

/* ---------- faults: things that break, where they are, what they do until fixed ---------- */
const FAULT_DEFS = {
  coolant:{name:'Coolant leak', where:'passenger cabin', effect:'fuel use up 70%', pos:[-3.0,-0.35,1.55], fx:'steam'},
  thruster:{name:'Thruster misfire', where:'engine room', effect:'top speed down 40%', pos:[1.3,0.35,18.85], fx:'smoke'},
  fuse:{name:'Blown fuse', where:'galley', effect:'radio is dead', pos:[2.45,0.45,1.46], fx:'sparks'},
  scrubber:{name:'Air scrubber jammed', where:'scrubber bay', effect:'passengers getting cross, canopy fogging', pos:[-3.0,0.95,5.86], fx:'haze'},
  crack:{name:'Hull crack', where:'corridor', effect:'hull slowly failing', pos:[-0.86,0.55,5.15], fx:'frost'},
  strap:{name:'Cargo strap snapped', where:'cargo hold', effect:'cargo getting knocked about, value dropping faster', pos:[1.55,0.1,10.6], fx:'strap'},
  seal:{name:'Airlock seal leaking', where:'airlock', effect:'top speed down 20%', pos:[2.82,0.45,5.32], fx:'steam'},
};
/* what there is to say after a repair: a few for each fault, and some that fit anything */
const FIX_LINES = {
  any:['Nobody saw you hit it with the spanner.','The manual said to call a professional. You are the nearest thing for several light-seconds.','It was not the red wire. It was never the red wire.','You have one screw left over. The ship seems fine without it.','That should hold until it does not.','You did not fix it so much as persuade it.','The warranty expired at roughly the moment you touched it.','It is now the most reliable part of the ship. This is not a compliment to the ship.','You fixed it by turning it off and on again. Nobody needs to know.','The tape was meant to be temporary. So was the last tape.','You gave it a stern look and a firm twist. It was mostly the twist.','Somewhere a qualified engineer has just shuddered and does not know why.'],
  coolant:['The puddle is now purely decorative.','The pipe has stopped hissing. It still looks cross.','You tightened it until it stopped, then one more for luck.'],
  thruster:['The thruster coughs twice and settles, like an uncle after dinner.','It fires in the right order again. The order was the whole problem.','You cleared out something that may once have been a sandwich.'],
  fuse:['The radio crackles back to life. You almost miss the quiet.','You replaced the fuse with a slightly less blown fuse.','The fuse box smells of toast. That is new, but it works.'],
  scrubber:['The air no longer tastes of feet.','The scrubber hums again. It was full of fluff, as everything eventually is.','Fresh air. Well, air. Well, less of whatever that was.'],
  crack:['The patch is ugly, airtight and mostly straight.','You sealed it with something from the galley. Best not to say what.','Space is back on the outside, where it belongs.'],
  seal:['The hissing has stopped. The silence is somehow louder.','You packed the seal with something rubbery from a drawer. It is holding.','The inside is staying inside again.'],
  strap:['The knot is not in any manual. It is holding anyway.','The cargo has stopped sliding about and started sulking.','Strapped down tight. The crates look almost grateful.'],
};
/* where each repair spot's status screen and particles sit, relative to the spot, and which way it faces */
/* Hand-lettered boards, one set per hull: [text ('|' breaks the line), style, width, height, x, y, z, quarter turns].
   They are drawn here, not modelled, so the lettering stays large and sharp. Positions match art/ship-interiors/dress.py. */
const DECK_NOTES = {
  rustbucket:[['DOOR STICKS|KICK HERE','chalk',1.0,0.5,0.888,0.35,1.6,-1],['FLUSH|TWICE','paper',0.8,0.5,-2.75,0.42,7.188,2],["STEP 4:|DON'T",'paper',0.46,0.56,0.912,0.3,6.9,1],['TOOL','tape',0.4,0.2,-0.75,1.1,18.988,2]],
  dromedary:[['LOAD|EVENLY','paper',0.7,0.5,-1.4,0.45,5.788,2],['READS|HIGH','tape',0.44,0.3,2.888,0.2,6.85,-1],['SPARES|ASSORTED, UNKNOWN','paper',0.9,0.5,-0.5,0.45,18.988,2],['ROTA|SAME NAME, EVERY SLOT','chalk',0.8,0.45,3.988,0.68,2.55,-1],['FILTER LOG|EVERY ENTRY A NEW PEN','paper',1.0,0.5,-2.75,0.42,7.188,2]],
  stoat:[['IF HUMMING,|FINE','paper',0.9,0.5,-2.75,0.42,7.188,2],['FRAGILE|(THE SHIP)','paint',0.95,0.5,1.45,0.4,14.188,2],['FAST|FOOD','tape',0.5,0.3,3.988,0.75,2.45,-1],['SPEED RECORD|STILL OURS','paper',0.5,0.4,0.862,0.3,4.15,-1],['SPACEWALKS|IIII IIII III','chalk',0.46,0.5,0.912,0.3,6.9,1]],
  manatee:[['SERVICE','brass',0.5,0.18,0.888,0.44,1.6,-1],['PLEASE DO NOT|TIP THE SCRUBBER','brass',0.9,0.45,-2.7,0.42,7.188,2],['DAYS SINCE|LAST INCIDENT:','brass',0.9,0.5,-0.5,0.45,18.988,2],['CLOAKROOM|TICKETS','brass',0.46,0.4,0.912,0.35,6.9,1],['STAFF','brass',0.5,0.2,-2.3,0.3,16.1,1],['STAFF','brass',0.5,0.2,2.3,0.3,16.1,-1]],
  empress:[['PAINT ME','paint',0.5,0.3,0.868,0.3,4.15,-1],['DO NOT BORROW|FROM THE GOOD ONE','paper',1.0,0.5,-2.75,0.42,7.188,2],['MIND THE STEP|IT IS DECORATIVE','paper',0.46,0.5,0.912,0.35,6.9,1],['THINGS TO FIX|WHEN RICH','paper',0.9,0.5,-0.5,0.45,18.988,2],['STOP','paint',0.5,0.25,0.8,1.02,9.352,0]],
};
const FAULT_SPOTS = {
  coolant:{label:'COOLANT',bad:'LEAK',rot:-Math.PI/2,ry:Math.PI/2,scr:[-0.1,0.42,0],emit:[-0.03,0,0]},
  thruster:{label:'THRUSTERS',bad:'MISFIRE',ry:Math.PI,scr:[-0.75,0.45,0.1],emit:[0,0.45,0.02]},
  fuse:{label:'FUSES',bad:'BLOWN',ry:0,scr:[0,0.58,0.03],emit:[0,0.15,0.15]},
  scrubber:{label:'AIR SCRUBBER',bad:'JAMMED',rot:Math.PI,ry:Math.PI,scr:[-0.8,-0.12,0],emit:[0,0,-0.2]},
  crack:{label:'HULL',bad:'BREACH',ry:Math.PI/2,scr:[0.005,-0.27,0],emit:[0.02,0,0]},
  strap:{label:'CARGO STRAPS',bad:'SNAPPED',ry:-Math.PI/2,scr:[-0.05,0.55,0.2],emit:[0,0,0]},
  seal:{label:'AIRLOCK SEAL',bad:'LEAKING',rot:-Math.PI/2,ry:0,scr:[0,0.5,0.03],emit:[0.1,-0.05,0.1]},
};
const Faults = {
  t:45,
  has(id){ return (G.faults||[]).includes(id); },
  list(){ return G.faults||(G.faults=[]); },
  fuelMul(){ return this.has('coolant')?1.7:1; },
  speedMul(){ return (this.has('thruster')?0.6:1)*(this.has('seal')?0.8:1); },
  lagMul(c){ return c.kind==='pax'?(this.has('scrubber')?2:1):(this.has('strap')?2:1); },
  add(id, why){ const L=this.list(); if(!id||L.includes(id)) return; L.push(id); const d=FAULT_DEFS[id];
    UI.toast(`⚠ ${d.name} in the ${d.where}${why?' ('+why+')':''}. ${d.effect[0].toUpperCase()+d.effect.slice(1)}. ${TouchUI.on?'Tap Walk':'Press L'} to go and fix it.`,'warn');
    if(Sfx.ok()){ Sfx.beep(880); setTimeout(()=>Sfx.beep(880),220); } Interior.syncFaults(); this.badge(); },
  fix(id){ const L=this.list(), i=L.indexOf(id); if(i<0) return; L.splice(i,1); const d=FAULT_DEFS[id]; Sfx.clunk(); Sfx.cash(); UI.toast(`Fixed: ${d.name.toLowerCase()}. ${pick((FIX_LINES[id]||[]).concat(FIX_LINES.any))}`,'good'); Interior.syncFaults(); this.badge(); },
  random(why){ const free=Object.keys(FAULT_DEFS).filter(k=>!this.has(k)); if(free.length) this.add(pick(free),why); },
  badge(){ const L=this.list(), b=$('fault-badge'); b.hidden=!L.length||G.mode!=='flight'; b.innerHTML=L.map(k=>`<div>⚠ ${esc(FAULT_DEFS[k].name)} <span>· ${esc(FAULT_DEFS[k].where)}</span></div>`).join(''); },
  update(dt){
    // something new goes wrong every couple of minutes of flight, more often on a battered ship
    this.t-=dt*(1+(100-G.hull)/60); if(this.t<=0){ this.t=rnd(80,150); if(this.list().length<3&&Math.random()<0.8) this.random(); }
    if(this.has('crack')){ G.hull=Math.max(0,G.hull-dt*0.1); if(G.hull<=0) Hull.breach(); }
    if(this.has('scrubber')) G.sys.dirt=Math.min(1,G.sys.dirt+dt*0.01);
  },
};

/* ---------- the interior ---------- */
/* tread-plate deck tiles, 1.2 m to a tile */
function floorTex(){
  if(_texCache.ifloor) return _texCache.ifloor; const S=512, cv=makeCanvas(S,S), x=cv.getContext('2d'); x.fillStyle='#4a4f56'; x.fillRect(0,0,S,S);
  for(let j=0;j<S;j+=24) for(let i=0;i<S;i+=24){ const o=(j/24)%2?12:0; x.save(); x.translate(i+o+6,j+12); x.rotate(((i/24+j/24)%2)?0.6:-0.6); x.fillStyle='#626870'; x.fillRect(-7,-2,14,4); x.fillStyle='#33373c'; x.fillRect(-7,2,14,1.5); x.restore(); }
  x.strokeStyle='#1e2125'; x.lineWidth=8; x.strokeRect(0,0,S,S); x.lineWidth=4; x.beginPath(); x.moveTo(S/2,0); x.lineTo(S/2,S); x.stroke();
  x.fillStyle='#8a9098'; for(const [a,b] of [[14,14],[S-14,14],[14,S-14],[S-14,S-14],[S/2-12,14],[S/2+12,S-14]]){ x.beginPath(); x.arc(a,b,4,0,7); x.fill(); }
  const t=canvasTex(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; return _texCache.ifloor=t;
}
const Interior = {
  group:null, shipId:-1, fx:{}, seats:[], pax:[], crates:null, crateKey:'', lights:[],
  /* rectangles you can stand in (already inset for your body), and round things you cannot walk through */
  RECTS:[[-0.35,0.35,0.9,1.3],[-0.6,0.6,0.95,6.9],[-1.25,-0.5,3.2,4.0],[-3.15,-1.15,1.7,5.5],[0.5,1.25,2.7,3.5],[1.15,2.9,1.7,4.25],[-0.6,0.6,6.8,7.7],[-1.25,1.25,7.5,13.9],[-0.5,0.5,13.8,14.7],[-2.1,2.1,14.5,18.65],
    /* scrubber bay, airlock (suit locker, inner hatch, chamber) and the two service alleys beside the engine room */
    [-1.25,-0.5,6.2,6.8],[-3.1,-1.15,6.1,6.9],[0.5,1.25,5.85,6.35],[1.15,2.65,5.3,6.9],[2.5,3.3,5.85,6.35],[3.15,3.7,5.3,6.9],
    [-2.8,-2.0,14.8,15.4],[-3.1,-2.7,14.5,18.1],[2.0,2.8,14.8,15.4],[2.7,3.1,14.5,18.1]],
  OBST:[[0,16.6,1.25],[-1.42,1.55,0.3],[-1.55,18.2,0.45]],   // reactor, the cabin's fore-wall fixture, the engine room seat
  /* A hand-built deck brings its own map of where you can stand (the rectangles, less whatever the model puts in the way)
     and its own free places for crates; both are worked out from the model by art/ship-interiors/import_deck.py */
  plan(){ const B=Assets.deck(G.shipId); if(!B||!B.walk) return null; if(B._grid) return B;
    const w=B.walk, raw=atob(w.bits), bits=new Uint8Array(raw.length); for(let i=0;i<raw.length;i++) bits[i]=raw.charCodeAt(i); B._grid=bits; return B; },
  inside(x,z){ const P=this.plan();
    if(P){ const w=P.walk, i=Math.floor((x-w.x0)/w.cell), j=Math.floor((z-w.z0)/w.cell); if(i<0||j<0||i>=w.nx||j>=w.nz) return false; const k=j*w.nx+i; return !!(P._grid[k>>3]&(128>>(k&7))); }
    for(const r of this.RECTS) if(x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3]){ for(const o of this.OBST) if(Math.hypot(x-o[0],z-o[1])<o[2]) return false; return true; } return false; },
  build(){
    if(this.group){ World.cock.remove(this.group); this.group.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); }
    const g=this.group=new THREE.Group(); g.visible=false; World.cock.add(g); this.shipId=G.shipId; this.lit=false; this.fx={}; this.seats=[]; this.pax=[]; this.crates=null; this.crateKey=''; this.paxKey='';
    const ck=SHIPS[G.shipId].ck, bump=panelBumpTex(), std=(hex,r,m,ex)=>new THREE.MeshStandardMaterial(Object.assign({color:C(hex),roughness:r,metalness:m},ex||{}));
    const M={ wall:std(ck.panel,0.75,0.25,{bumpMap:bump,bumpScale:0.002}), frame:std(ck.frame,0.55,0.55), floor:std('#3a3e44',0.6,0.7,{bumpMap:bump,bumpScale:0.004}), ceil:std('#2a2d32',0.8,0.3),
      trim:std(ck.trim,0.35,0.85), dark:std('#16181c',0.7,0.4), seat:std(ck.leather,0.6,0.05), hazard:std('#ffffff',0.7,0.2,{map:(()=>{ const cv=makeCanvas(256,32), x=cv.getContext('2d'); for(let i=0;i<16;i++){ x.fillStyle=i%2?'#f2c14e':'#1c1c1e'; x.beginPath(); x.moveTo(i*16,0); x.lineTo(i*16+16,0); x.lineTo(i*16,32); x.lineTo(i*16-16,32); x.fill(); } const t=canvasTex(cv); t.wrapS=THREE.RepeatWrapping; t.repeat.set(4,1); return t; })()}),
      glass:new THREE.MeshStandardMaterial({color:0x99bbdd,metalness:1,roughness:0.15,transparent:true,opacity:0.08,depthWrite:false,side:THREE.DoubleSide}),
      lamp:new THREE.MeshBasicMaterial({color:HDR('#ffe8c8',1.8)}), core:new THREE.MeshBasicMaterial({color:HDR('#6fd6ff',3)}), pipe:std('#8a6f4e',0.4,0.8), cool:std('#4f7fa8',0.4,0.7), red:std('#b03a2e',0.5,0.3) };
    M.wall.color.lerp(C('#8a8e94'),0.22); M.accent=std(ck.trim,0.5,0.4); M.cushion=std(ck.leather,0.7,0.02); M.cushion.color.lerp(C('#b0a490'),0.18);
    M.chrome=std('#c8ccd0',0.25,0.9); M.rug=std('#3a1a22',0.95,0); M.cream=std('#8d887e',0.6,0.1); M.wood=std('#7a5236',0.7,0.05);
    M.guide=new THREE.MeshBasicMaterial({color:HDR('#5fd0ff',1.3)}); M.warm=new THREE.MeshBasicMaterial({color:HDR('#ffd9a0',1.4)});
    this.M=M;
    const bx=(w,h,d,m,x,y,z)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); g.add(o); return o; };
    const cyl=(r1,r2,h,m,x,y,z,seg=20)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m); o.position.set(x,y,z); g.add(o); return o; };
    const H=CEIL-FLOOR, MY=(FLOOR+CEIL)/2;
    /* a wall from (x0,z0) to (x1,z1), full height, with holes: [{a,b,y0,y1}] measured along the wall */
    const wall=(x0,z0,x1,z1,holes=[],m=M.wall,deco=true)=>{ const L=Math.hypot(x1-x0,z1-z0), ux=(x1-x0)/L, uz=(z1-z0)/L, ang=Math.atan2(-uz,ux), cuts=[0];
      holes.sort((p,q)=>p.a-q.a); for(const h of holes) cuts.push(h.a,h.b); cuts.push(L);
      const seg=(a,b,y0,y1,mm=m,dd=0.08)=>{ if(b-a<0.005||y1-y0<0.005) return; const o=new THREE.Mesh(new THREE.BoxGeometry(b-a,y1-y0,dd),mm); const c=(a+b)/2; o.position.set(x0+ux*c,(y0+y1)/2,z0+uz*c); o.rotation.y=ang; g.add(o); };
      for(let i=0;i<cuts.length;i+=2){ const a=cuts[i], b=cuts[i+1]; seg(a,b,FLOOR,CEIL);
        // skirting, an accent stripe, a conduit rail near the top and structural ribs, on both faces
        if(deco&&b-a>0.12){ seg(a,b,FLOOR,FLOOR+0.13,M.dark,0.15); seg(a,b,-0.29,-0.25,M.accent,0.1); seg(a,b,1.0,1.06,M.frame,0.15);
          for(let r=a+0.3;r<b-0.15;r+=1.3) seg(r-0.045,r+0.045,FLOOR,CEIL,M.frame,0.18); } }
      for(const h of holes){ seg(h.a,h.b,FLOOR,h.y0==null?FLOOR:h.y0); seg(h.a,h.b,h.y1==null?0.95:h.y1,CEIL); } };
    const room=(x0,x1,z0,z1,unlit)=>{ const ft=floorTex().clone(); ft.needsUpdate=true; ft.repeat.set((x1-x0)/1.2,(z1-z0)/1.2);
      const f=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),std('#c4c8ce',0.55,0.65,{map:ft})); f.rotation.x=-Math.PI/2; f.position.set((x0+x1)/2,FLOOR,(z0+z1)/2); g.add(f);
      const c=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),M.ceil); c.rotation.x=Math.PI/2; c.position.set((x0+x1)/2,CEIL,(z0+z1)/2); g.add(c);
      // ceiling beams across the shorter side
      if(x1-x0<z1-z0){ for(let z=z0+0.65;z<z1-0.3;z+=1.3) bx(x1-x0,0.09,0.12,M.frame,(x0+x1)/2,CEIL-0.045,z); }
      else { for(let x=x0+0.65;x<x1-0.3;x+=1.3) bx(0.12,0.09,z1-z0,M.frame,x,CEIL-0.045,(z0+z1)/2); }
      const lamp=bx(Math.min(1.4,(x1-x0)*0.4),0.04,0.3,M.lamp,(x0+x1)/2,CEIL-0.03,(z0+z1)/2); if(unlit) return lamp; const L=new THREE.PointLight(C('#ffe2c0'),1.8,10,1.5); L.position.set((x0+x1)/2,CEIL-0.25,(z0+z1)/2); g.add(L); this.lights.push(L); return lamp; };
    this.lights=[]; const hemi=new THREE.HemisphereLight(C('#ffe9d0'),C('#3a3e44'),0.3); g.add(hemi);
    // rooms
    room(-0.9,0.9,0.7,7.2); room(-4.4,-0.9,1.4,5.8); room(0.9,4.0,1.4,5.0); room(-3.4,3.4,7.2,14.2); room(-2.4,2.4,14.2,19.0);
    // the scrubber bay, the airlock and the service alleys borrow the light of the rooms beside them
    room(-4.4,-0.9,5.8,7.2,true); room(0.9,4.0,5.0,7.2,true); room(-3.4,-2.4,14.2,19.0,true); room(2.4,3.4,14.2,19.0,true);
    // the cockpit doorway (above the cockpit's own back wall) and the corridor
    wall(-0.9,0.7,0.9,0.7,[{a:0.0,b:1.8,y0:FLOOR,y1:0.8}],M.wall,false);
    wall(-0.9,0.7,-0.9,7.2,[{a:2.3,b:3.5,y0:FLOOR,y1:0.95},{a:5.3,b:6.3,y0:FLOOR,y1:0.95}]); wall(0.9,0.7,0.9,7.2,[{a:1.8,b:3.0,y0:FLOOR,y1:0.95},{a:4.9,b:5.9,y0:FLOOR,y1:0.95}]);
    // scrubber bay and head (port) and the airlock (starboard), in what used to be sealed voids either side of the corridor's aft end
    wall(-4.4,5.8,-4.4,7.2); wall(-4.4,7.2,-3.4,7.2); wall(4.0,5.0,4.0,7.2); wall(3.4,7.2,4.0,7.2); wall(2.9,5.0,2.9,7.2,[{a:0.65,b:1.55,y0:FLOOR,y1:0.95}]);
    cyl(0.6,0.6,0.1,M.frame,3.92,0,6.1,28).rotation.z=Math.PI/2; cyl(0.13,0.13,0.2,M.trim,3.85,0,6.1,16).rotation.z=Math.PI/2; for(const a of [0,1.05,2.1]) bx(0.04,0.95,0.05,M.trim,3.84,0,6.1).rotation.x=a;   // outer hatch and its handwheel
    bx(1.5,1.85,0.24,M.frame,1.85,FLOOR+0.925,5.14); for(const x of [1.35,1.85,2.35]){ bx(0.02,1.7,0.02,M.dark,x+0.25,FLOOR+0.925,5.265); bx(0.04,0.14,0.04,M.chrome,x+0.15,FLOOR+1.0,5.28); }   // suit lockers
    bx(1.3,0.4,0.28,M.seat,1.9,FLOOR+0.2,7.03); bx(0.2,0.2,0.1,M.red,3.45,0.95,5.08);   // boot bench, red lamp
    bx(0.5,0.42,0.5,M.cream,-3.95,FLOOR+0.21,6.5); bx(0.2,0.5,0.5,M.cream,-4.26,FLOOR+0.7,6.5); bx(0.04,2.0,0.6,M.rug,-3.35,FLOOR+1.05,6.87); bx(0.5,0.14,0.26,M.cream,-1.9,-0.2,7.04);   // the head, its curtain and a basin
    cyl(0.1,0.1,0.2,M.frame,-3.0,1.23,5.93,12);   // scrubber duct
    { const hp=cyl(0.07,0.07,2.4,M.cool,-3.1,-0.35,1.52,12); hp.rotation.z=Math.PI/2; }   // cabin heater pipe, off the engine's coolant loop
    // cabin: portholes in the outer wall
    wall(-4.4,1.4,-0.9,1.4); wall(-4.4,5.8,-0.9,5.8); wall(-4.4,1.4,-4.4,5.8,[{a:0.55,b:1.35,y0:0.05,y1:0.75},{a:1.75,b:2.55,y0:0.05,y1:0.75},{a:2.95,b:3.75,y0:0.05,y1:0.75}]);
    for(const a of [0.95,2.15,3.35]){ const ring=new THREE.Mesh(new THREE.TorusGeometry(0.42,0.06,10,28),M.trim); ring.rotation.y=Math.PI/2; ring.position.set(-4.36,0.4,1.4+a); g.add(ring); const gl=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.7),M.glass); gl.rotation.y=Math.PI/2; gl.position.set(-4.4,0.4,1.4+a); gl.renderOrder=5; g.add(gl); }
    // galley
    wall(0.9,1.4,4.0,1.4); wall(0.9,5.0,4.0,5.0); wall(4.0,1.4,4.0,5.0,[{a:1.6,b:2.4,y0:0.05,y1:0.75}]);
    { const ring=new THREE.Mesh(new THREE.TorusGeometry(0.42,0.06,10,28),M.trim); ring.rotation.y=Math.PI/2; ring.position.set(3.96,0.4,3.4); g.add(ring); }
    bx(0.7,0.5,2.0,M.seat,3.6,-0.72,3.0); bx(0.75,0.08,2.05,M.frame,3.6,-0.45,3.0); bx(0.6,0.12,0.5,std('#d8d2c4',0.9,0),3.6,-0.36,2.2);   // bunk + pillow
    bx(2.6,0.9,0.6,M.frame,2.45,-0.52,4.65); bx(2.62,0.05,0.62,M.trim,2.45,-0.06,4.65); cyl(0.09,0.08,0.22,M.red,1.7,0.06,4.6); cyl(0.05,0.05,0.1,std('#d8d2c4',0.4,0),2.2,0.0,4.6);
    // fuse box on the galley's front wall
    bx(0.7,0.8,0.14,M.dark,2.45,0.45,1.5); for(let i=0;i<6;i++) bx(0.06,0.14,0.04,std(['#c0392b','#f1c40f','#2ecc71'][i%3],0.4,0.3),2.2+(i%3)*0.25,0.6-Math.floor(i/3)*0.3,1.58);
    // hold: wide doorway from the corridor, doorway to the engine room
    wall(-3.4,7.2,3.4,7.2,[{a:2.5,b:4.3,y0:FLOOR,y1:1.0}]); wall(-3.4,14.2,3.4,14.2,[{a:2.6,b:4.2,y0:FLOOR,y1:0.95}]); wall(-3.4,7.2,-3.4,14.2); wall(3.4,7.2,3.4,14.2);
    bx(0.04,1.9,3.2,M.hazard,3.36,0.0,10.6); bx(6.7,0.05,0.12,M.hazard,0,FLOOR+0.01,7.3);
    for(const sx of [-1,1]) for(let z=7.6;z<14;z+=1.6) bx(0.08,H,0.08,M.frame,sx*1.55,MY,z);
    // engine room: reactor in the middle, pipes on the walls, console at the back
    for(const sx of [-1,1]){ wall(sx*2.4,14.2,sx*2.4,19.0,[{a:0.4,b:1.4,y0:FLOOR,y1:0.95}]); wall(sx*3.4,14.2,sx*3.4,19.0); wall(sx*2.4,19.0,sx*3.4,19.0);
      for(const y of [0.95,1.14]){ const q=cyl(0.06,0.06,4.5,y>1?M.pipe:M.cool,sx*3.28,y,16.6,10); q.rotation.x=Math.PI/2; }   // service alley: pipe runs overhead, spares at the dead end
      bx(0.7,0.6,0.6,M.wood,sx*2.9,FLOOR+0.3,18.62); bx(0.5,0.4,0.5,M.frame,sx*2.9,FLOOR+0.8,18.66); }
    wall(-2.4,19.0,2.4,19.0);
    cyl(1.0,1.0,0.2,M.frame,0,FLOOR+0.1,16.6,32); cyl(1.0,1.0,0.2,M.frame,0,CEIL-0.1,16.6,32); this.core=cyl(0.55,0.55,H-0.4,M.core,0,MY,16.6,32);
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; cyl(0.06,0.06,H-0.3,M.trim,Math.cos(a)*0.85,MY,16.6+Math.sin(a)*0.85,10); }
    const eL=new THREE.PointLight(C('#6fd6ff'),2.2,8,1.5); eL.position.set(0,0.3,16.6); g.add(eL); this.lights.push(eL);
    for(const y of [-0.5,0.15,0.8]){ const p=cyl(0.09,0.09,3.1,y>0?M.cool:M.pipe,-2.28,y,17.35,12); p.rotation.x=Math.PI/2; const q=cyl(0.09,0.09,3.1,M.pipe,2.28,y,17.35,12); q.rotation.x=Math.PI/2; }
    bx(2.2,0.9,0.5,M.frame,1.0,-0.52,18.7); cyl(0.2,0.2,0.5,M.frame,-1.55,FLOOR+0.25,18.2,16); bx(1.8,0.5,0.04,new THREE.MeshBasicMaterial({color:HDR('#ff9a30',0.6)}),1.0,0.25,18.92);
    // doorway frames
    for(const [x,z,ry] of [[-0.9,3.6,Math.PI/2],[0.9,3.0,Math.PI/2],[0,7.2,0],[0,14.2,0]]){ const f=new THREE.Group(); f.position.set(x,0,z); f.rotation.y=ry; g.add(f);
      for(const s of [-1,1]){ const p=new THREE.Mesh(new THREE.BoxGeometry(0.1,H,0.16),M.hazard); p.position.set(s*(ry?0.62:0.92),MY,0); f.add(p); } }
    // passenger seats along the cabin's outer wall, under the portholes, facing in
    const n=Cargo.seats(); for(let i=0;i<n&&i<4;i++){ const sg=new THREE.Group(); sg.position.set(-3.8,0,1.95+i*1.15); g.add(sg); this.seat(sg,M,i); this.seats.push(sg); }
    this.decor(g,M,bx,cyl,n);
    this.core.userData.keep=true;
    this.merge(g);
    // fault props, hidden until something breaks
    for(const id in FAULT_DEFS) this.fx[id]=this.faultFx(id);
    g.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=false; } });
    this.syncFaults(); this.grade=null;
    const own=Assets.deck(G.shipId); if(own) this.bespoke(own,g);
  },
  /* ---------- the ship's own deck ----------
     Each hull's walkable deck is modelled in Blender on the same plan as the stock one (same rooms, doorways, seats and
     repair spots, one in each of the seven rooms), so the walking bounds stay. When it has loaded it replaces the stock walls, floors, ceilings and
     furniture; the seven repair spots, the passengers' places, the crates in the hold and the signs stay, the ceiling
     lamps move to its light markers, and its own sky and colour grade come with it. */
  bespoke(B, g){
    const dir=`assets/ship-interiors/finish/${B.ship}/`;
    Promise.all([Assets.glb(B.file), Assets.env(dir+'space.hdr').catch(()=>null), Assets.lut(dir+'grade.png').catch(()=>null)]).then(([src,env,lut])=>{
      if(this.group!==g) return;
      const deck=src.clone(true); deck.name='bespoke deck '+B.ship; Assets.prepare(deck,env); const A=Assets.anchors(deck);
      if(B.baked) return this.bakedDeck(B,deck,g,A);
      const grime=this.grimeTex();   // dirt, streaks and scratches over every plain surface, so no wall is one flat colour
      deck.traverse(o=>{ if(!o.isMesh) return; o.castShadow=o.receiveShadow=false; if(o.material&&o.material.name==='glass'){ o.renderOrder=5; }
        for(const m of [].concat(o.material)){ if(!m||!m.isMeshStandardMaterial||m.transparent||m.map) continue; if(m.emissive&&m.emissive.r+m.emissive.g+m.emissive.b>0.01) continue; m.map=grime; m.needsUpdate=true; } });
      const keep=new Set([...Object.values(this.fx).map(f=>f.grp),...this.seats,this.crates].filter(Boolean));
      for(const o of g.children.slice()){ if(keep.has(o)||o.isHemisphereLight) continue;
        if(o.isMesh&&[].concat(o.material).some(m=>m&&m.userData.label)) continue;
        if(o===this.core){ o.visible=false; continue; }
        g.remove(o); if(o.geometry&&o!==this.core) o.geometry.dispose(); }
      // the stock seats go too (the deck has its own); the places where passengers sit stay
      for(const S of this.seats) for(const c of S.children.slice()) if(!this.pax.includes(c)) S.remove(c);
      this.lights=[]; for(const k in A){ if(!/^lamp_/.test(k)) continue; const L=new THREE.PointLight(C('#ffe2c0'),1.8,10,1.5); L.position.copy(A[k].position).add(new V3(0,-0.2,0)); g.add(L); this.lights.push(L); }
      if(A.reactor){ const L=new THREE.PointLight(C('#6fd6ff'),2.2,8,1.5); L.position.copy(A.reactor.position).add(new V3(0,0.15,0)); g.add(L); this.lights.push(L); }
      g.add(deck); this.bespokeDeck=deck; this.grade=lut;
      if(B.light) this.lightMapped(B,deck,g);
    }).catch(()=>{});
  },
  /* a cushioned passenger seat on a pedestal, with armrests, a headrest and a harness; local +x faces into the cabin */
  seat(sg,M,i){ const rb=Folk.rbox, add=(o,rz)=>{ if(rz) o.rotation.z=rz; sg.add(o); return o; };
    add(Folk.cyl(0.21,0.23,0.03,M.chrome,0.02,FLOOR+0.015,0,28)); add(Folk.cyl(0.06,0.07,0.3,M.chrome,0.02,FLOOR+0.17,0,16)); add(Folk.bx(0.5,0.05,0.6,M.frame,0.02,FLOOR+0.33,0));
    add(rb(0.56,0.14,0.68,0.05,M.cushion,0.03,FLOOR+0.42,0));
    add(Folk.bx(0.04,0.84,0.62,M.frame,-0.36,FLOOR+0.86,0),0.12); add(rb(0.15,0.8,0.66,0.06,M.cushion,-0.28,FLOOR+0.86,0),0.12);
    add(rb(0.16,0.24,0.42,0.06,M.cushion,-0.35,FLOOR+1.4,0),0.12);
    for(const s of [-1,1]){ add(Folk.bx(0.05,0.2,0.05,M.chrome,0.2,FLOOR+0.55,s*0.38)); add(rb(0.48,0.07,0.08,0.03,M.frame,0.03,FLOOR+0.66,s*0.38)); add(rb(0.42,0.04,0.09,0.02,M.cushion,0.03,FLOOR+0.71,s*0.38));
      add(Folk.bx(0.02,0.6,0.07,M.accent,-0.19,FLOOR+1.0,s*0.15),0.12); }
    add(Folk.bx(0.03,0.08,0.12,M.chrome,-0.15,FLOOR+0.7,0)); },
  /* A hand-built deck whose every surface is baked to image maps, one per room: it is drawn unlit, exactly as it was lit
     in Blender. The stock deck and all the game's own signs go; the repair props, crates and passengers stay, lit by the
     lamps only */
  bakedDeck(B,deck,g,A){
    const keep=new Set([...Object.values(this.fx).map(f=>f.grp),...this.seats,this.crates].filter(Boolean));
    for(const o of g.children.slice()){ if(keep.has(o)||o.isHemisphereLight) continue; if(o===this.core){ o.visible=false; continue; } g.remove(o); if(o.geometry) o.geometry.dispose(); }
    for(const S of this.seats) for(const c of S.children.slice()) if(!this.pax.includes(c)) S.remove(c);
    const key=n=>String(n).toLowerCase().replace(/[^a-z]+/g,'-').replace(/^-|-$/g,''), maps={}; for(const k in B.baked) maps[key(k)]=B.baked[k];
    Assets.base().then(b=>deck.traverse(o=>{ if(!o.isMesh) return; o.castShadow=o.receiveShadow=false; const m=new THREE.MeshBasicMaterial({color:0x101210}); o.material=m; const url=maps[key(o.name)]; if(!url) return;
      new THREE.TextureLoader().load(b+url,t=>{ t.flipY=false; t.encoding=THREE.sRGBEncoding; t.anisotropy=8; m.map=t; m.color.set(0xffffff); m.needsUpdate=true; }); }));
    this.lights=[]; for(const k in A){ if(!/^lamp_/.test(k)) continue; const L=new THREE.PointLight(C('#ffe2c0'),0.75,9,1.5); L.position.copy(A[k].position).add(new V3(0,-0.2,0)); g.add(L); this.lights.push(L); }
    for(const o of g.children) if(o.isHemisphereLight) o.intensity=0.1;
    g.add(deck); this.bespokeDeck=deck; this.grade=null; this.lit=true; const grime=this.grimeTex();
    if(this.crates) this.crates.traverse(o=>{ if(o.isMesh) this.indoor(o.material,0.5); });
    for(const f of Object.values(this.fx)) f.grp.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)) if(m&&m.isMeshStandardMaterial){ if(!m.map&&!m.transparent) m.map=grime; m.envMapIntensity=(m.envMapIntensity==null?1:m.envMapIntensity)*0.25; this.indoor(m); } });
    // where the model already draws the working fitting (the scrubber's fans, the straps on the cargo cases), the game's own
    // working version is left out: only its status screen and what shows when it breaks remain
    for(const [id,body] of [['strap',false],['scrubber',true]]){ const f=this.fx[id]; if(!f) continue; f.ok.traverse(o=>{ if(o.isMesh) o.visible=false; });
      if(body){ for(const c of f.grp.children) if(c.isMesh) c.visible=false; if(f.fan) f.fan.visible=false; } }
  },
  /* A deck with a baked light map: the lamps' light, shadow, dirt and edge wear all come from the map. The live lights
     (the sun included, which otherwise shines straight through the hull) are switched off for the deck's own surfaces,
     bar a little of their shine; they still light the crates, passengers and repair props */
  lightMapped(B,deck,g){
    Assets.base().then(b=>new THREE.TextureLoader().load(b+B.light,tex=>{ if(this.bespokeDeck!==deck) return; tex.flipY=false; tex.encoding=THREE.sRGBEncoding; tex.anisotropy=4;
      const baked=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin+'\n irradiance*=0.0; reflectedLight.directDiffuse*=0.0; reflectedLight.directSpecular*=0.3;\n'); };
      deck.traverse(o=>{ if(!o.isMesh||!o.geometry.attributes.uv2) return; for(const m of [].concat(o.material)){ if(!m||!m.isMeshStandardMaterial||m.transparent) continue;
        m.lightMap=tex; m.lightMapIntensity=this.LIGHT_GAIN; m.envMapIntensity*=0.4; m.onBeforeCompile=baked; m.needsUpdate=true; } });
      for(const o of g.children) if(o.isMesh) for(const m of [].concat(o.material)) if(m&&m.userData.label&&m.color) m.color.multiplyScalar(0.62);   // signs sit in the same dim light
      // the crates and repair props are not in the map: they keep the lamps' live light, lose the sun, and take the grime layer
      this.lit=true; for(const L of this.lights) L.intensity*=0.4; const grime=this.grimeTex(); if(this.crates) this.crates.traverse(o=>{ if(o.isMesh) this.indoor(o.material,0.5); });
      for(const f of Object.values(this.fx)) f.grp.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)) if(m&&m.isMeshStandardMaterial){ if(!m.map&&!m.transparent) m.map=grime; this.indoor(m); } });
    })); },
  LIGHT_GAIN:2.6,
  /* a live-lit thing aboard a light-mapped deck: lamps only, no sun through the hull, a little ambient */
  indoor(m,dim){ if(!m||!m.isMeshStandardMaterial||m.userData.indoor) return; m.userData.indoor=true; if(dim) m.color.multiplyScalar(dim);
    m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin.replace(/NUM_DIR_LIGHTS > 0/g,'NUM_DIR_LIGHTS > 99')+'\n irradiance*=0.35;\n'); }; m.needsUpdate=true; },
  /* a cargo crate: a box with a frame of battens and a diagonal brace on each side, so it is not just a cube */
  crateGeo(){ if(this._crate) return this._crate; const U=THREE.BufferGeometryUtils, parts=[], S=0.74, T=0.03, W=0.09;
    const add=(w,h,d,x,y,z,rx,ry,rz)=>{ const g=new THREE.BoxGeometry(w,h,d); if(rz) g.rotateZ(rz); if(rx) g.rotateX(rx); if(ry) g.rotateY(ry); g.translate(x,y,z); parts.push(g); };
    add(S,S,S,0,0,0);
    for(let k=0;k<4;k++){ const ry=k*Math.PI/2, c=Math.cos(ry), s=Math.sin(ry), o=S/2+T/2, P=(lx,ly)=>[lx*c+o*s,ly,-lx*s+o*c];
      for(const sy of [-1,1]){ const p=P(0,sy*(S/2-W/2)); add(S+2*T,W,T,p[0],p[1],p[2],0,ry,0); }
      for(const sx of [-1,1]){ const p=P(sx*(S/2-W/2+T),0); add(W,S-2*W,T,p[0],p[1],p[2],0,ry,0); }
      const p=P(0,0); add(W,(S-2*W)*1.36,T*0.8,p[0],p[1],p[2],0,ry,(k%2?1:-1)*Math.PI/4); }
    for(const sz of [-1,1]) add(S+2*T,T,W,0,S/2+T/2,sz*(S/2-W/2)); add(W,T,S,0,S/2+T/2,0);
    return this._crate=U&&U.mergeBufferGeometries?U.mergeBufferGeometries(parts):new THREE.BoxGeometry(0.78,0.78,0.78); },
  /* a tiling layer of grime for the modelled decks: blotches, streaks that run down, scratches and specks. One tile covers 2 m */
  grimeTex(){ if(this._grime) return this._grime; const S=512, cv=makeCanvas(S,S), c=cv.getContext('2d'); let s=11; const R=()=>(s=s*16807%2147483647)/2147483647;
    const wrap=(x,y,f)=>{ for(const dx of [-S,0,S]) for(const dy of [-S,0,S]) f(x+dx,y+dy); };
    c.fillStyle='#e6e3dc'; c.fillRect(0,0,S,S);
    for(let i=0;i<80;i++){ const x=R()*S, y=R()*S, r=30+R()*100, a=0.05+R()*0.1, col=R()<0.75?'38,32,26':'255,255,255';
      wrap(x,y,(X,Y)=>{ const g=c.createRadialGradient(X,Y,0,X,Y,r); g.addColorStop(0,`rgba(${col},${a})`); g.addColorStop(1,`rgba(${col},0)`); c.fillStyle=g; c.fillRect(X-r,Y-r,2*r,2*r); }); }
    for(let i=0;i<46;i++){ const x=R()*S, y=R()*S, l=50+R()*190, w=1.5+R()*6, a=0.1+R()*0.14;
      wrap(x,y,(X,Y)=>{ const g=c.createLinearGradient(0,Y,0,Y+l); g.addColorStop(0,`rgba(30,26,22,${a})`); g.addColorStop(1,'rgba(30,26,22,0)'); c.fillStyle=g; c.fillRect(X,Y,w,l); }); }
    for(let i=0;i<90;i++){ const x=R()*S, y=R()*S, an=R()*6.283, l=8+R()*46, a=0.1+R()*0.2, lt=R()<0.5; c.lineWidth=0.6+R();
      wrap(x,y,(X,Y)=>{ c.strokeStyle=lt?`rgba(255,255,255,${a})`:`rgba(20,18,16,${a})`; c.beginPath(); c.moveTo(X,Y); c.lineTo(X+Math.cos(an)*l,Y+Math.sin(an)*l); c.stroke(); }); }
    for(let i=0;i<2600;i++){ c.fillStyle=`rgba(${R()<0.6?'25,22,18':'255,255,255'},${0.05+R()*0.12})`; c.fillRect(R()*S,R()*S,1+R()*2,1+R()*2); }
    const t=this._grime=canvasTex(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(0.25,0.25); return t; },
  /* signs, posters, rails, furniture and clutter, room by room */
  decor(g,M,bx,cyl,nSeats){
    const ry90=Math.PI/2, add=o=>{ g.add(o); return o; }, label=m=>{ m.userData.label=true; return m; };   // signs, posters and dials stay on a bespoke deck
    const plane=(w,h,m,x,y,z,ry)=>{ const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m); o.position.set(x,y,z); o.rotation.y=ry; return add(o); };
    const fitFont=(c,txt,max,px,font)=>{ let s=px; do { c.font=font.replace('#',s); s-=2; } while(c.measureText(txt).width>max&&s>8); };
    const sign=(title,sub,w,h,x,y,z,ry,col)=>{ const W=768, Hh=Math.round(W*h/w), cv=makeCanvas(W,Hh), c=cv.getContext('2d'); col=col||'#f2c14e';
      c.fillStyle='#121418'; c.fillRect(0,0,W,Hh); c.strokeStyle=col; c.lineWidth=12; c.strokeRect(10,10,W-20,Hh-20); c.textAlign='center'; c.textBaseline='middle';
      c.fillStyle=col; fitFont(c,title,W-70,Math.round(Hh*(sub?0.42:0.6)),`700 #px ${FONT_DISP}`); c.fillText(title,W/2,sub?Hh*0.38:Hh*0.52);
      if(sub){ c.fillStyle='#e4e8ec'; fitFont(c,sub,W-70,Math.round(Hh*0.22),`600 #px ${FONT_DISP}`); c.fillText(sub,W/2,Hh*0.76); }
      // mounted on a short stand-off, clear of the wall ribs and rails, and kept below the ceiling beams and pipes
      const top=CEIL-0.12; if(y+h/2>top) y=top-h/2; const nx=Math.sin(ry), nz=Math.cos(ry), off=0.07;
      const back=bx(w+0.04,h+0.04,0.05,M.dark,x+nx*(off-0.03),y,z+nz*(off-0.03)); back.rotation.y=ry;
      return plane(w,h,label(new THREE.MeshBasicMaterial({color:0xdddddd,map:canvasTex(cv)})),x+nx*off,y,z+nz*off,ry); };
    const poster=(title,body,col,w,h,x,y,z,ry)=>{ const W=512, Hh=Math.round(W*h/w), cv=makeCanvas(W,Hh), c=cv.getContext('2d');
      c.fillStyle='#ebe5d6'; c.fillRect(0,0,W,Hh); c.fillStyle=col; c.fillRect(0,0,W,Hh*0.22); c.fillStyle='#ffffff'; c.textAlign='center'; c.textBaseline='middle';
      fitFont(c,title,W-40,Math.round(Hh*0.1),`700 #px ${FONT_DISP}`); c.fillText(title,W/2,Hh*0.11);
      c.fillStyle='#202428'; c.font=`600 ${Math.round(Hh*0.058)}px ${FONT_DISP}`; let line='', yy=Hh*0.32; const lh=Hh*0.075;
      for(const wd of body.split(' ')){ const t=line?line+' '+wd:wd; if(c.measureText(t).width>W-56){ c.fillText(line,W/2,yy); yy+=lh; line=wd; } else line=t; } c.fillText(line,W/2,yy);
      c.fillStyle=col; c.fillRect(W*0.3,Hh-26,W*0.4,8);
      const off=0.06; x+=Math.sin(ry)*off; z+=Math.cos(ry)*off; // proud of the wall ribs
      const fr=bx(w+0.05,h+0.05,0.02,M.frame,x,y,z); fr.rotation.y=ry; const o=plane(w,h,label(new THREE.MeshStandardMaterial({map:canvasTex(cv),roughness:0.8})),x+Math.sin(ry)*0.012,y,z+Math.cos(ry)*0.012,ry); return o; };
    /* ---- the crew's own boards and labels, per hull ---- */
    const INK={chalk:['#22262a','#f1efe6','#6a4a30'],paper:['#efe6cf','#2a2420',null],tape:['#d9c98a','#2a2420',null],paint:['#8d9399','#f6f6f0',null],brass:['#b08d3c','#241a08','#7a5f20']};
    for(const [text,style,w,h,x,y,z,q] of DECK_NOTES[Assets.shipKey(G.shipId)]||[]){ const W=512, Hh=Math.round(W*h/w), cv=makeCanvas(W,Hh), c=cv.getContext('2d'), [bg,ink,rim]=INK[style], lines=text.split('|');
      c.fillStyle=bg; c.fillRect(0,0,W,Hh); if(rim){ c.strokeStyle=rim; c.lineWidth=18; c.strokeRect(9,9,W-18,Hh-18); }
      c.fillStyle=ink; c.textAlign='center'; c.textBaseline='middle'; const lh=(Hh-44)/lines.length;
      lines.forEach((t,i)=>{ fitFont(c,t,W-64,Math.round(lh*0.86),`700 #px ${FONT_DISP}`); c.fillText(t,W/2,22+lh*(i+0.5)); });
      plane(w,h,label(new THREE.MeshBasicMaterial({map:canvasTex(cv),color:0xc8c8c8})),x,y,z,q*ry90); }
    /* ---- corridor ---- */
    for(const [sx,spans] of [[-1,[[0.75,3.0],[4.2,5.95]]],[1,[[0.75,2.5],[3.7,5.55]]]]) for(const [a,b] of spans){
      const r=cyl(0.024,0.024,b-a-0.2,M.chrome,sx*0.77,0.08,(a+b)/2,12); r.rotation.x=ry90;
      for(const z of [a+0.15,(a+b)/2,b-0.15]) bx(0.1,0.035,0.035,M.chrome,sx*0.81,0.08,z);
      for(let z=a+0.25;z<b-0.1;z+=0.7) bx(0.06,0.012,0.14,M.guide,sx*0.76,FLOOR+0.007,z); }
    for(const [x,m] of [[-0.6,M.pipe],[0.6,M.cool]]){ const p=cyl(0.04,0.04,6.3,m,x,CEIL-0.055,3.95,10); p.rotation.x=ry90; } // tucked up under the ceiling, above the signs
    cyl(0.08,0.08,0.45,M.red,0.74,FLOOR+0.42,6.95,16); cyl(0.03,0.04,0.1,M.dark,0.74,FLOOR+0.7,6.95,10); bx(0.06,0.06,0.2,M.chrome,0.81,FLOOR+0.5,6.95);
    sign('AIRLOCK','Outside is that way. Do not.',0.95,0.28,0.855,1.14,6.1,-ry90); sign('SCRUBBER & HEAD','Knock first',0.95,0.28,-0.855,1.14,6.5,ry90);
    for(const sx of [-1,1]) sign('SERVICE ALLEY','Breathe in',0.95,0.28,sx*2.355,1.14,15.1,-sx*ry90);
    bx(0.06,0.4,0.56,M.red,-0.84,0.5,1.5); sign('EMERGENCY','Break glass. Then panic.',0.5,0.3,-0.805,0.5,1.5,ry90,'#ff6a5a');
    sign('COCKPIT','Pilots only. That means you.',1.3,0.42,0,1.06,0.745,0);
    sign('CABIN','Passengers, mostly content',1.1,0.32,-0.855,1.14,3.6,ry90);
    sign('GALLEY','Tea, and other emergencies',1.1,0.32,0.855,1.14,3.1,-ry90);
    sign('CARGO HOLD','Mind the boxes',1.7,0.3,0,1.165,7.155,Math.PI);
    sign('TO COCKPIT','Straight on, past the tea',1.7,0.3,0,1.165,7.245,0);
    sign('ENGINE ROOM','Do not lick the reactor',1.5,0.34,0,1.14,14.155,Math.PI);
    sign('CARGO HOLD','The boxes are fine. Probably.',1.5,0.34,0,1.14,14.245,0);
    sign('EXIT','To the corridor',1.1,0.32,-0.945,1.14,3.6,-ry90); sign('EXIT','To the corridor',1.1,0.32,0.945,1.14,3.1,ry90);
    /* ---- passenger cabin ---- */
    { const rug=plane(1.7,3.8,M.rug,-2.35,FLOOR+0.004,3.6,0); rug.rotation.x=-ry90; }
    add(Folk.rbox(0.5,0.3,4.25,0.05,M.cream,-4.12,1.15,3.6)); bx(0.02,0.03,4.2,M.accent,-3.865,1.02,3.6);
    for(let i=0;i<nSeats&&i<4;i++){ const z=1.95+i*1.15; cyl(0.05,0.05,0.02,M.warm,-4.0,0.99,z,16); sign(`SEAT ${i+1}`,null,0.34,0.13,-3.862,1.16,z,ry90,'#9fe0ff'); }
    bx(0.3,0.95,0.28,M.cream,-1.42,FLOOR+0.475,1.6); add(new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.11,0.32,20),new THREE.MeshStandardMaterial({color:C('#7fc4ff'),transparent:true,opacity:0.6,roughness:0.1}))).position.set(-1.42,FLOOR+1.11,1.6);
    cyl(0.018,0.018,0.05,M.red,-1.48,FLOOR+0.72,1.75,8).rotation.x=ry90; cyl(0.018,0.018,0.05,M.cool,-1.36,FLOOR+0.72,1.75,8).rotation.x=ry90;
    poster('IN-FLIGHT SAFETY','In the unlikely event of a water landing, please be very surprised. There is no water. There has never been water.','#2e7fb8',0.58,0.8,-2.15,0.35,1.447,0);
    poster('PASSENGER CHARTER','You are entitled to one seat, one window and one complaint per light-year. Complaints are read aloud to the reactor, which does not care.','#b8452e',0.58,0.8,-2.15,0.35,5.753,Math.PI);
    /* ---- galley ---- */
    add(Folk.rbox(2.4,0.45,0.34,0.03,M.cream,2.45,0.95,4.79));
    for(const x of [1.65,2.45,3.25]){ bx(0.012,0.4,0.01,M.dark,x,0.95,4.615); bx(0.025,0.12,0.03,M.chrome,x-0.06,0.88,4.61); bx(0.025,0.12,0.03,M.chrome,x+0.06,0.88,4.61); }
    bx(0.5,0.02,0.36,M.dark,3.15,-0.025,4.62); cyl(0.02,0.02,0.2,M.chrome,3.15,0.08,4.85,8); bx(0.02,0.02,0.14,M.chrome,3.15,0.17,4.79);
    [[2.4,M.red],[2.56,M.cream],[2.72,M.accent]].forEach(([x,m])=>cyl(0.045,0.04,0.1,m,x,-0.0,4.52,14));
    add(Folk.rbox(0.62,0.07,1.4,0.03,M.rug,3.6,-0.37,3.25));
    bx(0.22,0.03,1.2,M.wood,3.84,0.9,2.4); ['#2e7fb8','#b8452e','#e0b000','#3a8a4a','#7a4ab8'].forEach((c,k)=>bx(0.15,0.17+(k%2)*0.03,0.055,std2(c),3.84,1.0+(k%2)*0.015,1.95+k*0.07));
    poster('WASH YOUR MUG','This means you. Yes, you, reading this. The mugs know what you did.','#3a8a4a',0.48,0.64,1.78,0.35,1.447,0);
    /* ---- cargo hold ---- */
    for(const sx of [-1,1]) bx(0.06,0.02,6.6,M.dark,sx*1.85,FLOOR+0.01,10.7);
    for(let z=8.0;z<13.9;z+=0.7) bx(0.04,0.012,0.12,M.guide,1.35,FLOOR+0.007,z), bx(0.04,0.012,0.12,M.guide,-1.35,FLOOR+0.007,z);
    bx(0.16,0.12,6.8,M.accent,0,CEIL-0.16,10.7); bx(0.32,0.12,0.32,M.dark,0,CEIL-0.29,10.2); cyl(0.01,0.01,0.3,M.chrome,0,1.0,10.2,6);
    { const hk=new THREE.Mesh(new THREE.TorusGeometry(0.07,0.018,8,16,Math.PI*1.4),M.chrome); hk.position.set(0,0.8,10.2); add(hk); }
    { const W=1024,Hh=256,cv=makeCanvas(W,Hh),c=cv.getContext('2d'); c.fillStyle='rgba(242,193,78,0.85)'; c.textAlign='center'; c.textBaseline='middle'; c.font=`700 150px ${FONT_DISP}`; c.fillText('MIND THE BOXES',W/2,Hh/2,W-40);
      const d=plane(2.2,0.55,label(new THREE.MeshBasicMaterial({map:canvasTex(cv),transparent:true,depthWrite:false,color:0xbbbbbb})),0,FLOOR+0.012,8.2,0); d.rotation.set(-ry90,0,Math.PI); }
    /* ---- engine room ---- */
    { const r1=new THREE.Mesh(new THREE.RingGeometry(1.02,1.6,48),M.dark); r1.rotation.x=-ry90; r1.position.set(0,FLOOR+0.005,16.6); add(r1);
      const r2=new THREE.Mesh(new THREE.RingGeometry(1.6,1.68,48),std2('#f2c14e')); r2.rotation.x=-ry90; r2.position.set(0,FLOOR+0.007,16.6); add(r2); }
    for(const [y,z] of [[0.15,16.2],[-0.5,17.9],[0.8,17.4]]){ const w=new THREE.Mesh(new THREE.TorusGeometry(0.13,0.022,8,22),M.red); w.rotation.y=ry90; w.position.set(-2.1,y,z); add(w);
      for(const a of [0,1.05,2.1]){ const s=bx(0.015,0.26,0.015,M.red,-2.1,y,z); s.rotation.x=a; } cyl(0.03,0.03,0.18,M.red,-2.19,y,z,8).rotation.z=ry90; }
    const dial=(v,lbl)=>{ const S=256,cv=makeCanvas(S,S),c=cv.getContext('2d'); c.fillStyle='#f0ece2'; c.beginPath(); c.arc(S/2,S/2,S/2-4,0,7); c.fill(); c.strokeStyle='#202428'; c.lineWidth=10; c.stroke();
      c.fillStyle='#c0392b'; c.beginPath(); c.moveTo(S/2,S/2); c.arc(S/2,S/2,S/2-18,-0.3,0.55); c.fill(); c.fillStyle='#f0ece2'; c.beginPath(); c.arc(S/2,S/2,S/2-40,0,7); c.fill();
      c.strokeStyle='#202428'; c.lineWidth=5; for(let k=0;k<=8;k++){ const a=Math.PI*0.75+k/8*Math.PI*1.5; c.beginPath(); c.moveTo(S/2+Math.cos(a)*(S/2-20),S/2+Math.sin(a)*(S/2-20)); c.lineTo(S/2+Math.cos(a)*(S/2-42),S/2+Math.sin(a)*(S/2-42)); c.stroke(); }
      c.fillStyle='#202428'; c.font=`700 40px ${FONT_DISP}`; c.textAlign='center'; c.fillText(lbl,S/2,S*0.8);
      const a=Math.PI*0.75+v*Math.PI*1.5; c.strokeStyle='#c0392b'; c.lineWidth=8; c.beginPath(); c.moveTo(S/2,S/2); c.lineTo(S/2+Math.cos(a)*(S/2-34),S/2+Math.sin(a)*(S/2-34)); c.stroke(); c.fillStyle='#202428'; c.beginPath(); c.arc(S/2,S/2,12,0,7); c.fill();
      return label(new THREE.MeshBasicMaterial({map:canvasTex(cv),color:0xcccccc})); };
    [[0.4,0.35,'TEMP'],[1.0,0.62,'PRESS'],[1.6,0.9,'VIBES']].forEach(([x,v,l])=>{ const d=new THREE.Mesh(new THREE.CircleGeometry(0.13,32),dial(v,l)); d.position.set(x,-0.4,18.444); d.rotation.y=Math.PI; add(d); cyl(0.145,0.145,0.02,M.chrome,x,-0.4,18.452,24).rotation.x=ry90; });
    cyl(0.02,0.02,0.32,M.chrome,1.95,0.08,18.6,8).rotation.x=-0.4; add(Folk.sph(0.045,M.red,1.95,0.23,18.54));
    poster('REACTOR NOTICE','Glowing is normal. Humming is normal. If it starts singing, leave quietly and do not join in.','#c0392b',0.55,0.74,-1.45,0.5,18.955,Math.PI);
    function std2(hex){ return new THREE.MeshStandardMaterial({color:C(hex),roughness:0.6,metalness:0.1}); }
  },
  /* fold every static mesh into one mesh per material, so the detail costs a handful of draw calls */
  merge(g){
    const U=THREE.BufferGeometryUtils; if(!U) return; g.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(), buckets=new Map(), dead=[];
    g.traverse(o=>{ if(!o.isMesh||o.userData.keep||Array.isArray(o.material)||o.material.transparent) return;
      const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); geo.clearGroups(); for(const k of Object.keys(geo.attributes)) if(!['position','normal','uv'].includes(k)) geo.deleteAttribute(k);
      if(!geo.attributes.uv) return; geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld)); if(!buckets.has(o.material)) buckets.set(o.material,[]); buckets.get(o.material).push(geo); dead.push(o); });
    for(const o of dead){ o.parent.remove(o); o.geometry.dispose(); }
    for(const [m,list] of buckets){ const geo=U.mergeBufferGeometries(list); list.forEach(x=>x.dispose()); if(geo) g.add(new THREE.Mesh(geo,m)); }
  },
  /* Each repair spot is a proper fitting with two looks: broken (flashing red, visibly damaged, leaking or smoking) and
     working (steady green, closed up, running). A small status screen beside it says which, in big letters. */
  faultFx(id){
    const d=FAULT_DEFS[id], S=FAULT_SPOTS[id], M=this.M, grp=new THREE.Group(); grp.position.set(...d.pos); grp.rotation.y=S.rot||0; this.group.add(grp);
    const ok=new THREE.Group(), bad=new THREE.Group(), em=new THREE.Group(); grp.add(ok); grp.add(bad); bad.add(em); em.position.set(...S.emit);
    const std=(hex,r,m,ex)=>new THREE.MeshStandardMaterial(Object.assign({color:C(hex),roughness:r,metalness:m},ex||{}));
    const B=(par,w,h,dd,m,x,y,z)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,dd),m); o.position.set(x,y,z); par.add(o); return o; };
    const Cy=(par,r1,r2,h,m,x,y,z,seg=18)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m); o.position.set(x,y,z); par.add(o); return o; };
    const Sp=(par,r,m,x,y,z)=>{ const o=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),m); o.position.set(x,y,z); par.add(o); return o; };
    const decal=(par,w,h,draw,x,y,z,ry)=>{ const cv=makeCanvas(256,256), c=cv.getContext('2d'); draw(c); const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:canvasTex(cv),transparent:true,depthWrite:false})); o.position.set(x,y,z); o.rotation.y=ry; o.renderOrder=4; par.add(o); return o; };
    const scorch=c=>{ const g=c.createRadialGradient(128,128,8,128,128,124); g.addColorStop(0,'rgba(10,8,6,.95)'); g.addColorStop(0.5,'rgba(20,16,12,.6)'); g.addColorStop(1,'rgba(20,16,12,0)'); c.fillStyle=g; c.fillRect(0,0,256,256); };
    const yellow=std('#f2c14e',0.7,0.05), steel=std('#7d848c',0.45,0.75), black=std('#141414',0.95,0), rivet=std('#c8ccd0',0.3,0.9);
    // the status plate: a little screen and a light, facing into the room
    const face=new THREE.Group(); face.position.set(...S.scr); face.rotation.y=S.ry; grp.add(face);
    B(face,0.7,0.27,0.03,M.dark,0.05,0,-0.016);
    const cv=makeCanvas(256,104), tex=canvasTex(cv), scr=new THREE.Mesh(new THREE.PlaneGeometry(0.56,0.22),new THREE.MeshBasicMaterial({map:tex})); scr.position.z=0.001; face.add(scr);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.045,12,8),new THREE.MeshBasicMaterial({color:HDR('#40ff80',2)})); lamp.position.set(0.34,0,0.01); face.add(lamp);
    const parts=[], add=(n,col,size,opts)=>{ for(let i=0;i<n;i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(size,8,6),new THREE.MeshBasicMaterial({color:opts&&opts.hdr?HDR(col,opts.hdr):C(col),transparent:true,opacity:0.45,depthWrite:false,blending:opts&&opts.add?THREE.AdditiveBlending:THREE.NormalBlending})); em.add(m); parts.push({m,age:Math.random(),life:0.5+Math.random()*0.8}); } };
    let strap=null, crack=null, fan=null, ribbon=null;
    if(id==='coolant'){ // a flanged joint on the coolant pipe; broken, the flange has split and coolant is pooling on the floor
      const fl=(par,z,h)=>{ const o=Cy(par,0.15,0.15,h,M.chrome,-0.03,0,z,20); o.rotation.x=Math.PI/2; for(let i=0;i<6;i++){ const a=i/6*6.283, b=Cy(par,0.018,0.018,h+0.03,steel,-0.03+Math.cos(a)*0.12,Math.sin(a)*0.12,z,8); b.rotation.x=Math.PI/2; } };
      fl(ok,0,0.11); const tape=Cy(ok,0.1,0.1,0.26,std('#2e7fb8',0.6,0.1),-0.03,0,0,16); tape.rotation.x=Math.PI/2;
      fl(bad,-0.08,0.05); fl(bad,0.08,0.05); const gs=Cy(bad,0.12,0.12,0.012,black,-0.03,-0.05,0.02,16); gs.rotation.set(Math.PI/2,0,0.5);
      const pud=new THREE.Mesh(new THREE.CircleGeometry(0.45,28),std('#5fd8ff',0.05,0.3,{transparent:true,opacity:0.65})); pud.rotation.x=-Math.PI/2; pud.position.set(0.28,FLOOR-d.pos[1]+0.006,0.05); pud.scale.set(1.3,0.8,1); bad.add(pud);
      for(let i=0;i<3;i++) Sp(bad,0.02,std('#5fd8ff',0.05,0.3),-0.03,-0.18-i*0.25,0.02);
      add(14,'#e8f0f4',0.06); }
    else if(id==='thruster'){ // the injector panel on the back wall; broken, its cover hangs open over a glowing coil and loose wires
      B(grp,0.74,0.5,0.05,M.dark,0,0.45,0.085);
      const coverM=std('#4f565f',0.45,0.7), cover=(par)=>{ const g=B(par,0.7,0.46,0.03,coverM,0,0,0); for(let i=0;i<4;i++) B(g,0.46,0.025,0.01,M.dark,0,-0.13+i*0.07,0.018); B(g,0.7,0.06,0.01,M.hazard,0,0.19,0.018); return g; };
      const c1=cover(ok); c1.position.set(0,0.45,0.045); B(ok,0.5,0.03,0.01,new THREE.MeshBasicMaterial({color:HDR('#40ff80',1.6)}),0,0.65,0.065);
      const hinge=new THREE.Group(); hinge.position.set(0.35,0.45,0.045); hinge.rotation.y=1.25; bad.add(hinge); const c2=cover(hinge); c2.position.set(-0.35,-0.04,0); c2.rotation.z=0.12;
      const coil=Cy(bad,0.07,0.07,0.5,new THREE.MeshBasicMaterial({color:HDR('#ff6a20',2.4)}),0,0.45,0.06,16); coil.rotation.z=Math.PI/2;
      for(let i=0;i<6;i++){ const w=Cy(bad,0.012,0.012,0.4+i*0.05,std(['#c0392b','#2e86c1','#f1c40f','#27ae60'][i%4],0.5,0.2),-0.2+i*0.08,0.3-i*0.03,0.02,6); w.rotation.set(0.5+i*0.2,0,0.8-i*0.3); }
      decal(bad,1.0,0.7,scorch,0,0.85,0.07,Math.PI);
      add(10,'#5a5550',0.07); add(5,'#ff8a30',0.03,{hdr:3,add:true}); }
    else if(id==='fuse'){ // the galley fuse box; broken, the door hangs open, one fuse is charred black and sparking
      B(ok,0.74,0.84,0.03,M.frame,0,0,0.13); B(ok,0.32,0.12,0.01,std('#d8d2c4',0.8,0),0,0.25,0.147); B(ok,0.04,0.16,0.04,M.chrome,0.3,0,0.15);
      const hinge=new THREE.Group(); hinge.position.set(-0.37,0,0.13); hinge.rotation.y=-1.7; bad.add(hinge); B(hinge,0.74,0.84,0.03,M.frame,0.37,0,0); B(hinge,0.04,0.16,0.04,M.chrome,0.67,0,0.02);
      B(bad,0.09,0.18,0.06,black,0,0.15,0.125); decal(bad,0.36,0.36,scorch,0,0.2,0.116,0);
      add(10,'#ffd060',0.018,{hdr:4,add:true}); }
    else if(id==='scrubber'){ // the cabin air scrubber; working, its fan spins and a ribbon flutters in the draught; jammed, it is stuffed with fluff
      B(grp,0.8,0.46,0.18,std('#596069',0.5,0.6),0,0,-0.07); const rim=new THREE.Mesh(new THREE.TorusGeometry(0.17,0.022,8,28),M.chrome); rim.position.set(0,0,-0.165); grp.add(rim);
      Cy(grp,0.17,0.17,0.01,M.dark,0,0,-0.158,24).rotation.x=Math.PI/2; for(let i=-2;i<=2;i++) B(grp,0.32,0.012,0.01,M.chrome,0,i*0.06,-0.172);
      fan=new THREE.Group(); fan.position.set(0,0,-0.163); grp.add(fan); for(let i=0;i<4;i++){ const b=B(fan,0.06,0.3,0.008,std('#e6e9ec',0.35,0.4),0,0,0); b.rotation.z=i*Math.PI/4; }
      ribbon=new THREE.Group(); ribbon.position.set(0,0.17,-0.18); ok.add(ribbon); B(ribbon,0.06,0.32,0.004,new THREE.MeshBasicMaterial({color:HDR('#3fe07a',1.2)}),0,-0.16,0);
      const fluff=std('#8a867e',1,0); for(let i=0;i<14;i++) Sp(bad,0.05+((i*7)%5)*0.012,fluff,Math.cos(i*2.4)*0.12,Math.sin(i*2.4)*0.12,-0.2-((i*3)%4)*0.012);
      for(let i=0;i<3;i++){ const k=Sp(bad,0.06,fluff,-0.2+i*0.18,-0.3-(i%2)*0.08,-0.2); k.scale.set(1,1.6,1); }
      B(bad,0.07,0.07,0.02,std('#c0392b',0.5,0.2),0.3,0.16,-0.165);
      add(12,'#9aa0a6',0.09); }
    else if(id==='crack'){ // the corridor wall; cracked and frosting over, or covered by a riveted patch plate once it is fixed
      const pl=B(ok,0.025,0.46,0.56,steel,0.012,0,0); for(let i=0;i<10;i++){ const a=i/10*6.283; Sp(ok,0.016,rivet,0.03,Math.sin(a)*0.19,Math.cos(a)*0.24); } B(ok,0.004,0.05,0.62,yellow,0.026,0.2,0).rotation.x=0.35;
      const cv2=makeCanvas(256,256), x2=cv2.getContext('2d'); x2.strokeStyle='#050505'; x2.lineWidth=5; x2.beginPath(); let px=128,py=20; x2.moveTo(px,py); for(let i=0;i<9;i++){ px+=(Math.random()-0.5)*60; py+=24; x2.lineTo(px,py); } x2.stroke(); x2.lineWidth=2.5; for(let k=0;k<5;k++){ x2.beginPath(); x2.moveTo(128+(Math.random()-0.5)*40,40+k*40); x2.lineTo(128+(Math.random()-0.5)*160,60+k*40); x2.stroke(); }
      decal(bad,0.8,0.7,c=>{ const g=c.createRadialGradient(128,128,10,128,128,124); g.addColorStop(0,'rgba(235,248,255,.85)'); g.addColorStop(0.6,'rgba(220,240,255,.35)'); g.addColorStop(1,'rgba(220,240,255,0)'); c.fillStyle=g; c.fillRect(0,0,256,256); },0.022,0,0,Math.PI/2);
      crack=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.9),new THREE.MeshBasicMaterial({map:canvasTex(cv2),transparent:true,depthWrite:false})); crack.rotation.y=Math.PI/2; crack.position.x=0.03; crack.renderOrder=5; bad.add(crack);
      add(12,'#dff4ff',0.03,{hdr:1.5}); }
    else if(id==='strap'){ // the tie-down straps across the crate stacks; taut with a closed ratchet, or snapped and dangling with the ratchet on the floor
      const band=std('#ff5a2a',0.6,0.05);
      for(const y of [0.9,0.3]){ B(ok,0.02,0.08,2.6,band,0.35,y,0); B(ok,0.09,0.14,0.22,M.chrome,0.33,y,(y>0.5?-0.4:0.5)); for(const z of [-1.3,1.3]) B(ok,0.06,0.06,0.06,M.dark,0.35,y,z); }
      strap=new THREE.Group(); strap.position.set(0.35,1.0,-0.45); bad.add(strap); B(strap,0.02,1.0,0.08,band,0,-0.5,0);
      const fl=B(bad,1.1,0.006,0.08,band,-0.1,FLOOR-d.pos[1]+0.005,-0.9); fl.rotation.y=0.7; B(bad,0.13,0.09,0.22,M.chrome,-0.25,FLOOR-d.pos[1]+0.05,-1.35).rotation.y=0.4;
      B(bad,0.02,0.08,0.9,band,0.35,0.3,0.9); B(bad,0.02,0.08,0.5,band,0.35,0.9,1.05); }
    else if(id==='seal'){ // the inner hatch's seal valve: a gauge and a lever on a plate; leaking, the lever has dropped, a strip of gasket hangs loose and air hisses out
      B(grp,0.52,0.56,0.05,M.dark,0,0,0.025); Cy(grp,0.13,0.13,0.03,M.chrome,-0.1,0.1,0.06,24).rotation.x=Math.PI/2; Cy(grp,0.11,0.11,0.032,std('#f0ece2',0.6,0),-0.1,0.1,0.062,24).rotation.x=Math.PI/2;
      B(ok,0.012,0.09,0.01,std('#2e9a4a',0.5,0.1),-0.1,0.14,0.082).rotation.z=-0.6; B(bad,0.012,0.09,0.01,std('#c0392b',0.5,0.1),-0.1,0.14,0.082).rotation.z=1.1;
      const lever=(par,rz)=>{ const h=new THREE.Group(); h.position.set(0.14,-0.08,0.07); h.rotation.z=rz; par.add(h); B(h,0.05,0.3,0.04,M.chrome,0,0.13,0); Sp(h,0.045,yellow,0,0.29,0); };
      lever(ok,0); lever(bad,-1.9); B(grp,0.4,0.05,0.01,M.hazard,0,-0.24,0.052);
      const gk=B(bad,0.035,0.5,0.02,black,-0.3,-0.3,0.04); gk.rotation.z=0.25; B(bad,0.035,0.2,0.02,black,-0.36,-0.6,0.05).rotation.z=-0.5;
      add(12,'#eaf4ff',0.05); }
    ok.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=false; } }); bad.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=false; } });
    const f={grp,ok,bad,lamp,scr,cv,tex,parts,strap,crack,fan,ribbon,d,S}; this.drawSpot(f,false); return f; },
  /* the status screen beside each repair spot */
  drawSpot(f, broken){ const x=f.cv.getContext('2d'); x.fillStyle='#050a0c'; x.fillRect(0,0,256,104); x.textAlign='center'; x.textBaseline='middle';
    x.fillStyle=broken?'#ff9a8a':'#9ff0b8'; x.font=`600 24px ${FONT_MONO}`; x.fillText(f.S.label,128,22,240);
    x.fillStyle=broken?'#ff5a4a':'#5dff8f'; x.font=`700 52px ${FONT_DISP}`; x.fillText(broken?f.S.bad:'OK',128,70,240); f.tex.needsUpdate=true; },
  syncFaults(){ if(!this.group) return; for(const id in this.fx){ const f=this.fx[id], has=Faults.has(id); if(f.broken!==has){ f.broken=has; f.bad.visible=has; f.ok.visible=!has; this.drawSpot(f,has); } } },
  /* crates in the hold match how full it is; passengers sit in the cabin */
  syncCargo(){
    const P0=this.plan(), room=P0&&P0.crates?P0.crates.length*2:28, used=holdUsed(), n=Math.round(clamp(used/holdCap(),0,1)*room), key=n+'';
    if(key!==this.crateKey){ this.crateKey=key; if(this.crates) this.group.remove(this.crates); const cg=this.crates=new THREE.Group(); this.group.add(cg); let k=0;
      // plain wood crates: slats inside a darker frame. They take almost nothing from the bright sky map, which made them glow like lamps
      if(!this.crateTex){ const S=256, cv=makeCanvas(S,S), x=cv.getContext('2d'); x.fillStyle='#d8d0c4'; x.fillRect(0,0,S,S);
        for(let i=0;i<5;i++){ x.fillStyle=i%2?'#cfc6b8':'#e2dace'; x.fillRect(0,i*S/5,S,S/5-6); x.fillStyle='#5a4a38'; x.fillRect(0,(i+1)*S/5-6,S,6); }
        for(let i=0;i<260;i++){ const yy=(i*97)%S, xx=(i*53)%S; x.fillStyle=`rgba(${i%3?'60,44,30':'255,244,220'},${0.05+(i%5)*0.02})`; x.fillRect(xx,yy,30+(i*7)%120,1+(i%2)); } for(let i=0;i<5;i++){ x.fillStyle='rgba(40,28,18,0.5)'; x.beginPath(); x.ellipse((i*83+40)%S,(i*131+30)%S,7,4,0,0,7); x.fill(); } this.crateTex=canvasTex(cv); }
      const mats=['#a8743a','#8c5e2a','#b98040','#7a6650'].map(c=>new THREE.MeshStandardMaterial({color:C(c),map:this.crateTex,roughness:0.9,metalness:0,envMapIntensity:0.12}));
      const P=this.plan(), slots=[]; if(P&&P.crates) for(const [x,z] of P.crates) slots.push([x,z]); else for(const sx of [-1,1]) for(let z=7.9;z<13.9;z+=0.85) slots.push([sx*2.35,z]);
      for(const [sx0,z] of slots) for(let lvl=0;lvl<2&&k<n;lvl++,k++){ const c=new THREE.Mesh(this.crateGeo(),mats[(k*7)%4]); if(this.lit) this.indoor(c.material,0.5); c.position.set(sx0+Math.sign(sx0)*(lvl?0.05:0),FLOOR+0.39+lvl*0.8,z); c.rotation.y=(k%3-1)*0.05; cg.add(c); } }
    const pax=Cargo.pax(), pk=pax.map(p=>p.kind==='escort'?p.vip.seed:p.seed).join(',');
    if(pk!==this.paxKey){ this.paxKey=pk; for(const F of this.pax) F.parent&&F.parent.remove(F); this.pax=[];
      pax.slice(0,this.seats.length).forEach((p,i)=>{ const sp=p.kind==='escort'?p.vip.sp:p.sp, seed=p.kind==='escort'?p.vip.seed:p.seed, F=Folk.make(sp,seed,0.66), S=this.seats[i], U=F.userData;
        // sit hips on the cushion (species without legs just settle into it), legs forward, hands on the armrests
        const hip=U.legs[0]?U.legs[0].position.y*0.66:0.06; F.position.set(0.04,FLOOR+0.49-hip+0.02,0); F.rotation.y=Math.PI/2; for(const l of U.legs) l.rotation.x=-1.45;
        if(U.model){ const sa=U.seatAt; if(sa){ U.sit(true); F.position.set(0.04-sa.z*0.66,FLOOR+0.49-sa.y*0.66+0.02,sa.x*0.66); } else { F.scale.setScalar(0.42); F.position.set(0.04,FLOOR+0.51,0); } }
        else Folk.arms(F,[0.55,0.28],[0.55,0.28]); S.add(F); U.cargo=p; U.wave=0; U.waved=false; this.pax.push(F); }); } },
  update(dt, t){
    const g=this.group; g.quaternion.copy(G.ship.quat);
    for(const id in this.fx){ const f=this.fx[id];
      // working: a steady green light, the scrubber fan turning and its ribbon blowing out into the room
      if(!f.broken){ f.lamp.material.color.setRGB(0.35,1.9,0.7); f.scr.material.color.setScalar(1); if(f.fan) f.fan.rotation.z+=dt*16; if(f.ribbon) f.ribbon.rotation.x=0.9+Math.sin(t*19)*0.25; continue; }
      const on=Math.sin(t*8)>0; f.lamp.material.color.setRGB(on?3:0.3,on?0.36:0.04,on?0.18:0.02); f.scr.material.color.setScalar(on?1:0.55);
      for(const p of f.parts){ p.age+=dt; if(p.age>p.life){ p.age=0; p.m.position.set(0,0,0); p.v=new V3((Math.random()-0.5)*0.6,Math.random()*0.8,(Math.random()-0.5)*0.6); if(f.d.fx==='steam') p.v.set(1.6+Math.random(),0.3+Math.random()*0.5,(Math.random()-0.5)*0.6); if(f.d.fx==='haze') p.v.set((Math.random()-0.5)*0.3,-0.25,-0.5-Math.random()*0.3); if(f.d.fx==='frost') p.v.set(0.6+Math.random()*0.4,(Math.random()-0.5)*0.6,(Math.random()-0.5)*0.6); if(f.d.fx==='sparks') p.v.set(0.4+Math.random()*1.2,Math.random()*1.5,(Math.random()-0.5)*1.4).multiplyScalar(1); }
        if(!p.v) continue; if(f.d.fx==='sparks') p.v.y-=dt*4; if(f.d.fx==='frost') p.m.position.addScaledVector(p.v,-dt*0.0); p.m.position.addScaledVector(p.v,dt); const k=p.age/p.life; p.m.material.opacity=0.5*(1-k); p.m.scale.setScalar(f.d.fx==='sparks'?1:1+k*1.6);
        if(f.d.fx==='frost'){ p.m.position.copy(p.v).multiplyScalar((1-k)*0.8); } }
      if(f.strap) f.strap.rotation.z=Math.sin(t*2.3)*0.35+Math.sin(t*5.1)*0.08; }
    this.core.material.color.setRGB(0.4,1.6+Math.sin(t*3)*0.25,3+Math.sin(t*3)*0.4);
    // passengers look at you when you are nearby and wear how the trip is going
    const me=Walk.pos;
    for(const F of this.pax){ Folk.blink(F,t); const S=F.parent, wp=new V3().setFromMatrixPosition(S.matrix), d=Math.hypot(me.x-wp.x,me.z-wp.z), U=F.userData;
      const want=d<3.5?clamp(Math.atan2(me.x-wp.x,me.z-wp.z)-Math.PI/2,-0.9,0.9):Math.sin(t*0.3+U.ph)*0.3; U.head.rotation.y=lerp(U.head.rotation.y,want,1-Math.exp(-dt*4));
      // breathe; nod when you first come over, and again if you come back after a while
      U.rig.scale.y=1+Math.sin(t*1.6+U.ph)*0.012; if(d<2.6&&!U.waved){ U.waved=true; U.wave=1.8; } if(d>4.5) U.waved=false;
      if(U.wave>0){ U.wave-=dt; U.head.rotation.x=0.2*Math.sin(clamp((1.8-U.wave)/0.9,0,1)*Math.PI); if(U.wave<=0) U.head.rotation.x=0; }
      const c=U.cargo, f=c.kind==='escort'?(c.hp>70?1:c.hp>40?0.7:0.4):Cargo.factor(c), m=Escort.hazard&&c.kind==='escort'?'shock':f>=1?(Faults.has('scrubber')?'worried':d<2.2?'happy':'neutral'):f>0.65?'worried':'sad'; if(U.mood!==m) Folk.mood(F,m); }
  },
};

/* ---------- walking ---------- */
const Walk = {
  on:false, stale:new Set(), pos:new V3(0,EYE,1.2), yaw:Math.PI, pitch:0, tr:0, trDir:0, bob:0, target:null, hold:0, told:false,
  /* L (or Seat) sits you back down, but only from the cockpit doorway */
  atDoor(){ return this.pos.z<2.1&&Math.abs(this.pos.x)<0.75; },
  toggle(){ if(!this.on){ this.enter(); return; } if(this.atDoor()) this.exit(); else { UI.toast(`Walk back to the cockpit door to sit down. It is at the front end of the corridor.`,'warn'); Sfx.deny(); } },
  enter(){
    if(G.mode!=='flight'||this.on) return; const parked=Dlg.open&&Dlg.park(); if(parked) setTimeout(()=>UI.toast('The call will wait. It comes back when you sit down.'),400);
    if(!Interior.group||Interior.shipId!==G.shipId) Interior.build(); Radio.cur=null; Radio.wait=Math.max(Radio.wait,6);
    Comms.close(true); if(SysMap.open) SysMap.close(); Cockpit.zoomOut(); Cockpit.setDoor(1);
    this.on=true; this.tr=0; this.trDir=1; this.pos.set(0,EYE,1.25); this.yaw=Math.PI; this.pitch=-0.05; this.hold=0;
    Interior.group.visible=true; Interior.syncCargo(); Interior.syncFaults(); document.body.classList.add('walking'); Sfx.clunk();
    if(!this.told){ this.told=true; UI.toast(TouchUI.on?'Walking. Left stick to move, drag to look, hold Fix to repair things, Seat at the cockpit door to sit down.':'Walking. W A S D to move, Q and E to turn, drag to look, hold F to fix things, L at the cockpit door to sit down.','good'); }
    TouchUI.sync&&TouchUI.sync(true); },
  exit(instant){
    if(!this.on) return; this.on=false; Radio.cur=null; if(TouchUI.stick.x||TouchUI.stick.y) TouchUI.stale=true; setTimeout(()=>Dlg.flush(),900); document.body.classList.remove('walking'); $('reticle').hidden=true; $('prompt').hidden=true; Cockpit.setDoor(0);
    if(Interior.group) Interior.group.visible=false; G.head.pos.set(0,0,0); G.head.yaw=G.head.yawT=0; G.head.pitch=G.head.pitchT=G.head.basePitch; if(!instant) Sfx.clunk(); TouchUI.sync&&TouchUI.sync(true); },
  look(dx, dy){ this.yaw-=dx*0.0042; this.pitch=clamp(this.pitch-dy*0.0042,-1.2,1.2); },
  update(dt, t){
    if(!this.on) return; const K=G.keys, s=G.ship;
    if(K.ArrowLeft||K.KeyQ) this.yaw+=dt*1.9; if(K.ArrowRight||K.KeyE) this.yaw-=dt*1.9; if(K.ArrowUp) this.pitch=Math.min(1.2,this.pitch+dt*1.4); if(K.ArrowDown) this.pitch=Math.max(-1.2,this.pitch-dt*1.4);
    let f=(K.KeyW?1:0)-(K.KeyS?1:0), r=(K.KeyD?1:0)-(K.KeyA?1:0); if(!f&&!r){ f=TouchUI.stick.y; r=TouchUI.stick.x; } if(f<0) f*=0.5; // nobody walks backwards quickly without falling over something
    const sp=(K.ShiftLeft||K.ShiftRight?4.4:2.8), fx=-Math.sin(this.yaw), fz=-Math.cos(this.yaw), rx=Math.cos(this.yaw), rz=-Math.sin(this.yaw);
    let mx=(fx*f+rx*r)*sp*dt, mz=(fz*f+rz*r)*sp*dt; const p=this.pos;
    if(Interior.inside(p.x+mx,p.z+mz)){ p.x+=mx; p.z+=mz; } else if(Interior.inside(p.x+mx,p.z)) p.x+=mx; else if(Interior.inside(p.x,p.z+mz)) p.z+=mz;
    const moving=Math.abs(f)+Math.abs(r)>0.05; this.bob+=moving?dt*sp*4.2:0;
    // the ship shakes more at high throttle and in warp
    const shake=(s.throttle>5?(s.throttle-5)*0.0025:0)+s.warpF*0.006;
    p.y=EYE+(moving?Math.sin(this.bob)*0.03:0)+(Math.random()-0.5)*shake;
    Interior.update(dt,t); if((Game.mk%30)===0) Interior.syncCargo();
    this.interact(dt);
  },
  /* what you are looking at: a fault to fix or a passenger to talk to */
  interact(dt){
    const eye=this.pos, dir=new V3(-Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),-Math.cos(this.yaw)*Math.cos(this.pitch));
    let best=null, bs=0;
    for(const id of Faults.list()){ const q=new V3(...FAULT_DEFS[id].pos), to=q.clone().sub(eye), d=to.length(), dot=to.normalize().dot(dir); const score=dot-d*0.08; if(d<2.6&&(dot>0.72||d<1.1)&&score>bs){ bs=score; best={kind:'fault',id,d}; } }
    if(!best) for(const F of Interior.pax){ const S=F.parent, q=new V3().setFromMatrixPosition(S.matrix).setY(FLOOR+1.0), to=q.clone().sub(eye), d=to.length(), dot=to.normalize().dot(dir); if(d<3.4&&dot>0.85){ best={kind:'pax',F,d}; break; } }
    const pr=$('prompt'), K=G.keys, held=!!K.KeyF;
    if(!best){ this.hold=0; this.target=null;
      if(this.atDoor()){ pr.hidden=false; pr.innerHTML=`<b>Cockpit</b><span>${TouchUI.on?'Tap Seat':'Press L'} to sit down</span>`; } else pr.hidden=true; return; }
    if(best.kind==='fault'){ const D=FAULT_DEFS[best.id], s=G.ship, rough=s.throttle>5||s.warpF>0.2, rate=rough?0.35:1, need=2.6;
      if(this.target!==best.id){ this.target=best.id; this.hold=0; }
      if(held){ this.hold+=dt*rate; if(Math.floor(this.hold*3)!==Math.floor((this.hold-dt*rate)*3)) Sfx.click(); if(this.hold>=need){ Faults.fix(best.id); this.hold=0; pr.hidden=true; return; } } else this.hold=Math.max(0,this.hold-dt*2);
      pr.hidden=false; pr.innerHTML=`<b>${esc(D.name)}</b><span>${TouchUI.on?'Hold Fix':'Hold F'} to repair${rough?' · the ship is shaking: throttle 5 or below to work faster':''}</span><i style="width:${Math.round(this.hold/need*100)}%"></i>`; }
    else { const c=best.F.userData.cargo, who=c.kind==='escort'?c.vip.title:c.good; this.target=null; pr.hidden=false; pr.innerHTML=`<b>${esc(who)}</b><span>${TouchUI.on?'Tap Fix':'Press F'} to chat · going to ${esc(PLANETS[c.to].name)}</span>`;
      if(held&&!this.chatLock){ this.chatLock=true; setTimeout(()=>{ this.chatLock=false; },2500); const S=SPECIES[c.kind==='escort'?c.vip.sp:c.sp], f=Cargo.factor(c);
        const line=Faults.has('scrubber')?pick(["It is very stuffy back here. Is the air meant to be this chewy?","Something is wrong with the air. It tastes of feet. Not my feet."]):f<1?pick([`Are we nearly at ${PLANETS[c.to].name}? We were meant to be there ages ago.`,"I am not paying full fare for this. I am barely paying any fare for this.","I could have walked. I cannot walk in space, but I would have tried."]):fill(pick(S.chat),{planet:PLANETS[c.to].name,good:pick(GOODS)[0]});
        if(c.kind==='escort'){ Escort.chat(); const v=c.vip; Radio.play({sp:v.sp,seed:v.seed,name:v.title,english:Escort.hazard?pick(["Is it the pirates? It is the pirates. Do something with the horn!","Why is everything shaking? Is shaking normal? Tell me shaking is normal."]):pick(["Thank you for checking on me. I feel slightly less doomed.","Is the ship meant to make that noise? Never mind. I trust you. Mostly.","When we land, I shall mention you favourably in my memoirs. Chapter nine, probably."])}); return; }
        Radio.play({sp:c.sp,seed:c.seed,name:c.good,english:line}); } }
  },
  /* first-person camera inside the ship */
  camera(){
    const s=G.ship, q=s.quat.clone().multiply(new Q4().setFromEuler(new THREE.Euler(this.pitch,this.yaw,0,'YXZ'))), p=this.pos.clone().applyQuaternion(s.quat);
    for(const c of [World.spaceCam,World.cockCam]){ c.position.copy(p); c.quaternion.copy(q); } World.setFov(74); Cockpit.group.quaternion.copy(s.quat); World.shipFrame.quaternion.copy(s.quat);
  },
};

/* ---------- reasons not to fly everywhere at full throttle ---------- */
/* - Ports keep an inbound speed limit of 400 km/s in their approach zone, and fine you if you ignore it.
   - Throttle 9 and 10 heat the engines; keep it up and something in the engine room breaks.
   - Fragile cargo takes damage at throttle 8 and above, and when you turn hard at speed.
   - Repairs go slowly while the ship is shaking (above throttle 5, or in warp). */
const SPEED_LIMIT=400;
const Throttle = {
  heat:0, over:0, zone:null, hotTold:false, warned:false,
  reset(){ this.over=0; this.zone=null; this.warned=false; this.dismissed=null; },
  hideBanner(){ if(!this.zone||this.dismissed===this.zone) return false; this.dismissed=this.zone; $('zone-badge').hidden=true; if(Sfx.ok()) Sfx.click(); return true; },
  jolt(n){ for(const c of G.cargo) if(c.fragile) c.dmg=Math.min(0.7,(c.dmg||0)+n*0.015); },
  update(dt){
    const s=G.ship, thr=s.throttle;
    // engine heat
    if(!s.warp&&thr>=9) this.heat+=dt*(thr-8)*0.02; else if(s.warp) this.heat+=dt*0.003; else this.heat-=dt*(thr<=7?0.045:0.008);
    this.heat=clamp(this.heat,0,1);
    if(this.heat>0.7&&!this.hotTold){ this.hotTold=true; UI.toast('Engines running hot. Ease the throttle below 9 for a while.','warn'); Sfx.beep(700); }
    if(this.heat<0.4) this.hotTold=false;
    if(this.heat>=1){ this.heat=0.5; Faults.add(Math.random()<0.5?'coolant':'thruster','the engines overheated'); }
    // fragile cargo rattles at high throttle and in hard turns at speed
    if(s.warpF<0.1){ const rough=(thr>=8?(thr-7)*0.004:0)+(s.speed>450?s.angVel.length()*s.speed/1600*0.012:0);
      if(rough>0) for(const c of G.cargo){ if(!c.fragile) continue; const was=c.dmg||0; c.dmg=Math.min(0.7,was+dt*rough); if(Math.floor(was*10)!==Math.floor(c.dmg*10)) UI.toast(`Something fragile is rattling in the hold. ${c.qty}× ${c.good} is ${Math.round((1-c.dmg)*100)}% intact. Ease off below throttle 8.`,'warn'); } }
    // inbound speed limit near ports
    let zone=null; if(!s.warp){ for(const P of PLANETS){ const to=P.pos.clone().sub(s.pos), d=to.length(); if(d<P.landR+6000&&d>P.landR*0.95&&s.speed>1&&to.dot(s.vel)/(d*s.speed)>0.3){ zone=P; break; } } }
    if(zone!==this.zone){ this.settle(); this.zone=zone; this.over=0; this.warned=false; this.top=0; if(!zone) this.dismissed=null; }
    // Esc (or a tap on it) hides the banner for the rest of this approach; the speeding warning and fine still apply
    const zb=$('zone-badge'); zb.hidden=!zone||this.dismissed===zone; if(zone){ const fast=s.speed>SPEED_LIMIT+20; zb.classList.toggle('fast',fast); zb.textContent=`${zone.port} approach · limit ${SPEED_LIMIT} km/s${fast?' · SLOW DOWN':''}`;
      if(fast){ this.over+=dt; this.top=Math.max(this.top||0,s.speed); if(this.over>1.2&&!this.warned){ this.warned=true; Sfx.beep(990); UI.toast(`${zone.port} Control: you are doing ${Math.round(s.speed)} in a ${SPEED_LIMIT} zone. Throttle down or expect a fine.`,'warn'); } } }
  },
  /* the fine lands when you leave the zone or touch down, if you spent more than a moment over the limit */
  settle(){ const Z=this.zone; if(!Z||this.over<1.5) { this.over=0; return; } const amt=Math.round((20+((this.top||SPEED_LIMIT)-SPEED_LIMIT)*0.05+this.over*2)*(1+(STRICT[Z.species]||0))/5)*5; this.over=0; this.top=0;
    setTimeout(()=>{ Fx.cr(-amt,`${Z.port} Control speeding fine`); Rep.add(-1,'Speeding on approach'); },G.mode==='flight'?0:2500); },
};
