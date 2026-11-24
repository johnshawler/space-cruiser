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
    head.position.y=1.064;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#aafbea',1.65);
    const phosphor=T.glow(T.iris,2.2);
    function turned(parent,material,outline,x,y,z){
      const path=outline.map(([r,h])=>new THREE.Vector2(r,h));
      const mesh=new THREE.Mesh(new THREE.LatheGeometry(path,32),material);
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    function plate(parent,material,outline,thickness,x,y,z){
      const shape=new THREE.Shape(outline.map(([px,py])=>new THREE.Vector2(px,py)));
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelSize:.017,bevelThickness:.015,bevelSegments:3});
      geometry.translate(0,0,-thickness/2);
      const mesh=new THREE.Mesh(geometry,material);
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    const footlights=[];
    for(const side of [-1,1]){
      rig.add(T.cyl(.126,.086,.218,dark,side*.159,.298,0,20));
      footlights.push(oval(rig,signal,side*.159,.105,0,.066,.104,.069));
    }
    plate(rig,body,[[-.235,0],[.235,0],[.233,.10],[.135,.24],[.068,.474],[-.065,.474],[-.135,.24],[-.234,.10]],.18,0,.354,0);
    const balance=new THREE.Group(); balance.position.y=.826;
    rig.add(balance);
    balance.add(T.rbox(.91,.044,.088,.015,light));
    const pans=[];
    for(const side of [-1,1]){
      const hanger=new THREE.Group(); hanger.position.x=side*.412;
      balance.add(hanger); pans.push(hanger);
      for(const edge of [-1,1]){
        const wire=T.cyl(.009,.009,.218,dark,edge*.049,-.10,0,8);
        wire.rotation.z=edge*.46; hanger.add(wire);
      }
      turned(hanger,body,[[.001,0],[.065,.006],[.139,.067],[.13,.071],[.054,.025],[.001,.022]],0,-.266,0);
    }
    rig.add(T.cyl(.062,.082,.161,light,0,.941,0,16));
    head.add(T.cyl(.218,.223,.242,body,0,0,-.006,24));
    head.add(T.rbox(.39,.212,.041,.016,glass,0,0,.202));
    const needle=T.bx(.027,.185,.039,light,0,.216,0); head.add(needle);
    head.add(T.sph(.04,signal,0,.316,0,12,8));
    U.gait=(phase,amount)=>{
      const tilt=.19*Math.sin(phase*.73)*amount;
      balance.rotation.z=tilt;
      for(let i=0;i<2;i++){
        pans[i].rotation.z=-tilt;
        footlights[i].scale.y=.104*(1+(i?1:-1)*tilt);
      }
      needle.rotation.z=-tilt*1.8;
      rig.rotation.z=0; rig.position.y=Math.abs(tilt)*.23;
    };

    for(const side of [-1,1]){
      const gaze=new THREE.Group();
      gaze.position.set(side*0.108,0.011,0.16);
      head.add(gaze);
      U.looks.push(gaze);
      const pixel=oval(gaze,phosphor,0,0,.083,0.0625,0.0501,.016);
      pixel.userData.sy=pixel.scale.y;
      U.eyes.push(pixel);
      const glint=T.sph(.17,T.catchM,-.22,.25,.93,10,8);
      pixel.add(glint);
      T.brow(head,U,side*0.108,0.107,0.239,.086,.014,signal,side);
    }
    T.mouth(head,U,0,-0.065,0.241,.72,signal);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.24,0.67,.085,0.248,.054,dark,light));
  },
};
