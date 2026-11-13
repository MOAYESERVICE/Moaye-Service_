"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { type DemoOrder, type DemoQuote, type OrderStatus } from "@/data/demo";
import { getMyContactMessages, getOrders, getQuotes, type ContactThread } from "@/lib/api";

export type Profile = { name: string; email: string; phone: string; city: string };
type Ctx = {
  q: string;
  setQ: (v: string) => void;
  profile: Profile;
  setProfile: (p: Profile) => void;
  orders: DemoOrder[];
  ordersLoading: boolean;
  ordersError: string | null;
  quotes: DemoQuote[];
  quotesLoading: boolean;
  quotesError: string | null;
  unreadThreads: number;
  messageNotifications: { id: string; title: string; time: string; href: string }[];
  readNotificationIds: string[];
  markNotificationRead: (id: string) => void;
  notifRead: boolean;
  readNotifs: () => void;
};

const AccountContext = createContext<Ctx | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [q, setQ] = useState("");
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", phone: "", city: "" });
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<DemoQuote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [notifRead, setNotifRead] = useState(false);
  const [messageNotifications, setMessageNotifications] = useState<Ctx["messageNotifications"]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  useEffect(() => {
    if (!profile.email) return;
    const key = `moaye-client-read-notifications:${profile.email.toLocaleLowerCase("fr")}`;
    const restoreReadState = window.setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(key) ?? "[]");
        setReadNotificationIds(Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : []);
      } catch {
        localStorage.removeItem(key);
        setReadNotificationIds([]);
      }
    }, 0);
    return () => window.clearTimeout(restoreReadState);
  }, [profile.email]);

  useEffect(() => {
    let active = true;
    let loadingOrders = true;
    let loadingQuotes = true;
    let requestRunning = false;
    const mapOrder = (order: {
      id: string | number; status: string; totalPrice: number; createdAt: string; shippingCity?: string;
      items?: Array<{ quantity: number; price: number; product?: { name?: string; category?: { name?: string } } }>;
    }): DemoOrder => {
      const statusMap: Record<string, OrderStatus> = { PENDING: "pending", CONFIRMED: "confirmed", PROCESSING: "preparing", SHIPPED: "shipped", DELIVERED: "delivered", CANCELLED: "cancelled" };
      const iso = order.createdAt.slice(0, 10);
      return {
        id: String(order.id), client: "Vous", iso, date: new Date(order.createdAt).toLocaleDateString("fr-FR"),
        status: statusMap[order.status] ?? "pending", city: order.shippingCity,
        items: (order.items ?? []).map((item) => ({ name: item.product?.name || "Produit", cat: item.product?.category?.name || "Autre", price: item.price, qty: item.quantity })),
        total: order.totalPrice, hist: [],
      };
    };
    const loadData = async () => {
      if (requestRunning) return;
      requestRunning = true;
      const [orderResult, quoteResult, messageResult] = await Promise.allSettled([
        getOrders(), getQuotes(), getMyContactMessages(),
      ]);
      if (!active) { requestRunning = false; return; }
      if (orderResult.status === "fulfilled") {
        setOrders(orderResult.value.map(mapOrder));
        setOrdersError(null);
        const latestCity = [...orderResult.value].sort((a: { createdAt: string }, b: { createdAt: string }) => b.createdAt.localeCompare(a.createdAt))[0]?.shippingCity;
        if (latestCity) setProfile((current) => ({ ...current, city: current.city || latestCity }));
      } else {
        setOrders([]);
        setOrdersError(orderResult.reason instanceof Error ? orderResult.reason.message : "Vos commandes ne sont pas disponibles.");
      }
      if (quoteResult.status === "fulfilled") {
        setQuotes(quoteResult.value.map((quote: { id: string | number; title: string; contactName?: string | null; createdAt: string; status: string }): DemoQuote => ({
          id: String(quote.id), client: quote.contactName || "Vous", iso: quote.createdAt.slice(0, 10),
          date: new Date(quote.createdAt).toLocaleDateString("fr-FR"), subject: quote.title,
          st: quote.status === "PENDING" ? "new" : quote.status === "ACCEPTED" ? "accepted" : quote.status === "REJECTED" ? "rejected" : "expired",
        })));
        setQuotesError(null);
      } else {
        setQuotes([]);
        setQuotesError(quoteResult.reason instanceof Error ? quoteResult.reason.message : "Vos devis ne sont pas disponibles.");
      }
      if (messageResult.status === "fulfilled") {
        const notifications = messageResult.value.flatMap((thread: ContactThread) =>
          thread.replies
            .filter((reply) => reply.sender === "ADMIN")
            .map((reply) => ({
              id: `reply:${thread.id}:${reply.id}`,
              title: `Nouvelle réponse · ${thread.subject}`,
              time: `${reply.name || "Administration"} · ${new Date(reply.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`,
              href: "/mon-compte/messages",
              createdAt: reply.createdAt,
            })),
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMessageNotifications(notifications.map(({ id, title, time, href }) => ({ id, title, time, href })));
      } else {
        setMessageNotifications([]);
      }
      if (active) {
        if (loadingOrders) { loadingOrders = false; setOrdersLoading(false); }
        if (loadingQuotes) { loadingQuotes = false; setQuotesLoading(false); }
      }
      requestRunning = false;
    };
    void loadData();

    const controller = new AbortController();
    void fetch("/api/auth/me", { cache: "no-store", signal: controller.signal }).then(async (response) => {
      if (!response.ok) return;
      const payload = await response.json().catch(() => null);
      const user = payload?.data?.user;
      if (active && user) setProfile((current) => ({ name: user.name ?? "", email: user.email ?? "", phone: user.phone ?? "", city: current.city }));
    }).catch(() => undefined);

    const refreshWhenVisible = () => { if (document.visibilityState === "visible") void loadData(); };
    const timer = window.setInterval(refreshWhenVisible, 15000);
    window.addEventListener("focus", refreshWhenVisible);

    return () => { active = false; controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", refreshWhenVisible); };
  }, []);

  const value: Ctx = {
    q, setQ, profile, setProfile,
    orders, ordersLoading, ordersError,
    quotes, quotesLoading, quotesError,
    unreadThreads: messageNotifications.filter((item) => !readNotificationIds.includes(item.id)).length,
    messageNotifications,
    readNotificationIds,
    markNotificationRead: (id) => {
      setReadNotificationIds((current) => {
        if (current.includes(id)) return current;
        const updated = [...current, id];
        if (profile.email) {
          try {
            localStorage.setItem(`moaye-client-read-notifications:${profile.email.toLocaleLowerCase("fr")}`, JSON.stringify(updated));
          } catch {
            // Keep the in-memory read state if browser storage is unavailable.
          }
        }
        return updated;
      });
      if (!id.startsWith("reply:")) setNotifRead(true);
    },
    notifRead,
    readNotifs: () => {
      setNotifRead(true);
      setReadNotificationIds((current) => {
        const updated = Array.from(new Set([...current, ...messageNotifications.map((item) => item.id)]));
        if (profile.email) {
          try {
            localStorage.setItem(`moaye-client-read-notifications:${profile.email.toLocaleLowerCase("fr")}`, JSON.stringify(updated));
          } catch {
            // Keep the in-memory read state if browser storage is unavailable.
          }
        }
        return updated;
      });
    },
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount doit être utilisé dans <AccountProvider>");
  return ctx;
}
