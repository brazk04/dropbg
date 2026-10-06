import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { GithubLink } from "./github-link";
export function Footer() {
  return (
    <footer className="footer container">
      <div className="footer-top">
        <div>
          <Link href="/" aria-label="DropBG — início">
            <Logo />
          </Link>
          <p>Remova fundos. Mantenha o que importa.</p>
        </div>
        <nav aria-label="Navegação do rodapé">
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
          <GithubLink />
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© 2026 DropBG</span>
        <span>Uma ferramenta simples para suas imagens.</span>
      </div>
    </footer>
  );
}
