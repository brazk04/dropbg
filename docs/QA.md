# QA de preparação para produção

Data: 6 de outubro de 2026. Ambiente Windows / Node 22; aplicação Next em build e `npm run start`, sem deploy. Identidade e motor preservados. Nenhum commit ou push realizado.

## Correções encontradas e aplicadas

- Sobre/termos tinham copy da primeira fase/prévia: substituída por descrição real do produto e limites de uso.
- Link GitHub sem repositório direcionava para aviso temporário: agora é Sobre o projeto até configurar URL real.
- Não existiam sitemap, robots, manifest, 404 própria ou error boundaries: adicionados pelas convenções da versão instalada do Next. Error boundary usa `retry`, estável em 16.3, não uma API presumida de versões antigas.
- Origem de metadata/canonical não estava centralizada: `src/lib/site.ts` valida origem pública HTTPS e compartilha com metadata, canonical das quatro páginas, robots e sitemap. Mantidos OG PNG local e favicon SVG.
- Extensão/MIME/decodificação não bastavam para detectar conteúdo renomeado: validação passou a conferir assinatura PNG/JPEG/WebP e correspondência à extensão.
- CSS da antiga demonstração SVG, benefícios em cards e labels temporários estava sem uso: removido.
- Modos de resultado tinham alvo de 36 px: aumentados para 44 px. Demais controles principais já eram de 44–48 px.
- Tamanhos padrão do otimizador deixavam grande salto entre 384 e 640 px: adicionadas larguras intermediárias para os recortes.
- Gitignore ampliado para logs, temporários e arquivos de editor; env.example não fornece URLs fictícias ativas.

## Build, lint e produção

`npm run lint`: sucesso, sem warnings. `npm run typecheck`: sucesso. `npm run build`: sucesso, onze páginas/artefatos estáticos gerados. `npm run start`: servidor respondeu normalmente, ready em aproximadamente 259 ms; headers e rotas testados no modo production.

Build sem origem pública também funciona, mas o Next avisa metadataBase e sitemap fica vazio. Build configurado, simulando `VERCEL_PROJECT_PRODUCTION_URL=dropbg.example`, concluiu sem esse aviso e gerou canonical/OG/sitemap corretos para essa origem **reservada exclusivamente ao QA**. Nenhum `.env` real foi criado e nenhum domínio fictício foi gravado no fonte. Na implantação, a Vercel fornece sua origem; domínio próprio requer NEXT_PUBLIC_SITE_URL antes do build. Não publique o build de QA como artefato pronto: a Vercel deve compilar novamente com sua configuração real.

Não foram encontradas chamadas de produção para backend local ou caminhos da máquina. Referências a localhost em `site.ts` são somente uma lista de origens recusadas. Assets permanentes estão no repo; arquivos `.validation/` são somente insumos/artefatos de teste. Lockfile contém pacotes opcionais Linux de Next/SWC/Sharp; nenhuma edição específica de Windows foi necessária. Build Linux/Vercel não foi executado, pois deploy está fora desta fase.

## Testes funcionais e rede

Suíte padrão final em produção: **28 passaram; 2 opt-in não executados nessa rodada**. Os dois opt-in passaram em rodada real separada: nove imagens e falha de refinamento simulada com preservação de RAW. Nessa primeira rodada, o teste novo de formatos falhou porque procurava o anúncio do router em vez do toast; seletor corrigido, teste isolado e suíte padrão completa passaram novamente. Não restam falhas conhecidas da suíte.

Fluxo validado: seleção → preview → preparação do modelo → remoção → refinamento → comparação → fundos → download → nova imagem, sem reload necessário. PNG/JPG/JPEG/WebP válidos; arquivo não imagem, corrompido, falso, vazio, acima de 25 MB e dimensão maior que 8192 px têm feedback. Travas da UI/engine/worker impedem inferências concorrentes; testes conferem estado bloqueado durante processamento.

Inferência real WASM incluiu pessoa com cabelo, gatos, produto, objeto fino sobre cenário complexo, imagem pequena e 4000×3000 (12 MP), além de pessoa sobre branco e produtos claros/escuros. Fotografias reais e fixtures sintéticas têm propósitos distintos; o objeto complexo não é uma coleção ampla de fotos naturais. Foram conferidos alpha, dimensões, PNG, nome do arquivo, RAW/refinado, ausência de inferência adicional ao trocar controles e liberação de URLs.

Fundos transparente/branco/preto/cinza/azul/custom e imagens landscape/portrait/quadrada foram testados. Canvas manteve resolução e enquadramento, com cor/alpha corretos nos arquivos baixados. Person/animal podem manter resíduos em cabelo/pelos: limitação do modelo, não promessa de recorte perfeito.

No contexto Chromium limpo, eventos de rede da página/worker registraram apenas GETs externos sem corpo para modelo/runtime. Nada de POST, upload Blob ou base64 de imagem externo; nenhum modelo/runtime antes do clique. Pesos não foram solicitados novamente entre imagens na mesma sessão.

Ensaio separado de fallback e cache:

- Falha GPU simulada → worker WASM real, sucesso: 23,5 s no acesso frio.
- Segunda imagem na mesma sessão: 15,2 s, mesma contagem de requests dos pesos.
- Reload no mesmo contexto: 17,3 s; só nova leitura de metadados `Range: bytes=0-0`, não download completo dos pesos.

