// This scope receives the game's existing Three.js r128 global.
const T=THREE, {Group,Box3,Vector3}=T;
class RoundedBoxGeometry extends T.BoxGeometry {
  constructor(w,h,d,segments,radius){
    const n=Math.max(3,2*segments+1);super(w,h,d,n,n,n);
    const p=this.attributes.position,normal=this.attributes.normal;
    const half=new T.Vector3(w/2-radius,h/2-radius,d/2-radius),low=half.clone().negate(),point=new T.Vector3(),inside=new T.Vector3(),delta=new T.Vector3();
    for(let i=0;i<p.count;i++){
      point.fromBufferAttribute(p,i);inside.copy(point).clamp(low,half);delta.copy(point).sub(inside).normalize();
      point.copy(inside).addScaledVector(delta,radius);p.setXYZ(i,point.x,point.y,point.z);normal.setXYZ(i,delta.x,delta.y,delta.z);
    }
  }
}
