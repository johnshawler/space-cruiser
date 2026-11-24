/* Loamlet: A terracotta burrower with chimney ears grows a different garden in each pocket. */
SPECIES_EXTRA.loamlet = {
  name:"Loamlet", kind:"loamlet", family:"alien", skin:"matte",
  script:"curvy", col:"#df8862", hue:18, sat:66, lit:54,
  syl:["loh", "um", "ta", "pip", "del", "roo", "lum", "tha"],
  voice:{wave:"triangle",base:218,range:.48,rate:4.8,glide:.32,vib:4,vibAmt:7,fx:"none",amp:.48},
  trait:"Rotates crops by turning pockets inside out.",
  chat:[
    "I am rotating my crops. I turned my coat inside out.",
    "The left pocket gets good sun. The right grows mostly receipts.",
    "A bean took root in my seat belt. We have agreed to travel together.",
    "I can tell your soil is tired. It keeps lying down.",
    "I ordered a raised bed. The delivery crew put my bunk on bricks."
  ],
  greet:[
    "Hello from the potting bench. My thumb is clean enough for radio.",
    "Speak up a little. I have seedlings in both ears."
  ],
  cargo:[
    "{good}, with a layer of mulch. Just in case.",
    "One sack of very promising holes. Bring your own dirt."
  ],
  joke:["I tried growing clocks. They all came up late."],
  nice:["Thank you. I waxed the hull with a very small leaf."],
  bye:["May something nice sprout in your glove box."],
  honk:["That woke the peas. They were due up anyway."],
  dock:[
    "Welcome to {port}. The herb patch marks the edge of the pad.",
    "At {port} the landing fee includes a cutting. Pinch it above the node."
  ],
  rumor:"The nursery on {planet} is paying extra for deliveries. Ask for the desk under the ivy.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=0.88;
    function turned(parent,material,outline,x,y,z){
      const path=outline.map(([r,h])=>new THREE.Vector2(r,h));
      const mesh=new THREE.Mesh(new THREE.LatheGeometry(path,32),material);
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    const pot=turned(rig,body,[[.001,0],[.21,0],[.22,.05],[.324,.40],[.342,.44],[.338,.49],[.001,.49]],0,.279,0);
    rig.add(T.cyl(.355,.34,.09,dark,0,.755,0,28));
    oval(head,body,0,0,0,.34,.29,.285);
    const soil=T.phys('#593836');
    for(const side of [-1,1]){
      const ear=new THREE.Group();
      ear.position.set(side*.20,.22,-.045);
      ear.rotation.z=side<0?.28:-.48;
      ear.scale.y=side<0?1.60:.70;
      head.add(ear);
      ear.add(T.cyl(.098,.076,.25,body,0,.09,0,18));
      ear.add(T.cyl(.11,.11,.055,light,0,.22,0,18));
      ear.add(T.cyl(.078,.078,.01,soil,0,.249,0,18));
    }
    const shoot=oval(head,T.phys('#92ce63'),-.35,.69,-.045,.082,.152,.032);
    shoot.rotation.z=-.45;
    U.gait=(phase,amount)=>{
      const step=Math.sin(phase)*amount;
      pot.rotation.z=.075*step;
      shoot.rotation.z=-.45+.31*Math.sin(phase-.75)*amount;
      rig.rotation.z=.095*step;
    };

    for(const side of [-1,1]){
      T.eye(head,U,side*0.165,0.045,0.225,0.126,null,T.iris);
      T.brow(head,U,side*0.165,0.209,0.253,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.105,0.287,.86);
    T.blush(head,0.244,-0.065,0.209,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.365,0.72,.085,0.32,.054,body,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.16,0.28,0,0.22,.07,dark,null,light));
  },
};
