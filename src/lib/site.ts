// Única origem para canonical, Open Graph, robots e sitemap.
const configured = process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

function publicOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash ||
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new Error("NEXT_PUBLIC_SITE_URL deve ser uma origem pública HTTPS, sem caminho ou credenciais.");
  }
  return url.origin;
}

export const SITE_URL = publicOrigin(configured);
export const SITE_TITLE = "DropBG — Remova o fundo de imagens grátis";
export const SITE_DESCRIPTION = "Remova o fundo de imagens em segundos com o DropBG. Gratuito, rápido, sem cadastro e com processamento no seu dispositivo.";
