"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthField from "@/components/auth/AuthField";
import PhoneField from "@/components/auth/PhoneField";
import OptionCards from "@/components/ui/OptionCards";
import CheckoutSteps from "./CheckoutSteps";
import OrderRecap from "./OrderRecap";
import { checkoutSchema, type CheckoutData } from "@/lib/validators";
import { sendOrder } from "@/lib/api";
import { formatInternationalPhone } from "@/lib/phone";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";

const deliveryOpts = [
  { id: "delivery", title: "Livraison à l'adresse", desc: "Frais selon la zone, à confirmer" },
  { id: "pickup", title: "Retrait sur place", desc: "Gratuit, sur rendez-vous" },
];
const payOpts = [
  { id: "CARD", title: "Carte bancaire", desc: "Visa, Mastercard" },
  { id: "BANK_TRANSFER", title: "Virement bancaire", desc: "Transfert depuis votre compte" },
  { id: "WAVE", title: "Wave", desc: "Portefeuille électronique" },
  { id: "PAYTECH", title: "Paytech", desc: "Paiement mobile" },
];

export default function CheckoutForm() {
  const { cart, clear } = useCart();
  const { products, loading: productsLoading, error: productsError, refresh } = useProducts();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [ref, setRef] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [phoneCode, setPhoneCode] = useState("+225");

  const lines = Object.keys(cart)
    .map((id) => {
      const p = products.find((x) => x.id === id);
      return p ? { p, qty: cart[id] } : null;
    })
    .filter(Boolean) as { p: Product; qty: number }[];
  const subtotal = lines.reduce((sum, l) => sum + l.p.price * l.qty, 0);

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { delivery: "delivery", paymentMethod: "CARD" },
  });
  const delivery = useWatch({ control, name: "delivery" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  const onSubmit = async (data: CheckoutData) => {
    setStatus("idle");
    try {
      const r = await sendOrder(
        { ...data, phone: formatInternationalPhone(data.phone, phoneCode) },
        cart,
      );
      setRef(r);
      setStatus("success");
      clear();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Votre commande n’a pas pu être transmise. Veuillez réessayer ultérieurement.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="wrap" style={{ paddingTop: 36, paddingBottom: 72 }}>
        <div style={{ marginBottom: 24 }}><CheckoutSteps current={2} /></div>
        <div className="card block" role="status" style={{ padding: 36, alignItems: "flex-start" }}>
          <div className="success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B6B57" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 700 }}>Commande enregistrée</h2>
          <p className="muted" style={{ lineHeight: 1.6 }}>
            Merci pour votre commande <strong style={{ color: "var(--ink)" }}>{ref}</strong>. Notre équipe vous contactera pour confirmer la livraison et les modalités de paiement.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link className="btn btn-green" href="/mon-compte/commandes">Voir mes commandes</Link>
            <Link className="btn btn-ghost" href="/produits">Continuer mes achats</Link>
          </div>
        </div>
      </div>
    );
  }

  if (productsLoading) {
    return <div className="wrap" style={{ paddingTop: 36, paddingBottom: 72 }} aria-busy="true">Chargement des produits…</div>;
  }

  if (productsError) {
    return (
      <div className="wrap" style={{ paddingTop: 36, paddingBottom: 72 }}>
        <div className="card empty" role="alert">
          <h3 style={{ fontSize: 22, fontWeight: 700 }}>Commande indisponible</h3>
          <p className="muted">{productsError}</p>
          <button className="btn btn-green" type="button" onClick={refresh}>Réessayer</button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="wrap" style={{ paddingTop: 36, paddingBottom: 72 }}>
        <div className="card empty">
          <h3 style={{ fontSize: 22, fontWeight: 700 }}>Votre panier est vide</h3>
          <p className="muted">Ajoutez des produits avant de passer commande.</p>
          <Link className="btn btn-green" href="/produits">Voir le catalogue</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="wrap" style={{ paddingTop: 36 }}><CheckoutSteps current={1} /></div>
      <div className="wrap checkout" style={{ paddingTop: 24 }}>
        <div className="checkout-main">
          {status === "error" && (
            <div className="alert-error" role="alert">
              <strong>Commande non transmise</strong>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="card block">
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>1. Vos coordonnées</h2>
            <AuthField id="name" label="Nom complet" placeholder="Votre nom" auto="name" error={errors.name?.message} registration={register("name")} />
            <PhoneField id="phone" label="Téléphone" countryCode={phoneCode} onCountryCodeChange={setPhoneCode} error={errors.phone?.message} registration={register("phone")} />
            <AuthField id="email" label="E-mail" type="email" placeholder="vous@exemple.com" auto="email" error={errors.email?.message} registration={register("email")} />
          </div>

          <div className="card block">
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>2. Livraison</h2>
            <OptionCards options={deliveryOpts} value={delivery} onChange={(v) => setValue("delivery", v as CheckoutData["delivery"])} />
            {delivery === "delivery" && (
              <>
                <AuthField id="address" label="Adresse de livraison" placeholder="Quartier, rue, repère" auto="street-address" error={errors.address?.message} registration={register("address")} />
                <AuthField id="city" label="Ville" placeholder="Ex. : Abidjan" auto="address-level2" error={errors.city?.message} registration={register("city")} />
                <AuthField id="zip" label="Code postal" placeholder="Ex. : 01" auto="postal-code" error={errors.zip?.message} registration={register("zip")} />
              </>
            )}
          </div>

          <div className="card block">
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>3. Paiement</h2>
            <OptionCards options={payOpts} value={paymentMethod || "CARD"} onChange={(v) => setValue("paymentMethod", v as CheckoutData["paymentMethod"])} />
          </div>
        </div>

        <aside className="checkout-side">
          <OrderRecap lines={lines} subtotal={subtotal} delivery={delivery} loading={isSubmitting} />
        </aside>
      </div>
    </form>
  );
}
