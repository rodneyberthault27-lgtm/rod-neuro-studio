# ROD Neuro Studio: publicação via GitHub Pages

Frontend estático em HTML, CSS e JavaScript. Publicação exclusivamente dos arquivos em `dist/`, sem Next.js, Supabase ou código de backend.

## Fonte e atualização

- A branch `main` contém o código-fonte, `dist/index.html`, `dist/rod-attention-v3.js` e `dist/rod-references-v3.js`.
- A branch `gh-pages` contém somente os três arquivos públicos na raiz, mais `.nojekyll`.
- O workflow `sync-gh-pages.yml` copia de `dist/` para `gh-pages` após mudanças na `main`, com verificações que impedem reintroduzir o layout anterior.

## Ativação do GitHub Pages

1. Entre em **Settings > Pages** do repositório.
2. Em **Build and deployment > Source**, escolha **Deploy from a branch**.
3. Escolha a branch **gh-pages** e a pasta **/(root)**, e clique em **Save**.
4. O endereço esperado para um site de projeto é `https://rodneyberthault27-lgtm.github.io/rod-neuro-studio/`.
5. Aguarde a indicação de publicação no GitHub e abra o endereço somente após o GitHub confirmar que ele está ativo.

**Atenção:** o repositório é privado. O uso do GitHub Pages com repositório privado depende de um plano e das políticas da conta/organização. O conteúdo publicado no Pages pode ser acessível publicamente mesmo quando o código do repositório é privado. Se a opção Pages estiver indisponível, será necessário revisar o plano ou usar outra hospedagem.

## Limitações

- Este é o protótipo estático, não o aplicativo Next.js de homologação.
- O Attention Lab é estimativa computacional de saliência, não eye-tracking humano.
- Dados salvos no armazenamento do navegador não são migrados para outro domínio nem para o Supabase.
- O GLB anatômico depende de carregamento de CDN e rede; o visualizador usa fallback quando necessário.
- O domínio antigo do ChatGPT Sites não será automaticamente recuperado.

## Segurança e reversão

- A branch de backup `backup/site-antes-redesign-2026-11-20` permanece arquivada apenas para recuperação técnica. Não deve voltar a ser publicada.
- Não adicione tokens de API, URLs privadas com convites, credenciais ou bases de clientes nos arquivos da pasta `dist/`.
