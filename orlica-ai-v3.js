/* ORLICA AI generation reliability patch v3 */
(() => {
  const RENDER_API='https://dbwnvbfdphqmfjzbpqnw.supabase.co/functions/v1/orlica-ai-render';
  const API_KEY='sb_publishable_W1A3xK3BUPn85bROX9kNwQ_ylVGmS-O';
  const K_SESSION='orlica_ai_session_v1';
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  let mounted=false;

  const session=()=>localStorage.getItem(K_SESSION)||'';
  const headers=()=>({'Content-Type':'application/json','apikey':API_KEY,'x-ai-session':session()});
  const val=id=>(document.getElementById(id)?.value||'').trim();
  const activeOne=key=>document.querySelector(`#ai-sketch .ai-chips[data-group="${key}"] .ai-chip.is-active`)?.dataset.value||'';
  const activeMany=key=>[...document.querySelectorAll(`#ai-sketch .ai-chips[data-group="${key}"] .ai-chip.is-active`)].map(x=>x.dataset.value).filter(Boolean);

  function collect(){
    const customElements=val('ai-elements-custom').split(',').map(x=>x.trim()).filter(Boolean);
    return {
      style:val('ai-style-custom')||activeOne('style'),
      character:val('ai-character-custom')||activeOne('character'),
      inspiration:val('ai-inspiration'),
      elements:[...new Set([...activeMany('elements'),...customElements])],
      mood:val('ai-mood-custom')||activeOne('mood'),
      color:val('ai-color-custom')||activeOne('color'),
      bodyPart:val('ai-bodyPart-custom')||activeOne('bodyPart'),
      size:val('ai-size-custom')||activeOne('size'),
      description:val('ai-description')
    };
  }

  function showError(message=''){
    const el=document.getElementById('ai-gen-error');
    if(!el)return;
    el.textContent=message;
    el.classList.toggle('is-visible',!!message);
  }
  function setBusy(busy){
    const g=document.getElementById('ai-generate');
    const a=document.getElementById('ai-again');
    if(g){g.disabled=busy;g.textContent=busy?'ГЕНЕРИРУЮ…':'СГЕНЕРИРОВАТЬ 3 ЭСКИЗА';}
    if(a){a.disabled=busy;a.textContent=busy?'ГЕНЕРИРУЮ…':'ЕЩЁ 3 ВАРИАНТА';}
  }
  function updateQuota(q){
    if(!q)return;
    const unlimited=Boolean(q.unlimited);
    const quotaEl=document.getElementById('ai-quota');
    const profile=document.getElementById('ai-profile-limit');
    const note=document.getElementById('ai-charge-note');
    const g=document.getElementById('ai-generate');
    const a=document.getElementById('ai-again');
    if(unlimited){
      if(quotaEl)quotaEl.textContent='Безлимит · ∞ генераций';
      if(profile)profile.textContent='Безлимитный доступ · по три эскиза за генерацию';
      if(note)note.textContent='Для этого номера дневной лимит отключён.';
      if(g)g.disabled=false;if(a)a.disabled=false;return;
    }
    const remaining=Number(q.generations_remaining??0);
    const sketches=Number(q.sketches_remaining??remaining*3);
    if(quotaEl)quotaEl.textContent=`Сегодня: ${remaining}/2 · ${sketches} эскизов`;
    if(profile)profile.textContent='Две генерации в сутки · по три эскиза';
    if(note)note.textContent='Лимит списывается только после запуска генерации.';
    if(g)g.disabled=remaining<=0;if(a)a.disabled=remaining<=0;
  }

  function renderImages(urls){
    const cards=document.getElementById('ai-cards');
    const results=document.getElementById('ai-results');
    if(!cards||!results)return;
    cards.innerHTML='';
    urls.forEach((url,i)=>{
      const card=document.createElement('article');
      card.className='ai-card is-loading';
      card.innerHTML=`<img alt="AI эскиз ${i+1}" loading="lazy"><div class="ai-card-meta"><span>Вариант ${String(i+1).padStart(2,'0')}</span><button type="button" disabled>ВЫБРАТЬ</button></div>`;
      const img=card.querySelector('img');
      const button=card.querySelector('button');
      const label=card.querySelector('.ai-card-meta span');
      img.onload=()=>{card.classList.remove('is-loading');button.disabled=false;};
      img.onerror=()=>{card.classList.remove('is-loading');card.classList.add('is-error');label.textContent='Не загрузился';button.disabled=true;};
      img.src=url;
      button.addEventListener('click',()=>{
        cards.querySelectorAll('.ai-card').forEach(c=>{
          c.classList.remove('ai-selected');
          const l=c.querySelector('.ai-card-meta span');
          if(l&&!c.classList.contains('is-error')){
            const idx=[...cards.children].indexOf(c);
            l.textContent=`Вариант ${String(idx+1).padStart(2,'0')}`;
          }
        });
        card.classList.add('ai-selected');
        label.textContent='Выбрано';
      });
      cards.appendChild(card);
    });
    results.hidden=false;
    results.scrollIntoView({behavior:'smooth',block:'start'});
  }

  async function call(body){
    const r=await fetch(RENDER_API,{method:'POST',headers:headers(),body:JSON.stringify(body)});
    const d=await r.json().catch(()=>({}));
    if(!r.ok){
      const e=new Error(d.message||d.detail||d.error||`HTTP ${r.status}`);
      e.code=d.error||'';
      throw e;
    }
    return d;
  }

  async function renderVariant(requestId,variant,delay){
    if(delay)await sleep(delay);
    let last;
    for(let attempt=0;attempt<2;attempt++){
      try{return await call({action:'render',request_id:requestId,variant});}
      catch(e){last=e;if(attempt===0)await sleep(7000+variant*900);}
    }
    throw last||new Error('Не удалось создать вариант '+variant);
  }

  async function generate(){
    showError('');
    const req=collect();
    if(!req.style)return showError('Выбери стиль или введи свой вариант.');
    if(!req.character)return showError('Выбери персонажа или введи свой вариант.');
    if(!session())return showError('Сначала войди в AI-конструктор.');
    setBusy(true);
    let requestId='';
    try{
      const claim=await call({action:'claim',request:req});
      requestId=claim.request_id;
      updateQuota(claim);
      const jobs=[
        renderVariant(requestId,1,0),
        renderVariant(requestId,2,5000),
        renderVariant(requestId,3,10000)
      ];
      const settled=await Promise.allSettled(jobs);
      const failed=settled.find(x=>x.status==='rejected');
      if(failed)throw failed.reason;
      const done=await call({action:'finalize',request_id:requestId});
      if(!Array.isArray(done.images)||done.images.length!==3)throw new Error('Сервер не вернул три эскиза.');
      updateQuota(done);
      renderImages(done.images);
    }catch(e){
      if(requestId){try{await call({action:'refund',request_id:requestId});}catch{} }
      const results=document.getElementById('ai-results');if(results)results.hidden=true;
      if(e?.code==='DAILY_LIMIT_REACHED')showError('Лимит 2 генерации на сегодня уже использован.');
      else showError('Генератор временно не ответил. Попытка не списана — нажми ещё раз.');
    }finally{
      setBusy(false);
    }
  }

  function replaceButton(id,label){
    const old=document.getElementById(id);if(!old)return null;
    const b=old.cloneNode(true);b.textContent=label;old.replaceWith(b);return b;
  }
  function mount(){
    if(mounted)return true;
    const g=document.getElementById('ai-generate');
    const a=document.getElementById('ai-again');
    if(!g||!a)return false;
    mounted=true;
    replaceButton('ai-generate','СГЕНЕРИРОВАТЬ 3 ЭСКИЗА')?.addEventListener('click',generate);
    replaceButton('ai-again','ЕЩЁ 3 ВАРИАНТА')?.addEventListener('click',generate);
    return true;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  let tries=0;const t=setInterval(()=>{if(mount()||++tries>80)clearInterval(t)},150);
})();
