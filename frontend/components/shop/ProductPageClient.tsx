"use client";

import Link from "next/link";
import ProductDetail from "@/components/shop/ProductDetail";
import { products as demoProducts } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";

export default function ProductPageClient({ id }: { id: string }) {
  const { products, loading, error, refresh } = useProducts();

  if (loading) {
    return <main className="wrap" style={{ paddingTop: 40, paddingBottom: 72 }} aria-busy="true">Chargement du produit…</main>;
  }

  if (error) {
    return (
      <main className="wrap" style={{ paddingTop: 40, paddingBottom: 72 }}>
        <div className="card empty" role="alert">
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Produit indisponible</h1>
          <p className="muted">{error}</p>
          <button className="btn btn-green" type="button" onClick={refresh}>Réessayer</button>
        </div>
      </main>
    );
  }

  const product = products.find((item) => item.id === id);
  if (product) return <ProductDetail p={product} relatedProducts={products} />;

  const demoProduct = demoProducts.find((item) => item.id === id);
  if (demoProduct) {
    return (
      <main>
        <p className="wrap muted" role="note" style={{ paddingTop: 20 }}>
          Cet aperçu n&apos;est pas un produit enregistré dans le catalogue actif.
        </p>
        <ProductDetail p={demoProduct} relatedProducts={demoProducts} canAddToCart={false} />
      </main>
    );
  }

  return (
    <main className="wrap" style={{ paddingTop: 40, paddingBottom: 72 }}>
      <div className="card empty">
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Produit introuvable</h1>
        <p className="muted">Ce produit n&apos;est pas disponible dans le catalogue.</p>
        <Link className="btn btn-green" href="/produits">Retour au catalogue</Link>
      </div>
    </main>
  );
}
