# ROD Neuro Studio 3.0 — baseline protegida

Status: Fase 0, ROD-001. Inventário obtido em 2026-11-16.
Este documento descreve o ponto de partida e não é um registro de migração concluída.

## Origem

- Repositório privado: rodneyberthault27-lgtm/rod-neuro-studio
- Branch de produção: main
- Commit de referência: 78d3db0a9c8b9a7cf5ea9d2fd4d7ce020276d2b3
- Git tree do commit de referência: 5a5a87956101c793059cde85d47736e36200f7fb
- Branch de trabalho: feature/studio-v3
- Site a preservar: https://rod-neuro-studio.rodead.chatgpt.site
- Site estático: .openai/hosting.json aponta para dist/

## Três cópias da interface (iguais na baseline)

| Arquivo | Git blob SHA |
| --- | --- |
| index.html | b4d3543a65f5bcd2c6a4e1ad5acef4803577260b |
| dist/index.html | b4d3543a65f5bcd2c6a4e1ad5acef4803577260b |
| skill/assets/rod-neuro-studio.html | b4d3543a65f5bcd2c6a4e1ad5acef4803577260b |

Os arquivos CSS e JS autorais utilizados no build ficam em rod-experience.css e rod-experience.js.
O build.py injeta os dois arquivos no HTML e gera as cópias. O pipeline de Fase 0 valida
a igualdade das cópias e a presença do código-fonte embutido. Futuras mudanças no build
devem ser determinísticas e rejeitar drift.

## Critérios de preservação

1. Não atualizar a main, o Artifact privado ou a publicação Sites nesta fase.
2. Não compartilhar dados de clientes, tokens, arquivos de clientes ou imagens privadas com o Git.
3. Não concluir que o banco de dados do Claude foi exportado; coleções de análises, briefings,
   testes e arquivos _blob/ continuam sujeitos a inventário e exportação autorizada.
4. Não confundir notas heurísticas de 0–10, modelos de saliência ou atlas cerebral
   com medição de atenção, atividade neural ou desempenho observado.
5. Antes de produção: migração reversível, testes de segurança, acessibilidade, dados, CI
   e plano de rollback.

## Dependências e limitações da baseline

- Backend e IA do Claude: window.claude.use('db'), sample e assets.
- Site independente: localStorage (não sincronizado entre dispositivos).
- WebGL: Three.js r128 e OrbitControls via CDN.
- Script de atenção: Python, NumPy, Pillow; declara saída como previsão, não eye-tracking.
- Testes legados: caminhos Windows absolutos; novos testes portáveis ficam sob tests/.
- O código legado contém __pycache__ versionado, apesar de .gitignore o ignorar para novos arquivos.

## ROD-001: entregue / não entregue

Entregue: branch isolada, SHA de referência, manifesto de integridade, testes de baseline.
Não entregue: cópia autenticada do banco do Claude, snapshot dos blobs privados,
auditoria de vulnerabilidades, homologação do novo backend e deploy.
