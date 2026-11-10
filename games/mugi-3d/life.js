// Seasonal scenery, readable hand tools and deterministic daily village routines.
const toolActionNames={'種':'種まき','じょうろ':'水やり','網':'網を振る','鎌':'刈る','大鎌':'大きく刈る','手押し刈取機':'刈り取る','殺虫スプレー':'スプレー','火炎放射器':'放射'};
const toolSymbols={'種':'🌾','じょうろ':'💧','網':'◎','鎌':'☾','大鎌':'☾','手押し刈取機':'▤','殺虫スプレー':'▥','火炎放射器':'🔥'};
function farmTool(name){
 const g=new T.Group(),wood=0x9e7146,steel=0xc6d7d6;
 const piece=(geo,color,x,y,z,a,b,c)=>modelPart(g,geo,color,x,y,z,a,b,c);
 const rod=(a,b,r,color=wood)=>beam(g,a,b,r,color);
 if(name==='種'){
  piece(geoRound,0xc59b53,0,0,.16,.23,.27,.18);
  piece(geoCylinder,0x745338,0,.2,.16,.15,.06,.12);
  for(let i=0;i<5;i++)piece(geoRound,0xf5d47d,(i%3-1)*.065,.24,.12+Math.floor(i/3)*.08,.035,.025,.055);
 }else if(name==='じょうろ'){
  piece(geoCylinder,0x438e98,0,0,.19,.22,.35,.22);
  piece(new T.TorusGeometry(.18,.035,6,20),steel,0,.2,.19,1,1,1);
  rod([.1,-.04,.26],[.12,.16,.65],.055,0x438e98);
  piece(geoCylinder,steel,.12,.16,.7,.12,.06,.12).rotation.x=Math.PI/2;
 }else if(name==='網'){
  rod([0,0,-.15],[0,0,.85],.035);
  piece(new T.TorusGeometry(.34,.025,6,24),steel,0,0,.96,1,1,1);
  const net=new T.Mesh(new T.ConeGeometry(.33,.42,12,5,true),new T.MeshStandardMaterial({color:0xe7f1d9,wireframe:true,transparent:true,opacity:.65}));net.rotation.x=-Math.PI/2;net.position.set(0,0,1.15);g.add(net);
 }else if(name==='くわ'){
  rod([0,0,-.1],[0,0,.8],.035);piece(geoBox,steel,0,-.09,.8,.35,.22,.05);
 }else if(name==='鎌'||name==='大鎌'){
  const big=name==='大鎌';rod([0,0,-.12],[0,0,big?1:.5],.04);
  const shape=new T.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(.65,.05,.65,-.55);shape.quadraticCurveTo(.45,-.16,0,-.12);shape.closePath();
  const blade=piece(new T.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false}),steel,0,0,big?1:.5,1,1,1);blade.rotation.x=Math.PI/2;
 }else if(name==='手押し刈取機'){
  piece(geoBox,0x598b78,0,-.25,.6,.65,.32,.6);
  for(const side of [-1,1]){piece(geoCylinder,0x514d43,side*.38,-.35,.65,.22,.1,.22).rotation.z=Math.PI/2;rod([side*.2,0,-.1],[side*.2,-.1,.6],.025,steel)}
  for(let i=0;i<7;i++)piece(geoBox,steel,(i-3)*.09,-.32,.98,.045,.05,.19);
 }else{
  const fire=name==='火炎放射器';piece(geoCylinder,fire?0xb75c3e:0xd7ba58,0,0,.12,.16,.44,.16);
  piece(geoBox,0x44544f,0,.24,.16,.12,.13,.22);rod([0,.23,.2],[0,.23,fire?.88:.5],fire?.055:.035,steel);
  if(fire)piece(geoCylinder,0x444c49,0,.23,.89,.085,.19,.085).rotation.x=Math.PI/2;
 }
 return g;
}
hand.clear();
const heldTools=new Map([...new Set(s.gear.concat(['大鎌','手押し刈取機','殺虫スプレー','火炎放射器']))].map(name=>{const model=farmTool(name);hand.add(model);return [name,model]}));
const sowMarker=new T.Mesh(new T.RingGeometry(.35,.43,32),new T.MeshBasicMaterial({color:0xffe5a2,side:T.DoubleSide,transparent:true,opacity:.9}));
sowMarker.rotation.x=-Math.PI/2;sowMarker.visible=false;world.add(sowMarker);
const actionParticles=new T.Group();for(let i=0;i<8;i++)modelPart(actionParticles,geoRound,0xe8c26e,0,0,0,.035,.04,.035);world.add(actionParticles);
let scenerySeason=-1;
function updateSeason(){
 const index=season();if(index===scenerySeason)return;scenerySeason=index;
 const palettes=[{sky:0xc3dedb,ground:0xaac67a,leaf:0x92b958},{sky:0xaecfdc,ground:0x9cb16a,leaf:0x6b994e},{sky:0xe4ceb0,ground:0xc6ae6b,leaf:0xc7863e},{sky:0xd6e1e7,ground:0xe5e9e6,leaf:0xe0e7df}];
 const palette=palettes[index];world.background.setHex(palette.sky);world.fog.color.setHex(palette.sky);
 meadow.material.map=index===3?null:artMaps.meadow;meadow.material.color.setHex(palette.ground);meadow.material.needsUpdate=true;
 for(const {mesh,role,color} of seasonalBatches){
  mesh.visible=role==='apple'?index===1||index===2:role==='flower'?index!==3:true;
  if(role==='foliage')mesh.material.color.setHex(palette.leaf).multiplyScalar(.9+(color.g*.2));
  if(role==='roof')mesh.material.color.copy(index===3?new T.Color(0xe4e9e8):color);
 }
}
const routines=characters.map(({person,v,tag},i)=>{
 const [x,z]=plots[i+3],point=(a,b)=>({x:x+a,z:z+b});
 const route=[{...point(0,3.5),minutes:18,activity:'ひと休み'}, {...point(3,3.5),minutes:12,activity:'散歩'}, {...point(3,0),minutes:45,activity:'畑の手入れ'}, {...point(3,-2.6),minutes:18,activity:'見回り'}, {...point(3,3.5),minutes:12,activity:'散歩'}, {...point(0,3.5),minutes:35,activity:'ひと休み'}];
 const tool=farmTool('じょうろ');person.userData.joints.arms[1].add(tool);tool.position.set(.06,-.4,.1);tool.scale.setScalar(.7);
 const hoe=farmTool('くわ');person.userData.joints.arms[1].add(hoe);hoe.position.copy(tool.position);hoe.scale.copy(tool.scale);
 const drops=new T.Group();for(let j=0;j<5;j++)modelPart(drops,geoRound,0x88c9e5,0,0,0,.025,.06,.025);world.add(drops);
 const interaction=stops.find(p=>p.neighbor===i);
 return {person,v,tag,route,tool,hoe,drops,interaction,x,z,activity:'ひと休み'};
});
function updateVillageLife(){
 updateSeason();
 for(const [i,npc] of routines.entries()){
  const {person,v,route,tool,interaction}=npc;
  const crops=s.fields[i+3];if(!crops.some(c=>c.day))crops.forEach(c=>{c.day=s.day;c.wateredDay=0});
  const dayTime=s.time<1080;let moving=false,work=false;
  if(!dayTime){v.x=npc.x+3;v.z=npc.z-3;person.rotation.y=Math.PI/2;npc.activity='家の前で休憩'}
  else{
   let phase=(s.time-360+i*35)%140,index=0;
   while(phase>=route[index].minutes){phase-=route[index].minutes;index++}
   const target=route[index],previous=route[(index+route.length-1)%route.length];
   const distance=Math.hypot(target.x-previous.x,target.z-previous.z),travel=Math.min(target.minutes,distance*3),ratio=travel?Math.min(1,phase/travel):1;
   v.x=previous.x+(target.x-previous.x)*ratio;v.z=previous.z+(target.z-previous.z)*ratio;moving=ratio<1;
   if(distance)person.rotation.y=Math.atan2(target.x-previous.x,target.z-previous.z);
   work=!moving&&target.activity==='畑の手入れ';npc.activity=moving?'散歩':work?(s.time<720?'水やり':'麦の手入れ'):target.activity;
   if(work)person.rotation.y=-Math.PI/2;
  }
  person.position.set(v.x,work?.015*Math.sin(s.time*2):0,v.z);
  const phase=s.time*1.8+i,amount=moving?.4:0;
  person.userData.joints.legs.forEach((limb,j)=>limb.rotation.x=Math.sin(phase+j*Math.PI)*amount);
  person.userData.joints.arms.forEach((limb,j)=>limb.rotation.x=work?-.55+.15*Math.sin(s.time*1.5+j):-Math.sin(phase+j*Math.PI)*amount*.8);
  person.rotation.z=work?.06*Math.sin(s.time*1.5):0;if(work&&s.time<720)for(const c of crops)c.wateredDay=s.day;
  tool.visible=work&&s.time<720;npc.hoe.visible=work&&s.time>=720;npc.drops.visible=tool.visible;
  npc.drops.children.forEach((drop,j)=>{const f=(s.time*1.8+j/5)%1;drop.position.set(v.x-.7-f*.35,.7*(1-f),v.z+Math.sin(j)*.09)});
  interaction.x=v.x;interaction.z=v.z;interaction.title=v.name+'と話す（'+npc.activity+'）';
 }
 actionParticles.visible=slash>0&&['種','じょうろ'].includes(s.tool);
 const flight=1-slash/.28;actionParticles.children.forEach((particle,j)=>{const distance=.4+flight*1.1;particle.position.set(wx()+Math.sin(s.dir)*distance+Math.cos(j*2.4)*.15,.8*(1-flight)+(j%3)*.06,wz()+Math.cos(s.dir)*distance+Math.sin(j*2.4)*.15);particle.material.color.setHex(s.tool==='じょうろ'?0x88c9e5:0xe8c26e)});
 for(const [name,model] of heldTools)model.visible=name===s.tool;
 hand.rotation.y=slash>0?Math.sin(slash/.28*Math.PI)*.9:0;hand.rotation.x=s.tool==='じょうろ'&&slash>0?-.35:0;
 const target=s.scene<3&&s.tool==='種'&&s.seeds>0?(s.fields[s.scene]||[]).filter(c=>!c.day&&Math.hypot(c.x-s.x,c.z-s.z)<=2.5).sort((a,b)=>Math.hypot(a.x-s.x,a.z-s.z)-Math.hypot(b.x-s.x,b.z-s.z))[0]:null;
 sowMarker.visible=!!target&&!dlg.open;if(target)sowMarker.position.set(plots[s.scene][0]+target.x,.065,plots[s.scene][1]+target.z);
}
