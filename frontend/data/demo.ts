import { products, catLabels } from "@/data/products";

export type OrderStatus = "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled";
export type QuoteStatus = "new" | "progress" | "sent" | "accepted" | "rejected" | "expired";
export type Tone = "in" | "pr" | "out" | "n";
export type DemoItem = { name: string; cat: string; price: number; qty: number };
export type DemoOrder = { id: string; client: string; iso: string; date: string; status: OrderStatus; items: DemoItem[]; total: number; hist: [string, string][]; city?: string; clientKey?: string };
export type DemoQuote = { id: string; client: string; iso: string; date: string; subject: string; st: QuoteStatus };
export type Msg = { from: "client" | "staff"; text: string; time: string };
export type Thread = { id: string; client: string; subject: string; iso: string; time: string; msgs: Msg[]; seen: { client: boolean; staff: boolean } };

export const CLIENT = "Client Exemple"; // client connecté dans la démo

export const fr = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

function history(status: OrderStatus, iso: string): [string, string][] {
  const h: [string, string][] = [["Commande reçue", addDays(iso, 0)]];
  if (status === "cancelled") return [...h, ["Commande annulée", addDays(iso, 1)]];
  if (status === "pending") return h;
  h.push(["Commande confirmée", addDays(iso, 0)]);
  if (status === "confirmed") return h;
  h.push(["En préparation", addDays(iso, 2)]);
  if (status === "preparing") return h;
  if (status === "shipped") return [...h, ["Expédiée", addDays(iso, 4)]];
  return [...h, ["Livrée", addDays(iso, 7)]];
}

const line = (id: string, qty: number): DemoItem => {
  const p = products.find((x) => x.id === id)!;
  return { name: p.name, cat: catLabels[p.cat], price: p.price, qty };
};
const order = (id: string, client: string, iso: string, status: OrderStatus, items: [string, number][]): DemoOrder => {
  const its = items.map(([pid, q]) => line(pid, q));
  return { id, client, iso, date: fr(iso), status, items: its, total: its.reduce((a, i) => a + i.price * i.qty, 0), hist: history(status, iso) };
};
const quote = (id: string, client: string, iso: string, subject: string, st: QuoteStatus): DemoQuote => ({ id, client, iso, date: fr(iso), subject, st });

export const demoOrders: DemoOrder[] = [
  order("CMD-0014", "Société Agro Plus", "2026-11-02", "pending", [["p3", 1]]),
  order("CMD-0013", "Marie T.", "2026-10-30", "confirmed", [["p1", 6], ["p9", 2]]),
  order("CMD-0012", CLIENT, "2026-10-10", "preparing", [["p1", 4], ["p6", 1]]),
  order("CMD-0011", "Coopérative Lagune", "2026-10-04", "delivered", [["p4", 1], ["p2", 3]]),
  order("CMD-0010", CLIENT, "2026-09-28", "delivered", [["p2", 2]]),
  order("CMD-0009", "Awa K.", "2026-09-12", "delivered", [["p1", 10]]),
  order("CMD-0008", "Kouadio B.", "2026-09-05", "cancelled", [["p5", 1]]),
  order("CMD-0007", "Société Agro Plus", "2026-08-19", "delivered", [["p4", 1]]),
  order("CMD-0006", CLIENT, "2026-07-17", "delivered", [["p3", 1]]),
  order("CMD-0005", "Coopérative Lagune", "2026-07-02", "delivered", [["p2", 4], ["p1", 5]]),
  order("CMD-0004", "Awa K.", "2026-06-14", "delivered", [["p6", 2]]),
  order("CMD-0003", CLIENT, "2026-05-12", "delivered", [["p1", 2], ["p9", 1]]),
  order("CMD-0002", "Marie T.", "2026-03-20", "delivered", [["p1", 3]]),
  order("CMD-0001", "Société Agro Plus", "2026-01-15", "delivered", [["p3", 2]]),
];

