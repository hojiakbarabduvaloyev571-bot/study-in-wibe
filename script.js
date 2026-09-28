/* ============================= DATA LAYER ============================= */
const DB_KEY = 'studyhive_db_v1';
const SUBJECT_LIST = [
  "Mathematics","Physics","Chemistry","Biology","English","History","Geography",
  "Computer Science","Programming","Statistics","Economics","Literature",
  "Foreign Languages","Calculus","Algebra","Linear Algebra","Psychology","Philosophy"
];

const MOCK_PEOPLE = [
  {id:'m1', name:'Diyora Yusupova', role:'teacher', level:'university', subjects:['Mathematics','Calculus','Statistics'], bio:'PhD candidate in applied math. I tutor calculus and stats on weekends.'},
  {id:'m2', name:'Jasur Tashkentov', role:'student', level:'university', subjects:['Computer Science','Programming'], bio:'3rd-year CS student, into algorithms and web dev. Happy to pair-debug.'},
  {id:'m3', name:'Mrs. Karimova', role:'teacher', level:'school', subjects:['Chemistry','Biology'], bio:'High school science teacher, 12 years experience. Loves a good lab question.'},
  {id:'m4', name:'Aziz Norov', role:'student', level:'school', subjects:['English','History'], bio:'11th grade, strong in essay writing, always down to study group.'},
  {id:'m5', name:'Farrukh Aliyev', role:'teacher', level:'university', subjects:['Physics','Mathematics'], bio:'Physics TA. Mechanics and electromagnetism are my favorites to explain.'},
  {id:'m6', name:'Malika Rashidova', role:'student', level:'university', subjects:['Economics','Statistics'], bio:'Econ major, minoring in stats. Can help with problem sets and intuition.'},
  {id:'m7', name:'Mr. Sobirov', role:'teacher', level:'school', subjects:['Mathematics','Algebra'], bio:'Middle & high school math teacher. Patient with fundamentals.'},
  {id:'m8', name:'Nodira Ergasheva', role:'student', level:'school', subjects:['Biology','Chemistry'], bio:'10th grade, science olympiad participant.'},
];

function nowStr(){ return new Date().toISOString(); }
function uid(prefix){ return prefix + '_' + Math.random().toString(36).slice(2,10); }

function loadDB(){
  let raw = localStorage.getItem(DB_KEY);
  const blank = { profile:null, posts:[], comments:{}, messages:{}, focus:{sessions:[]}, examPlans:[], customSubjects:[], clubs:[], clubMembers:{}, clubMessages:{} };
  if(!raw){ return blank; }
  try{
    const parsed = JSON.parse(raw);
    return { ...blank, ...parsed }; // fills in new fields (e.g. clubs) for older saved backups
  }catch(e){ return blank; }
}
function saveDB(){ localStorage.setItem(DB_KEY, JSON.stringify(DB)); }
let DB = loadDB();

function allSubjects(){ return [...SUBJECT_LIST, ...(DB.customSubjects||[])]; }

/* seed a couple of example posts the first time, so the board isn't empty */
function seedIfEmpty(){
  if(DB.posts.length===0){
    DB.posts.push({
      id:uid('p'), authorId:'m2', authorName:'Jasur Tashkentov', role:'student', level:'university',
      subject:'Programming', title:'Recursion vs iteration — when to choose which?',
      body:"I understand both work but I always freeze during interviews trying to decide which one to reach for. Any rule of thumb?",
      media:null, createdAt:nowStr(), solved:false
    });
    DB.posts.push({
      id:uid('p'), authorId:'m4', authorName:'Aziz Norov', role:'student', level:'school',
      subject:'History', title:'Causes of WWI — need a clearer structure for my essay',
      body:"I keep listing causes but my teacher says it reads like a list, not an argument. How do I connect them?",
      media:null, createdAt:nowStr(), solved:true
    });
    saveDB();
  }
  if(DB.clubs.length===0){
    DB.clubs.push(
      { id:'c1', name:'Calculus Study Circle', subject:'Calculus', level:'university', desc:'Weekly problem-solving sessions and past-paper review.', ownerId:'m1', ownerName:'Diyora Yusupova', members:['m1','m2'], createdAt:nowStr() },
      { id:'c2', name:'Chem Lab Survivors', subject:'Chemistry', level:'school', desc:'For anyone who needs their lab report to make sense before Friday.', ownerId:'m3', ownerName:'Mrs. Karimova', members:['m3','m8'], createdAt:nowStr() },
      { id:'c3', name:'Code & Coffee', subject:'Programming', level:'university', desc:'Casual pair-programming and interview-prep meetups.', ownerId:'m2', ownerName:'Jasur Tashkentov', members:['m2','m6'], createdAt:nowStr() },
      { id:'c4', name:'Essay Writers Club', subject:'English', level:'school', desc:'Peer feedback on essays, from thesis statements to final polish.', ownerId:'m4', ownerName:'Aziz Norov', members:['m4'], createdAt:nowStr() }
    );
    saveDB();
  }
}

/* ============================= ONBOARDING ============================= */
let obState = { role:null, level:null, subjects:[] };

function pickRole(role){
  obState.role = role;
  document.querySelectorAll('#onb-step1 [data-role]').forEach(b=>b.classList.toggle('on', b.dataset.role===role));
}
function pickLevel(level){
  obState.level = level;
  document.querySelectorAll('#onb-step1 [data-level]').forEach(b=>b.classList.toggle('on', b.dataset.level===level));
}
function renderOnbSubjects(){
  const wrap = document.getElementById('ob-subjects');
  wrap.innerHTML = allSubjects().map(s=>{
    const on = obState.subjects.includes(s);
    return `<button type="button" class="tag selectable ${on?'on':''}" onclick="toggleObSubject('${s.replace(/'/g,"\\'")}')">${s}</button>`;
  }).join('');
}
function toggleObSubject(s){
  const i = obState.subjects.indexOf(s);
  if(i>-1) obState.subjects.splice(i,1); else obState.subjects.push(s);
  renderOnbSubjects();
}
function addCustomSubject(){
  const input = document.getElementById('ob-custom-subject');
  const val = input.value.trim();
  if(!val) return;
  if(!DB.customSubjects.includes(val) && !SUBJECT_LIST.includes(val)) DB.customSubjects.push(val);
  if(!obState.subjects.includes(val)) obState.subjects.push(val);
  input.value='';
  renderOnbSubjects();
}
function onbNext(step){
  if(step===2 && (!obState.role || !obState.level)){
    alert('Please select whether you are a student or teacher, and your level.');
    return;
  }
  [1,2,3].forEach(n=>{
    document.getElementById('onb-step'+n).style.display = (n===step)?'block':'none';
    document.getElementById('dot'+n).classList.toggle('on', n<=step);
  });
  if(step===2) renderOnbSubjects();
}
function finishOnboarding(){
  const name = document.getElementById('ob-name').value.trim() || 'Anonymous';
  DB.profile = {
    id:'me', name, role:obState.role, level:obState.level,
    subjects:obState.subjects, bio:document.getElementById('ob-bio').value.trim(),
    createdAt: nowStr()
  };
  saveDB();
  boot();
}

