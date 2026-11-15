const photos = {
  1: "/aquaculture-cage-installation.jpg",
  2: "/photos/aquaculture-fieldwork.webp",
  3: "/photos/moaye-fish-harvest.png",
  4: "/photos/moaye-fish-production.png",
  5: "/cattle-health-monitoring.jpg",
  6: "/moaye-team-collaboration.jpg",
  7: "/photos/poultry-farming.webp",
  8: "/photos/cattle-veterinary-care.webp",
  9: "/photos/cage-farm-installation.webp",
  10: "/photos/floating-cages.webp",
  11: "/photos/fish-net-harvest.webp",
  12: "/photos/cattle-health-check.webp",
  13: "/photos/poultry-farming.webp",
} as const;

const p = (n: keyof typeof photos) => photos[n];

export const slides = [
  { domain: "Pisciculture et aquaculture", img: p(10), alt: "Cage flottante d'élevage de poissons avec passerelle en bois", title: "Cages flottantes pour l'élevage de poissons", cta: "Découvrir l'aquaculture", href: "/expertise" },
  { domain: "Santé et suivi des animaux", img: p(5), alt: "Soins apportés à un bovin par un technicien", title: "Soins et suivi sanitaire des animaux", cta: "Découvrir nos services", href: "/#services" },
  { domain: "Enclos piscicoles", img: p(1), alt: "Équipe installant une cage piscicole flottante sur un plan d'eau", title: "Enclos installés sur plan d'eau", cta: "Découvrir les systèmes", href: "/expertise" },
  { domain: "Formation et accompagnement", img: p(12), alt: "Un technicien montre un contrôle sanitaire à un éleveur sur le terrain", title: "Formation et encadrement des producteurs", cta: "Voir notre méthode", href: "/#services" },
];

