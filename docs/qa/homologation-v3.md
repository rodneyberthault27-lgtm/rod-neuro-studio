# ROD Neuro Studio 3.0 | Gate de homologação (sem produção)

Status atual: **não executado no Supabase real**. O CI usa um banco PostgreSQL descartável
com esquema reduzido do Supabase. Nenhuma conta, arquivo ou credencial do usuário é acessada.

## Pré-requisitos

- Projeto Supabase **de homologação**, separado de qualquer operação real.
- Domínio e callback autenticado autorizados no Auth.
- Migrações SQL `20261117000000_rod_v3.sql` e
  `20261117010000_rod_hardening.sql` aplicadas nesta ordem.
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