Esses tempos são do computador de QA, não garantias. Nova tentativa após falha de rede e preservação da imagem original também passaram. Logs de timing/refinamento no fonte estão protegidos por NODE_ENV=development. Nenhum serviço de analytics foi adicionado.

## Responsividade e acessibilidade

Home sem overflow em 320, 360, 375, 390, 430, 768, 1024, 1280, 1440 e 1920 px, com todas as fotos decodificadas. Preview/resultados e comparador foram inspecionados; camadas permanecem alinhadas. Mouse, touch emulado, teclado, foco, FAQ e navegação passaram. Layout verificado por capturas de desktop/tablet/mobile. Fotos mantêm dimensões e alt; decoração usa alt vazio. Sem nova animação; reduced-motion global preservado.

Element screenshots muito altos podem capturar header sticky durante a costura do Playwright; isso não é uma posição fixa no meio da página. Capturas da homepage inteira e testes de bounds são a referência do layout.

## Lighthouse e Core Web Vitals

Lighthouse 12.8.2 em produção local, Chrome Headless Shell limpo, perfis mobile/desktop padrão, uma execução final por perfil. Não é medição de campo. A primeira execução usando Chrome do sistema foi contaminada por script do antivírus Kaspersky, com HTTP e JS adicionais; seus resultados (81/100 performance e 82/100 boas práticas) não representam somente o aplicativo. Nenhuma configuração do antivírus foi alterada; para o ensaio final foi escolhido o executável limpo do Playwright.

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mobile | 98 | 100 | 100 | 100 | 2,4 s | 0 | 50 ms |
| Desktop | 100 | 100 | 100 | 100 | 0,6 s | 0 | 0 ms |

LCP é o título, não o modelo. IA só começa após interação e trabalho pesado fica no worker. Lighthouse ainda sugere compressão adicional para fotos e redução de JS do framework; não removemos funcionalidades ou compatibilidade para perseguir 100 artificial. INP de campo não foi medido; TBT não equivale a INP. Repetir Lighthouse e coletar métricas reais no domínio final, sobretudo em rede móvel e dispositivos de pouca memória.

## Browsers

| Ambiente | Resultado |
| --- | --- |
| Chromium Playwright | Fluxo completo e nove imagens com WASM; sem adaptador GPU nesse executável |
| Edge instalado | Produto processado com **WebGPU real**, slider por teclado, fundo preto e PNG baixado; sem erro JS |
| Firefox Playwright 155 | Produto com WASM, slider, fundo preto e download; sem erro JS |
| WebKit Playwright Windows | Sem OffscreenCanvas nesse build; app recusou com aviso amigável e retry, sem tela branca |
| Safari macOS/iOS físico | Não disponível neste ambiente; revisão de recursos, não validação real |

No Edge, o antivírus da máquina injetou GET/POSTs próprios (incluindo metadados de navegação), ausentes no fonte do DropBG. QA posterior isolou apenas o contexto de teste desse domínio; não desligou proteção da máquina. A garantia de privacidade refere-se ao aplicativo, não a extensões/antivírus instalados. Safari antigo/ambientes sem OffscreenCanvas não são suportados; a mensagem de incompatibilidade é intencional. WebGPU varia por versão/driver e falha deve cair em WASM quando os recursos necessários estão presentes. Celular físico continua pendente.

## Dependências, licenças e riscos restantes

`npm audit --omit=dev`: **0 vulnerabilidades**. Audit completo: **5 alertas altos**, todos derivados de uma única falha do `braces <=3.0.3` na cadeia ESLint/fast-glob/micromatch. [Advisory GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) declara ausência de patch. Registry também informou 3.0.3 como versão mais recente. Sem exposição de glob não confiável no runtime; acompanhar correção upstream. Não foi usado audit fix --force nem downgrade do Next.

Modelo e bibliotecas mantêm revisão/avisos corretos em THIRD_PARTY_NOTICES e licenses; fotografias locais têm autoria/fontes/Unsplash License registradas. Dependências principais são usadas; não houve atualização ampla. Instalação nova usa npm ci e lockfile; opcionais/extraneous existentes nesta máquina não são requisito do app.

Headers comprovados por resposta HTTP: nosniff, strict-origin-when-cross-origin, câmera/microfone/geolocalização negados e SAMEORIGIN. Não foi adicionada CSP incompleta, nem COOP/COEP que pudesse quebrar downloads do runtime.

**Nenhum bloqueador funcional crítico conhecido no ambiente testado. Não é certificação universal de produção.** Antes do lançamento público: confirmar domínio real/canonical/OG/sitemap após build da Vercel, smoke test em iPhone/Android físico e avaliar memória/latência móvel. Audit de ferramentas de desenvolvimento permanece aberto sem patch. Pesos/CDN são dependências externas, cache pode ser removido e segmentação pode ser imperfeita.

Git status: o projeto inteiro segue **untracked** neste repositório inicial; não fizemos add/commit/push. Node_modules, .next, envs reais, logs e QA temporário estão ignorados. O relatório não autoriza deploy, que permanece para a próxima fase.
