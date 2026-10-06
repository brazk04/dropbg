import { TransparentGrid } from "@/components/ui/transparent-grid";
import { ShowcaseImage } from "./showcase-image";

export function DemoComparison() {
  const sizes = "(max-width: 760px) 90vw, (max-width: 1100px) 30vw, 360px";
  return (
    <section className="demo-section container" aria-labelledby="demo-title">
      <div className="section-intro">
        <div>
          <span className="eyebrow">DO CLIQUE À VITRINE</span>
          <h2 id="demo-title">Um produto. Novas possibilidades.</h2>
        </div>
        <p>Remova as distrações e escolha o cenário para sua próxima publicação.</p>
      </div>
      <div className="photo-demo-flow">
        <figure>
          <div className="photo-demo-image"><ShowcaseImage name="original" alt="Foto original de duas canecas sobre um assento rosa" sizes={sizes} /></div>
          <figcaption><span>01</span> Foto original</figcaption>
        </figure>
        <figure>
          <TransparentGrid className="photo-demo-image"><ShowcaseImage name="cutout" alt="As mesmas canecas após a remoção do fundo" sizes={sizes} /></TransparentGrid>
          <figcaption><span>02</span> Fundo transparente</figcaption>
        </figure>
        <figure>
          <div className="photo-demo-image photo-demo-composed"><ShowcaseImage name="cutout" alt="Canecas recortadas sobre um novo fundo azul suave" sizes={sizes} /></div>
          <figcaption><span>03</span> Pronto para sua vitrine</figcaption>
        </figure>
      </div>
      <p className="demo-footnote">Fotografia real, recortada com o DropBG. O resultado varia conforme a imagem.</p>
    </section>
  );
}
