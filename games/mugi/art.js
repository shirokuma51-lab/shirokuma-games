'use strict';
const artImages={},artMaps={},orchard=[[-6,1],[-8,-4],[5,-5],[17,-6],[-11,-17],[1,-21],[19,3],[-21,-8]];
const artNames=['house','front','back','tree','meadow','sprout','wheat','crate','flowers','hana','gen','pine','birch','oak','maple'];
for(let row=0;row<3;row++)for(let frame=0;frame<8;frame++)artNames.push('stride-'+row+'-'+frame);
for(const name of artNames){
  const img=new Image();artImages[name]=img;
  const map=new THREE.Texture(img);map.colorSpace=THREE.SRGBColorSpace;
  img.onload=()=>{map.needsUpdate=true};const source='art/'+name+(name==='meadow'?'.jpg':'.png');img.src=source.startsWith('data:')?source:source+'?v=7';artMaps[name]=map;
}
function illustration(name,w,h,x,y,z,parent){
  const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:artMaps[name],alphaTest:.12}));
  spr.center.set(.5,0);spr.scale.set(w,h,1);spr.position.set(x,y,z);parent.add(spr);return spr
}
function earthTexture(ridge){
 const c=document.createElement('canvas');c.width=c.height=256;
 const g=c.getContext('2d');let seed=943;const rand=()=>((seed=seed*16807%2147483647)/2147483647);
 g.fillStyle=ridge?'#a58460':'#d5bb91';g.fillRect(0,0,256,256);
 for(let i=0;i<3700;i++){
   const x=rand()*256,y=rand()*256;g.fillStyle=i%3?'rgba(80,55,36,.08)':'rgba(255,238,191,.3)';
   g.beginPath();g.ellipse(x,y,1+rand()*3,.4+rand(),rand(),0,7);g.fill();
 }
 if(ridge){for(let x=5;x<256;x+=22){g.strokeStyle='rgba(95,62,40,.3)';g.lineWidth=3;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+5,70,x-5,195,x,256);g.stroke()}}
 return c
}
const soils=[earthTexture(false),earthTexture(true)];

const blossoms=[[-2.7,2],[-3,1.6],[2.8,-2],[4.4,3.7],[-4.5,1.8],[.5,-4.7],[5.8,-8.2]];

const villagers=[{x:-16,z:-11.5,name:'ハナ',art:'hana',width:1.05,height:2.1},{x:-3,z:-11.5,name:'ゲン',art:'gen',width:1.25,height:2.2}];

let walkDistance=0;
let isWalking=false;
function heroPose(){
  const horizontal=Math.abs(Math.sin(s.dir))>.65;
  const row=horizontal?2:Math.cos(s.dir)<0?1:0;
  const frame=isWalking?Math.floor(walkDistance/.19)%8:2;
  return {name:'stride-'+row+'-'+frame,flip:horizontal&&Math.sin(s.dir)<0};
}

const forest=[];
const treeTypes=['pine','birch','oak','maple'];
// Loose clusters at the edge of the village leave paths and fields open.
for(let i=0;i<38;i++){
 const north=i<22;
 const x=north?-25+i*2.5+Math.sin(i*4.3)*.9:(i%2?-26:26)+Math.sin(i)*1.5;
 const z=north?-26-Math.sin(i*1.7)*2.5:-21+(i-22)*2.1;
 const height=3.4+(Math.sin(i*2.3)+1)*.8;
 forest.push({x,z,art:treeTypes[i%4],height,width:height*(i%4===1?.75:.95)});
}
orchard.forEach(([x,z],i)=>forest.push({x,z,art:treeTypes[i%4],height:3.4+(i%3)*.25,width:3.15}));

