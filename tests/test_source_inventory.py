"""Curated sources are not misclassified as private data or studies."""
import json
import unittest
from pathlib import Path
R=Path(__file__).resolve().parent.parent
class CuratedSources(unittest.TestCase):
    def test_inventory(self):
        entries=json.loads((R/'knowledge/favoritos-neuromarketing-2026.json').read_text())['entries']
        self.assertEqual(len(entries),30)
        self.assertEqual(len({row['id'] for row in entries}),30)
        self.assertEqual(sum(row['verification']=='reviewed' for row in entries),13)
        for row in entries:
            self.assertTrue(row['modules'])
            self.assertFalse(row['url'] and 'invitationToken' in row['url'])
            if row['access'] in ('private','invitation'):
                self.assertIsNone(row['url'])
    def test_static_library(self):
        root=(R/'index.html').read_text(encoding='utf8')
        for token in ('#fontes','renderFontes()','rod-references-v3.js'):
            self.assertIn(token,root)
        original=(R/'rod-references-v3.js').read_bytes()
        for path in ('dist/rod-references-v3.js','skill/assets/rod-references-v3.js'):
            self.assertEqual((R/path).read_bytes(),original)
if __name__=='__main__': unittest.main()
