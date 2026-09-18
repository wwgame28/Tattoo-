/* ORLICA V11 consolidated JS */

/* source: director-v5.js */

/* Danil Director V5 — consolidated UI runtime */
(()=>{
  const body=document.body;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const noMotion=()=>reduce.matches||body.classList.contains('motion-off');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const header=document.querySelector('header');
  const mobileBook=document.querySelector('.mobile-book');
  const hero=document.querySelector('.hero');
  const booking=document.querySelector('.booking');
  const motionButton=document.getElementById('motion');

  let frame=0;
  const navMap=new Map([...document.querySelectorAll('header nav a[href^="#"]')].map(a=>[a.getAttribute('href').slice(1),a]));
  function paint(){
    frame=0;
    header?.classList.toggle('director-scrolled',scrollY>18);
  }
  addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(paint)},{passive:true});
  paint();

  if('IntersectionObserver' in window&&navMap.size){
    const sectionObserver=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible)return;
      navMap.forEach(a=>{a.classList.remove('director-active');a.removeAttribute('aria-current')});
      const active=navMap.get(visible.target.id);
      if(active){active.classList.add('director-active');active.setAttribute('aria-current','location')}
    },{rootMargin:'-20% 0px -62% 0px',threshold:[0,.2,.55]});
    navMap.forEach((_,id)=>{const section=document.getElementById(id);if(section)sectionObserver.observe(section)});
  }

  const revealTargets=[...document.querySelectorAll('.manifesto-copy,.sectionhead,.placeholder-card,.about .portrait,.about>div:last-child,.step,.faq>h2,.smooth-faq-item,.booking h2,.booking-grid>div,#brief')];
  revealTargets.forEach((el,i)=>{
    el.classList.add('director-reveal');
    el.dataset.directorDelay=String(i%4);
  });
  const show=el=>el.classList.add('director-in');
  function syncReveal(){
    if(noMotion()){revealTargets.forEach(show);return}
    if(!('IntersectionObserver' in window)){revealTargets.forEach(show);return}
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){show(entry.target);io.unobserve(entry.target)}
    }),{threshold:.08,rootMargin:'0px 0px -6% 0px'});
    revealTargets.forEach(el=>{
      if(el.getBoundingClientRect().top<innerHeight*.92)show(el); else io.observe(el);
    });
  }
  syncReveal();

  if(mobileBook&&hero&&booking&&'IntersectionObserver' in window){
    let heroGone=false,bookingSeen=false;
    const sync=()=>mobileBook.classList.toggle('is-visible',heroGone&&!bookingSeen&&innerWidth<=760);
    new IntersectionObserver(([e])=>{heroGone=!e.isIntersecting;sync()},{threshold:.03}).observe(hero);
    new IntersectionObserver(([e])=>{bookingSeen=e.isIntersecting;sync()},{threshold:.08}).observe(booking);
    addEventListener('resize',sync,{passive:true});
  }

  if(fine.matches&&!noMotion()){
    document.querySelectorAll('.empty-work-square').forEach(square=>{
      square.addEventListener('pointermove',e=>{
        const r=square.getBoundingClientRect();
        square.style.setProperty('--px',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
        square.style.setProperty('--py',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
      },{passive:true});
    });
  }

  const viewer=document.getElementById('viewer');
  const close=document.getElementById('close');
  let opener=null;
  document.querySelectorAll('.card button').forEach(btn=>btn.addEventListener('click',()=>{opener=btn;queueMicrotask(()=>close?.focus())}));
  viewer?.addEventListener('close',()=>{opener?.focus();opener=null});

  const settle=()=>{if(noMotion())revealTargets.forEach(show)};
  reduce.addEventListener('change',settle);
  motionButton?.addEventListener('click',()=>queueMicrotask(settle));
})();


/* source: orlica-v7.js */

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('header');
  const placeholders = document.querySelectorAll('.placeholder-card');
  const steps = [...document.querySelectorAll('.step')];
  const onScroll = () => header?.classList.toggle('is-scrolled', scrollY > 18);
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  if (!reduce.matches && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    placeholders.forEach(card => {
      const square = card.querySelector('.empty-work-square');
      if (!square) return;
      card.addEventListener('pointermove', e => {
        const r = square.getBoundingClientRect();
        square.style.setProperty('--mx', `${e.clientX-r.left}px`);
        square.style.setProperty('--my', `${e.clientY-r.top}px`);
      }, {passive:true});
      card.addEventListener('pointerleave', () => {
        square.style.setProperty('--mx','50%'); square.style.setProperty('--my','50%');
      }, {passive:true});
    });
  }

  if ('IntersectionObserver' in window && steps.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('v7-active');
        else if (entry.boundingClientRect.top > 0) entry.target.classList.remove('v7-active');
      });
    }, {threshold:.55});
    steps.forEach(step => io.observe(step));
  }
})();


