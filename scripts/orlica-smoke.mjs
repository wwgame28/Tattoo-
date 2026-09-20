import { webkit } from 'playwright';

const BASE = 'https://wwgame28.github.io/Tattoo-/';
const QA_PHONE = '+19995550199';
const QA_NAME = 'ORLICA QA';
const results = [];
const pageErrors = [];

function ok(name, detail='') { results.push({name, ok:true, detail}); console.log(`PASS  ${name}${detail ? ' — '+detail : ''}`); }
function fail(name, detail='') { results.push({name, ok:false, detail}); console.error(`FAIL  ${name}${detail ? ' — '+detail : ''}`); }
async function check(name, fn) {
  try { const detail = await fn(); ok(name, detail || ''); return true; }
  catch (e) { fail(name, e?.message || String(e)); return false; }
}

const browser = await webkit.launch({headless:true});
const context = await browser.newContext({
  viewport: {width: 390, height: 844},
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1 ORLICA-QA'
});
const page = await context.newPage();
page.on('pageerror', e => pageErrors.push(String(e)));
page.on('console', msg => { if (msg.type()==='error') console.log('BROWSER console.error:', msg.text()); });

await check('Сайт открывается', async()=>{
  const r = await page.goto(BASE, {waitUntil:'domcontentloaded', timeout:60000});
  if (!r || !r.ok()) throw new Error(`HTTP ${r?.status()}`);
  await page.waitForTimeout(2500);
  return `HTTP ${r.status()}`;
});

await check('Нет необработанных JS-ошибок при загрузке', async()=>{
  if (pageErrors.length) throw new Error(pageErrors.join(' | '));
});

await check('Внутренние ссылки ведут на существующие секции', async()=>{
  const bad = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')]
    .map(a=>a.getAttribute('href')).filter(h=>h && h!=='#' && !document.querySelector(h)));
  if (bad.length) throw new Error(`Нет целей: ${[...new Set(bad)].join(', ')}`);
  return 'все hash-якоря валидны';
});

await check('Hero hold/reveal инициализирован', async()=>{
  const p = page.locator('#ink-portrait');
  if (await p.count() !== 1) throw new Error('#ink-portrait не найден');
  const ready = await p.getAttribute('data-hold-reveal-ready');
  const spot = await p.getAttribute('data-v111-spotlight');
  if (ready !== '1' || spot !== '1') throw new Error(`hold=${ready}, spotlight=${spot}`);
  return 'hold + spotlight active';
});

await check('Портфолио: 9 работ', async()=>{
  const count = await page.locator('#works .piece-button').count();
  if (count !== 9) throw new Error(`найдено ${count}`);
  return '9 карточек';
});

await check('Портфолио: открыть → следующая → предыдущая → закрыть', async()=>{
  await page.locator('#works .piece-button').first().click();
  const viewer = page.locator('.orlica-viewer');
  await viewer.waitFor({state:'visible', timeout:5000});
  if ((await viewer.getAttribute('aria-hidden')) !== 'false') throw new Error('viewer aria-hidden не переключился');
  const before = await viewer.locator('.orlica-viewer-index').textContent();
  await viewer.locator('.orlica-viewer-next').click();
  const after = await viewer.locator('.orlica-viewer-index').textContent();
  if (before === after) throw new Error('next не меняет работу');
  await viewer.locator('.orlica-viewer-prev').click();
  if ((await viewer.locator('.orlica-viewer-index').textContent()) !== before) throw new Error('prev не возвращает работу');
  await viewer.locator('.orlica-viewer-close').click();
  await page.waitForTimeout(350);
  if ((await viewer.getAttribute('aria-hidden')) !== 'true') throw new Error('close не закрыл viewer');
  return `${before} → ${after} → ${before}`;
});

await check('Telegram-ссылки имеют корректный адрес', async()=>{
  const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href*="t.me/"]')].map(a=>a.href));
  if (!hrefs.length) throw new Error('Telegram-ссылки не найдены');
  const bad = hrefs.filter(h=>!/^https:\/\/t\.me\/(orlica_tatt|Sveta_orel09)\/?/.test(h));
  if (bad.length) throw new Error(`неожиданные href: ${bad.join(', ')}`);
  return `${hrefs.length} ссылок`;
});

await check('Календарь загрузился', async()=>{
  await page.locator('#book').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  const cal = page.locator('.v101-calendar');
  if (await cal.count() !== 1) throw new Error('полный календарь не смонтирован');
  const days = await cal.locator('.v101-day').count();
  if (days < 28) throw new Error(`дней только ${days}`);
  return `${days} ячеек текущего месяца`;
});

await check('Календарь: навигация по месяцам', async()=>{
  const title = page.locator('.v101-calendar-title');
  const next = page.locator('.v101-calendar .next');
  if (await next.isDisabled()) throw new Error('next неожиданно disabled');
  const before = (await title.textContent())?.trim();
  await next.click();
  const after = (await title.textContent())?.trim();
  if (!after || after===before) throw new Error('месяц не изменился');
  const prev = page.locator('.v101-calendar .prev');
  await prev.click();
  const back = (await title.textContent())?.trim();
  if (back!==before) throw new Error(`prev вернул ${back}, ожидался ${before}`);
  return `${before} ↔ ${after}`;
});

await check('Запись: при отсутствии свободного времени submit безопасно заблокирован', async()=>{
  const openButtons = await page.locator('#booking-times button:not([disabled])').count();
  const submit = page.locator('#booking-submit');
  if (openButtons===0 && !(await submit.isDisabled())) throw new Error('submit активен без выбранного слота');
  return openButtons ? `${openButtons} доступных кнопок времени` : 'свободных слотов нет, submit disabled';
});

