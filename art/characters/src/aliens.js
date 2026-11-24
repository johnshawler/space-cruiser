import {group,oval,box,strut,tube,loft,plate,ring,eye,leaf,bolt,fingers,sides,tau,ivory,leather,brass,dark,ink,teal,copper,jade,V} from './sculpt.js';

export function orris(p){
  const skin='#5f9d8b',belly='#b9d79f',lip='#7a4d60',coat='#a4573f';
  loft(p,'Pear-shaped trunk',skin,[[.33,.32,.28],[.45,.55,.42],[.78,.70,.52],[1.09,.71,.52],[1.38,.59,.44],[1.62,.46,.36],[1.7,.29,.27]]);
  oval(p,'Golden belly',belly,[0,.94,.26],[.59,.65,.3]);
  for(const s of sides){
    oval(p,'Haunch',skin,[s*.44,.46,-.03],[.34,.38,.37]);oval(p,'Webbed foot',skin,[s*.44,.17,.17],[.31,.16,.37]);
    for(let i=-1;i<2;i++)oval(p,'Toe pad',belly,[s*.44+i*.15,.105,.44-Math.abs(i)*.05],[.10,.075,.16]);
    loft(p,'Vest panel',coat,[[.97,.17,.22,s*.49,.14],[1.02,.21,.30,s*.46,.12],[1.32,.18,.32,s*.45,.13],[1.62,.17,.24,s*.34,.08]]);
    box(p,'Bellows pocket','#bf6c4f',[s*.48,1.13,.39],[.23,.23,.10],.035);
    box(p,'Pocket flap','#d78a5c',[s*.48,1.22,.45],[.25,.08,.025],.018);bolt(p,[s*.48,1.20,.474],.022);
    tube(p,'Piped lapel','#efc66a',[[s*.28,1.69,.17],[s*.34,1.5,.39],[s*.32,1.25,.46],[s*.32,.99,.42]],.022);
  }
  oval(p,'Back of vest',coat,[0,1.31,-.25],[.56,.39,.26]);
  const h=group(p,'Neck and head',[0,1.58,0]);h.rotation.z=-.14;h.rotation.x=.10;
  loft(h,'Flexible neck',belly,[[0,.28,.26],[.07,.33,.29],[.25,.29,.25,0,-.04],[.47,.32,.27,0,-.01],[.58,.41,.30]]);
  for(let j=0;j<3;j++)ring(h,'Throat fold',skin,[0,.10+j*.103,-.017],.29,.022,[1,.88,1],[Math.PI/2,0,0]);
  loft(h,'Amphibian skull',skin,[[.43,.24,.22,0,.05],[.49,.41,.32,0,.06],[.65,.53,.37],[.88,.54,.38],[1.07,.42,.31,0,-.04],[1.16,.20,.16,0,-.06],[1.18,.035,.04]]);
  for(const s of sides){
    const e=eye(h,[s*.28,.83,.285],.185,'#537552',s*.1);
    oval(e,'Heavy upper lid',skin,[0,.097,-.005],[.205,.124,.148],[.3,0,s*.09]);
    tube(h,'Lower eye fold',belly,[[s*.44,.75,.24],[s*.31,.68,.354],[s*.17,.71,.36]],.025);
    for(let j=0;j<4;j++)oval(h,'Cheek freckle','#2f6b5c',[s*(.29+j*.047),.64+.026*(j%2),.325-j*.027],[.014,.012,.009]);
  }
  for(const s of sides)leaf(h,'Frond ear','#7fb86a',[s*.36,.95,.05],[s*.78,1.18,-.10],.16);
  oval(h,'Snout',belly,[0,.665,.32],[.16,.11,.10]);for(const s of sides)oval(h,'Nostril',leather,[s*.065,.688,.407],[.021,.012,.009]);
  oval(h,'Mouth opening',lip,[0,.558,.332],[.126,.038,.035]);tube(h,'Pursed lower lip','#d58b69',[[-.12,.557,.35],[0,.529,.38],[.12,.562,.35]],[.01,.036,.01]);
  const tray=group(p,'Seed tray',[.10,1.12,.64]);tray.rotation.x=.12;
  box(tray,'Slatted tray','#c49254',[0,0,0],[.62,.10,.34],.02);box(tray,'Soil bed','#4a3c30',[0,.045,0],[.56,.03,.29],.01);
  for(const [x,h2,c] of [[-.18,.20,'#79b65a'],[0,.27,'#8cc865'],[.18,.17,'#6aa54f']]){tube(tray,'Sprout stem','#5f8f45',[[x,.05,0],[x+.01,.05+h2*.6,0],[x-.01,.05+h2,0]],[.014,.012,.009]);
    leaf(tray,'Seed leaf',c,[x,.05+h2,0],[x-.09,.08+h2,.02],.05);leaf(tray,'Seed leaf',c,[x,.05+h2,0],[x+.09,.09+h2,.02],.05);}
  tube(p,'Supporting arm',skin,[[-.50,1.53,.04],[-.64,1.26,.18],[-.44,1.11,.52],[-.11,1.13,.71]],[.15,.145,.12,.09]);
  oval(p,'Palm',belly,[-.07,1.13,.72],[.145,.09,.10]);fingers(p,[-.09,1.14,.75],[.09,1.18,.78],belly,.044,.032);
  tube(p,'Inspecting arm',skin,[[.52,1.53,.04],[.70,1.46,.24],[.63,1.68,.52],[.48,1.87,.62]],[.155,.14,.11,.083]);
  oval(p,'Palm',belly,[.46,1.87,.63],[.11,.09,.085]);tube(p,'Curled forefinger',belly,[[.49,1.89,.63],[.46,1.97,.66],[.37,1.98,.66],[.34,1.93,.65]],[.042,.039,.031,.018]);tube(p,'Thumb',belly,[[.43,1.84,.65],[.37,1.85,.67],[.34,1.9,.66]],[.045,.035,.02]);
}

