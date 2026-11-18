# ROD Neuro Studio 3.0 | Fase 1

Workspace privado em Next.js e Supabase. A versão online antiga em dist/ não é substituída.
A nova aplicação fica em apps/web e requer um Supabase separado para funcionamento autenticado.

## O que está implementado no código

- Login por e-mail e senha e cadastro sujeito à política configurada no Supabase.
- Cookies SSR via @supabase/ssr e proxy para refresh da sessão no Next.js 16.
- Identidade verificada no servidor com Auth getUser() em toda API protegida.
- Workspaces com criação transacional via RPC e permissões Row Level Security.
- Cadastro e edição de projetos, documentos e briefings append-only (rascunho).
- Upload privado de PNG/JPG/WebP/PDF até 10 MiB, com URL temporária de visualização.
- SQL com políticas de acesso por workspace e bucket de Storage privado.
- Validações Zod, testes unitários, build TypeScript e pipeline GitHub Actions.

Não implementado nesta fase: integração de IA, diagnóstico automático, sincronização Claude Artifact, migração real de clientes, convite de usuários, billing ou deploy no domínio online atual. Os sete laboratórios são explicitamente marcados como pendentes.

## Rodar localmente

1. Crie um projeto Supabase de homologação separado.
2. Revise e aplique no SQL Editor a migração supabase/migrations/20261117000000_rod_v3.sql da raiz do repositório.
3. Verifique que o bucket rod-private é privado e que as policies foram criadas.
4. No Supabase Auth, permita http://localhost:3000 e http://localhost:3000/auth/callback.
5. Configure e-mail de confirmação e política de signups. Para workspace privado, crie sua conta e depois restrinja novos cadastros.
6. Copie apps/web/.env.example para apps/web/.env.local e preencha APENAS a URL e chave publicável.
7. No diretório apps/web, execute:

    npm install
    npm run typecheck
    npm test
    npm run dev

8. Acesse http://localhost:3000/studio, faça login, crie workspace/projeto/documento e anexe um arquivo.

## Testar build sem credenciais

    cd apps/web
    npm install
    npm run typecheck
    npm test
    npm run build

Sem URL e chave, a tela do Studio exibe um setup seguro. O build em CI não comprova integração real.

## Limitações e segurança

- Validar RLS com DOIS usuários de workspaces diferentes e um viewer antes de usar dados de clientes.
- Não usar chave service_role no navegador nem incluir credenciais no Git.
- Validação MIME, tamanho e magic bytes NÃO substitui antivírus, inspeção robusta de PDF ou rate limiting.
- Storage e Postgres não compartilham transação; o endpoint tenta remover o blob caso falhe a gravação dos metadados. Reconciliador de órfãos fica para próxima etapa.
- Documentos são imutáveis nesta fase. O Validation Lab com resultados científicos não está integrado.
- Este código não faz deploy, não atualiza a versão antiga e não recupera documentos do Claude.

## Gate de homologação (Fase 1.1)

Aplicar as migrations `20261117000000_rod_v3.sql` e
`20261117010000_rod_hardening.sql` **nesta ordem** em um
Supabase de homologação separado. Nunca usar dados de clientes para testes iniciais.

A migration de hardening restringe UPDATE a título, público, objetivo e canal,
mantendo IDs, workspace, autoria e estados protegidos. Os caminhos de arquivo
devem coincidir com o workspace e projeto e terminar em UUID válido e extensão
permitida. O GitHub Actions executa smoke tests dessas regras em PostgreSQL
descartável, mas isso não substitui um teste com Auth e Storage reais.

Checklist de aceite e procedimentos: `docs/qa/homologation-v3.md`.
