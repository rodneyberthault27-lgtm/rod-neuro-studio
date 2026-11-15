from pathlib import Path
import shutil, re, xml.etree.ElementTree as ET
root = Path(r"C:\Users\rodne\.claude\skills\neuromarketing-completo")
source = root/"assets"/"rod-neuro-studio.html"
logo_source = Path(r"D:\ROD\ROD\Neuromarketing\03 Projetos e Propostas\Logo ROD - Versoes\ROD_simbolo.svg")
archive = Path(r"D:\ROD\ROD\Neuromarketing\02 Skills e Prompts\neuromarketing-completo-pre-finalizacao-2026-11-15")
if not archive.exists():
    shutil.copytree(root, archive)
print("Backup:", archive)
original_logo = logo_source.read_text(encoding="utf-8")
shutil.copy2(logo_source, root/"assets"/"rod-simbolo-original.svg")
html = source.read_text(encoding="utf-8")
def change(old, new):
    global html
    n = html.count(old)
    if n != 1: raise RuntimeError(f"Esperada uma ocorrência, encontrada {n}: {old[:90]}")
    html = html.replace(old, new)
m = re.search(r'<g fill="#000">(.*)</g>\s*</svg>', original_logo, re.S)
if not m: raise RuntimeError("SVG original não pôde ser lido")
geom = m.group(1).replace('stroke="#000"','stroke="currentColor"')
embedded = '<svg viewBox="300 50 230 380" aria-label="Símbolo ROD" role="img"><g fill="currentColor">' + geom + '</g></svg>'
old = re.search(r'<svg viewBox="300 50 230 380" aria-hidden="true">.*?</svg>', html, re.S)
if not old: raise RuntimeError("Logo anterior não encontrado")
change(old.group(0), embedded)
def shapes(xml):
    r = ET.fromstring(xml)
    return [(e.tag.split('}')[-1],e.attrib.get('d'),e.attrib.get('cx'),e.attrib.get('cy'),e.attrib.get('r'),e.attrib.get('transform')) for e in r.iter() if e.tag.split('}')[-1] in ('path','circle','g')]
assert shapes(original_logo) == shapes(embedded), "Geometria do logo alterada"
if not html.startswith('<meta charset="utf-8">'):
    html='<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n'+html
change('.stage .vis{position:absolute;right:10px;bottom:10px;display:flex;gap:6px}',
       '.stage .vis{position:absolute;right:10px;bottom:10px;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;max-width:calc(100% - 20px)}')
for suffix in ['', '2']:
    old=f'<div class="vis"><button type="button" id="b3dGira{suffix}">Parar</button><button type="button" id="b3dVidro{suffix}">Sólido</button></div>'
    new=f'<div class="vis"><button type="button" class="b3dView" data-view="side">Lateral</button><button type="button" class="b3dView" data-view="front">Frente</button><button type="button" class="b3dView" data-view="top">Cima</button><button type="button" class="b3dView" data-view="back">Trás</button><button type="button" id="b3dGira{suffix}">Parar</button><button type="button" id="b3dVidro{suffix}">Sólido</button></div>'
    change(old,new)
change('    toggleRotate(){if(!controls)return false;', '''    setView(which){
      if(!controls||!camera)return false;
      const v={side:[-3.7,.95,1.35],front:[0,.28,4.1],top:[0,4.3,.05],back:[0,.25,-4.1]}[which];
      if(!v)return false;
      controls.autoRotate=false;
      camera.position.set(...v);camera.lookAt(controls.target);controls.update();
      return true;
    },
    toggleRotate(){if(!controls)return false;''')
for suffix, host in [('', 'left'),('2','at')]:
    old=f'  {host}.querySelector("#b3dVidro{suffix}").onclick=e=>{{const solid=brain.toggleGlass();e.target.textContent=solid?"Transparente":"Sólido";}};'
    new=old+f'\n  {host}.querySelectorAll(".b3dView").forEach(b=>b.onclick=()=>{{if(brain.setView(b.dataset.view)){host}.querySelector("#b3dGira{suffix}").textContent="Girar";}});'
    change(old,new)
