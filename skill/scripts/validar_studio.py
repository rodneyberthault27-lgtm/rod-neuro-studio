"""Checagem estatica do ROD Neuro Studio local. Nao publica o Artifact."""
from pathlib import Path
from html.parser import HTMLParser
import subprocess, tempfile, sys, py_compile

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "assets" / "rod-neuro-studio.html"

class JSCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.active = False
        self.blocks = []
    def handle_starttag(self, tag, attrs):
        if tag == "script":
            self.active = not dict(attrs).get("src")
    def handle_data(self, data):
        if self.active:
            self.blocks.append(data)
    def handle_endtag(self, tag):
        if tag == "script":
            self.active = False

doc = HTML.read_text(encoding="utf-8")
parser = JSCollector()
parser.feed(doc)
assert '<main class="main" id="view">' in doc, "Main ausente"
legacy_evidence = ("Três camadas de evidência:" in doc or "EVIDÊNCIA EM TRÊS CAMADAS" in doc)
new_evidence = all(
    token in doc for token in (
        'class="evidence-strip"',
        'Previsão visual. Sem eye-tracking real.',
        'Hipótese comportamental. Não é medição cerebral.',
        'Resultado observado. Somente dados de teste.'
    )
)
assert legacy_evidence or new_evidence, "Três camadas de evidência ausentes"
assert len(parser.blocks) >= 1, "Script interno ausente"
with tempfile.TemporaryDirectory() as folder:
    path = Path(folder) / "studio.js"
    path.write_text("\n".join(parser.blocks), encoding="utf-8")
    subprocess.run(["node", "--check", str(path)], check=True)
for script in (ROOT / "scripts").glob("*.py"):
    py_compile.compile(str(script), doraise=True)
print("OK: JavaScript valido, HTML com painel e Python compilavel")

if "--backup" in sys.argv:
    import hashlib
    dest = Path(r"D:\ROD\ROD\Neuromarketing\02 Skills e Prompts\Skill - Neuromarketing Completo")
    for relative in ["SKILL.md", "references/protocolo-v2.md", "assets/rod-neuro-studio.html"]:
        a, b = ROOT / relative, dest / relative
        assert b.exists(), f"Arquivo ausente no backup: {relative}"
        assert hashlib.sha256(a.read_bytes()).digest() == hashlib.sha256(b.read_bytes()).digest(), f"Backup divergente: {relative}"
    print("OK: backup sincronizado (3 arquivos-chave conferidos por SHA-256)")
