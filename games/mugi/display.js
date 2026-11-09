'use strict';
function lightweight(canvas){
const g=canvas.getContext('2d');let k,cx,cy;
function pt(x,y,z){return [cx+(x+.18*z)*k,cy+(.62*z-.84*y)*k]}
function poly(points,color){g.fillStyle=color;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill()}
function face(points,color){poly(points.map(p=>pt(...p)),color)}
function oval(x,y,rx,ry,c,rot=0){g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,7);g.fill()}
function line(x,y,u,v,c,w){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.lineTo(u,v);g.stroke()}
function cube(x,z,w,d,h,cols){let a=x-w/2,b=x+w/2,f=z+d/2,r=z-d/2;face([[a,h,r],[b,h,r],[b,h,f],[a,h,f]],cols[0]);face([[a,0,f],[b,0,f],[b,h,f],[a,h,f]],cols[1]);face([[a,0,r],[a,0,f],[a,h,f],[a,h,r]],cols[2])}
function stamp(name,x,z,w,h){const img=artImages[name];if(!img.naturalWidth)return false;const [a,b]=pt(x,0,z);g.drawImage(img,a-w*k/2,b-h*k,w*k,h*k);return true}
function house(x,z){if(stamp('house',x,z+1.35,4.9,4.6))return;cube(x,z,2.9,2,2,['#f7dfa6','#f4dba2','#bfaa79']);for(let side of [-1,1])face([[x+side*1.75,1.85,z-1.25],[x,3.15,z-1.25],[x,3.15,z+1.25],[x+side*1.75,1.85,z+1.25]],side<0?'#975544':'#bb6e50');face([[x-1.45,1.85,z+1],[x,3.05,z+1],[x+1.45,1.85,z+1]],'#eed49a');cube(x+.5,z+1.02,.65,.1,1.3,['#89704d','#775641','#67513d']);}
function tree(x,z,i){let [a,b]=pt(x,0,z);oval(a,b,k*.75,k*.2,'#87975f');line(a,b,a,b-k*1.5,'#856d4d',k*.18);for(let j=0;j<4;j++)oval(a+Math.cos(j*2)*k*.39,b-k*(1.55+j*.14),k*.62,k*.75,['#6f955e','#90aa67','#abc47a','#8ca96a'][j])}
function plant(c){let days=Math.min(5,s.day-c.day),h=.37+days*.16;if(stamp(days===5?"wheat":"sprout",c.x,c.z,h*1.12,h))return;let [x,y]=pt(c.x,0,c.z),age=s.day-c.day,mature=age>=5;for(let j=-1;j<=1;j++){let u=x+j*k*.18,v=y+Math.abs(j)*k*.06,h=k*(mature?.78:.2+Math.max(0,age)*.09),sw=Math.sin(tick*1.7+c.z+j)*k*.035;line(u,v,u+sw,v-h,mature?'#997735':'#638247',k*.04);for(let q=0;q<4;q++)oval(u+sw+(q%2?1:-1)*k*.05,v-h+q*k*.077,k*.054,k*.12,mature?(q%2?'#eab851':'#f9d777'):'#8da75b',q%2?.55:-.55)}}

