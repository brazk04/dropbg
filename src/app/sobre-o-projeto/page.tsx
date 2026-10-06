import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
export const metadata: Metadata = { title: "Sobre o projeto", ...(SITE_URL ? { alternates: { canonical: "/sobre-o-projeto" } } : {}) };
export default function About() {
  return (
    <main id="conteudo" className="legal-page container">
      <span className="eyebrow">MENOS FUNDO. MAIS POSSIBILIDADES.</span>
      <h1>Menos distrações. Mais criação.</h1>
      <p>
        O DropBG remove o fundo de imagens no seu navegador. Compare o recorte,
        personalize o cenário e baixe um PNG, sem cadastro e sem enviar sua foto
        para servidores.
      </p>
      <h2>Processamento local</h2>
      <p>
        A inteligência artificial é executada no seu dispositivo. O modelo é
        preparado na primeira utilização e pode ser reutilizado pelo cache do
        navegador. Suas imagens continuam sendo suas.
      </p>
      <Link className="button button-secondary" href="/#ferramenta">
        Conhecer a ferramenta ↗
      </Link>
    </main>
  );
}
