import {group,oval,box,strut,tube,loft,plate,ring,leaf,eye,sides,tau,ivory,leather,brass,dark,ink,copper} from './sculpt.js';
import {legs,arms,head,fan} from './anatomy.js';

export function neru(p){
 const skin='#6cabac';oval(p,'Otterlike trunk',skin,[0,.51,-.06],[.31,.28,.50]);legs(p,skin,.22,.39,-.02,4);
 tube(p,'Paddle tail',skin,[[0,.54,-.43],[.09,.48,-.69],[.25,.49,-.86],[.31,.58,-.96]],[.15,.117,.071,.008]);
 const h=head(p,{at:[0,.91,.33],skin,r:[.32,.24,.245],mouth:'pucker'});for(const s of sides)for(let i=0;i<3;i++){
 const o=[s*.23,.035+i*.045,-.04],e=[s*(.53-.035*i),.13+i*.12,-.10];tube(h,'Gill branch','#bd6b7d',[o,[s*.40,.12+i*.07,-.06],e],[.035,.028,.012]);
 for(let j=1;j<4;j++)leaf(h,'Gill finger','#dd8b99',[s*(.27+j*.063),.08+i*.07+j*.01,-.06],[s*(.32+j*.063),.17+i*.08+j*.017,-.06],.021);}
 box(p,'Survey case',leather,[-.23,.63,-.13],[.13,.27,.33],.04);
}
export function caelo(p){
 const s='#817393';legs(p,s,.17,.46);oval(p,'Velvet thorax',s,[0,.72,0],[.245,.38,.218]);arms(p,s,.20,.90,0,true);
 const h=head(p,{at:[0,1.35,.04],skin:'#a698aa',r:[.257,.216,.206],mouth:'pucker'});for(const d of sides){
 tube(h,'Comb antenna',dark,[[d*.1,.14,0],[d*.19,.34,0],[d*.31,.41,-.06]],[.022,.019,.008]);for(let i=0;i<4;i++)strut(h,'Antenna barb',s,[d*(.16+i*.028),.24+i*.032,0],[d*(.19+i*.032),.30+i*.037,-.05],.014,.002);
 const g=group(p,'Moth wing',[d*.12,.90,-.12]);g.rotation.y=d*.35;
 plate(g,'Upper wing','#586487',[[0,0],[d*.23,.35],[d*.67,.55],[d*.56,.11],[d*.30,-.19]],.039,.027);
 plate(g,'Lower wing','#ac7c8c',[[0,-.05],[d*.39,.06],[d*.45,-.26],[d*.29,-.48],[d*.06,-.3]],.034,.018);
 oval(g,'Eyespot','#dbbb78',[d*.39,.20,.05],[.087,.109,.018]);oval(g,'Spot center',ink,[d*.39,.20,.068],[.046,.06,.009]);}
 ring(p,'Lantern handle',brass,[.30,.84,.23],.084,.014);box(p,'Amber lantern','#e9b659/lit',[.30,.70,.23],[.12,.16,.105],.019);
}
export function rusk(p){
 const s='#b77553';legs(p,s,.32,.54,-.09,4,leather);oval(p,'Low hauler',s,[0,.70,-.03],[.47,.38,.62]);
 for(let row=0;row<4;row++)for(let k=-2;k<=2;k++){const a=k*.38;oval(p,'Overlapping kiln scale',row%2?'#885142':'#ae7457',[Math.sin(a)*.44,.73+Math.cos(a)*.26,-.43+row*.22],[.13,.071,.205],[.32,0,-a]);}
 const h=head(p,{at:[0,.94,.51],skin:s,r:[.256,.20,.253],mouth:'fang'});tube(h,'Long nose',s,[[0,-.044,.145],[0,-.09,.31],[.012,-.13,.41]],[.120,.077,.03]);
 tube(p,'Armored tail',s,[[0,.7,-.52],[.10,.54,-.81],[.31,.40,-1.01],[.49,.39,-1.08]],[.16,.13,.085,.009]);
}
export function plover(p){
 const s='#699ba3';legs(p,'#a87550',.15,.92);oval(p,'Wader breast',s,[0,1.1,0],[.24,.26,.35]);
 tube(p,'Curved throat',s,[[0,1.22,.035],[0,1.44,.02],[0,1.51,.13],[0,1.62,.20]],[.109,.075,.074,.092]);
 const h=head(p,{at:[0,1.72,.20],skin:'#b7c7b5',r:[.183,.14,.162],neck:.10,mouth:'bill'});
 tube(h,'Sounding bill',brass,[[0,-.045,.10],[0,-.051,.24],[0,-.086,.48]],[.055,.041,.003]);
 for(const d of sides)leaf(p,'Folded wing','#517584',[d*.18,1.20,.07],[d*.24,1.04,-.47],.11);
 tube(p,'Chart satchel strap',leather,[[-.17,1.23,.16],[0,1.09,.30],[.18,1.01,.19]],.025);box(p,'Chart bag','#ba8051',[.18,1.0,.19],[.16,.18,.105],.025);
}
export function fenn(p){
 const s='#cf9b63';oval(p,'Pressure bladder',s,[0,.96,-.045],[.48,.47,.44]);for(let i=0;i<12;i++){const a=i*tau/12;strut(p,'Pressure spine','#eed1a5',[Math.cos(a)*.415,.99,Math.sin(a)*.39-.05],[Math.cos(a)*.545,1.03,Math.sin(a)*.51-.05],.037,.004);}
 const h=head(p,{at:[0,1.40,.20],skin:'#dcaf7c',r:[.28,.22,.25],neck:.11,mouth:'pucker'});
 for(const d of sides)leaf(h,'Fin ear','#b6675b',[d*.19,.035,-.04],[d*.42,.16,-.09],.082);
 for(const d of sides){leaf(p,'Stabilizing fin','#aa695a',[d*.34,.84,.03],[d*.62,.60,-.04],.096);tube(p,'Basket cord',leather,[[d*.30,.73,.10],[d*.21,.48,.09],[d*.15,.35,.06]],.014);}
 box(p,'Weather instrument basket',leather,[0,.31,.055],[.37,.13,.25],.045);strut(p,'Wind vane',brass,[.12,1.40,-.24],[.12,1.68,-.24],.018,.012);
}
export function koro(p){
 const s='#786867';legs(p,s,.31,.54,0,2,'#51495a');loft(p,'Geode torso',s,[[.42,.26,.21],[.52,.43,.28],[.81,.49,.32],[1.09,.43,.285],[1.20,.24,.18]],9);
 const h=head(p,{at:[0,1.52,0],skin:'#97818c',r:[.30,.25,.23],mouth:'fang'});arms(p,s,.40,.99,0,true);
 for(const d of sides)for(let j=0;j<3;j++){const x=d*(.26+j*.065);strut(p,'Amethyst seam',j%2?'#af83b0':'#7768a0',[x,1.08-.045*j,-.035],[x+d*.08,1.35-.035*j,-.044],.071,.007,5);}
 plate(p,'Open crystal seam','#71598a',[[-.12,.13],[.03,.17],[.17,.01],[.07,-.13],[-.11,-.09]],.033,.009,[0,.84,.306]);
 for(const d of sides)strut(p,'Mineral glint','#d3a6c9',[d*.06,.81,.334],[d*.08,.89,.34],.024,.003,5);
}
export function myrr(p){
 const s='#d8b58e';legs(p,s,.17,.37);loft(p,'Pleated body',s,[[.26,.24,.18],[.36,.28,.20],[.64,.21,.17],[.80,.17,.15]],15);
 const h=head(p,{at:[0,1.12,0],skin:s,r:[.20,.19,.18],mouth:'pucker'});arms(p,s,.20,.70,0,true);
 loft(h,'Bell cap','#a85f57',[[.07,.41,.34],[.10,.48,.38],[.18,.41,.33],[.28,.31,.27],[.39,.15,.14],[.43,.035,.036]]);
 for(let i=0;i<12;i++){let a=i*tau/12;strut(h,'Cream gill',ivory,[Math.cos(a)*.18,.089,Math.sin(a)*.16],[Math.cos(a)*.425,.087,Math.sin(a)*.326],.015,.006,7);}
 oval(p,'Apron','#7b9175',[0,.50,.15],[.19,.20,.059]);strut(p,'Tasting spoon',leather,[.27,.62,.20],[.37,.86,.24],.018,.022);oval(p,'Spoon bowl',brass,[.38,.89,.24],[.044,.059,.014]);
}
export function sarra(p){
 const s='#719d89';tube(p,'Coiled body',s,[[-.34,.14,.29],[-.57,.16,-.10],[-.25,.20,-.42],[.38,.22,-.33],[.43,.27,.17],[.07,.34,.27],[-.20,.58,.13],[-.15,.81,.03],[.01,.99,.06]],[.012,.113,.158,.19,.17,.157,.139,.122,.10],14);
 const h=head(p,{at:[.04,1.22,.09],skin:s,r:[.249,.172,.231],mouth:'fang'});for(const d of sides)plate(h,'Neck hood','#a6b679',[[d*.10,.095],[d*.33,.215],[d*.42,.07],[d*.33,-.14],[d*.14,-.26]],.045,.025,[0,-.045,-.065]);
 tube(p,'Glassblowing pipe',brass,[[.04,1.15,.305],[.12,1.10,.48],[.36,1.01,.62]],.017);oval(p,'Molten gather','#e6a65e/glass',[.38,1.0,.63],[.078,.062,.071]);
}
export function ilex(p){
 const s='#7d9982';legs(p,s,.24,.71,-.04,4);oval(p,'Mossy back',s,[0,.80,-.05],[.32,.26,.46]);const h=head(p,{at:[0,1.38,.22],skin:'#8fa58c',r:[.223,.22,.24],neck:.31,mouth:'seam'});
 for(const d of sides){tube(h,'Antler',leather,[[d*.11,.15,-.03],[d*.20,.32,-.04],[d*.30,.43,-.10],[d*.35,.64,-.10]],[.045,.038,.026,.005]);
 tube(h,'Antler fork',leather,[[d*.24,.36,-.06],[d*.39,.44,-.04],[d*.46,.53,0]],[.025,.016,.004]);leaf(h,'Ear',s,[d*.17,.07,0],[d*.36,.20,-.06],.062);leaf(h,'Lichen sprig','#b4c36d',[d*.31,.45,-.08],[d*.41,.49,-.03],.044);}
}
export function kepp(p){
 const s='#85a79b';loft(p,'Muscular foot',s,[[.025,.39,.66],[.09,.45,.72],[.18,.37,.61],[.26,.21,.39]],28);
 oval(p,'Shell','#ad795a',[0,.43,-.17],[.39,.42,.395]);for(const d of sides){let curve=[];for(let i=0;i<32;i++){let a=i*.228,r=.035+i*.009;curve.push([d*(.40-.15*(r/.33)**2),.44+Math.sin(a)*r,-.17+Math.cos(a)*r]);}tube(p,'Shell spiral','#dbb17b',curve,.022,7);}
 tube(p,'Rising neck',s,[[0,.16,.37],[0,.29,.50],[0,.45,.53]],[.21,.17,.13]);const h=head(p,{at:[0,.61,.54],skin:s,r:[.211,.16,.196],neck:.10,mouth:'pucker'});
 for(const d of sides){tube(h,'Sensing stalk',s,[[d*.10,.08,0],[d*.15,.20,-.02],[d*.20,.32,.02]],[.033,.026,.018]);oval(h,'Sensory bulb','#c0c593',[d*.20,.32,.02],[.039,.044,.038]);}
}
export function yarro(p){
 const s='#488c91';legs(p,s,.20,.58);oval(p,'Glider body',s,[0,.88,0],[.28,.37,.24]);const h=head(p,{at:[0,1.51,.02],skin:s,r:[.267,.205,.22],neck:.19,mouth:'bill'});
 for(const d of sides){const wing=group(p,'Gliding sail',[d*.20,1.02,-.045]);plate(wing,'Membrane','#ca926e',[[0,0],[d*.44,.27],[d*.82,.18],[d*.57,.015],[d*.46,-.16],[d*.32,-.185],[d*.16,-.37]],.025,.012);
 for(const [x,y] of [[.82,.18],[.46,-.16],[.16,-.37]])tube(wing,'Sail spar',s,[[0,0,.022],[d*.31,.14,.025],[d*x,y,.026]],[.044,.027,.009]);}
 fan(h,'Head crest',[0,.12,-.06],5,.68,.27,.045,['#809f86','#c49d77']);
}
export function nacre(p){
 const s='#ae817e';for(let k=0;k<6;k++){const a=k*tau/6;let x=Math.cos(a),z=Math.sin(a);tube(p,'Shell foot',s,[[x*.17,.57,z*.13],[x*.26,.37,z*.22],[x*.37,.18,z*.31],[x*.44,.085,z*.37],[x*.47,.12,z*.39]],[.088,.093,.058,.033,.009]);}
 oval(p,'Mantle',s,[0,.62,0],[.32,.285,.27]);const h=head(p,{at:[0,.98,.10],skin:s,r:[.26,.187,.21],mouth:'bill'});
 for(let i=0;i<11;i++){let a=(-.5+i/10)*2.35;leaf(p,'Shell rib',i%2?'#d8b29a':'#b88e8d',[0,.66,-.14],[Math.sin(a)*.62,.76+Math.cos(a)*.70,-.19],.102);}
}
export function tacca(p){
 const s='#ad8c71';legs(p,s,.18,.39);oval(p,'Compact body',s,[0,.64,0],[.27,.30,.25]);arms(p,s,.21,.77);const h=head(p,{at:[0,1.13,.03],skin:s,r:[.289,.232,.23],mouth:'pucker'});
 for(const d of sides){oval(h,'Resonating ear',s,[d*.22,.32,-.013],[.124,.31,.073],[0,0,-d*.28]);oval(h,'Ear lining','#c28e92',[d*.227,.337,.055],[.079,.238,.018],[0,0,-d*.28]);}
 box(p,'Seismic receiver','#507e7f',[0,.59,.25],[.24,.20,.085],.035);ring(p,'Receiver grille',brass,[0,.61,.297],.064,.012);
}
export function sova(p){
 const s='#927c6b';legs(p,'#ac915c',.17,.36);oval(p,'Feathered body',s,[0,.67,0],[.31,.37,.25]);const h=head(p,{at:[0,1.26,.016],skin:'#ab9980',r:[.347,.259,.25],mouth:'bill',iris:'#a67c39'});
 for(const d of sides){ring(h,'Facial disk',ivory,[d*.168,.028,.202],.115,.018,[1,1.12,1],[0,d*.28,0]);leaf(h,'Ear tuft',s,[d*.20,.17,-.04],[d*.30,.35,-.07],.068);leaf(p,'Tucked wing','#78685e',[d*.23,.86,-.03],[d*.26,.45,-.19],.14);}
 box(p,'Archive folio','#516966',[0,.59,.25],[.35,.28,.08],.02,[0,0,.1]);box(p,'Paper edges',ivory,[0,.60,.286],[.305,.22,.021],.005,[0,0,.1]);}
