import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../public/planner.html',import.meta.url),'utf8');
function setup(){
 const c=vm.createContext({console,CM:.01});
 vm.runInContext(fs.readFileSync(new URL('../public/vendor/three.min.js',import.meta.url),'utf8'),c);
 vm.runInContext(html.slice(html.indexOf('function fjordfiestaZone('),html.indexOf('const fjordfiestaModelSections=')),c);
 return c;
}
test('all Krobo variants change geometry bounds without changing slab thickness or source geometry',()=>{
 const c=setup(),T=c.THREE,p={rec:{productId:64453},w:150,d:37,h:34};
 const source=new T.Group(),material=new T.MeshStandardMaterial();
 const slab=new T.Mesh(new T.BoxGeometry(1.5,.04,.37),material);slab.position.y=.32;source.add(slab);
 for(const x of [-.55,.55]){const leg=new T.Mesh(new T.BoxGeometry(.025,.30,.30),material);leg.position.set(x,.15,0);source.add(leg)}
 for(const w of [120,150,200])for(const h of [34,44]){
  const group=source.clone(true);c.applyKroboDimensions(group,p,{Lengde:w+' cm',Høyde:h+' cm'});
  const size=new T.Box3().setFromObject(group).getSize(new T.Vector3());
  assert.ok(Math.abs(size.x-w/100)<1e-6);assert.ok(Math.abs(size.y-h/100)<1e-6);assert.ok(Math.abs(size.z-.37)<1e-6);
  const slabSize=new T.Box3().setFromObject(group.children[0]).getSize(new T.Vector3());assert.ok(Math.abs(slabSize.y-.04)<1e-6);
 }
 assert.ok(Math.abs(new T.Box3().setFromObject(source).getSize(new T.Vector3()).x-1.5)<1e-6);
 assert.equal(c.kroboDimensions({rec:{productId:723}},{}),null);
 assert.equal(c.kroboDimensions(p,{Lengde:'999 cm'}).w,150);
});
