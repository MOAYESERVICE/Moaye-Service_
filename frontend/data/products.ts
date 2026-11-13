import type { Product, Stock } from "@/types/product";

export const catLabels: Record<string, string> = {
  aliments: "Aliments",
  alevins: "Alevins",
  animaux: "Poissons et volailles",
  equipements: "Équipements aquacoles",
  materiel: "Matériel d'élevage",
  intrants: "Intrants agricoles",
};

export const stockInfo: Record<Stock, { cls: string; label: string }> = {
  in: { cls: "av-in", label: "En stock" },
  order: { cls: "av-order", label: "Sur commande" },
  out: { cls: "av-out", label: "Rupture de stock" },
};

export const products: Product[] = [
  { id: "p1", cat: "animaux", name: "Poissons frais", price: 10000, stock: "in", photo: "poissons frais", image: "/poison.jpg", desc: "Poissons frais présentés comme sur la photo. Disponibilité à confirmer.", specs: [] },
  { id: "p2", cat: "animaux", name: "Poulet entier pesé", price: 10000, stock: "in", photo: "poulet entier pesé", image: "/poulet.jpg", imageFit: "contain", desc: "Poulet entier présenté sur une balance, comme sur la photo.", specs: [] },
  { id: "p3", cat: "animaux", name: "Oie vivante", price: 10000, stock: "order", photo: "oie vivante", image: "/oies.jpg", imageFit: "contain", desc: "Oie d'élevage vivante, proposée sur commande.", specs: [] },
  { id: "p4", cat: "equipements", name: "Filet de cage 3 × 3 × 2 m", price: 185000, stock: "order", photo: "filet de cage", image: "/photos/floating-cages.webp", desc: "Filet pour cage flottante, maille adaptée au calibre des poissons.", specs: ["Dimensions : 3 × 3 × 2 m", "Fabrication sur mesure possible"] },
  { id: "p5", cat: "equipements", name: "Bassin hors-sol 5 000 L", price: 240000, stock: "in", photo: "bassin hors-sol", image: "/photos/aquaculture-fieldwork.webp", desc: "Bassin hors-sol pour élevage de poissons sur petite surface.", specs: ["Volume : 5 000 litres", "Accessoires de vidange inclus"] },
  { id: "p6", cat: "equipements", name: "Kit de test qualité de l'eau", price: 28000, stock: "in", photo: "kit de test", desc: "Kit pour contrôler les paramètres de l'eau de votre élevage.", specs: ["Notice en français"] },
  { id: "p7", cat: "materiel", name: "Fond perforé pour cage à lapin", price: 6500, stock: "in", photo: "fond de cage perforé pour lapin", image: "/fond cage pour lapin.jpg", desc: "Fond perforé pour cage à lapin. Le modèle présenté sur la photo est affiché à 6 500 FCFA.", specs: [] },
  { id: "p8", cat: "materiel", name: "Balance de pesée 50 kg", price: 32000, stock: "out", photo: "balance", desc: "Balance pour la pesée des animaux ou des sacs.", specs: ["Portée : 50 kg"] },
  { id: "p9", cat: "intrants", name: "Engrais organique 25 kg", price: 9500, stock: "in", photo: "engrais", image: "/photos/pond-construction.webp", desc: "Engrais organique pour cultures et fertilisation d'étangs.", specs: ["Conditionnement : sac de 25 kg"] },
  { id: "p10", cat: "intrants", name: "Chaux agricole 25 kg", price: 5000, stock: "order", photo: "chaux", image: "/photos/pond-construction.webp", desc: "Chaux pour le traitement des fonds d'étangs et des sols.", specs: ["Conditionnement : sac de 25 kg"] },
];