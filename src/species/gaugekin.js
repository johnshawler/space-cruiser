/* Gaugekin: A caliper-headed mechanic measures the gaps left by missing things. */
SPECIES_EXTRA.gaugekin = {
  name:"Gaugekin", kind:"gaugekin", family:"robot", skin:"metal",
  script:"angular", col:"#60a4dc", hue:207, sat:64, lit:53,
  syl:["gai", "kin", "gau", "vim", "tek", "fol", "nim", "chi"],
  voice:{wave:"sawtooth",base:256,range:.42,rate:6.6,glide:.09,vib:1,vibAmt:3,fx:"robot",amp:.21},
  trait:"Can describe a missing bolt with remarkable precision.",
  chat:[
    "Your spare tyre is missing. The hole is the correct size.",
    "An empty shelf came in exactly on spec. Very tidy work.",
    "I've measured the pause before lunch. A sandwich just fits.",
    "Where my toolbox used to be is now my best reference gap.",
    "A bolt fell out. I can give you its absence to three decimal places."
  ],
  greet:[
    "Clearance desk speaking. How wide a space can I help you with?",
    "Hello. Leave a gap between words and I'll check it."
  ],
  cargo:[
    "{good}. They're a snug fit in the interval between these walls.",
    "Replacement gaps. The packing material is the expensive part."
  ],
  joke:["I lost my ruler. On the bright side I know exactly how long it is."],
  nice:["Thank you. That fills a space I hadn't measured."],
  bye:["I'll leave room in the log for your return."],
  honk:["Fine interval between those beeps. Factory tolerance."],
  dock:[
    "Welcome to {port}. That space between the stripes is yours.",
    "At {port} I measure clearance with the doors open. Saves on doors."
  ],
  rumor:"{planet} widened the gap between ordinary pay and delivery pay. The bonus looks generous.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=1.041;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#b4ffe8',1.65);
    const phosphor=T.glow(T.iris,2.2);
    function plate(parent,material,outline,thickness,x,y,z){
      const shape=new THREE.Shape(outline.map(([px,py])=>new THREE.Vector2(px,py)));
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelSize:.017,bevelThickness:.015,bevelSegments:3});
      geometry.translate(0,0,-thickness/2);
      const mesh=new THREE.Mesh(geometry,material);
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    rig.add(T.rbox(.376,.386,.273,.05,body,0,.57,0));
    rig.add(T.rbox(.302,.064,.034,.013,dark,0,.625,.145));
    for(let i=0;i<4;i++) rig.add(T.bx(.013,.024+(i%2)*.016,.011,light,-.096+i*.061,.625,.167));
    rig.add(T.cyl(.073,.09,.204,light,0,.879,0,16));
    head.add(T.rbox(.506,.212,.27,.037,body));
    head.add(T.rbox(.379,.189,.03,.012,glass,0,0,.142));
    plate(head,light,[[-.044,0],[.048,0],[.018,.344],[.15,.399],[.137,.427],[-.041,.403]],.071,-.221,.098,0);
    const slide=new THREE.Group(); slide.position.set(.218,.082,0); head.add(slide);
    plate(slide,body,[[-.041,0],[.05,0],[.05,.309],[.012,.367],[-.141,.398],[-.15,.364],[-.044,.301]],.088,0,0,0);
    slide.add(T.sph(.031,signal,-.127,.38,.052,12,8));
    const shoulders=T.cyl(.049,.049,0.488,dark,0,0.727,.085,14);
    shoulders.rotation.z=Math.PI/2; rig.add(shoulders);
    U.gait=(phase,amount)=>{
      const measure=(1-Math.cos(phase*.75))*.5*amount;
      slide.position.x=.218-.133*measure;
      rig.position.y=.028*Math.abs(Math.sin(phase))*amount;
      for(const leg of U.legs){
        leg.rotation.x*=.68; leg.userData.foot.rotation.x=-leg.rotation.x;
      }
    };

    for(const side of [-1,1]){
      const gaze=new THREE.Group();
      gaze.position.set(side*0.105,0.014,0.091);
      head.add(gaze);
      U.looks.push(gaze);
      const pixel=oval(gaze,phosphor,0,0,.083,0.0473,0.0572,.016);
      pixel.userData.sy=pixel.scale.y;
      U.eyes.push(pixel);
      const glint=T.sph(.17,T.catchM,-.22,.25,.93,10,8);
      pixel.add(glint);
      T.brow(head,U,side*0.105,0.11,0.17,.086,.014,signal,side);
    }
    T.mouth(head,U,0,-0.063,0.172,.72,signal);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.244,0.727,.085,0.303,.054,dark,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.165,0.3,0,0.24,.07,dark,null,body));
  },
};
