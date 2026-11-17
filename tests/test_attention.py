"""Smoke test portátil de saliência sintética; nenhuma imagem pessoal ou real."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent

class AttentionTests(unittest.TestCase):
    def test_predictive_attention_generates_labeled_outputs(self):
        with tempfile.TemporaryDirectory() as folder:
            dest = Path(folder)
            photo = dest / "artificial.png"
            im = Image.new("RGB", (180, 270), "#f2f1e9")
            draw = ImageDraw.Draw(im)
            draw.rectangle((25, 45, 160, 115), fill="#ad111c")
            draw.ellipse((70, 170, 125, 225), fill="#1241aa")
            im.save(photo)
            subprocess.run([sys.executable, str(ROOT/"skill/scripts/atencao.py"),
                            str(photo), "--saida", str(dest), "--fixacoes", "3"],
                           check=True, capture_output=True, text=True, timeout=100)
            data = json.loads((dest/"artificial_atencao.json").read_text(encoding="utf-8"))
            self.assertIn("Não é eye-tracking real", data["aviso"])
            self.assertEqual(data["tamanho"], [180,270])
            self.assertEqual(len(data["fixacoes_previstas"]), 3)
            for name in ("painel", "calor", "fixacoes"):
                p = dest/("artificial_"+name+".png")
                self.assertTrue(p.is_file(), str(p))
                with Image.open(p) as out:
                    self.assertGreater(out.width, 0)
                    self.assertGreater(out.height, 0)

if __name__ == "__main__":
    unittest.main(verbosity=2)
