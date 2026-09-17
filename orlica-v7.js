(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('header');
  const placeholders = document.querySelectorAll('.placeholder-card');
  const steps = [...document.querySelectorAll('.step')];
  const onScroll = () => header?.classList.toggle('is-scrolled', scrollY > 18);
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  if (!reduce.matches && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    placeholders.forEach(card => {
      const square = card.querySelector('.empty-work-square');
      if (!square) return;
      card.addEventListener('pointermove', e => {
        const r = square.getBoundingClientRect();
        square.style.setProperty('--mx', `${e.clientX-r.left}px`);
        square.style.setProperty('--my', `${e.clientY-r.top}px`);
      }, {passive:true});
      card.addEventListener('pointerleave', () => {
        square.style.setProperty('--mx','50%'); square.style.setProperty('--my','50%');
      }, {passive:true});
    });
  }

  if ('IntersectionObserver' in window && steps.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('v7-active');
        else if (entry.boundingClientRect.top > 0) entry.target.classList.remove('v7-active');
      });
    }, {threshold:.55});
    steps.forEach(step => io.observe(step));
  }
})();
