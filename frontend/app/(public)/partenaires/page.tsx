import PartnersSection from "@/components/home/PartnersSection";

export const metadata = { title: "Partenaires — MOAYE SERVICES" };

export default function PartnersPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="wrap stack" style={{ paddingTop: 44, paddingBottom: 44, gap: 14 }}>
          <span className="tag">Partenaires</span>
          <h1>Des collaborations au service des projets de terrain</h1>
          <p>Découvrez les organisations référencées parmi nos partenaires.</p>
        </div>
      </section>
      <PartnersSection />
    </main>
  );
}
