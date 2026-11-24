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
    head.position.y=0.517;
    const sole=oval(rig,light,.025,.145,.015,.47,.145,.355);
    oval(rig,body,.12,.34,.077,.34,.24,.29);
    const shell=new THREE.Group();
    shell.position.set(-.13,.827,-.085);
    shell.rotation.set(-.08,-.30,-.13);
    rig.add(shell);
    oval(shell,body,0,0,0,.373,.408,.219);
    // A tapered tube forms the outside of the shell itself, including the flared last turn.
    const vertices=[], triangles=[], centres=[];
    const turns=58, sides=14;
    for(let i=0;i<=turns;i++){
      const t=i/turns, a=-.93+t*Math.PI*3.5, reach=.023+.365*t**1.8;
      const x=Math.cos(a)*reach, y=Math.sin(a)*reach*1.06;
      const section=.031+.10*t+.046*t**12;
      const shellFront=.219*Math.sqrt(Math.max(0,1-(x/.373)**2-(y/.408)**2));
      centres.push([x,y,Math.max(shellFront,.096+section*1.22)+.012]);
      for(let j=0;j<sides;j++){
        const b=j*2*Math.PI/sides;
        vertices.push(x+Math.cos(a)*section*Math.cos(b),y+Math.sin(a)*section*Math.cos(b),
          .096+section*1.22*Math.sin(b));
        if(i<turns){
          const next=(j+1)%sides, base=i*sides;
          triangles.push(base+j,base+sides+j,base+next,base+next,base+sides+j,base+sides+next);
        }
      }
    }
    const whorl=new THREE.BufferGeometry();
    whorl.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    whorl.setIndex(triangles); whorl.computeVertexNormals();
    body.side=THREE.DoubleSide;
    shell.add(new THREE.Mesh(whorl,body));
    // The ridge grows from a pinhead into a raised outer whorl on the forward face.
    const lip=T.phys('#ffcf8d');
    tube(shell,lip,centres,.028);
    const openEnd=new THREE.Group();
    const last=centres[turns], a=-.93+Math.PI*3.5;
    openEnd.position.set(last[0],last[1],.096);
    openEnd.rotation.z=a-Math.PI/2;
    shell.add(openEnd);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.16,.026,9,30),lip);
    rim.rotation.y=Math.PI/2; openEnd.add(rim);
    oval(openEnd,dark,0,0,0,.022,.147,.161);
    head.position.set(.287,.489,.193);
    oval(head,light,0,-.006,0,.253,.225,.206);
    const feelers=[];
    for(const side of [-1,1]){
      const stalk=new THREE.Group();
      stalk.position.set(side*.132,.144,-.012);
      head.add(stalk);
      tube(stalk,body,[[0,0,0],[side*.014,.105,0],[side*.045,.197,.024]],.029);
      oval(stalk,light,side*.045,.208,.024,.052,.056,.052);
      feelers.push(stalk);
    }
    U.gait=(phase,amount)=>{
      const reach=Math.sin(phase)*amount;
      rig.rotation.z=0; rig.position.y=0;
      sole.scale.z=.355*(1+.13*reach);
      sole.position.z=.015+.041*reach;
      shell.rotation.z=-.13+.068*Math.sin(phase-.8)*amount;
      shell.position.y=.827+.015*Math.sin(phase-.6)*amount;
      feelers[0].rotation.x=.14*reach; feelers[1].rotation.x=-.09*reach;
    };

    for(const side of [-1,1]){
      T.eye(head,U,side*0.129,0.024,0.171,0.115,null,T.iris);
      T.brow(head,U,side*0.129,0.177,0.199,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.1,0.201,.86);
    T.blush(head,0.208,-0.06,0.155,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.33,0.48,.085,0.23,.054,body,light));
  },
};
