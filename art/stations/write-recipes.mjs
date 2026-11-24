import fs from 'node:fs';
import {stations,layout} from './stations.mjs';
fs.writeFileSync(new URL('./recipes.json',import.meta.url),JSON.stringify(stations.map(s=>({...s,parts:layout(s.id)})))+'\n');
