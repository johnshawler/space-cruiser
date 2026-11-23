/* Rimebud: A faceted ice bud keeps souvenirs of weather in cold storage. */
SPECIES_EXTRA.rimebud = {
  name:"Rimebud", kind:"rimebud", family:"alien", skin:"stone",
  script:"angular", col:"#7fc5e6", hue:199, sat:67, lit:61,
  syl:["rim", "nai", "kir", "ven", "tis", "sho", "il", "da"],
  voice:{wave:"triangle",base:325,range:.38,rate:5.1,glide:.24,vib:6,vibAmt:8,fx:"none",amp:.44},
  trait:"Keeps a date and a story for every snowflake.",
  chat:[
    "Today's frost looks just like my aunt. I've asked it to hold still.",
    "I keep my first snow day in a flask. There's a bus ticket frozen in it.",
    "The forecast said scattered showers. I'm only missing the one from Tuesday.",
    "My postcards have to travel in the freezer drawer.",
    "I took a holiday somewhere warm. The album is mostly puddles."
  ],
  greet:[
    "Cold archive, good morning. I'm wearing the gloves for talking.",
    "Hello. Leave the frosted bit of the receiver for me."
  ],
  cargo:[
    "{good}, and one tray of perfectly ordinary sleet from a rather special afternoon.",
    "A hailstone with a parking ticket inside. It establishes the date."
  ],
  joke:["My weather exhibit sprang a leak. The catalogue now lists a river."],
  nice:["That's kind. I saved the frost from launch day."],
  bye:["Keep cool. Or send me a sample of the alternative."],
  honk:["You knocked a little snow off my aerial. I've dated the envelope."],
  dock:[
    "Welcome to {port}. Today's frost is on display by the cold lockers.",
    "At {port} you may check your sleet at the door. Keep the ticket dry."
  ],
  rumor:"{planet} is offering a delivery bonus. The notice is trapped under some exceptionally fine ice.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=1.02;
    function crystal(parent,mat,x,y,z,w,h,tilt){
      const gem=new THREE.Mesh(new THREE.OctahedronGeometry(1),mat);
      gem.scale.set(w,h,w*.8);
      gem.position.set(x,y,z);
      gem.rotation.z=tilt;
      parent.add(gem);
    }
    crystal(rig,body,0,.60,0,.33,.395,0);
    oval(head,light,0,0,0,.29,.25,.24);
    const frost=T.phys('#d9faff',{roughness:.30});
    for(const side of [-1,1]){
      crystal(head,body,side*.238,.195,-.04,.095,.25,-side*.54);
      crystal(head,frost,side*.10,.31,-.07,.075,.215,-side*.23);
    }
    crystal(head,body,0,.34,-.06,.106,.28,0);

    for(const side of [-1,1]){
      T.eye(head,U,side*0.147,0.015,0.193,0.124,null,T.iris);
      T.brow(head,U,side*0.147,0.177,0.221,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.13,0.244,.86);
    T.blush(head,0.226,-0.09,0.177,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.327,0.76,.085,0.32,.054,body,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.155,0.28,0,0.22,.07,dark,null,light));
  },
};
