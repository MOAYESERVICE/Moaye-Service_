import Link from "next/link";

export default function CtaBand() {
  return (
    <section className="cta">
      <div className="wrap cta-inner" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <div>
          <h2>Vous avez un projet agro-pastoral ?</h2>
          <p>Parlons de vos objectifs et étudions ensemble les solutions adaptées à votre projet.</p>
        </div>
        <div className="cta-actions">
          <Link className="btn btn-ink" href="/devis">Demander un devis</Link>
          <Link className="btn btn-ghost" href="/contact">Nous contacter</Link>
        </div>
      </div>
    </section>
  );
}