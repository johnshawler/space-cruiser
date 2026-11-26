// Export the game's exterior meshes at their original scale for the Blender fit reference.
// Usage: node hulls.cjs /path/to/three-r128.cjs /path/to/output
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const THREE = require(path.resolve(process.argv[2]));
const dir = path.resolve(process.argv[3]);
fs.mkdirSync(dir, {recursive:true});
const C = hex => new THREE.Color(hex).convertSRGBToLinear();
const context = {THREE,C,HDR:(hex,k)=>C(hex).multiplyScalar(k),V3:THREE.Vector3,
  panelBumpTex:()=>null,hullTex:hex=>Object.assign(new THREE.Texture(),{name:hex})};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../../../src/05-ships.js'),'utf8')+';this.models=Models;',context);
for(const [i,key] of ['dromedary','stoat','manatee','empress'].entries()){
  const hull=context.models.build(i+1); hull.updateMatrixWorld(true);
  const parts=[];
  hull.traverse(mesh=>{
    if(!mesh.isMesh||mesh.material.transparent)return;
    const g=mesh.geometry,m=mesh.material,xyz=g.attributes.position,tri=g.index?.array;
    const unique=new Map(),vertices=[],indices=[];
    const point=new THREE.Vector3();
    for(let n=0;n<(tri?.length||xyz.count);n++){
      point.fromBufferAttribute(xyz,tri?tri[n]:n).applyMatrix4(mesh.matrixWorld);
      const v=point.toArray().map(k=>Math.round(k*10000)/10000),k=v.join(',');
      if(!unique.has(k)){unique.set(k,vertices.length);vertices.push(v);}
      indices.push(unique.get(k));
    }
    const color=m.map?.name?.startsWith('#')?C(m.map.name):m.color.clone();
    parts.push({name:g.type,vertices,indices,color:color.toArray().map(x=>Math.min(x,1)),metal:m.metalness||0,rough:m.roughness??.5});
  });
  fs.writeFileSync(path.join(dir,key+'.json.gz'),zlib.gzipSync(JSON.stringify(parts),{level:9}));
}
