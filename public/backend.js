/* NOVOOI shared catalog transport. Provider credentials stay in the Worker. */
window.NOVOOI_LIBRARY={
 async request(action,params={}){
  if(window.NOVOOI_STATIC)throw{code:'static_host'};
  const q=new URLSearchParams({action,...params}),response=await fetch('api/drive?'+q,{signal:AbortSignal.timeout(120000)});
  if(!response.ok){let data;try{data=await response.json()}catch{}throw{code:data?.code||'drive_unavailable'}}
  return action==='download'?response.arrayBuffer():response.json();
 },
 async config(){if(window.NOVOOI_STATIC)return{driveConfigured:false};try{const r=await fetch('api/config',{signal:AbortSignal.timeout(10000)});return r.ok?await r.json():{driveConfigured:false}}catch{return{driveConfigured:false}}},
 async collect({query='',technicalOnly=false,onProgress,refresh=false}={}){
  const data=await this.request('catalog',refresh?{refresh:'1'}:{}),q=query.toLocaleLowerCase();
  onProgress?.(data.files.filter(f=>f.mimeType==='application/vnd.google-apps.folder').length,data.files.length);
  return data.files.filter(f=>(!technicalOnly||f.technical)&&(!q||f.title.toLocaleLowerCase().includes(q)));
 }
};
