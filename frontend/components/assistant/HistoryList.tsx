"use client";
import type { Conversation } from "@/types/chat";

export default function HistoryList({
  conversations, activeId, onSelect, onNew, onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <aside className="card chat-side" aria-label="Historique des conversations">
      <button className="btn btn-green btn-sm" onClick={onNew}>+ Nouvelle discussion</button>
      {conversations.length === 0 ? (
        <p className="muted" style={{ fontSize: 14 }}>Aucune conversation pour l&apos;instant.</p>
      ) : (
        <div className="hist">
          {conversations.map((c) => (
            <div key={c.id} className={c.id === activeId ? "hist-item on" : "hist-item"}>
              <button className="hist-pick" onClick={() => onSelect(c.id)} aria-current={c.id === activeId}>
                <strong>{c.title}</strong>
                <span>{new Date(c.updatedAt).toLocaleDateString("fr-FR")}</span>
              </button>
              <button className="hist-del" onClick={() => onDelete(c.id)} aria-label={`Supprimer la conversation ${c.title}`}>×</button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );

}