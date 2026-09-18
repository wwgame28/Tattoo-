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
    sec.innerHTML=`<div class="booking-live-head"><div><h2>ЛОВИ<br/>СВОЁ ОКНО.</h2></div><div><p>Свободные даты обновляются прямо здесь. Выбираешь время, оставляешь идею — слот сразу уходит на подтверждение Свете.</p><div class="availability-status"><i class="availability-dot"></i><span id="availability-copy">Проверяю календарь…</span></div></div></div><div class="booking-live-grid"><div class="booking-calendar"><div class="booking-calendar-top"><strong>Свободные даты</strong><span>Благовещенск · UTC+9</span></div><div class="booking-days" id="booking-days"></div><div class="booking-times" id="booking-times"></div><div class="booking-empty" id="booking-empty" hidden>Свободных окон пока нет. Можно написать Свете напрямую — <a href="https://t.me/Sveta_orel09" target="_blank" rel="noopener">@Sveta_orel09 ↗</a></div></div><div class="booking-form-wrap"><div class="booking-selected"><div><span>Выбранное окно</span><strong id="selected-slot-text">Сначала выбери дату</strong></div><span id="slot-duration"></span></div><form class="booking-form" id="live-booking-form"><label>Имя<input name="name" maxlength="80" autocomplete="name" required placeholder="Как тебя зовут"></label><label>Telegram / телефон<input name="contact" maxlength="120" required placeholder="@username или +7..."></label><label>Место тату<input name="place" maxlength="120" required placeholder="Предплечье"></label><label>Размер<input name="size" maxlength="80" placeholder="Примерно 12 см"></label><label class="wide">Что хочется набить?<textarea name="idea" maxlength="2000" required placeholder="Опиши идею, стиль, детали…"></textarea></label><div class="sketch-upload wide"><input id="booking-sketch" name="sketch" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif"><label class="sketch-drop" for="booking-sketch"><span class="sketch-thumb" id="sketch-thumb"><b>+</b></span><span class="sketch-copy"><strong>Прикрепить фото эскиза</strong><small>Из галереи или камеры · JPEG, PNG, WebP, HEIC · до 8 МБ</small><em id="sketch-name">Выбрать фото</em></span></label></div><label class="wide">Ссылка на референс<input name="reference" maxlength="500" inputmode="url" placeholder="Необязательно"></label><input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0"><div class="booking-message" id="booking-message"></div><button class="booking-submit" id="booking-submit" type="submit" disabled>Отправить заявку <b>↗</b></button><p class="booking-legal">После отправки слот станет недоступен другим клиентам. Эскиз хранится приватно и доступен только в админке Светы.</p></form><div class="booking-success" id="booking-success"><span>Заявка отправлена</span><div class="code" id="booking-code"></div><p id="booking-success-text"></p><a href="https://t.me/Sveta_orel09" target="_blank" rel="noopener">Написать Свете в Telegram ↗</a></div></div></div>`;

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