export function pavo(p){
 const s='#528a89';legs(p,'#a07c5a',.16,.51);oval(p,'Herald torso',s,[0,.78,0],[.25,.32,.24]);const h=head(p,{at:[0,1.34,.09],skin:s,r:[.219,.182,.20],neck:.23,mouth:'bill'});
 for(let i=0;i<11;i++){let a=-1.15+i*.23,x=Math.sin(a)*.69,y=.77+Math.cos(a)*.91;leaf(p,'Fan feather',i%2?'#537d70':'#6a9490',[0,.53,-.16],[x,y,-.28],.094);oval(p,'Feather eye','#a5a35e',[x*.90,y-.078,-.25],[.064,.094,.023],[0,0,-a]);oval(p,'Eye center','#476777',[x*.90,y-.075,-.224],[.034,.050,.010],[0,0,-a]);}
 fan(h,'Coronet',[0,.14,0],3,.7,.20,.026,[brass]);}
export function kipp(p){
 const s='#869557';legs(p,s,.31,.48,-.05,6);oval(p,'Beetle belly',s,[0,.59,-.07],[.355,.27,.49]);
 for(const d of sides){oval(p,'Wing case','#526b69',[d*.15,.745,-.14],[.195,.19,.42],[0,d*.10,0]);for(let j=0;j<3;j++)oval(p,'Case stud','#ccb67a',[d*.22,.891,-.37+j*.17],[.035,.022,.039]);}
 const h=head(p,{at:[0,.90,.355],skin:s,r:[.235,.176,.2],mouth:'fang'});for(const d of sides)tube(h,'Club antenna',dark,[[d*.12,.12,0],[d*.19,.25,.05],[d*.25,.30,.14]],[.017,.014,.028]);}
