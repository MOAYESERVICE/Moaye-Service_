import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import Photo from "@/components/ui/Photo";
import RealisationPhotoGallery from "@/components/public/RealisationPhotoGallery";
import { getPublishedRealisationPhotos, getPublishedRealisations } from "@/lib/realisations";

export const metadata = { title: "Réalisations — MOAYE SERVICES" };

async function RealisationsList() {
  // Les données sont modifiées depuis l’admin : charger la liste à chaque requête.
  await connection();
  const [projects, photos] = await Promise.all([getPublishedRealisations(), getPublishedRealisationPhotos()]);
  if (!projects.length && !photos.length) return <p className="wrap muted">Aucune réalisation publiée pour le moment.</p>;

  return (
    <div className="wrap stack realisations-public-content">
      {projects.length > 0 && <div className="grid grid-320">
        {projects.map((project) => (
          <article className="card realisation-card" key={project.id}>
            <Photo src={project.imageUrl} alt={project.imageAlt} height={220} />
            <div className="realisation-card-content">
              <span className="tag realisation-card-tag">{project.domain}{project.location ? ` · ${project.location}` : ""}</span>
              <h2 className="project-card-title">{project.title}</h2>
              <p className="muted realisation-card-description">{project.description}</p>
              <Link className="btn btn-ghost btn-sm" href="/connexion">Continuer ce projet</Link>
            </div>
          </article>
        ))}
      </div>}
      {photos.length > 0 && <section className="realisation-photo-gallery" aria-labelledby="realisation-photo-gallery-title">
        <div className="realisation-gallery-heading">
          <div>
            <span className="realisation-gallery-eyebrow">SUR LE TERRAIN</span>
            <h2 id="realisation-photo-gallery-title">Nos interventions en images</h2>
            <p>Des photos authentiques de nos projets en agriculture, élevage et aquaculture.</p>
          </div>
        </div>
        <RealisationPhotoGallery photos={photos} />
      </section>}
    </div>
  );
}

export default function RealisationsPage() {
  return (
    <main>
      <section className="page-hero realisations-hero">
        <div className="wrap stack" style={{ paddingTop: 44, paddingBottom: 44, gap: 14 }}>
          <span className="tag">Nos réalisations</span>
          <h1>Des projets concrets au service du monde rural</h1>
          <p>De l’élevage à l’aquaculture, découvrez le savoir-faire de nos équipes sur le terrain.</p>
        </div>
      </section>
      <section className="section"><Suspense fallback={<p className="wrap muted" role="status">Chargement des réalisations…</p>}><RealisationsList /></Suspense></section>
    </main>
  );
}
