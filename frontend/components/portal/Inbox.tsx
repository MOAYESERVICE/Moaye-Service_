"use client";
import { useEffect, useState } from "react";
import type { Thread } from "@/data/demo";

type Row = Thread & { unread: boolean };

export default function Inbox({
  threads, viewer, onOpen, onSend,
}: {
  threads: Row[];
  viewer: "client" | "staff";
  onOpen: (id: string) => void;
  onSend: (id: string, text: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const current = threads.find((t) => t.id === selected) ?? threads[0];

  useEffect(() => {
    if (current) onOpen(current.id); // ouvrir une conversation la marque comme lue
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  if (!current) {
    return <div className="pt-panel pt-pp"><p className="pt-muted">Aucun message.</p></div>;
  }

  const send = () => {
    if (!text.trim()) return;
    onSend(current.id, text.trim());
    setText("");
  };

  return (
    <div className="pt-panel pt-inbox">
      <section className="pt-inbox-list" aria-label="Conversations">
        {threads.map((t) => (
          <button key={t.id} className={`pt-thread${t.id === current.id ? " on" : ""}`} onClick={() => setSelected(t.id)}>
            <span className="pt-thread-unread" style={{ background: t.unread ? "#B4501A" : "transparent" }} />
            <span className="pt-thread-body">
              <span className="pt-thread-top"><strong style={{ fontSize: 15.5 }}>{viewer === "staff" ? t.client : t.subject}</strong><span>{t.time}</span></span>
              {viewer === "staff" && <span className="pt-thread-sub">{t.subject}</span>}
              <span className="pt-thread-prev">{t.msgs[t.msgs.length - 1].text}</span>
            </span>
          </button>
        ))}
      </section>

      <section className="pt-inbox-view" aria-label="Conversation">
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E1EAE4", display: "flex", flexDirection: "column" }}>
          <strong>{current.subject}</strong>
          <span style={{ fontSize: 14, color: "#5B726B" }}>{viewer === "staff" ? current.client : "MOAYE SERVICES · conseiller"}</span>
        </div>
        <div className="pt-msgs">
          {current.msgs.map((m, i) => (
            <div key={i} className={`pt-msg${m.from === viewer ? " me" : ""}`}>
              <span style={{ lineHeight: 1.55 }}>{m.text}</span>
              <small>{m.time}</small>
            </div>
          ))}
        </div>
        <div className="pt-reply">
          <label htmlFor="pt-reply" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Votre réponse</label>
          <textarea
            id="pt-reply" className="inp" rows={1} style={{ padding: "12px 14px", resize: "none" }}
            placeholder="Écrire une réponse…" value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button className="btn btn-green" disabled={!text.trim()} onClick={send}>Envoyer</button>
        </div>
      </section>
    </div>
  );
}