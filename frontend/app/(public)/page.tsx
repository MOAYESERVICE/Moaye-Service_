import { Suspense } from "react";
import Hero from "@/components/home/Hero";
import AssetsStrip from "@/components/home/AssetsStrip";
import ExpertiseSection from "@/components/home/ExpertiseSection";
import ApicultureFocus from "@/components/home/ApicultureFocus";
import ServicesSection from "@/components/home/ServicesSection";
import MethodSection from "@/components/home/MethodSection";
import ProductsSection from "@/components/home/ProductsSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import PartnersSection from "@/components/home/PartnersSection";
import AssistantBand from "@/components/home/AssistantBand";
import AboutSection from "@/components/home/AboutSection";
import FaqSection from "@/components/home/FaqSection";
import CtaBand from "@/components/home/CtaBand";

function ProductsSectionFallback() {
  return (
    <section className="section section-mist">
      <div className="wrap" role="status" aria-busy="true">
        Chargement des produits…
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />
      <AssetsStrip />
      <ExpertiseSection />
      <ApicultureFocus />
      <ServicesSection />
      <MethodSection />
      <Suspense fallback={<ProductsSectionFallback />}>
        <ProductsSection />
      </Suspense>
      <Suspense fallback={<section className="section"><div className="wrap" role="status" aria-busy="true">Chargement des réalisations…</div></section>}>
        <ProjectsSection />
      </Suspense>
      <PartnersSection />
      <AssistantBand />
      <AboutSection />
      <FaqSection />
      <CtaBand />
    </main>
  );
}
