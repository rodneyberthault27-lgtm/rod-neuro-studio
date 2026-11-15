# Medição — como provar em vez de alegar

Todo achado **[A TESTAR]** sai da análise com um teste proposto. Sem isso, a skill produz
opinião bem escrita, que é exatamente o produto que ela existe para substituir.

---

## O QUE PODE E O QUE NÃO PODE SER MEDIDO

| Pergunta | Mede-se com | Não serve |
|---|---|---|
| A peça é notada? | Scroll stop rate, taxa de retenção nos 3s, eye-tracking | Perguntar "chamou sua atenção?" |
| Entende-se em segundos? | Teste dos 5 segundos com 5–8 pessoas de fora | Opinião da equipe |
| Qual emoção ativa? | Resposta aberta de uma palavra, 10+ pessoas | Escala Likert de 7 pontos |
| Lembra-se da marca? | Recall sem ajuda em 24–48h | Reconhecimento com o logo na frente |
| Converte mais? | A/B test com amostra calculada | Comparar semana a semana |

**Regra que evita a maior parte dos erros:** preferência declarada não prevê comportamento.
Perguntar "qual você prefere?" mede articulação verbal, não escolha. Quando puder medir
comportamento, meça comportamento.

---

## O TESTE DOS 5 SEGUNDOS

Mais barato e mais informativo do que parece. Faça antes de qualquer A/B test.

1. Mostre a peça por 5 segundos e tire da frente.
2. Pergunte, nesta ordem: (a) do que se trata? (b) para quem é? (c) o que eles querem que
   você faça?
3. Rode com 5 a 8 pessoas **fora do projeto e dentro do público**.

Se 3 em 5 erram (a) ou (c), o problema é de clareza e não há motivo para testar variação de
copy ainda. Corrija a hierarquia primeiro.

---

## A/B TEST — o mínimo para não se enganar

### Calcule a amostra antes, não depois
Olhar o resultado e parar quando ficar bom (*peeking*) é a causa número um de "ganho" que
não se repete. Fixe o tamanho da amostra e o prazo antes de ligar o teste.

Regra de bolso para detectar um efeito relativo de 10% com poder de 80% e α de 5%:

| Conversão base | Visitantes por variante (aprox.) |
|---|---|
| 1% | ~155.000 |
| 2% | ~77.000 |
| 5% | ~29.000 |
| 10% | ~14.000 |
| 20% | ~6.000 |

Use uma calculadora de tamanho de amostra para o seu caso. O ponto desta tabela é outro:
**na maioria dos sites brasileiros de volume médio, um teste honesto de +10% em conversão
de 2% é inviável.** Reconhecer isso é mais útil que rodar o teste e acreditar no ruído.

### Quando não dá amostra
Três saídas legítimas, nesta ordem:

1. **Teste efeito grande.** Mudança estrutural (remover um passo, trocar a oferta, mudar o
   default) move número o suficiente para ser detectável. Micro-copy de botão não.
2. **Meça etapa anterior.** A taxa de clique no CTA tem muito mais volume que a compra. Se
   a hipótese é sobre atenção ou clareza, meça atenção ou clareza.
3. **Teste qualitativo e assuma.** 5 testes dos 5 segundos + gravação de sessão informam
   melhor que um A/B test subdimensionado. Registre como decisão com evidência fraca, e
   revisite.

### Efeito mínimo que vale testar
Se você não pode detectar menos de +20% relativo, não teste hipótese que no melhor caso
entrega +5%. Priorize por tamanho esperado do efeito, não por facilidade de implementação.

---

## INTERPRETAÇÃO — os erros que mais aparecem

**Significância não é tamanho de efeito.** Um p-valor inferior a 0,05 indica que, sob a hipótese nula e as premissas do teste, dados tão ou mais extremos seriam relativamente raros. Não fornece a probabilidade de a hipótese ser verdadeira ou de o resultado ser “mero acaso”. Reporte intervalo de confiança, diferença absoluta e relevância prática. Sem randomização, plano pré-definido e comparabilidade das versões, não declare efeito causal.

**Ganho de 300% em base pequena é ruído.** Com 40 conversões por variante, qualquer coisa
parece acontecer.

**Novidade decai.** Ganho da primeira semana costuma encolher. Teste no mínimo um ciclo
semanal completo, de preferência dois.

**Segmento garimpado não conta.** Achar o ganho em "mobile, orgânico, São Paulo" depois do
teste é encontrar padrão em ruído. Segmento se declara antes.

**Teste um mecanismo por vez.** Mudar hero, CTA e prova social juntos e ganhar não ensina
nada — e você não saberá o que replicar.

---

## O LOOP DE APRENDIZADO

Mantenha um registro por projeto. Cinco colunas bastam:

| Data | Hipótese (mecanismo + direção) | Nível declarado | Resultado + IC | O que mudou na crença |
|---|---|---|---|---|

A última coluna é a que importa. Um teste que não muda crença nenhuma foi mal desenhado —
ou você já sabia a resposta, ou a hipótese não era falsificável.

Depois de 10 linhas, você sabe quais mecanismos funcionam **na sua categoria e no seu
público**, o que vale mais que qualquer tabela genérica de neuromarketing — esta incluída.


---

## FERRAMENTAS NEURO E FISIOLÓGICAS — o que cada uma mede de verdade

| Ferramenta | Mede | Não mede | Uso honesto |
|---|---|---|---|
| Eye-tracking | Onde e por quanto tempo o olho pousa | Desejo, intenção, entendimento | Hierarquia, achar CTA, embalagem na gôndola |
| Mapa de saliência (IA) | Previsão de atenção bottom-up | Atenção top-down, interesse | Triagem barata de criativo; validar com teste real |
| EEG | Variação temporal de ativação/engajamento | "Emoção X" específica | Comparar momentos de vídeo; exige laboratório sério |
| GSR / EDA | Excitação (arousal) | Valência (bom ou ruim) | Picos de intensidade em experiência/vídeo |
| fEMG / codificação facial (FACS) | Movimento facial | Emoção sentida (ver Barrett 2019) | Indicador fraco; não use sozinho |
| fMRI | Ativação regional | "Botão de compra" (inferência reversa) | Pesquisa acadêmica; algum poder preditivo agregado |
| Testes implícitos (tempo de reação) | Força de associação marca–atributo | Comportamento de compra | Checar se o ativo/atributo "colou" |
| A/B e dados de comportamento | O que as pessoas fazem | Por quê | Padrão-ouro para decisão |

**Regra:** neuro e biometria explicam *por que*; comportamento decide *se funcionou*.
Ferramenta de IA que "prevê a resposta neural" é [A TESTAR] até mostrar validação fora da
amostra.

## TESTE NO MUNDO FÍSICO (PDV)

Sem laboratório, a ciência é a mesma e muda a régua: caderno, contador de visitas, olhos
atentos. Uma mudança por vez, 2–3 semanas, alternância A/B por semana, controlando dia, clima,
promoção e movimento. Métricas: parada na vitrine, taxa de entrada, permanência, tempo até achar
o produto, ticket médio, avaliações.
