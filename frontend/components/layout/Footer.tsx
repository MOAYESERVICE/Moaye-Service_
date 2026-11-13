import Link from "next/link";
import Logo from "./Logo";
import { nav } from "@/data/nav";

const socialNetworks = [
  { name: "Facebook", icon: "facebook" },
  { name: "LinkedIn", icon: "linkedin" },
  { name: "WhatsApp", icon: "whatsapp" },
] as const;

function SocialIcon({ name }: { name: (typeof socialNetworks)[number]["icon"] }) {
  if (name === "facebook") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4Z" fill="currentColor" /></svg>;
  }
  if (name === "linkedin") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM5 10h3v9H5zm5 0h2.9v1.2h.1a3.2 3.2 0 0 1 2.9-1.5c3.1 0 3.7 2 3.7 4.6V19h-3v-4.2c0-1 0-2.3-1.5-2.3s-1.8 1.1-1.8 2.2V19h-3V10Z" fill="currentColor" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a8.8 8.8 0 0 0-7.6 13.2L3.2 21l5-1.3A8.8 8.8 0 1 0 12 3Zm0 15.8a7 7 0 0 1-3.6-1l-.3-.2-3 .8.8-2.9-.2-.3A7 7 0 1 1 12 18.8Zm3.8-5.2c-.2-.1-1.3-.7-1.5-.7s-.4-.1-.5.1-.6.7-.7.8-.3.2-.5.1a6 6 0 0 1-1.8-1.1 6.7 6.7 0 0 1-1.2-1.5c-.1-.2 0-.3.1-.4l.4-.5.2-.4v-.4c0-.1-.5-1.2-.7-1.6s-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3a2.5 2.5 0 0 0-.8 1.9 4.4 4.4 0 0 0 .9 2.3 10.1 10.1 0 0 0 3.9 3.4c.5.2.9.4 1.2.4.5.1 1 .1 1.4 0 .4-.1 1.3-.5 1.5-1s.2-.9.2-1-.2-.2-.4-.3Z" fill="currentColor" /></svg>;
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-main">
        <section className="footer-about" aria-label="À propos de MOAYE SERVICES">
          <Link href="/" className="footer-brand" aria-label="MOAYE SERVICES, accueil">
            <Logo />
          </Link>
          <p>Conception, réalisation et suivi de projets agricoles, d&apos;élevage et d&apos;aquaculture en Côte d&apos;Ivoire.</p>
        </section>

        <nav className="footer-navigation" aria-label="Navigation de pied de page">
          <h2>Navigation</h2>
          <div className="footer-links">
            {nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          </div>
        </nav>

        <section className="footer-contact">
          <h2>Parlons de votre projet</h2>
          <p>Notre équipe vous accompagne dans vos projets agricoles, d&apos;élevage et d&apos;aquaculture.</p>
          <Link href="/contact" className="footer-contact-link">
            Nous contacter
            <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section className="footer-social" aria-label="Réseaux sociaux">
          <h2>Suivez-nous</h2>
          <div className="footer-social-list">
            {socialNetworks.map((network) => (
              <span className="footer-social-item" key={network.name} aria-label={network.name}>
                <span className="footer-social-icon"><SocialIcon name={network.icon} /></span>
                <span>{network.name}</span>
              </span>
            ))}
          </div>
          <p>Comptes officiels en cours de configuration.</p>
        </section>
      </div>

      <div className="wrap footer-bottom">
        <span>© 2026 MOAYE SERVICES. Tous droits réservés.</span>
        <div className="footer-legal">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/confidentialite">Politique de confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}
