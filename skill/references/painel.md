# Painel de análise — a saída padrão

Toda análise termina num **painel visual** (HTML único, abre em qualquer navegador, claro e
escuro automáticos). O texto no chat vira um resumo curto; o painel é o entregável.

```bash
python "<skill>/scripts/painel.py" dados.json painel.html
```
Caminhos de imagem no JSON podem ser relativos ao próprio `dados.json`; o script embute tudo
em base64 (o HTML fica autossuficiente). Salve na pasta de trabalho do usuário e mostre o
arquivo. Se ele quiser compartilhar, publique como Artifact (carregue antes a skill
`artifact-design`).

## Funciona para qualquer entrada

Imagem, vídeo, roteiro, texto/copy, **ideia ou conceito**, campanha, produto, embalagem,
loja/PDV, evento, nome de marca, estratégia, proposta comercial. Sem imagem, o painel simplesmente
não mostra o bloco da peça e do rastreamento; todo o resto funciona. Para ideias, as "seis
leituras" avaliam a **experiência prevista** que a ideia vai gerar no público.

## Seções (todas opcionais, aparecem só se houver dados)

| Seção | Chave no JSON | Para que serve |
|---|---|---|
| Cabeçalho + chips de contexto | `titulo`, `subtitulo`, `contexto{tipo,categoria,publico,canal,objetivo,momento}` | Situa a análise |
| Peça + nota (gauge) + resumo | `imagens.peca`, `nota` (0–5), `emocao`, `resumo` | Veredito em 5 segundos |
| **A ideia de quem criou** | `intencao{ideia,pensar,sentir,fazer,publico}` | A intenção nas palavras do autor — tudo é medido contra ela |
| **Intenção × percepção** | `intencao_percepcao[{aspecto,intencao,percepcao,status,evidencia}]` | Onde a peça entrega e onde se afasta do que o autor quer |
| Seis leituras (cards com barra) | `leituras[{nome,nota 0–10,status verde/amarelo/vermelho,achado,explica}]` | Diagnóstico por etapa do processamento |
| Radar | (gerado das leituras) | Perfil da peça num olhar |
| Checklist dos 10 | `checklist[{nome,status ok/parcial/falha/na,nota}]` | Os 10 conceitos principais |
| Semáforo | `semaforo{verde[],amarelo[],vermelho[]}` | Manter / ajustar / corrigir |
| Correções + matriz impacto×esforço | `correcoes[{titulo,porque,evidencia,ajuste,exemplo,impacto,esforco}]` | O que fazer primeiro |
| Visuais | `imagens.atencao`, `atencao_texto`, `imagens.extras[{src,titulo,texto}]`, `mapa_cerebral` | Mapa de calor, comparações, botão do cérebro 3D |
| **A ciência por trás** | `ciencia[{conceito,evidencia,o_que_diz,aplicacao,fonte}]` | A base científica de cada conclusão, ligada à ideia |
| Caminhos possíveis | `versoes[{nome,descricao,vies,recomendada}]` | Direções A/B/C |
| Vieses escolhidos | `vieses[{nome,evidencia,uso}]` | O que o usuário marcou no menu |
| Para testar | `testar[{hipotese,como}]` | Tudo que é [A TESTAR] |

## Regras de preenchimento

- **Toda seção tem "Como ler"** nas leituras (`explica`): uma frase simples dizendo o que
  aquela leitura mede. Escreva para quem nunca estudou neuromarketing.
- **Ciência:** 3–6 cards, só achados de [evidencia.md](evidencia.md) / [fontes.md](fontes.md),
  cada um com a ligação concreta à ideia em `aplicacao`. Nunca neuroquímica (ver mitos.md).
- **Intenção × percepção:** 3–6 linhas. A percepção é estimativa com base em evidência —
  etiquete. Status `falha` quando a percepção provável contradiz a intenção.
- **Notas das leituras (0–10):** 9–10 exemplar · 7–8 funciona · 5–6 funciona pela metade ·
  3–4 atrapalha · 0–2 bloqueia. Status: ≥7 verde, 5–6 amarelo, ≤4 vermelho.
- **Nota geral (0–5)** segue a escala ROD de [formato-de-saida.md](formato-de-saida.md).
- Frases curtas. Cada achado aponta um elemento concreto da peça ou da ideia.
- Nunca invente número, depoimento ou dado do cliente.
