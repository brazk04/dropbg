# DropBG

Remova o fundo de imagens gratuitamente, sem cadastro e com processamento no seu dispositivo. Compare o resultado, refine os contornos, personalize o cenário e baixe um PNG na resolução original.

## Principais funcionalidades

- Seleção, drag and drop e colagem de PNG, JPG/JPEG e WebP.
- Remoção por IA local em worker, com progresso real e recuperação de falhas.
- Comparador mouse/touch/teclado e modos original, resultado e comparação.
- Refinamento conservador opcional, sem repetir a inferência.
- Fundos transparente, branco, preto, cinza, azul, cor HEX e imagem local.
- Exportação PNG original; sem cadastro, upload ou histórico persistente.

## Stack e como executar

Node.js 22, npm, Next.js 16.3.8 / App Router, React 19, TypeScript, Tailwind CSS 4, Transformers.js 4.3.1 e ONNX Runtime Web. O lockfile fixa as versões instaladas.

```bash
npm ci
npm run dev
```

Abra http://localhost:3000. Build e produção local:

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

O build precisa de internet para obter as fontes Geist quando não estão em cache. Não há secrets obrigatórios ou dependência de Windows/arquivos externos ao repositório.

## Arquitetura e diretórios

| Diretório / arquivo | Responsabilidade |
| --- | --- |
| `src/app/` | Páginas públicas, 404, error boundaries, metadata/OG, robots, sitemap e manifest |
| `src/components/background-remover/` | Upload, feedback, comparação, fundos e download |
| `src/components/home/` | Composição editorial e fotografias locais |
| `src/hooks/` | Estados React, concorrência e ciclo de vida das URLs |
| `src/lib/background-removal/` | Worker singleton, runtime lazy, protocolo, timeout e fallback |
| `src/lib/background-removal/refinement/` | Alpha, cleanup, smoothing e descontaminação conservadora |
| `src/lib/background-composition/` | Fundos e exportação Canvas |
| `src/lib/site.ts` | Origem pública centralizada e copy SEO |
| `public/images/showcase/` | Assets WebP e créditos |
| `tests/`, `licenses/`, `docs/` | QA, avisos de terceiros e relatório de lançamento |

Estados: idle → loading-model → processing → refining → success/error. Não há duas inferências concorrentes. Falhas permitem retry sem perder o original; watchdog encerra jobs acima de cinco minutos. Trocar imagens não descarta o modelo. Leituras antigas são descartadas. URLs de original, resultado, fundo e exportação são revogadas ao substituir/remover/desmontar; URLs de download expiram em até 60 segundos.

## AI Engine e processamento local

Modelo `xrds/isnet-general-onnx-int8`, revisão fixa `71eff2372ec9c8edbc6ca637ded591423d23b65a`, pipeline `background-removal`, dtype `q8`. Os pesos não estão no repositório. O clique em Remover fundo importa o motor, cria um worker e carrega Transformers.js/ONNX. Não há download de modelo ou inferência na abertura da homepage.

### WebGPU / WASM e cache

Um adaptador WebGPU disponível é tentado primeiro. Falha GPU recria o worker e tenta WASM, sem duas pipelines pesadas simultâneas. Ausência de GPU usa WASM diretamente. WASM roda em uma thread no worker, sem exigir SharedArrayBuffer/COOP/COEP. O percentual só aparece quando informado pelo download; a inicialização posterior pode continuar com progresso indeterminado.

A pipeline permanece na aba para a segunda imagem. `useBrowserCache` e `useWasmCache` reutilizam downloads quando permitido pelo navegador. Reload reconstrói a pipeline, mas pode aproveitar arquivos persistidos. GET Range de metadados não equivale a download integral adicional. Cache pode ser removido pelo navegador; primeira utilização precisa de internet, sem garantia offline.

## Edge Refinement

O worker preserva RAW e refina RGBA nas dimensões originais. Cleanup remove somente pontos muito fracos e isolados. Suavização altera transições parcialmente transparentes; correção RGB exige evidência local consistente e é limitada a 12 níveis por canal. Sem blur integral, binarização ou erosão agressiva; alpha original limita o resultado.

