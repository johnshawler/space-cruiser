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
    head.position.y=0.656;
    function plate(parent,material,outline,thickness,x,y,z){
      const shape=new THREE.Shape(outline.map(([px,py])=>new THREE.Vector2(px,py)));
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelSize:.017,bevelThickness:.015,bevelSegments:3});
      geometry.translate(0,0,-thickness/2);
      const mesh=new THREE.Mesh(geometry,material);
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    // Each wing is a quilt of eight padded panels lofted from root to swept tip.
    const fabric=T.phys('#ffca80'), fins=[];
    oval(rig,dark,0,.115,-.025,.235,.115,.245);
    oval(rig,body,0,.358,-.058,.239,.278,.292);
    function point(u,v){
      const halfChord=.225*(1-.79*u);
      return [.513*u,.035+.29*u*u+.11*Math.sin(u*Math.PI)+(.25*(1-u)+.024)*v-.025*v*v, -.18*u+halfChord*v];
    }
    for(const side of [-1,1]){
      const fin=new THREE.Group();
      fin.position.set(side*.103,.61,-.005);
      fin.scale.x=side;
      rig.add(fin); fins.push(fin);
      for(let row=0;row<2;row++) for(let col=0;col<4;col++){
        const u=col/4, v=row-1;
        const corners=[point(u,v),point(u+.25,v),point(u+.25,v+1),point(u,v+1)];
        const pad=point(u+.125,v+.5);
        pad[1]+=.038;
        const underside=pad.slice(); underside[1]-=.079;
        const vertices=[];
        for(let j=0;j<4;j++){
          const a=corners[j], b=corners[(j+1)%4];
          vertices.push(...pad,...b,...a,...underside,...a,...b);
        }
        const geometry=new THREE.BufferGeometry();
        geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
        geometry.computeVertexNormals();
        const swatches=[body,light,dark,fabric];
        fin.add(new THREE.Mesh(geometry,swatches[(col+row*2)%4]));
      }
    }
    head.position.z=.10;
    oval(head,body,0,0,-.025,.264,.212,.233);
    tube(rig,dark,[[0,.42,-.22],[0,.64,-.327],[-.105,.88,-.321],[-.185,1.051,-.28]],.029);
    const pennant=plate(rig,light,[[0,-.05],[.083,.016],[.03,.115],[-.07,.059]],.03,-.184,1.066,-.28);
    const shoulders=T.cyl(.049,.049,0.48,body,0,0.49,.085,14);
    shoulders.rotation.z=Math.PI/2; rig.add(shoulders);
    U.gait=(phase,amount)=>{
      const stroke=Math.sin(phase*.72)*amount;
      rig.rotation.z=.055*stroke;
      rig.position.y=(1-Math.cos(phase*.72))*.048*amount;
      for(let i=0;i<2;i++){
        const side=i*2-1;
        fins[i].rotation.z=side*.34*stroke;
        fins[i].rotation.x=.13*Math.sin(phase*.72-.8)*amount;
      }
      pennant.rotation.z=.18*stroke;
    };

    for(const side of [-1,1]){
      T.eye(head,U,side*0.151,0.035,0.192,0.125,null,T.iris);
      T.brow(head,U,side*0.151,0.198,0.22,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.1,0.232,.86);
    T.blush(head,0.23,-0.06,0.176,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.24,0.49,.085,0.215,.054,body,light));
  },
};
