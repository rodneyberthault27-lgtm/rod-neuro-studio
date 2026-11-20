# Visualizador cerebral 3D de anatomia real
## Decisão
Substituir a forma cerebral sintética por um modelo anatômico externo com sulcos e giros, cerebelo e tronco encefálico reconhecíveis, preservando o atlas e seus controles atuais.
## Asset
Origem: [Brain Project](https://github.com/itayinbarr/brainproject), a partir de Z-Anatomy/BodyParts3D. Arquivo Draco GLB de 4,65 MB, fixado ao commit 2929e94f. Licença: CC BY-SA 4.0. O modelo continua com essa licença; atribuição no próprio visualizador.
URL: https://cdn.jsdelivr.net/gh/itayinbarr/brainproject@2929e94f521a8ddceab26bc100a98dc06b0da060/brain-atlas/models/brain.glb
## Execução
Three.js r128 com GLTFLoader/DRACOLoader, material mate em tons de tecido anatômico e luz neutra de estúdio. O modelo é redimensionado pelo bounding sphere e substitui o fallback quando carregado. As áreas internas surgem ao ativar a transparência. Se não houver WebGL/rede/asset, o antigo visual permanece como fallback.
Destaques de regiões e conexão com processos são conceituais e aproximados. Este modelo **não é eye-tracking, medição de atividade cerebral, fMRI nem dado clínico**.
## Escopo
Somente branch feature/studio-v3. Espelhos HTML index.html, dist/index.html e skill/assets/rod-neuro-studio.html mantidos idênticos. Main, produção, Cloud Sites e Claude Artifact intactos.
## Gate
A validar em navegador com asset disponível, orientação, seleção, contraste, carregamento mobile, licença e performance. A aprovação dos testes estáticos não garante que a rede entregue o GLB.
