"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import Photo from "@/components/ui/Photo";
import { getAdminHomepageCards, saveAdminHomepageCard, type AdminHomepageCard } from "@/lib/api";

export default function PhotoLibrary() {
  const [cards, setCards] = useState<AdminHomepageCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<AdminHomepageCard | null>(null);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const editorRef = useRef<HTMLFormElement>(null);

  const loadCards = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      setCards(await getAdminHomepageCards(signal));
    } catch (loadError) {
      if (loadError instanceof Error && loadError.name === "AbortError") return;
      setError(loadError instanceof Error ? loadError.message : "Impossible de charger les cartes d’accueil.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadCards(controller.signal);
    return () => controller.abort();
  }, [loadCards]);

  useEffect(() => {
    if (!editing) return;
    const frame = requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [editing]);

  function startEditing(card: AdminHomepageCard) {
    setEditing(card);
    setTitle(card.title);
    setImageUrl(card.imageUrl);
    setAlt(card.alt);
    setIsActive(card.isActive);
    setError("");
    setNotice("");
  }

  async function saveCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = await saveAdminHomepageCard(editing.productKey, {
        title: title.trim(), imageUrl: imageUrl.trim(), alt: alt.trim(), isActive,
      });
      setCards((current) => current.map((card) => card.productKey === saved.productKey ? saved : card));
      setEditing(null);
      setNotice("Carte enregistrée dans la base de données.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "La carte n’a pas pu être enregistrée.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pt-stack pt-home-cards">
      {!editing && <p className="pt-muted pt-home-cards-intro">
        Ces cartes alimentent directement la section « Nos produits » de l’accueil. Modifie leur titre, leur photo, le texte alternatif ou leur visibilité ; les changements sont enregistrés dans la base de données.
      </p>}

      {notice && <p className="success" role="status">{notice}</p>}
      {error && <div role="alert" className="pt-panel pt-stack pt-home-card-error">
        <p className="err">{error}</p>
        {!editing && <button className="btn btn-ghost btn-sm" type="button" onClick={() => void loadCards()}>Réessayer</button>}
      </div>}

      {loading ? <p className="pt-muted" role="status">Chargement des cartes enregistrées…</p> : editing ? (
        <form ref={editorRef} className="pt-panel pt-home-card-editor" onSubmit={saveCard}>
          <header className="pt-home-card-editor-heading">
            <div>
              <span className="pt-home-card-editor-kicker">Carte d’accueil · Position {editing.position}</span>
              <h2>Modifier la carte</h2>
              <p>Les changements seront visibles dans la section produits de la page d’accueil.</p>
            </div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setEditing(null); setError(""); }} disabled={saving}>
              Retour aux cartes
            </button>
          </header>

          <div className="pt-home-card-editor-fields">
            <div className="pt-home-card-editor-main">
              <div className="fgroup">
                <label htmlFor="homepage-card-title">Titre de la carte</label>
                <input id="homepage-card-title" className="inp" value={title} maxLength={160} required onChange={(event) => setTitle(event.target.value)} />
              </div>
              <div className="fgroup">
                <label htmlFor="homepage-card-alt">Description de l’image</label>
                <input id="homepage-card-alt" className="inp" value={alt} maxLength={250} required onChange={(event) => setAlt(event.target.value)} />
                <span className="pt-home-card-hint">Décris simplement ce que montre la photo.</span>
              </div>
              <label className="pt-home-card-visibility">
                <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
                <span><strong>Afficher cette carte sur l’accueil</strong><small>La carte reste enregistrée si tu la masques.</small></span>
              </label>
            </div>
            <div className="pt-home-card-editor-photo">
              <ImageUploader value={imageUrl} onChange={setImageUrl} label="Photo de la carte d’accueil" />
            </div>
          </div>

          <footer className="pt-home-card-editor-footer">
            <span>Enregistrement sécurisé dans la base du site</span>
            <div>
              <button className="btn btn-green" type="submit" disabled={saving || !imageUrl.trim()}>
                {saving ? "Enregistrement…" : "Enregistrer les modifications"}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => { setEditing(null); setError(""); }} disabled={saving}>Annuler</button>
            </div>
          </footer>
        </form>
      ) : (
        <div className="pt-photos pt-home-card-grid">
          {cards.map((card) => (
            <article key={card.productKey} className="pt-panel pt-photo pt-home-card">
              <Photo src={card.imageUrl} alt={card.alt} height={170} sizes="240px" />
              <div className="pt-home-card-meta">
                <strong>{card.title}</strong>
                <span>Carte d’accueil · Position {card.position} · {card.isActive ? "Visible" : "Masquée"}</span>
              </div>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEditing(card)}>Modifier la carte</button>
            </article>
          ))}
          {!cards.length && !error && <p className="pt-muted">Aucune carte n’est enregistrée.</p>}
        </div>
      )}
    </div>
  );
}
