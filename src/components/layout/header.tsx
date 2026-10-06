"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { GithubLink } from "./github-link";
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
      <div className="container header-inner">
        <Link href="/" aria-label="DropBG — início">
          <Logo />
        </Link>
        <nav aria-label="Navegação principal">
          <Link className="desktop-link" href="/#como-funciona">
            Como funciona
          </Link>
          <Link className="desktop-link" href="/privacidade">
            Privacidade
          </Link>
          <span className="desktop-link">
            <GithubLink />
          </span>
          <Link
            className="button button-secondary header-cta"
            href="/#ferramenta"
          >
            Remover fundo <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
