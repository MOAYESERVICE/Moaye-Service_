import Hero from "@/components/home/Hero";
import AssetsStrip from "@/components/home/AssetsStrip";
import ExpertiseSection from "@/components/home/ExpertiseSection";
import AquaFocus from "@/components/home/AquaFocus";
import ServicesSection from "@/components/home/ServicesSection";
import MethodSection from "@/components/home/MethodSection";
import ProductsSection from "@/components/home/ProductsSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import PartnersSection from "@/components/home/PartnersSection";
import AssistantBand from "@/components/home/AssistantBand";
import AboutSection from "@/components/home/AboutSection";
import FaqSection from "@/components/home/FaqSection";
import CtaBand from "@/components/home/CtaBand";

export default function Home() {
  return (
    <main>
      <Hero />
      <AssetsStrip />
      <ExpertiseSection />
      <AquaFocus />
      <ServicesSection />
      <MethodSection />
      <ProductsSection />
      <ProjectsSection />
      <PartnersSection />
      <AssistantBand />
      <AboutSection />
      <FaqSection />
      <CtaBand />
    </main>
  );
}
