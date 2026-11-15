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
      <div className="chat-side-heading">
        <span>VOTRE ESPACE</span>
        <h2>Discussions</h2>
        <p>Retrouvez vos échanges avec l’assistant.</p>
      </div>
      <button className="chat-new-button" onClick={onNew}>
        <span aria-hidden="true">＋</span>
        Nouvelle discussion
      </button>
      {conversations.length === 0 ? (
        <p className="chat-history-empty">Vos nouvelles conversations apparaîtront ici.</p>
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
