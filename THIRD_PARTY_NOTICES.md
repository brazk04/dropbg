# Third-party notices — DropBG AI Engine

O DropBG executa inferência local. Os pesos e o runtime são baixados pelo navegador; não há uso de API de inferência.

| Componente | Versão / revisão | Licença declarada | Origem |
| --- | --- | --- | --- |
| Transformers.js | `@huggingface/transformers` 4.3.1 | Apache-2.0 | https://github.com/huggingface/transformers.js |
| ISNet General Use, ONNX INT8 | `xrds/isnet-general-onnx-int8`, revisão `71eff2372ec9c8edbc6ca637ded591423d23b65a` | MIT (copyright imgly GmbH, conforme LICENSE do repositório) | https://huggingface.co/xrds/isnet-general-onnx-int8 |
| Modelo de origem | `imgly/isnet-general-onnx` | MIT, conforme declaração do exportador | https://huggingface.co/imgly/isnet-general-onnx |
| Arquitetura IS-Net | DIS / IS-Net | Apache-2.0, conforme repositório de origem | https://github.com/xuebinqin/DIS |
| ONNX Runtime Web | Dependência transitiva de Transformers.js, fixada no lockfile | MIT | https://github.com/microsoft/onnxruntime |

As licenças declaradas permitem uso comercial sob suas condições. Nenhum modelo BRIA RMBG-2.0 ou serviço de inferência foi incluído. Os pesos não são distribuídos dentro do repositório DropBG; o navegador os obtém diretamente da origem e mantém o cache normal da biblioteca.

Cópias dos avisos do modelo e da licença da biblioteca estão em `licenses/`. Preserve esses arquivos nas redistribuições e os avisos contidos nos pacotes e artefatos originais. Demais dependências mantêm suas próprias licenças nos pacotes npm.

## Fotografia da homepage

Fotografias de Brunxs Monochrome, Nick de Partee e Fabian Gieske, licenciadas pelo Unsplash, adaptadas com recorte e otimização. Fontes, autoria, licença e dimensões estão em [public/images/showcase/README.md](public/images/showcase/README.md). São assets locais, não imagens geradas por IA.

## Imagens usadas somente na validação

Pessoa e gatos: exemplos públicos do dataset `Xenova/transformers.js-docs`, usados apenas em validação local, sem inclusão na homepage nem distribuição no repositório. Produto e objeto: ilustrações vetoriais originais de teste. Arquivos de validação e resultados ficam em `.validation/`, ignorada pelo Git.
