from pathlib import Path

p = Path('index.html')
html = p.read_text(encoding='utf-8')

css = '<link rel="stylesheet" href="orlica-v114.css?v=1140">'
js = '<script src="orlica-v114.js?v=1140" defer></script>'

if 'orlica-v114.css' not in html:
    if '</head>' not in html:
        raise SystemExit('Missing </head>')
    html = html.replace('</head>', f'  {css}\n</head>', 1)

if 'orlica-v114.js' not in html:
    if '</body>' not in html:
        raise SystemExit('Missing </body>')
    html = html.replace('</body>', f'  {js}\n</body>', 1)

p.write_text(html, encoding='utf-8')
print('ORLICA V11.4 wired')
