"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Kpi from "@/components/portal/Kpi";
import Pill from "@/components/portal/Pill";
import Donut from "@/components/portal/Donut";
import BarChart from "@/components/portal/BarChart";
import Segmented from "@/components/portal/Segmented";
import { ICONS } from "@/components/portal/icons";
import { canAccess } from "@/data/admin";
import { quoteLabelStaff, type QuoteStatus } from "@/data/demo";
import { stockInfo } from "@/data/products";
import { useAdmin } from "@/hooks/useAdmin";
import { ageLabel, countIn, kilo, live, monthsBack, revenueIn } from "@/lib/stats";
import { fcfa } from "@/lib/format";

const STAGES: [QuoteStatus, string][] = [["new", "#B4501A"], ["accepted", "#1B6B57"], ["rejected", "#B4501A"], ["expired", "#C9D8CF"]];

export default function AdminDashboard() {
  const router = useRouter();
  const { role, orders, ordersLoading, ordersError, quotes, quotesLoading, quotesError, products, productsLoading, productsError, refreshProducts, todo } = useAdmin();
  const [period, setPeriod] = useState<6 | 12>(6);
  const [metric, setMetric] = useState<"amount" | "count">("amount");
  const months = monthsBack(period);
  const values = months.map((m) => (metric === "amount" ? revenueIn(orders, m.key) : countIn(orders, m.key)));
  const sum = values.reduce((a, b) => a + b, 0);
  const six = monthsBack(6).map((m) => revenueIn(orders, m.key));
  const prev = monthsBack(6, 6).map((m) => revenueIn(orders, m.key));
  const cur6 = six.reduce((a, b) => a + b, 0);
  const prev6 = prev.reduce((a, b) => a + b, 0);
  const delta = prev6 === 0 ? null : Math.round(((cur6 - prev6) / prev6) * 100);
  const toProcess = orders.filter((o) => o.status === "pending" || o.status === "confirmed");
  const quotesTodo = quotes.filter((x) => x.st === "new");
  const active = new Set(live(orders).filter((o) => o.iso >= monthsBack(6)[0]?.key + "-01").map((o) => o.clientKey ?? o.client));
  const groups = [
    { label: "Livrées", color: "#1B6B57", count: orders.filter((o) => o.status === "delivered").length },
    { label: "En préparation", color: "#F2A93B", count: orders.filter((o) => o.status === "preparing" || o.status === "shipped").length },
    { label: "À traiter", color: "#B4501A", count: toProcess.length },
    { label: "Annulées", color: "#C9D8CF", count: orders.filter((o) => o.status === "cancelled").length },
  ];
  const byProduct: Record<string, number> = {};
  live(orders).forEach((o) => o.items.forEach((i) => { byProduct[i.name] = (byProduct[i.name] || 0) + i.price * i.qty; }));
  const top = Object.entries(byProduct).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topMax = Math.max(...top.map((t) => t[1]), 1);
  const alerts = products.filter((p) => p.stock !== "in");
  const accepted = quotes.filter((x) => x.st === "accepted").length;
  const list = todo.filter((t) => canAccess(role, t.need));
  const date = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const hasDataError = Boolean(ordersError || quotesError);

  return (
    <div className="pt-dashboard">
      <header className="pt-dashboard-heading">
        <div>
          <p className="pt-dashboard-eyebrow">PILOTAGE DE L’ACTIVITÉ</p>
          <h2>Vue d&apos;ensemble</h2>
          <p className="pt-muted">{date} <span aria-hidden="true">·</span> Suivi des commandes, devis et stocks.</p>
        </div>
        <div className="pt-dashboard-actions">
          {canAccess(role, "products") && <button className="btn btn-green" onClick={() => router.push("/admin/produits")}>Gérer les produits</button>}
          {canAccess(role, "orders") && <button className="btn btn-ghost" onClick={() => router.push("/admin/commandes")}>Voir les commandes</button>}
        </div>
      </header>

      {hasDataError && <div className="pt-dashboard-alert" role="status"><strong>Actualisation partielle</strong><span>{ordersError ? `Commandes : ${ordersError}` : `Devis : ${quotesError}`}</span><button className="pt-link" onClick={() => router.push("/connexion")}>Vérifier la session →</button></div>}

      <div className="pt-dashboard-kpis">
        <Kpi label="Valeur des commandes · 6 mois" value={ordersLoading ? "…" : fcfa(cur6)} icon={ICONS.chart} spark={six}
          caption={ordersLoading ? "Chargement des données" : ordersError ? "Données indisponibles" : delta === null ? "Aucune période précédente" : `${delta >= 0 ? "▲ +" : "▼ "}${delta} % vs 6 mois précédents`}
          captionColor={delta !== null && delta < 0 ? "#8A2C0C" : "#134A3D"} />
        <Kpi label="Commandes à traiter" value={ordersLoading ? "…" : String(toProcess.length)} icon={ICONS.orders} caption={`${orders.filter((o) => o.status === "pending").length} en attente de confirmation`} />
        <Kpi label="Devis à traiter" value={quotesLoading ? "…" : String(quotesTodo.length)} icon={ICONS.quotes} caption={quotesError ? "Données indisponibles" : `${quotesTodo.length} nouvelle(s) demande(s)`} />
        <Kpi label="Clients actifs · 6 mois" value={ordersLoading ? "…" : String(active.size)} icon={ICONS.profile} caption="Avec au moins une commande" />
      </div>

      <div className="pt-dashboard-primary">
        <section className="pt-panel pt-pp pt-stack" aria-label="Évolution des ventes">
          <div className="pt-dashboard-card-heading"><div><h3 className="pt-h3">Évolution des ventes</h3><p className="pt-muted">{metric === "amount" ? `Valeur sur la période : ${fcfa(sum)}` : `Commandes sur la période : ${sum}`}</p></div>
            <div className="pt-dashboard-controls"><Segmented label="Indicateur" value={metric} onChange={setMetric} options={[{ id: "amount", label: "Montant" }, { id: "count", label: "Commandes" }]} /><Segmented label="Période" value={period} onChange={setPeriod} options={[{ id: 6, label: "6 mois" }, { id: 12, label: "12 mois" }]} /></div>
          </div>
          {ordersLoading ? <p className="pt-dashboard-empty">Chargement des commandes…</p> : ordersError ? <p className="pt-dashboard-empty">Les statistiques seront visibles lorsque la connexion sera rétablie.</p> : orders.length === 0 ? <p className="pt-dashboard-empty">Aucune commande enregistrée pour cette période.</p> : <BarChart labels={months.map((m) => m.label)} values={values} format={(v) => (metric === "amount" ? kilo(v) : String(v))} axisFormat={(v) => (metric === "amount" ? (v === 0 ? "0" : kilo(v)) : String(Math.round(v * 10) / 10))} />}
          <span className="pt-dashboard-footnote">Montants des commandes non annulées, selon leur date de création.</span>
        </section>

        <section className="pt-panel pt-pp pt-stack pt-dashboard-status" aria-label="Statut des commandes">
          <div><h3 className="pt-h3">Statut des commandes</h3><p className="pt-muted">Toutes périodes confondues</p></div>
          {ordersLoading ? <p className="pt-dashboard-empty">Chargement…</p> : ordersError ? <p className="pt-dashboard-empty">Statistiques indisponibles.</p> : <>
            <Donut segments={groups.map((g) => ({ label: g.label, value: g.count, color: g.color }))} centerTop="Commandes" centerValue={String(orders.length)} aria={`Statut des commandes : ${groups.map((g) => `${g.label} ${g.count}`).join(", ")}`} />
            {orders.length === 0 && <p className="pt-dashboard-empty pt-dashboard-empty-tight">Aucune commande enregistrée.</p>}
            <ul className="pt-legend">{groups.map((g) => <li key={g.label}><span className="pt-dot" style={{ background: g.color }} /><span style={{ flex: "1 1 auto", fontWeight: 500 }}>{g.label}</span><strong>{g.count}</strong></li>)}</ul>
          </>}
        </section>
      </div>

      <div className="pt-dashboard-secondary">
        <section className="pt-panel pt-pp pt-stack" aria-label="Produits les plus vendus">
          <div><h3 className="pt-h3">Produits les plus vendus</h3><p className="pt-muted">Par valeur des commandes</p></div>
          {ordersLoading ? <p className="pt-dashboard-empty">Chargement…</p> : ordersError ? <p className="pt-dashboard-empty">Données indisponibles.</p> : top.length ? top.map(([name, amount]) => <div key={name} className="pt-dashboard-rank"><div><span>{name}</span><strong>{kilo(amount)} FCFA</strong></div><div className="pt-meter"><div style={{ width: `${(amount / topMax) * 100}%`, background: "#1B6B57" }} /></div></div>) : <p className="pt-dashboard-empty">Les ventes apparaîtront ici après les premières commandes.</p>}
        </section>

        <section className="pt-panel pt-pp pt-stack" aria-label="Parcours des devis">
          <div><h3 className="pt-h3">Suivi des devis</h3><p className="pt-muted">Acceptés : {quotes.length ? Math.round((accepted / quotes.length) * 100) : 0} % des demandes</p></div>
          {quotesLoading ? <p className="pt-dashboard-empty">Chargement…</p> : quotesError ? <p className="pt-dashboard-empty">Données indisponibles.</p> : quotes.length ? STAGES.map(([s, color]) => { const n = quotes.filter((x) => x.st === s).length; return <div key={s} className="pt-dashboard-rank"><div><span>{quoteLabelStaff[s]}</span><strong>{n}</strong></div><div className="pt-meter"><div style={{ width: `${(n / quotes.length) * 100}%`, background: color }} /></div></div>; }) : <p className="pt-dashboard-empty">Aucune demande de devis enregistrée.</p>}
          {canAccess(role, "quotes") && <button className="pt-link" style={{ alignSelf: "flex-start" }} onClick={() => router.push("/admin/devis")}>Gérer les devis →</button>}
        </section>

        <section className="pt-panel pt-pp pt-stack" aria-label="Alertes de stock">
          <div className="pt-dashboard-card-heading"><div><h3 className="pt-h3">Alertes de stock</h3><p className="pt-muted">Produits à vérifier</p></div><span className="pt-dashboard-count">{productsLoading ? "…" : alerts.length}</span></div>
          {productsLoading ? <p className="pt-dashboard-empty">Chargement du catalogue…</p> : productsError ? <div className="pt-dashboard-empty"><p>{productsError}</p><button className="pt-link" onClick={refreshProducts}>Réessayer</button></div> : alerts.length ? alerts.slice(0, 5).map((p) => <div key={p.id} className="pt-dashboard-stock"><div><strong>{p.name}</strong><Pill tone={p.stock === "out" ? "out" : "pr"}>{stockInfo[p.stock].label}</Pill></div>{canAccess(role, "products") && <button className="btn btn-ghost btn-sm" onClick={() => router.push("/admin/produits")}>Voir</button>}</div>) : <p className="pt-dashboard-empty">Aucun produit en alerte.</p>}
        </section>
      </div>

      <section className="pt-panel pt-dashboard-todo" aria-label="À traiter">
        <div className="pt-dashboard-todo-heading"><div><h3 className="pt-h3">À traiter</h3><p className="pt-muted">Les demandes qui nécessitent une action</p></div><span className="pt-dashboard-count">{list.length}</span></div>
        <div style={{ overflowX: "auto" }}><table className="pt-tbl"><thead><tr><th>Type</th><th>Élément</th><th>Client</th><th>Ancienneté</th><th /></tr></thead><tbody>
          {list.map((t) => <tr key={t.id}><td data-label="Type"><Pill tone={t.type === "Commande" ? "pr" : t.type === "Devis" ? "n" : "out"}>{t.type}</Pill></td><td data-label="Élément"><strong>{t.label}</strong></td><td data-label="Client">{t.client}</td><td data-label="Ancienneté">{ageLabel(t.iso)}</td><td data-label="Action" style={{ textAlign: "right" }}><button className="btn btn-ghost btn-sm" onClick={() => router.push(t.href)}>Ouvrir</button></td></tr>)}
        </tbody></table></div>
        {list.length === 0 && <p className="pt-dashboard-empty">Aucune tâche en attente.</p>}
      </section>
    </div>
  );
}
