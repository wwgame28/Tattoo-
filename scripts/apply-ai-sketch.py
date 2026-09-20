from pathlib import Path
import re

root = Path('.')
index = root / 'index.html'
css = root / 'orlica-v11.css'
js = root / 'orlica-v11.js'

html = index.read_text(encoding='utf-8')
style = css.read_text(encoding='utf-8') if css.exists() else ''
script = js.read_text(encoding='utf-8') if js.exists() else ''

# Remove obsolete V11.4 standalone assets and embedded conversion layer.
html = re.sub(r'\s*<link[^>]+href=["\'][^"\']*orlica-v114\.css(?:\?[^"\']*)?["\'][^>]*>\s*', '\n', html, flags=re.I)
html = re.sub(r'\s*<script[^>]+src=["\'][^"\']*orlica-v114\.js(?:\?[^"\']*)?["\'][^>]*>\s*</script>\s*', '\n', html, flags=re.I)
CSS_MARKER = '/* ORLICA V11.4 conversion layer */'
JS_MARKER = '/* ORLICA V11.4 conversion runtime */'
if CSS_MARKER in style:
    style = style.split(CSS_MARKER)[0].rstrip() + '\n'
if JS_MARKER in script:
    script = script.split(JS_MARKER)[0].rstrip() + '\n'

# Remove previous AI includes before adding the current version.
html = re.sub(r'\s*<link[^>]+href=["\']orlica-ai\.css(?:\?[^"\']*)?["\'][^>]*>\s*', '\n', html, flags=re.I)
html = re.sub(r'\s*<script[^>]+src=["\']orlica-ai\.js(?:\?[^"\']*)?["\'][^>]*>\s*</script>\s*', '\n', html, flags=re.I)

ai_css = '<link rel="stylesheet" href="orlica-ai.css?v=2">'
ai_js = '<script src="orlica-ai.js?v=2" defer></script>'

if '</head>' not in html.lower() or '</body>' not in html.lower():
    raise SystemExit('index.html is missing </head> or </body>')

html = re.sub(r'</head>', f'  {ai_css}\n</head>', html, count=1, flags=re.I)
html = re.sub(r'</body>', f'  {ai_js}\n</body>', html, count=1, flags=re.I)

# Bust core cache as we also remove the old embedded V11.4 runtime.
html = re.sub(r'orlica-v11\.css\?v=[^"\']+', 'orlica-v11.css?v=1160', html)
html = re.sub(r'orlica-v11\.js\?v=[^"\']+', 'orlica-v11.js?v=1160', html)

index.write_text(html, encoding='utf-8')
if css.exists(): css.write_text(style, encoding='utf-8')
if js.exists(): js.write_text(script, encoding='utf-8')
print('ORLICA AI sketch UI v2 wired and obsolete V11.4 layer removed')