export const demoQuotes: DemoQuote[] = [
  quote("DEV-0010", "Marie T.", "2026-11-02", "Poulailler de 500 sujets", "new"),
  quote("DEV-0009", "Société Agro Plus", "2026-10-30", "Ferme piscicole en cages flottantes", "new"),
  quote("DEV-0008", CLIENT, "2026-10-11", "Ferme piscicole en cages flottantes", "progress"),
  quote("DEV-0007", "Coopérative Lagune", "2026-10-21", "Aménagement de trois étangs", "progress"),
  quote("DEV-0006", "Awa K.", "2026-10-12", "Bassins hors-sol", "sent"),
  quote("DEV-0005", CLIENT, "2026-09-20", "Enclos piscicoles", "sent"),
  quote("DEV-0004", "Kouadio B.", "2026-08-14", "Étude de parcelle", "accepted"),
  quote("DEV-0003", CLIENT, "2026-08-05", "Bassins hors-sol", "accepted"),
  quote("DEV-0002", "Coopérative Lagune", "2026-07-03", "Cages flottantes", "accepted"),
  quote("DEV-0001", "Marie T.", "2026-03-10", "Formation en pisciculture", "accepted"),
];

export const demoThreads: Thread[] = [
  { id: "t1", client: "Marie T.", subject: "Délai de livraison CMD-0013", iso: "2026-11-02", time: "02/11", seen: { client: true, staff: false }, msgs: [{ from: "client", text: "Bonjour, pouvez-vous me confirmer le délai de livraison de ma commande ?", time: "02/11/2026 · 08:41" }] },
  { id: "t2", client: "Société Agro Plus", subject: "Question sur le filet de cage", iso: "2026-11-02", time: "02/11", seen: { client: true, staff: false }, msgs: [{ from: "client", text: "Bonjour, le filet de cage existe-t-il en dimensions sur mesure ?", time: "02/11/2026 · 10:05" }] },
  { id: "t3", client: "Coopérative Lagune", subject: "Merci pour la livraison", iso: "2026-10-06", time: "06/10", seen: { client: true, staff: true }, msgs: [{ from: "client", text: "La livraison s'est bien passée, merci à l'équipe.", time: "06/10/2026 · 14:20" }, { from: "staff", text: "Merci à vous. N'hésitez pas à nous contacter pour le suivi.", time: "06/10/2026 · 15:02" }] },
  { id: "t4", client: CLIENT, subject: "Votre commande CMD-0012", iso: "2026-10-12", time: "12/10", seen: { client: false, staff: true }, msgs: [{ from: "staff", text: "Bonjour, votre commande CMD-0012 est en cours de préparation. Nous vous confirmons la date de livraison dès que possible.", time: "12/10/2026 · 09:14" }] },
  { id: "t5", client: CLIENT, subject: "Réponse à votre devis DEV-0005", iso: "2026-09-24", time: "24/09", seen: { client: true, staff: true }, msgs: [{ from: "client", text: "Bonjour, pouvez-vous m'envoyer une proposition pour des enclos piscicoles ?", time: "20/09/2026 · 16:02" }, { from: "staff", text: "Bonjour, veuillez trouver notre proposition. Nous restons disponibles pour en discuter.", time: "24/09/2026 · 10:30" }] },
];

export const cityOf: Record<string, string> = {
  "Société Agro Plus": "Abidjan", "Marie T.": "San-Pédro", [CLIENT]: "Abidjan",
  "Coopérative Lagune": "Grand-Lahou", "Awa K.": "Bouaké", "Kouadio B.": "Yamoussoukro",
};

// Statuts : libellés et couleurs
export const orderLabel: Record<OrderStatus, string> = { pending: "En attente", confirmed: "Confirmée", preparing: "En préparation", shipped: "Expédiée", delivered: "Livrée", cancelled: "Annulée" };
export const orderTone: Record<OrderStatus, Tone> = { pending: "n", confirmed: "pr", preparing: "pr", shipped: "pr", delivered: "in", cancelled: "out" };
export const quoteLabelStaff: Record<QuoteStatus, string> = { new: "Nouveau", progress: "En cours", sent: "Envoyé", accepted: "Accepté", rejected: "Refusé", expired: "Expiré" };
export const quoteToneStaff: Record<QuoteStatus, Tone> = { new: "out", progress: "pr", sent: "n", accepted: "in", rejected: "out", expired: "n" };
export const quoteLabelClient: Record<QuoteStatus, string> = { new: "Reçue", progress: "En étude", sent: "Devis reçu", accepted: "Accepté", rejected: "Refusé", expired: "Expiré" };
export const quoteToneClient: Record<QuoteStatus, Tone> = { new: "n", progress: "pr", sent: "pr", accepted: "in", rejected: "out", expired: "n" };

export const isUnread = (t: Thread, viewer: "client" | "staff", read: Record<string, boolean>) => {
  const last = t.msgs[t.msgs.length - 1];
  const other = viewer === "client" ? "staff" : "client";
  return last.from === other && !t.seen[viewer] && !read[t.id];
};
