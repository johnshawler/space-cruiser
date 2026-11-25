import * as T from 'three';
import {surfaceProperties,surfaceRole,surfacePixels,groomKind,groomMesh} from './surface-atlas.js';
const surfaceTiles=new Map(), surfaceClones=new WeakMap(), groomGeometry=new Map();
function getTiles(role){
  if(surfaceTiles.has(role))return surfaceTiles.get(role);
  const p=surfacePixels(role);
  function texture(bytes,color){
    const t=new T.DataTexture(bytes,p.size,p.size,T.RGBAFormat);t.name=role+(color?' pigment':' detail');
    if(color){if(T.SRGBColorSpace)t.colorSpace=T.SRGBColorSpace;else t.encoding=T.sRGBEncoding;}
    t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;
    t.generateMipmaps=true;t.needsUpdate=true;return t;
  }
  const tiles={color:texture(p.color,true),normal:texture(p.normal,false),orm:texture(p.orm,false)};
  surfaceTiles.set(role,tiles);return tiles;
}
function roleMaterial(source,role){
  if(!role)return source;
  let map=surfaceClones.get(source);if(!map){map=new Map();surfaceClones.set(source,map);}
  if(map.has(role))return map.get(role);
  const m=source.clone(),[rough,metal,strength,sss]=surfaceProperties[role],tiles=getTiles(role);
  m.map=tiles.color;m.normalMap=tiles.normal;m.normalScale.setScalar(strength);
  m.roughness=rough;m.metalness=metal;m.roughnessMap=m.metalnessMap=tiles.orm;
  m.userData.surfaceRole=role;m.userData.subsurfaceWeight=sss;m.name=source.name+' '+role;
  map.set(role,m);return m;
}
export function applySurfaceFinishes(root,id){
  const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o);});
  for(const o of meshes){
    const role=surfaceRole(id,o.name,o.parent.name,o.material.name||'');if(!role)continue;
    o.material=roleMaterial(o.material,role);
    const coat=groomKind(o.name);if(!coat)continue;
    const key=id+coat;
    if(!groomGeometry.has(key)){
      const {pos,uv,index}=groomMesh(coat,id),g=new T.BufferGeometry();
      g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
      g.setIndex(index);g.computeVertexNormals();g.computeBoundingSphere();groomGeometry.set(key,g);
    }
    const patch=new T.Mesh(groomGeometry.get(key),o.material);patch.name=coat==='fur'?'Guard hairs':'Contour plumage';
    patch.castShadow=patch.receiveShadow=true;o.add(patch);
  }
}
