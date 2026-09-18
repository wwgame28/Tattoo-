(() => {
  const CLEAN='assets/hero/sveta-clean.webp';
  const INK='assets/hero/sveta-ink.webp';
  function applyHero(){
    const portrait=document.getElementById('ink-portrait');
    if(!portrait||portrait.dataset.v10Hero==='1') return;
    const imgs=portrait.querySelectorAll('img');
    if(imgs.length<2) return;
    imgs[0].src=CLEAN;
    imgs[0].alt='Света — тату-мастер ORLICA';
    imgs[0].width=720; imgs[0].height=980;
    imgs[1].src=INK;
    imgs[1].alt=''; imgs[1].setAttribute('aria-hidden','true');
    imgs[1].width=720; imgs[1].height=978;
    portrait.dataset.v10Hero='1';
    portrait.setAttribute('aria-label','Удерживай фото — татуировка проявится сверху вниз');
  }
  function polish(){
    document.documentElement.classList.add('orlica-v10');
    const hero=document.querySelector('.hero');
    const visual=hero?.querySelector('.hero-visual');
    if(visual&&!visual.querySelector('.v10-hold-note')){
      const note=document.createElement('div');
      note.className='v10-hold-note';
      note.innerHTML='<span></span> удерживай фото';
      visual.append(note);
    }
    const cta=hero?.querySelector('.cta');
    if(cta) cta.textContent='Записаться на сеанс';
  }
  const boot=()=>{applyHero();polish();};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
  let tries=0; const timer=setInterval(()=>{boot();if(document.querySelector('#ink-portrait[data-v10-hero="1"]')||++tries>40)clearInterval(timer)},150);
})();
