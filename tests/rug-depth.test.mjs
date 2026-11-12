import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const html=readFileSync('public/planner.html','utf8');const ctx=vm.createContext({});vm.runInContext(readFileSync('public/vendor/three.min.js','utf8'),ctx);
const start=html.indexOf('function rugClearance('),end=html.indexOf('function updSel(',start);
vm.runInContext(`const objs=new Map();let currentProduct;const product=()=>currentProduct;const CM=.01;const ui={sel:null};const S={wallH:260};let wallList=[];const snapWalls=()=>wallList;const sided=(wall,x)=>x<wall.A.x?{...wall,nI:{x:-1,z:0}}:wall;const footOf=(it,p)=>p;const isZenTile=p=>p.zen;const mountOf=(it,p)=>p.mount||'floor';const updateLamp=()=>{};let dirty=false;${html.slice(start,end)}`,ctx);
test('thin rugs get stable clearance on every placement without changing saved coordinates',()=>{vm.runInContext(`currentProduct={name:'Heymat teppe',h:.2,mount:'floor'};const mid=new THREE.Group(),o=new THREE.Group();o.userData.mid=mid;objs.set('rug',o);const it={u:'rug',pid:'rug',x:100,z:120,rot:90};const before=JSON.stringify(it);for(let i=0;i<20;i++)placeObj(it);globalThis.result={height:mid.position.y,unchanged:JSON.stringify(it)===before,x:o.position.x,z:o.position.z};`,ctx);assert.equal(ctx.result.height,.003);assert.equal(ctx.result.unchanged,true);assert.equal(ctx.result.x,1);assert.equal(ctx.result.z,1.2)});
test('clearance excludes furniture and wall textiles, and supports imported and placeholder rugs',()=>{const values=vm.runInContext(`[rugClearance({name:'Ullteppe',h:1,flat:1}),rugClearance({name:'Imported rug',h:.1}),rugClearance({name:'Carpet chair',h:80}),rugClearance({name:'Veggteppe',h:2,mount:'wall'}),rugClearance({name:'Bord',h:2})]`,ctx);assert.deepEqual(Array.from(values),[.003,.003,0,0,0])});

test('Zen cuts stop at both ends of an inner wall and follow the placement side',()=>{
  const result=vm.runInContext(`
    wallList=[{kind:'i',A:{x:200,z:10},L:300,d:{x:0,z:1},nI:{x:1,z:0},so:5}];
    const mask=x=>zenCutMask({x,z:15,rot:0},{w:45,d:45});
    const left=mask(190),right=mask(210);
    const hidden=(cut,x,z)=>zenCutHides(cut,new THREE.Vector3(x,0,z));
    [hidden(left,1.94,.15),hidden(left,2.08,.15),hidden(left,2.08,.05),
     hidden(left,2.08,3.15),hidden(right,2.06,.15),hidden(right,1.92,.15)];
  `,ctx);
  assert.deepEqual(Array.from(result),[false,true,false,false,false,true]);
});
