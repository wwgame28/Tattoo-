/* ORLICA AI SKETCH v1 */
(() => {
  const API = 'https://dbwnvbfdphqmfjzbpqnw.supabase.co/functions/v1/orlica-ai-guard';
  const API_KEY = 'sb_publishable_W1A3xK3BUPn85bROX9kNwQ_ylVGmS-O';
  const K_SESSION = 'orlica_ai_session_v1';
  const K_DEVICE = 'orlica_ai_device_v1';

  const options = {
    style: ['Blackwork','Fine line','Anime','Графика','Ornamental','Horror','Color','Sketch'],
    character: ['Девушка','Демон','Ангел','Самурай','Ведьма','Кот','Лиса','Дракон','Маска'],
    mood: ['Мрачное','Нежное','Агрессивное','Магическое','Романтичное','Странное'],
    color: ['Ч/Б','Ч/Б + красный','Цветной'],
    bodyPart: ['Предплечье','Плечо','Грудь','Рёбра','Бедро','Голень','Спина','Шея'],
    size: ['Мини','Средний','Крупный','Рукав','Вертикальный','Широкий'],
    elements: ['Луна','Цветы','Цепи','Меч','Бабочки','Огонь','Звёзды','Руны','Маска','Облака','Глаза']
  };

  let state = { style:'', character:'', inspiration:'', elements:[], mood:'', color:'Ч/Б', bodyPart:'', size:'', description:'' };
  let quota = null;

  function uid() {
    if (crypto.randomUUID) return crypto.randomUUID() + '-' + crypto.randomUUID();
    const a = new Uint32Array(8); crypto.getRandomValues(a); return Array.from(a).join('-');
  }
  function getDevice() {
    let id = localStorage.getItem(K_DEVICE);
    if (!id) { id = uid(); localStorage.setItem(K_DEVICE, id); }
    return id;
  }
  function session() { return localStorage.getItem(K_SESSION) || ''; }
  function headers(withSession = false) {
    const h = { 'Content-Type':'application/json', 'apikey':API_KEY };
    if (withSession && session()) h['x-ai-session'] = session();
    return h;
  }
  function esc(s='') { return String(s).replace(/[&<>'"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m])); }
  function chipGroup(key, multi=false) {
    return `<div class="ai-chips" data-group="${key}" data-multi="${multi?'1':'0'}">${options[key].map(v=>`<button class="ai-chip${(!multi && state[key]===v)||(multi && state[key].includes(v))?' is-active':''}" type="button" data-value="${esc(v)}">${esc(v)}</button>`).join('')}</div>`;
  }
  function sectionHTML() {
    return `<section id="ai-sketch" aria-labelledby="ai-title">
      <div class="ai-wrap">
        <div class="ai-kicker">ORLICA / AI CONCEPT</div>
        <h2 class="ai-title" id="ai-title">СОБЕРИ<br>ЭСКИЗ</h2>
        <p class="ai-lead">Выбери стиль, персонажа и атмосферу. ИИ соберёт три черновых тату-концепта. Финальный эскиз Света дорабатывает вручную под анатомию и размер.</p>
        <div class="ai-shell">
          <div class="ai-topbar">
            <div class="ai-status"><span class="ai-dot"></span><span id="ai-status-text">AI-конструктор</span></div>
            <div class="ai-quota" id="ai-quota">Войдите, чтобы начать</div>
          </div>
          <div class="ai-panel">
            <div class="ai-authbox" id="ai-authbox">
              <div class="ai-auth">
                <div class="ai-field"><label for="ai-name">Имя</label><input id="ai-name" autocomplete="name" placeholder="Как к тебе обращаться"></div>
                <div class="ai-field"><label for="ai-phone">Номер телефона</label><input id="ai-phone" inputmode="tel" autocomplete="tel" placeholder="+7 999 000-00-00"></div>
                <button class="ai-btn" id="ai-login" type="button">ПРОДОЛЖИТЬ</button>
              </div>
              <div class="ai-error" id="ai-auth-error"></div>
              <div class="ai-note">Номер используется только для личной базы генератора. SMS-код не нужен.</div>
            </div>

            <div class="ai-builder" id="ai-builder" hidden>
              <div class="ai-profile"><div><strong id="ai-hello">Привет</strong><small>Две генерации в сутки · по три эскиза</small></div><button class="ai-btn ai-btn-ghost" id="ai-logout" type="button">СМЕНИТЬ АККАУНТ</button></div>
              <div class="ai-grid">
                <div class="ai-group"><h3>1. Стиль</h3><p>Выбери основу визуального языка.</p>${chipGroup('style')}</div>
                <div class="ai-group"><h3>2. Персонаж</h3><p>Кто или что будет главным объектом.</p>${chipGroup('character')}<div class="ai-field ai-custom"><input id="ai-character-custom" placeholder="Или свой персонаж"></div></div>
                <div class="ai-group"><h3>3. Мульт / аниме / игра</h3><p>Источник атмосферы и визуальных мотивов.</p><div class="ai-field"><input id="ai-inspiration" placeholder="Например: Arcane, Coraline, Naruto"></div></div>
                <div class="ai-group"><h3>4. Элементы</h3><p>Можно выбрать несколько.</p>${chipGroup('elements',true)}<div class="ai-field ai-custom"><input id="ai-elements-custom" placeholder="Добавить свой элемент"></div></div>
                <div class="ai-group"><h3>5. Настроение</h3><p>Какое ощущение должен давать эскиз.</p>${chipGroup('mood')}</div>
                <div class="ai-group"><h3>6. Цвет</h3><p>Основная цветовая схема.</p>${chipGroup('color')}</div>
                <div class="ai-group"><h3>7. Место</h3><p>ИИ учтёт форму зоны при композиции.</p>${chipGroup('bodyPart')}</div>
                <div class="ai-group"><h3>8. Размер</h3><p>Определи масштаб и направление.</p>${chipGroup('size')}</div>
                <div class="ai-group ai-wide"><h3>Дополнительно</h3><p>Расскажи идею своими словами — это необязательно.</p><div class="ai-field"><textarea id="ai-description" placeholder="Например: хочу тонкую композицию с девушкой-демоном, луной и цепями..."></textarea></div></div>
              </div>
              <div class="ai-generatebar"><p><strong>Одна генерация = 3 эскиза.</strong><br>Списание происходит только после нажатия кнопки.</p><button class="ai-btn ai-btn-dark" id="ai-generate" type="button">СГЕНЕРИРОВАТЬ 3 ЭСКИЗА</button></div>
              <div class="ai-error" id="ai-gen-error"></div>
              <div class="ai-results" id="ai-results" hidden>
                <div class="ai-results-head"><div><h3>Твои варианты</h3><p>Выбери тот, который ближе к идее.</p></div><button class="ai-btn ai-btn-ghost" id="ai-again" type="button">ЕЩЁ 3 ВАРИАНТА</button></div>
                <div class="ai-cards" id="ai-cards"></div>
                <div class="ai-note">AI-концепт — не финальный рабочий эскиз. Света адаптирует выбранный вариант под тело и технику нанесения.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  }

  function mount() {
    if (document.getElementById('ai-sketch')) return;
    const temp = document.createElement('div'); temp.innerHTML = sectionHTML();
    const section = temp.firstElementChild;
    const footer = document.querySelector('footer');
    if (footer?.parentNode) footer.parentNode.insertBefore(section, footer); else document.body.appendChild(section);
    bind(); restore();
  }

  function bind() {
    document.querySelectorAll('#ai-sketch .ai-chips').forEach(group => group.addEventListener('click', e => {
      const b = e.target.closest('.ai-chip'); if (!b) return;
      const key = group.dataset.group, v = b.dataset.value, multi = group.dataset.multi === '1';
      if (multi) {
        const set = new Set(state[key]); set.has(v) ? set.delete(v) : set.add(v); state[key] = [...set]; b.classList.toggle('is-active');
      } else {
        state[key] = v; group.querySelectorAll('.ai-chip').forEach(x => x.classList.toggle('is-active', x===b));
      }
    }));
    document.getElementById('ai-login').addEventListener('click', register);
    document.getElementById('ai-logout').addEventListener('click', () => { localStorage.removeItem(K_SESSION); location.hash='ai-sketch'; location.reload(); });
    document.getElementById('ai-generate').addEventListener('click', generate);
    document.getElementById('ai-again').addEventListener('click', generate);
  }

  function showError(id, message='') { const el=document.getElementById(id); el.textContent=message; el.classList.toggle('is-visible', !!message); }
  function setBusy(id, busy, labelBusy, labelNormal) { const b=document.getElementById(id); b.disabled=busy; b.textContent=busy?labelBusy:labelNormal; }
  function updateQuota(q) {
    quota=q; const remaining=Number(q?.generations_remaining ?? 0), sketches=Number(q?.sketches_remaining ?? remaining*3);
    document.getElementById('ai-quota').textContent=`Сегодня: ${remaining}/2 · ${sketches} эскизов`;
    const g=document.getElementById('ai-generate'); if(g) g.disabled=remaining<=0;
    const a=document.getElementById('ai-again'); if(a) a.disabled=remaining<=0;
  }
  function loggedIn(name,q) {
    document.getElementById('ai-authbox').hidden=true; document.getElementById('ai-builder').hidden=false;
    document.getElementById('ai-hello').textContent=`Привет, ${name}`; document.getElementById('ai-status-text').textContent='AI-конструктор активен'; updateQuota(q);
  }
  async function restore() {
    if (!session()) return;
    try {
      const r=await fetch(API,{headers:headers(true)}); const d=await r.json();
      if(!r.ok) throw new Error(d.error||'SESSION'); loggedIn(d.profile?.name||'гость',d);
    } catch { localStorage.removeItem(K_SESSION); }
  }
  async function register() {
    showError('ai-auth-error'); const name=document.getElementById('ai-name').value.trim(), phone=document.getElementById('ai-phone').value.trim();
    if(name.length<2) return showError('ai-auth-error','Введите имя.'); if(phone.replace(/\D/g,'').length<7) return showError('ai-auth-error','Введите номер телефона.');
    setBusy('ai-login',true,'СОЗДАЮ ПРОФИЛЬ…','ПРОДОЛЖИТЬ');
    try {
      const r=await fetch(API,{method:'POST',headers:headers(),body:JSON.stringify({action:'register',name,phone,device_id:getDevice()})}); const d=await r.json();
      if(!r.ok) throw new Error(d.message||({NUMBER_ALREADY_REGISTERED:'Этот номер уже используется на другом устройстве.',DEVICE_ALREADY_REGISTERED:'На этом устройстве уже создан аккаунт.'}[d.error])||'Не удалось войти.');
      localStorage.setItem(K_SESSION,d.session); loggedIn(d.profile?.name||name,d.quota); document.getElementById('ai-builder').scrollIntoView({behavior:'smooth',block:'start'});
    } catch(e) { showError('ai-auth-error',e.message||'Ошибка подключения.'); }
    finally { setBusy('ai-login',false,'','ПРОДОЛЖИТЬ'); }
  }
  function collect() {
    const customCharacter=document.getElementById('ai-character-custom').value.trim();
    const customElement=document.getElementById('ai-elements-custom').value.trim();
    return {
      ...state,
      character: customCharacter || state.character,
      inspiration: document.getElementById('ai-inspiration').value.trim(),
      elements: [...state.elements, ...(customElement?[customElement]:[])],
      description: document.getElementById('ai-description').value.trim()
    };
  }
  function renderImages(urls=[]) {
    const cards=document.getElementById('ai-cards'); cards.innerHTML='';
    urls.forEach((url,i)=>{
      const card=document.createElement('article'); card.className='ai-card is-loading';
      card.innerHTML=`<img alt="AI эскиз ${i+1}" referrerpolicy="no-referrer"><div class="ai-card-meta"><span>Вариант ${String(i+1).padStart(2,'0')}</span><button type="button">ВЫБРАТЬ</button></div>`;
      const img=card.querySelector('img'); img.onload=()=>card.classList.remove('is-loading'); img.onerror=()=>{card.classList.remove('is-loading'); card.querySelector('.ai-card-meta span').textContent='Не загрузился';}; img.src=url;
      card.querySelector('button').addEventListener('click',()=>{cards.querySelectorAll('.ai-card').forEach(c=>c.classList.remove('ai-selected')); card.classList.add('ai-selected'); card.querySelector('.ai-card-meta span').textContent='Выбрано';});
      cards.appendChild(card);
    });
    document.getElementById('ai-results').hidden=false; document.getElementById('ai-results').scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function generate() {
    showError('ai-gen-error'); const req=collect();
    if(!req.style) return showError('ai-gen-error','Сначала выбери стиль.');
    if(!req.character) return showError('ai-gen-error','Выбери персонажа или введи свой вариант.');
    if(Number(quota?.generations_remaining??0)<=0) return showError('ai-gen-error','Лимит на сегодня закончился. Завтра снова будет 2 генерации.');
    setBusy('ai-generate',true,'ГЕНЕРИРУЮ…','СГЕНЕРИРОВАТЬ 3 ЭСКИЗА'); setBusy('ai-again',true,'ГЕНЕРИРУЮ…','ЕЩЁ 3 ВАРИАНТА');
    document.getElementById('ai-results').hidden=false; document.getElementById('ai-cards').innerHTML='<div class="ai-card is-loading"></div><div class="ai-card is-loading"></div><div class="ai-card is-loading"></div>';
    try {
      const r=await fetch(API,{method:'POST',headers:headers(true),body:JSON.stringify({action:'claim',request:req})}); const d=await r.json();
      if(!r.ok) throw new Error(d.error==='DAILY_LIMIT_REACHED'?'Лимит 2 генерации на сегодня уже использован.':d.message||'Не удалось запустить генерацию.');
      updateQuota(d); renderImages(d.images||[]);
    } catch(e) { document.getElementById('ai-results').hidden=true; showError('ai-gen-error',e.message||'Ошибка генерации.'); }
    finally { setBusy('ai-generate',false,'','СГЕНЕРИРОВАТЬ 3 ЭСКИЗА'); setBusy('ai-again',false,'','ЕЩЁ 3 ВАРИАНТА'); updateQuota(quota||{}); }
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();