export function vela(p){
  const mantle='#53568b',deep='#37365d',rim='#8d79a6',soft='#8175a2';
  const h=group(p,'Fan mantle',[0,1.80,0]);
  const fanRows=[];
  for(let i=0;i<=18;i++){
    const t=i/18,theta=t*Math.PI,wide=Math.sin(theta),bend=Math.sin(theta*1.7);
    fanRows.push([-.06+t*.96,.008+wide*(.86+.085*bend),.012+wide*.345,-.26+t*.35,-.06-.15*wide]);
  }
  const mantleMesh=loft(h,'Broad fluted mantle',mantle,fanRows,72);
  const pos=mantleMesh.geometry.attributes.position,colors=[];
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),edge=Math.abs(x+.06),wave=Math.cos(12*x+4*y),t=Math.min(1,edge**1.35);
    pos.setXYZ(i,x,y- .29*t + .12*wave*t, z+.105*wave*t-.10*t);
    const band=Math.sin(17*x+3.4*y+Math.sin(6*y)*.9);colors.push(.72+.26*band*band,.76+.18*(.5+.5*Math.cos(7*x)),.87+.12*band*band);
  }
  mantleMesh.geometry.setAttribute('color',new (pos.constructor)(colors,3));
  mantleMesh.material=mantleMesh.material.clone();mantleMesh.material.vertexColors=true;mantleMesh.geometry.computeVertexNormals();
  oval(h,'Eye socket',mantle,[.13,.23,.10],[.342,.25,.196]);
  for(const s of sides)for(let k=0;k<3;k++){
    const x=s*(.36+k*.14);tube(h,'Mantle piping',k%2?soft:'#607998',[[s*.1,.38,.20],[x*.6,.53,.175],[x*.84,.59-k*.03,.09],[x,.53-k*.055,-.025]],[.018,.024,.017,.006]);
  }
  loft(p,'Siphon neck',soft,[[1.44,.16,.15],[1.56,.135,.14],[1.81,.14,.16],[1.99,.25,.23]]);
  for(let k=0;k<3;k++)ring(p,'Siphon bands','#566786',[0,1.55+.06*k,0],.146,.016,[1,1,1],[Math.PI/2,0,0]);
  const e=eye(h,[.18,.27,.29],.215,'#91b8a3',-.12);oval(e,'Overhanging lid',mantle,[0,.105,.004],[.234,.123,.16],[.17,0,-.09]);
  tube(h,'Hooked beak',ink,[[.16,.07,.236],[.19,-.01,.31],[.186,-.095,.29]],[.073,.053,.007]);
  const paths=[
    [[0,1.54,0],[-.23,1.26,.10],[-.40,.93,.2],[-.72,.70,.14],[-.73,.48,.09],[-.64,.38,.12]],
    [[-.03,1.54,-.05],[-.13,1.12,-.16],[-.28,.76,-.26],[-.31,.43,-.14],[-.48,.18,.02],[-.44,.10,.1]],
    [[0,1.54,.03],[.10,1.22,-.04],[.21,.86,-.12],[.02,.50,.06],[.08,.24,.20],[-.03,.10,.25]],
    [[.07,1.54,-.06],[.39,1.2,-.17],[.52,.89,-.12],[.39,.57,.01],[.46,.39,.09],[.59,.33,.12]],
    [[-.04,1.54,.04],[-.32,1.36,.27],[-.45,1.42,.51],[-.15,1.50,.53],[-.04,1.51,.54]],
    [[.03,1.5,.03],[.41,1.26,.22],[.64,1.39,.38],[.74,1.44,.47],[.69,1.53,.53]]];
  paths.forEach((q,i)=>{tube(p,'Tapered ribbon arm '+(i+1),i%2?mantle:soft,q,q.map((_,j)=>.145*(1-j/(q.length-1))+.008),12);});
  const t=group(p,'Inscribed tablet',[.33,1.42,.50]);t.rotation.set(.06,-.12,-.1);t.scale.setScalar(.81);
  strut(t,'Ceramic disk',ivory,[0,0,-.047],[0,0,.047],.47,.47,48);ring(t,'Tablet edge','#ba9866',[0,0,.04],.444,.012);
  const loop=[];for(let i=0;i<=30;i++){let a=.37+i/30*tau*.92;loop.push([Math.cos(a)*(.265+.034*Math.cos(3*a)),Math.sin(a)*.282,.052]);}
  tube(t,'Ink glyph',ink,loop,loop.map((_,i)=>.013+.023*Math.sin(i/30*Math.PI)**2),7);
}

