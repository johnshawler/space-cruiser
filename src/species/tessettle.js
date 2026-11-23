/* Tessettle: A broad gliding ray with a patchwork back remembers routes as quilt patterns. */
SPECIES_EXTRA.tessettle = {
  name:"Tessettle", kind:"tessettle", family:"alien", skin:"matte",
  script:"angular", col:"#ac76d6", hue:274, sat:54, lit:56,
  syl:["tes", "set", "ti", "lo", "vai", "fim", "il", "sha"],
  voice:{wave:"triangle",base:277,range:.47,rate:5.4,glide:.38,vib:5,vibAmt:7,fx:"chorus",amp:.49},
  trait:"Will mend your map while you sleep under it.",
  chat:[
    "The turn at {planet} is two purple squares after the service station.",
    "I slept under the navigation quilt. Woke up knowing a shortcut.",
    "I've run out of yellow thread. No more eastbound trips today.",
    "My aunt sewed a detour into my sleeve. It goes past her house.",
    "The long way home takes a whole extra spool."
  ],
  greet:[
    "Hello. I have your lane here in running stitch.",
    "Tell me which way the loose end points. I'll find you."
  ],
  cargo:[
    "{good}, covered by the winter edition of the star chart.",
    "Thimbles for the cartographers. The outer belt is rather prickly."
  ],
  joke:["I sewed a shortcut across the quilt. Now it only covers one knee."],
  nice:["Thank you. I hemmed it in orbit."],
  bye:["Follow the blue seam until the lights come on."],
  honk:["That's the sound my needle makes at a toll gate."],
  dock:[
    "Welcome to {port}. The landing strip is the wide grey stripe.",
    "At {port} I can mend a torn route while you unload."
  ],
  rumor:"The star quilt marks {planet} in gold thread. They're paying extra for deliveries.",
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
    head.position.y=0.74;
    oval(rig,dark,0,.13,0,.285,.13,.25);
    oval(rig,body,0,.399,-.023,.335,.261,.305);
    for(const side of [-1,1]){
      const wing=oval(rig,body,side*.33,.578,-.065,.27,.10,.283);
      wing.rotation.z=side*.265;
      for(let i=0;i<3;i++){
        const patch=oval(rig,i%2?dark:light,side*(.30+i*.093),.675+i*.016,-.07+(i%2)*.085,.054,.012,.084);
        patch.rotation.z=side*.265;
      }
    }
    T.head.position.z=.065;
    oval(head,light,0,0,0,.30,.225,.23);
    tube(rig,dark,[[0,.49,-.22],[0,.69,-.33],[-.06,.91,-.35],[-.12,1.11,-.31]],.038);
    const pennant=oval(rig,light,-.122,1.153,-.307,.099,.109,.041);
    pennant.rotation.z=.45;

    for(const side of [-1,1]){
      T.eye(head,U,side*0.151,0.035,0.192,0.125,null,T.iris);
      T.brow(head,U,side*0.151,0.198,0.22,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.1,0.232,.86);
    T.blush(head,0.23,-0.06,0.176,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.375,0.563,.085,0.29,.054,body,light));
  },
};
