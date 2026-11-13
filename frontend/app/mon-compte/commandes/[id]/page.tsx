"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import Pill from "@/components/portal/Pill";
import OrderTracker from "@/components/account/OrderTracker";
import { useAccount } from "@/hooks/useAccount";
import { orderLabel, orderTone } from "@/data/demo";
import { fcfa } from "@/lib/format";

export default function CommandeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { orders } = useAccount();
  const order = orders.find((item) => item.id === id);

  if (!order) {
    return (
      <section className="pt-panel pt-pp pt-stack">
        <h2 className="pt-h3">Commande introuvable</h2>
        <p className="pt-muted">Cette commande n’existe pas dans votre espace.</p>
        <Link className="btn btn-ghost" href="/mon-compte/commandes">Retour à mes commandes</Link>
      </section>
    );
  }

  return (
    <div className="pt-stack">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 className="pt-h3">{order.id}</h2>
          <p className="pt-muted" style={{ marginTop: 4 }}>Commande passée le {order.date}</p>
        </div>
        <Pill tone={orderTone[order.status]}>{orderLabel[order.status]}</Pill>
      </div>

      <section className="pt-panel pt-pp pt-stack" aria-label="Suivi de commande">
        <h3 className="pt-h3">Suivi de livraison</h3>
        <OrderTracker order={order} />
      </section>

      <section className="pt-panel pt-pp pt-stack" aria-label="Articles commandés">
        <h3 className="pt-h3">Articles commandés</h3>
        {order.items.map((item) => (
          <div key={item.name} className="pt-row">
            <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <strong>{item.name}</strong>
              <span className="pt-muted" style={{ fontSize: 14 }}>{item.cat} · {item.qty} × {fcfa(item.price)}</span>
            </span>
            <strong>{fcfa(item.price * item.qty)}</strong>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingTop: 8 }}>
          <strong>Total</strong><strong>{fcfa(order.total)}</strong>
        </div>
      </section>
      <Link className="pt-link" href="/mon-compte/commandes">← Retour à mes commandes</Link>
    </div>
  );
}