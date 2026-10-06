import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { BackgroundRemover } from "@/components/background-remover/background-remover";
import { DemoComparison } from "@/components/home/demo-comparison";
import { Benefits } from "@/components/home/benefits";
import { HowItWorks } from "@/components/home/how-it-works";
import { FAQ } from "@/components/home/faq";
import { PhotoShowcase } from "@/components/home/photo-showcase";
import { SITE_URL } from "@/lib/site";
export const metadata: Metadata = SITE_URL
  ? { alternates: { canonical: "/" } }
  : {};
export default function Home() {
  return (
    <main id="conteudo">
      <div className="hero-layout container">
        <Hero />
        <BackgroundRemover />
      </div>
      <PhotoShowcase />
      <DemoComparison />
      <Benefits />
      <HowItWorks />
      <FAQ />
    </main>
  );
}
