"use client";
import { useState } from "react";
import Link from "next/link";
import Kpi from "@/components/portal/Kpi";
import Pill from "@/components/portal/Pill";
import Donut from "@/components/portal/Donut";
import BarChart from "@/components/portal/BarChart";
import Segmented from "@/components/portal/Segmented";
import { ICONS } from "@/components/portal/icons";
import OrderTracker from "./OrderTracker";
import { useAccount } from "@/hooks/useAccount";
import { orderLabel, orderTone, quoteLabelClient, type QuoteStatus } from "@/data/demo";
import { byCategory, CAT_COLORS, countIn, kilo, monthsBack, revenueIn } from "@/lib/stats";
import { fcfa } from "@/lib/format";

const QUOTE_STAGES: QuoteStatus[] = ["new", "accepted", "rejected", "expired"];
const QUOTE_COLORS: Record<QuoteStatus, string> = { new: "#F2A93B", progress: "#8FB09F", sent: "#F2A93B", accepted: "#1B6B57", rejected: "#B4501A", expired: "#C9D8CF" };

export default function DashboardView() {
  const { orders, ordersLoading, ordersError, quotes, quotesLoading, quotesError, profile } = useAccount();
  const [period, setPeriod] = useState<6 | 12>(6);
  const [metric, setMetric] = useState<"amount" | "count">("amount");
  const months = monthsBack(period);
  const values = months.map((m) => (metric === "amount" ? revenueIn(orders, m.key) : countIn(orders, m.key)));
  const sum = values.reduce((a, b) => a + b, 0);
  const six = monthsBack(6).map((m) => revenueIn(orders, m.key));
  const cats = byCategory(orders);
  const catTotal = cats.reduce((a, c) => a + c.value, 0);
  const inProgress = orders.filter((o) => ["pending", "confirmed", "preparing", "shipped"].includes(o.status));
  const current = inProgress[0];
  const waiting = quotes.filter((x) => x.st === "new").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const date = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const feed = [
    ...orders.map((o) => ({ id: `order:${o.id}`, iso: o.iso, text: `Commande ${o.id} : ${orderLabel[o.status].toLowerCase()}.`, color: "#1B6B57" })),
    ...quotes.map((x) => ({ id: `quote:${x.id}`, iso: x.iso, text: `Demande « ${x.subject} » : ${quoteLabelClient[x.st].toLowerCase()}.`, color: "#F2A93B" })),
  ].sort((a, b) => b.iso.localeCompare(a.iso)).slice(0, 4);
  const recentOrders = [...orders].sort((a, b) => b.iso.localeCompare(a.iso)).slice(0, 4);
  const hasLoadError = Boolean(ordersError || quotesError);

  return (
    <div className="pt-dashboard">
      <header className="pt-dashboard-heading">
        <div>
          <p className="pt-dashboard-eyebrow">VOTRE ESPACE CLIENT</p>
          <h2>Bonjour{profile.name ? ` ${profile.name.split(" ")[0]}` : ""}</h2>
          <p className="pt-muted">{date} <span aria-hidden="true">·</span> Retrouvez vos commandes et demandes en un coup d&apos;œil.</p>
        </div>
        <div className="pt-dashboard-actions"><Link className="btn btn-green" href="/produits">Nouvelle commande</Link><Link className="btn btn-ghost" href="/assistant">Poser une question</Link></div>
      </header>

      {hasLoadError && <div className="pt-dashboard-alert" role="status"><strong>Chargement partiel</strong><span>{ordersError ? `Commandes : ${ordersError}` : `Devis : ${quotesError}`}</span><Link className="pt-link" href="/connexion">Vérifier la session →</Link></div>}

      <div className="pt-dashboard-kpis">
        <Kpi label="Valeur commandée · 6 mois" value={ordersLoading ? "…" : fcfa(six.reduce((a, b) => a + b, 0))} icon={ICONS.chart} spark={six} caption={ordersLoading ? "Chargement des données" : ordersError ? "Données indisponibles" : "Commandes non annulées"} />
        <Kpi label="Commandes en cours" value={ordersLoading ? "…" : String(inProgress.length)} icon={ICONS.orders} caption={current ? `${current.id} · ${orderLabel[current.status].toLowerCase()}` : "Aucune commande en cours"} />
        <Kpi label="Devis en attente" value={quotesLoading ? "…" : String(waiting)} icon={ICONS.quotes} caption={quotesError ? "Données indisponibles" : "Réponse de l’équipe attendue"} />
        <Kpi label="Commandes livrées" value={ordersLoading ? "…" : String(delivered)} icon={ICONS.profile} caption="Depuis la création du compte" />
      </div>

      <div className="pt-dashboard-primary">
        <section className="pt-panel pt-pp pt-stack" aria-label="Évolution des achats">
          <div className="pt-dashboard-card-heading"><div><h3 className="pt-h3">Évolution des achats</h3><p className="pt-muted">{metric === "amount" ? `Montant sur la période : ${fcfa(sum)}` : `Commandes sur la période : ${sum}`}</p></div>
            <div className="pt-dashboard-controls"><Segmented label="Indicateur" value={metric} onChange={setMetric} options={[{ id: "amount", label: "Montant" }, { id: "count", label: "Commandes" }]} /><Segmented label="Période" value={period} onChange={setPeriod} options={[{ id: 6, label: "6 mois" }, { id: 12, label: "12 mois" }]} /></div>
          </div>
          {ordersLoading ? <p className="pt-dashboard-empty">Chargement de vos commandes…</p> : ordersError ? <p className="pt-dashboard-empty">Vos statistiques apparaîtront dès que la connexion sera rétablie.</p> : orders.length ? <BarChart labels={months.map((m) => m.label)} values={values} format={(v) => (metric === "amount" ? kilo(v) : String(v))} axisFormat={(v) => (metric === "amount" ? (v === 0 ? "0" : kilo(v)) : String(Math.round(v * 10) / 10))} /> : <p className="pt-dashboard-empty">Aucune commande enregistrée pour le moment. Votre historique apparaîtra ici après votre premier achat.</p>}
          <span className="pt-dashboard-footnote">Montants de vos commandes non annulées, selon leur date de création.</span>
        </section>

        <section className="pt-panel pt-pp pt-stack pt-dashboard-status" aria-label="Répartition des achats">
          <div><h3 className="pt-h3">Répartition des achats</h3><p className="pt-muted">Par catégorie de produits</p></div>
          {ordersLoading ? <p className="pt-dashboard-empty">Chargement…</p> : ordersError ? <p className="pt-dashboard-empty">Données indisponibles.</p> : cats.length ? <>
            <Donut segments={cats.map((c, i) => ({ ...c, color: CAT_COLORS[i % CAT_COLORS.length] }))} centerTop="Total" centerValue={kilo(catTotal)} aria={`Répartition des achats : ${cats.map((c) => `${c.label} ${Math.round((c.value / catTotal) * 100)} %`).join(", ")}`} />
            <ul className="pt-legend">{cats.map((c, i) => <li key={c.label}><span className="pt-dot" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} /><span style={{ flex: "1 1 auto", fontWeight: 500 }}>{c.label}</span><span style={{ color: "#5B726B", fontSize: 14.5 }}>{Math.round((c.value / catTotal) * 100)} %</span><strong style={{ minWidth: 76, textAlign: "right" }}>{kilo(c.value)}</strong></li>)}</ul>
          </> : <p className="pt-dashboard-empty">La répartition s’affichera après votre premier achat.</p>}
        </section>
      </div>

      <div className="pt-dashboard-secondary">
        {current ? <section className="pt-panel pt-pp pt-stack" aria-label="Suivi de commande">
          <div className="pt-dashboard-card-heading"><div><h3 className="pt-h3">Commande en cours</h3><p className="pt-muted">{current.id} · passée le {current.date}</p></div><Pill tone={orderTone[current.status]}>{orderLabel[current.status]}</Pill></div>
          <p className="pt-muted">{current.items.map((i) => `${i.qty} × ${i.name}`).join(" · ")}</p>
          <OrderTracker order={current} />
          <Link className="pt-link" href={`/mon-compte/commandes/${current.id}`}>Consulter le suivi →</Link>
        </section> : <section className="pt-panel pt-pp pt-stack" aria-label="Suivi de commande"><h3 className="pt-h3">Suivi de commande</h3><p className="pt-dashboard-empty">{ordersLoading ? "Chargement de vos commandes…" : ordersError ? "Votre suivi n’est pas disponible actuellement." : "Aucune commande en cours."}</p><Link className="btn btn-green" href="/produits">Découvrir la boutique</Link></section>}

        <section className="pt-panel pt-pp pt-stack" aria-label="Mes devis">
          <div className="pt-dashboard-card-heading"><div><h3 className="pt-h3">Mes demandes de devis</h3><p className="pt-muted">État de vos demandes</p></div><Link className="pt-link" href="/mon-compte/devis">Tout voir</Link></div>
          {quotesLoading ? <p className="pt-dashboard-empty">Chargement de vos devis…</p> : quotesError ? <p className="pt-dashboard-empty">Vos devis ne sont pas disponibles actuellement.</p> : quotes.length ? QUOTE_STAGES.map((s) => { const n = quotes.filter((x) => x.st === s).length; return <div key={s} className="pt-dashboard-rank"><div><span>{quoteLabelClient[s]}</span><strong>{n}</strong></div><div className="pt-meter"><div style={{ width: `${(n / quotes.length) * 100}%`, background: QUOTE_COLORS[s] }} /></div></div>; }) : <p className="pt-dashboard-empty">Vous n’avez pas encore envoyé de demande.</p>}
          <Link className="btn btn-amber" href="/devis" style={{ marginTop: "auto" }}>Demander un devis</Link>
        </section>

        <section className="pt-panel pt-pp pt-stack" aria-label="Activité récente">
          <div className="pt-dashboard-card-heading"><div><h3 className="pt-h3">Activité récente</h3><p className="pt-muted">Dernières mises à jour de votre compte</p></div><span className="pt-dashboard-count">{feed.length}</span></div>
          {ordersLoading && quotesLoading ? <p className="pt-dashboard-empty">Chargement…</p> : hasLoadError && feed.length === 0 ? <p className="pt-dashboard-empty">L’activité n’est pas disponible actuellement.</p> : feed.length ? <ul className="pt-client-feed">{feed.map((item) => <li key={item.id}><span style={{ background: item.color }} /><div><strong>{item.text}</strong><small>{new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${item.iso}T12:00:00`))}</small></div></li>)}</ul> : <p className="pt-dashboard-empty">Vos nouvelles commandes et demandes apparaîtront ici.</p>}
        </section>
      </div>

      <section className="pt-panel pt-dashboard-todo" aria-label="Dernières commandes">
        <div className="pt-dashboard-todo-heading"><div><h3 className="pt-h3">Dernières commandes</h3><p className="pt-muted">Consultez le statut et le détail de vos achats</p></div><Link className="pt-link" href="/mon-compte/commandes">Toutes mes commandes →</Link></div>
        <div style={{ overflowX: "auto" }}><table className="pt-tbl pt-client-dashboard-orders"><thead><tr><th>Commande</th><th>Date</th><th>Articles</th><th>Total</th><th>Statut</th><th /></tr></thead><tbody>
          {recentOrders.map((order) => <tr key={order.id}><td data-label="Commande"><strong>{order.id}</strong></td><td data-label="Date">{order.date}</td><td data-label="Articles">{order.items.reduce((n, item) => n + item.qty, 0)}</td><td data-label="Total">{fcfa(order.total)}</td><td data-label="Statut"><Pill tone={orderTone[order.status]}>{orderLabel[order.status]}</Pill></td><td data-label="Détail" style={{ textAlign: "right" }}><Link className="btn btn-ghost btn-sm" href={`/mon-compte/commandes/${order.id}`}>Détail</Link></td></tr>)}
        </tbody></table></div>
        {ordersLoading ? <p className="pt-dashboard-empty">Chargement de vos commandes…</p> : ordersError ? <p className="pt-dashboard-empty">Vos commandes ne sont pas disponibles actuellement.</p> : recentOrders.length === 0 && <p className="pt-dashboard-empty">Aucune commande pour le moment.</p>}
      </section>
    </div>
  );
}
