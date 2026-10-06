# Fotografia da página inicial

Arquivos servidos localmente, sem requisições ao Unsplash em tempo de execução.
Fotografias reais sob a [Unsplash License](https://unsplash.com/license), que permite uso comercial e adaptação. Consulta: 6 de outubro de 2026. Pessoas fotografadas não representam depoimentos ou endosso ao DropBG.

| Arquivos | Fotógrafo e origem |
| --- | --- |
| `people/portrait.webp` | [Brunxs Monochrome — mulher com suéter verde](https://unsplash.com/photos/woman-wearing-olive-green-sweater-7V9YalsQYA4) |
| `products/mugs.webp`, `examples/mugs-original.webp`, `examples/mugs-cutout.webp` | [Nick de Partee — duas canecas](https://unsplash.com/photos/two-empty-orange-and-white-mugs-bdbsWLjAYnw) |
| `objects/dog.webp` | [Fabian Gieske — cachorro olhando para cima](https://unsplash.com/photos/dog-looks-up-on-white-background-AXtlIC-eHjQ) |

Derivados: remoção de fundo com o próprio DropBG, corte do espaço transparente e redução de resolução, exportação WebP com canal alfa. As duas imagens de demonstração mantêm o mesmo enquadramento; o terceiro cenário é composição CSS, não outra fotografia. Nenhuma imagem foi gerada por IA. O modelo apenas segmentou as fotografias.

Dimensões: retrato 451×900; canecas 574×328; cachorro 403×441; demonstrações 640×426. Arquivos entre 8 e 136 KB, sem originais de alta resolução no bundle. `ShowcaseImage` centraliza dimensões, `sizes`, carregamento lazy e decodificação assíncrona com `next/image`.
