
(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const toIdx=v=>typeof v==='string'?v.trim().toUpperCase().charCodeAt(0)-65:Number(v);
let D,Q,A,CK,TRY,cur,S,tick,left,t0,review,warned,lastWrong=[];
let sourceKey='',dataFingerprint='', currentPhase='start', finishInfo=null;
const params=new URLSearchParams(location.search);
const requestedFile=params.get('file');
const saveKey=()=>`quizlib:v2:${sourceKey}`;
const starsKey=()=>`quizlib:stars:${sourceKey}`;
let stars=new Set();
function loadStars(){try{const arr=JSON.parse(safeStore('get',starsKey())||'[]');stars=new Set(Array.isArray(arr)?arr.filter(x=>Number.isInteger(x)&&x>=0):[])}catch{stars=new Set()}}
function saveStars(){safeStore('set',starsKey(),JSON.stringify([...stars]))}
function toggleStar(id){stars.has(id)?stars.delete(id):stars.add(id);saveStars();render()}
function safeStore(action, key, val){try {if(action==='set') localStorage.setItem(key,val);else if(action==='remove')localStorage.removeItem(key);else return localStorage.getItem(key)} catch(e){return null}}
function signature(d){return JSON.stringify(d).length+':'+d.questions.length+':'+(d.title||'')}
function saveProgress(){
 if(!D||!Q||!A||!sourceKey)return;
 const snapshot={version:2,fingerprint:dataFingerprint,phase:currentPhase,cur,S,
    Q:Q.map(q=>({id:q.id,order:q.o.map(o=>o.index)})),
    A:A.map(s=>[...s]),CK,TRY,review,warned,lastWrong,t0,
    deadline:S.time? t0+S.time*60000:null,finishInfo};
 safeStore('set',saveKey(),JSON.stringify(snapshot));
}
function getSaved(){try{const s=JSON.parse(safeStore('get',saveKey())||'null');return s?.version===2&&s.fingerprint===dataFingerprint?s:null}catch{return null}}
function refreshResume(){const saved=getSaved();$('#resume').hidden=!saved;$('#discard').hidden=!saved;
 if(saved)$('#resume').textContent=saved.phase==='result'?'Xem kết quả đã lưu':'Tiếp tục bài đang làm';}
function restoreProgress(){
 const s=getSaved();if(!s)return;
 S=s.S;Q=s.Q.map(record=>{
  const q=D.questions[record.id], answers=[].concat(q.answer).map(toIdx);
  let opts=q.options.map((t,index)=>({t,c:answers.includes(index),index}));
  return {id:record.id,q:q.q,img:q.img,ex:q.explain,o:record.order.map(index=>opts[index]),multi:answers.length>1};
 });
 A=s.A.map(a=>new Set(a));CK=s.CK;TRY=Array.isArray(s.TRY)&&s.TRY.length===Q.length?s.TRY:Q.map(()=>false);cur=Math.min(Math.max(s.cur,0),Q.length-1);
 review=s.review;warned=s.warned;lastWrong=s.lastWrong||[];t0=s.t0;finishInfo=s.finishInfo;
 $('#submit').hidden=review;$('#back').hidden=!review;
 clearInterval(tick);$('#timer').textContent='';$('#timer').classList.remove('low');
 if(s.phase==='result'&&finishInfo){currentPhase='result';showResult();return}
 currentPhase='quiz';
 if(S.time){
   left=Math.max(0,Math.ceil((s.deadline-Date.now())/1000));
   if(left<=0){finish();return}
   paintTime();tick=setInterval(()=>{left=Math.max(0,Math.ceil((s.deadline-Date.now())/1000));paintTime();if(left<=0)finish()},1000);
 }
 $('#navbox').open=Q.length<=30;show('quiz');render();
}
function setSource(src,d){sourceKey=src;dataFingerprint=signature(d);loadStars();loadData(d);refreshResume()}


function validate(d){
  if(!d||!Array.isArray(d.questions)||!d.questions.length)throw new Error('Thiếu mảng "questions" hoặc mảng rỗng.');
  d.questions.forEach((q,n)=>{
    if(!q.q)throw new Error('Câu '+(n+1)+': thiếu "q".');
    if(!Array.isArray(q.options)||q.options.length<2)throw new Error('Câu '+(n+1)+': "options" cần ít nhất 2 đáp án.');
    if(q.answer===undefined||q.answer==='')throw new Error('Câu '+(n+1)+': thiếu "answer".');
    [].concat(q.answer).forEach(a=>{const i=toIdx(a);if(!(i>=0&&i<q.options.length))throw new Error('Câu '+(n+1)+': "answer" không khớp đáp án nào.')});
  });
  return d;
}
function loadData(d){
  D=validate(d);
  $('#s-title').textContent=D.title||'Bài trắc nghiệm';
  document.title=D.title||'Trắc nghiệm';
  $('#s-desc').textContent=D.description||'';
  $('#s-meta').textContent=D.questions.length+' câu hỏi';
  $('#o-mode').value=D.mode==='end'?'end':'instant';
  $('#o-time').value=D.timeLimitMinutes||0;
  $('#o-sq').checked=!!D.shuffleQuestions;
  $('#o-so').checked=!!D.shuffleOptions;
  $('#o-an').checked=D.autoNext!==undefined?!!D.autoNext:D.questions.length>30;
  currentPhase='start';show('start');
}
function show(id){['start','quiz','result'].forEach(x=>$('#'+x).hidden=x!==id);$('#open-settings').hidden=id!=='quiz';window.scrollTo(0,0)}

function start(ids){
  S={mode:$('#o-mode').value,time:Math.max(0,+$('#o-time').value||0),sq:$('#o-sq').checked,so:$('#o-so').checked,an:$('#o-an').checked};
  let list=(ids||D.questions.map((_,i)=>i));
  if(S.sq)list=shuffle(list.slice());
  Q=list.map(id=>{
    const q=D.questions[id],ans=[].concat(q.answer).map(toIdx);
    let o=q.options.map((t,i)=>({t,c:ans.includes(i),index:i}));
    if(S.so&&!q.fixed)shuffle(o);
    return{id,q:q.q,img:q.img,ex:q.explain,o,multi:ans.length>1};
  });
  A=Q.map(()=>new Set());CK=Q.map(()=>false);TRY=Q.map(()=>false);cur=0;review=false;warned=false;finishInfo=null;currentPhase='quiz';
  t0=Date.now();clearInterval(tick);
  $('#timer').textContent='';$('#timer').classList.remove('low');
  if(S.time){left=S.time*60;paintTime();tick=setInterval(()=>{left=Math.max(0,Math.ceil((t0+S.time*60000-Date.now())/1000));paintTime();if(left<=0)finish()},1000)}
  $('#submit').hidden=false;$('#back').hidden=true;$('#submit').textContent='Nộp bài';
  $('#navbox').open=Q.length<=30;
  show('quiz');render();saveProgress();
}
function paintTime(){
  const m=Math.floor(Math.max(left,0)/60),s=Math.max(left,0)%60;
  $('#timer').textContent='Còn '+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  $('#timer').classList.toggle('low',left<=60);
}
const right=i=>{const q=Q[i];return q.o.every((o,k)=>o.c===A[i].has(k))};

function render(){
  const q=Q[cur],done=review||CK[cur];
  $('#prog').textContent='Câu '+(cur+1)+' / '+Q.length;
  $('#bar').style.width=((cur+1)/Q.length*100)+'%';
  const nd=CK.filter(Boolean).length,ng=Q.filter((_,i)=>CK[i]&&right(i)).length;
  $('#live').textContent=S.mode==='instant'&&!review?'Đúng '+ng+' · Sai '+(nd-ng):'';
  $('#navsum').textContent='Danh sách câu ('+A.filter(s=>s.size).length+'/'+Q.length+' đã làm)';
  let h='<div class="question-heading"><p class="qt">'+esc(q.q)+'</p>' +
    '<button type="button" id="star-toggle" class="star-toggle'+(stars.has(q.id)?' starred':'')+'" aria-pressed="'+stars.has(q.id)+'" title="'+(stars.has(q.id)?'Bỏ đánh dấu sao':'Đánh dấu sao')+'" aria-label="'+(stars.has(q.id)?'Bỏ đánh dấu sao':'Đánh dấu sao')+'">'+(stars.has(q.id)?'★':'☆')+'</button></div>';
  if(q.img)h+='<img src="'+esc(q.img)+'" alt="">';
  if(q.multi)h+='<p class="hint">Có nhiều đáp án đúng, chọn tất cả</p>';
  h+='<div class="opts">'+q.o.map((o,i)=>{
    const sel=A[cur].has(i);let c='opt'+(sel?' sel':'');
    if(done){c='opt';if(o.c)c+=' ok';else if(sel)c+=' bad'}
    else if(S.mode==='instant'&&TRY[cur]&&sel){c='opt'+(o.c?' ok':' bad')}
    return '<button class="'+c+'" data-i="'+i+'"'+(done?' disabled':'')+'><b>'+String.fromCharCode(65+i)+'</b><span>'+esc(o.t)+'</span></button>';
  }).join('')+'</div>';
  if(done&&q.ex)h+='<div class="ex">'+esc(q.ex)+'</div>';
  if(!done&&S.mode==='instant'&&TRY[cur])h+='<p class="err">Chưa chính xác, hãy thử lại.</p>';
  if(!done&&q.multi&&S.mode==='instant')h+='<div style="margin-top:14px"><button id="chk" class="btn">Kiểm tra</button></div>';
  $('#card').innerHTML=h;
  $('#prev').disabled=cur===0;$('#next').disabled=cur===Q.length-1;
  $('#nav').innerHTML=Q.map((_,i)=>{
    let c='nb';
    if(review)c+=right(i)?' right':' wrong';
    else if(S.mode==='instant'&&CK[i])c+=right(i)?' right':' wrong';
    else if(S.mode==='instant'&&TRY[i])c+=' wrong';
    else if(A[i].size)c+=' done';
    if(stars.has(Q[i].id))c+=' starred';
    if(i===cur)c+=' cur';
    return '<button class="'+c+'" data-n="'+i+'" title="'+(stars.has(Q[i].id)?'Đã gắn sao':'Câu '+(i+1))+'">'+(i+1)+(stars.has(Q[i].id)?'<span class="nav-star" aria-label="Đã gắn sao">★</span>':'')+'</button>';
  }).join('');
}

$('#card').addEventListener('click',e=>{
  if(e.target.closest('#star-toggle')){toggleStar(Q[cur].id);return}
  if(e.target.closest('#chk')){
    if(A[cur].size&&S.mode==='instant'){
      if(right(cur)){
        CK[cur]=true;TRY[cur]=false;render();saveProgress();
        if(S.an&&cur<Q.length-1){
          const at=cur;
          setTimeout(()=>{if(cur===at&&!review)go(at+1)},Q[cur].ex?1800:600);
        }
      }else{TRY[cur]=true;render();saveProgress()}
    }
    return;
  }
  const b=e.target.closest('.opt');if(!b||review||CK[cur])return;
  const i=+b.dataset.i,q=Q[cur];
  TRY[cur]=false;
  if(q.multi){
    A[cur].has(i)?A[cur].delete(i):A[cur].add(i);
  }else{
    A[cur]=new Set([i]);
    if(S.mode==='instant'){
      if(right(cur))CK[cur]=true;
      else TRY[cur]=true;
    }
  }
  render();saveProgress();
  if(S.an&&S.mode==='instant'&&CK[cur]&&!q.multi&&cur<Q.length-1){
    const at=cur;
    setTimeout(()=>{if(cur===at&&!review)go(at+1)},q.ex?1800:600);
  }
});
function go(n){if(n<0||n>=Q.length)return;cur=n;render();saveProgress();if(window.scrollY>0)window.scrollTo({top:0})}
$('#nav').addEventListener('click',e=>{const b=e.target.closest('.nb');if(b)go(+b.dataset.n)});
$('#prev').onclick=()=>go(cur-1);
$('#next').onclick=()=>go(cur+1);
document.addEventListener('keydown',e=>{
  if($('#quiz').hidden||/TEXTAREA|INPUT|SELECT/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='ArrowLeft')go(cur-1);
  else if(e.key==='ArrowRight'||(e.key==='Enter'&&e.target===document.body))go(cur+1);
  else if(e.key.length===1){
    const k=/\d/.test(e.key)?+e.key-1:e.key.toUpperCase().charCodeAt(0)-65;
    const b=$('#card').querySelector('.opt[data-i="'+k+'"]');
    if(b&&!b.disabled){e.preventDefault();b.click()}
  }
});
$('#submit').onclick=()=>{
  const un=A.filter(s=>!s.size).length;
  if(un&&!warned){warned=true;$('#submit').textContent='Còn '+un+' câu chưa làm. Bấm lần nữa để nộp';return}
  finish();
};

function finish(){
  if(currentPhase==='result')return;
  clearInterval(tick);
  const used=Math.round((Date.now()-t0)/1000);
  const ok=Q.filter((_,i)=>right(i)).length,n=Q.length;
  const skip=A.filter(s=>!s.size).length;
  lastWrong=Q.filter((_,i)=>!right(i)).map(q=>q.id);
  finishInfo={ok,n,skip,used};currentPhase='result';
  $('#r-score').textContent=(ok/n*10).toFixed(2).replace(/\.?0+$/,'')+' / 10';
  $('#r-stats').innerHTML=
    '<div><strong>'+ok+'/'+n+'</strong><span class="mute">câu đúng</span></div>'+
    '<div><strong>'+(n-ok-skip)+'</strong><span class="mute">câu sai</span></div>'+
    '<div><strong>'+skip+'</strong><span class="mute">bỏ trống</span></div>'+
    '<div><strong>'+Math.floor(used/60)+':'+String(used%60).padStart(2,'0')+'</strong><span class="mute">thời gian</span></div>';
  $('#r-wrong').hidden=!lastWrong.length;
  show('result');saveProgress();
}
function showResult(){
 const {ok,n,skip,used}=finishInfo;
 $('#r-score').textContent=(ok/n*10).toFixed(2).replace(/\.?0+$/,'')+' / 10';
 $('#r-stats').innerHTML='<div><strong>'+ok+'/'+n+'</strong><span class="mute">câu đúng</span></div>'+'<div><strong>'+(n-ok-skip)+'</strong><span class="mute">câu sai</span></div>'+'<div><strong>'+skip+'</strong><span class="mute">bỏ trống</span></div>'+'<div><strong>'+Math.floor(used/60)+':'+String(used%60).padStart(2,'0')+'</strong><span class="mute">thời gian</span></div>';
 $('#r-wrong').hidden=!lastWrong.length;show('result');
}
$('#r-review').onclick=()=>{review=true;cur=0;$('#submit').hidden=true;$('#back').hidden=false;$('#timer').textContent='';show('quiz');render();saveProgress()};
$('#back').onclick=()=>show('result');
$('#r-again').onclick=()=>start();
$('#r-wrong').onclick=()=>start(lastWrong);
$('#r-stars').onclick=()=>{const ids=Q.filter(q=>stars.has(q.id)).map(q=>q.id);if(ids.length)start(ids)};
$('#go').onclick=()=>{const saved=getSaved();if(saved&&!confirm('Bắt đầu bài mới sẽ thay thế tiến độ đã lưu. Anh có chắc muốn làm lại từ đầu?'))return;start()};
$('#resume').onclick=()=>restoreProgress();
$('#open-settings').onclick=()=>{refreshResume();show('start')};
$('#discard').onclick=()=>{if(confirm('Xóa tiến độ đã lưu của bộ đề này?')){safeStore('remove',saveKey());refreshResume()}};


async function initialize(){
 try{
  if(!requestedFile||!/^data\/[a-z0-9_-]+\/[A-Za-z0-9_-]+\.json$/.test(requestedFile))throw new Error('Đường dẫn đề không hợp lệ. Vui lòng chọn đề từ thư viện.');
  const response=await fetch('./'+requestedFile,{cache:'no-cache'});
  if(!response.ok)throw new Error('Không tải được bộ đề ('+response.status+').');
  setSource(requestedFile,await response.json());
  // Khi reload, tự trở lại bài đang làm thay vì hiển thị trang Bắt đầu.
  // Bài đã nộp cũng được mở lại ở màn hình kết quả.
  if(getSaved())restoreProgress();
 }catch(x){$('#s-title').textContent='Không mở được đề';$('#s-desc').textContent=x.message;$('#go').disabled=true}
}
initialize();
})();
