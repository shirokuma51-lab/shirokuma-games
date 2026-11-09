'use strict';
const artImages={},artMaps={},orchard=[[-6,1],[-8,-4],[5,-5],[17,-6],[-11,-17],[1,-21],[19,3],[-21,-8]];
const artNames=['meadow'];
for(const name of artNames){
 const img=new Image();artImages[name]=img;
 const map=new THREE.Texture(img);map.colorSpace=THREE.SRGBColorSpace;
 img.onload=()=>map.needsUpdate=true;
 img.src='../mugi/art/meadow.jpg';
 artMaps[name]=map;
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
// Two overlapping layers of the same broadleaf species form an impassable woodland.
for(let layer=0;layer<2;layer++){
 for(let i=0;i<=24;i++){
   const x=-25.5+i*2.13+Math.sin(i*3.1)*.25;
   for(const z of [-24.5-layer*2.15,11.6+layer*2.15]){
     const height=4.5+.35*Math.sin(i*2.1+layer);
     forest.push({x:x+layer*.9,z,art:'oak',height,width:height*1.08});
   }
 }
 for(let i=0;i<16;i++){
   const z=-23+i*2.23+Math.sin(i*2.7)*.3;
   for(const x of [-25.3-layer*2.1,25.3+layer*2.1]){
     const height=4.5+.3*Math.cos(i+layer);
     forest.push({x,z:z+layer*.8,art:'oak',height,width:height*1.08});
   }
 }
}
orchard.forEach(([x,z])=>forest.push({x,z,art:'tree',height:3.45,width:3.4}));
