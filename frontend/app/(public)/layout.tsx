import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/hooks/useCart";
import { ProductsProvider } from "@/hooks/useProducts";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProductsProvider>
      <CartProvider>
        <Header />
        {children}
        <Footer />
      </CartProvider>
    </ProductsProvider>
  );
}
