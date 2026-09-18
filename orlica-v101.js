(() => {
  const API='https://dbwnvbfdphqmfjzbpqnw.supabase.co';
  const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid252YmZkcGhxbWZqemJwcW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2ODYxNzIsImV4cCI6MjEwNTI2MjE3Mn0.3fxOPVcWuVCMmACMCkRR9vjt2SLMts-DjI2SSuYof5A';
  const TZ='Asia/Yakutsk';
  const headers={'apikey':KEY,'Authorization':`Bearer ${KEY}`,'Content-Type':'application/json'};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  document.documentElement.classList.add('orlica-v101');

  function cleanHero(){
    const root=document.querySelector('.hero-visual');
    if(!root)return;
    [...root.querySelectorAll('a,button,span,div')].forEach(el=>{
      const text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(text.includes('сравнить до')||text.includes('до / после')||text.includes('до/после')){
        const target=el.closest('a,button')||el;
        target.classList.add('v101-remove');
        target.setAttribute('aria-hidden','true');
      }
    });
  }

  function markByHeading(needle,cls){
    const headings=[...document.querySelectorAll('h1,h2,h3,h4,strong')];
    const h=headings.find(x=>(x.textContent||'').toUpperCase().includes(needle));
    const sec=h?.closest('section');
    if(sec)sec.classList.add(cls);
    return sec||null;
  }

  function polishRecordedIssues(){
    cleanHero();
    const studio=markByHeading('MALABAR','v101-studio-section');
    if(studio){
      [...studio.querySelectorAll('article,div')].forEach(el=>{
        const r=el.getBoundingClientRect(); if(r.width<180||r.height<90)return;
        const c=getComputedStyle(el).backgroundColor.match(/[\d.]+/g)?.slice(0,3).map(Number);
        if(c&&c.length===3&&((c[0]+c[1]+c[2])/3)>175)el.classList.add('v101-studio-light');
      });
    }
    const reviews=markByHeading('СЛОВО ВАМ','v101-reviews-section');
    if(reviews){
      [...reviews.querySelectorAll('div,ul')].forEach(el=>{
        if(el.clientWidth>180&&el.scrollWidth>el.clientWidth+24)el.classList.add('v101-scroll-row');
      });
    }
  }

  async function fetchAnnouncements(){
    const r=await fetch(`${API}/rest/v1/announcements?select=id,title,body,label,url,created_at&order=sort_order.desc,created_at.desc&limit=6`,{headers,cache:'no-store'});
    if(!r.ok)throw new Error('ANNOUNCEMENTS_UNAVAILABLE');
    return r.json();
  }

  function mountBoard(items=[]){
    let sec=document.querySelector('.v101-board');
    if(!sec){
      sec=document.createElement('section');
      sec.className='v101-board';
      sec.setAttribute('aria-label','Объявления Светы');
      const ticker=document.querySelector('.ticker');
      const hero=document.querySelector('.hero');
      (ticker||hero)?.insertAdjacentElement('afterend',sec);
    }
    if(!sec)return;
    const cards=items.length?items.map((x,i)=>`<article class="v101-notice"><div><div class="v101-notice-label">${esc(x.label||`Объявление ${String(i+1).padStart(2,'0')}`)}</div><h3>${esc(x.title)}</h3><p>${esc(x.body||'')}</p></div>${x.url?`<a href="${esc(x.url)}" target="_blank" rel="noopener">Подробнее</a>`:''}</article>`).join(''):`<div class="v101-board-empty">Пока без объявлений. Здесь Света сможет публиковать акции, свободные окна, гостевые дни и важные новости.</div>`;
    sec.innerHTML=`<div class="v101-board-inner"><div class="v101-board-head"><div><div class="v101-board-kicker">ORLICA / СВЕЖЕЕ</div><h2>ДОСКА.</h2></div><p>Акции, новые даты и важные объявления от Светы — всё в одном месте.</p></div><div class="v101-board-grid">${cards}</div></div>`;
  }

  async function loadBoard(){try{mountBoard(await fetchAnnouncements())}catch{mountBoard([])}}

  const isoLocalDate=(d=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  const keyForLegacyDay=iso=>new Intl.DateTimeFormat('ru-RU',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(`${iso}T12:00:00+09:00`));
  const monthLabel=key=>new Intl.DateTimeFormat('ru-RU',{timeZone:TZ,month:'long',year:'numeric'}).format(new Date(`${key}-01T12:00:00+09:00`));

  async function fetchCalendar(){
    const now=isoLocalDate();
    const first=now.slice(0,7)+'-01';
    const r=await fetch(`${API}/rest/v1/rpc/public_calendar_days`,{method:'POST',headers,body:JSON.stringify({p_from:first,p_days:93}),cache:'no-store'});
    if(!r.ok)throw new Error('CALENDAR_UNAVAILABLE');
    return r.json();
  }

  function mountCalendar(rows){
    const legacy=document.querySelector('#booking-days');
    const cal=legacy?.closest('.booking-calendar');
    if(!legacy||!cal)return false;
    let shell=cal.querySelector('.v101-calendar');
    if(!shell){shell=document.createElement('div');shell.className='v101-calendar';legacy.insertAdjacentElement('beforebegin',shell)}
    const today=isoLocalDate();
    const months=[...new Set(rows.map(r=>String(r.day).slice(0,7)))];
    let current=shell.dataset.month && months.includes(shell.dataset.month)?shell.dataset.month:months[0];
    const render=()=>{
      shell.dataset.month=current;
      const idx=months.indexOf(current), y=Number(current.slice(0,4)), m=Number(current.slice(5,7));
      const daysInMonth=new Date(Date.UTC(y,m,0)).getUTCDate();
      const firstDow=(new Date(Date.UTC(y,m-1,1)).getUTCDay()+6)%7;
      const map=new Map(rows.map(r=>[String(r.day).slice(0,10),r]));
      const cells=[];
      for(let i=0;i<firstDow;i++)cells.push('<span class="v101-day blank"></span>');
      for(let d=1;d<=daysInMonth;d++){
        const iso=`${current}-${String(d).padStart(2,'0')}`;
        const row=map.get(iso)||{status:iso<today?'past':'busy',open_count:0};
        const state=iso<today?'past':row.status==='open'?'open':'busy';
        const count=Number(row.open_count||0);
        const label=state==='open'?`${count} ${count===1?'окно':'окна'}`:state==='past'?'прошло':'занято';
        cells.push(`<button type="button" class="v101-day ${state}" data-date="${iso}" ${state==='open'?'':'disabled'} aria-label="${d} ${monthLabel(current)} — ${label}"><span class="num">${String(d).padStart(2,'0')}</span><span class="mini">${label}</span></button>`);
      }
      shell.innerHTML=`<div class="v101-calendar-shell"><div class="v101-calendar-nav"><button type="button" class="prev" ${idx<=0?'disabled':''} aria-label="Предыдущий месяц">‹</button><div class="v101-calendar-title">${monthLabel(current)}</div><button type="button" class="next" ${idx>=months.length-1?'disabled':''} aria-label="Следующий месяц">›</button></div><div class="v101-weekdays"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div><div class="v101-month-grid">${cells.join('')}</div><div class="v101-calendar-legend"><span><i class="free"></i>Свободно</span><span><i class="busy"></i>Занято / недоступно</span></div></div>`;
      shell.querySelector('.prev')?.addEventListener('click',()=>{if(idx>0){current=months[idx-1];render()}});
      shell.querySelector('.next')?.addEventListener('click',()=>{if(idx<months.length-1){current=months[idx+1];render()}});
      shell.querySelectorAll('.v101-day.open').forEach(btn=>btn.addEventListener('click',async()=>{
        shell.querySelectorAll('.v101-day').forEach(x=>x.classList.remove('is-selected'));btn.classList.add('is-selected');
        const key=keyForLegacyDay(btn.dataset.date);
        let legacyBtn=legacy.querySelector(`.booking-day[data-day="${CSS.escape(key)}"]`);
        for(let i=0;!legacyBtn&&i<10;i++){await new Promise(r=>setTimeout(r,120));legacyBtn=legacy.querySelector(`.booking-day[data-day="${CSS.escape(key)}"]`)}
        if(legacyBtn){legacyBtn.click();document.querySelector('#booking-times')?.scrollIntoView({behavior:'smooth',block:'nearest'})}
      }));
    };
    render();
    return true;
  }

  let calendarRefreshTimer=0;
  async function refreshCalendar(){
    clearTimeout(calendarRefreshTimer);
    calendarRefreshTimer=setTimeout(async()=>{try{const rows=await fetchCalendar();mountCalendar(rows)}catch(e){console.warn('ORLICA calendar',e)}},120);
  }

  function watchBooking(){
    let tries=0;
    const timer=setInterval(()=>{
      const legacy=document.querySelector('#booking-days');
      if(legacy){clearInterval(timer);refreshCalendar();let muted=false;new MutationObserver(()=>{if(muted)return;muted=true;setTimeout(()=>{muted=false;refreshCalendar()},550)}).observe(legacy,{childList:true,subtree:true,attributes:true})}
      else if(++tries>60)clearInterval(timer);
    },150);
  }

  function boot(){
    polishRecordedIssues();
    loadBoard();
    watchBooking();
    setTimeout(polishRecordedIssues,900);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
