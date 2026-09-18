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
