'use strict';
const modelMaterials=new Map(),staticModels=[];
const geoRound=new THREE.SphereGeometry(1,14,10);
const geoFoliage=new THREE.SphereGeometry(1,12,10);
{
 const points=geoFoliage.attributes.position;
 const colors=[];
 for(let i=0;i<points.count;i++){
  const x=points.getX(i),y=points.getY(i),z=points.getZ(i);
  const ripple=1+.07*Math.sin(x*24+z*13)*Math.cos(y*19-z*9);
  points.setXYZ(i,x*ripple,y*ripple,z*ripple);
  const shade=.85+.15*(Math.sin(x*30+y*13+z*7)+1)/2;
  colors.push(shade,shade,shade*.94);
 }
 geoFoliage.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 geoFoliage.computeVertexNormals();
}
const geoBox=new THREE.BoxGeometry(1,1,1);
const geoCylinder=new THREE.CylinderGeometry(1,1,1,12);

const paintedTextures=new Map();
function paintedTexture(kind){
 if(paintedTextures.has(kind))return paintedTextures.get(kind);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const g=canvas.getContext('2d');let seed=731;
 const random=()=>((seed=seed*16807%2147483647)/2147483647);
 g.fillStyle='#eee9dc';g.fillRect(0,0,256,256);
 for(let i=0;i<2400;i++){
  const a=random(),x=random()*256,y=random()*256;
  g.fillStyle=a>.5?'rgba(255,255,245,.14)':'rgba(74,53,31,.065)';
  g.fillRect(x,y,kind==='wood'?1+random()*2:1.5,kind==='wood'?8+random()*48:1.5);
 }
 if(kind==='wood'){
  for(let i=0;i<18;i++){const x=i*15;g.strokeStyle='rgba(72,48,30,.14)';g.lineWidth=.8;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+10,90,x-8,170,x+3,256);g.stroke()}
 }else if(kind==='fabric'){
  g.strokeStyle='rgba(89,76,62,.13)';g.lineWidth=.5;
  for(let i=0;i<256;i+=4){g.beginPath();g.moveTo(0,i);g.lineTo(256,i);g.moveTo(i,0);g.lineTo(i,256);g.stroke()}
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 paintedTextures.set(kind,texture);return texture;
}
const woodColors=new Set([0x796044,0x765945,0x82634a,0x96674e,0x735940,0x8c6343,0xb58a59,0xa17950,0x715545,0x8b6244]);
const fabricColors=new Set([0x927b9f,0xa06b4e,0x5a8885,0xb6a6a7,0x4e7370,0xe0d5b8,0x707851,0x4d7272]);

