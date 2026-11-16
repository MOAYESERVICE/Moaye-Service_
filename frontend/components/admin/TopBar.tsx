"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Bell from "@/components/portal/Bell";
import { ICONS } from "@/components/portal/icons";
import { canAccess, pageTitles, roleLabels } from "@/data/admin";
import { useAdmin } from "@/hooks/useAdmin";
import { ageLabel } from "@/lib/stats";

export default function TopBar() {
  const pathname = usePathname();
  const { q, setQ, role, todo, messageNotificationHistory, readNotificationIds, markNotificationRead, readNotifs } = useAdmin();
  const [, title, sub] = pageTitles.find((t) => pathname.startsWith(t[0])) ?? pageTitles[pageTitles.length - 1];

  useEffect(() => setQ(""), [pathname, setQ]);

  const activities = [
    ...todo.filter((item) => item.need !== "messages"),
    ...messageNotificationHistory,
  ].sort((a, b) => new Date(b.iso).getTime() - new Date(a.iso).getTime());
  const mine = activities.filter((t) => canAccess(role, t.need));
  const isUnread = (item: (typeof mine)[number]) => item.type === "Message"
    ? Boolean(item.unread) && !readNotificationIds.includes(item.id)
    : !readNotificationIds.includes(item.id);
  const items = mine.slice(0, 5).map((t) => ({
    id: t.id,
    href: t.href,
    title: `${t.type} · ${t.label}`,
    time: `${t.client} · ${ageLabel(t.iso)}`,
    unread: isUnread(t),
  }));
  const unread = mine.filter(isUnread).length;

  return (
    <header className="pt-top">
      <div><h1>{title}</h1><small>{sub}</small></div>
      <div className="pt-actions">
        <div className="pt-search">
          <Icon d={ICONS.search} size={18} />
          <label htmlFor="pt-q" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Rechercher</label>
          <input id="pt-q" className="inp" type="search" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <span className="pt-bd n pt-admin-role" aria-label={`Rôle : ${roleLabels[role]}`} title={`Rôle : ${roleLabels[role]}`}>
          {roleLabels[role]}
        </span>
        <Bell items={items} unread={unread} onRead={readNotifs} onItemRead={markNotificationRead} />
      </div>
    </header>
  );
}
