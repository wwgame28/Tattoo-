from pathlib import Path
import re

root = Path('.')
index = root / 'index.html'
css = root / 'orlica-v11.css'

html = index.read_text(encoding='utf-8')
style = css.read_text(encoding='utf-8')

# Remove the hero micro-label "01 / СВЕТА" as an element when possible.
patterns = [
    r'<(?P<tag>[a-zA-Z0-9]+)(?P<attrs>[^>]*)>\s*01\s*/\s*СВЕТА\s*</(?P=tag)>',
    r'<(?P<tag>[a-zA-Z0-9]+)(?P<attrs>[^>]*)>\s*01\s*/\s*Света\s*</(?P=tag)>',
]
for pattern in patterns:
    html = re.sub(pattern, '', html, flags=re.IGNORECASE)
html = re.sub(r'01\s*/\s*СВЕТА', '', html, flags=re.IGNORECASE)

marker = '/* ORLICA V11.3 unified buttons */'
if marker in style:
    style = style.split(marker)[0].rstrip() + '\n\n'

style += r'''
/* ORLICA V11.3 unified buttons */
:root{
  --orlica-btn-h:58px;
  --orlica-btn-radius:18px;
  --orlica-btn-border:rgba(255,244,239,.62);
  --orlica-btn-border-hover:rgba(255,255,255,.92);
  --orlica-btn-bg:rgba(18,6,9,.28);
  --orlica-btn-bg-hover:rgba(196,24,50,.16);
  --orlica-btn-text:#f8f1ed;
  --orlica-btn-shadow:0 12px 30px rgba(0,0,0,.22);
}

/* Main CTA language: same outline, same radius, same interaction. */
:where(
  .cta,
  .navbook,
  .contact-big,
  .mobile-book,
  #brief .submit,
  #brief button[type="submit"],
  .booking button[type="submit"],
  .booking-form button[type="submit"],
  .waitlist-form button[type="submit"],
  .studio-map-link,
  .more-works-link,
  .telegram-more,
  .board-cta,
  .book-submit,
  .waitlist-submit
){
  min-height:var(--orlica-btn-h)!important;
  border:1.5px solid var(--orlica-btn-border)!important;
  border-radius:var(--orlica-btn-radius)!important;
  background:var(--orlica-btn-bg)!important;
  color:var(--orlica-btn-text)!important;
  box-shadow:var(--orlica-btn-shadow)!important;
  padding:0 24px!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:10px!important;
  font:inherit!important;
  font-weight:750!important;
  text-decoration:none!important;
  cursor:pointer!important;
  touch-action:manipulation!important;
  -webkit-tap-highlight-color:transparent!important;
  transition:background-color .22s ease,border-color .22s ease,transform .18s ease,box-shadow .22s ease!important;
}

:where(
  .cta,
  .navbook,
  .contact-big,
  .mobile-book,
  #brief .submit,
  #brief button[type="submit"],
  .booking button[type="submit"],
  .booking-form button[type="submit"],
  .waitlist-form button[type="submit"],
  .studio-map-link,
  .more-works-link,
  .telegram-more,
  .board-cta,
  .book-submit,
  .waitlist-submit
):hover{
  border-color:var(--orlica-btn-border-hover)!important;
  background:var(--orlica-btn-bg-hover)!important;
  transform:translateY(-2px)!important;
  box-shadow:0 16px 36px rgba(0,0,0,.3),0 0 24px rgba(184,19,42,.08)!important;
}

:where(
  .cta,
  .navbook,
  .contact-big,
  .mobile-book,
  #brief .submit,
  #brief button[type="submit"],
  .booking button[type="submit"],
  .booking-form button[type="submit"],
  .waitlist-form button[type="submit"],
  .studio-map-link,
  .more-works-link,
  .telegram-more,
  .board-cta,
  .book-submit,
  .waitlist-submit
):active{
  transform:translateY(0) scale(.985)!important;
  background:rgba(214,27,53,.2)!important;
}

/* Kill legacy decorative CTA geometry that made buttons look different. */
.hero-bottom .cta{
  transform:none!important;
  rotate:0deg!important;
}
.hero-bottom .cta::before,
.hero-bottom .cta::after{
  display:none!important;
  content:none!important;
}
.hero-bottom .cta b{
  width:auto!important;
  height:auto!important;
  border-radius:0!important;
  background:transparent!important;
  color:inherit!important;
  font-size:inherit!important;
}

/* Utility / calendar buttons keep compact sizing, but share the same outline language. */
:where(
  .calendar-nav,
  .month-nav,
  .slot-btn,
  .time-slot,
  .faq button,
  dialog button,
  #close
){
  border:1px solid rgba(255,244,239,.38)!important;
  background:rgba(15,7,9,.28)!important;
  color:#f7f0ed!important;
  cursor:pointer!important;
  touch-action:manipulation!important;
}

:where(.calendar-nav,.month-nav,.slot-btn,.time-slot,.faq button,dialog button,#close):hover{
  border-color:rgba(255,255,255,.76)!important;
  background:rgba(185,22,45,.12)!important;
}

@media(max-width:760px){
  :root{--orlica-btn-h:54px;--orlica-btn-radius:16px}
  :where(
    .cta,
    .contact-big,
    .mobile-book,
    #brief .submit,
    #brief button[type="submit"],
    .booking button[type="submit"],
    .booking-form button[type="submit"],
    .waitlist-form button[type="submit"],
    .studio-map-link,
    .more-works-link,
    .telegram-more,
    .board-cta,
    .book-submit,
    .waitlist-submit
  ){
    width:100%!important;
    max-width:none!important;
    padding-inline:18px!important;
  }
  .navbook{min-height:44px!important;padding-inline:16px!important;border-radius:14px!important}
}
'''

# bump CSS cache key if present
html = re.sub(r'orlica-v11\.css\?v=[^"\']+', 'orlica-v11.css?v=1130', html)

index.write_text(html, encoding='utf-8')
css.write_text(style, encoding='utf-8')
print('V11.3 applied')
