import {Color} from 'three';
import {createStudio} from './studio.js';
import {exportModel} from './export-model.js';

export function startGallery({items,make,groups,elevation=.15,people=[],dress,blenderPath}){
 const $=id=>document.getElementById(id),canvas=$('canvas'),stage=$('stage'),images=JSON.parse($('pictures').textContent);
 let studio=null,current=null,variant=null,instance=null,turn=false,frame=0,last=0;
 try{studio=createStudio(canvas,make,elevation);}catch{canvas.hidden=true;$('fallback').hidden=false;$('hint').textContent='Model preview · WebGL 2 is unavailable';for(const id of ['in','out','spin','reset'])$(id).disabled=true;}
 const buttons=new Map(),masters=new Map();function template(id){if(!masters.has(id))masters.set(id,make(id));return masters.get(id);}
 function render(){
   const previous=instance;instance=variant?dress(template(current.id).clone(true),variant,Color):template(current.id);
   if(studio){studio.setCharacter(current,instance);studio.draw();}
   if(previous?.userData?.resident){const mats=new Set();previous.traverse(m=>{if(m.isMesh)mats.add(m.material);});for(const m of mats)m.dispose();}
   $('name').textContent=variant?variant.name:current.name;$('role').textContent=variant?current.name+' · '+current.role+' · '+variant.home:current.role;
   $('habit').textContent=variant?current.habit.replace(current.name,variant.name):current.habit;
   if(!studio){$('fallback').src='data:image/webp;base64,'+images[current.id];$('fallback').alt=current.name+' base design';}
   if(blenderPath){const link=$('blend');link.hidden=false;link.href=blenderPath(current.id);link.download=current.id+'.blend';}
 }
 function select(c){
   current=c;variant=null;for(const [id,b] of buttons)b.setAttribute('aria-pressed',String(id===c.id));
   if(people.length){$('variants').hidden=false;const list=people.filter(r=>r.base===c.id),sel=$('variant');sel.replaceChildren(new Option('Base design',''));
     for(const r of list)sel.add(new Option(r.name+' · '+r.home,r.id));}
   render();
 }
 groups.forEach(([type,label],i)=>{
   const id=i?'robots':'aliens',shelf=$(id);shelf.previousElementSibling.textContent=label;
   for(const c of items.filter(x=>x.type===type)){const b=document.createElement('button');b.className='sample';b.type='button';b.setAttribute('aria-label','View '+c.name);
     const im=new Image();im.alt='';im.src='data:image/webp;base64,'+images[c.id];const name=document.createElement('span');name.textContent=c.name;b.append(im,name);b.onclick=()=>select(c);buttons.set(c.id,b);shelf.append(b);}
 });
 $('variant').onchange=e=>{variant=people.find(r=>r.id===e.target.value)||null;render();};
 $('search').oninput=e=>{const q=e.target.value.toLowerCase().trim();for(const c of items){buttons.get(c.id).hidden=!([c.name,c.role,...people.filter(r=>r.base===c.id).map(r=>r.name)].join(' ').toLowerCase().includes(q));}};
 function resize(){if(studio){studio.size(stage.clientWidth,stage.clientHeight,Math.min(devicePixelRatio||1,2));studio.draw();}}
 if(studio)new ResizeObserver(resize).observe(stage);resize();const requested=new URLSearchParams(location.search).get('model'),person=people.find(r=>r.id===requested);select(items.find(c=>c.id===(person?.base||requested))||items[0]);
 if(person){variant=person;$('variant').value=person.id;render();}
 const fingers=new Map();let gap=0;
 const dist=()=>{const [a,b]=[...fingers.values()];return a&&b?Math.hypot(a[0]-b[0],a[1]-b[1]):0;};
 canvas.onpointerdown=e=>{if(!studio)return;canvas.setPointerCapture(e.pointerId);fingers.set(e.pointerId,[e.clientX,e.clientY]);gap=dist();};
 canvas.onpointermove=e=>{const old=fingers.get(e.pointerId);if(!old||!studio)return;fingers.set(e.pointerId,[e.clientX,e.clientY]);if(fingers.size>1){const d=dist();if(d&&gap)studio.magnify(d/gap);gap=d;}else studio.orbit(-(e.clientX-old[0])*.011,(e.clientY-old[1])*.008);studio.draw();};
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,e=>{fingers.delete(e.pointerId);gap=dist();});
 canvas.addEventListener('wheel',e=>{if(!studio)return;e.preventDefault();studio.magnify(Math.exp(-e.deltaY*.0014));studio.draw();},{passive:false});
 canvas.onkeydown=e=>{if(!studio)return;const arrows={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,.12],ArrowDown:[0,-.12]};if(arrows[e.key])studio.orbit(...arrows[e.key]);else if(e.key==='+'||e.key==='=')studio.magnify(1.15);else if(e.key==='-')studio.magnify(1/1.15);else if(e.key==='Home')studio.reset();else return;e.preventDefault();studio.draw();};
 $('in').onclick=()=>{studio.magnify(1.2);studio.draw();};$('out').onclick=()=>{studio.magnify(1/1.2);studio.draw();};
 function tick(t){if(!turn)return;studio.orbit(last?Math.min(.08,(t-last)/1000)*.48:0);last=t;studio.draw();frame=requestAnimationFrame(tick);}
 function spin(on){turn=on;$('spin').setAttribute('aria-pressed',String(on));cancelAnimationFrame(frame);last=0;if(turn)frame=requestAnimationFrame(tick);}
 $('spin').onclick=()=>spin(!turn);$('reset').onclick=()=>{spin(false);studio.reset();studio.draw();};
 $('download').onclick=async()=>{const b=$('download'),model=instance,id=variant?.id||current.id;b.disabled=true;try{const bytes=await exportModel(model),url=URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'})),a=document.createElement('a');a.href=url;a.download=id+'.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}finally{b.disabled=false;}};
}
