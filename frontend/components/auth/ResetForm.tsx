"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthField from "./AuthField";
import SubmitButton from "./SubmitButton";
import { resetSchema, type ResetData } from "@/lib/validators";
import { resetPassword } from "@/lib/auth";

export default function ResetForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetData>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (data: ResetData) => {
    setStatus("idle");
    try {
      await resetPassword(data);
      setStatus("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Votre mot de passe n’a pas pu être modifié. Veuillez réessayer ultérieurement.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="success" role="status">
        <div className="success-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B6B57" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </div>
        <p className="muted">Votre mot de passe a bien été mis à jour.</p>
        <Link className="btn btn-green" href="/connexion">Se connecter</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {status === "error" && (
        <div className="alert-error" role="alert">
          <strong>Mise à jour impossible</strong>
          <span>{errorMessage}</span>
        </div>
      )}
      <AuthField id="password" label="Nouveau mot de passe" type="password" auto="new-password" error={errors.password?.message} registration={register("password")} />
      <AuthField id="confirm" label="Confirmer le mot de passe" type="password" auto="new-password" error={errors.confirm?.message} registration={register("confirm")} />
      <SubmitButton loading={isSubmitting} label="Enregistrer" loadingLabel="Enregistrement…" />
    </form>
  );
}