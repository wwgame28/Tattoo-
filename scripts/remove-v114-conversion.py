from pathlib import Path
import re

root = Path('.')
index = root / 'index.html'
css = root / 'orlica-v11.css'
js = root / 'orlica-v11.js'

html = index.read_text(encoding='utf-8')
style = css.read_text(encoding='utf-8')
script = js.read_text(encoding='utf-8')

CSS_MARKER = '/* ORLICA V11.4 conversion layer */'
JS_MARKER = '/* ORLICA V11.4 conversion runtime */'

if CSS_MARKER in style:
    style = style.split(CSS_MARKER, 1)[0].rstrip() + '\n'

if JS_MARKER in script:
    script = script.split(JS_MARKER, 1)[0].rstrip() + '\n'

# Remove any external V11.4 assets if they are still referenced.
html = re.sub(r'\s*<link[^>]+orlica-v114\.css[^>]*>\s*', '\n', html, flags=re.I)
html = re.sub(r'\s*<script[^>]+orlica-v114\.js[^>]*></script>\s*', '\n', html, flags=re.I)

# Bust iPhone/Safari cache for the consolidated V11 assets.
html = re.sub(r'orlica-v11\.css\?v=[^"\']+', 'orlica-v11.css?v=1150', html)
html = re.sub(r'orlica-v11\.js\?v=[^"\']+', 'orlica-v11.js?v=1150', html)

index.write_text(html, encoding='utf-8')
css.write_text(style, encoding='utf-8')
js.write_text(script, encoding='utf-8')

print('Removed embedded ORLICA V11.4 conversion layer and bumped cache to 1150')
