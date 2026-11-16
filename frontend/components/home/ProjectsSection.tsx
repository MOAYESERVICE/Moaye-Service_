import Link from "next/link";
import { connection } from "next/server";
import Photo from "@/components/ui/Photo";
import { getPublishedRealisations } from "@/lib/realisations";

export default async function ProjectsSection() {
  // Les réalisations viennent de l’API avec cache no-store : cette section doit
  // être rendue à la requête, pas pré-rendue avec une valeur volatile.
  await connection();
  const projects = await getPublishedRealisations();
  return (
    <section id="realisations" className="section">
      <div className="wrap">
        <div className="head">
          <span className="eyebrow">Nos réalisations</span>
          <h2 className="h2">Des projets menés sur le terrain</h2>
          <p className="lead">Photographies, localisation et résultats documentés de nos interventions.</p>
        </div>
        {projects.length ? <>
          <div className="grid grid-320">
            {projects.slice(0, 6).map((project) => (
              <article key={project.id} className="card realisation-card">
                <Photo src={project.imageUrl} alt={project.imageAlt} height={220} />
                <div className="realisation-card-content">
                  <span className="tag realisation-card-tag">{project.domain}{project.location ? ` · ${project.location}` : ""}</span>
                  <h3 className="project-card-title">{project.title}</h3>
                  <p className="muted realisation-card-description">{project.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="projects-section-cta"><Link className="btn btn-green" href="/realisations">Voir les projets et photos</Link></div>
        </> : <p className="muted">Nos réalisations seront bientôt présentées ici.</p>}
      </div>
    </section>
  );
}
