import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { services } from "@/data/home";

export default function ServicesSection() {
  return (
    <section id="services" className="section section-mist">
      <div className="wrap">
        <div className="head">
          <span className="eyebrow">Nos services</span>
          <h2 className="h2">Un accompagnement complet, de l&apos;idée au suivi</h2>
          <p className="lead">Des prestations claires, pensées pour les producteurs, les organisations et les porteurs de projets.</p>
        </div>
        <div className="grid grid-300">
          {services.map((s) => (
            <div id={s.slug} key={s.slug} className="card pad">
              <div className="icon-box"><Icon d={s.icon} /></div>
              <h3>{s.title}</h3>
              <p className="muted">{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 36 }}><Link className="btn btn-amber" href="/devis">Demander un devis</Link></div>
      </div>
    </section>
  );
}
