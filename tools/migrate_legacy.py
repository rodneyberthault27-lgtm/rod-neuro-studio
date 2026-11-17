#!/usr/bin/env python3
"""ROD-004: validate and stage authorized legacy exports. NO network / database access.

Dry run by default. --stage creates a new local directory with private JSONL
and sanitized manifest. No migration or verified scientific claims are made.
"""
import argparse
import collections
import hashlib
import json
import re
import sys
import uuid
from datetime import datetime
from pathlib import Path

FORMAT = "rod-legacy-v1"
COLLECTIONS = ("analises", "briefings", "testes")
SENSITIVE_ASSET_PREFIXES = ("data:", "/_blob/", "blob:")
VALID_KINDS = {"analysis", "legacy_briefing", "creative_brief", "experiment"}
MAX_INPUT_BYTES = 60 * 1024 * 1024


def record_id(record):
    value = record.get("id", record.get("doc_id"))
    if not isinstance(value, str) or not value.strip() or len(value) > 250:
        return None
    return value.strip()


def stable_id(source, legacy_id):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, "rod/studio-v3/" + source + "/" + legacy_id))


def issue(issues, code, collection, index):
    # Deliberately omit IDs, titles, URLs, raw payloads and customer information.
    issues.append({"code": code, "collection": collection, "record_index": index})


def valid_timestamp(value):
    if not isinstance(value, str) or not value.strip():
        return False
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed.tzinfo is not None
    except ValueError:
        return False


def image_sources(doc):
    data = doc.get("imagens")
    if not isinstance(data, dict):
        return []
    refs = []
    for key in ("peca", "atencao"):
        if isinstance(data.get(key), str) and data[key]:
            refs.append((key, data[key]))
    extras = data.get("extras")
    if isinstance(extras, list):
        for n, value in enumerate(extras):
            if isinstance(value, dict) and isinstance(value.get("src"), str) and value["src"]:
                refs.append(("extras[" + str(n) + "].src", value["src"]))
    return refs


def load_private_export(path):
    path = Path(path)
    if path.stat().st_size > MAX_INPUT_BYTES:
        raise ValueError("Arquivo excede o limite de 60 MB; dividir e conciliar exportações.")
    with path.open("r", encoding="utf-8") as h:
        data = json.load(h)
    if not isinstance(data, dict) or data.get("export_format") != FORMAT:
        raise ValueError("Envelope inválido: é exigido export_format='rod-legacy-v1'.")
    collections_obj = data.get("collections")
    if not isinstance(collections_obj, dict):
        raise ValueError("Envelope inválido: collections precisa ser um objeto.")
    for name in COLLECTIONS:
        if not isinstance(collections_obj.get(name), list):
            raise ValueError("Envelope inválido: collections." + name + " precisa ser array.")
        if any(not isinstance(record, dict) for record in collections_obj[name]):
            raise ValueError("Envelope inválido: itens de " + name + " precisam ser objetos.")
    if not isinstance(data.get("local_projects", []), list):
        raise ValueError("Envelope inválido: local_projects precisa ser array.")
    if any(not isinstance(record, dict) for record in data.get("local_projects", [])):
        raise ValueError("Envelope inválido: projetos locais precisam ser objetos.")
    return data


