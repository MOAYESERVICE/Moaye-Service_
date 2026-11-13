import type { ContactData, ProfileData, CheckoutData, QuoteData } from "./validators";
import type { ChatMessage } from "@/types/chat";
import type { Product } from "@/types/product";
import { z } from "zod";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

let refreshRequest: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = fetch("/api/auth/refresh", {
      method: "POST",
      cache: "no-store",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

async function fetchWithSession(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(url, init);
  if (response.status !== 401 || !(await refreshSession())) return response;
  return fetch(url, init);
}

const productResponseSchema = z.object({
  id: z.string(),
  cat: z.string(),
  name: z.string(),
  price: z.number(),
  stock: z.enum(["in", "order", "out"]),
  photo: z.string(),
  image: z.string().optional(),
  imageFit: z.enum(["cover", "contain"]).optional(),
  desc: z.string(),
  specs: z.array(z.string()),
});

const productsResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(productResponseSchema),
});

export async function getProducts(signal?: AbortSignal): Promise<Product[]> {
  let response: Response;
  try {
    response = await fetch(`${API}/api/products`, { cache: "no-store", signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error("Impossible de joindre le catalogue. Vérifiez que le backend est démarré.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Le backend a renvoyé une réponse invalide pour le catalogue.");
  }

  if (!response.ok) {
    const errorResponse = z.object({ message: z.string().optional() }).safeParse(payload);
    throw new Error(errorResponse.success ? errorResponse.data.message ?? "Le catalogue est indisponible." : "Le catalogue est indisponible.");
  }

  const result = productsResponseSchema.safeParse(payload);
  if (!result.success) {
    throw new Error("Le format des produits renvoyé par le backend est invalide.");
  }

  return result.data.data;
}

export type AdminProductInput = Omit<Product, "id"> & { id?: string };

async function readAdminProductResponse(response: Response): Promise<Product> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Le backend a renvoyé une réponse invalide pour le produit.");
  }

  if (!response.ok) {
    const errorResponse = z.object({ message: z.string().optional() }).safeParse(payload);
    throw new Error(
      errorResponse.success
        ? errorResponse.data.message ?? "L’opération sur le produit a échoué."
        : "L’opération sur le produit a échoué.",
    );
  }

  const result = z.object({
    success: z.literal(true),
    data: productResponseSchema,
  }).safeParse(payload);
  if (!result.success) {
    throw new Error("Le format du produit renvoyé par le backend est invalide.");
  }
  return result.data.data;
}

export async function saveAdminProduct(product: AdminProductInput): Promise<Product> {
  const isUpdate = Boolean(product.id);
  const url = isUpdate
    ? `/api/admin/products/${encodeURIComponent(product.id!)}`
    : "/api/admin/products";
  let response: Response;
  try {
    response = await fetchWithSession(url, {
      method: isUpdate ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible de joindre le service produit. Vérifiez que le frontend et le backend sont démarrés.");
  }
  return readAdminProductResponse(response);
}

// Envoie une image à l'API et récupère son chemin permanent.
export async function uploadAdminProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.set("image", file);

  let response: Response;
  try {
    response = await fetchWithSession("/api/admin/products/upload-image", {
      method: "POST",
      body: formData,
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible de joindre le service d’envoi des images.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Le backend a renvoyé une réponse invalide pour l’image.");
  }

  if (!response.ok) {
    const errorResponse = z.object({ message: z.string().optional() }).safeParse(payload);
    throw new Error(errorResponse.success
      ? errorResponse.data.message ?? "L’image n’a pas pu être envoyée."
      : "L’image n’a pas pu être envoyée.");
  }

  const result = z.object({
    success: z.literal(true),
    data: z.object({ url: z.string().startsWith("/api/uploads/products/") }),
  }).safeParse(payload);
  if (!result.success) {
    throw new Error("Le backend n’a pas renvoyé un chemin d’image valide.");
  }

  return result.data.data.url;
}

// Ajoute un article au panier persistant; les invités gardent le panier local.
export async function addCartItem(productId: string, quantity = 1): Promise<boolean> {
  const numericProductId = Number(productId);
  if (!Number.isSafeInteger(numericProductId) || numericProductId < 1) {
    throw new Error("Identifiant de produit invalide.");
  }

  let response: Response;
  try {
    response = await fetchWithSession("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: numericProductId, quantity }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Le panier local est conservé, mais le serveur est injoignable.");
  }

  if (response.status === 401) return false;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Le serveur a renvoyé une réponse invalide pour le panier.");
  }

  if (!response.ok) {
    const errorResponse = z.object({ message: z.string().optional() }).safeParse(payload);
    throw new Error(errorResponse.success
      ? errorResponse.data.message ?? "L’article n’a pas pu être enregistré dans le panier serveur."
      : "L’article n’a pas pu être enregistré dans le panier serveur.");
  }

  return true;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  let response: Response;
  try {
    response = await fetchWithSession(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible de joindre le service produit. Vérifiez que le frontend et le backend sont démarrés.");
  }
  await readAdminProductResponse(response);
}

export async function sendContact(_data: ContactData): Promise<void> {
  let response: Response;
  try {
    response = await fetchWithSession("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(_data),
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible de joindre le service des messages.");
  }

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.message || "Erreur lors de l'envoi du message.");
  }
}

export async function sendAccountContact(data: ContactData): Promise<void> {
  let response: Response;
  try {
    response = await fetchWithSession("/api/contact/mine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible de joindre le service des messages.");
  }

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.message || "Erreur lors de l'envoi du message.");
  }
}

