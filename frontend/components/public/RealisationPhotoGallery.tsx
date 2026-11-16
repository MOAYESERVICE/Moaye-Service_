"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicRealisationPhoto } from "@/lib/realisations";

export default function RealisationPhotoGallery({ photos }: { photos: PublicRealisationPhoto[] }) {
  const [selected, setSelected] = useState<PublicRealisationPhoto | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      openerRef.current?.focus();
    };
  }, [selected]);

  return (
    <>
      <div className="realisation-photo-masonry">
        {photos.map((photo) => (
          <figure className="card realisation-photo-card" key={photo.id}>
            <button
              className="realisation-photo-open"
              type="button"
              aria-label={`Agrandir la photo : ${photo.caption}`}
              onClick={(event) => { openerRef.current = event.currentTarget; setSelected(photo); }}
            >
              {/* Preserve each uploaded photo's original proportions in the masonry layout. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.imageUrl} alt={photo.imageAlt} loading="lazy" decoding="async" />
              <span className="realisation-photo-zoom" aria-hidden="true">Agrandir</span>
            </button>
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>

      {selected && (
        <div className="realisation-lightbox-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section className="realisation-lightbox" role="dialog" aria-modal="true" aria-label={selected.caption}>
            <button className="realisation-lightbox-close" type="button" autoFocus aria-label="Fermer la photo agrandie" onClick={() => setSelected(null)}>×</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="realisation-lightbox-image" src={selected.imageUrl} alt={selected.imageAlt} />
            <p>{selected.caption}</p>
          </section>
        </div>
      )}
    </>
  );
}
