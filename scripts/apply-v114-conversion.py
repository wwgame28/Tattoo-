from pathlib import Path
import re

root = Path('.')
index = root / 'index.html'
css = root / 'orlica-v11.css'
js = root / 'orlica-v11.js'

html = index.read_text(encoding='utf-8')
style = css.read_text(encoding='utf-8')
script = js.read_text(encoding='utf-8')

CSS_MARKER = '/* ORLICA V11.4 conversion layer */'
JS_MARKER = '/* ORLICA V11.4 conversion runtime */'

if CSS_MARKER in style:
    style = style.split(CSS_MARKER)[0].rstrip() + '\n\n'
if JS_MARKER in script:
    script = script.split(JS_MARKER)[0].rstrip() + '\n\n'

style += r'''
/* ORLICA V11.4 conversion layer */
.v114-kicker{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c6b8b7;margin:0 0 16px}
.v114-section-title{font-family:Later,Impact,sans-serif;font-size:clamp(54px,10vw,128px);line-height:.86;letter-spacing:-.035em;margin:0;color:#f5eee9}
.v114-section-copy{max-width:48ch;color:#c9bdbc;font-size:clamp(16px,2vw,20px);line-height:1.55;margin:22px 0 0}

/* Portfolio filters */
.v114-portfolio-tools{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:0 0 28px;padding:0 0 20px;border-bottom:1px solid rgba(255,255,255,.12)}
.v114-filter-label{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#b9aaaa;white-space:nowrap}
.v114-filters{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:2px}
.v114-filters::-webkit-scrollbar{display:none}
.v114-filter{min-height:42px;border:1px solid rgba(255,244,239,.3);border-radius:999px;background:rgba(18,6,9,.22);color:#d9ceca;padding:0 16px;white-space:nowrap;font-size:11px;letter-spacing:.09em;text-transform:uppercase;cursor:pointer;transition:.2s ease}
.v114-filter:is(:hover,.is-active){border-color:rgba(255,255,255,.8);background:rgba(190,23,47,.16);color:#fff}
.portfolio-piece.v114-hidden{display:none!important}
.portfolio-piece.v114-enter{animation:v114PieceIn .32s ease both}
@keyframes v114PieceIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

/* Body placement map */
.v114-body-map{position:relative;padding:clamp(74px,10vw,140px) clamp(20px,5vw,76px);background:linear-gradient(180deg,#080304 0%,#100507 48%,#050303 100%);border-top:1px solid rgba(255,255,255,.11);overflow:hidden}
.v114-body-map::after{content:'PLACE';position:absolute;right:-.03em;bottom:-.22em;font-family:Later,Impact,sans-serif;font-size:clamp(180px,33vw,520px);line-height:1;color:rgba(255,255,255,.018);pointer-events:none}
.v114-body-head{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(260px,.65fr);gap:36px;align-items:end;position:relative;z-index:1;margin-bottom:48px}
.v114-body-shell{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,.75fr);gap:26px;align-items:stretch;position:relative;z-index:1}
.v114-figures{display:grid;grid-template-columns:1fr 1fr;gap:14px;min-height:560px}
.v114-figure{position:relative;border:1px solid rgba(255,255,255,.12);border-radius:28px;background:radial-gradient(circle at 50% 36%,rgba(116,7,22,.34),rgba(15,5,7,.34) 55%,rgba(4,3,3,.5));overflow:hidden;min-height:560px}
.v114-figure-label{position:absolute;left:18px;top:16px;z-index:5;font-size:10px;letter-spacing:.18em;color:#ae9e9d;text-transform:uppercase}
.v114-silhouette{position:absolute;inset:48px 18% 24px;width:64%;height:calc(100% - 72px);opacity:.55;filter:drop-shadow(0 0 30px rgba(188,22,49,.15))}
.v114-silhouette path,.v114-silhouette circle{fill:rgba(238,226,220,.07);stroke:rgba(238,226,220,.35);stroke-width:1.5;vector-effect:non-scaling-stroke}
.v114-zone{position:absolute;z-index:6;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.72);background:rgba(147,12,31,.55);box-shadow:0 0 0 6px rgba(175,15,39,.12),0 0 28px rgba(221,33,64,.24);color:#fff;cursor:pointer;display:grid;place-items:center;font-size:0;transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
.v114-zone::after{content:attr(aria-label);position:absolute;left:50%;top:calc(100% + 9px);transform:translateX(-50%);font-size:9px;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;color:#cbbfbb;opacity:0;pointer-events:none;transition:opacity .18s ease}
.v114-zone:hover,.v114-zone.is-active{transform:scale(1.16);background:#cc1939;box-shadow:0 0 0 8px rgba(206,25,57,.13),0 0 36px rgba(230,38,72,.4)}
.v114-zone:hover::after,.v114-zone.is-active::after{opacity:1}
.v114-zone[data-place='Плечо']{left:28%;top:22%}
.v114-zone[data-place='Грудь']{left:54%;top:28%}
.v114-zone[data-place='Предплечье']{left:18%;top:43%}
.v114-zone[data-place='Бедро']{left:55%;top:61%}
.v114-zone[data-place='Голень']{left:38%;top:80%}
.v114-figure.back .v114-zone[data-place='Спина']{left:50%;top:34%}
.v114-figure.back .v114-zone[data-place='Лопатка']{left:34%;top:25%}
.v114-figure.back .v114-zone[data-place='Икра']{left:57%;top:80%}
.v114-body-result{border:1px solid rgba(255,255,255,.13);border-radius:28px;background:rgba(15,5,7,.42);padding:28px;display:flex;flex-direction:column;justify-content:space-between;min-height:100%}
.v114-body-result small{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#a99594}
.v114-body-result h3{font-family:Later,Impact,sans-serif;font-size:clamp(46px,6vw,78px);line-height:.88;margin:14px 0 16px;color:#f3ece8}
.v114-body-result p{color:#c9bdbc;line-height:1.55;margin:0}
.v114-body-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:24px 0}
.v114-body-meta div{padding:13px;border:1px solid rgba(255,255,255,.09);border-radius:14px}
.v114-body-meta span{display:block;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#8f7f7f;margin-bottom:6px}
.v114-body-meta strong{font-size:14px;color:#eee5e0}
.v114-body-result .cta{width:100%}

/* Smart Telegram brief */
.v114-telegram{padding:clamp(74px,10vw,140px) clamp(20px,5vw,76px);background:linear-gradient(180deg,#050303,#0b0305 60%,#050303);border-top:1px solid rgba(255,255,255,.1)}
.v114-telegram-grid{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:42px;margin-top:44px}
.v114-brief{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.v114-field{display:flex;flex-direction:column;gap:8px}
.v114-field.wide{grid-column:1/-1}
.v114-field span{font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:#a89190}
.v114-field select,.v114-field textarea{width:100%;min-height:54px;border:1px solid rgba(255,255,255,.17);border-radius:14px;background:rgba(20,7,9,.52);color:#f0e8e4;padding:0 15px;font:inherit;outline:none}
.v114-field textarea{min-height:118px;padding:15px;resize:vertical;line-height:1.5}
.v114-field select:focus,.v114-field textarea:focus{border-color:rgba(255,255,255,.62);box-shadow:0 0 0 3px rgba(190,25,52,.12)}
.v114-preview{border:1px solid rgba(255,255,255,.13);border-radius:24px;background:rgba(15,5,7,.5);padding:24px;display:flex;flex-direction:column;min-height:100%}
.v114-preview-top{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.09)}
.v114-preview-top span{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#a89190}
.v114-preview-top b{font-size:12px;color:#d7c9c5}
.v114-message{white-space:pre-wrap;line-height:1.58;color:#eee6e1;font-size:15px;margin:22px 0 26px;flex:1}
.v114-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.v114-actions .cta{width:100%;font-size:13px}
.v114-status{min-height:22px;margin-top:12px;color:#cdbebb;font-size:12px}

@media(max-width:900px){
 .v114-body-head,.v114-body-shell,.v114-telegram-grid{grid-template-columns:1fr}
 .v114-body-head{gap:18px}
 .v114-body-result{min-height:auto}
}
@media(max-width:760px){
 .v114-portfolio-tools{align-items:flex-start;flex-direction:column;margin-bottom:20px}
 .v114-filters{width:100%;margin-right:-20px;padding-right:20px}
 .v114-body-map,.v114-telegram{padding-inline:20px}
 .v114-body-head{margin-bottom:28px}
 .v114-figures{grid-template-columns:1fr 1fr;gap:8px;min-height:430px}
 .v114-figure{min-height:430px;border-radius:20px}
 .v114-silhouette{inset:44px 11% 18px;width:78%;height:calc(100% - 62px)}
 .v114-zone{width:30px;height:30px}
 .v114-zone::after{display:none}
 .v114-body-result{padding:22px;border-radius:20px}
 .v114-body-meta{grid-template-columns:1fr}
 .v114-telegram-grid{gap:20px;margin-top:28px}
 .v114-brief{grid-template-columns:1fr}
 .v114-field.wide{grid-column:auto}
 .v114-preview{padding:20px;border-radius:20px}
 .v114-actions{grid-template-columns:1fr}
}
@media(prefers-reduced-motion:reduce){.portfolio-piece.v114-enter{animation:none}.v114-zone{transition:none}}
'''

