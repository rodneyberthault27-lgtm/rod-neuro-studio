# ROD Neuro Studio

Da hipótese comportamental à decisão criativa.

Workspace visual de neuromarketing com Painel, Laboratório de hipóteses, Creative Lab, Jornada e Atlas 3D, Comparador A × B, Testes, Aprendizados e Histórico.

## Studio privado

https://claude.ai/artifact/N5j12nqmu7FWk8AHHxzcG7

## Arquivos

- `index.html`: código-fonte do Studio.
- `skill/`: instruções, referências, scripts e templates de neuromarketing.

## Execução

Abra `index.html` em um navegador para consultar a interface. As funcionalidades de IA e persistência usam `window.claude` no ambiente de Artifacts do Claude. Publicar este código no GitHub não migra o banco, não implementa autenticação e não transforma a página automaticamente em um SaaS independente.

Os dados de análises, testes, briefings e os arquivos armazenados no Artifact continuam no Claude; não estão exportados neste repositório. Algumas imagens usam endereços internos `/_blob/` que só resolvem nesse ambiente.

## Desenvolvimento

O repositório guarda o código e a skill. Para hospedagem independente serão necessários autenticação, banco de dados, armazenamento de imagens e um backend de IA.

## Nova experiência ROD

- Tela **Seu projeto** com cérebro 3D girável, regiões clicáveis e seis processos explicados em linguagem simples.
- Identidade baseada no logo fornecido: preto, branco quente e títulos com lettering de marcador.
- **Novo projeto** orienta material, público, sensação, comportamento e barreiras antes da análise.
- Fora do Claude, os briefings ficam no navegador e podem ser exportados em JSON. Um briefing não recebe diagnóstico nem notas automáticas.
- Regiões internas abrem em transparência. As cores identificam processos associados; não representam ativação medida.
- Os módulos de diagnóstico, criação, comparação e validação continuam disponíveis.

`index.html` é autocontido. Para alterar a camada nova, edite `rod-experience.css` e `rod-experience.js`, depois execute `python build.py`. O script sincroniza o HTML e a cópia em `skill/assets/`.

Veja [a prévia](docs/rod-preview.jpg), [as decisões de interface](docs/rod-experiencia.md) e [o registro de validação](docs/validacao-experiencia.md).

## Uso

Projeto privado da ROD. Sem licença de redistribuição concedida.
