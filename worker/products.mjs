const BASE='https://novooi.com/wp-json/wc/store/v1/',TTL=15*60*1000;
export class ProductError extends Error{constructor(code,status=502){super(code);this.code=code;this.status=status}}
const idOf=v=>{const n=Number(v);if(!Number.isSafeInteger(n)||n<1||n>2147483647)throw new ProductError('invalid_product_id',400);return n};
export function createProductService(env,fetcher=fetch){
 const get=async key=>{try{return await(await env.BUCKET?.get(key))?.json()}catch{return null}};
 const put=async(key,value)=>{await env.BUCKET?.put(key,JSON.stringify(value),{httpMetadata:{contentType:'application/json'}})};
 async function request(path){const r=await fetcher(BASE+path,{method:'GET',headers:{Accept:'application/json'},redirect:'manual',signal:AbortSignal.timeout(25000)});if(!r.ok||!r.headers.get('content-type')?.includes('application/json'))throw new ProductError('products_unavailable');const text=await r.text();if(text.length>5000000)throw new ProductError('products_too_large');let data;try{data=JSON.parse(text)}catch{throw new ProductError('products_invalid_response')}return{data,pages:Number(r.headers.get('x-wp-totalpages'))||0}}
 async function metadata(values){if(!Array.isArray(values)||!values.length||values.length>20)throw new ProductError('invalid_product_batch',400);const ids=[...new Set(values.map(idOf))],products=[],missing=[];const now=Date.now();
  for(const id of ids){const cached=await get('woo/v1/product/'+id);if(cached&&cached.at>now-(cached.status==='unavailable'?300000:TTL))products.push(cached);else missing.push(id)}
  if(missing.length){const params=new URLSearchParams({include:missing.join(','),per_page:'100',_fields:'id,name,sku,type,permalink,prices,brands,attributes,stock_availability,is_in_stock,categories,images'});const {data}=await request('products?'+params);if(!Array.isArray(data))throw new ProductError('products_invalid_response');const byId=new Map(data.map(p=>[Number(p.id),p]));
   for(const id of missing){const product=byId.get(id),record={id,status:product?'linked':'unavailable',at:now,...(product?{product}:{})};await put('woo/v1/product/'+id,record);products.push(record)}
  }return{products,at:now};
 }
 async function variants(value){const id=idOf(value),record=(await metadata([id])).products[0];if(record.status!=='linked')return{...record,variants:[],variantsAt:record.at};if(record.product.type!=='variable')return{...record,variants:[],variantsAt:record.at};const cached=await get('woo/v1/variants/'+id);if(cached?.at>Date.now()-TTL)return{...record,variants:cached.variants,variantsAt:cached.at};
  const rows=[];let complete=false;for(let page=1;page<=20;page++){const params=new URLSearchParams({type:'variation',parent:String(id),per_page:'100',page:String(page),_fields:'id,parent,name,variation,attributes,prices,stock_availability,is_in_stock,images'}),{data,pages}=await request('products?'+params);if(!Array.isArray(data)||data.some(p=>Number(p.parent)!==id))throw new ProductError('variants_invalid_response');rows.push(...data);if(data.length<100||(pages&&page>=pages)){complete=true;break}}
  if(!complete)throw new ProductError('variants_too_large');const variantsAt=Date.now();await put('woo/v1/variants/'+id,{at:variantsAt,variants:rows});return{...record,variants:rows,variantsAt};
 }
 return{metadata,variants};
}