function modelPart(parent,geo,color,x,y,z,sx,sy,sz){
  const key=String(color)+(geo===geoFoliage?'leaf':'');
  if(!modelMaterials.has(key)){
   const texture=geo===geoFoliage?null:paintedTexture(woodColors.has(color)?'wood':fabricColors.has(color)?'fabric':'plaster');
   modelMaterials.set(key,new THREE.MeshStandardMaterial({color,roughness:.92,vertexColors:geo===geoFoliage,map:texture}));
  }
  const mesh=new THREE.Mesh(geo,modelMaterials.get(key));
  mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function beam(parent,a,b,r,color){
 const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
 const mid=start.clone().add(end).multiplyScalar(.5);
 const mesh=modelPart(parent,geoCylinder,color,mid.x,mid.y,mid.z,r,delta.length(),r);
 mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
 return mesh;
}

const roofTileGeometry=(()=>{
 const points=[],indices=[];
 for(let row=0;row<2;row++)for(let i=0;i<=6;i++){
  const x=i/6-.5;points.push(x,.06*Math.cos(x*Math.PI),row-.5);
 }
 for(let i=0;i<6;i++)indices.push(i,i+7,i+1,i+1,i+7,i+8);
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
})();
function roof(parent,width,depth,base,rise,color){
 const shape=new THREE.Shape();shape.moveTo(-width/2,0);shape.lineTo(0,rise);shape.lineTo(width/2,0);shape.closePath();
 const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false});
 modelPart(parent,geometry,color,0,base,-depth/2,1,1,1);
 const slope=Math.atan2(rise,width/2);
 const palette=[color,new THREE.Color(color).multiplyScalar(.9).getHex(),new THREE.Color(color).multiplyScalar(1.08).getHex()];
 for(const side of [-1,1])for(let row=0;row<7;row++)for(let col=0;col<12;col++){
   const f=(row+.5)/7,x=side*width/2*f,z=-depth/2+(col+.5)*depth/12;
   const tile=modelPart(parent,roofTileGeometry,palette[(row*7+col*5)%3],x,base+rise*(1-f)+.045,z,width/14+.05,1,depth/12+.04);
   tile.rotation.z=-side*slope;
 }
 for(const side of [-1,1]){
  beam(parent,[side*width/2,base,-depth/2],[side*width/2,base,depth/2],.055,0x715545);
  for(const z of [-depth/2,depth/2])beam(parent,[0,base+rise+.02,z],[side*width/2,base,z],.045,0x715545);
 }
 for(let z=-depth/2;z<depth/2;z+=.23)modelPart(parent,geoCylinder,palette[2],0,base+rise+.06,z,.09,.25,.09).rotation.x=Math.PI/2;
}
function windowFrame(parent,x,y,z){
 modelPart(parent,geoBox,0x6a928b,x,y,z,.58,.65,.07);
 for(const side of [-1,1]){
  modelPart(parent,geoBox,0xede0b5,x+side*.33,y,z+.04,.08,.78,.1);
  modelPart(parent,geoBox,0x527c70,x+side*.53,y,z,.27,.69,.1);
 }
 modelPart(parent,geoBox,0xede0b5,x,y,z+.07,.055,.68,.07);
 modelPart(parent,geoBox,0xede0b5,x,y,z+.07,.65,.055,.07);
 modelPart(parent,geoBox,0x8b6244,x,y-.45,z+.17,.9,.22,.3);
 for(let j=0;j<5;j++){
  modelPart(parent,geoRound,0x607f46,x+(j-2)*.15,y-.28,z+.19,.15,.14,.13);
  modelPart(parent,geoRound,j%2?0xe4be62:0xc78394,x+(j-2)*.15,y-.18,z+.2,.065,.06,.065);
 }
}
function cottage(kind){
 const group=new THREE.Group();
 const tall=kind==='guesthouse',barn=kind==='gen-house',shop=kind==='shop',green=kind==='hana-house';
 const h=tall?3:1.95;
 const roofColor=green?0x71864e:barn?0x557488:shop?0xc7a24d:tall?0x8c627b:0xad6750;
 modelPart(group,geoBox,0x8d846e,0,.12,0,3.55,.24,2.9);
 modelPart(group,geoBox,barn?0x96674e:0xe7d5aa,0,h/2+.2,0,3.4,h,2.7);
 for(const x of [-1.65,1.65])modelPart(group,geoBox,0x82634a,x,h/2+.2,1.38,.11,h,.09);
 for(let y=.35;y<h;y+=.38){
   if(barn)for(let x=-1.5;x<=1.5;x+=.3)modelPart(group,geoBox,0x735940,x,y,1.38,.025,.38,.02);
 }
 if(green){
   const arch=new THREE.Shape();arch.moveTo(-1.95,0);
   for(let i=0;i<=24;i++){const angle=Math.PI-i*Math.PI/24;arch.lineTo(Math.cos(angle)*1.95,Math.sin(angle)*.9)}
   arch.lineTo(-1.95,0);arch.closePath();
   modelPart(group,new THREE.ExtrudeGeometry(arch,{depth:3.15,bevelEnabled:false}),roofColor,0,h+.15,-1.575,1,1,1);
   for(let i=0;i<24;i++){const a=i*2.4;modelPart(group,geoFoliage,0x88975b,Math.sin(a)*1.6,h+.35+.65*Math.sqrt(1-Math.sin(a)**2),Math.cos(i)*1.4,.22,.08,.2)}

 }else roof(group,3.9,3.2,h+.2,barn?1.65:1.05,roofColor);
 modelPart(group,geoBox,0x827963,1.1,h+1.0,-.55,.45,1.25,.45);
 for(let j=0;j<4;j++)modelPart(group,geoBox,0xb0a38a,1.1,h+.65+j*.25,-.55,.48,.045,.48);
 modelPart(group,geoBox,0x765945,0,.9,1.39,barn?1.4:.78,1.5,.1);
 if(barn){beam(group,[-.6,.3,1.47],[.6,1.55,1.47],.045,0xe1cf9c)}
 else modelPart(group,geoRound,0xc8a54b,.24,.91,1.47,.045,.045,.035);
 modelPart(group,geoBox,0xb7aa8b,0,.12,1.63,1.35,.22,.55);
 windowFrame(group,-1.0,1.15,1.4);
 if(!barn)windowFrame(group,1.02,1.15,1.4);
 if(tall)for(const x of [-1.05,0,1.05])windowFrame(group,x,2.55,1.4);
 if(shop){
   for(let j=0;j<10;j++){const panel=modelPart(group,geoBox,j%2?0xebe4c3:0x568c88,-1.8+j*.4,1.95,1.85,.4,.07,1.05);panel.rotation.x=.22}
   for(const x of [-1.78,1.78])beam(group,[x,0,2.2],[x,1.9,2.2],.045,0x806847);
 }
 for(let j=0;j<4;j++)modelPart(group,geoCylinder,0x8c6343,1.95,.16+j*.18,-.4,.15,.55,.15).rotation.x=Math.PI/2;
 for(let j=0;j<3;j++){
   const x=-1.8-j*.18;
   modelPart(group,geoCylinder,0xa87550,x,.18,.8-j*.4,.17,.32,.17);
   modelPart(group,geoRound,0x70854c,x,.45,.8-j*.4,.25,.28,.23);
 }

 // Corner stones and wall beams give each side a readable structure.
 for(const x of [-1.66,1.66])for(const z of [-1.33,1.33]){
  for(let y=.25;y<.85;y+=.2)modelPart(group,geoBox,0xafa48c,x,y,z,.24,.16,.22);
  modelPart(group,geoBox,0x82634a,x,h/2+.2,z,.1,h,.1);
 }
 for(const z of [-1.38,1.38])modelPart(group,geoBox,0x82634a,0,h+.14,z,3.45,.12,.1);
 const back=new THREE.Group();back.rotation.y=Math.PI;group.add(back);windowFrame(back,0,1.15,1.4);
 for(const side of [-1,1]){
  const wall=new THREE.Group();wall.rotation.y=side*Math.PI/2;group.add(wall);windowFrame(wall,0,1.15,1.73);
 }
 // Planked door, iron hinges, porch lamp and worn stepping stones.
 for(let x=-.3;x<=.3;x+=.15)modelPart(group,geoBox,0x8b6244,x,.9,1.455,.018,1.4,.015);
 for(const y of [.45,1.3])modelPart(group,geoBox,0x544d40,-.29,y,1.47,.17,.045,.03);
 beam(group,[.65,1.6,1.4],[.65,1.6,1.65],.025,0x544d40);
 modelPart(group,geoBox,0x544d40,.65,1.4,1.65,.2,.3,.2);
 modelPart(group,geoBox,0xffdf95,.65,1.42,1.76,.13,.19,.025);
 for(let i=0;i<3;i++)modelPart(group,geoRound,0xb9b097,(i%2-.5)*.08,.035,1.95+i*.37,.35,.05,.22);
 if(tall){
  modelPart(group,geoBox,0x82634a,0,2.13,1.65,2.8,.12,.55);
  for(let x=-1.35;x<=1.35;x+=.27)beam(group,[x,2.15,1.92],[x,2.65,1.92],.025,0x82634a);
  beam(group,[-1.4,2.65,1.92],[1.4,2.65,1.92],.035,0x82634a);
 }
 if(shop)for(let i=0;i<3;i++){
  modelPart(group,geoRound,0xc5b38c,-1.3+i*.45,.35,2.35,.22,.35,.2);
  modelPart(group,geoCylinder,0x967d52,-1.3+i*.45,.61,2.35,.13,.035,.13);
 }
 return group;
}
function treeModel(apple,height){
 const group=new THREE.Group(),wood=0x796044;
 beam(group,[0,0,0],[.12,1.9,0],.15,wood);
 for(let i=0;i<6;i++){
  const a=i*2.4,x=Math.sin(a)*.65,z=Math.cos(a)*.65;
  beam(group,[.08,1.05,0],[x,2.15+(i%2)*.3,z],.06,wood);
  modelPart(group,geoFoliage,[0x6d8d4e,0x829e59,0x577d48][i%3],x,2.3+(i%2)*.45,z,.8,.83,.78);
 }
 modelPart(group,geoFoliage,0x8b9f58,0,3.05,0,.9,.7,.85);
 if(apple)for(let i=0;i<12;i++){const a=i*2.4;modelPart(group,geoRound,0xb75b3f,Math.sin(a)*1.1,2.2+(i%3)*.25,Math.cos(a)*1.1,.095,.1,.095)}
 
 for(let i=0;i<5;i++){const a=i*1.26;beam(group,[0,.35,0],[Math.sin(a)*.45,.025,Math.cos(a)*.45],.065,wood)}
 for(let i=0;i<(apple?18:6);i++){
  const a=i*2.4,y=2.15+(i%4)*.26,r=1.05-.12*(i%3);
  modelPart(group,geoFoliage,[0x789650,0x91a65f][i%2],Math.sin(a)*r,y,Math.cos(a)*r,.26,.18,.24);
 }
 group.scale.setScalar(height/3.7);return group;
}
function cropModel(){
 const group=new THREE.Group();
 for(let i=0;i<5;i++){
  const a=i*2.4,x=Math.sin(a)*.23,z=Math.cos(a)*.23;
  beam(group,[x,0,z],[x+.06,.72,z],.015,0xa28a4a);
  for(let j=0;j<4;j++){
   const grain=modelPart(group,geoRound,0xe5bf65,x+.06+(j%2?.035:-.035),.72+j*.07,z,.045,.085,.035);
   grain.rotation.z=j%2?.45:-.45;
  }
 }
 return group;
}
function modelIllustration(kind,w,h,x,y,z,parent){
 let model;
 if(['house','hana-house','gen-house','shop','guesthouse'].includes(kind))model=cottage(kind);
 else if(kind==='tree'||kind==='oak')model=treeModel(kind==='tree',h);
 else if(kind==='sprout')model=cropModel();
 else{
  model=new THREE.Group();
  if(kind==='crate'){
   for(let side of [-1,1])for(let j=0;j<3;j++){
    modelPart(model,geoBox,0xb58a59,0,.2+j*.25,side*.4,1.1,.18,.07);
    modelPart(model,geoBox,0xa17950,side*.55,.2+j*.25,0,.07,.18,.85);
   }
  }else for(let j=0;j<4;j++){
   const px=Math.sin(j*2.4)*.17,pz=Math.cos(j*2.4)*.17;
   beam(model,[px,0,pz],[px,.25,pz],.012,0x68894d);
   modelPart(model,geoRound,j%2?0xe5b8c3:0xffe9a0,px,.27,pz,.06,.04,.06);
  }
 }
 const building=['house','hana-house','gen-house','shop','guesthouse'].includes(kind);
 model.position.set(x,y,building?z-1.35:z);parent.add(model);
 if(kind!=='sprout')staticModels.push(model);
 return model;
}
function personModel(kind){
 const group=new THREE.Group();
 const skin=0xe0b28c,shirt=kind==='hana'?0x927b9f:kind==='gen'?0xa06b4e:0x5a8885;
 const round=(col,x,y,z,a,b,c)=>modelPart(group,geoRound,col,x,y,z,a,b,c);
 round(shirt,0,.94,0,.29,.39,.23);
 if(kind==='hana')round(0xb6a6a7,0,.58,0,.37,.48,.31);
 else{
  modelPart(group,geoBox,0x4e7370,0,.82,.21,.32,.39,.06);
  for(let side of [-1,1])beam(group,[side*.13,1.25,.14],[side*.13,.88,.24],.025,0x98a596);
 }
 round(skin,0,1.48,0,.255,.29,.24);
 round(kind==='hana'?0xaba7a1:0x5b4939,0,1.63,-.04,.27,.19,.23);
 for(let side of [-1,1]){
  round(0x3b3931,side*.085,1.49,.225,.026,.035,.018);
  round(skin,side*.25,1.47,0,.045,.07,.05);
 }
 round(skin,0,1.44,.245,.04,.055,.045);
 if(kind==='hana'){
  for(let side of [-1,1])modelPart(group,new THREE.TorusGeometry(.074,.009,5,14),0x605447,side*.09,1.49,.247,1,1,1);
  modelPart(group,geoBox,0x788354,.23,.94,.29,.22,.27,.07);
 }else{
  modelPart(group,geoCylinder,kind==='gen'?0x866447:0xc6a364,0,1.73,0,kind==='gen'?.31:.43,.055,.38);
  round(kind==='gen'?0x967757:0xd8b878,0,1.79,-.02,.28,.17,.26);
  if(kind==='gen')round(0x594735,0,1.36,.225,.12,.045,.035);
  else{round(0xaf6248,0,1.22,.19,.16,.06,.08);modelPart(group,geoBox,0xaf6248,.07,1.12,.24,.08,.2,.035)}
 }

 // Small features remain legible when the player zooms in.
 for(const side of [-1,1]){
  beam(group,[side*.06,1.56,.228],[side*.125,1.55,.22],.012,0x635041);
  round(0xf4d3bb,side*.15,1.40,.195,.055,.025,.012);
  round(0xfff3db,side*.08,1.502,.243,.008,.011,.008);
 }
 const smile=new THREE.CatmullRomCurve3([new THREE.Vector3(-.06,1.36,.226),new THREE.Vector3(0,1.345,.244),new THREE.Vector3(.06,1.36,.226)]);
 modelPart(group,new THREE.TubeGeometry(smile,8,.008,5,false),0x956a57,0,0,0,1,1,1);
 if(kind==='hero'){
  modelPart(group,geoBox,0x426d70,0,.87,.25,.2,.15,.025);
  for(const side of [-1,1])round(0xc9a762,side*.13,1.08,.235,.025,.025,.012);
  modelPart(group,geoCylinder,0x9c6d49,0,1.76,0,.28,.04,.27);
  for(let i=0;i<6;i++)beam(group,[-.12+i*.045,.81,.27],[-.12+i*.045,.92,.27],.003,0xa6b9a3);
 }else if(kind==='hana'){
  modelPart(group,geoBox,0xe2d4b8,0,.76,.31,.35,.48,.035);
  for(let i=0;i<3;i++)round(0xb29a72,.04,.85-i*.13,.34,.025,.025,.01);
 }else{
  for(const side of [-1,1])modelPart(group,geoBox,0x86573e,side*.16,.93,.24,.12,.15,.025);
  for(let i=0;i<3;i++)round(0xc7ab72,0,1.1-i*.12,.245,.018,.018,.01);
 }
 const joints={arms:[],legs:[]};
 for(let side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.3,1.16,0);group.add(arm);
  modelPart(arm,geoRound,kind==='hana'?shirt:0xe0d5b8,side*.035,-.17,0,.09,.22,.09);
  modelPart(arm,geoRound,skin,side*.06,-.36,.015,.065,.12,.07);joints.arms.push(arm);
  const leg=new THREE.Group();leg.position.set(side*.13,.63,0);group.add(leg);
  modelPart(leg,geoRound,kind==='gen'?0x707851:0x4d7272,0,-.22,0,.105,.28,.11);
  modelPart(leg,geoRound,0x66523e,0,-.5,.055,.12,.1,.18);
  modelPart(leg,geoBox,0x463e31,0,-.56,.06,.23,.04,.3);
  for(let j=0;j<3;j++)beam(leg,[-.065,-.44+j*.025,.14],[.065,-.44+j*.025,.14],.007,0xc1a77c);
  joints.legs.push(leg);
 }
 group.userData.joints=joints;
 return group;
}
function batchModels(){
 const batches=new Map();world.updateMatrixWorld(true);
 for(const root of staticModels)root.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const key=mesh.geometry.uuid+mesh.material.uuid;
  if(!batches.has(key))batches.set(key,[]);
  batches.get(key).push(mesh);
 });
 for(const meshes of batches.values()){
  const inst=new THREE.InstancedMesh(meshes[0].geometry,meshes[0].material,meshes.length);
  meshes.forEach((m,i)=>inst.setMatrixAt(i,m.matrixWorld));
  inst.castShadow=true;inst.receiveShadow=true;world.add(inst);
 }
 for(const root of staticModels)root.removeFromParent();
}

