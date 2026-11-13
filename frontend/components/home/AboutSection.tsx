import Link from "next/link";
import Photo from "@/components/ui/Photo";
import { values } from "@/data/home";

export default function AboutSection() {
  return (
    <section id="apropos" className="section section-mist">
      <div className="wrap split about-layout" style={{ gap: 56 }}>
        <div className="about-team-photo">
          <Photo src="/photos/ya esses simeon.jpg" alt="Ya Esse Siméon lors d'une réunion de planification des activités d'élevage" height={560} position="50% 50%" sizes="(max-width: 700px) 100vw, 480px" />
        </div>
        <div className="about-team-copy">
          <span className="eyebrow about-team-eyebrow">À propos de MOAYE SERVICES</span>
          <h2 className="h2 about-team-title">Une expertise au service du développement agro-pastoral</h2>
          <p className="lead about-team-description">Sous la direction de M. Ya Esse Siméon, expert zootechnicien et nutritionniste, MOAYE SERVICES accompagne les producteurs, les organisations et les acteurs du développement dans leurs projets agricoles, d&apos;élevage et d&apos;aquaculture.</p>
          <p className="lead about-team-description">L&apos;entreprise met son expertise technique au service de solutions adaptées aux besoins des clients et aux réalités du terrain.</p>
          <ul className="values">
            {values.map((v) => (
              <li key={v.title}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B6B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: 2 }}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                <span><strong>{v.title}</strong> — {v.desc}</span>
              </li>
            ))}
          </ul>
          <div className="about-team-action"><Link className="btn btn-green" href="/a-propos">En savoir plus sur nous</Link></div>
        </div>
      </div>
    </section>
  );
}