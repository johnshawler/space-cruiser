/* Wickindle: A waxy little night gardener carries a steady pearl of light in a curling wick. */
SPECIES_EXTRA.wickindle = {
  name:"Wickindle", kind:"wickindle", family:"alien", skin:"gloss",
  script:"dots", col:"#f1d76f", hue:48, sat:82, lit:60,
  syl:["wi", "kin", "sel", "di", "li", "rim", "fen", "ish"],
  voice:{wave:"sine",base:444,range:.41,rate:5.6,glide:.29,vib:7,vibAmt:9,fx:"chirp",amp:.38},
  trait:"Whispers so the night flowers can sleep.",
  chat:[
    "I plant night flowers. If I lean too close they decide it's morning.",
    "Quiet shift. I tucked the last moth into a lampshade.",
    "The seed packet says full moon. I've been standing here doing my best.",
    "Please dim your cabin. The shy buds are rehearsing.",
    "One blossom stayed open past dawn. We gave it overtime."
  ],
  greet:[
    "Hello. The garden is asleep but I can whisper.",
    "Good evening, whatever your clock claims."
  ],
  cargo:[
    "{good}. I wrapped the corners so they won't wake the bulbs.",
    "Curtains for an observatory greenhouse. The stars like some privacy."
  ],
  joke:["My sundial is on nights now. It has remarkably little to report."],
  nice:["How kind. I keep a spare glow for evenings like this."],
  bye:["Sleep well when your sky gets round to it."],
  honk:["Ah. All the tulips are up."],
  dock:[
    "Welcome to {port}. The little lights by your pad are still growing.",
    "At {port} please leave the night beds dark. The path has its own glow."
  ],
  rumor:"The midnight shift on {planet} is paying extra for freight. Knock softly.",
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
    head.position.y=0.95;
    oval(rig,body,0,.53,0,.247,.35,.225);
    oval(head,body,0,0,0,.285,.30,.235);
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;
      oval(head,light,Math.sin(a)*.195,.203,Math.cos(a)*.145,.091,.08+(i%3)*.025,.08);
    }
    tube(head,dark,[[0,.24,0],[-.04,.34,0],[-.12,.42,0],[-.085,.52,0],[0,.54,0]],.026);
    oval(head,T.glow('#ffce82',1.4),.026,.54,0,.075,.10,.075);

    for(const side of [-1,1]){
      T.eye(head,U,side*0.15,0.015,0.195,0.125,null,T.iris);
      T.brow(head,U,side*0.15,0.178,0.223,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.125,0.235,.86);
    T.blush(head,0.229,-0.085,0.179,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.291,0.68,.085,0.32,.054,body,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.13,0.24,0,0.18,.07,dark,null,light));
  },
};
