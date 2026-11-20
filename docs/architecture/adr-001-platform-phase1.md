# ADR-001 | Fundação web v3.0
Status: implementado em branch isolada; não implantado em ambiente Supabase.

- Aplicação Next.js 16 em \`apps/web\` separada de \`index.html\`, \`dist/\` e do site estático.
- Supabase Auth com cookies SSR. \`proxy.ts\` atualiza sessão; Route Handlers verificam a identidade.
- Supabase Postgres: tabelas \`public.rod_*\` com RLS de workspace; função de criação transacional de workspace.
- Supabase Storage: bucket \`rod-private\`, limite de 10 MiB, tipos aceitos PNG/JPEG/WebP/PDF e paths isolados por workspace e projeto.
- Documentos recebem revisão imutável; a aplicação não declara análise científica ou medida observada ao salvar briefing.
- Só usuários com papel owner/editor podem alterar projetos ou enviar ativos.
- Nenhuma service role key na aplicação; o isolamento é responsabilidade de políticas RLS e testes.
- SQL em \`supabase/migrations/20261117000000_rod_v3.sql\`; migrations da Fase 0 em \`migrations/\` permanecem como rascunhos NÃO aplicados.
- Não são feitas chamadas a APIs privadas do Claude nem migração de registros por este módulo.
- Provedor Supabase, URL, chave publicável, domínio, callback e políticas de convite precisam de provisionamento antes de testes ponta a ponta autenticados.
- A versão online atual continua independente no serviço Sites, apontando a \`dist/\`.
- Fonte SSR: https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs
