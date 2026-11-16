"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthField from "./AuthField";
import SubmitButton from "./SubmitButton";
import { forgotSchema, type ForgotData } from "@/lib/validators";
import { forgotPassword } from "@/lib/auth";

export default function ForgotForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotData>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (data: ForgotData) => {
    setStatus("idle");
    try {
      await forgotPassword(data);
      router.push(`/reinitialiser?email=${encodeURIComponent(data.email.trim().toLowerCase())}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Votre demande n’a pas pu être traitée. Veuillez réessayer ultérieurement.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {status === "error" && (
        <div className="alert-error" role="alert">
          <strong>Demande non transmise</strong>
          <span>{errorMessage}</span>
        </div>
      )}
      <AuthField id="email" label="E-mail" type="email" placeholder="vous@exemple.com" auto="email" error={errors.email?.message} registration={register("email")} />
      <SubmitButton loading={isSubmitting} label="Envoyer le code par e-mail" loadingLabel="Envoi…" />
    </form>
  );
}
