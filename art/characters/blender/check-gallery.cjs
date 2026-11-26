const path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',chromiumSandbox:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    const page=await browser.newPage({viewport:{width:960,height:700}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error'&&/Shader Error|VALIDATE_STATUS|shader.*failed|GL_INVALID/i.test(m.text()))errors.push(m.text());});
    const lib=path.dirname(require.resolve('three/package.json'));
    await page.route('**/*',route=>{
      const url=new URL(route.request().url());
      if(url.hostname==='long-haul.test')return route.fulfill({contentType:'text/html',path:'index.html'});
      if(url.pathname.endsWith('/three.min.js'))return route.fulfill({contentType:'text/javascript',path:path.join(lib,'build/three.min.js')});
      if(url.pathname.includes('/examples/js/'))return route.fulfill({contentType:'text/javascript',path:path.join(lib,'examples/js',url.pathname.split('/examples/js/')[1])});
      if(url.hostname.includes('fonts'))return route.fulfill({body:'',contentType:'text/css'});return route.abort();
    });
    await page.addInitScript(()=>{const queue=new Map();let i=0;window.requestAnimationFrame=cb=>(queue.set(++i,cb),i);window.cancelAnimationFrame=id=>queue.delete(id);window.advance=t=>{const a=[...queue.values()];queue.clear();for(const f of a)f(t);};});
    await page.goto('https://long-haul.test/?gallery=cast',{waitUntil:'domcontentloaded'});
    const dlg=page.getByRole('dialog',{name:'Species gallery'});await dlg.getByRole('button',{name:'Inspect Marlo',exact:true}).waitFor({state:'attached'});assert.equal(await dlg.locator('.card').count(),50);
    await page.evaluate(()=>{Game.loop=()=>{};});
    for(const name of ['Marlo','Pavo','Tally']){
      await dlg.getByRole('button',{name:'Inspect '+name,exact:true}).dispatchEvent('click');
      await page.evaluate(()=>{window.advance(1000);window.advance(1020);});
      await dlg.locator('.stage').screenshot({path:'gallery-'+name.toLowerCase()+'.png',timeout:90000});
      await dlg.locator('#back').dispatchEvent('click');
    }
    assert.deepEqual(errors,[]);console.log('Rendered fur, feather and metal in the live species gallery.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
