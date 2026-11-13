"use client";

export default function OptionCards({
  options, value, onChange,
}: {
  options: { id: string; title: string; desc?: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="opts">
      {options.map((o) => (
        <button type="button" key={o.id} className={o.id === value ? "opt on" : "opt"} aria-pressed={o.id === value} onClick={() => onChange(o.id)}>
          <span className="radio" />
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <strong>{o.title}</strong>
            {o.desc && <span className="muted" style={{ fontSize: 14 }}>{o.desc}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}