export function obo(p){
  const shell='#8a9f4c',darkGreen='#58713e',coat='#e2d5b0',sash='#823e4b';
  for(const s of sides){
    const x=s*.25,z=s*.055;
    tube(p,'Cricket thigh',shell,[[x,1.34,0],[x*1.25,1.14,-.04],[x*1.75,.80,z-.13]],[.128,.15,.075]);
    oval(p,'Knee',darkGreen,[x*1.75,.8,z-.13],[.095,.10,.10]);
    tube(p,'Shin',shell,[[x*1.75,.8,z-.13],[x*1.45,.54,z-.06],[x*1.08,.18,z+.04]],[.061,.071,.052]);
    tube(p,'Tarsus',darkGreen,[[x*1.08,.17,z+.04],[x*1.15,.091,z+.17],[x*1.36,.087,z+.39]],[.07,.086,.025]);
    for(let k=0;k<2;k++)tube(p,'Toe claw',leather,[[x*1.35+(k-.5)*.07,.105,z+.34],[x*1.38+(k-.5)*.09,.085,z+.43],[x*1.45+(k-.5)*.09,.045,z+.50]],[.031,.025,.006]);
  }
  loft(p,'Abdomen',darkGreen,[[1.12,.15,.17],[1.26,.26,.24],[1.49,.24,.235],[1.66,.18,.18]]);
  loft(p,'Linen jacket',coat,[[1.29,.35,.249],[1.47,.29,.245],[1.70,.26,.22],[1.96,.38,.25],[2.04,.31,.20],[2.08,.17,.16]]);
  plate(p,'Folded shirt',ink,[[-.18,2.04],[0,1.7],[.16,2.04]],.035,.005,[0,0,.23]);for(const s of sides)plate(p,'Notched lapel','#f7e6c5',[[s*.24,2.07],[s*.12,2.06],[s*.022,1.76],[s*.185,1.92],[s*.135,1.967]],.032,.005,[0,0,.26]);
  loft(p,'Burgundy sash',sash,[[1.37,.32,.257],[1.51,.30,.26],[1.57,.294,.236]]);
  plate(p,'Knotted sash end',sash,[[-.21,1.49],[-.1,1.47],[-.14,.94],[-.28,.88]],.06,.016,[-.015,0,.18]);
  strut(p,'Segmented neck',shell,[0,2.01,0],[.015,2.38,.02],.135,.104);for(let i=0;i<3;i++)ring(p,'Neck segment',darkGreen,[.005,2.10+i*.08,.012],.119-i*.006,.012,[1,1,1],[Math.PI/2,0,0]);
  const h=group(p,'Head',[.015,2.45,.02]);h.rotation.z=-.08;oval(h,'Head capsule',shell,[0,.06,.01],[.32,.26,.25]);
  for(const s of sides){
    const e=eye(h,[s*.195,.115,.17],.132,'#a2712e',s*.14);oval(e,'Heavy lid',darkGreen,[0,.069,0],[.145,.084,.106],[.25,0,s*.1]);
    tube(h,'Copper mandible',copper,[[s*.16,-.025,.17],[s*.17,-.098,.24],[s*.075,-.109,.305]],[.072,.062,.013]);
    tube(h,'Antenna',darkGreen,[[s*.14,.255,0],[s*.22,.48,-.04],[s*.43,.64,-.10],[s*.63,.48,-.15],[s*.74,.32,-.12]],[.027,.022,.017,.013,.005]);
  }
  const a=[.012,2.36,.30],b=[.80,1.92,.86];strut(p,'Woodwind body','#925d3e',a,b,.028,.082);
  for(let i=1;i<=7;i++){const t=i/9,u=V(a).lerp(V(b),t),v=V(a).lerp(V(b),t+.014);strut(p,'Key ring',brass,u.toArray(),v.toArray(),.033+.052*t,.034+.052*t);}
  strut(p,'Woodwind bell',brass,b,[.99,1.81,1.0],.077,.19,28);strut(p,'Bell interior',ink,[.984,1.814,.997],[.999,1.805,1.006],.15,.158,28);
  for(const [s,hand] of [[-1,[.25,2.23,.52]],[1,[.57,2.07,.70]]]){
    const elbow=[s*.52,1.66,.29];tube(p,'Bent jacket sleeve',coat,[[s*.31,1.96,.02],elbow,[s*.4+.14,1.9,.40]],[.15,.106,.095]);tube(p,'Forearm',shell,[[s*.4+.14,1.9,.40],[(s*.4+.14+hand[0])/2,2.0,.43],hand],[.073,.066,.052]);oval(p,'Player hand',shell,hand,[.09,.068,.071]);fingers(p,hand,[hand[0]+.035,hand[1]-.065,hand[2]+.052],shell,.042,.022);
  }
}

