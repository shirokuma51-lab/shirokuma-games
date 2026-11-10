'use strict';
// Save files retain plot-local positions. Roads and all five plots share a single world.
const plots=[[0,0],[11,0],[11,-15],[-16,-15],[-3,-15]];
const wx=()=>plots[s.scene][0]+s.x, wz=()=>plots[s.scene][1]+s.z;
const blocks=[], stops=[];

function setPosition(x,z){
  let best=0;
  plots.forEach(([a,b],i)=>{
    if(Math.hypot(a-x,b-z)<Math.hypot(plots[best][0]-x,plots[best][1]-z))best=i;
  });
  s.scene=best;
  s.x=x-plots[best][0];
  s.z=z-plots[best][1];
}
function blockedAt(x,z){
  return blocks.some(o=>Math.abs(x-o.x)<o.w/2+.25&&Math.abs(z-o.z)<o.d/2+.25);
}
function restoreWalkablePosition(){
  if(!plots[s.scene]||!Number.isFinite(s.x)||!Number.isFinite(s.z)){
    setPosition(-4,1.5);
    return;
  }
  let x=Math.max(-23.7,Math.min(23.7,wx()));
  let z=Math.max(-22.7,Math.min(9.7,wz()));
  for(const building of blocks){
    if(Math.abs(x-building.x)<building.w/2+.25&&Math.abs(z-building.z)<building.d/2+.25){
      x=building.x;
      z=building.z+building.d/2+.65;
    }
  }
  setPosition(x,z);
}
function walk(dx,dz){
  restoreWalkablePosition();
  const startX=wx(),startZ=wz();
  let x=startX,z=startZ;
  const clear=(a,b)=>Math.abs(a)<24&&b>-23&&b<10&&!blockedAt(a,b);
  if(clear(x+dx,z))x+=dx;
  if(clear(x,z+dz))z+=dz;
  setPosition(x,z);
  const distance=Math.hypot(x-startX,z-startZ);
  if(distance<.0001&&(Math.abs(x+dx)>=24||z+dz<=-23||z+dz>=10)&&performance.now()>until){
    notify('この先は深い森。木々が密集して進めません。');
  }
  isWalking=distance>.0001;
  walkDistance+=distance;
  return distance;
}
function areaName(){return Math.abs(s.x)<5&&Math.abs(s.z)<4.5?sites[s.scene]:'村の農道'}
function nearest(){return stops.filter(p=>!p.active||p.active()).map(p=>[p,Math.hypot(p.x-wx(),p.z-wz())]).filter(a=>a[1]<2.5).sort((a,b)=>a[1]-b[1])[0]?.[0]}
function interact(){if(!dlg.open)nearest()?.act()}
$('interact').onclick=interact;
function book(){
  if(s.job)return job();
  panel('丘の地図と手帳','● 現在地　'+areaName()+'　／　麦束 '+s.bales+'　種 '+s.seeds+'粒\n地図の上が北。農道を歩き、看板に近づいて「調べる」を押そう。',[
    ['倉庫・設備設置・配達',inventory],['家の前の道へ戻る',()=>{setPosition(-4,1.5);dlg.close();save()}],['ひと休み（1時間）',()=>{advance(60);s.tired=Math.max(0,s.tired-5);dlg.close()}],...s.cards.slice(-3).map(c=>[c.year+'年目の絵葉書',()=>card(c)])]);
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
try{renderer=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2))}catch{renderer=null}
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
function land(x,z,w,d,c,h=.05){
 const meadow=w===130,ridge=h>.1;
 let tex=meadow?artMaps.meadow:new T.CanvasTexture(soils[ridge?1:0]);tex.colorSpace=T.SRGBColorSpace;
 tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(w/(meadow?7:2.2),d/(meadow?7:2.2));
 const m=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:tex}));
 m.rotation.x=-Math.PI/2;m.position.set(x,meadow?-.05:ridge?.045:(w>d?.018:.015),z);world.add(m);return m
}
land(0,-5,130,100,0x9ab778);land(0,-9,49,2.3,0xd9bd8d);land(0,5,49,2.2,0xd9bd8d);land(-7,-6,2,34,0xd9bd8d);land(6,-6,1.7,26,0xd9bd8d);
function label(text,x,y,z){let c=document.createElement('canvas');c.width=384;c.height=80;let g=c.getContext('2d');g.fillStyle='#fff3d7';g.fillRect(0,0,384,80);g.strokeStyle='#a48b61';g.lineWidth=7;g.strokeRect(3,3,378,74);g.fillStyle='#395043';g.font='bold 64px serif';g.textAlign='center';g.fillText(text,192,64,362);let tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;let spr=new T.Sprite(new T.SpriteMaterial({map:tex}));spr.position.set(x,y,z);spr.scale.set(3.3,.69,1);world.add(spr);return spr}
function house(x,z,name,art='house',height=4.6){
   blocks.push({x,z,w:3.4,d:2.7,art,height});
   illustration(art,4.9,height,x,.04,z+1.35,world);
   label(name,x,height+.1,z);
 }
