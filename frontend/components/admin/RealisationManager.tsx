"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { uploadAdminProductImage } from "@/lib/api";
import RoleGuard from "@/components/admin/RoleGuard";
import RealisationPhotoGallery from "@/components/admin/RealisationPhotoGallery";

type Realisation = {
  id: string;
  title: string;
  description: string;
  domain: string;
  location: string;
  imageUrl: string;
  imageAlt: string;
  isPublished: boolean;
};

type FormValue = Omit<Realisation, "id">;
const emptyForm: FormValue = {
  title: "", description: "", domain: "", location: "", imageUrl: "", imageAlt: "", isPublished: true,
};

async function readPayload<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof payload?.message === "string" ? payload.message : "L’opération n’a pas abouti.");
  if (!payload?.success) throw new Error("Le serveur n’a pas confirmé l’enregistrement.");
  return payload.data as T;
}

export default function RealisationManager() {
  const [items, setItems] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState<FormValue>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const editorRef = useRef<HTMLFormElement>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch("/api/admin/realisations", { cache: "no-store", signal });
    return readPayload<Realisation[]>(response);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void load(controller.signal)
      .then((nextItems) => { if (active) { setItems(nextItems); setLoadError(""); } })
      .catch((reason) => { if (active && !(reason instanceof Error && reason.name === "AbortError")) setLoadError(reason instanceof Error ? reason.message : "Les réalisations ne sont pas disponibles."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [load]);

  async function reload() {
    setLoading(true);
    setLoadError("");
    try { setItems(await load()); }
    catch (reason) { setLoadError(reason instanceof Error ? reason.message : "Les réalisations ne sont pas disponibles."); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    if (!editorOpen) return;
    const frame = requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [editorOpen]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setEditorOpen(true);
    setNotice("");
    setError("");
  }

  function startEdit(item: Realisation) {
    setEditingId(item.id);
    setForm({
      title: item.title, description: item.description, domain: item.domain,
      location: item.location, imageUrl: item.imageUrl, imageAlt: item.imageAlt,
      isPublished: item.isPublished,
    });
    setEditorOpen(true);
    setNotice("");
    setError("");
  }

  function cancelEdit() {
    setEditorOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch(editingId ? `/api/admin/realisations/${encodeURIComponent(editingId)}` : "/api/admin/realisations", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, title: form.title.trim(), description: form.description.trim(), imageAlt: form.imageAlt.trim() || form.title.trim() }),
        cache: "no-store",
      });
      const saved = await readPayload<Realisation>(response);
      setItems((current) => editingId ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
      setNotice(editingId ? "La réalisation a été mise à jour." : "La réalisation a été ajoutée.");
      setEditorOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "La réalisation n’a pas pu être enregistrée.");
    } finally {
      setSaving(false);
    }
  }

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const imageUrl = await uploadAdminProductImage(file);
      setForm((current) => ({ ...current, imageUrl, imageAlt: current.imageAlt || current.title.trim() }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "La photo n’a pas pu être envoyée.");
    } finally {
      setUploading(false);
    }
  }

  async function remove(item: Realisation) {
    setDeletingId(item.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/realisations/${encodeURIComponent(item.id)}`, { method: "DELETE", cache: "no-store" });
      await readPayload<Realisation>(response);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setConfirmDeleteId(null);
      if (editingId === item.id) cancelEdit();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "La réalisation n’a pas pu être supprimée.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <RoleGuard module="realisations">
      <div className="pt-realisation-manager">
        {notice && <p role="status" className="pt-success">{notice}</p>}
        {error && !editorOpen && <p role="alert" className="err">{error}</p>}

        {!editorOpen ? (
          <section className="pt-panel pt-realisation-list-panel" aria-label="Réalisations enregistrées">
            <header className="pt-realisation-list-heading">
              <div><span className="pt-realisation-eyebrow">PORTFOLIO</span><h2>Projets présentés aux visiteurs</h2><p>{items.length} réalisation{items.length === 1 ? "" : "s"} enregistrée{items.length === 1 ? "" : "s"}</p></div>
              <button className="btn btn-amber" type="button" onClick={startCreate}>+ Ajouter un projet</button>
            </header>
            {loading ? <p className="pt-muted pt-realisation-state" role="status">Chargement des réalisations…</p> : loadError ? (
              <div className="pt-realisation-state" role="alert"><p className="err">{loadError}</p><button className="btn btn-ghost btn-sm" type="button" onClick={() => void reload()}>Réessayer</button></div>
            ) : items.length === 0 ? <p className="pt-muted pt-realisation-state">Aucun projet enregistré. Ajoute une première réalisation pour la présenter sur le site.</p> : (
              <div className="pt-realisation-list">
                {items.map((item) => (
                  <article key={item.id} className="pt-realisation-card">
                    {item.imageUrl ? <Image src={item.imageUrl} alt={item.imageAlt || item.title} width={640} height={360} unoptimized className="pt-realisation-image" /> : <div className="pt-realisation-image-placeholder" aria-label="Aucune photo" />}
                    <div className="pt-realisation-card-content">
                      <div className="pt-realisation-card-title"><strong>{item.title}</strong><span className={`pt-bd ${item.isPublished ? "in" : "n"}`}>{item.isPublished ? "Publié" : "Brouillon"}</span></div>
                      <p className="pt-muted pt-realisation-card-meta">{item.domain}{item.location ? ` · ${item.location}` : ""}</p>
                      <p className="pt-muted pt-realisation-card-description">{item.description}</p>
                      <div className="pt-realisation-card-actions">
                        {confirmDeleteId === item.id ? (
                          <div className="pt-realisation-project-delete-confirmation" role="group" aria-label={`Confirmer la suppression de ${item.title}`}>
                            <button className="btn btn-sm pt-realisation-project-delete-confirm" type="button" disabled={deletingId === item.id} onClick={() => void remove(item)}>
                              {deletingId === item.id ? "Suppression…" : "Confirmer"}
                            </button>
                            <button className="btn btn-sm pt-realisation-project-delete-cancel" type="button" disabled={deletingId === item.id} onClick={() => setConfirmDeleteId(null)}>Annuler</button>
                          </div>
                        ) : (
                          <>
                            <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEdit(item)}>Modifier</button>
                            <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setError(""); setNotice(""); setConfirmDeleteId(item.id); }}>Supprimer</button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <form ref={editorRef} className="pt-panel pt-realisation-form" onSubmit={submit}>
            <header className="pt-realisation-form-heading">
              <div><span className="pt-realisation-eyebrow">PORTFOLIO · ADMINISTRATION</span><h2>{editingId ? "Modifier le projet" : "Ajouter une réalisation"}</h2><p>Présentez clairement les projets menés sur le terrain.</p></div>
              <button className="btn btn-ghost btn-sm" type="button" onClick={cancelEdit} disabled={saving}>Retour aux réalisations</button>
            </header>
            <div className="pt-realisation-form-fields">
              <div className="fgroup"><label htmlFor="real-title">Titre du projet</label><input id="real-title" className="inp" required minLength={3} maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
              <div className="fgroup"><label htmlFor="real-domain">Domaine</label><input id="real-domain" className="inp" required minLength={2} maxLength={100} placeholder="Aquaculture, agriculture, élevage…" value={form.domain} onChange={(event) => setForm({ ...form, domain: event.target.value })} /></div>
              <div className="fgroup"><label htmlFor="real-location">Localisation</label><input id="real-location" className="inp" maxLength={160} placeholder="Ville ou région (facultatif)" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></div>
              <div className="fgroup pt-realisation-description-field"><label htmlFor="real-description">Description du projet</label><textarea id="real-description" className="inp" required minLength={20} maxLength={3000} rows={5} placeholder="Décris les travaux réalisés, les espèces ou cultures concernées et le résultat obtenu." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><span className="pt-muted">{form.description.length}/3000 caractères · minimum 20</span></div>
              <div className="fgroup pt-realisation-upload"><label htmlFor="real-image">Photo du projet</label><span className="pt-muted">PNG, JPG ou WEBP · 5 Mo maximum</span><input id="real-image" type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading || saving} onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ""; }} />{uploading && <span role="status" className="pt-muted">Envoi de la photo…</span>}{form.imageUrl && <Image src={form.imageUrl} alt={form.imageAlt || form.title || "Aperçu du projet"} width={480} height={260} unoptimized className="pt-realisation-form-preview" />}</div>
              <div className="fgroup"><label htmlFor="real-alt">Description de la photo</label><input id="real-alt" className="inp" maxLength={250} value={form.imageAlt} onChange={(event) => setForm({ ...form, imageAlt: event.target.value })} placeholder="Ex. Producteurs réunis pendant une formation" /><span className="pt-muted">Texte alternatif pour les lecteurs d’écran.</span></div>
              <label className="pt-realisation-publish"><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} /><span><strong>Publier cette réalisation</strong><small>Elle sera visible sur le site public.</small></span></label>
            </div>
            {error && <p role="alert" className="err pt-realisation-form-error">{error}</p>}
            <footer className="pt-realisation-form-footer"><span>Les champs avec validation sont enregistrés au site.</span><div><button className="btn btn-green" type="submit" disabled={saving || uploading || !form.imageUrl}>{saving ? "Enregistrement…" : editingId ? "Enregistrer les changements" : "Ajouter le projet"}</button><button className="btn btn-ghost" type="button" onClick={cancelEdit} disabled={saving}>Annuler</button></div></footer>
          </form>
        )}
      </div>
      <RealisationPhotoGallery />
    </RoleGuard>
  );
}