export function silt(p){
  const hide='#a85256',ridge='#bb6264',pad='#e1b383',strap='#b38245';
  oval(p,'Burrowing trunk',hide,[0,.83,-.12],[.65,.65,1.03]);
  for(let i=0;i<6;i++){
    const z=.02+i*.12,y=.91+i*.025,rad=.615-i*.039;
    oval(p,'Ribbed neck segment',i%2?hide:ridge,[0,y,z],[rad,rad*.94,.26]);
  }
  const jaw=group(p,'Ring mouth',[0,1.02,.77]);jaw.rotation.x=.12;
  oval(jaw,'Lip foundation',ridge,[0,0,-.02],[.425,.398,.22]);
  oval(jaw,'Mouth recess','#62363e',[0,0,.15],[.356,.328,.115]);
  for(let i=0;i<20;i++){let a=tau*i/20;const v=oval(jaw,'Outer scalloped plate',i%2?pad:'#ebc599',[Math.cos(a)*.285,Math.sin(a)*.258,.236],[.090,.143,.068]);v.rotation.z=a-Math.PI/2+.22;}
  for(let i=0;i<16;i++){let a=tau*i/16;const v=oval(jaw,'Inner scalloped plate','#bd906c',[Math.cos(a)*.164,Math.sin(a)*.143,.239],[.061,.085,.053]);v.rotation.z=a-Math.PI/2+.44;}
  for(const s of sides){const e=eye(jaw,[s*.118,.408,.178],.088,'#edb73b');e.scale.z=.85;}
  for(const s of sides)for(const z of [-.57,.41]){
    const x=s*(z>0?.66:.54);tube(p,'Digging leg',hide,[[s*.42,.86,z],[x,.64,z-.02],[x*1.16,.42,z+.08],[x*1.19,.20,z+.20]],[.228,.207,.165,.14]);
    oval(p,'Foot pad',ridge,[x*1.19,.18,z+.23],[.19,.14,.21]);for(let i=-1;i<=1;i++)tube(p,'Digging claw',pad,[[x*1.19+i*.09,.17,z+.32],[x*1.19+i*.09,.13,z+.40],[x*1.19+i*.097,.065,z+.48]],[.056,.045,.006]);
  }
  for(const z of [-.53,.04]){const r=z<0?.60:.663;ring(p,'Leather harness',strap,[0,.85,z],r,.048,[1,1,1.8]);ring(p,'Harness edging','#e7b464',[0,.85,z+.065],r,.018);}
  box(p,'Bedroll cradle',leather,[0,1.46,-.33],[.68,.11,.42],.055);strut(p,'Canvas bedroll','#c5a273',[-.46,1.54,-.35],[.46,1.54,-.35],.145,.145,28);
  for(const s of sides){ring(p,'Rolled canvas end',leather,[s*.463,1.54,-.35],.091,.017,[1,1,1],[0,Math.PI/2,0]);box(p,'Saddle bag',strap,[s*.63,.91,-.32],[.19,.39,.43],.06);box(p,'Bag flap',leather,[s*.68,1.04,-.32],[.16,.12,.45],.04);}
  const hand=[-.82,.45,.82];tube(p,'Listening forelimb',hide,[[-.38,.99,.47],[-.64,.83,.64],hand],[.134,.115,.091]);
  oval(p,'Gripping palm',ridge,hand,[.11,.103,.10]);fingers(p,hand,[-.846,.40,.87],ridge,.046,.029);
  strut(p,'Fork handle',brass,hand,[-.85,.23,.89],.028,.029);
  for(const x of [-.89,-.81]){strut(p,'Tuning fork tine',brass,[x,.235,.89],[x,.035,.91],.017,.014);}
  box(p,'Fork bridge',brass,[-.85,.23,.89],[.11,.03,.034],.012);
}

