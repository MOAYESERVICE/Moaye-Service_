import { steps } from "@/data/aqua";

export default function Steps() {
  return (
    <section className="section" data-reveal data-home-order="steps">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Accompagnement</span>
          <h2>De la conception au suivi, un seul interlocuteur</h2>
        </div>
        <div className="grid grid-240">
          {steps.map((s) => (
            <div key={s.n} className="card pad">
              <span className="num">{s.n}</span>
              <h3>{s.title}</h3>
              <p className="muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}