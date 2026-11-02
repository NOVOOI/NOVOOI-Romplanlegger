/* Geometry shared by snapping and measurements. Units: cm. */
(function(root){
 const C=root.NovooiCore;
 C.polygon=o=>{const r=o.rot*Math.PI/180,c=Math.cos(r),s=Math.sin(r);return[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>({x:o.x+c*x*o.w/2+s*z*o.d/2,z:o.z-s*x*o.w/2+c*z*o.d/2}))};
 C.closest=(a,b)=>{let best=null;const ap=C.polygon(a),bp=C.polygon(b);for(const [ps,qs,flip] of [[ap,bp,false],[bp,ap,true]])for(const p of ps)for(let i=0;i<4;i++){const q=qs[i],r=qs[(i+1)%4],dx=r.x-q.x,dz=r.z-q.z,t=Math.max(0,Math.min(1,((p.x-q.x)*dx+(p.z-q.z)*dz)/(dx*dx+dz*dz||1))),v={x:q.x+t*dx,z:q.z+t*dz},gap=Math.hypot(v.x-p.x,v.z-p.z);if(!best||gap<best.gap)best={gap,a:flip?v:p,b:flip?p:v}}return best};
 C.quantize=(value,step)=>step>0?Math.round(value/step)*step:value;
})(globalThis);
(function(root){
 const C=root.NovooiCore;
 C.wallJoinRanges=(w,others)=>{const ranges=[[-w.t/2,[0,w.L]],[w.t/2,[0,w.L]]];for(const [end,u] of [['A',0],['B',w.L]]){const point=w[end],links=others.filter(o=>o.key!==w.key).flatMap(o=>['A','B'].filter(e=>Math.hypot(o[e].x-point.x,o[e].z-point.z)<.2).map(e=>({o,e})));if(links.length!==1)continue;const {o,e}=links[0],va={x:w.d.x*(end==='A'?1:-1),z:w.d.z*(end==='A'?1:-1)},vb={x:o.d.x*(e==='A'?1:-1),z:o.d.z*(e==='A'?1:-1)},den=w.d.x*o.d.z-w.d.z*o.d.x;if(Math.abs(den)<1e-5)continue;for(const [side,range]of ranges){const otherSide=Math.sign(side*(w.nO.x*vb.x+w.nO.z*vb.z))*Math.sign(o.nO.x*va.x+o.nO.z*va.z)*o.t/2;const p={x:point.x+w.nO.x*side,z:point.z+w.nO.z*side},q={x:point.x+o.nO.x*otherSide,z:point.z+o.nO.z*otherSide},delta=((q.x-p.x)*o.d.z-(q.z-p.z)*o.d.x)/den;if(Math.abs(delta)<=Math.max(w.t,o.t)*4)range[end==='A'?0:1]=u+delta}}return{f0:ranges[0][1],f1:ranges[1][1]}};
})(globalThis);
