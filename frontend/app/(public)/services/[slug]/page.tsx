import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import PhotoSlot from "@/components/ui/PhotoSlot";
import CtaBand from "@/components/home/CtaBand";

const nutritionTopics = [
  {
    title: "Choisir un aliment adapté",
    desc: "L'aliment doit correspondre à l'espèce élevée, à la taille des poissons et à leur stade de croissance. La taille des granulés compte : ils doivent pouvoir être avalés facilement, sans se disperser inutilement dans l'eau.",
  },
  {
    title: "Distribuer sans gaspiller",
    desc: "La quantité et le rythme des repas s'ajustent à l'effectif, au poids moyen et à l'appétit observé. Une distribution régulière aide à suivre la consommation et évite que l'excédent d'aliment ne dégrade l'eau.",
  },
  {
    title: "Protéger l'aliment et l'eau",
    desc: "Un aliment conservé au sec, à l'abri de la chaleur et des nuisibles, garde mieux sa qualité. Observer l'eau et retirer les restes aide aussi à repérer un problème de distribution ou de qualité d'eau.",
  },
];

const growthStages = [
  {
    title: "Alevins et jeunes poissons",
    desc: "Les poissons de petite taille ont besoin d'un aliment et de granulés adaptés à leur bouche. Des repas bien répartis et l'observation de la prise alimentaire aident à suivre leur démarrage et leur croissance.",
  },
  {
    title: "Poissons en croissance",
    desc: "À mesure qu'ils grandissent, la taille des granulés et les quantités distribuées évoluent. Des pesées ou estimations régulières d'un échantillon permettent de réévaluer les besoins du lot.",
  },
  {
    title: "Poissons proches de la récolte",
    desc: "Le suivi de la consommation, de la croissance et de l'état du lot permet de gérer la fin du cycle et de préparer la récolte. Le programme reste cohérent avec l'objectif de production et les conditions du site.",
  },
];

const steps = [
  {
    n: "01",
    title: "Observer le site et le lot",
    desc: "Identifier l'espèce, le système (étang, enclos ou cage), l'effectif, la taille des poissons, l'aliment utilisé et les objectifs de production.",
  },
  {
    n: "02",
    title: "Adapter le programme alimentaire",
    desc: "Définir avec le producteur le type et la taille d'aliment, les quantités indicatives et le rythme de distribution selon le stade des poissons et les recommandations du fabricant.",
  },
  {
    n: "03",
    title: "Organiser les repas",
    desc: "Mettre en place une distribution régulière, conserver les sacs correctement et noter les quantités données ainsi que les réactions des poissons.",
  },
  {
    n: "04",
    title: "Suivre la croissance et l'eau",
    desc: "Comparer la consommation et la croissance, observer l'appétit et surveiller l'état de l'eau pour ajuster les pratiques avec un technicien.",
  },
];

const avicultureTopics = [
  {
    title: "Préparer le bâtiment",
    desc: "Avant l'arrivée des poussins, le bâtiment doit être nettoyé et préparé. La litière, les mangeoires, les abreuvoirs, l'aération et la protection contre les prédateurs sont vérifiés pour accueillir le lot dans de bonnes conditions.",
  },
  {
    title: "Organiser l'alimentation et l'eau",
    desc: "Les aliments et l'accès à l'eau sont adaptés à l'âge et au type de production. Une distribution régulière, des équipements propres et le contrôle de la consommation facilitent le suivi du lot.",
  },
  {
    title: "Surveiller l'ambiance et l'hygiène",
    desc: "La ventilation, la température, la litière et la propreté des équipements influencent le confort des volailles. Des observations quotidiennes aident à détecter rapidement un changement inhabituel.",
  },
];

const avicultureTypes = [
  {
    title: "Poulets de chair",
    desc: "L'élevage vise la croissance d'un lot destiné à la production de viande. Le suivi porte notamment sur le démarrage, l'accès à l'aliment et à l'eau, le confort du bâtiment et l'évolution du poids.",
  },
  {
    title: "Poules pondeuses",
    desc: "La conduite d'un élevage de ponte demande une organisation adaptée à l'âge des poules, à l'alimentation, à l'eau, à la lumière et à la collecte des œufs.",
  },
  {
    title: "Autres élevages",
    desc: "Les installations et les pratiques sont définies selon les espèces, les objectifs du producteur, la taille du projet et les contraintes du site.",
  },
];

