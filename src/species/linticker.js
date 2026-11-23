/* Linticker: A cabinet robot with a bright pendulum grants time off to overworked clocks. */
SPECIES_EXTRA.linticker = {
  name:"Linticker", kind:"linticker", family:"robot", skin:"metal",
  script:"blocks", col:"#69bf84", hue:139, sat:40, lit:49,
  syl:["lin", "tik", "vak", "tok", "id", "mel", "ren", "tem"],
  voice:{wave:"triangle",base:144,range:.29,rate:4.1,glide:.15,vib:2,vibAmt:4,fx:"click",amp:.44},
  trait:"Believes every timepiece deserves a proper break.",
  chat:[
    "The lunch clock is on lunch. We can eat until it gets back.",
    "I covered a sundial's shift. Cloudy day. Caught up on my reading.",
    "I grant every stopwatch a short walk once a week.",
    "A clock asked for a minute alone. I gave it the whole mantel.",
    "My calendar tore off a day for itself. The paperwork can wait."
  ],
  greet:[
    "Clock relief here. Have you had a moment to yourself?",
    "Hello. I can spare the time."
  ],
  cargo:[
    "{good}. No rush, unless the shift clock insists.",
    "Little hammocks for alarm bells. The padding is important."
  ],
  joke:["I gave a clock a second chance. It asked for the other fifty-nine."],
  nice:["Thank you. I'm setting aside a minute to be pleased."],
  bye:["Take your time. I signed it out to you."],
  honk:["The shift bell's off today. Thanks for covering."],
  dock:[
    "Welcome to {port}. The dock clock is resting, so you're on time.",
    "At {port} break time starts when the last clock sits down."
  ],
  rumor:"There's a delivery bonus on {planet}. The payroll clock stayed late to tell me.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=1.235;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#ffdf89',1.65);
    const phosphor=T.glow(T.iris,2.2);
    rig.add(T.rbox(.434,.67,.29,.056,body,0,.61,0));
    rig.add(T.rbox(.27,.47,.036,.016,glass,0,.613,.159));
    const pendulum=new THREE.Group();
    pendulum.position.set(0,.814,.19);
    pendulum.rotation.z=.25;
    rig.add(pendulum);
    pendulum.add(T.cyl(.014,.014,.301,light,0,-.147,0,10));
    oval(pendulum,light,0,-.311,0,.071,.071,.02);
    rig.add(T.rbox(.47,.065,.307,.024,dark,0,.313,0));
    rig.add(T.cyl(.075,.09,.191,light,0,1.022,0,16));
    head.add(T.rbox(.454,.324,.316,.056,body));
    head.add(T.rbox(.407,.274,.034,.014,glass,0,0,.167));
    oval(head,body,0,.167,-.027,.232,.139,.132);
    oval(head,signal,0,.251,.076,.044,.048,.022);

    for(const side of [-1,1]){
      const gaze=new THREE.Group();
      gaze.position.set(side*0.127,0.018,0.112);
      head.add(gaze);
      U.looks.push(gaze);
      const pixel=oval(gaze,phosphor,0,0,.083,0.068,0.0573,.016);
      pixel.userData.sy=pixel.scale.y;
      U.eyes.push(pixel);
      const glint=T.sph(.17,T.catchM,-.22,.25,.93,10,8);
      pixel.add(glint);
      T.brow(head,U,side*0.127,0.114,0.191,.086,.014,signal,side);
    }
    T.mouth(head,U,0,-0.09,0.2,.72,signal);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.311,0.854,.085,0.338,.054,dark,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.147,0.221,0,0.161,.07,dark,null,body));
  },
};
