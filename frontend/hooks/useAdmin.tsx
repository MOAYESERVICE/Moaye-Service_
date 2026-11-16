"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { demoThreads, isUnread, type DemoOrder, type DemoQuote, type OrderStatus, type QuoteStatus, type Thread } from "@/data/demo";
import { seedContent, seedPhotos, type AdminUser, type AdminUserRole, type ContentId, type ContentItem, type Photo, type Role } from "@/data/admin";
import type { Product } from "@/types/product";
import { deleteAdminProduct, getAdminUsers, getAllOrders, getContactMessages, getProducts, getQuotes, groupContactThreads, saveAdminProduct, updateAdminUser, type AdminProductInput } from "@/lib/api";

type Row = Thread & { unread: boolean };
export type Todo = { id: string; type: "Commande" | "Devis" | "Message"; label: string; client: string; iso: string; href: string; need: string; unread?: boolean };
type AdminIdentity = { id: number; name: string; email: string };

type Ctx = {
  role: Role;
  adminIdentity: AdminIdentity | null;
  q: string;
  setQ: (v: string) => void;
  toast: string;
  flash: (msg: string) => void;

  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  refreshProducts: () => void;
  saveProduct: (p: AdminProductInput) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  restock: (id: string) => void;

  orders: DemoOrder[];
  ordersLoading: boolean;
  ordersError: string | null;
  setOrderStatus: (id: string, s: OrderStatus) => void;
  quotes: DemoQuote[];
  quotesLoading: boolean;
  quotesError: string | null;
  setQuoteStatus: (id: string, s: QuoteStatus) => void;

  threads: Row[];
  unreadThreads: number;
  markRead: (id: string) => void;
  sendReply: (id: string, text: string) => void;

  users: AdminUser[];
  usersLoading: boolean;
  usersError: string | null;
  refreshUsers: () => void;
  setUserRole: (id: string, r: AdminUserRole) => Promise<void>;
  toggleUser: (id: string) => Promise<void>;

  content: Record<ContentId, ContentItem[]>;
  saveContent: (m: ContentId, item: Omit<ContentItem, "id"> & { id?: string }) => void;
  deleteContent: (m: ContentId, id: string) => void;
  toggleContent: (m: ContentId, id: string) => void;

  photos: Photo[];
  addPhoto: () => void;
  deletePhoto: (id: string) => void;

  todo: Todo[];
  messageNotificationHistory: Todo[];
  readNotificationIds: string[];
  markNotificationRead: (id: string) => void;
  readNotifs: () => void;
};

