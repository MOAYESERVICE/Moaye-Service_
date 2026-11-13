import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { services } from "@/data/home";

export const metadata = { title: "Nos services — MOAYE SERVICES" };

export default function ServicesPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="wrap stack" style={{ paddingTop: 44, paddingBottom: 44, gap: 14 }}>
          <span className="tag">Nos services</span>
          <h1>Un accompagnement de l’étude au suivi</h1>
          <p>Des prestations adaptées aux producteurs et porteurs de projets agricoles, d’élevage et d’aquaculture.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="grid grid-300">
            {services.map((service) => (
              <article id={service.slug} className="card pad" key={service.slug}>
                <div className="icon-box"><Icon d={service.icon} /></div>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>{service.title}</h2>
                <p className="muted">{service.desc}</p>
                <Link className="more" href="/devis">Parler de ce service</Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
