/* Standalone, opt-in model and portrait inspector. */
(() => {
  if (!new URLSearchParams(location.search).has('gallery')) return;

  const host = document.createElement('dialog');
  host.setAttribute('aria-label', 'Species gallery');
  host.style.cssText = 'position:fixed;inset:0;margin:0;padding:0;border:0;width:100%;height:100%;max-width:none;max-height:none;background:#101b20;color:white;overflow:hidden';
  const shell = document.createElement('div');
  shell.style.height = '100%';
  host.append(shell);
  const root = shell.attachShadow({mode:'open'});
  root.innerHTML = `
    <style>
      * {box-sizing:border-box}
      :host {font:20px/1.45 system-ui,sans-serif;color:#f0f6f4;color-scheme:dark}
      [hidden] {display:none!important}
      .page {height:100%;overflow:auto;background:#101b20}
      header {display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px clamp(16px,3vw,54px);border-bottom:1px solid #44595b;background:#152428}
      h1,h2,p {margin:0}
      h1 {font-size:clamp(28px,3.5vw,52px);line-height:1.1;letter-spacing:-.04em}
      h2 {font-size:30px;letter-spacing:-.025em}
      main {max-width:1840px;margin:auto;padding:16px clamp(16px,3vw,54px) 40px}
      section+section {margin-top:36px}
      .group {display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:8px 0 16px;border-bottom:1px solid #46585b;padding-bottom:8px}
      .count,.key,.seed {font:20px/1.35 ui-monospace,monospace;color:#c3d6d5}
      button {appearance:none;font:600 20px/1.2 system-ui,sans-serif;letter-spacing:normal;text-transform:none;color:#f0f6f4;background:#25383d;border:1px solid #668085;border-radius:7px;padding:10px 16px;min-height:48px;cursor:pointer}
      button:hover {border-color:#bfdfd7;background:#33494d}
      button:focus-visible {outline:4px solid #ffdd85;outline-offset:3px}
      button[aria-pressed=true] {color:#102122;background:#bcebd7;border-color:#bcebd7}
      .grid {display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:16px}
      .card {text-align:left;padding:0;overflow:hidden;border-color:#47626a;background:#17292e}
      .portraits {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));background:#12232c;aspect-ratio:3}
      .portraits canvas {display:block;width:100%;height:auto;border-right:1px solid #2d4851}
      .caption {display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:10px 14px 13px;border-top:3px solid var(--accent)}
      .name {font-size:25px;font-weight:750}
      .viewer {display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,1fr);gap:clamp(18px,3vw,44px);align-items:start;margin-top:10px}
      .stage {width:100%;height:clamp(300px,68vh,780px);background:#162b32;border:1px solid #527078;border-radius:10px;overflow:hidden}
      .stage canvas {display:block;width:100%;height:100%}
      .controls {display:grid;gap:20px}
      fieldset {border:0;margin:0;padding:0}
      legend {font-weight:750;padding:0;margin:0 0 8px}
      .row {display:flex;align-items:center;flex-wrap:wrap;gap:8px}
      .measure {display:grid;grid-template-columns:auto 1fr;gap:3px 16px;margin:0;font-variant-numeric:tabular-nums}
      dt {color:#c3d6d5} dd {margin:0}
      @media(max-width:760px){.viewer{grid-template-columns:1fr}.stage{height:clamp(265px,44vh,420px)}header{align-items:start}.caption{gap:4px}}
      @media(max-width:420px){header{flex-wrap:wrap}.row button{flex:1 0 auto}main{padding:12px}.caption{padding:8px}}
    </style>
    <div class="page">
      <header><h1>Species gallery</h1><div class="row"><button id="back" hidden>All species</button><button id="close">Close gallery</button></div></header>
      <main><div id="catalog"><nav class="row" id="collections" aria-label="Species collections"></nav><div id="groups"></div></div>
        <div id="viewer" class="viewer" hidden>
          <div class="stage" aria-label="Rotating full-scale model and one-metre marker"></div>
          <div class="controls">
            <div><h2 id="name"></h2><p class="seed" id="seed"></p><p id="trait"></p></div>
            <fieldset><legend>Expression</legend><div class="row" id="moods"></div></fieldset>
            <fieldset><legend>Pose</legend><div class="row" id="poses"></div></fieldset>
            <div class="row"><button id="next">Next seed</button><button id="spin" aria-pressed="true">Rotate</button><button id="outline" aria-pressed="false">Silhouette</button></div>
            <fieldset><legend>Standing measurements</legend><dl class="measure"></dl></fieldset>
          </div>
        </div>
      </main>
    </div>`;
  document.body.append(host);
  host.showModal();
  const get = sel => root.querySelector(sel);
  const page = get('.page'), catalog = get('#catalog'), stage = get('.stage');
  const seeds = [26, 9, 25];
  let seedIndex = 0, key, figure, prop, renderer, scene, camera, ruler;
  let selectedCard, scrollTop = 0, frame, lastTime, elapsed, angle;
  let expression, walking, waving, seated, holding, rotating, silhouette;
  const normalMaterials = new Map();
  const paper = new THREE.MeshBasicMaterial({color:0xeaf2df, side:THREE.DoubleSide, toneMapped:false});
  let queue = [], portraitFrame;
  const bodyGeometries = new Set(), bodyMaterials = new Set();

  function button(parent, label, action) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.onclick = action;
    parent.append(b);
    return b;
  }
  function addSection(title, keys) {
    const section = document.createElement('section');
    const heading = document.createElement('div');
    heading.className = 'group';
    const label = document.createElement('h2');
    label.textContent = title;
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = keys.length + ' species';
    heading.append(label, count);
    const grid = document.createElement('div');
    grid.className = 'grid';
    section.append(heading, grid);
    get('#groups').append(section);
    for (const k of keys) {
      const card = button(grid, '', () => openFigure(k, card));
      card.className = 'card';
      card.style.setProperty('--accent', SPECIES[k].col);
      card.setAttribute('aria-label', 'Inspect ' + SPECIES[k].name);
      const strip = document.createElement('span');
      strip.className = 'portraits';
      strip.setAttribute('aria-hidden','true');
      const caption = document.createElement('span');
      caption.className = 'caption';
      const name = document.createElement('span'), code = document.createElement('span');
      name.className = 'name'; code.className = 'key';
      name.textContent = SPECIES[k].name; code.textContent = k;
      caption.append(name, code);
      card.append(strip, caption);
      for (const seed of seeds) queue.push({strip, k, seed});
    }
  }
  function paintPortraits() {
    if (key || !queue.length) return;
    const start = performance.now();
    do {
      const {strip, k, seed} = queue.shift();
      strip.append(portraitCanvas(k, seed, 160));
    } while (queue.length && performance.now() - start < 12);
    if (queue.length) portraitFrame = requestAnimationFrame(paintPortraits);
  }

  function setupScene() {
    if (renderer) return;
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    stage.append(renderer.domElement);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x162b32);
    scene.add(new THREE.HemisphereLight(0xecf9ff,0x78765d,.9));
    for (const [color, strength, x, y, z] of [[0xffefd5,1.45,2,4,3],[0xb0e9ff,.8,-2,1,2],[0x9affdf,.9,0,2,-3]]) {
      const light = new THREE.DirectionalLight(color,strength);
      light.position.set(x,y,z);
      scene.add(light);
    }
    scene.add(new THREE.GridHelper(8,32,0x739997,0x38575a));
    const points = [-.78,0,0,-.78,1,0];
    for (let i=0; i<=10; i++) points.push(-.78,i/10,0, i%5 ? -.735 : -.68,i/10,0);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points,3));
    scene.add(new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0xffda83})));
    const cv = document.createElement('canvas');
    cv.width=180; cv.height=80;
    const ctx=cv.getContext('2d');
    ctx.font='bold 52px system-ui'; ctx.fillStyle='#ffda83'; ctx.fillText('1 m',8,60);
    ruler = new THREE.CanvasTexture(cv);
    const marker = new THREE.Sprite(new THREE.SpriteMaterial({map:ruler,depthTest:false}));
    marker.scale.set(.34,.15,1); marker.position.set(-.74,1.11,0); scene.add(marker);
    camera = new THREE.PerspectiveCamera(32,1,.05,30);
    fit();
  }
  function fit() {
    if (!renderer || stage.clientWidth < 1 || stage.clientHeight < 1) return;
    const w=stage.clientWidth, h=stage.clientHeight;
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.position.set(0,1.26,Math.max(4.95,3.55/camera.aspect));
    camera.lookAt(0,1.03,0);
    camera.updateProjectionMatrix();
  }
  const resize = new ResizeObserver(fit);
  resize.observe(stage);

  function discardFigure() {
    if (!figure) return;
    scene.remove(figure);
    for (const g of bodyGeometries) g.dispose();
    for (const m of bodyMaterials) m.dispose();
    bodyGeometries.clear(); bodyMaterials.clear(); normalMaterials.clear();
    figure = null; prop = null;
  }
  function loadFigure() {
    discardFigure();
    const seed = seedIndex < seeds.length ? seeds[seedIndex] : 100 + seedIndex - seeds.length;
    figure = Folk.make(key,seed,1);
    // The house eyes and mouth share materials with the game. Own only the viewer's copies.
    const copies = new Map();
    figure.traverse(o => {
      if (!o.isMesh) return;
      bodyGeometries.add(o.geometry);
      if (!copies.has(o.material)) copies.set(o.material,o.material.clone());
      o.material = copies.get(o.material);
      bodyMaterials.add(o.material);
      normalMaterials.set(o,o.material);
      if (silhouette) o.material=paper;
    });
    scene.add(figure);
    const bounds = new THREE.Box3(), point = new THREE.Vector3();
    figure.updateMatrixWorld(true);
    figure.traverse(o => {
      if (!o.isMesh) return;
      const vertices=o.geometry.attributes.position;
      for (let i=0; i<vertices.count; i++) bounds.expandByPoint(point.fromBufferAttribute(vertices,i).applyMatrix4(o.matrixWorld));
    });
    const size = bounds.getSize(new THREE.Vector3());
    const dl = get('.measure');
    dl.replaceChildren();
    for (const [label,value] of [['Height',size.y],['Width',size.x],['Depth',size.z],['Lowest point',bounds.min.y]]) {
      const dt=document.createElement('dt'), dd=document.createElement('dd');
      dt.textContent=label; dd.textContent=(Math.abs(value)<.0005 ? 0 : value).toFixed(3)+' m';
      dl.append(dt,dd);
    }
    prop = new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.34,16),new THREE.MeshStandardMaterial({color:0xffaf46}));
    prop.rotation.x=Math.PI/2; prop.position.z=.13;
    bodyGeometries.add(prop.geometry); bodyMaterials.add(prop.material);
    Folk.hold(figure,prop);
    prop.visible=holding;
    get('#name').textContent=SPECIES[key].name;
    get('#seed').textContent=key+' · Seed '+seed;
    get('#trait').textContent=SPECIES[key].trait;
    Folk.mood(figure,expression);
    angle=0;
    updateControls();
  }
  function openFigure(k, card) {
    scrollTop=page.scrollTop; selectedCard=card; key=k; seedIndex=0;
    expression='neutral'; walking=waving=seated=holding=silhouette=false; rotating=true;
    cancelAnimationFrame(portraitFrame);
    catalog.hidden=true; get('#viewer').hidden=false; get('#back').hidden=false;
    page.scrollTop=0; get('#back').focus();
    setupScene(); fit(); loadFigure();
    elapsed=0; lastTime=null;
    frame=requestAnimationFrame(draw);
  }
  function draw(time) {
    const dt=lastTime===null ? 0 : Math.min(.08,(time-lastTime)/1000);
    lastTime=time; elapsed+=dt;
    if (rotating) angle+=dt*.42;
    figure.rotation.y=angle;
    Folk.walk(figure,elapsed*5.5,walking ? 1 : 0);
    for (const arm of figure.userData.arms) arm.rotation.z=0;
    if (waving) {
      if (SPECIES[key].cast) Folk.arms(figure,null,[.45+.14*Math.sin(elapsed*5),2.38+.29*Math.sin(elapsed*7)]);
      else Folk.arms(figure,[.3,2.6],[.3,2.6]);
    }
    figure.position.y=seated ? .47 : 0;
    if (seated) for (const leg of figure.userData.legs) {
      leg.rotation.x=-1.45;
      if (leg.userData.foot) leg.userData.foot.rotation.x=0;
    }
    Folk.blink(figure,elapsed);
    renderer.render(scene,camera);
    frame=requestAnimationFrame(draw);
  }
  function updateControls() {
    for (const b of get('#moods').children) b.setAttribute('aria-pressed',b.dataset.mood===expression);
    const poses=[walking,waving,seated,holding];
    [...get('#poses').children].forEach((b,i)=>b.setAttribute('aria-pressed',poses[i]));
    get('#spin').setAttribute('aria-pressed',rotating);
    get('#outline').setAttribute('aria-pressed',silhouette);
  }
  for (const m of ['neutral','happy','sad','shock','worried']) {
    const b=button(get('#moods'),m[0].toUpperCase()+m.slice(1),()=>{expression=m; Folk.mood(figure,m); updateControls();});
    b.dataset.mood=m;
  }
  button(get('#poses'),'Walk',()=>{walking=!walking; seated=false; updateControls();});
  button(get('#poses'),'Wave',()=>{waving=!waving; updateControls();});
  button(get('#poses'),'Sit',()=>{seated=!seated; walking=false; updateControls();});
  button(get('#poses'),'Hold prop',()=>{holding=!holding; prop.visible=holding; updateControls();});
  get('#outline').onclick=()=>{
    silhouette=!silhouette;
    for (const [mesh,material] of normalMaterials) mesh.material=silhouette ? paper : material;
    updateControls();
  };
  get('#next').onclick=()=>{seedIndex++; loadFigure();};
  get('#spin').onclick=()=>{rotating=!rotating; updateControls();};

  function back() {
    cancelAnimationFrame(frame); discardFigure(); key=null;
    get('#viewer').hidden=true; get('#back').hidden=true; catalog.hidden=false;
    page.scrollTop=scrollTop; selectedCard.focus({preventScroll:true});
    portraitFrame=requestAnimationFrame(paintPortraits);
  }
  function close() {
    cancelAnimationFrame(frame); cancelAnimationFrame(portraitFrame); queue=[];
    resize.disconnect(); discardFigure();
    if (renderer) {
      scene.traverse(o=>{if(o.geometry) o.geometry.dispose(); if(o.material) o.material.dispose();});
      ruler.dispose(); renderer.dispose(); renderer.forceContextLoss();
    }
    paper.dispose(); host.close(); host.remove();
  }
  get('#back').onclick=back;
  get('#close').onclick=close;
  host.addEventListener('cancel',e=>{e.preventDefault(); if(key) back(); else close();});
  // The game has window-level flight controls, including Space and the arrow keys.
  for (const type of ['keydown','keyup','keypress']) host.addEventListener(type,e=>e.stopPropagation());
  const cast = SPECIES_EXTRA_KEYS.filter(k=>SPECIES[k].cast);
  const collections = {
    crew: ['Original crew', [['Original crew', SPECIES_KEYS]]],
    pack: ['Species pack', [['Species pack', SPECIES_EXTRA_KEYS.filter(k=>!SPECIES[k].cast)]]],
    cast: ['Animated cast', [['Aliens', cast.filter(k=>SPECIES[k].family==='alien')], ['Robots', cast.filter(k=>SPECIES[k].family==='robot')]]]
  };
  function showCollection(id) {
    cancelAnimationFrame(portraitFrame);
    queue=[];
    get('#groups').replaceChildren();
    for(const b of get('#collections').children)b.setAttribute('aria-pressed',String(b.dataset.group===id));
    for(const [title,keys] of collections[id][1])addSection(title,keys);
    portraitFrame=requestAnimationFrame(paintPortraits);
  }
  for(const [id,[label]] of Object.entries(collections)){
    const b=button(get('#collections'),label,()=>showCollection(id));
    b.dataset.group=id;
  }
  const initial=new URLSearchParams(location.search).get('gallery');
  showCollection(Object.prototype.hasOwnProperty.call(collections,initial)?initial:'crew');
})();
