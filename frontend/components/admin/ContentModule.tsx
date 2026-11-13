"use client";
import { useEffect, useRef, useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { contentConfig, type ContentId, type ContentItem } from "@/data/admin";
import { norm } from "@/lib/format";

function Form({ cfg, initial, onSave, onCancel }: {
  cfg: (typeof contentConfig)[ContentId];
  initial?: ContentItem;
  onSave: (v: { title: string; meta: string; status: "pub" | "draft" }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [meta, setMeta] = useState(initial?.meta ?? "");
  const [status, setStatus] = useState<"pub" | "draft">(initial?.status ?? "pub");
  const [tried, setTried] = useState(false);
  const bad = tried && !title.trim();

  return (
    <aside className="pt-panel pt-pp pt-stack" style={{ flex: "1 1 320px", minWidth: 0, gap: 16, border: "2px solid #1B6B57" }}>
      <h3 className="pt-h3">{initial ? "Modifier" : cfg.add}</h3>
      <div className="fgroup">
        <label htmlFor="ct">{cfg.titleLabel}</label>
        <input id="ct" className={bad ? "inp bad" : "inp"} value={title} onChange={(e) => setTitle(e.target.value)} />
        {bad && <span className="err">Ce champ est obligatoire.</span>}
      </div>
      <div className="fgroup">
        <label htmlFor="cm">{cfg.metaLabel}</label>
        <textarea id="cm" className="inp" rows={3} style={{ padding: "12px 14px", resize: "vertical" }} value={meta} onChange={(e) => setMeta(e.target.value)} />
      </div>
      <div className="fgroup">
        <label htmlFor="cs">Statut</label>
        <select id="cs" className="inp" value={status} onChange={(e) => setStatus(e.target.value as "pub" | "draft")}>
          <option value="pub">Publié</option>
          <option value="draft">Brouillon</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-green" onClick={() => { setTried(true); if (title.trim()) onSave({ title: title.trim(), meta, status }); }}>Enregistrer</button>
        <button className="btn btn-ghost" onClick={onCancel}>Annuler</button>
      </div>
    </aside>
  );
}

export default function ContentModule({ module }: { module: ContentId }) {
  const cfg = contentConfig[module];
  const { content, saveContent, deleteContent, toggleContent, q } = useAdmin();
  const [editing, setEditing] = useState<ContentItem | "new" | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) return;
    requestAnimationFrame(() => formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" }));
  }, [editing]);

  const items = content[module].filter((c) => norm(q) === "" || norm(c.title + " " + c.meta).includes(norm(q)));

  return (
    <div className="pt-stack" style={{ gap: 22 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <p className="pt-muted" style={{ fontSize: 16 }}>{cfg.help}</p>
        <button className="btn btn-amber" onClick={() => setEditing("new")}>+ {cfg.add}</button>
      </div>

      <div className="pt-flex top">
        <section className="pt-panel" style={{ flex: "2 1 560px", minWidth: 0 }} aria-label="Liste">
          {items.length === 0 && <div style={{ padding: "48px 24px", textAlign: "center" }}><h3 style={{ fontSize: 20 }}>Aucun élément trouvé</h3><p className="pt-muted" style={{ marginTop: 8 }}>Modifiez la recherche ou ajoutez un élément.</p></div>}
          <div style={{ overflowX: "auto" }}>
            <table className="pt-tbl pt-responsive-table">
              <thead><tr><th>{cfg.titleLabel}</th><th>{cfg.metaLabel}</th><th>Statut</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id}>
                    <td data-label={cfg.titleLabel}><strong>{c.title}</strong></td>
                    <td data-label={cfg.metaLabel} style={{ color: "#4A625B" }}>{c.meta}</td>
                    <td data-label="Statut"><button className={`pt-bd ${c.status === "pub" ? "in" : "n"}`} style={{ cursor: "pointer" }} aria-pressed={c.status === "pub"} onClick={() => toggleContent(module, c.id)}>{c.status === "pub" ? "Publié" : "Brouillon"}</button></td>
                    <td data-label="Actions" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(c)}>Modifier</button>{" "}
                      <button className={confirmId === c.id ? "btn btn-sm pt-danger" : "btn btn-ghost btn-sm"} onClick={() => { if (confirmId === c.id) { deleteContent(module, c.id); setConfirmId(null); } else setConfirmId(c.id); }}>
                        {confirmId === c.id ? "Confirmer" : "Supprimer"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {editing && (
          <div ref={formSectionRef} className="pt-edit-form-anchor">
            <Form
              key={editing === "new" ? "new" : editing.id}
              cfg={cfg}
              initial={editing === "new" ? undefined : editing}
              onSave={(v) => { saveContent(module, { ...v, id: editing === "new" ? undefined : editing.id }); setEditing(null); }}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
