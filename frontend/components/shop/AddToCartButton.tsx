"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { addCartItem } from "@/lib/api";

type AddToCartButtonProps = {
  productId: string;
  disabled: boolean;
  className: string;
  label: string;
  productName: string;
};

export default function AddToCartButton({ productId, disabled, className, label, productName }: AddToCartButtonProps) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState("");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const handleAdd = () => {
    add(productId);
    setAdded(true);
    setMessage("");
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setAdded(false), 1800);

    void addCartItem(productId).catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : "Le panier serveur n’a pas pu être mis à jour.");
    });
  };

  return (
    <>
      <button
        className={className}
        type="button"
        disabled={disabled}
        onClick={handleAdd}
        aria-label={added ? `${productName} ajouté au panier` : `Ajouter ${productName} au panier`}
        aria-live="polite"
      >
        {disabled ? "Indisponible" : added ? "Ajouté ✓" : label}
      </button>
      {message && <span className="err" role="alert">{message}</span>}
    </>
  );
}
