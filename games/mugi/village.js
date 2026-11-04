'use strict';
// Save files retain plot-local positions. Roads and all five plots share a single world.
const plots=[[0,0],[11,0],[11,-15],[-16,-15],[-3,-15]];
const wx=()=>plots[s.scene][0]+s.x, wz=()=>plots[s.scene][1]+s.z;
const blocks=[], stops=[];
function walk(dx,dz){
  let x=wx(),z=wz();
  const clear=(a,b)=>Math.abs(a)<24&&b>-23&&b<10&&!blocks.some(o=>Math.abs(a-o.x)<o.w/2+.22&&Math.abs(b-o.z)<o.d/2+.22);
  if(clear(x+dx,z))x+=dx;
  if(clear(x,z+dz))z+=dz;
  let best=0;
  plots.forEach(([a,b],i)=>{if(Math.hypot(a-x,b-z)<Math.hypot(plots[best][0]-x,plots[best][1]-z))best=i});
  s.scene=best;s.x=x-plots[best][0];s.z=z-plots[best][1];
}
function areaName(){return Math.abs(s.x)<5&&Math.abs(s.z)<4.5?sites[s.scene]:'村の農道'}
function nearest(){return stops.filter(p=>!p.active||p.active()).map(p=>[p,Math.hypot(p.x-wx(),p.z-wz())]).filter(a=>a[1]<2.5).sort((a,b)=>a[1]-b[1])[0]?.[0]}
function interact(){if(!dlg.open)nearest()?.act()}
$('interact').onclick=interact;
function book(){
  if(s.job)return job();
  panel('丘の地図と手帳','● 現在地　'+areaName()+'　／　麦束 '+s.bales+'　種 '+s.seeds+'粒\n地図の上が北。農道を歩き、看板に近づいて「調べる」を押そう。',[
    ['倉庫・設備設置・配達',inventory],['ひと休み（1時間）',()=>{advance(60);s.tired=Math.max(0,s.tired-5);dlg.close()}],...s.cards.slice(-3).map(c=>[c.year+'年目の絵葉書',()=>card(c)])]);
  let m=document.createElement('canvas');m.width=660;m.height=390;m.style='width:100%;height:auto;border-radius:10px';$('extra').append(m);
  let g=m.getContext('2d'),X=x=>330+x*13,Y=z=>276+z*11;
  g.fillStyle='#b5c894';g.fillRect(0,0,660,390);g.strokeStyle='#edcf9d';g.lineWidth=16;
  for(const z of [-9,5]){g.beginPath();g.moveTo(20,Y(z));g.lineTo(640,Y(z));g.stroke()}
  g.beginPath();g.moveTo(X(-7),30);g.lineTo(X(-7),350);g.stroke();g.textAlign='center';g.font='bold 16px sans-serif';
  for(const [i,[x,z]] of plots.entries()){g.fillStyle=s.fields[i]?'#ac8157':'#a8ad79';g.fillRect(X(x)-37,Y(z)-26,74,52);g.fillStyle='#293f32';g.fillText(sites[i],X(x),Y(z)+5)}
  for(const p of stops.filter(p=>p.icon)){g.fillStyle='#324d43';g.fillText(p.icon,X(p.x),Y(p.z))}
  g.fillStyle='#c14e35';g.beginPath();g.arc(X(wx()),Y(wz()),7,0,7);g.fill();g.strokeStyle='white';g.lineWidth=2;g.stroke()
}
const T=THREE; let cv=$('world');let renderer;
try{renderer=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6))}catch{renderer=null}
const world=new T.Scene(),cam=new T.OrthographicCamera(-8,8,8,-8,.1,140);
world.background=new T.Color(0xc2ded9);world.fog=new T.FogExp2(0xc2ded9,.012);
const sky=new T.HemisphereLight(0xfff4dc,0x9fa482,1.95),sun=new T.DirectionalLight(0xffe3a9,2.1);
sun.position.set(-12,23,11);world.add(sky,sun);
const box=new T.BoxGeometry(1,1,1),ball=new T.SphereGeometry(1,10,8),cone=new T.ConeGeometry(1,1,4),tube=new T.CylinderGeometry(1,1,1,12);
const mats=new Map();
function part(parent,geo,col,x,y,z,w,h,d){
  if(!mats.has(col))mats.set(col,new T.MeshStandardMaterial({color:col,flatShading:true}));
  let m=new T.Mesh(geo,mats.get(col));m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m
}
function land(x,z,w,d,c,h=.05){return part(world,box,c,x,h/2-.04,z,w,h,d)}
land(0,-5,130,100,0x9ab778);land(0,-9,49,2.3,0xd9bd8d);land(0,5,49,2.2,0xd9bd8d);land(-7,-6,2,34,0xd9bd8d);land(6,-6,1.7,26,0xd9bd8d);
function label(text,x,y,z){let c=document.createElement('canvas');c.width=384;c.height=80;let g=c.getContext('2d');g.fillStyle='#fff3d7';g.fillRect(0,0,384,80);g.strokeStyle='#a48b61';g.lineWidth=7;g.strokeRect(3,3,378,74);g.fillStyle='#395043';g.font='bold 43px serif';g.textAlign='center';g.fillText(text,192,55,362);let tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;let spr=new T.Sprite(new T.SpriteMaterial({map:tex}));spr.position.set(x,y,z);spr.scale.set(3.3,.69,1);world.add(spr)}
function house(x,z,name,col){blocks.push({x,z,w:3.4,d:2.7});part(world,box,0xf1d9a9,x,1,z,3.4,2,2.7);let roof=part(world,cone,col,x,2.72,z,3.05,1.7,2.48);roof.rotation.y=Math.PI/4;part(world,box,0x795a42,x,.67,z+1.37,.77,1.35,.12);for(let side of [-1,1])part(world,box,0x71999a,x+side*1.03,1.15,z+1.38,.57,.64,.1);label(name,x,3.95,z)}
function stop(x,z,title,act,icon,active){stops.push({x,z,title,act,icon,active})}
house(-4,-3,'わが家',0xb36a53);stop(-4,-1,'家に入る',()=>panel('わが家','明日に備えてゆっくり過ごそう。',[['朝まで眠る',rest],...(s.time>=1080?[['夜の通販',()=>shop(true)]]:[]),...(localDay()===24&&!s.cards.some(c=>c.year===year())?[['収穫祭へ',festival]]:[])]),'家');
house(-14,0,'農具店',0x638987);stop(-14,2,'農具店へ',()=>shop(false),'農具店');
house(-20,0,'掃除の仕事',0xb38850);stop(-20,2,'バイト受付',job,'バイト');
part(world,box,0xb38048,3,.53,3.6,1.2,.98,.85);label('出荷箱',3,1.85,3.6);
stop(3,3.6,'麦を出荷',()=>{let total=s.bales*20;s.money+=total;s.bales=0;save();panel('出荷箱',total?'売上 ＋'+total+'枚':'刈った麦をここに運びましょう。')},'出荷');
for(const [i,[x,z]] of plots.entries()){
  if(i>=3){house(x,z-5,i===3?'ハナの家':'ゲンの家',i===3?0xb87862:0x819e79);stop(x,z-3.45,'農家と話す',()=>visit(i))}
  if(i===1||i===2){label('開拓地',x+3,1.3,z+3);stop(x+3,z+3,'開拓を相談',()=>visit(i),null,()=>!s.fields[i])}
}
function farmer(x,z,shirt){let p=new T.Group();world.add(p);p.position.set(x,0,z);part(p,ball,shirt,0,.71,0,.31,.4,.23);part(p,ball,0xe6ae81,0,1.22,0,.245,.27,.24);part(p,tube,0xd5ac69,0,1.44,0,.43,.075,.43);part(p,ball,0xd1a45c,0,1.52,0,.265,.2,.26);for(let i of [-1,1]){part(p,box,0x665941,.135*i,.24,0,.2,.45,.22);part(p,ball,0x513f34,.135*i,.10,.08,.13,.1,.18);part(p,ball,0x4c4032,.09*i,1.23,.216,.03,.033,.02)}return p}
const hero=farmer(0,0,0x538982);farmer(-16,-18.5,0x997caa);farmer(-3,-18.5,0xb17d4b);
const hand=new T.Group();hero.add(hand);hand.position.set(.27,.85,.1);
part(hand,tube,0x976a3e,0,0,.29,.045,.70,.045).rotation.x=Math.PI/2;
const hoop=part(hand,new T.TorusGeometry(.26,.027,6,18),0xf7e3b5,0,.10,.74,1,1,1);
const blade=part(hand,ball,0xb9c9bf,0,.07,.71,.08,.06,.27);
for(let i=0;i<85;i++){let x=Math.sin(i*391.7)*31,z=-6+Math.cos(i*49.7)*23;if(Math.abs(x)<23&&z>-23&&z<9)continue;part(world,tube,0x856c48,x,.8,z,.19,1.6,.2);part(world,ball,i%2?0x81a368:0x6e986d,x,2.1,z,1.1,1.6,1.1)}
for(let i=0;i<12;i++)part(world,ball,0x9fb99a,-55+i*10,-1,-38-i%3*4,12,5+i%4,8);
// Static scenery shares geometry and materials, so draw it in batches on phones.
function batchScenery(){
  const batches=new Map();
  for(const mesh of world.children.slice()){
    if(!mesh.isMesh||mesh.isInstancedMesh)continue;
    const key=mesh.geometry.uuid+mesh.material.uuid;
    if(!batches.has(key))batches.set(key,[]);
    batches.get(key).push(mesh);
  }
  for(const items of batches.values()){
    if(items.length<2)continue;
    const first=items[0],group=new T.InstancedMesh(first.geometry,first.material,items.length);
    items.forEach((mesh,i)=>{mesh.updateMatrix();group.setMatrixAt(i,mesh.matrix);world.remove(mesh)});
    world.add(group);
  }
}
batchScenery();
for(let i=3;i<=4;i++)if(!s.fields[i].some(c=>c.day)&&!s.started)s.fields[i].forEach(c=>c.day=-9);
const rows=[],plants=[],equipment=new Map(),insects=new Map();
const wheatGeo=new T.ConeGeometry(.12,.8,5), stemGeo=new T.CylinderGeometry(.015,.023,.70,4);
function newField(i){let [x,z]=plots[i];rows[i]=[];plants[i]=[];let cells=s.fields[i];if(!cells)return;
 for(const a of new Set(cells.map(c=>c.x)))rows[i].push(land(x+a,z,1.22,6.3,0xa48259,.16));
 let count=cells.length*5;for(const geo of [stemGeo,wheatGeo]){let m=new T.InstancedMesh(geo,new T.MeshStandardMaterial({color:0xffffff,flatShading:true}),count);m.frustumCulled=false;world.add(m);plants[i].push(m)}
}
const dummy=new T.Object3D(),color=new T.Color();let oldPlants='';
function updatePlants(){let sig=s.day+'|'+s.fields.map(f=>f?.map(c=>c.day).join(',')).join('|');if(sig===oldPlants)return;oldPlants=sig;
 for(let i=0;i<plots.length;i++){if(!s.fields[i])continue;if(!plants[i])newField(i);let [x,z]=plots[i],idx=0;for(let c of s.fields[i]){if(!c.day)continue;let age=Math.min(5,s.day-c.day),size=.3+age*.14;for(let j=0;j<5;j++,idx++){let a=j*2.4,px=x+c.x+.24*Math.cos(a),pz=z+c.z+.22*Math.sin(a);plants[i].forEach((m,n)=>{dummy.position.set(px,n?.76*size+.08:.35*size+.08,pz);dummy.scale.set(size,size*(n?.68:1),size);dummy.rotation.set(.06*Math.cos(a),a,.08*Math.sin(a));dummy.updateMatrix();m.setMatrixAt(idx,dummy.matrix);m.setColorAt(idx,color.setHex(age>=5?(n?0xedc15e:0xab8c48):(n?0x9ab85e:0x75974c)))})}}for(let m of plants[i]){m.count=idx;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true}}}
