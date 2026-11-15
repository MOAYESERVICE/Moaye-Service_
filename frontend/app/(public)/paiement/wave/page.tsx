"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/hooks/useCart";

export default function WavePaymentReturnPage() {
  const [result, setResult] = useState<string | null>(null);
  const { clear } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    setResult(new URLSearchParams(window.location.search).get("result"));
  }, []);

  useEffect(() => {
    if (result === "success" && !cleared.current) {
      cleared.current = true;
      clear();
    }
  }, [result, clear]);

  const wasSuccessful = result === "success";

  return (
    <main className="wrap" style={{ paddingTop: 48, paddingBottom: 72 }}>
      <section className="card block" role="status" style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ fontSize: 30, fontWeight: 700 }}>
          {wasSuccessful ? "Paiement transmis" : "Paiement non terminé"}
        </h1>
        <p className="muted" style={{ lineHeight: 1.6 }}>
          {wasSuccessful
            ? "Nous attendons la confirmation sécurisée de Wave. La commande sera confirmée automatiquement après réception de cette confirmation."
            : "Votre paiement n’a pas été confirmé. Votre panier est conservé ; vous pouvez réessayer."}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link className="btn btn-green" href="/mon-compte/commandes">Voir mes commandes</Link>
          {!wasSuccessful && <Link className="btn btn-ghost" href="/panier">Retour au panier</Link>}
        </div>
      </section>
    </main>
  );
}