Balanced é o perfil padrão. RAW/refinado têm Blobs próprios: desligar Refinar bordas troca imediatamente, sem IA adicional. Alterar fundo, comparação ou download não repete refinamento. TypedArrays, uma máscara de um byte por pixel e codificação no worker limitam cópias. Falha preserva RAW; dispositivos que reportam até 2 GB usam RAW acima de 8 MP.

Não recupera detalhes ausentes na segmentação. Cabelo, pelos, vidro e fundos complexos podem manter halos ou perder detalhes. Não se promete matting perfeito; WASM pode levar dezenas de segundos em celulares.

## Background Customization

Preview usa camadas CSS com recorte intacto. Imagem de fundo usa cover centralizado apenas no retângulo da composição. HEX aceita #RGB/#RRGGBB e mantém a última cor válida durante edição inválida. Download usa Canvas na resolução original, pinta o fundo, desenha o recorte e exporta PNG. ImageBitmaps e buffers Canvas são liberados. Transparente mantém alpha; fundo opaco exporta o cenário escolhido.

## Formatos e limites

PNG, JPG/JPEG e WebP; até 25 MB, 16 megapixels e 8192 pixels por lado. Validação confere extensão, MIME aceito, assinatura real, decodificação e dimensões. Arquivos vazios, falsos ou corrompidos são recusados. Mesmos limites para imagens de fundo. Sem redução silenciosa da resolução; os limites não garantem memória suficiente em todo dispositivo.

## Privacidade e network QA

Decodificação, IA, refinamento, preview, composição e exportação ocorrem localmente. Nenhuma imagem é enviada ao DropBG, analytics, CDN ou serviço de inferência. Sem cadastro, cookies de rastreamento ou analytics no código. Download `nome-original-dropbg.png` usa URL `blob:` local.

Hugging Face e CDN do ONNX recebem apenas requisições de modelo/runtime e metadados normais de conexão, como IP. Hospedagem pode registrar requisições técnicas; não recebe a imagem selecionada.

O teste real inspeciona tráfego de página e worker: requisições externas devem ser GET/HEAD sem corpo; nenhum POST de imagem, Blob ou base64 externo é permitido. Verifica ausência de modelo/runtime antes do clique e contagem dos pedidos de pesos entre imagens. Usa eventos de rede do Playwright/Chromium, equivalentes à observação no DevTools. `/privacidade` e `/termos` descrevem comportamento e limites. Software instalado no navegador/máquina pode inserir tráfego próprio; isso é separado da rede gerada pelo DropBG no relatório.

## Performance, responsividade e acessibilidade

WebP locais com alpha, dimensões explícitas, next/image, `sizes`/srcset e lazy loading. Assets de 8–136 KB, sem originais gigantes. Alt descritivo nas fotos informativas e vazio na decoração. Foco visível, skip link, labels e estados anunciados. Slider com ArrowLeft/ArrowRight, Home/End, Pointer Events e pan-y. Presets/modos de resultado têm pelo menos 44 px de altura. Animações respeitam prefers-reduced-motion.

Mobile reorganiza fotografias e fluxo de produto. Header prioriza CTA; links secundários permanecem no rodapé. Dez larguras solicitadas são testadas, de 320 a 1920 px. [Resultados de QA](docs/QA.md): ensaios locais/Lighthouse não são métricas de campo. INP exige interações reais e não pode ser deduzido do TBT.

## Testes

```bash
npx playwright install chromium
npm run test:e2e
```

A suíte padrão não precisa dos arquivos locais de QA. Inferência real é opt-in porque baixa pesos/runtime. Coloque em `.validation/`: `pessoa.jpg`, `animal.jpg`, `produto.png`, `objeto.webp`, `pequena.png`, `grande.jpg`, `pessoa-branca.jpg`, `produto-branco.png`, `produto-preto.png`, `fundo-landscape.png`, `fundo-portrait.png` e `fundo-square.png`. Use fotos próprias/licenciadas ou fixtures originais. A grande pode ter 4000×3000 px. Esses arquivos não são dependência da aplicação nem são distribuídos.

