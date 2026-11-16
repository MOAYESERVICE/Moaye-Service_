import Link from "next/link";
import { process } from "@/data/quote";
import { whatsappHref } from "@/lib/whatsapp";

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
        <span style={{ lineHeight: 1.5, color: "#E3F1EA" }}>Échangez directement avec notre équipe sur WhatsApp pour parler de votre projet.</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <a className="btn btn-amber btn-sm" href={whatsappHref("Bonjour, j’aimerais parler de mon projet et demander un devis.")} target="_blank" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a8.8 8.8 0 0 0-7.6 13.2L3.2 21l5-1.3A8.8 8.8 0 1 0 12 3Zm0 15.8a7 7 0 0 1-3.6-1l-.3-.2-3 .8.8-2.9-.2-.3A7 7 0 1 1 12 18.8Zm3.8-5.2c-.2-.1-1.3-.7-1.5-.7s-.4-.1-.5.1-.6.7-.7.8-.3.2-.5.1a6 6 0 0 1-1.8-1.1 6.7 6.7 0 0 1-1.2-1.5c-.1-.2 0-.3.1-.4l.4-.5.2-.4v-.4c0-.1-.5-1.2-.7-1.6s-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3a2.5 2.5 0 0 0-.8 1.9 4.4 4.4 0 0 0 .9 2.3 10.1 10.1 0 0 0 3.9 3.4c.5.2.9.4 1.2.4.5.1 1 .1 1.4 0 .4-.1 1.3-.5 1.5-1s.2-.9.2-1-.2-.2-.4-.3Z" fill="currentColor" /></svg>Écrire sur WhatsApp</a>
          <Link className="btn btn-amber btn-sm" href="/contact">Voir la page contact</Link>
        </div>
      </div>
    </aside>
  );
}
