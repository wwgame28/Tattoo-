/* ORLICA: local idea studio. Geometry is a creative tool, not a finished tattoo sketch. */
(() => {
  if (document.getElementById('idea-studio')) return;
  const host = document.createElement('section');
  host.id = 'idea-studio'; host.className = 'idea-studio';
  host.setAttribute('aria-labelledby', 'idea-title');
  host.innerHTML = `
    <div class="idea-heading"><div><span class="idea-kicker">ТВОЯ ЛИНИЯ / ТВОЙ ХАРАКТЕР</span><h2 id="idea-title">НАЧНИ<br>С ЛИНИИ.</h2></div><p>Не нужно уметь рисовать. Оставь линию, добавь геометрию и найди настроение. Света поможет превратить задумку в татуировку.</p></div>
    <div class="idea-layout"><div class="idea-paper-wrap"><div class="idea-paper-head"><span>01 / ЧИСТЫЙ ЛИСТ</span><span id="idea-counter">0 элементов</span></div>
    <div class="idea-canvas-tools"><button type="button" class="idea-draw" aria-pressed="false">Включить рисование</button><button type="button" id="idea-mirror" aria-pressed="false">Симметрия: выкл.</button></div>
    <canvas id="idea-canvas" width="720" height="900" tabindex="0" aria-label="Лист для идеи татуировки. Включи рисование для работы пальцем. Геометрические элементы можно добавить кнопками."></canvas>
    <div class="idea-paper-foot"><span id="idea-hint">Включи рисование или добавь символ →</span><span>ORLICA</span></div></div>
    <div class="idea-controls"><div class="idea-control-head"><span>02 / СОБЕРИ ОЩУЩЕНИЕ</span><span>БЕЗ ПРАВИЛ</span></div>
    <p class="idea-help">Кнопки над листом включают рисование и зеркальную линию. Когда рисование включено, прокручивай страницу за пределами листа.</p>
    <label for="idea-mood">Характер линии <output id="idea-mood-label">Нежно</output></label>
    <input id="idea-mood" type="range" min="0" max="100" value="25" aria-valuetext="Нежно">
    <div class="idea-range-labels"><span>Тонко и спокойно</span><span>Плотно и дерзко</span></div>
    <fieldset><legend>Добавь символ</legend><div class="idea-symbols"><button type="button" data-shape="circle">Круг</button><button type="button" data-shape="diamond">Ромб</button><button type="button" data-shape="orbit">Орбита</button><button type="button" data-shape="wave">Волна</button></div></fieldset>
    <p class="idea-help">Символ появится в центре. В режиме рисования перетащи его за центр. Для точного размещения используй настройки ниже.</p>
    <div id="idea-placement" hidden><label for="idea-x">Положение по горизонтали</label><input id="idea-x" type="range" min="15" max="85" value="50"><label for="idea-y">Положение по вертикали</label><input id="idea-y" type="range" min="15" max="85" value="50"><label for="idea-scale">Размер последнего символа</label><input id="idea-scale" type="range" min="40" max="160" value="90"></div>
    <div class="idea-tools"><button type="button" id="idea-undo" disabled>Отменить</button><button type="button" id="idea-clear" disabled>Очистить</button></div>
    <label for="idea-note">Что эта идея значит для тебя?</label><textarea id="idea-note" maxlength="600" rows="3" placeholder="Например: море, свобода, новая глава…"></textarea>
    <div class="idea-export"><button type="button" id="idea-save" disabled>Сохранить картинку</button><button type="button" id="idea-share" disabled>Поделиться картинкой</button><a id="idea-contact" href="https://t.me/Sveta_orel09" target="_blank" rel="noopener">Обсудить со Светой ↗</a></div>
    <p class="idea-help">Сохрани картинку и прикрепи её в переписке. Кнопка Telegram подготовит текст, но не отправит его и не прикрепит файл автоматически.</p>
    <p id="idea-status" role="status" aria-live="polite">Рисунок остаётся на этом устройстве. Это идея, а не готовый эскиз.</p>
    </div></div>`;
  const book = document.getElementById('book');
  if (book) book.before(host); else document.querySelector('main')?.append(host);
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('idea-studio.css?v=2', document.currentScript.src).href; document.head.append(css);
  const $ = selector => host.querySelector(selector);
  const canvas = $('#idea-canvas'), ctx = canvas.getContext('2d');
  if (!ctx) { $('#idea-status').textContent = 'Рисование недоступно в этом браузере. Напиши Свете напрямую.'; return; }
  const W = 720, H = 900, KEY = 'orlica-idea-v1';
  let items = [], mood = 25, enabled = false, mirrored = false, active = null, drag = null, lastSymbol = null, undoStack = [], saveTimer, sharing = false;
  const status = message => { $('#idea-status').textContent = message; };
  const clone = value => JSON.parse(JSON.stringify(value));
  const record = () => { undoStack.push(clone(items)); if (undoStack.length > 12) undoStack.shift(); };
  const message = () => `Привет, Света! Собрал(а) идею на сайте Орлицы. Характер: ${mood < 35 ? 'нежный' : mood < 70 ? 'выразительный' : 'дерзкий'}. ${$('#idea-note').value.trim()}\nХочу обсудить эскиз, размер и стоимость. Картинку прикреплю отдельно.`;
  function sync() {
    $('#idea-counter').textContent = `${items.length} / 150 элементов`;
    $('#idea-undo').disabled = !undoStack.length;
    $('#idea-clear').disabled = !items.length;
    $('#idea-save').disabled = !items.length;
    $('#idea-share').disabled = !items.length || sharing;
    $('#idea-contact').href = 'https://t.me/Sveta_orel09?text=' + encodeURIComponent(message());
    const symbol = lastSymbol !== null && items[lastSymbol]?.type === 'symbol' ? items[lastSymbol] : null;
    $('#idea-placement').hidden = !symbol;
    if (symbol) { $('#idea-x').value = symbol.x / W * 100; $('#idea-y').value = symbol.y / H * 100; $('#idea-scale').value = symbol.size; }
    clearTimeout(saveTimer); saveTimer = setTimeout(persist, 350);
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify({version:1,items,mood,note:$('#idea-note').value})); }
    catch (_) { status('Не удалось сохранить черновик в браузере. Сохрани картинку перед закрытием страницы.'); }
  }
  function drawSymbol(item) {
    ctx.save(); ctx.translate(item.x, item.y); const s = item.size; ctx.beginPath();
    if (item.shape === 'circle') ctx.arc(0,0,s,0,Math.PI*2);
    if (item.shape === 'diamond') { ctx.moveTo(0,-s); ctx.lineTo(s*.72,0); ctx.lineTo(0,s); ctx.lineTo(-s*.72,0); ctx.closePath(); }
    if (item.shape === 'orbit') { ctx.ellipse(0,0,s,s*.45,-Math.PI/4,0,Math.PI*2); ctx.moveTo(s*.5,0); ctx.arc(0,0,s*.5,0,Math.PI*2); }
    if (item.shape === 'wave') { ctx.moveTo(-s,0); ctx.bezierCurveTo(-s*.5,-s*.8,-s*.5,s*.8,0,0); ctx.bezierCurveTo(s*.5,-s*.8,s*.5,s*.8,s,0); }
    ctx.stroke(); ctx.restore();
  }
  function paint() {
    ctx.fillStyle = '#f5efe4'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = '#231b1c'; ctx.fillStyle = '#231b1c'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 1.5 + mood/100*9;
    for (const item of items) {
      if (item.type === 'symbol') drawSymbol(item);
      else {
        const stroke = () => {
          if (item.points.length === 1) { ctx.beginPath(); ctx.arc(...item.points[0],ctx.lineWidth/2,0,Math.PI*2);ctx.fill(); }
          else { ctx.beginPath(); item.points.forEach((p,i)=> i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke(); }
        };
        stroke();
        if(item.mirrored === true){ctx.save();ctx.translate(W,0);ctx.scale(-1,1);stroke();ctx.restore();}
      }
    }
  }
  function selectLast() { lastSymbol = null; for(let i=items.length-1;i>=0;i--) if(items[i].type==='symbol'){lastSymbol=i;break;} }
  const point = e => { const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(W,(e.clientX-r.left)*W/r.width)),Math.max(0,Math.min(H,(e.clientY-r.top)*H/r.height))]; };
  canvas.addEventListener('pointerdown', e => {
    if(!enabled || active!==null || (e.pointerType==='mouse' && e.button!==0)) return;
    const p=point(e); let hit=-1;
    for(let i=items.length-1;i>=0;i--) if(items[i].type==='symbol' && Math.hypot(items[i].x-p[0],items[i].y-p[1])<40){hit=i;break;}
    if(hit<0 && items.length>=150){status('Лист заполнен. Отмени элемент или сохрани идею.');return;}
    e.preventDefault(); record(); active=e.pointerId; canvas.setPointerCapture(e.pointerId);
    if(hit>=0){lastSymbol=hit;drag={index:hit,dx:items[hit].x-p[0],dy:items[hit].y-p[1]};}
    else {items.push({type:'stroke',points:[p],mirrored}); drag=null;}
    paint();sync();
  });
  canvas.addEventListener('pointermove',e=>{
    if(e.pointerId!==active)return; const p=point(e);
    if(drag){const item=items[drag.index];item.x=Math.max(108,Math.min(612,p[0]+drag.dx));item.y=Math.max(135,Math.min(765,p[1]+drag.dy));}
    else {const pts=items.at(-1).points;const prev=pts.at(-1);if(pts.length<2000 && Math.hypot(p[0]-prev[0],p[1]-prev[1])>2)pts.push(p);}
    paint();
  });
  function finish(e){if(e.pointerId!==active)return;active=null;drag=null;sync();}
  canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);canvas.addEventListener('lostpointercapture',finish);
  $('.idea-draw').addEventListener('click',()=>{enabled=!enabled;$('.idea-draw').setAttribute('aria-pressed',String(enabled));$('.idea-draw').textContent=enabled?'Закончить рисование':'Включить рисование';canvas.classList.toggle('is-drawing',enabled);$('#idea-hint').textContent=enabled?'Рисуй здесь · прокрутка — за пределами листа':'Лист можно прокручивать';});
  $('#idea-mirror').addEventListener('click',()=>{mirrored=!mirrored;$('#idea-mirror').setAttribute('aria-pressed',String(mirrored));$('#idea-mirror').textContent=mirrored?'Симметрия: вкл.':'Симметрия: выкл.';status(mirrored?'Следующие линии будут отражаться по центру листа.':'Следующие линии будут одиночными.');});
  $('#idea-mood').addEventListener('input',e=>{mood=Number(e.target.value);const label=mood<35?'Нежно':mood<70?'Выразительно':'Дерзко';$('#idea-mood-label').value=label;e.target.setAttribute('aria-valuetext',label);paint();sync();});
  host.querySelectorAll('[data-shape]').forEach(button=>button.addEventListener('click',()=>{if(items.length>=150){status('На листе уже 150 элементов.');return;}record();items.push({type:'symbol',shape:button.dataset.shape,x:W/2,y:H/2,size:90});lastSymbol=items.length-1;paint();sync();status('Символ добавлен. Настрой его положение и размер.');}));
  for(const [id,key,factor] of [['idea-x','x',W/100],['idea-y','y',H/100],['idea-scale','size',1]]){
    const control=$('#'+id);control.addEventListener('pointerdown',()=>record());control.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))record();});
    control.addEventListener('input',e=>{if(lastSymbol===null)return;items[lastSymbol][key]=Number(e.target.value)*factor;paint();sync();});
  }
  $('#idea-undo').addEventListener('click',()=>{if(!undoStack.length)return;items=undoStack.pop();selectLast();paint();sync();status('Последнее изменение отменено.');});
  $('#idea-clear').addEventListener('click',()=>{record();items=[];lastSymbol=null;paint();sync();status('Лист очищен. Можно вернуть рисунок кнопкой «Отменить».');});
  $('#idea-note').addEventListener('input',sync);
  function blob(){return new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('export')),'image/png'));}
  function download(value){const url=URL.createObjectURL(value);const a=document.createElement('a');a.href=url;a.download='orlica-moya-ideya.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  $('#idea-save').addEventListener('click',async()=>{try{download(await blob());status('Картинка подготовлена. Прикрепи её в переписке со Светой.');}catch(_){status('Не удалось сохранить картинку. Попробуй ещё раз.');}});
  // Precompute PNG after edits so iOS share keeps the user activation.
  let shareFile=null, exportRevision=0;
  const originalSync=sync;
  sync=function(){originalSync();const revision=++exportRevision;shareFile=null;canvas.toBlob(value=>{if(value && revision===exportRevision)shareFile=new File([value],'orlica-moya-ideya.png',{type:'image/png'});},'image/png');};
  $('#idea-share').addEventListener('click',async()=>{
    if(!shareFile){status('Подготовка картинки. Нажми «Поделиться» ещё раз.');return;}
    const file=shareFile;
    if(!navigator.canShare?.({files:[file]}) || !navigator.share){download(file);status('Картинка скачивается. Прикрепи её в Telegram вручную.');return;}
    sharing=true;$('#idea-share').disabled=true;
    try{await navigator.share({files:[file],title:'Моя идея для Светы',text:message()});status('Меню отправки закрыто. Запись подтверждается отдельно со Светой.');}catch(e){if(e.name!=='AbortError')status('Не получилось поделиться. Используй «Сохранить картинку».');}
    finally{sharing=false;$('#idea-share').disabled=!items.length;}
  });
  try {
    const saved=JSON.parse(localStorage.getItem(KEY)||'null');
    const finite=n=>Number.isFinite(n);
    if(saved?.version===1 && Array.isArray(saved.items) && saved.items.length<=150){
      items=saved.items.filter(item=>item && (item.type==='stroke' && Array.isArray(item.points) && item.points.length>0 && item.points.length<=2000 && item.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(finite)&&p[0]>=0&&p[0]<=W&&p[1]>=0&&p[1]<=H) || item.type==='symbol' && ['circle','diamond','orbit','wave'].includes(item.shape)&&[item.x,item.y,item.size].every(finite)&&item.size>=40&&item.size<=160&&item.x>=0&&item.x<=W&&item.y>=0&&item.y<=H));
      mood=finite(saved.mood)?Math.max(0,Math.min(100,saved.mood)):25;$('#idea-mood').value=mood;
      const label=mood<35?'Нежно':mood<70?'Выразительно':'Дерзко';$('#idea-mood-label').value=label;$('#idea-mood').setAttribute('aria-valuetext',label);
      $('#idea-note').value=typeof saved.note==='string'?saved.note.slice(0,600):'';selectLast();if(items.length)status('Твоя идея восстановлена на этом устройстве.');
    }
  } catch(_){}
  addEventListener('pagehide',persist);paint();sync();
  const heroActions=document.querySelector('.hero-bottom');
  if(heroActions){const link=document.createElement('a');link.href='#idea-studio';link.className='hero-secondary';link.textContent='Создать свою идею ↗';heroActions.append(link);}
})();
