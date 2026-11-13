import Link from "next/link";
import Logo from "@/components/layout/Logo";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  customerMode = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  customerMode?: "login" | "register" | false;
}) {
  const heading = (
    <div className="auth-heading">
      <h1>{title}</h1>
      {subtitle && <p className="muted">{subtitle}</p>}
    </div>
  );
  const footerContent = footer && <div className="auth-foot">{footer}</div>;

  if (customerMode) {
    return (
      <div className="auth-shell-customer">
        <aside className="auth-aside">
          <Link href="/" className="auth-brand" aria-label="Retour à l'accueil">
            <Logo />
          </Link>
          <div className="auth-aside-content">
            <h2>Suivez vos projets, vos commandes et vos devis</h2>
            <ul>
              <li>Suivez vos commandes et leur statut</li>
              <li>Retrouvez vos demandes de devis</li>
              <li>Échangez avec l’équipe et l’assistant IA</li>
              <li>Gérez votre panier et votre profil</li>
            </ul>
          </div>
          <p className="auth-aside-foot">Agro-pastoral · Aquaculture · Côte d’Ivoire</p>
        </aside>
        <section className="auth-panel">
          <nav className="auth-tabs" aria-label="Connexion ou inscription">
            <Link
              href="/connexion"
              className={customerMode === "login" ? "active" : undefined}
              aria-current={customerMode === "login" ? "page" : undefined}
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className={customerMode === "register" ? "active" : undefined}
              aria-current={customerMode === "register" ? "page" : undefined}
            >
              Inscription
            </Link>
          </nav>
          {heading}
          {children}
          {footerContent}
        </section>
      </div>
    );
  }

  return (
    <div className="card auth-card">
      <Link href="/" className="brand" aria-label="Retour à l'accueil">
        <Logo />
      </Link>
      {heading}
      {children}
      {footerContent}
    </div>
  );
}