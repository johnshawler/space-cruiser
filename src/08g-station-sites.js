/* Two or three named facilities per port. The same architectural definitions
   also build the Blender scenes and the downloadable Three.js gallery. */
const PortSites=(()=>{
 const places={
   Verdanthia:['meridian','windharp'],Scorchmaw:['saffron','anchor'],
   Dunemoor:['emberstep','triune','redkite'],Sloshwell:['brineglass','tidecomb','blackwell'],
   Amethyne:['lumenvault','cairnrelay'],Toxibloom:['mossward','faraday'],
   Candara:['lanternshoal','heliograph'],Jovexa:['kestrel','palisade'],
   Brrrindle:['rookfall','frostline'],
   // The four far research stations each keep an annex of a planetside facility, built to the same plans.
   'Listening Post Hush':['meridian'],'Cryo Vault Rimeholm':['lumenvault'],
   'Calibration Spire':['heliograph'],'Beacon Far Wink':['kestrel']
 };
 const annex={'Listening Post Hush':'Hush','Cryo Vault Rimeholm':'Rimeholm','Calibration Spire':'Spire','Beacon Far Wink':'Far Wink'};
 // Shown to players: "Research facility", so it isn't confused with the research stations they fly to.
 const kind=t=>t==='Research station'?'Research facility':t;
 let entries=[],selected=null;
 function populate(P,venues,hAt,cloud,liquid){
   const ids=places[P.name]||[];selected=null;entries=ids.map((id,i)=>{
     const venue=venues[i%venues.length],group=new THREE.Group();group.name=id;
     group.position.set(-47,0,38);venue.root.add(group);let baseY=0;
     if(!cloud&&hAt){const world=group.getWorldPosition(new THREE.Vector3());if(Number.isFinite(world.y)){
       const peak=Math.max(...[-1,0,1].flatMap(x=>[-1,0,1].map(z=>hAt(world.x+x*12,world.z+z*12))));
       baseY=Math.max(peak+1,liquid==null?-Infinity:liquid+1)-venue.root.position.y;}}
     group.position.y=baseY+1.1;
     const m=StationModels.buildStation(id);m.scale.setScalar(4.2);group.add(m);
     const footing=new THREE.Mesh(new THREE.CylinderGeometry(13,cloud?7:14,cloud?2:8,12),new THREE.MeshStandardMaterial({color:0x5b6667,roughness:.85}));
     footing.position.y=cloud?-1.9:-4.9;group.add(footing);
     const info=StationModels.stations.find(s=>s.id===id);
     return {id,group,venue,info,name:info.name,annex:annex[P.name]};
   });
 }
 function panel(body){if(!entries.length)return;if(!selected)selected=entries[0];
  const title=document.createElement('h3');title.textContent=UI.P.port+' landmarks';body.append(title);
  for(const e of entries){const b=document.createElement('button');b.className='btn';b.textContent=e.name;b.setAttribute('aria-pressed',String(selected===e));b.onclick=()=>{selected=e;UI.render();};body.append(b);}
  const note=document.createElement('p');note.className='note';note.textContent=(selected.annex?'The '+selected.annex+' annex, built to the same plans as the planetside original. ':'')+kind(selected.info.type)+' · '+selected.info.habit;body.append(note);}
 function camera(aspect){const g=selected.group;const look=g.localToWorld(new THREE.Vector3(0,3.7,0)),offset=new THREE.Vector3(13,10,19).multiplyScalar(Math.max(1,1/aspect));const pos=g.localToWorld(offset.add(new THREE.Vector3(0,3.7,0)));return {look,pos,fov:50};}
 return {populate,panel,camera,kind,pick(e){selected=e;},has:P=>!!(places[P.name]||[]).length,get selected(){return selected;},get entries(){return entries;}};
})();
