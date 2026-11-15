"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { uploadAdminProductImage } from "@/lib/api";
import RoleGuard from "@/components/admin/RoleGuard";

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
  if (!response.ok) {
    throw new Error(typeof payload?.message === "string" ? payload.message : "L’opération n’a pas abouti.");
  }
  if (!payload?.success) throw new Error("Le serveur n’a pas confirmé l’enregistrement.");
  return payload.data as T;
}

export default function RealisationManager() {
  const [items, setItems] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState<FormValue>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/admin/realisations", { cache: "no-store" });
      setItems(await readPayload<Realisation[]>(response));
    } catch (reason) {
      setLoadError(reason instanceof Error ? reason.message : "Les réalisations ne sont pas disponibles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function startEdit(item: Realisation) {
    setEditingId(item.id);
    setForm({
      title: item.title, description: item.description, domain: item.domain,
      location: item.location, imageUrl: item.imageUrl, imageAlt: item.imageAlt,
      isPublished: item.isPublished,
    });
    setNotice("");
    setError("");
  }

  function cancelEdit() {
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
    if (!window.confirm(`Supprimer « ${item.title} » ? Cette action est définitive.`)) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/realisations/${encodeURIComponent(item.id)}`, { method: "DELETE", cache: "no-store" });
      await readPayload<Realisation>(response);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) cancelEdit();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "La réalisation n’a pas pu être supprimée.");
    }
  }

  return (
    <RoleGuard module="realisations">
      <div className="pt-stack" style={{ gap: 22 }}>
        <div className="pt-flex top" style={{ alignItems: "flex-start" }}>
          <section className="pt-panel pt-pp pt-stack" style={{ flex: "2 1 520px", minWidth: 0, gap: 18 }} aria-label="Réalisations enregistrées">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div><h2 className="pt-h3">Projets présentés aux visiteurs</h2><p className="pt-muted">{items.length} réalisation{items.length === 1 ? "" : "s"} enregistrée{items.length === 1 ? "" : "s"}</p></div>
              <button className="btn btn-amber" type="button" onClick={() => { cancelEdit(); setNotice(""); }}>+ Ajouter un projet</button>
            </div>
            {notice && <p role="status" className="pt-success">{notice}</p>}
            {error && <p role="alert" className="err">{error}</p>}
            {loading ? <p className="pt-muted" role="status">Chargement des réalisations…</p> : loadError ? (
              <div role="alert"><p className="err">{loadError}</p><button className="btn btn-ghost btn-sm" type="button" onClick={() => void load()}>Réessayer</button></div>
            ) : items.length === 0 ? <p className="pt-muted">Aucun projet enregistré. Ajoute une première réalisation pour la présenter sur le site.</p> : (
              <div className="pt-stack" style={{ gap: 12 }}>
                {items.map((item) => (
                  <article key={item.id} className="pt-panel pt-pp" style={{ display: "grid", gridTemplateColumns: "minmax(90px, 140px) minmax(0, 1fr)", gap: 16, alignItems: "center" }}>
                    {item.imageUrl ? <Image src={item.imageUrl} alt={item.imageAlt || item.title} width={280} height={180} unoptimized style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 10 }} /> : <div aria-label="Aucune photo" style={{ height: 100, borderRadius: 10, background: "#edf2ef" }} />}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><strong>{item.title}</strong><span className={`pt-bd ${item.isPublished ? "in" : "n"}`}>{item.isPublished ? "Publié" : "Brouillon"}</span></div>
                      <p className="pt-muted" style={{ marginTop: 4 }}>{item.domain}{item.location ? ` · ${item.location}` : ""}</p>
                      <p className="pt-muted" style={{ marginTop: 6 }}>{item.description}</p>
                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEdit(item)}>Modifier</button>
                        <button className="btn btn-ghost btn-sm" type="button" onClick={() => void remove(item)}>Supprimer</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <form className="pt-panel pt-pp pt-stack" style={{ flex: "1 1 360px", minWidth: 0, gap: 15, border: "2px solid #1B6B57" }} onSubmit={submit}>
            <div><h2 className="pt-h3">{editingId ? "Modifier le projet" : "Ajouter une réalisation"}</h2><p className="pt-muted">La photo, le titre et la description seront enregistrés pour le site.</p></div>
            <div className="fgroup"><label htmlFor="real-title">Titre du projet</label><input id="real-title" className="inp" required minLength={3} maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
            <div className="fgroup"><label htmlFor="real-domain">Domaine</label><input id="real-domain" className="inp" required minLength={2} maxLength={100} placeholder="Aquaculture, agriculture, élevage…" value={form.domain} onChange={(event) => setForm({ ...form, domain: event.target.value })} /></div>
            <div className="fgroup"><label htmlFor="real-location">Localisation</label><input id="real-location" className="inp" maxLength={160} placeholder="Ville ou région (facultatif)" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></div>
            <div className="fgroup"><label htmlFor="real-description">Description du projet</label><textarea id="real-description" className="inp" required minLength={20} maxLength={3000} rows={5} style={{ padding: "12px 14px", resize: "vertical" }} placeholder="Décris les travaux réalisés, les espèces ou cultures concernées et le résultat obtenu." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><span className="pt-muted">{form.description.length}/3000 caractères · minimum 20</span></div>
            <div className="fgroup"><label htmlFor="real-image">Photo du projet (PNG, JPG ou WEBP · 5 Mo max.)</label><input id="real-image" type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading || saving} onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ""; }} />{uploading && <span role="status" className="pt-muted">Envoi de la photo…</span>}{form.imageUrl && <Image src={form.imageUrl} alt={form.imageAlt || form.title || "Aperçu du projet"} width={480} height={260} unoptimized style={{ width: "100%", maxHeight: 190, objectFit: "cover", borderRadius: 10 }} />}</div>
            <div className="fgroup"><label htmlFor="real-alt">Description de la photo pour l’accessibilité</label><input id="real-alt" className="inp" maxLength={250} value={form.imageAlt} onChange={(event) => setForm({ ...form, imageAlt: event.target.value })} placeholder="Ex. Producteurs réunis pendant une formation" /></div>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} />Publier cette réalisation sur le site</label>
            {error && <p role="alert" className="err">{error}</p>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button className="btn btn-green" type="submit" disabled={saving || uploading || !form.imageUrl}>{saving ? "Enregistrement…" : editingId ? "Enregistrer les changements" : "Ajouter le projet"}</button>{editingId && <button className="btn btn-ghost" type="button" onClick={cancelEdit} disabled={saving}>Annuler</button>}</div>
          </form>
        </div>
      </div>
    </RoleGuard>
  );
}