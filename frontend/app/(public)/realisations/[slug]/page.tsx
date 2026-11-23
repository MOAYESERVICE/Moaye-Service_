import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Photo from "@/components/ui/Photo";
import { projects } from "@/data/home";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return { title: project ? `${project.title} — MOAYE SERVICES` : "Réalisation — MOAYE SERVICES" };
}

export default async function RealisationDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  return (
    <main className="section">
      <div className="wrap" style={{ maxWidth: 920 }}>
        <Link className="more" href="/realisations">← Toutes les réalisations</Link>
        <article className="card block" style={{ marginTop: 20 }}>
          <Photo src={project.img} alt={project.alt} height={420} sizes="(max-width: 700px) 100vw, 920px" />
          <span className="tag">{project.domain}</span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700 }}>{project.title}</h1>
          <p className="muted">{project.desc}</p>
          <Link className="btn btn-green" href="/connexion">Continuer ce projet</Link>
        </article>
      </div>
    </main>
  );
}
