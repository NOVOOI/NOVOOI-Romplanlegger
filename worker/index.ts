import * as designs from '../app/api/designs/route';
import * as share from '../app/api/share/route';
import * as feedback from '../app/api/feedback/route';
import {sessionFor} from './session.mjs';
import {createDriveService,DriveError} from './drive.mjs';
type Env={ASSETS:Fetcher;BUCKET:R2Bucket;SESSION_SECRET:string;GOOGLE_SERVICE_ACCOUNT_JSON?:string;DRIVE_ROOT_FOLDER_ID?:string;DRIVE_CATALOG_NAME?:string;DRIVE_MAX_FILE_MB?:string};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function handle(request:Request,env:Env){
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/config')return json({driveConfigured:!!(env.GOOGLE_SERVICE_ACCOUNT_JSON&&env.DRIVE_ROOT_FOLDER_ID),catalogName:env.DRIVE_CATALOG_NAME||'4. Brands'});
 if(path==='/api/drive'){
  if(request.method!=='GET')return json({error:'Method not allowed'},405);
  try{const drive=createDriveService(env);switch(url.searchParams.get('action')){case 'status':return json(await drive.status());case 'list':return json(await drive.list(url.searchParams.get('parent')||'catalog-root',url.searchParams.get('pageToken')||''));case 'metadata':return json(await drive.metadata(url.searchParams.get('id')));case 'download':return await drive.download(url.searchParams.get('id'));default:return json({error:'invalid_action'},400)}}catch(e){return e instanceof DriveError?json({error:e.code,code:e.code},e.status):json({error:'drive_unavailable',code:'drive_unavailable'},503)}
 }
 if(path==='/api/shop'){
  if(request.method!=='GET')return json({error:'Method not allowed'},405);
  const sub=url.searchParams.get('path')||'';if(sub.length>3000||!/^products(?:\/(?:\d+|brands))?(?:\?|$)/.test(sub)||sub.includes('..')||sub.includes('\\')||sub.includes('#'))return json({error:'Invalid product path'},400);
  const target=new URL('https://novooi.com/wp-json/wc/store/v1/'+sub);if(target.origin!=='https://novooi.com')return json({error:'Invalid target'},400);
  const allowed=new Set(['search','per_page','page','_fields','type','parent','brand','include']);for(const k of target.searchParams.keys())if(!allowed.has(k))return json({error:'Invalid product query'},400);target.searchParams.set('per_page',String(Math.min(100,Math.max(1,Number(target.searchParams.get('per_page'))||20))));
  try{const result=await fetch(target,{headers:{Accept:'application/json'},redirect:'manual',signal:AbortSignal.timeout(20000)});if(!result.ok)return json({error:'Nettbutikken svarte ikke.'},502);if(!result.headers.get('content-type')?.includes('application/json'))return json({error:'Nettbutikken returnerte ikke produktdata.'},502);const text=await result.text();if(text.length>5000000)return json({error:'For stort produktsvar.'},502);return new Response(text,{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=120','X-Content-Type-Options':'nosniff'}})}catch{return json({error:'Kunne ikke hente produkter.'},502)}
 }
 const routes:Record<string,Record<string,(r:Request)=>Promise<Response>>>={'/api/designs':designs,'/api/share':share,'/api/feedback':feedback};
 if(routes[path]){
  if(!['GET','POST','DELETE'].includes(request.method))return json({error:'Method not allowed'},405);
  if(request.method!=='GET'&&request.headers.get('origin')!==url.origin)return json({error:'Invalid origin'},403);
  try{const session=await sessionFor(request,env.SESSION_SECRET),headers=new Headers(request.headers);headers.delete('x-novooi-session-id');headers.set('x-novooi-session-id',session.id);const trusted=new Request(request,{headers}),handler=routes[path][request.method];if(!handler)return json({error:'Method not allowed'},405);const response=await handler(trusted),result=new Response(response.body,response);if(session.cookie)result.headers.append('Set-Cookie',session.cookie);return result}catch{return json({error:'Skylagring er ikke konfigurert.'},503)}
 }
 if(path.startsWith('/api/'))return json({error:'Not found'},404);
 if(path==='/'){const target=new URL(request.url);target.pathname='/planner.html';return env.ASSETS.fetch(new Request(target,request))}
 return env.ASSETS.fetch(request);
}
export default{fetch:handle};
