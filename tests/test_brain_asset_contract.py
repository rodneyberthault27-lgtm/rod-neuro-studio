"""Prevent the brain visual regression in the development mirror."""
from pathlib import Path
import unittest
R=Path(__file__).resolve().parent.parent
class BrainAssetContract(unittest.TestCase):
  def test_asset_and_license(self):
    page=(R/'index.html').read_text(encoding='utf-8')
    for word in ('GLTFLoader.js','DRACOLoader.js','brain.glb','Z-Anatomy / BodyParts3D', 'CC BY-SA 4.0','loadRealBrain','paintReal','fallbackGroup.visible=false'):
      self.assertIn(word,page)
    self.assertEqual(page,(R/'dist/index.html').read_text(encoding='utf-8'))
    self.assertEqual(page,(R/'skill/assets/rod-neuro-studio.html').read_text(encoding='utf-8'))
if __name__=='__main__':unittest.main()
