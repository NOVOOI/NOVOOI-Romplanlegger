import {buildMaterials} from './build-materials.mjs';
import {buildSkp} from './build-skp.mjs';
import {cp,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});await writeFile('dist/index.html',await readFile('public/planner.html'));console.log('Built dist/ for Cloudflare Workers.');

await buildSkp('dist');

await buildMaterials('dist');
