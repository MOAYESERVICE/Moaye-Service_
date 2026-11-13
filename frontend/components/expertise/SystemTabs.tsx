"use client";
import { useState } from "react";
import Link from "next/link";
import PhotoSlot from "@/components/ui/PhotoSlot";
import { systems } from "@/data/expertise";

export default function SystemTabs() {
  const [current, setCurrent] = useState(systems[0].id);
  const sel = systems.find((s) => s.id === current) ?? systems[0];

  return (
    <>
      <div className="tabs" role="group" aria-label="Choisir un système d'élevage">
        {systems.map((s) => (
          <button key={s.id} className={s.id === current ? "tab on" : "tab"} aria-pressed={s.id === current} onClick={() => setCurrent(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="card sys">
        <PhotoSlot label={sel.title} height={320} src={sel.image} />
        <div className="stack">
          <h3>{sel.title}</h3>
          <p className="muted" style={{ fontSize: 17, lineHeight: 1.6 }}>{sel.desc}</p>
          <div className="sys-cols">
            <div>
              <strong style={{ color: "var(--green-dark)" }}>Adapté si</strong>
              <ul className="bullets">{sel.suits.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
            <div>
              <strong style={{ color: "var(--green-dark)" }}>Points clés</strong>
              <ul className="bullets">{sel.keys.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          </div>
          <div><Link className="btn btn-amber" href="/devis">Demander un devis pour ce système</Link></div>
        </div>
      </div>
    </>
  );
}