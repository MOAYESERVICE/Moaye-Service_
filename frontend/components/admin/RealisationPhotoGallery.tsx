"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { uploadAdminProductImage } from "@/lib/api";

type GalleryPhoto = { id: string; imageUrl: string; caption: string; imageAlt: string; isPublished: boolean };

async function readPhotos(response: Response): Promise<GalleryPhoto[]> {
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success || !Array.isArray(payload.data)) {
    throw new Error(typeof payload?.message === "string" ? payload.message : "La galerie de photos est indisponible.");
  }
  return payload.data as GalleryPhoto[];
}

export default function RealisationPhotoGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch("/api/admin/realisations/photos", { cache: "no-store", signal });
    return readPhotos(response);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void load(controller.signal)
      .then((nextPhotos) => { if (active) { setPhotos(nextPhotos); setError(""); } })
      .catch((reason) => { if (active && !(reason instanceof Error && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Impossible de charger la galerie."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [load]);

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    setNotice("");
    try {
      const url = await uploadAdminProductImage(file);
      setImageUrl(url);
      if (!imageAlt.trim()) setImageAlt(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 250));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "La photo n’a pas pu être envoyée.");
    } finally {
      setUploading(false);
    }
  }

  async function addPhoto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(editingPhotoId
        ? `/api/admin/realisations/photos/${encodeURIComponent(editingPhotoId)}`
        : "/api/admin/realisations/photos", {
        method: editingPhotoId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, caption: caption.trim(), imageAlt: imageAlt.trim(), isPublished }),
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success || !payload.data) {
        throw new Error(typeof payload?.message === "string" ? payload.message : "La photo n’a pas pu être enregistrée.");
      }
      setPhotos((current) => editingPhotoId
        ? current.map((photo) => photo.id === editingPhotoId ? payload.data as GalleryPhoto : photo)
        : [payload.data as GalleryPhoto, ...current]);
      setEditingPhotoId(null);
      setImageUrl("");
      setCaption("");
      setImageAlt("");
      setIsPublished(true);
      setNotice(editingPhotoId ? "La photo a été modifiée." : "La photo a été ajoutée à la galerie.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "La photo n’a pas pu être enregistrée.");
    } finally {
      setSaving(false);
    }
  }

  function editPhoto(photo: GalleryPhoto) {
    setEditingPhotoId(photo.id);
    setImageUrl(photo.imageUrl);
    setCaption(photo.caption);
    setImageAlt(photo.imageAlt);
    setIsPublished(photo.isPublished);
    setError("");
    setNotice("");
    document.getElementById("gallery-photo")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function cancelEditPhoto() {
    setEditingPhotoId(null);
    setImageUrl("");
    setCaption("");
    setImageAlt("");
    setIsPublished(true);
    setError("");
  }

  async function deletePhoto(photo: GalleryPhoto) {
    setError("");
    setNotice("");
    setDeletingPhotoId(photo.id);
    try {
      const response = await fetch(`/api/admin/realisations/photos/${encodeURIComponent(photo.id)}`, { method: "DELETE", cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) throw new Error(payload?.message ?? "La photo n’a pas pu être supprimée.");
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
      setConfirmDeleteId(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "La photo n’a pas pu être supprimée.");
    } finally {
      setDeletingPhotoId(null);
    }
  }

  return (
    <section className="pt-panel pt-realisation-gallery" aria-label="Galerie de photos des réalisations">
      <header className="pt-realisation-gallery-heading">
        <div>
          <span className="pt-realisation-eyebrow">PHOTOTHÈQUE</span>
          <h2>Photos des réalisations</h2>
          <p>Les trois dernières photos publiées apparaissent sur l’accueil ; toutes les photos publiées restent sur la page Réalisations.</p>
        </div>
      </header>

      {notice && <p className="pt-success" role="status">{notice}</p>}
      {error && <p className="err pt-realisation-gallery-error" role="alert">{error}</p>}

      <form className="pt-realisation-gallery-form" onSubmit={addPhoto}>
        <div className="fgroup pt-realisation-gallery-file">
          <label htmlFor="gallery-photo">{editingPhotoId ? "Remplacer la photo (facultatif)" : "Ajouter une photo"}</label>
          <input id="gallery-photo" type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading || saving} onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ""; }} />
          <span className="pt-muted">PNG, JPG ou WEBP · 5 Mo maximum{editingPhotoId ? " · Laisse vide pour garder la photo actuelle" : ""}</span>
          {uploading && <span className="pt-muted" role="status">Envoi de la photo…</span>}
          {imageUrl && <Image src={imageUrl} alt={imageAlt || "Aperçu de la photo à ajouter"} width={480} height={270} unoptimized className="pt-realisation-gallery-preview" />}
        </div>
        <div className="fgroup">
          <label htmlFor="gallery-caption">Texte sous la photo</label>
          <input id="gallery-caption" className="inp" value={caption} required minLength={2} maxLength={200} placeholder="Ex. Installation d’une cage piscicole" onChange={(event) => setCaption(event.target.value)} />
        </div>
        <div className="fgroup">
          <label htmlFor="gallery-alt">Description de la photo</label>
          <input id="gallery-alt" className="inp" value={imageAlt} required minLength={3} maxLength={250} placeholder="Décris ce que montre la photo" onChange={(event) => setImageAlt(event.target.value)} />
        </div>
        <label className="pt-realisation-publish">
          <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} />
          <span><strong>Afficher sur l’accueil et la page Réalisations</strong><small>Les trois dernières photos publiées apparaissent sur l’accueil ; tu peux garder cette photo en brouillon.</small></span>
        </label>
        <div className="pt-realisation-gallery-form-actions">
          <button className="btn btn-green" type="submit" disabled={saving || uploading || !imageUrl || !caption.trim() || !imageAlt.trim()}>
            {saving ? "Enregistrement…" : editingPhotoId ? "Enregistrer les modifications" : "Ajouter à la galerie"}
          </button>
          {editingPhotoId && <button className="btn btn-ghost" type="button" disabled={saving || uploading} onClick={cancelEditPhoto}>Annuler</button>}
        </div>
      </form>

      <div className="pt-realisation-gallery-list">
        <h3>Photos enregistrées <span>{photos.length}</span></h3>
        {loading ? <p className="pt-muted" role="status">Chargement des photos…</p> : photos.length ? (
          <div className="pt-realisation-gallery-grid">
            {photos.map((photo) => (
              <article key={photo.id} className="pt-realisation-gallery-card">
                <Image src={photo.imageUrl} alt={photo.imageAlt} width={640} height={420} unoptimized />
                <div><strong>{photo.caption}</strong><span>{photo.isPublished ? "Publiée" : "Brouillon"}</span></div>
                <div className="pt-realisation-gallery-card-actions">
                  {confirmDeleteId === photo.id ? (
                    <div className="pt-realisation-delete-confirmation" role="group" aria-label={`Confirmer la suppression de ${photo.caption}`}>
                      <div className="pt-realisation-delete-buttons">
                        <button className="btn btn-sm pt-realisation-delete-confirm" type="button" disabled={deletingPhotoId === photo.id} onClick={() => void deletePhoto(photo)}>
                          {deletingPhotoId === photo.id ? "Suppression…" : "Confirmer"}
                        </button>
                        <button className="btn btn-ghost btn-sm" type="button" disabled={deletingPhotoId === photo.id} onClick={() => setConfirmDeleteId(null)}>Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => editPhoto(photo)}>Modifier</button>
                      <button className="btn btn-sm pt-realisation-delete" type="button" onClick={() => { setError(""); setNotice(""); setConfirmDeleteId(photo.id); }}>Supprimer</button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : <p className="pt-muted">Aucune photo dans la galerie pour le moment.</p>}
      </div>
    </section>
  );
}
