import Link from "next/link";
import { nav } from "@/data/nav";

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div id="site-mobile-navigation" className="mobile-menu">
      {nav.map((n) => (
        <Link key={n.href} className="m" href={n.href} onClick={onClose}>{n.label}</Link>
      ))}
      <div className="mobile-actions">
        <Link className="btn btn-ghost" href="/connexion" onClick={onClose}>Connexion</Link>
        <Link className="btn btn-amber" href="/devis" onClick={onClose}>Demander un devis</Link>
      </div>
    </div>
  );
}
