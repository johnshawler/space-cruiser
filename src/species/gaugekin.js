/* Gaugekin: A caliper-headed mechanic measures the gaps left by missing things. */
SPECIES_EXTRA.gaugekin = {
  name:"Gaugekin", kind:"gaugekin", family:"robot", skin:"metal",
  script:"angular", col:"#60a4dc", hue:207, sat:64, lit:53,
  syl:["gai", "kin", "gau", "vim", "tek", "fol", "nim", "chi"],
  voice:{wave:"sawtooth",base:256,range:.42,rate:6.6,glide:.09,vib:1,vibAmt:3,fx:"robot",amp:.21},
  trait:"Can describe a missing bolt with remarkable precision.",
  chat:[
    "Your spare tyre is missing. The hole is the correct size.",
    "An empty shelf came in exactly on spec. Very tidy work.",
    "I've measured the pause before lunch. A sandwich just fits.",
    "Where my toolbox used to be is now my best reference gap.",
    "A bolt fell out. I can give you its absence to three decimal places."
  ],
  greet:[
    "Clearance desk speaking. How wide a space can I help you with?",
    "Hello. Leave a gap between words and I'll check it."
  ],
  cargo:[
    "{good}. They're a snug fit in the interval between these walls.",
    "Replacement gaps. The packing material is the expensive part."
  ],
  joke:["I lost my ruler. On the bright side I know exactly how long it is."],
  nice:["Thank you. That fills a space I hadn't measured."],
  bye:["I'll leave room in the log for your return."],
  honk:["Fine interval between those beeps. Factory tolerance."],
  dock:[
    "Welcome to {port}. That space between the stripes is yours.",
    "At {port} I measure clearance with the doors open. Saves on doors."
  ],
  rumor:"{planet} widened the gap between ordinary pay and delivery pay. The bonus looks generous.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=1.095;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#b4ffe8',1.65);
    const phosphor=T.glow(T.iris,2.2);
    rig.add(T.rbox(.443,.383,.319,.066,body,0,.584,0));
    rig.add(T.rbox(.317,.077,.037,.015,dark,0,.62,.168));
    for(let i=0;i<4;i++) rig.add(T.bx(.013,.023+(i%2)*.02,.014,light,-.112+i*.071,.623,.192));
    rig.add(T.cyl(.075,.092,.185,light,0,.893,0,16));
    head.add(T.rbox(.437,.297,.277,.045,body));
    head.add(T.rbox(.391,.257,.031,.013,glass,0,0,.144));
    for(const side of [-1,1]){
      head.add(T.rbox(.089,.316,.099,.018,light,side*.17,.267,0));
      head.add(T.rbox(.143,.057,.10,.016,body,side*.143,.414,0));
    }
    head.add(T.sph(.033,signal,-.085,.414,.051,12,8));

    for(const side of [-1,1]){
      const gaze=new THREE.Group();
      gaze.position.set(side*0.119,0.014,0.087);
      head.add(gaze);
      U.looks.push(gaze);
      const pixel=oval(gaze,phosphor,0,0,.083,0.0537,0.0649,.016);
      pixel.userData.sy=pixel.scale.y;
      U.eyes.push(pixel);
      const glint=T.sph(.17,T.catchM,-.22,.25,.93,10,8);
      pixel.add(glint);
      T.brow(head,U,side*0.119,0.11,0.166,.086,.014,signal,side);
    }
    T.mouth(head,U,0,-0.077,0.175,.72,signal);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.335,0.777,.085,0.325,.054,dark,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.165,0.3,0,0.24,.07,dark,null,body));
  },
};
