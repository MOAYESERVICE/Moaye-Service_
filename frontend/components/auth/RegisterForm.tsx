"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthField from "./AuthField";
import PhoneField from "./PhoneField";
import SubmitButton from "./SubmitButton";
import { registerSchema, type RegisterData } from "@/lib/validators";
import { register as registerUser } from "@/lib/auth";
import { formatInternationalPhone } from "@/lib/phone";

export default function RegisterForm() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [phoneCode, setPhoneCode] = useState("+225");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    setFailed(false);
    try {
      await registerUser({ ...data, phone: formatInternationalPhone(data.phone, phoneCode) });
      router.push("/mon-compte");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Votre compte n’a pas pu être créé. Veuillez vérifier les informations saisies et réessayer.");
      setFailed(true);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form register-form">
      {failed && (
        <div className="alert-error" role="alert">
          <strong>Création du compte impossible</strong>
          <span>{errorMessage}</span>
        </div>
      )}
      <AuthField id="name" label="Nom" placeholder="Votre nom complet" auto="name" error={errors.name?.message} registration={register("name")} />
      <AuthField id="email" label="E-mail" type="email" placeholder="vous@exemple.com" auto="email" error={errors.email?.message} registration={register("email")} />
      <PhoneField id="phone" label="Numéro de téléphone" countryCode={phoneCode} onCountryCodeChange={setPhoneCode} error={errors.phone?.message} registration={register("phone")} />
      <AuthField id="password" label="Mot de passe (4 chiffres)" type="password" auto="new-password" inputMode="numeric" maxLength={4} error={errors.password?.message} registration={register("password")} />
      <AuthField id="confirm" label="Confirmer le code" type="password" auto="new-password" inputMode="numeric" maxLength={4} error={errors.confirm?.message} registration={register("confirm")} />
      <SubmitButton loading={isSubmitting} label="Créer mon compte" loadingLabel="Création…" />
    </form>
  );
}
