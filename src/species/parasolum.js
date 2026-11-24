/* Parasolum: A scalloped umbrella glider insures picnics against excessive sunshine. */
SPECIES_EXTRA.parasolum = {
  name:"Parasolum", kind:"parasolum", family:"alien", skin:"gloss",
  script:"dots", col:"#df77c5", hue:315, sat:62, lit:58,
  syl:["sha", "plu", "yi", "pem", "sil", "oro", "nu", "fli"],
  voice:{wave:"triangle",base:369,range:.53,rate:6,glide:.4,vib:5,vibAmt:10,fx:"chirp",amp:.46},
  trait:"Takes picnics personally, especially the paperwork.",
  chat:[
    "Clear skies again. People never read the fine print about clear skies.",
    "A sandwich in full sun is technically a toast claim.",
    "I can shade four elbows or one entire lunch. Please arrange yourselves.",
    "Yesterday a cloud parked above me. We split the shift.",
    "I follow picnics by the sound of lids coming off."
  ],
  greet:[
    "Weather desk speaking. Do you still have your sandwich?",
    "Hello, pilot. You sound comfortably overcast."
  ],
  cargo:[
    "{good}, plus a very large folded napkin for emergencies.",
    "Shade samples. Open the box in daylight or they all look alike."
  ],
  joke:["We covered a picnic for drizzle. It rained indoors. The ceiling filed separately."],
  nice:["Thank you. The scalloped edge was my grandmother's."],
  bye:["Stay in the nice bit between the shadows."],
  honk:["Perfect. That's the signal to put the lids back on."],
  dock:[
    "Welcome to {port}. Shade travels clockwise around the terminal.",
    "At {port} there's a bench under me. Take your time."
  ],
  rumor:"The picnic board on {planet} has added a delivery bonus. Even covered cargo qualifies.",
  build(T){
    const {rig,head,U,body,dark,light}=T;
    function oval(parent,material,x,y,z,rx,ry,rz){
      const mesh=T.sph(1,material,x,y,z,24,16);
      mesh.scale.set(rx,ry,rz);
      parent.add(mesh);
      return mesh;
    }
    head.position.y=0.97;
    function turned(parent,material,outline,x,y,z){
      const path=outline.map(([r,h])=>new THREE.Vector2(r,h));
      const mesh=new THREE.Mesh(new THREE.LatheGeometry(path,32),material);
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    turned(rig,light,[[.001,0],[.112,0],[.09,.20],[.12,.39],[.18,.47],[.001,.48]],0,.278,0);
    oval(head,body,0,-.04,0,.238,.25,.205);
    const canopy=new THREE.Group();
    canopy.position.y=.18; head.add(canopy);
    const gold=T.phys('#ffdb9b');
    for(let i=0;i<10;i++){
      const a=i*Math.PI/5,b=(i+1)*Math.PI/5, mid=(a+b)/2;
      const rib=(theta,r,y)=>[r*Math.sin(theta),y,r*.70*Math.cos(theta)];
      const crown=[0,.31,0], shoulder=rib(mid,.217,.203), tip=rib(mid,.568,-.099);
      const left=rib(a,.48,.008),right=rib(b,.48,.008);
      const points=[crown,shoulder,left, crown,right,shoulder, left,shoulder,tip, tip,shoulder,right];
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));
      g.computeVertexNormals();
      const m=i%2?light:body; m.side=THREE.DoubleSide;
      canopy.add(new THREE.Mesh(g,m));
      oval(canopy,gold,tip[0],tip[1],tip[2],.026,.032,.026);
    }
    oval(canopy,gold,0,.329,0,.046,.07,.046);
    const shoulders=T.cyl(.049,.049,0.44,light,0,0.72,.085,14);
    shoulders.rotation.z=Math.PI/2; rig.add(shoulders);
    U.gait=(phase,amount)=>{
      const gust=Math.sin(phase*.65)*amount;
      canopy.rotation.z=.16*gust;
      canopy.scale.y=1+.14*Math.sin(phase*1.3)*amount;
      rig.rotation.z=-.055*gust;
    };

    for(const side of [-1,1]){
      T.eye(head,U,side*0.145,-0.025,0.187,0.121,null,T.iris);
      T.brow(head,U,side*0.145,0.134,0.215,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.162,0.22,.86);
    T.blush(head,0.224,-0.122,0.171,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.22,0.72,.085,0.3,.054,body,light));
    U.legs=[-1,1].map(side=>T.limb(rig,side*0.13,0.25,0,0.19,.07,dark,null,light));
  },
};