function person(){
 const pose=heroPose(),img=artImages[pose.name];
 if(!img?.naturalWidth){stamp('front',wx(),wz(),.95,2);return}
 const [x,y]=pt(wx(),0,wz());
 oval(x,y,.24*k,.075*k,'#57744766');
 g.save();g.translate(x,y);g.scale(pose.flip?-1:1,1);
 g.drawImage(img,-.75*k,-2*k,1.5*k,2*k);g.restore();
 if(slash>0){
   const [u,v]=pt(wx(),1,wz());
   line(u,v,u+Math.sin(s.dir)*k*.8,v+Math.cos(s.dir)*k*.35,'#fff4c3',3);
 }
}
return function draw(){
 const W=canvas.clientWidth,H=canvas.clientHeight,d=Math.min(devicePixelRatio,1.5);
 if(canvas.width!==Math.round(W*d)||canvas.height!==Math.round(H*d)){canvas.width=Math.round(W*d);canvas.height=Math.round(H*d)}
 g.setTransform(d,0,0,d,0,0);k=Math.min(W/12,H/15);cx=W/2-(wx()+.18*wz())*k;cy=H*.56-.62*wz()*k;
 g.fillStyle=s.time<1080?'#aec78c':'#8caa90';g.fillRect(0,0,W,H);
 if(artImages.meadow.naturalWidth){let size=k*7;g.save();g.translate(cx%size,cy%(size*.7));g.scale(size/artImages.meadow.width,size*.7/artImages.meadow.height);g.fillStyle=g.createPattern(artImages.meadow,'repeat');g.fillRect(-1500,-1500,(W+2*size)*artImages.meadow.width/size+1500,(H+2*size)*artImages.meadow.height/(size*.7)+1500);g.restore()}
 function ground(x,z,w,h,col){face([[x,0,z],[x+w,0,z],[x+w,0,z+h],[x,0,z+h]],col)}
 for(const z of [-9,5])ground(-25,z-1,50,2,'#d9bb90');for(const x of [-7,6])ground(x-1,-23,2,34,'#d9bb90');
 const objects=blossoms.map(([x,z])=>[z,()=>stamp("flowers",x,z,.55,.48)]);for(const [i,[x,z]] of plots.entries()){
 const crops=s.fields[i]||[];for(const row of new Set(crops.map(c=>c.x)))ground(x+row-.6,z-3.1,1.2,6.3,'#a8815d');
 for(const c of crops)if(c.day)objects.push([z+c.z,()=>plant({...c,x:x+c.x,z:z+c.z})])
 }
 for(const [x,z] of orchard)objects.push([z,()=>stamp('tree',x,z,3.4,3.45)]);for(const b of blocks)objects.push([b.z+1,()=>house(b.x,b.z)]);
 for(const e of s.structures){let [x,z]=plots[e.place];objects.push([z+e.z,()=>cube(x+e.x,z+e.z,e.n==='塀'?1.6:.7,.4,e.n==='塀'?.7:1.7,['#d7b477','#b78d5d','#9a7453'])])}
 for(const b of s.bugs){let [x,z]=plots[b.place];objects.push([z+b.z,()=>{let [u,v]=pt(x+b.x,.6+.15*Math.sin(tick*8),z+b.z);oval(u,v,k*(b.big?.34:.22),k*.12,'#476b3e') }])}
 objects.push([3.6,()=>stamp("crate",3,3.6,1.5,1.4)||cube(3,3.6,1.2,.85,.98,['#dbb67c','#ad8256','#896548'])]);
 for(const v of villagers)objects.push([v.z,()=>{stamp(v.art,v.x,v.z,v.width,v.height);const [u,w]=pt(v.x,2.4,v.z);g.font='bold 14px sans-serif';g.textAlign='center';g.fillStyle='#fff8e5';g.fillRect(u-24,w-16,48,22);g.fillStyle='#334d3d';g.fillText(v.name,u,w)}]);
 objects.sort((a,b)=>a[0]-b[0]).forEach(o=>o[1]());
 person();

 g.font='bold 14px sans-serif';g.textAlign='center';for(const p of stops){if(p.title==='農家と話す')continue;if(p.active&&!p.active())continue;let [u,v]=pt(p.x,1.8,p.z),label=p.icon||p.title;let w=g.measureText(label).width+12;g.fillStyle='#fff3d8';g.fillRect(u-w/2,v-16,w,21);g.fillStyle='#374d38';g.fillText(label,u,v)}
}
}
let drawLight;
function switchMode(){
 if(drawLight)return;
 // A canvas that already owns a lost WebGL context cannot acquire a 2D context.
 const next=cv.cloneNode(false);cv.replaceWith(next);cv=next;drawLight=lightweight(next);
}
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();switchMode()});
if(!renderer)switchMode();
function render(){
 if(!drawLight){try{render3D();return}catch(err){console.error(err);switchMode()}}
 drawLight();const p=nearest();$('interact').hidden=!p;if(p)$('interact').textContent=p.title+'　(E)'
}
