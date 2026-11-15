# Formato de saída

Use exatamente esta estrutura no modo **Diagnóstico**. Nos outros modos, corte o que a
tabela de modos no SKILL.md manda cortar.

Regra que vale para todo campo: **toda afirmação aponta para um elemento concreto da peça**
e carrega seu nível de evidência quando faz uma alegação de mecanismo. Nunca escreva um
parágrafo que serviria para qualquer peça.

---

## ESTRUTURA

```
## Resumo executivo

Atenção:   [1 linha — o que o olho acha primeiro, e se é o certo]
Carga:     [1 linha — quanto custa entender]
Emoção:    [1 palavra + 1 linha. Se não dá uma palavra, diga "nenhuma identificável"]
Memória:   [1 linha — o que sobra sem a peça na frente]
Confiança: [1 linha — qual das 4 dúvidas fica de pé]
Decisão:   [1 linha — a próxima ação é óbvia?]

## Contexto lido

Categoria · público · canal · momento da jornada · ação única pedida.
[Se algum desses não estava claro na peça, diga. É achado, não falha sua.]

## Diagnóstico

[As seis leituras, nesta ordem, só as que têm algo a dizer. Pare de escrever quando
acabar o que há de concreto. Cada achado nomeia o elemento: "o título de 4 linhas",
"o terceiro CTA", "a foto de banco no hero".]

## Semáforo da peça

Verde    — [o que está funcionando e por quê. Se nada, diga.]
Amarelo  — [o que funciona pela metade]
Vermelho — [o que está custando resultado agora]

## Correções priorizadas

1. Problema:  [elemento concreto]
   Por quê:   [mecanismo] [ROBUSTO|CONTEXTUAL|A TESTAR]
   Ajuste:    [o que fazer, específico]
   Exemplo:   [o texto/valor/medida exato, pronto para usar]
   Impacto:   [alto|médio|baixo] · Esforço: [alto|médio|baixo]

2. ...
3. ...

[Ordene por impacto ÷ esforço. Máximo 5. Mais que isso não é prioridade, é lista.]

## Versão A — Emocional
Título · direção visual · copy · CTA
Emoção-alvo: [uma palavra]

## Versão B — Racional
Título · direção visual · copy · CTA
Dúvida que elimina: [qual das 4]

## Versão C — Aspiracional
Título · direção visual · copy · CTA
Estado final mostrado: [qual]

## A testar

[Só o que ficou [A TESTAR]. Hipótese + teste concreto + o que mediria.
Se a amostra não dá, diga e proponha a saída — ver medicao.md.]

## Conclusão

Esta peça gera [X] e facilita/atrapalha [Y].
[Duas frases. Sem recapitular. A conclusão diz o que fazer na segunda-feira.]
```

---

## ESCALA DE QUALIDADE

Use para fechar o diagnóstico com uma nota, quando o usuário pedir ou quando a peça vai
para cliente.

| Nota | Critério | O que fazer |
|---|---|---|
| 5/5 | Passa nas seis leituras | Entrega |
| 4/5 | Um ponto amarelo | Entrega com a nota explícita |
| 3/5 | Dois amarelos, ou um vermelho de baixo impacto | Revisar antes de apresentar |
| 2/5 | Um vermelho de alto impacto | Refazer a parte problemática |
| 1/5 | Falha em atenção ou clareza | Voltar ao briefing — o problema é anterior à peça |

**1/5 não é peça ruim, é diagnóstico no lugar errado.** Se a peça falha em atenção, não
adianta discutir copy, cor ou CTA. Diga isso em vez de listar 12 correções.

---

## O QUE NÃO FAZER NA SAÍDA

- **Não elogie para amaciar.** "O design está bonito, mas…" não informa. Se o visual
  funciona, diga o que nele funciona e por quê.
- **Não liste 12 correções.** Cinco no máximo, ordenadas. Lista longa é diagnóstico sem
  priorização, e o cliente não executa nenhuma.
- **Não invente número.** Nem "+34% de conversão", nem "87% dos usuários". Se não tem
  fonte, diga a direção esperada e proponha o teste.
- **Não cite autor na peça de cliente.** O nível de evidência vai na análise interna; na
  apresentação, vira "sustentado por experimento de campo" ou "é hipótese nossa, testável".
- **Não recomende o que o lint reprova.** Ver a seção de conflitos em
  [diagnostico.md](diagnostico.md).
- **Não escreva parágrafo genérico.** O teste: se a frase serve para a peça de outro
  cliente, apague.


---

## OUTROS MODOS

- **Criação/Copy:** formato em [copy-e-vieses.md](copy-e-vieses.md), seção 8.
- **Sensorial/PDV:** formato em [sensorial-pdv.md](sensorial-pdv.md), última seção.
- **Recriar peça:** `Diagnóstico (3 problemas) · Nudge aplicado [etiqueta] · Peça refeita`
  (HTML com CSS inline se pedirem), com os seis critérios: hierarquia (um ponto de entrada),
  foco único (uma mensagem, um CTA), benefício humano (ganho sentido, não característica),
  contraste (leitura em 3 s), direção do olhar (estímulo → CTA), gatilho nomeado. Variações:
  uma por nudge (perda, posse, prova social), todas honestas.
- **Explicar/Ensinar:** conceito correto em 2–3 frases → exemplo de marketing → onde está o
  mito/limite → como aplicar com ética. Em resposta de prova, seja fiel ao conteúdo do curso e
  acrescente a ressalva científica numa linha quando o material simplifica.
- **Jornada (5 As):** tabela etapa × ponto de contato on/off × leitura neuro × gargalo ×
  alavanca × métrica.

---

## CHECKLIST DOS 10 CONCEITOS (acrescente ao fim do Diagnóstico)

```
Checklist dos 10
 1 Atenção seletiva ........ ✅/⚠️/❌  [elemento concreto]
 2 Emoção e memória ........ ✅/⚠️/❌
 3 Fluência cognitiva ...... ✅/⚠️/❌
 4 Prova social ............ ✅/⚠️/❌/— (não se aplica: por quê)
 5 Aversão à perda ......... ✅/⚠️/❌/—
 6 Ancoragem ............... ✅/⚠️/❌/—
 7 Enquadramento ........... ✅/⚠️/❌
 8 Recompensa e antecipação  ✅/⚠️/❌
 9 Redução de risco ........ ✅/⚠️/❌/—
10 Distintividade e repetição ✅/⚠️/❌
```
Um item por linha, apontando o elemento da peça. Os ❌ alimentam as correções priorizadas.
