/* Whorloo: A round-footed courier with a great spiral shell rents out the spare room. */
SPECIES_EXTRA.whorloo = {
  name:"Whorloo", kind:"whorloo", family:"alien", skin:"gloss",
  script:"curvy", col:"#e7ac6a", hue:32, sat:72, lit:57,
  syl:["who", "rol", "noo", "am", "lo", "vun", "til", "oom"],
  voice:{wave:"sine",base:172,range:.34,rate:3.9,glide:.42,vib:3,vibAmt:7,fx:"bubble",amp:.54},
  trait:"Treats a mortgage as a form of outerwear.",
  chat:[
    "The shell has a guest room. The hallway is most of it.",
    "My tenant wants a sea view. I turn left when we pass water.",
    "Someone knocked on the back door. It was the front door, one lap later.",
    "I had a rug made for the landing. The carpet fitter is still turning.",
    "Forward my mail to wherever I am facing."
  ],
  greet:[
    "Welcome to my doorstep. It's the bit just behind the radio.",
    "Hello from the owner, occupant and vehicle."
  ],
  cargo:[
    "{good}. Top landing, past the first three welcome mats.",
    "A straight staircase. The architect wants a second opinion."
  ],
  joke:["My listing says the flat is around the corner. All of it is."],
  nice:["Thank you. I finally polished the upstairs outside."],
  bye:["Come round sometime. It's the only way in."],
  honk:["I'll tell the tenant their taxi is here."],
  dock:[
    "Welcome to {port}. I keep a spare key under the smallest bollard.",
    "Make yourself at home at {port}. I already have."
  ],
  rumor:"The tenants on {planet} voted for higher delivery pay. The landlord was outvoted by one.",
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
    head.position.y=0.73;
    oval(rig,light,0,.191,.025,.40,.19,.37);
    oval(rig,body,0,.43,.055,.34,.30,.29);
    const amber=T.phys('#ffd7a1');
    const shell=oval(rig,body,-.04,.79,-.12,.45,.53,.29);
    shell.rotation.z=-.19;
    const coil=[];
    for(let i=0;i<=48;i++){
      const a=i*.19, r=.021+i*.0078;
      coil.push([-.04+Math.cos(a)*r,.80+Math.sin(a)*r,-.10-Math.sqrt(1-(r/.49)**2)*.29]);
    }
    tube(rig,amber,coil,.028);
    T.head.position.z=.19;
    oval(head,light,0,-.01,0,.30,.255,.222);
    for(const side of [-1,1]){
      const feeler=oval(head,body,side*.15,.24,0,.038,.14,.04);
      feeler.rotation.z=-side*.22;
      oval(head,light,side*.18,.37,0,.053,.053,.053);
    }

    for(const side of [-1,1]){
      T.eye(head,U,side*0.15,0.02,0.174,0.124,null,T.iris);
      T.brow(head,U,side*0.15,0.182,0.202,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.125,0.228,.86);
    T.blush(head,0.229,-0.085,0.158,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.39,0.62,.085,0.28,.054,body,light));
  },
};
