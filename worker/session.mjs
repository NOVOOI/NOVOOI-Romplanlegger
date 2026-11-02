const encoder=new TextEncoder();
const b64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
export async function sessionFor(request,secret){
 if(typeof secret!=='string'||secret.length<32||/REPLACE_WITH|CHANGE_ME/.test(secret))throw Error('SESSION_SECRET must contain at least 32 characters');
 const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
 const sign=async value=>b64(await crypto.subtle.sign('HMAC',key,encoder.encode(value)));
 const secure=new URL(request.url).protocol==='https:',name=secure?'__Host-novooi-session':'novooi-local-session';
 const raw=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||'';
 const [id,expires,signature]=raw.split('.');const now=Math.floor(Date.now()/1000);
 if(/^[a-f0-9]{64}$/.test(id||'')&&/^\d{10}$/.test(expires||'')&&+expires>now&&+expires<now+366*86400&&/^[\w-]{43}$/.test(signature||'')){
  const bytes=Uint8Array.from(atob(signature.replace(/-/g,'+').replace(/_/g,'/')+'='),x=>x.charCodeAt(0));
  if(await crypto.subtle.verify('HMAC',key,bytes,encoder.encode(id+'.'+expires)))return{id,cookie:null};
 }
 const fresh=[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join(''),until=now+365*86400,value=fresh+'.'+until;
 return{id:fresh,cookie:`${name}=${value}.${await sign(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure?'; Secure':''}`};
}
