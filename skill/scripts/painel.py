"""
Gera o PAINEL de análise (HTML único, abre em qualquer navegador).

Uso:
    python painel.py dados.json saida.html

Imagens: em "imagens", passe CAMINHOS de arquivo — o script embute em base64:
    "imagens": {"peca": "C:/.../peca.png", "atencao": "C:/.../x_painel.png",
                "extras": [{"src": "C:/.../comparacao.png", "titulo": "...", "texto": "..."}]}
"mapa_cerebral": caminho relativo ao HTML de saída (ex.: "mapa.html") — vira botão.

Esquema completo: ver references/painel.md.
"""
import base64, json, mimetypes, os, re, sys


def embed(path):
    if not path or str(path).startswith("data:"):
        return path
    mime = mimetypes.guess_type(path)[0] or "image/png"
    with open(path, "rb") as h:
        return f"data:{mime};base64," + base64.b64encode(h.read()).decode()


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    dados = json.load(open(sys.argv[1], encoding="utf8"))
    base = os.path.dirname(os.path.abspath(sys.argv[1]))
    def embed_rel(p):
        if not p or str(p).startswith("data:"):
            return p
        return embed(p if os.path.isabs(p) else os.path.join(base, p))
    im = dados.get("imagens") or {}
    for k in ("peca", "atencao"):
        if im.get(k):
            im[k] = embed_rel(im[k])
    for e in im.get("extras") or []:
        e["src"] = embed_rel(e.get("src"))
    dados["imagens"] = im
    tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "painel.html"), encoding="utf8").read()
    js = json.dumps(dados, ensure_ascii=False).replace("</", "<\\/")
    out, n = re.subn(r"/\*__DADOS__\*/.*?/\*__FIM__\*/", lambda m: js, tpl, flags=re.S)
    if n != 1:
        sys.exit("marcador de dados não encontrado no template")
    if dados.get("titulo"):
        out = out.replace("<title>Painel Neuromarketing</title>",
                          "<title>" + dados["titulo"].replace("<", "")[:60] + "</title>", 1)
    open(sys.argv[2], "w", encoding="utf8").write(out)
    print(os.path.abspath(sys.argv[2]))


if __name__ == "__main__":
    main()
