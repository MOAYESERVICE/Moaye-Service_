export type Role = "admin" | "editor" | "support";
export const roleLabels: Record<Role, string> = { admin: "Administrateur", editor: "Éditeur", support: "Support" };

type MenuItem = { id: string; label: string; href: string; roles: Role[] };
type MenuGroup = { title: string; items: MenuItem[] };
const all: Role[] = ["admin", "editor", "support"];
const content: Role[] = ["admin", "editor"];
const sales: Role[] = ["admin", "support"];

export const menu: MenuGroup[] = [
  { title: "Pilotage", items: [{ id: "dash", label: "Tableau de bord", href: "/admin", roles: all }] },
  { title: "Catalogue", items: [
    { id: "products", label: "Produits", href: "/admin/produits", roles: content },
    { id: "categories", label: "Catégories", href: "/admin/categories", roles: content },
  ] },
  { title: "Contenu du site", items: [
    { id: "services", label: "Services", href: "/admin/services", roles: content },
    { id: "expertises", label: "Expertises", href: "/admin/expertises", roles: content },
    { id: "realisations", label: "Réalisations", href: "/admin/realisations", roles: content },
    { id: "photos", label: "Photos", href: "/admin/photos", roles: content },
    { id: "partenaires", label: "Partenaires", href: "/admin/partenaires", roles: content },
  ] },
  { title: "Ventes", items: [
    { id: "orders", label: "Commandes", href: "/admin/commandes", roles: sales },
    { id: "clients", label: "Clients", href: "/admin/clients", roles: sales },
    { id: "quotes", label: "Devis", href: "/admin/devis", roles: sales },
    { id: "messages", label: "Messages", href: "/admin/messages", roles: sales },
  ] },
  { title: "Système", items: [{ id: "users", label: "Utilisateurs et rôles", href: "/admin/utilisateurs", roles: ["admin"] }] },
];

export const canAccess = (role: Role, moduleId: string) =>
  menu.some((g) => g.items.some((i) => i.id === moduleId && i.roles.includes(role)));

export const pageTitles: [string, string, string][] = [
  ["/admin/produits", "Produits", "Catalogue, prix et disponibilité"],
  ["/admin/categories", "Catégories", "Gestion du contenu du site"],
  ["/admin/services", "Services", "Gestion du contenu du site"],
  ["/admin/expertises", "Expertises", "Gestion du contenu du site"],
  ["/admin/realisations", "Réalisations", "Gestion du contenu du site"],
  ["/admin/partenaires", "Partenaires", "Gestion du contenu du site"],
  ["/admin/photos", "Photos", "Photothèque du site"],
  ["/admin/commandes", "Commandes", "Suivi et traitement des commandes"],
  ["/admin/clients", "Clients", "Historique et valeur par client"],
  ["/admin/devis", "Devis", "Demandes de devis par étape"],
  ["/admin/messages", "Messages", "Échanges avec les clients"],
  ["/admin/utilisateurs", "Utilisateurs et rôles", "Accès et droits de l'équipe"],
  ["/admin", "Tableau de bord", "Pilotage de la boutique et des demandes"],
];

// --- Contenu du site ---
export type ContentId = "categories" | "services" | "expertises" | "realisations" | "partenaires";
export type ContentItem = { id: string; title: string; meta: string; status: "pub" | "draft" };

export const contentConfig: Record<ContentId, { titleLabel: string; metaLabel: string; add: string; help: string }> = {
  categories: { titleLabel: "Catégorie", metaLabel: "Description", add: "Ajouter une catégorie", help: "Les catégories organisent le catalogue produits." },
  services: { titleLabel: "Service", metaLabel: "Description", add: "Ajouter un service", help: "Services affichés sur le site public." },
  expertises: { titleLabel: "Expertise", metaLabel: "Description", add: "Ajouter une expertise", help: "Domaines d'expertise présentés sur le site." },
  realisations: { titleLabel: "Projet", metaLabel: "Domaine et localisation", add: "Ajouter une réalisation", help: "Projets de la galerie. Un brouillon n'est pas visible sur le site." },
  partenaires: { titleLabel: "Organisation", metaLabel: "Type d'organisation", add: "Ajouter un partenaire", help: "Un partenaire reste en brouillon tant que l'autorisation d'utilisation n'est pas confirmée." },
};

