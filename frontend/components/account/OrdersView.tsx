"use client";
import { useState } from "react";
import Link from "next/link";
import Pill from "@/components/portal/Pill";
import { useAccount } from "@/hooks/useAccount";
import { orderLabel, orderTone, type DemoOrder } from "@/data/demo";
import { fcfa, norm } from "@/lib/format";

const FILTERS = [
  ["all", "Toutes"],
  ["active", "En cours"],
  ["delivered", "Livrées"],
  ["cancelled", "Annulées"],
] as const;

function matches(order: DemoOrder, filter: (typeof FILTERS)[number][0]) {
  if (filter === "all") return true;
  if (filter === "active") return ["pending", "confirmed", "preparing"].includes(order.status);
  return order.status === filter;
}

export default function OrdersView() {
  const { orders, q } = useAccount();
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const query = norm(q);
  const list = orders
    .filter((order) => matches(order, filter))
    .filter((order) => query === "" || norm(`${order.id} ${order.items.map((item) => item.name).join(" ")}`).includes(query))
    .sort((a, b) => b.iso.localeCompare(a.iso));

  return (
    <div className="pt-stack">
      <div className="pt-tabs" role="group" aria-label="Filtrer les commandes">
        {FILTERS.map(([id, label]) => (
          <button key={id} className={filter === id ? "pt-tab on" : "pt-tab"} aria-pressed={filter === id} onClick={() => setFilter(id)}>
            {label} <span>{orders.filter((order) => matches(order, id)).length}</span>
          </button>
        ))}
      </div>

      <section className="pt-panel" aria-label="Mes commandes">
        {list.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Aucune commande trouvée</h2>
            <p className="pt-muted" style={{ marginTop: 8 }}>Modifiez le filtre ou votre recherche.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="pt-tbl pt-responsive-table">
              <thead><tr><th>Commande</th><th>Date</th><th>Articles</th><th>Total</th><th>Statut</th><th /></tr></thead>
              <tbody>
                {list.map((order) => (
                  <tr key={order.id}>
                    <td data-label="Commande"><strong>{order.id}</strong></td>
                    <td data-label="Date">{order.date}</td>
                    <td data-label="Articles">{order.items.length}</td>
                    <td data-label="Total">{fcfa(order.total)}</td>
                    <td data-label="Statut"><Pill tone={orderTone[order.status]}>{orderLabel[order.status]}</Pill></td>
                    <td data-label="Détail" style={{ textAlign: "right" }}>
                      <Link className="pt-link" href={`/mon-compte/commandes/${order.id}`}>Détails</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
