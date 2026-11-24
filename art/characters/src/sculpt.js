import * as T from 'three';
import { paintedFinish } from './finish.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const V = p => new T.Vector3(...p);
export const tau = Math.PI * 2;
export const sides = [-1,1];
const materials = new Map();
const unitSphere = new T.SphereGeometry(1,24,16);
const up = new T.Vector3(0,1,0);
const shapes = new Map();

function surface(color) {
  if (materials.has(color)) return materials.get(color);
  const [value, finish='matte'] = color.split('/');
  const metal = finish==='metal', glass=finish==='glass', lit=finish==='lit';
  const m=new T.MeshStandardMaterial({name:color,color:value,roughness:metal?.37:glass?.19:lit?.26:.69,metalness:metal?.40:glass?.15:.035});
  if(!lit && !glass){m.map=paintedFinish(metal?'metal':'matte');}
  if(lit){m.emissive.set(value);m.emissiveIntensity=.35;}
  materials.set(color,m);return m;
}
export const steel='#52606a/metal', brass='#c4964e/metal', dark='#292d39', ink='#211f2d', ivory='#f2dfb5', leather='#895134', black='#28323a', copper='#b86c41/metal', teal='#287e79', jade='#89a653', optic='#8ee1df/lit';
export function group(parent,name,position=[0,0,0]){const g=new T.Group();g.name=name;g.position.fromArray(position);if(parent)parent.add(g);return g;}
function mesh(p,name,geometry,color,pos=[0,0,0],angles=[0,0,0]){const m=new T.Mesh(geometry,surface(color));m.name=name;m.position.fromArray(pos);m.rotation.set(...angles);m.castShadow=m.receiveShadow=true;p.add(m);return m;}
export function oval(p,n,c,pos,scale,rot=[0,0,0]){const m=mesh(p,n,unitSphere,c,pos,rot);m.scale.fromArray(scale);return m;}
export function box(p,n,c,pos,size,bevel=.04,rot=[0,0,0]){
  const k=[...size,bevel].join(':');if(!shapes.has(k))shapes.set(k,new RoundedBoxGeometry(...size,2,Math.min(bevel,...size.map(x=>x*.45))));return mesh(p,n,shapes.get(k),c,pos,rot);
}
export function strut(p,n,c,a,b,base,tip=base,s=18){
  const v=V(b).sub(V(a)),h=v.length(),k=[base,tip,h.toFixed(5),s].join(':');
  if(!shapes.has(k))shapes.set(k,new T.CylinderGeometry(tip,base,h,s));
  const m=mesh(p,n,shapes.get(k),c,V(a).addScaledVector(v,.5).toArray());m.quaternion.setFromUnitVectors(up,v.normalize());return m;
}
export function tube(p,n,c,points,radii,facets=10){
  const spline=new T.CatmullRomCurve3(points.map(V),false,'centripetal');
  const steps=Math.max(8,(points.length-1)*6),geom=new T.TubeGeometry(spline,steps,1,facets,false),pos=geom.attributes.position,norm=geom.attributes.normal;
  const rr=Array.isArray(radii)?radii:points.map(()=>radii);
  for(let j=0;j<=steps;j++){
    const u=j/steps,t=spline.getUtoTmapping(u)*(rr.length-1),i=Math.min(rr.length-2,Math.floor(t)),r=T.MathUtils.lerp(rr[i],rr[i+1],t-i),center=spline.getPointAt(u);
    for(let k=0;k<=facets;k++){const a=j*(facets+1)+k;pos.setXYZ(a,center.x+norm.getX(a)*r,center.y+norm.getY(a)*r,center.z+norm.getZ(a)*r);}
  }
  geom.computeVertexNormals();geom.computeBoundingSphere();return mesh(p,n,geom,c);
}
// Cross-sections are [height, x radius, z radius, x offset, z offset].
export function loft(p,n,c,sections,sides=36){
  const pts=[],idx=[];for(const [y,rx,rz,x=0,z=0] of sections)for(let i=0;i<sides;i++){let a=tau*i/sides;pts.push(x+rx*Math.cos(a),y,z+rz*Math.sin(a));}
  for(let j=0;j<sections.length-1;j++)for(let i=0;i<sides;i++){let a=j*sides+i,b=j*sides+(i+1)%sides;idx.push(a,a+sides,b,b,a+sides,b+sides);}
  for(let i=1;i<sides-1;i++){let o=(sections.length-1)*sides;idx.push(0,i,i+1,o,o+i+1,o+i);}
  const uv=[];for(let j=0;j<sections.length;j++)for(let i=0;i<sides;i++)uv.push(i/sides,j/(sections.length-1));
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return mesh(p,n,g,c);
}
export function plate(p,n,c,points,depth=.05,bev=.02,pos=[0,0,0],rot=[0,0,0]){
  const sh=new T.Shape();points.forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));sh.closePath();
  const geom=new T.ExtrudeGeometry(sh,{depth,bevelEnabled:bev>0,bevelSize:bev,bevelThickness:bev,bevelSegments:2,steps:1});geom.translate(0,0,-depth/2);return mesh(p,n,geom,c,pos,rot);
}
export function ring(p,n,c,pos,r,t,scale=[1,1,1],rot=[0,0,0]){const k='r:'+r+':'+t;if(!shapes.has(k))shapes.set(k,new T.TorusGeometry(r,t,9,40));const m=mesh(p,n,shapes.get(k),c,pos,rot);m.scale.fromArray(scale);return m;}
export function eye(p,pos,sz,iris='#638661',tilt=0){const e=group(p,'Eye',pos);e.rotation.z=tilt;oval(e,'Sclera',ivory,[0,0,0],[sz,sz*.82,sz*.60]);oval(e,'Iris',iris,[0,.005,sz*.47],[sz*.60,sz*.64,sz*.24]);oval(e,'Pupil',ink,[0,.005,sz*.65],[sz*.28,sz*.49,sz*.13]);oval(e,'Eye glint','#fff5d5',[sz*.18,sz*.29,sz*.75],[sz*.14,sz*.14,sz*.08]);return e;}
export function leaf(p,n,c,base,tip,width){
  const b=V(base),t=V(tip),v=t.clone().sub(b),d=v.length();const g=group(p,n,base);g.quaternion.setFromUnitVectors(up,v.normalize());
  const a=[0,0,0,-width,d*.37,0,0,d*.46,width*.19,width,d*.37,0,0,d,0];const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(a,3));geom.setAttribute('uv',new T.Float32BufferAttribute([.5,0,0,.37,.5,.46,1,.37,.5,1],2));geom.setIndex([0,2,1,0,3,2,1,2,4,2,3,4,1,4,3,0,1,3]);geom.computeVertexNormals();mesh(g,'Blade',geom,c);return g;
}
export function bolt(p,pos,r=.035,c=brass){oval(p,'Rivet',c,pos,[r,r,r*.60]);}
export function fingers(p,from,to,c,spread=.08,r=.036){for(let i=-1;i<=1;i++){const a=[from[0]+i*spread,from[1],from[2]],b=[to[0]+i*spread,to[1],to[2]],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2+.04,(a[2]+b[2])/2+.035];tube(p,'Finger',c,[a,mid,b],[r,r*.87,r*.42]);oval(p,'Fingertip',c,b,[r*.45,r*.5,r*.45]);}}
export function mechArm(p,a,b,c,thick=.13,shell=steel){
  strut(p,'Upper link',shell,a,b,thick,thick*.86);oval(p,'Shoulder bearing',dark,a,[thick*1.25,thick*1.25,thick*1.25]);oval(p,'Elbow bearing',brass,b,[thick,thick,thick]);strut(p,'Forearm piston',steel,b,c,thick*.70,thick*.62);const sleeve=V(b).lerp(V(c),.42).toArray();strut(p,'Forearm sleeve',shell,sleeve,c,thick*.9,thick*.77);oval(p,'Wrist bearing',dark,c,[thick*.68,thick*.68,thick*.68]);
}