const avicultureSteps = [
  {
    n: "01",
    title: "Étudier votre projet",
    desc: "Échanger sur vos objectifs, le type d'élevage, le nombre d'animaux envisagé, le site et les moyens disponibles.",
  },
  {
    n: "02",
    title: "Concevoir les installations",
    desc: "Organiser le bâtiment et les équipements essentiels : abreuvement, alimentation, ventilation, litière et circulation.",
  },
  {
    n: "03",
    title: "Préparer le démarrage",
    desc: "Planifier l'arrivée du lot, préparer les locaux et les équipements, et expliquer les points de contrôle à l'équipe.",
  },
  {
    n: "04",
    title: "Suivre et ajuster",
    desc: "Observer les animaux et les conditions d'élevage, tenir les informations de production et solliciter un professionnel en cas de problème sanitaire.",
  },
];

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "elevage-aviculture") {
    return {
      title: "Élevage et aviculture — MOAYE SERVICE",
      description:
        "Accompagnement des projets avicoles : préparation des bâtiments, équipements, démarrage et suivi des élevages.",
    };
  }
  if (slug !== "nutrition-animale") return { title: "Service — MOAYE SERVICE" };

  return {
    title: "Nutrition animale — MOAYE SERVICE",
    description:
      "Conseils en nutrition des poissons d'élevage : choix de l'aliment, distribution, suivi de la croissance et qualité de l'eau.",
  };
}

export function generateStaticParams() {
  return [{ slug: "nutrition-animale" }, { slug: "elevage-aviculture" }];
}

