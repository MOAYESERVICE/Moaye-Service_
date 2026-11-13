"use client";
import { useEffect, useState } from "react";
import RoleGuard from "@/components/admin/RoleGuard";
import StatusSelect from "@/components/admin/StatusSelect";
import Pill from "@/components/portal/Pill";
import { getAllOrders, updateOrderStatus } from "@/lib/api";
import { fcfa, norm } from "@/lib/format";
import { useRouter } from "next/navigation";

const FILTERS = [
  ["all", "Toutes"],
  ["pending", "En attente"],
  ["confirmed", "Confirmées"],
  ["processing", "En préparation"],
  ["shipped", "Expédiées"],
  ["delivered", "Livrées"],
  ["cancelled", "Annulées"],
] as const;

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const statusTones: Record<string, "in" | "pr" | "out" | "n"> = {
  PENDING: "out",
  CONFIRMED: "in",
  PROCESSING: "in",
  SHIPPED: "pr",
  DELIVERED: "in",
  CANCELLED: "out",
};

const OPTIONS = (Object.keys(statusLabels) as string[]).map((id) => ({
  id,
  label: statusLabels[id],
}));

interface Order {
  id: number;
  status: string;
  totalPrice: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      price: number;
    };
  }>;
}

export default function AdminCommandes() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sel, setSel] = useState<number | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: number, newStatus: string) {
    try {
      await updateOrderStatus(id, newStatus);
      // Mettre à jour localement
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du statut");
    }
  }

  const match = (o: Order, f: string): boolean => {
    if (f === "all") return true;
    return o.status.toUpperCase() === f.toUpperCase();
  };

  const list = orders.filter(
    (o) =>
      match(o, filter) &&
      (norm(q) === "" ||
        norm(o.id + " " + o.user.name + " " + o.user.email).includes(norm(q)))
  );

  const detail = list.find((o) => o.id === sel) ?? list[0];

  return (
    <RoleGuard module="orders">
      <div className="pt-tabs" role="group" aria-label="Filtrer par statut">
        {FILTERS.map(([id, label]) => (
          <button
            key={id}
            className={filter === id ? "pt-tab on" : "pt-tab"}
            aria-pressed={filter === id}
            onClick={() => {
              setFilter(id);
              setSel(null);
            }}
          >
            {label} <span>{orders.filter((o) => match(o, id)).length}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <h3 style={{ fontSize: 20 }}>Chargement...</h3>
        </div>
      )}

      {error && (
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <h3 style={{ fontSize: 20, color: "red" }}>Erreur: {error}</h3>
        </div>
      )}

      {!loading && !error && (
        <div className="pt-flex top">
          <section
            className="pt-panel"
            style={{ flex: "1.5 1 560px", minWidth: 0 }}
            aria-label="Commandes"
          >
            {list.length === 0 && (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <h3 style={{ fontSize: 20 }}>Aucune commande trouvée</h3>
              </div>
            )}
            <div style={{ overflowX: "auto" }}>
              <table className="pt-tbl pt-responsive-table">
                <thead>
                  <tr>
                    <th>Commande</th>
                    <th>Client</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((o) => (
                    <tr
                      key={o.id}
                      className={detail?.id === o.id ? "pick sel" : "pick"}
                      onClick={() => setSel(o.id)}
                    >
                      <td data-label="Commande">
                        <strong>#{o.id}</strong>
                      </td>
                      <td data-label="Client">{o.user.name}</td>
                      <td data-label="E-mail">{o.user.email}</td>
                      <td data-label="Date">
                        {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td data-label="Total">{fcfa(o.totalPrice)}</td>
                      <td data-label="Statut" onClick={(e) => e.stopPropagation()}>
                        <StatusSelect
                          label="Statut de la commande"
                          value={o.status}
                          options={OPTIONS}
                          onChange={(s) => handleStatusChange(o.id, s)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {detail && (
            <aside
              className="pt-panel pt-pp pt-stack"
              style={{ flex: "1 1 320px", minWidth: 0, gap: 18 }}
              aria-label="Détail de la commande"
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <h3 style={{ fontSize: 22, fontWeight: 700 }}>#{detail.id}</h3>
                <Pill tone={statusTones[detail.status] as "in" | "pr" | "out" | "n"}>
                  {statusLabels[detail.status] || detail.status}
                </Pill>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <strong>{detail.user.name}</strong>
                <span className="pt-muted" style={{ fontSize: 15 }}>
                  {detail.user.email} · Commande du{" "}
                  {new Date(detail.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div>
                {detail.items.map((i) => (
                  <div key={i.id} className="pt-row">
                    <span
                      style={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <strong style={{ fontSize: 15.5 }}>{i.product.name}</strong>
                      <span style={{ fontSize: 13.5, color: "#5B726B" }}>
                        {i.quantity} × {fcfa(i.price)}
                      </span>
                    </span>
                    <strong>{fcfa(i.price * i.quantity)}</strong>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    paddingTop: 16,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Total</span>
                  <span className="pt-big" style={{ fontSize: 26 }}>
                    {fcfa(detail.totalPrice)}
                  </span>
                </div>
              </div>
              <div>
                <button
                  className="btn btn-green"
                  onClick={() => router.push("/admin/messages")}
                >
                  Contacter le client
                </button>
              </div>
            </aside>
          )}
        </div>
      )}
    </RoleGuard>
  );
}
