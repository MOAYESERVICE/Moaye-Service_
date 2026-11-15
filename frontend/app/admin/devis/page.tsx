"use client";
import { useCallback, useEffect, useState } from "react";
import RoleGuard from "@/components/admin/RoleGuard";
import StatusSelect from "@/components/admin/StatusSelect";
import { useAdmin } from "@/hooks/useAdmin";
import { getQuotes, updateQuoteStatus } from "@/lib/api";
import { norm } from "@/lib/format";

type Quote = {
  id: string;
  title: string;
  description: string;
  price?: number | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  location?: string | null;
  budgetRange?: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  userId?: number | null;
  createdAt: string;
};

const STAGES = [
  { id: "PENDING", label: "En attente", hint: "À examiner", tone: "pending" },
  { id: "ACCEPTED", label: "Acceptés", hint: "Demandes validées", tone: "accepted" },
  { id: "REJECTED", label: "Rejetés", hint: "Demandes refusées", tone: "rejected" },
  { id: "EXPIRED", label: "Expirés", hint: "Sans suite", tone: "expired" },
] as const;

const OPTIONS = [
  { id: "PENDING", label: "En attente" },
  { id: "ACCEPTED", label: "Accepté" },
  { id: "REJECTED", label: "Rejeté" },
  { id: "EXPIRED", label: "Expiré" },
] as const;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date inconnue" : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default function AdminDevis() {
  const { q, flash } = useAdmin();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshQuotes = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await getQuotes(signal);
      setQuotes(data || []);
      setError(null);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const initialLoad = window.setTimeout(() => { void refreshQuotes(controller.signal); }, 0);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshQuotes();
    };
    const timer = window.setInterval(refreshWhenVisible, 15000);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      controller.abort();
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [refreshQuotes]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateQuoteStatus(id, newStatus);
      setQuotes((previous) => previous.map((quote) => quote.id === id ? { ...quote, status: newStatus as Quote["status"] } : quote));
      flash("Statut mis à jour.");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    }
  };

  const list = quotes.filter((quote) =>
    norm(q) === "" || norm(`${quote.title} ${quote.description} ${quote.contactName ?? ""} ${quote.location ?? ""}`).includes(norm(q)),
  );

  return (
    <RoleGuard module="quotes">
      <main className="pt-quote-page">
        <header className="pt-quote-heading">
          <div>
            <span className="pt-quote-eyebrow">RELATION CLIENT</span>
            <h2>Suivi des devis</h2>
            <p>Centralisez les demandes et mettez à jour leur statut au fil du traitement.</p>
          </div>
          <div className="pt-quote-total"><strong>{loading ? "—" : quotes.length}</strong><span>demande{quotes.length > 1 ? "s" : ""} au total</span></div>
        </header>

        <section className="pt-quote-stats" aria-label="Résumé des devis">
          {STAGES.map((stage) => {
            const count = quotes.filter((quote) => quote.status === stage.id).length;
            return <article key={stage.id} className={`pt-quote-stat ${stage.tone}`}>
              <div><span>{stage.label}</span><strong>{loading ? "—" : count}</strong></div>
              <small>{stage.hint}</small>
            </article>;
          })}
        </section>

        {loading && <div className="pt-panel pt-quote-state" role="status">Chargement des demandes…</div>}
        {error && <div className="pt-panel pt-quote-state error" role="alert"><strong>Impossible de charger les devis</strong><span>{error}</span><button className="btn btn-ghost btn-sm" onClick={() => { setLoading(true); void refreshQuotes(); }}>Réessayer</button></div>}

        {!loading && !error && <section className="pt-panel pt-quote-list">
          <div className="pt-quote-list-heading"><div><h3>Demandes reçues</h3><p>{list.length} résultat{list.length > 1 ? "s" : ""}{q ? ` pour « ${q} »` : ""}</p></div><span className="pt-quote-live"><i /> Mise à jour automatique</span></div>
          {list.length ? <div className="pt-quote-table-wrap">
            <table className="pt-quote-table">
              <thead><tr><th>Demande</th><th>Client</th><th>Projet</th><th>Reçue le</th><th>Statut</th></tr></thead>
              <tbody>{list.map((quote) => <tr key={quote.id}>
                <td data-label="Demande"><div className="pt-quote-request"><strong>{quote.title}</strong><span className="pt-quote-id">Réf. {quote.id}</span><p>{quote.description}</p></div></td>
                <td data-label="Client"><div className="pt-quote-client"><strong>{quote.contactName || "Client"}</strong>{quote.contactEmail && <a href={`mailto:${quote.contactEmail}`}>{quote.contactEmail}</a>}{quote.contactPhone && <a href={`tel:${quote.contactPhone}`}>{quote.contactPhone}</a>}</div></td>
                <td data-label="Projet"><div className="pt-quote-project">{quote.location && <span>{quote.location}</span>}{quote.budgetRange && <span>Budget : {quote.budgetRange}</span>}<strong>{quote.price ? `${quote.price.toLocaleString("fr-FR")} FCFA` : "Montant à établir"}</strong></div></td>
                <td data-label="Reçue le"><span className="pt-quote-date">{formatDate(quote.createdAt)}</span></td>
                <td data-label="Statut"><div className={`pt-quote-status ${quote.status.toLowerCase()}`}><StatusSelect label={`Statut du devis ${quote.id}`} value={quote.status} options={[...OPTIONS]} onChange={(value) => void handleStatusChange(quote.id, value)} /></div></td>
              </tr>)}</tbody>
            </table>
          </div> : <div className="pt-quote-empty"><span aria-hidden="true">✓</span><strong>{q ? "Aucun résultat" : "Aucune demande pour le moment"}</strong><p>{q ? "Essaie un autre terme de recherche." : "Les nouveaux devis apparaîtront ici dès leur réception."}</p></div>}
        </section>}
      </main>
    </RoleGuard>
  );
}
