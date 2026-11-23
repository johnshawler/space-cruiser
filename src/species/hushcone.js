/* Hushcone: A horn-eared recording robot makes field recordings of things finishing. */
SPECIES_EXTRA.hushcone = {
  name:"Hushcone", kind:"hushcone", family:"robot", skin:"metal",
  script:"blocks", col:"#e8bd59", hue:42, sat:76, lit:54,
  syl:["hus", "kon", "zis", "rec", "tul", "fer", "din", "tag"],
  voice:{wave:"sawtooth",base:188,range:.35,rate:4.4,glide:.2,vib:3,vibAmt:5,fx:"robot",amp:.22},
  trait:"Likes a good ending enough to wait for it.",
  chat:[
    "I caught the exact moment a kettle stopped boiling. The rest is tea.",
    "The last crate slid off the ramp before I pressed record. Could someone reload it?",
    "A door closing is easy. A door deciding to stay closed takes patience.",
    "Nearly finished recording a meeting. I've said that for three hours.",
    "My favourite sound is the click after the last buckle. Good click."
  ],
  greet:[
    "Recorder rolling. Finish whatever you were saying.",
    "Hello. I kept the tail end of your hail. Nice fade."
  ],
  cargo:[
    "{good}. I'm hoping the packing tape comes off in one take.",
    "Empty reels. I'll fill them with the ends of other reels."
  ],
  joke:["I recorded the end of a queue. On playback it started another queue."],
  nice:["Thank you. I'll keep the little pause after that."],
  bye:["Hold still for one second. There. Lovely goodbye."],
  honk:["Can you do just the very end of that again?"],
  dock:[
    "Welcome to {port}. Your engine winding down is going in the collection.",
    "At {port} please let the ramp finish squeaking before you applaud."
  ],
  rumor:"The cashier on {planet} ends every freight payment with an extra clink. There's a bonus on.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=1.125;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#adeaff',1.65);
    const phosphor=T.glow(T.iris,2.2);
    rig.add(T.rbox(.465,.46,.346,.075,body,0,.569,0));
    for(const side of [-1,1]){
      const reel=T.cyl(.081,.081,.041,light,side*.107,.602,.18,22);
      reel.rotation.x=Math.PI/2;
      rig.add(reel);
      oval(rig,dark,side*.107,.602,.21,.029,.029,.012);
    }
    rig.add(T.cyl(.075,.095,.238,light,0,.892,0));
    head.add(T.rbox(.428,.355,.291,.062,body));
    head.add(T.rbox(.385,.278,.033,.014,glass,0,0,.152));
    const horn=new THREE.Group();
    horn.position.set(-.14,.176,-.047);
    horn.rotation.z=.83;
    horn.rotation.x=.30;
    head.add(horn);
    horn.add(T.cyl(.224,.047,.31,body,0,.131,0,28));
    horn.add(T.cyl(.23,.23,.029,light,0,.292,0,28));
    horn.add(T.cyl(.199,.199,.007,dark,0,.311,0,28));
    horn.add(T.cyl(.06,.06,.009,signal,0,.316,0,18));

    for(const side of [-1,1]){
      const gaze=new THREE.Group();
      gaze.position.set(side*0.117,0.012,0.097);
      head.add(gaze);
      U.looks.push(gaze);
      const pixel=oval(gaze,phosphor,0,0,.083,0.064,0.064,.016);
      pixel.userData.sy=pixel.scale.y;
      U.eyes.push(pixel);
      const glint=T.sph(.17,T.catchM,-.22,.25,.93,10,8);
      pixel.add(glint);
      T.brow(head,U,side*0.117,0.108,0.176,.086,.014,signal,side);
    }
    T.mouth(head,U,0,-0.09,0.185,.72,signal);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.327,0.768,.085,0.31,.054,dark,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.145,0.275,0,0.215,.07,dark,null,body));
  },
};
