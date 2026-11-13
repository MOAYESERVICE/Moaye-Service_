"use client";
import { catLabels } from "@/data/products";

export default function CategoryChips({ current, onPick }: { current: string; onPick: (id: string) => void }) {
  const list = [{ id: "all", label: "Tous" }, ...Object.entries(catLabels).map(([id, label]) => ({ id, label }))];
  return (
    <div className="chips" role="group" aria-label="Catégories">
      {list.map((c) => (
        <button key={c.id} className={c.id === current ? "chip on" : "chip"} aria-pressed={c.id === current} onClick={() => onPick(c.id)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}