from pathlib import Path

css_path = Path('orlica-v11.css')
index_path = Path('index.html')

marker = '/* ORLICA V11.2 — smaller hero photo + soft gaussian glow */'
css = css_path.read_text(encoding='utf-8')

patch = r'''

/* ORLICA V11.2 — smaller hero photo + soft gaussian glow */
html.orlica-v11 .hero-visual{
  position:relative!important;
  isolation:isolate!important;
  width:min(100%,500px)!important;
  margin-left:auto!important;
  margin-right:auto!important;
  overflow:visible!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
  filter:none!important;
}

/* remove every old geometric frame around the portrait */
html.orlica-v11 .hero-visual::before{
  display:none!important;
  content:none!important;
}

/* blurred glow only — no visible border */
html.orlica-v11 .hero-visual::after{
  display:block!important;
  content:""!important;
  position:absolute!important;
  inset:5% 4% 4%!important;
  z-index:-1!important;
  pointer-events:none!important;
  border:0!important;
  border-radius:34px!important;
  background:
    radial-gradient(ellipse at 50% 34%,rgba(227,35,61,.42) 0%,rgba(181,12,38,.30) 34%,rgba(108,0,22,.18) 56%,rgba(45,0,10,.08) 70%,transparent 82%)!important;
  filter:blur(30px)!important;
  -webkit-filter:blur(30px)!important;
  transform:scale(1.055)!important;
  opacity:.92!important;
}

html.orlica-v11 #ink-portrait,
html.orlica-v11 .ink-portrait{
  width:100%!important;
  max-width:100%!important;
  margin:0 auto!important;
  border:0!important;
  outline:0!important;
  box-shadow:0 24px 68px rgba(0,0,0,.34)!important;
  background:transparent!important;
  overflow:hidden!important;
}

html.orlica-v11 .hero-visual figcaption{
  margin-top:18px!important;
  padding-top:0!important;
  border-top:0!important;
}

@media(max-width:760px){
  html.orlica-v11 .hero-visual{
    width:min(80vw,330px)!important;
    margin-top:8px!important;
    margin-bottom:22px!important;
  }
  html.orlica-v11 .hero-visual::after{
    inset:6% 2% 3%!important;
    border-radius:30px!important;
    filter:blur(24px)!important;
    -webkit-filter:blur(24px)!important;
    transform:scale(1.06)!important;
  }
  html.orlica-v11 #ink-portrait,
  html.orlica-v11 .ink-portrait{
    border-radius:24px!important;
    box-shadow:0 18px 46px rgba(0,0,0,.30)!important;
  }
}

@media(max-width:430px){
  html.orlica-v11 .hero-visual{
    width:min(78vw,312px)!important;
  }
}
'''

if marker not in css:
    css_path.write_text(css + patch, encoding='utf-8')

s = index_path.read_text(encoding='utf-8')
for old in ('orlica-v11.css?v=1110','orlica-v11.css?v=1101','orlica-v11.css?v=1100'):
    s = s.replace(old, 'orlica-v11.css?v=1120')
index_path.write_text(s, encoding='utf-8')
