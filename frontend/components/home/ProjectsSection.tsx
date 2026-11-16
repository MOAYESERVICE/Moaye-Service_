import Link from "next/link";
import { connection } from "next/server";
import Photo from "@/components/ui/Photo";
import RealisationPhotoGallery from "@/components/public/RealisationPhotoGallery";
import { getPublishedRealisationPhotos, getPublishedRealisations } from "@/lib/realisations";

export default async function ProjectsSection() {
  // Les réalisations viennent de l’API avec cache no-store : cette section doit
  // être rendue à la requête, pas pré-rendue avec une valeur volatile.
  await connection();
  const [projects, photos] = await Promise.all([
    getPublishedRealisations(),
    getPublishedRealisationPhotos(),
  ]);
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
            {projects.slice(0, 3).map((project) => (
              <article key={project.id} className="card realisation-card">
                <Photo src={project.imageUrl} alt={project.imageAlt || project.title} height={220} />
                <div className="realisation-card-content">
                  <span className="tag realisation-card-tag">{project.domain}{project.location ? ` · ${project.location}` : ""}</span>
                  <h3 className="project-card-title">{project.title}</h3>
                  <p className="muted realisation-card-description">{project.description}</p>
                </div>
              </article>
            ))}
          </div>
        </> : <p className="muted">Nos réalisations seront bientôt présentées ici.</p>}
        {photos.length > 0 && <section className="realisation-photo-gallery home-realisation-photo-gallery" aria-label="Photos récentes des réalisations">
          <RealisationPhotoGallery photos={photos.slice(0, 3)} />
        </section>}
        {(projects.length > 0 || photos.length > 0) && <div className="projects-section-cta"><Link className="btn btn-green" href="/realisations">Voir toutes les réalisations</Link></div>}
      </div>
    </section>
  );
}
