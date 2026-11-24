/* Cuspiro: A crescent-headed dune grazer lends the space between its horns to small birds. */
SPECIES_EXTRA.cuspiro = {
  name:"Cuspiro", kind:"cuspiro", family:"alien", skin:"gloss",
  script:"angular", col:"#d2da5d", hue:64, sat:63, lit:52,
  syl:["cus", "pi", "oro", "vee", "lum", "dak", "su", "rei"],
  voice:{wave:"triangle",base:187,range:.33,rate:4.7,glide:.35,vib:4,vibAmt:6,fx:"none",amp:.52},
  trait:"Considers birds family until they fly the nest.",
  chat:[
    "The space over my head is occupied until migration season.",
    "Two nestlings have learned to steer. We turn left quite a lot.",
    "A bird brought its own twig. I appreciate a furnished tenant.",
    "Customs counts my passengers after every sneeze.",
    "I bought a sun hat. The birds are using it as a veranda."
  ],
  greet:[
    "Hello. The little voice you hear is the upstairs neighbour.",
    "Please give me a minute to turn my passengers toward the radio."
  ],
  cargo:[
    "{good}, plus nesting twine in case the road is bumpy.",
    "Tiny curtains. The birds want separate bedrooms this year."
  ],
  joke:["I asked the birds for rent. They paid me in things that looked like rent from very high up."],
  nice:["Thank you. I'll pass that along to the decorator on my left horn."],
  bye:["Safe flight from everyone on this head."],
  honk:["The nestlings liked that. Now they want one."],
  dock:[
    "Welcome to {port}. Mind your step under the arrivals perch.",
    "At {port} the birds will show you the terminal. They may stop for crumbs."
  ],
  rumor:"A bird from {planet} tucked the new freight rates in my ear. Deliveries pay extra.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=0.914;
    function plate(parent,material,outline,thickness,x,y,z){
      const shape=new THREE.Shape(outline.map(([px,py])=>new THREE.Vector2(px,py)));
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelSize:.017,bevelThickness:.015,bevelSegments:3});
      geometry.translate(0,0,-thickness/2);
      const mesh=new THREE.Mesh(geometry,material);
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    oval(rig,body,0,.554,-.03,.265,.322,.214);
    oval(head,body,0,-.035,0,.286,.245,.235);
    const hornTip=T.phys('#ffedbb'), horns=new THREE.Group(); head.add(horns);
    for(const side of [-1,1]){
      const sweep=plate(horns,body,[[.148,.055],[.345,.042],[.49,.157],[.537,.331],[.485,.478],[.372,.526],[.43,.402],[.425,.277],[.343,.202],[.176,.202]],.114,0,0,-.04);
      sweep.scale.x=side;
      const cap=plate(horns,hornTip,[[.485,.478],[.372,.526],[.301,.51],[.38,.473],[.43,.402]],.093,0,0,-.04);
      cap.scale.x=side;
    }
    const shoulders=T.cyl(.049,.049,0.584,body,0,0.622,.085,14);
    shoulders.rotation.z=Math.PI/2; rig.add(shoulders);
    U.gait=(phase,amount)=>{
      const stride=Math.sin(phase)*amount;
      horns.rotation.x=.13*Math.abs(stride);
      rig.rotation.z=.105*stride; rig.position.y=.029*Math.abs(stride);
    };

    for(const side of [-1,1]){
      T.eye(head,U,side*0.157,0.01,0.206,0.127,null,T.iris);
      T.brow(head,U,side*0.157,0.175,0.234,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.127,0.253,.86);
    T.blush(head,0.236,-0.087,0.19,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.292,0.622,.085,0.284,.054,body,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.15,0.27,0,0.21,.07,dark,null,light));
  },
};