/* ============================= APP BOOT / NAV ============================= */
function boot(){
  seedIfEmpty();
  if(!DB.profile){
    document.getElementById('onboarding').style.display='flex';
    document.getElementById('app').style.display='none';
    // name field enter-continue
    document.getElementById('ob-name').addEventListener('keydown', e=>{ if(e.key==='Enter') onbNext(2); });
    return;
  }
  document.getElementById('onboarding').style.display='none';
  document.getElementById('app').style.display='block';
  refreshRailUser();
  populateSubjectSelects();
  goTab('feed');
  renderFocusStats();
  restoreTimerUI();
}
function refreshRailUser(){
  document.getElementById('rail-name').textContent = DB.profile.name;
  document.getElementById('rail-sub').textContent = (DB.profile.role==='teacher'?'Teacher':'Student') + ' · ' + (DB.profile.level==='school'?'School':'University');
  const av = document.getElementById('rail-avatar');
  av.textContent = DB.profile.name.slice(0,1).toUpperCase();
  av.style.background = DB.profile.level==='school' ? 'var(--school)' : 'var(--teal)';
}
function goTab(tab){
  ['feed','search','clubs','chat','focus','exam','profile'].forEach(t=>{
    document.getElementById('tab-'+t).style.display = (t===tab)?'block':'none';
  });
  document.querySelectorAll('.nav-item[data-tab]').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  if(tab==='feed') renderFeed();
  if(tab==='search') renderDirectory();
  if(tab==='clubs') renderClubs();
  if(tab==='chat') renderChatList();
  if(tab==='exam') renderExamList();
  if(tab==='profile') renderProfileTab();
}
function populateSubjectSelects(){
  const opts = allSubjects().map(s=>`<option value="${s}">${s}</option>`).join('');
  document.getElementById('post-subject').innerHTML = opts;
  document.getElementById('subject-filter').innerHTML = '<option value="">All subjects</option>' + opts;
  document.getElementById('club-subject').innerHTML = opts;
  document.getElementById('club-subject-filter').innerHTML = '<option value="">All subjects</option>' + opts;
}
function closeModal(id){ document.getElementById(id).classList.remove('show'); }

/* ============================= FEED ============================= */
let feedFilters = { level:'all', status:'all' };
function setLevelFilter(v){
  feedFilters.level=v;
  document.querySelectorAll('#level-seg button').forEach(b=>b.classList.toggle('on', b.dataset.v===v));
  renderFeed();
}
function setStatusFilter(v){
  feedFilters.status=v;
  document.querySelectorAll('#status-seg button').forEach(b=>b.classList.toggle('on', b.dataset.v===v));
  renderFeed();
}
function renderFeed(){
  const subj = document.getElementById('subject-filter').value;
  let posts = [...DB.posts].sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
  if(feedFilters.level!=='all') posts = posts.filter(p=>p.level===feedFilters.level);
  if(feedFilters.status!=='all') posts = posts.filter(p=> feedFilters.status==='solved' ? p.solved : !p.solved);
  if(subj) posts = posts.filter(p=>p.subject===subj);

  const list = document.getElementById('feed-list');
  if(posts.length===0){
    list.innerHTML = `<div class="empty"><div class="serif">No problems here yet</div>Be the first to post one, or widen your filters.</div>`;
    return;
  }
  list.innerHTML = posts.map(p=>{
    const cCount = (DB.comments[p.id]||[]).length;
    const initials = p.authorName.slice(0,1).toUpperCase();
    const avatarColor = p.level==='school' ? 'var(--school)' : 'var(--teal)';
    return `
    <div class="card post">
      <div class="post-head">
        <div class="avatar" style="width:32px;height:32px;font-size:12px;background:${avatarColor};">${initials}</div>
        <div class="who">
          <b>${escapeHtml(p.authorName)}</b>
          <div>${p.role==='teacher'?'Teacher':'Student'} · ${timeAgo(p.createdAt)}</div>
        </div>
        <span class="pill ${p.level}" style="margin-left:auto;">${p.level==='school'?'School':'University'}</span>
      </div>
      <h3>${escapeHtml(p.title)} ${p.solved?'<span class="solved-badge">SOLVED</span>':''}</h3>
      <p class="body">${escapeHtml(p.body)}</p>
      ${p.media ? renderMedia(p.media) : ''}
      <span class="tag">${p.subject}</span>
      <div class="post-foot">
        <button onclick="openPostDetail('${p.id}')">💬 ${cCount} ${cCount===1?'reply':'replies'}</button>
        <button onclick="messageFromPost('${p.id}')">✉ Message ${firstName(p.authorName)}</button>
        ${p.authorId==='me' ? `<button onclick="toggleSolved('${p.id}')">${p.solved?'Mark unsolved':'Mark solved'}</button>` : ''}
      </div>
    </div>`;
  }).join('');
}
function renderMedia(media){
  if(media.type.startsWith('image')) return `<div class="post-media"><img src="${media.data}"></div>`;
  if(media.type.startsWith('video')) return `<div class="post-media"><video src="${media.data}" controls></video></div>`;
  return '';
}
function firstName(n){ return n.split(' ')[0]; }
function escapeHtml(s){ const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }
function timeAgo(iso){
  const s = Math.floor((Date.now()-new Date(iso).getTime())/1000);
  if(s<60) return 'just now';
  if(s<3600) return Math.floor(s/60)+'m ago';
  if(s<86400) return Math.floor(s/3600)+'h ago';
  return Math.floor(s/86400)+'d ago';
}

