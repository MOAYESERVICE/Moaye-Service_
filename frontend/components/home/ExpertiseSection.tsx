import Link from "next/link";
import Photo from "@/components/ui/Photo";
import { homeExpertises } from "@/data/home";

export default function ExpertiseSection() {
  return (
    <section id="expertises" className="section">
      <div className="wrap">
        <div className="head">
          <span className="eyebrow">Nos expertises</span>
          <h2 className="h2">Quatre domaines pour réussir vos projets</h2>
          <p className="lead">Une expertise technique complète, de la préparation des activités au suivi des animaux et des cultures.</p>
        </div>
        <div className="grid grid-260" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {homeExpertises.map((e) => (
            <article key={e.title} className="expertise-preview-card">
              <Link className="expertise-preview-image" href={e.href} aria-label={`Découvrir ${e.title}`}>
                <Photo
                  src={e.img ?? "/moaye-team-collaboration.jpg"}
                  alt={e.img ? e.alt : "Équipe de terrain accompagnant un projet agricole"}
                  height={200}
                  position={e.img === "/moaye-team-collaboration.jpg" ? "50% 20%" : undefined}
                />
              </Link>
              <div className="expertise-preview-body">
                <h3>{e.title}</h3>
                <p>{e.desc}</p>
                <Link className="expertise-preview-link" href={e.href}>{e.cta}</Link>
              </div>
            </article>
          ))}
        </div>
        <div style={{ marginTop: 36 }}><Link className="btn btn-green" href="/expertises">Découvrir toutes nos expertises</Link></div>
      </div>
    </section>
  );
}
