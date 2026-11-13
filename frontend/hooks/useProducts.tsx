"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getProducts } from "@/lib/api";
import type { Product } from "@/types/product";

type ProductsContextValue = {
  products: Product[];
  loading: boolean;
  error: string;
  refresh: () => void;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestNumber, setRequestNumber] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getProducts(controller.signal)
      .then((result) => {
        setProducts(result);
        setError("");
      })
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Le catalogue est indisponible.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [requestNumber]);

  const refresh = () => {
    setLoading(true);
    setError("");
    setRequestNumber((number) => number + 1);
  };

  return (
    <ProductsContext.Provider value={{ products, loading, error, refresh }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts doit être utilisé dans <ProductsProvider>");
  return context;
}
