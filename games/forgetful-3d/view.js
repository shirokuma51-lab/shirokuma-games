/* Miniature renderer. Game rules and persistence live in game.js. */
window.createDungeonView = function(host) {
 const T=THREE,C=ForgetfulCore;
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.domElement.setAttribute('aria-label','周囲だけが見える3D迷路');host.append(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color('#050910');
 scene.add(new T.HemisphereLight(0xe4eaff,0x544056,1.8));const sun=new T.DirectionalLight(0xffe1af,2.6);sun.position.set(-4,8,5);scene.add(sun);
 const camera=new T.OrthographicCamera(-4,4,4,-4,.1,70);camera.position.set(0,9.45,7.3);camera.lookAt(0,.45,0);
 const playerUniform={value:new T.Vector3(1.5,0,1.5)},plazaUniform={value:0},materialCache=new Map();
 function mat(color,extra={}){const key=color+JSON.stringify(extra);if(materialCache.has(key))return materialCache.get(key);const m=new T.MeshStandardMaterial({color,roughness:.65,metalness:0,...extra});
 m.onBeforeCompile=shader=>{shader.uniforms.uExplorer=playerUniform;shader.uniforms.uPlaza=plazaUniform;shader.vertexShader='varying vec3 vDungeonWorld;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvDungeonWorld = (modelMatrix * vec4(transformed,1.0)).xyz;');shader.fragmentShader='uniform float uPlaza;\nuniform vec3 uExplorer;\nvarying vec3 vDungeonWorld;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','float lanternDistance=length(vDungeonWorld.xz-uExplorer.xz); float lanternFade=1.0-smoothstep(0.8,4.15,lanternDistance); outgoingLight *= mix(0.035 + 0.965 * lanternFade,1.0,uPlaza);\n#include <opaque_fragment>');};
 m.customProgramCacheKey=()=> 'dungeon-soft-light-v2';materialCache.set(key,m);return m;}
 const palette={skin:mat('#efbc8e'),hair:mat('#483344'),shirt:mat('#46877e'),hat:mat('#9c683e'),brim:mat('#b47e4c'),band:mat('#573d34'),gold:mat('#edbc61'),cape:mat('#8057ae'),capeDark:mat('#603f88'),pants:mat('#766958'),boots:mat('#513d35'),eyes:mat('#252938'),white:mat('#fff3d6'),bag:mat('#987450'),belt:mat('#504234')};
 const roundCache=new Map();
 function box(parent,w,h,d,x,y,z,material){
  const radius=Math.min(w,h,d)*.18,key=[w,h,d].join(',');let geo=roundCache.get(key);
  if(!geo){geo=new T.BoxGeometry(1,1,1,4,4,4);const p=geo.attributes.position,n=new T.Vector3(),inner=new T.Vector3();
   for(let i=0;i<p.count;i++){n.set(p.getX(i)*w,p.getY(i)*h,p.getZ(i)*d);inner.set(Math.max(-w/2+radius,Math.min(w/2-radius,n.x)),Math.max(-h/2+radius,Math.min(h/2-radius,n.y)),Math.max(-d/2+radius,Math.min(d/2-radius,n.z)));n.sub(inner).normalize().multiplyScalar(radius).add(inner);p.setXYZ(i,n.x,n.y,n.z);}geo.computeVertexNormals();roundCache.set(key,geo);}
  const m=new T.Mesh(geo,material);m.position.set(x,y,z);parent.add(m);return m;
 }
 const sphere=new T.SphereGeometry(1,20,14);
 function oval(parent,w,h,d,x,y,z,material){const m=new T.Mesh(sphere,material);m.scale.set(w/2,h/2,d/2);m.position.set(x,y,z);parent.add(m);return m;}
 const cylinderCache=new Map();
 function cylinder(parent,rt,rb,h,x,y,z,material){const key=[rt,rb,h].join();if(!cylinderCache.has(key))cylinderCache.set(key,new T.CylinderGeometry(rt,rb,h,32));const m=new T.Mesh(cylinderCache.get(key),material);m.position.set(x,y,z);parent.add(m);return m;}
 const hero=new T.Group(),body=new T.Group();hero.add(body);scene.add(hero);
 // A rounded miniature sculpt with the same costume and articulated joints.
 oval(body,.63,.68,.45,0,.95,0,palette.shirt);box(body,.57,.10,.40,0,.73,0,palette.belt);box(body,.13,.11,.035,0,.73,.225,palette.gold);
 oval(body,.74,.67,.61,0,1.55,0,palette.skin);
 oval(body,.75,.44,.62,0,1.75,-.045,palette.hair);oval(body,.14,.34,.17,-.32,1.61,.025,palette.hair);oval(body,.14,.32,.17,.32,1.62,.025,palette.hair);
 oval(body,.13,.18,.11,-.35,1.51,0,palette.skin);oval(body,.13,.18,.11,.35,1.51,0,palette.skin);
 oval(body,.085,.11,.045,-.14,1.57,.286,palette.eyes);oval(body,.085,.11,.045,.14,1.57,.286,palette.eyes);
 oval(body,.025,.032,.018,-.15,1.592,.308,palette.white);oval(body,.025,.032,.018,.13,1.592,.308,palette.white);
 oval(body,.12,.105,.12,0,1.46,.30,palette.skin);oval(body,.11,.026,.025,0,1.375,.272,palette.band);
 const blush=mat('#dd9984');oval(body,.12,.06,.02,-.22,1.445,.244,blush);oval(body,.12,.06,.02,.22,1.445,.244,blush);
 const brim=cylinder(body,.51,.49,.075,0,1.87,.015,palette.brim);brim.scale.z=.83;
 const crown=cylinder(body,.28,.34,.32,0,2.035,-.035,palette.hat);crown.scale.z=.88;
 const band=cylinder(body,.335,.342,.075,0,1.93,-.035,palette.band);band.scale.z=.89;
 box(body,.13,.12,.035,.19,1.93,.26,palette.gold);box(body,.055,.065,.04,.19,1.93,.28,palette.band);
 const feather=oval(body,.11,.34,.04,.36,2.14,-.02,palette.white);feather.rotation.z=-.3;
 const cape=new T.Group();cape.position.set(0,1.25,-.22);body.add(cape);
 const cloth=new T.CylinderGeometry(.26,.39,.78,20,1,true,Math.PI/2,Math.PI);const cloakMaterial=palette.cape.clone();cloakMaterial.side=T.DoubleSide;
 const cloak=new T.Mesh(cloth,cloakMaterial);cloak.position.set(0,-.32,.08);cape.add(cloak);
 oval(body,.72,.18,.48,0,1.22,0,palette.cape);oval(body,.12,.12,.06,.05,1.2,.255,palette.gold);
 box(body,.4,.42,.24,0,1,-.43,palette.bag);box(body,.42,.14,.25,0,1.23,-.43,palette.brim);box(body,.05,.38,.03,-.12,1,-.56,palette.band);box(body,.05,.38,.03,.12,1,-.56,palette.band);
 function limb(x,y,z,isArm){const pivot=new T.Group();pivot.position.set(x,y,z);body.add(pivot);if(isArm){oval(pivot,.23,.30,.25,0,-.13,0,palette.shirt);oval(pivot,.16,.26,.18,0,-.34,0,palette.skin);oval(pivot,.19,.18,.21,0,-.48,0,palette.band);}else{oval(pivot,.24,.39,.27,0,-.17,0,palette.pants);box(pivot,.26,.24,.36,0,-.43,.055,palette.boots);}return pivot;}
 const arms=[limb(-.39,1.15,0,true),limb(.39,1.15,0,true)],legs=[limb(-.155,.63,0,false),limb(.155,.63,0,false)];
 const shadow=new T.Mesh(new T.CircleGeometry(.41,16),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.24,depthWrite:false}));shadow.rotation.x=-Math.PI/2;scene.add(shadow);
 const ripples=[];for(let i=0;i<3;i++){const ring=new T.Mesh(new T.RingGeometry(.35,.37,24),new T.MeshBasicMaterial({color:'#bbf0ee',transparent:true,opacity:.5,side:T.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;scene.add(ring);ripples.push(ring);}

 // Shared procedural stone textures: irregular branching fissures and mineral specks.
 function stoneTexture(seed,wall){const random=C.rng(seed),canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle=wall?'#939b9b':'#a5aba7';ctx.fillRect(0,0,128,128);
  for(let i=0;i<480;i++){const n=Math.floor(110+random()*100);ctx.fillStyle=`rgba(${n},${n},${n},.12)`;ctx.fillRect(random()*128,random()*128,1+random()*3,1+random()*3);}
  let x=18+random()*30,y=12+random()*22;ctx.lineWidth=.7;ctx.strokeStyle=seed%4===0?'rgba(0,0,0,0)':'rgba(25,33,35,.46)';ctx.beginPath();ctx.moveTo(x,y);
  for(let i=0;i<5;i++){x+=5+random()*13;y+=8+random()*12;ctx.lineTo(x,y);if(i===2){ctx.moveTo(x,y);ctx.lineTo(x-10,y+8);ctx.lineTo(x-14,y+20);ctx.moveTo(x,y);}}ctx.stroke();
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;}
 const floorMat=[0,1,2].map(i=>mat(['#777b80','#81837f','#727b7b'][i],{map:stoneTexture(30+i,false)}));
 const wallMat=[0,1,2].map(i=>mat(['#68777b','#6c777a','#717b77'][i],{map:stoneTexture(80+i,true)}));
 const cap=mat('#89928a',{map:stoneTexture(112,true)}),water=mat('#257d90',{transparent:true,opacity:.9,roughness:.25});
 const vineMat=mat('#47664a'),leafMat=mat('#668258'),dropMat=mat('#a1dbe3',{transparent:true,opacity:.8,roughness:.1});
 const rippleGeometry=new T.RingGeometry(.08,.095,20),rippleMat=mat('#71bdc4',{transparent:true,opacity:.5,side:T.DoubleSide,depthWrite:false});
 // Camera-facing symbols remain recognizable from either side of a doorway.
 const doorSigns=['★','☾','入口'].map((label,i)=>{const c=document.createElement('canvas');c.width=256;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle=['#44321d','#163d65','#294c46'][i];ctx.strokeStyle=['#ffe19a','#92d6ff','#b6f4cf'][i];ctx.lineWidth=7;ctx.beginPath();ctx.roundRect(8,8,240,144,25);ctx.fill();ctx.stroke();ctx.fillStyle=ctx.strokeStyle;
  if(i===0){ctx.beginPath();for(let n=0;n<10;n++){const a=-Math.PI/2+n*Math.PI/5,r=n%2?22:49;const x=128+Math.cos(a)*r,y=80+Math.sin(a)*r;n?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();}
  else if(i===1){ctx.beginPath();ctx.arc(125,80,48,0,Math.PI*2);ctx.fill();ctx.fillStyle='#163d65';ctx.beginPath();ctx.arc(147,63,44,0,Math.PI*2);ctx.fill();}
  else{ctx.font='bold 65px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,128,82);}
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;return new T.SpriteMaterial({map,transparent:true,depthWrite:false});});
 let level=null,tiles=[],items=[],ghostModels=[],drips=[],waterRipples=[],torches=[];const dungeon=new T.Group();scene.add(dungeon);
 let trapModels=[];
 function load(next){trapModels=[];level=next;plazaUniform.value=level.plaza?1:0;host.classList.toggle('plaza',!!level.plaza);scene.background.set(level.plaza?'#23333b':'#050910');torches=[];dungeon.clear();tiles=[];items=[];ghostModels=[];drips=[];waterRipples=[];const random=C.rng(level.seed^0x71e8);
  for(let y=0;y<level.size;y++)for(let x=0;x<level.size;x++){
   const type=level.grid[y][x],g=new T.Group();g.position.set(x+.5,0,y+.5);dungeon.add(g);
   const stone=wallMat[(x*3+y)%3];
   if(type===1){box(g,.99,.94,.99,0,.42,0,stone);box(g,1,.08,1,0,.92,0,cap);
    const faces=[[0,1,0],[1,0,Math.PI/2],[0,-1,Math.PI],[-1,0,-Math.PI/2]];
    for(const [dx,dy,rotation] of faces){const neighbor=level.grid[y+dy]?.[x+dx];if(neighbor===undefined||neighbor===1)continue;
     const wet=neighbor===2;
     if(wet||random()<.19){const vine=new T.Group();vine.position.set(dx*.505,0,dy*.505);vine.rotation.y=rotation;g.add(vine);
      for(let i=0;i<4;i++){const stem=box(vine,.025,.20,.018,Math.sin(i*1.7)*.065,.87-i*.16,.012,vineMat);stem.rotation.z=Math.sin(i)*.25;const leaf=oval(vine,.14,.075,.035,(i%2?1:-1)*.07+stem.position.x,.83-i*.16,.025,leafMat);leaf.rotation.z=i%2?.45:-.45;}}
     if(wet){const drop=oval(dungeon,.055,.12,.055,x+.5+dx*.65,.7,y+.5+dy*.65,dropMat);drips.push({drop,phase:random()});}
    }
   }
   else if(type===2){box(g,1,.1,1,0,-.7,0,mat('#183e50'));box(g,1.005,.025,1.005,0,.025,0,water);const ring=new T.Mesh(rippleGeometry,rippleMat);ring.rotation.x=-Math.PI/2;ring.position.set((random()-.5)*.6,.045,(random()-.5)*.6);g.add(ring);waterRipples.push({ring,phase:random()});}
   else if(type===3){box(g,1,.1,1,0,-.7,0,mat('#03050b'));for(const dx of [-.45,.45])box(g,.08,.13,1,dx,-.04,0,stone);}
   else{const slab=box(g,.99,.13,.99,0,-.08,0,floorMat[(x+y)%3]);slab.rotation.y=((x*7+y*11)%4)*Math.PI/2;if(type===4){box(g,.34,.9,1,-.33,.4,0,stone);box(g,.34,.9,1,.33,.4,0,stone);}}
   tiles.push({g,x,y,type});
  }
  if(level.plaza){for(const [x,z] of [[2.25,3.3],[8.75,3.3],[2.25,7.5],[8.75,7.5]]){const torch=new T.Group();torch.position.set(x,0,z);dungeon.add(torch);box(torch,.19,.16,.19,0,.08,0,mat('#5b554a'));cylinder(torch,.055,.07,1.25,0,.7,0,mat('#705035'));cylinder(torch,.15,.085,.18,0,1.32,0,mat('#453d35'));const flame=oval(torch,.25,.43,.25,0,1.58,0,mat('#ffb94b',{emissive:'#ff862c',emissiveIntensity:1.5}));oval(torch,.12,.29,.12,0,1.54,.04,mat('#ffe7a2',{emissive:'#ffd27d',emissiveIntensity:1.8}));const light=new T.PointLight('#ffc775',4,6,2);light.position.set(0,1.8,0);torch.add(light);torches.push({flame,light,phase:x+z});}}
  for(const trap of level.traps||[]){const g=new T.Group();g.position.set(trap.x+.5,.02,trap.y+.5);dungeon.add(g);const idle=mat('#806851'),warn=mat('#ffba48'),active=mat('#c9514d');const plate=box(g,.81,.065,.81,0,.015,0,idle);const teeth=new T.Group();g.add(teeth);for(const x of [-.24,0,.24])for(const z of [-.19,.19])cylinder(teeth,0,.085,.36,x,.18,z,mat('#c5c5aa'));trapModels.push({trap,plate,teeth,idle,warn,active});}
  level.doors.forEach((d,i)=>{const g=new T.Group();g.position.set(d.x+.5,0,d.y+.5);dungeon.add(g);const kind=d.entry?2:i,trim=mat(['#eac46c','#73bdf3','#8ccbb0'][kind]);box(g,.12,1.15,.16,-.37,.575,0,trim);box(g,.12,1.15,.16,.37,.575,0,trim);box(g,.86,.14,.2,0,1.17,0,trim);box(g,.62,1,.08,0,.55,0,mat(['#826026','#285e9d','#3d7668'][kind]));oval(g,.09,.09,.08,.21,.5,.07,trim);const sign=new T.Sprite(doorSigns[kind]);sign.position.set(0,1.47,0);sign.scale.set(.85,.53,1);g.add(sign);items.push({g,x:d.x,y:d.y});});
  level.notes.forEach(n=>{const g=new T.Group();g.position.set(n.x+.5,0,n.y+.5);dungeon.add(g);box(g,.08,.36,.08,0,.18,0,mat('#917451'));box(g,.38,.32,.07,0,.47,0,mat('#e4cc97'));for(let i=0;i<3;i++)box(g,.25,.02,.015,0,.54-i*.06,.045,mat('#86714e'));items.push({g,x:n.x,y:n.y});});
  level.foods.forEach(f=>{const g=new T.Group();g.position.set(f.x+.5,.08,f.y+.5);dungeon.add(g);cylinder(g,.2,.2,.08,0,.08,0,mat('#dca159'));cylinder(g,.21,.21,.065,0,.15,0,mat('#62402c'));box(g,.39,.03,.39,0,.19,0,mat('#edc658'));cylinder(g,.23,.23,.04,0,.23,0,mat('#74a957'));oval(g,.46,.2,.46,0,.31,0,mat('#efb965'));items.push({g,x:f.x,y:f.y,food:f});});
  level.ghosts.forEach(ghost=>{const g=new T.Group();dungeon.add(g);oval(g,.62,.7,.5,0,.68,0,mat('#d0dded'));for(let i=-1;i<=1;i++)oval(g,.22,.25,.4,i*.19,.39,0,mat('#d0dded'));oval(g,.075,.11,.04,-.12,.76,.24,mat('#343248'));oval(g,.075,.11,.04,.12,.76,.24,mat('#343248'));ghostModels.push({g,ghost});});
 }
 function render(player,time,moving,heading,skills){if(!level)return;const swimming=level.grid[Math.floor(player.y)]?.[Math.floor(player.x)]===2;
  playerUniform.value.set(player.x,0,player.y);camera.position.set(player.x,9.45,player.y+7.3);
  hero.position.set(player.x,swimming?-.72:0,player.y);hero.rotation.y=heading;const wave=Math.sin(time*(swimming?6:10));
  const tile=level.grid[Math.floor(player.y)]?.[Math.floor(player.x)];hero.scale.x=tile===4?.55:1;
  if(tile===3)hero.position.y=.22+Math.abs(Math.sin(time*8))*.2;
  body.position.y=moving?(swimming?Math.sin(time*5)*.045:Math.abs(wave)*.055):0;body.rotation.x=swimming?-.2:0;
  for(let i=0;i<2;i++){const sign=i?1:-1;legs[i].rotation.x=moving?wave*.55*sign:0;arms[i].rotation.x=swimming?-.9+(moving?Math.sin(time*6+sign)*.55:0):(moving?-wave*.65*sign:0);arms[i].rotation.z=swimming?sign*(.7+(moving?Math.cos(time*6)*.22:0)):sign*.05;}
  cape.rotation.x=.08+(moving?Math.sin(time*8)*.1:0);shadow.visible=!swimming;shadow.position.set(player.x,.015,player.y);
  ripples.forEach((r,i)=>{r.visible=swimming;r.position.set(player.x,.06+i*.002,player.y);const phase=(time*.7+i/3)%1;r.scale.setScalar(.8+phase*1.7);r.material.opacity=(1-phase)*.38;});
  const visible=(x,y)=>C.visible(level.grid,player.x,player.y,x,y,4.5);
  // Geometry stays in place at its original height. Lighting, not popping walls,
  // marks the sight radius; collectibles and ghosts still respect wall occlusion.
  for(const {drop,phase} of drips){const fall=(time*.9+phase)%1;drop.position.y=.86-fall*.79;drop.scale.y=.06+fall*.09;}
  for(const {ring,phase} of waterRipples){const t=(time*.6+phase)%1;ring.scale.setScalar(.5+t*2.7);ring.visible=t<.9;}
  for(const item of items)item.g.visible=visible(item.x,item.y)&&(!item.food||!item.food.eaten);
  for(const {g,ghost} of ghostModels){const [x,y]=C.ghostPosition(ghost,time);g.position.set(x,Math.sin(time*3)*.045,y);g.rotation.y=C.ghostHeading(ghost,time);g.visible=ghost.alive&&visible(Math.floor(x),Math.floor(y));}
  for(const t of torches){const flicker=Math.sin(time*4+t.phase)*.035;t.flame.scale.y=.215+flicker*.25;t.light.intensity=4+flicker*3;}
  for(const m of trapModels){const p=C.trapPhase(m.trap,time);m.plate.material=p.active?m.active:p.warning?m.warn:m.idle;m.teeth.scale.y=p.active?1:.23;m.teeth.rotation.y=p.warning?Math.sin(time*32)*.09:0;m.teeth.position.y=.055;}
  renderer.render(scene,camera);
  // Screen-space circular vignette, anchored to a stable height, not the walking bob.
  const point=new T.Vector3(player.x,.85,player.y).project(camera);host.style.setProperty('--light-x',((point.x+1)*50)+'%');host.style.setProperty('--light-y',((1-point.y)*50)+'%');
 }
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);const aspect=w/h,vertical=Math.max(5.25,4.58/aspect);camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();}
 new ResizeObserver(resize).observe(host);resize();
 function setBrightness(percent){renderer.toneMappingExposure=1.05*percent/100;}
 return {load,render,setBrightness,camera,renderer,hero,scene};
};
