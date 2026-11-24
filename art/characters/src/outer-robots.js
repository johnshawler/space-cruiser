import {group,oval,box,strut,tube,loft,plate,ring,leaf,bolt,mechArm,sides,tau,ivory,brass,dark,ink,copper,steel,optic} from './sculpt.js';
import {lens,tire,dial} from './anatomy.js';

function feet(p,x,y,paint,z=0){
 for(const s of sides){mechArm(p,[s*x,y,z],[s*x*1.12,y*.56,z+.035],[s*x*1.10,.13,z+.03],Math.min(.105,y*.18),paint);box(p,'Sole',dark,[s*x*1.1,.082,z+.09],[.21,.15,.29],.036);}
}
function neck(p,y,h,paint,x=0,z=0){strut(p,'Neck piston',brass,[x,y,z],[x,y+h,z],.062,.059);box(p,'Optics housing',paint,[x,y+h+.072,z],[.33,.19,.23],.048);lens(p,[x,y+h+.073,z+.115],.075);}
function gripping(p,shoulder,elbow,hand,paint){mechArm(p,shoulder,elbow,hand,.057,paint);for(const s of sides){tube(p,'Jaw',brass,[hand,[hand[0]+s*.043,hand[1]-.065,hand[2]+.025],[hand[0]+s*.026,hand[1]-.095,hand[2]+.065]],[.026,.022,.013]);}}
export function lyre(p){
 const c='#58918b/metal';feet(p,.22,.37,c);box(p,'Soundboard',c,[0,.47,0],[.54,.31,.23],.079);
 for(const d of sides)tube(p,'Resonator horn',c,[[d*.16,.53,0],[d*.33,.70,0],[d*.32,1.04,0],[d*.42,1.28,0]],[.078,.077,.060,.042]);
 strut(p,'Tuning rail',brass,[-.38,1.23,0],[.38,1.23,0],.037,.037);for(let i=0;i<7;i++){let x=(i-3)*.07;strut(p,'Harmonic string',ivory,[x,.55,.025],[x*1.2,1.23,.025],.005,.005,5);bolt(p,[x*1.2,1.24,.038],.018);}
 lens(p,[0,.49,.115],.081);gripping(p,[.24,.57,0],[.43,.53,.1],[.19,.73,.11],c);
}
export function iris(p){
 const c='#688694/metal';for(let k=0;k<3;k++){let a=k*tau/3;strut(p,'Camera tripod',steel,[0,.66,0],[.39*Math.cos(a),.08,.39*Math.sin(a)],.043,.031);oval(p,'Tripod foot',dark,[.39*Math.cos(a),.056,.39*Math.sin(a)],[.081,.046,.077]);}
 strut(p,'Camera column',brass,[0,.51,0],[0,.89,0],.073,.067);box(p,'Bellows camera',c,[0,1.07,0],[.56,.34,.30],.045);
 for(let i=0;i<5;i++)box(p,'Bellows fold',i%2?dark:steel,[0,1.07,.18+i*.036],[.31-i*.016,.25-i*.014,.047],.014);
 lens(p,[0,1.07,.36],.136);box(p,'Finder',brass,[-.17,1.29,0],[.15,.08,.13],.018);strut(p,'Cable release',c,[.26,1.12,0],[.42,1.25,.015],.018,.014);
}
export function crimp(p){
 const c='#bc765c/metal';for(const d of sides)tire(p,d*.28,.21,0,.21,.12);
 box(p,'Bench vice chassis',c,[0,.37,0],[.58,.26,.36],.054);box(p,'Jaw bed',steel,[0,.58,0],[.71,.12,.30],.03);
 for(const d of sides){box(p,'Vice jaw',c,[d*.252,.75,0],[.15,.29,.29],.03);box(p,'Jaw liner',brass,[d*.18,.84,0],[.048,.12,.30],.009);}
 strut(p,'Lead screw',brass,[-.47,.55,.03],[.47,.55,.03],.039,.039);strut(p,'T handle',steel,[.49,.42,.03],[.49,.68,.03],.018,.018);
 neck(p,.46,.59,c,0,-.13);gripping(p,[-.28,.45,0],[-.48,.47,.02],[-.42,.68,.08],c);
}
export function relay(p){
 const c='#64867b/metal';feet(p,.23,.42,c);box(p,'Receiver cabinet',c,[0,.68,0],[.60,.56,.32],.056);
 for(let j=0;j<4;j++)box(p,'Speaker slot',dark,[0,.55+j*.056,.171],[.34,.021,.015],.007);
 const g=group(p,'Dish gimbal',[0,1.02,0]);g.rotation.x=-.39;
 for(let i=0;i<3;i++)ring(g,'Parabolic rib',brass,[0,.15,i*.035],.12+i*.095,.014);
 for(let i=0;i<8;i++){let a=i*tau/8;strut(g,'Dish spoke',steel,[0,.15,-.07],[Math.cos(a)*.31,.15+Math.sin(a)*.31,.08],.013,.009);}
 lens(g,[0,.15,.106],.074);strut(p,'Whip aerial',c,[-.26,.92,-.08],[-.32,1.48,-.09],.016,.006);
}
export function kiln(p){
 const c='#b96d49/metal';for(const d of sides){tire(p,d*.33,.15,-.12,.15,.09);tire(p,d*.33,.15,.12,.15,.09);}
 loft(p,'Furnace body',c,[[.18,.28,.24],[.24,.37,.29],[.65,.39,.31],[.89,.29,.25],[.97,.19,.17]],16);
 box(p,'Hearth door',dark,[0,.57,.29],[.39,.29,.075],.04);box(p,'Furnace glow','#f39847/lit',[0,.57,.333],[.30,.20,.016],.027);
 for(let i=-2;i<=2;i++)box(p,'Fire bar',steel,[i*.058,.57,.347],[.018,.20,.018],.005);strut(p,'Flue',steel,[.12,.90,-.04],[.12,1.26,-.04],.093,.074);ring(p,'Chimney lip',brass,[.12,1.26,-.04],.079,.014,[1,1,1],[Math.PI/2,0,0]);lens(p,[-.097,.82,.228],.085);
}
export function wick(p){
 const c='#6b7e86/metal';feet(p,.16,.32,c);strut(p,'Beacon base',c,[0,.27,0],[0,.48,0],.25,.215,12);strut(p,'Beacon pedestal',c,[0,.46,0],[0,.87,0],.20,.124,12);
 strut(p,'Crystal lantern','#dfb36f/glass',[0,.88,0],[0,1.21,0],.141,.14,12);for(let i=0;i<4;i++){const a=i*tau/4+.4;strut(p,'Guard rod',brass,[Math.cos(a)*.15,.86,Math.sin(a)*.15],[Math.cos(a)*.15,1.23,Math.sin(a)*.15],.013,.013);}
 strut(p,'Lantern canopy',c,[0,1.21,0],[0,1.32,0],.219,.065,12);oval(p,'Beacon finial',brass,[0,1.35,0],[.033,.051,.033]);lens(p,[0,.67,.167],.063);
}
export function fathom(p){
 const c='#aa8452/metal';oval(p,'Bathysphere',c,[0,.71,0],[.38,.381,.36]);ring(p,'Pressure seam',steel,[0,.71,0],.37,.026,[1,.95,1],[Math.PI/2,0,0]);lens(p,[0,.76,.318],.155);
 for(const d of sides){strut(p,'Ballast strut',steel,[d*.19,.47,0],[d*.30,.23,0],.041,.036);box(p,'Landing skid',c,[d*.30,.19,0],[.092,.08,.55],.031);strut(p,'Thruster',c,[d*.40,.58,-.11],[d*.40,.58,.09],.105,.105);}
 strut(p,'Periscope',brass,[.04,1.02,0],[.04,1.24,0],.036,.03);box(p,'Scope mirror',c,[.04,1.25,.035],[.11,.082,.115],.019);
}
export function dolly(p){
 const c='#9e6d80/metal';for(const x of [-.27,.27])for(const z of [-.24,.24])tire(p,x,.108,z,.101,.075);box(p,'Parcel deck',c,[0,.235,0],[.63,.15,.68],.05);
 for(const d of sides)tube(p,'Cart handle',brass,[[d*.23,.30,-.25],[d*.23,.79,-.29],[d*.23,.91,-.18]],[.026,.026,.022]);strut(p,'Push bar',dark,[-.23,.91,-.18],[.23,.91,-.18],.031,.031);
 box(p,'Lower parcel','#ae9269',[0,.43,.06],[.47,.22,.40],.026);box(p,'Upper parcel','#70877c',[-.04,.62,.02],[.34,.17,.33],.021,[0,.15,0]);box(p,'Strap',ivory,[0,.622,.03],[.048,.18,.339],.007,[0,.15,0]);lens(p,[0,.26,.335],.072);
}
export function orlo(p){
 const c='#667c9a/metal';strut(p,'Gyro base',c,[0,.11,0],[0,.25,0],.25,.18,16);strut(p,'Axle post',brass,[0,.23,0],[0,.66,0],.057,.049);
 const center=[0,.83,0];for(const [r,rot,col] of [[.39,[.19,.20,.20],c],[.32,[.89,-.72,.12],brass],[.24,[-.66,.63,-.3],steel]])ring(p,'Gimbal',col,center,r,.027,[1,1,1],rot);
 oval(p,'Pendulum core',c,center,[.145,.18,.13]);lens(p,[0,.84,.131],.064);
}
export function chime(p){
 const c='#a98451/metal';feet(p,.22,.35,steel);loft(p,'Bell housing',c,[[.30,.36,.32],[.35,.39,.35],[.42,.32,.29],[.67,.22,.21],[.89,.19,.18],[.96,.10,.10]]);
 ring(p,'Bell rim',brass,[0,.35,0],.36,.023,[1,.89,1],[Math.PI/2,0,0]);neck(p,.94,.15,c);
 gripping(p,[.18,.75,0],[.39,.62,.07],[.42,.49,.16],steel);strut(p,'Striker shaft',dark,[.42,.50,.15],[.29,.38,.22],.016,.018);oval(p,'Felt mallet','#875557',[.27,.37,.23],[.056,.052,.057]);
}
export function shuttle(p){
 const c='#7e8181/metal';oval(p,'Weaving shuttle',c,[0,.60,0],[.67,.18,.205]);box(p,'Bobbin well',dark,[0,.74,0],[.42,.055,.195],.025);
 strut(p,'Spool spindle',brass,[-.20,.79,0],[.20,.79,0],.028,.028);for(let i=0;i<7;i++)strut(p,'Thread wrap','#ad6677',[-.11+i*.031,.79,0],[-.087+i*.031,.79,0],.075,.075);
 for(const d of sides){for(const z of [-.107,.107])mechArm(p,[d*.28,.52,z],[d*.39,.30,z],[d*.46,.19,z+.03],.039,brass);}
 lens(p,[-.28,.63,.168],.063);tube(p,'Loose thread','#c39b96',[[.06,.84,.03],[.16,.89,.10],[.37,.72,.17],[.50,.66,.06]],.009);
}
export function cairn(p){
 const c='#80938e/metal';for(const [i,y,w] of [[0,.23,.59],[1,.49,.48],[2,.74,.39]]){const g=group(p,'Counterweight '+i,[0,y,0]);g.rotation.y=i*.36;box(g,'Rounded stone housing',i===1?'#9f9284/metal':c,[0,0,0],[w,.24,w*.76],.08);}
 strut(p,'Top survey pin',brass,[0,.84,0],[0,1.06,0],.045,.034);box(p,'Level head',c,[0,1.08,0],[.37,.11,.13],.025);lens(p,[.073,1.08,.065],.044);
 for(const d of sides)box(p,'Sled runner',dark,[d*.18,.08,0],[.077,.08,.49],.026);
}
export function pinion(p){
 const c='#9a6c56/metal';oval(p,'Aerial gearbox',c,[0,.68,0],[.22,.20,.30]);for(const d of sides){
 plate(p,'Fixed wing',ivory,[[d*.10,.69],[d*.81,.82],[d*.90,.74],[d*.36,.62]],.16,.013,[0,0,-.05]);
 strut(p,'Wing brace',brass,[d*.11,.54,0],[d*.62,.75,0],.014,.012);strut(p,'Prop axle',steel,[d*.46,.75,.05],[d*.46,.75,.22],.024,.021);for(const t of sides)leaf(p,'Prop blade',dark,[d*.46,.75,.22],[d*.46+t*.05,.75+t*.16,.22],.034);}
 lens(p,[0,.70,.273],.087);plate(p,'Tail rudder',c,[[-.12,0],[0,.27],[.14,.02]],.045,.015,[0,.72,-.29]);}
