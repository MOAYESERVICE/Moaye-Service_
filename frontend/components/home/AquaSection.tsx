import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { aqua } from "@/data/aqua";

export default function AquaSection() {
  return (
    <section className="section section-dark" data-reveal data-home-order="expertise">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow eyebrow-light">Notre expertise phare</span>
          <h2>L&apos;aquaculture, de l&apos;étang à la cage flottante</h2>
          <p>Quatre systèmes d&apos;élevage de poissons, choisis selon votre site, votre budget et vos objectifs de production.</p>
        </div>
        <div className="grid grid-240">
          {aqua.map((a) => (
            <div key={a.title} className="dcard pad">
              <div className="icon-box icon-box-dark"><Icon d={a.icon} /></div>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
            </div>
          ))}
        </div>
        <div className="care-band">
          <div>
            <h3>Gestion, suivi et accompagnement des élevages</h3>
            <p>Un technicien à vos côtés : alimentation, santé, qualité de l&apos;eau, registres de production et conseils.</p>
          </div>
          <Link className="btn btn-amber" href="/expertise">Explorer notre expertise</Link>
        </div>
      </div>
    </section>
  );
}