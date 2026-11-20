# ROD Neuro Studio | Design System v3 (branch, não publicado)

## Origem e limites
Este primeiro redesenho foi fundamentado nos arquivos do próprio repositório:
\`skill/SKILL.md\`, \`references/protocolo-v2.md\`,
\`references/neurodesign.md\` e \`references/cor-forma-tipografia.md\`.

A pasta local \`D:\ROD\Neuromarketing\` não estava acessível: o dispositivo
Desktop Commander "Rod" estava offline. **O conteúdo específico dessa pasta
não foi lido**; esta fase não afirma incorporar materiais inéditos nela.
O conteúdo poderá ser revisado quando o dispositivo estiver online.

## Sistema editorial de laboratório
- Paleta: fundo mineral #F4F3EF, cards #FFFFFF, tinta #172321,
  navegação #101B19 e acento funcional #176C61.
- Tipografia: Space Grotesk para títulos, Inter para corpo e mono
  para metadados, níveis e etapas. Identidade ROD original preservada.
- Grid: trilho lateral, barra de contexto, três camadas de evidência,
  uma ação principal por bloco, formulários claros e responsividade.
- O redesenho utiliza contraste e agrupamento, não associa cores
  a "emoções cerebrais" de forma pseudocientífica.

## IA e evidência
Sete módulos estruturais: Diagnóstico, Attention Lab, Behavior Lab,
Estudos/Atlas, Neuro Map no painel de projeto, Creative Lab e Validation Lab.
A interface legada preserva as funções existentes e mostra explicitamente
os limites de cada camada. Não atribuir resultado de testes sem dados reais.

## Attention Lab
Nova rota #atencao importa arquivo local PNG/JPEG/WebP (máx 10 MB)
e calcula uma **heurística local de saliência por diferença luminosa,
gradientes de vizinhança e saturação**. A interface permite comparar
original, mapa previsto, cinza e desfoque e exportar uma prévia.
Não há coleta ocular, inferência de gaze, validação em participantes,
serviço de IA, coleta de dados, nem armazenamento no Supabase.
Atenção visual é previsão aproximada, não medição empírica.

## Restrições
Este commit altera somente \`feature/studio-v3\`; \`main\`,
o site publicado em ChatGPT Sites e o Claude Artifact permanecem
intocados. A publicação exigirá preview e QA em navegador.
