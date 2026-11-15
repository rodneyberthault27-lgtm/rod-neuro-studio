"""Smoke test dos geradores da skill; produz arquivos temporários sem tocar no Artifact."""
from pathlib import Path
import json, subprocess, sys, tempfile
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
logo=Path(r"D:\ROD\ROD\Neuromarketing\03 Projetos e Propostas\Logo ROD - Versoes\ROD_simbolo.png")
assert logo.exists(), "Logo de teste não encontrado"
with tempfile.TemporaryDirectory() as tmp:
    out=Path(tmp)
    subprocess.run([sys.executable,str(ROOT/"scripts"/"atencao.py"),str(logo),"--saida",str(out),"--fixacoes","5"],check=True)
    files=list(out.glob("*_atencao.json"))
    assert files, "Análise de atenção não gerou dados"
    info=json.loads(files[0].read_text(encoding="utf-8"))
    panels=list(out.glob("*_painel.png"))
    assert panels, "Painel de atenção ausente"
    with Image.open(panels[0]) as im:
        assert im.width>0 and im.height>0
    print("OK: atenção preditiva gerou JSON e painel:",panels[0].name)
    sample={"titulo":"Teste interno ROD","acao":"Reconhecimento visual",
            "regioes":[{"id":"visual","intensidade":0.6,"porque":"Contraste visual da marca","evidencia":"CONTEXTUAL"},
                       {"id":"hipocampo","intensidade":0.3,"porque":"Hipótese de memória","evidencia":"A TESTAR"}]}
    data=out/"dados.json"; data.write_text(json.dumps(sample,ensure_ascii=False),encoding="utf-8")
    output=out/"mapa.html"
    subprocess.run([sys.executable,str(ROOT/"scripts"/"mapa_cerebral.py"),str(data),str(output)],check=True)
    txt=output.read_text(encoding="utf-8")
    assert "Teste interno ROD" in txt and len(txt)>10000, "Mapa do cérebro não montado"
    print("OK: gerador de cérebro 3D criou HTML com dados do exemplo")
