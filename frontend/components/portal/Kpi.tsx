import Icon from "@/components/ui/Icon";
import Sparkline from "./Sparkline";

export default function Kpi({
  label, value, icon, caption, captionColor, spark,
}: {
  label: string;
  value: string;
  icon: string;
  caption: string;
  captionColor?: string;
  spark?: number[];
}) {
  return (
    <div className="pt-panel pt-kpi">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <span className="pt-muted" style={{ fontWeight: 500 }}>{label}</span>
        <span className="pt-ico"><Icon d={icon} size={22} /></span>
      </div>
      <span className="pt-big">{value}</span>
      {spark && <Sparkline values={spark} />}
      <span style={{ fontSize: 14, fontWeight: captionColor ? 600 : 400, color: captionColor ?? "#5B726B" }}>{caption}</span>
    </div>
  );
}