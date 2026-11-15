import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Suivi technique et sanitaire des élevages — MOAYE SERVICE",
  description:
    "Découvrez l’accompagnement MOAYE SERVICE pour observer votre élevage, suivre les pratiques et définir des actions adaptées à votre terrain.",
};

const points = [
  {
    number: "01",
    title: "Observer les animaux",
    text: "Repérer les changements de comportement, d’appétit ou d’état général et noter les observations utiles.",
  },
  {
    number: "02",
    title: "Examiner les conditions d’élevage",
    text: "Faire le point sur le logement, l’hygiène, l’accès à l’eau et l’organisation quotidienne du site.",
  },
  {
    number: "03",
    title: "Suivre les pratiques",
    text: "Structurer le suivi de l’alimentation, des soins courants et des indicateurs de production pertinents.",
  },
  {
    number: "04",
    title: "Définir les prochaines actions",
    text: "Prioriser des améliorations réalistes selon les besoins observés, les objectifs et les moyens disponibles.",
  },
];

const steps = [
  ["Échanger", "Nous comprenons votre activité, vos objectifs et les difficultés rencontrées."],
  ["Observer", "Nous examinons les animaux, les installations et les pratiques sur le terrain."],
  ["Prioriser", "Nous identifions les points à traiter et convenons des actions adaptées."],
  ["Faire le point", "Le suivi permet d’observer l’évolution et d’ajuster les pratiques au besoin."],
];

export default function SuiviTechniqueSanitairePage() {
  return (
    <main className="svc-followup-page">
      <section className="svc-followup-hero">
        <div className="svc-followup-container">
          <nav className="svc-followup-breadcrumb" aria-label="Fil d’Ariane">
            <Link href="/">Accueil</Link>
            <span aria-hidden="true">/</span>
            <Link href="/expertises">Nos expertises</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Suivi technique et sanitaire</span>
          </nav>

          <div className="svc-followup-heroGrid">
            <div className="svc-followup-heroCopy">
              <span className="svc-followup-eyebrow">Élevage · Accompagnement de terrain</span>
              <h1>Un meilleur suivi pour prendre soin de votre élevage</h1>
              <p>
                Observez les évolutions, organisez vos pratiques et identifiez les priorités avec un accompagnement adapté à vos animaux et à votre site.
              </p>
              <div className="svc-followup-actions">
                <Link className="svc-followup-primaryButton" href="/devis">Parler de mon élevage</Link>
                <Link className="svc-followup-secondaryButton" href="#methode">Découvrir la méthode</Link>
              </div>
              <div className="svc-followup-trustLine">
                <span>Observation de terrain</span>
                <span>Conseils adaptés</span>
                <span>Suivi dans la durée</span>
              </div>
            </div>

            <figure className="svc-followup-heroVisual">
              <div className="svc-followup-heroImage">
                <Image
                  src="/cattle-health-monitoring.jpg"
                  alt="Un technicien examine une vache dans un élevage en présence d’un éleveur"
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 48vw"
                  style={{ objectFit: "cover", objectPosition: "50% 38%" }}
                />
              </div>
              <figcaption>Un accompagnement au plus près des réalités de l’élevage.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="svc-followup-section">
        <div className="svc-followup-container">
          <div className="svc-followup-sectionHeading">
            <span className="svc-followup-sectionEyebrow">Un suivi concret</span>
            <h2>Des repères utiles pour piloter votre élevage</h2>
            <p>Le contenu de l’accompagnement dépend de l’espèce, du système d’élevage et de vos objectifs.</p>
          </div>
          <div className="svc-followup-pointsGrid">
            {points.map((point) => (
              <article className="svc-followup-pointRow" key={point.number}>
                <span className="svc-followup-pointNumber">{point.number}</span>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="svc-followup-methodSection" id="methode">
        <div className="svc-followup-container">
          <div className="svc-followup-sectionHeading">
            <span className="svc-followup-sectionEyebrow">Les étapes du suivi</span>
            <h2>Du premier échange aux ajustements</h2>
            <p>Les recommandations sont établies à partir de votre situation et des observations faites sur le terrain.</p>
          </div>
          <ol className="svc-followup-stepsGrid">
            {steps.map(([title, text], index) => (
              <li className="svc-followup-step" key={title}>
                <span className="svc-followup-stepNumber">{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="svc-followup-fieldSection">
        <div className="svc-followup-container svc-followup-fieldGrid">
          <div className="svc-followup-fieldImage">
            <Image
              src="/photos/cattle-health-check.webp"
              alt="Un technicien examine un bovin en présence d’un éleveur"
              fill
              sizes="(max-width: 900px) 100vw, 44vw"
              style={{ objectFit: "cover", objectPosition: "50% 45%" }}
            />
          </div>
          <div className="svc-followup-fieldCopy">
            <span className="svc-followup-sectionEyebrow">Adapté à votre terrain</span>
            <h2>Des conseils qui tiennent compte de votre réalité</h2>
            <p>
              La taille du troupeau, les installations, l’alimentation et les ressources disponibles influencent les décisions à prendre. Le suivi aide à organiser les observations et à choisir les prochaines actions avec méthode.
            </p>
            <ul>
              <li>Un échange sur les objectifs et les contraintes de l’élevage</li>
              <li>Des observations et des priorités compréhensibles</li>
              <li>Des pistes d’amélioration à discuter avec l’équipe</li>
            </ul>
          </div>
        </div>
      </section>

      <aside className="svc-followup-notice">
        <div className="svc-followup-container">
          <strong>Une situation urgente ?</strong>
          <p>
            En cas de maladie, de mortalité inhabituelle ou d’urgence, contactez rapidement un vétérinaire ou un technicien qualifié. Cet accompagnement ne remplace pas un diagnostic vétérinaire.
          </p>
        </div>
      </aside>

      <section className="svc-followup-ctaSection">
        <div className="svc-followup-container svc-followup-ctaInner">
          <div>
            <span className="svc-followup-sectionEyebrow">Parlons de votre élevage</span>
            <h2>Vous souhaitez organiser un suivi technique ?</h2>
            <p>Présentez votre activité et vos besoins. L’équipe pourra étudier votre demande et vous orienter.</p>
          </div>
          <Link className="svc-followup-primaryButton" href="/devis">Décrire mon projet</Link>
        </div>
      </section>
    </main>
  );
}