export function mica(p){
  const scale='#537a7a',plateColor='#779494',underside='#445a63',cape='#ab5946',boot='#50595b';
  for(const s of sides){
    const x=s*.23; tube(p,'Leg',scale,[[x,1.52,0],[x*1.15,1.22,.02],[x*1.28,.91,.12],[x*1.10,.55,-.14],[x*1.28,.17,-.10]],[.16,.139,.098,.085,.059]);
    oval(p,'Kneecap',plateColor,[x*1.28,.91,.13],[.119,.152,.095]);oval(p,'Boot',boot,[x*1.28,.12,.055],[.132,.105,.235]);
    for(let j=-1;j<2;j++)tube(p,'Foot claw','#c8b18c',[[x*1.28+j*.066,.11,.18],[x*1.3+j*.079,.07,.29],[x*1.32+j*.10,.045,.36]],[.041,.027,.006]);
  }
  loft(p,'Segmented cuirass',underside,[[1.36,.21,.20],[1.48,.32,.24],[1.60,.28,.23],[1.88,.31,.25],[2.10,.42,.25],[2.20,.34,.21],[2.25,.17,.13]]);
  for(let i=0;i<4;i++)plate(p,'Chest lamella',i%2?scale:plateColor,[[-.26,.11],[0,.055],[.26,.11],[.19,-.02],[0,-.09],[-.20,-.02]],.06,.017,[0,2.05-i*.13,.22]);
  loft(p,'Utility belt',leather,[[1.43,.33,.245],[1.53,.326,.248]]);
  box(p,'Buckle',brass,[0,1.48,.253],[.14,.09,.024],.015);
  for(const s of sides){box(p,'Belt pouch','#bc8b57',[s*.26,1.40,.15],[.15,.21,.12],.025);}
  plate(p,'Travel cape',cape,[[-.34,2.22],[.34,2.19],[.42,1.62],[.31,1.11],[-.03,1.18],[-.45,.91],[-.41,1.69]],.08,.045,[0,0,-.215],[.10,0,.04]);
  oval(p,'Shoulder mantle',cape,[-.27,2.12,-.005],[.259,.17,.26]);bolt(p,[-.30,2.12,.24],.042);
  strut(p,'Scaled neck',scale,[0,2.17,0],[0,2.53,0],.14,.145);for(let j=0;j<3;j++)ring(p,'Neck scales',underside,[0,2.27+.068*j,.003],.142,.015,[1,1,1],[Math.PI/2,0,0]);
  const h=group(p,'Armored avian head',[0,2.62,0]);oval(h,'Cranium',scale,[0,.012,0],[.272,.27,.278]);
  for(const s of sides){
    for(let i=0;i<4;i++){const start=[s*(.16+.017*i),.11-.083*i,-.02],end=[s*(.33+.023*i),.30-.09*i,-.34-.037*i];leaf(h,'Swept crest blade',i%2?underside:plateColor,start,end,.11-i*.01);}
    const e=eye(h,[s*.179,.06,.203],.080,'#bf9b50',s*-.28);e.scale.y=.76;
    tube(h,'Brow armor',underside,[[s*.07,.113,.25],[s*.19,.137,.195],[s*.26,.16,.10]],[.032,.044,.019]);
    tube(h,'Cheek mandible','#bd815c',[[s*.205,-.042,.12],[s*.176,-.143,.215],[s*.105,-.160,.31]],[.064,.052,.009]);
  }
  tube(h,'Upper beak','#d1a064',[[0,.015,.164],[0,-.015,.30],[0,-.082,.357]],[.128,.071,.009]);
  const target=[.38,2.54,.59];for(const [s,w] of [[-1,[.10,2.49,.61]],[1,[.47,2.32,.57]]]){
    const a=[s*.36,2.09,0],b=[s*.45,1.91,.29];tube(p,'Surveyor arm',scale,[a,b,w],[.118,.095,.06]);oval(p,'Glove',boot,w,[.082,.079,.081]);fingers(p,w,[w[0]+.045,w[1]+.083,w[2]+.06],boot,.032,.020);
  }
  const t=group(p,'Sextant',target);t.rotation.y=.48;
  strut(t,'Sight telescope',brass,[-.15,.03,-.32],[-.15,.03,.22],.05,.071);oval(t,'Sight glass','#354d51/glass',[-.15,.03,.224],[.056,.056,.008]);ring(t,'Sextant arc',brass,[.067,-.164,0],.22,.019,[1,.8,1]);
  for(const x of [-.15,.28])strut(t,'Frame',brass,[.0,.06,0],[x,-.27,0],.018,.019);strut(t,'Index arm',brass,[.00,.055,.04],[.23,-.30,.04],.024,.017);bolt(t,[0,.055,.055],.041);
}

