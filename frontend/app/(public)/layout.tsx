import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Logo from "@/components/layout/Logo";
import { CartProvider } from "@/hooks/useCart";
import { ProductsProvider } from "@/hooks/useProducts";
import { Suspense } from "react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProductsProvider>
      <CartProvider>
        <Suspense fallback={<>
          <header className="hdr solid" aria-hidden="true">
            <div className="wrap header-inner"><Logo /></div>
          </header>
          <div className="hdr-spacer" />
        </>}>
          <Header />
        </Suspense>
        {children}
        <Footer />
      </CartProvider>
    </ProductsProvider>
  );
}
