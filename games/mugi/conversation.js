// Shared story scenes for both versions of the village.
const conversationArt = new URL('art/', document.currentScript.src).href;
let conversationTimer;
function stopConversation(){clearInterval(conversationTimer)}
function openConversation(i){
 const character=['hana','gen'][i], currentSeason=season();
 const name=['ハナ','ゲン'][i], first=s.visits[i]!==s.day;
 advance(10);
 if(first){s.friends[i]++;s.visits[i]=s.day}
 save();
 const greeting=s.time<720?'おはよう。朝の空気は気持ちがいいね。':s.time<1080?'やあ、畑の調子はどうだい？':'こんばんは。今日も一日、お疲れさま。';
 const textLines=[greeting, i===0?'麦に水をあげるなら、お昼になる前にね。毎朝のお世話が、収穫の楽しみになるよ。':'じょうろは道具袋に入っているぞ。育っている麦のそばで使ってみな。',
 s.friends[i]>=3?(localDay()>=13?'最近、大きな羽音を聞くんだ。大型のバッタにはスプレーが頼りになるよ。':'昼過ぎは群れが来やすいよ。遠出する前に、畑の備えを見ておくといい。'):(i===0?'鳥や虫の様子を、この手帳につけているんだ。もう少し分かったら、あなたにも教えるね。':'群れを追い越して、振り向いて網を振るんだ。困ったときはお互いさまさ。'),first?'顔を見せてくれてありがとう。また話そうね。':'今日はまた会えたね。無理せず、畑仕事を楽しんでおくれ。'];
 const expressions=['warm','warm',s.friends[i]>=3?'concerned':'warm','happy'];
 const lines=textLines.map((text,index)=>({text,expression:expressions[index]}));
 const portraitURL=expression=>conversationArt+'dialogue/'+character+'-'+expression+'.png';
 for(const expression of ['warm','happy','concerned']){const preload=new Image();preload.src=portraitURL(expression)}
 panel(name,'',[],false);dlg.classList.add('conversation-stage');
 const stage=document.createElement('div');stage.className='conversation-art';
 const background=document.createElement('img');background.className='conversation-background';background.alt=seasons[currentSeason]+'のむぎの丘';background.src=conversationArt+'dialogue/background-'+['spring','summer','autumn','winter'][currentSeason]+'.jpg';
 const portrait=document.createElement('img');portrait.className='conversation-portrait';portrait.src=portraitURL('warm');portrait.alt=name+'の上半身・穏やかな表情';portrait.onerror=()=>{portrait.onerror=null;portrait.src=portraitURL('warm')};
 stage.append(background,portrait);$('extra').append(stage);
 const seasonLabel=document.createElement('span');seasonLabel.className='conversation-season';seasonLabel.textContent=seasons[currentSeason]+'の丘';$('extra').append(seasonLabel);
 const meta=document.createElement('p');meta.className='conversation-meta';meta.textContent='立ち話 −10分 ・ 親密度 '+s.friends[i]+(first?'（＋1）':'');$('extra').append(meta);
 const history=document.createElement('div');history.className='conversation-history';history.setAttribute('aria-label','これまでの会話');$('extra').append(history);
 $('body').setAttribute('aria-live','off');
 const next=document.createElement('button');next.textContent='全文を表示';$('choices').append(next);
 let index=0,letters=0;
 function write(){stopConversation();portrait.src=portraitURL(lines[index].expression);portrait.alt=name+'の上半身・'+({warm:'穏やか',happy:'笑顔',concerned:'心配そう'})[lines[index].expression];portrait.dataset.expression=lines[index].expression;letters=0;$('body').textContent='';next.textContent='全文を表示';if(matchMedia('(prefers-reduced-motion: reduce)').matches){reveal();return}conversationTimer=setInterval(()=>{if(document.hidden)return;letters++;$('body').textContent=lines[index].text.slice(0,letters);if(letters>=lines[index].text.length)reveal()},35)}
 function reveal(){stopConversation();letters=lines[index].text.length;$('body').textContent=lines[index].text;next.textContent=index===lines.length-1?'畑へ戻る':'次へ ▸'}
 next.onclick=()=>{if(letters<lines[index].text.length){reveal();return}if(index===lines.length-1){stopConversation();dlg.close();return}const p=document.createElement('p');p.textContent=name+'「'+lines[index].text+'」';history.append(p);history.scrollTop=history.scrollHeight;index++;write()};
 write();
}
dlg.addEventListener('close',stopConversation);
const conversationStyle=document.createElement('style');conversationStyle.textContent=`
dialog.conversation-stage[open]{box-sizing:border-box;width:100%;max-width:650px;height:100dvh;max-height:100dvh;margin:auto;padding:0;border:0;border-radius:0;overflow:hidden;background:#c7d4a4;color:#000;display:grid;grid-template-rows:48px minmax(0,1fr) auto auto;color-scheme:light}
dialog.conversation-stage[open] *{color:#000}
dialog.conversation-stage[open]>small{display:none}
dialog.conversation-stage[open] h2{grid-row:1;margin:0;padding:10px 22px;font-size:21px;background:linear-gradient(100deg,#bccb96,#e1d49a);border-bottom:2px solid #8a774c;z-index:2;letter-spacing:.12em}
dialog.conversation-stage[open] #extra{grid-row:2;position:relative;min-height:0;margin:0;overflow:hidden}
.conversation-art{position:absolute;inset:0;overflow:hidden;background:#cad2aa}
.conversation-art .conversation-background{position:absolute;width:100%;height:100%;object-fit:cover;object-position:center 45%;filter:saturate(.85)}
.conversation-art .conversation-portrait{position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);height:88%;width:94%;object-fit:contain;object-position:center bottom;filter:drop-shadow(3px 5px 4px #443a2730)}
.conversation-meta{position:absolute;top:10px;right:10px;margin:0;padding:5px 9px;border:1px solid #9a895d;border-radius:12px;background:#e8dbaeeF;font-size:11px}
.conversation-season{position:absolute;top:10px;left:10px;padding:5px 9px;border-radius:12px;background:#d1dcb3ed;font-size:11px;border:1px solid #8b976b}
.conversation-history{position:absolute;bottom:0;left:0;right:0;max-height:58px;overflow:auto;background:#d9dfbbed;font-size:12px;padding:0 14px;border-top:1px solid #929d70}.conversation-history:empty{display:none}.conversation-history p{margin:7px 0}
dialog.conversation-stage[open] #body{grid-row:3;box-sizing:border-box;margin:0;min-height:140px;padding:18px 22px 10px;background:linear-gradient(115deg,#f0dba1,#e4ce91);font-size:17px;line-height:1.8;white-space:pre-wrap;border-top:5px double #8e7949;box-shadow:inset 5px 0 #b8c58c,inset -5px 0 #b8c58c}
dialog.conversation-stage[open] #choices{grid-row:4;margin:0;padding:8px 18px max(14px,env(safe-area-inset-bottom));background:#e4ce91;display:flex;justify-content:flex-end;box-shadow:inset 5px 0 #b8c58c,inset -5px 0 #b8c58c}
dialog.conversation-stage[open] #choices button{min-height:46px;min-width:140px;margin:0;background:#becd98;border:2px solid #7f895d;box-shadow:0 2px #9f8855;text-align:center;color:#000}
dialog.conversation-stage[open] #choices button:active{background:#aabf7e}
@media(max-height:650px){dialog.conversation-stage[open] #body{min-height:110px;font-size:15px;padding:10px 18px}.conversation-history{max-height:38px}.conversation-art .conversation-portrait{height:86%}}
`;document.head.append(conversationStyle);
