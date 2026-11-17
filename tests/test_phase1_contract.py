"""Static contract checks. Live RLS tests still require a provisioned Supabase."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent

class Phase1Contract(unittest.TestCase):
    def test_legacy_site_still_matches(self):
        page=(ROOT/'index.html').read_bytes()
        self.assertEqual(page,(ROOT/'dist/index.html').read_bytes())
        self.assertEqual(page,(ROOT/'skill/assets/rod-neuro-studio.html').read_bytes())
    def test_schema_private_storage_and_workspace_policies(self):
        sql=(ROOT/'supabase/migrations/20261117000000_rod_v3.sql').read_text().lower()
        for token in ('enable row level security','rod_workspace_role','rod_create_workspace',
                      'rod_asset_path_allowed','rod-private','public.rod_documents',
                      'public.rod_projects','public.rod_assets','security definer',
                      'with check','created_by=(select auth.uid())'):
            self.assertIn(token,sql)
        self.assertIn('false,10485760',sql)
    def test_service_key_not_used_in_app(self):
        web=ROOT/'apps/web'
        for p in web.rglob('*'):
            if p.is_file() and p.suffix in ('.ts','.tsx','.js','.jsx'):
                source=p.read_text().lower()
                self.assertNotIn('supabase_service_role',source,p.as_posix())
                self.assertNotIn('service_role_key',source,p.as_posix())
    def test_hosting_not_changed(self):
        config=json.loads((ROOT/'.openai/hosting.json').read_text())
        self.assertEqual(config['static']['directory'],'dist')
if __name__=='__main__':unittest.main()
