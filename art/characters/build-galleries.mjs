import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {build} from 'esbuild';
const root=fileURLToPath(new URL('../../',import.meta.url));
const {residents}=await import('./src/residents.js');
await fs.writeFile(path.join(root,'assets/characters/residents.json'),JSON.stringify(residents,null,2)+'\n');
const template=await fs.readFile(path.join(root,'art/characters/viewer-template.html'),'utf8');
for(const [entry,thumb,output,title] of [
 ['art/characters/src/viewer.js','art/characters/thumbs.json','docs/character-models/index.html','Aliens &amp; robots'],
 ['art/stations/viewer.mjs','art/stations/thumbs.json','docs/outposts/index.html','Outposts &amp; research stations']]){
 const r=await build({entryPoints:[path.join(root,entry)],bundle:true,write:false,format:'iife',minify:true,legalComments:'inline',target:'es2020',nodePaths:[path.join(root,'art/characters/node_modules')]});
 const pictures=JSON.parse(await fs.readFile(path.join(root,thumb),'utf8'));
 const html=template.replaceAll('__TITLE__',title).replace('__THUMBNAILS__',()=>JSON.stringify(pictures));
 await fs.writeFile(path.join(root,output),html.replace('__BUNDLE__',()=>r.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')));
}
