from pathlib import Path

css_patch = r'''

/* ORLICA V11.1 — mobile readability + soft spotlight reveal */
:root{
  --v111-text:#f6efeb;
  --v111-muted:#c8b5af;
  --v111-dim:#a7938e;
  --v111-faint:#897773;
}

#ink-portrait.ink-portrait{
  --ink-x:50%;
  --ink-y:50%;
  --ink-radius:0px;
}
#ink-portrait .ink-layer{
  clip-path:none!important;
  -webkit-clip-path:none!important;
  opacity:1!important;
  -webkit-mask-image:radial-gradient(circle var(--ink-radius) at var(--ink-x) var(--ink-y),#000 0%,#000 52%,rgba(0,0,0,.96) 61%,rgba(0,0,0,.78) 70%,rgba(0,0,0,.44) 80%,rgba(0,0,0,.16) 89%,transparent 100%)!important;
  mask-image:radial-gradient(circle var(--ink-radius) at var(--ink-x) var(--ink-y),#000 0%,#000 52%,rgba(0,0,0,.96) 61%,rgba(0,0,0,.78) 70%,rgba(0,0,0,.44) 80%,rgba(0,0,0,.16) 89%,transparent 100%)!important;
  -webkit-mask-repeat:no-repeat!important;
  mask-repeat:no-repeat!important;
  will-change:mask-image,-webkit-mask-image;
}
#ink-portrait.is-spotlight .ink-layer{opacity:1!important}

html.orlica-v11 .hero-note,
html.orlica-v11 .manifesto p,
html.orlica-v11 .manifesto-note,
html.orlica-v11 .about p,
html.orlica-v11 .process p,
html.orlica-v11 .faq p,
html.orlica-v11 .booking-live-head p,
html.orlica-v11 .availability-status,
html.orlica-v11 .v101-board-head p,
html.orlica-v11 .v101-notice p,
html.orlica-v11 .orlica-waitlist-head p,
html.orlica-v11 .waitlist-message,
html.orlica-v11 .booking-empty,
html.orlica-v11 .booking-success p{color:var(--v111-muted)!important}

html.orlica-v11 .manifesto-index,
html.orlica-v11 .manifesto-kicker,
html.orlica-v11 .piece-tag,
html.orlica-v11 .sectionhead p,
html.orlica-v11 .booking-calendar-top span,
html.orlica-v11 .booking-form label,
html.orlica-v11 .waitlist-form label{color:var(--v111-dim)!important}

html.orlica-v11 .v101-studio-section,
html.orlica-v11 .v101-studio-light{color:var(--v111-text)!important}
html.orlica-v11 .v101-studio-light p,
html.orlica-v11 .v101-studio-light small,
html.orlica-v11 .v101-studio-light .muted,
html.orlica-v11 .v101-studio-light [class*="sub"],
html.orlica-v11 .v101-studio-light [class*="note"]{color:#bca9a4!important;opacity:1!important}
html.orlica-v11 .v101-studio-light a{color:#f2e8e4!important}

html.orlica-v11 .v101-calendar-title{color:#fff3ee!important}
html.orlica-v11 .v101-weekdays span{color:#a8928e!important}
html.orlica-v11 .v101-day{border-color:rgba(255,255,255,.09)!important;color:#a8928e!important}
html.orlica-v11 .v101-day .num{color:#ad9895!important;opacity:1!important}
html.orlica-v11 .v101-day .mini{color:#8f7d79!important;opacity:1!important}
html.orlica-v11 .v101-day.past{opacity:.62!important}
html.orlica-v11 .v101-day.past .num{color:#927f7c!important}
html.orlica-v11 .v101-day.past .mini{color:#766664!important}
html.orlica-v11 .v101-day.busy{opacity:.86!important;background:rgba(255,255,255,.018)!important}
html.orlica-v11 .v101-day.busy .num{color:#b19698!important;text-decoration-color:#d13d50!important}
html.orlica-v11 .v101-day.busy .mini{color:#9c7e82!important}
html.orlica-v11 .v101-day.busy::after{background:rgba(211,55,78,.72)!important;height:1.5px!important}
html.orlica-v11 .v101-day.open{opacity:1!important;color:#ecfff3!important;border-color:rgba(98,213,138,.58)!important;background:rgba(98,213,138,.13)!important;box-shadow:inset 0 0 0 1px rgba(98,213,138,.08),0 0 22px rgba(98,213,138,.06)!important}
html.orlica-v11 .v101-day.open .num{color:#72e49a!important}
html.orlica-v11 .v101-day.open .mini{color:#a8eec0!important}
html.orlica-v11 .v101-calendar-legend{color:#b09b96!important}

html.orlica-v11 .booking-selected span{color:#af9b96!important}
html.orlica-v11 .booking-selected strong{color:#fff1ec!important}
html.orlica-v11 .booking-form input,
html.orlica-v11 .booking-form textarea,
html.orlica-v11 .waitlist-form input,
html.orlica-v11 .waitlist-form textarea{color:#f5ece8!important}
html.orlica-v11 .booking-form input::placeholder,
html.orlica-v11 .booking-form textarea::placeholder,
html.orlica-v11 .waitlist-form input::placeholder,
html.orlica-v11 .waitlist-form textarea::placeholder{color:#9d8883!important;opacity:.88!important}
html.orlica-v11 .booking-legal{color:#a08c87!important}

@media(max-width:800px){
  html.orlica-v11 .hero-note{color:#d8c6c0!important}
  html.orlica-v11 .v101-day{min-height:52px!important}
  html.orlica-v11 .v101-day .num{font-size:20px!important}
  html.orlica-v11 .v101-day .mini{font-size:6.5px!important}
}
'''

