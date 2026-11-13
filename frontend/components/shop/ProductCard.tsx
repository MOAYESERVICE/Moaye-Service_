"use client";
import Link from "next/link";
import PhotoSlot from "@/components/ui/PhotoSlot";
import AddToCartButton from "./AddToCartButton";
import { catLabels, stockInfo } from "@/data/products";
import { fcfa } from "@/lib/format";
import type { Product } from "@/types/product";

export default function ProductCard({ p }: { p: Product }) {
  const s = stockInfo[p.stock];
  const imageFit = /poulet|oie/i.test(p.name) ? "contain" : (p.imageFit ?? "cover");
  return (
    <article className="card pcard">
      <PhotoSlot label={p.photo} src={p.image} fit={imageFit} showLabel={!p.image} />
      <div className="pbody">
        <span className="pcat">{catLabels[p.cat] ?? p.cat}</span>
        <h3 className="pname">
          <Link href={`/produits/${p.id}`}>{p.name}</Link>
        </h3>
        <span className={`av ${s.cls}`}>{s.label}</span>
        <span className="price">{fcfa(p.price)}</span>
      </div>
      <div className="pactions">
        <Link className="btn btn-ghost" href={`/produits/${p.id}`}>Détails</Link>
        <AddToCartButton productId={p.id} productName={p.name} label="Ajouter" className="btn btn-green" disabled={p.stock === "out"} />
      </div>
    </article>
  );
}