export async function saveProfile(_data: ProfileData): Promise<void> {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Authentification requise");
  const response = await fetch(`${API}/api/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(_data),
  });
  if (!response.ok) throw new Error("Erreur lors de la modification du profil");
}

export async function sendOrder(
  _data: CheckoutData,
  cart: Record<string, number>,
): Promise<string> {
  const items = Object.entries(cart).map(([id, quantity]) => ({
    productId: Number(id),
    quantity,
  }));

  if (items.length === 0 || items.some(({ productId, quantity }) =>
    !Number.isSafeInteger(productId) || productId < 1 ||
    !Number.isSafeInteger(quantity) || quantity < 1
  )) {
    throw new Error("Le panier contient des articles invalides.");
  }

  let cartResponse: Response;
  try {
    cartResponse = await fetchWithSession("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible de synchroniser le panier avec le serveur.");
  }

  const cartResult = await cartResponse.json().catch(() => null) as { message?: string } | null;
  if (!cartResponse.ok) {
    throw new Error(cartResult?.message ?? "Le panier n’a pas pu être enregistré.");
  }

  let response: Response;
  try {
    response = await fetchWithSession("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shippingAddress:
        _data.delivery === "delivery"
          ? _data.address ?? ""
          : "Retrait sur place",
      shippingCity: _data.city ?? "À convenir",
      shippingZip: _data.zip ?? "",
      shippingPhone: _data.phone ?? "",
      paymentMethod: (_data.paymentMethod ?? "CARD").toUpperCase(),
    }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible de joindre le service de commande.");
  }

  const data = await response.json().catch(() => null) as { data?: { id?: string | number }; message?: string } | null;
  if (!response.ok) throw new Error(data?.message || "Erreur création commande");
  if (data?.data?.id === undefined) throw new Error("Le backend n’a pas renvoyé la référence de commande.");
  return String(data.data.id);
}

export async function sendQuote(_data: QuoteData & { summary?: string }): Promise<string> {
  const details = [
    `Avancement : ${_data.stage}`,
    `Localisation : ${_data.location}`,
    `Budget : ${_data.budget}`,
    _data.message?.trim() ? `Précisions : ${_data.message.trim()}` : "",
    _data.summary?.trim() ? `Résumé de l’assistant : ${_data.summary.trim()}` : "",
  ].filter(Boolean).join("\n\n");

  let response: Response;
  try {
    response = await fetchWithSession("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: _data.type,
        description: details,
        contactName: _data.name,
        contactEmail: _data.email,
        contactPhone: _data.phone,
        location: _data.location,
        budgetRange: _data.budget,
      }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible de joindre le service des devis.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Erreur création devis");
  return data.data.id;
}

// Réduit l'historique pour rester sous la limite de taille de l'API.
const toApi = (history: ChatMessage[]) =>
  history.slice(-10).map((m) => ({ role: m.role, content: m.text.slice(-1200) }));

// Assistant IA : réponse en continu, chaque morceau de texte arrive dans onToken
export async function askAssistant(
  history: ChatMessage[],
  onToken: (chunk: string) => void,
  signal?: AbortSignal
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${API}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: toApi(history) }),
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error(`Connexion au backend impossible (${API}). Vérifiez son démarrage et l’autorisation CORS du frontend.`);
  }
  if (!res.ok || !res.body) {
    const data = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
    throw new Error(data?.error ?? data?.message ?? `Le service IA a répondu avec le code ${res.status}.`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onToken(chunk);
  }
  if (!full.trim()) throw new Error("empty");
  return full;
}

// Résumé de la conversation pour pré-remplir la demande de devis
export async function summarizeForQuote(history: ChatMessage[]): Promise<string> {
  const res = await fetch(`${API}/api/ai/quote-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: toApi(history) }),
  });
  if (!res.ok) throw new Error("summary");
  const data = (await res.json()) as { summary: string };
  return data.summary;
}