const mk = (rows: [string, string][], status: "pub" | "draft" = "pub", prefix = "c"): ContentItem[] =>
  rows.map(([title, meta], i) => ({ id: `${prefix}${i}`, title, meta, status }));

export const seedContent: Record<ContentId, ContentItem[]> = {
  categories: mk([["Aliments", "Aliments pour poissons, volailles et autres élevages."], ["Alevins", "Alevins pour cages, enclos et étangs."], ["Équipements aquacoles", "Filets, bassins, kits de contrôle de l'eau."], ["Matériel d'élevage", "Abreuvoirs, balances et petit matériel."], ["Intrants agricoles", "Engrais et amendements."]], "pub", "cat"),
  services: mk([["Étude et accompagnement des projets", "Analyse des besoins, choix de l'activité, plan technique et chiffrage."], ["Recherche de parcelles adaptées", "Évaluation de terrains et de plans d'eau."], ["Conception et mise en place de fermes", "Plans, aménagements et démarrage."], ["Systèmes d'élevage et de pisciculture", "Cages, enclos, étangs et bassins hors-sol."], ["Accompagnement technique des producteurs", "Formation et conseils sur le terrain."], ["Suivi et encadrement des activités", "Visites techniques et registres de production."], ["Conseils en nutrition animale", "Plans d'alimentation adaptés."]], "pub", "svc"),
  expertises: mk([["Agriculture", "Projets agricoles et suivi des cultures."], ["Élevage et aviculture", "Conception et suivi technique des élevages."], ["Aquaculture et pisciculture", "Cages flottantes, enclos, étangs, hors-sol."], ["Nutrition animale", "Alimentation et suivi des animaux."]], "pub", "exp"),
  realisations: [
    ...mk([["Ferme piscicole en cages flottantes", "Aquaculture · [Localité]"], ["Enclos piscicoles sur plan d'eau", "Pisciculture · [Localité]"], ["Suivi d'un élevage avicole", "Aviculture · [Localité]"], ["Soins et suivi sanitaire du bétail", "Élevage · [Localité]"]], "pub", "rea"),
    ...mk([["Formation de producteurs", "Accompagnement · [Localité]"], ["Élevage d'autruches", "Élevage · [Localité]"]], "draft", "reb"),
  ],
  partenaires: mk([["IRC", "[Type d'organisation]"], ["GIZ", "[Type d'organisation]"], ["PAPC", "[Type d'organisation]"], ["SOCODEVI", "[Type d'organisation]"], ["PNUD-CI", "[Type d'organisation]"], ["PAPSE", "[Type d'organisation]"]], "draft", "par"),
};

// --- Photothèque ---
export type Photo = { id: string; src: string; title: string; usage: string };
export const seedPhotos: Photo[] = [
  { id: "ph1", src: "/photos/pond-construction.webp", title: "Construction d'étang", usage: "Réalisations · Accueil" },
  { id: "ph2", src: "/photos/floating-cages.webp", title: "Plateforme de cages flottantes", usage: "Accueil · Expertises" },
  { id: "ph3", src: "/photos/cage-installation.webp", title: "Installation de cage", usage: "Réalisations" },
  { id: "ph4", src: "/photos/aquaculture-fieldwork.webp", title: "Travaux d'aquaculture", usage: "Accueil · À propos" },
  { id: "ph5", src: "/photos/user-fingerlings.png", title: "Alevins dans le bassin", usage: "Produits" },
  { id: "ph6", src: "/photos/fish-harvest.webp", title: "Récolte de poissons", usage: "Expertises" },
  { id: "ph7", src: "/photos/poultry-farming.webp", title: "Poussins en bâtiment", usage: "Accueil · Expertises" },
  { id: "ph8", src: "/photos/cattle-veterinary-care.webp", title: "Soins au bovin", usage: "Accueil · Réalisations" },
  { id: "ph9", src: "/photos/moaye-team-field.png", title: "Équipe en intervention", usage: "À propos · Services" },
  { id: "ph10", src: "/photos/moaye-fish-production.png", title: "Production piscicole", usage: "À propos" },
  { id: "ph11", src: "/photos/moaye-cage-installation.png", title: "Installation de cage aquacole", usage: "Réalisations" },
];

// --- Utilisateurs ---
export type AdminUserRole = "ADMIN" | "CUSTOMER";
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  active: boolean;
  isSelf: boolean;
  createdAt: string;
};
