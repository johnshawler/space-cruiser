/* ===================== PORT VENUES ===================== */
/* Every planet has its own mix of places to visit in port. Each one is a little set built somewhere around the
   landing pad: a counter with a shopkeeper, and a crew in the back acting out a job that usually goes wrong. */

const VENUE_TABS = {depot:'Cargo depot', yard:'Shipyard', garage:'Garage', livery:'Paint shop', outfit:'Outfitter', assay:'Assay office', bar:'Cantina'};

const PAINTS = {
  flames:{name:'Hot Rod Flames', hull:'#c2261d', trim:'#ffb11a', price:600, note:'Adds at least ten km/s. Emotionally.'},
  stripe:{name:'Racing Stripe', hull:'#f4f4f0', trim:'#1f4fd1', price:450, note:'Two stripes. Twice as fast. Probably.'},
  hazard:{name:'Hazard Yellow', hull:'#f2c21b', trim:'#151515', price:300, note:'Nobody will ever lose you in a car park.'},
  plum:{name:'Royal Plum', hull:'#5a2a6e', trim:'#d8b04a', price:700, note:'For haulers who want to be mistaken for royalty.'},
  mint:{name:'Mint Condition', hull:'#9fe3c6', trim:'#2c6e5a', price:400, note:'Looks fresh even when it is not.'},
  midnight:{name:'Midnight', hull:'#1b2433', trim:'#5fd8ff', price:550, note:'Very hard to see. Customs hate it.'},
  tangerine:{name:'Tangerine Dream', hull:'#ff8a2a', trim:'#2a2f3a', price:350, note:'Smells faintly of citrus. Nobody knows why.'},
  beige:{name:'Approved Beige', hull:'#cdbb93', trim:'#6e5f44', price:150, note:'Form 88-C pre-approved. Thrillingly sensible.'},
  pearl:{name:'Pearlescent', hull:'#f2eef8', trim:'#b38cff', price:900, note:'Shimmers. Shows every fingerprint.'},
};

/* what each port has. The cargo depot is everywhere (and sells fuel, so nobody gets stranded); the rest is not. */
const VENUES = [
  /* 0 Verdanthia · Vendorhaven · Beepul */ [
    {k:'depot',name:'Dispatch Bay B4',sp:'beepul',title:'Dispatch unit',quirk:'Dispenses contracts. Occasionally dispenses soup by mistake.',hi:['Contract dispensed. Please take your contract. Please. Take it.','BEEP. Welcome, hauler. Exact change is still appreciated.']},
    {k:'yard',name:'Gently Used Hulls',sp:'qeeble',title:'Salesbird',quirk:'Knocks on every hull and says "that\'s quality", whatever falls off.',hi:['Kick the tyres! We don\'t have tyres. Kick something!','Every ship here had only one careful owner. At a time.'],ships:[0,1,2]},
    {k:'garage',name:'Fix-O-Matic 3000',sp:'beepul',title:'Repair unit',quirk:'Fixes anything by hitting it, then apologises to it.',hi:['Diagnosis: your ship is a ship. Repair recommended.','Please describe the noise. Was it a clunk, a clonk, or a sad whistle?']},
    {k:'bar',name:'The Coin Slot',sp:'beepul',title:'Bartender, former jukebox',quirk:'Knows one song. It is about coins.',hi:['Welcome to The Coin Slot. Now playing: the coin song.','What will it be? I recommend the oil. Everyone else recommends anything but the oil.']},
  ],
  /* 1 Scorchmaw · Port Gneiss · Grondar */ [
    {k:'depot',name:'Gravel Freight Yard',sp:'grondar',title:'Yard boss',quirk:'Counts crates by licking them.',hi:['Crates in, crates out. Don\'t stand under the crates.','Heh. Your ship is small. That\'s fine. Pebbles are small too.']},
    {k:'assay',name:'Gneiss Assay & Smelt',sp:'grondar',title:'Assayer',quirk:'Prices a rock by tasting it. Charges for the tasting.',hi:['Got rocks? I love rocks. Some of my best friends are rocks.','Bring me ore. I will tell you what it is worth and then I will lick it.']},
    {k:'outfit',name:'Hard Rock Outfitters',sp:'grondar',title:'Outfitter',quirk:'Tests every mining laser on their own forehead.',hi:['Lasers! Drills! Hats that are also drills!','This laser cuts anything. Except my forehead. I checked.'],items:['laser']},
    {k:'garage',name:'Lava Lube & Patch',sp:'momwump',title:'Very fluffy welder',quirk:'Works next to lava in oven mitts. Nobody asks.',hi:['Oh, you poor ship! Come here, let me fix your little dents.','It is a bit warm in here. I am a bit on fire. It is fine!']},
  ],
  /* 2 Dunemoor · Bureau Nine · Zk'tharri */ [
    {k:'depot',name:'Form 27-B Cargo Office',sp:'zkthar',title:'Senior Clerk of Crates',quirk:'Will stamp anything. Has stamped a sandwich.',hi:['Take a number. Your number is 4,112. Now serving: 4,111.','Contracts must be accepted in triplicate. One copy is eaten.']},
    {k:'livery',name:'Department of Approved Colours',sp:'zkthar',title:'Colour Compliance Officer',quirk:'Has opinions about beige. They are all positive.',hi:['Paint jobs require Form 88-C. Beige is pre-approved. Joy!','Colour is regulated for your safety. And for my happiness.'],paints:['beige','hazard','midnight','stripe']},
    {k:'bar',name:'The Rubber Stamp',sp:'zkthar',title:'Bartender',quirk:'Serves every drink in triplicate.',hi:['Welcome. Please fill in your drink order. Then the drink order for the drink order.','Today\'s special: three glasses of the same thing.']},
  ],
  /* 3 Sloshwell · Ladle Harbor · Blorpax */ [
    {k:'depot',name:'Ladle Harbor Freight',sp:'blorpax',title:'Harbormaster',quirk:'Measures everything in ladles. Your ship is 900 ladles long.',hi:['Hello! Welcome! Your cargo is safe with us! Mostly! Ish!','Wonderful ship! About nine hundred ladles, I would say.']},
    {k:'yard',name:'Big Bowl Boatworks',sp:'blorpax',title:'Shipwright',quirk:'Builds ships the way you make soup: everything in, then stir.',hi:['Every ship is stirred clockwise for luck!','We have ships! Big ones! One of them is mostly broth!'],ships:[1,3]},
    {k:'assay',name:'The Crouton Exchange',sp:'blorpax',title:'Ore buyer',quirk:'Mistakes rocks for croutons about one time in three.',hi:['Ooh, crunchy! Are these for selling or for soup?','I buy ore! And croutons! I cannot always tell which.']},
    {k:'bar',name:'The Bottomless Bowl',sp:'blorpax',title:'Soup sommelier',quirk:'Recommends a soup for every mood. Your mood is "chowder".',hi:['Sit, sit! Have a soup! Have two soups!','The soup of the day is soup. It is always soup.']},
  ],
  /* 4 Amethyne · Bargain Roost · Qeeble */ [
    {k:'depot',name:'Bargain Roost Cargo Perch',sp:'qeeble',title:'Perch master',quirk:'Haggles over everything, including your name.',hi:['Contracts! Fresh contracts! Two for the price of three!','Your name is long. I will give you a discount on a shorter one.']},
    {k:'yard',name:'Wing & Prayer Motors',sp:'qeeble',title:'Sales manager',quirk:'Has a one-day-only sale. It has been one day for six years.',hi:['One day only! Every ship must go! Including mine!','Today only, every ship comes with a free cup holder. Ask me where.'],ships:[0,1,2,3,4]},
    {k:'livery',name:'Plumage Paint & Polish',sp:'qeeble',title:'Feather stylist',quirk:'Repaints their own feathers to match each customer.',hi:['Ooh, your ship has a face for flames. Or plum. Or both!','Pick a colour. I will match it. Look, I already did.'],paints:['flames','plum','tangerine','mint','pearl']},
    {k:'outfit',name:'Shiny Things Emporium',sp:'qeeble',title:'Collector of shiny things',quirk:'Keeps the shiniest things. Sells the slightly less shiny ones.',hi:['Everything here is shiny! Some of it is also useful!','This one is very shiny. That one is shinier. Not for sale.'],items:['laser','hidden']},
  ],
  /* 5 Toxibloom · Mellow Hollow · Sporrin */ [
    {k:'depot',name:'Mellow Hollow Depot',sp:'sporrin',title:'Depot keeper',quirk:'Has never been in a hurry. Will not start now.',hi:['Oh. Hello. Cargo is... around. Somewhere. Take your time.','No rush, friend. The crates are not going anywhere. Literally.']},
    {k:'garage',name:'Spore & Bolt',sp:'sporrin',title:'Mechanic',quirk:'Fixes things very slowly, but they stay fixed.',hi:['Your ship looks tired. Mine too. Let\'s both have a little rest.','I will fix it. Eventually. Fixedly.']},
    {k:'bar',name:'The Damp Log',sp:'sporrin',title:'Bartender',quirk:'Grows the drinks. Do not ask how.',hi:['Welcome to The Damp Log. It is damp. And a log.','The house drink is grown fresh. Please do not watch it grow.']},
  ],
  /* 6 Candara · Port Lament · Vrell */ [
    {k:'depot',name:'Port Lament Cargo Dock',sp:'vrell',title:'Dockmaster',quirk:'Sighs before every sentence. Sometimes instead of one.',hi:['*sigh* Another hauler. Another crate. Another day.','The contracts are over there. Like everything, they will pass.']},
    {k:'outfit',name:'Nothing To See Here Supplies',sp:'vrell',title:'Proprietor',quirk:'Sells false floors. Their shop has three.',hi:['We sell nothing. Especially not compartments. Hidden ones.','You were never here. That will be 2,500 credits.'],items:['hidden']},
    {k:'assay',name:'The Sunken Scale',sp:'grondar',title:'Assayer',quirk:'Moved here for the gloom. Loves it.',hi:['Ore? Good. Gloom? Even better. Both? Perfect.','Rocks are like me. Heavy. Grey. Secretly valuable.']},
    {k:'bar',name:'The Sunk Cost',sp:'vrell',title:'Bartender',quirk:'Has been closing for good since the day it opened.',hi:['We are closing forever. Tonight. Like every night.','Drink up. Nothing lasts. Except this bar, apparently.']},
  ],
  /* 7 Jovexa · The Drift · Ooloo */ [
    {k:'depot',name:'Drift Cargo Bubble',sp:'ooloo',title:'Cargo floater',quirk:'Drifts off mid-sentence. Drifts back with the answer.',hi:['Contracts drift in, contracts drift out. Take one as it passes.','Hello... oh, sorry, I floated. Hello again!']},
    {k:'yard',name:'Current Affairs Shipwrights',sp:'ooloo',title:'Shipwright',quirk:'Only sells ships that "feel right". Ask how a ship feels.',hi:['This ship feels calm. That one feels like Tuesday.','Every ship has a mood. Find one that matches yours.'],ships:[2,3,4]},
    {k:'livery',name:'Shimmer & Shine',sp:'ooloo',title:'Glow artist',quirk:'Glows a different colour depending on how much they like your ship.',hi:['Ooh, I am glowing pink. That means I like your ship. Mostly.','Let\'s give it a shimmer. Everything deserves a shimmer.'],paints:['pearl','mint','midnight','plum']},
    {k:'garage',name:'Gentle Repairs',sp:'ooloo',title:'Hull whisperer',quirk:'Repairs dents by hugging them out.',hi:['Shh, little ship. Let me hug the dents away.','Repairs are mostly listening. And a few bolts.']},
  ],
  /* 8 Brrrindle · Fort Snuggle · Momwump */ [
    {k:'depot',name:'Fort Snuggle Cargo Hut',sp:'momwump',title:'Cargo cuddler',quirk:'Wraps every crate in a tiny scarf.',hi:['Welcome in from the cold! Every crate gets a scarf!','Your crates look chilly. I will knit them something.']},
    {k:'garage',name:'Warm Wrench Garage',sp:'momwump',title:'Mechanic',quirk:'Knitted a cosy for your engine. It is on fire now. That is fine.',hi:['Let\'s get you warm and fixed! In that order!','I made your engine a jumper. Do not run it hot.']},
    {k:'assay',name:'Snowball Assay',sp:'momwump',title:'Ore hugger',quirk:'Checks ore by cuddling it. Hard ones are worth more.',hi:['Bring me rocks! I will give them a squeeze and a price.','Ooh, this one is cold and hard. Lovely. Worth a lot.']},
    {k:'bar',name:'The Warm Mitten',sp:'momwump',title:'Cocoa keeper',quirk:'Gives free hot cocoa to anyone who looks cold. Everyone looks cold.',hi:['You look cold. Have a cocoa. You still look cold. Have another.','Sit by the fire. It is a picture of a fire. It still helps.']},
  ],
];
const VENUE_GAG = {depot:'stack', yard:'crane', garage:'engine', livery:'spray', outfit:'gadget', assay:'rock', bar:'juggle'};

