import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
export const metadata: Metadata = { title: "Termos", ...(SITE_URL ? { alternates: { canonical: "/termos" } } : {}) };
export default function Terms() {
  return (
    <main id="conteudo" className="legal-page container">
      <span className="eyebrow">TERMOS DE USO</span>
      <h1>Simples, desde os termos.</h1>
      <p>
        O DropBG é uma ferramenta gratuita. Com ela,
        você pode remover fundos localmente e baixar o resultado em PNG. O
        modelo de IA pode produzir recortes imprecisos; revise o resultado antes
        de usá-lo.
      </p>
      <h2>Suas imagens</h2>
      <p>
        Você mantém os direitos sobre seus arquivos. Utilize imagens que você
        tenha autorização para usar. O DropBG não armazena as imagens
        adicionadas.
      </p>
      <h2>Disponibilidade</h2>
      <p>
        A ferramenta é fornecida sem garantia de recorte perfeito ou disponibilidade
        contínua. O serviço pode mudar ou ser interrompido. Mantenha uma cópia
        dos seus arquivos originais.
      </p>
      <Link className="button button-secondary" href="/#ferramenta">
        Voltar para a ferramenta ↗
      </Link>
    </main>
  );
}
