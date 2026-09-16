from pathlib import Path
import re

p=Path('index.html')
text=p.read_text(encoding='utf-8')

text=text.replace('<link rel="stylesheet" href="./director-v5.css">','')
text=text.replace('<script src="./director-v5.js"></script>','')

patterns=[
    r'<script>\s*/\* Motion \(motiondivision/motion\) \+ Lenis \(darkroomengineering/lenis\)\..*?</script>',
    r'<script>\s*\(\(\)=>\{\s*const reduced=matchMedia\(\'\(prefers-reduced-motion: reduce\)\'\)\.matches;\s*// Reveal system: deliberately lightweight, no scroll-jank\..*?</script>',
    r'<script id="scroll-entrances">.*?</script>',
]

removed=0
for pattern in patterns:
    text,n=re.subn(pattern,'',text,count=1,flags=re.S)
    removed+=n
    print('removed',n,pattern[:55])

if '</head>' not in text or '</body>' not in text:
    raise SystemExit('index.html does not contain closing head/body tags')

text=text.replace('</head>','<link rel="stylesheet" href="./director-v5.css">\n</head>',1)
text=text.replace('</body>','<script src="./director-v5.js"></script>\n</body>',1)

p.write_text(text,encoding='utf-8')
print('patched',p,'bytes',p.stat().st_size,'legacy blocks removed',removed)