const AdminContext = createContext<Ctx | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const role: Role = "admin";
  const [adminIdentity, setAdminIdentity] = useState<AdminIdentity | null>(null);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productRefreshKey, setProductRefreshKey] = useState(0);
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<DemoQuote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [orderNotifications, setOrderNotifications] = useState<Todo[]>([]);
  const [messageNotifications, setMessageNotifications] = useState<Todo[]>([]);
  const [threads, setThreads] = useState<Thread[]>(demoThreads);
  const [read, setRead] = useState<Record<string, boolean>>({});
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersRefreshKey, setUsersRefreshKey] = useState(0);
  const [content, setContent] = useState(seedContent);
  const [photos, setPhotos] = useState(seedPhotos);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = await response.json().catch(() => null);
        const user = payload?.data?.user;
        if (user && typeof user.id === "number" && typeof user.name === "string" && typeof user.email === "string") {
          setAdminIdentity({ id: user.id, name: user.name, email: user.email });
        }
        return null;
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  // Charge la liste persistée et expose une erreur explicite plutôt que des données de démonstration.
  useEffect(() => {
    const controller = new AbortController();
    getProducts(controller.signal)
      .then((loadedProducts) => {
        setProducts(loadedProducts);
        setProductsError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setProductsError(error instanceof Error ? error.message : "Le catalogue n’a pas pu être chargé.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setProductsLoading(false);
      });

    return () => controller.abort();
  }, [productRefreshKey]);

  useEffect(() => {
    let active = true;
    let requestRunning = false;
    const controller = new AbortController();

    const loadUsers = async (signal?: AbortSignal) => {
      if (requestRunning) return;
      requestRunning = true;
      try {
        const records = await getAdminUsers(signal);
        if (!active || signal?.aborted) return;
        setUsers(records.map((user) => ({
          id: String(user.id), name: user.name, email: user.email, role: user.role,
          active: user.isActive, isSelf: user.isSelf, createdAt: user.createdAt,
        })));
        setUsersError(null);
      } catch (error) {
        if (!active || signal?.aborted) return;
        setUsers([]);
        setUsersError(error instanceof Error ? error.message : "Les comptes ne sont pas disponibles.");
      } finally {
        requestRunning = false;
        if (active && !signal?.aborted) setUsersLoading(false);
      }
    };

    void loadUsers(controller.signal);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadUsers();
    };
    const timer = window.setInterval(refreshWhenVisible, 30000);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [usersRefreshKey]);

  // Synchronise le compteur et les tâches du tableau de bord avec les devis enregistrés.
  useEffect(() => {
    const restoreReadState = window.setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem("moaye-admin-read-notifications") ?? "[]");
        if (Array.isArray(stored)) setReadNotificationIds(stored.filter((id): id is string => typeof id === "string"));
      } catch {
        localStorage.removeItem("moaye-admin-read-notifications");
      }
    }, 0);
    return () => window.clearTimeout(restoreReadState);
  }, []);

  useEffect(() => {
    let active = true;

    const loadQuotes = async () => {
      try {
        const records = await getQuotes();
        if (!active) return;
        setQuotes(records.map((quote: {
          id: string | number;
          title: string;
          contactName?: string | null;
          createdAt: string;
          status: string;
        }): DemoQuote => ({
          id: String(quote.id),
          client: quote.contactName || "Demandeur",
          iso: quote.createdAt.slice(0, 10),
          date: new Date(quote.createdAt).toLocaleDateString("fr-FR"),
          subject: quote.title,
          st: quote.status === "ACCEPTED" ? "accepted" : quote.status === "PENDING" ? "new" : quote.status === "REJECTED" ? "rejected" : "expired",
        })));
        setQuotesError(null);
      } catch (error) {
        if (active) {
          setQuotes([]);
          setQuotesError(error instanceof Error ? error.message : "Les devis ne sont pas disponibles.");
        }
      } finally {
        if (active) setQuotesLoading(false);
      }
    };

    void loadQuotes();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadQuotes();
    };
    const timer = window.setInterval(refreshWhenVisible, 15000);
    window.addEventListener("focus", refreshWhenVisible);

    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, []);

  // Les notifications admin proviennent des commandes et messages réellement enregistrés.
  useEffect(() => {
    let active = true;

    const loadRecentActivity = async () => {
      const orderResult = await Promise.allSettled([getAllOrders()]).then(([result]) => result);
      if (!active) return;

      if (orderResult.status === "fulfilled") {
        const statusMap: Record<string, OrderStatus> = { PENDING: "pending", CONFIRMED: "confirmed", PROCESSING: "preparing", SHIPPED: "shipped", DELIVERED: "delivered", CANCELLED: "cancelled" };
        setOrders(orderResult.value.map((order: {
          id: string | number; status: string; totalPrice: number; createdAt: string; shippingCity?: string;
          user?: { id?: string | number; name?: string };
          items?: Array<{ quantity: number; price: number; product?: { name?: string; category?: { name?: string } | string | null } }>;
        }): DemoOrder => {
          const iso = order.createdAt.slice(0, 10);
          return {
            id: String(order.id), client: order.user?.name || "Client", clientKey: String(order.user?.id ?? order.user?.name ?? order.id), city: order.shippingCity,
            iso, date: new Date(order.createdAt).toLocaleDateString("fr-FR"), status: statusMap[order.status] ?? "pending",
            items: (order.items ?? []).map((item) => ({ name: item.product?.name || "Produit", cat: typeof item.product?.category === "string" ? item.product.category : item.product?.category?.name || "Autre", price: item.price, qty: item.quantity })),
            total: order.totalPrice, hist: [],
          };
        }));
        setOrdersError(null);
        setOrderNotifications(orderResult.value
          .filter((order: { status: string }) => order.status === "PENDING" || order.status === "CONFIRMED")
          .map((order: { id: string | number; status: string; createdAt: string; user?: { name?: string } }): Todo => ({
            id: `order:${order.id}`,
            type: "Commande",
            label: String(order.id),
            client: order.user?.name || "Client",
            iso: order.createdAt.slice(0, 10),
            href: "/admin/commandes",
            need: "orders",
          })));
      } else {
        setOrders([]);
        setOrdersError(orderResult.reason instanceof Error ? orderResult.reason.message : "Les commandes ne sont pas disponibles.");
        setOrderNotifications([]);
      }
      setOrdersLoading(false);

    };

    void loadRecentActivity();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadRecentActivity();
    };
    const timer = window.setInterval(refreshWhenVisible, 15000);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, []);

  // Actualise uniquement les notifications de messages pour garder leur compteur à jour.
  useEffect(() => {
    let active = true;
    let running = false;
    const loadMessageNotifications = async () => {
      if (running) return;
      running = true;
      try {
        const records = await getContactMessages();
        if (!active) return;
        const notifications = groupContactThreads(records).map((message): Todo => {
          const latestCustomerMessage = [...message.replies].reverse().find((reply) => reply.sender === "CUSTOMER");
          const activityId = latestCustomerMessage?.id ?? `initial-${message.id}`;
          const activityDate = latestCustomerMessage?.createdAt ?? message.createdAt;
          return {
            id: `contact:${message.id}:${activityId}`,
            type: "Message",
            label: latestCustomerMessage?.subject ?? message.subject,
            client: message.name,
            iso: activityDate.slice(0, 10),
            href: "/admin/messages",
            need: "messages",
            unread: message.status === "NEW",
          };
        });
        setMessageNotifications(notifications);
      } catch {
        // Garde les notifications déjà chargées si le réseau est momentanément indisponible.
      } finally {
        running = false;
      }
    };
    void loadMessageNotifications();
    const refreshWhenVisible = () => { if (document.visibilityState === "visible") void loadMessageNotifications(); };
    const timer = window.setInterval(refreshWhenVisible, 5000);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, []);

  const refreshProducts = () => {
    setProductsLoading(true);
    setProductsError(null);
    setProductRefreshKey((key) => key + 1);
  };

  const refreshUsers = () => {
    setUsersLoading(true);
    setUsersError(null);
    setUsersRefreshKey((key) => key + 1);
  };

  const saveUserAccess = async (id: string, changes: { role?: AdminUserRole; isActive?: boolean }) => {
    try {
      const saved = await updateAdminUser(id, changes);
      setUsers((current) => current.map((user) => user.id === id ? {
        ...user, role: saved.role, active: saved.isActive, isSelf: saved.isSelf,
        name: saved.name, email: saved.email, createdAt: saved.createdAt,
      } : user));
      setUsersError(null);
      flash("Accès utilisateur mis à jour.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "La modification des accès a échoué.";
      flash(message);
      throw error;
    }
  };

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const rows: Row[] = threads.map((t) => ({ ...t, unread: isUnread(t, "staff", read) }));
  const todo: Todo[] = [
    ...orderNotifications,
    ...quotes.filter((quote) => quote.st === "new").map((quote) => ({
      id: `quote:${quote.id}`,
      type: "Devis" as const,
      label: quote.subject,
      client: quote.client,
      iso: quote.iso,
      href: "/admin/devis",
      need: "quotes",
    })),
    ...messageNotifications.filter((item) => item.unread && !readNotificationIds.includes(item.id)),
  ].sort((a, b) => new Date(b.iso).getTime() - new Date(a.iso).getTime());

  const value: Ctx = {
    role, adminIdentity, q, setQ, toast, flash,

    products,
    productsLoading,
    productsError,
    refreshProducts,
    saveProduct: async (p) => {
      const savedProduct = await saveAdminProduct(p);
      setProducts((current) => p.id
        ? current.map((product) => product.id === savedProduct.id ? savedProduct : product)
        : [savedProduct, ...current]);
      setProductsError(null);
      flash(p.id ? "Produit modifié." : "Produit ajouté.");
    },
    deleteProduct: async (id) => {
      await deleteAdminProduct(id);
      setProducts((current) => current.filter((product) => product.id !== id));
      flash("Produit supprimé.");
    },
    restock: (id) => {
      setProducts((l) => l.map((x) => (x.id === id ? { ...x, stock: "in" } : x)));
      flash("Produit de nouveau en stock.");
    },

    orders,
    ordersLoading,
    ordersError,
    setOrderStatus: (id, status) => { setOrders((l) => l.map((o) => (o.id === id ? { ...o, status } : o))); flash(`Statut de ${id} mis à jour.`); },
    quotes,
    quotesLoading,
    quotesError,
    setQuoteStatus: (id, st) => { setQuotes((l) => l.map((x) => (x.id === id ? { ...x, st } : x))); flash(`Statut de ${id} mis à jour.`); },

    threads: rows,
    unreadThreads: rows.filter((t) => t.unread).length,
    markRead: (id) => setRead((r) => (r[id] ? r : { ...r, [id]: true })),
    sendReply: (id, text) =>
      setThreads((l) => l.map((t) => (t.id === id ? { ...t, msgs: [...t.msgs, { from: "staff", text, time: "À l'instant" }] } : t))),

    users,
    usersLoading,
    usersError,
    refreshUsers,
    setUserRole: (id, role) => saveUserAccess(id, { role }),
    toggleUser: (id) => {
      const user = users.find((item) => item.id === id);
      if (!user) return Promise.reject(new Error("Utilisateur introuvable."));
      return saveUserAccess(id, { isActive: !user.active });
    },

    content,
    saveContent: (m, item) => {
      setContent((c) => ({
        ...c,
        [m]: item.id ? c[m].map((x) => (x.id === item.id ? { ...x, ...item, id: x.id } : x)) : [{ ...item, id: "n" + Date.now() }, ...c[m]],
      }));
      flash(item.id ? "Modifications enregistrées." : "Élément ajouté.");
    },
    deleteContent: (m, id) => { setContent((c) => ({ ...c, [m]: c[m].filter((x) => x.id !== id) })); flash("Élément supprimé."); },
    toggleContent: (m, id) =>
      setContent((c) => ({ ...c, [m]: c[m].map((x) => (x.id === id ? { ...x, status: x.status === "pub" ? "draft" : "pub" } : x)) })),

    photos,
    addPhoto: () => { setPhotos((l) => [...l, { id: "ph" + Date.now(), src: "", title: "Nouvelle photo", usage: "Non utilisée" }]); flash("Photo ajoutée (téléversement à brancher)."); },
    deletePhoto: (id) => { setPhotos((l) => l.filter((x) => x.id !== id)); flash("Photo supprimée."); },

    todo,
    messageNotificationHistory: messageNotifications,
    readNotificationIds,
    markNotificationRead: (id) => {
      if (readNotificationIds.includes(id)) return;
      const updated = [...readNotificationIds, id];
      setReadNotificationIds(updated);
      localStorage.setItem("moaye-admin-read-notifications", JSON.stringify(updated));
    },
    readNotifs: () => {
      const ids = Array.from(new Set([...readNotificationIds, ...todo.map((item) => item.id)]));
      setReadNotificationIds(ids);
      localStorage.setItem("moaye-admin-read-notifications", JSON.stringify(ids));
    },
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin doit être utilisé dans <AdminProvider>");
  return ctx;
}
