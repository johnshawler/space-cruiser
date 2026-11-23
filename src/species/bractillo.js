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
    oval(rig,body,0,.52,0,.29,.355,.255);
    for(let i=0;i<7;i++){
      const a=i*Math.PI*2/7;
      const bract=oval(rig,i%2?light:dark,Math.sin(a)*.22,.52,Math.cos(a)*.17,.134,.255,.108);
      bract.rotation.y=a;
      bract.rotation.z=-Math.sin(a)*.31;
    }
    oval(head,body,0,0,0,.295,.302,.265);
    const inside=T.phys('#e2ed95');
    for(const side of [-1,1]){
      const leaf=oval(head,light,side*.12,.30,-.035,.097,.232,.053);
      leaf.rotation.z=-side*.52;
      const vein=oval(head,inside,side*.126,.306,.009,.016,.157,.012);
      vein.rotation.z=-side*.52;
    }

    for(const side of [-1,1]){
      T.eye(head,U,side*0.142,0.06,0.215,0.128,null,T.iris);
      T.brow(head,U,side*0.142,0.226,0.243,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.086,0.268,.86);
    T.blush(head,0.221,-0.046,0.199,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.345,0.67,.085,0.31,.054,body,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.14,0.25,0,0.19,.07,dark,null,light));
  },
};
