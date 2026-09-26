/* ============================= DATA LAYER ============================= */
const DB_KEY = 'studyhive_db_v2';
const SUBJECT_LIST = ["Mathematics","Physics","Chemistry","Biology","English","History","Geography","Computer Science","Programming","Statistics","Economics","Literature","Foreign Languages","Calculus","Algebra","Linear Algebra","Psychology","Philosophy"];
const STAGE_NAMES = ["Foundations","Core Skills","Applied Practice","Mastery"];
const STAGE_TOPICS = {
  0:["Getting started","Core vocabulary","Basic techniques","First problems"],
  1:["Intermediate concepts","Common patterns","Guided practice","Checkpoint review"],
  2:["Advanced theory","Complex problems","Case studies","Peer teaching"],
  3:["Expert techniques","Independent projects","Exam strategy","Final mastery"]
};
const MOCK_PEOPLE = [
  {id:'m1', name:'Diyora Yusupova', role:'teacher', level:'university', institution:'National University of Uzbekistan', subjects:['Mathematics','Calculus','Statistics'], bio:'PhD candidate in applied math. I tutor calculus and stats on weekends.'},
  {id:'m2', name:'Jasur Tashkentov', role:'student', level:'university', institution:'TUIT', subjects:['Computer Science','Programming'], bio:'3rd-year CS student, into algorithms and web dev.'},
  {id:'m3', name:'Mrs. Karimova', role:'teacher', level:'school', institution:'School No. 45', subjects:['Chemistry','Biology'], bio:'High school science teacher, 12 years experience.'},
  {id:'m4', name:'Aziz Norov', role:'student', level:'school', institution:'School No. 12', subjects:['English','History'], bio:'11th grade, strong in essay writing.'},
  {id:'m5', name:'Farrukh Aliyev', role:'teacher', level:'university', institution:'Turin Polytechnic', subjects:['Physics','Mathematics'], bio:'Physics TA. Mechanics and electromagnetism are my favorites.'},
  {id:'m6', name:'Malika Rashidova', role:'student', level:'university', institution:'WIUT', subjects:['Economics','Statistics'], bio:'Econ major, minoring in stats.'},
];
const LANGUAGES = {
  Spanish: {topics:[
    {name:'Greetings', words:[{w:'Hola',t:'Hello'},{w:'Buenos días',t:'Good morning'},{w:'Gracias',t:'Thank you'},{w:'Por favor',t:'Please'},{w:'Adiós',t:'Goodbye'}]},
    {name:'Everyday phrases', words:[{w:'¿Cómo estás?',t:'How are you?'},{w:'Me llamo...',t:'My name is...'},{w:'No entiendo',t:"I don't understand"},{w:'¿Dónde está...?',t:'Where is...?'},{w:'Lo siento',t:'I am sorry'}]},
    {name:'Numbers', words:[{w:'Uno',t:'One'},{w:'Dos',t:'Two'},{w:'Tres',t:'Three'},{w:'Diez',t:'Ten'},{w:'Cien',t:'One hundred'}]}
  ]},
  French: {topics:[
    {name:'Greetings', words:[{w:'Bonjour',t:'Hello'},{w:'Bonsoir',t:'Good evening'},{w:'Merci',t:'Thank you'},{w:"S'il vous plaît",t:'Please'},{w:'Au revoir',t:'Goodbye'}]},
    {name:'Everyday phrases', words:[{w:'Comment ça va?',t:'How are you?'},{w:"Je m'appelle...",t:'My name is...'},{w:'Je ne comprends pas',t:"I don't understand"},{w:'Où est...?',t:'Where is...?'},{w:'Désolé',t:'Sorry'}]},
    {name:'Numbers', words:[{w:'Un',t:'One'},{w:'Deux',t:'Two'},{w:'Trois',t:'Three'},{w:'Dix',t:'Ten'},{w:'Cent',t:'One hundred'}]}
  ]}
};

