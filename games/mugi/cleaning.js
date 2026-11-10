'use strict';
const cleaningRoot=new URL('cleaning-art/',document.currentScript?.src||document.baseURI);
const cleaningNames=['room','bookcase','dresser','table','chair','plant','basket'];
const cleaningPictures={};
let cleaningReady=false;
let cleaningLoad=null;
let cleaningRequest=0;
function loadCleaningArt(){
 if(cleaningLoad)return cleaningLoad;
 cleaningLoad=Promise.all(cleaningNames.map(name=>new Promise((resolve,reject)=>{
   const image=new Image();
   image.onload=()=>{cleaningPictures[name]=image;resolve()};
   image.onerror=()=>reject(new Error(name));
   image.src=window.cleaningEmbedded?.[name]||new URL(name+(name==='room'?'.jpg':'.png'),cleaningRoot).href;
 }))).catch(error=>{cleaningLoad=null;throw error});
 return cleaningLoad;
}
function makeCleaningLayout(){
 const mirror=Math.random()<.5;
 const offset=(Math.random()-.5)*3;
 const center=x=>mirror?100-x:x;
 return [
   {name:'bookcase',x:center(16),bottom:63,width:27},
   {name:'dresser',x:center(82),bottom:61,width:29},
   {name:'plant',x:center(42),bottom:60,width:18},
   {name:'table',x:center(48+offset),bottom:80,width:32},
   {name:'chair',x:center(73+offset),bottom:91,width:20},
   {name:'basket',x:center(17),bottom:91,width:22}
 ];
}
function prepareCleaningJob(){
 return {left:30,start:s.time,dots:Array(7).fill(true),layout:makeCleaningLayout(),roomVersion:2};
}
function dustGraphic(){
 return '<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="#b7afa0" stroke="#777263" stroke-width=".7"><ellipse cx="20" cy="23" rx="12" ry="8"/><circle cx="12" cy="22" r="6"/><circle cx="17" cy="16" r="6"/><circle cx="24" cy="17" r="7"/><circle cx="28" cy="23" r="5"/></g><g fill="none" stroke="#777263" stroke-linecap="round"><path d="M9 19 5 15m8 1-2-5m9 4 1-6m8 9 6-4m-5 9 6 3m-18 4-2 5m-4-8-6 3"/><path d="m13 22 6-4 7 5-8 4" opacity=".5"/></g></svg>';
}
function dustLocations(room,layout){
 const width=room.clientWidth,height=room.clientHeight;
 // Anchor dust to visible furniture surfaces, then leave one clump on the floor.
 const anchors=[[0,.36],[1,.39],[2,.54],[3,.30],[4,.56],[5,.45]];
 const points=anchors.map(([index,ratio])=>{
   const item=layout[index],image=cleaningPictures[item.name];
   const displayedHeight=width*item.width/100*image.naturalHeight/image.naturalWidth;
   return [item.x,item.bottom-displayedHeight/height*100*(1-ratio)];
 });
 points.push([50,93]);
 return points.map(([x,y])=>[Math.max(8,Math.min(92,x)),Math.max(8,Math.min(92,y))]);
}
async function showCleaningRoom(){
 const active=s.job;
 const request=++cleaningRequest;
 cleaningReady=false;
 panel('お部屋のほこり集め','家具を準備しています…',[],false);
 dlg.classList.add('cleaning-stage');
 try{
   await loadCleaningArt();
   if(s.job!==active||request!==cleaningRequest)return;
   // Existing saves retain collected dust and remaining time.
   if(!active.layout)active.layout=makeCleaningLayout();
   const room=document.createElement('div');room.id='cleaning-room';
   room.setAttribute('role','group');room.setAttribute('aria-label','家具のある部屋。綿ぼこりを探してタップ');
   const background=cleaningPictures.room.cloneNode();background.className='cleaning-background';background.alt='';
   room.append(background);$('extra').append(room);
   active.layout.slice().sort((a,b)=>a.bottom-b.bottom).forEach(item=>{
     const image=cleaningPictures[item.name].cloneNode();
     image.className='cleaning-furniture';image.alt={bookcase:'本棚',dresser:'引き出し',plant:'観葉植物',table:'テーブル',chair:'椅子',basket:'タオルのかご'}[item.name];
     image.draggable=false;
     image.style.cssText='left:'+item.x+'%;bottom:'+(100-item.bottom)+'%;width:'+item.width+'%;';
     room.append(image);
   });
   // Layout-relative anchors are regenerated only when migrating an older save.
   if(active.roomVersion!==2||active.dots.some(dot=>dot&&!Array.isArray(dot))){
     const points=dustLocations(room,active.layout);
     active.dots=active.dots.map((dot,i)=>dot?points[i]:null);
     active.roomVersion=2;
   }
   active.dots.forEach((point,index)=>{
     if(!point)return;
     const button=document.createElement('button');button.type='button';button.className='cleaning-dust';
     button.ariaLabel='綿ぼこり '+(index+1);button.innerHTML=dustGraphic();
     button.style.left=point[0]+'%';button.style.top=point[1]+'%';
     button.onclick=()=>{
       if(!cleaningReady||s.job!==active||!active.dots[index])return;
       active.dots[index]=null;button.remove();tone(420);
       if(!active.dots.some(Boolean)){cleaningReady=false;finishJob(true)}
       save();
     };
     room.append(button);
   });
   $('body').textContent='残り '+Math.ceil(active.left)+'秒 ・ ほこり '+active.dots.filter(Boolean).length+'個';
   cleaningReady=true;save();
 }catch{
   if(s.job===active)panel('家具を読み込めませんでした','時間は止まっています。通信を確認して再読み込みしてください。',[['もう一度読み込む',showCleaningRoom]],false);
 }
}
function updateCleaning(dt){
 if(!cleaningReady||!s.job)return;
 s.job.left=Math.max(0,s.job.left-dt);
 const target=s.job.start+Math.min(120,(30-s.job.left)*4);
 if(target>s.time)advance(target-s.time);
 const status='残り '+Math.ceil(s.job.left)+'秒 ・ ほこり '+s.job.dots.filter(Boolean).length+'個';
 if($('body').textContent!==status)$('body').textContent=status;
 if(s.job.left<=0){cleaningReady=false;finishJob(false)}
}
const cleaningStyle=document.createElement('style');
cleaningStyle.textContent=`
dialog.cleaning-stage{width:min(96vw,480px);padding:14px;max-height:94dvh}
.cleaning-stage>small{font-size:10px}
.cleaning-stage h2{font-size:21px;margin:6px 0}
.cleaning-stage #body{margin:5px 0 10px;font-size:14px}
#cleaning-room{position:relative;isolation:isolate;width:min(100%,calc((100dvh - 185px)*.72));aspect-ratio:2/3;margin:0 auto;border:3px solid #aa8559;border-radius:8px;overflow:hidden;background:#eed7a8;touch-action:manipulation}
#cleaning-room .cleaning-background{position:absolute;width:100%;height:100%;inset:0;object-fit:fill;pointer-events:none}
#cleaning-room .cleaning-furniture{position:absolute;height:auto;transform:translateX(-50%);pointer-events:none;user-select:none;filter:drop-shadow(0 3px 2px #51361729)}
#cleaning-room .cleaning-dust{position:absolute;z-index:10;transform:translate(-50%,-50%);width:44px;height:44px;min-width:44px;padding:5px;border:0;border-radius:50%;background:transparent;touch-action:manipulation}
#cleaning-room .cleaning-dust svg{display:block;width:100%;height:100%;filter:drop-shadow(0 1px 1px #fff3)}
#cleaning-room .cleaning-dust:focus-visible{outline:2px solid #436851;background:#fff3}
`;
document.head.append(cleaningStyle);