export const assets = [
  { icon: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4", label: "Expert zootechnicien et nutritionniste" },
  { icon: "M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z", label: "Une connaissance du terrain ivoirien" },
  { icon: "M5 4h14v16H5zM9 9h6M9 13h6M9 17h3", label: "Un accompagnement de la conception au suivi" },
  { icon: "M3 12h4l3-7 4 14 3-7h4", label: "Un suivi technique dans la durée" },
];

export const expertises = [
  { title: "Agriculture", desc: "Accompagnement des projets agricoles, préparation des activités et suivi des cultures.", href: "/services#etude-accompagnement-projets", img: p(6) as string | null, alt: "Équipe de terrain mobilisée pour accompagner un projet agricole", placeholder: "" },
  { title: "Élevage et aviculture", desc: "Conception, mise en place, gestion et suivi technique des élevages.", href: "/services/elevage-aviculture", img: p(7), alt: "Poussins dans un bâtiment d'élevage avicole", placeholder: "" },
  { title: "Aquaculture et pisciculture", desc: "Solutions de pisciculture en cages flottantes, enclos, étangs et systèmes hors-sol.", href: "/expertise", img: p(9), alt: "Plateforme d'élevage de poissons en cages flottantes", placeholder: "" },
  { title: "Nutrition animale", desc: "Conseils techniques et accompagnement pour l'alimentation et le suivi des animaux.", href: "/services/nutrition-animale", img: p(3), alt: "Poissons issus d'un élevage piscicole", placeholder: "" },
];

const homeExpertiseCtas: Record<string, string> = {
  "Élevage et aviculture": "Voir les services d’élevage",
  "Aquaculture et pisciculture": "Découvrir l’aquaculture",
  "Nutrition animale": "Voir nos conseils nutritionnels",
};

export const homeExpertises = expertises.map((expertise) =>
  expertise.title === "Agriculture"
    ? {
        ...expertise,
        title: "Suivi technique et sanitaire",
        desc: "Suivez les résultats de votre élevage et bénéficiez de conseils pour ajuster vos pratiques au quotidien.",
        href: "/services/suivi-technique-sanitaire",
        img: p(5),
        alt: "Technicien réalisant un suivi sanitaire sur le terrain",
        cta: "Découvrir le suivi technique",
      }
    : { ...expertise, cta: homeExpertiseCtas[expertise.title] ?? "Découvrir cette expertise" },
);

export const systems = ["Cages flottantes", "Enclos", "Étangs", "Hors-sol"];

export const services = [
  { slug: "etude-accompagnement-projets", icon: "M5 4h14v16H5zM9 9h6M9 13h6M9 17h3", title: "Étude et accompagnement des projets", desc: "Analyse de vos besoins, choix de l'activité, plan technique et chiffrage." },
  { slug: "recherche-parcelles", icon: "M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z", title: "Recherche de parcelles adaptées", desc: "Identification et évaluation de terrains ou de plans d'eau adaptés à votre projet." },
  { slug: "conception-fermes", icon: "M3 21h18M5 21V9l7-5 7 5v12M10 21v-6h4v6", title: "Conception et mise en place de fermes", desc: "Plans, aménagements et installations, du démarrage à la mise en production." },
  { slug: "systemes-elevage-pisciculture", icon: "M3 12c3-5 8-6 12-3l4-3v12l-4-3c-4 3-9 2-12-3z", title: "Systèmes d'élevage et de pisciculture", desc: "Installation de cages, d'enclos, d'étangs, de bassins hors-sol et d'équipements d'élevage." },
  { slug: "formation-eleveurs", icon: "M4 5h16v11H9l-5 4z", title: "Formation des éleveurs", desc: "Formation et conseils sur le terrain pour maîtriser les bonnes pratiques." },
  { slug: "suivi-activites", icon: "M3 12h4l3-7 4 14 3-7h4", title: "Suivi et encadrement des activités", desc: "Visites techniques régulières, registres de production et ajustements." },
  { slug: "nutrition-animale", icon: "M12 21v-8M12 13c0-4-3-6-7-6 0 4 3 6 7 6zM12 15c0-3 2-5 6-5 0 3-2 5-6 5z", title: "Conseils en nutrition animale", desc: "Alimentation adaptée aux espèces et aux objectifs de production." },
];

export const methodSteps = [
  { n: "01", title: "Analyse des besoins", desc: "Nous écoutons votre projet, vos objectifs et vos contraintes." },
  { n: "02", title: "Étude et préparation", desc: "Étude du site, des ressources et des conditions de réussite." },
  { n: "03", title: "Conception et planification", desc: "Plan technique, budget prévisionnel et calendrier de réalisation." },
  { n: "04", title: "Mise en place", desc: "Aménagement, installation et démarrage de l'activité." },
  { n: "05", title: "Suivi et accompagnement", desc: "Suivi technique régulier et conseils dans la durée." },
];

export const categories = [
  { id: "aliments", label: "Aliments", image: p(7), alt: "Volailles autour des mangeoires dans un bâtiment d'élevage", href: "/produits?categorie=aliments" },
  { id: "alevins", label: "Alevins", image: "/photos/user-fingerlings.png", alt: "Jeunes poissons d'élevage tenus dans une main", href: "/produits?categorie=alevins" },
  { id: "equipements", label: "Équipements aquacoles", image: "/photos/user-pond-harvest.png", alt: "Pisciculteurs récoltant des poissons au filet dans un étang", href: "/produits?categorie=equipements" },
  { id: "materiel", label: "Matériel d'élevage", image: p(9), alt: "Installation de cages et d'équipements pour l'élevage", href: "/produits?categorie=materiel" },
  { id: "intrants", label: "Intrants agricoles", image: "/photos/pond-construction.webp", alt: "Aménagement d'un terrain pour un projet agricole", href: "/produits?categorie=intrants" },
];

export const projects = [
  { slug: "cages-flottantes", img: p(9), alt: "Plateforme d'élevage de poissons en cages flottantes", domain: "Aquaculture", title: "Ferme piscicole en cages flottantes", desc: "Installation et mise en route d'une unité d'élevage de poissons en cages sur plan d'eau." },
  { slug: "enclos-piscicoles", img: p(1), alt: "Enclos piscicole délimité par des piquets sur un plan d'eau", domain: "Pisciculture", title: "Enclos piscicoles sur plan d'eau", desc: "Enclos délimités en bordure de plan d'eau pour l'élevage de poissons." },
  { slug: "installation-en-plan-deau", img: p(2), alt: "Technicien dans l'eau près d'un enclos et d'un équipement", domain: "Aquaculture", title: "Installation en plan d'eau", desc: "Mise en place et entretien des équipements directement sur le site d'élevage." },
  { slug: "suivi-elevage-avicole", img: p(7), alt: "Poussins dans un bâtiment d'élevage avicole", domain: "Aviculture", title: "Suivi d'un élevage avicole", desc: "Conception du bâtiment, conseils d'alimentation et suivi technique." },
  { slug: "suivi-sanitaire-betail", img: p(5), alt: "Soins apportés à un bovin par un technicien", domain: "Élevage", title: "Soins et suivi sanitaire du bétail", desc: "Interventions techniques sur le terrain auprès des éleveurs." },
  { slug: "formation-producteurs", img: p(13), alt: "Producteurs au travail dans un bâtiment d'élevage avicole lors d'un accompagnement de terrain", domain: "Accompagnement", title: "Formation de producteurs", desc: "Sessions de formation et d'encadrement des équipes sur le terrain." },
];

export const partners = ["IRC", "GIZ", "PAPC", "SOCODEVI", "PNUD-CI", "PAPSE"];

export const values = [

  { title: "Expertise technique", desc: "des conseils fondés sur la zootechnie et la nutrition animale." },
  { title: "Connaissance du terrain", desc: "des solutions adaptées aux réalités locales." },
  { title: "Suivi dans la durée", desc: "un accompagnement qui ne s'arrête pas à l'installation." },
];

export const faq = [
  { q: "Comment se déroule un projet avec MOAYE SERVICES ?", a: "Chaque accompagnement commence par l’analyse de vos besoins, de vos objectifs et de vos contraintes. Nous étudions ensuite les conditions du projet, préparons une proposition technique et budgétaire, puis planifions sa mise en œuvre. Selon la mission retenue, notre équipe peut assurer l’installation, le démarrage et le suivi technique." },
  { q: "Comment préparer une demande de devis ?", a: "Remplissez le formulaire de demande en précisant votre activité, la localisation du projet, son niveau d’avancement, votre budget indicatif et vos besoins. La demande est gratuite et sans engagement. Notre équipe l’étudie et vous recontacte si des précisions sont nécessaires." },
  { q: "Puis-je commander des produits en ligne ?", a: "Vous pouvez parcourir le catalogue, ajouter des produits à votre panier et transmettre une commande depuis le site. Notre équipe vous contacte ensuite pour confirmer la disponibilité, la livraison et les modalités de règlement avant la finalisation." },
  { q: "L’assistant de projet est-il disponible ?", a: "Oui. L’assistant peut vous aider à préciser votre idée, à organiser vos besoins et à découvrir les services adaptés. Ses réponses sont indicatives : les choix techniques définitifs doivent être confirmés avec un conseiller MOAYE SERVICES." },
];

export const socials = ["Facebook", "LinkedIn", "WhatsApp"];