function AvicultureDetail() {
  return (
    <main className="service-focus service-focus--aviculture">
      <section className="page-hero service-focus-hero">
        <div className="wrap page-hero-inner">
          <div className="stack">
            <span className="tag">Élevage · Aviculture</span>
            <h1>Construire un élevage avicole bien préparé et bien suivi</h1>
            <p>
              De la préparation du bâtiment au suivi quotidien du lot, nous vous
              accompagnons pour organiser votre projet avicole selon vos
              objectifs, vos installations et vos moyens. Les conseils sont
              adaptés au type d&apos;élevage et complétés par l&apos;avis de
              professionnels de santé animale lorsque nécessaire.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link className="btn btn-green" href="#accompagnement">
                Découvrir l&apos;accompagnement
              </Link>
              <Link className="btn btn-amber" href="/devis">
                Demander un devis
              </Link>
            </div>
          </div>
          <PhotoSlot
            label="Éleveurs préparant un bâtiment avicole"
            height={340}
            src="/photos/poultry-farming.webp"
            priority
          />
        </div>
      </section>

      <section id="accompagnement" className="section section-dark service-detail-section aviculture-section aviculture-dark">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Les points essentiels</span>
            <h2>Des bases solides pour bien démarrer l&apos;élevage</h2>
            <p>
              La réussite d&apos;un lot dépend de la préparation du bâtiment,
              de l&apos;accès à l&apos;eau et à l&apos;aliment, et de
              l&apos;observation régulière des animaux. Nous vous aidons à
              organiser ces pratiques dès le départ.
            </p>
          </div>
          <div className="grid grid-300">
            {avicultureTopics.map((topic, index) => (
              <article
                key={topic.title}
                className={`card pad service-detail-card service-detail-card-${index + 1}`}
              >
                <span className="service-detail-mark" aria-hidden="true">
                  0{index + 1}
                </span>
                <h3>{topic.title}</h3>
                <p className="muted">{topic.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-mist service-detail-section service-detail-muted aviculture-section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Selon votre production</span>
            <h2>Une conduite adaptée au type d&apos;élevage</h2>
            <p>
              Poulets de chair, poules pondeuses ou autre projet avicole : les
              équipements, le calendrier et les points de suivi sont définis
              selon les besoins du lot et le contexte de l&apos;exploitation.
            </p>
          </div>
          <div className="grid grid-300">
            {avicultureTypes.map((type, index) => (
              <article
                key={type.title}
                className={`card pad service-detail-card service-detail-card-${index + 1}`}
              >
                <span className="service-detail-mark" aria-hidden="true">
                  0{index + 1}
                </span>
                <h3>{type.title}</h3>
                <p className="muted">{type.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Notre méthode</span>
            <h2>De l&apos;étude du projet au suivi du lot</h2>
          </div>
          <div className="grid grid-240">
            {avicultureSteps.map((step) => (
              <article key={step.n} className="card pad">
                <span className="num">{step.n}</span>
                <h3>{step.title}</h3>
                <p className="muted">{step.desc}</p>
              </article>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 24 }}>
            Les mesures sanitaires et les traitements doivent être définis avec
            un vétérinaire ou un professionnel de santé animale, selon la
            situation de l&apos;élevage.
          </p>
        </div>
      </section>

      <section className="section section-mist">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Un suivi dans la durée</span>
            <h2>Un élevage bien conduit se prépare chaque jour</h2>
            <p>
              L&apos;accompagnement ne s&apos;arrête pas à la construction du
              bâtiment ou à l&apos;arrivée des poussins. Nous vous aidons à mettre
              en place une routine de travail : vérifier l&apos;eau et
              l&apos;aliment, observer le comportement des volailles, contrôler
              la litière et l&apos;aération, puis noter les changements
              importants du lot. Ces gestes réguliers permettent de repérer
              rapidement une difficulté et d&apos;adapter l&apos;organisation de
              l&apos;élevage.
            </p>
            <p>
              Le suivi tient compte de l&apos;âge des animaux, du type de
              production et des conditions du bâtiment. En cas de mortalité
              inhabituelle, de signes de maladie ou de baisse importante de
              consommation, il faut contacter rapidement un vétérinaire ou un
              professionnel de santé animale : le suivi technique ne remplace
              pas un diagnostic ni un traitement vétérinaire.
            </p>
          </div>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}

async function ServiceDetailContent({ params }: ServicePageProps) {
  const { slug } = await params;
  if (slug === "elevage-aviculture") return <AvicultureDetail />;
  if (slug !== "nutrition-animale") notFound();

  return (
    <main className="service-focus service-focus--nutrition">
      <section className="page-hero service-focus-hero">
        <div className="wrap page-hero-inner">
          <div className="stack">
            <span className="tag">Aquaculture · Nutrition des poissons</span>
            <h1>Bien nourrir vos poissons, de l&apos;alevin à la récolte</h1>
            <p>
              En pisciculture, l&apos;alimentation est un élément essentiel de la
              croissance et du coût de production. Nous vous accompagnons pour
              choisir un aliment adapté, organiser sa distribution et suivre la
              consommation de vos poissons selon votre système d&apos;élevage.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link className="btn btn-green" href="#accompagnement">
                Découvrir l&apos;accompagnement
              </Link>
              <Link className="btn btn-amber" href="/devis">
                Demander un devis
              </Link>
            </div>
          </div>
          <PhotoSlot
            label="Poissons tilapias issus d'une récolte piscicole"
            height={340}
            src="/photos/fish-harvest.webp"
            priority
          />
        </div>
      </section>

      <section id="accompagnement" className="section service-detail-section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Bien nourrir les poissons</span>
            <h2>Un aliment adapté, bien distribué et bien suivi</h2>
            <p>
              La croissance dépend notamment de la qualité et de la taille de
              l&apos;aliment, de la régularité des repas et des conditions d&apos;eau.
              Une observation attentive permet d&apos;adapter les pratiques sans
              distribuer plus que les poissons ne peuvent consommer.
            </p>
          </div>
          <div className="grid grid-300">
            {nutritionTopics.map((topic, index) => (
              <article key={topic.title} className={`card pad service-detail-card service-detail-card-${index + 1}`}>
                <span className="service-detail-mark" aria-hidden="true">0{index + 1}</span>
                <h3>{topic.title}</h3>
                <p className="muted">{topic.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-mist service-detail-section service-detail-muted">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Suivre chaque étape</span>
            <h2>Les besoins évoluent avec la taille des poissons</h2>
            <p>
              De l&apos;alevin au poisson prêt pour la récolte, la taille des
              granulés, la quantité distribuée et le suivi du lot doivent
              évoluer. Les conseils sont adaptés à l&apos;espèce élevée et au
              système utilisé.
            </p>
          </div>
          <div className="grid grid-300">
            {growthStages.map((item, index) => (
              <article key={item.title} className={`card pad service-detail-card service-detail-card-${index + 1}`}>
                <span className="service-detail-mark" aria-hidden="true">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p className="muted">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Notre méthode</span>
            <h2>Un accompagnement concret en quatre étapes</h2>
          </div>
          <div className="grid grid-240">
            {steps.map((step) => (
              <article key={step.n} className="card pad">
                <span className="num">{step.n}</span>
                <h3>{step.title}</h3>
                <p className="muted">{step.desc}</p>
              </article>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 24 }}>
            Les quantités et la composition précises de l&apos;aliment dépendent de
            l&apos;espèce, du poids des poissons, de l&apos;aliment utilisé et des
            conditions du site. Elles sont à confirmer avec un technicien et
            selon les indications du fabricant ; aucun dosage unique ne convient
            à tous les élevages.
          </p>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}

export default function ServiceDetailPage({ params }: ServicePageProps) {
  return (
    <Suspense fallback={<main className="wrap" aria-busy="true" />}>
      <ServiceDetailContent params={params} />
    </Suspense>
  );
}

