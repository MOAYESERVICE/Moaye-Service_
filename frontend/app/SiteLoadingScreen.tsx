import Logo from "@/components/layout/Logo";

export default function SiteLoadingScreen() {
  return (
    <div className="site-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="site-loading-content">
        <h1 className="site-loading-brand"><Logo /><span className="site-loading-accessible-title">MOAYE SERVICE</span></h1>
        <div className="site-loading-copy">
          <p className="site-loading-eyebrow">AGRICULTURE <span>·</span> ÉLEVAGE <span>·</span> AQUACULTURE</p>
          <p className="site-loading-message">Bienvenue chez<br />MOAYE SERVICE.</p>
          <p className="site-loading-description">Au service de vos projets.</p>
        </div>
        <div className="site-loading-progress" aria-hidden="true"><span /></div>
        <p className="site-loading-status"><span className="site-loading-spinner" aria-hidden="true" />Chargement en cours</p>
      </div>
    </div>
  );
}
