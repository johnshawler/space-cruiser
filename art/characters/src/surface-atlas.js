// Both the glTF authoring tool and the renderer use these tissue and alloy definitions.
const castHides = {
  orris:'skin', vela:'membrane', obo:'chitin', silt:'scales', mica:'scales', nim:'skin',
  neru:'fur', caelo:'fur', rusk:'scales', plover:'feather', fenn:'skin', koro:'stone',
  myrr:'wax', sarra:'scales', ilex:'fur', kepp:'membrane', yarro:'scales', nacre:'membrane',
  tacca:'fur', sova:'feather', pavo:'feather', kipp:'chitin', marlo:'fur', aril:'leaf', sura:'scales'
};
export const surfaceProperties = {
  // roughness factor, metallic factor, normal strength, subsurface weight
  skin:[.78,0,.33,.19], membrane:[.49,0,.18,.28], wax:[.68,0,.32,.30],
  fur:[.96,0,.58,.055], feather:[.80,.015,.47,.065], chitin:[.64,.07,.33,.045],
  scales:[.77,.025,.49,.09], stone:[.89,.04,.66,0], leaf:[.67,.005,.47,.21],
  canvas:[.94,.005,.63,0], leather:[.82,.012,.46,0],
  pitted:[.83,.79,.82,0], enamel:[.74,.24,.48,0], alloy:[.61,.85,.39,0], rubber:[.91,.01,.38,0]
};
export function surfaceRole(id,name,parent,material){
  const label=(name+' '+(name==='Blade'?parent:'')).toLowerCase();
  if(/\/lit|\/glass/.test(material)||/eye|pupil|iris|sclera|brow|catchlight|mouth|lip|fang|tusk|tooth|teeth|bill|beak|lens|optic(?!s housing)|glint|tongue|nostril|snout opening|spot center/.test(label))return null;
  if(/wool|scarf|sash|apron|sailcloth|canvas|folio|woven|fabric|cape|uniform|jacket|tunic|straw/.test(label))return 'canvas';
  if(/satchel|strap|leather|pouch|boot|bag|belt/.test(label))return 'leather';
  if(/tire|tyre|gasket|rubber|wheel tread|bellows fold/.test(label))return 'rubber';
  if(/leaf|cotyledon|frond|sprig|vine|seedpod/.test(label))return 'leaf';
  if(/folded wing|tucked wing|fan feather|ear tuft|feathered body|wader breast|herald torso/.test(label))return 'feather';
  if(/velvet thorax|heavy coat|otterlike trunk|compact body|mossy back|whisker pad/.test(label))return 'fur';
  if(/moth wing|upper wing|lower wing|membrane|fin ear|fin ribbon|gill finger|pressure bladder/.test(label))return 'membrane';
  if(/shell rib|shell spiral|wing case/.test(label)||label.trim()==='shell')return 'chitin';
  if(/scale|armored tail/.test(label))return 'scales';
  if(/amethyst|crystal seam|geode/.test(label))return 'stone';
  if(/piston|polished|brass|sextant|shaft|needle|tuning|hinge|rivet|copper|steel|wire|pipe|grille|dial|buckle/.test(label))return 'alloy';
  if(!castHides[id]){
    if(/foot|chassis|sole|hull|boiler|plate|housing|drum|shoulder|bucket|scrap|jaw|chisel|fork|counterweight|track|caster|guard/.test(label))return 'pitted';
    return material.includes('/metal')?'alloy':'enamel';
  }
  if(material.includes('/metal'))return 'alloy';
  return castHides[id];
}
export function groomKind(name){
  if(/^(Heavy coat|Otterlike trunk|Compact body|Velvet thorax|Mossy back)$/.test(name))return 'fur';
  if(/^(Wader breast|Herald torso|Feathered body)$/.test(name))return 'feather';
  return null;
}
export function groomMesh(kind,id){
  // Body patches are authored on unit ellipsoids. Their existing local transform
  // shapes the strands, and their parent joint carries them through the gait.
  const pos=[],uv=[],index=[];const count=kind==='fur'?(id==='marlo'?1250:680):270;
  let state=12381;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
  for(let i=0;i<count;i++){
    const y=2*(i+.5)/count-1,a=i*2.39996323+random()*.067,r=Math.sqrt(1-y*y);
    const n=[r*Math.cos(a),y,r*Math.sin(a)],t=[-Math.sin(a),0,Math.cos(a)],d=[y*Math.cos(a),-r,y*Math.sin(a)];
    const offset=kind==='fur'?.09:.052,wide=(kind==='fur'?.017:.074)*(.8+random()*.4);
    const len=(kind==='fur'?(id==='marlo'?.16:.095):.235)*(.75+random()*.52),at=pos.length/3;
    const vertex=(w,l,h,u,v)=>{for(let j=0;j<3;j++)pos.push(n[j]*(.988+h)+t[j]*w+d[j]*l);uv.push(u,v);};
    vertex(0,0,0,.5,0);vertex(-wide,len*.34,offset*.58,0,.35);vertex(0,len*.47,offset,.5,.46);
    vertex(wide,len*.34,offset*.58,1,.35);vertex(wide*(random()-.5),len,offset*.70,.5,1);
    for(const q of [0,2,1,0,3,2,1,2,4,2,3,4])index.push(at+q);
  }
  return {pos,uv,index};
}
function atlasHash(x,y){let n=Math.imul(x+1871,374761393)+Math.imul(y+937,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function atlasNoise(u,v,f){
  const x=u*f,y=v*f,i=Math.floor(x),j=Math.floor(y),wrap=n=>(n%f+f)%f;
  const a=x-i,b=y-j,tx=a*a*(3-2*a),ty=b*b*(3-2*b);
  const hash=(x,y)=>atlasHash(wrap(x),wrap(y));
  return (hash(i,j)*(1-tx)+hash(i+1,j)*tx)*(1-ty)+(hash(i,j+1)*(1-tx)+hash(i+1,j+1)*tx)*ty;
}
export function surfacePixels(role,size=128){
  const h=new Float32Array(size*size),wear=new Float32Array(h.length),tau=2*Math.PI;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=x/size,v=y/size,cloud=atlasNoise(u,v,6),fine=atlasNoise(u,v,32),grain=atlasHash(x,y);
    const wave=(q)=>Math.cos(q*tau),line=(q,p)=>Math.pow(.5+.5*wave(q),p);
    let z=.32*cloud+.17*fine+.035*grain,w=.09*(1-cloud);
    if(role==='pitted'||role==='enamel'||role==='skin'||role==='scales'||role==='chitin'||role==='leather'){
      const freq=role==='scales'?11:role==='skin'?22:17,px=u*freq,py=v*freq,ix=Math.floor(px),iy=Math.floor(py);
      let near=10,next=10;
      for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
        const cx=((ix+i)%freq+freq)%freq,cy=((iy+j)%freq+freq)%freq;
        const dx=ix+i+.18+.64*atlasHash(cx,cy)-px,dy=iy+j+.18+.64*atlasHash(cy+112,cx)-py,dist=Math.hypot(dx,dy);
        if(dist<near){next=near;near=dist;}else next=Math.min(next,dist);
      }
      const pit=Math.max(0,1-near/.30)**2,seam=Math.exp(-13*(next-near));
      if(role==='pitted'||role==='enamel'){const cut=line(u*2+v*21+.24*cloud,85)*Math.max(0,(.66-fine)*2);z-=pit*(role==='pitted'?.94:.4)+.23*cut;w+=pit*.62+cut*.2;}
      else {z-=role==='skin'?.48*pit:seam*.41;w+=seam*.09;}
    }else if(role==='fur'){z+=.38*line(u*39+.61*wave(v*2)+.9*fine,3)+.19*line(u*57-.41*wave(v),3);w+=.08*fine;}
    else if(role==='feather'){const shaft=Math.abs(u-.5),barb=line(v*30-shaft*17+.38*wave(u),4);z+=.43*barb+.65*Math.exp(-shaft*85);w+=.12*(1-barb);}
    else if(role==='canvas'){z+=.27*wave(u*26)*wave(v*26)+.10*line(u*26,.75);}
    else if(role==='leaf'){const d=Math.abs(u-.5);z+=.42*Math.exp(-d*100)+.25*line(v*7-d*4,18);}
    else if(role==='stone'){z+=.43*line(v*6+.7*cloud,4)+.13*grain;w+=.21*cloud;}
    else if(role==='alloy'){z+=.12*line(v*39+.1*cloud,5);w+=.1*line(v*27+u*2,75);}
    else z+=.08*fine;
    h[y*size+x]=z;wear[y*size+x]=w;
  }
  const color=new Uint8Array(h.length*4),normal=new Uint8Array(color.length),orm=new Uint8Array(color.length);
  const at=(x,y)=>h[((y+size)%size)*size+(x+size)%size],clamp=n=>Math.min(255,Math.max(0,Math.round(n)));
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const k=y*size+x,i=k*4,w=wear[k],dx=(at(x-1,y)-at(x+1,y))*1.8,dy=(at(x,y-1)-at(x,y+1))*1.8,len=Math.hypot(dx,dy,1);
    const dust=clamp(247-w*65+h[k]*5);color.set([dust,clamp(dust-w*12),clamp(dust-w*24),255],i);
    normal.set([clamp(127.5*(1+dx/len)),clamp(127.5*(1+dy/len)),clamp(127.5*(1+1/len)),255],i);
    orm.set([clamp(255-w*65),clamp(177+54*w+24*(1-h[k])),clamp(250-w*(role==='pitted'?160:28)),255],i);
  }
  return {size,color,normal,orm};
}
