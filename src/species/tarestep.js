/* Tarestep: A two-pan hover scale weighs compliments before passing them along. */
SPECIES_EXTRA.tarestep = {
  name:"Tarestep", kind:"tarestep", family:"robot", skin:"metal",
  script:"blocks", col:"#67c3d5", hue:190, sat:57, lit:53,
  syl:["tar", "tep", "kel", "gram", "vi", "sek", "nul", "bem"],
  voice:{wave:"triangle",base:246,range:.3,rate:5.2,glide:.16,vib:2,vibAmt:4,fx:"robot",amp:.4},
  trait:"Knows the precise weight of a kind word.",
  chat:[
    "Your good morning weighed a little more than yesterday's. Slept well?",
    "A sigh weighs almost nothing until everyone does it at once.",
    "I balanced the accounts. Had to move one pencil.",
    "Wind adds weight on the left. I turn around before giving bad news.",
    "The empty crate is a little heavier since they wrote EMPTY on it."
  ],
  greet:[
    "Scale cleared. Say something of moderate weight.",
    "Hello. I've set aside a pan just for you."
  ],
  cargo:[
    "{good}. The gross weight includes a very sincere apology.",
    "Counterweights, plus a smaller counterweight for the packing slip."
  ],
  joke:["I tried weighing a rumour. It got heavier at every stop."],
  nice:["That tips the scale. Give me a moment to enjoy it."],
  bye:["Travel light. I can certify it if you like."],
  honk:["That one bounced right off the pan."],
  dock:[
    "Welcome to {port}. Both pans say it's good to see you.",
    "At {port} we weigh the ship before we hand out biscuits."
  ],
  rumor:"I've weighed the delivery bonus on {planet}. It is a substantial improvement.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=1.105;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#aafbea',1.65);
    const phosphor=T.glow(T.iris,2.2);
    oval(rig,body,0,.52,0,.27,.29,.218);
    for(const side of [-1,1]){
      rig.add(T.cyl(.119,.09,.17,dark,side*.154,.28,0,20));
      oval(rig,signal,side*.154,.113,0,.052,.112,.06);
    }
    rig.add(T.rbox(.69,.058,.115,.021,light,0,.83,0));
    for(const side of [-1,1]){
      for(const z of [-.065,.065]) rig.add(T.cyl(.009,.009,.23,dark,side*.30,.697,z,8));
      oval(rig,body,side*.30,.57,0,.104,.033,.13);
    }
    rig.add(T.cyl(.064,.09,.19,light,0,.926,0));
    head.add(T.rbox(.46,.33,.29,.06,body));
    head.add(T.rbox(.407,.274,.033,.013,glass,0,0,.153));
    const needle=T.bx(.027,.142,.034,light,0,.252,0);
    needle.rotation.z=-.38;
    head.add(needle);
    head.add(T.sph(.036,signal,.028,.319,0,12,8));

    for(const side of [-1,1]){
      const gaze=new THREE.Group();
      gaze.position.set(side*0.123,0.018,0.097);
      head.add(gaze);
      U.looks.push(gaze);
      const pixel=oval(gaze,phosphor,0,0,.083,0.0657,0.0527,.016);
      pixel.userData.sy=pixel.scale.y;
      U.eyes.push(pixel);
      const glint=T.sph(.17,T.catchM,-.22,.25,.93,10,8);
      pixel.add(glint);
      T.brow(head,U,side*0.123,0.114,0.176,.086,.014,signal,side);
    }
    T.mouth(head,U,0,-0.085,0.185,.72,signal);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.415,0.76,.085,0.306,.054,dark,light));
  },
};
