import { Suspense } from "react";
import QuoteForm from "@/components/quote/QuoteForm";
import QuoteAside from "@/components/quote/uoteAside";

export const metadata = { title: "Demande de devis — MOAYE SERVICE" };

export default function DevisPage() {
  return (
    <main>
      <section className="page-hero quote-hero">
        <div className="wrap stack" style={{ paddingTop: 40, paddingBottom: 40, gap: 12 }}>
          <span className="tag">Demande de devis</span>
          <h1 style={{ fontSize: "clamp(30px,4vw,44px)", fontWeight: 700 }}>Décrivez votre projet, nous vous proposons un devis</h1>
          <p>Vous pouvez renseigner les détails de votre projet. La transmission de la demande en ligne n’est pas encore disponible.</p>
        </div>
      </section>
      <div className="wrap checkout">
        <Suspense fallback={null}>
          <QuoteForm />
        </Suspense>
        <QuoteAside />
      </div>
    </main>
  );
}