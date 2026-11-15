"""
Gera o mapa cerebral 3D girável (HTML único) para uma ação de marketing.

Uso:
    python mapa_cerebral.py dados.json saida.html

dados.json:
{
  "titulo": "Reels com rosto + depoimento",
  "acao": "Descrição curta da ação analisada",
  "aviso": "(opcional) texto de leitura; se ausente usa o aviso padrão de inferência reversa",
  "regioes": [
    {"id": "fusiforme", "intensidade": 0.9, "porque": "Rosto no primeiro segundo", "evidencia": "ROBUSTO"}
  ]
}
ids válidos: visual, fusiforme, parietal, tpj, auditivo, s1, motor, dlpfc, ofc, acc,
             insula, amigdala, hipocampo, estriado, olfativo, hipotalamo
evidencia: ROBUSTO | CONTEXTUAL | A TESTAR   (intensidade 0–1 = peso relativo do processo
na ação, NÃO medida de ativação)
"""
import json, os, re, sys

IDS = {"visual", "fusiforme", "parietal", "tpj", "auditivo", "s1", "motor", "dlpfc", "ofc",
       "acc", "insula", "amigdala", "hipocampo", "estriado", "olfativo", "hipotalamo"}

def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    dados = json.load(open(sys.argv[1], encoding="utf8"))
    ruins = [r.get("id") for r in dados.get("regioes", []) if r.get("id") not in IDS]
    if ruins:
        sys.exit(f"ids desconhecidos: {ruins}. Válidos: {sorted(IDS)}")
    for r in dados["regioes"]:
        r["intensidade"] = max(0.05, min(1.0, float(r.get("intensidade", 0.5))))
    tpl = open(os.path.join(os.path.dirname(__file__), "..", "assets", "cerebro3d.html"), encoding="utf8").read()
    js = json.dumps(dados, ensure_ascii=False).replace("</", "<\\/")
    out, n = re.subn(r"/\*__DADOS__\*/.*?/\*__FIM__\*/", lambda m: js, tpl, flags=re.S)
    if n != 1:
        sys.exit("marcador de dados não encontrado no template")
    open(sys.argv[2], "w", encoding="utf8").write(out)
    print(os.path.abspath(sys.argv[2]))

if __name__ == "__main__":
    main()
