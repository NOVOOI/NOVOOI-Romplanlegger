import {createDriveService} from './drive.mjs';
import {createProductService} from './products.mjs';
const TTL=15*60*1000,flights=new Map();
// One bounded metadata snapshot, overwritten on refresh. No model binaries are copied to R2.
export function createLibraryService(env,dependencies={}){
 const drive=dependencies.drive||createDriveService(env),products=dependencies.products||createProductService(env),now=dependencies.now||Date.now;
 const identity=env.DRIVE_ROOT_FOLDER_ID+'|'+JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON||'{}').client_email;
 const key=async()=>{const account=JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON||'{}'),bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.DRIVE_ROOT_FOLDER_ID+'|'+account.client_email));return 'library/v1/'+Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('')+'.json'};
 const read=async k=>{try{return await(await env.BUCKET?.get(k))?.json()}catch{return null}};
 async function refresh(){if(flights.has(identity))return flights.get(identity);const task=(async()=>{const k=await key();
  const previous=await read(k),catalog=await drive.catalog(true),files=catalog.files.filter(f=>f.mimeType==='application/vnd.google-apps.folder'||/zip/i.test(f.mimeType||'')||/\.(?:zip|glb|gltf|fbx|obj|3ds|dae|3dm|step|stp|iges|igs|ifc|dxf|stl|skp|dwg|ply|3mf|amf|vtk|lcf|rfa|rvt|gsm|nwd|nwc|sat|sldprt|ipt|c4d|blend|dgn|max)$/i.test(f.title)),ids=[...new Set(files.filter(f=>f.mimeType!=='application/vnd.google-apps.folder').map(f=>Number(f.productId)).filter(id=>Number.isSafeInteger(id)&&id>0))],records=new Map((previous?.products||[]).map(p=>[p.id,p])),batches=[];let incomplete=false;
  for(let i=0;i<ids.length;i+=20)batches.push(ids.slice(i,i+20));
  const worker=async()=>{while(batches.length){const batch=batches.shift();try{const data=await products.metadata(batch);for(const record of data.products||[]){const product=record.product;records.set(record.id,{...record,...(product?{product:{...product,images:(product.images||[]).slice(0,2).map(({id,src,thumbnail,alt})=>({id,src,thumbnail,alt}))}}:{})})}}catch{incomplete=true}}};
  await Promise.all(Array.from({length:Math.min(3,batches.length)},worker));
  const snapshot={files,products:ids.map(id=>records.get(id)).filter(Boolean),at:now(),metadataIncomplete:incomplete};const body=JSON.stringify(snapshot);
  if(body.length>5_000_000)throw Error('Library metadata snapshot exceeds limit');
  await env.BUCKET?.put(k,body,{httpMetadata:{contentType:'application/json'}});return JSON.parse(body);
 })().finally(()=>flights.delete(identity));flights.set(identity,task);return task}
 async function snapshot(context,force=false){const cached=await read(await key());if(cached&&!force){if(cached.at<now()-TTL&&context?.waitUntil)context.waitUntil(refresh().catch(e=>console.error('Library refresh failed',e.message)));return cached}return refresh()}
 return{snapshot,refresh};
}
