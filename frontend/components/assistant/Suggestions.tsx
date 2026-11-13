import { suggestions } from "@/data/assistant";

export default function Suggestions({
  onPick, items = suggestions, compact = false,
}: {
  onPick: (text: string) => void;
  items?: string[];
  compact?: boolean;
}) {
  return (
    <div className="sugg" role="group" aria-label="Questions suggérées" style={compact ? { gap: 8 } : undefined}>
      {items.map((s) => (
        <button key={s} className={`chip sugg-button${compact ? " compact" : ""}`} onClick={() => onPick(s)}>
          {s}
        </button>
      ))}
    </div>
  );
}