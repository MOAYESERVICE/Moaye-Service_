import { Suspense } from "react";
import Catalogue from "@/components/shop/Catalogue";

export const metadata = { title: "Produits et équipements — MOAYE SERVICE" };

export default function ProduitsPage() {
  return (
    <main>
      <section className="page-hero catalogue-hero">
        <div className="wrap stack" style={{ paddingTop: 44, paddingBottom: 44, gap: 12 }}>
          <span className="tag">Produits</span>
          <h1>Catalogue produits et équipements</h1>
          <p>Découvrez nos aliments, animaux d&apos;élevage, équipements et matériel. Passez commande en ligne : notre équipe vous contactera pour confirmer la livraison et le paiement.</p>
        </div>
      </section>
      <Suspense fallback={<div className="wrap" aria-busy="true" />}>
        <Catalogue />
      </Suspense>
    </main>
  );
}
