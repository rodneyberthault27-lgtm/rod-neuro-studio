# ROD-003 | Modelo lógico v3.0 (proposta)

Status: **desenho validável, não implantação**. Referência para Fase 1 e contrato de migração. A especificação SQL de rascunho está em `migrations/0001_studio_v3_draft.sql`. Não executar em produção antes de RLS, autenticação, testes de banco e revisão de segurança.

## Identidades e multitenancy

- `workspaces`: `id uuid`, `name`, `owner_user_id`, `created_at`.
- `memberships`: `workspace_id`, `user_id`, `role`, vinculado à identidade autenticada.
- `projects`: `id uuid`, `workspace_id`, `title`, `status`, `source`, `created_at`, `updated_at`.
- `documents`: `id uuid`, `workspace_id`, `project_id nullable`, `kind`, `revision`, `payload jsonb`, `review_state`, `legacy_collection`, `legacy_id`.
- `asset_references`: `id uuid`, `workspace_id`, `document_id`, `source_url`/referência original, `storage_key nullable`, `state`. Um `/_blob/` não é arquivo migrado.
- `import_runs`: `id uuid`, `workspace_id`, `created_by`, `status`, `report jsonb` e hash do envelope privado.
- `observations` (futuro): medidas reais registradas com fonte, método, período, amostra e verificação; não importar automaticamente `analises.resultados`.
- `science_sources` (futuro): estudos revisados, versões e limitações; não aceitar DOI inventado.

**Versionamento:** edições de uma peça ou análise devem produzir novas revisões; uma peça associada a teste em andamento torna-se imutável. A SQL atual permite revisionamento, mas **a aplicação precisará impor imutabilidade e políticas de publicação**.

## Separação de tipos

`kind` aceitos: `analysis`, `legacy_briefing`, `creative_brief`, `experiment`, `creative_version`, `observation`. O importador ROD-004 gera apenas os quatro primeiros; `observation` fica reservado para coleta verificada. `review_state` inicia `unverified_legacy` ou `needs_link_review`, nunca `verified`.

## Invariantes

- Chaves de projetos, documentos e arquivos não podem atravessar `workspace_id`.
- IDs de origem são preservados; UUIDv5 identifica registros de staging de modo determinístico.
- `project_id = NULL` é permitido no staging para registros órfãos; a UI não deve mostrá-los como projetos completos.
- O frontend não tem acesso direto a chaves administrativas do banco.
- `localStorage` deixa de ser fonte principal; preferências não sensíveis podem permanecer no navegador.
- Conteúdo com classificação `PREVISÃO VISUAL` ou `HIPÓTESE COMPORTAMENTAL` nunca vira `RESULTADO OBSERVADO` automaticamente.

## Etapas de migração

1. **Extração autorizada** fora do Git → envelope JSON conforme `data-inventory-v2.md`.
2. **Validação local / dry run** por `python tools/migrate_legacy.py EXPORT.json --check`.
3. **Staging explícito** por `--stage DIRETORIO` em diretório privado; preserva payloads e lista pendências.
4. Conciliação manual de vínculos, registros duplicados, origem e blobs.
5. Inserção transacional futura na base de homologação, com idempotência por chave de origem e workspace.
6. Comparação de contagens, amostragem por checksum, permissão por usuário, relatório de integridade e rollback.
7. Produção apenas com aceite explícito e snapshots completos.

O passo 5 **não faz parte** do script de Fase 0: não há cliente de banco, autenticação ou sincronização com o Claude implementados aqui.

## Segurança mínima para a Fase 1

O SQL de rascunho habilita Row Level Security sem políticas, bloqueando o uso pelas funções não privilegiadas por padrão. A camada de autenticação deve estabelecer políticas por `workspace_id`, com testes de acesso cruzado, SQL injection, upload e caminhos de storage. Não ativar a aplicação real com service-role no navegador.
