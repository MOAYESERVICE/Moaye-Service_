import PhotoSlot from "@/components/ui/PhotoSlot";
import { values } from "@/data/services";

export default function AboutBlock() {
  return (
    <section id="apropos" className="section section-mist" data-reveal data-home-order="about">
      <div className="wrap split">
        <PhotoSlot label="Équipe au travail sur une installation aquacole" height={380} src="/photos/aquaculture-fieldwork.webp" />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span className="eyebrow">À propos</span>
          <h2 style={{ fontSize: "clamp(28px,3.6vw,40px)", fontWeight: 700 }}>Un savoir-faire ivoirien au service de vos fermes</h2>
          <p className="muted" style={{ fontSize: 17, lineHeight: 1.6 }}>
            MOAYE SERVICE accompagne les porteurs de projets, éleveurs et agriculteurs ivoiriens dans la création et la gestion de leurs fermes. Notre approche associe expertise technique et connaissance du terrain, pour des projets réalistes et durables.
          </p>
          <ul className="values">
            {values.map((v) => (
              <li key={v.title}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B6B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: 2 }}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
                <span><strong>{v.title}</strong> — {v.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}