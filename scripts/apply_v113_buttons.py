from pathlib import Path
import re

css_path = Path('orlica-v11.css')
js_path = Path('orlica-v11.js')
index_path = Path('index.html')

css = css_path.read_text(encoding='utf-8')
marker = '/* ORLICA V11.3 — unified outlined controls */'
block = r'''

/* ORLICA V11.3 — unified outlined controls */
:root{
  --orlica-control-h:56px;
  --orlica-control-radius:18px;
  --orlica-control-border:rgba(248,240,235,.62);
  --orlica-control-border-hot:rgba(255,95,118,.92);
  --orlica-control-bg:rgba(22,5,9,.32);
  --orlica-control-bg-hover:rgba(198,20,50,.18);
  --orlica-control-text:#f8f0eb;
}

:is(
  .cta,
  .navbook,
  .mobile-book,
  .contact-big,
  .submit,
  .booking-submit,
  .waitlist-submit,
  .board-submit,
  .board-cta,
  .studio-cta,
  .telegram-cta,
  .more-works,
  .more-works a,
  .works-more a,
  button[type="submit"],
  input[type="submit"],
  #brief .submit,
  #brief button[type="submit"]
){
  min-height:var(--orlica-control-h)!important;
  padding:0 24px!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:10px!important;
  border:1.5px solid var(--orlica-control-border)!important;
  border-radius:var(--orlica-control-radius)!important;
  background:var(--orlica-control-bg)!important;
  color:var(--orlica-control-text)!important;
  font:inherit!important;
  font-weight:750!important;
  line-height:1.05!important;
  text-decoration:none!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 10px 28px rgba(0,0,0,.18)!important;
  cursor:pointer!important;
  touch-action:manipulation!important;
  -webkit-tap-highlight-color:transparent!important;
  transition:background .22s ease,border-color .22s ease,color .22s ease,transform .16s ease,box-shadow .22s ease!important;
}

:is(
  .cta,
  .navbook,
  .mobile-book,
  .contact-big,
  .submit,
  .booking-submit,
  .waitlist-submit,
  .board-submit,
  .board-cta,
  .studio-cta,
  .telegram-cta,
  .more-works,
  .more-works a,
  .works-more a,
  button[type="submit"],
  input[type="submit"],
  #brief .submit,
  #brief button[type="submit"]
):hover{
  border-color:var(--orlica-control-border-hot)!important;
  background:var(--orlica-control-bg-hover)!important;
  color:#fff!important;
  transform:translateY(-2px)!important;
  box-shadow:0 14px 34px rgba(0,0,0,.25),0 0 0 1px rgba(210,25,58,.12) inset!important;
}

:is(
  .cta,
  .navbook,
  .mobile-book,
  .contact-big,
  .submit,
  .booking-submit,
  .waitlist-submit,
  .board-submit,
  .board-cta,
  .studio-cta,
  .telegram-cta,
  .more-works,
  .more-works a,
  .works-more a,
  button[type="submit"],
  input[type="submit"],
  #brief .submit,
  #brief button[type="submit"]
):active{
  transform:scale(.985)!important;
  background:rgba(210,25,58,.24)!important;
}

:is(
  .cta,
  .navbook,
  .mobile-book,
  .contact-big,
  .submit,
  .booking-submit,
  .waitlist-submit,
  .board-submit,
  .board-cta,
  .studio-cta,
  .telegram-cta,
  .more-works,
  .more-works a,
  .works-more a,
  button[type="submit"],
  input[type="submit"],
  #brief .submit,
  #brief button[type="submit"]
):focus-visible{
  outline:2px solid #ff4d6d!important;
  outline-offset:4px!important;
}

/* Override old one-off hero/button treatments so CTAs really match. */
.hero-bottom .cta,
.hero-bottom .cta:hover,
.navbook,
.navbook:hover,
.mobile-book,
.mobile-book:hover{
  transform:none!important;
}
.hero-bottom .cta::before,
.hero-bottom .cta b{
  display:none!important;
}

@media(max-width:760px){
  :is(
    .cta,
    .navbook,
    .mobile-book,
    .contact-big,
    .submit,
    .booking-submit,
    .waitlist-submit,
    .board-submit,
    .board-cta,
    .studio-cta,
    .telegram-cta,
    .more-works,
    .more-works a,
    .works-more a,
    button[type="submit"],
    input[type="submit"],
    #brief .submit,
    #brief button[type="submit"]
  ){
    min-height:54px!important;
    padding-inline:20px!important;
    border-radius:16px!important;
  }
  .hero-bottom .cta,
  #brief .submit,
  .booking-submit,
  .waitlist-submit{
    width:100%!important;
  }
}
'''
if marker not in css:
    css += block
css_path.write_text(css, encoding='utf-8')

# Remove the hero sequence label at source level.
html = index_path.read_text(encoding='utf-8')
for text in ['01 / СВЕТА','01 / Света','01/СВЕТА','01/Света']:
    html = html.replace(text, '')
# Also remove a simple leaf wrapper if spacing/tags split it minimally.
html = re.sub(r'<([a-zA-Z0-9]+)([^>]*)>\s*01\s*/\s*СВЕТА\s*</\1>', '', html, flags=re.I)
# Force Safari/GitHub Pages to request the new bundle.
html = re.sub(r'orlica-v11\.css\?v=\d+', 'orlica-v11.css?v=1130', html)
html = re.sub(r'orlica-v11\.js\?v=\d+', 'orlica-v11.js?v=1130', html)
index_path.write_text(html, encoding='utf-8')

# Runtime fallback in case the label is split across spans in the original markup.
js = js_path.read_text(encoding='utf-8')
js_marker = '// ORLICA V11.3 — remove legacy hero sequence label'
js_block = r'''

// ORLICA V11.3 — remove legacy hero sequence label
(() => {
  const cleanHeroIndex = () => {
    const nodes = document.querySelectorAll('.hero *');
    nodes.forEach((el) => {
      const txt = (el.textContent || '').replace(/\s+/g,' ').trim().toUpperCase();
      if ((txt === '01 / СВЕТА' || txt === '01/СВЕТА') && el.childElementCount <= 2) {
        el.remove();
      }
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanHeroIndex, {once:true});
  } else {
    cleanHeroIndex();
  }
})();
'''
if js_marker not in js:
    js += js_block
js_path.write_text(js, encoding='utf-8')

print('V11.3 applied')
