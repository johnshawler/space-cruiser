import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { layout,stations } from './stations.mjs';
export function buildStation(id){
 const info=stations.find(s=>s.id===id);if(!info)throw new Error(id);const root=new THREE.Group();root.name=info.name;
 const mats=new Map(),geos=new Map(),up=new THREE.Vector3(0,1,0);
 for(const part of layout(id)){
  const {name,kind,color,pos,size,rotation}=part;
  if(!mats.has(color))mats.set(color,new THREE.MeshStandardMaterial({color,metalness:.21,roughness:.55,name:color}));
  const dims=kind==='beam'?new THREE.Vector3(...part.end).sub(new THREE.Vector3(...pos)):null;
  const key=JSON.stringify([kind,kind==='box'?size:null,part.radius,part.top,part.height,dims?.length(),part.minor,part.segments]);
  if(!geos.has(key)){let g;switch(kind){
   case 'box':g=new RoundedBoxGeometry(...size,1,Math.min(.034,...size.map(x=>x*.13)));break;
   case 'sphere':g=new THREE.SphereGeometry(1,24,16);break;
   case 'rock':g=new THREE.IcosahedronGeometry(1,0);break;
   case 'dome':g=new THREE.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2);break;
   case 'torus':g=new THREE.TorusGeometry(part.radius,part.minor,8,40);break;
   default:g=new THREE.CylinderGeometry(part.top,part.radius,dims?dims.length():part.height,part.segments);break;
  }geos.set(key,g);}
  const m=new THREE.Mesh(geos.get(key),mats.get(color));m.name=name;m.position.fromArray(pos);m.rotation.set(...rotation);
  if(kind!=='box')m.scale.fromArray(size);
  if(dims){m.position.addScaledVector(dims,.5);m.quaternion.setFromUnitVectors(up,dims.normalize());}m.castShadow=m.receiveShadow=true;root.add(m);
 }
 root.userData={id,type:info.type,reference:info.inspiration};return root;
}
