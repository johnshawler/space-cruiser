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
    head.position.y=1.2;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#9cfff0',1.65);
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
    const wheel=new THREE.Group(); wheel.position.set(0,.269,0);
    wheel.rotation.order='YXZ'; wheel.rotation.y=-.45; rig.add(wheel);
    const axle=new THREE.Group(); axle.rotation.y=-.45; axle.position.y=.269; rig.add(axle);
    for(const side of [-1,1]){
      const fork=plate(axle,light,[[-.032,0],[.032,0],[.036,.25],[.012,.34],[-.035,.32]],.039,side*.129,0,-.012);
      fork.rotation.x=-.23;
    }
    const tyre=T.cyl(.268,.268,.181,dark,0,0,0,28);
    tyre.rotation.z=Math.PI/2; wheel.add(tyre);
    for(const side of [-1,1]){
      const hub=T.cyl(.173,.173,.025,body,side*.104,0,0,24);
      hub.rotation.z=Math.PI/2; wheel.add(hub);
      for(let i=0;i<3;i++){
        const a=i*Math.PI*2/3;
        wheel.add(T.sph(.036,light,side*.127,.109*Math.sin(a),.109*Math.cos(a),10,8));
      }
    }
    const reel=new THREE.Group(); reel.position.set(0,.78,-.014);
    reel.rotation.z=Math.PI*.39; rig.add(reel);
    reel.add(T.cyl(.178,.178,.47,dark));
    for(let i=0;i<7;i++) reel.add(T.cyl(.208,.208,.045,body,0,-.182+i*.061,0,24));
    for(const side of [-1,1]) reel.add(T.cyl(.274,.274,.05,light,0,side*.26,0,28));
    rig.add(T.cyl(.084,.10,.176,dark,.052,1.042,0));
    head.position.x=.071;
    head.add(T.rbox(.391,.298,.314,.056,body));
    head.add(T.rbox(.353,.24,.037,.015,glass,0,0,.165));
    head.add(T.cyl(.032,.046,.141,light,.119,.224,0,16));
    head.add(T.sph(.046,signal,.119,.303,0,14,10));
    const shoulders=T.cyl(.049,.049,0.622,dark,0,0.864,.085,14);
    shoulders.rotation.z=Math.PI/2; rig.add(shoulders);
    U.gait=(phase,amount)=>{
      wheel.rotation.x=phase*amount;
      rig.rotation.z=-.076*Math.sin(phase*.52)*amount;
      rig.position.y=0;
      reel.rotation.z=Math.PI*.39+.08*Math.sin(phase)*amount;
    };

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
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.311,0.864,.085,0.256,.054,dark,light));
  },
};
