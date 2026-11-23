/* Nacrelle: A pearl nestled in a fan shell listens for the quietest noise in each port. */
SPECIES_EXTRA.nacrelle = {
  name:"Nacrelle", kind:"nacrelle", family:"alien", skin:"gloss",
  script:"curvy", col:"#dd8da5", hue:342, sat:54, lit:62,
  syl:["nah", "krel", "ell", "uvi", "ai", "sil", "eh", "lu"],
  voice:{wave:"sine",base:378,range:.36,rate:3.7,glide:.5,vib:4,vibAmt:8,fx:"chorus",amp:.40},
  trait:"Saves the tiny noises everyone else misses.",
  chat:[
    "The quietest thing at this dock is a biscuit cooling.",
    "I listened to a shell and heard my own kitchen. Fair enough.",
    "My microphone picked up a stamp drying. It was almost a song.",
    "Please hold still. There's a very small noise behind your larger one.",
    "I gave the library a recording of a page settling. They filed it under action."
  ],
  greet:[
    "Hello. You're coming through at just the right smallness.",
    "I had the gain turned up for dust. Give me a moment."
  ],
  cargo:[
    "{good}. The crate creaks beautifully when nobody asks it to.",
    "A soundproof box with something very quiet in it. Taking the sender's word."
  ],
  joke:["Someone sold me a silent bell. I've requested an audible receipt."],
  nice:["Thank you. I heard the smile first."],
  bye:["I'll keep a little quiet for your next visit."],
  honk:["That'll go in the other collection."],
  dock:[
    "Welcome to {port}. Listen for the soft click of the landing light.",
    "At {port} we have a quiet bay. It's the one beside the loud sign."
  ],
  rumor:"The softest voice on {planet} mentioned a freight bonus. I checked twice.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=0.755;
    oval(rig,body,0,.125,0,.31,.125,.30);
    oval(rig,light,0,.34,0,.32,.24,.26);
    const pearl=T.phys('#ffe2d7',{clearcoat:.85});
    T.head.position.z=.075;
    for(let i=-3;i<=3;i++){
      const a=i*.248;
      const rib=oval(head,i%2?body:light,Math.sin(a)*.32,.16+Math.cos(a)*.13,-.15,.104,.36,.095);
      rib.rotation.z=-a;
    }
    oval(head,pearl,0,0,0,.263,.257,.24);

    for(const side of [-1,1]){
      T.eye(head,U,side*0.14,0.025,0.2,0.12,null,T.iris);
      T.brow(head,U,side*0.14,0.183,0.228,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.105,0.24,.86);
    T.blush(head,0.219,-0.065,0.184,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.338,0.635,.085,0.27,.054,body,light));
  },
};
