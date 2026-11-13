import { methodSteps } from "@/data/home";

export default function MethodSection() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="head">
          <span className="eyebrow">Notre méthode</span>
          <h2 className="h2">Cinq étapes pour mener votre projet à bien</h2>
        </div>
        <ol className="grid" style={{ listStyle: "none", margin: 0, padding: 0, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))" }}>
          {methodSteps.map((s) => (
            <li key={s.n} className="card pad method-step-card" style={{ gap: 12 }}>
              <span className="num">{s.n}</span>
              <h3 style={{ fontSize: 20 }}>{s.title}</h3>
              <p className="muted" style={{ fontSize: 15 }}>{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
