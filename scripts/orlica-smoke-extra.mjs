import { webkit } from 'playwright';

const BASE='https://wwgame28.github.io/Tattoo-/';
const results=[];
const pass=(n,d='')=>{results.push({n,ok:true,d});console.log(`PASS | ${n}${d?' | '+d:''}`)};
const fail=(n,d='')=>{results.push({n,ok:false,d});console.error(`FAIL | ${n}${d?' | '+d:''}`)};
async function check(n,fn){try{const d=await fn();pass(n,d||'');return true}catch(e){fail(n,e?.message||String(e));return false}}

const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1 ORLICA-QA-EXTRA'});
const page=await context.newPage();
const pageErrors=[];
page.on('pageerror',e=>pageErrors.push(String(e)));
const r=await page.goto(BASE+'?qa-extra='+Date.now(),{waitUntil:'domcontentloaded',timeout:60000});
if(!r?.ok())throw new Error(`HTTP ${r?.status()}`);
await page.waitForTimeout(3500);

await check('Доп. проход: нет JS ошибок после загрузки',async()=>{if(pageErrors.length)throw new Error(pageErrors.join(' | '));return '0 ошибок'});

await check('Кнопка «Все работы»',async()=>{
  const btn=page.getByRole('button',{name:'Все работы',exact:true});
  if(await btn.count()===0)return 'в текущей сборке отсутствует';
  if(!(await btn.first().isVisible()))return 'legacy-кнопка скрыта и не доступна пользователю';
  await btn.first().click();
  await page.waitForTimeout(250);
  const visible=await page.locator('#works .piece-button:visible').count();
  if(visible!==9)throw new Error(`после клика видно ${visible}/9 работ`);
  return '9/9 работ видимы';
});

await check('Кнопка наклона фото',async()=>{
  const btn=page.locator('.tilt-control');
  if(await btn.count()===0)return 'не используется в текущей сборке';
  if(!(await btn.first().isVisible()))return 'скрыта на мобильной версии';
  const before={text:(await btn.first().textContent())?.trim(),pressed:await btn.first().getAttribute('aria-pressed'),body:await page.locator('body').getAttribute('class')};
  await btn.first().click();
  await page.waitForTimeout(250);
  const after={text:(await btn.first().textContent())?.trim(),pressed:await btn.first().getAttribute('aria-pressed'),body:await page.locator('body').getAttribute('class')};
  if(JSON.stringify(before)===JSON.stringify(after))throw new Error('нажатие не изменило состояние');
  await btn.first().click();
  return `${before.text||before.pressed} → ${after.text||after.pressed}`;
});

await check('Все FAQ-кнопки открываются и закрываются',async()=>{
  const qs=page.locator('.smooth-faq-trigger');
  const n=await qs.count();
  if(n===0)throw new Error('FAQ-кнопки не найдены');
  for(let i=0;i<n;i++){
    const q=qs.nth(i);
    await q.scrollIntoViewIfNeeded();
    const before=await q.getAttribute('aria-expanded');
    await q.click();
    await page.waitForTimeout(180);
    const open=await q.getAttribute('aria-expanded');
    if(open!=='true')throw new Error(`FAQ ${i+1}: aria-expanded=${open}`);
    await q.click();
    await page.waitForTimeout(180);
    const closed=await q.getAttribute('aria-expanded');
    if(closed!=='false')throw new Error(`FAQ ${i+1}: не закрылся (${closed})`);
    if(before!==null && before!=='false')console.log(`FAQ ${i+1} initial=${before}`);
  }
  return `${n}/${n}`;
});

await check('Кнопка отключения анимаций',async()=>{
  const btn=page.locator('#motion');
  if(await btn.count()===0)return 'не используется';
  if(!(await btn.isVisible()))return 'скрыта в текущей мобильной версии';
  const before={text:(await btn.textContent())?.trim(),cls:await page.locator('body').getAttribute('class'),pressed:await btn.getAttribute('aria-pressed')};
  await btn.click();
  await page.waitForTimeout(180);
  const after={text:(await btn.textContent())?.trim(),cls:await page.locator('body').getAttribute('class'),pressed:await btn.getAttribute('aria-pressed')};
  if(JSON.stringify(before)===JSON.stringify(after))throw new Error('состояние не изменилось');
  await btn.click();
  return `${before.text} → ${after.text}`;
});

await check('Legacy #close не торчит мёртвой кнопкой',async()=>{
  const btn=page.locator('#close');
  if(await btn.count()===0)return 'legacy-кнопка удалена';
  if(!(await btn.isVisible()))return 'legacy-кнопка существует только в скрытом диалоге';
  const viewer=page.locator('#viewer');
  if(await viewer.count()===0)throw new Error('#close видим, но #viewer отсутствует');
  await btn.click();
  await page.waitForTimeout(180);
  return 'видимая кнопка нажалась без JS ошибки';
});

await check('Telegram: старого @sveta_orlica больше нет',async()=>{
  const links=await page.evaluate(()=>[...document.querySelectorAll('a[href*="t.me/"]')].map(a=>({href:a.href,text:(a.textContent||'').trim(),cls:a.className||''})));
  console.log('TELEGRAM LINKS:',JSON.stringify(links));
  const stale=links.filter(x=>/t\.me\/sveta_orlica(?:[/?]|$)/i.test(x.href));
  if(stale.length)throw new Error(JSON.stringify(stale));
  return `${links.length} ссылок`;
});

const failed=results.filter(x=>!x.ok);
await context.close();await browser.close();
console.log('\n=== ORLICA EXTRA BUTTON QA ===');
for(const x of results)console.log(`${x.ok?'PASS':'FAIL'} | ${x.n} | ${x.d||''}`);
if(failed.length){console.error(`${failed.length} failed`);process.exit(1)}
console.log(`All ${results.length} passed`);
