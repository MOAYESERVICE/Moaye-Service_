"use client";
import { useCallback, useEffect, useState } from "react";
import RoleGuard from "@/components/admin/RoleGuard";
import StatusSelect from "@/components/admin/StatusSelect";
import Pill from "@/components/portal/Pill";
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

const STAGES = ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"] as const;

const OPTIONS = [
  { id: "PENDING", label: "En attente" },
  { id: "ACCEPTED", label: "Accepté" },
  { id: "REJECTED", label: "Rejeté" },
  { id: "EXPIRED", label: "Expiré" },
];

const STATUS_TONE: Record<string, "in" | "pr" | "out" | "n"> = {
  PENDING: "out",
  ACCEPTED: "in",
  REJECTED: "pr",
  EXPIRED: "pr",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Accepté",
  REJECTED: "Rejeté",
  EXPIRED: "Expiré",
};

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
    const initialLoad = window.setTimeout(() => {
      void refreshQuotes(controller.signal);
    }, 0);
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
      setQuotes((prev) =>
        prev.map((quote) =>
          quote.id === id ? { ...quote, status: newStatus as Quote["status"] } : quote,
        ),
      );
      flash("Statut mis à jour.");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    }
  };

  const list = quotes.filter(
    (quote) =>
      norm(q) === "" || norm(`${quote.title} ${quote.description}`).includes(norm(q)),
  );

  return (
    <RoleGuard module="quotes">
      <div className="pt-quotes">
        {loading && <div className="pt-muted">Chargement des devis...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}

        {!loading && !error && STAGES.map((status) => {
          const items = list.filter((quote) => quote.status === status);
          return (
            <section
              key={status}
              className="pt-panel pt-pp pt-col"
              aria-label={STATUS_LABEL[status]}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Pill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>
                <strong>{items.length}</strong>
              </div>

              {items.map((quote) => (
                <article key={quote.id} className="pt-panel pt-card">
                  <strong style={{ lineHeight: 1.3 }}>{quote.title}</strong>
                  <span style={{ fontSize: 13.5, color: "#5B726B" }}>
                    {quote.id} · Montant du devis : {quote.price ? `${quote.price.toLocaleString("fr-FR")} FCFA` : "À établir"}
                  </span>
                  {(quote.contactName || quote.contactEmail || quote.contactPhone || quote.location || quote.budgetRange) && (
                    <div style={{ fontSize: 13.5, color: "#355B50", lineHeight: 1.6 }}>
                      {quote.contactName && <div>Demandeur : {quote.contactName}</div>}
                      {quote.contactEmail && <div>E-mail : <a href={`mailto:${quote.contactEmail}`}>{quote.contactEmail}</a></div>}
                      {quote.contactPhone && <div>Téléphone : <a href={`tel:${quote.contactPhone}`}>{quote.contactPhone}</a></div>}
                      {quote.location && <div>Localisation : {quote.location}</div>}
                      {quote.budgetRange && <div>Budget annoncé : {quote.budgetRange}</div>}
                    </div>
                  )}
                  <p style={{ margin: "8px 0 0 0", fontSize: 14 }}>
                    {quote.description}
                  </p>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#999",
                      marginTop: "8px",
                      display: "block",
                    }}
                  >
                    Créé le: {new Date(quote.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <StatusSelect
                    label={`Statut du devis ${quote.id}`}
                    value={quote.status}
                    options={OPTIONS}
                    onChange={(v) => handleStatusChange(quote.id, v)}
                  />
                </article>
              ))}

              {items.length === 0 && (
                <span className="pt-muted" style={{ fontSize: 15 }}>
                  Aucun devis à cette étape.
                </span>
              )}
            </section>
          );
        })}
      </div>
    </RoleGuard>
  );
}
