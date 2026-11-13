import Link from "next/link";

export const metadata = { title: "À propos — MOAYE SERVICES" };

export default function AboutPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="wrap stack" style={{ paddingTop: 44, paddingBottom: 44, gap: 12 }}>
          <span className="tag">À propos</span>
          <h1>À propos de MOAYE SERVICES</h1>
          <p>Cette page est en cours de préparation par le développeur N’Goran Michael. Elle sera disponible bientôt.</p>
          <Link className="btn btn-green" href="/" style={{ alignSelf: "flex-start" }}>
            Retour à l’accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
