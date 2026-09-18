from pathlib import Path
import re

p = Path('index.html')
html = p.read_text(encoding='utf-8')

# Remove only the V11.4 product layer includes.
html = re.sub(r'\s*<link\s+rel=["\']stylesheet["\']\s+href=["\']orlica-v114\.css\?v=1140["\']\s*/?>\s*', '\n', html, flags=re.I)
html = re.sub(r'\s*<script\s+src=["\']orlica-v114\.js\?v=1140["\']\s+defer\s*>\s*</script>\s*', '\n', html, flags=re.I)

# Defensive cleanup if cache key ever changed.
html = re.sub(r'\s*<link[^>]+href=["\']orlica-v114\.css(?:\?[^"\']*)?["\'][^>]*>\s*', '\n', html, flags=re.I)
html = re.sub(r'\s*<script[^>]+src=["\']orlica-v114\.js(?:\?[^"\']*)?["\'][^>]*>\s*</script>\s*', '\n', html, flags=re.I)

p.write_text(html, encoding='utf-8')
print('ORLICA V11.4 product layer removed from index.html')
