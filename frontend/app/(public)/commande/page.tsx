import CheckoutForm from "@/components/shop/CheckoutForm";

export const metadata = { title: "Commande — MOAYE SERVICE" };

export default function CommandePage() {
  return (
    <main>
      <section className="page-hero">
        <div className="wrap stack" style={{ paddingTop: 40, paddingBottom: 40, gap: 12 }}>
          <span className="tag">Commande</span>
          <h1 style={{ fontSize: "clamp(30px,4vw,44px)", fontWeight: 700 }}>Finaliser ma commande</h1>
        </div>
      </section>
      <CheckoutForm />
    </main>
  );
}