function updateObjects(){
 for(let [e,m] of equipment)if(!s.structures.includes(e)){world.remove(m);equipment.delete(e)}
 for(let e of s.structures){let m=equipment.get(e);if(!m){m=new T.Group();world.add(m);equipment.set(e,m);m.position.set(plots[e.place][0]+e.x,0,plots[e.place][1]+e.z);if(e.n==='塀'){for(let x of [-.68,.68])part(m,box,0x956d43,x,.4,0,.12,.8,.15);part(m,box,0xc39865,0,.51,0,1.65,.22,.14)}else{part(m,tube,0xae8554,0,.8,0,.34,1.6,.34);let fan=new T.Group();m.add(fan);fan.position.set(0,1.45,.32);for(let i=0;i<2;i++)part(fan,box,0xffedc7,0,0,0,.15,1.64,.06).rotation.z=i*Math.PI/2;m.userData.fan=fan}}if(m.userData.fan)m.userData.fan.rotation.z=tick}
 for(let [b,m] of insects)if(!s.bugs.includes(b)){world.remove(m);insects.delete(b)}
 for(let b of s.bugs){let m=insects.get(b);if(!m){m=new T.Group();world.add(m);insects.set(b,m);part(m,ball,b.big?0x945939:0x4b6d3a,0,0,0,.23,.13,.38);for(let side of [-1,1])part(m,ball,0xabbe70,side*.15,.08,0,.13,.055,.28);m.scale.setScalar(b.big?1.75:1)}m.position.set(plots[b.place][0]+b.x,.62+.17*Math.sin(tick*9+b.x),plots[b.place][1]+b.z)}
}
function render3D(){
 let w=cv.clientWidth,h=cv.clientHeight,r=w/h;let span=Math.max(6.1/r,7.4);
 if(cv.width!==Math.floor(w*renderer.getPixelRatio())||cv.height!==Math.floor(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);
 cam.left=-span*r;cam.right=span*r;cam.top=span;cam.bottom=-span;cam.updateProjectionMatrix();
 let x=wx(),z=wz();cam.position.set(x,18,z+13);cam.lookAt(x,0,z-1.1);hero.position.set(x,0,z);hero.rotation.y=s.dir;
 hoop.visible=s.tool==='網';blade.visible=!hoop.visible;hand.rotation.y=slash>0?Math.sin(slash/.28*Math.PI)*1.7:0;
 sun.intensity=s.time>=1080?.65:2.1;sky.intensity=s.time>=1080?1.15:1.95;updatePlants();updateObjects();renderer.render(world,cam);
 let p=nearest();$('interact').hidden=!p;if(p)$('interact').textContent=p.title+'　(E)'
}



