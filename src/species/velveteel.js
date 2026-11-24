/* Velveteel: A long-necked velvet swimmer with ribbon fins takes lost currents home. */
SPECIES_EXTRA.velveteel = {
  name:"Velveteel", kind:"velveteel", family:"alien", skin:"fuzzy",
  script:"curvy", col:"#7293da", hue:221, sat:58, lit:56,
  syl:["vel", "yii", "loo", "sai", "en", "mu", "raal", "nim"],
  voice:{wave:"sine",base:254,range:.61,rate:4.1,glide:.68,vib:5,vibAmt:11,fx:"chorus",amp:.45},
  trait:"Has never left a stray breeze behind.",
  chat:[
    "A draught came in under the door. It had clearly forgotten where it lived.",
    "I put a crosswind in a jar. Now the lid goes on sideways.",
    "The current I'm escorting is homesick for a bend in a river.",
    "I tried labelling the winds. The labels are over there now.",
    "The breeze in my cabin knows an excellent shortcut. It leads to the window."
  ],
  greet:[
    "Hello. Did a little gust go past with a ribbon on?",
    "Current returns desk. Where did you last feel it?"
  ],
  cargo:[
    "{good}. I tucked the packing slip downwind.",
    "A tailwind on its first flight home. I'm letting it lead."
  ],
  joke:["My breeze wanted a round trip. I bought it a fan."],
  nice:["Thank you. The fins untangle if I hold still."],
  bye:["May your air remember where it's going."],
  honk:["That stirred up some old acquaintances."],
  dock:[
    "Welcome to {port}. The breeze from bay two belongs in bay five.",
    "At {port} the windsock is my office. Pull the ribbon."
  ],
  rumor:"There's a freight bonus on {planet}. The news blew in under my door.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    function tube(parent,material,points,radius){
      const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
      const geometry=new THREE.TubeGeometry(curve,Math.max(16,points.length*2),radius,8,false);
      parent.add(new THREE.Mesh(geometry,material));
    }
    head.position.y=1.244;
    function plate(parent,material,outline,thickness,x,y,z){
      const shape=new THREE.Shape(outline.map(([px,py])=>new THREE.Vector2(px,py)));
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelSize:.017,bevelThickness:.015,bevelSegments:3});
      geometry.translate(0,0,-thickness/2);
      const mesh=new THREE.Mesh(geometry,material);
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    const collar=new THREE.Group();
    collar.position.set(.16,.99,0); rig.add(collar);
    const tail=oval(rig,body,-.07,.132,-.04,.302,.132,.31);
    tube(rig,body,[[-.16,.145,-.04],[-.24,.34,-.06],[-.185,.53,-.04],[.014,.653,0],[.159,.81,0],[.16,1.02,0]],.127);
    tube(collar,body,[[0,0,0],[-.04,.13,0],[-.16,.245,0]],.117);
    oval(head,body,0,-.015,0,.265,.22,.225);
    const fins=[];
    for(const side of [-1,1]){
      const fin=plate(head,light,[[0,0],[.09,.08],[.27,.13],[.20,-.015],[.29,-.13],[.14,-.095],[.085,-.185]],.042,side*.176,.072,-.055);
      fin.scale.x=side; fins.push(fin);
    }
    const shoulders=T.cyl(.049,.049,0.454,body,0,0.669,.085,14);
    shoulders.rotation.z=Math.PI/2; rig.add(shoulders);
    U.gait=(phase,amount)=>{
      const wave=Math.sin(phase*.68)*amount;
      rig.position.y=.018*Math.abs(wave); rig.rotation.z=.038*wave;
      collar.rotation.z=.12*wave;
      head.position.x=-.04*wave;
      tail.scale.x=.302*(1+.085*Math.sin(phase*.68-.9)*amount);
      fins[0].rotation.y=.30*wave; fins[1].rotation.y=.30*wave;
    };

    for(const side of [-1,1]){
      T.eye(head,U,side*0.142,0.035,0.185,0.123,null,T.iris);
      T.brow(head,U,side*0.142,0.196,0.213,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.11,0.226,.86);
    T.blush(head,0.221,-0.07,0.169,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.227,0.669,.085,0.274,.054,body,light));
  },
};
