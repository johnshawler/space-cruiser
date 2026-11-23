/* Bobbinor: A one-wheeled reel robot winds up the loose ends of other people's errands. */
SPECIES_EXTRA.bobbinor = {
  name:"Bobbinor", kind:"bobbinor", family:"robot", skin:"metal",
  script:"blocks", col:"#e18e56", hue:24, sat:70, lit:52,
  syl:["bob", "bin", "tik", "ree", "zul", "rem", "nok", "vin"],
  voice:{wave:"square",base:216,range:.34,rate:6,glide:.08,vib:2,vibAmt:3,fx:"robot",amp:.23},
  trait:"Will follow any loose end to the plug.",
  chat:[
    "The cable crossed the road before I did. We've had a talk.",
    "A pilot gave me a loose end. It was attached to a very full afternoon.",
    "I can follow a thread of conversation for six kilometres.",
    "Today's knot is decorative. I decided that after lunch.",
    "I've wound up the queue rope. The queue is following me."
  ],
  greet:[
    "Line open. Mind the slack between us.",
    "Hello. You caught me on the return spool."
  ],
  cargo:[
    "{good}, tied with a bow accessible from the driver's seat.",
    "One spool of extension cord. The plug should arrive tomorrow."
  ],
  joke:["I measured a winding road. It's much shorter on the reel."],
  nice:["Thanks. I kept the receipt in case the finish unravels."],
  bye:["End of line. I'll leave a loop for next time."],
  honk:["Pull twice if that was the cable alarm."],
  dock:[
    "Welcome to {port}. Follow the yellow cord back to my desk.",
    "At {port} please unwind the ramp before you drive onto it."
  ],
  rumor:"The loose cable from {planet} came with a note. They're paying extra for deliveries.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=1.16;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#9cfff0',1.65);
    const phosphor=T.glow(T.iris,2.2);
    const wheel=T.cyl(.202,.202,.155,dark,0,.202,0,32);
    wheel.rotation.z=Math.PI/2;
    rig.add(wheel);
    for(const side of [-1,1]){
      const hub=T.cyl(.085,.085,.021,light,side*.083,.202,0,24);
      hub.rotation.z=Math.PI/2;
      rig.add(hub);
    }
    rig.add(T.cyl(.22,.22,.52,light,0,.642,0,32));
    for(let i=0;i<5;i++) rig.add(T.cyl(.253,.253,.047,body,0,.486+i*.077,0,32));
    for(const y of [.415,.885]) rig.add(T.cyl(.327,.327,.069,dark,0,y,0,32));
    rig.add(T.cyl(.081,.10,.20,light,0,.995,0));
    head.add(T.rbox(.48,.345,.32,.051,body));
    head.add(T.rbox(.421,.284,.035,.014,glass,0,0,.168));
    for(const side of [-1,1]) head.add(T.cyl(.036,.055,.135,light,side*.168,.247,0,16));
    head.add(T.sph(.049,signal,.168,.316,0,14,10));

    for(const side of [-1,1]){
      const gaze=new THREE.Group();
      gaze.position.set(side*0.128,0.02,0.115);
      head.add(gaze);
      U.looks.push(gaze);
      const pixel=oval(gaze,phosphor,0,0,.083,0.067,0.0616,.016);
      pixel.userData.sy=pixel.scale.y;
      U.eyes.push(pixel);
      const glint=T.sph(.17,T.catchM,-.22,.25,.93,10,8);
      pixel.add(glint);
      T.brow(head,U,side*0.128,0.116,0.194,.086,.014,signal,side);
    }
    T.mouth(head,U,0,-0.09,0.203,.72,signal);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.354,0.832,.085,0.328,.054,dark,light));
  },
};
