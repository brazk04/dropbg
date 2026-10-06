"use client";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main id="conteudo" className="legal-page container">
    <h1>Não foi possível abrir esta página</h1>
    <p>Tente novamente. Suas imagens não foram enviadas para servidores.</p>
    <button className="button button-primary" onClick={retry}>Tentar novamente</button>
  </main>;
}
