"use client";

export default function Segmented<T extends string | number>({
  options, value, onChange, label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="pt-sg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.id)} className={o.id === value ? "on" : ""} aria-pressed={o.id === value} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}