import Photo from "@/components/ui/Photo";
import { getPublishedRealisations } from "@/lib/realisations";

export default async function ProjectsSection() {
  const projects = await getPublishedRealisations();
  return (
    <section id="realisations" className="section">
      <div className="wrap">
        <div className="head">
          <span className="eyebrow">Nos réalisations</span>
          <h2 className="h2">Des projets menés sur le terrain</h2>
          <p className="lead">Photographies, localisation et résultats documentés de nos interventions.</p>
        </div>
        {projects.length ? <div className="grid grid-320">
          {projects.slice(0, 6).map((project) => (
            <article key={project.id} className="card realisation-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 16 }}>
              <Photo src={project.imageUrl} alt={project.imageAlt} height={220} />
              <div style={{ padding: "0 10px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
                <span className="tag" style={{ background: "#E3EFE8", border: "none" }}>{project.domain}{project.location ? ` · ${project.location}` : ""}</span>
                <h3 className="project-card-title">{project.title}</h3>
                <p className="muted">{project.description}</p>
              </div>
            </article>
          ))}
        </div> : <p className="muted">Nos réalisations seront bientôt présentées ici.</p>}
      </div>
    </section>
  );
}