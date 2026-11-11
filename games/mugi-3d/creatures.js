// Reusable 3D insect and net models. All silhouettes remain readable from above.
function makeNetModel(){
 const g=new THREE.Group(),wood=0xa0784d,metal=0xc7d5cb;
 beam(g,[0,0,-.22],[0,0,.72],.032,wood);
 beam(g,[0,0,-.22],[0,0,-.04],.044,0x426f63);
 beam(g,[0,0,.62],[0,0,.77],.044,metal);
 const rim=modelPart(g,new THREE.TorusGeometry(.35,.021,10,40),metal,0,0,1.06,1,1,1);
 rim.rotation.x=Math.PI/2;
 // A rounded cloth bag hangs below the hoop; rings and meridians form real mesh strands.
 const strands=new THREE.Group(),thread=new THREE.MeshStandardMaterial({color:0xf0edcf,roughness:1,transparent:true,opacity:.72});
 const point=(a,t)=>new THREE.Vector3(Math.cos(a)*.35*Math.cos(t*Math.PI/2),-.47*Math.sin(t*Math.PI/2),1.06+Math.sin(a)*.35*Math.cos(t*Math.PI/2));
 function strand(points){const curve=new THREE.CatmullRomCurve3(points);strands.add(new THREE.Mesh(new THREE.TubeGeometry(curve,32,.004,3,false),thread))}
 for(let j=0;j<16;j++){const a=j*Math.PI/8;strand(Array.from({length:13},(_,i)=>point(a,i/12)))}
 for(let j=1;j<8;j++)strand(Array.from({length:33},(_,i)=>point(i*Math.PI/16,j/8)));
 g.add(strands);g.userData.netting=strands;return g;
}
function grasshopperModel(big=false){
 const g=new THREE.Group(),green=big?0xa38749:0x6f9841,dark=big?0x765b2d:0x426a32;
 modelPart(g,geoRound,green,0,0,-.1,.14,.13,.32);
 modelPart(g,geoRound,dark,0,.045,.12,.16,.15,.18);
 modelPart(g,geoRound,green,0,.08,.3,.15,.17,.13);
 for(let j=0;j<4;j++)modelPart(g,geoRound,0xc5c477,0,-.025,-.16-j*.06,.125-j*.014,.09,.022);
 const legs=[],wings=[];
 for(const side of [-1,1]){
  modelPart(g,geoRound,0x263e26,side*.11,.15,.35,.06,.075,.045);
  modelPart(g,geoRound,0xe5e7ba,side*.13,.18,.37,.016,.02,.015);
  const antenna=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.06,.2,.38),new THREE.Vector3(side*.11,.34,.52),new THREE.Vector3(side*.17,.39,.64)]);
  modelPart(g,new THREE.TubeGeometry(antenna,12,.009,4,false),dark,0,0,0,1,1,1);
  for(let j=0;j<3;j++){
   const leg=new THREE.Group();leg.position.set(side*.1,-.025,.14-j*.15);g.add(leg);
   const hind=j===2;
   beam(leg,[0,0,0],[side*(hind?.3:.19),hind?.15:-.08,hind?-.12:.09],hind?.045:.013,dark);
   beam(leg,[side*(hind?.3:.19),hind?.15:-.08,hind?-.12:.09],[side*(hind?.37:.25),-.2,hind?-.4:.16],.012,green);
   beam(leg,[side*(hind?.37:.25),-.2,hind?-.4:.16],[side*(hind?.38:.3),-.21,hind?-.49:.2],.009,dark);legs.push(leg);
  }
  const wing=new THREE.Group();wing.position.set(side*.05,.12,.06);g.add(wing);
  const membrane=modelPart(wing,geoRound,0xc7d18a,side*.13,0,-.22,.16,.018,.33);
  membrane.material=membrane.material.clone();membrane.material.transparent=true;membrane.material.opacity=.82;
  for(let j=0;j<3;j++)beam(wing,[0,.02,0],[side*(.08+j*.05),.02,-.45],.004,dark);
  wings.push(wing);
 }
 g.userData={legs,wings};g.scale.setScalar(big?1.65:1);return g;
}
function animateGrasshopper(model,bug){
 const phase=bug.age*7+bug.x*.7,hop=bug.wait>0?0:Math.max(0,Math.sin(phase));
 model.position.set(plots[bug.place][0]+bug.x,.26+hop*.62,plots[bug.place][1]+bug.z);
 const prior=model.userData.lastPosition;
 if(prior&&Math.hypot(bug.x-prior.x,bug.z-prior.z)>.00001)model.rotation.y=Math.atan2(bug.x-prior.x,bug.z-prior.z);
 model.userData.lastPosition={x:bug.x,z:bug.z};
 model.rotation.x=hop*.15;
 model.userData.wings.forEach((wing,i)=>wing.rotation.z=(i?1:-1)*(hop>.1?.4+Math.sin(bug.age*45)*.32:.06));
 model.userData.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(phase+i)*(.12+hop*.3));
}
