/* Pipettle: A kettle-bellied marsh grazer whistles politely when the queue should move. */
SPECIES_EXTRA.pipettle = {
  name:"Pipettle", kind:"pipettle", family:"alien", skin:"gloss",
  script:"curvy", col:"#56d79d", hue:153, sat:62, lit:50,
  syl:["pip", "et", "tu", "weesh", "pel", "chi", "lo", "mai"],
  voice:{wave:"sine",base:452,range:.71,rate:6.4,glide:.58,vib:7,vibAmt:12,fx:"chirp",amp:.43},
  trait:"Makes waiting in line a point of civic pride.",
  chat:[
    "The queue has moved half a shoe. I'll keep the whistle warm.",
    "Somebody left a gap. We're taking turns looking after it.",
    "I lined up behind a coat stand yesterday. It was a very patient morning.",
    "My family knows I'm ready by the note I make through my left spout.",
    "I put a chair in line for me. It got called to the counter."
  ],
  greet:[
    "Hello. You're next, if you were behind the fern.",
    "Queue steward speaking. I've put my finger on your place."
  ],
  cargo:[
    "{good}. Each crate knows who it came after.",
    "A roll of numbered tickets. The roll has pulled a ticket of its own."
  ],
  joke:["The express line was empty. I joined it and spoiled the effect."],
  nice:["Thank you. The shine helps people see where the line bends."],
  bye:["Off you go. I'll mind your gap till it closes."],
  honk:["Nearly the right note. The line moved anyway."],
  dock:[
    "Welcome to {port}. Follow the queue until you meet someone facing you.",
    "At {port} there is a separate queue for asking where the queue is."
  ],
  rumor:"The line at {planet} is moving fast. They're paying extra for every delivery.",
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
    head.position.y=0.99;
    oval(rig,body,0,.57,0,.334,.332,.295);
    tube(rig,light,[[.22,.69,-.075],[.37,.79,-.085],[.51,.71,-.09],[.51,.55,-.09],[.29,.48,-.07]],.049);
    const nozzle=new THREE.Group();
    nozzle.position.set(-.309,.71,0);
    nozzle.rotation.z=.82;
    rig.add(nozzle);
    nozzle.add(T.cyl(.094,.082,.29,body,0,.09,0,20));
    nozzle.add(T.cyl(.107,.093,.045,light,0,.249,0,20));
    nozzle.add(T.cyl(.072,.072,.006,dark,0,.274,0,20));
    oval(head,light,0,0,0,.27,.225,.224);
    oval(head,body,0,.204,-.01,.22,.061,.181);
    oval(head,dark,0,.275,-.01,.059,.06,.058);

    for(const side of [-1,1]){
      T.eye(head,U,side*0.147,0.023,0.184,0.122,null,T.iris);
      T.brow(head,U,side*0.147,0.183,0.212,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.11,0.226,.86);
    T.blush(head,0.226,-0.07,0.168,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.391,0.68,.085,0.325,.054,body,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.15,0.24,0,0.18,.07,dark,null,light));
  },
};
