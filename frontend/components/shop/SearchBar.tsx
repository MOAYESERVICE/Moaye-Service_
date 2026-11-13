"use client";

export default function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="search">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A625B" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
      <label htmlFor="q" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Rechercher un produit</label>
      <input id="q" className="field" type="search" placeholder="Rechercher un produit…" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}