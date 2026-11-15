import Link from "next/link";
import PhotoSlot from "@/components/ui/PhotoSlot";
import SystemTabs from "@/components/expertise/SystemTabs";
import CareCards from "@/components/expertise/CareCards";
import MethodSteps from "@/components/expertise/MethodSteps";
import CtaBand from "@/components/home/CtaBand";

export const metadata = { title: "Expertise aquaculture — MOAYE SERVICE" };

export default function ExpertisePage() {
  return (
    <main className="service-focus service-focus--aquaculture">
      <section className="page-hero service-focus-hero">
        <div className="wrap page-hero-inner">
          <div className="stack">
            <span className="tag">Expertise</span>
            <h1>L&apos;aquaculture, notre savoir-faire phare</h1>
            <p>Pisciculture en cages flottantes, en enclos, en étangs ou hors-sol : nous choisissons avec vous le système adapté à votre site, puis nous le mettons en place et le suivons.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link className="btn btn-green" href="#systemes">Comparer les systèmes</Link>
              <Link className="btn btn-amber" href="/devis">Demander un devis</Link>
            </div>
          </div>
          <PhotoSlot label="Cages piscicoles installées sur un plan d'eau" height={340} src="/photos/floating-cages.webp" />
        </div>
      </section>

      <section id="systemes" className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Systèmes d&apos;élevage</span>
            <h2>Quel système pour quel site ?</h2>
          </div>
          <SystemTabs />
        </div>
      </section>

      <CareCards />
      <MethodSteps />
      <CtaBand />
    </main>
  );
}
