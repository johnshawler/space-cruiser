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
    head.position.y=1.07;
    const glass=T.phys('#101d2a',{roughness:.17,clearcoat:1});
    const signal=T.glow('#ffd2a7',1.65);
    const phosphor=T.glow(T.iris,2.2);
    rig.add(T.rbox(.44,.104,.342,.036,dark,0,.085,0));
    rig.add(T.rbox(.47,.055,.35,.02,body,0,.162,0));
    const coil=[];
    for(let i=0;i<=48;i++){
      const angle=i*Math.PI/6;
      coil.push([.12*Math.cos(angle),.194+i*.0073,.12*Math.sin(angle)]);
    }
    tube(rig,light,coil,.024);
    rig.add(T.rbox(.517,.249,.375,.055,body,0,.695,0));
    rig.add(T.cyl(.081,.099,.17,light,0,.892,0,16));
    head.add(T.rbox(.484,.327,.321,.056,body));
    head.add(T.rbox(.42,.27,.032,.014,glass,0,0,.168));
    head.add(T.cyl(.065,.08,.106,dark,0,.243,0,16));
    oval(head,light,0,.333,0,.153,.084,.104);
    oval(head,signal,0,.34,.097,.041,.025,.011);

    for(const side of [-1,1]){
      const gaze=new THREE.Group();
      gaze.position.set(side*0.126,0.017,0.113);
      head.add(gaze);
      U.looks.push(gaze);
      const pixel=oval(gaze,phosphor,0,0,.083,0.0568,0.0726,.016);
      pixel.userData.sy=pixel.scale.y;
      U.eyes.push(pixel);
      const glint=T.sph(.17,T.catchM,-.22,.25,.93,10,8);
      pixel.add(glint);
      T.brow(head,U,side*0.126,0.113,0.192,.086,.014,signal,side);
    }
    T.mouth(head,U,0,-0.09,0.201,.72,signal);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.338,0.761,.085,0.316,.054,dark,light));
  },
};
