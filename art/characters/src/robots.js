import {group,oval,box,strut,tube,loft,plate,ring,leaf,bolt,fingers,mechArm,sides,tau,ivory,leather,brass,dark,ink,teal,copper,steel,black,optic,V} from './sculpt.js';

export function tally(p){
  const yellow='#c39140/metal', edge='#ebbe69/metal',tire='#384047';
  for(const s of sides){
    const x=s*.575;
    box(p,'Continuous track',tire,[x,.335,0],[.30,.56,1.09],.158);
    box(p,'Armored bogie cover',yellow,[x+s*.143,.34,0],[.042,.36,.83],.10);
    for(let k=-1;k<=1;k++){
      const z=k*.308;strut(p,'Road wheel',dark,[x+s*.149,.325,z],[x+s*.182,.325,z],.126,.126,20);strut(p,'Pressed hub',brass,[x+s*.185,.325,z],[x+s*.20,.325,z],.067,.065,16);
    }
    for(let i=0;i<10;i++){const z=-.428+i*.095;for(const y of [.062,.605])box(p,'Tread shoe','#474e50',[x,y,z],[.323,.062,.055],.014);}
    for(const z of [-.532,.532])for(let j=0;j<4;j++)box(p,'Track end shoe','#474e50',[x,.17+j*.091,z],[.323,.056,.053],.012);
  }
  box(p,'Scale housing',yellow,[0,.59,0],[1.02,.70,.88],.082);box(p,'Deck rim',edge,[0,.91,0],[1.10,.095,.94],.03);
  const d=group(p,'Spring scale',[0,.60,.457]);
  strut(d,'Metal bezel',brass,[0,0,-.043],[0,0,.036],.28,.278,48);strut(d,'Cream dial',ivory,[0,0,.035],[0,0,.044],.244,.244,48);
  for(let i=0;i<=16;i++){const a=-2.28+i*4.56/16,x=Math.sin(a),y=Math.cos(a);strut(d,'Dial graduation',ink,[x*(i%4?.189:.167),y*(i%4?.189:.167),.05],[x*.220,y*.22,.05],.006,.006,6);}
  tube(d,'Red pointer','#ab4c34',[[0,0,.056],[-.042,.078,.060],[-.092,.173,.060]],[.018,.012,.0015]);bolt(d,[0,0,.065],.024,steel);
  for(const s of sides)for(const y of [.32,.86])bolt(p,[s*.43,y,.445]);
  strut(p,'Pan pedestal',steel,[-.085,.96,.10],[-.085,1.12,.10],.07,.082);
  loft(p,'Weighing pan',brass,[[1.115,.065,.07,-.085,.10],[1.128,.135,.14,-.085,.1],[1.19,.27,.27,-.085,.10],[1.212,.29,.29,-.085,.10],[1.227,.283,.283,-.085,.10],[1.19,.185,.185,-.085,.10]]);
  mechArm(p,[.23,.98,-.19],[.38,1.43,-.24],[.085,1.66,-.01],.085,yellow);
  const h=group(p,'Inspection camera',[.045,1.66,0]);h.rotation.x=.28;box(h,'Single lens housing',yellow,[0,0,0],[.43,.265,.34],.045);box(h,'Optical recess',dark,[0,-.006,.171],[.317,.179,.044],.023);strut(h,'Lens bezel',steel,[0,0,.186],[0,0,.226],.085,.083);oval(h,'Optical glass',optic,[0,0,.228],[.065,.065,.018]);
  mechArm(p,[-.46,.92,-.06],[-.71,1.18,.10],[-.54,1.44,.23],.076,yellow);for(const s of sides)tube(p,'Picking jaw',steel,[[-.54,1.44,.23],[-.46,1.46+s*.055,.26],[-.38,1.44+s*.019,.28]],[.031,.026,.012]);
  strut(p,'Teaspoon handle','#b3b9ae/metal',[-.414,1.442,.27],[-.14,1.325,.20],.018,.026);oval(p,'Teaspoon bowl','#bcc6be/metal',[-.10,1.311,.196],[.085,.022,.049],[0,-.2,-.2]);
  for(let j=0;j<5;j++)box(p,'Rear cooling louver',dark,[0,.40+.085*j,-.446],[.62,.026,.028],.01);
}

