"use client";
import Image from "next/image";
import { fcfa } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/product";
import { catLabels } from "@/data/products";

export default function CartItem({ p, qty }: { p: Product; qty: number }) {
  const { setQty, remove } = useCart();
  return (
    <div className="cart-line">
      <div className="cart-item-details">
        <div className="cart-item-photo">
          {p.image ? <Image src={p.image} alt={`Photo indicative : ${p.name}`} fill sizes="100px" /> : <span>{p.photo}</span>}
        </div>
        <div className="cart-item-copy">
          <span className="cart-item-category">{catLabels[p.cat] ?? p.cat}</span>
          <strong>{p.name}</strong>
          <span className="cart-item-description">{p.desc}</span>
          {p.specs.length > 0 && (
            <ul className="cart-item-specs">
              {p.specs.map((spec) => <li key={spec}>{spec}</li>)}
            </ul>
          )}
          {p.image && <span className="cart-item-caption">Photo indicative</span>}
        </div>
        <strong className="cart-item-subtotal">{fcfa(p.price * qty)}</strong>
      </div>
      <div className="qty">
        <button className="qb" onClick={() => setQty(p.id, -1)} aria-label="Diminuer la quantité">−</button>
        <span className="cart-item-quantity" aria-label={`Quantité : ${qty}`}>{qty}</span>
        <button className="qb" onClick={() => setQty(p.id, 1)} aria-label="Augmenter la quantité">+</button>
        <button className="lnk" onClick={() => remove(p.id)}>Retirer</button>
      </div>
    </div>
  );
}