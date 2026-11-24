/* Architectural recipes shared by the Three.js gallery and the Blender scene builder.
   Y is up. Dimensions are metres. Ordered rotations use radians, XYZ. */
const pi=Math.PI,tau=2*pi;
const cream='#d7cdb2',light='#afc0bd',slate='#485967',navy='#355266',brass='#c19b5b',rust='#a86049',glass='#5796a2',lit='#9ddcd3',steel='#77838a',coal='#353d46',wood='#927659';
export const stations=[
 ['brineglass','Brineglass Laboratory','Research station','The Abyss','A seabed pressure lab with three viewports and an umbilical dock.'],
 ['rookfall','Rookfall Outpost','Outpost','The Empire Strikes Back','A snowbound shelter built behind a berm, with a heated tunnel entrance.'],
 ['meridian','Meridian Array','Research station','Contact','Three independently aimed radio dishes share a low correlator building.'],
 ['kestrel','Kestrel Spindle','Outpost','2001: A Space Odyssey','An orbital transfer wheel with a fixed docking spindle through its hub.'],
 ['emberstep','Emberstep Condenser','Outpost','Dune','Stepped desert terraces catch the cool air below four wind scoops.'],
 ['mossward','Mossward Conservatory','Research station','Silent Running','A geodesic greenhouse grows a miniature forest beside its seed vault.'],
 ['faraday','Faraday Reach','Research station','Solaris','Four sea laboratories meet at a raised pressure lock above a dark ocean.'],
 ['anchor','Anchor Nine','Outpost','The Expanse','A gantry, ore hopper and transfer arm cling to an irregular asteroid.'],
 ['tidecomb','Tidecomb Nursery','Research station','Subnautica','Egg-shaped pressure chambers rise on branching umbilicals above a reef.'],
 ['lumenvault','Lumen Vault','Research station','Arrival','A dark lens-shaped archive opens onto a straight instrumented approach.'],
 ['windharp','Windharp Hangar','Outpost','Nausicaä of the Valley of the Wind','A coastal sailplane shed sits between two wind-driven generators.'],
 ['frostline','Frostline Bore','Research station','The Thing','A polar core drill stands above a break in the ice between two warm cabins.'],
 ['lanternshoal','Lantern Shoal','Outpost','Star Trek IV: The Voyage Home','Three anchored pontoons carry an acoustic beacon and two listening huts.'],
 ['saffron','Saffron Stack','Outpost','Alien','A refinery exchanges heat through staggered stacks and overhead pipes.'],
 ['triune','Triune Aperture','Research station','Stargate','Three tilted pylons support an instrument ring above an excavation.'],
 ['redkite','Red Kite Camp','Outpost','The Martian','Linked pressure tents and a folding solar farm form a desert field camp.'],
 ['cairnrelay','Cairn Relay','Outpost','Mass Effect','Two finned repeater towers bridge a deep cut between stone mesas.'],
 ['heliograph','Heliograph Observatory','Research station','Sunshine','A hexagonal mirror shield shades a small instrument bus and radiator wings.'],
 ['palisade','Palisade Watch','Outpost','Moon','A mobile survey station rides on paired crawler tracks under a white radome.'],
 ['blackwell','Blackwell Tidal Station','Research station','Interstellar','Twin measurement arches frame a low wave basin and a sheltered instrument deck.']
].map(([id,name,type,inspiration,habit])=>({id,name,type,inspiration,habit,role:type,angle:32}));
function architecturalKit(){
 const parts=[];const put=(name,kind,color,pos,size,rotation=[0,0,0],extra={})=>{parts.push({name,kind,color,pos,size,rotation,...extra});};
 const box=(n,c,p,d,r=[0,0,0])=>put(n,'box',c,p,d,r);
 const ball=(n,c,p,d)=>put(n,'sphere',c,p,d);
 const cyl=(n,c,p,rad,h,top=rad,nside=24,rot=[0,0,0])=>put(n,'cylinder',c,p,[1,1,1],rot,{radius:rad,top,height:h,segments:nside});
 const bar=(n,c,a,b,r,t=r,nside=12)=>put(n,'beam',c,a,[1,1,1],[0,0,0],{end:b,radius:r,top:t,segments:nside});
 const ring=(n,c,p,r,t,rot=[0,0,0],scale=[1,1,1])=>put(n,'torus',c,p,scale,rot,{radius:r,minor:t});
 function deck(x,z,w,d,y=.21,c=slate){box('Structural deck',c,[x,y,z],[w,.24,d]);}
 function hab(x,y,z,w,h,d,c=cream){box('Habitat pressure shell',c,[x,y+h/2,z],[w,h,d]);box('Roof slab',slate,[x,y+h+.045,z],[w+.13,.10,d+.12]);
   const ws=Math.max(2,Math.round(w/.65));for(let i=0;i<ws;i++)box('Forward window',glass,[x-w*.35+i*w*.70/(ws-1),y+h*.60,z+d*.5+.018],[Math.min(.36,w*.20),h*.22,.037]);}
 function hatch(x,y,z){box('Airlock surround',steel,[x,y+.28,z],[.43,.56,.10]);box('Sealed door',coal,[x,y+.27,z+.059],[.30,.45,.032]);box('Door light',lit,[x,y+.48,z+.08],[.17,.038,.025]);}
 function mast(x,y,z,h=1.4){bar('Antenna mast',steel,[x,y,z],[x,y+h,z],.045,.015);for(let j=0;j<3;j++)bar('Antenna crossbar',cream,[x-.17+j*.033,y+h*(.67+j*.13),z],[x+.17-j*.033,y+h*(.67+j*.13),z],.014);ball('Beacon light','#ecad73',[x,y+h+.02,z],[.044,.044,.044]);}
 function pad(x,z,r,c=steel,y=.28){cyl('Landing apron',c,[x,y,z],r,.15,r,12);ring('Pad marking',cream,[x,y+.078,z],r*.75,.023,[pi/2,0,0]);}
 function tanks(x,y,z,n,c=steel){for(let i=0;i<n;i++){let xx=x+i*.37;cyl('Storage vessel',c,[xx,y+.32,z],.155,.64);ball('Tank crown',c,[xx,y+.63,z],[.152,.07,.152]);ring('Tank band',brass,[xx,y+.38,z],.154,.012,[pi/2,0,0]);}}
 function panel(x,y,z,w,d,tilt=-.25,c='#4e6d88'){const cp=Math.cos(tilt),sp=Math.sin(tilt);box('Panel backing',steel,[x,y,z],[w,.07,d],[tilt,0,0]);for(let i=0;i<4;i++)for(let j=0;j<2;j++){const dx=(i-1.5)*w/4,dz=(j-.5)*d/2;box('Collector cell',c,[x+dx,y-dz*sp+.052*cp,z+dz*cp+.052*sp],[w*.22,.023,d*.42],[tilt,0,0]);}}
 function dish(x,y,z,r,yaw=0){bar('Dish pedestal',steel,[x,.23,z],[x,y,z],r*.15,r*.09);const C=[x,y+.16,z],axis=[Math.sin(yaw)*.70,.71,Math.cos(yaw)*.70],u=[Math.cos(yaw),0,-Math.sin(yaw)],v=[-Math.sin(yaw)*.71,.70,-Math.cos(yaw)*.71];
   const pt=(scale,a,offset)=>C.map((n,k)=>n+scale*r*(Math.cos(a)*u[k]+Math.sin(a)*v[k])+axis[k]*offset*r);
   for(let j=0;j<12;j++){let a=j*tau/12,b=(j+1)*tau/12;bar('Dish rim',cream,pt(1,a,.28),pt(1,b,.28),.026);bar('Parabolic spoke',light,pt(.08,a,0),pt(.55,a,.07),.019);bar('Parabolic spoke',light,pt(.55,a,.07),pt(1,a,.28),.015);bar('Dish inner lattice',steel,pt(.55,a,.07),pt(.55,b,.07),.012);if(j%4===0)bar('Focus brace',brass,pt(.86,a,.20),pt(0,a,.72),.017);}ball('Receiver',brass,pt(0,0,.73),[.062,.068,.063]);}
 function ground(c='#a89983',r=2.9){cyl('Terrain cutaway',c,[0,-.04,0],r,.33,r*.98,10);cyl('Substrate',slate,[0,-.235,0],r*.99,.09,r*.99,10);}
 function dome(x,y,z,r,c=glass){put('Geodesic dome','dome',c,[x,y,z],[r,r*.83,r]);ring('Dome sill',cream,[x,y,z],r,.045,[pi/2,0,0]);
 for(let j=0;j<8;j++){let a=j*tau/8;for(let k=0;k<5;k++){let t=k*pi/10,e=(k+1)*pi/10;bar('Meridian rib',cream,[x+r*Math.cos(t)*Math.cos(a),y+r*.83*Math.sin(t),z+r*Math.cos(t)*Math.sin(a)],[x+r*Math.cos(e)*Math.cos(a),y+r*.83*Math.sin(e),z+r*Math.cos(e)*Math.sin(a)],.019);}}}
 return {parts,box,ball,cyl,bar,ring,deck,hab,hatch,mast,pad,tanks,panel,dish,ground,dome};
}
export function layout(id){
 const k=architecturalKit(),{box,ball,cyl,bar,ring,deck,hab,hatch,mast,pad,tanks,panel,dish,ground,dome}=k;
 switch(id){
 case 'brineglass':ground('#65918c');for(const [x,z,r] of [[0,0,.76],[-1.31,.45,.49],[1.26,-.29,.50]]){cyl('Pressure foot',steel,[x,.34,z],r*.61,.45);ball('Pressure sphere',navy,[x,.84,z],[r,r,r]);ring('Forward porthole',brass,[x,.90,z+r*.91],r*.38,.047);ball('Porthole glass',glass,[x,.90,z+r*.96],[r*.32,r*.32,.04]);}
 bar('Transfer lock',cream,[-1.30,.75,.45],[1.26,.75,-.29],.205);pad(.56,1.50,.53);tanks(-.75,.15,-.82,3);mast(.22,1.36,0,1.00);break;
 case 'rookfall':ground('#c5d8d9');deck(0,0,3.7,1.75,.18);for(const d of [-1,1]){box('Snow berm','#c6d7d8',[d*1.33,.50,-.16],[.84,.69,1.85],[0,0,-d*.23]);hab(d*.93,.26,-.42,1.17,.60,.92,light);}box('Bunker roof',cream,[0,.84,-.30],[2.32,.22,1.6]);for(let j=0;j<4;j++){box('Tunnel arch top',j%2?steel:light,[0,.71,.39+j*.26],[.90,.16,.10]);for(const d of [-1,1])box('Tunnel wall',slate,[d*.40,.45,.39+j*.26],[.10,.50,.13]);}hatch(0,.20,.34);mast(-1.48,.8,-.29,1.20);dish(1.47,1.13,-.55,.42,.48);break;
 case 'meridian':ground('#a89881');hab(0,.17,-.27,1.52,.47,.75,cream);dish(-1.52,.74,.30,.68,-.75);dish(.09,1.05,-.55,.88,.22);dish(1.63,.65,.38,.59,.71);hatch(.07,.15,.14);box('Service walkway',slate,[0,.18,1.0],[2.78,.09,.36]);tanks(-.52,.15,-1.25,3);break;
 case 'kestrel':ring('Rotating habitat rim',cream,[0,1.57,0],1.25,.16,[pi/2,0,0]);ring('Outer docking lane',slate,[0,1.57,0],1.42,.047,[pi/2,0,0]);for(let j=0;j<8;j++){let a=tau*j/8;bar('Spoke truss',light,[0,1.57,0],[Math.cos(a)*1.22,1.57,Math.sin(a)*1.22],.056);box('Habitat segment',navy,[Math.cos(a)*1.25,1.61,Math.sin(a)*1.25],[.22,.22,.34],[0,-a,0]);}cyl('Axial spindle',slate,[0,1.38,0],.22,2.18,.18);cyl('Arrival collar',brass,[0,2.45,0],.34,.17);bar('Solar spar',steel,[-1.27,.49,0],[1.27,.49,0],.045);for(const d of [-1,1])panel(d*.90,.50,0,1.0,.65);break;
 case 'emberstep':ground('#ba8763');for(let j=0;j<3;j++){box('Condenser terrace',j%2?'#af7e5a':'#c39b6a',[0,.39+j*.43,0],[3.4-j*.73,.47,2.18-j*.43]);}for(const x of [-1.27,1.27])for(const z of [-.66,.66]){cyl('Wind scoop',rust,[x,1.00,z],.18,1.27,.27,8);box('Intake slit',coal,[x,1.47,z+.215],[.27,.13,.08]);}hatch(0,.16,1.09);mast(.4,1.52,-.11,.65);break;
 case 'mossward':ground('#758f75');cyl('Greenhouse foundation',slate,[-.53,.28,.04],1.17,.27,1.17,16);dome(-.53,.42,.04,1.17,'#8bbbae');for(let i=0;i<7;i++){const a=i*tau/7;ball('Canopy crown','#627d59',[-.53+.74*Math.cos(a),.45,.04+.74*Math.sin(a)],[.22,.12,.22]);}hab(1.27,.18,-.30,1.06,.68,1.13,cream);bar('Seed lock',light,[.44,.53,-.05],[1.13,.53,-.29],.19);hatch(1.27,.17,.28);panel(1.53,.70,1.18,.86,.58);break;
 case 'faraday':ground('#516f79');for(const [x,z] of [[0,0],[1.22,0],[-1.22,0],[0,1.12],[0,-1.12]]){for(const d of [-1,1])bar('Stilt',steel,[x+d*.28,.11,z],[x+d*.28,.88,z],.06);hab(x,.82,z,.91,.50,.77,light);if(x||z)bar('Covered gangway',navy,[0,1.02,0],[x,1.02,z],.15);}dome(0,1.44,0,.37);mast(-1.27,1.45,-.05,.65);break;
 case 'anchor':for(const [x,y,z,a,b,c] of [[0,.1,0,1.56,.84,1.03],[-.86,.22,.37,.90,.57,.67],[.97,.13,-.44,.91,.73,.74]]){k.parts.push({name:'Rock face',kind:'rock',color:'#776c70',pos:[x,y,z],size:[a,b,c],rotation:[.1,y,.2]});}deck(0,0,2.39,1.12,1.02);hab(-.59,1.12,0,.92,.48,.74,cream);for(const d of [-1,1])bar('Crane leg',rust,[.43+d*.27,1.11,-.10],[.43+d*.15,2.25,-.10],.065);bar('Boom',rust,[.3,2.24,-.10],[1.68,2.49,.05],.075);bar('Hoist line',coal,[1.55,2.45,.03],[1.55,1.44,.03],.013);cyl('Ore hopper',brass,[1.03,1.32,.06],.15,.44,.35,8);break;
 case 'tidecomb':ground('#59867e');for(const [x,z,h] of [[-.9,.1,1.25],[0,-.46,1.79],[.92,.18,1.02]]){bar('Umbilical',light,[x*.5,.16,z*.4],[x,h-.19,z],.095,.075);ball('Nursery pod',cream,[x,h,z],[.40,.54,.36]);ball('Observation blister',glass,[x,h+.04,z+.27],[.30,.33,.14]);ring('Pod collar',brass,[x,h-.24,z],.31,.031,[pi/2,0,0]);}hab(0,.18,.70,.77,.35,.52,navy);for(const d of [-1,1])bar('Snorkel',rust,[d*.52,.26,-.25],[d*.60,2.05,-.28],.026,.018);break;
 case 'lumenvault':ground('#87918b');ball('Archive monolith',coal,[0,1.25,-.22],[1.18,1.19,.47]);box('Entrance slit',lit,[0,.95,.237],[.083,.92,.054]);deck(0,1.13,.65,1.55,.21,steel);for(const d of [-1,1])for(let j=0;j<3;j++){cyl('Path sensor',slate,[d*.48,.37,.64+j*.4],.047,.41);ball('Marker lamp',brass,[d*.48,.59,.64+j*.4],[.055,.055,.055]);}hab(-1.48,.18,-.38,.57,.31,.51,light);break;
 case 'windharp':ground('#9caa8c');hab(-.34,.18,-.20,1.85,.65,1.18,cream);for(const d of [-1,1])box('Folded hangar roof',rust,[-.34+d*.48,.96,-.20],[1.05,.11,1.38],[0,0,-d*.25]);box('Hangar opening',coal,[-.34,.49,.398],[1.0,.53,.055]);for(const [x,z] of [[-1.49,.36],[1.37,-.34]]){bar('Turbine tower',slate,[x,.19,z],[x,1.47,z],.065,.042);for(let j=0;j<3;j++){let a=j*tau/3+.32;bar('Turbine blade',cream,[x,1.47,z+.09],[x+Math.sin(a)*.55,1.47+Math.cos(a)*.55,z+.07],.061,.009);}ball('Rotor hub',brass,[x,1.47,z+.1],[.073,.073,.056]);}break;
 case 'frostline':ground('#b9d2d3');for(const d of [-1,1]){hab(d*1.29,.18,-.1,.89,.53,.81,rust);hatch(d*1.26,.18,.31);}for(const x of [-.39,.39])for(const z of [-.34,.34])bar('Derrick leg',slate,[x,.16,z],[x*.44,2.06,z*.44],.054,.035);
 for(let j=0;j<4;j++){let y=.36+j*.37,w=.38-j*.047;bar('Cross brace',brass,[-w,y,w],[w-.04,y+.35,w-.04],.027);bar('Cross brace',steel,[w,y,w],[-w+.04,y+.35,w-.04],.022);}cyl('Core barrel',steel,[0,.91,0],.082,1.46);box('Hoist hood',rust,[0,2.09,0],[.54,.19,.50]);tanks(-.53,.16,1.05,3);break;
 case 'lanternshoal':ground('#669296');for(const [x,z,r] of [[0,-.36,.74],[-1.19,.60,.57],[1.15,.58,.54]]){cyl('Buoyant hull',rust,[x,.28,z],r,.26,r*.91,12);cyl('Pontoon deck',light,[x,.43,z],r,.068,r,12);if(x)hab(x,.48,z,.65,.47,.54,cream);else{cyl('Beacon tower',navy,[x,.97,z],.22,1.04,.17);cyl('Fresnel lantern',lit,[x,1.61,z],.19,.26);cyl('Beacon cap',brass,[x,1.77,z],.26,.09,.13);}}for(const d of [-1,1])bar('Pontoon bridge',wood,[d*.43,.44,-.07],[d*.95,.44,.51],.100);break;
 case 'saffron':ground('#9d8b79');hab(-.50,.16,-.12,1.70,.61,1.33,slate);for(const [x,z,h,r] of [[-.93,-.39,1.73,.19],[-.23,-.43,2.04,.15],[.55,-.39,1.56,.23]]){cyl('Heat chimney',rust,[x,.18+h*.5,z],r,h,r*.83,16);for(let j=0;j<3;j++)cyl('Chimney band',cream,[x,h*.72+j*.13,z],r*.91,.06,r*.91,16);}
 for(let i=0;i<3;i++){bar('Transfer pipe',brass,[-.94,.80+i*.10,.65],[.90,.80+i*.10,.65],.032);bar('Downcomer',brass,[.9,.80+i*.10,.65],[.9,.24,.65+i*.085],.032);}tanks(.88,.16,-.39,3);hatch(-.48,.16,.55);break;
 case 'triune':ground('#a89d87');cyl('Excavation lip',slate,[0,.18,0],1.05,.15,1.05,12);cyl('Excavation floor',coal,[0,.26,0],.86,.028,.86,12);
 for(let j=0;j<3;j++){let a=j*tau/3+.3;bar('Sloping pylon',cream,[1.34*Math.cos(a),.16,1.34*Math.sin(a)],[.73*Math.cos(a),1.76,.73*Math.sin(a)],.199,.105,5);}ring('Instrument ring',brass,[0,1.76,0],.76,.091,[pi/2,0,0]);ring('Readout track',navy,[0,1.85,0],.73,.033,[pi/2,0,0]);hab(1.39,.16,.86,.63,.38,.52);break;
 case 'redkite':ground('#b57f62');for(const [x,z] of [[-.78,-.28],[.39,-.42]]){cyl('Pressure tent',cream,[x,.55,z],.40,.84,.40,24,[pi/2,0,0]);for(const zz of [-.33,0,.33])ring('Restraint hoop',rust,[x,.55,z+zz],.405,.026);hatch(x,.24,z+.431);}bar('Pressure link',light,[-.64,.52,-.36],[.39,.52,-.36],.15);for(let i=0;i<3;i++){panel(-.85+i*.73,.53,1.15,.66,.75);bar('Panel support',steel,[-.85+i*.73,.16,1.15],[-.85+i*.73,.52,1.15],.027);}mast(1.41,.16,-.18,1.37);break;
 case 'cairnrelay':for(const d of [-1,1]){cyl('Isolated mesa','#92897e',[d*1.04,.24,0],.87,.88,.74,7);deck(d*1.04,0,1.04,.89,.72);hab(d*1.04,.82,0,.70,.52,.61,navy);for(let j=0;j<3;j++){let x=d*1.04+(j-1)*.16;box('Relay fin',j%2?brass:cream,[x,1.57+j*.10,0],[.11,.83+j*.15,.30],[0,0,d*.14]);}}box('Service bridge',steel,[0,.84,.12],[1.70,.12,.38]);for(const z of [-.05,.29])bar('Bridge rail',brass,[-.76,1.00,z],[.76,1.0,z],.02);break;
 case 'heliograph':cyl('Instrument bus',slate,[0,.74,0],.37,1.24,.31,8);for(const [x,z] of [[0,0],[.65,0],[-.65,0],[.325,.56],[-.325,.56],[.325,-.56],[-.325,-.56]])cyl('Hexagonal sun reflector',brass,[x,1.54,z],.365,.075,.365,6,[0,pi/6,0]);for(const d of [-1,1]){bar('Radiator boom',light,[0,.48,0],[d*1.50,.48,0],.055);panel(d*1.17,.48,0,1.02,.72,0,navy);}dish(0,.30,.30,.32,.75);break;
 case 'palisade':ground('#9a9999');for(const d of [-1,1]){box('Crawler track',coal,[d*.63,.40,.02],[.42,.46,1.72]);for(let j=0;j<6;j++)box('Track shoe',steel,[d*.63,.19,-.68+j*.27],[.46,.095,.093]);}
 hab(0,.65,-.07,1.68,.70,1.40,light);box('Bridge window',glass,[0,1.16,.651],[1.15,.19,.044]);dome(-.30,1.45,-.12,.47,cream);mast(.59,1.45,-.42,1.03);hatch(.59,.66,.65);break;
 case 'blackwell':ground('#708389');deck(0,0,3.38,1.91,.28);box('Tidal basin',glass,[0,.415,.15],[1.82,.03,1.48]);for(const x of [-.90,.9]){for(let j=0;j<12;j++){let a=pi*j/12,b=pi*(j+1)/12;bar('Wave gauge arch',cream,[x,.43+.95*Math.sin(a),Math.cos(a)*.82],[x,.43+.95*Math.sin(b),Math.cos(b)*.82],.065);}bar('Gauge staff',brass,[x,.42,.05],[x,1.37,.05],.021);}
 hab(0,.48,-1.05,1.87,.56,.68,navy);mast(.58,1.12,-1.09,.49);break;
 default:throw Error('Unknown station '+id);
 }return k.parts;
}
