# ROD Neuro Studio — onde toda análise vai parar

**URL:** https://claude.ai/artifact/N5j12nqmu7FWk8AHHxzcG7 (Artifact privado do Rodney; só ele abre).
Fonte da página: `assets/rod-neuro-studio.html` desta skill (cópia de segurança; a versão publicada
é a do link).

Abas:
- **Painel** — diagnóstico com selos dos 3 níveis.
- **Laboratório** — mecanismos que atacam as barreiras do público, cérebro 3D, efeito
  qualitativo nas leituras, estudos clicáveis (sem placar numérico). Botão "Virar briefing".
- **Creative Lab** — os mecanismos ligados viram direção de fotografia, luz, composição,
  layout, tipografia, cor, copy, roteiro e vídeo, com specs por canal (feed, vertical,
  WhatsApp, marketplace, e-mail, landing, PDV). Cada diretriz diz se é *Evidência* ou *Prática
  de ofício*. Gera briefing completo com o Claude (lista de fotos, 3 títulos, CTA) e salva em
  `briefings`.
- **Jornada e Atlas** — jornada da decisão (perceber → entender → sentir → avaliar → agir →
  lembrar) com leitura, barreira e mecanismos por etapa; atlas do cérebro clicável (processo,
  mecanismos, limite, estudos).
- **Comparar A × B** — duas análises lado a lado; botão para registrar o teste.
- **Testes** — registro A × B com veredito estatístico.
- **Aprendizados** — o que os testes mostram por mecanismo no público do usuário, barreiras
  mais comuns, aprendizados escritos e "regras da casa" geradas pelo Claude.
- **Histórico** · **Pergunte ao Claude**.

Os três níveis aparecem como selos: *Previsão visual* (mapa de atenção), *Hipótese
comportamental* (leituras, mecanismos, cérebro, ciência) e *Resultado observado* (só com
`resultados` reais).

## Como publicar uma análise no Studio (padrão de toda análise)

1. **Imagens** (peça, rastreamento, comparações): suba com o Artifact tool —
   `action: "publish"`, `url` do Studio, `asset: true`, `file_paths: [...]`. Use o `url`
   devolvido (`/_blob/<id>`) nos campos de imagem.
2. **Documento:** monte o JSON no mesmo esquema do painel ([painel.md](painel.md)) e acrescente:
   - `criado`: data/hora ISO (ordena o histórico; mais recente primeiro).
   - `imagens`: `{peca, atencao, extras:[{src,titulo,texto}]}` com os `/_blob/...`.
   - `simulador`: `{ativas:[ids], sugeridas:[ids]}` — as cartas **já presentes** na peça/ideia
     e as que você recomenda testar (ids abaixo). As notas das `leituras` devem refletir a peça
     com as cartas `ativas`; o jogo calcula a partir daí.
   - `objetivo_comportamental`: o comportamento a mudar, numa frase (do cartão).
   - `barreiras`: `[{id, peso: alto|médio|baixo, porque}]` — ids: `atencao` (não percebe),
     `compreensao` (não entende rápido), `relevancia` (não acha que é para ele), `confianca`
     (não confia), `esforco` (dá trabalho agir), `valor` (não vê valor no preço), `urgencia`
     (deixa para depois), `memoria` (não lembra na hora da compra).
   - `resultados` (só com dados reais): `[{metrica, valor, periodo, amostra, conclusao}]`.
     Nunca preencha com estimativa: o selo é "Resultado observado".
   - `ciencia[].link` (opcional): URL do estudo; sem ela, o Studio gera uma busca no Google
     Acadêmico a partir de `fonte`. Não invente DOI.
   - `cerebro` (opcional): `[{id, intensidade}]` com ids do atlas de
     [ferramentas-visuais.md](ferramentas-visuais.md) — usado quando nenhuma carta está ligada.
