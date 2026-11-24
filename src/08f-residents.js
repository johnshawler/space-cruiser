/* The full-resolution masters are in assets/characters. Port residents use one
   merged vertex-coloured mesh each, built on approach and shared by family. */
const ResidentDistrict=(()=>{
  const {cast,residents,buildCharacter}=ResidentModels,designs=new Map(cast.map(c=>[c.id,c]));
  let entries=[],selected=null,world=null;
  // A few residents are posted to the far research stations. Their homeworld stays the same (saves and the
  // roster key on it), but they're met at their posting instead of at home.
  const postings={
    'Listening Post Hush':['relay-01','hush-01','lyre-01','nacre-01','tacca-01'],
    'Cryo Vault Rimeholm':['marlo-01','sova-01','iris-01','plume-01','fathom-01'],
    'Calibration Spire':['parallax-01','orlo-01','cairn-01','tempo-01','mica-01'],
    'Beacon Far Wink':['wick-01','glint-01','caelo-01','pinion-01','spool-01']};
  const posted=new Set(Object.values(postings).flat());
  const here=name=>postings[name]?residents.filter(r=>postings[name].includes(r.id)):residents.filter(r=>r.home===name&&!posted.has(r.id));
  const templates=new Map(),sceneMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.65,metalness:.17});
  function compile(id){
    if(templates.has(id))return templates.get(id);
    const root=buildCharacter(id),pos=[],norm=[],cols=[],weights=[],indices=[],v=new THREE.Vector3(),nm=new THREE.Matrix3();root.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(root),extent=box.getSize(new THREE.Vector3()),fit=Math.min(1.95/extent.y,1.7/extent.x,1.6/extent.z);
    root.traverse(o=>{
      if(!o.isMesh)return;const g=o.geometry,a=g.attributes.position,n=g.attributes.normal,vc=g.attributes.color,first=pos.length/3;
      const base=o.material.color.clone(),hsl={};base.getHSL(hsl);const weight=hsl.s<.14?.035:o.material.metalness>.23?.175:.115;
      nm.getNormalMatrix(o.matrixWorld);
      for(let i=0;i<a.count;i++){
        v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld).multiplyScalar(fit);pos.push(v.x,v.y,v.z);
        v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();norm.push(v.x,v.y,v.z);
        cols.push(base.r*(vc?vc.getX(i):1),base.g*(vc?vc.getY(i):1),base.b*(vc?vc.getZ(i):1));weights.push(weight);
      }
      if(g.index){for(let i=0;i<g.index.count;i++)indices.push(first+g.index.getX(i));}
      else for(let i=0;i<a.count;i++)indices.push(first+i);
    });
    const compact=new THREE.BufferGeometry();compact.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));compact.setAttribute('normal',new THREE.Float32BufferAttribute(norm,3));compact.setIndex(indices);compact.computeBoundingSphere();
    const t={geometry:compact,colors:new Float32Array(cols),weights:new Float32Array(weights),height:extent.y*fit};
    templates.set(id,t);return t;
  }
  /* each resident is an animated individual of their cast design (src/species/<base>.js), seeded by their id, tinted with
     their own accent colour and scaled to their proportions */
  const seedOf=id=>{ let h=2166136261; for(let i=0;i<id.length;i++){ h^=id.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  function materialize(e){
    if(e.mesh)return;const p=e.person;
    if(!SPECIES_EXTRA[p.base]){ // a design without an animated version keeps its sculpture
      const t=compile(p.base),g=new THREE.BufferGeometry(),source=t.geometry;
      g.setAttribute('position',source.attributes.position);g.setAttribute('normal',source.attributes.normal);g.setIndex(source.index);g.boundingSphere=source.boundingSphere;
      const values=t.colors.slice(),col=new THREE.Color(),tint=new THREE.Color(p.accent);
      for(let i=0;i<t.weights.length;i++){const j=i*3;col.fromArray(values,j).lerp(tint,t.weights[i]).convertSRGBToLinear();col.toArray(values,j);}
      g.setAttribute('color',new THREE.BufferAttribute(values,3));const m=new THREE.Mesh(g,sceneMaterial);
      m.scale.set(p.width,p.height,1/p.width);m.name=p.name;m.userData.residentId=p.id;e.anchor.add(m);e.mesh=m;e.height=t.height*p.height;return; }
    const F=Folk.make(p.base,seedOf(p.id),1.2);F.scale.set(1.2*p.width,1.2*p.height,1.2/p.width);
    const tint=new THREE.Color(p.accent);F.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name==='accent'&&!o.material.userData.tinted){ o.material=o.material.clone(); o.material.color.lerp(tint,0.65); o.material.userData.tinted=true; } });
    F.name=p.name;F.userData.residentId=p.id;e.anchor.add(F);e.mesh=F;e.height=new THREE.Box3().setFromObject(F).getSize(new THREE.Vector3()).y;
  }
  function populate(P,venues){
    entries=[];selected=null;world=P.name;templates.clear();const locals=here(world);
    for(const [i,person] of locals.entries()){
      const venue=venues[i%venues.length],place=Math.floor(i/venues.length),col=place%5,row=Math.floor(place/5);
      // The public promenade is on the front half of the venue's 30 m terrace.
      const anchor=new THREE.Group();anchor.name=person.name;anchor.position.set((col-2)*2.6+(row%2)*.6,.01,12+row*2.25);
      anchor.rotation.y=(col-2)*-.075+(row%2?.14:-.14);venue.root.add(anchor);entries.push({person,venue,anchor,mesh:null,height:1.6});
    }
  }
  const pos=new THREE.Vector3();
  const selPos=new THREE.Vector3();
  function update(camera){
    // while meeting someone, neighbours standing between them and the camera step out of shot
    const meet=selected&&UI.tab==='residents'?selected:null;let selDist=0;
    if(meet){meet.anchor.getWorldPosition(selPos);selDist=selPos.distanceTo(camera.position);}
    for(const e of entries){if(!e.venue.root.visible)continue;e.anchor.getWorldPosition(pos);let near=pos.distanceToSquared(camera.position)<26*26||e===selected;
      if(near&&!e.mesh)materialize(e);
      if(near&&meet&&e!==meet&&pos.distanceTo(selPos)<6&&pos.distanceTo(camera.position)<selDist+0.6)near=false;
      if(e.mesh)e.mesh.visible=near;}
  }
  function choose(id){const e=entries.find(item=>item.person.id===id);if(!e)return;selected=e;materialize(e);}
  function camera(aspect){
    if(!selected)return null;const e=selected,h=e.height,point=e.anchor.localToWorld(new THREE.Vector3(0,h*.49,0));
    const from=e.anchor.localToWorld(new THREE.Vector3(1.45,1.10+h*.42,3.35));const distance=Math.max(1,1/aspect);from.sub(point).multiplyScalar(distance).add(point);
    return {pos:from,look:point,fov:36};
  }
  function panel(body){
    if(!entries.length){body.textContent='No residents are on this manifest.';return;}
    if(!selected)choose(entries[0].person.id);
    const e=selected,r=e.person,model=designs.get(r.base);
    const title=document.createElement('h3');title.textContent=world+(postings[world]?' staff':' residents');body.append(title);
    const label=document.createElement('label');label.textContent='Meet a resident ';const select=document.createElement('select');select.style.maxWidth='100%';
    for(const person of entries.map(x=>x.person).sort((a,b)=>a.name.localeCompare(b.name))){const o=document.createElement('option');o.value=person.id;o.textContent=person.name;select.append(o);}
    select.value=r.id;select.onchange=()=>{choose(select.value);UI.render();};label.append(select);body.append(label);
    const details=document.createElement('div');details.className='note';const who=document.createElement('strong');who.textContent=r.name;
    const text=document.createElement('p');text.textContent=model.role+' · '+model.name;const location=document.createElement('p');location.textContent=e.venue.def.name+' · '+UI.P.port;
    details.append(who,text,location);body.append(details);
  }
  return {populate,update,panel,choose,camera,has:P=>here(P.name).length>0,get selected(){return selected;},get entries(){return entries;}};
})();
