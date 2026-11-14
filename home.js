let catalog={subjects:[]};let active='';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function paint(){
 const subs=document.getElementById('subjects'),exams=document.getElementById('exams'),status=document.getElementById('status');
 subs.innerHTML=catalog.subjects.map(s=>`<button type="button" data-id="${esc(s.id)}" class="subject ${active===s.id?'active':''}"><span>${esc(s.name||s.id)}</span><span class="count">${s.exams.length}</span></button>`).join('');
 const s=catalog.subjects.find(x=>x.id===active);document.getElementById('subject-title').textContent=s?(s.name||s.id):'Chưa có môn học';
 exams.innerHTML=(s?.exams||[]).map(e=>{
   let progress='';try{const saved=JSON.parse(localStorage.getItem('quizlib:v2:'+e.file)||'null');if(saved?.phase==='result')progress=' · Đã nộp';else if(saved?.A?.some(x=>x.length))progress=' · Có tiến độ';}catch{}
   return `<a class="exam" href="./quiz.html?file=${encodeURIComponent(e.file)}"><span class="file-icon">▤</span><span class="exam-info"><strong>${esc(e.term)}</strong><div class="small">${e.count} câu hỏi${progress}</div></span><span class="chev">›</span></a>`;
 }).join('');status.hidden=!!(s?.exams.length);status.textContent=s?'Môn này chưa có bộ đề.':'Thư viện chưa có môn nào.';
}
document.getElementById('subjects').addEventListener('click',e=>{const b=e.target.closest('button[data-id]');if(!b)return;active=b.dataset.id;paint()});
fetch('./data/catalog.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{catalog=d;active=d.subjects?.[0]?.id||'';paint()}).catch(e=>{document.getElementById('status').hidden=false;document.getElementById('status').textContent='Không tải được danh sách đề: '+e.message+' (hãy mở qua web server hoặc GitHub Pages, không mở bằng file://).';document.getElementById('subject-title').textContent='Lỗi tải dữ liệu'});