/* source: orlica-v8.js */

(() => {
  const API_URL = 'https://dbwnvbfdphqmfjzbpqnw.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid252YmZkcGhxbWZqemJwcW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2ODYxNzIsImV4cCI6MjEwNTI2MjE3Mn0.3fxOPVcWuVCMmACMCkRR9vjt2SLMts-DjI2SSuYof5A';
  const TZ = 'Asia/Yakutsk';
  const CHANNEL_URL = 'https://t.me/orlica_tatt';

  const works = [
    ['Орнамент / geometry','BLACKWORK','0%','0%'],
    ['Sleeve / dark floral','BLACK & GREY','50%','0%'],
    ['Color / anime','COLOR','100%','0%'],
    ['Ocean sleeve','COLOR','0%','50%'],
    ['Rabbit / graphic','GRAPHIC','50%','50%'],
    ['Character sleeve','COLOR','100%','50%'],
    ['Manga / blackwork','MANGA','0%','100%'],
    ['Red / fantasy','GRAPHIC','50%','100%'],
    ['Floral leg','FINE LINE','100%','100%']
  ];

  function mountGallery(){
    const grid = document.querySelector('#works .grid');
    if (!grid) return;
    grid.className = 'grid orlica-gallery';
    grid.innerHTML = works.map((w,i)=>`<figure class="portfolio-piece" data-index="${i}"><button class="piece-button" type="button" aria-label="Открыть работу ${i+1}: ${w[0]}"><div class="piece-media"><div class="piece-atlas" style="--x:${w[2]};--y:${w[3]}"></div><span class="piece-number">${String(i+1).padStart(2,'0')}</span></div><figcaption class="piece-meta"><span class="piece-title">${w[0]}</span><span class="piece-tag">${w[1]}</span></figcaption></button></figure>`).join('');

    let channel = document.querySelector('#works .works-channel');
    if (!channel) {
      channel = document.createElement('a');
      channel.className = 'works-channel';
      channel.href = CHANNEL_URL;
      channel.target = '_blank';
      channel.rel = 'noopener';
      channel.innerHTML = `<span>Хочется ещё?</span><strong>БОЛЬШЕ РАБОТ — В TELEGRAM</strong><em>@orlica_tatt</em>`;
      grid.insertAdjacentElement('afterend', channel);
    }

    const viewer = document.createElement('div');
    viewer.className='orlica-viewer';
    viewer.setAttribute('aria-hidden','true');
    viewer.innerHTML=`<div class="orlica-viewer-shell" role="dialog" aria-modal="true" aria-label="Просмотр работы"><button class="orlica-viewer-close" type="button" aria-label="Закрыть">×</button><button class="orlica-viewer-nav orlica-viewer-prev" type="button" aria-label="Предыдущая">‹</button><div class="orlica-viewer-media"><div class="orlica-viewer-atlas"></div></div><div class="orlica-viewer-copy"><div class="orlica-viewer-index"></div><h3></h3><p></p></div><button class="orlica-viewer-nav orlica-viewer-next" type="button" aria-label="Следующая">›</button></div>`;
    document.body.appendChild(viewer);
    let current=0;
    const art=viewer.querySelector('.orlica-viewer-atlas'), idx=viewer.querySelector('.orlica-viewer-index'), h=viewer.querySelector('h3'), p=viewer.querySelector('p');
    const render=()=>{ const w=works[current]; art.style.setProperty('--x',w[2]); art.style.setProperty('--y',w[3]); idx.textContent=String(current+1).padStart(2,'0'); h.textContent=w[0]; p.textContent=w[1]+' / ORLICA TATT'; };
    const open=(i)=>{current=i;render();viewer.style.display='grid';requestAnimationFrame(()=>viewer.classList.add('is-open'));viewer.setAttribute('aria-hidden','false');document.body.classList.add('viewer-open');viewer.querySelector('.orlica-viewer-close').focus();};
    const close=()=>{viewer.classList.remove('is-open');viewer.setAttribute('aria-hidden','true');document.body.classList.remove('viewer-open');setTimeout(()=>viewer.style.display='none',280);};
    grid.querySelectorAll('.piece-button').forEach((b,i)=>b.addEventListener('click',()=>open(i)));
    viewer.querySelector('.orlica-viewer-close').addEventListener('click',close);
    viewer.querySelector('.orlica-viewer-prev').addEventListener('click',()=>{current=(current+works.length-1)%works.length;render();});
    viewer.querySelector('.orlica-viewer-next').addEventListener('click',()=>{current=(current+1)%works.length;render();});
    viewer.addEventListener('click',e=>{if(e.target===viewer)close();});
    addEventListener('keydown',e=>{if(!viewer.classList.contains('is-open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft'){current=(current+works.length-1)%works.length;render();}if(e.key==='ArrowRight'){current=(current+1)%works.length;render();}});
  }

  const authHeaders = () => ({'apikey':ANON_KEY,'Authorization':`Bearer ${ANON_KEY}`});
  const headers = () => ({...authHeaders(),'Content-Type':'application/json'});
  const fmtDate = (iso, opts) => new Intl.DateTimeFormat('ru-RU',{timeZone:TZ,...opts}).format(new Date(iso));
  const dayKey = iso => fmtDate(iso,{year:'numeric',month:'2-digit',day:'2-digit'});
  const prettyFull = iso => fmtDate(iso,{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}).replace(',',' ·');

  async function getSlots(){
    const now=encodeURIComponent(new Date().toISOString());
    const r=await fetch(`${API_URL}/rest/v1/booking_slots?select=id,starts_at,duration_minutes&status=eq.open&starts_at=gt.${now}&order=starts_at.asc&limit=80`,{headers:headers(),cache:'no-store'});
    if(!r.ok) throw new Error('Не удалось получить свободные даты');
    return r.json();
  }

  function mountBooking(){
    const sec=document.querySelector('#book'); if(!sec)return;
    sec.classList.add('orlica-booking-live');
    sec.innerHTML=`<div class="booking-live-head"><div><h2>ЛОВИ<br/>СВОЁ ОКНО.</h2></div><div><p>Свободные даты обновляются прямо здесь. Выбираешь время, оставляешь идею — слот сразу уходит на подтверждение Свете.</p><div class="availability-status"><i class="availability-dot"></i><span id="availability-copy">Проверяю календарь…</span></div></div></div><div class="booking-live-grid"><div class="booking-calendar"><div class="booking-calendar-top"><strong>Свободные даты</strong><span>Благовещенск · UTC+9</span></div><div class="booking-days" id="booking-days"></div><div class="booking-times" id="booking-times"></div><div class="booking-empty" id="booking-empty" hidden>Свободных окон пока нет. Можно написать Свете напрямую — <a href="https://t.me/Sveta_orel09" target="_blank" rel="noopener">@Sveta_orel09 ↗</a></div></div><div class="booking-form-wrap"><div class="booking-selected"><div><span>Выбранное окно</span><strong id="selected-slot-text">Сначала выбери дату</strong></div><span id="slot-duration"></span></div><form class="booking-form" id="live-booking-form"><label>Имя<input name="name" maxlength="80" autocomplete="name" required placeholder="Как тебя зовут"></label><label>Telegram / телефон<input name="contact" maxlength="120" required placeholder="@username или +7..."></label><label>Место тату<input name="place" maxlength="120" required placeholder="Предплечье"></label><label>Размер<input name="size" maxlength="80" placeholder="Примерно 12 см"></label><label class="wide">Что хочется набить?<textarea name="idea" maxlength="2000" required placeholder="Опиши идею, стиль, детали…"></textarea></label><div class="sketch-upload wide"><input id="booking-sketch" name="sketch" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif"><label class="sketch-drop" for="booking-sketch"><span class="sketch-thumb" id="sketch-thumb"><b>+</b></span><span class="sketch-copy"><strong>Прикрепить фото эскиза</strong><small>Из галереи или камеры · JPEG, PNG, WebP, HEIC · до 8 МБ</small><em id="sketch-name">Выбрать фото</em></span></label></div><label class="wide">Ссылка на референс<input name="reference" maxlength="500" inputmode="url" placeholder="Необязательно"></label><input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0"><div class="booking-message" id="booking-message"></div><button class="booking-submit" id="booking-submit" type="submit" disabled>Отправить заявку</button><p class="booking-legal">После отправки слот станет недоступен другим клиентам. Эскиз хранится приватно и доступен только Свете.</p></form><div class="booking-success" id="booking-success"><span>Заявка отправлена</span><div class="code" id="booking-code"></div><p id="booking-success-text"></p><a href="https://t.me/Sveta_orel09" target="_blank" rel="noopener">Написать Свете в Telegram ↗</a></div></div></div>`;

    const daysEl=sec.querySelector('#booking-days'), timesEl=sec.querySelector('#booking-times'), emptyEl=sec.querySelector('#booking-empty'), copyEl=sec.querySelector('#availability-copy'), selectedText=sec.querySelector('#selected-slot-text'), durationEl=sec.querySelector('#slot-duration'), form=sec.querySelector('#live-booking-form'), submit=sec.querySelector('#booking-submit'), message=sec.querySelector('#booking-message'), success=sec.querySelector('#booking-success'), sketchInput=sec.querySelector('#booking-sketch'), sketchName=sec.querySelector('#sketch-name'), sketchThumb=sec.querySelector('#sketch-thumb');
    let slots=[], selectedDay='', selectedSlot=null, previewUrl='';

    const showMessage=(text,type='error')=>{message.textContent=text;message.className=`booking-message show ${type}`;};
    const clearMessage=()=>{message.className='booking-message';message.textContent='';};
    const resetSketchPreview=()=>{if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl='';}sketchThumb.innerHTML='<b>+</b>';sketchThumb.classList.remove('has-image');sketchName.textContent='Выбрать фото';};

    sketchInput.addEventListener('change',()=>{
      clearMessage();
      const file=sketchInput.files?.[0];
      if(!file){resetSketchPreview();return;}
      const allowed=['image/jpeg','image/png','image/webp','image/heic','image/heif'];
      if(!allowed.includes(file.type)){sketchInput.value='';resetSketchPreview();showMessage('Поддерживаются JPEG, PNG, WebP и HEIC.');return;}
      if(file.size>8*1024*1024){sketchInput.value='';resetSketchPreview();showMessage('Фото слишком большое. Максимум 8 МБ.');return;}
      sketchName.textContent=file.name;
      if(['image/jpeg','image/png','image/webp'].includes(file.type)){
        if(previewUrl)URL.revokeObjectURL(previewUrl);
        previewUrl=URL.createObjectURL(file);
        sketchThumb.innerHTML=`<img src="${previewUrl}" alt="Предпросмотр эскиза">`;
        sketchThumb.classList.add('has-image');
      } else {
        sketchThumb.innerHTML='<b>✓</b>';
        sketchThumb.classList.remove('has-image');
      }
    });

    const renderTimes=()=>{
      const list=slots.filter(s=>dayKey(s.starts_at)===selectedDay);
      timesEl.innerHTML=list.map(s=>`<button type="button" class="booking-time ${selectedSlot?.id===s.id?'is-active':''}" data-id="${s.id}">${fmtDate(s.starts_at,{hour:'2-digit',minute:'2-digit'})}</button>`).join('');
      timesEl.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{selectedSlot=slots.find(s=>s.id===b.dataset.id);renderTimes();selectedText.textContent=prettyFull(selectedSlot.starts_at);durationEl.textContent=`~ ${selectedSlot.duration_minutes} мин`;submit.disabled=false;clearMessage();}));
    };
    const render=()=>{
      const groups=new Map(); slots.forEach(s=>{const k=dayKey(s.starts_at);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(s);});
      copyEl.textContent=slots.length?`Сейчас свободно: ${slots.length} ${slots.length===1?'окно':'окон'}`:'Свободных окон сейчас нет';
      emptyEl.hidden=slots.length>0; daysEl.hidden=slots.length===0; timesEl.hidden=slots.length===0;
      if(!slots.length){daysEl.innerHTML='';timesEl.innerHTML='';selectedDay='';selectedSlot=null;submit.disabled=true;selectedText.textContent='Свободных окон пока нет';return;}
      if(!selectedDay || !groups.has(selectedDay)) selectedDay=[...groups.keys()][0];
      daysEl.innerHTML=[...groups.entries()].map(([k,v])=>{const s=v[0];return `<button type="button" class="booking-day ${k===selectedDay?'is-active':''}" data-day="${k}"><span class="dow">${fmtDate(s.starts_at,{weekday:'short'})}</span><span class="dom">${fmtDate(s.starts_at,{day:'2-digit'})}</span><span class="count">${fmtDate(s.starts_at,{month:'short'})} · ${v.length}</span></button>`}).join('');
      daysEl.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{selectedDay=b.dataset.day;selectedSlot=null;submit.disabled=true;selectedText.textContent='Выбери время';durationEl.textContent='';render();}));
      renderTimes();
    };
    const load=async()=>{try{slots=await getSlots();render();}catch(e){copyEl.textContent='Календарь временно недоступен';showMessage(e.message);}};

    form.addEventListener('submit',async e=>{
      e.preventDefault(); clearMessage(); if(!selectedSlot){showMessage('Сначала выбери свободное время.');return;}
      submit.disabled=true;submit.firstChild.textContent='Отправляю… ';
      const fd=new FormData(form), contact=String(fd.get('contact')||'').trim();
      const payload=new FormData();
      payload.append('slot_id',selectedSlot.id);
      payload.append('client_name',String(fd.get('name')||'').trim());
      payload.append('contact',contact);
      payload.append('telegram',contact.startsWith('@')?contact:'');
      payload.append('tattoo_place',String(fd.get('place')||'').trim());
      payload.append('tattoo_size',String(fd.get('size')||'').trim());
      payload.append('idea',String(fd.get('idea')||'').trim());
      payload.append('reference_url',String(fd.get('reference')||'').trim());
      payload.append('website',String(fd.get('website')||''));
      const sketch=fd.get('sketch'); if(sketch instanceof File && sketch.size>0)payload.append('sketch',sketch,sketch.name);
      try{
        const r=await fetch(`${API_URL}/functions/v1/orlica-book`,{method:'POST',headers:authHeaders(),body:payload});
        const data=await r.json().catch(()=>null);
        if(!r.ok){const code=data?.error||'';const messages={SLOT_UNAVAILABLE:'Это окно только что заняли. Обновляю календарь…',RATE_LIMIT:'Слишком много попыток. Попробуй немного позже.',SKETCH_TOO_LARGE:'Фото эскиза больше 8 МБ.',SKETCH_TYPE:'Этот формат фото не поддерживается.',SKETCH_UPLOAD_FAILED:'Не получилось загрузить фото. Попробуй ещё раз.'};throw new Error(messages[code]||'Не удалось отправить заявку');}
        const row=data||{}; form.style.display='none';success.classList.add('show');sec.querySelector('#booking-code').textContent=row?.booking_code||'OK';sec.querySelector('#booking-success-text').textContent=`${prettyFull(row?.starts_at||selectedSlot.starts_at)}. Света подтвердит запись после просмотра идеи${row?.sketch_uploaded?' и эскиза':''}.`;await load();
      }catch(err){showMessage(err.message);await load();const fresh=slots.find(s=>s.id===selectedSlot?.id);selectedSlot=fresh||null;submit.disabled=!selectedSlot;submit.firstChild.textContent='Отправить заявку ';}
    });
    load(); setInterval(()=>{if(!document.hidden)load();},60000); addEventListener('visibilitychange',()=>{if(!document.hidden)load();});
  }

  const init=()=>{mountGallery();mountBooking();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();


/* source: orlica-v9.js */

(() => {
  const API='https://dbwnvbfdphqmfjzbpqnw.supabase.co';
  const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid252YmZkcGhxbWZqemJwcW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2ODYxNzIsImV4cCI6MjEwNTI2MjE3Mn0.3fxOPVcWuVCMmACMCkRR9vjt2SLMts-DjI2SSuYof5A';
  const headers={'apikey':KEY,'Authorization':`Bearer ${KEY}`,'Content-Type':'application/json'};

  async function submitWaitlist(payload){
    const r=await fetch(`${API}/functions/v1/orlica-waitlist`,{method:'POST',headers,body:JSON.stringify({
      client_name:payload.name,
      contact:payload.contact,
      tattoo_place:payload.place,
      tattoo_size:payload.size,
      idea:payload.idea,
      preferred_time:payload.preferred
    })});
    const data=await r.json().catch(()=>null);
    if(!r.ok){if(data?.error==='ALREADY_WAITING')throw new Error('Ты уже есть в листе ожидания. Света увидит заявку.');throw new Error('Не удалось добавить в лист ожидания.');}
    return data;
  }

  function mount(){
    const book=document.querySelector('#book');
    if(!book||book.querySelector('.orlica-waitlist'))return;
    const anchor=book.querySelector('.booking-live-grid')||book.lastElementChild;
    if(!anchor)return;
    const box=document.createElement('section');
    box.className='orlica-waitlist';
    box.innerHTML=`
      <div class="orlica-waitlist-head">
        <div><h3>НЕТ ПОДХОДЯЩЕЙ ДАТЫ?</h3></div>
        <p>Оставь контакт и идею. Если освободится окно или Света откроет новую дату — ты уже будешь в списке.</p>
      </div>
      <button class="waitlist-toggle" type="button" aria-expanded="false">Встать в лист ожидания</button>
      <div class="waitlist-panel">
        <form class="waitlist-form">
          <label>Имя<input name="name" maxlength="80" required placeholder="Как тебя зовут"></label>
          <label>Telegram / телефон<input name="contact" maxlength="120" required placeholder="@username или +7..."></label>
          <label>Место тату<input name="place" maxlength="120" placeholder="Предплечье"></label>
          <label>Размер<input name="size" maxlength="80" placeholder="Примерно 12 см"></label>
          <label class="wide">Когда удобно<input name="preferred" maxlength="160" placeholder="Например: будни после 18:00"></label>
          <label class="wide">Что хочется набить?<textarea name="idea" maxlength="2000" required placeholder="Идея, стиль, детали…"></textarea></label>
          <button class="waitlist-submit" type="submit">Добавить меня в список</button>
          <div class="waitlist-message"></div>
        </form>
      </div>`;
    anchor.insertAdjacentElement('afterend',box);
    const toggle=box.querySelector('.waitlist-toggle'),panel=box.querySelector('.waitlist-panel'),form=box.querySelector('form'),message=box.querySelector('.waitlist-message');
    toggle.addEventListener('click',()=>{const on=panel.classList.toggle('show');toggle.setAttribute('aria-expanded',String(on));toggle.textContent=on?'Скрыть форму':'Встать в лист ожидания';});
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const fd=new FormData(form),btn=form.querySelector('.waitlist-submit');
      message.textContent='';message.className='waitlist-message';btn.disabled=true;btn.textContent='Добавляю…';
      try{
        await submitWaitlist({name:String(fd.get('name')||'').trim(),contact:String(fd.get('contact')||'').trim(),place:String(fd.get('place')||'').trim(),size:String(fd.get('size')||'').trim(),preferred:String(fd.get('preferred')||'').trim(),idea:String(fd.get('idea')||'').trim()});
        form.reset();message.textContent='Готово. Ты в листе ожидания — Света увидит заявку.';message.className='waitlist-message ok';btn.textContent='Ты в списке';
      }catch(err){message.textContent=err.message||'Ошибка';message.className='waitlist-message err';btn.disabled=false;btn.textContent='Добавить меня в список';}
    });
    const empty=book.querySelector('#booking-empty');
    if(empty){const sync=()=>{box.classList.toggle('is-prominent',!empty.hidden);};new MutationObserver(sync).observe(empty,{attributes:true,attributeFilter:['hidden']});sync();}
  }
  const boot=()=>{let n=0;const t=setInterval(()=>{mount();if(document.querySelector('.orlica-waitlist')||++n>40)clearInterval(t)},150)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();


/* source: orlica-v10.js */

(() => {
  const CLEAN='assets/hero/sveta-clean.webp';
  const INK='assets/hero/sveta-ink.webp';
  function applyHero(){
    const portrait=document.getElementById('ink-portrait');
    if(!portrait||portrait.dataset.v10Hero==='1') return;
    const imgs=portrait.querySelectorAll('img');
    if(imgs.length<2) return;
    imgs[0].src=CLEAN;
    imgs[0].alt='Света — тату-мастер ORLICA';
    imgs[0].width=720; imgs[0].height=980;
    imgs[1].src=INK;
    imgs[1].alt=''; imgs[1].setAttribute('aria-hidden','true');
    imgs[1].width=720; imgs[1].height=978;
    portrait.dataset.v10Hero='1';
    portrait.setAttribute('aria-label','Удерживай фото — татуировка проявится сверху вниз');
  }
  function polish(){
    document.documentElement.classList.add('orlica-v10');
    const hero=document.querySelector('.hero');
    const visual=hero?.querySelector('.hero-visual');
    if(visual&&!visual.querySelector('.v10-hold-note')){
      const note=document.createElement('div');
      note.className='v10-hold-note';
      note.innerHTML='<span></span> удерживай фото';
      visual.append(note);
    }
    const cta=hero?.querySelector('.cta');
    if(cta) cta.textContent='Записаться на сеанс';
  }
  const boot=()=>{applyHero();polish();};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
  let tries=0; const timer=setInterval(()=>{boot();if(document.querySelector('#ink-portrait[data-v10-hero="1"]')||++tries>40)clearInterval(timer)},150);
})();


/* source: orlica-hero-hold.js */

(() => {
  const DURATION = 1450;
  const RETURN_MS = 520;
  const MOVE_CANCEL = 24;

  function boot(){
    const portrait = document.getElementById('ink-portrait');
    if(!portrait || portrait.dataset.holdRevealReady==='1') return;
    portrait.dataset.holdRevealReady='1';

    const toggle = document.getElementById('ink-toggle');
    if(toggle) toggle.closest('.ink-controls')?.remove();
    portrait.querySelector('.ink-badge')?.remove();
    portrait.classList.remove('is-ink');
    portrait.setAttribute('aria-label','Удерживай фото, чтобы проявить татуировку');

    let raf = 0;
    let down = false;
    let start = 0;
    let sx = 0, sy = 0;
    let current = 0;
    let returnFrom = 0;
    let returnStart = 0;

    const apply = p => {
      current = Math.max(0, Math.min(1, p));
      portrait.style.setProperty('--ink-cut', `${(100 - current*100).toFixed(3)}%`);
    };

    const revealTick = now => {
      if(!down) return;
      apply((now - start) / DURATION);
      if(current < 1) raf = requestAnimationFrame(revealTick);
    };

    const returnTick = now => {
      const t = Math.min(1,(now-returnStart)/RETURN_MS);
      const eased = 1 - Math.pow(1-t,3);
      apply(returnFrom * (1-eased));
      if(t < 1) raf = requestAnimationFrame(returnTick);
      else portrait.classList.remove('is-holding');
    };

    const begin = e => {
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      cancelAnimationFrame(raf);
      down = true;
      sx = e.clientX; sy = e.clientY;
      start = performance.now() - current * DURATION;
      portrait.classList.add('is-holding');
      try{ portrait.setPointerCapture?.(e.pointerId); }catch{}
      raf = requestAnimationFrame(revealTick);
    };

    const end = () => {
      if(!down && current<=0) return;
      down = false;
      cancelAnimationFrame(raf);
      returnFrom = current;
      returnStart = performance.now();
      raf = requestAnimationFrame(returnTick);
    };

    portrait.addEventListener('pointerdown', begin, {passive:true});
    portrait.addEventListener('pointerup', end, {passive:true});
    portrait.addEventListener('pointercancel', end, {passive:true});
    portrait.addEventListener('lostpointercapture', end, {passive:true});
    portrait.addEventListener('pointermove', e => {
      if(!down) return;
      if(Math.hypot(e.clientX-sx,e.clientY-sy) > MOVE_CANCEL && e.pointerType==='touch') end();
    }, {passive:true});
    portrait.addEventListener('contextmenu', e => e.preventDefault());
    portrait.addEventListener('dragstart', e => e.preventDefault());

    document.addEventListener('click', e => {
      if(e.target===portrait || portrait.contains(e.target)){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }, true);

    portrait.addEventListener('keydown', e => {
      if(e.code==='Space' || e.code==='Enter'){
        e.preventDefault();
        if(e.type==='keydown' && !down) begin({pointerType:'keyboard',button:0,clientX:0,clientY:0,pointerId:-1});
      }
    });
    portrait.addEventListener('keyup', e => {
      if(e.code==='Space' || e.code==='Enter'){e.preventDefault();end();}
    });

    apply(0);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  let tries=0; const timer=setInterval(()=>{boot(); if(document.querySelector('#ink-portrait[data-hold-reveal-ready="1"]')||++tries>40) clearInterval(timer)},150);
})();


/* source: orlica-v101.js */

(() => {
  const API='https://dbwnvbfdphqmfjzbpqnw.supabase.co';
  const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid252YmZkcGhxbWZqemJwcW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2ODYxNzIsImV4cCI6MjEwNTI2MjE3Mn0.3fxOPVcWuVCMmACMCkRR9vjt2SLMts-DjI2SSuYof5A';
  const TZ='Asia/Yakutsk';
  const headers={'apikey':KEY,'Authorization':`Bearer ${KEY}`,'Content-Type':'application/json'};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  document.documentElement.classList.add('orlica-v101');

  const isCompareText=value=>{
    const text=String(value||'').replace(/\s+/g,' ').trim().toLowerCase();
    return text.includes('сравнить до')||text.includes('до / после')||text.includes('до/после');
  };

  function cleanHero(){
    const root=document.querySelector('.hero');
    if(!root)return;
    [...root.querySelectorAll('a,button,[role="button"]')].forEach(el=>{
      if(isCompareText(el.textContent)) el.remove();
    });
    [...root.querySelectorAll('span,p,div')].forEach(el=>{
      if(el.children.length===0&&isCompareText(el.textContent)) el.remove();
    });
  }

  function watchHeroCleanup(){
    const root=document.querySelector('.hero');
    if(!root)return;
    cleanHero();
    const observer=new MutationObserver(()=>cleanHero());
    observer.observe(root,{childList:true,subtree:true});
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

  const isoLocalDate=(d=new Date())=>{
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
    const get=t=>parts.find(p=>p.type===t)?.value||'';
    return `${get('year')}-${get('month')}-${get('day')}`;
  };
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
    if(!months.length)return false;
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
        let legacyBtn=[...legacy.querySelectorAll('.booking-day')].find(x=>x.dataset.day===key);
        for(let i=0;!legacyBtn&&i<10;i++){await new Promise(r=>setTimeout(r,120));legacyBtn=[...legacy.querySelectorAll('.booking-day')].find(x=>x.dataset.day===key)}
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
    watchHeroCleanup();
    loadBoard();
    watchBooking();
    setTimeout(polishRecordedIssues,900);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();


/* source: orlica-v11-cleanup.js */

/* ORLICA V11 — final cleanup runtime */
(() => {
  document.documentElement.classList.add('orlica-v11');

  const isCompare = value => {
    const text = String(value || '').replace(/\s+/g,' ').trim().toLowerCase();
    return text.includes('сравнить до') || text.includes('до / после') || text.includes('до/после');
  };

  function cleanHero(){
    const hero = document.querySelector('.hero');
    if(!hero) return;
    hero.querySelectorAll('a,button,[role="button"],span,p,div').forEach(el => {
      if(el.children.length === 0 && isCompare(el.textContent)) el.remove();
    });
    hero.querySelector('.hero-visual figcaption')?.remove();
    const visual = hero.querySelector('.hero-visual');
    if(visual && !visual.querySelector('.v10-hold-note')){
      const note = document.createElement('div');
      note.className = 'v10-hold-note';
      note.innerHTML = '<span></span> удерживай фото';
      visual.append(note);
    }
  }

  function syncBoard(){
    const board = document.querySelector('.v101-board');
    if(!board) return;
    const empty = !!board.querySelector('.v101-board-empty');
    board.hidden = empty;
    board.style.display = empty ? 'none' : '';
  }

  function slowTicker(){
    const ticker = document.querySelector('.ticker');
    if(!ticker) return;
    ticker.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      if(cs.animationName && cs.animationName !== 'none') el.style.animationDuration = '36s';
    });
  }

  function normalizeMobileCopy(){
    document.querySelectorAll('.hero-note,.about p,.process p,.faq p,.booking-live-head p').forEach(el => {
      el.style.maxWidth = el.style.maxWidth || '';
    });
  }

  function boot(){
    cleanHero();
    syncBoard();
    slowTicker();
    normalizeMobileCopy();
    const observer = new MutationObserver(() => {
      cleanHero();
      syncBoard();
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();


/* ORLICA V11.1 — soft touch spotlight reveal */
(() => {
  function initSoftSpotlight(){
    const portrait=document.getElementById('ink-portrait');
    if(!portrait || portrait.dataset.v111Spotlight==='1') return;
    portrait.dataset.v111Spotlight='1';
    let active=false,pointerId=null,radius=0,target=0,raf=0;
    const radiusTarget=()=>Math.min(200,Math.max(155,portrait.clientWidth*.29));
    const setPoint=e=>{
      const r=portrait.getBoundingClientRect();
      const x=Math.max(0,Math.min(r.width,e.clientX-r.left));
      const y=Math.max(0,Math.min(r.height,e.clientY-r.top));
      portrait.style.setProperty('--ink-x',`${x.toFixed(1)}px`);
      portrait.style.setProperty('--ink-y',`${y.toFixed(1)}px`);
    };
    const animate=()=>{
      radius+=(target-radius)*.18;
      if(Math.abs(target-radius)<.35)radius=target;
      portrait.style.setProperty('--ink-radius',`${radius.toFixed(1)}px`);
      if(radius!==target)raf=requestAnimationFrame(animate);else raf=0;
    };
    const moveTarget=v=>{target=v;if(!raf)raf=requestAnimationFrame(animate)};
    const down=e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;
      active=true;pointerId=e.pointerId;setPoint(e);
      portrait.classList.add('is-spotlight');moveTarget(radiusTarget());
    };
    const move=e=>{if(active&&(pointerId===null||e.pointerId===pointerId))setPoint(e)};
    const up=e=>{
      if(pointerId!==null&&e?.pointerId!=null&&e.pointerId!==pointerId)return;
      active=false;pointerId=null;moveTarget(0);
      setTimeout(()=>{if(!active&&target===0)portrait.classList.remove('is-spotlight')},300);
    };
    portrait.addEventListener('pointerdown',down,{passive:true});
    portrait.addEventListener('pointermove',move,{passive:true});
    portrait.addEventListener('pointerup',up,{passive:true});
    portrait.addEventListener('pointercancel',up,{passive:true});
    portrait.addEventListener('lostpointercapture',up,{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initSoftSpotlight,{once:true});else initSoftSpotlight();
  let n=0;const t=setInterval(()=>{initSoftSpotlight();if(document.querySelector('#ink-portrait[data-v111-spotlight="1"]')||++n>30)clearInterval(t)},180);
})();
