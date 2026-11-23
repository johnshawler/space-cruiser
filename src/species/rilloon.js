/* Rilloon: A bellows-bellied singer takes attendance at every echo. */
SPECIES_EXTRA.rilloon = {
  name:"Rilloon", kind:"rilloon", family:"alien", skin:"gloss",
  script:"curvy", col:"#5ed4ce", hue:177, sat:58, lit:51,
  syl:["rii", "luu", "wah", "bim", "soh", "yen", "hoo", "lem"],
  voice:{wave:"sine",base:302,range:.68,rate:4.3,glide:.64,vib:6,vibAmt:12,fx:"chorus",amp:.48},
  trait:"Always leaves a place in the choir for the echo.",
  chat:[
    "Just called the roll. The tunnel answered twice for somebody.",
    "My singing teacher says I have excellent volume. She teaches from the next bay.",
    "I hold a note through customs. They usually give it back.",
    "If you hear me again, that's the loading ramp. It likes the last word.",
    "My belly plays a chord when I bend to tie my shoes. I wear slip-ons to concerts."
  ],
  greet:[
    "Hello! I'll leave a gap for your echo.",
    "You're on pitch. I hadn't even given you one."
  ],
  cargo:[
    "{good}. The packing straw is in a different key.",
    "A crate of tuning forks. The route has been one long dinner bell."
  ],
  joke:["I asked a canyon for a solo. It said it preferred a duet. Eventually."],
  nice:["Thank you. Your engine has a lovely speaking voice."],
  bye:["I'll leave the last syllable with you. Loo."],
  honk:["A fine note. Your horn may join us on Thursdays."],
  dock:[
    "Welcome to {port}. Sing your bay number and follow the harmony.",
    "The round hall at {port} says hello back. This takes a minute."
  ],
  rumor:"The dispatcher at {planet} sang me their rates. There's a high note on delivery bonuses.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=1.19;
    for(let i=0;i<5;i++){
      const radius=.25+.055*Math.sin(i*Math.PI/4);
      rig.add(T.cyl(radius-.06,radius,.075,i%2?body:light,0,.36+i*.15,0,32));
      rig.add(T.cyl(radius,radius-.06,.075,body,0,.435+i*.15,0,32));
    }
    oval(head,body,0,-.02,0,.305,.275,.25);
    for(const side of [-1,1]){
      const bell=new THREE.Group();
      bell.position.set(side*.245,.05,-.035);
      bell.rotation.z=-side*1.02;
      head.add(bell);
      bell.add(T.cyl(.14,.06,.23,body,0,.085,0,24));
      bell.add(T.cyl(.146,.146,.032,light,0,.208,0,24));
      bell.add(T.cyl(.115,.115,.008,dark,0,.227,0,24));
    }

    for(const side of [-1,1]){
      T.eye(head,U,side*0.152,0.04,0.205,0.126,null,T.iris);
      T.brow(head,U,side*0.152,0.204,0.233,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.105,0.25,.86);
    T.blush(head,0.231,-0.065,0.189,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.31,0.86,.085,0.34,.054,body,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.15,0.28,0,0.22,.07,dark,null,light));
  },
};
