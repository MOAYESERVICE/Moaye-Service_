type ProjectAccessNoticeProps = {
  page: "inscription" | "connexion";
};

export default function ProjectAccessNotice({ page }: ProjectAccessNoticeProps) {
  const contactMessage =
    "Bonjour N’Goran Koffi Michael, je suis intéressé par la suite du projet MOAYE SERVICE.";
  const contactHref = `https://wa.me/2250715748740?text=${encodeURIComponent(contactMessage)}`;
  const action = page === "inscription" ? "inscription" : "connexion";

  return (
    <section
      className="signup-unavailable"
      role="status"
      aria-labelledby="project-access-notice-title"
    >
      <div className="signup-unavailable-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 8v4m0 4h.01M10.3 3.9 2.5 17.4A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.6L13.7 3.9a2 2 0 0 0-3.4 0Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="signup-unavailable-copy">
        <span className="signup-unavailable-label">Accès non disponible</span>
        <h2 id="project-access-notice-title">
          Désolé, la page de {action} n’est pas disponible.
        </h2>
        <p>
          Pour la suite de ce projet, veuillez contacter le développeur N’Goran
          Koffi Michael si vous êtes intéressé.
        </p>
        <a
          className="btn btn-green signup-unavailable-contact"
          href={contactHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Contacter le développeur · 07 15 74 87 40
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