function fern(p,base,dir,scale){
  const b=V(base),d=V(dir).normalize(),end=b.clone().addScaledVector(d,scale);
  tube(p,'Fern rachis','#64844b',[base,b.clone().lerp(end,.54).add(V([0,.026,0])).toArray(),end.toArray()],[.011,.009,.003],6);
  for(let j=1;j<=7;j++){const t=j/9,origin=b.clone().lerp(end,t),w=Math.sin(Math.PI*t)**.64*scale*.24;
    for(const s of sides){const tip=origin.clone().addScaledVector(d,scale*.15).add(V([s*w,.011,s*w*.38]));leaf(p,'Fern pinna',j%2?'#79a354':'#528550',origin.toArray(),tip.toArray(),w*.26);}}
}
export function lichen(p){
  const porcelain='#d9ccb1',moss='#62816c/metal',rim='#92977b/metal';
  mechArm(p,[-.22,1.10,-.08],[-.35,.44,.33],[-.34,.13,-.15],.123,porcelain);
  mechArm(p,[.18,1.10,-.04],[.43,.73,.29],[.44,.16,.32],.128,porcelain);
  for(const [x,z] of [[-.34,-.10],[.44,.40]])box(p,'Ceramic foot',porcelain,[x,.09,z],[.22,.15,.39],.06);
  loft(p,'Glazed torso',moss,[[.98,.15,.14],[1.09,.26,.20],[1.24,.27,.23],[1.45,.32,.24],[1.60,.36,.23],[1.72,.28,.19],[1.77,.14,.12]]);
  plate(p,'Chest escutcheon','#88967c',[[-.14,.12],[.14,.12],[.11,-.06],[0,-.12],[-.1,-.06]],.018,.013,[0,1.46,.238]);for(let i=0;i<3;i++)strut(p,'Chest vent',dark,[-.071,1.49-.031*i,.263],[.071,1.49-.031*i,.263],.007,.007,6);
  strut(p,'Neck piston',brass,[0,1.69,0],[.15,2.04,-.015],.084,.069);
  const h=group(p,'Mask',[.17,2.11,0]);h.rotation.set(.17,-.27,-.27);loft(h,'Glazed porcelain mask',porcelain,[[-.23,.07,.078],[-.12,.16,.132],[.073,.182,.15],[.17,.136,.14],[.20,.069,.082]]);
  oval(h,'Face socket',dark,[0,-.039,.138],[.052,.132,.025]);oval(h,'Vertical face lamp','#efc66b/lit',[0,-.041,.156],[.023,.100,.017]);
  for(const s of sides){oval(p,'Shoulder cap',porcelain,[s*.31,1.61,0],[.18,.20,.18]);strut(p,'Hinge pin',rim,[s*.41,1.61,0],[s*.47,1.61,0],.074,.073);}
  mechArm(p,[-.33,1.6,.015],[-.54,.87,.10],[-.22,1.30,.36],.081,porcelain);
  mechArm(p,[.34,1.59,.015],[.56,1.00,.04],[.17,1.59,.30],.079,porcelain);
  for(const [w,end] of [[[-.22,1.30,.36],[-.08,1.44,.32]],[[.17,1.59,.30],[-.07,1.72,.17]]]){
    oval(p,'Porcelain palm',porcelain,w,[.078,.073,.052]);fingers(p,w,end,porcelain,.041,.021);
  }
  for(const [direction,length] of [[[-.7,.8,0],.40],[[-.2,1,-.07],.43],[[.7,1,.12],.39],[[.2,.8,.6],.32],[[-.6,.65,-.3],.35]])fern(p,[-.29,1.72,.008],direction,length);
  tube(p,'Shoulder hairline crack',dark,[[-.35,1.78,.071],[-.38,1.69,.15],[-.35,1.65,.177],[-.38,1.59,.17]],.009);
}

