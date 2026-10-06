import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";
import { SITE_URL, SITE_TITLE as title, SITE_DESCRIPTION as description } from "@/lib/site";
const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
export const metadata: Metadata = {
  title: { default: title, template: "%s | DropBG" },
  description,
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  manifest: "/manifest.webmanifest",
  openGraph: {
    title,
    description,
    locale: "pt_BR",
    type: "website",
    siteName: "DropBG",
  },
  twitter: { card: "summary_large_image", title, description },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className={`${geist.variable} ${mono.variable} antialiased`}>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