script += r'''
/* ORLICA V11.4 conversion runtime */
(() => {
  const TG_USER = 'Sveta_orel09';
  const TG_URL = `https://t.me/${TG_USER}`;

  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, {once:true})
    : fn();

  function mountPortfolioFilters(){
    const grid = document.querySelector('#works .orlica-gallery');
    if (!grid || document.querySelector('.v114-portfolio-tools')) return;
    const pieces = [...grid.querySelectorAll('.portfolio-piece')];
    if (!pieces.length) return;

    const tools = document.createElement('div');
    tools.className = 'v114-portfolio-tools';
    tools.innerHTML = `<span class="v114-filter-label">Фильтр работ</span><div class="v114-filters" role="group" aria-label="Фильтр портфолио">
      <button class="v114-filter is-active" type="button" data-filter="all">Все</button>
      <button class="v114-filter" type="button" data-filter="graphic">Графика</button>
      <button class="v114-filter" type="button" data-filter="tender">Нежнятина</button>
      <button class="v114-filter" type="button" data-filter="creatures">Странные звери</button>
      <button class="v114-filter" type="button" data-filter="color">Цвет</button>
    </div>`;
    grid.before(tools);

    const belongs = (piece, index, key) => {
      if (key === 'all') return true;
      const title = (piece.querySelector('.piece-title')?.textContent || '').toLowerCase();
      const tag = (piece.querySelector('.piece-tag')?.textContent || '').toLowerCase();
      if (key === 'graphic') return /graphic|manga|blackwork/.test(tag) || /ornament|geometry/.test(title);
      if (key === 'tender') return /fine line/.test(tag) || /floral/.test(title) || index === 8;
      if (key === 'creatures') return /rabbit|character|anime|fantasy/.test(title) || [2,4,5,6,7].includes(index);
      if (key === 'color') return /color/.test(tag) || /red/.test(title);
      return true;
    };

    tools.querySelectorAll('.v114-filter').forEach(btn => btn.addEventListener('click', () => {
      tools.querySelectorAll('.v114-filter').forEach(x => x.classList.toggle('is-active', x === btn));
      const key = btn.dataset.filter;
      pieces.forEach((piece, index) => {
        const show = belongs(piece, index, key);
        piece.classList.toggle('v114-hidden', !show);
        if (show) {
          piece.classList.remove('v114-enter');
          void piece.offsetWidth;
          piece.classList.add('v114-enter');
        }
      });
    }));

    const viewer = document.querySelector('.orlica-viewer-shell');
    if (viewer && !viewer.dataset.v114Swipe) {
      viewer.dataset.v114Swipe = '1';
      let startX = 0, startY = 0;
      viewer.addEventListener('touchstart', e => {
        const t = e.changedTouches[0]; startX = t.clientX; startY = t.clientY;
      }, {passive:true});
      viewer.addEventListener('touchend', e => {
        const t = e.changedTouches[0];
        const dx = t.clientX - startX, dy = t.clientY - startY;
        if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
        const selector = dx < 0 ? '.orlica-viewer-next' : '.orlica-viewer-prev';
        viewer.querySelector(selector)?.click();
      }, {passive:true});
    }
  }

  const silhouette = () => `<svg class="v114-silhouette" viewBox="0 0 180 480" aria-hidden="true">
    <circle cx="90" cy="42" r="27"/>
    <path d="M70 72 C58 92 54 122 56 160 L40 250 C37 268 48 275 57 258 L72 190 L72 292 L58 452 C57 466 72 468 76 454 L90 320 L104 454 C108 468 123 466 122 452 L108 292 L108 190 L123 258 C132 275 143 268 140 250 L124 160 C126 122 122 92 110 72 Z"/>
  </svg>`;

  function mountBodyMap(){
    const works = document.querySelector('#works');
    const book = document.querySelector('#book');
    if (!works || !book || document.querySelector('#tattoo-map')) return;
    const sec = document.createElement('section');
    sec.id = 'tattoo-map';
    sec.className = 'v114-body-map';
    sec.innerHTML = `<div class="v114-body-head">
      <div><p class="v114-kicker">ORLICA / выбор места</p><h2 class="v114-section-title">КУДА<br>НАБИТЬ?</h2></div>
      <p class="v114-section-copy">Тапни по зоне — подскажу ориентир по размеру и сразу подставлю место в запись.</p>
    </div>
    <div class="v114-body-shell">
      <div class="v114-figures">
        <div class="v114-figure front"><span class="v114-figure-label">Спереди</span>${silhouette()}
          <button class="v114-zone" type="button" data-place="Плечо" data-size="8–14 см" data-tip="Хорошо работает для графики, символов и компактных сюжетов." aria-label="Плечо"></button>
          <button class="v114-zone" type="button" data-place="Грудь" data-size="10–20 см" data-tip="Подходит для более цельной композиции и симметричных работ." aria-label="Грудь"></button>
          <button class="v114-zone" type="button" data-place="Предплечье" data-size="8–18 см" data-tip="Универсальная зона: графика, fine line и вертикальные композиции." aria-label="Предплечье"></button>
          <button class="v114-zone" type="button" data-place="Бедро" data-size="12–25 см" data-tip="Много пространства для деталей и более крупного сюжета." aria-label="Бедро"></button>
          <button class="v114-zone" type="button" data-place="Голень" data-size="10–22 см" data-tip="Хорошо смотрятся вытянутые композиции и графичные формы." aria-label="Голень"></button>
        </div>
        <div class="v114-figure back"><span class="v114-figure-label">Сзади</span>${silhouette()}
          <button class="v114-zone" type="button" data-place="Лопатка" data-size="10–18 см" data-tip="Подходит для самостоятельного акцента или начала большой композиции." aria-label="Лопатка"></button>
          <button class="v114-zone" type="button" data-place="Спина" data-size="18–40+ см" data-tip="Большое полотно: можно делать сложный сюжет с большим количеством деталей." aria-label="Спина"></button>
          <button class="v114-zone" type="button" data-place="Икра" data-size="10–20 см" data-tip="Удобная зона для вертикальных рисунков и графики." aria-label="Икра"></button>
        </div>
      </div>
      <aside class="v114-body-result">
        <div><small>Выбранная зона</small><h3 class="v114-place-current">ВЫБЕРИ<br>МЕСТО</h3><p class="v114-place-tip">Можно начать с любой точки на схеме. Размер — ориентир, финально Света подберёт его под эскиз и анатомию.</p></div>
        <div><div class="v114-body-meta"><div><span>Размер</span><strong class="v114-place-size">—</strong></div><div><span>Дальше</span><strong>Подставим в запись</strong></div></div><button class="cta v114-use-place" type="button" disabled>Добавить к записи</button></div>
      </aside>
    </div>`;
    book.before(sec);

    let selection = null;
    const current = sec.querySelector('.v114-place-current');
    const tip = sec.querySelector('.v114-place-tip');
    const size = sec.querySelector('.v114-place-size');
    const use = sec.querySelector('.v114-use-place');

    sec.querySelectorAll('.v114-zone').forEach(btn => btn.addEventListener('click', () => {
      sec.querySelectorAll('.v114-zone').forEach(x => x.classList.toggle('is-active', x === btn));
      selection = {place:btn.dataset.place, size:btn.dataset.size};
      current.textContent = selection.place.toUpperCase();
      tip.textContent = btn.dataset.tip;
      size.textContent = selection.size;
      use.disabled = false;
      document.dispatchEvent(new CustomEvent('orlica:place', {detail:selection}));
    }));

    use.addEventListener('click', () => {
      if (!selection) return;
      const placeInput = document.querySelector('#book [name="place"]');
      const sizeInput = document.querySelector('#book [name="size"]');
      if (placeInput) { placeInput.value = selection.place; placeInput.dispatchEvent(new Event('input',{bubbles:true})); }
      if (sizeInput) { sizeInput.value = selection.size; sizeInput.dispatchEvent(new Event('input',{bubbles:true})); }
      book.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth', block:'start'});
      setTimeout(() => placeInput?.focus({preventScroll:true}), 550);
    });
  }

  function mountTelegramBuilder(){
    const book = document.querySelector('#book');
    if (!book || document.querySelector('#telegram-brief')) return;
    const sec = document.createElement('section');
    sec.id = 'telegram-brief';
    sec.className = 'v114-telegram';
    sec.innerHTML = `<div><p class="v114-kicker">ORLICA / быстрый бриф</p><h2 class="v114-section-title">СОБЕРИ<br>СООБЩЕНИЕ.</h2><p class="v114-section-copy">Заполни пару пунктов — сайт соберёт нормальное сообщение Свете. Оно скопируется, а Telegram откроется сам.</p></div>
      <div class="v114-telegram-grid">
        <form class="v114-brief" onsubmit="return false">
          <label class="v114-field"><span>Место</span><select name="place"><option>Предплечье</option><option>Плечо</option><option>Грудь</option><option>Лопатка</option><option>Спина</option><option>Бедро</option><option>Голень</option><option>Икра</option><option>Другое</option></select></label>
          <label class="v114-field"><span>Размер</span><select name="size"><option>3–7 см</option><option selected>8–15 см</option><option>15–25 см</option><option>25+ см / большой проект</option><option>Не знаю — подскажите</option></select></label>
          <label class="v114-field"><span>Стиль</span><select name="style"><option>Графика</option><option>Нежнятина / fine line</option><option>Странные звери</option><option>Blackwork</option><option>Цвет</option><option>Своя идея</option></select></label>
          <label class="v114-field"><span>Цвет</span><select name="color"><option>Ч/Б</option><option>Цветная</option><option>Не определился(ась)</option></select></label>
          <label class="v114-field wide"><span>Бюджет</span><select name="budget"><option>Хочу сначала узнать стоимость</option><option>До 10 000 ₽</option><option>10 000–20 000 ₽</option><option>20 000 ₽+</option><option>Бюджет обсудим</option></select></label>
          <label class="v114-field wide"><span>Идея</span><textarea name="idea" maxlength="700" placeholder="Например: хочу странного зверя, немного крипового, но без жести…"></textarea></label>
        </form>
        <aside class="v114-preview"><div class="v114-preview-top"><span>Готовое сообщение</span><b>@${TG_USER}</b></div><div class="v114-message"></div><div class="v114-actions"><button class="cta v114-open-tg" type="button">Скопировать + Telegram</button><button class="cta v114-copy" type="button">Только скопировать</button></div><div class="v114-status" aria-live="polite"></div></aside>
      </div>`;
    book.before(sec);

    const form = sec.querySelector('.v114-brief');
    const preview = sec.querySelector('.v114-message');
    const status = sec.querySelector('.v114-status');
    const field = name => form.elements[name];
    const getMessage = () => {
      const idea = field('idea').value.trim();
      return `Привет, Света! Хочу записаться на тату.\n\nМесто: ${field('place').value}\nРазмер: ${field('size').value}\nСтиль: ${field('style').value}\nЦвет: ${field('color').value}\nБюджет: ${field('budget').value}\nИдея: ${idea || 'Пока хочу обсудить вместе с тобой.'}`;
    };
    const render = () => { preview.textContent = getMessage(); };
    form.addEventListener('input', render);
    form.addEventListener('change', render);
    render();

    document.addEventListener('orlica:place', e => {
      const {place,size} = e.detail || {};
      if (place && [...field('place').options].some(o => o.value === place)) field('place').value = place;
      if (size) {
        const options = [...field('size').options];
        const target = options.find(o => o.value.includes('8–15')) || options[0];
        const nums = String(size).match(/\d+/g)?.map(Number) || [];
        if (nums[0] >= 25) field('size').value = '25+ см / большой проект';
        else if (nums[0] >= 15) field('size').value = '15–25 см';
        else if (nums[0] <= 7) field('size').value = '3–7 см';
        else field('size').value = target.value;
      }
      render();
    });

    async function copyMessage(){
      const text = getMessage();
      try { await navigator.clipboard.writeText(text); status.textContent = 'Сообщение скопировано.'; return true; }
      catch (_) {
        const ta = document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy'); ta.remove(); status.textContent = ok ? 'Сообщение скопировано.' : 'Не удалось скопировать — выдели текст выше.'; return ok;
      }
    }
    sec.querySelector('.v114-copy').addEventListener('click', copyMessage);
    sec.querySelector('.v114-open-tg').addEventListener('click', async () => {
      await copyMessage();
      const text = encodeURIComponent(getMessage());
      const win = window.open(`${TG_URL}?text=${text}`, '_blank', 'noopener');
      if (!win) location.href = TG_URL;
    });
  }

  ready(() => {
    mountPortfolioFilters();
    mountBodyMap();
    mountTelegramBuilder();
  });
})();
'''

html = re.sub(r'orlica-v11\.css\?v=[^"\']+', 'orlica-v11.css?v=1140', html)
html = re.sub(r'orlica-v11\.js\?v=[^"\']+', 'orlica-v11.js?v=1140', html)

index.write_text(html, encoding='utf-8')
css.write_text(style, encoding='utf-8')
js.write_text(script, encoding='utf-8')
print('ORLICA V11.4 applied')
