/* Sealump: A spring-footed stamp robot collects impressions of perfectly ordinary floors. */
SPECIES_EXTRA.sealump = {
  name:"Sealump", kind:"sealump", family:"robot", skin:"metal",
  script:"blocks", col:"#a17dd4", hue:265, sat:50, lit:57,
  syl:["sel", "lum", "tap", "ink", "pem", "dol", "chi", "dak"],
  voice:{wave:"square",base:167,range:.27,rate:5.8,glide:.06,vib:0,vibAmt:0,fx:"click",amp:.25},
  trait:"Dates a port by the grain of its floorboards.",
  chat:[
    "This floor has a grain like yesterday's floor, but with ambition.",
    "I remember every dock by the mark it left on my ankle.",
    "I stepped on my own report. Management approved the improvement.",
    "The foyer asked for a clean copy. I'll walk through it again.",
    "My ink pad has the day off. I'm taking pencil rubbings."
  ],
  greet:[
    "Hello. Your signal made a nice clean impression.",
    "Records desk here. I have room in the margin."
  ],
  cargo:[
    "{good}. The crate bottoms have already signed for the trip.",
    "A roll of blank flooring. A first edition, if I tread carefully."
  ],
  joke:["I stamped a moving walkway. My signature is touring the terminal."],
  nice:["Thank you. Would you sign the corner while the ink is wet?"],
  bye:["Leaving my mark. I'll mop up the spare ones."],
  honk:["Very official. I'll stamp the noise complaint in your favour."],
  dock:[
    "Welcome to {port}. My footprints lead to the receiving desk.",
    "At {port} every floorboard has an entry in my album."
  ],
  rumor:"{planet} stamped a bonus on its delivery orders. I recognise the pressure on the final zero.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    function tube(parent,material,points,radius){
      const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
      const geometry=new THREE.TubeGeometry(curve,Math.max(16,points.length*2),radius,8,false);
      parent.add(new THREE.Mesh(geometry,material));
    }
    head.position.y=1.053;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#ffd2a7',1.65);
    const phosphor=T.glow(T.iris,2.2);
    function turned(parent,material,outline,x,y,z){
      const path=outline.map(([r,h])=>new THREE.Vector2(r,h));
      const mesh=new THREE.Mesh(new THREE.LatheGeometry(path,32),material);
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    const foot=T.rbox(.54,.105,.39,.034,dark,0,.083,0);
    rig.add(foot,T.rbox(.506,.061,.355,.021,body,0,.167,0));
    const spring=new THREE.Group(), carriage=new THREE.Group();
    spring.position.y=.197;
    rig.add(spring,carriage);
    const coil=[];
    for(let i=0;i<=72;i++){
      const a=i*Math.PI/9;
      coil.push([.146*Math.cos(a),.55*i/72,.146*Math.sin(a)]);
    }
    tube(spring,light,coil,.029);
    carriage.add(T.cyl(.19,.168,.065,dark,0,.785,0,24));
    carriage.add(T.rbox(.488,.09,.326,.03,body,0,.836,0));
    carriage.add(T.cyl(.083,.089,.11,light,0,.941,0));
    carriage.add(head);
    head.add(T.rbox(.578,.265,.302,.04,body));
    head.add(T.rbox(.475,.22,.036,.013,glass,0,0,.156));
    turned(head,body,[[.001,0],[.103,0],[.082,.09],[.068,.14],[.119,.19],[.154,.23],[.14,.285],[.076,.318],[.001,.328]],0,.158,0);
    oval(head,signal,0,.404,.13,.038,.025,.015);
    U.gait=(phase,amount)=>{
      // The ink pad stays planted during the wind-up, then clears the floor in flight.
      const cycle=((phase/(2*Math.PI))%1+1)%1;
      let compression=0, lift=0;
      if(cycle<.38) compression=.24*Math.sin(Math.PI*cycle/.38)**2;
      else if(cycle<.82){
        const flight=(cycle-.38)/.44;
        lift=.236*Math.sin(Math.PI*flight);
      } else compression=.09*Math.sin(Math.PI*(cycle-.82)/.18)**2;
      rig.rotation.z=0; rig.position.y=lift*amount;
      spring.scale.y=1-compression*amount/.55;
      carriage.position.y=-compression*amount;
      for(const arm of U.arms) arm.position.y=.83+carriage.position.y;
    };

    for(const side of [-1,1]){
      const gaze=new THREE.Group();
      gaze.position.set(side*0.14,0.013,0.104);
      head.add(gaze);
      U.looks.push(gaze);
      const pixel=oval(gaze,phosphor,0,0,.083,0.0516,0.066,.016);
      pixel.userData.sy=pixel.scale.y;
      U.eyes.push(pixel);
      const glint=T.sph(.17,T.catchM,-.22,.25,.93,10,8);
      pixel.add(glint);
      T.brow(head,U,side*0.14,0.109,0.183,.086,.014,signal,side);
    }
    T.mouth(head,U,0,-0.07,0.189,.72,signal);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.31,0.83,.085,0.256,.054,dark,light));
  },
};
