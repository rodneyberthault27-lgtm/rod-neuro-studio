"""Atualiza o HTML autocontido a partir dos arquivos CSS/JS da experiência ROD."""
from pathlib import Path

root = Path(__file__).resolve().parent
p = root / 'index.html'
html = p.read_text(encoding='utf-8')
for marker, end_marker, source in [
    ('/* ROD: branco de papel', '</style>', 'rod-experience.css'),
    ('/* Experiência ROD: projeto', '\niniciar();', 'rod-experience.js'),
]:
    start = html.index(marker)
    end = html.index(end_marker, start)
    html = html[:start] + (root / source).read_text(encoding='utf-8') + '\n' + html[end:]
p.write_text(html, encoding='utf-8')
(root / 'skill/assets/rod-neuro-studio.html').write_text(html, encoding='utf-8')
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist/index.html').write_text(html, encoding='utf-8')
print('index.html, dist/index.html e cópia da skill atualizados.')
