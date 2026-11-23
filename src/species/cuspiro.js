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
    function tube(parent,material,points,radius){
      const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
      const geometry=new THREE.TubeGeometry(curve,Math.max(16,points.length*2),radius,8,false);
      parent.add(new THREE.Mesh(geometry,material));
    }
    head.position.y=1.02;
    oval(rig,body,0,.58,0,.285,.35,.245);
    oval(head,body,0,-.01,0,.306,.257,.252);
    const horn=T.phys('#ffe5ab');
    for(const side of [-1,1]){
      const points=[[.205,.09,0],[.34,.14,0],[.422,.25,-.016],[.408,.365,-.035],[.34,.431,-.05]];
      tube(head,body,points.map(([x,y,z])=>[x*side,y,z]),.082);
      oval(head,horn,side*.335,.434,-.05,.076,.07,.072);
    }

    for(const side of [-1,1]){
      T.eye(head,U,side*0.157,0.01,0.206,0.127,null,T.iris);
      T.brow(head,U,side*0.157,0.175,0.234,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.127,0.253,.86);
    T.blush(head,0.236,-0.087,0.19,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.335,0.76,.085,0.36,.054,body,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.15,0.27,0,0.21,.07,dark,null,light));
  },
};
