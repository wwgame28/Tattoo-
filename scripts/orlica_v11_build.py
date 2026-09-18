from pathlib import Path
import re

CSS_SOURCES = [
    'director-v5.css',
    'orlica-v7.css',
    'orlica-v8.css',
    'orlica-v81.css',
    'orlica-v9.css',
    'orlica-v10.css',
    'orlica-hero-hold.css',
    'orlica-hero-clean.css',
    'orlica-v101.css',
    'orlica-v11-cleanup.css',
]

JS_SOURCES = [
    'director-v5.js',
    'orlica-v7.js',
    'orlica-v8.js',
    'orlica-v9.js',
    'orlica-v10.js',
    'orlica-hero-hold.js',
    'orlica-v101.js',
    'orlica-v11-cleanup.js',
]


def bundle(sources, output, banner):
    parts = [banner]
    for name in sources:
        path = Path(name)
        if not path.exists():
            raise FileNotFoundError(name)
        parts.append(f'\n/* source: {name} */\n')
        parts.append(path.read_text(encoding='utf-8'))
    Path(output).write_text('\n'.join(parts), encoding='utf-8')


bundle(CSS_SOURCES, 'orlica-v11.css', '/* ORLICA V11 consolidated CSS */')
bundle(JS_SOURCES, 'orlica-v11.js', '/* ORLICA V11 consolidated JS */')

index = Path('index.html')
html = index.read_text(encoding='utf-8')

old_names = r'(?:director-v5|orlica-(?:v7|v8|v81|v9|v10|v101|hero-clean|hero-hold|v11-cleanup))'
html = re.sub(
    r'<link\b[^>]*href=["\'][^"\']*' + old_names + r'\.css(?:\?[^"\']*)?["\'][^>]*>\s*',
    '', html, flags=re.I,
)
html = re.sub(
    r'<script\b[^>]*src=["\'][^"\']*' + old_names + r'\.js(?:\?[^"\']*)?["\'][^>]*>\s*</script>\s*',
    '', html, flags=re.I,
)
html = re.sub(r'<link\b[^>]*href=["\'][^"\']*orlica-v11\.css(?:\?[^"\']*)?["\'][^>]*>\s*', '', html, flags=re.I)
html = re.sub(r'<script\b[^>]*src=["\'][^"\']*orlica-v11\.js(?:\?[^"\']*)?["\'][^>]*>\s*</script>\s*', '', html, flags=re.I)

html = html.replace('</head>', '<link rel="stylesheet" href="orlica-v11.css?v=1101">\n</head>', 1)
html = html.replace('</body>', '<script defer src="orlica-v11.js?v=1101"></script>\n</body>', 1)
index.write_text(html, encoding='utf-8')

print('V11 built:', Path('orlica-v11.css').stat().st_size, Path('orlica-v11.js').stat().st_size)
print('index uses V11:', 'orlica-v11.css?v=1101' in html and 'orlica-v11.js?v=1101' in html)