function stop(x,z,title,act,icon,active){stops.push({x,z,title,act,icon,active})}
house(-4,-3,'わが家','house');stop(-4,-1,'家に入る',()=>panel('わが家','明日に備えてゆっくり過ごそう。',[['朝まで眠る',rest],...(s.time>=1080?[['夜の通販',()=>shop(true)]]:[]),...(localDay()===24&&!s.cards.some(c=>c.year===year())?[['収穫祭へ',festival]]:[])]),'家');
house(-14,0,'農具店','shop',4);stop(-14,2,'農具店へ',()=>shop(false),'農具店');
house(-20,0,'掃除の仕事','guesthouse',5.1);stop(-20,2,'バイト受付',job,'バイト');
illustration('crate',1.5,1.4,3,0,3.6,world);for(const [x,z] of blossoms)illustration('flowers',.55,.48,x,.04,z,world);label('出荷箱',3,1.85,3.6);
stop(3,3.6,'麦を出荷',()=>{let total=s.bales*20+(s.qualityBonus||0);s.qualityBonus=0;s.money+=total;s.bales=0;save();panel('出荷箱',total?'売上 ＋'+total+'枚':'刈った麦をここに運びましょう。')},'出荷');
for(const [i,[x,z]] of plots.entries()){
  if(i>=3){house(x,z-5,i===3?'ハナの家':'ゲンの家',i===3?'hana-house':'gen-house',i===3?3.8:4.7);stop(x,z+3.5,'農家と話す',()=>visit(i))}
  if(i===1||i===2){label('開拓地',x+3,1.3,z+3);stop(x+3,z+3,'開拓を相談',()=>visit(i),null,()=>!s.fields[i])}
}
function farmer(x,z,shirt){const p=new T.Group();world.add(p);p.position.set(x,0,z);p.userData.portrait=illustration('front',.95,2,x*0,0,0,p);return p}
for(const tree of forest)illustration(tree.art,tree.width,tree.height,tree.x,0,tree.z,world);
const hero=farmer(0,0,0x538982);
hero.userData.portrait.material.depthTest=false;
hero.userData.portrait.material.depthWrite=false;
hero.userData.portrait.renderOrder=20;
const villagerLabels=[];
for(const v of villagers){
 const person=farmer(v.x,v.z,0x997caa);
 person.userData.portrait.material.map=artMaps[v.art];
 person.userData.portrait.scale.set(v.width,v.height,1);
 person.userData.portrait.material.depthTest=false;
 person.userData.portrait.renderOrder=15;
 const tag=label(v.name,v.x,4,v.z);tag.material.depthTest=false;tag.material.depthWrite=false;tag.renderOrder=25;tag.center.set(.5,0);tag.scale.set(1.3,.48,1);villagerLabels.push({tag,v});
}

restoreWalkablePosition();
const hand=new T.Group();hero.add(hand);hand.position.set(.27,.85,.1);
part(hand,tube,0x976a3e,0,0,.29,.045,.70,.045).rotation.x=Math.PI/2;
const hoop=part(hand,new T.TorusGeometry(.26,.027,6,18),0xf7e3b5,0,.10,.74,1,1,1);
const blade=part(hand,ball,0xb9c9bf,0,.07,.71,.08,.06,.27);
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
let oldPlants='';
function updatePlants(){
 const sig=s.day+'|'+s.fields.map(f=>f?.map(c=>c.day).join(',')).join('|');
 if(sig===oldPlants)return;oldPlants=sig;
 s.fields.forEach((cells,i)=>{
   if(!cells)return;const [x,z]=plots[i];
   if(!plants[i]){
     for(const row of new Set(cells.map(c=>c.x)))land(x+row,z,1.22,6.3,0xa48259,.16);
     plants[i]=cells.map(c=>illustration('sprout',1,1,x+c.x,.06,z+c.z,world));
   }
   cells.forEach((c,j)=>{const p=plants[i][j],age=Math.min(5,s.day-c.day);
     p.visible=!!c.day;p.material.map=artMaps[age===5?'wheat':'sprout'];
     const h=.37+age*.16;p.scale.set(h*1.12,h,1)
   })
 });
}
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
 let x=wx(),z=wz();cam.position.set(x,18,z+13);cam.lookAt(x,0,z-1.1);
 const screenUp=new T.Vector3(0,1,0).applyQuaternion(cam.quaternion);
 for(const {tag,v} of villagerLabels)tag.position.set(v.x,0,v.z).addScaledVector(screenUp,v.height+.4);
hero.position.set(x,0,z);hero.rotation.y=s.dir;const portrait=hero.userData.portrait;
 const pose=heroPose();
 portrait.material.map=artMaps[pose.name+(pose.flip?'-left':'')];
 portrait.scale.set(1.16,2,1);
 portrait.position.y=0;
 hoop.visible=s.tool==='網';blade.visible=!hoop.visible;hand.rotation.y=slash>0?Math.sin(slash/.28*Math.PI)*1.7:0;
 sun.intensity=s.time>=1080?.65:2.1;sky.intensity=s.time>=1080?1.15:1.95;updatePlants();updateObjects();renderer.render(world,cam);
 let p=nearest();$('interact').hidden=!p;if(p)$('interact').textContent=p.title+'　(E)'
}




