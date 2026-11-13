"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SearchBar from "./SearchBar";
import CategoryChips from "./CategoryChips";
import ProductGrid from "./ProductGrid";
import { catLabels } from "@/data/products";
import { norm } from "@/lib/format";
import { useProducts } from "@/hooks/useProducts";

export default function Catalogue() {
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { products, loading, error, refresh } = useProducts();
  const requestedCategory = useSearchParams().get("categorie");
  const cat = selectedCategory ?? (
    requestedCategory && Object.keys(catLabels).includes(requestedCategory)
      ? requestedCategory
      : "all"
  );

  const nq = norm(q);
  const items = products.filter(
    (p) => (cat === "all" || p.cat === cat) && (nq === "" || norm(p.name + " " + (catLabels[p.cat] ?? p.cat)).includes(nq))
  );

  if (loading) {
    return <div className="wrap shop" style={{ paddingTop: 32, paddingBottom: 64 }} aria-busy="true">Chargement du catalogue…</div>;
  }

  if (error) {
    return (
      <div className="wrap shop" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div className="card empty" role="alert">
          <h3 style={{ fontSize: 22, fontWeight: 700 }}>Catalogue indisponible</h3>
          <p className="muted">{error}</p>
          <button className="btn btn-green" type="button" onClick={refresh}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap shop" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <div className="shop-main">
        <SearchBar value={q} onChange={setQ} />
        <CategoryChips current={cat} onPick={setSelectedCategory} />
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, fontSize: 15 }} className="muted">
          <span>{items.length} produit(s)</span>
          <span style={{ fontSize: 13 }}>Prix et disponibilités à confirmer avant commande.</span>
        </div>

        {items.length === 0 ? (
          <div className="card empty">
            <h3 style={{ fontSize: 22, fontWeight: 700 }}>Aucun produit trouvé</h3>
            <p className="muted">Essayez un autre mot-clé ou une autre catégorie, ou demandez-nous le produit qu&apos;il vous faut.</p>
            <Link className="btn btn-green" href="/devis">Demander un devis</Link>
          </div>
        ) : (
          <ProductGrid items={items} />
        )}
      </div>
    </div>
  );
}