export function parallax(p){
  const ceramic='#e2d7bc/metal',accent='#e39a41/metal';
  const c=group(p,'Gauge chassis',[0,1.07,0]);
  const outer=[],inner=[];for(let i=0;i<=40;i++){const a=(53+i*254/40)*Math.PI/180;outer.push([Math.cos(a)*.87,Math.sin(a)*.91]);}
  for(let i=40;i>=0;i--){const a=(53+i*254/40)*Math.PI/180;inner.push([Math.cos(a)*.606,Math.sin(a)*.657]);}
  plate(c,'Cast C-frame',ceramic,[...outer,...inner],.31,.036);
  const trim=[];for(let i=0;i<=28;i++){const a=(57+247*i/28)*Math.PI/180;trim.push([Math.cos(a)*.663,Math.sin(a)*.719,.169]);}tube(c,'Inner track',dark,trim,.033);
  for(const s of sides){
    const y=s*.732;box(c,'Slider jaw',ceramic,[.48,y,0],[.46,.197,.32],.037,[0,0,-s*.09]);box(c,'Ram collar',dark,[.61,y-s*.086,0],[.12,.091,.20],.012);
    strut(c,'Plunger',steel,[.615,y-s*.09,0],[.615,s*.32,0],.033,.026);strut(c,'Contact tip',accent,[.615,s*.375,0],[.615,s*.24,0],.049,.013);
    bolt(c,[.385,y,.18],.036,steel);
  }
  box(c,'Calibration glass','#78bcc4/glass',[.615,0,0],[.38,.43,.37],.022,[0,.10,.03]);
  strut(c,'Camera barrel',dark,[-.73,0,.11],[-.73,0,.245],.190,.185,32);ring(c,'Lens bezel',steel,[-.73,0,.252],.151,.031);oval(c,'Blue lens',optic,[-.73,0,.26],[.120,.120,.054]);
  for(let i=0;i<6;i++){const a=(94+i*8)*Math.PI/180;strut(c,'Etched graduation',i===0?accent:steel,[Math.cos(a)*.782,Math.sin(a)*.812,.186],[Math.cos(a)*.848,Math.sin(a)*.873,.186],.010,.010,6);}
  for(const s of sides)bolt(c,[-.63,s*.33,.18],.03,steel);strut(c,'Sensor whisker',steel,[-.52,.72,-.02],[-.58,1.03,-.035],.018,.008);
}

function songbird(p,pos){
  const b=group(p,'Clockwork songbird',pos);oval(b,'Bird body',brass,[0,.066,0],[.11,.087,.084]);oval(b,'Bird head','#dcaa59/metal',[.067,.159,.016],[.077,.074,.067]);
  oval(b,'Bird eye',ink,[.10,.17,.064],[.017,.019,.012]);strut(b,'Beak',copper,[.12,.154,.02],[.195,.151,.02],.030,.002);leaf(b,'Wing',copper,[.03,.1,.066],[-.12,.048,.069],.051);leaf(b,'Tail',brass,[-.068,.075,.01],[-.211,.094,.01],.040);
  for(const x of [-.036,.035])strut(b,'Bird feet',copper,[x,.023,0],[x,-.024,.023],.010,.011);
}
export function hush(p){
  const enamel='#7395a6/metal',light='#99b2b7/metal',shadow='#526d7b/metal';
  for(const s of sides){
    const x=s*.45;oval(p,'Hip hinge',dark,[s*.34,.90,0],[.22,.19,.20]);strut(p,'Thigh',shadow,[s*.30,.90,0],[x,.65,.20],.16,.182);
    oval(p,'Knee housing',enamel,[x,.61,.22],[.242,.213,.202]);strut(p,'Calf',enamel,[x,.62,.13],[x,.26,.02],.19,.24);box(p,'Riveted boot',shadow,[x,.17,.135],[.49,.30,.63],.065);
    box(p,'Toe cap',light,[x,.18,.370],[.47,.21,.19],.048);for(const t of sides)bolt(p,[x+t*.14,.19,.468],.025);
  }
  loft(p,'Boiler torso',enamel,[[.81,.33,.29],[.91,.49,.33],[1.12,.59,.39],[1.38,.61,.365],[1.59,.50,.31],[1.69,.35,.25],[1.70,.26,.20]]);
  const chest=group(p,'Acoustic grille',[0,1.24,.348]);oval(chest,'Grille recess',dark,[0,0,0],[.292,.242,.055]);
  ring(chest,'Grille bezel',brass,[0,0,.031],.254,.026,[1.12,.88,1]);
  for(let i=-3;i<=3;i++){let x=i*.063,h=.192*Math.sqrt(1-(x/.27)**2);box(chest,'Grille slat',steel,[x,0,.058],[.021,h*2,.035],.009);}
  strut(p,'Neck column',dark,[0,1.60,-.02],[-.08,1.85,.015],.13,.11);const h=group(p,'Listening head',[-.075,1.89,.026]);h.rotation.set(.17,-.20,-.19);
  box(h,'Steel head',enamel,[0,0,0],[.492,.38,.382],.082);box(h,'Face panel',shadow,[0,-.01,.183],[.395,.204,.043],.037);
  for(const s of sides){box(h,'Amber eye','#f3bc61/lit',[s*.101,.015,.215],[.113,.04,.021],.018);strut(h,'Ear port',steel,[s*.233,0,-.004],[s*.269,0,-.004],.096,.091);bolt(h,[s*.18,.133,.16],.023);}
  for(const s of sides){oval(p,'Shoulder dome',enamel,[s*.48,1.50,0],[.31,.25,.302]);for(let j=-1;j<2;j++)bolt(p,[s*.49+j*.096,1.53,.279],.026);}
  mechArm(p,[-.55,1.48,0],[-.70,1.024,.24],[-.34,1.13,.53],.157,enamel);
  oval(p,'Open palm',light,[-.24,1.144,.567],[.218,.091,.145],[0,0,.07]);for(let i=0;i<4;i++){let z=.475+i*.060;tube(p,'Curled gauntlet finger',enamel,[[-.22,1.14,z],[-.08,1.14,z+.013],[-.012,1.197,z+.026]],[.04,.038,.027]);}
  songbird(p,[-.23,1.255,.577]);
  mechArm(p,[.56,1.49,0],[.73,1.37,.25],[.365,1.88,.19],.145,enamel);
  oval(p,'Cupped listening hand',light,[.322,1.91,.12],[.111,.17,.129],[0,0,-.25]);fingers(p,[.31,1.967,.10],[.205,2.08,.025],enamel,.048,.036);
  for(const x of [-.26,0,.26])box(p,'Rear access seam',shadow,[x,1.19,-.345],[.027,.35,.045],.013);
}