/* ---- post modal ---- */
let stagedPostMedia = null;
function openPostModal(){
  document.getElementById('post-title').value='';
  document.getElementById('post-body').value='';
  document.getElementById('post-level').value = DB.profile.level;
  document.getElementById('post-media-name').textContent='';
  stagedPostMedia = null;
  document.getElementById('post-modal-bg').classList.add('show');
}
function stagePostMedia(e){
  const f = e.target.files[0]; if(!f) return;
  if(f.size > 15*1024*1024){ alert('Please choose a file under 15MB.'); e.target.value=''; return; }
  const reader = new FileReader();
  reader.onload = ()=>{
    stagedPostMedia = { type:f.type, data:reader.result, name:f.name };
    document.getElementById('post-media-name').textContent = '📎 '+f.name;
  };
  reader.readAsDataURL(f);
}
function submitPost(){
  const title = document.getElementById('post-title').value.trim();
  const body = document.getElementById('post-body').value.trim();
  const subject = document.getElementById('post-subject').value;
  const level = document.getElementById('post-level').value;
  if(!title || !body){ alert('Please add a title and description.'); return; }
  DB.posts.unshift({
    id:uid('p'), authorId:'me', authorName:DB.profile.name, role:DB.profile.role, level,
    subject, title, body, media:stagedPostMedia, createdAt:nowStr(), solved:false
  });
  saveDB();
  closeModal('post-modal-bg');
  renderFeed();
}
function toggleSolved(id){
  const p = DB.posts.find(x=>x.id===id);
  p.solved = !p.solved;
  saveDB(); renderFeed();
}

/* ---- post detail + comments (this is the "chat about a problem" thread) ---- */
function openPostDetail(id){
  const p = DB.posts.find(x=>x.id===id);
  const comments = DB.comments[id] || [];
  const html = `
    <h2>${escapeHtml(p.title)}</h2>
    <div style="font-size:12.5px; color:var(--ink-soft); margin-bottom:10px;">${escapeHtml(p.authorName)} · ${p.subject} · ${p.level==='school'?'School':'University'}</div>
    <p style="font-size:14px; line-height:1.6; margin-bottom:12px;">${escapeHtml(p.body)}</p>
    ${p.media ? renderMedia(p.media) : ''}
    <div style="border-top:1px solid var(--line); margin-top:8px; padding-top:14px;">
      <div style="font-size:13px; font-weight:700; margin-bottom:10px;">Replies</div>
      <div id="comment-list" style="display:flex; flex-direction:column; gap:10px; max-height:220px; overflow-y:auto; margin-bottom:14px;">
        ${comments.length===0 ? '<div style="font-size:13px;color:var(--ink-soft);">No replies yet — be the first to help.</div>' :
          comments.map(c=>`<div style="background:var(--paper); border-radius:8px; padding:9px 12px;">
            <div style="font-size:12px; font-weight:700;">${escapeHtml(c.authorName)} <span style="font-weight:400;color:var(--ink-soft);">· ${timeAgo(c.createdAt)}</span></div>
            <div style="font-size:13.5px; margin-top:3px;">${escapeHtml(c.text)}</div>
          </div>`).join('')}
      </div>
      <div style="display:flex; gap:8px;">
        <input id="comment-input" placeholder="Write a reply…" onkeydown="if(event.key==='Enter')submitComment('${id}')">
        <button class="btn primary small" onclick="submitComment('${id}')">Reply</button>
      </div>
    </div>
  `;
  document.getElementById('detail-modal-content').innerHTML = html;
  document.getElementById('detail-modal-bg').classList.add('show');
}
function submitComment(postId){
  const input = document.getElementById('comment-input');
  const text = input.value.trim();
  if(!text) return;
  if(!DB.comments[postId]) DB.comments[postId]=[];
  DB.comments[postId].push({ authorName:DB.profile.name, text, createdAt:nowStr() });
  saveDB();
  openPostDetail(postId);
  renderFeed();
}

