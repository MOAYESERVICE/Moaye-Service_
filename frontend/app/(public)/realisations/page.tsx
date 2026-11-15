import { Suspense } from "react";
import Photo from "@/components/ui/Photo";
import { getPublishedRealisations } from "@/lib/realisations";

export const metadata = { title: "Réalisations — MOAYE SERVICES" };

async function RealisationsList() {
  const projects = await getPublishedRealisations();
  return projects.length ? (
    <div className="wrap grid grid-320">
      {projects.map((project) => (
        <article className="card realisation-card" key={project.id} style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <Photo src={project.imageUrl} alt={project.imageAlt} height={220} />
          <div style={{ padding: "0 10px 10px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
            <span className="tag">{project.domain}{project.location ? ` · ${project.location}` : ""}</span>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{project.title}</h2>
            <p className="muted">{project.description}</p>
          </div>
        </article>
      ))}
    </div>
  ) : <p className="wrap muted">Aucune réalisation publiée pour le moment.</p>;
}

export default function RealisationsPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="wrap stack" style={{ paddingTop: 44, paddingBottom: 44, gap: 14 }}>
          <span className="tag">Réalisations</span>
          <h1>Des interventions dans l’agriculture, l’élevage et l’aquaculture</h1>
          <p>Découvrez les projets réalisés par notre équipe, en images et avec leurs détails.</p>
        </div>
      </section>
      <section className="section"><Suspense fallback={<p className="wrap muted" role="status">Chargement des réalisations…</p>}><RealisationsList /></Suspense></section>
    </main>
  );
}