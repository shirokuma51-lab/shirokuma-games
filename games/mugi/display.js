'use strict';
function lightweight(canvas){
const g=canvas.getContext('2d');let k,cx,cy;
function pt(x,y,z){return [cx+(x+.18*z)*k,cy+(.62*z-.84*y)*k]}
function poly(points,color){g.fillStyle=color;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill()}
function face(points,color){poly(points.map(p=>pt(...p)),color)}
function oval(x,y,rx,ry,c,rot=0){g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,7);g.fill()}
function line(x,y,u,v,c,w){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.lineTo(u,v);g.stroke()}
function cube(x,z,w,d,h,cols){let a=x-w/2,b=x+w/2,f=z+d/2,r=z-d/2;face([[a,h,r],[b,h,r],[b,h,f],[a,h,f]],cols[0]);face([[a,0,f],[b,0,f],[b,h,f],[a,h,f]],cols[1]);face([[a,0,r],[a,0,f],[a,h,f],[a,h,r]],cols[2])}
function house(x,z){cube(x,z,2.9,2,2,['#f7dfa6','#f4dba2','#bfaa79']);for(let side of [-1,1])face([[x+side*1.75,1.85,z-1.25],[x,3.15,z-1.25],[x,3.15,z+1.25],[x+side*1.75,1.85,z+1.25]],side<0?'#975544':'#bb6e50');face([[x-1.45,1.85,z+1],[x,3.05,z+1],[x+1.45,1.85,z+1]],'#eed49a');cube(x+.5,z+1.02,.65,.1,1.3,['#89704d','#775641','#67513d']);}
function tree(x,z,i){let [a,b]=pt(x,0,z);oval(a,b,k*.75,k*.2,'#87975f');line(a,b,a,b-k*1.5,'#856d4d',k*.18);for(let j=0;j<4;j++)oval(a+Math.cos(j*2)*k*.39,b-k*(1.55+j*.14),k*.62,k*.75,['#6f955e','#90aa67','#abc47a','#8ca96a'][j])}
function plant(c){let [x,y]=pt(c.x,0,c.z),age=s.day-c.day,mature=age>=5;for(let j=-1;j<=1;j++){let u=x+j*k*.18,v=y+Math.abs(j)*k*.06,h=k*(mature?.78:.2+Math.max(0,age)*.09),sw=Math.sin(tick*1.7+c.z+j)*k*.035;line(u,v,u+sw,v-h,mature?'#997735':'#638247',k*.04);for(let q=0;q<4;q++)oval(u+sw+(q%2?1:-1)*k*.05,v-h+q*k*.077,k*.054,k*.12,mature?(q%2?'#eab851':'#f9d777'):'#8da75b',q%2?.55:-.55)}}
function person(){let [x,y]=pt(wx(),0,wz()),b=Math.sin(tick*12)*(stick||Object.values(keys).some(Boolean)?k*.035:0);oval(x,y,k*.35,k*.13,'#8a875d');line(x-k*.13,y-k*.35,x-k*.13,y,'#594e40',k*.15);line(x+k*.13,y-k*.35,x+k*.13,y,'#594e40',k*.15);oval(x,y-k*.55+b,k*.26,k*.34,'#517c78');oval(x,y-k*.98+b,k*.23,k*.25,'#c78f68');oval(x,y-k*1.16+b,k*.43,k*.10,'#b58b4e');oval(x,y-k*1.25+b,k*.28,k*.19,'#e5bc72');let dx=Math.sin(s.dir),dz=Math.cos(s.dir),a=pt(wx()+dx*.8,.65,wz()+dz*.8);line(x+k*.15,y-k*.62,a[0],a[1],'#977345',k*.055);if(s.tool==='網'){g.strokeStyle='#f7ead2';g.lineWidth=k*.065;g.beginPath();g.ellipse(a[0],a[1]-k*.16,k*.22,k*.28,-.55,0,7);g.stroke()}if(slash>0){g.strokeStyle='#fff1b8';g.lineWidth=4;g.beginPath();g.arc(x,y-k*.4,k*.85,-2.9,-.25);g.stroke()}}
return function draw(){
 const W=canvas.clientWidth,H=canvas.clientHeight,d=Math.min(devicePixelRatio,1.5);
 if(canvas.width!==Math.round(W*d)||canvas.height!==Math.round(H*d)){canvas.width=Math.round(W*d);canvas.height=Math.round(H*d)}
 g.setTransform(d,0,0,d,0,0);k=Math.min(W/12,H/15);cx=W/2-(wx()+.18*wz())*k;cy=H*.56-.62*wz()*k;
 g.fillStyle=s.time<1080?'#aec78c':'#8caa90';g.fillRect(0,0,W,H);
 function ground(x,z,w,h,col){face([[x,0,z],[x+w,0,z],[x+w,0,z+h],[x,0,z+h]],col)}
 for(const z of [-9,5])ground(-25,z-1,50,2,'#d9bb90');for(const x of [-7,6])ground(x-1,-23,2,34,'#d9bb90');
 const objects=[];for(const [i,[x,z]] of plots.entries()){
 const crops=s.fields[i]||[];for(const row of new Set(crops.map(c=>c.x)))ground(x+row-.6,z-3.1,1.2,6.3,'#a8815d');
 for(const c of crops)if(c.day)objects.push([z+c.z,()=>plant({...c,x:x+c.x,z:z+c.z})])
 }
 for(const b of blocks)objects.push([b.z+1,()=>house(b.x,b.z)]);
 for(const e of s.structures){let [x,z]=plots[e.place];objects.push([z+e.z,()=>cube(x+e.x,z+e.z,e.n==='塀'?1.6:.7,.4,e.n==='塀'?.7:1.7,['#d7b477','#b78d5d','#9a7453'])])}
 for(const b of s.bugs){let [x,z]=plots[b.place];objects.push([z+b.z,()=>{let [u,v]=pt(x+b.x,.6+.15*Math.sin(tick*8),z+b.z);oval(u,v,k*(b.big?.34:.22),k*.12,'#476b3e') }])}
 objects.push([3.6,()=>cube(3,3.6,1.2,.85,.98,['#dbb67c','#ad8256','#896548'])],[wz(),person]);
 objects.sort((a,b)=>a[0]-b[0]).forEach(o=>o[1]());
 g.font='bold 14px sans-serif';g.textAlign='center';for(const p of stops){if(p.active&&!p.active())continue;let [u,v]=pt(p.x,1.8,p.z),label=p.icon||p.title;let w=g.measureText(label).width+12;g.fillStyle='#fff3d8';g.fillRect(u-w/2,v-16,w,21);g.fillStyle='#374d38';g.fillText(label,u,v)}
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
