import Photo from "@/components/ui/Photo";
import { projects } from "@/data/home";

export const metadata = { title: "Réalisations — MOAYE SERVICES" };

export default function RealisationsPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="wrap stack" style={{ paddingTop: 44, paddingBottom: 44, gap: 14 }}>
          <span className="tag">Réalisations</span>
          <h1>Des interventions dans l’agriculture, l’élevage et l’aquaculture</h1>
          <p>Parcourez les projets et types d’accompagnement présentés par notre équipe.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap grid grid-320">
          {projects.map((project) => (
            <article className="card realisation-card" key={project.slug} style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
              <Photo src={project.img} alt={project.alt} height={220} />
              <div style={{ padding: "0 10px 10px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                <span className="tag">{project.domain}</span>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>{project.title}</h2>
                <p className="muted">{project.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
