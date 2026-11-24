import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync(new URL('../public/planner.html',import.meta.url),'utf8');
function setup(){const c=vm.createContext({console});vm.runInContext(fs.readFileSync(new URL('../public/vendor/three.min.js',import.meta.url),'utf8'),c);vm.runInContext(html.slice(html.indexOf('function isInland('),html.indexOf('function buildProduct(')),c);return c}
test('Inland keeps separate named metal legs, and splits merged meshes by their lower geometry',()=>{
 const c=setup(),T=c.THREE,group=new T.Group();
 const body=new T.BoxGeometry(1.8,.5,.9).translate(0,.45,0).toNonIndexed(),leg=new T.BoxGeometry(.06,.2,.7).translate(.65,.1,0).toNonIndexed();
 const merged=new T.BufferGeometry(),values=new Float32Array(body.getAttribute('position').array.length+leg.getAttribute('position').array.length);values.set(body.getAttribute('position').array);values.set(leg.getAttribute('position').array,body.getAttribute('position').array.length);merged.setAttribute('position',new T.BufferAttribute(values,3));
 const fabric=new T.MeshStandardMaterial(),steel=new T.MeshStandardMaterial();fabric.name='_tradition_Hallingdal_130';steel.name='_tradition_Steel';group.add(new T.Mesh(merged,[fabric,steel]));
 const named=new T.Mesh(new T.BoxGeometry(.06,.2,.7),new T.MeshStandardMaterial());named.name='AV41_Leather_Legs';group.add(named);
 c.inlandParts(group);assert.equal(named.userData.inlandPart,'metal');
 assert.equal(group.children.filter(m=>m.userData.inlandPart==='metal').length,2);assert.equal(group.children.filter(m=>m.userData.inlandPart==='body').length,1);assert.equal(merged.index,null);
});
test('all six upholstery variants have different named recipes and Hallingdal uses the supplier texture',()=>{
 const c=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../public/surface-library.js',import.meta.url),'utf8'),c);const lib=c.NovooiSurfaceLibrary;
 const names=['Clay 0011','Clay 0014','Hallingdal 130','Vidar 733','Noble Black Leather','Noble Cognac Leather'];const recipes=names.map(n=>lib.recipe('Trekk',n));assert.equal(new Set(recipes.map(r=>r.base)).size,6);assert.equal(new Set(recipes.map(r=>r.color)).size,6);assert.equal(recipes[2].texture,'inland-hallingdal-130.jpg');assert.equal(recipes[4].group,'Skinn');assert.equal(recipes[0].group,'Tekstil');
});
test('2D forces studio and ignores dark 3D adjustments without replacing the saved 3D settings',()=>{
 const button={innerHTML:'',textContent:'',title:'',setAttribute(){}};const c=vm.createContext({ui:{mode:'3d'},S:{lighting:'evening',lightSettings:{exposure:30,daylight:0}},sky:{},amb:{},sun:{},fillLight:{},renderer:{},scene:{},$:()=>button,workspaceIcon:x=>x,applyEnvironmentLighting(){},dirty:false});
 vm.runInContext(html.slice(html.indexOf('function lightingForView('),html.indexOf('function applyEnvironmentLighting(')),c);
 const a=html.indexOf('let lightingMode=S.lighting');vm.runInContext(html.slice(a,html.indexOf('function setupPolish(',a)),c);c.lightSetting=(name,fallback)=>c.S.lightSettings?.[name]??fallback;
 const b=html.indexOf('const baseApplyLighting=');vm.runInContext(html.slice(b,html.indexOf('/* World-space metre grid.',b)),c);
 c.applyLighting('evening');const dark=c.renderer.toneMappingExposure;assert.ok(dark<.3);
 c.ui.mode='2d';c.applyLighting('evening');assert.equal(c.renderer.toneMappingExposure,.95);assert.equal(c.sky.intensity,.65);assert.equal(c.S.lighting,'evening');assert.equal(button.title,'Studio');
 c.ui.mode='3d';c.applyLighting(c.S.lighting);assert.equal(c.renderer.toneMappingExposure,dark);assert.equal(c.sky.intensity,0);
});
