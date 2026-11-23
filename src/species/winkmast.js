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
    head.position.y=1.14;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#ffe89e',1.65);
    const phosphor=T.glow(T.iris,2.2);
    for(const side of [-1,1]){
      rig.add(T.rbox(.14,.20,.51,.042,dark,side*.215,.137,0));
      for(const z of [-.155,0,.155]){
        const roller=T.cyl(.066,.066,.024,light,side*.316,.135,z,16);
        roller.rotation.z=Math.PI/2;
        rig.add(roller);
      }
    }
    rig.add(T.cyl(.165,.286,.586,body,0,.58,0,24));
    rig.add(T.cyl(.214,.225,.09,light,0,.677,0,24));
    rig.add(T.cyl(.073,.095,.21,dark,0,.945,0,16));
    head.add(T.rbox(.47,.33,.35,.052,body));
    head.add(T.rbox(.416,.277,.035,.015,glass,0,0,.184));
    head.add(T.cyl(.25,.255,.045,light,0,.21,0,24));
    head.add(T.cyl(.114,.114,.178,signal,0,.318,0,20));
    for(const side of [-1,1]) head.add(T.cyl(.015,.015,.19,dark,side*.135,.322,0,10));
    head.add(T.cyl(.041,.194,.104,body,0,.455,0,24));

    for(const side of [-1,1]){
      const gaze=new THREE.Group();
      gaze.position.set(side*0.125,0.014,0.13);
      head.add(gaze);
      U.looks.push(gaze);
      const pixel=oval(gaze,phosphor,0,0,.083,0.0534,0.0678,.016);
      pixel.userData.sy=pixel.scale.y;
      U.eyes.push(pixel);
      const glint=T.sph(.17,T.catchM,-.22,.25,.93,10,8);
      pixel.add(glint);
      T.brow(head,U,side*0.125,0.11,0.209,.086,.014,signal,side);
    }
    T.mouth(head,U,0,-0.09,0.218,.72,signal);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.318,0.807,.085,0.301,.054,dark,light));
  },
};
