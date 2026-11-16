"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/layout/Logo";
import { menu, roleLabels } from "@/data/admin";
import { useAdmin } from "@/hooks/useAdmin";
import { logout } from "@/lib/auth";
import Icon from "@/components/ui/Icon";
import { ICONS } from "@/components/portal/icons";

const adminIcons: Record<string, string> = {
  dash: ICONS.dash,
  products: ICONS.catalog,
  categories: ICONS.catalog,
  services: ICONS.assistant,
  expertises: ICONS.assistant,
  realisations: ICONS.chart,
  photos: ICONS.catalog,
  partenaires: ICONS.profile,
  orders: ICONS.orders,
  clients: ICONS.profile,
  quotes: ICONS.quotes,
  messages: ICONS.messages,
  users: ICONS.profile,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { role, todo, readNotificationIds, markNotificationRead, adminIdentity } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);
  const readSection = pathname.startsWith("/admin/commandes")
    ? "orders"
    : pathname.startsWith("/admin/devis")
      ? "quotes"
      : pathname.startsWith("/admin/messages")
        ? "messages"
        : null;

  useEffect(() => {
    if (!readSection) return;
    todo.filter((item) => item.need === readSection).forEach((item) => markNotificationRead(item.id));
  }, [markNotificationRead, readSection, todo]);

  const badge: Record<string, number> = {
    orders: todo.filter((item) => item.need === "orders" && !readNotificationIds.includes(item.id)).length,
    quotes: todo.filter((item) => item.need === "quotes" && !readNotificationIds.includes(item.id)).length,
    messages: todo.filter((item) => item.need === "messages" && !readNotificationIds.includes(item.id)).length,
  };
  const adminName = adminIdentity?.name.trim() || "Compte administrateur";
  const initials = adminName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "AD";

  return (
    <aside className={`pt-side dark${mobileOpen ? " mobile-open" : ""}`} aria-label="Administration">
      <div className="pt-mobile-header">
        <Link href="/admin" className="pt-brand" aria-label="Tableau de bord">
          <Logo />
        </Link>
        <button
          type="button"
          className="pt-menu-toggle"
          aria-controls="admin-mobile-navigation"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Fermer le menu d’administration" : "Ouvrir le menu d’administration"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span>{mobileOpen ? "Fermer" : "Menu"}</span>
          <span className="pt-menu-toggle-icon" aria-hidden="true"><i /><i /><i /></span>
        </button>
      </div>

      <nav id="admin-mobile-navigation" className="pt-nav" aria-label="Navigation principale">
        {menu.map((g) => {
          const items = g.items.filter((i) => i.roles.includes(role));
          if (items.length === 0) return null;
          return (
            <div key={g.title} style={{ display: "contents" }}>
              <span className="pt-label">{g.title}</span>
              {items.map((i) => {
                const active = i.href === "/admin" ? pathname === i.href : pathname.startsWith(i.href);
                const n = badge[i.id] ?? 0;
                return (
                  <Link key={i.id} href={i.href} className={active ? "pt-nv on" : "pt-nv"} aria-current={active ? "page" : undefined} onClick={() => setMobileOpen(false)}>
                    <span className="pt-admin-nav-icon"><Icon d={adminIcons[i.id] ?? ICONS.catalog} size={22} /></span>
                    <span>{i.label}</span>
                    {n > 0 && <span className="pt-nb">{n}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="pt-foot" style={{ gap: 6 }}>
        <div className="pt-user">
          <span className="pt-avatar" aria-hidden="true">{initials}</span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3, minWidth: 0 }}>
            <strong title={adminName} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{adminName}</strong>
            {adminIdentity?.email && <small title={adminIdentity.email} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#C9DDD3" }}>{adminIdentity.email}</small>}
            <span style={{ fontSize: 13, color: "#C9DDD3" }}>{roleLabels[role]}</span>
          </span>
        </div>
        <Link href="/" className="pt-nv">Voir le site</Link>
        <Link href="/connexion" className="pt-nv" style={{ color: "#F4B9A6" }} onClick={logout}>Déconnexion</Link>
      </div>
    </aside>
  );
}