export function rivet(p){
  const bronze='#ba744a/metal',patina='#458a82/metal',gold='#ca9859/metal';
  loft(p,'Copper hull',bronze,[[.68,.23,.22],[.73,.38,.33],[.81,.53,.43],[.98,.68,.55],[1.12,.68,.55],[1.25,.57,.48],[1.36,.40,.33],[1.39,.17,.14]]);
  loft(p,'Patinated belly',patina,[[.68,.22,.22],[.70,.30,.27],[.78,.47,.39],[.86,.565,.458],[.89,.59,.476]]);
  for(let i=0;i<20;i++){
    const a=tau*i/20,x=Math.cos(a)*.676,z=Math.sin(a)*.539;oval(p,'Belt rivet',gold,[x,1.055,z],[.026,.026,.026]);
  }
  for(const y of [.94,1.14]){const rr=y<1?.64:.665;ring(p,'Hull seam',gold,[0,y,0],rr,.018,[1,.81,1],[Math.PI/2,0,0]);}
  for(const s of sides){
    const g=group(p,'Porthole',[s*.242,1.10,.478]);g.rotation.y=s*.31;strut(g,'Brass bezel',brass,[0,0,-.066],[0,0,.054],.14,.146,32);oval(g,'Aquamarine lens',optic,[0,0,.065],[.108,.11,.051]);ring(g,'Lens rim',gold,[0,0,.07],.117,.018);
    const f=group(p,'Stabilizer',[s*.51,.97,-.12]);f.rotation.y=s*.32;
    plate(f,'Copper fin',bronze,[[0,0],[s*.13,-.014],[s*.47,.21],[s*.53,.38],[s*.35,.32],[s*.09,.20]],.064,.020);
    plate(f,'Cream fin stripe',ivory,[[s*.31,.175],[s*.37,.217],[s*.43,.335],[s*.365,.314]],.011,.005,[0,0,.039]);
    mechArm(p,[s*.29,.75,-.09],[s*.45,.62,-.19],[s*.32,.54,-.01],.044,brass);
  }
  plate(p,'Dorsal rudder',bronze,[[-.09,1.30],[-.04,1.71],[.04,1.77],[.13,1.54],[.19,1.32]],.077,.022,[0,0,-.16],[0,.12,0]);
  plate(p,'Rudder flash',ivory,[[-.042,1.59],[-.04,1.65],[.09,1.60],[.11,1.54]],.011,.004,[0,0,-.108]);
  tube(p,'Soldering snout',steel,[[.01,1.04,.48],[.05,.96,.69],[.127,.91,.79]],[.086,.074,.049]);
  strut(p,'Hot iron',brass,[.119,.92,.783],[.25,.78,.88],.051,.011);oval(p,'Heated contact','#efb351/lit',[.253,.778,.883],[.023,.020,.023]);
  mechArm(p,[-.35,.85,.22],[-.42,.57,.48],[-.12,.58,.78],.059,brass);
  box(p,'Work clamp',dark,[-.09,.61,.80],[.13,.083,.09],.016);
  plate(p,'Patch under repair','#879699/metal',[[-.16,-.07],[.13,-.09],[.22,.01],[.17,.14],[-.09,.10]],.025,.006,[.095,.665,.865],[.15,0,.33]);
}
export function spool(p){
  const plum='#844458/metal',deep='#613749/metal',trim='#c79650/metal';
  for(const x of [-.30,0,.30])for(const z of [-.16,.16]){
    strut(p,'Caster',brass,[x-.04,.113,z],[x+.04,.113,z],.092,.092);oval(p,'Caster bracket',steel,[x,.16,z],[.06,.072,.073]);
  }
  box(p,'Rolling plinth',deep,[0,.239,0],[.88,.16,.55],.054);
  plate(p,'Tapered exchange cabinet',plum,[[-.409,.27],[.409,.27],[.275,1.61],[.21,1.71],[-.20,1.71],[-.275,1.63]],.43,.053);
  box(p,'Base molding',trim,[0,.32,0],[.79,.058,.52],.023);box(p,'Base apron',deep,[0,.38,-.003],[.765,.066,.52],.021);
  for(let i=-3;i<=3;i++){let h=.34-Math.abs(i)*.06;box(p,'Art deco fluting',trim,[i*.075,.46+h/2,.228],[.025,h,.023],.011);}
  box(p,'Patch panel',trim,[0,1.10,.244],[.46,.63,.049],.03);box(p,'Panel insert',deep,[0,1.10,.271],[.418,.58,.015],.013);
  for(let i=0;i<3;i++)for(let j=0;j<4;j++){let x=-.137+i*.136,y=.891+j*.136;oval(p,'Socket',ink,[x,y,.29],[.048,.048,.017]);ring(p,'Socket collar',trim,[x,y,.30],.042,.007);}
  for(let j=-3;j<=3;j++){const x=j*.035;strut(p,'Sunburst inlay',trim,[x*.39,1.46,.24],[x*1.56,1.59-Math.abs(j)*.019,.24],.008,.008,7);}
  strut(p,'Telescoping neck',trim,[0,1.66,0],[0,1.91,0],.082,.066);ring(p,'Neck bearing',deep,[0,1.70,0],.093,.017,[1,1,1],[Math.PI/2,0,0]);
  const h=group(p,'Receiver head',[0,1.99,0]);h.rotation.z=.06;
  tube(h,'Curved handset',plum,[[-.33,-.01,.02],[-.23,.05,0],[0,.097,-.02],[.22,.054,0],[.33,-.013,.023]],[.092,.082,.077,.082,.093],14);
  for(const s of sides){oval(h,'Receiver cup',deep,[s*.32,-.021,.011],[.14,.134,.135]);strut(h,'Ear cap',trim,[s*.32,-.027,.108],[s*.32,-.027,.133],.088,.093);for(let k=0;k<5;k++){const a=k*tau/5;oval(h,'Receiver perforation',ink,[s*.32+Math.cos(a)*.052,-.027+Math.sin(a)*.052,.137],[.013,.013,.006]);}}
  box(h,'Face bridge',plum,[0,0,.027],[.36,.127,.15],.047);for(const s of sides)box(h,'Operator lamp','#eec56f/lit',[s*.070,.004,.105],[.072,.029,.014],.012);
  mechArm(p,[-.29,1.38,0],[-.49,1.07,.10],[-.32,.91,.325],.054,brass);mechArm(p,[.29,1.36,0],[.49,1.14,.089],[.27,1.21,.37],.055,brass);
  for(const [x,y] of [[-.31,.92],[.26,1.20]]){oval(p,'Plug-hand',trim,[x,y,.33],[.073,.065,.06]);fingers(p,[x,y,.34],[x*.83,y+.02,.38],trim,.023,.016);}
  tube(p,'Braided patch cable','#d0a257',[[-.10,.88,.291],[-.18,.84,.35],[-.31,.91,.36],[-.39,.68,.33],[-.29,.52,.34],[.04,.48,.36],[.35,.68,.41],[.40,1.02,.42],[.26,1.20,.385],[.132,1.166,.36] ],.023,9);
  strut(p,'Patch plug',brass,[.131,1.16,.292],[.131,1.16,.388],.032,.030);
  box(p,'Service hatch',deep,[0,1.10,-.227],[.41,.58,.038],.028);for(let i=0;i<4;i++)box(p,'Rear vent',dark,[0,.97+i*.066,-.251],[.275,.021,.009],.007);
}
