// Shared story scenes for both versions of the village.
const conversationArt = new URL('art/', document.currentScript.src).href;
let conversationTimer;
function stopConversation(){clearInterval(conversationTimer)}
function openConversation(i){
 const name=['ハナ','ゲン'][i], first=s.visits[i]!==s.day;
 advance(10);
 if(first){s.friends[i]++;s.visits[i]=s.day}
 save();
 const greeting=s.time<720?'おはよう。朝の空気は気持ちがいいね。':s.time<1080?'やあ、畑の調子はどうだい？':'こんばんは。今日も一日、お疲れさま。';
 const lines=[greeting, i===0?'麦に水をあげるなら、お昼になる前にね。毎朝のお世話が、収穫の楽しみになるよ。':'じょうろは道具袋に入っているぞ。育っている麦のそばで使ってみな。',
 s.friends[i]>=3?(localDay()>=13?'最近、大きな羽音を聞くんだ。大型のバッタにはスプレーが頼りになるよ。':'昼過ぎは群れが来やすいよ。遠出する前に、畑の備えを見ておくといい。'):(i===0?'鳥や虫の様子を、この手帳につけているんだ。もう少し分かったら、あなたにも教えるね。':'群れを追い越して、振り向いて網を振るんだ。困ったときはお互いさまさ。'),first?'顔を見せてくれてありがとう。また話そうね。':'今日はまた会えたね。無理せず、畑仕事を楽しんでおくれ。'];
 panel(name,'',[],false);dlg.classList.add('conversation-stage');
 const stage=document.createElement('div');stage.className='conversation-art';
 const portrait=document.createElement('img');portrait.src=conversationArt+(i===0?'hana':'gen')+'-portrait.png';portrait.alt=name+'の立ち絵';portrait.onerror=()=>{portrait.onerror=null;portrait.src=conversationArt+(i===0?'hana':'gen')+'.png'};
 stage.append(portrait);$('extra').append(stage);
 const meta=document.createElement('p');meta.className='conversation-meta';meta.textContent='立ち話 −10分 ・ 親密度 '+s.friends[i]+(first?'（＋1）':'');$('extra').append(meta);
 const history=document.createElement('div');history.className='conversation-history';history.setAttribute('aria-label','これまでの会話');$('extra').append(history);
 $('body').setAttribute('aria-live','off');
 const next=document.createElement('button');next.textContent='全文を表示';$('choices').append(next);
 let index=0,letters=0;
 function write(){stopConversation();letters=0;$('body').textContent='';next.textContent='全文を表示';if(matchMedia('(prefers-reduced-motion: reduce)').matches){reveal();return}conversationTimer=setInterval(()=>{if(document.hidden)return;letters++;$('body').textContent=lines[index].slice(0,letters);if(letters>=lines[index].length)reveal()},35)}
 function reveal(){stopConversation();letters=lines[index].length;$('body').textContent=lines[index];next.textContent=index===lines.length-1?'畑へ戻る':'次へ ▸'}
 next.onclick=()=>{if(letters<lines[index].length){reveal();return}if(index===lines.length-1){stopConversation();dlg.close();return}const p=document.createElement('p');p.textContent=name+'「'+lines[index]+'」';history.append(p);history.scrollTop=history.scrollHeight;index++;write()};
 write();
}
dlg.addEventListener('close',stopConversation);
const conversationStyle=document.createElement('style');conversationStyle.textContent=`
dialog.conversation-stage[open]{box-sizing:border-box;width:100%;max-width:650px;height:100dvh;max-height:100dvh;margin:auto;padding:0;border:0;border-radius:0;overflow:hidden;background:linear-gradient(#b9d9cf 0%,#e2e5bb 55%,#718e59 100%);color:#344437;display:grid;grid-template-rows:48px minmax(0,1fr) auto auto}
dialog.conversation-stage[open]>small{display:none}
dialog.conversation-stage[open] h2{grid-row:1;margin:0;padding:12px 22px;font-size:21px;background:#fff8e9e8;z-index:2}
dialog.conversation-stage[open] #extra{grid-row:2;position:relative;min-height:0;margin:0;overflow:hidden}
.conversation-art{position:absolute;inset:0;display:flex;justify-content:center;align-items:flex-end;background:radial-gradient(ellipse at bottom,#f2eedc 0,transparent 65%)}
.conversation-art img{height:96%;max-width:90%;object-fit:contain;object-position:bottom;filter:drop-shadow(5px 8px 7px #34513730)}
.conversation-meta{position:absolute;top:0;right:10px;padding:6px 10px;border-radius:12px;background:#fff8e9e8;font-size:12px}
.conversation-history{position:absolute;bottom:0;left:0;right:0;max-height:75px;overflow:auto;background:#fcf8eddf;font-size:12px;padding:0 14px}.conversation-history p{margin:7px 0}
dialog.conversation-stage[open] #body{grid-row:3;box-sizing:border-box;margin:0;min-height:132px;padding:18px 22px 10px;background:#fff9eefa;font-size:17px;line-height:1.8;white-space:pre-wrap;border-top:3px solid #c9b68d}
dialog.conversation-stage[open] #choices{grid-row:4;margin:0;padding:8px 18px max(14px,env(safe-area-inset-bottom));background:#fff9ee;display:flex;justify-content:flex-end}
dialog.conversation-stage[open] #choices button{min-height:46px;min-width:140px;margin:0}
@media(max-height:650px){dialog.conversation-stage[open] #body{min-height:110px;font-size:15px;padding:10px 18px}.conversation-history{max-height:42px}}
`;document.head.append(conversationStyle);
