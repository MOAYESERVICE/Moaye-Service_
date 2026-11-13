"use client";
import Link from "next/link";
import Pill from "@/components/portal/Pill";
import { useAccount } from "@/hooks/useAccount";
import { quoteLabelClient, quoteToneClient, type QuoteStatus } from "@/data/demo";
import { norm } from "@/lib/format";

const STAGES: QuoteStatus[] = ["new", "progress", "sent", "accepted"];

export default function QuotesView() {
  const { quotes, q } = useAccount();
  const list = quotes.filter((x) => norm(q) === "" || norm(x.subject + " " + x.id).includes(norm(q)));

  return (
    <div className="pt-stack" style={{ gap: 22 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <p className="pt-muted" style={{ fontSize: 16, maxWidth: 620 }}>Suivez l&apos;avancement de vos demandes : chaque devis passe de l&apos;envoi à l&apos;étude, puis à la proposition et à votre réponse.</p>
        <Link className="btn btn-amber" href="/devis">Nouvelle demande</Link>
      </div>
      <div className="pt-quotes">
        {STAGES.map((s) => {
          const items = list.filter((x) => x.st === s);
          return (
            <section key={s} className="pt-panel pt-pp pt-col" aria-label={quoteLabelClient[s]}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Pill tone={quoteToneClient[s]}>{quoteLabelClient[s]}</Pill><strong>{items.length}</strong>
              </div>
              {items.map((x) => (
                <article key={x.id} className="pt-panel pt-card">
                  <strong style={{ lineHeight: 1.3 }}>{x.subject}</strong>
                  <span style={{ fontSize: 14, color: "#5B726B" }}>{x.id} · envoyé le {x.date}</span>
                  <Link className="pt-link" href="/devis" style={{ minHeight: 36 }}>Voir la demande →</Link>
                </article>
              ))}
              {items.length === 0 && <span className="pt-muted" style={{ fontSize: 15 }}>Aucun devis à cette étape.</span>}
            </section>
          );
        })}
      </div>
    </div>
  );
}