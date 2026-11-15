"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { nav } from "@/data/nav";
import { useCart } from "@/hooks/useCart";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !isHome || scrolled || open;

  return (
    <>
      <header className={solid ? "hdr solid" : "hdr"}>
        <div className="wrap header-inner">
          <Link href="/" className="brand" aria-label="MOAYE SERVICES, accueil">
            <Logo />
          </Link>

          <nav className="nav-links" aria-label="Navigation principale">
            {nav.map((n) => (
              <Link key={n.href} href={n.href}>{n.label}</Link>
            ))}
          </nav>

          <div className="header-actions">
            <Link className="btn btn-line btn-sm hide-m" href="/connexion">Connexion</Link>
            <Link className="btn btn-amber btn-sm hide-s" href="/devis">Demander un devis</Link>
            <Link
              className="cart-btn"
              href="/panier"
              aria-label={`Voir le panier${count === 0 ? ", vide" : `, ${count} article${count === 1 ? "" : "s"}`}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 7h12l1 13H5zM9 7a3 3 0 016 0" /></svg>
              {count > 0 && <span className="cart-badge" aria-hidden="true">{count > 99 ? "99+" : count}</span>}
            </Link>
            <button
              className="burger"
              type="button"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-controls="site-mobile-navigation"
              aria-expanded={open}
              onClick={() => setOpen((isOpen) => !isOpen)}
            >
              <svg className="burger-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
        <MobileMenu open={open} onClose={() => setOpen(false)} />
      </header>
      {!isHome && <div className="hdr-spacer" />}
    </>
  );
}
