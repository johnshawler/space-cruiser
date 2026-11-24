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
    head.position.y=0.996;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#adeaff',1.65);
    const phosphor=T.glow(T.iris,2.2);
    function turned(parent,material,outline,x,y,z){
      const path=outline.map(([r,h])=>new THREE.Vector2(r,h));
      const mesh=new THREE.Mesh(new THREE.LatheGeometry(path,32),material);
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    const recorder=T.rbox(.472,.386,.328,.062,body,0,.523,0);
    rig.add(recorder);
    for(const side of [-1,1]){
      const reel=T.cyl(.076,.076,.032,light,side*.107,.552,.179,22);
      reel.rotation.x=Math.PI/2; rig.add(reel);
      oval(rig,dark,side*.107,.552,.199,.028,.028,.011);
    }
    rig.add(T.cyl(.079,.091,.172,light,0,.804,0));
    head.add(T.rbox(.401,.281,.296,.046,body));
    head.add(T.rbox(.364,.235,.037,.014,glass,0,0,.154));
    const horn=new THREE.Group(); horn.position.set(-.114,.125,-.023);
    horn.rotation.set(.42,0,.66); head.add(horn);
    // Double wall and a recessed throat leave a real opening in the bell.
    turned(horn,body,[[.052,0],[.055,.16],[.12,.302],[.227,.399],[.274,.426],[.278,.451],[.26,.467],[.202,.426],[.102,.335],[.044,.196],[.036,.065]],0,0,0);
    horn.add(T.cyl(.044,.042,.017,signal,0,.109,0,16));
    const shoulders=T.cyl(.049,.049,0.576,dark,0,0.677,.085,14);
    shoulders.rotation.z=Math.PI/2; rig.add(shoulders);
    U.gait=(phase,amount)=>{
      const listen=Math.sin(phase*.60)*amount;
      horn.rotation.z=.66+.205*listen; horn.rotation.y=.21*listen;
      rig.rotation.z=-.09*listen;
    };

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
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.288,0.677,.085,0.275,.054,dark,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.145,0.275,0,0.215,.07,dark,null,body));
  },
};
