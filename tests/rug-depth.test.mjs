import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const html=readFileSync('public/planner.html','utf8');const ctx=vm.createContext({});vm.runInContext(readFileSync('public/vendor/three.min.js','utf8'),ctx);
const start=html.indexOf('function rugClearance('),end=html.indexOf('function updSel(',start);
vm.runInContext(`const objs=new Map();let currentProduct;const product=()=>currentProduct;const CM=.01;const ui={sel:null};const S={wallH:260};let wallList=[];const snapWalls=()=>wallList;const sided=(wall,x)=>x<wall.A.x?{...wall,nI:{x:-1,z:0}}:wall;const footOf=(it,p)=>p;const isZenTile=p=>p.zen;const mountOf=(it,p)=>p.mount||'floor';const updateLamp=()=>{};let dirty=false;${html.slice(start,end)}`,ctx);
test('thin rugs get stable clearance on every placement without changing saved coordinates',()=>{vm.runInContext(`currentProduct={name:'Heymat teppe',h:.2,mount:'floor'};const mid=new THREE.Group(),o=new THREE.Group();o.userData.mid=mid;objs.set('rug',o);const it={u:'rug',pid:'rug',x:100,z:120,rot:90};const before=JSON.stringify(it);for(let i=0;i<20;i++)placeObj(it);globalThis.result={height:mid.position.y,unchanged:JSON.stringify(it)===before,x:o.position.x,z:o.position.z};`,ctx);assert.equal(ctx.result.height,.003);assert.equal(ctx.result.unchanged,true);assert.equal(ctx.result.x,1);assert.equal(ctx.result.z,1.2)});
test('clearance excludes furniture and wall textiles, and supports imported and placeholder rugs',()=>{const values=vm.runInContext(`[rugClearance({name:'Ullteppe',h:1,flat:1}),rugClearance({name:'Imported rug',h:.1}),rugClearance({name:'Carpet chair',h:80}),rugClearance({name:'Veggteppe',h:2,mount:'wall'}),rugClearance({name:'Bord',h:2})]`,ctx);assert.deepEqual(Array.from(values),[.003,.003,0,0,0])});

test('a wall trims a Zen tile at the near face on either side',()=>{
  const result=vm.runInContext(`
    wallList=[{A:{x:200,z:10},L:300,d:{x:0,z:1},nI:{x:1,z:0},so:5}];
    const cut=(x,z)=>zenWallPlanes({x,z,rot:0},{w:45,d:45});
    const left=cut(190,100)[0],right=cut(210,100)[0];
    [left.distanceToPoint(new THREE.Vector3(1.95,0,1)),
     left.distanceToPoint(new THREE.Vector3(2.08,0,1)),
     right.distanceToPoint(new THREE.Vector3(2.05,0,1)),
     right.distanceToPoint(new THREE.Vector3(1.92,0,1)),
     cut(190,350).length];
  `,ctx);
  assert.ok(Math.abs(result[0])<1e-8);
  assert.ok(result[1]<0);
  assert.ok(Math.abs(result[2])<1e-8);
  assert.ok(result[3]<0);
  assert.equal(result[4],0);
});