export function marlo(p){
 const s='#91a5a4';legs(p,s,.28,.38);oval(p,'Heavy coat',s,[0,.72,0],[.426,.45,.35]);arms(p,s,.33,.90);const h=head(p,{at:[0,1.38,.04],skin:s,r:[.319,.247,.258],mouth:'seam'});
 for(const d of sides){oval(h,'Whisker pad','#c4b5a1',[d*.092,-.068,.218],[.10,.076,.076]);tube(h,'Ivory tusk',ivory,[[d*.115,-.09,.248],[d*.127,-.20,.259],[d*.104,-.31,.29]],[.043,.033,.004]);}
 ring(p,'Wool scarf','#a5574d',[0,1.09,.028],.211,.040,[1,.88,1],[Math.PI/2,0,0]);}
export function aril(p){
 const s='#72966c';for(const d of sides){tube(p,'Root stilt',s,[[d*.13,.77,0],[d*.29,.48,-.03],[d*.21,.22,.04],[d*.32,.075,.13]],[.08,.067,.041,.022]);oval(p,'Root foot',s,[d*.31,.066,.13],[.09,.049,.11]);}
 oval(p,'Seedpod','#c99363',[0,.92,0],[.24,.35,.207]);const h=head(p,{at:[0,1.46,.02],skin:'#97ab77',r:[.218,.179,.19],mouth:'pucker'});arms(p,s,.19,1.09,0,true);
 tube(h,'Vine curl',s,[[0,.13,0],[.02,.33,0],[.18,.43,0],[.25,.32,0],[.16,.29,.012]],[.028,.025,.022,.019,.007]);leaf(h,'Cotyledon',s,[0,.24,0],[-.29,.39,-.025],.09);leaf(h,'Cotyledon','#a3b67a',[.03,.31,0],[.15,.53,-.01],.071);}
export function sura(p){
 const s='#daa16b';tube(p,'Anchor tail',s,[[0,.80,0],[-.12,.54,-.01],[-.21,.28,.06],[-.08,.12,.12],[.13,.14,.15],[.19,.29,.12],[.07,.32,.10],[.04,.25,.10]],[.155,.13,.091,.069,.05,.033,.022,.006]);
 oval(p,'Keel chest',s,[0,.85,0],[.205,.35,.242]);tube(p,'Arched neck',s,[[0,1.02,0],[-.05,1.19,-.035],[.015,1.36,.03]],[.115,.102,.094]);const h=head(p,{at:[.025,1.48,.08],skin:s,r:[.19,.187,.18],neck:.1,mouth:'pucker'});
 tube(h,'Sounding snout',s,[[0,-.06,.12],[0,-.082,.23],[0,-.091,.35]],[.085,.056,.064]);oval(h,'Snout opening',ink,[0,-.09,.353],[.032,.034,.009]);for(let j=0;j<5;j++)leaf(p,'Dorsal ribbon','#c47870',[0,.67+.09*j,-.16],[0,.75+.09*j,-.38],.06);fan(h,'Coral crest',[0,.12,-.03],5,.98,.18,.029,['#be7968','#c98a63']);}