js_patch = r'''

/* ORLICA V11.1 — soft touch spotlight reveal */
(() => {
  function initSoftSpotlight(){
    const portrait=document.getElementById('ink-portrait');
    if(!portrait || portrait.dataset.v111Spotlight==='1') return;
    portrait.dataset.v111Spotlight='1';
    let active=false,pointerId=null,radius=0,target=0,raf=0;
    const radiusTarget=()=>Math.min(200,Math.max(155,portrait.clientWidth*.29));
    const setPoint=e=>{
      const r=portrait.getBoundingClientRect();
      const x=Math.max(0,Math.min(r.width,e.clientX-r.left));
      const y=Math.max(0,Math.min(r.height,e.clientY-r.top));
      portrait.style.setProperty('--ink-x',`${x.toFixed(1)}px`);
      portrait.style.setProperty('--ink-y',`${y.toFixed(1)}px`);
    };
    const animate=()=>{
      radius+=(target-radius)*.18;
      if(Math.abs(target-radius)<.35)radius=target;
      portrait.style.setProperty('--ink-radius',`${radius.toFixed(1)}px`);
      if(radius!==target)raf=requestAnimationFrame(animate);else raf=0;
    };
    const moveTarget=v=>{target=v;if(!raf)raf=requestAnimationFrame(animate)};
    const down=e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;
      active=true;pointerId=e.pointerId;setPoint(e);
      portrait.classList.add('is-spotlight');moveTarget(radiusTarget());
    };
    const move=e=>{if(active&&(pointerId===null||e.pointerId===pointerId))setPoint(e)};
    const up=e=>{
      if(pointerId!==null&&e?.pointerId!=null&&e.pointerId!==pointerId)return;
      active=false;pointerId=null;moveTarget(0);
      setTimeout(()=>{if(!active&&target===0)portrait.classList.remove('is-spotlight')},300);
    };
    portrait.addEventListener('pointerdown',down,{passive:true});
    portrait.addEventListener('pointermove',move,{passive:true});
    portrait.addEventListener('pointerup',up,{passive:true});
    portrait.addEventListener('pointercancel',up,{passive:true});
    portrait.addEventListener('lostpointercapture',up,{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initSoftSpotlight,{once:true});else initSoftSpotlight();
  let n=0;const t=setInterval(()=>{initSoftSpotlight();if(document.querySelector('#ink-portrait[data-v111-spotlight="1"]')||++n>30)clearInterval(t)},180);
})();
'''

css=Path('orlica-v11.css')
js=Path('orlica-v11.js')
index=Path('index.html')

css_text=css.read_text(encoding='utf-8')
if 'ORLICA V11.1 — mobile readability' not in css_text:
    css.write_text(css_text + css_patch,encoding='utf-8')

js_text=js.read_text(encoding='utf-8')
if 'ORLICA V11.1 — soft touch spotlight' not in js_text:
    js.write_text(js_text + js_patch,encoding='utf-8')

s=index.read_text(encoding='utf-8')
import re
s=re.sub(r'orlica-v11\.css\?v=\d+','orlica-v11.css?v=1110',s)
s=re.sub(r'orlica-v11\.js\?v=\d+','orlica-v11.js?v=1110',s)
index.write_text(s,encoding='utf-8')
