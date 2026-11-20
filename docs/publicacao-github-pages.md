# Publicação oficial do ROD Neuro Studio via GitHub Pages

Este repositório publica apenas o frontend estático da pasta `dist/`. A plataforma Next.js 3.0 com autenticação e Supabase permanece fora desta publicação.

## Ativação única

1. Acesse Settings > Pages.
2. Em Build and deployment > Source, selecione **GitHub Actions** (não Deploy from a branch).
3. Entre em Actions > Deploy ROD Neuro Studio to GitHub Pages.
4. Clique em **Run workflow**, selecione `main` e execute.
5. Confirme a etapa `deploy` como concluída com sucesso e abra o endereço informado no job.

O endereço esperado, caso não exista domínio personalizado, é `https://rodneyberthault27-lgtm.github.io/rod-neuro-studio/`.

O workflow `.github/workflows/deploy-pages.yml` cuida do upload e da implantação. Toda mudança na pasta `dist/` da branch `main` publica automaticamente a nova versão, depois da ativação inicial do Pages.

**Importante:** GitHub Actions usa o token automático `GITHUB_TOKEN`, que não tem permissão para habilitar um Pages nunca configurado. A primeira escolha em Settings > Pages precisa ser feita por alguém com acesso administrativo. Não compartilhe um personal access token para contornar essa restrição.

A branch `gh-pages` conserva um snapshot estático do novo layout, mas o fluxo oficial de publicação é agora `GitHub Actions` diretamente da pasta `dist/`. Não use a branch de backup do layout antigo como fonte pública.
