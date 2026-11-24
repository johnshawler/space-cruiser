/* Bractillo: A walking seed pod with overlapping leaves packs lunches for migrating birds. */
SPECIES_EXTRA.bractillo = {
  name:"Bractillo", kind:"bractillo", family:"alien", skin:"matte",
  script:"angular", col:"#81cd60", hue:102, sat:52, lit:50,
  syl:["brak", "til", "lo", "kus", "pep", "ril", "sa", "om"],
  voice:{wave:"triangle",base:243,range:.43,rate:6.2,glide:.27,vib:5,vibAmt:7,fx:"none",amp:.48},
  trait:"Believes a packed lunch is a flight essential.",
  chat:[
    "My advice to young birds is always pack a second lunch.",
    "I folded a map into a sandwich. Now the crumbs know the route.",
    "A flock took off with my picnic bench. Very well organised birds.",
    "The early birds wanted breakfast. The late ones wanted the same breakfast warmed up.",
    "One passenger ate the itinerary. He can still point north."
  ],
  greet:[
    "Lunch desk speaking. How far are you flying?",
    "Hello, traveller. I've cut the crusts off the long route."
  ],
  cargo:[
    "{good}, underneath the seed cakes. The cakes travel better upstairs.",
    "Lunch bags with perches stitched on. Nobody has to eat standing up."
  ],
  joke:["I offered a bird a light lunch. It dropped the heavy bits."],
  nice:["Thank you. There's a biscuit in the side hatch for you."],
  bye:["Come home hungry. We'll take it from there."],
  honk:["That's my cue for second breakfast."],
  dock:[
    "Welcome to {port}. Set your lunch on the shelf above the feeder.",
    "At {port} the picnic queue is open to pilots of every wingspan."
  ],
  rumor:"The flock on {planet} voted to pay extra for freight. They need lunch before the wind changes.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=0.87;
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
    turned(rig,body,[[.001,0],[.14,.06],[.249,.25],[.213,.46],[.12,.53],[.001,.56]],0,.247,0);
    const scales=[];
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4, root=new THREE.Group();
      root.position.set(.15*Math.sin(a),.295,.125*Math.cos(a));
      root.rotation.y=a; rig.add(root);
      const blade=plate(root,i%2?light:dark,[[0,0],[-.095,.105],[-.124,.255],[-.085,.39],[0,.505],[.085,.39],[.124,.255],[.095,.105]],.053,0,0,0);
      blade.rotation.x=.51; scales.push(blade);
    }
    oval(head,body,0,0,0,.256,.263,.249);
    const sprig=plate(head,light,[[-.027,0],[-.17,.10],[-.21,.265],[-.10,.25],[.012,.13],[.098,.29],[.24,.35],[.18,.135],[.045,.023]],.04,0,.185,-.015);
    const shoulders=T.cyl(.049,.049,0.716,body,0,0.716,.085,14);
    shoulders.rotation.z=Math.PI/2; rig.add(shoulders);
    U.gait=(phase,amount)=>{
      for(let i=0;i<scales.length;i++) scales[i].rotation.x=.51+.14*Math.sin(phase+i*Math.PI/4)*amount;
      sprig.rotation.z=.18*Math.sin(phase-.45)*amount;
      rig.rotation.z=.09*Math.sin(phase)*amount;
    };

    for(const side of [-1,1]){
      T.eye(head,U,side*0.142,0.06,0.215,0.128,null,T.iris);
      T.brow(head,U,side*0.142,0.226,0.243,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.086,0.268,.86);
    T.blush(head,0.221,-0.046,0.199,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.358,0.716,.085,0.27,.054,body,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.14,0.25,0,0.19,.07,dark,null,light));
  },
};
