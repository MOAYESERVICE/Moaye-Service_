import Link from "next/link";
import Photo from "@/components/ui/Photo";

const apicultureSteps = [
  "Choisir l’emplacement des ruches",
  "Prévoir le matériel et la protection",
  "Installer et suivre les colonies",
];

export default function ApicultureFocus() {
  return (
    <section className="section section-dark apiculture-focus">
      <div className="wrap split apiculture-focus-layout">
        <div className="apiculture-focus-copy">
          <span className="eyebrow eyebrow-light">Focus apiculture</span>
          <h2 className="h2">Apiculture : des ruches adaptées à votre projet</h2>
          <p className="lead lead-light">
            Vous souhaitez démarrer ou développer une activité apicole ? MOAYE SERVICE vous accompagne dans le choix de l’emplacement, la préparation du matériel et le suivi des colonies, selon votre site et vos objectifs.
          </p>
          <ul className="apiculture-steps" aria-label="Étapes de l’accompagnement apicole">
            {apicultureSteps.map((step, index) => (
              <li key={step}>
                <span aria-hidden="true">0{index + 1}</span>
                {step}
              </li>
            ))}
          </ul>
          <Link className="btn btn-amber apiculture-cta apiculture-cta-desktop" href="/devis">
            Parler de votre projet apicole
          </Link>
        </div>
        <figure className="apiculture-focus-photo">
          <Photo
            src="/photos/apiculture-field.jpg"
            alt="Apiculteur équipé d’une combinaison de protection pour travailler avec les ruches"
            height={520}
            sizes="(max-width: 700px) 100vw, 50vw"
          />
          <figcaption className="apiculture-photo-note">
            <strong>Apiculture et agriculture font bon ménage.</strong>
            <span>L’action pollinisatrice des abeilles favorise la production agricole. Un accompagnement adapté peut faciliter la mise en place de votre projet.</span>
          </figcaption>
        </figure>
        <div className="apiculture-focus-action">
          <Link className="btn btn-amber apiculture-cta" href="/devis">
            Parler de votre projet apicole
          </Link>
        </div>
      </div>
    </section>
  );
}
