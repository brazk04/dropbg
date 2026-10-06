import Link from "next/link";

export default function NotFound() {
  return <main id="conteudo" className="legal-page container">
    <span className="eyebrow">404</span>
    <h1>Página não encontrada</h1>
    <p>O endereço pode ter mudado ou não existir.</p>
    <Link className="button button-primary" href="/">Voltar para o DropBG</Link>
  </main>;
}