/* ---------- little 3D people ---------- */
const Folk = (() => {
  /* Toy-like characters: soft glossy bodies, big eyes with coloured irises and a catchlight, eyelids that blink,
     brows and a mouth that change with mood, small round hands and feet. Everything is built from smooth primitives. */
  const eyeW=new THREE.MeshPhysicalMaterial({color:C('#fbfbf6'),roughness:0.18,clearcoat:1,clearcoatRoughness:0.08}), pupil=new THREE.MeshPhysicalMaterial({color:C('#0b0b10'),roughness:0.1,clearcoat:1,clearcoatRoughness:0.05});
  const catchM=new THREE.MeshBasicMaterial({color:HDR('#ffffff',1.6)}), mouthM=new THREE.MeshStandardMaterial({color:C('#3a1420'),roughness:0.6}), tongueM=new THREE.MeshStandardMaterial({color:C('#ff7a8a'),roughness:0.5});
  const blushM=new THREE.MeshBasicMaterial({color:C('#ff6f91'),transparent:true,opacity:0.28,depthWrite:false});
  const IRIS=['#3fa7ff','#2fcf8a','#ffb020','#a070ff','#ff6a8a','#25c2c9','#8a5a2b'];
  const irisMats={}; const irisMat=c=>irisMats[c]||(irisMats[c]=new THREE.MeshPhysicalMaterial({color:C(c),roughness:0.25,clearcoat:1,clearcoatRoughness:0.05,emissive:C(c),emissiveIntensity:0.12}));
  const sph=(r,m,x=0,y=0,z=0,ws=32,hs=24)=>{ const o=new THREE.Mesh(new THREE.SphereGeometry(r,ws,hs),m); o.position.set(x,y,z); return o; };
  const cyl=(r1,r2,h,m,x=0,y=0,z=0,seg=20)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m); o.position.set(x,y,z); return o; };
  const bx=(w,h,d,m,x=0,y=0,z=0)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); return o; };
  /* rounded box for the robots */
  function rbox(w,h,d,r,m,x=0,y=0,z=0){ const s=new THREE.Shape(), a=w/2-r, b=h/2-r; s.moveTo(-a,-h/2); s.lineTo(a,-h/2); s.quadraticCurveTo(w/2,-h/2,w/2,-b); s.lineTo(w/2,b); s.quadraticCurveTo(w/2,h/2,a,h/2); s.lineTo(-a,h/2); s.quadraticCurveTo(-w/2,h/2,-w/2,b); s.lineTo(-w/2,-b); s.quadraticCurveTo(-w/2,-h/2,-a,-h/2);
    const g=new THREE.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r*0.9,bevelSegments:4,curveSegments:6}); g.translate(0,0,-(d-2*r)/2); const o=new THREE.Mesh(g,m); o.position.set(x,y,z); return o; }

  /* a big glossy eye: ball, iris and pupil on a pivot that can look around, a catchlight, and an upper lid that blinks */
  function eye(parent,U,x,y,z,r,lidMat,iris){ const g=new THREE.Group(); g.position.set(x,y,z); parent.add(g); g.add(sph(r,eyeW));
    const look=new THREE.Group(); g.add(look); const ir=sph(r*0.62,irisMat(iris),0,0,r*0.74,28,20); ir.scale.z=0.42; look.add(ir); const pp=sph(r*0.32,pupil,0,0,r*0.93,20,14); pp.scale.z=0.4; look.add(pp);
    g.add(sph(r*0.15,catchM,-r*0.26,r*0.3,r*1.02,12,8)); g.add(sph(r*0.07,catchM,r*0.24,-r*0.16,r*1.05,8,6));
    const lid=new THREE.Mesh(new THREE.SphereGeometry(r*1.09,30,14,0,Math.PI*2,0,Math.PI/2),lidMat||U.body); const lp=new THREE.Group(); lp.add(lid); g.add(lp);
    U.lids.push(lp); U.looks.push(look); return g; }
  function brow(parent,U,x,y,z,len,th,m,side){ const b=new THREE.Group(); b.position.set(x,y,z); const c=cyl(th,th,len,m,0,0,0,10); c.rotation.z=Math.PI/2; b.add(c); b.add(sph(th,m,-len/2,0,0,10,8)); b.add(sph(th,m,len/2,0,0,10,8)); parent.add(b); U.brows.push({b,side,y}); return b; }
  /* mouth: an arc that smiles or frowns, plus an open "o" for surprise */
  function mouth(parent,U,x,y,z,s,glow){ const g=new THREE.Group(); g.position.set(x,y,z); parent.add(g); const m=glow||mouthM;
    const arc=new THREE.Mesh(new THREE.TorusGeometry(0.1*s,0.022*s,10,24,Math.PI),m); arc.rotation.z=Math.PI; g.add(arc);
    const o=sph(0.06*s,m,0,-0.02*s,0,16,12); o.scale.set(0.9,1.15,0.5); g.add(o); if(!glow){ const tg=sph(0.035*s,tongueM,0,-0.06*s,0.01*s,12,8); tg.scale.z=0.4; o.add(tg); }
    U.mouth={g,arc,o,s}; return g; }
  function blush(parent,x,y,z,r){ for(const sx of [-1,1]){ const b=sph(r,blushM,sx*x,y,z,16,10); b.scale.set(1,0.6,0.35); parent.add(b); } }
  function limb(parent,x,y,z,len,r,m,hand,foot){ const p=new THREE.Group(); p.position.set(x,y,z); p.add(cyl(r,r*0.85,len,m,0,-len/2,0,14)); p.add(sph(r,m,0,0,0,14,10));
    if(hand) p.add(sph(r*1.45,hand,0,-len,0,20,14)); if(foot){ const f=sph(r*1.55,foot,0,-len,r*0.7,20,14); f.scale.set(1,0.55,1.45); p.add(f); } p.userData.len=len; parent.add(p); return p; }
  const phys=(hex,o)=>new THREE.MeshPhysicalMaterial(Object.assign({color:C(hex),roughness:0.42,metalness:0,clearcoat:0.45,clearcoatRoughness:0.35},o||{}));

  function make(sp, seed, scale=1){
    const S=SPECIES[sp], r=mulberry32((seed|0)+11), hue=Math.round(S.hue+(r()-0.5)*26), K=S.kind;
    const hsl=(l,sa)=>`hsl(${hue},${sa==null?S.sat:sa}%,${Math.round(Math.min(92,l))}%)`;
    const body=K==='rock'?new THREE.MeshStandardMaterial({color:C(hsl(S.lit)),roughness:0.85,flatShading:true}):K==='robot'?phys(hsl(S.lit),{roughness:0.3,metalness:0.55,clearcoat:0.8,clearcoatRoughness:0.15})
      :K==='fluffy'?new THREE.MeshPhysicalMaterial({color:C(hsl(S.lit)),roughness:0.95,sheen:C(hsl(Math.min(95,S.lit+18))),clearcoat:0}):phys(hsl(S.lit));
    if(K==='jelly'){ body.transparent=true; body.opacity=0.8; body.clearcoat=1; body.clearcoatRoughness=0.05; body.roughness=0.15; }
    const dark=phys(hsl(S.lit*0.55),{clearcoat:0.2}), light=phys(hsl(Math.min(92,S.lit*1.28)),{clearcoat:0.3}), browM=new THREE.MeshStandardMaterial({color:C(hsl(S.lit*0.32,Math.min(60,S.sat))),roughness:0.7});
    const F=new THREE.Group(), rig=new THREE.Group(); F.add(rig); const head=new THREE.Group(); rig.add(head);
    const U={rig,head,eyes:[],lids:[],looks:[],brows:[],mouth:null,legs:[],arms:[],tent:[],body,dark,light,base:null,kind:K,sp,hand:null,ph:r()*10,mood:'neutral',moodK:0,lidOpen:-1.0,headY:0};
    const iris=IRIS[Math.floor(r()*IRIS.length)];
    switch(K){
      case 'blob': { const b=sph(0.62,body,0,0.7,0); b.scale.set(1,1.18,1); rig.add(b); head.position.y=0.75;
        eye(head,U,-0.21,0.22,0.47,0.17,null,iris); eye(head,U,0.21,0.22,0.47,0.17,null,iris); eye(head,U,0,0.55,0.38,0.12,null,iris);
        brow(head,U,-0.21,0.43,0.5,0.17,0.028,browM,-1); brow(head,U,0.21,0.43,0.5,0.17,0.028,browM,1); mouth(head,U,0,-0.06,0.6,1.2); blush(head,0.38,0.02,0.52,0.1);
        U.arms=[limb(rig,-0.58,0.85,0,0.42,0.075,body,body),limb(rig,0.58,0.85,0,0.42,0.075,body,body)]; break; }
      case 'insect': { const th=sph(0.32,body,0,0.8,0); th.scale.set(0.9,1.15,0.85); rig.add(th); rig.add(sph(0.3,dark,0,1.12,-0.02)); head.position.y=1.44; const h=sph(0.32,body); h.scale.set(1.05,1.05,1); head.add(h);
        const gl=phys('#141018',{roughness:0.1,clearcoat:1,clearcoatRoughness:0.03});
        for(const s of [-1,1]){ const e=sph(0.16,gl,s*0.17,0.06,0.2); e.scale.set(1,1.3,0.75); e.userData.sy=1.3; head.add(e); U.eyes.push(e); head.add(sph(0.035,catchM,s*0.13,0.14,0.32,8,6));
          const a=cyl(0.016,0.016,0.5,dark,s*0.12,0.42,0,8); a.rotation.z=-s*0.5; head.add(a); head.add(sph(0.055,light,s*0.25,0.64,0)); brow(head,U,s*0.17,0.3,0.24,0.14,0.022,browM,s); }
        mouth(head,U,0,-0.14,0.29,0.9);
        U.legs=[limb(rig,-0.15,0.46,0,0.44,0.055,dark,null,dark),limb(rig,0.15,0.46,0,0.44,0.055,dark,null,dark)]; U.arms=[limb(rig,-0.3,1.12,0,0.52,0.045,dark,light),limb(rig,0.3,1.12,0,0.52,0.045,dark,light)]; break; }
      case 'fluffy': { body.sheen=C(hsl(Math.min(90,S.lit+6))); body.color=C(hsl(S.lit-10,S.sat+10)); rig.add(sph(0.6,body,0,0.74,0));
        // tufts all over except the face
        for(let i=0,n=0;n<20&&i<200;i++){ const a=r()*6.28, e=r()*2.4+0.3, x=Math.cos(a)*Math.sin(e)*0.56, y=0.74+Math.cos(e)*0.56, z=Math.sin(a)*Math.sin(e)*0.56; if(z>0.18&&Math.abs(x)<0.42&&y>0.45&&y<1.15) continue; rig.add(sph(0.16+r()*0.06,body,x,y,z,14,10)); n++; }
        head.position.y=0.8; const pink=phys('#ff9ac8'); for(const s of [-1,1]){ head.add(sph(0.18,light,s*0.38,0.5,0)); const ie=sph(0.1,pink,s*0.38,0.5,0.1); ie.scale.z=0.5; head.add(ie); }
        eye(head,U,-0.2,0.1,0.5,0.17,null,iris); eye(head,U,0.2,0.1,0.5,0.17,null,iris); brow(head,U,-0.2,0.31,0.52,0.15,0.03,browM,-1); brow(head,U,0.2,0.31,0.52,0.15,0.03,browM,1);
        head.add(sph(0.055,phys('#2a1a22',{clearcoat:1}),0,-0.07,0.6,12,8)); mouth(head,U,0,-0.19,0.56,1); blush(head,0.34,-0.08,0.5,0.1);
        U.legs=[limb(rig,-0.25,0.24,0,0.2,0.12,body,null,light),limb(rig,0.25,0.24,0,0.2,0.12,body,null,light)]; U.arms=[limb(rig,-0.58,0.82,0,0.36,0.1,body,body),limb(rig,0.58,0.82,0,0.36,0.1,body,body)]; break; }
      case 'squid': { head.position.y=1.05; const m=sph(0.48,body,0,0.25,0); m.scale.set(1,1.35,1); head.add(m); eye(head,U,-0.18,0.1,0.38,0.16,dark,iris); eye(head,U,0.18,0.1,0.38,0.16,dark,iris);
        brow(head,U,-0.18,0.3,0.42,0.14,0.024,browM,-1); brow(head,U,0.18,0.3,0.42,0.14,0.024,browM,1); mouth(head,U,0,-0.13,0.44,0.95); blush(head,0.32,-0.04,0.38,0.08);
        for(let i=0;i<6;i++){ const a=i/6*6.283+0.26, t=limb(rig,Math.cos(a)*0.24,0.82,Math.sin(a)*0.24,0.8,0.07,body,body); t.rotation.set(Math.sin(a)*0.35,0,-Math.cos(a)*0.35); t.userData.a=a; U.tent.push(t); }
        U.arms=[U.tent[3],U.tent[0]]; break; }
      case 'rock': { const b=new THREE.Mesh(new THREE.DodecahedronGeometry(0.62,1),body); b.position.y=0.82; b.scale.set(1,1.15,0.9); rig.add(b); head.position.y=0.9;
        const glow=new THREE.MeshBasicMaterial({color:HDR('#ffb040',3)}); for(const s of [-1,1]){ const e=sph(0.1,glow,s*0.2,0.14,0.5,16,10); e.scale.set(1.3,0.55,0.5); head.add(e); U.eyes.push(e); e.userData.sy=0.55;
          const bw=new THREE.Mesh(new THREE.DodecahedronGeometry(0.09,0),body); bw.scale.set(1.8,0.6,0.8); bw.position.set(s*0.2,0.3,0.5); head.add(bw); U.brows.push({b:bw,side:s,y:0.3}); }
        mouth(head,U,0,-0.14,0.53,1.1,new THREE.MeshBasicMaterial({color:HDR('#ff7a20',2)}));
        U.legs=[limb(rig,-0.26,0.38,0,0.34,0.14,body,null,body),limb(rig,0.26,0.38,0,0.34,0.14,body,null,body)]; U.arms=[limb(rig,-0.64,1.0,0,0.56,0.14,body,body),limb(rig,0.64,1.0,0,0.56,0.14,body,body)]; break; }
      case 'bird': { const b=sph(0.5,body,0,0.78,0); b.scale.set(1,1.12,1); rig.add(b); const bel=sph(0.38,light,0,0.68,0.22); bel.scale.z=0.8; rig.add(bel); head.position.y=1.0;
        eye(head,U,-0.18,0.13,0.33,0.17,null,iris); eye(head,U,0.18,0.13,0.33,0.17,null,iris); brow(head,U,-0.18,0.34,0.38,0.14,0.026,browM,-1); brow(head,U,0.18,0.34,0.38,0.14,0.026,browM,1);
        const bm=phys('#ffb020'), up=new THREE.Mesh(new THREE.ConeGeometry(0.11,0.3,16),bm); up.rotation.x=Math.PI/2; up.position.set(0,-0.03,0.55); up.scale.y=1; head.add(up);
        const lo=new THREE.Group(); lo.position.set(0,-0.08,0.47); const lc=new THREE.Mesh(new THREE.ConeGeometry(0.075,0.2,14),bm); lc.rotation.x=Math.PI/2; lc.position.z=0.08; lo.add(lc); head.add(lo); U.beak=lo; blush(head,0.3,-0.04,0.36,0.08);
        for(let i=-1;i<=1;i++){ const c=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.3,10),dark); c.position.set(i*0.1,0.48,-0.05); c.rotation.z=-i*0.35; head.add(c); }
        const orange=phys('#e0902a'); U.legs=[limb(rig,-0.16,0.32,0,0.32,0.04,orange,null,orange),limb(rig,0.16,0.32,0,0.32,0.04,orange,null,orange)];
        U.arms=[limb(rig,-0.48,0.95,0,0.46,0.1,dark),limb(rig,0.48,0.95,0,0.46,0.1,dark)]; U.arms.forEach(a=>a.children[0].scale.set(1.5,1,0.45)); break; }
      case 'jelly': { const d=new THREE.Mesh(new THREE.SphereGeometry(0.58,36,20,0,Math.PI*2,0,Math.PI/2),body); d.position.y=1.0; rig.add(d); const core=sph(0.2,new THREE.MeshBasicMaterial({color:HDR(hsl(S.lit,90),1.3)}),0,1.12,0,16,12); rig.add(core); head.position.y=1.0;
        eye(head,U,-0.16,0.2,0.46,0.13,null,iris); eye(head,U,0.16,0.2,0.46,0.13,null,iris); brow(head,U,-0.16,0.36,0.47,0.12,0.02,browM,-1); brow(head,U,0.16,0.36,0.47,0.12,0.02,browM,1); mouth(head,U,0,0.05,0.55,0.9);
        for(let i=0;i<8;i++){ const a=i/8*6.283, t=limb(rig,Math.cos(a)*0.4,1.0,Math.sin(a)*0.4,0.95,0.035,light); t.userData.a=a; U.tent.push(t); } U.arms=[U.tent[4],U.tent[0]]; break; }
      case 'shroom': { const cream=phys('#efe2c6'); rig.add(cyl(0.29,0.34,0.92,cream,0,0.46,0,28)); const cap=new THREE.Mesh(new THREE.SphereGeometry(0.66,36,16,0,Math.PI*2,0,Math.PI/2),body); cap.scale.y=0.62; cap.position.y=0.9; rig.add(cap);
        rig.add(cyl(0.66,0.6,0.06,phys(hsl(S.lit*0.8)),0,0.89,0,36));
        for(let i=0;i<8;i++){ const a=r()*6.28, e=0.3+r()*1.0; const dt=sph(0.07+r()*0.05,light,Math.cos(a)*Math.sin(e)*0.64,0.9+Math.cos(e)*0.64*0.62,Math.sin(a)*Math.sin(e)*0.64,14,10); dt.scale.y=0.5; rig.add(dt); }
        head.position.y=0.56; eye(head,U,-0.12,0.1,0.26,0.12,cream,iris); eye(head,U,0.12,0.1,0.26,0.12,cream,iris); brow(head,U,-0.12,0.25,0.3,0.1,0.02,browM,-1); brow(head,U,0.12,0.25,0.3,0.1,0.02,browM,1); mouth(head,U,0,-0.1,0.32,0.75); blush(head,0.21,-0.04,0.28,0.06);
        U.legs=[limb(rig,-0.13,0.12,0,0.1,0.09,cream,null,cream),limb(rig,0.13,0.12,0,0.1,0.09,cream,null,cream)]; U.arms=[limb(rig,-0.34,0.62,0,0.32,0.06,cream,cream),limb(rig,0.34,0.62,0,0.32,0.06,cream,cream)]; break; }
      default: { rig.add(rbox(0.78,0.82,0.58,0.12,body,0,0.88,0)); rig.add(rbox(0.3,0.16,0.04,0.02,new THREE.MeshBasicMaterial({color:HDR('#5fffd0',1.4)}),0.14,0.76,0.3)); head.position.y=1.52;
        head.add(rbox(0.66,0.5,0.52,0.12,body)); const scr=rbox(0.52,0.34,0.04,0.06,phys('#0c1418',{roughness:0.1,clearcoat:1}),0,0,0.27); head.add(scr);
        const g=new THREE.MeshBasicMaterial({color:HDR('#5fffd0',2.6)}); for(const s of [-1,1]){ const e=sph(0.06,g,s*0.12,0.04,0.3,14,10); e.scale.set(1,1.2,0.3); e.userData.sy=1.2; head.add(e); U.eyes.push(e);
          const bw=bx(0.1,0.022,0.01,g); bw.position.set(s*0.12,0.13,0.3); head.add(bw); U.brows.push({b:bw,side:s,y:0.13}); }
        mouth(head,U,0,-0.09,0.3,0.8,g);
        head.add(cyl(0.015,0.015,0.3,dark,0,0.37,0,8)); head.add(sph(0.05,new THREE.MeshBasicMaterial({color:HDR('#ff4040',3)}),0,0.54,0,12,8));
        const alu=phys('#b9bdc4',{roughness:0.25,metalness:0.85,clearcoat:0.5}); U.legs=[limb(rig,-0.2,0.48,0,0.46,0.07,alu,null,body),limb(rig,0.2,0.48,0,0.46,0.07,alu,null,body)]; U.arms=[limb(rig,-0.46,1.18,0,0.52,0.06,alu,alu),limb(rig,0.46,1.18,0,0.52,0.06,alu,alu)]; }
    }
    U.base=body.color.clone(); U.headY=head.position.y; F.scale.setScalar(scale); F.userData=U; F.traverse(o=>{ if(o.isMesh&&!o.material.isMeshBasicMaterial) o.castShadow=true; }); mood(F,'neutral'); return F;
  }
  /* attach a prop to the end of the right arm */
  function hold(F, obj, side=1){ const a=F.userData.arms[side]; if(!a) return obj; obj.position.y=-(a.userData.len||0.4); a.add(obj); return obj; }
  /* expressions: neutral, happy, sad, shock, worried */
  function mood(F, m){ const U=F.userData; U.mood=m||'neutral'; const M=U.mouth;
    const P={neutral:{mo:0.55,o:0,bz:0,by:0,lid:-1.0},happy:{mo:1.2,o:0,bz:-0.12,by:0.03,lid:-0.85},sad:{mo:-0.9,o:0,bz:0.32,by:0.0,lid:-0.62},shock:{mo:0,o:1,bz:-0.05,by:0.08,lid:-1.45},worried:{mo:-0.45,o:0,bz:0.38,by:0.03,lid:-0.8}}[U.mood]||{};
    U.lidOpen=P.lid; for(const l of U.lids) l.rotation.x=P.lid;
    if(M){ M.arc.visible=!P.o; M.o.visible=!!P.o; const k=P.mo; M.arc.rotation.z=k>=0?Math.PI:0; M.arc.scale.set(0.6+Math.abs(k)*0.55,0.4+Math.abs(k)*0.6,1); M.arc.position.y=k>=0?0:-0.06*M.s; }
    for(const b of U.brows){ b.b.rotation.z=b.side*P.bz; b.b.position.y=b.y+P.by; }
    if(U.beak) U.beak.rotation.x=P.o?0.45:P.mo>1?0.2:0; }
  function blink(F, t){ const U=F.userData, ph=(t+U.ph)%4.3, cl=ph<0.14?Math.sin(ph/0.14*Math.PI):0;
    for(const e of U.eyes) e.scale.y=(1-cl*0.88)*(e.userData.sy||1);
    for(const l of U.lids) l.rotation.x=lerp(U.lidOpen,Math.PI/2+0.05,cl);
    // eyes dart about now and then, like they are thinking
    const n=Math.floor((t+U.ph)/1.7), lx=Math.sin(n*12.9898+U.ph)*0.35, ly=Math.sin(n*78.233+U.ph)*0.18; for(const L of U.looks){ L.rotation.y=lerp(L.rotation.y,lx,0.15); L.rotation.x=lerp(L.rotation.x,ly,0.15); }
    U.head.position.y=U.headY+Math.sin(t*2.1+U.ph)*0.012;
    for(const tn of U.tent){ if(U.arms.includes(tn)) continue; tn.rotation.x=Math.sin(tn.userData.a)*0.35+Math.sin(t*2.2+tn.userData.a*3)*0.12; } }
  function walk(F, ph, amt){ const U=F.userData, s=Math.sin(ph)*amt; if(U.legs[0]){ U.legs[0].rotation.x=s*0.7; U.legs[1].rotation.x=-s*0.7; } if(U.arms[0]){ U.arms[0].rotation.x=-s*0.5; U.arms[1].rotation.x=s*0.5; }
    U.rig.position.y=Math.abs(Math.sin(ph))*0.07*amt; U.rig.rotation.z=Math.sin(ph)*0.05*amt; }
  function rest(F){ const U=F.userData; U.rig.position.set(0,0,0); U.rig.rotation.set(0,0,0); U.rig.scale.set(1,1,1); U.head.rotation.set(0,0,0);
    for(const l of U.legs) l.rotation.set(0,0,0); for(const a of U.arms) a.rotation.set(0,0,0); U.body.color.copy(U.base); mood(F,'neutral'); }
  /* arm pose: [forward, outward] in radians, per side */
  function arms(F, l, r){ const A=F.userData.arms; if(!A[0]) return; if(l){ A[0].rotation.x=-l[0]; A[0].rotation.z=-l[1]; } if(r){ A[1].rotation.x=-r[0]; A[1].rotation.z=r[1]; } }
  return {make, hold, blink, walk, rest, arms, mood, sph, cyl, bx, rbox};
})();

