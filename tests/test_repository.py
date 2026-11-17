"""Contrato de integridade do Studio legado; stdlib + Node, sem acesso ao Claude."""
import json
import subprocess
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

class ScriptCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inline = False
        self.blocks = []
    def handle_starttag(self, tag, attrs):
        if tag == "script":
            self.inline = not dict(attrs).get("src")
    def handle_data(self, data):
        if self.inline:
            self.blocks.append(data)
    def handle_endtag(self, tag):
        if tag == "script":
            self.inline = False

def normalized(path):
    return path.read_text(encoding="utf-8").replace("\r\n", "\n")

class BaselineTests(unittest.TestCase):
    def test_html_copies_match(self):
        source = (ROOT / "index.html").read_bytes()
        for name in ("dist/index.html", "skill/assets/rod-neuro-studio.html"):
            with self.subTest(name=name):
                self.assertEqual(source, (ROOT / name).read_bytes(),
                                 "Cópia de HTML diferente da fonte: " + name)

    def test_builder_sources_embedded(self):
        page = normalized(ROOT / "index.html")
        css = normalized(ROOT / "rod-experience.css").strip()
        js = normalized(ROOT / "rod-experience.js").strip()
        self.assertIn(css, page, "CSS da experiência não embutido")
        start = page.index("/* Experiência ROD: projeto")
        end = page.index("\niniciar();", start)
        self.assertEqual(page[start:end].strip(), js,
                         "JS embutido diferente do código de origem")

    def test_inline_script_syntax(self):
        collector = ScriptCollector()
        collector.feed(normalized(ROOT / "index.html"))
        self.assertTrue(collector.blocks, "Script interno não encontrado")
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "studio.js"
            path.write_text("\n".join(collector.blocks), encoding="utf-8")
            subprocess.run(["node", "--check", str(path)], check=True,
                           capture_output=True, text=True, timeout=30)

    def test_hosting_uses_dist_not_src(self):
        config = json.loads(normalized(ROOT / ".openai/hosting.json"))
        self.assertEqual(config["static"]["directory"], "dist")
        self.assertTrue((ROOT / "dist/index.html").is_file())

    def test_rod_scientific_contract_present(self):
        protocol = normalized(ROOT / "skill/references/protocolo-v2.md")
        attention = normalized(ROOT / "skill/scripts/atencao.py")
        self.assertIn("PREVISÃO VISUAL", protocol)
        self.assertIn("HIPÓTESE COMPORTAMENTAL", protocol)
        self.assertIn("RESULTADO OBSERVADO", protocol)
        self.assertIn("NÃO é eye-tracking", attention)
        self.assertTrue((ROOT / "skill/assets/rod-simbolo-original.svg").is_file())

    def test_data_migration_not_misrepresented(self):
        readme = normalized(ROOT / "README.md")
        self.assertIn("não foram migrados do Claude", readme)
        self.assertIn("window.claude", normalized(ROOT / "index.html"))

if __name__ == "__main__":
    unittest.main(verbosity=2)
