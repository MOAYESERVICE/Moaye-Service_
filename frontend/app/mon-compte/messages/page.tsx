"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount } from "@/hooks/useAccount";
import { getMyContactMessages, sendAccountContact, sendContactReply, type ContactThread } from "@/lib/api";
import type { ContactData } from "@/lib/validators";

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
}

export default function MessagesPage() {
  const { q, profile, markNotificationRead } = useAccount();
  const [threads, setThreads] = useState<ContactThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [compose, setCompose] = useState(false);
  const [subject, setSubject] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const records = await getMyContactMessages(signal);
      setThreads(records);
      setSelectedId((current) => current && records.some((item) => String(item.id) === String(current)) ? current : records[0]?.id ?? null);
      setError(null);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : "Vos conversations ne sont pas disponibles.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const initialLoad = window.setTimeout(() => void refresh(controller.signal), 0);
    const refreshWhenVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    const timer = window.setInterval(refreshWhenVisible, 15000);
    window.addEventListener("focus", refreshWhenVisible);
    return () => { controller.abort(); window.clearTimeout(initialLoad); window.clearInterval(timer); window.removeEventListener("focus", refreshWhenVisible); };
  }, [refresh]);

  const visibleThreads = useMemo(() => {
    const query = q.trim().toLocaleLowerCase("fr");
    if (!query) return threads;
    return threads.filter((thread) => `${thread.subject} ${thread.message} ${thread.replies.map((reply) => reply.message).join(" ")}`.toLocaleLowerCase("fr").includes(query));
  }, [q, threads]);
  const current = visibleThreads.find((thread) => String(thread.id) === String(selectedId)) ?? visibleThreads[0];

  useEffect(() => {
    if (!current) return;
    current.replies
      .filter((reply) => reply.sender === "ADMIN")
      .forEach((reply) => markNotificationRead(`reply:${current.id}:${reply.id}`));
  }, [current, markNotificationRead]);

  async function submitReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current || !draft.trim()) return;
    setSending(true);
    setNotice("");
    try {
      const updated = await sendContactReply(current.id, draft.trim());
      setThreads((all) => all.map((item) => String(item.id) === String(updated.id) ? updated : item));
      setDraft("");
      setNotice("Votre message a été envoyé à l’administration.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Le message n’a pas pu être envoyé.");
    } finally { setSending(false); }
  }

  async function submitNewConversation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile.name || !profile.email || !subject.trim() || firstMessage.trim().length < 10) {
      setNotice("Vérifiez vos informations de compte et écrivez au moins 10 caractères.");
      return;
    }
    setSending(true);
    setNotice("");
    try {
      const data: ContactData = { name: profile.name, email: profile.email, phone: profile.phone, subject: subject.trim(), message: firstMessage.trim() };
      await sendAccountContact(data);
      await refresh();
      setCompose(false);
      setSubject("");
      setFirstMessage("");
      setNotice("Votre message a été transmis à l’administration.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Le message n’a pas pu être envoyé.");
    } finally { setSending(false); }
  }

  return (
    <div className="pt-client-messages">
      <header className="pt-message-heading">
        <div><span className="pt-message-eyebrow">ASSISTANCE MOAYE SERVICES</span><h2>Mes messages</h2><p>Échangez directement avec l’équipe d’administration.</p></div>
        <button className="btn btn-green" type="button" onClick={() => { setCompose((open) => !open); setNotice(""); }}>{compose ? "Fermer" : "Nouveau message"}</button>
      </header>

      {notice && <p className="pt-client-message-notice" role="status">{notice}</p>}

      {compose && <form className="pt-panel pt-pp pt-client-compose" onSubmit={(event) => void submitNewConversation(event)}>
        <div><h3 className="pt-h3">Écrire à l’administration</h3><p className="pt-muted">Votre nom et votre adresse e-mail seront joints à la demande.</p></div>
        <label>Objet<input className="inp" required minLength={3} maxLength={100} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Ex. Question sur ma commande" /></label>
        <label>Votre message<textarea className="inp" required minLength={10} maxLength={5000} rows={4} value={firstMessage} onChange={(event) => setFirstMessage(event.target.value)} placeholder="Expliquez votre demande…" /></label>
        <button className="btn btn-green" disabled={sending || !profile.name || !profile.email}>{sending ? "Envoi…" : "Envoyer à l’administration"}</button>
      </form>}

      {loading && <div className="pt-panel pt-client-message-state">Chargement de vos conversations…</div>}
      {!loading && error && <div className="pt-message-error" role="alert"><div><strong>Impossible de charger vos messages</strong><p>{error}</p></div><button className="pt-message-refresh" onClick={() => { setLoading(true); void refresh(); }}>Réessayer</button></div>}
      {!loading && !error && threads.length === 0 && !compose && <div className="pt-panel pt-client-message-empty"><span className="pt-message-empty-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><rect x="7" y="11" width="34" height="26" rx="5" /><path d="m9 15 15 12 15-12" /></svg></span><h3>Aucune conversation pour le moment</h3><p>Envoyez un message à l’équipe ; l’administration pourra vous répondre ici.</p><button className="btn btn-green" onClick={() => setCompose(true)}>Écrire un message</button><Link className="pt-link" href="/contact">Voir aussi le formulaire de contact →</Link></div>}

      {!loading && !error && current && <section className="pt-panel pt-client-inbox" aria-label="Vos conversations">
        <aside className="pt-client-thread-list"><h3>Conversations</h3>{visibleThreads.map((thread) => { const last = thread.replies.at(-1)?.message ?? thread.message; return <button key={thread.id} className={`pt-client-thread${String(thread.id) === String(current.id) ? " active" : ""}`} onClick={() => setSelectedId(thread.id)}><strong>{thread.subject}</strong><span>{last}</span><small>{dateLabel(thread.replies.at(-1)?.createdAt ?? thread.createdAt)}</small></button>; })}</aside>
        <div className="pt-client-conversation"><header><div><h3>{current.subject}</h3><p>MOAYE SERVICES · Administration</p></div><span className={`pt-client-status ${current.status.toLowerCase()}`}>{current.status === "RESOLVED" ? "Résolu" : current.status === "VIEWED" ? "En cours" : "Nouveau"}</span></header>
          <div className="pt-client-bubbles"><article className="pt-client-bubble customer"><p>{current.message}</p><small>{dateLabel(current.createdAt)} · Vous</small></article>{current.replies.map((reply) => <article key={reply.id} className={`pt-client-bubble ${reply.sender === "CUSTOMER" ? "customer" : "admin"}`}><p>{reply.message}</p><small>{dateLabel(reply.createdAt)} · {reply.sender === "CUSTOMER" ? "Vous" : "Administration"}</small></article>)}</div>
          <form className="pt-client-reply" aria-label="Répondre à l’administration" onSubmit={(event) => void submitReply(event)}>
            <div className="pt-client-reply-field">
              <label className="sr-only" htmlFor="client-message-reply">Votre réponse</label>
              <textarea
                id="client-message-reply"
                className="inp"
                rows={3}
                maxLength={5000}
                required
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Écrire votre réponse à l’administration…"
              />
              <p className="pt-client-reply-hint" aria-live="polite">
                {draft.trim() ? `${draft.length}/5 000 caractères` : "Saisissez votre message pour activer l’envoi."}
              </p>
            </div>
            <button className="btn btn-green" type="submit" disabled={sending || !draft.trim()} aria-busy={sending}>
              {sending ? "Envoi…" : "Envoyer"}
            </button>
          </form>
        </div>
      </section>}
    </div>
  );
}
