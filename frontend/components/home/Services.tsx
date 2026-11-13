import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { services } from "@/data/services";

export default function Services() {
  return (
    <section id="services" className="section section-mist" data-reveal data-home-order="services">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Services</span>
          <h2>Tout ce qu&apos;il faut pour réussir votre ferme</h2>
        </div>
        <div className="grid grid-300">
          {services.map((s) => (
            <div key={s.title} className="card pad">
              <div className="icon-box"><Icon d={s.icon} /></div>
              <h3>{s.title}</h3>
              <p className="muted" style={{ flex: "1 1 auto" }}>{s.desc}</p>
              <Link className="more" href={s.href}>{s.cta} <span aria-hidden="true">→</span></Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}