/* Winkmast: A little tracked lighthouse keeps a diary of ships that wink back. */
SPECIES_EXTRA.winkmast = {
  name:"Winkmast", kind:"winkmast", family:"robot", skin:"metal",
  script:"blocks", col:"#e76a6e", hue:358, sat:72, lit:57,
  syl:["wan", "tik", "lum", "vek", "pim", "hol", "dit", "mas"],
  voice:{wave:"square",base:329,range:.52,rate:7.1,glide:.1,vib:3,vibAmt:6,fx:"chirp",amp:.23},
  trait:"Files even accidental flashes under correspondence.",
  chat:[
    "One wink means hello. Two means I forgot I'd already said hello.",
    "A window flashed back at me. I've put it down as a pen pal.",
    "I point my lamp away from the stars. They have enough on.",
    "The harbour mirror never misses a shift. Very reliable correspondent.",
    "Today's log has three freighters and a particularly sociable spoon."
  ],
  greet:[
    "Light on, notebook open. What's your good news?",
    "Hello from the short tower. Look just below the tall sign."
  ],
  cargo:[
    "{good}, all counted once in light and once in shadow.",
    "Spare bulbs. They like the night shift because they can see their work."
  ],
  joke:["I tried keeping a dark secret. My casing has windows."],
  nice:["Thank you. That's going on the bright page."],
  bye:["I'll wink twice when you're out of sight. Habit."],
  honk:["I'll record that as a wink with sound."],
  dock:[
    "Welcome to {port}. One slow blink marks your bay.",
    "At {port} I leave a lamp on for the last hauler."
  ],
  rumor:"The light on {planet} flashed the new freight bonus. I wrote it down before sunrise.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=1.147;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#ffe89e',1.65);
    const phosphor=T.glow(T.iris,2.2);
    function turned(parent,material,outline,x,y,z){
      const path=outline.map(([r,h])=>new THREE.Vector2(r,h));
      const mesh=new THREE.Mesh(new THREE.LatheGeometry(path,32),material);
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    const tracks=[];
    for(const side of [-1,1]){
      rig.add(T.rbox(.16,.205,.552,.043,dark,side*.25,.143,0));
      for(const z of [-.171,0,.171]){
        const roller=new THREE.Group(); roller.position.set(side*.36,.134,z);
        rig.add(roller); tracks.push(roller);
        const hub=T.cyl(.077,.077,.026,body,0,0,0,16);
        hub.rotation.z=Math.PI/2; roller.add(hub);
        roller.add(T.bx(.013,.089,.016,light,side*.018,0,0));
      }
    }
    turned(rig,body,[[.001,0],[.29,0],[.31,.065],[.268,.116],[.148,.664],[.183,.691],[.183,.73],[.001,.73]],0,.205,0);
    rig.add(T.cyl(.206,.22,.084,light,0,.677,0,28));
    rig.add(T.cyl(.081,.092,.18,dark,0,1.004,0,20));
    head.add(T.cyl(.261,.254,.316,body,0,-.015,-.01,12));
    head.add(T.rbox(.402,.241,.048,.021,glass,0,0,.23));
    head.add(T.cyl(.291,.274,.056,light,0,.158,-.01,24));
    head.add(T.cyl(.125,.125,.193,dark,0,.29,-.01,16));
    const lantern=new THREE.Group(); lantern.position.y=.29; head.add(lantern);
    oval(lantern,signal,0,0,.106,.093,.086,.065);
    for(const side of [-1,1]) head.add(T.cyl(.015,.015,.186,light,side*.156,.29,-.01,10));
    head.add(T.cyl(.057,.233,.126,body,0,.447,-.01,24));
    const shoulders=T.cyl(.049,.049,0.636,dark,0,0.807,.085,14);
    shoulders.rotation.z=Math.PI/2; rig.add(shoulders);
    U.gait=(phase,amount)=>{
      for(const hub of tracks) hub.rotation.x=phase*1.7*amount;
      lantern.rotation.y=phase*.72*amount;
      rig.position.y=.008*Math.abs(Math.sin(phase*3))*amount; rig.rotation.z=0;
    };

    for(const side of [-1,1]){
      const gaze=new THREE.Group();
      gaze.position.set(side*0.124,0.015,0.194);
      head.add(gaze);
      U.looks.push(gaze);
      const pixel=oval(gaze,phosphor,0,0,.083,0.057,0.0723,.016);
      pixel.userData.sy=pixel.scale.y;
      U.eyes.push(pixel);
      const glint=T.sph(.17,T.catchM,-.22,.25,.93,10,8);
      pixel.add(glint);
      T.brow(head,U,side*0.124,0.111,0.273,.086,.014,signal,side);
    }
    T.mouth(head,U,0,-0.077,0.272,.72,signal);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.318,0.807,.085,0.301,.054,dark,light));
  },
};
