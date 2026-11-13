import Photo from "@/components/ui/Photo";
import { projects } from "@/data/home";

export default function ProjectsSection() {
  return (
    <section id="realisations" className="section">
      <div className="wrap">
        <div className="head">
          <span className="eyebrow">Nos réalisations</span>
          <h2 className="h2">Des projets menés sur le terrain</h2>
          <p className="lead">Photographies, localisation et résultats documentés de nos interventions.</p>
        </div>
        <div className="grid grid-320">
          {projects.map((p) => (
            <article key={p.slug} className="card realisation-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 16 }}>
              <Photo src={p.img} alt={p.alt} height={220} />
              <div style={{ padding: "0 10px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
                <span className="tag" style={{ background: "#E3EFE8", border: "none" }}>{p.domain}</span>
                <h3 className="project-card-title">{p.title}</h3>
                <p className="muted">{p.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
