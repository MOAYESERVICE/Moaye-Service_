"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Bell from "@/components/portal/Bell";
import { ICONS } from "@/components/portal/icons";
import { useAccount } from "@/hooks/useAccount";
import { orderLabel } from "@/data/demo";

const titles: [string, string, string][] = [
  ["/mon-compte/commandes", "Mes commandes", "Consultez le statut et l'historique de vos commandes"],
  ["/mon-compte/devis", "Mes devis", "Suivi de vos demandes de devis"],
  ["/mon-compte/messages", "Messages", "Vos échanges avec l'équipe MOAYE SERVICES"],
  ["/mon-compte/profil", "Mon profil", "Vos informations et préférences"],
  ["/mon-compte", "Tableau de bord", "Vue d'ensemble de votre espace client"],
];

export default function AccountTopBar() {
  const pathname = usePathname();
  const { q, setQ, orders, notifRead, messageNotifications, readNotificationIds, markNotificationRead, readNotifs } = useAccount();
  const [, title, sub] = titles.find((t) => pathname.startsWith(t[0])) ?? titles[titles.length - 1];

  useEffect(() => setQ(""), [pathname, setQ]);

  const current = orders.find((o) => o.status === "pending" || o.status === "confirmed" || o.status === "preparing");
  const items = [
    ...(current ? [{ id: `order:${current.id}`, href: "/mon-compte/commandes", title: `Commande ${current.id} : ${orderLabel[current.status].toLowerCase()}`, time: current.date, unread: !notifRead }] : []),
    ...messageNotifications.slice(0, 5).map((item) => ({
      ...item,
      unread: !readNotificationIds.includes(item.id),
    })),
  ];
  const unread = items.filter((item) => item.unread).length;

  return (
    <header className="pt-top">
      <div><h1>{title}</h1><small>{sub}</small></div>
      <div className="pt-actions">
        <div className="pt-search">
          <Icon d={ICONS.search} size={18} />
          <label htmlFor="pt-q" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Rechercher</label>
          <input id="pt-q" className="inp" type="search" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Bell items={items} unread={unread} onRead={readNotifs} onItemRead={markNotificationRead} />
        <Link className="btn btn-amber" href="/devis">Demander un devis</Link>
      </div>
    </header>
  );
}
