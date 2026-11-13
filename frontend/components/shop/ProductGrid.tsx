"use client";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/product";

export default function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="pgrid">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}