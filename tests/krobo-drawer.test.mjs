import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync(new URL('../public/planner.html',import.meta.url),'utf8');
test('Krobo Drawer uses a measured drawer and separate metal frame, never the bench CAD files',()=>{
 const c=vm.createContext({console});vm.runInContext(fs.readFileSync(new URL('../public/vendor/three.min.js',import.meta.url),'utf8'),c);const T=c.THREE;
 Object.assign(c,{mat:(color,roughness)=>new T.MeshStandardMaterial({color,roughness}),box:(...dims)=>new T.BoxGeometry(...dims),add:(g,geo,m,x,y,z)=>{const mesh=new T.Mesh(geo,m);mesh.position.set(x,y,z);g.add(mesh);return mesh}});
 vm.runInContext(html.slice(html.indexOf('const kroboDrawerDriveId='),html.indexOf('const dalCabinetSource=')),c);
 c.kroboDrawerFile=vm.runInContext('kroboDrawerFile',c);
 const model=c.kroboDrawerModel(),bounds=new T.Box3().setFromObject(model.obj).getSize(new T.Vector3());
 for(const [actual,expected] of [[bounds.x,.5],[bounds.y,.16],[bounds.z,.35]])assert.ok(Math.abs(actual-expected)<1e-6,`${actual} != ${expected}`);
 const front=model.obj.children.find(mesh=>mesh.name==='Krobo wood');const size=new T.Box3().setFromObject(front).getSize(new T.Vector3());assert.ok(Math.abs(size.x-.49)<1e-6);assert.ok(Math.abs(size.y-.13)<1e-6);
 assert.equal(c.kroboDrawerFile({productId:64484,title:'Krobo 200.dwg.zip'}).title,'Krobo Drawer.glb');
 const bench={productId:64453,title:'Krobo 150.dwg.zip'};assert.equal(c.kroboDrawerFile(bench),bench);
 const source=html.slice(html.indexOf('function driveFileHidden('),html.indexOf('function rejectDriveFile('));vm.runInContext(source,c);
 assert.equal(c.driveFileHidden({productId:64484,id:'1A5mUmNDPwO5z9XAc5c_fLvCj1b51jgG0'}),false);assert.equal(c.driveFileHidden({productId:64484,id:'old-bench-file'}),true);
});
test('Krobo cushion has three padded channels and stitching within its advertised dimensions',()=>{
 const c=vm.createContext({console});vm.runInContext(fs.readFileSync(new URL('../public/vendor/three.min.js',import.meta.url),'utf8'),c);const T=c.THREE;
 Object.assign(c,{mat:(color,roughness)=>new T.MeshStandardMaterial({color,roughness}),col:color=>new T.Color(color),add:(g,geo,m,x,y,z)=>{const mesh=new T.Mesh(geo,m);mesh.position.set(x,y,z);g.add(mesh);return mesh}});
 vm.runInContext(html.slice(html.indexOf('function rr('),html.indexOf('function mat(',html.indexOf('function rr('))),c);
 vm.runInContext(html.slice(html.indexOf('const isKroboBench='),html.indexOf('function kroboAnchor(')),c);
 const model=c.kroboCushionModel(),bounds=new T.Box3().setFromObject(model.obj).getSize(new T.Vector3());
 for(const [actual,expected] of [[bounds.x,.5],[bounds.y,.04],[bounds.z,.35]])assert.ok(Math.abs(actual-expected)<.0001,`${actual} != ${expected}`);
 assert.equal(model.obj.children.filter(m=>m.isMesh).length,4);
 assert.ok(model.obj.children.find(m=>m.name==='Krobo stitching').geometry.getAttribute('position').count>100);
});
