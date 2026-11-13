import CartSummary from "@/components/shop/CartSummary";

export const metadata = { title: "Panier — MOAYE SERVICE" };

export default function PanierPage() {
  return (
    <main className="wrap" style={{ padding: "48px 24px", maxWidth: 640 }}>
      <CartSummary />
    </main>
  );
}