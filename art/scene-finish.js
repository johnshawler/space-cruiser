/* Three r128. Install after the room, light fixtures and probe background exist.
   Supply the active camera, the objects that receive screen reflections, and
   the physical positions of any visible light shafts. The owning scene manages
   its baked diffuse lighting, animated actors and shadow-casting key lights. */
const BespokeFinish=(()=>{
  const vertex='varying vec2 uvScreen;void main(){uvScreen=uv;gl_Position=vec4(position.xy,0.,1.);}';
  const fragment=`
    varying vec2 uvScreen;
    uniform sampler2D tDiffuse,depthMap,grade;
    uniform mat4 inverseVP,previousVP;
    uniform vec3 eye,rayOrigin,rayDirection,rayColor;
    uniform vec2 pixel;
    uniform float nearClip,farClip,focus,iris,clock,opticalDepth,beamLength,beamRadius,history;
    vec3 aces(vec3 v){return clamp((v*(2.51*v+.03))/(v*(2.43*v+.59)+.14),0.,1.);}
    vec3 displayRGB(vec3 x){return mix(12.92*x,1.055*pow(max(x,vec3(0.)),vec3(1./2.4))-.055,step(vec3(.0031308),x));}
    vec3 lookup(vec3 c){vec3 a=clamp(c,0.,1.)*15.;float b=floor(a.b);
      vec2 uv=(vec2(b*16.+a.r,a.g)+.5)/vec2(256.,16.);
      vec2 hi=(vec2(min(15.,b+1.)*16.+a.r,a.g)+.5)/vec2(256.,16.);
      return mix(texture2D(grade,uv).rgb,texture2D(grade,hi).rgb,fract(a.b));}
    void main(){
      vec2 uv=uvScreen;float z=texture2D(depthMap,uv).r;
      vec4 world=inverseVP*vec4(uv*2.-1.,z*2.-1.,1.);world/=world.w;
      vec4 last=previousVP*world;vec2 velocity=(uv-(last.xy/max(last.w,.0001)*.5+.5))*history;
      velocity*=min(1.,.016/max(length(velocity),.00001));
      float distanceZ=nearClip*farClip/max(.0001,farClip-z*(farClip-nearClip));
      float coc=clamp(abs(distanceZ-focus)/max(distanceZ,.001)*iris,0.,3.);
      vec3 c=texture2D(tDiffuse,uv).rgb*2.;
      for(int i=0;i<6;i++){float t=(float(i)+.5)/6.;float a=t*6.28318;
        c+=texture2D(tDiffuse,clamp(uv-velocity*t*.46+vec2(cos(a),sin(a))*pixel*coc,.0,1.)).rgb;}
      c/=8.;vec3 ray=world.xyz-eye;float extent=min(length(ray),beamLength*2.5);ray=normalize(ray);
      float fog=0.;for(int i=0;i<12;i++){
        vec3 pos=eye+ray*extent*(float(i)+.5)/12.-rayOrigin;
        float axial=dot(pos,rayDirection);
        float r=beamRadius*(.17+.83*clamp(axial/max(beamLength,.001),0.,1.));
        float radial=length(pos-rayDirection*axial)/max(r,.001);
        fog+=exp(-3.*radial*radial)*step(0.,axial)*step(axial,beamLength)*extent/12.;
      }
      c+=rayColor*(1.-exp(-fog*opticalDepth));c=lookup(displayRGB(aces(c)));
      vec2 p=uv*2.-1.;c*=1.-.065*smoothstep(.35,1.7,dot(p,p));
      float noise=fract(sin(dot(floor(gl_FragCoord.xy)+fract(clock)*77.,vec2(12.9898,78.233)))*43758.5453);
      gl_FragColor=vec4(c+(noise-.5)/210.,1.);
    }`;
  function create(renderer,scene,camera,options={}){
    if(!THREE.SSRPass||!THREE.LightProbeGenerator||!THREE.EffectComposer||!renderer.capabilities.isWebGL2)return null;
    const reflective=options.reflectors||[],pos=options.probePosition||new THREE.Vector3(0,1.3,0);
    const originalEnv=scene.environment,originalFog=scene.fog;
    const cube=new THREE.WebGLCubeRenderTarget(64,{type:THREE.UnsignedByteType,format:THREE.RGBAFormat});
    const cc=new THREE.CubeCamera(.04,120,cube);cc.position.copy(pos);
    const target=renderer.getRenderTarget(),auto=renderer.autoClear;
    renderer.autoClear=true;scene.add(cc);cc.update(renderer,scene);scene.remove(cc);renderer.autoClear=auto;renderer.setRenderTarget(target);
    const probe=THREE.LightProbeGenerator.fromCubeRenderTarget(renderer,cube);probe.intensity=.56;scene.add(probe);
    const pm=new THREE.PMREMGenerator(renderer),env=pm.fromCubemap(cube.texture);pm.dispose();cube.dispose();scene.environment=env.texture;
    if(options.haze)scene.fog=new THREE.FogExp2(options.haze,options.density||.015);
    const composer=new THREE.EffectComposer(renderer);
    const ssr=new THREE.SSRPass({renderer,scene,camera,width:320,height:240,selects:reflective});
    ssr.opacity=.24;ssr.thickness=.035;ssr.maxDistance=options.maxDistance||8;ssr.blur=true;composer.addPass(ssr);
    const bloom=new THREE.UnrealBloomPass(new THREE.Vector2(320,240),.19,.36,1.05);composer.addPass(bloom);
    const pixels=new Uint8Array(256*16*4),tint=options.tint||[.018,.008,-.018];
    for(let y=0;y<16;y++)for(let x=0;x<256;x++){
      const c=[x%16/15,y/15,Math.floor(x/16)/15],lum=c[0]*.2126+c[1]*.7152+c[2]*.0722,o=(y*256+x)*4;
      for(let j=0;j<3;j++)pixels[o+j]=Math.round(255*Math.min(1,Math.max(0,c[j]+lum*(1-lum)*tint[j])));
      pixels[o+3]=255;
    }
    const lut=options.lut||new THREE.DataTexture(pixels,256,16,THREE.RGBAFormat);
    lut.minFilter=lut.magFilter=THREE.LinearFilter;lut.generateMipmaps=false;lut.needsUpdate=true;
    const u={};for(const [key,value] of Object.entries({
      tDiffuse:null,depthMap:ssr.beautyRenderTarget.depthTexture,grade:lut,inverseVP:new THREE.Matrix4(),previousVP:new THREE.Matrix4(),
      eye:new THREE.Vector3(),rayOrigin:options.rayOrigin||new THREE.Vector3(-1,3,-.7),
      rayDirection:(options.rayDirection||new THREE.Vector3(.34,-1,.19)).clone().normalize(),
      rayColor:options.rayColor||new THREE.Color(.70,.64,.52),pixel:new THREE.Vector2(),
      nearClip:camera.near,farClip:camera.far,focus:options.focus||4.5,iris:options.iris??1.4,clock:0,
      opticalDepth:options.opticalDepth??.024,beamLength:options.beamLength||4,beamRadius:options.beamRadius||.7,history:0
    }))u[key]={value};
    const film=new THREE.ShaderPass({uniforms:u,vertexShader:vertex,fragmentShader:fragment});composer.addPass(film);
    const fxaa=new THREE.ShaderPass(THREE.FXAAShader);composer.addPass(fxaa);const f=film.uniforms;f.depthMap.value=ssr.beautyRenderTarget.depthTexture;f.grade.value=lut;
    const current=new THREE.Matrix4(),previous=new THREE.Matrix4();let valid=false;
    return {
      setSize(w,h){composer.setSize(w,h);const d=renderer.getPixelRatio(),px=1/Math.max(1,w*d),py=1/Math.max(1,h*d);
        ssr.setSize(Math.max(2,Math.round(w*d*.65)),Math.max(2,Math.round(h*d*.65)));
        f.pixel.value.set(px,py);fxaa.uniforms.resolution.value.set(px,py);valid=false;},
      render(time){camera.updateMatrixWorld();current.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
        f.previousVP.value.copy(valid?previous:current);f.inverseVP.value.copy(current).invert();camera.getWorldPosition(f.eye.value);
        f.history.value=valid?1:0;f.clock.value=time;f.nearClip.value=camera.near;f.farClip.value=camera.far;
        const tone=renderer.toneMapping,encoding=renderer.outputEncoding;
        try{renderer.toneMapping=THREE.NoToneMapping;renderer.outputEncoding=THREE.LinearEncoding;composer.render();}
        finally{renderer.toneMapping=tone;renderer.outputEncoding=encoding;}
        previous.copy(current);valid=true;},
      dispose(){scene.remove(probe);scene.environment=originalEnv;scene.fog=originalFog;env.dispose();if(!options.lut)lut.dispose();
        ssr.dispose();bloom.dispose();film.material.dispose();fxaa.material.dispose();composer.renderTarget1.dispose();composer.renderTarget2.dispose();}
    };
  }
  return {create};
})();
