"use client";
import Link from "next/link";
import PhotoSlot from "@/components/ui/PhotoSlot";
import ProductGrid from "./ProductGrid";
import AddToCartButton from "./AddToCartButton";
import { catLabels, products, stockInfo } from "@/data/products";
import { fcfa } from "@/lib/format";
import type { Product } from "@/types/product";

export default function ProductDetail({
  p,
  relatedProducts = products,
  canAddToCart = true,
}: {
  p: Product;
  relatedProducts?: Product[];
  canAddToCart?: boolean;
}) {
  const s = stockInfo[p.stock];
  const imageFit = /poulet|oie/i.test(p.name) ? "contain" : (p.imageFit ?? "cover");
  const related = [
    ...relatedProducts.filter((product) => product.id !== p.id && product.cat === p.cat),
    ...relatedProducts.filter((product) => product.id !== p.id && product.cat !== p.cat),
  ].slice(0, 4);

  return (
    <main className="wrap" style={{ paddingTop: 40, paddingBottom: 72 }}>
      <Link className="more" href="/produits">← Retour au catalogue</Link>
      <article className="card detail" style={{ marginTop: 20 }}>
        <PhotoSlot label={p.photo} height={360} src={p.image} fit={imageFit} showLabel={!p.image} />
        <div className="stack" style={{ gap: 16 }}>
          <span className="tag">{catLabels[p.cat] ?? p.cat}</span>
          <h1 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 700 }}>{p.name}</h1>
          <span className={`av ${s.cls}`}>{s.label}</span>
          <p className="muted" style={{ fontSize: 17 }}>{p.desc}</p>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Caractéristiques</h2>
            {p.specs.length > 0 && <ul className="bullets">{p.specs.map((x) => <li key={x}>{x}</li>)}</ul>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
            <span className="price" style={{ fontSize: 28, marginTop: 0 }}>{fcfa(p.price)}</span>
            <AddToCartButton productId={p.id} productName={p.name} label="Ajouter au panier" className="btn btn-amber" disabled={p.stock === "out" || !canAddToCart} />
            <Link className="btn btn-ghost" href="/panier">Voir le panier</Link>
          </div>
        </div>
      </article>
      {related.length > 0 && (
        <section aria-labelledby="related-products-title" style={{ marginTop: 56 }}>
          <div className="section-head">
            <span className="eyebrow">À découvrir également</span>
            <h2 id="related-products-title">D&apos;autres produits qui pourraient vous intéresser</h2>
          </div>
          <ProductGrid items={related} />
        </section>
      )}
    </main>
  );
}
