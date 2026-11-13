"use client";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { ICONS } from "./icons";

export type Notice = { id?: string; title: string; time: string; href?: string; unread?: boolean };

export default function Bell({ items, unread, onRead, onItemRead }: {
  items: Notice[];
  unread: number;
  onRead: () => void;
  onItemRead?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-ghost pt-notification-button" onClick={() => setOpen(!open)} aria-label="Notifications" aria-expanded={open}>
        <Icon d={ICONS.bell} size={20} />
        {unread > 0 && <span className="pt-nb" style={{ position: "absolute", top: -7, right: -7 }}>{unread}</span>}
      </button>
      {open && (
        <div className="pt-panel pt-notification-panel">
          <div className="pt-notification-header">
            <div><strong>Notifications</strong><span>{items.length} activité{items.length === 1 ? "" : "s"} récente{items.length === 1 ? "" : "s"}</span></div>
            <button className="pt-link" onClick={onRead}>Tout marquer comme lu</button>
          </div>
          {items.length === 0 && <p className="pt-notification-empty">Rien de nouveau pour le moment.</p>}
          {items.map((n, index) => {
            const content = (
              <>
                <span className={(n.unread ?? unread > 0) ? "pt-notification-dot unread" : "pt-notification-dot"} aria-hidden="true" />
                <div><strong>{n.title}</strong><span>{n.time}</span></div>
              </>
            );
            const key = n.id ?? `${n.title}-${index}`;

            return n.href ? (
              <Link
                key={key}
                href={n.href}
                className="pt-notification-item is-link"
                onClick={() => {
                  if (n.id) onItemRead?.(n.id);
                  setOpen(false);
                }}
              >
                {content}
              </Link>
            ) : (
              <div key={key} className="pt-notification-item">{content}</div>
            );
          })}
        </div>
      )}
    </>
  );
}
