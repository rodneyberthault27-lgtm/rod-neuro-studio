"""Sincroniza fonte local do ROD Neuro Studio com a cópia de segurança D:, validando SHA-256."""
from pathlib import Path
import shutil, hashlib
src=Path(r"C:\Users\rodne\.claude\skills\neuromarketing-completo")
dst=Path(r"D:\ROD\ROD\Neuromarketing\02 Skills e Prompts\Skill - Neuromarketing Completo")
assert src.is_dir() and dst.is_dir(), "Pasta não disponível"
ignored={"__pycache__"}
files=[p for p in src.rglob("*") if p.is_file() and not any(part in ignored for part in p.relative_to(src).parts) and p.suffix!=".pyc"]
count=0
for a in files:
    b=dst/a.relative_to(src)
    b.parent.mkdir(parents=True,exist_ok=True)
    if not b.exists() or hashlib.sha256(a.read_bytes()).digest()!=hashlib.sha256(b.read_bytes()).digest():
        shutil.copy2(a,b)
        count+=1
for a in files:
    b=dst/a.relative_to(src)
    if not b.exists() or hashlib.sha256(a.read_bytes()).digest()!=hashlib.sha256(b.read_bytes()).digest():
        raise RuntimeError(f"Divergência após cópia: {a.relative_to(src)}")
print(f"OK: {len(files)} arquivos conferidos por SHA-256; {count} copiados/atualizados.")
print("Destino:",dst)
