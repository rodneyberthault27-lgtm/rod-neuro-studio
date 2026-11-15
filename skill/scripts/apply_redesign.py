"""Aplica redesign editorial v3 sem modificar os dados nem a publicação do Claude."""
from pathlib import Path
import shutil
root=Path(r"C:\Users\rodne\.claude\skills\neuromarketing-completo")
src=root/"assets"/"rod-neuro-studio.html"
backup=Path(r"D:\ROD\ROD\Neuromarketing\02 Skills e Prompts\Studio-pre-design-v3-2026-11-15.html")
if not backup.exists():
    shutil.copy2(src,backup)
html=src.read_text(encoding="utf-8")
assert "/* ROD V3 DESIGN SYSTEM" not in html, "Redesign já aplicado"
def change(old,new):
    global html
    n=html.count(old)
    if n!=1: raise RuntimeError(f"Esperado 1 ocorrência, encontrado {n}: {old[:90]}")
    html=html.replace(old,new)
css=(root/"assets"/"rod-redesign.css").read_text(encoding="utf-8")
change('</style>\n\n<header class="top">',css+'\n</style>\n\n<header class="top">')
change('  <nav class="tabs" aria-label="Seções">','''  <div class="workspace-tools"><button type="button" id="demoSwitch" hidden>Ver exemplo</button><button type="button" id="themeSwitch">Modo claro</button></div>
  <nav class="tabs" aria-label="Seções">''')
old='<div role="note" style="max-width:1200px;margin:12px auto 0;padding:10px 16px;border-radius:10px;background:var(--soft, #f3f3f3);font-size:12px;line-height:1.5"><b>Três camadas de evidência:</b> previsão visual ≠ eye-tracking · hipótese comportamental ≠ atividade cerebral medida · resultado observado = teste real.</div>'
new='''<div class="evidence-strip" role="note"><strong>EVIDÊNCIA EM TRÊS CAMADAS</strong> &nbsp; Previsão visual ≠ eye-tracking &nbsp; / &nbsp; Hipótese comportamental ≠ medição cerebral &nbsp; / &nbsp; Resultado observado = teste real</div>
<div class="demo-flag" id="demoFlag" role="status" hidden>DEMONSTRAÇÃO LOCAL. Todo dado exibido é fictício, apenas para conhecer a interface. Nenhuma análise ou resultado é salvo.</div>'''
change(old,new)
change('function marcarAba(){ document.querySelectorAll(".tabs a").forEach(a=>a.setAttribute("aria-current", a.getAttribute("href")==="#"+rota()?"page":"false")); }',
'''const MODULE_NAMES={painel:"01 · Diagnóstico",simulador:"02 · Laboratório",creative:"03 · Creative Lab",jornada:"04 · Jornada e Atlas",comparar:"05 · Comparar A/B",testes:"06 · Validação",aprendizados:"07 · Aprendizados",historico:"08 · Histórico",pergunte:"09 · Pergunte ao Claude"};
function marcarAba(){const r=rota();view.dataset.module=MODULE_NAMES[r];document.querySelectorAll(".tabs a").forEach(a=>a.setAttribute("aria-current",a.getAttribute("href")==="#"+r?"page":"false"));}''')
change('const sel = document.getElementById("selAnalise");',
'''const sel = document.getElementById("selAnalise");
const themeSwitch=document.getElementById("themeSwitch");
const demoSwitch=document.getElementById("demoSwitch");
const demoFlag=document.getElementById("demoFlag");
function effectiveTheme(){
  const v=document.documentElement.dataset.theme;
  return v==="dark"||v==="light"?v:(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
}
function updateThemeLabel(){const dark=effectiveTheme()==="dark";themeSwitch.textContent=dark?"Modo claro":"Modo escuro";themeSwitch.setAttribute("aria-label","Ativar modo "+(dark?"claro":"escuro"));}
try{const saved=localStorage.getItem("rodns.theme");if(saved==="light"||saved==="dark")document.documentElement.dataset.theme=saved;}catch(e){}
updateThemeLabel();
themeSwitch.onclick=()=>{const next=effectiveTheme()==="dark"?"light":"dark";document.documentElement.dataset.theme=next;try{localStorage.setItem("rodns.theme",next)}catch(e){}updateThemeLabel();};''')
demo=(root/"scripts"/"demo_injection.txt").read_text(encoding="utf-8")
change('let carregou=false;\nfunction iniciar(){',demo+'\nlet carregou=false;\nfunction iniciar(){')
change('if(!db){ clearTimeout(timer); carregou=true; preencherSelect(); render(); return; }','if(!db){ clearTimeout(timer); carregou=true; demoSwitch.hidden=false; preencherSelect(); render(); return; }')
src.write_text(html,encoding="utf-8")
print("OK: redesenho V3 aplicado em",src)
print("Backup anterior:",backup)