await check('Лист ожидания: открыть/закрыть', async()=>{
  const toggle = page.locator('.waitlist-toggle');
  if (await toggle.count() !== 1) throw new Error('кнопка листа ожидания не найдена');
  await toggle.click();
  const panel = page.locator('.waitlist-panel');
  if (!(await panel.evaluate(el=>el.classList.contains('show')))) throw new Error('форма не открылась');
  await toggle.click();
  if (await panel.evaluate(el=>el.classList.contains('show'))) throw new Error('форма не закрылась');
});

await check('Старый V11.4 «Куда набить?» отсутствует', async()=>{
  const text = (await page.locator('body').innerText()).toUpperCase();
  const forbidden = ['КУДА НАБИТЬ?', 'ВЫБЕРИ МЕСТО', 'БЫСТРЫЙ БРИФ'];
  const found = forbidden.filter(x=>text.includes(x));
  if (found.length) throw new Error(found.join(', '));
});

await check('AI-конструктор смонтирован', async()=>{
  await page.locator('#ai-sketch').scrollIntoViewIfNeeded();
  if (await page.locator('#ai-login').count() !== 1) throw new Error('AI login не найден');
  return 'секция и кнопка входа есть';
});

await check('AI-вход по имени и номеру', async()=>{
  await page.locator('#ai-name').fill(QA_NAME);
  await page.locator('#ai-phone').fill(QA_PHONE);
  await page.locator('#ai-login').click();
  await page.locator('#ai-builder').waitFor({state:'visible', timeout:20000});
  const hello = await page.locator('#ai-hello').textContent();
  if (!hello?.includes(QA_NAME)) throw new Error(`hello=${hello}`);
  return hello.trim();
});

await check('AI: все 8 пользовательских полей доступны', async()=>{
  const ids=['ai-style-custom','ai-character-custom','ai-inspiration','ai-elements-custom','ai-mood-custom','ai-color-custom','ai-bodyPart-custom','ai-size-custom'];
  for (const id of ids) if (await page.locator('#'+id).count()!==1) throw new Error(`${id} отсутствует`);
  return '8/8';
});

await check('AI: chip и «свой вариант» корректно переключаются', async()=>{
  const chip = page.locator('.ai-chips[data-group="style"] .ai-chip').first();
  await chip.click();
  if (!(await chip.evaluate(el=>el.classList.contains('is-active')))) throw new Error('style chip не активировался');
  const custom = page.locator('#ai-style-custom');
  await custom.fill('Neo-noir engraving');
  if (await chip.evaluate(el=>el.classList.contains('is-active'))) throw new Error('custom не снял активный chip');
  await page.locator('#ai-character-custom').fill('Оригинальная ведьма');
  await page.locator('#ai-inspiration').fill('dark urban animation');
  await page.locator('#ai-elements-custom').fill('ворон, дым');
  await page.locator('#ai-mood-custom').fill('холодное и тревожное');
  await page.locator('#ai-color-custom').fill('чёрный с бордовым акцентом');
  await page.locator('#ai-bodyPart-custom').fill('внешняя сторона предплечья');
  await page.locator('#ai-size-custom').fill('15 см вертикально');
  return 'override работает';
});

let aiGenerated = false;
await check('AI: генерация возвращает 3 реально загружаемых изображения', async()=>{
  await page.locator('#ai-generate').click();
  const deadline = Date.now()+210000;
  while(Date.now()<deadline){
    const err = page.locator('#ai-gen-error.is-visible');
    if (await err.count()) throw new Error((await err.textContent())?.trim() || 'AI error');
    const cards=page.locator('#ai-cards .ai-card');
    if (await cards.count()===3){
      const states=await cards.evaluateAll(cs=>cs.map(c=>({loading:c.classList.contains('is-loading'),error:c.classList.contains('is-error'),w:c.querySelector('img')?.naturalWidth||0})));
      if(states.every(s=>!s.loading && !s.error && s.w>0)) { aiGenerated=true; return states.map(s=>s.w).join('/'); }
      if(states.some(s=>s.error)) throw new Error(JSON.stringify(states));
    }
    await page.waitForTimeout(2000);
  }
  throw new Error('таймаут 210 секунд');
});

if (aiGenerated) {
  await check('AI: кнопка «Выбрать» отмечает вариант', async()=>{
    const first = page.locator('#ai-cards .ai-card').first();
    const btn = first.locator('button');
    if (await btn.isDisabled()) throw new Error('Выбрать disabled после загрузки');
    await btn.click();
    if (!(await first.evaluate(el=>el.classList.contains('ai-selected')))) throw new Error('карточка не получила selected');
    return (await first.locator('.ai-card-meta span').textContent())?.trim();
  });
}

await check('AI: кнопка смены аккаунта работает', async()=>{
  await page.locator('#ai-logout').click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1200);
  if (await page.locator('#ai-authbox').count()!==1) throw new Error('authbox отсутствует после logout');
  if (await page.locator('#ai-builder').isVisible()) throw new Error('builder остался видимым');
});

await page.screenshot({path:'orlica-smoke-mobile.png', fullPage:true});
await context.close();
await browser.close();

const failed=results.filter(x=>!x.ok);
console.log('\n=== ORLICA QA SUMMARY ===');
for (const r of results) console.log(`${r.ok?'PASS':'FAIL'} | ${r.name} | ${r.detail||''}`);
if (failed.length) {
  console.error(`\n${failed.length} checks failed`);
  process.exit(1);
}
console.log(`\nAll ${results.length} checks passed`);
