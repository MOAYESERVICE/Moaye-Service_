import type { DemoOrder } from "@/data/demo";

const STEPS = ["Reçue", "Confirmée", "En préparation", "Expédiée", "Livrée"];
const INDEX: Record<DemoOrder["status"], number> = { pending: 0, confirmed: 1, preparing: 2, shipped: 3, delivered: 4, cancelled: 0 };

export default function OrderTracker({ order }: { order: DemoOrder }) {
  const cur = INDEX[order.status];
  const dateOf = (i: number) => i === 0 ? order.date : "";
  return (
    <div className="pt-track">
      <div className="pt-track-line" />
      <div className="pt-track-fill" style={{ width: `calc(80% * ${cur / 4})` }} />
      <ol className="pt-steps">
        {STEPS.map((label, i) => (
          <li key={label}>
            <span className={`pt-step${i < cur ? " done" : i === cur ? " cur" : ""}`}>{i < cur ? "✓" : i + 1}</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <strong style={{ fontSize: 14.5 }}>{label}</strong>
              {dateOf(i) && <span style={{ fontSize: 13, color: "#5B726B" }}>{dateOf(i)}</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
