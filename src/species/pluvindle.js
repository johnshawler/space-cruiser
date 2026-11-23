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
    head.position.y=0.91;
    oval(head,body,0,0,-.01,.305,.27,.255);
    for(const [x,y,z,r] of [[-.28,.02,-.05,.213],[.28,.04,-.05,.216],[-.155,.18,-.06,.202],[.12,.21,-.06,.205]]){
      oval(head,light,x,y,z,r,r*.88,r*.8);
    }
    for(let i=0;i<3;i++){
      const x=(i-1)*.168, y=.12+(i%2)*.054;
      rig.add(T.cyl(.018,.018,.74-y,dark,x,(.74+y)/2,0,10));
      oval(rig,light,x,y,0,.078,.119,.067);
    }

    for(const side of [-1,1]){
      T.eye(head,U,side*0.158,0.02,0.197,0.128,null,T.iris);
      T.brow(head,U,side*0.158,0.186,0.225,.119,.021,T.browM,side);
    }
    T.mouth(head,U,0,-0.115,0.244,.86);
    T.blush(head,0.237,-0.075,0.181,.061);
    U.arms=[-1,1].map(side=>T.limb(rig,side*0.399,0.76,.085,0.29,.054,body,light));
  },
};
