# Fase 0: verificação portátil

Estes testes protegem o Studio existente enquanto a versão integrada é desenvolvida.
Não usam conta do Claude, dados de clientes, site de produção nem scripts dependentes do PC Rod.

## Teste estático e de atenção

Instale Python 3.13 e Node 22 e execute:

    python -m pip install numpy==2.3.4 Pillow==12.0.0
    python -m unittest discover -s tests -p 'test_*.py' -v
    python skill/scripts/validar_studio.py

## Teste de interface

    python -m pip install playwright==1.56.0
    python -m playwright install chromium
    python tests/browser_smoke.py

O teste de navegador depende de CDN externo de Three.js na versão legada; uma falha
de rede pode tornar o teste inconclusivo. A Fase 1 deverá trazer as dependências 3D para
o próprio build com versões fixadas e isolar a simulação visual.

## O que estes testes NÃO demonstram

- Não testam autenticação ou gravação em bancos reais.
- Não migram análises, briefings, testes nem assets do Claude.
- Não auditam segurança de produção ou cumprimento da LGPD.
- Não comprovam respostas de IA ou observações humanas de atenção.
- Não fazem deploy. O workflow não possui permissão de escrita e só roda em branch/PR.

Baseline: docs/architecture/baseline-v2.md.

## ROD-003/004: migração em dry run

O contrato legado e o modelo lógico estão em `docs/architecture/`.
O export privado não vem do repositório e não é produzido por este teste.

    python tools/migrate_legacy.py tests/fixtures/legacy_synthetic.json --check

Para exportações privadas autorizadas:

    python tools/migrate_legacy.py /private/rod-legacy-private.json --check
    python tools/migrate_legacy.py /private/rod-legacy-private.json --stage /private/staging-private

Sem `--stage`, a ferramenta não escreve arquivos; com `--stage`, emite JSONL
somente na pasta nova fornecida. Não acessa Claude, banco ou serviços remotos.
Dados observados do legado não recebem status verificado.