3. **Grave** com `ArtifactData` → `action: "set"`, `collection: "analises"`,
   `doc_id: "AAAA-MM-DD-slug"` (ex.: `2026-11-15-logo-rod`), `file_path` do JSON. Para
   corrigir uma análise já gravada: leia (`get`) e use `update` com `if_version`.
4. Mande ao usuário o link do Studio e diga qual análise abrir (o seletor no topo já abre a
   mais recente).

Se o Studio não estiver acessível (outra conta, sem conexão), gere o painel local com
`scripts/painel.py` como alternativa.

## Cartas do Laboratório (ids válidos) e barreiras que atacam

| Deck | id | Carta | Barreiras |
|---|---|---|---|
| Atenção | `rosto` | Rosto humano | atencao, confianca |
| | `olhar_cta` | Olhar apontando para a ação | esforco, atencao |
| | `contraste` | Contraste forte no principal | atencao, compreensao |
| | `surpresa` | Quebra de padrão / surpresa | atencao, memoria |
| Emoção | `historia` | História de uma pessoa real | relevancia, memoria, confianca |
| | `estado_final` | Mostrar o resultado desejado | relevancia, valor |
| | `som` | Voz, música ou jingle | memoria |
| | `sensorial` | Toque, cheiro ou sabor | confianca, memoria |
| Confiança | `prova_social` | Prova social com número real | confianca, relevancia |
| | `garantia` | Garantia e troca claras | confianca, valor |
| | `halo` | Visual caprichado | confianca |
| | `autoridade` | Especialista ou selo relevante | confianca |
| Decisão | `cta_unico` | Um botão claro, uma ação | esforco |
| | `ancora` | Preço com referência real | valor |
| | `perda` | Mostrar o custo de não agir | urgencia |
| | `escassez_real` | Prazo ou vaga real, explicado | urgencia |
| | `default` | Opção recomendada já marcada | esforco |
| Memória | `marca_repetida` | Elemento da marca repetido | memoria, atencao |
| | `final_forte` | Final marcante | memoria |
| Armadilhas | `elementos_demais` | Elementos demais | piora: atencao, compreensao |
| | `jargao` | Texto difícil / jargão | piora: compreensao, confianca |
| | `superlativo` | "O melhor" sem prova | piora: confianca |
| | `escassez_falsa` | Contador ou estoque falso (alerta legal) | piora: confianca (+ risco legal) |
| | `dois_ctas` | Vários botões do mesmo peso | piora: esforco |

Armadilhas presentes na peça entram em `ativas` (o usuário vê o ganho ao desligá-las).
Nunca coloque `escassez_falsa` em `sugeridas`.

## Como escolher as `sugeridas`

Para cada barreira marcada, sugira 1–2 mecanismos que a atacam (tabela acima), priorizando
ouro (ROBUSTO). Não sugira mais de 4 no total.

## Briefings (Creative Lab)

Coleção `briefings`: `{analise_id, titulo, canal, mecanismos:[ids], texto, criado}`. Quando o
usuário pedir um briefing no chat, monte com as diretrizes do Creative Lab (mesmos
mecanismos e canal) e grave aqui para aparecer em "Briefings salvos".

## Mudanças no próprio Studio

Novas cartas, abas ou layout: edite `assets/rod-neuro-studio.html`, publique no mesmo `url`
(o banco e as análises continuam) e copie de volta para a skill.

## Testes (Validation Lab) — quando o usuário manda números

Aba **Testes** do Studio, coleção `testes`. O usuário pode lançar pela própria página; quando
ele mandar os números no chat, grave você:

```json
{
  "titulo": "Avatar original × avatar novo",
  "criado": "2026-12-15T10:00:00Z",
  "status": "planejado | rodando | concluido",
  "hipotese": "Mostrar a garantia reduz a barreira de confiança e aumenta pedidos.",
  "metrica": "Pedidos pelo WhatsApp",
  "base_nome": "Pessoas alcançadas",
  "publico": "…", "canal": "…", "periodo": "1 a 14/12",
  "analise_a": "<doc_id em analises ou vazio>", "analise_b": "…",
  "a": {"nome": "Original", "base": 12000, "conv": 180, "inv": 600},
  "b": {"nome": "Novo", "base": 11800, "conv": 236, "inv": 600},
  "aprendizado": "…"
}
```

