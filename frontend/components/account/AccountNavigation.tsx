"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/auth";

const links = [
  { href: "/mon-compte", label: "Tableau de bord", exact: true },
  { href: "/mon-compte/commandes", label: "Mes commandes" },
  { href: "/mon-compte/devis", label: "Mes devis" },
  { href: "/mon-compte/messages", label: "Mes messages" },
  { href: "/mon-compte/profil", label: "Mon profil" },
  { href: "/mon-compte/assistant", label: "Assistant projet" },
];

export default function AccountNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutError, setLogoutError] = useState(false);

  return (
    <nav className="card side" aria-label="Navigation de mon compte">
      {links.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={active ? "on" : undefined} aria-current={active ? "page" : undefined}>
            {label}
          </Link>
        );
      })}
      {logoutError && <span className="err" role="alert">La déconnexion n’a pas pu être effectuée. Veuillez réessayer.</span>}
      <button
        type="button"
        onClick={async () => {
          setLogoutError(false);
          try {
            await logout();
            router.replace("/connexion");
          } catch {
            setLogoutError(true);
          }
        }}
      >
        Déconnexion
      </button>
    </nav>
  );
}
