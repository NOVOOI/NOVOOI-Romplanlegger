/* Shared, DOM-free planner rules; usable in browsers and Node tests. */
(function(root){
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 function overlaps(a,b){
  if(Math.min(a.top,b.top)-Math.max(a.bottom,b.bottom)<=1)return false;
  const axes=[a.rot,b.rot].flatMap(deg=>{const r=deg*Math.PI/180;return [[Math.cos(r),-Math.sin(r)],[Math.sin(r),Math.cos(r)]]});
  const radius=(o,x,z)=>{const r=o.rot*Math.PI/180;return Math.abs(x*Math.cos(r)-z*Math.sin(r))*o.w/2+Math.abs(x*Math.sin(r)+z*Math.cos(r))*o.d/2};
  return axes.every(([x,z])=>Math.abs((a.x-b.x)*x+(a.z-b.z)*z)<radius(a,x,z)+radius(b,x,z)-1);
 }
 function validate(d){
  if(d?.format!=='novooi-design'||d.version!==1||!Array.isArray(d.plan?.corners)||d.plan.corners.length<3||d.plan.corners.length>100||!Array.isArray(d.plan.items)||d.plan.items.length>500||!Array.isArray(d.models)||d.models.length>500)throw Error('Dette er ikke en gyldig NOVOOI-designfil.');
  if(!finite(d.plan.wallH)||d.plan.wallH<50||d.plan.wallH>3000||d.plan.corners.some(c=>!finite(c.x)||!finite(c.z)||Math.abs(c.x)>100000||Math.abs(c.z)>100000))throw Error('Ugyldige rommål.');
  const ids=new Set();for(const it of d.plan.items){if(typeof it.u!=='string'||ids.has(it.u)||typeof it.pid!=='string'||![it.x,it.z,it.rot].every(finite)||Math.abs(it.x)>100000||Math.abs(it.z)>100000)throw Error('Ugyldig objekt i designfilen.');ids.add(it.u)}
  for(const m of d.models)if(typeof m.id!=='string'||typeof m.glb!=='string'||![m.w,m.h,m.d].every(n=>finite(n)&&n>0&&n<100000))throw Error('Ugyldig 3D-modell.');
  return d;
 }
 function priceInfo(it,p){
  if(!p)return{amount:0,status:'missing',label:'Modell mangler'};
  if(p.placeholder||!p.custom&&!p.shop)return{amount:0,status:'example',label:'Eksempelvare'};
  if(p.shop){const s=p.shop,full=(s.attrs||[]).every(a=>it.sel?.[a.name]),v=full?(s.vars||[]).find(v=>(s.attrs||[]).every(a=>!v.sel?.[a.name]||v.sel[a.name]===it.sel[a.name])):null;
   if(s.cur?.code&&s.cur.code!=='NOK')return{amount:0,status:'missing',label:'Pris i '+s.cur.code};
   if(full&&s.type==='variable'&&(!s.variantsLoaded||!v||!finite(v.price)))return{amount:0,status:'missing',label:s.variantsLoaded?'Variantpris ikke tilgjengelig':'Henter variantpris'};
   const amount=v?.price??s.min;if(finite(amount)&&amount>=0)return{amount,status:v||s.type==='simple'?'priced':'estimate',label:v?'Oppgitt variantpris':s.type==='simple'?'Oppgitt produktpris':'Fra-pris · velg variant'};
   if(s.linkMethod==='folder-id')return{amount:0,status:'missing',label:'Pris ikke tilgjengelig fra nettbutikken'};
  }
  return finite(p.price)&&p.price>0?{amount:p.price,status:'manual',label:'Manuelt oppgitt pris'}:{amount:0,status:'missing',label:'Pris mangler'};
 }
 root.NovooiCore={overlaps,validate,priceInfo};
})(globalThis);
