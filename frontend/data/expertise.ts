export const systems = [
  { id: "cages", label: "Cages flottantes", photo: "cages flottantes", image: "/photos/cage-farm-installation.webp", title: "Pisciculture en cages flottantes",
    desc: "Les poissons sont élevés dans des cages ancrées sur un lac, une lagune ou une retenue d'eau. Aucun terrassement n'est nécessaire : on valorise un plan d'eau existant.",
    suits: ["Vous disposez d'un plan d'eau suffisamment profond", "Vous souhaitez démarrer sans creuser", "Vous visez une production structurée"],
    keys: ["Choix du site : profondeur, courant, accès", "Ancrage et entretien des filets", "Suivi de la qualité de l'eau"] },
  { id: "enclos", label: "Enclos", photo: "enclos", image: "/photos/cage-installation.webp", title: "Pisciculture en enclos",
    desc: "Une zone de plan d'eau est délimitée par des filets fixés sur des piquets. Solution adaptée aux sites peu profonds, en bordure de plan d'eau.",
    suits: ["Le site est peu profond", "Vous cherchez un investissement progressif", "Le plan d'eau est accessible à pied"],
    keys: ["Solidité des piquets et des filets", "Surveillance et protection contre les prédateurs", "Densité adaptée à la zone"] },
  { id: "etangs", label: "Étangs", photo: "étangs", image: "/photos/pond-construction.webp", title: "Pisciculture en étangs",
    desc: "Des étangs creusés ou aménagés, alimentés en eau et vidangeables, permettent de maîtriser l'élevage et la récolte sur un terrain adapté.",
    suits: ["Vous avez un terrain avec accès à l'eau", "Le sol retient correctement l'eau", "Vous voulez pouvoir vidanger pour récolter"],
    keys: ["Étude du sol et de la pente", "Arrivée et évacuation d'eau", "Gestion de l'alimentation et de la fertilisation"] },
  { id: "horssol", label: "Hors-sol", photo: "bassins hors-sol", image: undefined, title: "Pisciculture hors-sol",
    desc: "Les poissons sont élevés dans des bassins ou des cuves installés hors du sol, avec une maîtrise accrue de l'eau, y compris en circuit recirculé.",
    suits: ["Vous disposez de peu d'espace", "Vous n'avez pas de plan d'eau à proximité", "Vous souhaitez contrôler l'eau de près"],
    keys: ["Dimensionnement des bassins", "Oxygénation et renouvellement de l'eau", "Alimentation et suivi rigoureux"] },
];

export const care = [
  { icon: "M5 4h14v16H5zM9 9h6M9 13h6M9 17h3", title: "Gestion", desc: "Planning d'alimentation, registres de production et indicateurs pour piloter votre élevage." },
  { icon: "M3 12h4l3-7 4 14 3-7h4", title: "Suivi", desc: "Visites techniques régulières : croissance, santé des animaux, qualité de l'eau, ajustements." },
  { icon: "M4 5h16v11H9l-5 4z", title: "Accompagnement", desc: "Formation de vos équipes et conseils pratiques, du démarrage jusqu'à la récolte." },
];

export const method = [
  { n: "01", title: "Recherche de parcelle", points: ["Visite et évaluation du site", "Eau, sol, accès et environnement", "Recommandation du meilleur emplacement"] },
  { n: "02", title: "Conception", points: ["Choix du système d'élevage", "Plan technique et dimensionnement", "Budget prévisionnel"] },
  { n: "03", title: "Mise en place de la ferme", points: ["Aménagement et installation", "Approvisionnement en matériel", "Démarrage de l'élevage"] },
  { n: "04", title: "Suivi et encadrement", points: ["Visites techniques régulières", "Formation du personnel", "Bilan de production"] },
];