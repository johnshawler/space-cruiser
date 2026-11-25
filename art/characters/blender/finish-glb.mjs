import fs from 'node:fs';
import path from 'node:path';
import {deflateSync} from 'node:zlib';
import {surfaceProperties,surfaceRole,surfacePixels,groomKind,groomMesh} from '../src/surface-atlas.js';

const [source,destination]=process.argv.slice(2);
const id=path.basename(source,'.glb'), original=fs.readFileSync(source);
const length=original.readUInt32LE(12),g=JSON.parse(original.subarray(20,20+length));
if(g.asset.extras?.finishVersion===1)throw Error('Use the unprocessed master for '+id);
const buffer=original.subarray(28+length,28+length+g.buffers[0].byteLength), chunks=[buffer];
let cursor=buffer.length;
function append(bytes,target){
  const pad=(4-cursor%4)%4;chunks.push(Buffer.alloc(pad),bytes);cursor+=pad;
  const view={buffer:0,byteOffset:cursor,byteLength:bytes.length};if(target)view.target=target;
  cursor+=bytes.length;return g.bufferViews.push(view)-1;
}
function png(pixels,size){
  function block(type,payload){
    const tag=Buffer.from(type),data=Buffer.concat([tag,payload]);let crc=0xffffffff;
    for(const byte of data){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
    const out=Buffer.alloc(payload.length+12);out.writeUInt32BE(payload.length);data.copy(out,4);out.writeUInt32BE((crc^0xffffffff)>>>0,out.length-4);return out;
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  const raw=Buffer.alloc(size*(1+4*size));
  for(let y=0;y<size;y++)Buffer.from(pixels.buffer,pixels.byteOffset+y*4*size,4*size).copy(raw,y*(1+4*size)+1);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),block('IHDR',header),block('IDAT',deflateSync(raw)),block('IEND',Buffer.alloc(0))]);
}
const texCache=new Map(),matCache=new Map(),meshCache=new Map(),grooms=new Map();
g.textures??=[];g.images??=[];g.samplers??=[];const sampler=g.samplers.push({magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497})-1;
function tiles(role){
  if(texCache.has(role))return texCache.get(role);
  const p=surfacePixels(role),out={};
  for(const key of ['color','normal','orm']){
    const img=g.images.push({name:role+' '+key,mimeType:'image/png',bufferView:append(png(p[key],p.size))})-1;
    out[key]={index:g.textures.push({sampler,source:img})-1};
  }
  texCache.set(role,out);return out;
}
function material(index,role){
  if(!role)return index;const key=index+':'+role;if(matCache.has(key))return matCache.get(key);
  const m=structuredClone(g.materials[index]),p=m.pbrMetallicRoughness??={},[rough,metal,strength,sss]=surfaceProperties[role],t=tiles(role);
  p.baseColorTexture=t.color;p.roughnessFactor=rough;p.metallicFactor=metal;p.metallicRoughnessTexture=t.orm;
  m.normalTexture={...t.normal,scale:strength};m.occlusionTexture={...t.orm,strength:.65};
  m.extras={...m.extras,surfaceRole:role,subsurfaceWeight:sss};m.name+=' '+role;
  const i=g.materials.push(m)-1;matCache.set(key,i);return i;
}
function accessor(values,components,type,componentType,bounds=false){
  const index=componentType===5123,data=index?new Uint16Array(values):new Float32Array(values);
  const a={bufferView:append(Buffer.from(data.buffer),index?34963:34962),componentType,count:data.length/components,type};
  if(bounds){
    a.min=Array(components).fill(Infinity);a.max=Array(components).fill(-Infinity);
    data.forEach((v,i)=>{const j=i%components;a.min[j]=Math.min(a.min[j],v);a.max[j]=Math.max(a.max[j],v);});
  }
  return g.accessors.push(a)-1;
}
function addGroom(node,kind,mat){
  const key=kind+mat;
  if(!grooms.has(key)){
    const {pos,uv,index}=groomMesh(kind,id),normal=Array(pos.length).fill(0);
    for(let i=0;i<index.length;i+=3){
      const [a,b,c]=index.slice(i,i+3).map(q=>q*3),u=pos.slice(b,b+3).map((v,j)=>v-pos[a+j]),v=pos.slice(c,c+3).map((w,j)=>w-pos[a+j]);
      const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
      for(const k of [a,b,c])for(let j=0;j<3;j++)normal[k+j]+=n[j];
    }
    for(let i=0;i<normal.length;i+=3){const l=Math.hypot(...normal.slice(i,i+3))||1;for(let j=0;j<3;j++)normal[i+j]/=l;}
    const primitive={attributes:{POSITION:accessor(pos,3,'VEC3',5126,true),NORMAL:accessor(normal,3,'VEC3',5126),TEXCOORD_0:accessor(uv,2,'VEC2',5126)},indices:accessor(index,1,'SCALAR',5123),material:mat};
    grooms.set(key,g.meshes.push({primitives:[primitive]})-1);
  }
  (node.children??=[]).push(g.nodes.push({name:kind==='fur'?'Guard hairs':'Contour plumage',mesh:grooms.get(key)})-1);
}
const parents=new Map();g.nodes.forEach((n,i)=>n.children?.forEach(k=>parents.set(k,i)));
for(const [i,node] of [...g.nodes].entries()){
  if(node.mesh===undefined)continue;const originalMesh=node.mesh,primitives=g.meshes[node.mesh].primitives;
  const mats=primitives.map(p=>material(p.material,surfaceRole(id,node.name||'',g.nodes[parents.get(i)]?.name||'',g.materials[p.material].name||'')));
  const key=originalMesh+':'+mats.join(',');
  if(!meshCache.has(key))meshCache.set(key,g.meshes.push({...g.meshes[node.mesh],primitives:primitives.map((p,j)=>({...p,material:mats[j]}))})-1);
  node.mesh=meshCache.get(key);const groom=groomKind(node.name);if(groom)addGroom(node,groom,mats[0]);
}
const used=[...new Set(g.nodes.filter(n=>n.mesh!==undefined).map(n=>n.mesh))], remap=new Map(used.map((k,i)=>[k,i]));
g.meshes=used.map(k=>g.meshes[k]);for(const n of g.nodes){if(n.mesh!==undefined)n.mesh=remap.get(n.mesh);if(n.extras)delete n.extras.inspiration;}
g.asset.extras={...g.asset.extras,finishVersion:1};g.buffers[0].byteLength=cursor;
const data=Buffer.concat(chunks),json=Buffer.from(JSON.stringify(g)),jp=(4-json.length%4)%4,bp=(4-data.length%4)%4;
const out=Buffer.alloc(28+json.length+jp+data.length+bp);out.write('glTF');out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
out.writeUInt32LE(json.length+jp,12);out.write('JSON',16);json.copy(out,20);out.fill(32,20+json.length,20+json.length+jp);
const b=20+json.length+jp;out.writeUInt32LE(data.length+bp,b);out.write('BIN\0',b+4);data.copy(out,b+8);
fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,out);
console.log(id,out.length+' bytes',Array.from(texCache.keys()).join(', '));
