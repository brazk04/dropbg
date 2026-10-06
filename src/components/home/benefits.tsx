import { ShowcaseImage } from "./showcase-image";

const uses = [
  ["Para vender", "Prepare fotos de produtos para catálogos, lojas e anúncios."],
  ["Para criar", "Leve seu recorte para posts, convites e apresentações."],
  ["Para personalizar", "Troque o cenário de retratos e fotos dos seus pets."],
] as const;

export function Benefits() {
  return (
    <section className="visual-benefits container" aria-labelledby="benefits-title">
      <div className="benefits-photograph">
        <ShowcaseImage name="dog" alt="" sizes="(max-width: 760px) 220px, 300px" />
      </div>
      <div>
        <span className="eyebrow">UMA IMAGEM, MUITAS IDEIAS</span>
        <h2 id="benefits-title">Faça mais com<br />o que você já tem.</h2>
        <div className="use-case-list">
          {uses.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}
        </div>
        <p className="benefits-promise">Sem cadastro. Gratuito. Processamento no seu dispositivo.</p>
      </div>
    </section>
  );
}
