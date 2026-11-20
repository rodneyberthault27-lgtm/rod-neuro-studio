# ROD Neuro Studio 3.0 | Gate de homologação (sem produção)

Status: **teste transacional de RLS executado no Supabase real**, sem Auth/Storage HTTP.
O CI também usa banco PostgreSQL descartável. Nenhuma conta real ou dado do usuário foi acessado.

## Pré-requisitos

- Projeto Supabase **de homologação**, separado de qualquer operação real.
- Domínio e callback autenticado autorizados no Auth.
- Migrações SQL `20261117000000_rod_v3.sql` e
  `20261117010000_rod_hardening.sql` e `20261117020000_rod_function_grants.sql` aplicadas nesta ordem.
- Bucket `rod-private` privado, MIME restrito, 10 MiB.
- Chave **publicável** somente no ambiente de homologação; nenhuma service-role em cliente.
- Usuários de teste A (owner), B (viewer em A) e C (não membro). Sem dados pessoais reais.

## Matriz de testes obrigatória

| Caso | A owner | B viewer | C não membro |
| --- | --- | --- | --- |
| Ler o projeto A | Permitir | Permitir | Negar |
| Criar e editar título do projeto A | Permitir | Negar | Negar |
| Alterar workspace_id, created_by, id | Negar a todos no cliente | Negar | Negar |
| Criar e consultar briefing draft | Permitir | Apenas consultar | Negar |
| Criar diagnóstico verificado diretamente | Negar | Negar | Negar |
| Enviar arquivo até 10 MiB (mime permitido) | Permitir | Negar | Negar |
| Visualizar arquivo via URL temporária | Permitir | Permitir enquanto membro | Negar |
| Acessar `rod-private` publicamente | Negar | Negar | Negar |
| Enviar arquivo com path de outro workspace | Negar | Negar | Negar |
| Enviar arquivo com nome fora do UUID permitido | Negar | Negar | Negar |

## Fluxo ponta a ponta

1. Login e logout; confirmar redirecionamento e expiração de sessão.
2. Owner cria workspace e projeto; recarrega em nova sessão e confirma persistência.
3. Owner edita título, público, objetivo e canal; checa autoria imutável.
4. Owner cria um briefing. Verifica `review_state=draft` e ausência de
   atualização ou exclusão direta, preservando versão.
5. Owner envia uma imagem **sintética** e abre URL assinada; confirmar que
   a URL expira, e que o acesso exige permissão no momento da emissão.
6. B entra como viewer atribuído pelo administrador em homologação, não por edição de
   `rod_memberships` no navegador; tenta ações de escrita, todas negadas.
7. C confirma que nem projetos nem metadados de ativos vazam.
8. Testar upload vazio, MIME falso, mais de 10 MiB, path inválido e arquivo PDF sintético.
9. Medir erros de interface, renderização em viewport 390 px, logs e recursos carregados.
10. Reverter um ambiente de homologação descartável para demonstrar rollback.

## Condições que impedem publicação

- Falha de autenticação, RLS ou autorização entre workspaces.
- Bucket público, URLs sem expiração, dados reais no Git ou segredo no bundle.
- Falha no build, TypeScript, testes de unidade, CI ou migração SQL.
- Divulgação de mapas de saliência como eye-tracking humano ou de hipóteses como dados.
- Migração de `/_blob/` apenas com URL, sem arquivo e acesso autorizado.
- Ausência de controles de abuso em upload, revisão de PDFs, quotas e plano de recuperação.
- Falta de backup, rollback, revisão de política de privacidade e LGPD.

## Decisão de release

Só habilitar aplicação na hospedagem server-side depois que testes reais em homologação
forem comprovados. Manter o site legado e `main` inalterados até aprovação explícita.
A migração de dados do Claude permanece uma frente separada, com exportação autorizada
e revisão de conteúdo antes de qualquer importação.

## Homologação parcial no Supabase real (17/11/2026)

Projeto: `rod-neuro-studio-staging` (`sa-east-1`).

- Três migrations aplicadas: `rod_v3_initial`, `rod_v3_hardening` e
  `rod_v3_function_grants`. Seis tabelas com RLS e bucket `rod-private` privado.
- Exercício transacional **no banco Supabase real** com três identidades sintéticas:
  proprietário, visualizador e usuário não membro. Usou `SET LOCAL ROLE` e
  `request.jwt.claim.sub`; **não foi um teste de login Auth**.
- Projetos e briefings sintéticos criados e consultados durante a transação:
  proprietário leu e escreveu; visualizador leu, mas não inseriu; usuário
  sem associação não viu workspace, projeto ou documento.
- Regras impediram alterar autoria, gravar `review_state=verified` diretamente,
  upload por visualizador e leitura por não membro no helper de paths.
- Verificada a revogação de `EXECUTE` anônimo das funções privilegiadas.
- `ROLLBACK` ao final. Recontagem confirmou zero contas, workspaces,
  projetos, documentos e objetos armazenados.
- A aplicação agora contém ação **Criar exemplo com briefing**, disponível
  somente depois do login em `/studio` e de criar/selecionar workspace.
  O botão usa as APIs existentes, RLS e validações do backend. Não insere
  dados automaticamente e não configura usuários reais.

**Não validado ainda:** cadastro/login Auth pelo navegador, persistência entre
sessões, upload binário por Storage, URL assinada e expiração, bloqueio
de objetos em requisição HTTP e isolamento por JWTs reais. É necessária
hospedagem server-side separada para a aplicação Next.js e contas de teste
autorizadas. A versão legada permanece isolada.

**Pendências de release:** verificação de segurança restante, controle de
cadastros, limites de abuso e upload, antivírus/inspeção de PDF, LGPD
e plano de rollback.

## Fase 2 | Proteção de origem e aplicação de homologação

Todos os endpoints POST/PATCH autenticados validam o cabeçalho Origin e rejeitam
requisições sem Origin ou de outra origem, complementando cookies SameSite
e políticas RLS. Existe cobertura automatizada para as seis rotas mutáveis,
incluindo cadastro de workspaces, projetos, documentos, upload e logout.

A implementação exige HTTPS na hospedagem real (HTTP liberado somente
para localhost). Se um proxy for usado, ele deve preservar o URL público
em request.url; não confiar em Host/X-Forwarded-Host fornecido pelo cliente.
A aplicação nunca utiliza service_role nem segredo no bundle do navegador.

Estado de deploy: **não publicado**. A integração com o provedor de
hospedagem não está autorizada a partir do repositório neste estágio.
Login real e Storage HTTP ainda aguardam testes ponta a ponta.
