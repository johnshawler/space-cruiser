import {group,oval,box,strut,tube,ring,eye,leaf,sides,brass,ivory,ink,tau} from './sculpt.js';

export function legs(p,skin,x,hip,depth=0,count=2,foot=skin){
  for(let row=0;row<count/2;row++)for(const s of sides){
    const z=depth+(row-(count/2-1)/2)*.46,wide=s*x;
    const g=group(p,'Leg', [wide,hip,z]);
    tube(g,'Bent limb',skin,[[0,0,0],[wide*.25,-hip*.44,.06],[wide*.19,-hip*.68,-.025],[wide*.32,-hip+.11,.065]],[.104,.091,.068,.056]);
    oval(g,'Foot',foot,[wide*.32,-hip+.083,.12],[.109,.077,.165]);
  }
}
export function arms(p,skin,x,y,z=0,raised=false){
  for(const s of sides){const arm=group(p,'Arm',[s*x,y,z]),lift=raised&&s===1?.26:0;
    tube(arm,'Forearm',skin,[[0,0,0],[s*.14,-.18,.02],[s*.15,-.29+lift,.13],[s*.09,-.36+lift,.22]],[.083,.076,.059,.047]);
    oval(arm,'Hand',skin,[s*.09,-.36+lift,.225],[.075,.064,.075]);}
}
export function head(p,{at,skin,r=[.31,.255,.25],neck=.17,iris='#618f7a',mouth='seam',eyeCount=2}){
  const [x,y,z]=at,[rx,ry,rz]=r;strut(p,'Visible neck',skin,[x,y-ry-neck,z],[x,y-ry*.67,z],Math.min(rx*.49,.16),rx*.42);
  const h=group(p,'Head',at);oval(h,'Cranium',skin,[0,0,0],r);
  for(let i=0;i<eyeCount;i++){const k=eyeCount===1?0:(i/(eyeCount-1)-.5)*1.04;const ey=eyeCount===3&&i===1?.065:0;
    eye(h,[k*rx,.035+ey,rz*Math.sqrt(Math.max(.1,1-k*k))*.9],Math.min(.104,rx*(eyeCount===3?.235:.31)),iris,k*-.115);}
  const yy=-ry*.36,zz=rz*.94,w=rx*.32;
  if(mouth==='bill'){tube(h,'Tapered beak','#ca985a',[[0,yy+.023,zz-.032],[0,yy+.002,zz+.063],[0,yy-.033,zz+.14]],[w,w*.63,.007]);}
  else if(mouth==='pucker'){oval(h,'Puckered muzzle','#bc8374',[0,yy,zz-.015],[w,.053,.041]);oval(h,'Mouth slit',ink,[0,yy,zz+.019],[w*.47,.013,.008]);}
  else if(mouth==='fang'){tube(h,'Snout seam',ink,[[-w,yy,zz-.018],[0,yy-.023,zz+.008],[w,yy,zz-.018]],[.006,.012,.006]);for(const s of sides)strut(h,'Ivory tusk',ivory,[s*w,yy+.012,zz],[s*w*.85,yy-.065,zz+.029],.025,.003);}
  else {tube(h,'Lip crease',ink,[[-w,yy+.007,zz-.017],[0,yy-.018,zz+.008],[w,yy+.010,zz-.017]],[.007,.014,.006]);}
  return h;
}
export function fan(p,n,at,count,span,len,width,colors){
  for(let i=0;i<count;i++){let a=(i/(count-1)-.5)*span;leaf(p,n,colors[i%colors.length],at,[at[0]+Math.sin(a)*len,at[1]+Math.cos(a)*len,at[2]-.08*(1-Math.cos(a))],width);}
}
export function lens(p,at,r,col='#9de1d9/lit'){const g=group(p,'Lens',at);
  strut(g,'Barrel',ink,[0,0,-.028],[0,0,.035],r,r,20);ring(g,'Lens bezel',brass,[0,0,.037],r*.81,r*.10);
  oval(g,'Optical glass',col,[0,0,.038],[r*.69,r*.69,r*.31]);return g;}
export function tire(p,x,y,z,r,width=.10){
  strut(p,'Rubber wheel',ink,[x-width/2,y,z],[x+width/2,y,z],r,r,24);
  for(const s of sides)strut(p,'Wheel hub',brass,[x+s*width*.45,y,z],[x+s*width*.57,y,z],r*.48,r*.42,16);
}
export function dial(p,at,r){const g=group(p,'Instrument dial',at);strut(g,'Dial case',brass,[0,0,-.03],[0,0,.03],r,r,24);strut(g,'Dial face',ivory,[0,0,.031],[0,0,.036],r*.89,r*.89,24);
 for(let i=0;i<7;i++){const a=(-.39+i*.13)*tau;strut(g,'Scale mark',ink,[Math.sin(a)*r*.69,Math.cos(a)*r*.69,.04],[Math.sin(a)*r*.8,Math.cos(a)*r*.8,.04],.005,.005,5);}
 strut(g,'Needle','#9d413c',[0,0,.044],[r*.41,r*.52,.044],.012,.004,7);}
