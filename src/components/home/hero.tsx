import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { ShowcaseImage } from "./showcase-image";
export function Hero() {
  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="eyebrow">REMOVEDOR DE FUNDO DE IMAGENS</div>
      <h1 id="hero-title">
        Remova o <span className="headline-accent">fundo.</span>
        <br />
        Mantenha o que importa.
      </h1>
      <p className="hero-description">
        Sua imagem, sem distrações. Gratuito e sem cadastro.
      </p>
      <div className="hero-badges">
        <Badge>
          <Icon name="check" /> Sem login
        </Badge>
        <Badge>
          <Icon name="check" /> Grátis
        </Badge>
        <Badge>
          <Icon name="shield" /> Privado
        </Badge>
      </div>
      <div className="hero-photo-note">
        <ShowcaseImage name="mugs" alt="" sizes="96px" />
        <span>O fundo sai.<br />Sua ideia fica.</span>
      </div>
    </section>
  );
}
