/* ORLICA V11.4 — portfolio filters + body planner + smart brief */
(() => {
  const WORKS = [
    {style:'blackwork', zone:'Предплечье'},
    {style:'blackwork', zone:'Плечо'},
    {style:'color', zone:'Предплечье'},
    {style:'color', zone:'Плечо'},
    {style:'graphic', zone:'Голень'},
    {style:'color', zone:'Предплечье'},
    {style:'manga', zone:'Предплечье'},
    {style:'graphic', zone:'Бедро'},
    {style:'fineline', zone:'Голень'}
  ];
  const FILTERS = [
    ['all','Все'],['graphic','Графика'],['blackwork','Блэкворк'],['color','Цвет'],['manga','Манга'],['fineline','Fine line']
  ];
  const state = {zone:'',style:'',size:'',color:'',budget:'',idea:''};

  const q = (s, root=document) => root.querySelector(s);
  const qa = (s, root=document) => [...root.querySelectorAll(s)];
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function waitFor(selector, cb, tries=40){
    const el=q(selector);
    if(el) return cb(el);
    if(tries>0) setTimeout(()=>waitFor(selector,cb,tries-1),100);
  }

  function mountPortfolioFilters(grid){
    if(q('.v114-filterbar')) return;
    const pieces=qa('.portfolio-piece',grid);
    if(!pieces.length) return;
    pieces.forEach((piece,i)=>{
      const meta=WORKS[i]||{};
      piece.dataset.v114Style=meta.style||'other';
      piece.dataset.v114Zone=meta.zone||'';
    });
    const bar=document.createElement('div');
    bar.className='v114-filterbar';
    bar.setAttribute('aria-label','Фильтры портфолио');
    bar.innerHTML=FILTERS.map(([key,label],i)=>`<button class="v114-filter${i===0?' is-active':''}" type="button" data-filter="${key}">${label}</button>`).join('');
    grid.parentNode.insertBefore(bar,grid);
    bar.addEventListener('click',e=>{
      const btn=e.target.closest('.v114-filter'); if(!btn)return;
      qa('.v114-filter',bar).forEach(b=>b.classList.toggle('is-active',b===btn));
      const filter=btn.dataset.filter;
      pieces.forEach(piece=>{
        const show=filter==='all'||piece.dataset.v114Style===filter;
        piece.classList.toggle('v114-hidden',!show);
        if(show){piece.classList.remove('v114-enter'); requestAnimationFrame(()=>piece.classList.add('v114-enter'));}
      });
    });
  }

  function bodySvg(){
    return `<svg class="v114-body-svg" viewBox="0 0 260 560" aria-hidden="true">
      <circle cx="130" cy="52" r="34"/>
      <path d="M103 92 C92 109 83 142 82 177 L68 294 C66 312 78 322 88 309 L101 213 L105 311 L89 510 C88 526 101 531 110 518 L130 348 L150 518 C159 531 172 526 171 510 L155 311 L159 213 L172 309 C182 322 194 312 192 294 L178 177 C177 142 168 109 157 92 C145 101 116 101 103 92 Z"/>
      <path d="M108 96 C114 126 146 126 152 96"/>
      <path d="M105 311 C121 320 139 320 155 311"/>
    </svg>`;
  }

  function choiceGroup(key,title,hint,items){
    return `<div class="v114-group" data-key="${key}"><div class="v114-group-title"><strong>${title}</strong><span>${hint}</span></div><div class="v114-options">${items.map(v=>`<button type="button" class="v114-choice" data-value="${escapeHtml(v)}">${escapeHtml(v)}</button>`).join('')}</div></div>`;
  }

  function buildPlanner(){
    if(q('#v114-planner')) return;
    const works=q('#works'); if(!works)return;
    const sec=document.createElement('section');
    sec.id='v114-planner'; sec.className='orlica-planner';
    sec.innerHTML=`
      <p class="v114-kicker">04 / ИДЕЯ</p>
      <h2 class="v114-title">КУДА<br><span>НАБИТЬ?</span></h2>
      <p class="v114-lead">Выбери место, стиль и примерный размер. Сайт соберёт понятную заявку для Светы и перенесёт её в запись.</p>
      <div class="v114-grid">
        <div class="v114-body-card">
          <div class="v114-body-stage">
            ${bodySvg()}
            ${['Плечо','Предплечье','Грудь','Рёбра','Бедро','Голень'].map(z=>`<button type="button" class="v114-hotspot" data-zone="${z}" data-label="${z}" aria-label="Выбрать: ${z}"></button>`).join('')}
          </div>
          <div class="v114-body-note"><span>Нажми на точку</span><strong id="v114-zone-copy">Место не выбрано</strong></div>
        </div>
        <div class="v114-builder">
          ${choiceGroup('style','Стиль','что ближе',['Графика','Нежнятина','Странные звери','Блэкворк','Цвет'])}
          ${choiceGroup('size','Размер','примерно',['до 5 см','5–10 см','10–15 см','15+ см'])}
          ${choiceGroup('color','Подача','можно обсудить',['Ч/Б','Цвет'])}
          ${choiceGroup('budget','Бюджет','ориентир',['до 5 000 ₽','5–10 000 ₽','10–15 000 ₽','обсудим'])}
          <div class="v114-group"><div class="v114-group-title"><strong>Идея</strong><span>необязательно подробно</span></div><textarea class="v114-idea" id="v114-idea" maxlength="700" placeholder="Например: странный зверь, вытянутый силуэт, немного красного…"></textarea></div>
          <div class="v114-summary"><small>Черновик заявки</small><p id="v114-summary">Выбери хотя бы место и стиль — здесь появится готовое описание.</p></div>
          <div class="v114-actions"><button type="button" class="v114-primary" id="v114-to-book">Продолжить к записи</button><button type="button" class="v114-telegram" id="v114-to-tg">Написать Свете ↗</button></div>
        </div>
      </div>`;
    works.insertAdjacentElement('afterend',sec);

    const zoneCopy=q('#v114-zone-copy',sec), summary=q('#v114-summary',sec), idea=q('#v114-idea',sec);
    const update=()=>{
      state.idea=idea.value.trim();
      const parts=[];
      if(state.zone)parts.push(`место — ${state.zone}`);
      if(state.style)parts.push(`стиль — ${state.style}`);
      if(state.size)parts.push(`размер — ${state.size}`);
      if(state.color)parts.push(`подача — ${state.color}`);
      if(state.budget)parts.push(`бюджет — ${state.budget}`);
      if(state.idea)parts.push(`идея — ${state.idea}`);
      summary.textContent=parts.length?`Хочу тату: ${parts.join('; ')}.`:'Выбери хотя бы место и стиль — здесь появится готовое описание.';
    };

    sec.addEventListener('click',e=>{
      const spot=e.target.closest('.v114-hotspot');
      if(spot){
        state.zone=spot.dataset.zone;
        qa('.v114-hotspot',sec).forEach(b=>b.classList.toggle('is-active',b===spot));
        zoneCopy.textContent=state.zone;
        update(); return;
      }
      const choice=e.target.closest('.v114-choice');
      if(choice){
        const group=choice.closest('[data-key]'); const key=group.dataset.key;
        state[key]=choice.dataset.value;
        qa('.v114-choice',group).forEach(b=>b.classList.toggle('is-active',b===choice));
        update();
      }
    });
    idea.addEventListener('input',update);

    q('#v114-to-book',sec).addEventListener('click',()=>prefillBooking(true));
    q('#v114-to-tg',sec).addEventListener('click',sendTelegram);
  }

  function briefText(){
    const lines=['Привет! Хочу записаться на тату.'];
    if(state.zone)lines.push(`Место: ${state.zone}`);
    if(state.style)lines.push(`Стиль: ${state.style}`);
    if(state.size)lines.push(`Размер: ${state.size}`);
    if(state.color)lines.push(`Подача: ${state.color}`);
    if(state.budget)lines.push(`Бюджет: ${state.budget}`);
    if(state.idea)lines.push(`Идея: ${state.idea}`);
    return lines.join('\n');
  }

  function setField(form,name,value){
    if(!value)return;
    const input=form.elements?.[name]||q(`[name="${name}"]`,form);
    if(!input)return;
    input.value=value;
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function prefillBooking(scroll){
    waitFor('#live-booking-form',form=>{
      setField(form,'place',state.zone);
      setField(form,'size',state.size);
      const idea=[state.idea,state.style?`Стиль: ${state.style}`:'',state.color?`Подача: ${state.color}`:'',state.budget?`Бюджет: ${state.budget}`:''].filter(Boolean).join('\n');
      setField(form,'idea',idea);
      if(scroll){
        const book=q('#book'); book?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
        showToast('Черновик перенесён в запись');
        setTimeout(()=>q('[name="name"]',form)?.focus({preventScroll:true}),650);
      }
    });
  }

  async function sendTelegram(){
    const text=briefText();
    try{ await navigator.clipboard?.writeText(text); }catch(_){ }
    showToast('Текст заявки скопирован');
    const url=`https://t.me/Sveta_orel09?text=${encodeURIComponent(text)}`;
    setTimeout(()=>window.open(url,'_blank','noopener'),180);
  }

  function showToast(text){
    let toast=q('.v114-toast');
    if(!toast){toast=document.createElement('div');toast.className='v114-toast';document.body.appendChild(toast);}
    toast.textContent=text; toast.classList.add('is-show');
    clearTimeout(showToast.t); showToast.t=setTimeout(()=>toast.classList.remove('is-show'),2200);
  }

  function magneticButtons(){
    if(!matchMedia('(hover:hover) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    qa('.v114-primary,.v114-telegram,.cta,.booking-submit').forEach(btn=>{
      btn.addEventListener('pointermove',e=>{
        const r=btn.getBoundingClientRect(); const x=(e.clientX-r.left-r.width/2)*.06; const y=(e.clientY-r.top-r.height/2)*.08;
        btn.style.transform=`translate(${x}px,${y}px)`;
      });
      btn.addEventListener('pointerleave',()=>btn.style.transform='');
    });
  }

  function init(){
    waitFor('#works .grid',mountPortfolioFilters);
    buildPlanner();
    magneticButtons();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,120));
  else setTimeout(init,120);
})();
