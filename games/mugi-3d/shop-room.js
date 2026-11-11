// A separate walkable interior uses the same renderer and controls as the village.
let shopRoom=null,shopInterior=null;
const shopProducts=[],shopObstacles=[];
const productDetails={
 '種袋':'麦の種15粒。その場で受け取り、畑ですぐに使えます。',
 '塀':'群れの足止めに。配達後、倉庫から畑に設置できます。',
 '風車':'近づくバッタを風で追い払います。配達後に設置してください。',
 '見張りベル':'留守中も、群れが近づくとお知らせします。',
 '大鎌':'広い範囲の麦を一度に収穫できます。',
 '手押し刈取機':'刈り取りの範囲がさらに広がる、車輪つきの農具です。',
 '殺虫スプレー':'大型のバッタにも命中し、しばらく動きを止めます。',
 '火炎放射器':'強力な道具です。麦も焼いてしまうので、使う場所に注意。',
 '不思議なクスリ':'疲れを一時的に忘れられます。連用すると睡眠で回復しにくくなります。'
};
function storeLabel(text,x,y,z,width=1.75){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
 const context=canvas.getContext('2d');context.fillStyle='#f4dfae';context.fillRect(0,0,512,128);context.strokeStyle='#876b42';context.lineWidth=8;context.strokeRect(4,4,504,120);
 context.fillStyle='#000';context.font='bold 40px sans-serif';context.textAlign='center';text.split('\n').forEach((line,i)=>context.fillText(line,256,49+i*53,490));
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const label=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false}));label.position.set(x,y,z);label.scale.set(width,width/4,1);label.renderOrder=20;return label;
}
function displayModel(name){
 if(name==='種袋')return farmTool('種');
 if(['大鎌','手押し刈取機','殺虫スプレー','火炎放射器'].includes(name))return farmTool(name);
 const g=new T.Group(),p=(geo,c,x,y,z,a,b,d)=>modelPart(g,geo,c,x,y,z,a,b,d);
 if(name==='塀'){
  for(const x of [-.4,.4])p(geoBox,0x937047,x,.3,0,.09,.6,.1);
  for(const y of [.22,.48])p(geoBox,0xc19b69,0,y,0,1,.09,.07);
 }else if(name==='風車'){
  p(geoCylinder,0xb6996a,0,.35,0,.18,.7,.18);const fan=new T.Group();fan.position.set(0,.7,.2);g.add(fan);
  for(let i=0;i<4;i++){const b=modelPart(fan,geoBox,0xe3d9ad,0,.2,0,.1,.45,.045);b.rotation.z=i*Math.PI/2;b.position.set(Math.sin(i*Math.PI/2)*.2,Math.cos(i*Math.PI/2)*.2,0)}
 }else if(name==='見張りベル'){
  p(geoCylinder,0xb78c42,0,.3,0,.27,.32,.27);p(geoRound,0xccaa54,0,.46,0,.24,.18,.24);p(geoRound,0x675741,0,.12,0,.06,.06,.06);
 }else{p(geoCylinder,0x736499,0,.24,0,.18,.48,.18);p(geoCylinder,0xc6a663,0,.51,0,.13,.08,.13);p(geoBox,0xe3d3a5,0,.25,.18,.23,.19,.015)}
 return g;
}
function buildShop(){
 const scene=new T.Scene();scene.background=new T.Color(0xc3b08c);
 scene.add(new T.HemisphereLight(0xfff3d5,0x8d7758,1.8));const light=new T.DirectionalLight(0xffefcf,1.8);light.position.set(-3,9,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-7,right:7,top:8,bottom:-8,near:.1,far:30});light.shadow.normalBias=.04;scene.add(light);
 const p=(geo,c,x,y,z,a,b,d)=>modelPart(scene,geo,c,x,y,z,a,b,d);
 p(geoBox,0xb58a59,0,-.1,0,9.4,.2,10.5);
 for(let i=0;i<24;i++)p(geoBox,i%2?0xb89061:0xc6a375,-4.4+i*.38,.015,0,.365,.04,10.3);
 for(let row=0;row<24;row++)for(let j=0;j<4;j++)p(geoBox,0x9b784f,-4.4+row*.38,.038,-4+j*2.6+(row%2)*1.3,.36,.006,.014);
 p(geoBox,0xe0cf9f,0,1.5,-5.1,9.4,3,.18);p(geoBox,0xcab888,-4.6,1.3,0,.18,2.6,10.4);p(geoBox,0xcab888,4.6,1.3,0,.18,2.6,10.4);
 for(const x of [-4.5,4.5])p(geoBox,0x82634a,x,1.4,-5, .15,2.8,.2);
 p(geoBox,0x82634a,0,2.9,-5,9,.16,.22);
 for(const x of [-2.6,2.6]){
  p(geoBox,0xa8cfce,x,1.9,-4.98,1.5,1.2,.06);
  for(const offset of [-.8,0,.8])p(geoBox,0xf2dfb0,x+offset,1.9,-4.9,.065,1.3,.06);
  p(geoBox,0xf2dfb0,x,1.9,-4.88,1.65,.065,.06);
 }
 for(const x of [-4.35,4.35])for(const z of [-3.5,1.5]){p(geoBox,0x7d6749,x,2,z,.16,.12,.35);p(geoCylinder,0xe8ce8d,x,1.8,z,.16,.25,.16);p(geoRound,0xffe5a7,x,1.65,z,.12,.06,.12)}
 scene.add(storeLabel('むぎの丘 農具店',0,2.7,-4.7,3.1));
 const positions=[[-3.2,2],[-3.2,0],[-3.2,-2],[3.2,2],[3.2,0],[3.2,-2],[-2,-3.8],[0,-3.8],[2,-3.8]];
 Object.entries(goods).forEach(([name,price],i)=>{
  const [x,z]=positions[i],root=new T.Group();root.position.set(x,0,z);scene.add(root);
  modelPart(root,geoBox,0x82634a,0,.35,0,1.2,.7,1.1);modelPart(root,geoBox,0xd5b47b,0,.73,0,1.35,.12,1.25);
  const model=displayModel(name);model.position.set(0,1.02,-.5);model.rotation.x=-.4;root.add(model);
  root.userData.product=name;root.traverse(o=>o.userData.product=name);
  // Place price cards on the front of each pedestal, below the displayed tool.
  scene.add(storeLabel(name+'\n'+price+'枚',x,.95,z+.82));
  const item={x,z,name,root,title:name+'を見る　'+price+'枚',act:()=>inspectProduct(name)};
  shopProducts.push(item);shopObstacles.push({x,z,w:1.35,d:1.25});
 });
 p(geoBox,0x70927a,0,.04,4.25,2.3,.04,1.1);scene.add(storeLabel('出口',0,.17,4.7,1.25));
 return scene;
}
function enterShop(){
 if(s.time<540||s.time>=1080)return panel('農具店','営業時間は9時〜18時です。夜は家から通販が使えます。');
 if(shopRoom)return;
 shopInterior??=buildShop();shopRoom={x:0,z:3.5,dir:s.dir,yaw:cameraYaw};cameraYaw=0;
 shopInterior.add(hero);stick=null;keys={};dlg.close();exitShopButton.hidden=false;
 for(const id of ['zoom','turn-left','turn-right'])$(id).hidden=true;
 notify('いらっしゃい！ 展示台まで歩いて E キー／調べる。商品をクリックしても選べます。');
}
function leaveShop(){
 if(!shopRoom)return;s.dir=shopRoom.dir;cameraYaw=shopRoom.yaw;shopRoom=null;world.add(hero);stick=null;keys={};dlg.close();exitShopButton.hidden=true;
 for(const id of ['zoom','turn-left','turn-right'])$(id).hidden=false;save();notify('農具店を出ました。');
}
function walkShop(dx,dz){
 const clear=(x,z)=>Math.abs(x)<4.25&&z>-4.7&&z<4.85&&!shopObstacles.some(o=>Math.abs(x-o.x)<o.w/2+.24&&Math.abs(z-o.z)<o.d/2+.24);
 const before={x:shopRoom.x,z:shopRoom.z};if(clear(shopRoom.x+dx,shopRoom.z))shopRoom.x+=dx;if(clear(shopRoom.x,shopRoom.z+dz))shopRoom.z+=dz;
 const distance=Math.hypot(before.x-shopRoom.x,before.z-shopRoom.z);isWalking=distance>.0001;walkDistance+=distance;return distance;
}
function nearestShop(){
 const exit={x:0,z:4.7,title:'外へ出る',act:leaveShop};
 return [...shopProducts,exit].map(p=>[p,Math.hypot(p.x-shopRoom.x,p.z-shopRoom.z)]).filter(a=>a[1]<1.9).sort((a,b)=>a[1]-b[1])[0]?.[0];
}
function inspectProduct(name){
 const owned=s.gear.includes(name)||s.orders.some(o=>o.n===name)&&['大鎌','手押し刈取機','殺虫スプレー','火炎放射器'].includes(name);
 panel(name,productDetails[name]+'\n価格 '+goods[name]+'枚 ／ 所持金 '+s.money+'枚\n'+(name==='種袋'?'即時受け取り':'到着予定 '+(1+(s.day+1)%24)+'日目（天候で遅れることがあります）')+'\n購入手続き：10分。',[
  ...(owned?[]:[['購入する　'+goods[name]+'枚',()=>buyProduct(name)]]),['展示に戻る',()=>dlg.close()]
 ],false);
 if(owned)$('body').textContent+='\n購入済み、または配達待ちです。';
}
function buyProduct(name){
 const back=[['展示に戻る',()=>dlg.close()]];
 if(!shopRoom)return;
 if(s.time>=1080)return panel('本日の営業は終了です','明日の9時にまたお越しください。',back,false);
 if(s.money<goods[name])return panel('お金が足りません','所持金 '+s.money+'枚。',back,false);
 if(s.gear.includes(name)||s.orders.some(o=>o.n===name)&&['大鎌','手押し刈取機','殺虫スプレー','火炎放射器'].includes(name))return inspectProduct(name);
 s.money-=goods[name];if(name==='種袋')s.seeds+=15;else s.orders.push({n:name,due:s.day+2,late:false});advance(10);save();
 panel('お買い上げありがとう！',name==='種袋'?'麦の種15粒を受け取りました。':name+'を注文しました。原則2日後に配達します。',back,false);
}
function shopGuide(){panel('農具店の中','WASD・矢印キー、画面ドラッグで移動。展示品の前で E キーか「調べる」。商品はクリック／タップでも選べます。購入時に10分が経過します。',[['店内へ戻る',()=>dlg.close()],['外へ出る',leaveShop]],false)}
function renderShop(){
 if(renderer.getPixelRatio()!==Math.min(devicePixelRatio,2))renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 const w=cv.clientWidth,h=cv.clientHeight,r=w/h,span=Math.max(7.7,5.3/r);
 if(cv.width!==Math.floor(w*renderer.getPixelRatio())||cv.height!==Math.floor(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);cam.left=-span*r;cam.right=span*r;cam.top=span;cam.bottom=-span;cam.position.set(0,12,11);cam.lookAt(0,0,-.3);cam.updateProjectionMatrix();cam.updateMatrixWorld();
 hero.position.set(shopRoom.x,0,shopRoom.z);hero.rotation.y=s.dir;
 const phase=walkDistance*5.5;hero.userData.joints.legs.forEach((limb,i)=>limb.rotation.x=isWalking?Math.sin(phase+i*Math.PI)*.45:0);hero.userData.joints.arms.forEach((limb,i)=>limb.rotation.x=isWalking?-Math.sin(phase+i*Math.PI)*.3:0);
 hand.visible=false;renderer.render(shopInterior,cam);hand.visible=true;
 const p=nearestShop();$('interact').hidden=!p;if(p)$('interact').textContent=p.title+' (E)';
}
const exitShopButton=document.createElement('button');exitShopButton.id='shop-exit';exitShopButton.textContent='店の外へ';exitShopButton.hidden=true;exitShopButton.style='position:absolute;top:94px;left:14px';exitShopButton.onclick=leaveShop;cv.parentElement.append(exitShopButton);
const sceneRay=new T.Raycaster(),groundPlane=new T.Plane(new T.Vector3(0,1,0),0);
function clickScene(clientX,clientY){
 if(dlg.open||!s.started)return;
 const rect=cv.getBoundingClientRect();sceneRay.setFromCamera(new T.Vector2((clientX-rect.left)/rect.width*2-1,1-(clientY-rect.top)/rect.height*2),cam);
 if(shopRoom){const hit=sceneRay.intersectObjects(shopProducts.map(p=>p.root),true)[0];if(hit?.object.userData.product)inspectProduct(hit.object.userData.product);return}
 if(s.tool!=='種')return;
 const point=sceneRay.ray.intersectPlane(groundPlane,new T.Vector3());if(!point)return;
 const cells=s.fields[s.scene]||[],target=cells.map(c=>[c,Math.hypot(plots[s.scene][0]+c.x-point.x,plots[s.scene][1]+c.z-point.z)]).sort((a,b)=>a[1]-b[1])[0];
 if(!target||target[1]>.9)return notify('種まきは、畑の畝をクリック。移動は WASD／矢印キーです。');
 if(target[0].day)return notify('ここは種まき済みです。空いた畝を選ぼう');
 if(Math.hypot(target[0].x-s.x,target[0].z-s.z)>2.5)return notify('その畝は遠いようです。近づいてから種をまこう');
 use(target[0]);
}
