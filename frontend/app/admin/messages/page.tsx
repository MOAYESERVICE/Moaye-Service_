"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/admin/RoleGuard";
import StatusSelect from "@/components/admin/StatusSelect";
import Pill from "@/components/portal/Pill";
import { useAdmin } from "@/hooks/useAdmin";
import { getContactMessages, sendContactReply, updateContactStatus, type ContactReply } from "@/lib/api";
import { norm } from "@/lib/format";

type ContactMessage = {
  id: string | number;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: "NEW" | "VIEWED" | "RESOLVED";
  createdAt: string;
  replies: ContactReply[];
};

type MessageStatus = ContactMessage["status"];
type Filter = "ALL" | MessageStatus;

const STATUS_OPTIONS = [
  { id: "NEW", label: "Nouveau" },
  { id: "VIEWED", label: "En cours" },
  { id: "RESOLVED", label: "Résolu" },
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ALL", label: "Tous" },
  { id: "NEW", label: "Nouveaux" },
  { id: "VIEWED", label: "En cours" },
  { id: "RESOLVED", label: "Résolus" },
];

const STATUS_TONE: Record<MessageStatus, "in" | "pr" | "out" | "n"> = {
  NEW: "out",
  VIEWED: "pr",
  RESOLVED: "in",
};

const STATUS_LABEL: Record<MessageStatus, string> = {
  NEW: "Nouveau",
  VIEWED: "En cours",
  RESOLVED: "Résolu",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AdminMessages() {
  const { q, flash } = useAdmin();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const refreshMessages = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await getContactMessages(signal);
      setMessages(data || []);
      setError(null);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : "Les messages n’ont pas pu être chargés.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const initialLoad = window.setTimeout(() => {
      void refreshMessages(controller.signal);
    }, 0);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshMessages();
    };
    const timer = window.setInterval(refreshWhenVisible, 20000);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      controller.abort();
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [refreshMessages]);

  const counts = useMemo(() => ({
    ALL: messages.length,
    NEW: messages.filter((message) => message.status === "NEW").length,
    VIEWED: messages.filter((message) => message.status === "VIEWED").length,
    RESOLVED: messages.filter((message) => message.status === "RESOLVED").length,
  }), [messages]);

  const filteredMessages = messages.filter((message) => {
    const matchesStatus = filter === "ALL" || message.status === filter;
    const matchesSearch = norm(q) === "" ||
      norm(`${message.subject} ${message.name} ${message.email} ${message.phone ?? ""} ${message.message}`).includes(norm(q));
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (id: string | number, newStatus: string) => {
    const key = String(id);
    setPendingId(key);
    try {
      await updateContactStatus(key, newStatus);
      setMessages((current) => current.map((message) =>
        String(message.id) === key ? { ...message, status: newStatus as MessageStatus } : message,
      ));
      flash("Statut du message mis à jour.");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Le statut n’a pas pu être modifié.");
    } finally {
      setPendingId(null);
    }
  };

  const handleReply = async (message: ContactMessage) => {
    const key = String(message.id);
    const reply = replyDrafts[key]?.trim();
    if (!reply) return;
    setReplyingId(key);
    try {
      const updated = await sendContactReply(message.id, reply);
      setMessages((current) => current.map((item) => String(item.id) === key ? { ...item, ...updated } : item));
      setReplyDrafts((current) => ({ ...current, [key]: "" }));
      flash("Réponse envoyée au client.");
    } catch (err) {
      flash(err instanceof Error ? err.message : "La réponse n’a pas pu être envoyée.");
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <RoleGuard module="messages">
      <div className="pt-message-page">
        <header className="pt-message-heading">
          <div>
            <span className="pt-message-eyebrow">RELATION CLIENT</span>
            <h2>Boîte de réception</h2>
            <p>Retrouvez les demandes envoyées depuis le formulaire de contact et suivez leur traitement.</p>
          </div>
          <button
            type="button"
            className="pt-message-refresh"
            onClick={() => {
              setRefreshing(true);
              void refreshMessages();
            }}
            disabled={refreshing || loading}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.7-2L20 12M4 12l2.7 5a7 7 0 0 0 11.7-2" /></svg>
            {refreshing ? "Actualisation…" : "Actualiser"}
          </button>
        </header>

        <section className="pt-message-stats" aria-label="Résumé des messages">
          <div className="pt-message-stat pt-message-stat-total"><span>Total reçu</span><strong>{counts.ALL}</strong></div>
          <div className="pt-message-stat"><span>À traiter</span><strong>{counts.NEW}</strong></div>
          <div className="pt-message-stat"><span>En cours</span><strong>{counts.VIEWED}</strong></div>
          <div className="pt-message-stat"><span>Résolus</span><strong>{counts.RESOLVED}</strong></div>
        </section>

        <section className="pt-message-inbox" aria-label="Liste des messages de contact">
          <div className="pt-message-toolbar">
            <div>
              <h3>Messages des clients</h3>
              <p>{filteredMessages.length} résultat{filteredMessages.length === 1 ? "" : "s"}</p>
            </div>
            <div className="pt-message-filters" role="group" aria-label="Filtrer les messages par statut">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={filter === item.id ? "pt-message-filter active" : "pt-message-filter"}
                  onClick={() => setFilter(item.id)}
                  aria-pressed={filter === item.id}
                >
                  {item.label}<span>{counts[item.id]}</span>
                </button>
              ))}
            </div>
          </div>

          {loading && <div className="pt-message-state">Chargement de votre boîte de réception…</div>}

          {!loading && error && (
            <div className="pt-message-error" role="alert">
              <div><strong>Impossible de charger les messages</strong><p>{error}</p></div>
              <button type="button" className="pt-message-refresh" onClick={() => { setRefreshing(true); void refreshMessages(); }}>Réessayer</button>
            </div>
          )}

          {!loading && !error && filteredMessages.length === 0 && (
            <div className="pt-message-empty">
              <span className="pt-message-empty-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48"><rect x="7" y="11" width="34" height="26" rx="5" /><path d="m9 15 15 12 15-12" /></svg>
              </span>
              <h3>{messages.length === 0 ? "Votre boîte de réception est vide" : "Aucun message dans ce filtre"}</h3>
              <p>{messages.length === 0 ? "Les demandes envoyées depuis le site apparaîtront ici." : "Essayez un autre statut ou modifiez votre recherche."}</p>
              {filter !== "ALL" && <button className="pt-message-filter active" type="button" onClick={() => setFilter("ALL")}>Afficher tous les messages</button>}
            </div>
          )}

          {!loading && !error && filteredMessages.length > 0 && (
            <div className="pt-message-list">
              {filteredMessages.map((message) => (
                <article key={message.id} className={`pt-message-card${message.status === "NEW" ? " is-new" : ""}`}>
                  <div className="pt-message-card-top">
                    <div className="pt-message-avatar" aria-hidden="true">{message.name.trim().charAt(0).toLocaleUpperCase() || "?"}</div>
                    <div className="pt-message-sender">
                      <strong>{message.name}</strong>
                      <span>{formatDate(message.createdAt)}</span>
                    </div>
                    <Pill tone={STATUS_TONE[message.status]}>{STATUS_LABEL[message.status]}</Pill>
                  </div>
                  <div className="pt-message-content">
                    <h4>{message.subject}</h4>
                    <p>{message.message}</p>
                  </div>
                  {message.replies?.length > 0 && <div className="pt-admin-thread-replies" aria-label="Réponses de la conversation">
                    {message.replies.map((reply) => <div key={reply.id} className={`pt-admin-thread-reply ${reply.sender === "ADMIN" ? "from-admin" : "from-client"}`}><p>{reply.message}</p><small>{reply.sender === "ADMIN" ? "Administration" : message.name} · {formatDate(reply.createdAt)}</small></div>)}
                  </div>}
                  <form className="pt-admin-reply-form" onSubmit={(event) => { event.preventDefault(); void handleReply(message); }}>
                    <textarea className="inp" rows={2} maxLength={5000} value={replyDrafts[String(message.id)] ?? ""} onChange={(event) => setReplyDrafts((current) => ({ ...current, [String(message.id)]: event.target.value }))} placeholder={`Répondre à ${message.name}…`} aria-label={`Répondre à ${message.name}`} />
                    <button type="submit" className="btn btn-green btn-sm" disabled={!replyDrafts[String(message.id)]?.trim() || replyingId === String(message.id)}>{replyingId === String(message.id) ? "Envoi…" : "Répondre"}</button>
                  </form>
                  <div className="pt-message-card-footer">
                    <div className="pt-message-contact">
                      <a href={`mailto:${message.email}`}>{message.email}</a>
                      {message.phone && <a href={`tel:${message.phone}`}>{message.phone}</a>}
                    </div>
                    <div className="pt-message-status-control">
                      <span>{pendingId === String(message.id) ? "Enregistrement…" : "Suivi"}</span>
                      <StatusSelect
                        label={`Statut du message de ${message.name}`}
                        value={message.status}
                        options={STATUS_OPTIONS}
                        onChange={(value) => void handleStatusChange(message.id, value)}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </RoleGuard>
  );
}
