# ROD-004 | Protocolo de inventário e exportação privada

**Estado:** preparado, aguardando exportação autorizada na conta proprietária do Claude e acesso ao navegador/origem que contém `rodns.projects.v1`. O repositório GitHub não contém esses documentos nem os bytes de `/_blob/`. Nenhuma leitura do banco privado foi feita nesta fase.

## Extração segura

1. Abra o Artifact original autenticado; identifique as coleções `analises`, `briefings` e `testes` que realmente existem. Anote quantidades e dados ausentes **sem divulgar nomes de clientes ou conteúdo sensível**.
2. Use somente exportação disponibilizada e autorizada pelo ambiente. Não automatizar coleta de credenciais, cookies ou APIs internas não autorizadas.
3. Exporte `id` real de cada documento **junto** com seu payload. Se os objetos não tiverem `id` no payload, acrescente o ID do documento fornecido oficialmente.
4. No site local/browser, exporte manualmente os projetos que deseja migrar; o JSON da chave `rodns.projects.v1` não é sincronizado entre navegadores. Diferencie `rodns.theme` e `rodns.analise` (preferências).
5. Se houver imagens no Artifact com `/_blob/...`, identifique o arquivo correspondente e baixe apenas quando tiver acesso autorizado. Copiar a URL não migra o arquivo.
6. Una os registros no envelope `rod-legacy-v1` documentado em `docs/architecture/data-inventory-v2.md`. Mantenha o original como backup privado separado.
7. Rode o **dry run** local, revise os problemas e só então use `--stage` em local privado para emitir JSONL. O staging **não grava no banco**.

## Comandos

```bash
python tools/migrate_legacy.py /caminho/privado/export.json --check
python tools/migrate_legacy.py /caminho/privado/export.json --stage /caminho/privado/staging-rod
```

`--stage` falha se a pasta já existir, para não sobrescrever revisões anteriores. Arquivos de staging contêm dados brutos: **não incluir em commits, anexos públicos ou relatórios compartilhados**. Exigir armazenamento privado, retenção definida e descarte seguro ao encerrar a migração.

## Pendências reportadas

- `MISSING_ID` ou `DUPLICATE_ID`: não fabricar IDs novos.
- `ORPHAN_BRIEFING`: referência a análise ausente; reconciliar manualmente.
- `UNRESOLVED_EXPERIMENT_LINK`: teste não associa todas as versões.
- `CROSS_PROJECT_EXPERIMENT`: preservar vínculo explícito entre análises diferentes, sem mesclar projetos automaticamente.
- `LEGACY_RESULT_UNVERIFIED`: dados ou conclusões preservados no legado, não considerados evidência observada verificada.
- `ASSET_REQUIRES_EXPORT`: imagem blob, data URI ou link externo ainda não migrada.
- `INVALID_DATE`: data preservada exatamente como origem, precisa de conferência.

## Gate de segurança

A importação real exige: acesso autenticado, consentimento/autorizações pertinentes, planilha de contagens antes/depois, hashes dos arquivos, revisão dos resultados e RLS comprovada. Sem essas condições, manter o material em staging e reportar pendências. Nunca concluir que a migração do Claude está feita com base em JSON sintético.
