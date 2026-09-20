from pathlib import Path
import re

changed=[]
for p in [Path('index.html'), *Path('.').glob('*.js')]:
    if not p.exists() or not p.is_file():
        continue
    text=p.read_text(encoding='utf-8')
    updated,n=re.subn(r'sveta_orlica', 'Sveta_orel09', text, flags=re.I)
    if n:
        p.write_text(updated,encoding='utf-8')
        changed.append((str(p),n))

print('changed:', changed)
