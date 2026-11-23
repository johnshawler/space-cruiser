/* Parasolum: A scalloped umbrella glider insures picnics against excessive sunshine. */
SPECIES_EXTRA.parasolum = {
  name:"Parasolum", kind:"parasolum", family:"alien", skin:"gloss",
  script:"dots", col:"#df77c5", hue:315, sat:62, lit:58,
  syl:["sha", "plu", "yi", "pem", "sil", "oro", "nu", "fli"],
  voice:{wave:"triangle",base:369,range:.53,rate:6,glide:.4,vib:5,vibAmt:10,fx:"chirp",amp:.46},
  trait:"Takes picnics personally, especially the paperwork.",
  chat:[
    "Clear skies again. People never read the fine print about clear skies.",
    "A sandwich in full sun is technically a toast claim.",
    "I can shade four elbows or one entire lunch. Please arrange yourselves.",
    "Yesterday a cloud parked above me. We split the shift.",
    "I follow picnics by the sound of lids coming off."
  ],
  greet:[
    "Weather desk speaking. Do you still have your sandwich?",
    "Hello, pilot. You sound comfortably overcast."
  ],
  cargo:[
    "{good}, plus a very large folded napkin for emergencies.",
    "Shade samples. Open the box in daylight or they all look alike."
  ],
  joke:["We covered a picnic for drizzle. It rained indoors. The ceiling filed separately."],
  nice:["Thank you. The scalloped edge was my grandmother's."],
  bye:["Stay in the nice bit between the shadows."],
  honk:["Perfect. That's the signal to put the lids back on."],
  dock:[
    "Welcome to {port}. Shade travels clockwise around the terminal.",
    "At {port} there's a bench under me. Take your time."
  ],
  rumor:"The picnic board on {planet} has added a delivery bonus. Even covered cargo qualifies.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=0.94;
    oval(rig,light,0,.56,0,.26,.34,.21);
    oval(head,body,0,-.02,0,.29,.28,.225);
    const hem=T.phys('#ffe8bd');
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      const panel=oval(head,i%2?light:body,Math.sin(a)*.205,.228,Math.cos(a)*.14,.19,.115,.26);
      panel.rotation.y=a;
      oval(head,hem,Math.sin(a)*.443,.207,Math.cos(a)*.391,.034,.048,.034);
    }
    oval(head,body,0,.29,0,.35,.152,.30);
    oval(head,hem,0,.454,0,.047,.077,.047);

    for(const side of [-1,1]){
      T.eye(head,U,side*0.145,-0.025,0.187,0.121,null,T.iris);
      T.brow(head,U,side*0.145,0.134,0.215,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.162,0.22,.86);
    T.blush(head,0.224,-0.122,0.171,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.32,0.76,.085,0.31,.054,body,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.13,0.25,0,0.19,.07,dark,null,light));
  },
};
