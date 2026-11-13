import Link from "next/link";
import { process } from "@/data/quote";

export default function QuoteAside() {
  return (
    <aside className="checkout-side">
      <div className="card block">
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Comment ça se passe</h2>
        {process.map((p) => (
          <div key={p.n} className="proc">
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, color: "var(--laterite)", lineHeight: 1 }}>{p.n}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <strong>{p.title}</strong>
              <span className="muted">{p.desc}</span>
            </div>
          </div>
        ))}
        <p className="muted" role="note">Les demandes de devis ne peuvent pas encore être transmises en ligne.</p>
      </div>

      <div className="card block" style={{ background: "var(--green)", borderColor: "var(--green)", color: "#fff", gap: 10, padding: 24 }}>
        <strong style={{ fontSize: 18 }}>Un doute sur votre projet ?</strong>
        <span style={{ lineHeight: 1.5, color: "#E3F1EA" }}>L’assistant interactif et le numéro WhatsApp ne sont pas encore disponibles.</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link className="btn btn-amber btn-sm" href="/contact">Voir la page contact</Link>
        </div>
      </div>
    </aside>
  );
}