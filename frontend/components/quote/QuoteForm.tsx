"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthField from "@/components/auth/AuthField";
import PhoneField from "@/components/auth/PhoneField";
import SubmitButton from "@/components/auth/SubmitButton";
import ChoiceChips from "@/components/ui/ChoiceChips";
import OptionCards from "@/components/ui/OptionCards";
import { quoteSchema, type QuoteData } from "@/lib/validators";
import { sendQuote } from "@/lib/api";
import { formatInternationalPhone } from "@/lib/phone";
import { projectTypes, stages, budgets } from "@/data/quote";

export default function QuoteForm() {
  const resume = useSearchParams().get("resume") ?? "";
  const [showSummary, setShowSummary] = useState(true);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [ref, setRef] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [phoneCode, setPhoneCode] = useState("+225");

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<QuoteData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { type: "", stage: stages[0].id, budget: "" },
  });
  const type = useWatch({ control, name: "type" });
  const stage = useWatch({ control, name: "stage" });
  const budget = useWatch({ control, name: "budget" });

  const onSubmit = async (data: QuoteData) => {
    setStatus("idle");
    try {
      const r = await sendQuote({
        ...data,
        phone: formatInternationalPhone(data.phone, phoneCode),
        summary: showSummary ? resume : "",
      });
      setRef(r);
      setStatus("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Votre demande n’a pas pu être transmise. Veuillez réessayer ultérieurement.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="card block" role="status" style={{ flex: "1 1 600px", minWidth: 0, padding: 32, alignItems: "flex-start" }}>
        <div className="success-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B6B57" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 700 }}>Demande transmise</h2>
        <p className="muted" style={{ lineHeight: 1.6 }}>
          Votre demande <strong style={{ color: "var(--ink)" }}>{ref}</strong> a bien été transmise. Un conseiller vous répondra dans les meilleurs délais.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link className="btn btn-green" href="/mon-compte/devis">Voir mes devis</Link>
          <Link className="btn btn-ghost" href="/">Retour à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="card block" style={{ flex: "1 1 600px", minWidth: 0, padding: 32, gap: 28 }} onSubmit={handleSubmit(onSubmit)} noValidate>
      {status === "error" && (
        <div className="alert-error" role="alert">
          <strong>Transmission impossible</strong>
          <span>{errorMessage}</span>
        </div>
      )}

      {resume && showSummary && (
        <div className="summary">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <strong style={{ color: "var(--green-dark)" }}>Résumé repris de votre conversation avec l&apos;assistant</strong>
            <button type="button" className="chip" style={{ minHeight: 40 }} onClick={() => setShowSummary(false)}>Retirer</button>
          </div>
          <span style={{ lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{resume}</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>1. Votre projet</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>Type de projet</span>
          <ChoiceChips label="Type de projet" options={projectTypes} value={type} onChange={(v) => setValue("type", v, { shouldValidate: true })} />
          {errors.type && <span className="err">{errors.type.message}</span>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>Où en êtes-vous ?</span>
          <OptionCards options={stages} value={stage} onChange={(v) => setValue("stage", v)} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>Budget approximatif</span>
          <ChoiceChips label="Budget approximatif" options={budgets} value={budget} onChange={(v) => setValue("budget", v)} />
        </div>

        <AuthField id="location" label="Localisation du projet" placeholder="Ville, village ou région" auto="off" error={errors.location?.message} registration={register("location")} />

        <div className="fgroup">
          <label htmlFor="message">Précisions (facultatif)</label>
          <textarea id="message" className="inp" placeholder="Surface, espèce envisagée, délai souhaité…" {...register("message")} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>2. Vos coordonnées</h2>
        <AuthField id="name" label="Nom complet" placeholder="Votre nom" auto="name" error={errors.name?.message} registration={register("name")} />
        <PhoneField id="phone" label="Téléphone" countryCode={phoneCode} onCountryCodeChange={setPhoneCode} error={errors.phone?.message} registration={register("phone")} />
        <AuthField id="email" label="E-mail" type="email" placeholder="vous@exemple.com" auto="email" error={errors.email?.message} registration={register("email")} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
        <SubmitButton loading={isSubmitting} label="Envoyer ma demande" loadingLabel="Envoi en cours…" />
        <span className="muted" style={{ fontSize: 13 }}>Demande gratuite et sans engagement.</span>
      </div>
    </form>
  );
}