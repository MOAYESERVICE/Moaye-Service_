import Image from "next/image";
import { fcfa } from "@/lib/format";
import type { Product } from "@/types/product";

type OrderRecapProps = {
  lines: { p: Product; qty: number }[];
  subtotal: number;
  delivery: "delivery" | "pickup";
  loading: boolean;
};

export default function OrderRecap({ lines, subtotal, delivery, loading }: OrderRecapProps) {
  return (
    <div className="card block">
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Récapitulatif</h2>
      {lines.map(({ p, qty }) => (
        <div className="checkout-recap-line" key={p.id}>
          <div className="checkout-recap-image">
            {p.image ? <Image src={p.image} alt="" fill sizes="56px" /> : <span aria-hidden="true">MS</span>}
          </div>
          <div className="checkout-recap-info">
            <strong>{p.name}</strong>
            <span>{qty} × {fcfa(p.price)}</span>
          </div>
          <strong className="checkout-recap-total">{fcfa(p.price * qty)}</strong>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span>Sous-total</span>
        <strong>{fcfa(subtotal)}</strong>
      </div>
      <p className="muted">
        {delivery === "delivery"
          ? "Les frais de livraison seront confirmés selon la zone."
          : "Retrait sur place, sur rendez-vous."}
      </p>
      <button className="btn btn-amber" type="submit" disabled={loading}>
        {loading ? "Envoi en cours…" : "Confirmer la commande"}
      </button>
    </div>
  );
}
