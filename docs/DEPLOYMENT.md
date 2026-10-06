# Publicação — 6 de outubro de 2026

- Site público: https://dropbg-self.vercel.app
- Repositório público: https://github.com/brazk04/dropbg
- Projeto Vercel: `dropbg`, Next.js, Node 22, raiz do repositório.
- Integração GitHub conectada; branch de produção: `main`.
- Preview explícito `dpl_ZNMTfono7kDV95dRtxpRSpbgYFzn`: READY, build Linux aprovado, homepage HTTP 200 por acesso autenticado da CLI. Mantida a proteção Vercel dos previews.
- Produção explícita `dpl_B2rjGk1e3xgQifK9ae3qj7HWMi2c`: READY, alias público acima, sem login para visitantes.

## Evidências na URL pública

Suíte padrão Playwright: 28 testes aprovados e dois opt-in ignorados. Os testes de inferência real abaixo foram executados separadamente, não deduzidos do build nem dos testes em localhost.

- Chromium com WebGPU desabilitado: inferência WASM real, imagem local 800×600, resultado e downloads PNG.
- Edge com adaptador GPU disponível: inferência real confirmou `data-processing-device="webgpu"`, sem exceções JavaScript.
- PNG transparente com pixels transparentes e opacos; dimensões originais 800×600 e nome `produto-dropbg.png`. Fundos azul `#163b65` e imagem local também exportados.
- Comparador operado por teclado e interface em viewport mobile com touch; seleção, resultado, fundos e download usados na URL pública.
- Homepage sem overflow nas dez larguras da suíte, entre 320 e 1920 px. Assets reais e fotografias verificados pela suíte.
- Homepage, `/privacidade`, `/termos`, `/sobre-o-projeto`, aliases `/privacy` e `/terms` e 404 personalizada verificados.
- Title, description, locale, canonical, OG local, SVG, manifest, robots e sitemap verificados. Origem pública determinada automaticamente pela Vercel; não foi necessário adicionar `NEXT_PUBLIC_SITE_URL`.
- HTTPS; requisições do aplicativo apenas GET/HEAD, sem envio de imagem, sem mixed content, erros de hydration, worker ou JavaScript.

## Segurança e limites

`.gitignore` e `.vercelignore` excluem credenciais, envs reais, dependências, builds, resultados/fotos de QA e `prompt.txt` local. `.env.example` contém somente documentação pública. Não houve force push, reescrita de histórico, criação de equipe, compra de domínio, mudança de DNS ou adição de analytics. Não foi criada licença própria sem decisão do autor; os avisos de terceiros foram preservados.

Audit local: sem vulnerabilidades em dependências de produção; cinco alertas altos na cadeia ESLint/braces de desenvolvimento, já documentados no README. O build remoto também avisou sobre o fim do suporte do ESLint 9; não foram feitas atualizações incompatíveis ou `audit fix --force`.

Viewport mobile automatizado não equivale a celular físico. Safari/iPhone e outros aparelhos físicos continuam pendentes. Em Edge, o contexto de QA bloqueou somente o domínio do script injetado pelo antivírus, sem alterar a segurança da máquina. O ensaio completo de privacidade foi feito em Chromium limpo.

Os ensaios da fase anterior permanecem em [QA.md](QA.md); não são métricas de campo. Fotos, scripts e PNGs desta validação ficaram somente nos diretórios locais ignorados.
