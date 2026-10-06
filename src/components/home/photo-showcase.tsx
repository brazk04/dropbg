import { ShowcaseImage } from "./showcase-image";

export function PhotoShowcase() {
  return (
    <section className="photo-showcase container" aria-labelledby="showcase-title">
      <div className="showcase-intro">
        <span className="eyebrow">O FOCO É SEU</span>
        <h2 id="showcase-title">Menos fundo.<br />Mais personalidade.</h2>
        <p>Pessoas, produtos e pequenos companheiros.<br />Dê espaço ao que faz sua imagem ser única.</p>
      </div>
      <figure className="showcase-person">
        <ShowcaseImage name="portrait" alt="Mulher de perfil com suéter verde, recortada sem fundo" sizes="(max-width: 760px) 230px, 300px" />
        <figcaption>Retratos que se destacam.</figcaption>
      </figure>
      <figure className="showcase-product">
        <ShowcaseImage name="mugs" alt="Duas canecas laranja e branca com fundo transparente" sizes="(max-width: 760px) 45vw, 260px" />
        <figcaption>Seu produto em primeiro plano.</figcaption>
      </figure>
      <figure className="showcase-pet">
        <ShowcaseImage name="dog" alt="Cachorro olhando para cima, recortado sem fundo" sizes="(max-width: 760px) 38vw, 200px" />
        <figcaption>Até os melhores amigos.</figcaption>
      </figure>
    </section>
  );
}
