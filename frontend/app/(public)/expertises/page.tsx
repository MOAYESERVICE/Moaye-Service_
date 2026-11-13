import Link from "next/link";
import Photo from "@/components/ui/Photo";
import CtaBand from "@/components/home/CtaBand";
import { expertises } from "@/data/home";

const accompagnements = [
  {
    title: "Étude et préparation de projet",
    desc: "Clarifiez vos objectifs, évaluez les besoins du terrain et préparez un plan de démarrage réaliste.",
    image: "/photos/pond-construction.webp",
    alt: "Aménagement d'un site destiné à un projet d'élevage",
  },
  {
    title: "Installation et équipements",
    desc: "Organisez la mise en place de vos installations et choisissez les équipements adaptés à votre activité.",
    image: "/aquaculture-cage-installation.jpg",
    alt: "Installation d'équipements pour un élevage piscicole",
  },
  {
    title: "Formation des producteurs",
    desc: "Renforcez les pratiques de vos équipes grâce à des conseils techniques adaptés aux réalités du terrain.",
    image: "/moaye-team-collaboration.jpg",
    alt: "Équipe de terrain accompagnant des producteurs",
  },
  {
    title: "Suivi technique et sanitaire",
    desc: "Suivez les résultats de votre élevage et bénéficiez de conseils pour ajuster vos pratiques au quotidien.",
    image: "/cattle-health-monitoring.jpg",
    alt: "Technicien réalisant un suivi sanitaire sur le terrain",
  },
];

const directoryCards = [
  ...expertises.map((expertise) => ({
    title: expertise.title,
    desc: expertise.desc,
    href: expertise.href,
    image: expertise.img ?? "/moaye-team-collaboration.jpg",
    alt: expertise.img ? expertise.alt : "Équipe de terrain accompagnant un projet agricole",
  })),
  ...accompagnements.map((item) => ({
    title: item.title,
    desc: item.desc,
    href: "/devis",
    image: item.image,
    alt: item.alt,
  })),
];

export const metadata = {
  title: "Nos expertises — MOAYE SERVICE",
  description: "Découvrez les expertises agricoles, d'élevage, d'aviculture, d'aquaculture et de nutrition animale de MOAYE SERVICE.",
};

export default function ExpertisesPage() {
  return (
    <main>
      <section className="expertise-directory-hero">
        <div className="wrap expertise-directory-hero-inner">
          <div className="expertise-directory-intro">
            <span className="tag">Nos expertises</span>
            <h1>Faisons grandir vos projets agro-pastoraux</h1>
            <p>Des conseils de terrain, des installations adaptées et un suivi à chaque étape, de l’agriculture à l’aquaculture.</p>
            <div className="expertise-directory-actions">
              <Link className="btn btn-amber" href="#domaines">Découvrir nos expertises</Link>
              <Link className="expertise-directory-contact" href="/devis">Parler de mon projet</Link>
            </div>
          </div>
          <div className="expertise-directory-hero-photo">
            <Photo src="/moaye-team-collaboration.jpg" alt="Deux membres de MOAYE SERVICES en combinaison lors d'un accompagnement de terrain" height={400} position="50% 25%" sizes="(max-width: 700px) 100vw, 50vw" />
            <span>Un accompagnement de proximité, adapté à votre terrain.</span>
          </div>
        </div>
      </section>

      <section id="domaines" className="section">
        <div className="wrap">
          <div className="head expertise-directory-head">
            <span className="eyebrow">Nos savoir-faire</span>
            <h2 className="h2">De l’idée au suivi de votre activité</h2>
            <p className="lead">Explorez nos domaines d’expertise et les accompagnements concrets proposés pour faire avancer votre projet.</p>
          </div>
          <div className="expertise-directory-grid">
            {directoryCards.map((item) => (
              <article
                key={item.title}
                id={item.title === "Agriculture" ? "agriculture" : undefined}
                className="expertise-directory-card"
              >
                <Link className="expertise-directory-image" href={item.href} aria-label={`Découvrir ${item.title}`}>
                  <Photo src={item.image} alt={item.alt} height={230} position={item.image === "/moaye-team-collaboration.jpg" ? "50% 20%" : undefined} />
                </Link>
                <div className="expertise-directory-body">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <Link className="expertise-directory-link" href={item.href}>
                    {item.href === "/devis" ? "Demander un accompagnement" : "Découvrir cette expertise"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CtaBand />
    </main>
  );
}
