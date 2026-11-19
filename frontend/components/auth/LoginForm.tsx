"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthField from "./AuthField";
import SubmitButton from "./SubmitButton";
import { loginSchema, type LoginData } from "@/lib/validators";
import { activateDeveloper, login, logout } from "@/lib/auth";

export default function LoginForm({ adminOnly = false }: { adminOnly?: boolean }) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginData) => {
    setFailed(false);
    try {
      const role = adminOnly && activationCode.trim()
        ? await activateDeveloper({ ...data, activationCode: activationCode.trim() })
        : await login(data);
      if (adminOnly && role !== "admin") {
        await logout();
        throw new Error("L’accès à l’administration est réservé aux comptes autorisés.");
      }
      router.push(role === "admin" ? "/admin" : "/mon-compte");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "La connexion n’a pas pu être établie. Veuillez vérifier vos informations et réessayer.");
      setFailed(true);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
      {failed && (
        <div className="alert-error" role="alert">
          <strong>Connexion impossible</strong>
          <span>{errorMessage}</span>
        </div>
      )}
      <AuthField id="email" label="E-mail" type="email" placeholder="vous@exemple.com" auto="email" error={errors.email?.message} registration={register("email")} />
      <AuthField id="password" label="Mot de passe (4 chiffres)" type="password" auto="current-password" inputMode="numeric" maxLength={12} error={errors.password?.message} registration={register("password")} />
      {adminOnly && (
        <div className="fgroup">
          <label htmlFor="developer-activation-code">Code d’activation développeur (facultatif)</label>
          <input
            id="developer-activation-code"
            className="inp"
            type="password"
            autoComplete="off"
            value={activationCode}
            onChange={(event) => setActivationCode(event.target.value)}
            aria-describedby="developer-activation-help"
          />
          <span id="developer-activation-help" className="muted">Saisissez-le uniquement pour activer l’accès développeur sur ce compte.</span>
        </div>
      )}
      <SubmitButton
        loading={isSubmitting}
        label={activationCode.trim() && adminOnly ? "Activer et se connecter" : "Se connecter"}
        loadingLabel={activationCode.trim() && adminOnly ? "Activation…" : "Connexion…"}
      />
    </form>
  );
}
