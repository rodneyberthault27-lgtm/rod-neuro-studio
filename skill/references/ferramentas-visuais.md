# Ferramentas visuais — rastreamento de atenção e mapa cerebral 3D

Duas saídas visuais que a skill gera. As duas são **modelos explicativos**, não medições do
público. Diga isso em uma linha na entrega, sem drama.

Caminho dos scripts: `~/.claude/skills/neuromarketing-completo/scripts/` (no Windows,
`C:\Users\rodne\.claude\skills\neuromarketing-completo\scripts\`). Requer Python com numpy e
Pillow. Salve as saídas na pasta de trabalho do usuário (não no scratchpad), para ele abrir.

---

## 1. RASTREAMENTO DE ATENÇÃO PREVISTO (mapa de calor)

```bash
python "<skill>/scripts/atencao.py" "<imagem>" --saida "<pasta>" --fixacoes 6 --rotulo nome
```

Gera `nome_painel.png` (original · calor · ordem de fixação · cinza · desfoque),
`nome_calor.png`, `nome_fixacoes.png` e `nome_atencao.json`.

**O que o modelo considera:** contraste de luminosidade, oposição de cor (vermelho-verde,
azul-amarelo), resíduo espectral (o que destoa do padrão da imagem) e viés central. Ordem de
fixação com inibição de retorno.

**O que ele NÃO sabe — corrija na leitura, olhando a imagem:**
- **Rostos e olhos** atraem mais do que o modelo prevê. Se há rosto, ele provavelmente é
  fixação 1 ou 2, e a direção do olhar dele arrasta o olhar seguinte.
- **Texto grande** é lido por quem busca algo (top-down); o modelo só vê contraste.
- **Movimento** (vídeo) não entra; analise frames-chave separadamente (0 s, 1 s, 3 s, final).
- **Contexto de feed**: a peça compete com vizinhas; para o teste de categoria, monte um grid
  com concorrentes numa imagem só e rode o script nele.

**Como ler o resultado (escreva assim na entrega):**
1. Fixação 1 é a mensagem principal ou o CTA? Se é decoração, hierarquia invertida.
2. O CTA aparece nas 3–4 primeiras fixações? Se não, falta contraste/escala nele.
3. `concentracao_top10pct` alta (> ~0,35) = atenção focada; baixa = atenção dispersa
   (tudo disputa).
4. Escala de cinza: se a hierarquia some, ela dependia de matiz.
5. Desfoque: o que ainda se lê é o que o feed vê de relance.
6. Terços (topo/meio/base, esquerda/centro/direita): onde está a atenção × onde está a ação.

Etiqueta: previsão de saliência bottom-up é **[ROBUSTO]** como fenômeno, e o modelo é
**[CONTEXTUAL]** como previsor. Para decisão cara, valide com eye-tracking real ou teste dos 5
segundos com 5–8 pessoas do público.

Mostre o `_painel.png` ao usuário (leia a imagem antes de comentar e cite números do JSON).

---

## 2. MAPA CEREBRAL 3D GIRÁVEL

```bash
python "<skill>/scripts/mapa_cerebral.py" dados.json mapa.html
```

O HTML independente abre em navegador compatível: arrastar gira, rolar aproxima, botões de vista (lateral, frente, cima, baixo). No ROD Neuro Studio integrado, as vistas são lateral, frente, cima e trás, além de pausar o giro e alternar a transparência. Clicar numa região mostra processo, limites e estudos associados. Para compartilhar, publique o HTML como Artifact (privado por padrão).

### O que o mapa representa — e o que não representa
Mostra **regiões que a literatura associa aos processos psicológicos que a ação envolve**
(atenção a rosto, valor, memória, emoção, dor de pagar…). A `intensidade` é o **peso relativo
daquele processo na ação**, decidido por você a partir da evidência — **não** é ativação
medida. O cérebro trabalha em rede; dizer "acende o estriado, então o cliente quer" é
inferência reversa (Poldrack, 2006). O aviso padrão do HTML já diz isso; mantenha.

### Atlas — ids, processos e gatilhos de marketing típicos

| id | Região | Processo | Ações que costumam envolver | Evidência da ligação |
|---|---|---|---|---|
| `visual` | Córtex visual (occipital) | Contraste, cor, borda, movimento | Gancho visual, contraste, cor de destaque, movimento | ROBUSTO |
| `fusiforme` | Giro fusiforme | Rostos, objetos, palavras escritas | Rosto, olhar, embalagem reconhecível, logo, tipografia | ROBUSTO |
| `parietal` | Parietal / intraparietal | Atenção dirigida, onde/como, números | Busca, navegação, tabela de preço, comparação numérica | ROBUSTO |
| `tpj` | Junção temporoparietal | Reorientar para o inesperado; mentalizar o outro | Quebra de padrão, história de pessoa, depoimento, humor | CONTEXTUAL |
| `auditivo` | Córtex auditivo | Som, voz, música, ritmo | Jingle, voz, trilha, ambiente sonoro de loja | ROBUSTO |
| `s1` | Somatossensorial | Tato, textura, temperatura | "Pode tocar", amostra, embalagem tátil | ROBUSTO |
| `motor` | Motor / pré-motor | Planejar/simular ação | Mão usando produto, demonstração, CTA de gesto | A TESTAR (simulação) |
| `dlpfc` | Pré-frontal dorsolateral | Controle, comparação deliberada ("S2") | Comparativo, ficha técnica, B2B, decisão de alto risco | CONTEXTUAL |
| `ofc` | Orbitofrontal / vmPFC | Valor subjetivo, agradabilidade, integrar emoção | Preço/âncora, marca premium, estética, sabor, aroma | CONTEXTUAL |
| `acc` | Cingulado anterior | Conflito, esforço, dor social | Fricção, escolha difícil, exclusão, confirmshaming (evitar) | CONTEXTUAL |
| `insula` | Ínsula | Sensação corporal, nojo, risco, "dor de pagar", paladar | Preço exposto, risco, nojo/higiene, degustação | CONTEXTUAL |
| `amigdala` | Amígdala | Relevância emocional, ameaça, novidade | Perda, medo, surpresa, rosto expressivo, cheiro ruim | CONTEXTUAL |
| `hipocampo` | Hipocampo | Memória episódica, contexto, lugar | História, experiência de loja, final memorável, repetição | ROBUSTO |
| `estriado` | Estriado ventral | Antecipação de recompensa, "querer", erro de predição | Estado final desejado, novidade, recompensa variável, oferta | CONTEXTUAL |
| `olfativo` | Via olfativa | Cheiro; acesso direto a emoção/memória | Aroma de loja, assinatura olfativa, higiene | ROBUSTO |
| `hipotalamo` | Hipotálamo | Fome, sede, temperatura, excitação | Food porn, bebida gelada no calor, conforto térmico | CONTEXTUAL |

### Mapeamento rápido ação → regiões (ponto de partida; ajuste ao caso)
- **Rosto no gancho / influenciador:** fusiforme, visual, tpj, amígdala (se expressivo).
- **Preço, âncora, desconto:** ofc, ínsula, parietal (número), estriado (oferta).
- **Escassez / perda:** amígdala, ínsula, ofc — e dlpfc se o público desconfiar.
- **Prova social com pessoas:** tpj, fusiforme, ofc.
- **História / depoimento:** hipocampo, tpj, auditivo (voz).
- **Aroma / PDV sensorial:** olfativo, amígdala, hipocampo, ofc.
- **Música / sonic branding:** auditivo, hipocampo, estriado (expectativa musical).
- **Toque / amostra:** s1, motor, ofc.
- **Comparativo técnico / B2B:** dlpfc, parietal, acc (se houver conflito).
- **Default / pré-seleção:** pouca deliberação — dlpfc baixo; mostre isso como *menos*
  esforço, não como "região do default".
- **Comida / bebida:** hipotálamo, ínsula (paladar), ofc, olfativo.

Use 4–9 regiões; mais que isso vira árvore de Natal e não informa nada.

### Formato do dados.json
```json
{
  "titulo": "Nome curto da ação",
  "acao": "Uma a três frases descrevendo a ação",
  "regioes": [
    {"id": "fusiforme", "intensidade": 0.9, "porque": "frase ligando elemento da peça ao processo", "evidencia": "ROBUSTO"}
  ]
}
```
