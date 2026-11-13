"use client";
import { useState } from "react";
import Link from "next/link";
import Photo from "@/components/ui/Photo";
import { systems } from "@/data/expertise";

export default function AquaFocus() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedSystem = systems.find((system) => system.id === selectedId);

  return (
    <section className="section section-dark">
      <div className="wrap split aqua-focus-layout" style={{ gap: 56 }}>
        <div className="aqua-focus-copy">
          <span className="eyebrow eyebrow-light">Focus aquaculture</span>
          <h2 className="h2">Pisciculture : le système adapté à votre site</h2>
          <p className="lead lead-light">Cages flottantes, enclos, étangs ou bassins hors-sol : nous étudions votre site et votre budget pour choisir, installer et suivre le bon système.</p>
          <div className="aqua-system-picker" aria-label="Choisir un système piscicole">
            {systems
              .filter((system) => selectedId === null || system.id === selectedId)
              .map((system) => (
                <button
                  key={system.id}
                  className={selectedId === system.id ? "aqua-system-option selected" : "aqua-system-option"}
                  type="button"
                  aria-pressed={selectedId === system.id}
                  onClick={() => setSelectedId(system.id)}
                >
                  <span className="aqua-system-dot" aria-hidden="true" />
                  {system.label}
                </button>
              ))}
          </div>
          {selectedSystem && (
            <div className="aqua-system-detail" aria-live="polite">
              <h3>{selectedSystem.title}</h3>
              <p>{selectedSystem.desc}</p>
              <strong>Ce système est adapté si :</strong>
              <ul>
                {selectedSystem.suits.map((reason) => <li key={reason}>{reason}</li>)}
              </ul>
              <Link className="btn btn-amber" href="/devis">Demander un devis pour ce système</Link>
              <button className="aqua-system-change" type="button" onClick={() => setSelectedId(null)}>
                Choisir un autre système
              </button>
            </div>
          )}
          {selectedId === null && (
            <p className="aqua-system-hint">Sélectionnez un système pour découvrir son fonctionnement et voir s’il correspond à votre projet.</p>
          )}
          {selectedId === null && (
            <div className="aqua-focus-link"><Link className="btn btn-amber" href="/expertise">Voir tous nos systèmes</Link></div>
          )}
        </div>
        <div className="aqua-focus-photo">
          {selectedSystem?.image ? (
            <Photo src={selectedSystem.image} alt={selectedSystem.title} height={400} />
          ) : selectedSystem ? (
            <div className="aqua-photo-placeholder" role="img" aria-label={selectedSystem.title}>
              <span>{selectedSystem.label}</span>
            </div>
          ) : (
            <Photo src="/aquaculture-cage-installation.jpg" alt="Installation d'une cage piscicole flottante sur un plan d'eau" height={400} sizes="(max-width: 700px) 100vw, 50vw" />
          )}
        </div>
      </div>
    </section>
  );
}