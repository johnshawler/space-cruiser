import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildCharacter } from './characters.js';

export function createStudio(canvas, factory=buildCharacter, elevation=.115){
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.93;
  const scene=new THREE.Scene(),stage=new THREE.Group();scene.add(stage);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const environment=pmrem.fromScene(room,.045);
  scene.environment=environment.texture;scene.environmentIntensity=.40;room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff5df,0x7e929a,.85));
  const key=new THREE.DirectionalLight(0xffefde,2.62);key.position.set(-4,6,2.5);key.castShadow=true;
  Object.assign(key.shadow.camera,{left:-2.4,right:2.4,top:3.8,bottom:-1.8,near:.2,far:14});
  key.shadow.mapSize.set(1024,1024);key.shadow.normalBias=.008;key.shadow.bias=-.00025;scene.add(key);
  const rim=new THREE.DirectionalLight(0xe2f0fc,1.50);rim.position.set(2.5,2.8,-3.1);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xffdcbe,.24);fill.position.set(3,1,3);scene.add(fill);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
  const paint=shadowCanvas.getContext('2d'),gradient=paint.createRadialGradient(64,64,3,64,64,64);gradient.addColorStop(0,'rgba(27,40,39,.24)');gradient.addColorStop(.45,'rgba(27,40,39,.16)');gradient.addColorStop(1,'rgba(27,40,39,0)');paint.fillStyle=gradient;paint.fillRect(0,0,128,128);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false,toneMapped:false}));floor.rotation.x=-Math.PI/2;floor.position.y=-.006;scene.add(floor);
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,60);
  let current=null,model=null,angle=0,pitch=.13,zoom=1,aspect=1,frame=3,focus=new THREE.Vector3(),width=1,height=1;
  const models=new Map();
  function fit(){
    camera.position.set(Math.sin(angle)*Math.cos(pitch),Math.sin(pitch),Math.cos(angle)*Math.cos(pitch)).multiplyScalar(9).add(focus);camera.lookAt(focus);
    camera.updateMatrixWorld();const half=frame*.5/zoom;camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();
  }
  function setCharacter(info, instance=null){
    if(model)stage.remove(model);current=info;
    if(!instance&&!models.has(info.id))models.set(info.id,factory(info.id));
    model=instance||models.get(info.id);stage.add(model);stage.updateMatrixWorld(true);reset();
  }
  function reset(){
    if(!model)return;angle=THREE.MathUtils.degToRad(current.angle);pitch=elevation;zoom=1;
    const bounds=new THREE.Box3().setFromObject(model,true),size=bounds.getSize(new THREE.Vector3());floor.scale.set(size.x*1.35,size.z*1.32,1);bounds.getCenter(focus);focus.y=Math.max(focus.y-.01,.01);
    frame=Math.max(size.y+.12,Math.hypot(size.x,size.z)*.90/aspect)*1.13;fit();
  }
  function size(w,h,ratio=1){width=w;height=h;aspect=w/h;renderer.setPixelRatio(ratio);renderer.setSize(w,h,false);reset();}
  function orbit(dx,dy=0){angle+=dx;pitch=THREE.MathUtils.clamp(pitch+dy,-1.10,1.30);fit();}
  function magnify(factor){zoom=THREE.MathUtils.clamp(zoom*factor,.56,2.8);fit();}
  function draw(){renderer.render(scene,camera);}
  return {setCharacter,reset,size,orbit,magnify,draw,get model(){return model;},get info(){return current;},get renderer(){return renderer;}};
}
