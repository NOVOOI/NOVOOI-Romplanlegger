import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync(new URL('../public/planner.html',import.meta.url),'utf8');
function context(){
 const products=new Map([['bench',{w:150,d:37,h:34,rec:{productId:64453}}],['drawer',{w:50,d:35,h:16,rec:{productId:64484}}],['cushion',{w:50,d:35,h:4,rec:{productId:64483}}]]);
 const bench={u:'bench-1',pid:'bench',x:100,z:120,rot:0,sel:{Lengde:'150 cm',Høyde:'34 cm'}};
 const c=vm.createContext({console,S:{items:[bench]},product:id=>products.get(id),floorObjectElevation:it=>it.surfaceY||0});
 vm.runInContext(html.slice(html.indexOf('const isKroboBench='),html.indexOf('const kroboAccessoryLoads=')),c);
 const a=html.indexOf('function kroboDimensions(');vm.runInContext(html.slice(a,html.indexOf('function applyKroboDimensions(',a)),c);
 return {c,bench,products};
}
test('automatic placement finds free positions while dragging remains continuous',()=>{
 const {c,bench}=context();
 for(let n=0;n<3;n++){const item={u:'a'+n,pid:n===0?'drawer':'cushion'};const snap=c.snapKroboAccessory(item,bench.x+[0,-50,50][n],bench.z);assert.ok(snap);assert.equal(snap.kroboBench,bench.u);assert.equal(snap.rot,0);assert.ok(Math.abs(snap.surfaceY-33.4)<.001);Object.assign(item,snap);c.S.items.push(item)}
 assert.equal(new Set(c.S.items.slice(1).map(i=>i.kroboOffset)).size,3);
 assert.equal(c.kroboSlots(bench,{u:'full',pid:'drawer'}).length,0);
 const free=c.snapKroboAccessory(c.S.items[1],bench.x+17.3,bench.z+.7);assert.ok(Math.abs(free.kroboOffset-17.3)<.001);assert.ok(Math.abs(free.kroboDepth-.7)<.001);
});
test('Krobo attachments follow a rotated, moved, taller bench and survive a JSON save',()=>{
 const {c,bench}=context(),item={u:'accessory',pid:'cushion',...c.kroboAnchor(bench,50)};c.S.items.push(item);
 bench.x=210;bench.z=300;bench.rot=90;bench.sel.Høyde='44 cm';c.syncKroboAccessories();
 assert.ok(Math.abs(item.x-210)<.001);assert.ok(Math.abs(item.z-250)<.001);assert.equal(item.rot,90);assert.ok(Math.abs(item.surfaceY-43.4)<.001);
 c.S.items=JSON.parse(JSON.stringify(c.S.items));c.syncKroboAccessories();assert.equal(c.S.items[1].kroboBench,'bench-1');
 c.S.items.splice(0,1);c.syncKroboAccessories();assert.equal(c.S.items[0].kroboBench,undefined);assert.equal(c.S.items[0].surfaceY,0);
});
test('accessory snapping ignores distant, unrelated and hidden furniture and accepts the occupied item itself',()=>{
 const {c,bench}=context(),item={u:'a',pid:'drawer',...c.kroboAnchor(bench,0)};c.S.items.push(item);
 assert.equal(c.snapKroboAccessory(item,1000,1000),null);assert.equal(c.snapKroboAccessory({u:'b',pid:'bench'},100,120),null);
 assert.equal(c.snapKroboAccessory(item,100,120).kroboOffset,0);bench.hidden=true;assert.equal(c.snapKroboAccessory(item,100,120),null);
});
test('resizing preserves freely chosen positions and clamps only to the bench edge',()=>{
 const {c,bench}=context();bench.sel.Lengde='200 cm';
 c.S.items.push({u:'a',pid:'drawer',...c.kroboAnchor(bench,25)},{u:'b',pid:'cushion',...c.kroboAnchor(bench,75)});
 bench.sel.Lengde='120 cm';c.syncKroboAccessories();assert.deepEqual(c.S.items.slice(1).map(i=>i.kroboOffset),[25,35]);
});
test('add accessory action attaches to a free position, preserves default finish and respects read-only mode',async()=>{
 const {c,bench}=context();let opened=0;const messages=[];
 Object.assign(c,{READ_ONLY:false,presentation:false,ensureKroboAccessory:async kind=>({id:kind==='cushion'?'cushion':'drawer'}),openProd:()=>opened++,toast:m=>messages.push(m),addItem:(pid,x,z,options)=>{const item={u:'added-'+c.S.items.length,pid,x,z,...options};c.S.items.push(item);return item}});
 const start=html.indexOf('async function addKroboAccessory(');vm.runInContext(html.slice(start,html.indexOf("const dalCabinetSource=",start)),c);
 await c.addKroboAccessory(bench,'drawer');await c.addKroboAccessory(bench,'cushion');await c.addKroboAccessory(bench,'cushion');await c.addKroboAccessory(bench,'cushion');
 assert.equal(c.S.items.length,4);assert.equal(opened,3);assert.equal(c.S.items[1].kroboBench,bench.u);assert.equal(c.S.items[2].sel.Materiale,'Sort Lær');assert.match(messages[0],/ikke flere ledige/);
 c.READ_ONLY=true;await c.addKroboAccessory(bench,'drawer');assert.equal(c.S.items.length,4);
});
test('Norwegian leather terms use leather materials rather than flat paint',()=>{
 const c=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../public/surface-library.js',import.meta.url),'utf8'),c);
 assert.equal(c.NovooiSurfaceLibrary.recipe('Materiale','Lys Brun Lær').base,'leather-natural');
 assert.equal(c.NovooiSurfaceLibrary.recipe('Materiale','Sort Lær').base,'leather-black');
});
test('startup preserves the attachment while custom bench metadata is still loading',()=>{
 const {c,bench,products}=context(),item={u:'saved',pid:'cushion',...c.kroboAnchor(bench,0)};c.S.items.push(item);const saved=products.get('bench');products.delete('bench');
 c.syncKroboAccessories();assert.equal(item.kroboBench,bench.u);assert.ok(item.surfaceY>0);
 products.set('bench',saved);bench.sel.Høyde='44 cm';c.syncKroboAccessories();assert.ok(Math.abs(item.surfaceY-43.4)<.001);
});
test('Krobo edges snap together only when furniture snapping is enabled',()=>{
 const {c,bench}=context();c.snapPrefs={objects:false};
 c.S.items.push({u:'neighbor',pid:'cushion',...c.kroboAnchor(bench,0)});
 const moving={u:'moving',pid:'drawer'};
 assert.equal(c.snapKroboAccessory(moving,148,120).kroboOffset,48);
 c.snapPrefs.objects=true;
 assert.equal(c.snapKroboAccessory(moving,148,120).kroboOffset,50);
 assert.equal(c.snapKroboAccessory(moving,140,120).kroboOffset,40);
});
