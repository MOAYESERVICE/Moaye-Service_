import Icon from "@/components/ui/Icon";
import { assets } from "@/data/home";

export default function AssetsStrip() {
  return (
    <section className="strip">
      <div className="wrap strip-in">
        {assets.map((a) => (
          <div key={a.label} className="strip-item">
            <div className="icon-box" style={{ flex: "none" }}><Icon d={a.icon} size={26} /></div>
            <span>{a.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}