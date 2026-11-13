"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthField from "./AuthField";
import SubmitButton from "./SubmitButton";
import { forgotSchema, type ForgotData } from "@/lib/validators";
import { forgotPassword } from "@/lib/auth";

export default function ForgotForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotData>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (data: ForgotData) => {
    setStatus("idle");
    try {
      await forgotPassword(data);
      setStatus("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Votre demande n’a pas pu être traitée. Veuillez réessayer ultérieurement.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="success" role="status">
        <div className="success-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B6B57" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </div>
        <p className="muted">Si un compte existe avec cette adresse, vous allez recevoir un e-mail avec un lien pour choisir un nouveau mot de passe.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {status === "error" && (
        <div className="alert-error" role="alert">
          <strong>Demande non transmise</strong>
          <span>{errorMessage}</span>
        </div>
      )}
      <AuthField id="email" label="E-mail" type="email" placeholder="vous@exemple.com" auto="email" error={errors.email?.message} registration={register("email")} />
      <SubmitButton loading={isSubmitting} label="Envoyer le lien" loadingLabel="Envoi…" />
    </form>
  );
}