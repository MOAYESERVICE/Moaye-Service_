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
import { whatsappHref } from "@/lib/whatsapp";

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
      <a className="home-whatsapp-fab" href={whatsappHref("Bonjour MOAYE SERVICES, j’aimerais avoir des informations sur vos services.")} target="_blank" rel="noopener noreferrer" aria-label="Contacter MOAYE SERVICES sur WhatsApp" title="Contacter MOAYE SERVICES sur WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a8.8 8.8 0 0 0-7.6 13.2L3.2 21l5-1.3A8.8 8.8 0 1 0 12 3Zm0 15.8a7 7 0 0 1-3.6-1l-.3-.2-3 .8.8-2.9-.2-.3A7 7 0 1 1 12 18.8Zm3.8-5.2c-.2-.1-1.3-.7-1.5-.7s-.4-.1-.5.1-.6.7-.7.8-.3.2-.5.1a6 6 0 0 1-1.8-1.1 6.7 6.7 0 0 1-1.2-1.5c-.1-.2 0-.3.1-.4l.4-.5.2-.4v-.4c0-.1-.5-1.2-.7-1.6s-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3a2.5 2.5 0 0 0-.8 1.9 4.4 4.4 0 0 0 .9 2.3 10.1 10.1 0 0 0 3.9 3.4c.5.2.9.4 1.2.4.5.1 1 .1 1.4 0 .4-.1 1.3-.5 1.5-1s.2-.9.2-1-.2-.2-.4-.3Z" fill="currentColor" /></svg>
      </a>
    </main>
  );
}
