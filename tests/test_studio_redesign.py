"""ROD v3 experience contract: 7 research modules and local Attention Lab."""
import unittest
from pathlib import Path
R=Path(__file__).resolve().parent.parent

class StudioDesignContract(unittest.TestCase):
    def test_studio_design_and_attention(self):
        page=(R/'index.html').read_text(encoding='utf8')
        for term in ('#atencao','renderAtencao()','studio-topline','Previsão visual. Sem eye-tracking real.','rod-attention-v3.js','Navegação do ROD Studio'):
            self.assertIn(term,page)
        script=(R/'rod-attention-v3.js').read_text(encoding='utf8')
        for term in ('renderAtencao','getImageData','getContext','drawImage(overlay,0,0)'):
            self.assertIn(term,script)
        self.assertIn('NOT an eye-tracking measurement',script)
        css=(R/'rod-experience.css').read_text(encoding='utf8')
        self.assertIn('RESEARCH INTERFACE',css)
        for name in ('dist/index.html','skill/assets/rod-neuro-studio.html'):
            self.assertEqual(page,(R/name).read_text(encoding='utf8'))
    def test_attention_js_mirrors(self):
        src=(R/'rod-attention-v3.js').read_bytes()
        for path in ('dist/rod-attention-v3.js','skill/assets/rod-attention-v3.js'):
            self.assertEqual(src,(R/path).read_bytes())
if __name__=='__main__': unittest.main()