PowerShell:

```powershell
$env:DROPBG_AI_TEST = "1"
npx playwright test tests/ai-engine.spec.ts --workers=1
```

Para produção, inicie `npm run start` e defina `DROPBG_TEST_URL` com a URL local. O servidor gerenciado usa porta 3001 quando a variável está definida. `DROPBG_SIMULATE_GPU_FAILURE=1` testa recuperação simulada GPU seguida de WASM real. `DROPBG_WEBGPU_TEST=1` tenta adaptador real. Flags existem somente nos testes; resultados ficam em diretórios ignorados.

## Compatibilidade

Necessários Web Worker, WebAssembly, OffscreenCanvas e decodificação Canvas dos formatos anunciados. Navegadores antigos sem esses recursos recebem feedback amigável. Chrome/Edge, Firefox e Safari recentes podem usar WASM. WebGPU depende de versão, driver, hardware e contexto seguro; a API não garante suporte ao modelo. [Documentação Transformers.js](https://huggingface.co/docs/transformers.js/en/guides/webgpu).

WebKit automatizado não equivale a Safari/iPhone físico. Hardware GPU e celulares físicos precisam de smoke test antes de anunciar compatibilidade irrestrita. Safari antigo pode não ter OffscreenCanvas; cache privado e pouca memória podem impedir imagens grandes. SVG, GIF, HEIC e AVIF não são formatos de entrada suportados.

## Segurança

Headers: X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy câmera/microfone/geolocalização e X-Frame-Options SAMEORIGIN. Sem CSP improvisada: script/worker/WASM/CDNs exigem validação específica. Sem endpoint de upload, backend local ou URLs absolutas da máquina no runtime.

Audit 6/10/2026: produção (`npm audit --omit=dev`) sem vulnerabilidades. Audit completo: cinco alertas altos derivados de `braces <=3.0.3` na cadeia ESLint, sem patch publicado. Nenhum glob fornecido pelo usuário chega ao runtime. Não executar lint sobre padrões não confiáveis. A sugestão de downgrade eslint-config-next 14 não foi aplicada; acompanhar [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Sem audit fix --force ou atualização indiscriminada.

## Licenças

Modelo: MIT declarada pelo exportador; Transformers.js Apache-2.0; ONNX Runtime MIT. Avisos, origem/revisão em [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), cópias em `licenses/` e pacotes npm. Fontes Geist mantêm licença do pacote. Fotografias reais de Brunxs Monochrome, Nick de Partee e Fabian Gieske sob Unsplash License; [créditos](public/images/showcase/README.md). Nenhuma fotografia foi gerada por IA. Preserve os avisos nas redistribuições.

## Deploy e SEO

Não foi feito commit, push, conexão GitHub ou deploy. Para Vercel: projeto Next.js, Node 22, instalação `npm ci`, build `npm run build`, output padrão. Assets em `public/`; `.validation/` não é dependência. Next/font obtém fontes durante build. HTTPS para contexto seguro/WebGPU.

Configuração sem secrets em `.env.example`:

- `NEXT_PUBLIC_SITE_URL`: origem pública HTTPS sem caminho, definida antes do build para domínio próprio. Na Vercel, fallback automático para `VERCEL_PROJECT_PRODUCTION_URL`.
- `NEXT_PUBLIC_GITHUB_URL`: endereço real do repo. Sem ele, link Sobre o projeto em vez de GitHub fictício.

Title/description, Open Graph pt_BR, Twitter card e OG PNG local 1200×630; favicon SVG, manifest, robots permissivo e sitemap das quatro rotas públicas. Canonicals usam uma única origem. Sem domínio configurado, build local pode avisar metadataBase e gerar sitemap vazio; não há canonical ou domínio inventado. A Vercel fornece origem automaticamente. Revalide canonical/sitemap/OG no host definitivo antes de indexar.

Revise git status, QA, créditos e configuração pública antes de versionar. Envs reais, logs, temporários, node_modules, .next e artefatos de QA estão ignorados; `.env.example` permanece versionável.
