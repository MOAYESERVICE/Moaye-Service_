import { method } from "@/data/expertise";

export default function MethodSteps() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Notre méthode</span>
          <h2>De la conception au suivi, étape par étape</h2>
        </div>
        <div className="grid grid-240">
          {method.map((m) => (
            <div key={m.n} className="card pad">
              <span className="num">{m.n}</span>
              <h3>{m.title}</h3>
              <ul className="bullets muted">{m.points.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}