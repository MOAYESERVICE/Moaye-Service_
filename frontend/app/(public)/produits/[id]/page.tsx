import { Suspense } from "react";
import ProductPageClient from "@/components/shop/ProductPageClient";

export const metadata = { title: "Produit — MOAYE SERVICE" };

async function ProductPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductPageClient id={id} />;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<main className="wrap" style={{ paddingTop: 40, paddingBottom: 72 }} aria-busy="true">Chargement du produit…</main>}>
      <ProductPageContent params={params} />
    </Suspense>
  );
}
