/* Timbrelk: A drum-bodied walker with padded mallets counts the rests between noises. */
SPECIES_EXTRA.timbrelk = {
  name:"Timbrelk", kind:"timbrelk", family:"alien", skin:"matte",
  script:"dots", col:"#e58061", hue:14, sat:72, lit:55,
  syl:["tum", "brel", "ta", "dum", "pa", "rim", "ket", "om"],
  voice:{wave:"triangle",base:152,range:.44,rate:6.8,glide:.17,vib:3,vibAmt:6,fx:"click",amp:.50},
  trait:"Thinks the rests deserve equal billing.",
  chat:[
    "Nobody has played for a minute. Excellent ensemble work.",
    "My left shoe squeaks on the offbeat. I have kept it on the payroll.",
    "The engine missed a beat. I've saved the space in case it wants it back.",
    "I taught the freight lift to count in. It only knows floors.",
    "The docks get quiet at noon. That's my favourite part of the piece."
  ],
  greet:[
    "Come in whenever you're ready. We have plenty of rests.",
    "Hello from the percussion bay. Mind the silence on your way in."
  ],
  cargo:[
    "{good}, padded on every side except the side that sounds best.",
    "Four boxes of practice pads. It was a very quiet argument with customs."
  ],
  joke:["I wrote a solo for an empty room. The room has asked for a bigger part."],
  nice:["Thank you. I'll give that compliment a whole bar to ring."],
  bye:["I'll count you out. Then you're on your own time."],
  honk:["Lovely pickup. I'll take it from there."],
  dock:[
    "Welcome to {port}. The ramp lands on the downbeat.",
    "At {port} we let the last crate finish ringing before lunch."
  ],
  rumor:"Freight rates on {planet} just went up. I heard the cashier counting louder.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=0.95;
    const drum=new THREE.Group(); drum.position.y=.575; rig.add(drum);
    drum.rotation.z=-.17;
    drum.add(T.cyl(.411,.346,.43,body,0,0,0,32));
    const hide=T.phys('#ffda9e');
    for(const [y,r] of [[-.211,.36],[.211,.425]]) drum.add(T.cyl(r,r,.052,hide,0,y,0,32));
    for(let i=0;i<10;i++){
      const a=i*Math.PI/5;
      const lace=T.cyl(.012,.012,.398,light,Math.sin(a)*.38,0,Math.cos(a)*.38,8);
      lace.rotation.z=.17*Math.cos(a)*(i%2?1:-1);
      lace.rotation.x=-.17*Math.sin(a)*(i%2?1:-1);
      drum.add(lace);
    }
    oval(head,body,0,0,0,.325,.27,.255);
    for(const side of [-1,1]){
      const stick=T.cyl(.021,.023,.241,dark,side*.255,.24,-.07); stick.rotation.z=-side*.6; head.add(stick);
      oval(head,light,side*.324,.34,-.07,.075,.081,.076);
    }
    U.gait=(phase,amount)=>{
      const beat=Math.sin(phase)*amount;
      drum.rotation.z=-.17+.13*beat;
      rig.position.y=.083*Math.abs(beat);
      U.arms[0].rotation.x=-.92*beat; U.arms[1].rotation.x=.92*beat;
    };

    for(const side of [-1,1]){
      T.eye(head,U,side*0.162,0.035,0.206,0.13,null,T.iris);
      T.brow(head,U,side*0.162,0.203,0.234,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.11,0.25,.86);
    T.blush(head,0.241,-0.07,0.19,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.414,0.737,.085,0.3,.054,body,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.18,0.28,0,0.22,.07,dark,null,light));
  },
};
