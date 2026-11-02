/* NOVOOI shared catalog transport. Provider credentials stay in the Worker. */
window.NOVOOI_LIBRARY={
 async request(action,params={}){
  if(window.NOVOOI_STATIC)throw{code:'static_host'};
  const q=new URLSearchParams({action,...params}),response=await fetch('api/drive?'+q,{signal:AbortSignal.timeout(45000)});
  if(!response.ok){let data;try{data=await response.json()}catch{}throw{code:data?.code||'drive_unavailable'}}
  return action==='download'?response.arrayBuffer():response.json();
 },
 async config(){if(window.NOVOOI_STATIC)return{driveConfigured:false};try{const r=await fetch('api/config',{signal:AbortSignal.timeout(10000)});return r.ok?await r.json():{driveConfigured:false}}catch{return{driveConfigured:false}}},
 async collect({query='',technicalOnly=false,onProgress}={}){
  const queue=[{id:'catalog-root',brand:'',technical:false,path:''}],seen=new Set(),files=[];let visited=0;
  while(queue.length){const folder=queue.shift();if(seen.has(folder.id))continue;if(++visited>500)throw{code:'catalog_too_large'};seen.add(folder.id);let token='',pages=0;
   do{if(++pages>100)throw{code:'catalog_too_large'};const data=await this.request('list',{parent:folder.id,...(token?{pageToken:token}:{})});
    for(const f of data.files||[]){const isFolder=f.mimeType==='application/vnd.google-apps.folder';if(isFolder){queue.push({id:f.id,brand:folder.brand||f.title,technical:folder.technical||/^tekniske\s+filer$/i.test(f.title.trim()),path:folder.path?folder.path+' / '+f.title:f.title});if(!technicalOnly&&query&&f.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()))files.push(f)}else if((!technicalOnly||folder.technical)&&(!query||f.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())))files.push({...f,brand:folder.brand,path:folder.path});if(files.length>10000)throw{code:'catalog_too_large'}}
    token=data.nextPageToken||'';onProgress?.(visited,files.length);
   }while(token);
  }return files;
 }
};
