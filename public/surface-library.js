/* Shared whole-model materials. Supplier textures and generic illustrations are labelled separately. */
(function(root){
 const entries=[
  {id:'vidar-333',name:'Vidar 333',group:'Tekstil',color:'#9a8170',roughness:1,texture:'vidar-0333-color.jpg',normal:'vidar-0333-normal.jpg',rough:'vidar-0333-roughness.jpg',tile:[.2789,.3932],source:'Kvadrat Vidar 4 / 0333 · produsentens tekstur'},
  {id:'fabric-sand',name:'Stoff · sand',group:'Tekstil',color:'#c8baa3',roughness:1,pattern:'weave',tile:[.15,.15],source:'Generisk stoff · illustrasjon'},
  {id:'fabric-grey',name:'Stoff · grå',group:'Tekstil',color:'#81888a',roughness:1,pattern:'weave',tile:[.15,.15],source:'Generisk stoff · illustrasjon'},
  {id:'fabric-dark',name:'Stoff · mørk',group:'Tekstil',color:'#34383b',roughness:1,pattern:'weave',tile:[.15,.15],source:'Generisk stoff · illustrasjon'},
  {id:'walnut',name:'Valnøtt',group:'Tre',color:'#886145',roughness:.45,texture:'pavilion-walnut.jpg',tile:[.3048,.3048],source:'&Tradition Walnut-V · tekstur fra leverandørens modell'},
  {id:'oak-light',name:'Tre · lys eik',group:'Tre',color:'#c8a77c',roughness:.6,pattern:'wood',tile:[.3,.9],source:'Generisk treverk · illustrasjon'},
  {id:'black-matte',name:'Matt sort',group:'Ensfarget og metall',color:'#191919',roughness:.85,source:'Generisk matt overflate'},
  {id:'white-matte',name:'Matt hvit',group:'Ensfarget og metall',color:'#eeeae3',roughness:.85,source:'Generisk matt overflate'},
  {id:'chrome',name:'Krom',group:'Ensfarget og metall',color:'#d9d9d9',roughness:.18,metalness:1,source:'Generisk blankt metall'}
 ];
 const lookup=new Map(entries.map(e=>[e.id,Object.freeze(e)])),textures=new Map(),pending=new Map();
 function get(id){return lookup.get(id)||null}
 function texture(file,color){const key=file+'|'+color;if(textures.has(key))return textures.get(key);const T=root.THREE;let resolve,reject;const task=new Promise((a,b)=>{resolve=a;reject=b}),t=new T.TextureLoader().load('materials/'+file,()=>resolve(t),undefined,e=>reject(e));t.flipY=false;t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=color?T.sRGBEncoding:T.LinearEncoding;t.anisotropy=4;textures.set(key,t);pending.set(key,task);task.catch(()=>{textures.delete(key);pending.delete(key)});return t}
 function pattern(kind){const key='pattern:'+kind;if(textures.has(key))return textures.get(key);const T=root.THREE,c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),pixels=ctx.createImageData(128,128);let seed=7123;for(let y=0;y<128;y++)for(let x=0;x<128;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const grain=kind==='wood'?Math.sin(x*.3+Math.sin(y*.035)*2)*12:((x%4<2?8:-8)+(y%4<2?5:-5));const n=Math.max(180,Math.min(255,230+grain+(seed/4294967296-.5)*12)),i=(y*128+x)*4;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=n;pixels.data[i+3]=255}ctx.putImageData(pixels,0,0);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;t.anisotropy=4;textures.set(key,t);return t}
 function maps(e){return{map:e.texture?texture(e.texture,true):e.pattern?pattern(e.pattern):null,normalMap:e.normal?texture(e.normal,false):null,roughnessMap:e.rough?texture(e.rough,false):null}}
 async function ready(ids){for(const id of new Set(ids||[])){const e=get(id);if(e)maps(e)}await Promise.all([...pending.values()])}
 /* Use metre-space box projection so texture scale does not depend on source format or UVs. */
 function project(mesh,tile){const T=root.THREE,source=mesh.geometry,geo=source.index?source.toNonIndexed():source.clone(),positions=geo.getAttribute('position'),uv=new Float32Array(positions.count*2),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),n=new T.Vector3(),ab=new T.Vector3(),ac=new T.Vector3();
  for(let i=0;i<positions.count;i+=3){a.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);b.fromBufferAttribute(positions,Math.min(i+1,positions.count-1)).applyMatrix4(mesh.matrixWorld);c.fromBufferAttribute(positions,Math.min(i+2,positions.count-1)).applyMatrix4(mesh.matrixWorld);n.crossVectors(ab.subVectors(b,a),ac.subVectors(c,a));const x=Math.abs(n.x),y=Math.abs(n.y),z=Math.abs(n.z);for(let j=0;j<3&&i+j<positions.count;j++){const p=j===0?a:j===1?b:c;uv[(i+j)*2]=(x>=y&&x>=z?p.z:p.x)/tile[0];uv[(i+j)*2+1]=(y>=x&&y>=z?p.z:p.y)/tile[1]}}
  geo.setAttribute('uv',new T.BufferAttribute(uv,2));return geo;
 }
 function apply(model,id,onReady){const e=get(id);if(!e)return false;const T=root.THREE,m=new T.MeshStandardMaterial({color:e.texture?'#ffffff':e.color,roughness:e.roughness,metalness:e.metalness||0,side:T.DoubleSide,...maps(e)});m.color.convertSRGBToLinear();m.name='NOVOOI · '+e.name;model.updateMatrixWorld(true);const oldGeometries=new Set(),oldMaterials=new Set();model.userData.ownedMaterials=model.userData.ownedMaterials||[];model.userData.ownedMaterials.push(m);model.userData.ownedGeometries=model.userData.ownedGeometries||[];
  model.traverse(mesh=>{if(!mesh.isMesh)return;if(!model.userData.shared)for(const material of(Array.isArray(mesh.material)?mesh.material:[mesh.material]))oldMaterials.add(material);if(m.map&&mesh.geometry?.getAttribute('position')){const source=mesh.geometry;mesh.geometry=project(mesh,e.tile);model.userData.ownedGeometries.push(mesh.geometry);if(!model.userData.shared)oldGeometries.add(source)}mesh.material=m});for(const g of oldGeometries)g.dispose();for(const material of oldMaterials)material.dispose();if(onReady)Promise.all([...pending.values()]).then(onReady).catch(onReady);return true;
 }
 root.NovooiSurfaceLibrary=Object.freeze({entries:Object.freeze(entries),get,ready,apply,project});
})(globalThis);
