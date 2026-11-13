import PhotoSlot from "@/components/ui/PhotoSlot";
import { projects } from "@/data/projects";

export default function Projects() {
  return (
    <section id="realisations" className="section section-mist" data-reveal data-home-order="projects">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Réalisations</span>
          <h2>Des projets menés sur le terrain</h2>
        </div>
        <div className="grid grid-320">
          {projects.map((p) => (
            <article key={p.title} className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 16 }}>
              <PhotoSlot label={p.title} height={220} src={p.image} />
              <div className="proj-body">
                <h3>{p.title}</h3>
                <p className="muted">{p.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}