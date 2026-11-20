# ROD-003 | Inventário do contrato legado

Fonte auditada: branch main em `78d3db0a9c8b9a7cf5ea9d2fd4d7ce020276d2b3`, documentos `skill/references/studio.md`, `painel.md`, `rod-experience.js` e `index.html`. Esta análise descreve **estruturas documentadas/código**, não dados de usuários exportados. Nenhuma coleção privada foi lida.

## Origens distintas

| Origem | Onde o código lê/grava | Formato | Garantia atual |
| --- | --- | --- | --- |
| `claude.analises` | `DB.collection("analises")` | Documento com id atribuído pelo banco, títulos e análises | Existente somente no ambiente Claude |
| `claude.briefings` | `DB.collection("briefings")` | `{analise_id,titulo,canal,mecanismos,texto,criado}` | Dependente do banco Claude |
| `claude.testes` | `DB.collection("testes")` | Documento A/B com id e variantes | Dependente do banco Claude |
| `browser.local` | `localStorage["rodns.projects.v1"]` | Array de projetos/briefings; seleção em `rodns.analise` | Só no navegador/origem que gravou |
| `artifact.assets` | URLs `/_blob/<id>` | Referências de arquivo, não bytes portáveis | Só resolvem no ambiente original |

O site independente **não** pode ler as coleções do Artifact, e um export JSON do navegador não constitui backup dos documentos do Claude. Um documento legado `analises` pode representar uma análise **ou um projeto com** `status_analise="briefing"`. Não existe entidade de projeto com ID de tenant no contrato original.

## Campos observados / documentados

### `analises`
- Identidade: `id` (chave do documento na coleção); `titulo`, `criado` ISO quando presente.
- Contexto: `contexto.{tipo,categoria,publico,canal,objetivo,momento}`.
- Intenção: `intencao.{ideia,pensar,sentir,fazer,publico}`; `objetivo_comportamental`.
- Interpretação: `nota` (heurística 0–5), `emocao`, `resumo`, `intencao_percepcao[]`, `leituras[]` (seis notas heurísticas 0–10), `checklist[]`, `semaforo`, `correcoes[]`, `versoes[]`.
- Ciência: `ciencia[]`, `vieses[]`, `testar[]`, `barreiras[]` e `simulador.{ativas,sugeridas}`.
- Visuais: `imagens.{peca,atencao,extras[]}`, `cerebro[]`, `mapa_cerebral`.
- Campo de estado observado no novo fluxo: `status_analise="briefing"` indica análise pendente, **não** diagnóstico concluído.
- `resultados[]` podem constar no documento legado; **não** serão automaticamente tratados como resultados medidos e verificados.

### `briefings`
- `id` (doc id ao exportar), `analise_id`, `titulo`, `canal`, `mecanismos[]`, `texto`, `criado`.
- `analise_id` é opcional/ausente em alguns fluxos possíveis. Se não houver análise correspondente, **não vincular por título**; manter para conciliação manual.

### `testes`
- `id`, `titulo`, `criado`, `status` (`planejado|rodando|concluido`), `hipotese`, `metrica`, `base_nome`, `publico`, `canal`, `periodo`, `plano_ok`.
- `analise_a`, `analise_b` podem ser vazios ou apontar para análises distintas.
- `a` e `b` contêm `{nome,base,conv,inv}`; `aprendizado` é texto livre.
- **Regra da migração:** conservar valores legados para revisão; **não** marcar resultados como verificados, conclusões causalmente demonstradas ou calcular vencedores no processo de importação.

### `browser.local`
- `id`, `titulo`, `contexto`, `intencao`, `objetivo_comportamental`, `barreiras`, `imagens`, `status_analise` e outros campos, conforme wizard.
- `rodns.theme` e `rodns.analise` são preferências de navegador, **não** projetos a importar.
- Projetos exportados manualmente da UI podem ser incorporados ao envelope em `local_projects`.

## Envelope de exportação para a etapa de conciliação

```json
{
  "export_format": "rod-legacy-v1",
  "collections": {"analises": [], "briefings": [], "testes": []},
  "local_projects": []
}
```

Cada registro deve incluir **`id` ou `doc_id` original**. Os formatos reais exportados precisam ser inspecionados antes de rodar com dados reais. Não publicar os JSONs no Git.

## Mapeamento inicial

| Origem | Destino de staging | Vínculo |
| --- | --- | --- |
| `claude.analises` | `projects` + `documents(kind=analysis|legacy_briefing)` | 1 projeto por id original de análise, **sem deduplicação** |
| `browser.local` | `projects` + `documents(kind=legacy_briefing)` | 1 projeto por id local, origem separada |
| `claude.briefings` | `documents(kind=creative_brief)` | `analise_id` somente se existir; demais pendentes |
| `claude.testes` | `documents(kind=experiment)` | `analise_a` se conhecida; guardar `analise_b` e alertar projetos distintos |
| `imagens` | `asset_references` | Referência pendente de obtenção e validação |
| `resultados[]` | Apenas dentro de payload legado | Sem materialização em `observations` até verificação |

Use IDs determinísticos UUIDv5 derivados de **origem + id legado**, sem depender de nomes ou títulos. O arquivo exportado precisa permanecer intacto como origem de comparação, preservado fora do Git e com acesso restrito.

## Critérios de aceite ROD-003

1. Cada campo importante e relacionamento possui destino definido.
2. Nenhuma análise, briefing ou teste recebe vínculo inventado.
3. Resultados não comprovados são preservados como legado, não como observação verificada.
4. Logs e relatórios não imprimem dados sensíveis ou o conteúdo integral dos documentos.
5. O processo é determinístico, auditável e reversível até que exista um banco e um fluxo de importação real.
