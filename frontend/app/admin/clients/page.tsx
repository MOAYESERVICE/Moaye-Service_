"use client";
import RoleGuard from "@/components/admin/RoleGuard";
import { useAdmin } from "@/hooks/useAdmin";
import { cityOf, fr } from "@/data/demo";
import { live } from "@/lib/stats";
import { fcfa, norm } from "@/lib/format";

export default function AdminClients() {
  const { orders, q } = useAdmin();
  const map: Record<string, { name: string; city?: string; count: number; total: number; last: string }> = {};
  live(orders).forEach((o) => {
    const key = o.clientKey ?? o.client;
    const c = map[key] ?? { name: o.client, city: o.city, count: 0, total: 0, last: "" };
    if (o.city) c.city = o.city;
    c.count++;
    c.total += o.total;
    if (o.iso > c.last) c.last = o.iso;
    map[key] = c;
  });
  const clients = Object.values(map).filter((c) => norm(q) === "" || norm(c.name).includes(norm(q))).sort((a, b) => b.total - a.total);

  return (
    <RoleGuard module="clients">
      <section className="pt-panel" aria-label="Clients">
        <div style={{ overflowX: "auto" }}>
          <table className="pt-tbl pt-responsive-table">
            <thead><tr><th>Client</th><th>Ville</th><th>Commandes</th><th>Total dépensé</th><th>Dernière commande</th></tr></thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.name}>
                  <td data-label="Client">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 38, height: 38, borderRadius: 999, background: "#E3EFE8", color: "#134A3D", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                      <strong>{c.name}</strong>
                    </span>
                  </td>
                  <td data-label="Ville">{c.city || cityOf[c.name] || "—"}</td><td data-label="Commandes">{c.count}</td><td data-label="Total dépensé">{fcfa(c.total)}</td><td data-label="Dernière commande">{fr(c.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {clients.length === 0 && <p className="pt-muted" style={{ padding: 24 }}>Aucun client trouvé.</p>}
      </section>
    </RoleGuard>
  );
}
