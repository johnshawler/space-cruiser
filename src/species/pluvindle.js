/* Pluvindle: A low raincloud on dangling droplet legs measures weather in teaspoons. */
SPECIES_EXTRA.pluvindle = {
  name:"Pluvindle", kind:"pluvindle", family:"alien", skin:"fuzzy",
  script:"dots", col:"#9a9bd6", hue:239, sat:42, lit:63,
  syl:["plu", "vin", "dul", "om", "ni", "wep", "lir", "du"],
  voice:{wave:"sine",base:196,range:.58,rate:5,glide:.56,vib:4,vibAmt:10,fx:"bubble",amp:.51},
  trait:"Issues very local forecasts in kitchen units.",
  chat:[
    "Forecast calls for two spoons by lunch. Use a deep saucer.",
    "I sneezed over the weather gauge and had to issue a correction.",
    "My drizzle license covers one windowsill at a time.",
    "A baker borrowed my forecast. The dough came out a bit cloudy.",
    "I'm saving a teaspoon of blue sky. The jar looks empty until you squint."
  ],
  greet:[
    "Local weather speaking. Where shall I put this sprinkle?",
    "Hello. You caught me between spoons."
  ],
  cargo:[
    "{good}, under a lid. The sender has met me before.",
    "Measuring spoons. The tablespoon is for severe weather only."
  ],
  joke:["I made a dry forecast. It stuck to the spoon."],
  nice:["Thank you. I'll leave a little rainbow by your step."],
  bye:["Fair weather to you. I've put the lid on."],
  honk:["One startled cloud, one splash. I'll get a cloth."],
  dock:[
    "Welcome to {port}. Today's weather fits in a cup.",
    "At {port} the blue awning marks the dry side of my desk."
  ],
  rumor:"The weather office on {planet} has a delivery bonus. Today's envelope is only lightly damp.",
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
    oval(head,body,0,0,-.01,.30,.25,.235);
    for(const [x,y,z,r] of [[-.294,0,-.04,.206],[.317,.015,-.057,.188],[-.12,.153,-.054,.205],[.154,.221,-.061,.242]]){
      oval(head,light,x,y,z,r,r*.85,r*.8);
    }
    const rain=[];
    for(const [x,stop] of [[-.24,.23],[-.065,.088],[.12,.157],[.285,.302]]){
      const line=new THREE.Group(); line.position.set(x,.85,0); rig.add(line);
      const reach=.85-stop;
      line.add(T.cyl(.013,.01,reach,dark,0,-reach/2,0,9));
      turned(line,light,[[.001,0],[.049,.014],[.066,.046],[.062,.077],[.033,.128],[.001,.181]],0,-reach-.086,0);
      rain.push(line);
    }
    U.gait=(phase,amount)=>{
      for(let i=0;i<rain.length;i++){
        const beat=phase*.85+i*1.7;
        rain[i].rotation.z=.14*Math.sin(beat)*amount;
        rain[i].scale.y=1-.15*(1-Math.cos(beat))*.5*amount;
      }
      rig.rotation.z=0; rig.position.y=.017*(1-Math.cos(phase))*amount;
    };

    for(const side of [-1,1]){
      T.eye(head,U,side*0.158,0.02,0.197,0.128,null,T.iris);
      T.brow(head,U,side*0.158,0.186,0.225,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.115,0.244,.86);
    T.blush(head,0.237,-0.075,0.181,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.416,0.861,.085,0.233,.054,body,light));
  },
};