function nowStr(){ return new Date().toISOString(); }
function uid(prefix){ return prefix+'_'+Math.random().toString(36).slice(2,10); }
function escapeHtml(s){ const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }
function firstName(n){ return (n||'').split(' ')[0]; }
function timeAgo(iso){
  const s = Math.floor((Date.now()-new Date(iso).getTime())/1000);
  if(s<60) return 'just now'; if(s<3600) return Math.floor(s/60)+'m ago';
  if(s<86400) return Math.floor(s/3600)+'h ago'; return Math.floor(s/86400)+'d ago';
}
function formatDate(d){ return new Date(d+'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); }
function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

function loadDB(){
  let raw = localStorage.getItem(DB_KEY);
  const blank = { profile:null, posts:[], comments:{}, messages:{}, focus:{sessions:[]}, examPlans:[], customSubjects:[],
    clubs:[], clubMessages:{}, learning:{}, quizzes:[], quizAttempts:[], langProgress:{}, theme:'light' };
  if(!raw) return blank;
  try{ return { ...blank, ...JSON.parse(raw) }; } catch(e){ return blank; }
}
function saveDB(){ localStorage.setItem(DB_KEY, JSON.stringify(DB)); }
let DB = loadDB();
function allSubjects(){ return [...SUBJECT_LIST, ...(DB.customSubjects||[])]; }

function seedIfEmpty(){
  if(DB.posts.length===0){
    DB.posts.push({id:uid('p'), authorId:'m2', authorName:'Jasur Tashkentov', role:'student', level:'university', subject:'Programming', title:'Recursion vs iteration — when to choose which?', body:"I understand both work but I always freeze during interviews trying to decide which one to reach for. Any rule of thumb?", media:null, createdAt:nowStr(), solved:false});
    DB.posts.push({id:uid('p'), authorId:'m4', authorName:'Aziz Norov', role:'student', level:'school', subject:'History', title:'Causes of WWI — need a clearer structure for my essay', body:"I keep listing causes but my teacher says it reads like a list, not an argument. How do I connect them?", media:null, createdAt:nowStr(), solved:true});
    saveDB();
  }
  if(DB.clubs.length===0){
    DB.clubs.push(
      {id:'c1', name:'Calculus Study Circle', subject:'Calculus', level:'university', desc:'Weekly problem-solving sessions and past-paper review.', ownerId:'m1', ownerName:'Diyora Yusupova', members:['m1','m2'], createdAt:nowStr()},
      {id:'c2', name:'Chem Lab Survivors', subject:'Chemistry', level:'school', desc:'For anyone who needs their lab report to make sense before Friday.', ownerId:'m3', ownerName:'Mrs. Karimova', members:['m3'], createdAt:nowStr()},
      {id:'c3', name:'Code & Coffee', subject:'Programming', level:'university', desc:'Casual pair-programming and interview-prep meetups.', ownerId:'m2', ownerName:'Jasur Tashkentov', members:['m2','m6'], createdAt:nowStr()}
    );
    saveDB();
  }
  if(DB.quizzes.length===0){
    DB.quizzes.push({id:uid('q'), title:'Cell structure basics', subject:'Biology', topic:'Cell structure', level:'school', createdBy:'Mrs. Karimova', terms:[
      {term:'Mitochondria', def:'The organelle that produces energy for the cell'},
      {term:'Nucleus', def:'The organelle that holds the cell\'s DNA'},
      {term:'Ribosome', def:'The structure that builds proteins'},
      {term:'Cell membrane', def:'The barrier that controls what enters and exits the cell'}
    ], createdAt:nowStr()});
    saveDB();
  }
}

/* ============================= ONBOARDING ============================= */
let obState = { role:null, level:null, subjects:[] };
function pickRole(role){ obState.role=role; document.querySelectorAll('#onb-step1 [data-role]').forEach(b=>b.classList.toggle('on', b.dataset.role===role)); }
function pickLevel(level){
  obState.level=level;
  document.querySelectorAll('#onb-step1 [data-level]').forEach(b=>b.classList.toggle('on', b.dataset.level===level));
  document.getElementById('ob-inst-label').textContent = level==='school' ? 'School name' : 'University name';
}
function renderOnbSubjects(){
  document.getElementById('ob-subjects').innerHTML = allSubjects().map(s=>{
    const on = obState.subjects.includes(s);
    return `<button type="button" class="tag selectable ${on?'on':''}" onclick="toggleObSubject('${s.replace(/'/g,"\\'")}')">${s}</button>`;
  }).join('');
}
function toggleObSubject(s){ const i=obState.subjects.indexOf(s); if(i>-1) obState.subjects.splice(i,1); else obState.subjects.push(s); renderOnbSubjects(); }
function addCustomSubject(){
  const input=document.getElementById('ob-custom-subject'); const val=input.value.trim(); if(!val) return;
  if(!DB.customSubjects.includes(val) && !SUBJECT_LIST.includes(val)) DB.customSubjects.push(val);
  if(!obState.subjects.includes(val)) obState.subjects.push(val);
  input.value=''; renderOnbSubjects();
}
function onbNext(step){
  if(step===2 && (!obState.role || !obState.level)){ alert('Please select whether you are a student or teacher, and your level.'); return; }
  [1,2,3].forEach(n=>{ document.getElementById('onb-step'+n).style.display=(n===step)?'block':'none'; document.getElementById('dot'+n).classList.toggle('on', n<=step); });
  if(step===2) renderOnbSubjects();
}
function finishOnboarding(){
  const name = document.getElementById('ob-name').value.trim() || 'Anonymous';
  DB.profile = { id:'me', name, role:obState.role, level:obState.level, institution:document.getElementById('ob-institution').value.trim(),
    subjects:obState.subjects, bio:document.getElementById('ob-bio').value.trim(), createdAt:nowStr() };
  saveDB(); boot();
}

/* ============================= APP BOOT / NAV ============================= */
function applyTheme(){
  document.documentElement.setAttribute('data-theme', DB.theme==='dark' ? 'dark' : 'light');
  const lbl = document.getElementById('theme-label'); if(lbl) lbl.textContent = DB.theme==='dark' ? 'Light mode' : 'Dark mode';
}
function toggleTheme(){ DB.theme = DB.theme==='dark' ? 'light' : 'dark'; saveDB(); applyTheme(); }

function boot(){
  applyTheme();
  seedIfEmpty();
  if(!DB.profile){
    document.getElementById('intro').style.display='flex';
    document.getElementById('onboarding').style.display='none';
    document.getElementById('app').style.display='none';
    document.getElementById('ob-name').addEventListener('keydown', e=>{ if(e.key==='Enter') onbNext(2); });
    return;
  }
  document.getElementById('intro').style.display='none';
  document.getElementById('onboarding').style.display='none';
  document.getElementById('app').style.display='block';
  refreshRailUser(); populateSubjectSelects(); goTab('feed'); renderFocusStats(); restoreTimerUI();
}
function refreshRailUser(){
  document.getElementById('rail-name').textContent = DB.profile.name;
  document.getElementById('rail-sub').textContent = (DB.profile.role==='teacher'?'Teacher':'Student')+' · '+(DB.profile.level==='school'?'School':'University');
  const av=document.getElementById('rail-avatar'); av.textContent=DB.profile.name.slice(0,1).toUpperCase();
  av.style.background = DB.profile.level==='school' ? 'var(--school)' : 'var(--teal)';
}
function goTab(tab){
  ['feed','search','clubs','chat','focus','exam','learn','quizzes','langs','profile'].forEach(t=>{ document.getElementById('tab-'+t).style.display=(t===tab)?'block':'none'; });
  document.querySelectorAll('.nav-item[data-tab]').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  if(tab==='feed') renderFeed();
  if(tab==='search') renderDirectory();
  if(tab==='clubs') renderClubs();
  if(tab==='chat') renderChatList();
  if(tab==='exam') renderExamList();
  if(tab==='learn') renderLearnList();
  if(tab==='quizzes') renderQuizList();
  if(tab==='langs') renderLangsHome();
  if(tab==='profile') renderProfileTab();
}
function populateSubjectSelects(){
  const opts = allSubjects().map(s=>`<option value="${s}">${s}</option>`).join('');
  document.getElementById('post-subject').innerHTML = opts;
  document.getElementById('subject-filter').innerHTML = '<option value="">All subjects</option>'+opts;
  document.getElementById('club-subject').innerHTML = opts;
  document.getElementById('club-subject-filter').innerHTML = '<option value="">All subjects</option>'+opts;
  document.getElementById('quiz-subject-filter').innerHTML = '<option value="">All subjects</option>'+opts;
}
function closeModal(id){ document.getElementById(id).classList.remove('show'); }

/* ============================= FEED ============================= */
let feedFilters={level:'all',status:'all'};
function setLevelFilter(v){ feedFilters.level=v; document.querySelectorAll('#level-seg button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); renderFeed(); }
function setStatusFilter(v){ feedFilters.status=v; document.querySelectorAll('#status-seg button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); renderFeed(); }
function renderMedia(media){
  if(media.type.startsWith('image')) return `<div class="post-media"><img src="${media.data}"></div>`;
  if(media.type.startsWith('video')) return `<div class="post-media"><video src="${media.data}" controls></video></div>`;
  return '';
}
function renderFeed(){
  const subj=document.getElementById('subject-filter').value;
  let posts=[...DB.posts].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  if(feedFilters.level!=='all') posts=posts.filter(p=>p.level===feedFilters.level);
  if(feedFilters.status!=='all') posts=posts.filter(p=>feedFilters.status==='solved'?p.solved:!p.solved);
  if(subj) posts=posts.filter(p=>p.subject===subj);
  const list=document.getElementById('feed-list');
  if(posts.length===0){ list.innerHTML=`<div class="empty"><div class="serif">No problems here yet</div>Be the first to post one, or widen your filters.</div>`; return; }
  list.innerHTML = posts.map(p=>{
    const cCount=(DB.comments[p.id]||[]).length; const initials=p.authorName.slice(0,1).toUpperCase();
    const avatarColor = p.level==='school' ? 'var(--school)' : 'var(--teal)';
    return `<div class="card post">
      <div class="post-head"><div class="avatar" style="width:32px;height:32px;font-size:12px;background:${avatarColor};">${initials}</div>
        <div class="who"><b>${escapeHtml(p.authorName)}</b><div>${p.role==='teacher'?'Teacher':'Student'} · ${timeAgo(p.createdAt)}</div></div>
        <span class="pill ${p.level}" style="margin-left:auto;">${p.level==='school'?'School':'University'}</span></div>
      <h3>${escapeHtml(p.title)} ${p.solved?'<span class="solved-badge">SOLVED</span>':''}</h3>
      <p class="body">${escapeHtml(p.body)}</p>
      ${p.media?renderMedia(p.media):''}
      <span class="tag">${p.subject}</span>
      <div class="post-foot">
        <button onclick="openPostDetail('${p.id}')">💬 ${cCount} ${cCount===1?'reply':'replies'}</button>
        <button onclick="messageFromPost('${p.id}')">✉ Message ${firstName(p.authorName)}</button>
        ${p.authorId==='me'?`<button onclick="toggleSolved('${p.id}')">${p.solved?'Mark unsolved':'Mark solved'}</button>`:''}
      </div></div>`;
  }).join('');
}
let stagedPostMedia=null;
function openPostModal(){
  document.getElementById('post-title').value=''; document.getElementById('post-body').value='';
  document.getElementById('post-level').value=DB.profile.level; document.getElementById('post-media-name').textContent='';
  stagedPostMedia=null; document.getElementById('post-modal-bg').classList.add('show');
}
function stagePostMedia(e){
  const f=e.target.files[0]; if(!f) return;
  if(f.size>15*1024*1024){ alert('Please choose a file under 15MB.'); e.target.value=''; return; }
  const reader=new FileReader();
  reader.onload=()=>{ stagedPostMedia={type:f.type,data:reader.result,name:f.name}; document.getElementById('post-media-name').textContent='📎 '+f.name; };
  reader.readAsDataURL(f);
}
function submitPost(){
  const title=document.getElementById('post-title').value.trim(); const body=document.getElementById('post-body').value.trim();
  const subject=document.getElementById('post-subject').value; const level=document.getElementById('post-level').value;
  if(!title||!body){ alert('Please add a title and description.'); return; }
  DB.posts.unshift({id:uid('p'), authorId:'me', authorName:DB.profile.name, role:DB.profile.role, level, subject, title, body, media:stagedPostMedia, createdAt:nowStr(), solved:false});
  saveDB(); closeModal('post-modal-bg'); renderFeed();
}
function toggleSolved(id){ const p=DB.posts.find(x=>x.id===id); p.solved=!p.solved; saveDB(); renderFeed(); }
function openPostDetail(id){
  const p=DB.posts.find(x=>x.id===id); const comments=DB.comments[id]||[];
  document.getElementById('detail-modal-content').innerHTML = `
    <h2>${escapeHtml(p.title)}</h2>
    <div style="font-size:12.5px; color:var(--ink-soft); margin-bottom:10px;">${escapeHtml(p.authorName)} · ${p.subject} · ${p.level==='school'?'School':'University'}</div>
    <p style="font-size:14px; line-height:1.6; margin-bottom:12px;">${escapeHtml(p.body)}</p>
    ${p.media?renderMedia(p.media):''}
    <div style="border-top:1px solid var(--line); margin-top:8px; padding-top:14px;">
      <div style="font-size:13px; font-weight:700; margin-bottom:10px;">Replies</div>
      <div style="display:flex; flex-direction:column; gap:10px; max-height:220px; overflow-y:auto; margin-bottom:14px;">
        ${comments.length===0?'<div style="font-size:13px;color:var(--ink-soft);">No replies yet — be the first to help.</div>':
          comments.map(c=>`<div style="background:var(--paper); border-radius:8px; padding:9px 12px;"><div style="font-size:12px; font-weight:700;">${escapeHtml(c.authorName)} <span style="font-weight:400;color:var(--ink-soft);">· ${timeAgo(c.createdAt)}</span></div><div style="font-size:13.5px; margin-top:3px;">${escapeHtml(c.text)}</div></div>`).join('')}
      </div>
      <div style="display:flex; gap:8px;"><input id="comment-input" placeholder="Write a reply…" onkeydown="if(event.key==='Enter')submitComment('${id}')"><button class="btn primary small" onclick="submitComment('${id}')">Reply</button></div>
    </div>`;
  document.getElementById('detail-modal-bg').classList.add('show');
}
function submitComment(postId){
  const input=document.getElementById('comment-input'); const text=input.value.trim(); if(!text) return;
  if(!DB.comments[postId]) DB.comments[postId]=[];
  DB.comments[postId].push({authorName:DB.profile.name, text, createdAt:nowStr()});
  saveDB(); openPostDetail(postId); renderFeed();
}

/* ============================= SEARCH / DIRECTORY ============================= */
let peopleFilters={role:'all',level:'all'};
function setPeopleRole(v){ peopleFilters.role=v; document.querySelectorAll('#people-role-seg button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); renderDirectory(); }
function setPeopleLevel(v){ peopleFilters.level=v; document.querySelectorAll('#people-level-seg button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); renderDirectory(); }
function directoryPool(){ return [...MOCK_PEOPLE]; }
function renderDirectory(){
  const q=(document.getElementById('people-search').value||'').toLowerCase().trim();
  let people=directoryPool();
  if(peopleFilters.role!=='all') people=people.filter(p=>p.role===peopleFilters.role);
  if(peopleFilters.level!=='all') people=people.filter(p=>p.level===peopleFilters.level);
  if(q) people=people.filter(p=>p.name.toLowerCase().includes(q)||p.subjects.some(s=>s.toLowerCase().includes(q)));
  const list=document.getElementById('directory-list');
  if(people.length===0){ list.innerHTML=`<div class="empty"><div class="serif">No one matches yet</div>Try a different subject or clear your filters.</div>`; return; }
  list.innerHTML = people.map(p=>{
    const avatarColor=p.level==='school'?'var(--school)':'var(--teal)';
    return `<div class="card person">
      <div class="avatar" style="background:${avatarColor};">${p.name.slice(0,1).toUpperCase()}</div>
      <div class="info">
        <div style="display:flex; align-items:center; gap:8px;"><b>${escapeHtml(p.name)}</b><span class="pill ${p.level}">${p.level==='school'?'School':'University'}</span></div>
        <div class="role">${p.role==='teacher'?'Teacher / Tutor':'Student'} · ${escapeHtml(p.institution||'')}</div>
        <div style="font-size:13px; opacity:.85; margin-bottom:8px;">${escapeHtml(p.bio||'')}</div>
        <div>${p.subjects.map(s=>`<span class="tag">${s}</span>`).join('')}</div>
      </div>
      <button class="btn small" onclick="openChatWith('${p.id}')">Message</button>
    </div>`;
  }).join('');
}

/* ============================= CLUBS ============================= */
let clubFilters={level:'all',mine:'all'};
function setClubLevelFilter(v){ clubFilters.level=v; document.querySelectorAll('#club-level-seg button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); renderClubs(); }
function setClubMineFilter(v){ clubFilters.mine=v; document.querySelectorAll('#club-mine-seg button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); renderClubs(); }
function isMemberOfClub(c){ return c.members.includes('me'); }
function clubLevelLabel(level){ return level==='school'?'School':level==='university'?'University':'School & University'; }
function renderClubs(){
  const q=(document.getElementById('club-search').value||'').toLowerCase().trim(); const subj=document.getElementById('club-subject-filter').value;
  let clubs=[...DB.clubs].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  if(clubFilters.level!=='all') clubs=clubs.filter(c=>c.level===clubFilters.level||c.level==='both');
  if(subj) clubs=clubs.filter(c=>c.subject===subj);
  if(clubFilters.mine==='mine') clubs=clubs.filter(c=>isMemberOfClub(c));
  if(q) clubs=clubs.filter(c=>c.name.toLowerCase().includes(q)||c.subject.toLowerCase().includes(q)||(c.desc||'').toLowerCase().includes(q));
  const list=document.getElementById('clubs-list');
  if(clubs.length===0){ list.innerHTML=`<div class="empty"><div class="serif">No clubs match yet</div>Try different filters, or start your own club.</div>`; return; }
  list.innerHTML = clubs.map(c=>{
    const joined=isMemberOfClub(c);
    return `<div class="card post" style="cursor:pointer;" onclick="openClubDetail('${c.id}')">
      <div class="post-head"><span class="pill school">${clubLevelLabel(c.level)}</span><span class="tag" style="margin-left:6px;">${c.subject}</span><span style="margin-left:auto; font-size:12px; color:var(--ink-soft);">${c.members.length} member${c.members.length===1?'':'s'}</span></div>
      <h3>${escapeHtml(c.name)}</h3><p class="body">${escapeHtml(c.desc||'')}</p>
      <div class="post-foot"><span>Run by ${escapeHtml(c.ownerName)}</span>
        <button onclick="event.stopPropagation(); ${joined?`leaveClub('${c.id}')`:`joinClub('${c.id}')`}" style="margin-left:auto; color:${joined?'var(--coral)':'var(--teal)'};">${joined?'Leave club':'Join club'}</button></div>
    </div>`;
  }).join('');
}
function openClubModal(){ document.getElementById('club-name').value=''; document.getElementById('club-desc').value=''; document.getElementById('club-level').value=DB.profile.level; document.getElementById('club-modal-bg').classList.add('show'); }
function submitClub(){
  const name=document.getElementById('club-name').value.trim(); const subject=document.getElementById('club-subject').value;
  const level=document.getElementById('club-level').value; const desc=document.getElementById('club-desc').value.trim();
  if(!name){ alert('Please name your club.'); return; }
  DB.clubs.unshift({id:uid('c'), name, subject, level, desc, ownerId:'me', ownerName:DB.profile.name, members:['me'], createdAt:nowStr()});
  saveDB(); closeModal('club-modal-bg'); renderClubs();
}
function joinClub(id){ const c=DB.clubs.find(x=>x.id===id); if(!c.members.includes('me')) c.members.push('me'); saveDB(); renderClubs(); if(document.getElementById('club-detail-bg').classList.contains('show')) openClubDetail(id); }
function leaveClub(id){
  const c=DB.clubs.find(x=>x.id===id);
  if(c.ownerId==='me'){ alert("You created this club, so you can't leave it — delete it instead from inside the club."); return; }
  c.members=c.members.filter(m=>m!=='me'); saveDB(); renderClubs(); if(document.getElementById('club-detail-bg').classList.contains('show')) openClubDetail(id);
}
function deleteClub(id){
  if(!confirm('Delete this club? This removes its discussion for everyone (on this device).')) return;
  DB.clubs=DB.clubs.filter(x=>x.id!==id); delete DB.clubMessages[id]; saveDB(); closeModal('club-detail-bg'); renderClubs();
}
function clubMemberNames(c){ return c.members.map(id=> id==='me'?DB.profile.name:(MOCK_PEOPLE.find(p=>p.id===id)?.name||id) ); }
function openClubDetail(id){
  const c=DB.clubs.find(x=>x.id===id); if(!DB.clubMessages[id]) DB.clubMessages[id]=[];
  const joined=isMemberOfClub(c); const msgs=DB.clubMessages[id];
  document.getElementById('club-detail-content').innerHTML = `
    <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
      <div><span class="pill school">${clubLevelLabel(c.level)}</span><span class="tag" style="margin-left:6px;">${c.subject}</span><h2 style="margin-top:8px;">${escapeHtml(c.name)}</h2></div>
      <div style="display:flex; gap:8px; flex:none;"><button class="btn small" onclick="openLiveCamera('${escapeHtml(c.name)}')">🎥 Live camera</button>
        ${c.ownerId!=='me'?`<button class="btn small" onclick="${joined?`leaveClub('${c.id}')`:`joinClub('${c.id}')`}" style="${joined?'border-color:var(--coral); color:var(--coral);':''}">${joined?'Leave club':'Join club'}</button>`:''}</div>
    </div>
    <p style="font-size:13.5px; opacity:.85; margin:10px 0 14px;">${escapeHtml(c.desc||'')}</p>
    <div style="font-size:12px; color:var(--ink-soft); margin-bottom:14px;">Run by ${escapeHtml(c.ownerName)} · ${clubMemberNames(c).length} members: ${clubMemberNames(c).map(escapeHtml).join(', ')}</div>
    <div style="border-top:1px solid var(--line); padding-top:14px;">
      <div style="font-size:13px; font-weight:700; margin-bottom:10px;">Club discussion</div>
      <div style="display:flex; flex-direction:column; gap:10px; max-height:260px; overflow-y:auto; margin-bottom:14px;">
        ${msgs.length===0?'<div style="font-size:13px;color:var(--ink-soft);">No messages yet — say hello to the club.</div>':
          msgs.map(m=>{
            let mediaHtml=''; if(m.media){ mediaHtml=m.media.type.startsWith('image')?`<img src="${m.media.data}" style="max-width:220px;border-radius:8px;margin-top:6px;display:block;">`:`<video src="${m.media.data}" controls style="max-width:260px;border-radius:8px;margin-top:6px;display:block;"></video>`; }
            return `<div style="background:var(--paper); border-radius:8px; padding:9px 12px;"><div style="font-size:12px; font-weight:700;">${escapeHtml(m.authorName)} <span style="font-weight:400;color:var(--ink-soft);">· ${timeAgo(m.createdAt)}</span></div>${m.text?`<div style="font-size:13.5px; margin-top:3px;">${escapeHtml(m.text)}</div>`:''}${mediaHtml}</div>`;
          }).join('')}
      </div>
      ${joined?`<div style="display:flex; gap:8px; align-items:center;"><label class="upload-btn" style="padding:9px 11px;">📎<input type="file" id="club-msg-media" accept="image/*,video/*" style="display:none" onchange="stageClubMedia(event)"></label><input id="club-msg-input" placeholder="Message the club…" onkeydown="if(event.key==='Enter')submitClubMessage('${id}')"><button class="btn primary small" onclick="submitClubMessage('${id}')">Send</button></div><div id="club-media-preview" style="display:none; font-size:12px; color:var(--ink-soft); margin-top:6px;"></div>`:`<div style="font-size:12.5px; color:var(--ink-soft);">Join the club to post in the discussion.</div>`}
    </div>
    <div style="display:flex; gap:10px; margin-top:16px;"><button class="btn" onclick="closeModal('club-detail-bg')">Close</button>${c.ownerId==='me'?`<button class="btn" style="border-color:var(--coral); color:var(--coral);" onclick="deleteClub('${c.id}')">Delete club</button>`:''}</div>`;
  document.getElementById('club-detail-bg').classList.add('show');
}
let stagedClubMedia=null;
function stageClubMedia(e){
  const f=e.target.files[0]; if(!f) return; if(f.size>15*1024*1024){ alert('Please choose a file under 15MB.'); e.target.value=''; return; }
  const reader=new FileReader();
  reader.onload=()=>{ stagedClubMedia={type:f.type,data:reader.result}; const prev=document.getElementById('club-media-preview'); if(prev){ prev.style.display='block'; prev.textContent='📎 attached'; } };
  reader.readAsDataURL(f);
}
function submitClubMessage(clubId){
  const input=document.getElementById('club-msg-input'); const text=input.value.trim(); if(!text && !stagedClubMedia) return;
  DB.clubMessages[clubId].push({authorName:DB.profile.name, text, media:stagedClubMedia, createdAt:nowStr()}); stagedClubMedia=null; saveDB(); openClubDetail(clubId);
}

/* ============================= CHAT ============================= */
let activeChatId=null;
function personById(id){ if(id==='me') return DB.profile; return MOCK_PEOPLE.find(p=>p.id===id); }
function conversationsList(){ return Object.keys(DB.messages); }
function openChatWith(personId){ if(!DB.messages[personId]) DB.messages[personId]=[]; saveDB(); goTab('chat'); activeChatId=personId; renderChatList(); renderChatMain(); }
function messageFromPost(postId){
  const p=DB.posts.find(x=>x.id===postId); const pid=p.authorId==='me'?null:p.authorId;
  if(!pid){ alert("This is your own post."); return; }
  openChatWith(pid); document.getElementById('chat-text').value = 'Hi! I saw your post — "'+p.title+'". ';
}
function renderChatList(){
  const ids=conversationsList(); const wrap=document.getElementById('chat-list');
  if(ids.length===0){ wrap.innerHTML=`<div style="padding:20px 16px; font-size:12.5px; color:var(--ink-soft);">No conversations yet. Message someone from Find Someone or from a problem post.</div>`; return; }
  wrap.innerHTML = ids.map(id=>{
    const person=personById(id); if(!person) return '';
    const msgs=DB.messages[id]||[]; const last=msgs[msgs.length-1];
    const avatarColor=person.level==='school'?'var(--school)':'var(--teal)';
    return `<button class="chat-list-item ${id===activeChatId?'active':''}" onclick="activeChatId='${id}'; renderChatList(); renderChatMain();">
      <div class="avatar" style="width:30px;height:30px;font-size:12px;background:${avatarColor};">${person.name.slice(0,1).toUpperCase()}</div>
      <div class="txt"><b>${escapeHtml(person.name)}</b><span>${last?(last.text?escapeHtml(last.text.slice(0,28)):'📎 attachment'):'Say hi 👋'}</span></div>
    </button>`;
  }).join('');
}
function renderChatMain(){
  const head=document.getElementById('chat-head'); const body=document.getElementById('chat-body');
  if(!activeChatId){ head.innerHTML='<span style="color:var(--ink-soft); font-size:13.5px;">Select a conversation</span>'; body.innerHTML=''; return; }
  const person=personById(activeChatId);
  head.innerHTML = `<div class="avatar" style="width:30px;height:30px;font-size:12px;background:var(--teal);">${person.name.slice(0,1).toUpperCase()}</div><b style="font-size:13.5px;">${escapeHtml(person.name)}</b><button class="btn small" style="margin-left:auto;" onclick="openLiveCamera('${escapeHtml(person.name)}')">🎥 Live camera</button>`;
  const msgs=DB.messages[activeChatId]||[];
  if(msgs.length===0){ body.innerHTML=`<div style="margin:auto; color:var(--ink-soft); font-size:13px; text-align:center;">This is the start of your conversation with ${escapeHtml(person.name)}.</div>`; }
  else {
    body.innerHTML = msgs.map(m=>{
      let mediaHtml=''; if(m.media){ mediaHtml=m.media.type.startsWith('image')?`<img src="${m.media.data}">`:`<video src="${m.media.data}" controls style="max-width:220px;border-radius:8px;margin-top:5px;"></video>`; }
      return `<div class="msg ${m.from==='me'?'me':'them'}">${m.text?escapeHtml(m.text):''}${mediaHtml}</div>`;
    }).join('');
  }
  body.scrollTop = body.scrollHeight;
}
let stagedChatMedia=null;
function stageChatMedia(e){
  const f=e.target.files[0]; if(!f) return; if(f.size>15*1024*1024){ alert('Please choose a file under 15MB.'); e.target.value=''; return; }
  const reader=new FileReader();
  reader.onload=()=>{ stagedChatMedia={type:f.type,data:reader.result}; const prev=document.getElementById('chat-media-preview'); prev.style.display='block'; prev.textContent='📎 attached'; };
  reader.readAsDataURL(f);
}
function sendMessage(){
  if(!activeChatId) return;
  const input=document.getElementById('chat-text'); const text=input.value.trim(); if(!text && !stagedChatMedia) return;
  DB.messages[activeChatId].push({from:'me', text, media:stagedChatMedia, at:nowStr()});
  input.value=''; stagedChatMedia=null; document.getElementById('chat-media-preview').style.display='none';
  saveDB(); renderChatMain(); renderChatList();
  setTimeout(()=>{
    const replies=["Thanks for reaching out — can you share more detail on where exactly you're stuck?","Sure, happy to help. Could you post the exact question or a photo of it?","Got it, give me a moment to look at this properly.","I've helped with something similar before — let's work through it step by step."];
    DB.messages[activeChatId].push({from:'them', text:replies[Math.floor(Math.random()*replies.length)], media:null, at:nowStr()});
    saveDB(); renderChatMain(); renderChatList();
  }, 900);
}

/* ============================= FOCUS TIMER ============================= */
let timerLen=25*60, timerLeft=25*60, timerRunning=false, timerInterval=null, timerModeLabel='FOCUS SESSION';
const RING_LEN=741.5;
function setTimerLength(mins,label){ if(timerRunning) return; timerLen=mins*60; timerLeft=mins*60; timerModeLabel=label; updateTimerDisplay(); }
function updateTimerDisplay(){
  const m=Math.floor(timerLeft/60).toString().padStart(2,'0'); const s=Math.floor(timerLeft%60).toString().padStart(2,'0');
  document.getElementById('timer-display').textContent = m+':'+s;
  document.getElementById('timer-mode').textContent = timerModeLabel;
  const frac = timerLeft/timerLen;
  document.getElementById('ring-progress').setAttribute('stroke-dashoffset', RING_LEN*(1-frac));
}
function toggleTimer(){
  timerRunning=!timerRunning; document.getElementById('timer-toggle').textContent = timerRunning?'Pause':'Start';
  if(timerRunning){
    timerInterval=setInterval(()=>{
      timerLeft--;
      if(timerLeft<=0){
        clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-toggle').textContent='Start';
        if(timerModeLabel.includes('FOCUS')){ DB.focus.sessions.push({at:nowStr(), minutes:timerLen/60}); saveDB(); renderFocusStats(); }
        timerLeft=0; updateTimerDisplay();
        alert(timerModeLabel.includes('FOCUS') ? "Nice work — session complete! Time for a break." : "Break's over — ready to focus again?");
        return;
      }
      updateTimerDisplay();
    },1000);
  } else clearInterval(timerInterval);
}
function resetTimer(){ clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-toggle').textContent='Start'; timerLeft=timerLen; updateTimerDisplay(); }
function restoreTimerUI(){ updateTimerDisplay(); }
function renderFocusStats(){
  const sessions=DB.focus.sessions; const today=new Date().toDateString();
  document.getElementById('stat-today').textContent = sessions.filter(s=>new Date(s.at).toDateString()===today).length;
  document.getElementById('stat-total').textContent = sessions.length;
  document.getElementById('stat-minutes').textContent = Math.round(sessions.reduce((a,s)=>a+s.minutes,0));
}

/* ============================= EXAM PLANNER ============================= */
let examTopicsDraft=[];
function openExamModal(){ document.getElementById('exam-name').value=''; document.getElementById('exam-date').value=''; document.getElementById('exam-hours').value=2; examTopicsDraft=[]; renderExamTopicsDraft(); document.getElementById('exam-modal-bg').classList.add('show'); }
function addExamTopic(){ const input=document.getElementById('exam-topic-input'); const v=input.value.trim(); if(!v) return; examTopicsDraft.push(v); input.value=''; renderExamTopicsDraft(); }
function removeExamTopicDraft(i){ examTopicsDraft.splice(i,1); renderExamTopicsDraft(); }
function renderExamTopicsDraft(){
  document.getElementById('exam-topics-list').innerHTML = examTopicsDraft.map((t,i)=>`<div class="topic-chip">${escapeHtml(t)}<button onclick="removeExamTopicDraft(${i})">✕</button></div>`).join('');
}
function generatePlan(){
  const name=document.getElementById('exam-name').value.trim(); const dateStr=document.getElementById('exam-date').value;
  const hours=parseFloat(document.getElementById('exam-hours').value)||2;
  if(!name||!dateStr||examTopicsDraft.length===0){ alert('Please add an exam name, date, and at least one topic.'); return; }
  const examDate=new Date(dateStr+'T00:00:00'); const today=new Date(); today.setHours(0,0,0,0);
  const daysUntil=Math.ceil((examDate-today)/86400000);
  if(daysUntil<0){ alert('Pick a date in the future.'); return; }
  const topics=[...examTopicsDraft]; const topicsPerDay=Math.max(1, Math.round(hours/0.8)); const studyDays=Math.max(daysUntil,1);
  let schedule=[]; for(let i=0;i<studyDays;i++) schedule.push({dayIndex:i, items:[]});
  let topicQueue=[...topics]; let dayPointer=0; const reviewQueue=[];
  while(topicQueue.length>0 && dayPointer<studyDays){
    const day=schedule[dayPointer]; let slots=topicsPerDay;
    while(slots>0 && topicQueue.length>0){ const t=topicQueue.shift(); day.items.push({topic:t, kind:'learn'}); reviewQueue.push({topic:t, dueDay:Math.min(dayPointer+3, studyDays-1)}); slots--; }
    dayPointer++;
  }
  if(topicQueue.length>0){ const packDay=schedule[Math.max(0,studyDays-2)]||schedule[studyDays-1]; topicQueue.forEach(t=>packDay.items.push({topic:t, kind:'learn (catch-up)'})); topicQueue=[]; }
  reviewQueue.forEach(r=>{ if(r.dueDay<studyDays) schedule[r.dueDay].items.push({topic:r.topic, kind:'review'}); });
  const finalIdx=studyDays-1;
  if(schedule[finalIdx]) schedule[finalIdx].items = topics.map(t=>({topic:t, kind:'final review'}));
  const plan={id:uid('exam'), name, subject:name, date:dateStr, hoursPerDay:hours, topics, createdAt:nowStr(),
    schedule:schedule.map(d=>({dayIndex:d.dayIndex, date:new Date(today.getTime()+d.dayIndex*86400000).toISOString().slice(0,10), items:d.items.map(it=>({...it,done:false}))}))};
  DB.examPlans.unshift(plan); saveDB(); closeModal('exam-modal-bg'); renderExamList();
}
function renderExamList(){
  const list=document.getElementById('exam-list');
  if(DB.examPlans.length===0){ list.innerHTML=`<div class="empty"><div class="serif">No exam plans yet</div>Add your exam date and topics, and get a day-by-day study plan.</div>`; return; }
  list.innerHTML = DB.examPlans.map(p=>{
    const today=new Date(); today.setHours(0,0,0,0); const examDate=new Date(p.date+'T00:00:00'); const daysLeft=Math.ceil((examDate-today)/86400000);
    const totalItems=p.schedule.reduce((a,d)=>a+d.items.length,0); const doneItems=p.schedule.reduce((a,d)=>a+d.items.filter(i=>i.done).length,0);
    return `<div class="card" style="padding:18px 20px; margin-bottom:14px; cursor:pointer;" onclick="openExamDetail('${p.id}')">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div><h3 style="font-size:16.5px;">${escapeHtml(p.name)}</h3><div style="font-size:12.5px; color:var(--ink-soft); margin-top:3px;">${p.topics.length} topics · ${formatDate(p.date)}</div></div>
        <div style="text-align:right;"><div style="font-family:'Fraunces',serif; font-size:22px; color:${daysLeft<=2?'var(--coral)':'var(--teal)'};">${daysLeft<0?'Past':daysLeft}</div><div style="font-size:11px; color:var(--ink-soft);">${daysLeft<0?'exam passed':'days left'}</div></div>
      </div>
      <div style="height:6px; background:var(--paper); border-radius:99px; margin-top:12px; overflow:hidden;"><div style="height:100%; width:${totalItems?Math.round(doneItems/totalItems*100):0}%; background:var(--accent);"></div></div>
      <div style="font-size:11.5px; color:var(--ink-soft); margin-top:5px;">${doneItems}/${totalItems} study items checked off</div>
    </div>`;
  }).join('');
}
function openExamDetail(id){
  const p=DB.examPlans.find(x=>x.id===id); const today=new Date(); today.setHours(0,0,0,0);
  const examDate=new Date(p.date+'T00:00:00'); const daysLeft=Math.ceil((examDate-today)/86400000);
  const kindLabel={learn:'Learn', review:'Review', 'final review':'Final review', 'learn (catch-up)':'Catch-up'};
  document.getElementById('exam-detail-content').innerHTML = `
    <h2>${escapeHtml(p.name)}</h2>
    <div class="countdown" style="background:var(--coral-soft); border:none; margin:12px 0 16px;">
      <div class="n">${daysLeft<0?'—':daysLeft}</div>
      <div><div style="font-weight:700; font-size:13.5px;">${daysLeft<0?'Exam has passed':'days until your exam'}</div><div class="l">${formatDate(p.date)} · ${p.topics.length} topics · ~${p.hoursPerDay}h/day planned</div></div>
    </div>
    <div style="max-height:420px; overflow-y:auto; padding-right:4px;">
      ${p.schedule.map((d,di)=>{
        const isExamDay=di===p.schedule.length-1; if(d.items.length===0) return '';
        return `<div class="plan-day ${isExamDay?'exam':''}"><div class="d-label">${isExamDay?'Exam day — final review':'Day '+(di+1)}</div><div class="d-date">${formatDate(d.date)}</div>
          ${d.items.map((it,ii)=>`<label class="plan-topic"><input type="checkbox" ${it.done?'checked':''} onchange="toggleExamItem('${p.id}',${di},${ii})"><span><b>${kindLabel[it.kind]||it.kind}:</b> ${escapeHtml(it.topic)}</span></label>`).join('')}
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex; gap:10px; margin-top:16px;"><button class="btn" onclick="closeModal('exam-detail-bg')">Close</button><button class="btn" style="border-color:var(--coral); color:var(--coral);" onclick="deleteExamPlan('${p.id}')">Delete plan</button></div>`;
  document.getElementById('exam-detail-bg').classList.add('show');
}
function toggleExamItem(planId, dayIdx, itemIdx){
  const p=DB.examPlans.find(x=>x.id===planId); p.schedule[dayIdx].items[itemIdx].done=!p.schedule[dayIdx].items[itemIdx].done; saveDB(); openExamDetail(planId); renderExamList();
}
function deleteExamPlan(id){ if(!confirm('Delete this exam plan?')) return; DB.examPlans=DB.examPlans.filter(x=>x.id!==id); saveDB(); closeModal('exam-detail-bg'); renderExamList(); }

/* ============================= LEARNING: SUBJECTS & STAGES =============================
   Each subject a student engages with gets a record: {stage:0-3, failCount:0, status:'active'|'removed'|'completed'}
   A stage exam is 5 auto-generated multiple choice questions about that stage's topic list.
   Score >=70% (4/5) passes: stage+1 (or 'completed' if already on stage 3), failCount resets.
   Score <70%: failCount++. At failCount>=3 the subject becomes 'removed' (kicked out of that course). */
function getLearningRecord(subject){
  if(!DB.learning[subject]) DB.learning[subject] = {stage:0, failCount:0, status:'active', lastExamAt:null};
  return DB.learning[subject];
}
function renderLearnList(){
  const q=(document.getElementById('learn-search').value||'').toLowerCase().trim();
  let subjects = allSubjects().filter(s=>s.toLowerCase().includes(q));
  const list=document.getElementById('learn-list');
  list.innerHTML = subjects.map(s=>{
    const rec=getLearningRecord(s);
    const dots = [0,1,2,3].map(i=>{
      let cls='stage-dot';
      if(rec.status==='removed' && i===rec.stage) cls+=' locked-out';
      else if(i<rec.stage || rec.status==='completed') cls+=' done';
      else if(i===rec.stage) cls+=' current';
      return `<div class="${cls}">${i+1}</div>`;
    }).join('');
    let statusLine;
    if(rec.status==='removed') statusLine = `<span style="color:var(--coral); font-weight:600;">Removed from this course — failed the stage exam 3 times</span>`;
    else if(rec.status==='completed') statusLine = `<span style="color:var(--teal); font-weight:600;">All stages completed 🎉</span>`;
    else statusLine = `Stage ${rec.stage+1} of 4: <b>${STAGE_NAMES[rec.stage]}</b> · failed attempts at this stage: ${rec.failCount}/3`;
    return `<div class="card post">
      <div class="post-head"><h3 style="margin:0;">${s}</h3></div>
      <div class="stage-track">${dots}</div>
      <p class="body" style="margin-top:8px;">${statusLine}</p>
      <div class="post-foot"><button onclick="openLearnDetail('${s.replace(/'/g,"\\'")}')">📖 Open subject</button></div>
    </div>`;
  }).join('');
}
function openLearnDetail(subject){
  const rec=getLearningRecord(subject);
  const topics = rec.status==='completed' ? STAGE_TOPICS[3] : STAGE_TOPICS[Math.min(rec.stage,3)];
  let actionHtml;
  if(rec.status==='removed'){
    actionHtml = `<div class="empty"><div class="serif">You've been removed from this course</div>You failed the stage ${rec.stage+1} exam 3 times. You can still browse the topics below, or ask for help on the problem board.</div>`;
  } else if(rec.status==='completed'){
    actionHtml = `<div class="empty"><div class="serif">🎉 You've completed all 4 stages of ${escapeHtml(subject)}</div>Nice work — you can keep reviewing the topics below any time.</div>`;
  } else {
    actionHtml = `<button class="btn accent" style="width:100%; padding:11px;" onclick="startStageExam('${subject.replace(/'/g,"\\'")}')">Take the Stage ${rec.stage+1} exam</button>
      <p style="font-size:11.5px; color:var(--ink-soft); margin-top:8px;">Normally this exam opens every 3 months once you've studied the stage topics — here you can take it any time to try it out.</p>`;
  }
  document.getElementById('learn-detail-content').innerHTML = `
    <h2>${escapeHtml(subject)}</h2>
    <div class="stage-track">${[0,1,2,3].map(i=>{ let cls='stage-dot'; if(rec.status==='removed'&&i===rec.stage) cls+=' locked-out'; else if(i<rec.stage||rec.status==='completed') cls+=' done'; else if(i===rec.stage) cls+=' current'; return `<div class="${cls}">${i+1}</div>`; }).join('')}</div>
    <p style="font-size:12.5px; color:var(--ink-soft); margin:6px 0 14px;">${rec.status==='active'?('Currently on Stage '+(rec.stage+1)+': '+STAGE_NAMES[rec.stage]):''}</p>
    <div style="font-size:13px; font-weight:700; margin-bottom:8px;">Topics for this stage</div>
    <div style="margin-bottom:16px;">${topics.map(t=>`<div class="lang-word"><span>${t}</span></div>`).join('')}</div>
    ${actionHtml}
    <div style="display:flex; gap:10px; margin-top:16px;"><button class="btn" onclick="closeModal('learn-detail-bg')">Close</button></div>`;
  document.getElementById('learn-detail-bg').classList.add('show');
}
function generateStageQuestions(subject, stage){
  const topics = STAGE_TOPICS[stage]; const qs=[];
  topics.forEach(topic=>{
    const distractorPool = allSubjects().filter(s=>s!==subject).concat(STAGE_TOPICS[(stage+1)%4]).filter(x=>x!==topic);
    const distractors = shuffle(distractorPool).slice(0,3);
    const options = shuffle([topic, ...distractors]);
    qs.push({ q:`In ${subject}, which of these is the topic you should be studying at Stage ${stage+1}?`, options, answer: topic });
  });
  return shuffle(qs).slice(0,5);
}
let stageExamState=null;
function startStageExam(subject){
  const rec=getLearningRecord(subject);
  stageExamState = { subject, stage:rec.stage, questions:generateStageQuestions(subject, rec.stage), current:0, correct:0, picked:null };
  closeModal('learn-detail-bg'); renderStageExamStep();
}
function renderStageExamStep(){
  const st=stageExamState; const q=st.questions[st.current];
  document.getElementById('learn-detail-content').innerHTML = `
    <h2>${escapeHtml(st.subject)} — Stage ${st.stage+1} exam</h2>
    <div style="font-size:12px; color:var(--ink-soft); margin-bottom:10px;">Question ${st.current+1} of ${st.questions.length}</div>
    <p style="font-size:14.5px; margin-bottom:12px;">${escapeHtml(q.q)}</p>
    <div id="exam-opts">${q.options.map(o=>`<div class="qopt" onclick="pickStageOpt('${o.replace(/'/g,"\\'")}')">${escapeHtml(o)}</div>`).join('')}</div>
    <button class="btn primary" style="width:100%; margin-top:10px;" onclick="submitStageAnswer()" id="stage-submit-btn" disabled>Submit answer</button>`;
  document.getElementById('learn-detail-bg').classList.add('show');
}
function pickStageOpt(opt){
  stageExamState.picked = opt;
  document.querySelectorAll('#exam-opts .qopt').forEach(el=>el.classList.toggle('picked', el.textContent===opt));
  document.getElementById('stage-submit-btn').disabled=false;
}
function submitStageAnswer(){
  const st=stageExamState; const q=st.questions[st.current];
  if(st.picked===q.answer) st.correct++;
  st.current++;
  if(st.current<st.questions.length){ st.picked=null; renderStageExamStep(); }
  else finishStageExam();
}
function finishStageExam(){
  const st=stageExamState; const rec=getLearningRecord(st.subject);
  const pct = Math.round((st.correct/st.questions.length)*100); const passed = st.correct>=Math.ceil(st.questions.length*0.7);
  let outcomeHtml;
  if(passed){
    if(rec.stage>=3){ rec.status='completed'; } else { rec.stage++; }
    rec.failCount=0; rec.lastExamAt=nowStr();
    outcomeHtml = `<div class="empty" style="border-color:var(--teal);"><div class="serif" style="color:var(--teal);">Passed — ${pct}%! 🎉</div>${rec.status==='completed'?'You have completed every stage of this subject.':'You leveled up to Stage '+(rec.stage+1)+': '+STAGE_NAMES[rec.stage]+'.'}</div>`;
  } else {
    rec.failCount++; rec.lastExamAt=nowStr();
    if(rec.failCount>=3){ rec.status='removed'; outcomeHtml = `<div class="empty" style="border-color:var(--coral);"><div class="serif" style="color:var(--coral);">Scored ${pct}% — not a pass</div>That was your 3rd failed attempt at this stage, so you've been removed from this course. You can still study the topics anytime.</div>`; }
    else outcomeHtml = `<div class="empty" style="border-color:var(--coral);"><div class="serif" style="color:var(--coral);">Scored ${pct}% — not a pass</div>You'll restudy Stage ${rec.stage+1}. Failed attempts at this stage: ${rec.failCount}/3.</div>`;
  }
  saveDB();
  document.getElementById('learn-detail-content').innerHTML = `<h2>Exam results</h2>${outcomeHtml}<div style="display:flex; gap:10px; margin-top:16px;"><button class="btn primary" style="flex:1;" onclick="closeModal('learn-detail-bg'); renderLearnList();">Done</button></div>`;
}

/* ============================= QUIZZES ============================= */
let quizTermsDraft=[];
function openQuizCreateModal(){
  quizTermsDraft=[];
  document.getElementById('quiz-create-content').innerHTML = `
    <h2>Create a quiz</h2>
    <div class="field"><label>Quiz title</label><input id="qz-title" placeholder="e.g. Photosynthesis vocabulary"></div>
    <div class="row2"><div class="field"><label>Subject</label><select id="qz-subject">${allSubjects().map(s=>`<option value="${s}">${s}</option>`).join('')}</select></div><div class="field"><label>Level</label><select id="qz-level"><option value="school">School</option><option value="university">University</option></select></div></div>
    <div class="field"><label>Topic</label><input id="qz-topic" placeholder="e.g. Photosynthesis"></div>
    <div class="field"><label>Terms & definitions (at least 4, so distractors work well)</label>
      <div class="row2"><input id="qz-term" placeholder="Term"><input id="qz-def" placeholder="Definition"></div>
      <button class="btn small" style="margin-top:8px;" onclick="addQuizTerm()">+ Add term</button>
      <div id="qz-terms-list" style="margin-top:10px;"></div>
    </div>
    <div style="display:flex; gap:10px; margin-top:6px;"><button class="btn" onclick="closeModal('quiz-create-bg')">Cancel</button><button class="btn primary" style="flex:1;" onclick="submitQuiz()">Publish quiz</button></div>`;
  document.getElementById('quiz-create-bg').classList.add('show');
}
function addQuizTerm(){
  const term=document.getElementById('qz-term').value.trim(); const def=document.getElementById('qz-def').value.trim();
  if(!term||!def) return;
  quizTermsDraft.push({term,def}); document.getElementById('qz-term').value=''; document.getElementById('qz-def').value='';
  document.getElementById('qz-terms-list').innerHTML = quizTermsDraft.map((t,i)=>`<div class="topic-chip"><b>${escapeHtml(t.term)}</b>&nbsp;— ${escapeHtml(t.def)}<button onclick="quizTermsDraft.splice(${i},1); addQuizTerm();">✕</button></div>`).join('');
}
function submitQuiz(){
  const title=document.getElementById('qz-title').value.trim(); const subject=document.getElementById('qz-subject').value;
  const level=document.getElementById('qz-level').value; const topic=document.getElementById('qz-topic').value.trim();
  if(!title||!topic||quizTermsDraft.length<4){ alert('Please add a title, topic, and at least 4 terms so the quiz can generate good multiple-choice options.'); return; }
  DB.quizzes.unshift({id:uid('q'), title, subject, topic, level, createdBy:DB.profile.name, terms:[...quizTermsDraft], createdAt:nowStr()});
  saveDB(); closeModal('quiz-create-bg'); renderQuizList();
}
function renderQuizList(){
  const q=(document.getElementById('quiz-search').value||'').toLowerCase().trim(); const subj=document.getElementById('quiz-subject-filter').value;
  let quizzes=[...DB.quizzes].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  if(subj) quizzes=quizzes.filter(x=>x.subject===subj);
  if(q) quizzes=quizzes.filter(x=>x.title.toLowerCase().includes(q)||x.topic.toLowerCase().includes(q)||x.subject.toLowerCase().includes(q));
  const list=document.getElementById('quiz-list');
  if(quizzes.length===0){ list.innerHTML=`<div class="empty"><div class="serif">No quizzes match yet</div>Try a different search, or publish one yourself.</div>`; return; }
  list.innerHTML = quizzes.map(qz=>`<div class="card post">
    <div class="post-head"><span class="pill school">${qz.level==='school'?'School':'University'}</span><span class="tag" style="margin-left:6px;">${qz.subject}</span></div>
    <h3>${escapeHtml(qz.title)}</h3><p class="body">Topic: ${escapeHtml(qz.topic)} · ${qz.terms.length} terms · by ${escapeHtml(qz.createdBy)}</p>
    <div class="post-foot"><button onclick="startQuizAttempt('${qz.id}')">🧩 Take quiz</button></div>
  </div>`).join('');
}
function buildQuizQuestions(qz){
  return shuffle(qz.terms).map(t=>{
    const distractors = shuffle(qz.terms.filter(x=>x.term!==t.term).map(x=>x.def)).slice(0,3);
    return { q:`Which definition matches "${t.term}"?`, options: shuffle([t.def, ...distractors]), answer:t.def };
  });
}
let quizAttemptState=null;
function startQuizAttempt(quizId){
  const qz=DB.quizzes.find(x=>x.id===quizId);
  quizAttemptState = { quizId, questions:buildQuizQuestions(qz), current:0, correct:0, picked:null };
  renderQuizAttemptStep();
}
function renderQuizAttemptStep(){
  const st=quizAttemptState; const q=st.questions[st.current];
  document.getElementById('quiz-take-content').innerHTML = `
    <h2>Question ${st.current+1} of ${st.questions.length}</h2>
    <p style="font-size:14.5px; margin-bottom:12px;">${escapeHtml(q.q)}</p>
    <div id="quiz-opts">${q.options.map(o=>`<div class="qopt" onclick="pickQuizOpt('${o.replace(/'/g,"\\'")}')">${escapeHtml(o)}</div>`).join('')}</div>
    <button class="btn primary" style="width:100%; margin-top:10px;" onclick="submitQuizAnswer()" id="quiz-submit-btn" disabled>Submit answer</button>`;
  document.getElementById('quiz-take-bg').classList.add('show');
}
function pickQuizOpt(opt){
  quizAttemptState.picked=opt;
  document.querySelectorAll('#quiz-opts .qopt').forEach(el=>el.classList.toggle('picked', el.textContent===opt));
  document.getElementById('quiz-submit-btn').disabled=false;
}
function submitQuizAnswer(){
  const st=quizAttemptState; const q=st.questions[st.current];
  if(st.picked===q.answer) st.correct++;
  st.current++;
  if(st.current<st.questions.length){ st.picked=null; renderQuizAttemptStep(); }
  else {
    const pct=Math.round((st.correct/st.questions.length)*100);
    DB.quizAttempts.push({quizId:st.quizId, score:pct, at:nowStr()}); saveDB();
    document.getElementById('quiz-take-content').innerHTML = `<h2>Quiz complete</h2><div class="empty" style="border-color:var(--teal);"><div class="serif" style="color:var(--teal);">${pct}% (${st.correct}/${st.questions.length})</div>Nice work — you can retake this quiz any time.</div><button class="btn primary" style="width:100%;" onclick="closeModal('quiz-take-bg')">Close</button>`;
  }
}

/* ============================= LANGUAGES ============================= */
function renderLangsHome(){
  const wrap=document.getElementById('langs-home');
  wrap.innerHTML = Object.keys(LANGUAGES).map(lang=>{
    const prog = DB.langProgress[lang] || {learnedTopics:[]};
    const total = LANGUAGES[lang].topics.length;
    return `<div class="card post"><h3>${lang}</h3><p class="body">${prog.learnedTopics.length}/${total} topics studied</p>
      <div class="post-foot"><button onclick="openLangDetail('${lang}')">🌐 Open ${lang}</button></div></div>`;
  }).join('');
}
function openLangDetail(lang){
  if(!DB.langProgress[lang]) DB.langProgress[lang]={learnedTopics:[]};
  const prog=DB.langProgress[lang]; const data=LANGUAGES[lang];
  document.getElementById('lang-detail-content').innerHTML = `
    <h2>${lang}</h2>
    <div style="margin:10px 0 16px;">
      ${data.topics.map((t,i)=>{
        const learned=prog.learnedTopics.includes(t.name);
        return `<div class="card" style="padding:14px 16px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;"><b>${escapeHtml(t.name)}</b>${learned?'<span class="solved-badge">STUDIED</span>':''}</div>
          <div style="margin-top:8px;">${t.words.map(w=>`<div class="lang-word"><span>${escapeHtml(w.w)}</span><b>${escapeHtml(w.t)}</b></div>`).join('')}</div>
          <button class="btn small" style="margin-top:8px;" onclick="markLangTopicLearned('${lang}','${t.name.replace(/'/g,"\\'")}')">${learned?'Studied ✓':'Mark as studied'}</button>
        </div>`;
      }).join('')}
    </div>
    <button class="btn accent" style="width:100%; padding:11px;" ${prog.learnedTopics.length===0?'disabled':''} onclick="startLangQuiz('${lang}')">🧩 Quiz me on what I've studied</button>
    <div style="display:flex; gap:10px; margin-top:12px;"><button class="btn" onclick="closeModal('lang-detail-bg')">Close</button></div>`;
  document.getElementById('lang-detail-bg').classList.add('show');
}
function markLangTopicLearned(lang, topicName){
  const prog=DB.langProgress[lang]; if(!prog.learnedTopics.includes(topicName)) prog.learnedTopics.push(topicName);
  saveDB(); openLangDetail(lang); renderLangsHome();
}
function buildLangQuestions(lang){
  const prog=DB.langProgress[lang]; const data=LANGUAGES[lang];
  const words = data.topics.filter(t=>prog.learnedTopics.includes(t.name)).flatMap(t=>t.words);
  const allWords = data.topics.flatMap(t=>t.words);
  return shuffle(words).slice(0,6).map(w=>{
    const distractors = shuffle(allWords.filter(x=>x.t!==w.t).map(x=>x.t)).slice(0,3);
    return { q:`What does "${w.w}" mean?`, options: shuffle([w.t, ...distractors]), answer:w.t };
  });
}
let langQuizState=null;
function startLangQuiz(lang){
  langQuizState = { lang, questions: buildLangQuestions(lang), current:0, correct:0, picked:null };
  closeModal('lang-detail-bg'); renderLangQuizStep();
}
function renderLangQuizStep(){
  const st=langQuizState; const q=st.questions[st.current];
  document.getElementById('lang-detail-content').innerHTML = `
    <h2>${st.lang} quiz — question ${st.current+1} of ${st.questions.length}</h2>
    <p style="font-size:14.5px; margin-bottom:12px;">${escapeHtml(q.q)}</p>
    <div id="lang-opts">${q.options.map(o=>`<div class="qopt" onclick="pickLangOpt('${o.replace(/'/g,"\\'")}')">${escapeHtml(o)}</div>`).join('')}</div>
    <button class="btn primary" style="width:100%; margin-top:10px;" onclick="submitLangAnswer()" id="lang-submit-btn" disabled>Submit answer</button>`;
  document.getElementById('lang-detail-bg').classList.add('show');
}
function pickLangOpt(opt){
  langQuizState.picked=opt;
  document.querySelectorAll('#lang-opts .qopt').forEach(el=>el.classList.toggle('picked', el.textContent===opt));
  document.getElementById('lang-submit-btn').disabled=false;
}
function submitLangAnswer(){
  const st=langQuizState; const q=st.questions[st.current];
  if(st.picked===q.answer) st.correct++;
  st.current++;
  if(st.current<st.questions.length){ st.picked=null; renderLangQuizStep(); }
  else {
    const pct=Math.round((st.correct/st.questions.length)*100);
    document.getElementById('lang-detail-content').innerHTML = `<h2>${st.lang} quiz complete</h2><div class="empty" style="border-color:var(--teal);"><div class="serif" style="color:var(--teal);">${pct}% (${st.correct}/${st.questions.length})</div>Keep studying more topics to unlock more questions.</div><button class="btn primary" style="width:100%;" onclick="closeModal('lang-detail-bg')">Close</button>`;
  }
}

/* ============================= PROFILE ============================= */
let pfSubjectsDraft=[];
function renderProfileTab(){
  document.getElementById('pf-name').value=DB.profile.name; document.getElementById('pf-role').value=DB.profile.role;
  document.getElementById('pf-level').value=DB.profile.level; document.getElementById('pf-institution').value=DB.profile.institution||'';
  document.getElementById('pf-bio').value=DB.profile.bio||'';
  pfSubjectsDraft=[...DB.profile.subjects]; renderPfSubjects();
  document.getElementById('prof-posts').textContent = DB.posts.filter(p=>p.authorId==='me').length;
  document.getElementById('prof-replies').textContent = Object.values(DB.comments).flat().filter(c=>c.authorName===DB.profile.name).length;
  document.getElementById('prof-sessions').textContent = DB.focus.sessions.length;
  document.getElementById('prof-plans').textContent = DB.examPlans.length;
  document.getElementById('prof-quizzes').textContent = DB.quizzes.filter(q=>q.createdBy===DB.profile.name).length;
}
function renderPfSubjects(){
  document.getElementById('pf-subjects').innerHTML = allSubjects().map(s=>{
    const on=pfSubjectsDraft.includes(s);
    return `<button type="button" class="tag selectable ${on?'on':''}" onclick="togglePfSubject('${s.replace(/'/g,"\\'")}')">${s}</button>`;
  }).join('');
}
function togglePfSubject(s){ const i=pfSubjectsDraft.indexOf(s); if(i>-1) pfSubjectsDraft.splice(i,1); else pfSubjectsDraft.push(s); renderPfSubjects(); }
function pfAddCustomSubject(){
  const input=document.getElementById('pf-custom-subject'); const v=input.value.trim(); if(!v) return;
  if(!DB.customSubjects.includes(v) && !SUBJECT_LIST.includes(v)) DB.customSubjects.push(v);
  if(!pfSubjectsDraft.includes(v)) pfSubjectsDraft.push(v);
  input.value=''; populateSubjectSelects(); renderPfSubjects();
}
function saveProfile(){
  DB.profile.name=document.getElementById('pf-name').value.trim()||DB.profile.name;
  DB.profile.role=document.getElementById('pf-role').value; DB.profile.level=document.getElementById('pf-level').value;
  DB.profile.institution=document.getElementById('pf-institution').value.trim();
  DB.profile.bio=document.getElementById('pf-bio').value.trim(); DB.profile.subjects=[...pfSubjectsDraft];
  saveDB(); refreshRailUser();
  const ok=document.getElementById('pf-saved'); ok.style.display='inline'; setTimeout(()=>ok.style.display='none',1600);
}
function resetAll(){ if(!confirm('This will erase your profile, posts, chats, and learning progress from this browser. Continue?')) return; localStorage.removeItem(DB_KEY); location.reload(); }

/* ============================= LIVE CAMERA ============================= */
let callStream=null, callMicOn=true, callCamOn=true;
async function openLiveCamera(label){
  document.getElementById('call-label').textContent='Camera preview — '+label; document.getElementById('call-bg').classList.add('show');
  const video=document.getElementById('call-local-video'); const offline=document.getElementById('call-offline');
  video.style.display='block'; offline.style.display='none'; callMicOn=true; callCamOn=true;
  document.getElementById('call-mic-btn').classList.remove('off'); document.getElementById('call-cam-btn').classList.remove('off');
  try{ callStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true}); video.srcObject=callStream; }
  catch(err){ video.style.display='none'; offline.style.display='block'; offline.textContent="Couldn't access your camera (permission was blocked or no camera is available)."; }
}
function toggleCallMic(){ if(!callStream) return; callMicOn=!callMicOn; callStream.getAudioTracks().forEach(t=>t.enabled=callMicOn); document.getElementById('call-mic-btn').classList.toggle('off',!callMicOn); }
function toggleCallCam(){ if(!callStream) return; callCamOn=!callCamOn; callStream.getVideoTracks().forEach(t=>t.enabled=callCamOn); document.getElementById('call-cam-btn').classList.toggle('off',!callCamOn); }
function closeLiveCamera(){ if(callStream){ callStream.getTracks().forEach(t=>t.stop()); callStream=null; } document.getElementById('call-bg').classList.remove('show'); }

/* ============================= BACKUP EXPORT/IMPORT ============================= */
function exportData(){
  const blob=new Blob([JSON.stringify(DB,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='studyhive-backup.json'; a.click(); URL.revokeObjectURL(url);
}
function importData(e){
  const f=e.target.files[0]; if(!f) return; const reader=new FileReader();
  reader.onload=()=>{ try{ DB=JSON.parse(reader.result); saveDB(); location.reload(); } catch(err){ alert('That file could not be read as a StudyHive backup.'); } };
  reader.readAsText(f); e.target.value='';
}

/* ============================= INIT ============================= */
boot();
