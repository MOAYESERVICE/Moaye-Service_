"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/admin/RoleGuard";
import StatusSelect from "@/components/admin/StatusSelect";
import Pill from "@/components/portal/Pill";
import { useAdmin } from "@/hooks/useAdmin";
import { deleteContactMessage, getContactMessages, sendContactReply, updateContactStatus, type ContactReply } from "@/lib/api";
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
type Filter = "ACTIVE" | "ALL" | MessageStatus;

const STATUS_OPTIONS = [
  { id: "NEW", label: "Nouveau" },
  { id: "VIEWED", label: "En cours" },
  { id: "RESOLVED", label: "Fermé" },
];
const FILTERS: { id: Filter; label: string }[] = [
  { id: "ACTIVE", label: "Actifs" },
  { id: "NEW", label: "Nouveaux" },
  { id: "VIEWED", label: "En cours" },
  { id: "RESOLVED", label: "Fermés" },
  { id: "ALL", label: "Tous" },
];
const STATUS_TONE: Record<MessageStatus, "in" | "pr" | "out" | "n"> = { NEW: "out", VIEWED: "pr", RESOLVED: "in" };
const STATUS_LABEL: Record<MessageStatus, string> = { NEW: "Nouveau", VIEWED: "En cours", RESOLVED: "Fermé" };

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

