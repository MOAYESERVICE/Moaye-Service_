"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { products as legacyProducts } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";

type Cart = Record<string, number>;
type CartCtx = {
  cart: Cart;
  count: number;
  add: (id: string) => void;
  setQty: (id: string, delta: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartCtx | null>(null);

function normalizeCart(cart: Cart, products: Product[]): Cart {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const productsByName = new Map(products.map((product) => [product.name.trim().toLocaleLowerCase(), product]));
  const legacyNames = new Map(legacyProducts.map((product) => [product.id, product.name]));
  const normalized: Cart = {};

  for (const [storedId, quantity] of Object.entries(cart)) {
    if (!Number.isSafeInteger(quantity) || quantity < 1) continue;
    const product = productsById.get(storedId)
      ?? (legacyNames.has(storedId)
        ? productsByName.get(legacyNames.get(storedId)!.trim().toLocaleLowerCase())
        : undefined);
    if (!product) continue;
    normalized[product.id] = Math.min(999, (normalized[product.id] ?? 0) + quantity);
  }

  return normalized;
}

function parseStoredCart(raw: string | null): Cart {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter(([id, quantity]) =>
        id.length > 0 && Number.isSafeInteger(quantity) && Number(quantity) >= 1 && Number(quantity) <= 999,
      ),
    ) as Cart;
  } catch {
    return {};
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const [cart, setCart] = useState<Cart>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("moaye-cart");
    // Cart storage is read after hydration to keep server-rendered output deterministic.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(parseStoredCart(raw));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || productsLoading || productsError || products.length === 0) return;
    // Replaces obsolete local product IDs with current database IDs and drops removed items.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart((current) => {
      const normalized = normalizeCart(current, products);
      return JSON.stringify(normalized) === JSON.stringify(current) ? current : normalized;
    });
  }, [loaded, products, productsError, productsLoading]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("moaye-cart", JSON.stringify(cart));
    } catch {}
  }, [cart, loaded]);

  const canonicalCart = (current: Cart) =>
    !productsLoading && !productsError ? normalizeCart(current, products) : current;

  const add = (id: string) => setCart((current) => {
    const next = canonicalCart(current);
    return { ...next, [id]: Math.min(999, (next[id] || 0) + 1) };
  });
  const setQty = (id: string, delta: number) =>
    setCart((current) => {
      const next = { ...canonicalCart(current) };
      const q = (next[id] || 0) + delta;
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });
  const remove = (id: string) =>
    setCart((current) => {
      const next = { ...canonicalCart(current) };
      delete next[id];
      return next;
    });
  const clear = () => setCart({});

  const visibleCart = !productsLoading && !productsError && products.length > 0
    ? normalizeCart(cart, products)
    : {};
  const count = Object.values(visibleCart).reduce((sum, quantity) => sum + quantity, 0);

  return <CartContext.Provider value={{ cart: visibleCart, count, add, setQty, remove, clear }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
