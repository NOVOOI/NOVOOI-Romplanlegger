import {build} from 'esbuild';
export async function buildSkp(out){await build({entryPoints:['scripts/skp-worker.js'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,legalComments:'eof',outfile:out+'/vendor/skp-worker.js'});}