/* ---------- the sets ---------- */
const Venues = (() => {
  const {sph,cyl,bx}=Folk;
  const M=(hex,r=0.7,m=0.1,ex)=>new THREE.MeshStandardMaterial(Object.assign({color:C(hex),roughness:r,metalness:m},ex||{}));
  const PAL={ depot:['#6b5a44','#a8743f','#e2c07a','#3d6f8e','#f2c14e'], yard:['#4b5058','#5d6670','#c9ccd4','#e0b000','#2a2f36'], garage:['#3e4248','#6a4632','#d0d4da','#c0392b','#ecf0f1'],
    livery:['#d9d4ce','#5c7cfa','#f2f2f2','#ff6b6b','#ffd43b'], outfit:['#3b3547','#7048e8','#e5dbff','#20c997','#fcc419'], assay:['#5a4a3c','#7c5c3c','#d8c3a5','#e8590c','#495057'], bar:['#3a2418','#7a4a2a','#d9a066','#c2255c','#fab005'] };
  const P_=(t,a,b)=>clamp((t-a)/(b-a),0,1), E=x=>x*x*(3-2*x);

  function signTex(text, bg, fg){ const cv=makeCanvas(1024,240), x=cv.getContext('2d'); x.fillStyle=bg; x.fillRect(0,0,1024,240); x.strokeStyle=fg; x.lineWidth=10; x.strokeRect(14,14,996,212);
    x.fillStyle=fg; x.textAlign='center'; x.textBaseline='middle'; let fs=120; do{ x.font=`700 ${fs}px ${FONT_DISP}`; fs-=6; }while(x.measureText(text.toUpperCase()).width>940&&fs>40); x.fillText(text.toUpperCase(),512,126); return canvasTex(cv); }
  function stripeTex(a,b){ const cv=makeCanvas(256,32), x=cv.getContext('2d'); for(let i=0;i<8;i++){ x.fillStyle=i%2?a:b; x.fillRect(i*32,0,32,32); } return canvasTex(cv); }

  /* shared bits every set has: floor, counter, posts, sign, awning, lamp */
  function shell(V, pal){
    const R=V.root, def=V.def;
    R.add(bx(13,0.2,11,M(pal[0],0.9,0.05),0,-0.1,-2));
    R.add(bx(4.4,1.0,0.8,M(pal[1],0.65,0.1),0,0.5,0)); R.add(bx(4.7,0.1,1.0,M(pal[2],0.4,0.2),0,1.05,0)); R.add(bx(4.42,0.12,0.82,M(pal[3],0.5,0.2),0,0.2,0));
    // the shop's name hangs on a frame at the back, above the crew, so nothing blocks the view past the counter
    for(const sx of [-1,1]) R.add(cyl(0.1,0.1,6.4,M('#555a60',0.45,0.7),sx*3.0,3.2,-7.35,8));
    R.add(bx(6.2,1.4,0.18,M('#20242a',0.5,0.4),0,5.7,-7.35));
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(6.0,1.3),new THREE.MeshStandardMaterial({map:signTex(def.name,'#10161c',pal[4]),emissive:C('#ffffff'),emissiveIntensity:0.35,roughness:0.6})); sg.material.emissiveMap=sg.material.map; sg.position.set(0,5.7,-7.25); R.add(sg);
    const skirt=new THREE.Mesh(new THREE.PlaneGeometry(4.4,0.5),new THREE.MeshStandardMaterial({map:stripeTex(pal[3],'#f4efe4'),roughness:0.8})); skirt.position.set(0,0.75,0.41); R.add(skirt);
    
    const L=new THREE.PointLight(C('#ffe2b8'),1.1,18,1.6); L.position.set(0,2.9,2.2); R.add(L);
    for(let i=0;i<3;i++){ const c=bx(0.6,0.6,0.6,M(['#b07a3a','#9c6a30','#c48a48'][i],0.8,0.02),-5.6+i*0.15,0.3+i*0.6,1.2+(i%2)*0.1); c.rotation.y=i*0.3; R.add(c); }
  }

  /* back-of-set scenery and props for each kind; returns the props its gag needs */
  const SETS = {
    depot(V,pal){ const R=V.root; for(const sx of [-1,1]){ R.add(cyl(0.12,0.12,4.6,M('#6a6f76',0.5,0.6),sx*5.8,2.3,-6.6,8)); R.add(cyl(0.12,0.12,4.6,M('#6a6f76',0.5,0.6),sx*5.8,2.3,-1.6,8)); }
      for(const [x,z,n] of [[-5,-5.6,3],[5.1,-5.2,2],[-4.6,-6.4,2]]) for(let i=0;i<n;i++) R.add(bx(0.7,0.7,0.7,M(['#a8743f','#8c5f2f','#bb8547'][i%3],0.8,0.02),x+(i%2)*0.1,0.35+i*0.7,z));
      return {crates:[0,1,2,3].map(i=>{ const c=new THREE.Group(); c.add(bx(0.62,0.62,0.62,M(['#b07a3a','#c98d47','#9c6a30','#d39b55'][i],0.8,0.02))); c.add(bx(0.64,0.1,0.64,M('#e8d9a8',0.7,0))); V.root.add(c); return c; })}; },
    yard(V,pal){ const R=V.root, steel=M(pal[3],0.45,0.6); for(const sx of [-1,1]){ R.add(bx(0.4,7,0.4,steel,sx*4.8,3.5,-4.6)); R.add(bx(0.9,0.2,0.9,M('#333',0.6,0.4),sx*4.8,0.1,-4.6)); }
      R.add(bx(10,0.45,0.5,steel,0,7.1,-4.6)); const tro=new THREE.Group(); tro.add(bx(0.8,0.4,0.8,M('#2a2f36',0.5,0.5))); tro.position.set(-3.6,6.7,-4.6); R.add(tro);
      const cable=cyl(0.025,0.025,1,M('#222',0.5,0.6),0,0,0,6); cable.geometry.translate(0,-0.5,0); tro.add(cable); const hook=new THREE.Group(); hook.add(bx(0.3,0.25,0.3,M('#e0b000',0.4,0.6))); tro.add(hook);
      const pod=new THREE.Group(); const pc=cyl(0.42,0.48,1.7,M('#c9ccd4',0.35,0.7),0,0,0,18); pc.rotation.z=Math.PI/2; pod.add(pc); const nz=cyl(0.32,0.5,0.5,M('#3a3f46',0.5,0.6),1.05,0,0,16); nz.rotation.z=-Math.PI/2; pod.add(nz);
      const ring=cyl(0.5,0.5,0.12,M('#e0b000',0.4,0.5),-0.4,0,0,18); ring.rotation.z=Math.PI/2; pod.add(ring); R.add(pod);
      const hull=new THREE.Group(); hull.add(bx(3.2,0.9,1.5,M('#8a9aa8',0.4,0.6),0,1.05,0)); hull.add(bx(3.24,0.12,1.54,M('#e0b000',0.4,0.5),0,1.45,0)); for(const sx of [-1,1]) hull.add(bx(0.3,0.6,1.2,M('#333',0.6,0.4),sx*1.1,0.3,0)); hull.position.set(1.6,0,-4.6); R.add(hull);
      const torch=new THREE.Group(); torch.add(cyl(0.05,0.05,0.4,M('#555',0.4,0.7),0,-0.15,0.1,6)); const tip=sph(0.05,new THREE.MeshBasicMaterial({color:HDR('#8fd8ff',4)}),0,-0.35,0.12,6,4); torch.add(tip);
      return {tro,cable,hook,pod,torch,tip}; },
    garage(V,pal){ const R=V.root; R.add(bx(12.6,5.2,0.3,M(pal[0],0.85,0.1),0,2.6,-7)); const door=bx(5,3.6,0.1,M('#8a9099',0.5,0.5),0,1.8,-6.8); R.add(door); for(let i=0;i<9;i++) R.add(bx(5,0.05,0.04,M('#5d636b',0.5,0.5),0,0.2+i*0.4,-6.74));
      for(let i=0;i<5;i++) R.add(bx(0.08,0.6+i*0.1,0.06,M(['#c0392b','#d0d4da','#f1c40f','#2980b9','#d0d4da'][i],0.4,0.6),-5+i*0.35,2.6,-6.8));
      const eng=new THREE.Group(); eng.position.set(1.0,0,-4.2); R.add(eng); eng.add(bx(0.5,0.85,0.8,M('#2d3136',0.6,0.5),0,0.42,0)); const core=new THREE.Group(); core.position.y=1.28; eng.add(core);
      const body=cyl(0.5,0.5,1.7,M(pal[3],0.4,0.6),0,0,0,18); body.rotation.z=Math.PI/2; core.add(body); for(const x of [-0.5,0.2]){ const rg=cyl(0.53,0.53,0.1,M('#d0d4da',0.3,0.8),x,0,0,18); rg.rotation.z=Math.PI/2; core.add(rg); }
      const nz=new THREE.Group(); nz.position.x=0.85; core.add(nz); const nc=cyl(0.32,0.5,0.55,M('#3a3f46',0.5,0.6),0.27,0,0,16); nc.rotation.z=-Math.PI/2; nz.add(nc);
      const glowM=new THREE.MeshBasicMaterial({color:HDR('#ff9040',0.3)}), glow=new THREE.Mesh(new THREE.CircleGeometry(0.42,18),glowM); glow.rotation.y=Math.PI/2; glow.position.x=0.56; nz.add(glow);
      const flame=new THREE.Mesh(new THREE.ConeGeometry(0.4,2.2,16,1,true),new THREE.MeshBasicMaterial({color:HDR('#6ab8ff',2),transparent:true,opacity:0.8,blending:THREE.AdditiveBlending,depthWrite:false})); flame.rotation.z=Math.PI/2; flame.position.x=1.65; flame.visible=false; core.add(flame);
      const wrench=bx(0.08,0.08,0.55,M('#cfd3d8',0.3,0.9)); wrench.position.z=0.2; const stick=new THREE.Group(); stick.add(cyl(0.015,0.015,0.9,M('#8a6a3a',0.8,0),0,0,0.45,5)); stick.children[0].rotation.x=Math.PI/2; const mm=sph(0.08,M('#f8f4ec',0.9,0),0,0,0.92,8,6); stick.add(mm);
      return {core,nz,glow,flame,wrench,stick,mm}; },
    livery(V,pal){ const R=V.root; const cv=makeCanvas(512,256), x=cv.getContext('2d'); x.fillStyle=pal[0]; x.fillRect(0,0,512,256); const rr=mulberry32(V.seed);
      for(let i=0;i<40;i++){ x.fillStyle=pick(['#ff6b6b','#5c7cfa','#ffd43b','#51cf66','#cc5de8','#ff922b']); x.globalAlpha=0.7; x.beginPath(); x.arc(rr()*512,rr()*256,4+rr()*22,0,7); x.fill(); } x.globalAlpha=1;
      R.add(bx(12.6,5.2,0.3,M('#ffffff',0.9,0,{map:canvasTex(cv)}),0,2.6,-7));
      for(let i=0;i<6;i++) R.add(cyl(0.18,0.18,0.36,M(['#ff6b6b','#5c7cfa','#ffd43b','#51cf66','#cc5de8','#ff922b'][i],0.4,0.3),-5.2+i*0.42,0.18,-6.3,12));
      const easel=new THREE.Group(); easel.position.set(1.75,0,-4.4); R.add(easel); for(const sx of [-1,1]){ const l=cyl(0.04,0.04,2.2,M('#7a5230',0.8,0),sx*0.9,1.1,-0.2,6); l.rotation.x=0.12; easel.add(l); }
      easel.add(bx(2.4,1.6,0.08,M('#eeeeea',0.7,0.05),0,1.45,0)); const sg=new THREE.PlaneGeometry(1,0.42); sg.translate(0.5,0,0); const stripeM=M('#ff6b6b',0.4,0.2), stripe=new THREE.Mesh(sg,stripeM); stripe.position.set(-1.05,1.45,0.05); easel.add(stripe);
      const gun=new THREE.Group(); gun.add(bx(0.12,0.22,0.12,M('#444',0.5,0.5))); gun.add(cyl(0.03,0.03,0.3,M('#999',0.3,0.8),0,-0.1,0.18,6)); gun.children[1].rotation.x=Math.PI/2;
      const can=cyl(0.14,0.14,0.3,M('#c9ccd4',0.3,0.8),0,-0.12,0.12,12);
      return {easel,stripe,stripeM,gun,can}; },
    outfit(V,pal){ const R=V.root; R.add(bx(12.6,5.2,0.3,M(pal[0],0.85,0.1),0,2.6,-7)); for(let s=0;s<3;s++){ R.add(bx(10,0.1,0.8,M('#6c6478',0.6,0.3),0,1+s*1.3,-6.5)); for(let i=0;i<9;i++) R.add(bx(0.55,0.5+((i*7+s)%3)*0.15,0.5,M(['#7048e8','#20c997','#fcc419','#ff6b6b','#4dabf7'][(i+s)%5],0.5,0.3),-4.4+i*1.1,1.3+s*1.3,-6.5)); }
      const box=new THREE.Group(); box.position.set(0.9,0,-3.9); R.add(box); const qcv=makeCanvas(128,128), qx=qcv.getContext('2d'); qx.fillStyle='#fcc419'; qx.fillRect(0,0,128,128); qx.fillStyle='#2b2140'; qx.font=`700 100px ${FONT_DISP}`; qx.textAlign='center'; qx.textBaseline='middle'; qx.fillText('?',64,70);
      const qm=M('#ffffff',0.6,0.1,{map:canvasTex(qcv)}); box.add(bx(0.8,0.8,0.8,qm,0,0.4,0)); const lidP=new THREE.Group(); lidP.position.set(0,0.8,-0.4); box.add(lidP); const lid=bx(0.86,0.08,0.86,M('#7048e8',0.5,0.3),0,0.04,0.4); lidP.add(lid);
      const spring=new THREE.Group(); spring.position.y=0.8; box.add(spring); for(let i=0;i<6;i++){ const t=new THREE.Mesh(new THREE.TorusGeometry(0.22,0.035,6,18),M('#cfd3d8',0.3,0.9)); t.rotation.x=Math.PI/2; t.position.y=i*0.28; spring.add(t); } spring.scale.y=0.01; spring.visible=false;
      const gadget=new THREE.Mesh(new THREE.OctahedronGeometry(0.28,0),new THREE.MeshBasicMaterial({color:HDR('#63e6be',3)})); gadget.visible=false; box.add(gadget);
      const board=bx(0.36,0.46,0.03,M('#d9c9a3',0.8,0)); board.position.z=0.12; return {box,lidP,lid,spring,gadget,board}; },
    assay(V,pal){ const R=V.root; R.add(bx(12.6,5.2,0.3,M(pal[0],0.9,0.05),0,2.6,-7)); for(const [x,c] of [[-4.6,'#7c6a58'],[-3.2,'#5c5c66'],[4.4,'#8c6040']]){ R.add(bx(1.2,0.8,1,M('#4a3a2c',0.8,0.1),x,0.4,-6.1)); for(let i=0;i<6;i++){ const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(0.2,0),M(c,0.9,0.1,{flatShading:true})); rk.position.set(x+(i%3-1)*0.3,0.95,-6.1+(i>2?0.2:-0.2)); R.add(rk); } }
      const tbl=bx(1.4,0.8,0.9,M('#2f3338',0.5,0.6)); tbl.position.set(1.3,0.4,-4.0); R.add(tbl); const rock=new THREE.Group(); rock.position.set(1.3,1.18,-4.0); R.add(rock); const rm=M('#7a6a5a',0.95,0.05,{flatShading:true});
      const hl=new THREE.Mesh(new THREE.DodecahedronGeometry(0.42,0),rm); hl.scale.set(0.62,1,1); hl.position.x=-0.16; const hr=new THREE.Mesh(new THREE.DodecahedronGeometry(0.42,0),rm); hr.scale.set(0.62,1,1); hr.position.x=0.16; rock.add(hl); rock.add(hr);
      const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.22,0),new THREE.MeshBasicMaterial({color:HDR('#c57bff',3)})); gem.visible=false; rock.add(gem);
      const hammer=new THREE.Group(); hammer.add(cyl(0.04,0.04,0.9,M('#8a6a3a',0.8,0),0,0,0.4,6)); hammer.children[0].rotation.x=Math.PI/2; hammer.add(bx(0.36,0.24,0.24,M('#3a3f46',0.4,0.8),0,0,0.85));
      const glass=new THREE.Group(); glass.add(cyl(0.025,0.025,0.3,M('#333',0.5,0.4),0,0,0.15,6)); glass.children[0].rotation.x=Math.PI/2; const lens=new THREE.Mesh(new THREE.TorusGeometry(0.14,0.025,6,18),M('#d4af37',0.3,0.9)); lens.position.z=0.42; glass.add(lens);
      const stars=new THREE.Group(); for(let i=0;i<3;i++) stars.add(sph(0.07,new THREE.MeshBasicMaterial({color:HDR('#ffe066',3)}),0,0,0,6,4)); stars.visible=false; R.add(stars);
      return {rock,hl,hr,gem,hammer,glass,stars}; },
    bar(V,pal){ const R=V.root; R.add(bx(12.6,5.2,0.3,M(pal[0],0.85,0.05),0,2.6,-7)); for(let s=0;s<2;s++){ R.add(bx(8,0.08,0.5,M(pal[1],0.7,0.05),0,1.8+s*1.0,-6.7)); for(let i=0;i<12;i++){ const c=['#2b8a3e','#a61e4d','#e67700','#1864ab','#5f3dc4'][(i+s*3)%5];
        R.add(cyl(0.1,0.1,0.42,new THREE.MeshStandardMaterial({color:C(c),emissive:C(c),emissiveIntensity:0.35,roughness:0.15,metalness:0.1,transparent:true,opacity:0.85}),-3.6+i*0.65,2.05+s*1.0,-6.6,10)); } }
      const neon=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.06,8,40),new THREE.MeshBasicMaterial({color:HDR(pal[3],3)})); neon.position.set(-3.8,4.0,-6.8); R.add(neon);
      for(const sx of [-1.4,0,1.4]) { R.add(cyl(0.25,0.2,0.08,M(pal[3],0.5,0.2),sx,0.75,1.0,14)); R.add(cyl(0.05,0.05,0.72,M('#777',0.4,0.7),sx,0.36,1.0,6)); }
      const tbl=bx(1.4,0.8,0.7,M(pal[1],0.7,0.05)); tbl.position.set(0.9,0.4,-4.4); R.add(tbl);
      const mugs=[0,1,2].map(i=>{ const g=new THREE.Group(); g.add(cyl(0.13,0.12,0.28,new THREE.MeshStandardMaterial({color:C('#ffb54a'),roughness:0.1,metalness:0.1,transparent:true,opacity:0.85}),0,0,0,12)); g.add(cyl(0.135,0.135,0.06,M('#fffaf0',0.9,0),0,0.16,0,12));
        const h=new THREE.Mesh(new THREE.TorusGeometry(0.07,0.02,6,12,Math.PI),M('#fff4d6',0.3,0.1)); h.position.x=0.14; h.rotation.z=-Math.PI/2; g.add(h); R.add(g); return g; });
      return {mugs}; },
  };

  /* ---------- the neighbourhood around each shop, so every place looks like somewhere different ---------- */
  const glow=(hex,k)=>new THREE.MeshBasicMaterial({color:HDR(hex,k)});
  function splatTex(base, rr){ const cv=makeCanvas(512,256), x=cv.getContext('2d'); x.fillStyle=base; x.fillRect(0,0,512,256);
    for(let i=0;i<70;i++){ x.fillStyle=pick(['#ff6b6b','#5c7cfa','#ffd43b','#51cf66','#cc5de8','#ff922b','#ffffff']); x.globalAlpha=0.75; x.beginPath(); x.arc(rr()*512,rr()*256,6+rr()*30,0,7); x.fill();
      x.fillRect(rr()*512,rr()*256,4+rr()*8,20+rr()*70); } x.globalAlpha=1; return canvasTex(cv); }
  const DISTRICT = {
    depot(R,pal,rr){ for(const [x,z,w,h,d,ry] of [[-21,-27,22,11,15,0.12],[18,-31,26,13,16,-0.15]]){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=ry; R.add(g);
        g.add(bx(w,h,d,M('#8d8676',0.85,0.15),0,h/2,0)); g.add(bx(w+1,0.8,d+1,M('#4f565e',0.5,0.6),0,h+0.4,0)); g.add(bx(w*0.42,h*0.62,0.25,M('#c9a227',0.5,0.4),0,h*0.31,d/2+0.1));
        for(let i=0;i<8;i++) g.add(bx(w*0.42,0.08,0.06,M('#8f7418',0.5,0.4),0,0.5+i*h*0.075,d/2+0.25)); g.add(bx(w*0.9,0.5,0.1,glow('#ffd9a0',1.6),0,h-1.2,d/2+0.06)); }
      for(const [x,z,ry] of [[-15,-9,0.3],[15,-11,-0.2],[-25,-6,1.4]]) for(let i=0;i<3;i++){ const c=bx(6,2.6,2.6,M(pick(['#c0392b','#2e86c1','#27ae60','#e67e22','#7d3c98','#d4ac0d']),0.6,0.4),x+(rr()-0.5)*0.6,1.3+i*2.6,z); c.rotation.y=ry+(rr()-0.5)*0.15; R.add(c); }
      R.add(cyl(0.3,0.4,16,M('#6a6f76',0.5,0.6),10,8,-16,8)); R.add(bx(2.2,1,1,glow('#fff2d0',2.4),10,16.3,-16)); },
    yard(R,pal,rr,V){ const arch=new THREE.Mesh(new THREE.CylinderGeometry(15,15,28,28,1,true,Math.PI/2,Math.PI),M('#9aa3ad',0.45,0.6,{side:THREE.DoubleSide})); arch.rotation.x=Math.PI/2; arch.position.set(-4,0,-36); R.add(arch);
      const back=new THREE.Mesh(new THREE.CircleGeometry(15,28,0,Math.PI),M('#4b5058',0.7,0.4)); back.position.set(-4,0,-49.8); R.add(back); for(let i=0;i<7;i++){ const rib=new THREE.Mesh(new THREE.TorusGeometry(15.1,0.25,6,28,Math.PI),M(pal[3],0.4,0.6)); rib.position.set(-4,0,-22.5-i*4.5); R.add(rib); }
      R.add(bx(22,0.4,0.4,glow('#d0e8ff',2),-4,13.6,-22.4));
      // showroom pad where previewed ships are parked
      const S=V.show=new V3(54,0,-18); const sp=new THREE.Mesh(new THREE.CylinderGeometry(36,38,60,48),[M('#3a3d42',0.7,0.4),M('#55595f',0.6,0.3),M('#3a3d42',0.7,0.4)]); sp.position.set(S.x,-30.2,S.z); sp.receiveShadow=true; R.add(sp);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(31,0.5,6,64),glow(pal[3],2.2)); ring.rotation.x=Math.PI/2; ring.position.set(S.x,0.1,S.z); R.add(ring);
      for(let i=0;i<10;i++){ const a=i/10*6.283; R.add(sph(0.6,glow('#ffffff',3),S.x+Math.cos(a)*34,0.5,S.z+Math.sin(a)*34,8,6)); }
      for(const sx of [-1,1]) R.add(cyl(0.25,0.25,12,M('#555a60',0.45,0.7),S.x-12+sx*6,6,S.z-34,8)); R.add(bx(13,3,0.3,M('#20242a',0.5,0.4),S.x-12,11,S.z-34));
      const sg=new THREE.Mesh(new THREE.PlaneGeometry(12.4,2.6),new THREE.MeshStandardMaterial({map:signTex('Showroom','#10161c',pal[4]),emissive:C('#ffffff'),emissiveIntensity:0.4})); sg.material.emissiveMap=sg.material.map; sg.position.set(S.x-12,11,S.z-33.8); R.add(sg); },
    garage(R,pal,rr){ for(const [x,z,ry] of [[-18,-24,0.2],[16,-27,-0.25]]){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=ry; R.add(g); g.add(bx(16,8,12,M('#7a6a5c',0.85,0.1),0,4,0));
        const rf=bx(17,0.4,14,M('#8a9099',0.5,0.6),0,9,0); rf.rotation.x=0.18; g.add(rf); g.add(bx(7,5.5,0.2,M('#1c1f23',0.8,0.2),0,2.75,6.05)); g.add(bx(7,0.3,0.1,glow('#ffb060',2),0,5.6,6.2)); }
      for(const [x,z] of [[-10,-10],[11,-12],[-26,-8]]) for(let i=0;i<4;i++){ const t=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.38,8,18),M('#1d1d1f',0.9,0.05)); t.rotation.x=Math.PI/2; t.position.set(x,0.38+i*0.76,z); R.add(t); }
      for(let i=0;i<6;i++) R.add(cyl(0.6,0.6,1.8,M(pick(['#c0392b','#2e86c1','#7f8c8d']),0.5,0.5),6+(i%3)*1.3,0.9,-9-Math.floor(i/3)*1.3,12)); },
    livery(R,pal,rr){ for(const [x,z,ry,w] of [[-17,-22,0.35,20],[18,-25,-0.3,22]]){ const g=bx(w,10,1.2,M('#ffffff',0.85,0,{map:splatTex(pick(['#f1f3f5','#fff3bf','#e7f5ff']),rr)}),0,5,0); g.position.set(x,5,z); g.rotation.y=ry; R.add(g); }
      const booth=new THREE.Group(); booth.position.set(0,0,-34); R.add(booth); booth.add(bx(20,12,16,M('#dee2e6',0.6,0.2),0,6,0)); booth.add(bx(14,9,0.3,M('#212529',0.9,0),0,4.5,8.05));
      for(let i=0;i<6;i++) booth.add(bx(20.2,0.7,16.2,M(['#ff6b6b','#ffd43b','#51cf66','#4dabf7','#cc5de8','#ff922b'][i],0.5,0.2),0,9+i*0.01-(i%2)*0.9,0));
      for(let i=0;i<10;i++) R.add(cyl(0.7,0.7,1.6,M(pick(['#ff6b6b','#5c7cfa','#ffd43b','#51cf66','#cc5de8']),0.4,0.3),-12+(i%5)*1.6,0.8+Math.floor(i/5)*1.6,-9,12)); },
    outfit(R,pal,rr){ for(let i=0;i<5;i++){ const a=-0.9+i*0.45, x=Math.sin(a)*24, z=-14-Math.cos(a)*14, g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=-a; R.add(g);
        for(const sx of [-1,1]) for(const sz of [-1,1]) g.add(cyl(0.12,0.12,4,M('#6c6478',0.5,0.4),sx*2.4,2,sz*1.6,6));
        const aw=bx(5.6,0.15,4,M(['#7048e8','#20c997','#fcc419','#ff6b6b','#4dabf7'][i],0.7,0.05),0,4.2,0); aw.rotation.x=0.2; g.add(aw); g.add(bx(4.6,1,2.4,M('#4a3f5c',0.7,0.1),0,0.5,0));
        for(let k=0;k<5;k++) g.add(bx(0.5,0.5,0.5,M(pick(['#e5dbff','#63e6be','#ffe066','#ffa8a8']),0.5,0.3),-1.6+k*0.8,1.25,(rr()-0.5)*1.2)); }
      for(let i=0;i<14;i++){ const u=i/13; R.add(sph(0.22,glow(pick(['#ffd43b','#ff8787','#74c0fc','#b197fc']),2.6),lerp(-22,22,u),7.4-Math.sin(u*Math.PI)*1.6,-26+Math.sin(u*Math.PI)*8,8,6)); } },
    assay(R,pal,rr){ const hf=new THREE.Group(); hf.position.set(-14,0,-28); R.add(hf); for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ const l=cyl(0.35,0.35,20,M('#5c4a3a',0.7,0.3),sx*3,10,sz*3,6); l.rotation.set(sz*0.14,0,-sx*0.14); hf.add(l); }
        const wh=new THREE.Mesh(new THREE.TorusGeometry(2.4,0.3,8,24),M('#a0a4ab',0.4,0.7)); wh.position.set(0,20,0); hf.add(wh); hf.add(bx(8,6,8,M('#6a5546',0.85,0.1),0,3,0));
      for(const [x,z,r,c] of [[12,-26,9,'#7c6a58'],[24,-14,6,'#5c5c66'],[-28,-12,7,'#8c6040']]){ const cone=new THREE.Mesh(new THREE.ConeGeometry(r,r*0.8,9),M(c,0.95,0.05,{flatShading:true})); cone.position.set(x,r*0.4,z); R.add(cone);
        for(let i=0;i<8;i++){ const k=new THREE.Mesh(new THREE.DodecahedronGeometry(0.6+rr()*0.8,0),M(c,0.9,0.1,{flatShading:true})); const a=rr()*6.28; k.position.set(x+Math.cos(a)*r*1.05,0.5,z+Math.sin(a)*r*1.05); R.add(k); } }
      const cv=bx(2,0.6,22,M('#3a3f46',0.6,0.5),4,4.5,-16); cv.rotation.x=0.35; cv.rotation.y=-0.7; R.add(cv); },
    bar(R,pal,rr){ const g=new THREE.Group(); g.position.set(0,0,-28); R.add(g); g.add(bx(26,9,14,M('#4a2c1c',0.85,0.05),0,4.5,0)); g.add(bx(27,1,15,M('#2a1810',0.7,0.1),0,9.5,0));
        for(let i=0;i<5;i++) g.add(bx(2.6,2.2,0.2,glow('#ffc078',1.8),-9+i*4.5,4.5,7.05));
        const neon=new THREE.Mesh(new THREE.TorusGeometry(2.4,0.18,8,36),glow(pal[3],3.2)); neon.position.set(0,12.5,6); g.add(neon); const neon2=new THREE.Mesh(new THREE.TorusGeometry(1.2,0.14,8,30),glow(pal[4],3)); neon2.position.set(2.6,13.4,6.1); g.add(neon2);
      for(let i=0;i<3;i++){ const x=-16+i*16, z=-8+(i%2)*3; R.add(cyl(0.12,0.12,4,M('#888',0.4,0.7),x,2,z,6)); const um=new THREE.Mesh(new THREE.ConeGeometry(2.6,1.2,12),M(['#c2255c','#fab005','#1098ad'][i],0.7,0.05)); um.position.set(x,4.4,z); R.add(um); R.add(cyl(1.2,1.2,0.12,M('#7a4a2a',0.7,0.05),x,1.2,z,14)); }
      for(let i=0;i<16;i++){ const u=i/15; R.add(sph(0.25,glow(pick(['#ffd43b','#ff922b','#ff6b6b']),2.8),lerp(-20,20,u),6.8-Math.sin(u*Math.PI)*1.4,-12,8,6)); } },
  };
  function lampPosts(R){ for(const sx of [-1,1]){ R.add(cyl(0.12,0.16,5.5,M('#3d4147',0.5,0.6),sx*10.5,2.75,5,8)); R.add(sph(0.45,glow('#ffe2b8',2.6),sx*10.5,5.7,5,10,8)); } }

  /* ---------- particles and simple physics, per set ---------- */
  function puff(V, pos, col, n, spd, size, life, opt={}){
    for(let i=0;i<n;i++){ const m=new THREE.MeshBasicMaterial({color:opt.hdr?HDR(col,opt.hdr):C(col),transparent:true,opacity:opt.op||0.9,depthWrite:false,blending:opt.add?THREE.AdditiveBlending:THREE.NormalBlending});
      const o=new THREE.Mesh(opt.box?new THREE.BoxGeometry(1,0.15,1):new THREE.SphereGeometry(1,8,6),m); o.position.copy(pos); o.scale.setScalar(size*(0.6+Math.random()*0.6)); V.root.add(o);
      const dir=opt.dir?opt.dir.clone().add(new V3(rnd(-1,1),rnd(-1,1),rnd(-1,1)).multiplyScalar(opt.spread||0.6)).normalize():new V3(rnd(-1,1),rnd(-0.2,1),rnd(-1,1)).normalize();
      V.parts.push({o,v:dir.multiplyScalar(spd*(0.5+Math.random()*0.8)),g:opt.g||0,grow:opt.grow||0,life:life*(0.7+Math.random()*0.6),age:0,op:m.opacity,spin:opt.box?new V3(rnd(-8,8),rnd(-8,8),rnd(-8,8)):null}); }
  }
  function toss(V, o, v, w, gy){ V.phys.push({o,v:v.clone(),w:w?w.clone():new V3(),gy:gy==null?0.3:gy,hit:0}); }
  function stepFx(V, dt){
    for(let i=V.parts.length-1;i>=0;i--){ const p=V.parts[i]; p.age+=dt; if(p.age>=p.life){ V.root.remove(p.o); p.o.geometry.dispose(); p.o.material.dispose(); V.parts.splice(i,1); continue; }
      p.v.y-=p.g*dt; p.o.position.addScaledVector(p.v,dt); if(p.g&&p.o.position.y<0.03){ p.o.position.y=0.03; p.v.set(0,0,0); } if(p.spin){ p.o.rotation.x+=p.spin.x*dt; p.o.rotation.z+=p.spin.z*dt; }
      if(p.grow) p.o.scale.multiplyScalar(1+p.grow*dt); p.o.material.opacity=p.op*(1-p.age/p.life); }
    for(const p of V.phys){ p.v.y-=13*dt; p.o.position.addScaledVector(p.v,dt); p.o.rotation.x+=p.w.x*dt; p.o.rotation.y+=p.w.y*dt; p.o.rotation.z+=p.w.z*dt;
      if(p.o.position.y<p.gy){ p.o.position.y=p.gy; if(Math.abs(p.v.y)>1.2){ p.hit++; if(p.onHit) p.onHit(p); } p.v.y=-p.v.y*0.32; p.v.x*=0.55; p.v.z*=0.55; p.w.multiplyScalar(0.5); } }
  }
  function clearFx(V){ for(const p of V.parts){ V.root.remove(p.o); p.o.geometry.dispose(); p.o.material.dispose(); } V.parts.length=0; V.phys.length=0; }

  /* ---------- the gags: each has a length, a reset and an update ---------- */
  const once=(V,k)=>{ if(V.fired[k]) return false; V.fired[k]=1; return true; };
  const snd=(V,f)=>{ if(V===api.active&&G.mode==='port'&&!api.moving) f(); };
  const GAGS = {
    stack:{ dur:12, reset(V){ const {A,B}=V, g=V.g; A.position.set(-3.8,0,-3.6); A.rotation.y=Math.PI/2; B.position.set(3.1,0,-3.4); B.rotation.y=-Math.PI/2; g.crates.forEach(c=>{ c.visible=true; c.scale.setScalar(1); c.rotation.set(0,0,0); }); },
      update(V,t,dt){ const {A,B}=V, g=V.g, ok=V.ok;
        if(t<4.6){ const u=E(P_(t,0.4,4.6)); A.position.x=lerp(-3.8,1.2,u); Folk.walk(A,t*9,t>0.4?1:0); Folk.arms(A,[1.35,0.1],[1.35,0.1]); const wob=P_(t,1,4.6)*(ok?0.35:1);
          g.crates.forEach((c,i)=>{ c.position.set(A.position.x+0.5+Math.sin(t*7+i*0.9)*0.06*i*wob,1.0+i*0.64,-3.6); c.rotation.z=Math.sin(t*7+i)*0.08*i*wob; });
          Folk.arms(B,null,[0.3,2.3+Math.sin(t*8)*0.4]); }
        else if(!ok){
          if(t<5.3){ const k=P_(t,4.6,5.3); g.crates.forEach((c,i)=>{ c.position.x=A.position.x+0.5+Math.sin(t*11+i)*0.22*i*k; c.rotation.z=Math.sin(t*11+i)*0.3*i*k; }); A.userData.rig.rotation.z=Math.sin(t*10)*0.12*k; Folk.walk(A,0,0); }
          if(t>=5.3&&once(V,'drop')){ g.crates.forEach((c,i)=>{ const p=V.phys.length; toss(V,c,new V3(rnd(1,3.2),rnd(1.5,4),rnd(-0.5,2.4)),new V3(rnd(-6,6),rnd(-3,3),rnd(-6,6)),0.31); V.phys[p].onHit=q=>{ if(q.hit===1&&once(V,'thud'+i)) puff(V,q.o.position.clone().setY(0.1),'#c9b79a',5,1.2,0.18,0.8,{grow:1.6,op:0.6}); }; }); snd(V,()=>Sfx.crash(0.8)); api.react('facepalm',0.3); }
          if(t>=5.3){ const r=A.userData.rig; r.rotation.z=0; r.rotation.x=t<7.8?-E(P_(t,5.3,5.65))*1.45:-1.45*(1-E(P_(t,7.8,8.6))); r.position.y=t<7.8?-0.1*P_(t,5.3,5.65):0; Folk.arms(A,[t<7.8?2.6:0.2,0.4],[t<7.8?2.6:0.2,0.4]);
            Folk.arms(B,t<7.6?[2.7,0.3]:[0.2,t<9.4?1.2:0.1],t<7.6?[2.7,0.3]:[0.2,t<9.4?1.2:0.1]); if(t>6&&once(V,'wah')) void 0; }
        } else {
          if(t<5.6){ const k=E(P_(t,4.6,5.6)); g.crates.forEach((c,i)=>{ c.position.set(lerp(c.position.x,2.15,k*0.3),lerp(1.0+i*0.64,0.31+i*0.62,k),-3.6); c.rotation.z*=0.9; }); A.userData.rig.position.y=-0.15*Math.sin(k*Math.PI); Folk.walk(A,0,0); }
          if(t>=5.6&&once(V,'win')){ void 0; api.react('clap',0.2); }
          if(t>=5.8&&t<7.6){ for(const F of [A,B]){ F.userData.rig.position.y=Math.abs(Math.sin((t-5.8)*7))*0.35; Folk.arms(F,[0.3,2.6],[0.3,2.6]); } } else if(t>=7.6){ A.userData.rig.position.y=B.userData.rig.position.y=0; Folk.arms(B,[0,0],[0,0]); }
        }
        if(t>9.4){ A.rotation.y=-Math.PI/2; A.userData.rig.rotation.set(0,0,0); A.position.x=lerp(A.position.x,-3.8,1-Math.exp(-dt*1.6)); Folk.walk(A,t*9,t<11.6?1:0); g.crates.forEach(c=>{ c.scale.setScalar(Math.max(0.001,1-P_(t,9.4,10.2))); }); }
      } },
    crane:{ dur:13, reset(V){ const {A,B}=V, g=V.g; A.position.set(-0.6,0,-3.0); A.rotation.y=0.5; B.position.set(3.3,0,-3.5); B.rotation.y=-Math.PI/2; g.tro.position.x=-3.6; g.pod.visible=true; g.pod.scale.setScalar(1); g.pod.rotation.set(0,0,0); g.hookY=4.8; },
      update(V,t,dt){ const {A,B}=V, g=V.g, ok=V.ok; let tx=g.tro.position.x, hy=g.hookY, swing=0, attached=!V.fired.snap;
        if(t<3){ tx=lerp(-3.6,1.6,E(P_(t,0,3))); swing=Math.sin(t*3)*0.12; }
        else if(ok&&t<6){ tx=1.6; hy=lerp(4.8,2.55,E(P_(t,3,6))); }
        else if(!ok&&t<5.4){ hy=lerp(4.8,3.8,E(P_(t,3,4.4))); tx=t<4.4?1.6:lerp(1.6,3.0,E(P_(t,4.4,5.4))); swing=t<4.4?Math.sin(t*14)*0.05:-0.6*P_(t,4.4,5.4); }
        if(t>9.8){ tx=lerp(tx,-3.6,1-Math.exp(-dt*1.5)); hy=lerp(hy,4.8,1-Math.exp(-dt*2)); }
        if(!ok&&t>=5.4&&once(V,'snap')){ attached=false; const p=V.phys.length; toss(V,g.pod,new V3(0.5,1.0,0.25),new V3(0,0,-4),0.48); V.phys[p].onHit=q=>{ if(q.hit===1){ snd(V,()=>Sfx.crash(1)); puff(V,q.o.position.clone().setY(0.15),'#b8b0a0',9,1.6,0.22,1.0,{grow:1.8,op:0.6}); V.squash=1; api.react('facepalm'); } }; snd(V,()=>Sfx.clunk()); }
        if(!ok&&t>5.4&&t<6) hy=lerp(hy,6.2,1-Math.exp(-dt*8));
        g.tro.position.x=tx; g.hookY=hy; const len=6.7-hy; g.cable.scale.y=Math.max(0.05,len); g.hook.position.y=-len;
        if(attached){ g.pod.position.set(tx+Math.sin(swing)*len*0.5,hy-0.55,-4.6); g.pod.rotation.z=swing*0.6; }
        Folk.arms(A,[0.4,1.6+Math.sin(t*6)*0.6],[0.4,1.6+Math.sin(t*6+3)*0.6]);
        const sq=V.squash?Math.min(1,(V.squash+=dt*6)-1):0; const br=B.userData.rig; if(V.squash&&t<10.6){ br.scale.set(1+0.6*sq,1-0.7*sq,1+0.6*sq); } else if(t>=10.6){ br.scale.lerp(new V3(1,1,1),1-Math.exp(-dt*8)); if(V.squash&&once(V,'pop')) snd(V,()=>Sfx.boing()); }
        if(!ok&&t>5.9&&t<9) Folk.arms(A,[2.8,0.4],[2.8,0.4]);
        if(ok){ if(t>=6&&once(V,'clunk')) snd(V,()=>Sfx.clunk()); if(t>6.1&&t<8.4){ B.position.x=lerp(B.position.x,3.0,1-Math.exp(-dt*3)); Folk.arms(B,null,[1.4+Math.sin(t*20)*0.08,0]); if(Math.random()<0.6) puff(V,B.localToWorld(new V3(0,1.0,0.7)).sub(V.root.position).applyQuaternion(V.root.quaternion.clone().invert()),'#ffb040',2,2.6,0.03,0.5,{add:true,hdr:4,g:9,dir:new V3(rnd(-1,1),0.6,0.4)}); if(once(V,'hiss')) snd(V,()=>Sfx.hiss(2.2,0.1)); }
          if(t>=8.6&&once(V,'win')){ void 0; api.react('clap'); } if(t>8.6&&t<10){ for(const F of [A,B]){ F.userData.rig.position.y=Math.abs(Math.sin((t-8.6)*7))*0.3; } Folk.arms(B,[0.3,2.6],[0.3,2.6]); } else if(t>=10){ A.userData.rig.position.y=B.userData.rig.position.y=0; B.position.x=lerp(B.position.x,3.3,1-Math.exp(-dt*2)); Folk.arms(B,[0,0],[0,0]); } }
        if(t>10.2) g.pod.scale.setScalar(Math.max(0.001,1-P_(t,10.2,11)));
        if(t>11.2&&g.pod.scale.x<0.01){ V.phys.length=0; }
      } },
    engine:{ dur:11, reset(V){ const {A,B}=V, g=V.g; A.position.set(-0.4,0,-4.0); A.rotation.y=Math.PI/2; B.position.set(3.3,0,-3.8); B.rotation.y=-Math.PI/2; g.flame.visible=false; g.glow.material.color.copy(HDR('#ff9040',0.3)); g.nz.position.set(0.85,0,0); g.nz.rotation.set(0,0,0); g.stick.visible=false; g.mm.material.color.copy(C('#f8f4ec')); },
      update(V,t,dt){ const {A,B}=V, g=V.g, ok=V.ok, ar=A.userData.arms[1];
        if(t<3){ const ph=(t%1)/1; ar.rotation.x=ph<0.7?lerp(0,2.2,ph/0.7):lerp(2.2,-1.0,(ph-0.7)/0.3); if(ph>0.93&&once(V,'w'+Math.floor(t))){ snd(V,()=>Sfx.clunk()); g.core.userData.sh=0.25; } }
        g.core.userData.sh=Math.max(0,(g.core.userData.sh||0)-dt); const sh=g.core.userData.sh+(t>3&&t<4.2?0.12:0); g.core.position.set(rnd(-1,1)*sh*0.15,1.28+rnd(-1,1)*sh*0.15,0);
        if(t>3&&t<4.2&&Math.random()<0.3) puff(V,new V3(2.2,1.28,-4.2),'#8a8a8a',1,0.8,0.12,1,{grow:1.5,op:0.6,dir:new V3(1,0.3,0)});
        if(!ok){ if(t>=4.2&&once(V,'bang')){ snd(V,()=>Sfx.crash(1)); puff(V,new V3(2.4,1.3,-4.2),'#1e1e22',16,2.2,0.35,2.2,{grow:1.2,op:0.85,dir:new V3(1,0.2,0),spread:1}); api.react('facepalm');
            const nzw=new V3(); g.nz.getWorldPosition(nzw); V.root.worldToLocal(nzw); V.root.add(g.nz); g.nz.position.copy(nzw); toss(V,g.nz,new V3(0.6,6,0.8),new V3(5,2,7),0.3); }
          if(t>4.2){ const k=P_(t,4.2,4.6); B.userData.body.color.copy(B.userData.base).lerp(C('#26262a'),k); B.userData.rig.rotation.x=t<7?-0.25*k:0; A.userData.rig.rotation.x=t<7.5?0.6*E(k):0.6*(1-E(P_(t,7.5,8.2))); ar.rotation.x=0;
            if(t>6.5&&once(V,'cough')){ puff(V,B.localToWorld(new V3(0,1.3,0.4)).sub(V.root.position).applyQuaternion(V.root.quaternion.clone().invert()),'#555',3,0.6,0.1,1.2,{grow:1.3,op:0.7}); void 0; } } }
        else { if(t>=4.2&&once(V,'roar')){ snd(V,()=>Sfx.roar(3,0.22)); g.flame.visible=true; } if(t>4.2&&t<9.4){ g.glow.material.color.copy(HDR('#8fd0ff',4)); g.flame.scale.set(1,0.9+Math.sin(t*40)*0.1,1); g.stick.visible=true;
            if(!g.stick.parent||g.stick.parent===V.root) Folk.hold(B,g.stick); const k=P_(t,5,7.5); g.mm.material.color.copy(C('#f8f4ec')).lerp(C('#c98a3a'),k); Folk.arms(B,null,[t<7.8?1.5:2.6,0]); Folk.arms(A,null,[0.5,2.4]);
            if(t>8&&once(V,'win')){ void 0; api.react('clap'); } } if(t>=9.4){ g.flame.visible=false; g.glow.material.color.copy(HDR('#ff9040',0.3)); g.stick.visible=false; Folk.arms(B,[0,0],[0,0]); Folk.arms(A,[0,0],[0,0]); } }
        if(t>9.6&&!ok){ B.userData.body.color.copy(B.userData.base).lerp(C('#26262a'),1-P_(t,9.6,10.6)); if(g.nz.parent!==g.core){ g.core.add(g.nz); g.nz.position.set(0.85,0,0); g.nz.rotation.set(0,0,0); V.phys.length=0; } }
      } },
    spray:{ dur:10, reset(V){ const {A,B}=V, g=V.g; A.position.set(-0.25,0,-4.0); A.rotation.y=Math.PI/2; B.position.set(3.35,0,-3.9); B.rotation.y=-Math.PI/2; V.col=pick(['#ff6b6b','#5c7cfa','#ffd43b','#51cf66','#cc5de8','#ff922b']); g.stripeM.color.copy(C(V.col)); g.stripe.scale.x=0.001; },
      update(V,t,dt){ const {A,B}=V, g=V.g, ok=V.ok; Folk.arms(A,null,[1.45,0]); Folk.arms(B,[0.6,0.2],null);
        const tip=()=>A.localToWorld(new V3(0,1.08,0.95)).sub(V.root.position).applyQuaternion(V.root.quaternion.clone().invert());
        if(t>1&&t<(ok?4:3)){ if(once(V,'hiss')) snd(V,()=>Sfx.hiss(ok?3:2,0.1)); g.stripe.scale.x=Math.max(0.001,2.1*E(P_(t,1,4))); puff(V,tip(),V.col,1,4,0.06,0.45,{dir:new V3(1,0.1,-0.1),spread:0.15}); }
        if(!ok){ if(t>=3&&t<4.4){ A.rotation.y+=dt*11; const d=new V3(Math.sin(A.rotation.y),0.1,Math.cos(A.rotation.y)); puff(V,tip(),V.col,2,4.5,0.07,0.6,{dir:d,spread:0.2}); if(once(V,'spin')) api.react('facepalm',0.6); }
          if(t>3.2) B.userData.body.color.copy(B.userData.base).lerp(C(V.col),E(P_(t,3.2,4.0))*(1-P_(t,8.4,9.4)));
          if(t>=4.4&&t<7.5){ A.rotation.y=lerp(A.rotation.y,Math.PI/2,1-Math.exp(-dt*3)); A.userData.rig.rotation.z=Math.sin(t*5)*0.15; if(once(V,'wah')) void 0; Folk.arms(B,[0.2,1.3],[0.2,1.3]); } else if(t>=7.5) A.userData.rig.rotation.z=0; }
        else { if(t>=4.1&&once(V,'win')){ void 0; api.react('clap'); } if(t>4.1&&t<6.6){ if(Math.random()<0.5) puff(V,new V3(1.75+rnd(-1,1),1.45+rnd(-0.6,0.6),-4.3),'#ffffff',1,0.2,0.05,0.5,{add:true,hdr:3});
            A.userData.rig.rotation.x=-0.45*Math.sin(P_(t,4.3,5.6)*Math.PI); Folk.arms(B,[1.2,0.3+Math.abs(Math.sin(t*12))*0.4],[1.2,0.3+Math.abs(Math.sin(t*12))*0.4]); } }
        if(t>8.4) g.stripe.scale.x=Math.max(0.001,g.stripe.scale.x*(1-dt*3));
      } },
    gadget:{ dur:10, reset(V){ const {A,B}=V, g=V.g; A.position.set(-0.2,0,-3.9); A.rotation.y=Math.PI/2; B.position.set(3.0,0,-3.6); B.rotation.y=-Math.PI/2; g.lidP.rotation.set(0,0,0); g.lidP.add(g.lid); g.lid.position.set(0,0.04,0.4); g.lid.rotation.set(0,0,0); g.spring.visible=false; g.spring.scale.y=0.01; g.gadget.visible=false; g.box.rotation.set(0,0,0); if(!g.board.parent||g.board.parent===V.root) Folk.hold(B,g.board,0); },
      update(V,t,dt){ const {A,B}=V, g=V.g, ok=V.ok, ar=A.userData.arms[1];
        Folk.arms(B,[1.2+Math.sin(t*9)*0.08,0.2],[0.9,0.1]);
        if(t<2.7){ const ph=(t%0.8)/0.8; ar.rotation.x=-(ph<0.5?lerp(0.6,1.5,ph*2):lerp(1.5,0.6,(ph-0.5)*2)); if(ph>0.45&&ph<0.55&&once(V,'p'+Math.floor(t/0.8))){ snd(V,()=>Sfx.click()); g.jig=0.3+t*0.15; }
          g.jig=Math.max(0,(g.jig||0)-dt); g.box.rotation.z=Math.sin(t*40)*g.jig*0.15; g.box.position.y=Math.abs(Math.sin(t*30))*g.jig*0.1; }
        if(!ok){ if(t>=2.8&&once(V,'boing')){ snd(V,()=>Sfx.boing()); g.spring.visible=true; api.react('facepalm',0.8); const p=V.phys.length; toss(V,A,new V3(-1.4,7,0.3),new V3(0,0,0),0); V.phys[p].onHit=q=>{ if(q.hit===1){ snd(V,()=>Sfx.thump(0.6)); puff(V,q.o.position.clone().setY(0.1),'#c9b79a',6,1.2,0.18,0.8,{grow:1.5,op:0.6}); } };
            toss(V,g.lid,new V3(0.4,5,0.6),new V3(6,1,4),0.05); const w=new V3(); g.lid.getWorldPosition(w); V.root.worldToLocal(w); V.root.add(g.lid); g.lid.position.copy(w); V.phys[V.phys.length-1].o=g.lid; }
          if(t>2.8){ const s=P_(t,2.8,6), k=1+Math.sin(s*30)*Math.exp(-s*4)*0.6; g.spring.scale.y=Math.min(1,P_(t,2.8,2.95))*k; const r=A.userData.rig; r.rotation.x=t<4.1?-(t-2.8)*5:Math.max(0.0,1.5*(1-P_(t,7.2,7.9))); if(t>=4.1&&t<7.2) r.rotation.x=1.5; }
          if(t>7.9&&A.position.y<0.01){ V.phys.length=0; A.position.x=lerp(A.position.x,-0.2,1-Math.exp(-dt*2)); Folk.walk(A,t*9,t<9.4?1:0); } }
        else { if(t>=2.8&&once(V,'pop')){ void 0; api.react('clap'); for(let i=0;i<5;i++) puff(V,new V3(0.9,0.9,-3.9),pick(['#ff6b6b','#fcc419','#51cf66','#4dabf7','#cc5de8']),6,4,0.08,2.2,{box:true,g:7,dir:new V3(0,1,0),spread:0.9}); g.gadget.visible=true; }
          if(t>2.8){ g.lidP.rotation.x=-2.0*E(P_(t,2.8,3.1)); g.gadget.position.y=lerp(0.6,1.9,E(P_(t,2.8,3.8))); g.gadget.rotation.y+=dt*3; } if(t>3.2&&t<5.4){ for(const F of [A,B]) F.userData.rig.position.y=Math.abs(Math.sin((t-3.2)*7))*0.3; Folk.arms(A,[0.3,2.6],[0.3,2.6]); } else if(t>=5.4){ A.userData.rig.position.y=B.userData.rig.position.y=0; Folk.arms(A,[0,0],[0,0]); }
          if(t>8.6) g.gadget.scale.setScalar(Math.max(0.001,1-P_(t,8.6,9.4))); }
      } },
    rock:{ dur:10, reset(V){ const {A,B}=V, g=V.g; A.position.set(0.0,0,-4.0); A.rotation.y=Math.PI/2; B.position.set(3.2,0,-3.7); B.rotation.y=-Math.PI/2; g.hl.position.set(-0.16,0,0); g.hr.position.set(0.16,0,0); g.hl.rotation.set(0,0,0); g.hr.rotation.set(0,0,0); g.gem.visible=false; g.gem.position.y=0; g.gem.scale.setScalar(1); g.stars.visible=false;
        if(!g.hammer.parent||g.hammer.parent===V.root) Folk.hold(A,g.hammer); if(!g.glass.parent||g.glass.parent===V.root) Folk.hold(B,g.glass); },
      update(V,t,dt){ const {A,B}=V, g=V.g, ok=V.ok, ar=A.userData.arms[1]; Folk.arms(B,null,[1.1+Math.sin(t*2)*0.1,0]);
        if(t<2) ar.rotation.x=lerp(0,2.7,E(P_(t,0,2))); else if(t<2.25) ar.rotation.x=lerp(2.7,-1.25,P_(t,2,2.25));
        if(t>=2.25&&once(V,'hit')){ snd(V,()=>Sfx.clunk()); puff(V,new V3(1.3,1.55,-4.0),'#ffd27a',8,3,0.04,0.4,{add:true,hdr:4,g:6}); }
        if(!ok){ if(t>2.25&&t<2.75) ar.rotation.x=lerp(-1.25,3.4,E(P_(t,2.25,2.75))); if(t>=2.75&&once(V,'bonk')){ snd(V,()=>Sfx.boing()); api.react('facepalm',0.5); g.stars.visible=true; }
          if(t>2.75){ ar.rotation.x=lerp(ar.rotation.x,0.3,1-Math.exp(-dt*3)); const r=A.userData.rig; r.rotation.x=t<5.2?Math.sin(t*6)*0.12:-1.4*E(P_(t,5.2,5.6))*(1-P_(t,8,8.8)); r.rotation.z=t<5.2?Math.sin(t*4.3)*0.15:0;
            const hp=A.localToWorld(new V3(0,A.userData.head.position.y+0.7,0)).sub(V.root.position).applyQuaternion(V.root.quaternion.clone().invert()); g.stars.position.copy(hp); g.stars.children.forEach((s,i)=>{ const a=t*5+i*2.1; s.position.set(Math.cos(a)*0.4,Math.sin(t*7+i)*0.05,Math.sin(a)*0.4); }); g.stars.visible=t<6.5;
            if(t>3.2&&once(V,'wah')) void 0; } }
        else { if(t>2.3){ const k=E(P_(t,2.3,2.9)); g.hl.position.x=-0.16-0.32*k; g.hr.position.x=0.16+0.32*k; g.hl.rotation.z=0.5*k; g.hr.rotation.z=-0.5*k; g.gem.visible=true; g.gem.position.y=0.75*E(P_(t,2.5,3.6)); g.gem.rotation.y+=dt*2.5; ar.rotation.x=lerp(ar.rotation.x,0,1-Math.exp(-dt*3));
            if(t>3&&t<6&&Math.random()<0.4) puff(V,new V3(1.3+rnd(-0.4,0.4),1.95+rnd(-0.3,0.3),-4+rnd(-0.3,0.3)),'#e5b8ff',1,0.3,0.05,0.6,{add:true,hdr:3}); }
          if(t>=2.6&&once(V,'win')){ void 0; api.react('cash'); } if(t>3.4&&t<5.4){ B.userData.rig.position.y=Math.abs(Math.sin((t-3.4)*7))*0.32; } else B.userData.rig.position.y=0;
          if(t>8.6) g.gem.scale.setScalar(Math.max(0.001,1-P_(t,8.6,9.4))); }
      } },
    juggle:{ dur:11, reset(V){ const {A,B}=V, g=V.g; A.position.set(-0.55,0,-3.6); A.rotation.y=Math.PI/2; B.position.set(2.35,0,-3.6); B.rotation.y=-Math.PI/2; g.mugs.forEach(m=>{ m.visible=true; m.scale.setScalar(1); m.rotation.set(0,0,0); if(m.parent!==V.root) V.root.add(m); }); },
      update(V,t,dt){ const {A,B}=V, g=V.g, ok=V.ok, T=5.2;
        const mugAt=(i,tt)=>{ const u=((tt*0.85+i*2/3)%2), s=u%1, x=u<1?lerp(-0.05,1.85,s):lerp(1.85,-0.05,s); return new V3(x,1.15+4.2*s*(1-s),-3.6); };
        if(t<T){ g.mugs.forEach((m,i)=>{ m.position.copy(mugAt(i,t)); m.rotation.z=t*6+i; }); const a=Math.sin(t*0.85*Math.PI*3)*0.4; Folk.arms(A,[1.2+a,0.2],[1.2-a,0.2]); Folk.arms(B,[1.2-a,0.2],[1.2+a,0.2]); }
        else if(!ok){ if(once(V,'fumble')){ g.mugs.forEach((m,i)=>{ const p=V.phys.length; if(i===0){ V.flyer={m,from:m.position.clone()}; return; } toss(V,m,new V3(rnd(-1.5,1.5),rnd(1,2.5),rnd(0.2,1.2)),new V3(rnd(-8,8),0,rnd(-8,8)),0.15);
              V.phys[p].onHit=q=>{ if(q.hit===1){ q.o.visible=false; snd(V,()=>Sfx.crash(0.6)); puff(V,q.o.position.clone(),'#d8ecf2',7,2.5,0.05,1.4,{box:true,g:8,dir:new V3(0,1,0),spread:1}); puff(V,q.o.position.clone(),'#ffb54a',5,1.6,0.08,0.9,{g:6,dir:new V3(0,1,0),spread:1}); } }; }); }
          if(V.flyer){ const f=V.flyer, k=P_(t,T,T+1.2); if(k<1){ const to=new V3(V.keeper.position.x,api.keeperHeadY(V),-0.85); f.m.position.lerpVectors(f.from,to,k); f.m.position.y+=Math.sin(k*Math.PI)*3; f.m.rotation.z+=dt*9; }
            else if(once(V,'hat')){ f.m.rotation.set(Math.PI,0,0); f.m.position.set(V.keeper.position.x,api.keeperHeadY(V)+0.05,-0.85); snd(V,()=>Sfx.clunk()); api.react('facepalm'); puff(V,f.m.position.clone(),'#ffb54a',8,1.2,0.07,1.4,{g:5,dir:new V3(0,-1,0.3),spread:0.8}); } }
          Folk.arms(A,[2.6,0.3],[2.6,0.3]); Folk.arms(B,[2.6,0.3],[2.6,0.3]); if(t>T+1.5&&once(V,'wah')) void 0; }
        else { const k=E(P_(t,T,T+0.9)); g.mugs.forEach((m,i)=>{ const to=new V3(0.5+i*0.4,0.95,-4.4); m.position.lerp(to,k); m.rotation.z*=0.8; }); if(once(V,'win')){ void 0; api.react('clap',0.6); }
          if(t>T+0.9&&t<T+3){ for(const F of [A,B]){ F.rotation.y=lerp(F.rotation.y,0,1-Math.exp(-dt*5)); F.userData.rig.rotation.x=-0.55*Math.sin(P_(t,T+1,T+2.6)*Math.PI); } Folk.arms(A,[0,0],[0,0]); Folk.arms(B,[0,0],[0,0]); } }
        if(t>9.2){ g.mugs.forEach(m=>m.scale.setScalar(Math.max(0.001,1-P_(t,9.2,10)))); A.userData.rig.rotation.x=B.userData.rig.rotation.x=0; }
      } },
  };

  const api = {
    active:null, moving:false, list:[],
    defs(P){ return VENUES[P.idx]||[VENUES[0][0]]; },
    has(P,k){ return this.defs(P).some(d=>d.k===k); },
    def(P,k){ return this.defs(P).find(d=>d.k===k); },
    keeperName(P,d){ return alienName(d.sp,P.idx*131+this.defs(P).indexOf(d)*17); },
    keeperSeed(P,d){ return P.idx*131+this.defs(P).indexOf(d)*17; },
    /* builds every set for this planet into the surface scene */
    /* each place gets its own spot somewhere around the port, a few hundred metres from the pad and from each other,
       on a terrace cut into the ground (or a platform on a cloud world) with its own neighbourhood behind it */
    build(scn, P, cloud, padMat, hAt, liq){
      this.list=[]; this.active=null; const defs=this.defs(P), n=defs.length, r0=mulberry32(P.idx*313+7), base=r0()*6.283;
      defs.forEach((d,i)=>{ const a=base+i/n*6.283+(r0()-0.5)*0.3, rad=d.k==='depot'?240:300+((i*2)%3)*130+r0()*60;
        const root=new THREE.Group(), pos=new V3(Math.cos(a)*rad,0,Math.sin(a)*rad), dir=pos.clone().normalize().negate(); root.rotation.y=Math.atan2(dir.x,dir.z)+(r0()-0.5)*0.5;
        // sit the terrace on the highest ground it covers so nothing pokes through; the showroom pad counts too
        const pts=[[0,-6]]; for(let k=0;k<10;k++) pts.push([Math.cos(k*0.628)*22,Math.sin(k*0.628)*22-6]); if(d.k==='yard') for(let k=0;k<10;k++) pts.push([54+Math.cos(k*0.628)*34,-18+Math.sin(k*0.628)*34]);
        let y=0; if(!cloud&&hAt){ y=-1e9; const cs=Math.cos(root.rotation.y), sn=Math.sin(root.rotation.y); for(const [lx,lz] of pts){ const wx=pos.x+lx*cs+lz*sn, wz=pos.z-lx*sn+lz*cs; y=Math.max(y,hAt(wx,wz)); } y=Math.max(y+0.6,(liq||-1e9)+1.5); }
        root.position.set(pos.x,y,pos.z); scn.add(root);
        const seed=this.keeperSeed(P,d), rr=mulberry32(seed+5), V={def:d,k:d.k,root,seed,parts:[],phys:[],fired:{},t:0,ok:false,kr:null};
        const pal=PAL[d.k], ter=new THREE.Mesh(new THREE.CylinderGeometry(30,33,cloud?3:60,48),[padMat,M(pal[0],0.92,0.05),padMat]); ter.position.set(0,cloud?-1.7:-30.2,-6); ter.receiveShadow=true; root.add(ter);
        if(cloud){ const py=new THREE.Mesh(new THREE.CylinderGeometry(4,8,600,12),padMat); py.position.set(0,-303,-6); root.add(py); }
        DISTRICT[d.k](root,pal,rr,V); lampPosts(root);
        if(cloud&&V.show){ const py=new THREE.Mesh(new THREE.CylinderGeometry(5,9,600,12),padMat); py.position.set(V.show.x,-330,V.show.z); root.add(py); }
        shell(V,pal); V.g=SETS[d.k](V,pal);
        V.keeper=Folk.make(d.sp,seed,1.4); V.keeper.position.set(-1.55,0,-0.85); root.add(V.keeper);
        const others=SPECIES_KEYS.filter(k=>k!==d.sp); V.A=Folk.make(P.species===d.sp?pick(others):P.species,seed+1,1.2); V.B=Folk.make(others[Math.floor(rr()*others.length)],seed+2,1.2); root.add(V.A); root.add(V.B);
        V.gag=GAGS[VENUE_GAG[d.k]]; this.restart(V,rr()*V.gag.dur*0.3); root.traverse(o=>{ if(o.isMesh&&!o.material.isMeshBasicMaterial&&!o.material.transparent){ o.castShadow=true; o.receiveShadow=true; } }); root.updateMatrixWorld(true);
        this.list.push(V); });
      return this.list;
    },
    restart(V, t0){ clearFx(V); V.fired={}; V.squash=0; V.flyer=null; V.t=t0||0; V.ok=Math.random()<0.38; for(const F of [V.A,V.B]){ Folk.rest(F); F.position.y=0; } V.gag.reset(V); },
    current(){ if(G.mode!=='port'||!this.list.length) return null; const k=UI.tab; return this.list.find(v=>v.k===k)||this.list[0]; },
    keeperHeadY(V){ const U=V.keeper.userData; return (U.head.position.y+0.62)*1.4; },
    react(kind, delay){ const V=this.current(); if(!V) return; setTimeout(()=>{ V.kr={kind,t:0};
        if(kind==='facepalm'){ Folk.mood(V.keeper,'sad'); Folk.mood(V.A,'shock'); Folk.mood(V.B,'worried'); } else { Folk.mood(V.keeper,'happy'); Folk.mood(V.A,'happy'); Folk.mood(V.B,'happy'); } },(delay||0)*1000); },
    /* camera for a set, framed to fit a region of the screen with the given aspect */
    cam(V, aspect, preview){ const f=44, th=Math.tan(f*Math.PI/360);
      if(preview&&V.show){ const d=clamp(Math.max(24/th,40/(th*aspect)),50,150), look=V.show.clone().setY(6), dir=new V3(-0.42,0.2,0.88).normalize();
        return {pos:V.root.localToWorld(look.clone().addScaledVector(dir,d)), look:V.root.localToWorld(look.clone()), fov:f}; }
      const d=clamp(Math.max(3.3/th,3.75/(th*aspect)),8,18), el=0.32;
      const look=new V3(0,2.1,-2.6), pos=new V3(0,look.y+Math.sin(el)*d,look.z+Math.cos(el)*d); return {pos:V.root.localToWorld(pos), look:V.root.localToWorld(look), fov:f}; },
    /* where a previewed ship parks, in world space */
    showroom(){ const V=this.list.find(v=>v.show); return V?{V,pos:V.root.localToWorld(V.show.clone()),ry:V.root.rotation.y+2.3}:null; },
    near(x,z,r){ return this.list.some(v=>Math.hypot(v.root.position.x-x,v.root.position.z-z)<r); },
    update(dt, t){
      const V=this.current(); if(V!==this.active){ this.prev=this.active; this.active=V; }
      for(const v of this.list) v.root.visible=v===V||(this.moving&&v===this.prev); if(!V) return;
      V.t+=dt; if(V.t>V.gag.dur) this.restart(V,0);
      V.gag.update(V,V.t,dt); stepFx(V,dt);
      for(const F of [V.A,V.B,V.keeper]) Folk.blink(F,t);
      // shopkeeper: breathes, glances at the crew, reacts to how it goes
      const K=V.keeper, U=K.userData; K.position.y=Math.sin(t*1.8)*0.02; U.head.rotation.y=Math.sin(t*0.4)*0.25+(V.t>V.gag.dur*0.4&&V.t<V.gag.dur*0.6?0.5*Math.sign(Math.sin(V.seed)):0)*0.6;
      const r=V.kr; if(r){ r.t+=dt; const k=Math.sin(Math.min(1,r.t/0.25)*Math.PI/2);
        if(r.kind==='facepalm'){ Folk.arms(K,[0.2,0.15],[2.5*k,0.35*k]); U.head.rotation.x=0.25*k; if(r.t>2.2) V.kr=null; }
        else if(r.kind==='clap'){ const c=Math.abs(Math.sin(r.t*14)); Folk.arms(K,[1.3*k,0.15+c*0.35],[1.3*k,0.15+c*0.35]); K.position.y+=Math.abs(Math.sin(r.t*7))*0.08; if(r.t>1.8) V.kr=null; }
        else { Folk.arms(K,[0.3,2.6*k],[0.3,2.6*k]); K.position.y+=Math.abs(Math.sin(r.t*8))*0.15; if(r.t>1.4) V.kr=null; }
        if(!V.kr){ Folk.arms(K,[0,0],[0,0]); U.head.rotation.x=0; Folk.mood(K,'neutral'); } }
      else Folk.arms(K,[0.25+Math.sin(t*0.9)*0.05,0.1],[0.25+Math.sin(t*0.9+1)*0.05,0.1]);
    },
  };
  return api;
})();
