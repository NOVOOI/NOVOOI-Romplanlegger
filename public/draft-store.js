/* Recoverable, browser-local journal. Never erase an older draft on a failed write. */
(function(root){
 function createDraftStore(getStorage,validate){
  const key='novooi-draft-v2',previousKey=key+'-previous',legacyKey='novooi-romplanlegger-v1';let lastRaw=null,lastPlan=null,lastAt=null;
  function decode(raw,legacy=false){if(!raw)return null;const d=JSON.parse(raw),plan=legacy?d:d.plan;validate(plan);return{plan,at:legacy?null:d.at,raw:legacy?JSON.stringify({version:2,at:null,plan}):raw}}
  function read(){let storage;try{storage=getStorage();}catch{return{error:'Nettleseren gir ikke tilgang til lokal lagring.'}}let damaged=false;
   for(const [k,legacy]of[[key,false],[previousKey,false],[legacyKey,true]]){try{const raw=storage.getItem(k);if(!raw)continue;const d=decode(raw,legacy);lastRaw=d.raw;lastPlan=JSON.stringify(d.plan);lastAt=d.at;return{...d,recovered:k===previousKey,legacy,error:damaged?'Siste utkast kunne ikke leses. En tidligere kopi er gjenopprettet.':''}}catch{damaged=true}}
   return{error:damaged?'Arbeidsutkastet kunne ikke leses. Åpne en lagret versjon eller sikkerhetskopi.':''};
  }
  function write(plan){try{validate(plan);const text=JSON.stringify(plan);if(text===lastPlan&&getStorage().getItem(key)===lastRaw)return{ok:true,at:lastAt};const storage=getStorage(),at=new Date().toISOString(),raw=JSON.stringify({version:2,at,plan});if(lastRaw)storage.setItem(previousKey,lastRaw);storage.setItem(key,raw);lastRaw=raw;lastPlan=text;lastAt=at;return{ok:true,at}}catch{return{ok:false,error:'Arbeidsutkastet kunne ikke lagres på enheten. Last ned en sikkerhetskopi før du lukker siden.'}}}
  function previous(){try{return decode(getStorage().getItem(previousKey))}catch{return null}}
  return{read,write,previous};
 }
 root.NovooiDrafts={createDraftStore};
})(globalThis);
