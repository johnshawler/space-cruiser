/* Nacrelle: A pearl nestled in a fan shell listens for the quietest noise in each port. */
SPECIES_EXTRA.nacrelle = {
  name:"Nacrelle", kind:"nacrelle", family:"alien", skin:"gloss",
  script:"curvy", col:"#dd8da5", hue:342, sat:54, lit:62,
  syl:["nah", "krel", "ell", "uvi", "ai", "sil", "eh", "lu"],
  voice:{wave:"sine",base:378,range:.36,rate:3.7,glide:.5,vib:4,vibAmt:8,fx:"chorus",amp:.40},
  trait:"Saves the tiny noises everyone else misses.",
  chat:[
    "The quietest thing at this dock is a biscuit cooling.",
    "I listened to a shell and heard my own kitchen. Fair enough.",
    "My microphone picked up a stamp drying. It was almost a song.",
    "Please hold still. There's a very small noise behind your larger one.",
    "I gave the library a recording of a page settling. They filed it under action."
  ],
  greet:[
    "Hello. You're coming through at just the right smallness.",
    "I had the gain turned up for dust. Give me a moment."
  ],
  cargo:[
    "{good}. The crate creaks beautifully when nobody asks it to.",
    "A soundproof box with something very quiet in it. Taking the sender's word."
  ],
  joke:["Someone sold me a silent bell. I've requested an audible receipt."],
  nice:["Thank you. I heard the smile first."],
  bye:["I'll keep a little quiet for your next visit."],
  honk:["That'll go in the other collection."],
  dock:[
    "Welcome to {port}. Listen for the soft click of the landing light.",
    "At {port} we have a quiet bay. It's the one beside the loud sign."
  ],
  rumor:"The softest voice on {planet} mentioned a freight bonus. I checked twice.",
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
    head.position.y=0.646;
    function plate(parent,material,outline,thickness,x,y,z){
      const shape=new THREE.Shape(outline.map(([px,py])=>new THREE.Vector2(px,py)));
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelSize:.017,bevelThickness:.015,bevelSegments:3});
      geometry.translate(0,0,-thickness/2);
      const mesh=new THREE.Mesh(geometry,material);
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    oval(rig,body,0,.131,-.03,.344,.131,.295);
    oval(rig,light,0,.31,.018,.316,.18,.278);
    const mantle=new THREE.Group();
    mantle.position.set(0,.18,-.14); rig.add(mantle);
    const seam=T.phys('#ffe9ce');
    plate(mantle,body,[[0,0],[-.25,.29],[-.427,.61],[-.474,.701],[-.345,.764],[-.209,.826],[0,.852],[.209,.826],[.345,.764],[.474,.701],[.427,.61],[.25,.29]],.045,0,0,-.095);
    for(let i=-4;i<=4;i++){
      const a=i*.151;
      const blade=plate(mantle,i%2?body:light,[[-.024,0],[-.074,.44],[-.08,.75],[-.054,.87],[0,.914],[.057,.873],[.084,.76],[.075,.43],[.024,0]],.044,0,0,-.013*Math.abs(i));
      blade.rotation.z=-a;
    }
    tube(mantle,seam,[[-.266,.342,0],[-.11,.162,.041],[0,.13,.045],[.11,.162,.041],[.266,.342,0]],.024);
    head.position.z=.102;
    oval(head,T.phys('#ffe2d7',{clearcoat:.85}),0,0,0,.244,.235,.225);
    U.gait=(phase,amount)=>{
      const scoop=(1-Math.cos(phase))*.5*amount;
      mantle.rotation.x=-.29*scoop;
      rig.position.y=.028*scoop; rig.rotation.z=.045*Math.sin(phase)*amount;
    };

    for(const side of [-1,1]){
      T.eye(head,U,side*0.14,0.025,0.2,0.12,null,T.iris);
      T.brow(head,U,side*0.14,0.183,0.228,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.105,0.24,.86);
    T.blush(head,0.219,-0.065,0.184,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.328,0.51,.085,0.241,.054,body,light));
  },
};