def transform(data, sha256):
    issues, projects, documents, assets = [], [], [], []
    seen = set()
    analysis_project = {}
    input_counts = {n: len(data["collections"][n]) for n in COLLECTIONS}
    input_counts["local_projects"] = len(data.get("local_projects", []))

    def accept(source, item, index):
        key = record_id(item)
        if key is None:
            issue(issues, "MISSING_ID", source, index)
            return None
        unique = (source, key)
        if unique in seen:
            issue(issues, "DUPLICATE_ID", source, index)
            return None
        seen.add(unique)
        if "criado" in item and item["criado"] and not valid_timestamp(item["criado"]):
            issue(issues, "INVALID_DATE", source, index)
        return key

    def doc_record(source, key, payload, project_id, kind, review_state):
        assert kind in VALID_KINDS
        doc_id = stable_id(source + "/document", key)
        documents.append({
            "id": doc_id,
            "project_id": project_id,
            "kind": kind,
            "revision": 1,
            "review_state": review_state,
            "legacy_collection": source,
            "legacy_id": key,
            "payload": payload
        })
        for path, raw in image_sources(payload):
            category = ("embedded" if raw.startswith("data:") else
                        "claude_blob" if raw.startswith("/_blob/") else
                        "browser_blob" if raw.startswith("blob:") else
                        "external_reference")
            ref = raw if category != "embedded" else "embedded-data-uri:sha256:" + hashlib.sha256(raw.encode("utf-8")).hexdigest()
            assets.append({
                "id": stable_id(source + "/asset", key + ":" + path),
                "document_id": doc_id,
                "field_path": "imagens." + path,
                "source_ref": ref,
                "source_type": category,
                "state": "unresolved",
                "storage_key": None
            })
            issue(issues, "ASSET_REQUIRES_EXPORT", source, -1)
        return doc_id

    for source, rows in (("claude.analises", data["collections"]["analises"]),
                         ("browser.local", data.get("local_projects", []))):
        for index, raw in enumerate(rows):
            key = accept(source, raw, index)
            if key is None:
                continue
            p_id = stable_id(source + "/project", key)
            status = "briefing" if raw.get("status_analise") == "briefing" else "analysis"
            projects.append({
                "id": p_id,
                "title": str(raw.get("titulo") or key).strip()[:220],
                "status": status,
                "origin": source,
                "legacy_id": key
            })
            if source == "claude.analises":
                analysis_project[key] = p_id
            kind = "legacy_briefing" if status == "briefing" else "analysis"
            doc_record(source, key, raw, p_id, kind, "unverified_legacy")
            if isinstance(raw.get("resultados"), list) and raw["resultados"]:
                issue(issues, "LEGACY_RESULT_UNVERIFIED", source, index)

    for index, raw in enumerate(data["collections"]["briefings"]):
        source = "claude.briefings"
        key = accept(source, raw, index)
        if key is None:
            continue
        analysis_key = raw.get("analise_id")
        project_id = analysis_project.get(analysis_key) if isinstance(analysis_key, str) else None
        if project_id is None:
            issue(issues, "ORPHAN_BRIEFING", source, index)
        doc_record(source, key, raw, project_id, "creative_brief",
                   "unverified_legacy" if project_id else "needs_link_review")

    for index, raw in enumerate(data["collections"]["testes"]):
        source = "claude.testes"
        key = accept(source, raw, index)
        if key is None:
            continue
        a_key, b_key = raw.get("analise_a"), raw.get("analise_b")
        a_id = analysis_project.get(a_key) if isinstance(a_key, str) else None
        b_id = analysis_project.get(b_key) if isinstance(b_key, str) else None
        if a_id and b_id and a_id != b_id:
            issue(issues, "CROSS_PROJECT_EXPERIMENT", source, index)
        if not (a_id and b_id):
            issue(issues, "UNRESOLVED_EXPERIMENT_LINK", source, index)
        attached = a_id or b_id
        doc_record(source, key, raw, attached, "experiment", "needs_link_review")
        if raw.get("a") or raw.get("b") or raw.get("aprendizado"):
            issue(issues, "LEGACY_RESULT_UNVERIFIED", source, index)

    issue_counts = dict(sorted(collections.Counter(x["code"] for x in issues).items()))
    manifest = {
        "format": "rod-stage-v1",
        "input_sha256": sha256,
        "input_counts": input_counts,
        "staging_counts": {
            "projects": len(projects),
            "documents": len(documents),
            "asset_references": len(assets)
        },
        "issues_by_code": issue_counts,
        "review_required": bool(issues),
        "imported_to_database": False,
        "read_private_claude_database": False,
        "verified_observations_created": 0,
        "claim": "dry_run_or_private_staging_only"
    }
    return {"projects": projects, "documents": documents,
            "asset_references": assets, "manifest": manifest}


def write_private_staging(directory, result):
    dest = Path(directory)
    dest.mkdir(parents=True, exist_ok=False)
    for key in ("projects", "documents", "asset_references"):
        file_path = dest / (key + ".jsonl")
        with file_path.open("x", encoding="utf-8") as f:
            for entry in result[key]:
                f.write(json.dumps(entry, ensure_ascii=False, sort_keys=True) + "\n")
        try:
            file_path.chmod(0o600)
        except OSError:
            pass
    report_file = dest / "manifest.json"
    report_file.write_text(json.dumps(result["manifest"], ensure_ascii=False,
                                      sort_keys=True, indent=2) + "\n", encoding="utf-8")
    try:
        report_file.chmod(0o600)
    except OSError:
        pass


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="Export JSON privado, fora do Git.")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="Dry run; padrão.")
    mode.add_argument("--stage", metavar="NEW_DIRECTORY",
                      help="Gerar JSONL num novo diretório privado, sem banco.")
    args = parser.parse_args(argv)
    try:
        input_path = Path(args.input)
        sha256 = hashlib.sha256(input_path.read_bytes()).hexdigest()
        source = load_private_export(input_path)
        result = transform(source, sha256)
        if args.stage:
            write_private_staging(args.stage, result)
        print(json.dumps(result["manifest"], ensure_ascii=False, indent=2))
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        # Avoid printing filenames or content potentially sensitive.
        print("ERRO: envelope inválido, arquivo inacessível ou destino existente.", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
