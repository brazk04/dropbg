import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
export const metadata: Metadata = { title: "Privacidade", ...(SITE_URL ? { alternates: { canonical: "/privacidade" } } : {}) };
export default function Privacy() {
  return (
    <main id="conteudo" className="legal-page container">
      <span className="eyebrow">TRANSPARÊNCIA DESDE O INÍCIO</span>
      <h1>Sua imagem fica com você.</h1>
      <p>
        Suas imagens são abertas e processadas localmente no navegador. Nenhum
        arquivo é enviado a um servidor, salvo em banco de dados ou usado para
        treinamento.
      </p>
      <h2>Preview e resultado locais</h2>
      <p>
        Imagens de fundo personalizadas e a composição final também são lidas e
        geradas apenas no dispositivo. Nenhuma dessas imagens é enviada a
        servidores.
      </p>
      <p>
        Usamos endereços temporários do navegador para mostrar sua imagem e o
        resultado. Eles são liberados ao trocar ou remover a imagem e ao sair da
        página. Não há armazenamento persistente de imagens.
      </p>
      <h2>Sem cadastro e sem rastreamento</h2>
      <p>
        Esta aplicação não usa cookies de rastreamento, analytics ou contas. O
        provedor de hospedagem poderá registrar dados técnicos das requisições,
        como endereço IP, para operar o site; isso não inclui as imagens
        selecionadas.
      </p>
      <h2>Download do modelo e cache</h2>
      <p>
        Na primeira utilização, o navegador baixa o modelo de IA do Hugging Face
        e o runtime do ONNX via CDN. Esses serviços podem receber dados técnicos
        da requisição, como seu endereço IP, mas não recebem a imagem
        selecionada. Os arquivos do modelo e runtime são reutilizados pelo cache
        do navegador quando disponível. Esse cache pode ser removido nas
        configurações do navegador.
      </p>
      <Link className="button button-secondary" href="/#ferramenta">
        Voltar para a ferramenta ↗
      </Link>
    </main>
  );
}
