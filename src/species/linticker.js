/* Linticker: A cabinet robot with a bright pendulum grants time off to overworked clocks. */
SPECIES_EXTRA.linticker = {
  name:"Linticker", kind:"linticker", family:"robot", skin:"metal",
  script:"blocks", col:"#69bf84", hue:139, sat:40, lit:49,
  syl:["lin", "tik", "vak", "tok", "id", "mel", "ren", "tem"],
  voice:{wave:"triangle",base:144,range:.29,rate:4.1,glide:.15,vib:2,vibAmt:4,fx:"click",amp:.44},
  trait:"Believes every timepiece deserves a proper break.",
  chat:[
    "The lunch clock is on lunch. We can eat until it gets back.",
    "I covered a sundial's shift. Cloudy day. Caught up on my reading.",
    "I grant every stopwatch a short walk once a week.",
    "A clock asked for a minute alone. I gave it the whole mantel.",
    "My calendar tore off a day for itself. The paperwork can wait."
  ],
  greet:[
    "Clock relief here. Have you had a moment to yourself?",
    "Hello. I can spare the time."
  ],
  cargo:[
    "{good}. No rush, unless the shift clock insists.",
    "Little hammocks for alarm bells. The padding is important."
  ],
  joke:["I gave a clock a second chance. It asked for the other fifty-nine."],
  nice:["Thank you. I'm setting aside a minute to be pleased."],
  bye:["Take your time. I signed it out to you."],
  honk:["The shift bell's off today. Thanks for covering."],
  dock:[
    "Welcome to {port}. The dock clock is resting, so you're on time.",
    "At {port} break time starts when the last clock sits down."
  ],
  rumor:"There's a delivery bonus on {planet}. The payroll clock stayed late to tell me.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=1.137;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#ffdf89',1.65);
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
    plate(rig,body,[[-.237,0],[.237,0],[.219,.085],[.16,.14],[.149,.425],[.205,.526],[.219,.596],[-.219,.596],[-.205,.526],[-.149,.425],[-.16,.14],[-.219,.085]],.274,0,.29,0);
    rig.add(T.rbox(.229,.409,.038,.017,glass,0,.602,.156));
    const pendulum=new THREE.Group();
    pendulum.position.set(0,.785,.188); rig.add(pendulum);
    pendulum.add(T.cyl(.012,.012,.294,light,0,-.143,0,10));
    oval(pendulum,light,0,-.299,0,.074,.074,.019);
    rig.add(T.cyl(.079,.092,.148,light,0,.979,0,16));
    head.add(T.rbox(.49,.284,.312,.048,body));
    head.add(T.rbox(.423,.235,.035,.014,glass,0,0,.164));
    plate(head,light,[[-.274,0],[-.26,.052],[-.151,.099],[0,.259],[.151,.099],[.26,.052],[.274,0]],.119,0,.155,-.023);
    oval(head,signal,0,.247,.047,.037,.047,.022);
    const shoulders=T.cyl(.049,.049,0.52,body,0,0.822,.085,14);
    shoulders.rotation.z=Math.PI/2; rig.add(shoulders);
    U.gait=(phase,amount)=>{
      pendulum.rotation.z=.48*Math.sin(phase)*amount;
      rig.rotation.z=-.032*Math.sin(phase)*amount;
      rig.position.y=.027*Math.abs(Math.sin(phase))*amount;
    };

    for(const side of [-1,1]){
      const gaze=new THREE.Group();
      gaze.position.set(side*0.127,0.018,0.112);
      head.add(gaze);
      U.looks.push(gaze);
      const pixel=oval(gaze,phosphor,0,0,.083,0.068,0.0573,.016);
      pixel.userData.sy=pixel.scale.y;
      U.eyes.push(pixel);
      const glint=T.sph(.17,T.catchM,-.22,.25,.93,10,8);
      pixel.add(glint);
      T.brow(head,U,side*0.127,0.114,0.191,.086,.014,signal,side);
    }
    T.mouth(head,U,0,-0.09,0.2,.72,signal);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.26,0.822,.085,0.315,.054,dark,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.147,0.221,0,0.161,.07,dark,null,body));
  },
};
