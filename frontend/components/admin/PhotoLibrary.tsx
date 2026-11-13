"use client";
import { useCallback, useEffect, useState } from "react";
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
    <div className="pt-stack" style={{ gap: 22 }}>
      <p className="pt-muted" style={{ fontSize: 16, maxWidth: 720 }}>
        Ces cartes alimentent directement la section « Nos produits » de l’accueil. Modifie leur titre, leur photo, le texte alternatif ou leur visibilité ; les changements sont enregistrés dans la base de données.
      </p>

      {notice && <p className="success" role="status">{notice}</p>}
      {error && <div role="alert" className="pt-panel pt-stack">
        <p className="err">{error}</p>
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => void loadCards()}>Réessayer</button>
      </div>}

      {loading ? <p className="pt-muted" role="status">Chargement des cartes enregistrées…</p> : (
        <div className="pt-photos">
          {cards.map((card) => (
            <article key={card.productKey} className="pt-panel pt-photo">
              <Photo src={card.imageUrl} alt={card.alt} height={170} sizes="240px" />
              <div style={{ padding: "0 4px", display: "flex", flexDirection: "column", gap: 4 }}>
                <strong style={{ fontSize: 15.5 }}>{card.title}</strong>
                <span style={{ fontSize: 13.5, color: "#5B726B" }}>
                  Carte d’accueil · Position {card.position} · {card.isActive ? "Visible" : "Masquée"}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEditing(card)}>Modifier la carte</button>
            </article>
          ))}
          {!cards.length && !error && <p className="pt-muted">Aucune carte n’est enregistrée.</p>}
        </div>
      )}

      {editing && (
        <form className="pt-panel pt-stack" style={{ gap: 16, border: "2px solid #1B6B57" }} onSubmit={saveCard}>
          <h3 className="pt-h3">Modifier la carte « {editing.title} »</h3>
          <div className="fgroup">
            <label htmlFor="homepage-card-title">Titre de la carte</label>
            <input id="homepage-card-title" className="inp" value={title} maxLength={160} required onChange={(event) => setTitle(event.target.value)} />
          </div>
          <ImageUploader value={imageUrl} onChange={setImageUrl} label="Photo de la carte d’accueil" />
          <div className="fgroup">
            <label htmlFor="homepage-card-alt">Description de l’image</label>
            <input id="homepage-card-alt" className="inp" value={alt} maxLength={250} required onChange={(event) => setAlt(event.target.value)} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            Afficher cette carte sur l’accueil
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button className="btn btn-green" type="submit" disabled={saving || !imageUrl.trim()}>
              {saving ? "Enregistrement…" : "Enregistrer dans la base"}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)} disabled={saving}>Annuler</button>
          </div>
        </form>
      )}
    </div>
  );
}