/* ============================= SEARCH / DIRECTORY ============================= */
let peopleFilters = { role:'all', level:'all' };
function setPeopleRole(v){ peopleFilters.role=v; document.querySelectorAll('#people-role-seg button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); renderDirectory(); }
function setPeopleLevel(v){ peopleFilters.level=v; document.querySelectorAll('#people-level-seg button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); renderDirectory(); }

function directoryPool(){
  const me = DB.profile ? [{...DB.profile}] : [];
  return [...MOCK_PEOPLE, ...me];
}
function renderDirectory(){
  const q = (document.getElementById('people-search').value||'').toLowerCase().trim();
  let people = directoryPool().filter(p=>p.id!=='me');
  if(peopleFilters.role!=='all') people = people.filter(p=>p.role===peopleFilters.role);
  if(peopleFilters.level!=='all') people = people.filter(p=>p.level===peopleFilters.level);
  if(q) people = people.filter(p=> p.name.toLowerCase().includes(q) || p.subjects.some(s=>s.toLowerCase().includes(q)));

  const list = document.getElementById('directory-list');
  if(people.length===0){
    list.innerHTML = `<div class="empty"><div class="serif">No one matches yet</div>Try a different subject or clear your filters.</div>`;
    return;
  }
  list.innerHTML = people.map(p=>{
    const avatarColor = p.level==='school' ? 'var(--school)' : 'var(--teal)';
    return `
    <div class="card person">
      <div class="avatar" style="background:${avatarColor};">${p.name.slice(0,1).toUpperCase()}</div>
      <div class="info">
        <div style="display:flex; align-items:center; gap:8px;">
          <b>${escapeHtml(p.name)}</b>
          <span class="pill ${p.level}">${p.level==='school'?'School':'University'}</span>
        </div>
        <div class="role">${p.role==='teacher'?'Teacher / Tutor':'Student'}</div>
        <div style="font-size:13px; color:#333A56; margin-bottom:8px;">${escapeHtml(p.bio||'')}</div>
        <div>${p.subjects.map(s=>`<span class="tag">${s}</span>`).join('')}</div>
      </div>
      <button class="btn small" onclick="openChatWith('${p.id}','${escapeHtml(p.name)}')">Message</button>
    </div>`;
  }).join('');
}

/* ============================= CLUBS ============================= */
let clubFilters = { level:'all', mine:'all' };
function setClubLevelFilter(v){
  clubFilters.level=v;
  document.querySelectorAll('#club-level-seg button').forEach(b=>b.classList.toggle('on', b.dataset.v===v));
  renderClubs();
}
function setClubMineFilter(v){
  clubFilters.mine=v;
  document.querySelectorAll('#club-mine-seg button').forEach(b=>b.classList.toggle('on', b.dataset.v===v));
  renderClubs();
}
function isMemberOfClub(club){ return club.members.includes('me'); }
function clubLevelLabel(level){ return level==='school' ? 'School' : level==='university' ? 'University' : 'School & University'; }
function renderClubs(){
  const q = (document.getElementById('club-search').value||'').toLowerCase().trim();
  const subj = document.getElementById('club-subject-filter').value;
  let clubs = [...DB.clubs].sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
  if(clubFilters.level!=='all') clubs = clubs.filter(c=>c.level===clubFilters.level || c.level==='both');
  if(subj) clubs = clubs.filter(c=>c.subject===subj);
  if(clubFilters.mine==='mine') clubs = clubs.filter(c=>isMemberOfClub(c));
  if(q) clubs = clubs.filter(c=> c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q) || (c.desc||'').toLowerCase().includes(q));

  const list = document.getElementById('clubs-list');
  if(clubs.length===0){
    list.innerHTML = `<div class="empty"><div class="serif">No clubs match yet</div>Try different filters, or start your own club.</div>`;
    return;
  }
  list.innerHTML = clubs.map(c=>{
    const joined = isMemberOfClub(c);
    return `
    <div class="card post" style="cursor:pointer;" onclick="openClubDetail('${c.id}')">
      <div class="post-head">
        <span class="pill ${c.level}">${clubLevelLabel(c.level)}</span>
        <span class="tag" style="margin-left:6px;">${c.subject}</span>
        <span style="margin-left:auto; font-size:12px; color:var(--ink-soft);">${c.members.length} member${c.members.length===1?'':'s'}</span>
      </div>
      <h3>${escapeHtml(c.name)}</h3>
      <p class="body">${escapeHtml(c.desc||'')}</p>
      <div class="post-foot">
        <span>Run by ${escapeHtml(c.ownerName)}</span>
        <button onclick="event.stopPropagation(); ${joined?`leaveClub('${c.id}')`:`joinClub('${c.id}')`}" style="margin-left:auto; color:${joined?'var(--coral)':'var(--teal)'};">${joined?'Leave club':'Join club'}</button>
      </div>
    </div>`;
  }).join('');
}
function openClubModal(){
  document.getElementById('club-name').value='';
  document.getElementById('club-desc').value='';
  document.getElementById('club-level').value = DB.profile.level;
  document.getElementById('club-modal-bg').classList.add('show');
}
function submitClub(){
  const name = document.getElementById('club-name').value.trim();
  const subject = document.getElementById('club-subject').value;
  const level = document.getElementById('club-level').value;
  const desc = document.getElementById('club-desc').value.trim();
  if(!name){ alert('Please name your club.'); return; }
  const club = { id:uid('c'), name, subject, level, desc, ownerId:'me', ownerName:DB.profile.name, members:['me'], createdAt: nowStr() };
  DB.clubs.unshift(club);
  saveDB();
  closeModal('club-modal-bg');
  renderClubs();
}
function joinClub(id){
  const c = DB.clubs.find(x=>x.id===id);
  if(!c.members.includes('me')) c.members.push('me');
  saveDB();
  renderClubs();
  if(document.getElementById('club-detail-bg').classList.contains('show')) openClubDetail(id);
}
function leaveClub(id){
  const c = DB.clubs.find(x=>x.id===id);
  if(c.ownerId==='me'){ alert("You created this club, so you can't leave it — you can delete it instead from inside the club."); return; }
  c.members = c.members.filter(m=>m!=='me');
  saveDB();
  renderClubs();
  if(document.getElementById('club-detail-bg').classList.contains('show')) openClubDetail(id);
}
function deleteClub(id){
  if(!confirm('Delete this club? This removes its discussion for everyone (on this device).')) return;
  DB.clubs = DB.clubs.filter(x=>x.id!==id);
  delete DB.clubMessages[id];
  saveDB();
  closeModal('club-detail-bg');
  renderClubs();
}
function clubMemberNames(c){
  return c.members.map(id=> id==='me' ? DB.profile.name : (personById(id)? personById(id).name : id));
}
function openClubDetail(id){
  const c = DB.clubs.find(x=>x.id===id);
  if(!DB.clubMessages[id]) DB.clubMessages[id]=[];
  const joined = isMemberOfClub(c);
  const msgs = DB.clubMessages[id];
  const html = `
    <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
      <div>
        <span class="pill ${c.level}">${clubLevelLabel(c.level)}</span>
        <span class="tag" style="margin-left:6px;">${c.subject}</span>
        <h2 style="margin-top:8px;">${escapeHtml(c.name)}</h2>
      </div>
      <div style="display:flex; gap:8px; flex:none;">
        <button class="btn small" onclick="openLiveCamera('${escapeHtml(c.name)}')">🎥 Live camera</button>
        <button class="btn small" onclick="${joined?`leaveClub('${c.id}')`:`joinClub('${c.id}')`}" ${c.ownerId==='me'?'disabled':''} style="${joined?'border-color:var(--coral); color:var(--coral);':''}">${joined?'Leave club':'Join club'}</button>
      </div>
    </div>
    <p style="font-size:13.5px; color:#333A56; margin:10px 0 14px;">${escapeHtml(c.desc||'')}</p>
    <div style="font-size:12px; color:var(--ink-soft); margin-bottom:14px;">Run by ${escapeHtml(c.ownerName)} · ${clubMemberNames(c).length} members: ${clubMemberNames(c).map(escapeHtml).join(', ')}</div>
    <div style="border-top:1px solid var(--line); padding-top:14px;">
      <div style="font-size:13px; font-weight:700; margin-bottom:10px;">Club discussion</div>
      <div id="club-msg-list" style="display:flex; flex-direction:column; gap:10px; max-height:260px; overflow-y:auto; margin-bottom:14px;">
        ${msgs.length===0 ? '<div style="font-size:13px;color:var(--ink-soft);">No messages yet — say hello to the club.</div>' :
          msgs.map(m=>{
            let mediaHtml='';
            if(m.media){
              mediaHtml = m.media.type.startsWith('image')
                ? `<img src="${m.media.data}" style="max-width:220px;border-radius:8px;margin-top:6px;display:block;">`
                : `<video src="${m.media.data}" controls style="max-width:260px;border-radius:8px;margin-top:6px;display:block;"></video>`;
            }
            return `<div style="background:var(--paper); border-radius:8px; padding:9px 12px;">
            <div style="font-size:12px; font-weight:700;">${escapeHtml(m.authorName)} <span style="font-weight:400;color:var(--ink-soft);">· ${timeAgo(m.createdAt)}</span></div>
            ${m.text ? `<div style="font-size:13.5px; margin-top:3px;">${escapeHtml(m.text)}</div>` : ''}
            ${mediaHtml}
          </div>`;
          }).join('')}
      </div>
      ${joined ? `
      <div style="display:flex; gap:8px; align-items:center;">
        <label class="upload-btn" style="padding:9px 11px;">📎<input type="file" id="club-msg-media" accept="image/*,video/*" style="display:none" onchange="stageClubMedia(event)"></label>
        <input id="club-msg-input" placeholder="Message the club…" onkeydown="if(event.key==='Enter')submitClubMessage('${id}')">
        <button class="btn primary small" onclick="submitClubMessage('${id}')">Send</button>
      </div>
      <div id="club-media-preview" style="display:none; font-size:12px; color:var(--ink-soft); margin-top:6px;"></div>
      ` : `<div style="font-size:12.5px; color:var(--ink-soft);">Join the club to post in the discussion.</div>`}
    </div>
    <div style="display:flex; gap:10px; margin-top:16px;">
      <button class="btn" onclick="closeModal('club-detail-bg')">Close</button>
      ${c.ownerId==='me' ? `<button class="btn" style="border-color:var(--coral); color:var(--coral);" onclick="deleteClub('${c.id}')">Delete club</button>` : ''}
    </div>
  `;
  document.getElementById('club-detail-content').innerHTML = html;
  document.getElementById('club-detail-bg').classList.add('show');
}
let stagedClubMedia = null;
function stageClubMedia(e){
  const f = e.target.files[0]; if(!f) return;
  if(f.size > 15*1024*1024){ alert('Please choose a file under 15MB.'); e.target.value=''; return; }
  const reader = new FileReader();
  reader.onload = ()=>{
    stagedClubMedia = { type:f.type, data:reader.result };
    const prev = document.getElementById('club-media-preview');
    if(prev){ prev.style.display='block'; prev.textContent = '📎 attached: '+f.name; }
  };
  reader.readAsDataURL(f);
}
function submitClubMessage(clubId){
  const input = document.getElementById('club-msg-input');
  const text = input.value.trim();
  if(!text && !stagedClubMedia) return;
  DB.clubMessages[clubId].push({ authorName:DB.profile.name, text, media:stagedClubMedia, createdAt: nowStr() });
  stagedClubMedia = null;
  saveDB();
  openClubDetail(clubId);
}

/* ============================= CHAT ============================= */
let activeChatId = null;
function personById(id){
  if(id==='me') return DB.profile;
  return MOCK_PEOPLE.find(p=>p.id===id);
}
function conversationsList(){
  // union of anyone we have messages with
  return Object.keys(DB.messages);
}
function openChatWith(personId, name){
  if(!DB.messages[personId]) DB.messages[personId]=[];
  saveDB();
  goTab('chat');
  activeChatId = personId;
  renderChatList();
  renderChatMain();
}
function messageFromPost(postId){
  const p = DB.posts.find(x=>x.id===postId);
  const pid = p.authorId==='me' ? null : p.authorId;
  if(!pid){ alert("This is your own post."); return; }
  openChatWith(pid, p.authorName);
  const seedText = "Hi! I saw your post — \""+p.title+"\". ";
  document.getElementById('chat-text').value = seedText;
}
function renderChatList(){
  const ids = conversationsList();
  const wrap = document.getElementById('chat-list');
  if(ids.length===0){
    wrap.innerHTML = `<div style="padding:20px 16px; font-size:12.5px; color:var(--ink-soft);">No conversations yet. Message someone from Find Someone or from a problem post.</div>`;
    return;
  }
  wrap.innerHTML = ids.map(id=>{
    const person = personById(id);
    if(!person) return '';
    const msgs = DB.messages[id]||[];
    const last = msgs[msgs.length-1];
    const avatarColor = person.level==='school' ? 'var(--school)' : 'var(--teal)';
    return `<div class="chat-list-item ${id===activeChatId?'active':''}" onclick="activeChatId='${id}'; renderChatList(); renderChatMain();">
      <div class="avatar" style="width:30px;height:30px;font-size:12px;background:${avatarColor};">${person.name.slice(0,1).toUpperCase()}</div>
      <div class="txt"><b>${escapeHtml(person.name)}</b><span>${last ? (last.text ? escapeHtml(last.text.slice(0,28)) : '📎 attachment') : 'Say hi 👋'}</span></div>
    </div>`;
  }).join('');
}
function renderChatMain(){
  const head = document.getElementById('chat-head');
  const body = document.getElementById('chat-body');
  if(!activeChatId){ head.innerHTML = '<span style="color:var(--ink-soft); font-size:13.5px;">Select a conversation</span>'; body.innerHTML=''; return; }
  const person = personById(activeChatId);
  head.innerHTML = `<div class="avatar" style="width:30px;height:30px;font-size:12px;background:var(--teal);">${person.name.slice(0,1).toUpperCase()}</div><b style="font-size:13.5px;">${escapeHtml(person.name)}</b><button class="btn small" style="margin-left:auto;" onclick="openLiveCamera('${escapeHtml(person.name)}')">🎥 Live camera</button>`;
  const msgs = DB.messages[activeChatId]||[];
  if(msgs.length===0){
    body.innerHTML = `<div style="margin:auto; color:var(--ink-soft); font-size:13px; text-align:center;">This is the start of your conversation with ${escapeHtml(person.name)}.</div>`;
  } else {
    body.innerHTML = msgs.map(m=>{
      let mediaHtml='';
      if(m.media){
        mediaHtml = m.media.type.startsWith('image') ? `<img src="${m.media.data}">` : `<video src="${m.media.data}" controls style="max-width:220px;border-radius:8px;margin-top:5px;"></video>`;
      }
      return `<div class="msg ${m.from==='me'?'me':'them'}">${m.text?escapeHtml(m.text):''}${mediaHtml}</div>`;
    }).join('');
  }
  body.scrollTop = body.scrollHeight;
}
let stagedChatMedia = null;
function stageChatMedia(e){
  const f = e.target.files[0]; if(!f) return;
  if(f.size > 15*1024*1024){ alert('Please choose a file under 15MB.'); e.target.value=''; return; }
  const reader = new FileReader();
  reader.onload = ()=>{
    stagedChatMedia = { type:f.type, data:reader.result };
    const prev = document.getElementById('chat-media-preview');
    prev.style.display='block';
    prev.textContent = '📎 attached: '+f.name;
  };
  reader.readAsDataURL(f);
}
function sendMessage(){
  if(!activeChatId) return;
  const input = document.getElementById('chat-text');
  const text = input.value.trim();
  if(!text && !stagedChatMedia) return;
  DB.messages[activeChatId].push({ from:'me', text, media:stagedChatMedia, at:nowStr() });
  input.value=''; stagedChatMedia=null;
  document.getElementById('chat-media-preview').style.display='none';
  saveDB();
  renderChatMain(); renderChatList();
  // light auto-reply so the thread feels alive (clearly a local simulation)
  setTimeout(()=>{
    const person = personById(activeChatId);
    const replies = [
      "Thanks for reaching out — can you share more detail on where exactly you're stuck?",
      "Sure, happy to help. Could you post the exact question or a photo of it?",
      "Got it, give me a moment to look at this properly.",
      "I've helped with something similar before — let's work through it step by step."
    ];
    DB.messages[activeChatId].push({ from:'them', text: replies[Math.floor(Math.random()*replies.length)], media:null, at:nowStr() });
    saveDB();
    if(activeChatId===activeChatId) renderChatMain();
    renderChatList();
  }, 900);
}

/* ============================= FOCUS TIMER ============================= */
let timerLen = 25*60, timerLeft = 25*60, timerRunning=false, timerInterval=null, timerModeLabel='FOCUS SESSION';
const RING_LEN = 741.5;

function setTimerLength(mins,label){
  if(timerRunning) return;
  timerLen = mins*60; timerLeft = mins*60; timerModeLabel = label;
  updateTimerDisplay();
}
function updateTimerDisplay(){
  const m = Math.floor(timerLeft/60).toString().padStart(2,'0');
  const s = Math.floor(timerLeft%60).toString().padStart(2,'0');
  document.getElementById('timer-display').textContent = `${m}:${s}`;
  document.getElementById('timer-mode').textContent = timerModeLabel;
  const frac = timerLeft/timerLen;
  document.getElementById('ring-progress').setAttribute('stroke-dashoffset', RING_LEN*(1-frac));
}
function toggleTimer(){
  timerRunning = !timerRunning;
  document.getElementById('timer-toggle').textContent = timerRunning ? 'Pause' : 'Start';
  if(timerRunning){
    timerInterval = setInterval(()=>{
      timerLeft--;
      if(timerLeft<=0){
        clearInterval(timerInterval); timerRunning=false;
        document.getElementById('timer-toggle').textContent='Start';
        if(timerModeLabel.includes('FOCUS')){
          DB.focus.sessions.push({ at:nowStr(), minutes: timerLen/60 });
          saveDB(); renderFocusStats();
        }
        timerLeft=0; updateTimerDisplay();
        alert(timerModeLabel.includes('FOCUS') ? "Nice work — session complete! Time for a break." : "Break's over — ready to focus again?");
        return;
      }
      updateTimerDisplay();
    },1000);
  } else {
    clearInterval(timerInterval);
  }
}
function resetTimer(){
  clearInterval(timerInterval); timerRunning=false;
  document.getElementById('timer-toggle').textContent='Start';
  timerLeft = timerLen; updateTimerDisplay();
}
function restoreTimerUI(){ updateTimerDisplay(); }
function renderFocusStats(){
  const sessions = DB.focus.sessions;
  const today = new Date().toDateString();
  const todayCount = sessions.filter(s=> new Date(s.at).toDateString()===today).length;
  const totalMin = sessions.reduce((a,s)=>a+s.minutes,0);
  document.getElementById('stat-today').textContent = todayCount;
  document.getElementById('stat-total').textContent = sessions.length;
  document.getElementById('stat-minutes').textContent = Math.round(totalMin);
}

/* ============================= EXAM PLANNER ============================= */
let examTopicsDraft = [];
function openExamModal(){
  document.getElementById('exam-name').value='';
  document.getElementById('exam-date').value='';
  document.getElementById('exam-hours').value=2;
  examTopicsDraft = [];
  renderExamTopicsDraft();
  document.getElementById('exam-modal-bg').classList.add('show');
}
function addExamTopic(){
  const input = document.getElementById('exam-topic-input');
  const v = input.value.trim();
  if(!v) return;
  examTopicsDraft.push(v);
  input.value='';
  renderExamTopicsDraft();
}
function removeExamTopicDraft(i){ examTopicsDraft.splice(i,1); renderExamTopicsDraft(); }
function renderExamTopicsDraft(){
  document.getElementById('exam-topics-list').innerHTML = examTopicsDraft.map((t,i)=>
    `<div class="topic-chip">${escapeHtml(t)}<button onclick="removeExamTopicDraft(${i})">✕</button></div>`
  ).join('');
}

/* ---- the "AI" planning algorithm ----
   Rule-based spaced-practice scheduler:
   - counts days between today and exam date
   - reserves the last day as light review + rest
   - distributes topics across the remaining days, 1-3 topics/day depending on available hours
   - inserts a cumulative review every 4th day and the day before the exam
   - roughly estimates 45-60 min per topic first pass, so hours/day decides topics/day
*/
function generatePlan(){
  const name = document.getElementById('exam-name').value.trim();
  const dateStr = document.getElementById('exam-date').value;
  const hours = parseFloat(document.getElementById('exam-hours').value)||2;
  if(!name || !dateStr || examTopicsDraft.length===0){
    alert('Please add an exam name, date, and at least one topic.');
    return;
  }
  const examDate = new Date(dateStr+'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const daysUntil = Math.ceil((examDate-today)/86400000);
  if(daysUntil < 0){ alert('Pick a date in the future.'); return; }
  if(daysUntil === 0){ alert('That exam is today — good luck! Try adding it a day earlier next time for a real plan.'); }

  const topics = [...examTopicsDraft];
  const topicsPerDay = Math.max(1, Math.round(hours/0.8)); // ~48 min per topic block
  const studyDays = Math.max(daysUntil, 1);

  // build the queue with spaced repetition: each topic appears once to learn,
  // then gets a short review pass ~2-3 days later if time allows.
  let schedule = []; // { dayIndex, items:[{topic, kind}] }
  for(let i=0;i<studyDays;i++) schedule.push({dayIndex:i, items:[]});

  let topicQueue = [...topics];
  let dayPointer = 0;
  const reviewQueue = []; // {topic, dueDay}

  while(topicQueue.length>0 && dayPointer < studyDays){
    const day = schedule[dayPointer];
    let slots = topicsPerDay;
    // fit in due reviews first (short, count as half a slot each but we'll just cap total items)
    while(slots>0 && topicQueue.length>0){
      const t = topicQueue.shift();
      day.items.push({ topic:t, kind:'learn' });
      reviewQueue.push({ topic:t, dueDay: Math.min(dayPointer+3, studyDays-1) });
      slots--;
    }
    dayPointer++;
  }
  // if topics didn't all fit (too many topics, too few days), pack remaining onto the last non-final day
  if(topicQueue.length>0){
    const packDay = schedule[Math.max(0,studyDays-2)] || schedule[studyDays-1];
    topicQueue.forEach(t=> packDay.items.push({topic:t, kind:'learn (catch-up)'}));
    topicQueue = [];
  }
  // place reviews
  reviewQueue.forEach(r=>{
    if(r.dueDay < studyDays){
      schedule[r.dueDay].items.push({ topic:r.topic, kind:'review' });
    }
  });
  // final day (or last 1-2 days) becomes full review of everything + rest reminder
  const finalIdx = studyDays-1;
  if(schedule[finalIdx]){
    schedule[finalIdx].items = topics.map(t=>({topic:t, kind:'final review'}));
  }

  const plan = {
    id: uid('exam'),
    name, subject:name, date: dateStr, hoursPerDay:hours,
    topics, createdAt: nowStr(),
    schedule: schedule.map(d=>({
      dayIndex:d.dayIndex,
      date: new Date(today.getTime()+d.dayIndex*86400000).toISOString().slice(0,10),
      items: d.items.map(it=>({ ...it, done:false }))
    }))
  };
  DB.examPlans.unshift(plan);
  saveDB();
  closeModal('exam-modal-bg');
  renderExamList();
}

function renderExamList(){
  const list = document.getElementById('exam-list');
  if(DB.examPlans.length===0){
    list.innerHTML = `<div class="empty"><div class="serif">No exam plans yet</div>Add your exam date and topics, and get a day-by-day study plan.</div>`;
    return;
  }
  list.innerHTML = DB.examPlans.map(p=>{
    const today = new Date(); today.setHours(0,0,0,0);
    const examDate = new Date(p.date+'T00:00:00');
    const daysLeft = Math.ceil((examDate-today)/86400000);
    const totalItems = p.schedule.reduce((a,d)=>a+d.items.length,0);
    const doneItems = p.schedule.reduce((a,d)=>a+d.items.filter(i=>i.done).length,0);
    return `
    <div class="card" style="padding:18px 20px; margin-bottom:14px; cursor:pointer;" onclick="openExamDetail('${p.id}')">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h3 style="font-size:16.5px;">${escapeHtml(p.name)}</h3>
          <div style="font-size:12.5px; color:var(--ink-soft); margin-top:3px;">${p.topics.length} topics · ${formatDate(p.date)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:'Fraunces',serif; font-size:22px; color:${daysLeft<=2?'var(--coral)':'var(--teal)'};">${daysLeft<0?'Past':daysLeft}</div>
          <div style="font-size:11px; color:var(--ink-soft);">${daysLeft<0?'exam passed':'days left'}</div>
        </div>
      </div>
      <div style="height:6px; background:var(--paper); border-radius:99px; margin-top:12px; overflow:hidden;">
        <div style="height:100%; width:${totalItems?Math.round(doneItems/totalItems*100):0}%; background:var(--accent);"></div>
      </div>
      <div style="font-size:11.5px; color:var(--ink-soft); margin-top:5px;">${doneItems}/${totalItems} study items checked off</div>
    </div>`;
  }).join('');
}
function formatDate(d){
  return new Date(d+'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
}
function openExamDetail(id){
  const p = DB.examPlans.find(x=>x.id===id);
  const today = new Date(); today.setHours(0,0,0,0);
  const examDate = new Date(p.date+'T00:00:00');
  const daysLeft = Math.ceil((examDate-today)/86400000);
  const kindLabel = {learn:'Learn', review:'Review', 'final review':'Final review', 'learn (catch-up)':'Catch-up'};
  const html = `
    <h2>${escapeHtml(p.name)}</h2>
    <div class="countdown" style="background:var(--coral-soft); border:none; margin:12px 0 16px;">
      <div class="n">${daysLeft<0?'—':daysLeft}</div>
      <div><div style="font-weight:700; font-size:13.5px;">${daysLeft<0?'Exam has passed':'days until your exam'}</div><div class="l">${formatDate(p.date)} · ${p.topics.length} topics · ~${p.hoursPerDay}h/day planned</div></div>
    </div>
    <div style="max-height:420px; overflow-y:auto; padding-right:4px;">
      ${p.schedule.map((d,di)=>{
        const isExamDay = di===p.schedule.length-1;
        if(d.items.length===0) return '';
        return `<div class="plan-day ${isExamDay?'exam':''}">
          <div class="d-label">${isExamDay?'Exam day — final review':'Day '+(di+1)}</div>
          <div class="d-date">${formatDate(d.date)}</div>
          ${d.items.map((it,ii)=>`
            <label class="plan-topic">
              <input type="checkbox" ${it.done?'checked':''} onchange="toggleExamItem('${p.id}',${di},${ii})">
              <span><b>${kindLabel[it.kind]||it.kind}:</b> ${escapeHtml(it.topic)}</span>
            </label>`).join('')}
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex; gap:10px; margin-top:16px;">
      <button class="btn" onclick="closeModal('exam-detail-bg')">Close</button>
      <button class="btn" style="border-color:var(--coral); color:var(--coral);" onclick="deleteExamPlan('${p.id}')">Delete plan</button>
    </div>
  `;
  document.getElementById('exam-detail-content').innerHTML = html;
  document.getElementById('exam-detail-bg').classList.add('show');
}
function toggleExamItem(planId, dayIdx, itemIdx){
  const p = DB.examPlans.find(x=>x.id===planId);
  p.schedule[dayIdx].items[itemIdx].done = !p.schedule[dayIdx].items[itemIdx].done;
  saveDB();
  openExamDetail(planId);
  renderExamList();
}
function deleteExamPlan(id){
  if(!confirm('Delete this exam plan?')) return;
  DB.examPlans = DB.examPlans.filter(x=>x.id!==id);
  saveDB();
  closeModal('exam-detail-bg');
  renderExamList();
}

/* ============================= PROFILE ============================= */
let pfSubjectsDraft = [];
function renderProfileTab(){
  document.getElementById('pf-name').value = DB.profile.name;
  document.getElementById('pf-role').value = DB.profile.role;
  document.getElementById('pf-level').value = DB.profile.level;
  document.getElementById('pf-bio').value = DB.profile.bio||'';
  pfSubjectsDraft = [...DB.profile.subjects];
  renderPfSubjects();

  document.getElementById('prof-posts').textContent = DB.posts.filter(p=>p.authorId==='me').length;
  document.getElementById('prof-replies').textContent = Object.values(DB.comments).flat().filter(c=>c.authorName===DB.profile.name).length;
  document.getElementById('prof-sessions').textContent = DB.focus.sessions.length;
  document.getElementById('prof-plans').textContent = DB.examPlans.length;
}
function renderPfSubjects(){
  document.getElementById('pf-subjects').innerHTML = allSubjects().map(s=>{
    const on = pfSubjectsDraft.includes(s);
    return `<button type="button" class="tag selectable ${on?'on':''}" onclick="togglePfSubject('${s.replace(/'/g,"\\'")}')">${s}</button>`;
  }).join('');
}
function togglePfSubject(s){
  const i = pfSubjectsDraft.indexOf(s);
  if(i>-1) pfSubjectsDraft.splice(i,1); else pfSubjectsDraft.push(s);
  renderPfSubjects();
}
function pfAddCustomSubject(){
  const input = document.getElementById('pf-custom-subject');
  const v = input.value.trim();
  if(!v) return;
  if(!DB.customSubjects.includes(v) && !SUBJECT_LIST.includes(v)) DB.customSubjects.push(v);
  if(!pfSubjectsDraft.includes(v)) pfSubjectsDraft.push(v);
  input.value='';
  populateSubjectSelects();
  renderPfSubjects();
}
function saveProfile(){
  DB.profile.name = document.getElementById('pf-name').value.trim() || DB.profile.name;
  DB.profile.role = document.getElementById('pf-role').value;
  DB.profile.level = document.getElementById('pf-level').value;
  DB.profile.bio = document.getElementById('pf-bio').value.trim();
  DB.profile.subjects = [...pfSubjectsDraft];
  saveDB();
  refreshRailUser();
  const ok = document.getElementById('pf-saved');
  ok.style.display='inline'; setTimeout(()=>ok.style.display='none', 1600);
}
function resetAll(){
  if(!confirm('This will erase your profile, posts, chats, and plans from this browser. Continue?')) return;
  localStorage.removeItem(DB_KEY);
  location.reload();
}

/* ============================= LIVE CAMERA (local preview) ============================= */
let callStream = null;
let callMicOn = true, callCamOn = true;
async function openLiveCamera(label){
  document.getElementById('call-label').textContent = 'Camera preview — ' + label;
  document.getElementById('call-bg').classList.add('show');
  const video = document.getElementById('call-local-video');
  const offline = document.getElementById('call-offline');
  video.style.display='block'; offline.style.display='none';
  callMicOn = true; callCamOn = true;
  document.getElementById('call-mic-btn').classList.remove('off');
  document.getElementById('call-cam-btn').classList.remove('off');
  try{
    callStream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
    video.srcObject = callStream;
  }catch(err){
    video.style.display='none';
    offline.style.display='block';
    offline.textContent = "Couldn't access your camera (permission was blocked or no camera is available). Allow camera access in your browser to preview it here.";
  }
}
function toggleCallMic(){
  if(!callStream) return;
  callMicOn = !callMicOn;
  callStream.getAudioTracks().forEach(t=> t.enabled = callMicOn);
  document.getElementById('call-mic-btn').classList.toggle('off', !callMicOn);
}
function toggleCallCam(){
  if(!callStream) return;
  callCamOn = !callCamOn;
  callStream.getVideoTracks().forEach(t=> t.enabled = callCamOn);
  document.getElementById('call-cam-btn').classList.toggle('off', !callCamOn);
}
function closeLiveCamera(){
  if(callStream){ callStream.getTracks().forEach(t=>t.stop()); callStream=null; }
  document.getElementById('call-bg').classList.remove('show');
}

/* ============================= BACKUP EXPORT/IMPORT ============================= */
function exportData(){
  const blob = new Blob([JSON.stringify(DB,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'study-in-wibe-backup.json';
  a.click();
  URL.revokeObjectURL(url);
}
function importData(e){
  const f = e.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const data = JSON.parse(reader.result);
      DB = data;
      saveDB();
      location.reload();
    }catch(err){ alert('That file could not be read as a Study in Wibe backup.'); }
  };
  reader.readAsText(f);
  e.target.value='';
}

/* ============================= INIT ============================= */
boot();
