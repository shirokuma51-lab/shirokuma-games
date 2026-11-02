/* Deterministic game rules. Shared by the browser and generation tests. */
(function (root) {
  'use strict';
  const skills = [
    ['swim','いぬかき','水路を自動で渡る。泳ぎ方は犬から教わった。'],
    ['jump','ぴょん','穴を自動で飛び越える。着地はだいたい成功。'],
    ['slim','ぺらぺら','狭いすき間を通る。横向きに自信あり。'],
    ['map','まるみえ','地図ボタンで、この階の地形全体を見る。'],
    ['nose','おたから鼻','最寄りの食べ物の方向を表示する。'],
    ['exit','帰りたい本能','近い出口の方向を表示する。道順ではない。'],
    ['decode','解読','メモに「能力で解読する」が追加される。'],
    ['counter','カウンター','各階1回、自動で捕獲ダメージを防ぐ。']
  ].map(([id,name,description])=>({id,name,description}));
  const names=Object.fromEntries(skills.map(s=>[s.id,s.name]));
  const barriers={swim:2,jump:3,slim:4};
  function rng(seed){let t=seed>>>0;return()=>{t+=0x6D2B79F5;let n=Math.imul(t^t>>>15,t|1);n^=n+Math.imul(n^n>>>7,n|61);return ((n^n>>>14)>>>0)/4294967296;};}
  function derive(seed,branch){return (Math.imul(seed^0x9e3779b9,1664525)+1013904223+Math.imul(branch+1,2246822519))>>>0;}
  const dirs=[[0,-1],[1,0],[0,1],[-1,0]];
  function neighbors(grid,x,y){return dirs.map(([dx,dy])=>[x+dx,y+dy]).filter(([a,b])=>grid[b]?.[a]!==undefined&&grid[b][a]!==1);}
  function distances(grid,start){const q=[start],d=new Map([[start.join(','),0]]);for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const p of neighbors(grid,x,y)){const k=p.join(',');if(!d.has(k)){d.set(k,d.get(`${x},${y}`)+1);q.push(p);}}}return d;}
  function makeFloor(seed,floor,inventory=[],required=null){
    const random=rng(seed),size=13+2*Math.min(4,Math.floor((floor-1)/5));
    const grid=Array.from({length:size},()=>Array(size).fill(1));grid[1][1]=0;
    const stack=[[1,1]];
    while(stack.length){const [x,y]=stack.at(-1),choices=dirs.filter(([dx,dy])=>x+dx*2>0&&x+dx*2<size-1&&y+dy*2>0&&y+dy*2<size-1&&grid[y+dy*2][x+dx*2]===1);if(!choices.length){stack.pop();continue;}const [dx,dy]=choices[Math.floor(random()*choices.length)];grid[y+dy][x+dx]=0;grid[y+dy*2][x+dx*2]=0;stack.push([x+dx*2,y+dy*2]);}
    // Braid the maze: reconnect dead ends to nearby corridors, preserving the entrance gate.
    const ends=[];
    for(let y=1;y<size-1;y+=2)for(let x=1;x<size-1;x+=2)if(x+y>4)ends.push([x,y]);
    for(let i=ends.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ends[i],ends[j]]=[ends[j],ends[i]];}
    for(const [x,y] of ends){if(neighbors(grid,x,y).length!==1)continue;
      const openings=dirs.filter(([dx,dy])=>{const a=x+dx*2,b=y+dy*2;return a>0&&b>0&&a<size-1&&b<size-1&&x+dx+y+dy>4&&grid[y+dy][x+dx]===1&&grid[b][a]===0;});
      if(openings.length){const [dx,dy]=openings[Math.floor(random()*openings.length)];grid[y+dy][x+dx]=0;}
    }
    // Enlarge selected stretches, not the footprint: shortcuts keep walks compact.
    // Keep the entrance bridge and its adjacent walls untouched.
    const wideCount=3+Math.min(3,Math.floor(floor/7));
    for(let i=0;i<wideCount;i++){
      const x=3+2*Math.floor(random()*((size-5)/2)),y=3+2*Math.floor(random()*((size-5)/2));
      const horizontal=random()<.5,w=horizontal?3:2,h=horizontal?2:3;
      for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++)if(x+dx<size-1&&y+dy<size-1)grid[y+dy][x+dx]=0;
    }
    // A broad flooded chamber beyond the protected entrance on swimming floors.
    // Only water is carved here, so the swimming requirement cannot be bypassed.
    if(required==='swim')for(let y=1;y<=5;y++)for(let x=1;x<=5;x++)if(x+y>4)grid[y][x]=2;
    if(required){const gate=neighbors(grid,1,1)[0];grid[gate[1]][gate[0]]=barriers[required];}
    const dist=distances(grid,[1,1]);
    const cells=[...dist].map(([k,d])=>({p:k.split(',').map(Number),d})).filter(c=>grid[c.p[1]][c.p[0]]===0).sort((a,b)=>b.d-a.d);
    const dead=cells.filter(({p:[x,y]})=>neighbors(grid,x,y).length===1&&x+y>2);
    const first=cells[0].p,second=cells.find(c=>Math.abs(c.p[0]-first[0])+Math.abs(c.p[1]-first[1])>size/2).p;
    const used=new Set(['1,1',first.join(','),second.join(',')]);
    const offers=[0,1].map((_,i)=>{const available=skills.filter(s=>!inventory.includes(s.id));return available[Math.floor(random()*available.length)].id;});
    if(offers[0]===offers[1])offers[1]=skills.find(s=>s.id!==offers[0]&&!inventory.includes(s.id)).id;
    const doors=[first,second].map((p,i)=>{
      const options=[...inventory,offers[i]].filter(s=>barriers[s]);
      // A required traversal skill is always available before this choice.
      const req=floor<2||!options.length||random()<.25?null:options[Math.floor(random()*options.length)];
      return {x:p[0],y:p[1],offer:offers[i],required:req,seed:derive(seed,i),label:i?'月':'星'};
    });
    const take=(min,max)=>{const pool=cells.filter(c=>c.d>=min&&c.d<=max&&!used.has(c.p.join(',')));const c=pool[Math.floor(random()*pool.length)]||cells.find(c=>!used.has(c.p.join(',')));used.add(c.p.join(','));return {x:c.p[0],y:c.p[1]};};
    const max=cells[0].d;
    const notes=doors.map((door,i)=>({...take(6,max*.75),door:i}));
    const foods=[{...take(5,max),eaten:false}];
    const decor=[];
    const ghostCount=floor<=5?0:floor<=10?1:floor<=20?2:3;
    const ghosts=[];
    for(let i=0;i<ghostCount;i++){
      const start=take(10,max),route=[[start.x,start.y]];
      for(let j=0;j<5+Math.min(5,Math.floor(floor/5));j++){
        const [x,y]=route.at(-1),choices=neighbors(grid,x,y).filter(([a,b])=>grid[b][a]===0&&!route.some(p=>p[0]===a&&p[1]===b)&&!doors.some(d=>d.x===a&&d.y===b)&&dist.get(`${a},${b}`)>5);
        if(!choices.length)break;route.push(choices[Math.floor(random()*choices.length)]);
      }
      if(route.length<2){const p=neighbors(grid,start.x,start.y).find(([a,b])=>grid[b][a]===0);if(p)route.push(p);}
      ghosts.push({route,phase:random(),alive:true});
    }
    return {seed,floor,size,grid,doors,notes,foods,decor,ghosts,required};
  }
  function canEnter(tile,inventory){return tile===0||Object.entries(barriers).some(([id,n])=>n===tile&&inventory.includes(id));}
  function makePlaza(){const size=11,grid=Array.from({length:size},(_,y)=>Array.from({length:size},(_,x)=>x<2||x>8||y<1||y>9?1:0));
    grid[4][3]=grid[4][7]=1;
    return {seed:718,floor:0,size,grid,required:null,plaza:true,doors:[{x:5,y:2,label:'入口',entry:true}],
      notes:[{x:4,y:7,title:'まずは、歩いてみよう',text:'PC：矢印キー / WASDで移動。\nスマホ：左下のスティックを動かします。\nメモや扉の近くで「調べる」（E / Space）。'},
        {x:7,y:5,title:'扉を見分けよう',text:'金色の ★ は星の扉。青色の ☾ は月の扉。\nダンジョンではメモのマークと扉を見比べよう。\n覚える能力は最大4つ。覚えずに進むこともできます。'},
        {x:3,y:2,title:'準備ができたら',text:'中央の「入口」の扉を調べると、地下1階へ進めます。\nこの広場にお化けはいません。時間制限もありません。\n練習だけでは、保存中の冒険は消えません。'}],foods:[],decor:[],ghosts:[]};}
  function clue(door,floor){
    const answer=`${door.label}の扉の先：${door.required?names[door.required]+'が必要。':'移動能力なしで進める。'}`;
    if(floor<=5)return {text:answer,hint:'管理人のメモ。今回はそのまま読める。',answer};
    const code={swim:'ミズ',jump:'アナ',slim:'スキ',none:'ナシ'}[door.required||'none'];
    if(floor<=10)return {text:[...code].reverse().join(''),hint:`${door.label}の扉の情報。「うしろから読むべし」。ミズ＝いぬかき、アナ＝ぴょん、スキ＝ぺらぺら、ナシ＝移動能力不要。`,answer};
    if(floor<=20){const map={'ミ':'●','ズ':'△','ア':'□','ナ':'☆','ス':'◇','キ':'○','シ':'▽'};return {text:[...code].map(c=>map[c]).join(' ・ '),hint:`${door.label}の扉の情報。対応表：●ミ／△ズ／□ア／☆ナ／◇ス／○キ／▽シ。読めた言葉：ミズ＝水、アナ＝穴、スキ＝すき間、ナシ＝障害なし。`,answer};}
    const all=['swim','jump','slim',null],idx=all.indexOf(door.required),key=(door.seed%3)+1;
    const encoded=(idx+key)%4+1;
    return {text:`扉番号 ${encoded} ／ 時計を戻す数 ${key}`,hint:`${door.label}の扉の情報。管理人の時計は「1 水 → 2 穴 → 3 すき間 → 4 障害なし → 1」の順。扉番号から指定の数だけ逆へ戻る。ただし管理人は最後に左右を間違えたため、紙の「扉番号」は 5 − 書かれた番号 として読み直すこと。`,answer,encoded:5-encoded};
  }
  function visible(grid,px,py,x,y,radius=3.5){
    if(Math.hypot(x+.5-px,y+.5-py)>radius)return false;
    const dx=x+.5-px,dy=y+.5-py,steps=Math.ceil(Math.hypot(dx,dy)*12);
    for(let i=1;i<steps;i++){const a=Math.floor(px+dx*i/steps),b=Math.floor(py+dy*i/steps);if(a===x&&b===y)return true;if(grid[b]?.[a]===1)return false;}return true;
  }
  function ghostPosition(ghost,time){const route=ghost.route;if(route.length===1)return route[0].map(v=>v+.5);const length=route.length-1,p=(time*.85+ghost.phase*length)%(length*2),d=p>length?length*2-p:p,index=Math.min(length-1,Math.floor(d)),fraction=d-index;return [route[index][0]+.5+(route[index+1][0]-route[index][0])*fraction,route[index][1]+.5+(route[index+1][1]-route[index][1])*fraction];}
  function ghostHeading(ghost,time){const a=ghostPosition(ghost,time),b=ghostPosition(ghost,time+.001);return Math.atan2(b[0]-a[0],b[1]-a[1]);}
  root.ForgetfulCore={skills,names,barriers,rng,derive,makeFloor,makePlaza,canEnter,clue,visible,ghostPosition,ghostHeading,distances};
  if(typeof module!=='undefined')module.exports=root.ForgetfulCore;
})(typeof window!=='undefined'?window:globalThis);
