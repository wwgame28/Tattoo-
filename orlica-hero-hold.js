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
      portrait.style.setProperty('--ink-line-opacity', current > .015 && current < .985 ? '.9' : '0');
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
