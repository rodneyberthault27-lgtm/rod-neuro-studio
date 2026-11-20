"""Contratos de ROD-003/004 sem acessar dados privados ou serviços externos."""
import copy
import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from migrate_legacy import load_private_export, transform, write_private_staging

FIXTURE = ROOT / "tests/fixtures/legacy_synthetic.json"


class LegacyMigrationTests(unittest.TestCase):
    def setUp(self):
        self.input = load_private_export(FIXTURE)
        self.digest = hashlib.sha256(FIXTURE.read_bytes()).hexdigest()

    def test_input_and_staging_counts(self):
        result = transform(self.input, self.digest)
        counts = result["manifest"]["staging_counts"]
        self.assertEqual(counts, {"projects":3, "documents":6, "asset_references":1})
        self.assertEqual(result["manifest"]["verified_observations_created"], 0)
        self.assertFalse(result["manifest"]["imported_to_database"])
        self.assertTrue(result["manifest"]["review_required"])
        self.assertEqual(len({p["id"] for p in result["projects"]}), 3)

    def test_links_preserve_uncertainty(self):
        result = transform(self.input, self.digest)
        docs = {x["legacy_id"]: x for x in result["documents"]}
        self.assertIsNone(docs["brief-orphan"]["project_id"])
        self.assertEqual(docs["brief-orphan"]["review_state"], "needs_link_review")
        self.assertEqual(docs["test-synthetic-1"]["review_state"], "needs_link_review")
        self.assertEqual(docs["synthetic-b"]["kind"], "legacy_briefing")
        self.assertIn("CROSS_PROJECT_EXPERIMENT", result["manifest"]["issues_by_code"])
        self.assertIn("ORPHAN_BRIEFING", result["manifest"]["issues_by_code"])
        self.assertIn("LEGACY_RESULT_UNVERIFIED", result["manifest"]["issues_by_code"])

    def test_nonportable_assets_are_unresolved(self):
        result = transform(self.input, self.digest)
        asset = result["asset_references"][0]
        self.assertEqual(asset["source_type"], "claude_blob")
        self.assertEqual(asset["state"], "unresolved")
        self.assertIsNone(asset["storage_key"])

    def test_idempotent_ids_and_nonmutation(self):
        original = copy.deepcopy(self.input)
        first, second = transform(self.input, self.digest), transform(self.input, self.digest)
        self.assertEqual(first, second)
        self.assertEqual(self.input, original)

    def test_duplicate_and_missing_ids_flagged_without_fabricating(self):
        data = copy.deepcopy(self.input)
        data["collections"]["analises"].append(copy.deepcopy(data["collections"]["analises"][0]))
        data["collections"]["briefings"].append({"titulo":"sem id"})
        result = transform(data, self.digest)
        self.assertEqual(result["manifest"]["staging_counts"]["projects"], 3)
        self.assertIn("DUPLICATE_ID", result["manifest"]["issues_by_code"])
        self.assertIn("MISSING_ID", result["manifest"]["issues_by_code"])

    def test_invalid_timestamp_preserved(self):
        data = copy.deepcopy(self.input)
        data["collections"]["analises"][0]["criado"] = "next Friday"
        result = transform(data, self.digest)
        self.assertIn("INVALID_DATE", result["manifest"]["issues_by_code"])
        self.assertEqual(result["documents"][0]["payload"]["criado"], "next Friday")

    def test_check_is_read_only_and_stage_is_explicit(self):
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            out = folder / "private-stage"
            cmd = [sys.executable, str(ROOT / "tools/migrate_legacy.py"), str(FIXTURE)]
            proc = subprocess.run(cmd + ["--check"], check=True,
                                  stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            report = json.loads(proc.stdout)
            self.assertEqual(report["staging_counts"]["documents"], 6)
            self.assertFalse(out.exists())
            subprocess.run(cmd + ["--stage", str(out)], check=True,
                           stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            self.assertTrue((out / "manifest.json").is_file())
            self.assertEqual(sum(1 for _ in (out / "documents.jsonl").open()), 6)
            # A second staging call must not overwrite private export data.
            again = subprocess.run(cmd + ["--stage", str(out)],
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            self.assertNotEqual(again.returncode, 0)

    def test_invalid_envelope_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            p = Path(temp) / "bad.json"
            p.write_text(json.dumps({"export_format":"wrong","collections":{}}))
            with self.assertRaises(ValueError):
                load_private_export(p)


if __name__ == "__main__":
    unittest.main()
