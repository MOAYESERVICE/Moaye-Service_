"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/layout/Logo";
import Icon from "@/components/ui/Icon";
import { ICONS } from "@/components/portal/icons";
import { useAccount } from "@/hooks/useAccount";
import { logout } from "@/lib/auth";

export default function AccountSidebar() {
  const pathname = usePathname();
  const { orders, quotes, unreadThreads, profile } = useAccount();
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
  const inProgress = orders.filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "preparing").length;
  const waiting = quotes.filter((x) => x.st === "new" || x.st === "progress").length;

  const items = [
    { href: "/mon-compte", label: "Tableau de bord", icon: ICONS.dash, badge: 0 },
    { href: "/mon-compte/commandes", label: "Mes commandes", icon: ICONS.orders, badge: inProgress },
    { href: "/mon-compte/devis", label: "Mes devis", icon: ICONS.quotes, badge: waiting },
    { href: "/mon-compte/messages", label: "Messages", icon: ICONS.messages, badge: unreadThreads },
    { href: "/mon-compte/profil", label: "Mon profil", icon: ICONS.profile, badge: 0 },
  ];
  const initials = profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <aside className={`pt-side dark account-side${mobileOpen ? " mobile-open" : ""}`} aria-label="Espace client">
      <div className="pt-mobile-header">
        <Link href="/" className="pt-brand" aria-label="MOAYE SERVICES, retour au site">
          <Logo />
        </Link>
        <button
          type="button"
          className="pt-menu-toggle"
          aria-controls="account-mobile-navigation"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Fermer le menu de l’espace client" : "Ouvrir le menu de l’espace client"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span>{mobileOpen ? "Fermer" : "Menu"}</span>
          <span className="pt-menu-toggle-icon" aria-hidden="true"><i /><i /><i /></span>
        </button>
      </div>

      <nav id="account-mobile-navigation" className="pt-nav" aria-label="Navigation principale">
        <span className="pt-label">Menu</span>
        {items.map((i) => {
          const active = i.href === "/mon-compte" ? pathname === i.href : pathname.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href} className={active ? "pt-nv on" : "pt-nv"} aria-current={active ? "page" : undefined} onClick={() => setMobileOpen(false)}>
              <Icon d={i.icon} size={22} />
              <span>{i.label}</span>
              {i.badge > 0 && <span className="pt-nb">{i.badge}</span>}
            </Link>
          );
        })}

        <span className="pt-label">Services</span>
        <Link href="/assistant" className="pt-nv" onClick={() => setMobileOpen(false)}><Icon d={ICONS.assistant} size={22} /><span>Assistant IA</span></Link>
        <Link href="/produits" className="pt-nv" onClick={() => setMobileOpen(false)}><Icon d={ICONS.catalog} size={22} /><span>Catalogue</span></Link>
      </nav>

      <div className="pt-foot">
        <div className="pt-help">
          <strong style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>Besoin d&apos;aide ?</strong>
          <span className="pt-muted" style={{ fontSize: 14.5 }}>Votre conseiller vous répond [jours et horaires à préciser].</span>
          <Link className="btn btn-ghost btn-sm" href="/contact">Contacter l&apos;équipe</Link>
        </div>
        <div className="pt-user">
          <span className="pt-avatar">{initials}</span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3, minWidth: 0 }}>
            <strong style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.name}</strong>
            <Link href="/connexion" onClick={logout} style={{ fontSize: 14, color: "#F4B9A6" }}>Se déconnecter</Link>
          </span>
        </div>
      </div>
    </aside>
  );
}
