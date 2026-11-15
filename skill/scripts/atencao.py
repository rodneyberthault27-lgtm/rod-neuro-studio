"""
Rastreamento PREVISTO de atenção visual (bottom-up) para peças gráficas.

NÃO é eye-tracking real: é um modelo de saliência que estima para onde o olho tende a ir
nos primeiros segundos, a partir de contraste de luminosidade, oposição de cor
(vermelho-verde, azul-amarelo), resíduo espectral (Hou & Zhang, 2007) e viés central.
Não sabe o que é rosto, texto ou produto — leia o resultado junto com a imagem.

Uso:
    python atencao.py <imagem> [--saida PASTA] [--fixacoes 6] [--rotulo NOME]

Gera na pasta de saída:
    <nome>_painel.png   original | mapa de calor | ordem de fixação | cinza | desfoque 8px
    <nome>_calor.png    mapa de calor sobreposto
    <nome>_fixacoes.png ordem prevista de fixação (1, 2, 3...)
    <nome>_atencao.json números: fixações, % de atenção por terço da peça, contraste
Dependências: numpy, Pillow.
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

W_WORK = 320  # largura de trabalho do modelo


def _blur(arr, r):
    """Desfoque gaussiano separável em numpy (Pillow não desfoca imagens float)."""
    arr = np.asarray(arr, np.float32)
    rad = max(1, int(r * 3))
    x = np.arange(-rad, rad + 1, dtype=np.float32)
    k = np.exp(-(x ** 2) / (2 * r * r))
    k /= k.sum()
    p = np.pad(arr, ((rad, rad), (rad, rad)), mode="reflect")
    p = np.apply_along_axis(lambda m: np.convolve(m, k, mode="valid"), 1, p)
    p = np.apply_along_axis(lambda m: np.convolve(m, k, mode="valid"), 0, p)
    return p


def _norm(a):
    a = a - a.min()
    m = a.max()
    return a / m if m > 1e-9 else a


def _center_surround(ch):
    out = np.zeros_like(ch)
    for c, s in ((1, 4), (2, 8), (4, 16)):
        out += np.abs(_blur(ch, c) - _blur(ch, s))
    return _norm(out)


def _spectral_residual(gray):
    small = np.asarray(Image.fromarray((gray * 255).astype(np.uint8)).resize((64, 64)), np.float32) / 255
    f = np.fft.fft2(small)
    logamp = np.log(np.abs(f) + 1e-9)
    phase = np.angle(f)
    avg = _blur(logamp, 1.5)
    sal = np.abs(np.fft.ifft2(np.exp(logamp - avg + 1j * phase))) ** 2
    sal = _blur(sal, 2.5)
    h, w = gray.shape
    return _norm(np.asarray(Image.fromarray(sal.astype(np.float32), "F").resize((w, h)), np.float32))


def saliencia(img):
    w, h = img.size
    sw, sh = W_WORK, max(1, round(h * W_WORK / w))
    rgb = np.asarray(img.convert("RGB").resize((sw, sh)), np.float32) / 255
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    rg = r - g
    by = b - (r + g) / 2
    cons = _center_surround(lum) * 1.2 + _center_surround(rg) + _center_surround(by)
    spec = _spectral_residual(lum)
    yy, xx = np.mgrid[0:sh, 0:sw]
    centro = np.exp(-(((xx - sw / 2) / (sw * 0.45)) ** 2 + ((yy - sh / 2) / (sh * 0.45)) ** 2))
    s = _norm(_norm(cons) * 0.6 + spec * 0.4)
    s = _norm(_blur(s * (0.7 + 0.3 * centro), 3))
    return s, lum


def fixacoes(s, n):
    s = s.copy()
    h, w = s.shape
    raio = max(h, w) * 0.12
    yy, xx = np.mgrid[0:h, 0:w]
    pts = []
    for _ in range(n):
        y, x = np.unravel_index(np.argmax(s), s.shape)
        pts.append((int(x), int(y), float(s[y, x])))
        s *= 1 - np.exp(-(((xx - x) ** 2 + (yy - y) ** 2) / (2 * raio ** 2)))  # inibição de retorno
    return pts


def colormap(v):
    # azul -> ciano -> verde -> amarelo -> vermelho
    stops = np.array([[0, 0, 128], [0, 160, 255], [0, 220, 120], [255, 230, 0], [230, 20, 20]], np.float32)
    x = np.clip(v, 0, 1) * (len(stops) - 1)
    i = np.clip(np.floor(x).astype(int), 0, len(stops) - 2)
    t = (x - i)[..., None]
    return (stops[i] * (1 - t) + stops[i + 1] * t).astype(np.uint8)


def fonte(tam):
    for nome in ("arialbd.ttf", "Arial Bold.ttf", "DejaVuSans-Bold.ttf", "arial.ttf"):
        try:
            return ImageFont.truetype(nome, tam)
        except OSError:
            pass
    return ImageFont.load_default()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("imagem")
    ap.add_argument("--saida", default=None)
    ap.add_argument("--fixacoes", type=int, default=6)
    ap.add_argument("--rotulo", default=None)
    a = ap.parse_args()

    img = Image.open(a.imagem)
    img = ImageOps.exif_transpose(img).convert("RGB")
    nome = a.rotulo or os.path.splitext(os.path.basename(a.imagem))[0]
    out = a.saida or os.path.dirname(os.path.abspath(a.imagem))
    os.makedirs(out, exist_ok=True)

    s, lum = saliencia(img)
    W, H = img.size
    sf = np.asarray(Image.fromarray((s * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), np.float32) / 255

    heat = Image.fromarray(colormap(sf))
    alpha = Image.fromarray((np.clip(sf * 1.4, 0.15, 0.85) * 255).astype(np.uint8))
    calor = img.copy()
    calor.paste(heat, (0, 0), alpha)
    calor.save(os.path.join(out, f"{nome}_calor.png"))

    pts = fixacoes(s, a.fixacoes)
    k = W / s.shape[1]
    fix = Image.blend(img, ImageOps.grayscale(img).convert("RGB"), 0.55)
    d = ImageDraw.Draw(fix)
    rr = max(14, int(min(W, H) * 0.035))
    f = fonte(int(rr * 1.1))
    centros = [(int(x * k), int(y * k)) for x, y, _ in pts]
    for i in range(len(centros) - 1):
        d.line([centros[i], centros[i + 1]], fill=(255, 220, 0), width=max(2, rr // 6))
    for i, (cx, cy) in enumerate(centros, 1):
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(230, 20, 20), outline="white", width=max(2, rr // 7))
        t = str(i)
        bb = d.textbbox((0, 0), t, font=f)
        d.text((cx - (bb[2] - bb[0]) / 2, cy - (bb[3] - bb[1]) / 2 - bb[1]), t, fill="white", font=f)
    fix.save(os.path.join(out, f"{nome}_fixacoes.png"))

    cinza = ImageOps.grayscale(img).convert("RGB")
    desf = img.filter(ImageFilter.GaussianBlur(8 * W / 1000 + 4))

    # painel
    th = 360
    tiles = [(img, "Original"), (calor, "Mapa de calor previsto"), (fix, "Ordem de fixação"),
             (cinza, "Escala de cinza"), (desf, "Desfoque (teste dos 8px)")]
    tw = int(W * th / H)
    pad, top = 16, 40
    pan = Image.new("RGB", (len(tiles) * (tw + pad) + pad, th + top + pad), (18, 18, 20))
    dp = ImageDraw.Draw(pan)
    ft = fonte(18)
    for i, (t, lab) in enumerate(tiles):
        x = pad + i * (tw + pad)
        pan.paste(t.resize((tw, th)), (x, top))
        dp.text((x, 10), lab, fill=(235, 235, 235), font=ft)
    pan.save(os.path.join(out, f"{nome}_painel.png"))

    # números
    hh = s.shape[0]
    tot = s.sum() + 1e-9
    tercos_v = [float(s[i * hh // 3:(i + 1) * hh // 3].sum() / tot) for i in range(3)]
    ww = s.shape[1]
    tercos_h = [float(s[:, i * ww // 3:(i + 1) * ww // 3].sum() / tot) for i in range(3)]
    p = lum.flatten()
    dados = {
        "aviso": "Previsão de atenção bottom-up por saliência. Não é eye-tracking real; não detecta rostos nem lê texto.",
        "imagem": os.path.abspath(a.imagem),
        "tamanho": [W, H],
        "fixacoes_previstas": [
            {"ordem": i + 1, "x_pct": round(x / s.shape[1] * 100, 1), "y_pct": round(y / s.shape[0] * 100, 1),
             "forca": round(v, 3)} for i, (x, y, v) in enumerate(pts)],
        "atencao_por_terco_vertical": {"topo": round(tercos_v[0], 3), "meio": round(tercos_v[1], 3), "base": round(tercos_v[2], 3)},
        "atencao_por_terco_horizontal": {"esquerda": round(tercos_h[0], 3), "centro": round(tercos_h[1], 3), "direita": round(tercos_h[2], 3)},
        "concentracao_top10pct": round(float(np.sort(s.flatten())[::-1][: s.size // 10].sum() / tot), 3),
        "contraste_luminosidade_p95_p5": round(float(np.percentile(p, 95) - np.percentile(p, 5)), 3),
        "arquivos": {k2: os.path.join(out, f"{nome}_{k2}.png") for k2 in ("painel", "calor", "fixacoes")},
    }
    with open(os.path.join(out, f"{nome}_atencao.json"), "w", encoding="utf8") as h:
        json.dump(dados, h, ensure_ascii=False, indent=2)
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    print(json.dumps(dados, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
