"""Teste Chromium portátil; não grava nenhum dado real nem publica o site."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
URL = (ROOT / "index.html").resolve().as_uri()

def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, args=[
            "--use-gl=angle", "--enable-webgl", "--disable-gpu-sandbox"
        ])
        try:
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            errors = []
            page.on("pageerror", lambda err: errors.append(str(err)))
            page.goto(URL + "#painel", wait_until="domcontentloaded", timeout=30000)
            page.locator("#view").wait_for(timeout=15000)
            assert page.title() == "ROD Neuro Studio"
            assert "Nenhuma análise" in page.locator("#view").inner_text()
            for route in ["simulador", "creative", "jornada", "comparar",
                          "testes", "aprendizados", "historico", "pergunte"]:
                page.evaluate("(route) => location.hash = '#' + route", route)
                page.wait_for_timeout(170)
                assert page.locator("#view").inner_text().strip(), route
            page.evaluate("() => location.hash = '#projeto'")
            page.locator("#rodNew").wait_for(timeout=10000)
            page.locator("#rodNew").click()
            page.locator("#rodWizard").wait_for(timeout=10000)
            assert "Novo projeto" in page.locator("#view").inner_text()
            page.set_viewport_size({"width":390, "height":844})
            page.evaluate("() => location.hash = '#painel'")
            page.wait_for_timeout(200)
            widths = page.evaluate("() => ({view:innerWidth,doc:document.documentElement.scrollWidth})")
            assert widths["doc"] <= widths["view"] + 4, widths
            assert not errors, errors[:5]
            print("OK: rotas, wizard, layout mobile e ausência de erros JS")
        finally:
            browser.close()

if __name__ == "__main__":
    main()
