"use client";
import Link from "next/link";
import CartItem from "./CartItem";
import { useProducts } from "@/hooks/useProducts";
import { fcfa } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/product";

export default function CartSummary() {
  const { cart, count } = useCart();
  const { products, loading, error, refresh } = useProducts();
  const items = Object.keys(cart)
    .map((id) => {
      const p = products.find((x) => x.id === id);
      return p ? { p, qty: cart[id] } : null;
    })
    .filter(Boolean) as { p: Product; qty: number }[];
  const total = items.reduce((sum, i) => sum + i.p.price * i.qty, 0);

  if (loading) {
    return <div className="card cart" aria-busy="true">Chargement du panier…</div>;
  }

  if (error) {
    return (
      <div className="card cart" role="alert">
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Panier indisponible</h2>
        <p className="muted">{error}</p>
        <button className="btn btn-green" type="button" onClick={refresh}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="card cart" id="panier">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Votre panier</h2>
        <span className="muted" style={{ fontSize: 14 }}>{count} article(s)</span>
      </div>
      {items.length === 0 && <p className="muted">Votre panier est vide. Ajoutez des produits depuis le catalogue.</p>}
      {items.map((i) => <CartItem key={i.p.id} p={i.p} qty={i.qty} />)}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontWeight: 600 }}>Total</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>{fcfa(total)}</span>
      </div>
      <div className="cart-actions">
        <Link className="btn btn-amber cart-action-link" href={items.length === 0 ? "/produits" : "/commande"}>
          {items.length === 0 ? "Choisir des produits" : "Passer la commande"}
        </Link>
        <Link className="btn btn-ghost cart-action-link" href="/devis">Demander un devis</Link>
      </div>
      <p className="muted" style={{ fontSize: 13 }}>Les frais de livraison et le mode de paiement seront confirmés avec vous.</p>
    </div>
  );
}