export function tempo(p){
 const c='#996653/metal';for(const d of sides)tire(p,d*.19,.13,0,.13,.07);
 plate(p,'Metronome case',c,[[-.25,.21],[.25,.21],[.11,1.12],[-.095,1.12]],.28,.042);plate(p,'Scale insert',dark,[[-.14,.44],[.14,.44],[.06,1.04],[-.055,1.04]],.01,.008,[0,0,.167]);
 for(let i=0;i<7;i++)box(p,'Engraving',ivory,[0,.51+i*.07,.18],[.104-i*.005,.008,.01],.002);
 strut(p,'Pendulum',brass,[0,.39,.195],[.20,1.13,.197],.014,.014);box(p,'Sliding weight',steel,[.146,.93,.20],[.095,.089,.034],.012,[0,0,-.26]);lens(p,[0,.33,.168],.056);
}
export function glint(p){
 const c='#8299a5/metal';for(const d of sides)strut(p,'Landing leg',c,[d*.12,.48,0],[d*.28,.055,.08],.051,.044);strut(p,'Rear support',steel,[0,.48,-.08],[0,.055,-.28],.041,.032);
 oval(p,'Mirror yoke',c,[0,.64,0],[.24,.21,.175]);const g=group(p,'Mirror head',[0,.96,0]);g.rotation.set(-.17,-.15,.1);
 plate(g,'Hexagonal reflector frame',brass,[[-.33,0],[-.17,.30],[.17,.30],[.33,0],[.17,-.30],[-.17,-.30]],.055,.02);
 plate(g,'Silver reflector','#adc9cb/glass',[[-.29,0],[-.146,.26],[.146,.26],[.29,0],[.146,-.26],[-.146,-.26]],.019,.008,[0,0,.043]);lens(p,[0,.65,.164],.065);
}
export function purl(p){
 const c='#9e7982/metal';feet(p,.16,.37,c);oval(p,'Yarn drum',c,[0,.57,0],[.27,.27,.23]);for(let j=0;j<7;j++)ring(p,'Wound fibre',j%2?'#be9688':'#ae7c75',[0,.44+j*.044,0],.243-((j-3)**2)*.005,.016,[1,.85,1],[Math.PI/2,0,0]);
 neck(p,.79,.13,c);for(const d of sides){gripping(p,[d*.21,.64,0],[d*.36,.55,.09],[d*.30,.72,.20],steel);strut(p,'Knitting needle',brass,[d*.40,.66,.24],[-d*.11,.99,.25],.014,.003);}
}
export function latch(p){
 const c='#718a77/metal';for(const d of sides)tire(p,d*.25,.185,0,.185,.10);
 box(p,'Lock body',c,[0,.49,0],[.61,.47,.28],.075);tube(p,'U-shaped shackle',steel,[[-.19,.68,0],[-.19,.97,0],[-.14,1.10,0],[.03,1.15,0],[.17,1.06,0],[.19,.90,0],[.19,.72,0]],.054);
 lens(p,[0,.55,.145],.092);box(p,'Keyway',dark,[0,.403,.157],[.045,.09,.016],.01);gripping(p,[.25,.60,0],[.39,.54,.09],[.38,.39,.15],c);
}
export function plume(p){
 const c='#698e9a/metal';strut(p,'Nozzle bank',c,[0,.38,0],[0,.64,0],.21,.29,12);oval(p,'Air sampler',c,[0,.75,0],[.285,.20,.25]);lens(p,[0,.76,.222],.087);
 for(let i=0;i<5;i++){let a=tau*i/5;let x=Math.cos(a)*.14,z=Math.sin(a)*.13;strut(p,'Sample tube',i%2?brass:steel,[x,.86,z],[x*1.2,1.12+.085*(i%3),z*1.2],.037,.039);}
 for(const d of sides){strut(p,'Jet pod',steel,[d*.26,.48,0],[d*.26,.75,0],.097,.075);ring(p,'Exhaust lip',brass,[d*.26,.48,0],.084,.014,[1,1,1],[Math.PI/2,0,0]);}
}
export function prong(p){
 const c='#c68c49/metal';for(const d of sides)for(const z of [-.21,.21])tire(p,d*.28,.14,z,.13,.082);
 box(p,'Cargo tug',c,[0,.32,-.02],[.57,.28,.60],.053);box(p,'Counterweight',steel,[0,.53,-.17],[.47,.23,.29],.052);
 for(const d of sides){box(p,'Mast rail',steel,[d*.185,.55,.238],[.055,.87,.074],.014);box(p,'Fork heel',c,[d*.185,.29,.312],[.077,.23,.105],.01);box(p,'Lifting tine',brass,[d*.185,.197,.51],[.079,.047,.43],.013);}
 box(p,'Lift carriage',c,[0,.38,.284],[.447,.091,.071],.016);neck(p,.60,.17,c,0,-.14);
}
