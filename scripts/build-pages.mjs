import {buildMaterials} from './build-materials.mjs';
import {buildSkp} from './build-skp.mjs';
import {cp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),out=path.join(root,'dist-pages');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
await cp(path.join(root,'public'),out,{recursive:true});
let html=await readFile(path.join(out,'planner.html'),'utf8');
html=html.replace('<head>','<head><script>window.NOVOOI_STATIC=true;</script>');
await writeFile(path.join(out,'index.html'),html);await writeFile(path.join(out,'planner.html'),html);await writeFile(path.join(out,'.nojekyll'),'');
console.log('Static GitHub Pages bundle: dist-pages (relative assets; no Worker or login required).');

await buildSkp('dist-pages');

await buildMaterials('dist-pages');
