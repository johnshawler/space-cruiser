import * as T from 'three';

// Deterministic, tileable variations in pigment and roughness. The same maps
// travel with the GLB so the painted surfaces survive export.
const cache=new Map();
function hash(x,y){
  let n=Math.imul(x+1487,374761393)+Math.imul(y+1129,668265263);
  n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;
}
function field(x,y,period){
  const px=x*period,py=y*period,ix=Math.floor(px),iy=Math.floor(py),u=px-ix,v=py-iy;
  const a=u*u*(3-2*u),b=v*v*(3-2*v);
  const noise=(i,j)=>hash((i+period)%period,(j+period)%period);
  const t=noise(ix,iy)*(1-a)+noise(ix+1,iy)*a,z=noise(ix,iy+1)*(1-a)+noise(ix+1,iy+1)*a;return t*(1-b)+z*b;
}
export function paintedFinish(kind){
  if(cache.has(kind))return cache.get(kind);const size=128,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const a=field(x/size,y/size,5),b=field(x/size,y/size,25),g=hash(x,y);
    const worn=kind==='metal';const dust=.38*a+.40*b+.22*g;
    let n=195+52*dust;if(worn){n-=Math.max(0,.38-a)*74;if(g>.988&&a<.55)n-=35;}
    else{n-=Math.max(0,.28-b)*40;}
    const i=(y*size+x)*4;data[i]=n+4;data[i+1]=n+2;data[i+2]=n;data[i+3]=255;
  }
  const map=new T.DataTexture(data,size,size);map.name=kind==='metal'?'Worn enamel and brass grain':'Hand-painted surface grain';if(T.SRGBColorSpace)map.colorSpace=T.SRGBColorSpace;else map.encoding=T.sRGBEncoding;map.wrapS=map.wrapT=T.RepeatWrapping;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;cache.set(kind,map);return map;
}