export default function AdminMessages() {
  const { q, flash } = useAdmin();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<Filter>("ACTIVE");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
    const initialLoad = window.setTimeout(() => { void refreshMessages(controller.signal); }, 0);
    const refreshWhenVisible = () => { if (document.visibilityState === "visible") void refreshMessages(); };
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
    ACTIVE: messages.filter((message) => message.status !== "RESOLVED").length,
    NEW: messages.filter((message) => message.status === "NEW").length,
    VIEWED: messages.filter((message) => message.status === "VIEWED").length,
    RESOLVED: messages.filter((message) => message.status === "RESOLVED").length,
  }), [messages]);

  const filteredMessages = messages.filter((message) => {
    const matchesStatus = filter === "ALL" || (filter === "ACTIVE" ? message.status !== "RESOLVED" : message.status === filter);
    const matchesSearch = norm(q) === "" || norm(`${message.subject} ${message.name} ${message.email} ${message.phone ?? ""} ${message.message}`).includes(norm(q));
    return matchesStatus && matchesSearch;
  });
  const selectedMessage = filteredMessages.find((message) => String(message.id) === selectedId) ?? filteredMessages[0] ?? null;

  const handleStatusChange = async (message: ContactMessage, newStatus: string) => {
    const key = String(message.id);
    setPendingId(key);
    try {
      await updateContactStatus(key, newStatus);
      setMessages((current) => current.map((item) => String(item.id) === key ? { ...item, status: newStatus as MessageStatus } : item));
      if (newStatus === "RESOLVED" || message.status === "RESOLVED") {
        setFilter("ACTIVE");
        setMobileDetailOpen(false);
      }
      flash(newStatus === "RESOLVED" ? "Discussion fermée et archivée." : "Statut de la discussion mis à jour.");
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
      if (message.status === "RESOLVED") setFilter("ACTIVE");
      flash("Réponse envoyée au client.");
    } catch (err) {
      flash(err instanceof Error ? err.message : "La réponse n’a pas pu être envoyée.");
    } finally {
      setReplyingId(null);
    }
  };

  const handleDelete = async (message: ContactMessage) => {
    const key = String(message.id);
    if (!window.confirm(`Supprimer définitivement la discussion « ${message.subject} » de ${message.name} ainsi que toutes ses réponses ?`)) return;
    setDeletingId(key);
    try {
      await deleteContactMessage(message.id);
      setMessages((current) => current.filter((item) => String(item.id) !== key));
      setReplyDrafts((current) => { const next = { ...current }; delete next[key]; return next; });
      setMobileDetailOpen(false);
      flash("Discussion et réponses supprimées.");
    } catch (err) {
      flash(err instanceof Error ? err.message : "La discussion n’a pas pu être supprimée.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <RoleGuard module="messages">
      <div className="pt-message-page">
        <header className="pt-message-heading">
          <div><span className="pt-message-eyebrow">RELATION CLIENT</span><h2>Messages</h2><p>Choisissez un client pour consulter l’historique et répondre à sa demande.</p></div>
          <button type="button" className="pt-message-refresh" onClick={() => { setRefreshing(true); void refreshMessages(); }} disabled={refreshing || loading}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.7-2L20 12M4 12l2.7 5a7 7 0 0 0 11.7-2" /></svg>
            {refreshing ? "Actualisation…" : "Actualiser"}
          </button>
        </header>

        <section className="pt-message-stats" aria-label="Résumé des messages">
          <div className="pt-message-stat pt-message-stat-total"><span>Total</span><strong>{counts.ALL}</strong></div>
          <div className="pt-message-stat"><span>Actifs</span><strong>{counts.ACTIVE}</strong></div>
          <div className="pt-message-stat"><span>En cours</span><strong>{counts.VIEWED}</strong></div>
          <div className="pt-message-stat"><span>Fermés</span><strong>{counts.RESOLVED}</strong></div>
        </section>

        <section className="pt-message-inbox" aria-label="Boîte de réception des clients">
          <div className="pt-message-toolbar">
            <div><h3>Boîte de réception</h3><p>{filteredMessages.length} conversation{filteredMessages.length === 1 ? "" : "s"}</p></div>
            <div className="pt-message-filters" role="group" aria-label="Filtrer les conversations">
              {FILTERS.map((item) => <button key={item.id} type="button" className={filter === item.id ? "pt-message-filter active" : "pt-message-filter"} onClick={() => { setFilter(item.id); setMobileDetailOpen(false); }} aria-pressed={filter === item.id}>{item.label}<span>{counts[item.id]}</span></button>)}
            </div>
          </div>

          {loading && <div className="pt-message-state">Chargement des conversations…</div>}
          {!loading && error && <div className="pt-message-error" role="alert"><div><strong>Impossible de charger les messages</strong><p>{error}</p></div><button type="button" className="pt-message-refresh" onClick={() => { setRefreshing(true); void refreshMessages(); }}>Réessayer</button></div>}

          {!loading && !error && filteredMessages.length === 0 && <div className="pt-message-empty"><span className="pt-message-empty-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><rect x="7" y="11" width="34" height="26" rx="5" /><path d="m9 15 15 12 15-12" /></svg></span><h3>{messages.length ? "Aucune conversation dans ce filtre" : "Votre boîte de réception est vide"}</h3><p>{messages.length ? "Choisissez un autre filtre ou modifiez votre recherche." : "Les demandes envoyées depuis le site apparaîtront ici."}</p></div>}

          {!loading && !error && filteredMessages.length > 0 && <div className={`pt-message-workspace${mobileDetailOpen ? " mobile-detail-open" : ""}`}>
            <nav className="pt-thread-list" aria-label="Conversations clients">
              {filteredMessages.map((message) => {
                const lastReply = message.replies?.[message.replies.length - 1];
                const preview = lastReply?.message ?? message.message;
                const selected = selectedMessage && String(selectedMessage.id) === String(message.id);
                return <button key={message.id} type="button" className={`pt-thread-item${selected ? " selected" : ""}${message.status === "NEW" ? " unread" : ""}`} onClick={() => { setSelectedId(String(message.id)); setMobileDetailOpen(true); }} aria-pressed={Boolean(selected)}>
                  <span className="pt-thread-avatar">{message.name.trim().charAt(0).toLocaleUpperCase() || "?"}</span>
                  <span className="pt-thread-main"><span className="pt-thread-line"><strong>{message.name}</strong><time>{formatDate(message.createdAt)}</time></span><span className="pt-thread-subject">{message.subject}</span><span className="pt-thread-preview">{preview}</span></span>
                  <span className={`pt-thread-indicator ${message.status.toLowerCase()}`} aria-label={STATUS_LABEL[message.status]} />
                </button>;
              })}
            </nav>

            {selectedMessage ? <section className="pt-thread-view" aria-label={`Discussion avec ${selectedMessage.name}`}>
              <header className="pt-thread-header">
                <button type="button" className="pt-thread-back" onClick={() => setMobileDetailOpen(false)}>← Messages</button>
                <span className="pt-thread-avatar large">{selectedMessage.name.trim().charAt(0).toLocaleUpperCase() || "?"}</span>
                <div className="pt-thread-header-info"><strong>{selectedMessage.name}</strong><span>{selectedMessage.email}{selectedMessage.phone ? ` · ${selectedMessage.phone}` : ""}</span></div>
                <Pill tone={STATUS_TONE[selectedMessage.status]}>{STATUS_LABEL[selectedMessage.status]}</Pill>
              </header>
              <div className="pt-thread-subject-bar"><strong>{selectedMessage.subject}</strong><span>Ouverte le {formatDate(selectedMessage.createdAt)}</span></div>
              <div className="pt-thread-history" aria-label="Historique de la discussion">
                <article className="pt-thread-bubble from-client"><p>{selectedMessage.message}</p><small>{selectedMessage.name} · {formatDate(selectedMessage.createdAt)}</small></article>
                {selectedMessage.replies?.map((reply) => <article key={reply.id} className={`pt-thread-bubble ${reply.sender === "ADMIN" ? "from-admin" : "from-client"}`}><p>{reply.message}</p><small>{reply.sender === "ADMIN" ? "MOAYE SERVICE" : selectedMessage.name} · {formatDate(reply.createdAt)}</small></article>)}
              </div>
              {selectedMessage.status !== "RESOLVED" && <form className="pt-admin-reply-form pt-thread-composer" onSubmit={(event) => { event.preventDefault(); void handleReply(selectedMessage); }}>
                <textarea className="inp" rows={2} maxLength={5000} value={replyDrafts[String(selectedMessage.id)] ?? ""} onChange={(event) => setReplyDrafts((current) => ({ ...current, [String(selectedMessage.id)]: event.target.value }))} placeholder={`Écrire à ${selectedMessage.name}…`} aria-label={`Réponse à ${selectedMessage.name}`} />
                <button type="submit" className="btn btn-green" disabled={!replyDrafts[String(selectedMessage.id)]?.trim() || replyingId === String(selectedMessage.id)}>{replyingId === String(selectedMessage.id) ? "Envoi…" : "Envoyer"}</button>
              </form>}
              <footer className="pt-thread-actions">
                <div className="pt-thread-status-control"><span>Statut</span><StatusSelect label={`Statut de la conversation avec ${selectedMessage.name}`} value={selectedMessage.status} options={STATUS_OPTIONS} onChange={(value) => void handleStatusChange(selectedMessage, value)} /></div>
                <div className="pt-thread-buttons">
                  <button type="button" className="pt-message-close" disabled={pendingId === String(selectedMessage.id)} onClick={() => void handleStatusChange(selectedMessage, selectedMessage.status === "RESOLVED" ? "VIEWED" : "RESOLVED")}>{selectedMessage.status === "RESOLVED" ? "Rouvrir" : "Fermer la discussion"}</button>
                  <button type="button" className="pt-message-delete" disabled={deletingId === String(selectedMessage.id)} onClick={() => void handleDelete(selectedMessage)}>{deletingId === String(selectedMessage.id) ? "Suppression…" : "Supprimer"}</button>
                </div>
              </footer>
            </section> : <div className="pt-thread-empty">Sélectionnez une conversation pour afficher son historique.</div>}
          </div>}
        </section>
      </div>
    </RoleGuard>
  );
}
