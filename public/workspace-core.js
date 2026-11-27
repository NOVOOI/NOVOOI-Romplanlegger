/* Product families, module identity and solid-wall geometry. No DOM or network. */
(function(root){
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ø/g,'o').replace(/æ/g,'ae').replace(/[^a-z0-9]+/g,' ').trim();
 const format=s=>(String(s||'').match(/\.([a-z0-9]+)(?:#\d+)?$/i)||[])[1]?.toLowerCase()||'';
 function stem(s){return norm(String(s||'').replace(/(?:\.(?:zip|glb|gltf|skp|obj|fbx|3ds|3dm|dae|stl|step|stp|iges|igs|ifc|dxf))+$/gi,'').replace(/\s*\(\d+\)\s*$/,''))}
 function uniqueFiles(files){const seen=new Set();return [...files].sort((a,b)=>String(a.id).localeCompare(String(b.id))).filter(f=>{const checksum=f.md5Checksum||f.checksum;const key=checksum?(f.productId||f.path)+'|hash:'+checksum:[f.productId||f.path,f.path||'',stem(f.title),format(f.title),f.size||f.fileSize||0].join('|');if(seen.has(key))return false;seen.add(key);return true})}
 function modelChoices(models){const score=p=>(p.rec?.upsrc==='user'?8:0)+(p.rec?.linkMethod==='folder-id'?4:0)+(p.model?1:0);const seen=new Set();return [...models].sort((a,b)=>score(b)-score(a)||String(a.id).localeCompare(String(b.id))).filter(p=>{const entry=String(p.rec?.entry||p.rec?.fileName||p.name),base=entry.split('/').at(-1),name=stem(base),generic=/^(model|object|3d|cad|bim)$/.test(name),key=[Number(p.rec?.productId||p.shop?.id)||0,name,format(base),generic?stem(p.rec?.fileName):''].join('|');if(seen.has(key))return false;seen.add(key);return true})}

 // Format names describe an export, not a distinct piece of furniture.
 function sourceLabel(file){let value=stem(file.title||file.rec?.fileName||file.name);const brand=norm(file.brand||file.rec?.brand);if(brand)value=value.replace(new RegExp('\\b'+brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','g'),' ');return value.replace(/\b(?:glb|gltf|sketchup|skp|3ds|obj|fbx|ifc|revit|archicad|dwg|dxf|3dm|rhino|step|stp|iges|igs|dae|stl|pcon|bim|cad|zip|files?|filer|format|3d|2d)\b/g,' ').replace(/^\s*\d+\s*$/,'').replace(/\s+/g,' ').trim()}
 function sourceFormat(file){const title=norm(file.title||file.rec?.fileName||file.name),ext=format(file.title||file.rec?.fileName||file.name);if(ext!=='zip')return ext;return [['glb',/\bglb\b/],['gltf',/\bgltf\b/],['skp',/sketchup|\bskp\b/],['3ds',/\b3ds\b/],['obj',/\bobj\b/],['fbx',/\bfbx\b/],['3dm',/rhino|\b3dm\b/],['step',/step|\bstp\b/],['dwg',/\bdwg\b/],['ifc',/\bifc\b/],['rvt',/revit/],['lcf',/archicad/]].find(([,r])=>r.test(title))?.[0]||ext}
 function sourceGroups(files){const groups=new Map(),rank=f=>{const formats= (Number(f.productId)===71284||/celi/i.test(f.title+' '+f.productName))?['glb','skp','gltf','3ds','obj','fbx','3dm','step','dwg','ifc','zip','rvt','lcf']:/h[åa]g/i.test(f.brand||'')?['glb','3ds','skp','gltf','obj','fbx','3dm','step','dwg','ifc','zip','rvt','lcf']:['glb','gltf','skp','3ds','fbx','obj','3dm','step','dwg','ifc','zip','rvt','lcf'];return (/\b2d\b/i.test(f.title)?100:0)+(formats.indexOf(sourceFormat(f))+1||50)};for(const file of uniqueFiles(files)){const label=Number(file.productId)===65542?'keeep your sofa':sourceLabel(file),key=[file.productId||file.path||file.id,label].join('|');if(!groups.has(key))groups.set(key,{key,label,files:[]});groups.get(key).files.push(file)}return [...groups.values()].map(group=>({...group,files:group.files.sort((a,b)=>rank(a)-rank(b)||String(a.id).localeCompare(String(b.id)))}))}
 const family=p=>Number(p?.rec?.productId||p?.shop?.id||p?.productId)||0;
 function moduleAttribute(shop){return(shop?.attrs||shop?.attributes||[]).find(a=>a.has_variations!==false&&(/modul|module|element|configuration|konfigurasjon/.test(norm(a.name))||(a.terms||[]).filter(t=>moduleKind(t.name)).length>=2))}
 function moduleKind(value){const n=norm(value),side=/left|venstre/.test(n)?'left':/right|hoyre/.test(n)?'right':'';if(/corner|hjorne|hjorn/.test(n))return 'corner'+(side?'-'+side:'');if(/midt|middle|center|centre|single module|armless|uten arm/.test(n))return 'middle';if(/chaise|sjeselong|longue/.test(n))return 'chaise'+(side?'-'+side:'');if(/ottoman|pouf|puff|footstool/.test(n))return 'ottoman';if(side)return 'end-'+side;return ''}
 function moduleMatch(label,term){const a=norm(label),b=norm(term);if(!b)return false;if(a===b||a.includes(b))return true;const x=moduleKind(a),y=moduleKind(b);if(x&&y)return x===y;return false}
 function resolveModule(candidates,term,preferred){const hits=candidates.filter(c=>moduleMatch(c.label,term));if(!hits.length)return{status:'missing'};const pref=hits.filter(c=>c.format===preferred),pool=pref.length?pref:hits;const kinds=new Set(pool.map(c=>stem(c.label).replace(/\b(3d|bim)\b/g,'').trim()));if(kinds.size>1&&pool.length>1)return{status:'ambiguous',candidates:pool};return{status:'matched',candidate:pool.sort((a,b)=>String(a.id).localeCompare(String(b.id)))[0]}}
 function wallBox(w,height=300){const dx=w.b.x-w.a.x,dz=w.b.z-w.a.z;return{x:(w.a.x+w.b.x)/2,z:(w.a.z+w.b.z)/2,w:Math.hypot(dx,dz),d:w.t||12,rot:-Math.atan2(dz,dx)*180/Math.PI,bottom:0,top:height}}
 function penetration(a,b){if(a.top<=b.bottom||b.top<=a.bottom)return null;const axes=[a.rot,b.rot].flatMap(v=>{const r=v*Math.PI/180;return[[Math.cos(r),-Math.sin(r)],[Math.sin(r),Math.cos(r)]]});const radius=(o,x,z)=>{const r=o.rot*Math.PI/180;return Math.abs(x*Math.cos(r)-z*Math.sin(r))*o.w/2+Math.abs(x*Math.sin(r)+z*Math.cos(r))*o.d/2};let best=null;for(const[x,z]of axes){const signed=(a.x-b.x)*x+(a.z-b.z)*z,overlap=radius(a,x,z)+radius(b,x,z)-Math.abs(signed);if(overlap<=.05)return null;if(!best||overlap<best.depth){const sign=signed<0?-1:1;best={x:x*sign,z:z*sign,depth:overlap}}}return best}
 function moduleSnap(a,others,tolerance=14,canSnap=()=>true){let best=null;for(const b of others){const angle=Math.round((a.rot-b.rot)/90)*90+b.rot;if(Math.abs(angle-a.rot)>15)continue;const r=b.rot*Math.PI/180,c=Math.cos(r),s=Math.sin(r),dx=a.x-b.x,dz=a.z-b.z,x=dx*c-dz*s,z=dx*s+dz*c,turn=Math.round((angle-b.rot)/90)%2,aw=turn?a.d:a.w,ad=turn?a.w:a.d;for(const axis of['x','z']){const target=(axis==='x'?(aw+b.w):(ad+b.d))/2,side=(axis==='x'?x:z)<0?-1:1,nx=axis==='x'?side*target:0,nz=axis==='z'?side*target:0,dist=Math.hypot(x-nx,z-nz);if(dist<=tolerance&&(!best||dist<best.dist)){const candidate={dist,x:b.x+nx*c+nz*s,z:b.z-nx*s+nz*c,rot:angle};if(canSnap(candidate))best=candidate}}}return best&&{x:best.x,z:best.z,rot:best.rot}}
 // A 1 cm grid measured from the nearest module's edges, not its centre.
 // Different module widths can therefore meet exactly and still slide freely.
 function keeepSnap(a,others,tolerance=10){
  const grid=1;let best=null,nearest=null;
  for(const b of others){
   const angle=Math.round((a.rot-b.rot)/90)*90+b.rot;if(Math.abs(angle-a.rot)>15)continue;
   const r=b.rot*Math.PI/180,c=Math.cos(r),s=Math.sin(r),dx=a.x-b.x,dz=a.z-b.z,x=dx*c-dz*s,z=dx*s+dz*c,turn=Math.abs(Math.round((angle-b.rot)/90))%2,aw=turn?a.d:a.w,ad=turn?a.w:a.d;
   const quant=(v,offset)=>offset+Math.round((v-offset)/grid)*grid;
   const gx=quant(x,(b.w-aw)/2),gz=quant(z,(b.d-ad)/2),distance=Math.hypot(dx,dz);
   if(!nearest||distance<nearest.distance)nearest={distance,x:b.x+gx*c+gz*s,z:b.z-gx*s+gz*c};
   for(const axis of ['x','z']){
    const edge=(axis==='x'?aw+b.w:ad+b.d)/2,across=axis==='x'?z:x,span=axis==='x'?Math.abs(ad-b.d)/2:Math.abs(aw-b.w)/2,offset=axis==='x'?gz:gx;
    const limits=[0,-span,span],aligned=limits.reduce((v,n)=>Math.abs(n-across)<Math.abs(v-across)?n:v,limits[0]),tangent=Math.abs(aligned-across)<=3?aligned:offset;
    if(Math.abs(tangent)>=(axis==='x'?(ad+b.d):(aw+b.w))/2-.05)continue;
    const nx=axis==='x'?(x<0?-1:1)*edge:tangent,nz=axis==='z'?(z<0?-1:1)*edge:tangent,dist=Math.hypot(x-nx,z-nz);
    if(dist>tolerance)continue;
    const next={x:b.x+nx*c+nz*s,z:b.z-nx*s+nz*c,rot:angle};
    if(others.some(o=>penetration({...a,...next,bottom:0,top:1},{...o,bottom:0,top:1})))continue;
    const contacts=others.filter(o=>{const r=o.rot*Math.PI/180,c=Math.cos(r),s=Math.sin(r),dx=next.x-o.x,dz=next.z-o.z,x=dx*c-dz*s,z=dx*s+dz*c,turn=Math.abs(Math.round((angle-o.rot)/90))%2,w=turn?a.d:a.w,d=turn?a.w:a.d;return Math.abs(Math.abs(x)-(w+o.w)/2)<.06&&Math.abs(z)<(d+o.d)/2-.05||Math.abs(Math.abs(z)-(d+o.d)/2)<.06&&Math.abs(x)<(w+o.w)/2-.05}).length;
    if(!best||contacts>best.contacts||contacts===best.contacts&&dist<best.dist)best={...next,dist,contacts};
   }
  }
  if(best)return{x:best.x,z:best.z,rot:best.rot};
  return nearest?{x:nearest.x,z:nearest.z}:{x:Math.round(a.x/grid)*grid,z:Math.round(a.z/grid)*grid};
 }
 function pointInRoom(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>p.z)!==(b.z>p.z)&&p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)inside=!inside;}return inside;}
 // Planar wall graph: intersections and T-junctions form bounded faces.
 // Dangling partitions are pruned, so a short freestanding wall does not split a floor.
 function roomRegions(corners,partitions=[]){
  if(corners.length<3)return[];
  const cross=(a,b)=>a.x*b.z-a.z*b.x,sub=(a,b)=>({x:a.x-b.x,z:a.z-b.z}),lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});
  const segments=corners.map((a,i)=>({a:{...a},b:{...corners[(i+1)%corners.length]},outer:true}));
  for(const w of partitions){if(!w?.a||!w?.b)continue;const segment={a:{...w.a},b:{...w.b}};for(const end of ['a','b']){const p=segment[end];let best=null;for(const edge of segments){const d=sub(edge.b,edge.a),len=d.x*d.x+d.z*d.z;if(len<.01)continue;const t=Math.max(0,Math.min(1,((p.x-edge.a.x)*d.x+(p.z-edge.a.z)*d.z)/len)),q=lerp(edge.a,edge.b,t),distance=Math.hypot(q.x-p.x,q.z-p.z);if(distance<Math.max(3,(w.t||12)/2+1)&&(!best||distance<best.distance))best={...q,distance};}if(best)segment[end]={x:best.x,z:best.z};}if(Math.hypot(segment.b.x-segment.a.x,segment.b.z-segment.a.z)>.1)segments.push(segment);}
  const cuts=segments.map(()=>[0,1]);
  segments.forEach((a,i)=>segments.forEach((b,j)=>{if(j<=i)return;const d=sub(a.b,a.a),e=sub(b.b,b.a),v=sub(b.a,a.a),den=cross(d,e);if(Math.abs(den)>.000001){const t=cross(v,e)/den,u=cross(v,d)/den;if(t>=-1e-6&&t<=1+1e-6&&u>=-1e-6&&u<=1+1e-6){cuts[i].push(Math.max(0,Math.min(1,t)));cuts[j].push(Math.max(0,Math.min(1,u)));}}else if(Math.abs(cross(v,d))<.001){for(const [p,k,edge]of [[a.a,j,b],[a.b,j,b],[b.a,i,a],[b.b,i,a]]){const q=sub(edge.b,edge.a),t=((p.x-edge.a.x)*q.x+(p.z-edge.a.z)*q.z)/(q.x*q.x+q.z*q.z);if(t>=0&&t<=1)cuts[k].push(t);}}}));
  const nodes=new Map(),node=p=>{const id=Math.round(p.x*100)+','+Math.round(p.z*100);if(!nodes.has(id))nodes.set(id,{id,x:p.x,z:p.z,links:new Set()});return nodes.get(id);};
  segments.forEach((edge,i)=>{const ts=[...new Set(cuts[i])].sort((a,b)=>a-b);for(let k=1;k<ts.length;k++){const a=node(lerp(edge.a,edge.b,ts[k-1])),b=node(lerp(edge.a,edge.b,ts[k]));if(a.id!==b.id){a.links.add(b.id);b.links.add(a.id);}}});
  let pruning=true;while(pruning){pruning=false;for(const n of nodes.values())if(n.links.size===1){const id=[...n.links][0];nodes.get(id).links.delete(n.id);n.links.clear();pruning=true;}}
  const ordered=n=>[...n.links].sort((a,b)=>Math.atan2(nodes.get(a).z-n.z,nodes.get(a).x-n.x)-Math.atan2(nodes.get(b).z-n.z,nodes.get(b).x-n.x));
  const visited=new Set(),regions=[];
  for(const start of nodes.values())for(const neighbour of start.links){if(visited.has(start.id+'>'+neighbour))continue;let a=start,b=nodes.get(neighbour),poly=[],closed=false;for(let step=0;step<segments.length*segments.length*4+100;step++){const key=a.id+'>'+b.id;if(visited.has(key)){closed=a.id===start.id&&b.id===neighbour;break;}visited.add(key);poly.push({x:a.x,z:a.z});const links=ordered(b),index=links.indexOf(a.id),next=links[(index-1+links.length)%links.length];a=b;b=nodes.get(next);if(!b)break;}
   const area=poly.reduce((sum,p,i)=>{const q=poly[(i+1)%poly.length];return sum+p.x*q.z-q.x*p.z;},0)/2;if(!closed||poly.length<3||area<1)continue;
   const pa=poly[0],pb=poly[1],d=sub(pb,pa),length=Math.hypot(d.x,d.z),anchor={x:(pa.x+pb.x)/2-d.z/length*.1,z:(pa.z+pb.z)/2+d.x/length*.1};if(pointInRoom(anchor,corners))regions.push({polygon:poly,anchor,area});
  }
  return regions.length?regions:[{polygon:corners.map(p=>({...p})),anchor:{...corners[0]},area:0}];
 }
 function wallOccludesRoom(w,camera,points,height,lowHeight=26){const dx=w.b.x-w.a.x,dz=w.b.z-w.a.z;return points.some(p=>{const vx=p.x-camera.x,vz=p.z-camera.z,den=vx*dz-vz*dx;if(Math.abs(den)<1e-7)return false;const ax=w.a.x-camera.x,az=w.a.z-camera.z,t=(ax*dz-az*dx)/den,u=(ax*vz-az*vx)/den;if(t<=0||t>=1||u<0||u>1)return false;const y=camera.y*(1-t);return y>lowHeight&&y<height;});}
 root.NovooiWorkspace={norm,format,stem,uniqueFiles,modelChoices,sourceLabel,sourceFormat,sourceGroups,family,moduleAttribute,moduleKind,moduleMatch,resolveModule,wallBox,penetration,moduleSnap,keeepSnap,pointInRoom,roomRegions,wallOccludesRoom};
})(globalThis);