// Client: Récupérer les commandes du compte connecté
export async function getOrders(signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetchWithSession("/api/orders", {
      method: "GET",
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error("Impossible de charger les commandes.");
  }

  if (!response.ok) {
    throw new Error("Les commandes ne sont pas disponibles.");
  }

  const data = await response.json().catch(() => null);
  if (!data?.data || !Array.isArray(data.data)) {
    throw new Error("Format invalide pour les commandes.");
  }

  return data.data;
}

// Admin: Récupérer TOUTES les commandes (admin uniquement)
export async function getAllOrders(signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetchWithSession("/api/orders/admin/all", {
      method: "GET",
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error("Impossible de charger les commandes.");
  }

  if (!response.ok) {
    throw new Error("Les commandes ne sont pas disponibles.");
  }

  const data = await response.json().catch(() => null);
  if (!data?.data || !Array.isArray(data.data)) {
    throw new Error("Format invalide pour les commandes.");
  }

  return data.data;
}

// Admin: Mettre à jour le statut d'une commande
export async function updateOrderStatus(id: string | number, status: string): Promise<void> {
  let response: Response;
  try {
    response = await fetchWithSession(`${API}/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible de mettre à jour le statut de la commande.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Erreur lors de la mise à jour du statut.");
  }
}

// Admin: Récupérer les messages de contact
export async function getContactMessages(signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetchWithSession("/api/contact", {
      method: "GET",
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error("Impossible de charger les messages de contact.");
  }

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.message || `Les messages ne sont pas disponibles (HTTP ${response.status}).`);
  }

  const data = await response.json().catch(() => null);
  if (!data?.data || !Array.isArray(data.data)) {
    throw new Error("Format invalide pour les messages de contact.");
  }

  return data.data;
}

export type AdminAccountUser = {
  id: string | number;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  isActive: boolean;
  isSelf: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getAdminUsers(signal?: AbortSignal): Promise<AdminAccountUser[]> {
  let response: Response;
  try {
    response = await fetchWithSession("/api/admin/users", { method: "GET", cache: "no-store", signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error("Impossible de charger les comptes utilisateurs.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || "Les comptes utilisateurs ne sont pas disponibles.");
  if (!Array.isArray(payload?.data)) throw new Error("Format invalide pour la liste des utilisateurs.");
  return payload.data;
}

export async function updateAdminUser(
  id: string | number,
  changes: { role?: AdminAccountUser["role"]; isActive?: boolean },
): Promise<AdminAccountUser> {
  let response: Response;
  try {
    response = await fetchWithSession(`/api/admin/users/${encodeURIComponent(String(id))}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible de modifier les accès de cet utilisateur.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.data) throw new Error(payload?.message || "La modification des accès a échoué.");
  return payload.data;
}

export type ContactReply = { id: string; sender: "ADMIN" | "CUSTOMER"; name: string; message: string; createdAt: string };
export type ContactThread = {
  id: string | number; name: string; email: string; phone?: string | null; subject: string; message: string;
  status: "NEW" | "VIEWED" | "RESOLVED"; createdAt: string; replies: ContactReply[];
};

export async function getMyContactMessages(signal?: AbortSignal): Promise<ContactThread[]> {
  let response: Response;
  try {
    response = await fetchWithSession("/api/contact/mine", { method: "GET", cache: "no-store", signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error("Impossible de charger vos messages.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || "Vos messages ne sont pas disponibles.");
  if (!Array.isArray(payload?.data)) throw new Error("Format invalide pour vos messages.");
  return payload.data;
}

export async function sendContactReply(id: string | number, message: string): Promise<ContactThread> {
  let response: Response;
  try {
    response = await fetchWithSession(`/api/contact/${encodeURIComponent(String(id))}/replies`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }), cache: "no-store",
    });
  } catch {
    throw new Error("Impossible d’envoyer votre réponse.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.data) throw new Error(payload?.message || "Votre réponse n’a pas pu être envoyée.");
  return payload.data;
}

// Admin: Mettre à jour le statut d'un message de contact
export async function updateContactStatus(id: string, status: string): Promise<void> {
  let response: Response;
  try {
    response = await fetchWithSession(`/api/contact/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible de mettre à jour le statut du message.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Erreur lors de la mise à jour du statut.");
  }
}

// Admin: Récupérer les demandes de devis
export async function getQuotes(signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetchWithSession("/api/quotes", {
      method: "GET",
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error("Impossible de charger les demandes de devis.");
  }

  if (!response.ok) {
    throw new Error("Les demandes de devis ne sont pas disponibles.");
  }

  const data = await response.json().catch(() => null);
  if (!data?.data || !Array.isArray(data.data)) {
    throw new Error("Format invalide pour les demandes de devis.");
  }

  return data.data;
}

// Admin: Mettre à jour le statut d'un devis
export async function updateQuoteStatus(id: string, status: string): Promise<void> {
  let response: Response;
  try {
    response = await fetchWithSession(`/api/quotes/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible de mettre à jour le statut du devis.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Erreur lors de la mise à jour du statut.");
  }
}

export type AdminHomepageCard = {
  productKey: string;
  title: string;
  imageUrl: string;
  alt: string;
  position: number;
  isActive: boolean;
};

const adminHomepageCardSchema = z.object({
  productKey: z.string(),
  title: z.string(),
  imageUrl: z.string().startsWith("/"),
  alt: z.string(),
  position: z.number().int(),
  isActive: z.boolean(),
});

export async function getAdminHomepageCards(signal?: AbortSignal): Promise<AdminHomepageCard[]> {
  let response: Response;
  try {
    response = await fetchWithSession("/api/admin/home/photos", { method: "GET", cache: "no-store", signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error("Impossible de joindre les cartes d’accueil.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || "Les cartes d’accueil ne sont pas disponibles.");
  const result = z.object({ success: z.literal(true), data: z.array(adminHomepageCardSchema) }).safeParse(payload);
  if (!result.success) throw new Error("Format invalide pour les cartes d’accueil.");
  return result.data.data;
}

export async function saveAdminHomepageCard(
  productKey: string,
  changes: Pick<AdminHomepageCard, "title" | "imageUrl" | "alt" | "isActive">,
): Promise<AdminHomepageCard> {
  let response: Response;
  try {
    response = await fetchWithSession(`/api/admin/home/photos/${encodeURIComponent(productKey)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible d’enregistrer la carte d’accueil.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || "La carte d’accueil n’a pas pu être enregistrée.");
  const result = z.object({ success: z.literal(true), data: adminHomepageCardSchema }).safeParse(payload);
  if (!result.success) throw new Error("Format invalide pour la carte enregistrée.");
  return result.data.data;
}
