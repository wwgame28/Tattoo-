/* Danil Director V5 — consolidated UI runtime */
(()=>{
  const body=document.body;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const noMotion=()=>reduce.matches||body.classList.contains('motion-off');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const header=document.querySelector('header');
  const mobileBook=document.querySelector('.mobile-book');
  const hero=document.querySelector('.hero');
  const booking=document.querySelector('.booking');
  const motionButton=document.getElementById('motion');

  let frame=0;
  const navMap=new Map([...document.querySelectorAll('header nav a[href^="#"]')].map(a=>[a.getAttribute('href').slice(1),a]));
  function paint(){
    frame=0;
    header?.classList.toggle('director-scrolled',scrollY>18);
  }
  addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(paint)},{passive:true});
  paint();

  if('IntersectionObserver' in window&&navMap.size){
    const sectionObserver=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible)return;
      navMap.forEach(a=>{a.classList.remove('director-active');a.removeAttribute('aria-current')});
      const active=navMap.get(visible.target.id);
      if(active){active.classList.add('director-active');active.setAttribute('aria-current','location')}
    },{rootMargin:'-20% 0px -62% 0px',threshold:[0,.2,.55]});
    navMap.forEach((_,id)=>{const section=document.getElementById(id);if(section)sectionObserver.observe(section)});
  }

  const revealTargets=[...document.querySelectorAll('.manifesto-copy,.sectionhead,.placeholder-card,.about .portrait,.about>div:last-child,.step,.faq>h2,.smooth-faq-item,.booking h2,.booking-grid>div,#brief')];
  revealTargets.forEach((el,i)=>{
    el.classList.add('director-reveal');
    el.dataset.directorDelay=String(i%4);
  });
  const show=el=>el.classList.add('director-in');
  function syncReveal(){
    if(noMotion()){revealTargets.forEach(show);return}
    if(!('IntersectionObserver' in window)){revealTargets.forEach(show);return}
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){show(entry.target);io.unobserve(entry.target)}
    }),{threshold:.08,rootMargin:'0px 0px -6% 0px'});
    revealTargets.forEach(el=>{
      if(el.getBoundingClientRect().top<innerHeight*.92)show(el); else io.observe(el);
    });
  }
  syncReveal();

  if(mobileBook&&hero&&booking&&'IntersectionObserver' in window){
    let heroGone=false,bookingSeen=false;
    const sync=()=>mobileBook.classList.toggle('is-visible',heroGone&&!bookingSeen&&innerWidth<=760);
    new IntersectionObserver(([e])=>{heroGone=!e.isIntersecting;sync()},{threshold:.03}).observe(hero);
    new IntersectionObserver(([e])=>{bookingSeen=e.isIntersecting;sync()},{threshold:.08}).observe(booking);
    addEventListener('resize',sync,{passive:true});
  }

  if(fine.matches&&!noMotion()){
    document.querySelectorAll('.empty-work-square').forEach(square=>{
      square.addEventListener('pointermove',e=>{
        const r=square.getBoundingClientRect();
        square.style.setProperty('--px',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
        square.style.setProperty('--py',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
      },{passive:true});
    });
  }

  const viewer=document.getElementById('viewer');
  const close=document.getElementById('close');
  let opener=null;
  document.querySelectorAll('.card button').forEach(btn=>btn.addEventListener('click',()=>{opener=btn;queueMicrotask(()=>close?.focus())}));
  viewer?.addEventListener('close',()=>{opener?.focus();opener=null});

  const settle=()=>{if(noMotion())revealTargets.forEach(show)};
  reduce.addEventListener('change',settle);
  motionButton?.addEventListener('click',()=>queueMicrotask(settle));
})();