export function nim(p){
  // A round seed courier in a wide woven sun hat, riding the crosswinds under a dandelion parasol.
  const blue='#788dce',light='#a5addb',bag='#c64937',stem='#9aa978',straw='#d9b66a',straw2='#c49a4d';
  oval(p,'Seed body',blue,[0,.62,0],[.37,.45,.30]);
  for(const s of sides){
    const lifted=s===1?.18:0;
    tube(p,'Short leg',blue,[[s*.15,.40,0],[s*.18,.25+lifted*.45,.03],[s*.22,.10+lifted,.12+lifted]],[.091,.077,.063]);
    oval(p,'Foot',blue,[s*.22,.07+lifted,.17+lifted],[.105,.067,.17],[-lifted*1.3,0,0]);
  }
  const h=group(p,'Round head',[0,1.20,.03]);h.rotation.z=-.06;oval(h,'Head',blue,[0,0,0],[.36,.31,.31]);
  for(const s of sides){oval(h,'Dark oval eye',ink,[s*.135,.035,.272],[.06,.075,.035],[0,s*.29,0]);oval(h,'Catchlight',ivory,[s*.135-.017,.06,.302],[.017,.022,.009]);oval(h,'Blush','#bf92b8',[s*.235,-.05,.22],[.057,.022,.014],[0,s*.5,0]);}
  tube(h,'Smiling mouth','#855663',[[-.07,-.075,.296],[0,-.10,.305],[.07,-.073,.294]],[.009,.016,.008]);
  strut(h,'Hat brim',straw,[0,.20,0],[0,.235,0],.56,.55,28);strut(h,'Hat crown',straw2,[0,.22,0],[0,.40,0],.25,.21,24);strut(h,'Hat band',bag,[0,.245,0],[0,.30,0],.255,.248,24);
  tube(p,'Cross-body strap',leather,[[-.23,.99,.06],[-.13,.88,.23],[.16,.65,.28],[.27,.53,.14],[.28,.58,-.09],[-.15,.89,-.20],[-.23,.99,.06]],.032);
  box(p,'Postbag',bag,[.03,.59,.284],[.42,.30,.139],.062,[.08,0,-.065]);plate(p,'Envelope flap','#df6547',[[-.198,.092],[.20,.092],[.183,-.016],[.02,-.102],[-.18,-.025]],.028,.012,[.032,.626,.359],[0,0,-.065]);bolt(p,[.05,.565,.382],.031);
  // left mitten holds the bag shut; right mitten grips the parasol stalk
  tube(p,'Arm',blue,[[-.28,.88,0],[-.33,.72,.14],[-.18,.77,.33]],[.080,.066,.062]);oval(p,'Mitten hand',light,[-.18,.77,.33],[.072,.062,.052]);
  const grip=[.42,.98,.26];tube(p,'Arm',blue,[[.29,.90,0],[.42,.86,.12],grip],[.080,.066,.062]);oval(p,'Mitten hand',light,grip,[.072,.066,.06]);
  const center=[.50,1.98,.16];tube(p,'Parasol stalk',stem,[[.41,.80,.27],grip,[.45,1.45,.24],[.49,1.80,.19],center],[.03,.03,.026,.022,.02]);
  oval(p,'Seed head','#c5a369',center,[.083,.06,.08]);
  for(let tier=0;tier<2;tier++)for(let i=0;i<12;i++){
    const a=tau*(i+tier*.5)/12,R=.40-tier*.12,dx=Math.cos(a)*R,dz=Math.sin(a)*R,y=center[1]+.22+tier*.12+.025*Math.sin(a*3),tip=[center[0]+dx,y,center[2]+dz];
    tube(p,'Seed ray',tier===0?'#c8ac79':'#d9c497',[center,[center[0]+dx*.53,center[1]+.07+tier*.05,center[2]+dz*.53],tip],[.009,.008,.005],5);
    for(const t of [-1,0,1]){const ex=center[0]+dx*1.13-Math.sin(a)*t*.058,ez=center[2]+dz*1.13+Math.cos(a)*t*.058;strut(p,'Silken filament','#f0dfb5',tip,[ex,y+.065+(1-Math.abs(t))*.035,ez],.006,.0015,5);}
  }
}

