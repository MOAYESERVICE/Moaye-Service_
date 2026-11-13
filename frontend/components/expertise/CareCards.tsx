import Icon from "@/components/ui/Icon";
import { care } from "@/data/expertise";

export default function CareCards() {
  return (
    <section className="section section-dark">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow eyebrow-light">Au quotidien</span>
          <h2>Gestion, suivi et accompagnement des élevages</h2>
        </div>
        <div className="grid grid-300">
          {care.map((c) => (
            <div key={c.title} className="dcard pad">
              <div className="icon-box icon-box-dark"><Icon d={c.icon} /></div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}