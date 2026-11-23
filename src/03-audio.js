/* ===================== AUDIO ===================== */
const Sfx = (() => {
  let ctx=null, master, radioIn, radioGain, staticGain, sfx, musicGain, noiseBuf;
  let eng={}, rumbleGain, warpGain, warpOsc=[], musicTimer=0, chordIdx=0, djTimer=0, djStep=0, djOn=false;
  const ok = () => !!ctx;
  function noiseSrc(){ const s=ctx.createBufferSource(); s.buffer=noiseBuf; s.loop=true; s.start(); return s; }
  function biq(type,f,q){ const b=ctx.createBiquadFilter(); b.type=type; b.frequency.value=f; b.Q.value=q||0.7; return b; }
  function gain(v){ const g=ctx.createGain(); g.gain.value=v; return g; }
  function init(){
    if(ctx){ if(ctx.state==='suspended') ctx.resume(); return; }
    try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ ctx=null; return; }
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const comp=ctx.createDynamicsCompressor(); comp.threshold.value=-14; comp.ratio.value=4; comp.connect(ctx.destination);
    master=gain(0.85); master.connect(comp); sfx=gain(0.7); sfx.connect(master);
    // engine
    eng.lp=biq('lowpass',180,1.2); eng.g=gain(0); eng.lp.connect(eng.g); eng.g.connect(master);
    eng.o1=ctx.createOscillator(); eng.o1.type='sawtooth'; eng.o1.frequency.value=42; eng.o2=ctx.createOscillator(); eng.o2.type='sawtooth'; eng.o2.frequency.value=63.4;
    eng.o1.connect(eng.lp); eng.o2.connect(eng.lp); eng.o1.start(); eng.o2.start();
    const nb=biq('lowpass',120,0.5); rumbleGain=gain(0.05); noiseSrc().connect(nb); nb.connect(rumbleGain); rumbleGain.connect(master);
    // warp bed
    warpGain=gain(0); const wf=biq('bandpass',900,0.6); noiseSrc().connect(wf); wf.connect(warpGain);
    for(const f of [110,164.8,220.6,329]){ const o=ctx.createOscillator(); o.type='sine'; o.frequency.value=f; const g=gain(0.12); o.connect(g); g.connect(warpGain); o.start(); warpOsc.push(o); }
    warpGain.connect(master);
    // radio chain
    radioIn=gain(1); const hp=biq('highpass',420,0.7), lp=biq('lowpass',3000,0.8); const ws=ctx.createWaveShaper(); const curve=new Float32Array(256); for(let i=0;i<256;i++){ const x=i/128-1; curve[i]=Math.tanh(x*3); } ws.curve=curve;
    radioGain=gain(0.6); radioIn.connect(hp); hp.connect(ws); ws.connect(lp); lp.connect(radioGain); radioGain.connect(master);
    staticGain=gain(0.012); const sf=biq('bandpass',2200,0.5); noiseSrc().connect(sf); sf.connect(staticGain); staticGain.connect(radioGain);
    // music
    musicGain=gain(0.3); const dl=ctx.createDelay(1.5); dl.delayTime.value=0.62; const fb=gain(0.45); musicGain.connect(master); musicGain.connect(dl); dl.connect(fb); fb.connect(dl); const wet=gain(0.5); dl.connect(wet); wet.connect(master);
  }
  function tone(dest, type, f0, f1, t, dur, vol, attack){
    const o=ctx.createOscillator(), g=ctx.createGain(); o.type=type; o.frequency.setValueAtTime(f0,t); if(f1!==f0) o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+(attack||0.01)); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t+dur+0.05); return o;
  }
  function burst(dest, t, dur, vol, type, f, q){ const s=ctx.createBufferSource(); s.buffer=noiseBuf; s.loop=true; const b=biq(type||'bandpass',f||2000,q||1), g=ctx.createGain();
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); s.connect(b); b.connect(g); g.connect(dest); s.start(t, Math.random()); s.stop(t+dur+0.05); return {b,g}; }
  const api = {
    init, ok,
    click(){ if(!ctx) return; const t=ctx.currentTime; burst(sfx,t,0.03,0.5,'highpass',2500); tone(sfx,'square',1400,700,t,0.03,0.08); },
    clunk(){ if(!ctx) return; const t=ctx.currentTime; burst(sfx,t,0.06,0.6,'bandpass',900,2); tone(sfx,'sine',160,70,t,0.09,0.4); },
    beep(f=880){ if(!ctx) return; const t=ctx.currentTime; tone(sfx,'sine',f,f,t,0.12,0.18); },
    deny(){ if(!ctx) return; const t=ctx.currentTime; tone(sfx,'square',180,170,t,0.16,0.12); tone(sfx,'square',140,130,t+0.17,0.2,0.12); },
    cash(){ if(!ctx) return; const t=ctx.currentTime; [988,1319,1568,2093].forEach((f,i)=>tone(sfx,'triangle',f,f,t+i*0.07,0.5,0.14)); },
    honk(){ if(!ctx) return; const t=ctx.currentTime; for(const f of [233,294,349]){ tone(sfx,'sawtooth',f,f*0.98,t,0.55,0.16,0.03); } tone(sfx,'square',116,114,t,0.55,0.12,0.03); },
    boing(){ if(!ctx) return; const t=ctx.currentTime; tone(sfx,'sine',180,720,t,0.22,0.22); tone(sfx,'sine',720,260,t+0.18,0.4,0.16); },
    crash(v=1){ if(!ctx) return; const t=ctx.currentTime; burst(sfx,t,0.5,0.45*v,'highpass',2200); burst(sfx,t,0.25,0.5*v,'bandpass',700,1.5); tone(sfx,'sine',120,40,t,0.3,0.4*v); },
    tada(){ if(!ctx) return; const t=ctx.currentTime; [523,659,784,1047].forEach((f,i)=>tone(sfx,'triangle',f,f,t+i*0.09,i===3?0.6:0.2,0.12)); },
    wah(){ if(!ctx) return; const t=ctx.currentTime; [392,370,349,294].forEach((f,i)=>tone(sfx,'sawtooth',f,f*0.97,t+i*0.32,i===3?0.8:0.3,0.07,0.02)); },
    thump(v=1){ if(!ctx) return; const t=ctx.currentTime; tone(sfx,'sine',90,28,t,0.7,0.9*v,0.005); burst(sfx,t,0.4,0.5*v,'lowpass',300); },
    warpIn(){ if(!ctx) return; const t=ctx.currentTime; const n=burst(sfx,t,1.8,0.5,'bandpass',200,1.5); n.b.frequency.exponentialRampToValueAtTime(5000,t+1.4); tone(sfx,'sawtooth',55,440,t,1.5,0.2,0.4); tone(sfx,'sine',1760,220,t+1.3,0.9,0.2); },
    warpOut(){ if(!ctx) return; const t=ctx.currentTime; const n=burst(sfx,t,1.2,0.6,'bandpass',4000,1); n.b.frequency.exponentialRampToValueAtTime(150,t+1); tone(sfx,'sine',120,30,t,1.1,0.7); },
    hiss(dur=2,vol=0.25){ if(!ctx) return; burst(sfx,ctx.currentTime,dur,vol,'highpass',3000); },
    roar(dur,vol){ if(!ctx) return; const t=ctx.currentTime; const s=ctx.createBufferSource(); s.buffer=noiseBuf; s.loop=true; const b=biq('lowpass',500,0.8), g=ctx.createGain();
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+dur*0.4); g.gain.linearRampToValueAtTime(0,t+dur); s.connect(b); b.connect(g); g.connect(sfx); s.start(t); s.stop(t+dur+0.1); },
    sting(){ if(!ctx) return; const t=ctx.currentTime; [[146.8,0],[220,0.1],[293.7,0.2],[370,0.35],[440,0.5]].forEach(([f,d])=>{ tone(musicGain,'triangle',f,f,t+d,4.5,0.13,1.2); tone(musicGain,'sine',f*2.005,f*2.005,t+d,4,0.05,1.5); }); },
    setEngine(thr, warpF, power){ if(!ctx) return; const t=ctx.currentTime;
      eng.g.gain.setTargetAtTime(power?0.035+thr*0.11:0,t,0.2); eng.o1.frequency.setTargetAtTime(38+thr*46+warpF*40,t,0.3); eng.o2.frequency.setTargetAtTime(57.6+thr*69+warpF*60,t,0.3);
      eng.lp.frequency.setTargetAtTime(140+thr*380+warpF*600,t,0.3); rumbleGain.gain.setTargetAtTime(power?0.04+thr*0.05:0.01,t,0.3);
      warpGain.gain.setTargetAtTime(warpF*0.16,t,0.25); warpOsc.forEach((o,i)=>o.detune.setTargetAtTime(Math.sin(t*0.7+i)*30+warpF*200,t,0.3)); },
    setRadioVol(v){ if(ctx) radioGain.gain.setTargetAtTime(v*0.9,ctx.currentTime,0.05); },
    setMusicVol(v){ if(ctx) musicGain.gain.setTargetAtTime(v*0.55,ctx.currentTime,0.1); },
    setMaster(v){ if(ctx) master.gain.setTargetAtTime(v,ctx.currentTime,0.2); },
    squelch(t){ burst(radioIn,t,0.07,0.35,'bandpass',1800,0.8); },
    /* alien speech: a string of filtered syllables through the radio chain */
    speak(v, dur, dry){
      if(!ctx) return; const dest=dry?sfx:radioIn; const t0=ctx.currentTime+0.06, end=t0+dur; if(!dry) api.squelch(t0-0.05);
      let t=t0; const scale=[0,2,3,5,7,8,10,12];
      while(t<end){
        const sd=(1/v.rate)*(0.6+Math.random()*0.9); if(Math.random()<0.1){ t+=sd*1.6; continue; }
        const d=sd*0.86; let f=v.base*Math.pow(2,(Math.random()-0.5)*2*v.range);
        if(v.fx==='robot') f=v.base*Math.pow(2,scale[Math.floor(Math.random()*scale.length)]/12);
        const f1=v.fx==='chirp'? f*Math.pow(2,(Math.random()-0.3)*v.glide) : v.fx==='bubble'? f*(1+Math.random()*v.glide) : f*Math.pow(2,(Math.random()-0.5)*v.glide);
        const o=ctx.createOscillator(), g=ctx.createGain(); o.type=v.wave; o.frequency.setValueAtTime(f,t); if(v.glide>0) o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);
        if(v.vib){ const l=ctx.createOscillator(), lg=ctx.createGain(); l.frequency.value=v.vib; lg.gain.value=v.vibAmt; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t+d+0.1); }
        const F1=300+Math.random()*600, F2=900+Math.random()*1600; const b1=biq('bandpass',F1,5), b2=biq('bandpass',F2,7);
        g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v.amp,t+Math.min(0.03,d*0.3)); g.gain.setTargetAtTime(0,t+d*0.55,d*0.14);
        if(v.wave==='sine'||v.wave==='triangle'){ o.connect(g); } else { o.connect(b1); o.connect(b2); b1.connect(g); b2.connect(g); const thru=gain(0.12); o.connect(thru); thru.connect(g); }
        g.connect(dest); o.start(t); o.stop(t+d+0.3);
        if(v.fx==='chorus'){ for(const m of [1.5,2.01]){ const o2=ctx.createOscillator(); o2.type='sine'; o2.frequency.setValueAtTime(f*m,t); const g2=gain(0.5); o2.connect(g2); g2.connect(g); o2.start(t); o2.stop(t+d+0.3); } }
        if(v.fx==='click'){ burst(dest,t,0.02,0.5,'highpass',3500); if(Math.random()<0.5) burst(dest,t+d*0.5,0.015,0.4,'highpass',4500); }
        if(v.fx==='rumble'){ burst(dest,t,d,0.25,'lowpass',220); }
        t+=sd;
      }
      if(!dry) api.squelch(end+0.02);
    },
    /* per-frame scheduler: ambient pads + the pop station */
    tick(dt, sys, flying){
      if(!ctx) return; musicTimer-=dt;
      if(musicTimer<=0 && sys.music>0.01){ musicTimer=7.5;
        const prog=[[110,164.8,220,261.6],[87.3,130.8,174.6,261.6],[98,146.8,196,246.9],[82.4,123.5,164.8,207.7]]; const ch=prog[chordIdx++%prog.length], t=ctx.currentTime;
        ch.forEach((f,i)=>{ const o=ctx.createOscillator(), g=ctx.createGain(); o.type=i%2?'sine':'triangle'; o.frequency.value=f*(1+(Math.random()-0.5)*0.004);
          g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.075,t+3.2); g.gain.linearRampToValueAtTime(0,t+10.5); o.connect(g); g.connect(musicGain); o.start(t); o.stop(t+11); });
        if(Math.random()<0.7){ const f=ch[2]*[2,3,4][Math.floor(Math.random()*3)]; tone(musicGain,'sine',f,f,t+2+Math.random()*3,3.5,0.05,0.4); }
      }
      djOn = flying && sys.power && sys.channel===3;
      if(djOn){ djTimer-=dt; if(djTimer<=0){ djTimer=0.19; const t=ctx.currentTime, seq=[0,7,12,7,3,10,15,10,5,12,17,12,-2,5,10,5], n=seq[djStep%16], f=196*Math.pow(2,n/12);
        tone(radioIn,'square',f,f,t,0.16,0.12); if(djStep%4===0) tone(radioIn,'sine',110,45,t,0.16,0.5); if(djStep%4===2) burst(radioIn,t,0.05,0.25,'highpass',5000); if(djStep%8===0) tone(radioIn,'sawtooth',f/4,f/4,t,0.7,0.16); djStep++; } }
    },
  };
  return api;
})();