`ArtifactData` → `set`, `collection: "testes"`, `doc_id: "AAAA-MM-DD-slug"`. O Studio calcula
sozinho: taxa de cada versão com margem de erro (95%), diferença em p.p. e relativa, faixa
provável, p-valor (teste de duas proporções), custo por conversão e estimativa exploratória para planejar uma nova rodada (não serve como regra de parada do teste atual). Veredito de vitória **somente** após p < 0,05, pelo menos 30 conversões em cada versão, status `concluido`, hipótese/métrica/período registrados e confirmação explícita `plano_ok: true` de randomização, comparabilidade e plano pré-definido. Sem esses requisitos: sinal ou inconclusivo. O usuário ainda deve examinar relevância prática, qualidade dos dados e riscos de viés.

Regras ao falar do resultado no chat:
- Use as mesmas contas do Studio (não arredonde para parecer melhor).
- Inconclusivo é resultado válido: não estime quantos participantes “faltam” usando a diferença observada; use amostra planejada antes do teste.
- Não aceite "parar quando ficou bom": peça o período combinado antes do teste.
- Métrica só binária (converteu / não converteu). Para faturamento, use pedidos como
  conversão e informe o ticket à parte.
- Escreva o `aprendizado` ligando o resultado à hipótese e às barreiras da análise.

## Estado da integração local (15/11/2026)

- Fonte editada e testada: assets/rod-neuro-studio.html.
- Símbolo fiel em assets/rod-simbolo-original.svg, integrado ao cabeçalho com cor do tema; geometria conferida contra o SVG original na pasta Logo ROD - Versoes do projeto.
- Cérebro 3D: giro, transparência, atlas e vistas lateral, frente, cima e trás no Studio; o mapa representa processos associados, não ativação neural.
- Testes A/B: contagens inteiras não negativas, explicação corrigida do p-valor, confirmação do planejamento e status concluído antes do veredito.
- QA: python scripts/validar_studio.py; node scripts/smoke_browser.js; python scripts/smoke_assets.py. O arquivo QA-resultado.txt documenta o teste Chromium.
- Publicação: o Artifact privado no claude.ai NÃO recebe mudanças apenas porque o HTML local foi editado. É necessário atualizar a fonte do Artifact existente (preservando URL e banco) e validar o resultado online. Não criar outro Artifact nem afirmar sincronização sem comprová-la.

## Design editorial v3 — revisão visual local

O código em assets/rod-neuro-studio.html já incorpora o CSS de assets/rod-redesign.css, portanto o HTML é autossuficiente para usar no Claude Artifact sem depender de carregamento CSS relativo.

- Cabeçalho e navegação responsivos, hierarquia tipográfica, grid e cartões minimalistas, usando o símbolo ROD original sem alterar seu desenho.
- Paleta clara e escura; o botão Modo claro/escuro grava apenas a preferência no navegador local.
- O botão Ver exemplo aparece somente quando não há banco do Claude. Carrega duas análises sintéticas em memória para avaliação visual dos módulos. O aviso DEMONSTRAÇÃO LOCAL identifica os dados como fictícios, e Sair do exemplo limpa o estado local.
- No Artifact hospedado, o botão de demonstração permanece oculto quando a integração com o banco está presente, preservando análises e históricos reais.
- Ao alterar o CSS fonte, reembuta-o no HTML para manter o Artifact autossuficiente. O script scripts/apply_redesign.py é de aplicação inicial, não deve ser reexecutado sobre uma versão já marcada como V3.
- Verificar com python scripts/validar_studio.py, node scripts/smoke_browser.js e node scripts/test_redesign.js.
- A publicação online no Claude não foi realizada; a atualização aqui é exclusivamente da skill e do Studio local.