change('Regiões acesas = associadas aos mecanismos ligados no Laboratório.','Marcadores coloridos = associações conceituais com mecanismos do Laboratório, não medições de atividade cerebral.')
change('Regiões associadas aos processos dos mecanismos ligados · arraste para girar','Mapa ilustrativo, não exame neural · arraste para girar')
change('Toque numa bolinha para abrir a região · arraste para girar','Atlas esquemático (sem dados neurais) · clique no marcador · arraste para girar')
change('if(xA>nA||xB>nB) return {ok:false,msg:"Conversões não podem ser maiores que a base."};',
'''if(![nA,nB,xA,xB].every(Number.isInteger)||xA<0||xB<0)
    return {ok:false,msg:"Informe números inteiros não negativos para pessoas e conversões."};
  if(xA>nA||xB>nB) return {ok:false,msg:"Conversões não podem ser maiores que a base."};''')
change('  const poucas=Math.min(xA,xB)<30;',
'''  const poucas=Math.min(xA,xB)<30;
  const confirmado = t.status==="concluido" && t.plano_ok===true && !!String(t.hipotese||"").trim()
                     && !!String(t.metrica||"").trim() && !!String(t.periodo||"").trim();''')
change('  if(p<0.05&&!poucas){ vk="ok"; veredito=(d>0?"B":"A")+" venceu — a diferença provavelmente é real."; }',
'''  if(p<0.05&&!poucas&&confirmado){ vk="ok"; veredito=(d>0?"B":"A")+" teve maior conversão no teste concluído. Confira integridade e relevância prática."; }
  else if(p<0.05&&!poucas){ vk="warn"; veredito="Diferença estatisticamente detectável a favor de "+(d>0?"B":"A")+". Só declare vencedor após concluir e confirmar o plano do teste."; }''')
change('<span class="lab">Chance de ser só acaso (p)</span>', '<span class="lab">p-valor (hipótese nula)</span>')
change('<div class="note">abaixo de 5% costuma indicar diferença real</div>','<div class="note">Não é a chance de a hipótese ou o resultado serem verdadeiros. Exige teste válido.</div>')
change('<span class="lab">Amostra para detectar esta diferença</span>', '<span class="lab">Amostra exploratória para teste futuro</span>')
html,n=re.subn(r'Faltam cerca de \x24\{falta.toLocaleString\("pt-BR"\)\} por versão\. Não encerre o teste antes: parar quando o número "fica bom" é a principal causa de vitória falsa\.', 'Estimativa baseada no efeito observado, NÃO é critério para continuar ou encerrar este teste.', html)
if n!=1:raise RuntimeError("Mensagem de amostra não encontrada")
change('Amostra suficiente para esta diferença (poder de 80%).','Estimativa retrospectiva; use cálculo prospectivo para nova rodada.')
html=html.replace('o Studio diz se a diferença é real ou ruído.','o Studio estima incerteza, sem substituir randomização e um plano previamente definido.')
change('        <h2>As versões e os números</h2>', '''        <h2>As versões e os números</h2>
        <label style="display:flex;align-items:flex-start;gap:8px;font-size:13px"><input type="checkbox" id="tPlano" style="width:auto;margin-top:2px" /> Confirmo que a distribuição foi aleatória, a métrica e o encerramento foram definidos antes do teste e os grupos são comparáveis.</label>''')
change('  f.querySelector("#tSt").value=t.status||"planejado";','''  f.querySelector("#tSt").value=t.status||"planejado";
  f.querySelector("#tPlano").checked=t.plano_ok===true;''')
change('  const atual_=()=>{ f.querySelectorAll("[data-f]").forEach(el=>t[el.dataset.f]=el.value);',
'''  const atual_=()=>{ t.plano_ok=f.querySelector("#tPlano").checked; f.querySelectorAll("[data-f]").forEach(el=>t[el.dataset.f]=el.value);''')
source.write_text(html,encoding="utf-8")
print("HTML alterado:",source,len(html),"bytes; SVG fiel.")
