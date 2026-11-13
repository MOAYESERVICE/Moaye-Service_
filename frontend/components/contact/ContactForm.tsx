"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneField from "@/components/auth/PhoneField";
import { contactSchema, type ContactData } from "@/lib/validators";
import { sendContact } from "@/lib/api";
import { formatInternationalPhone } from "@/lib/phone";

type Status = "idle" | "success" | "error";

const fields = [
  { name: "name", label: "Nom", type: "text", placeholder: "Votre nom complet", auto: "name" },
  { name: "phone", label: "Téléphone", type: "tel", placeholder: "Ex. : 07 00 00 00 00", auto: "tel" },
  { name: "email", label: "E-mail", type: "email", placeholder: "vous@exemple.com", auto: "email" },
  { name: "subject", label: "Objet", type: "text", placeholder: "Ex. : Devis pour une ferme piscicole", auto: "off" },
] as const;

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [phoneCode, setPhoneCode] = useState("+225");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactData) => {
    setStatus("idle");
    try {
      await sendContact({ ...data, phone: formatInternationalPhone(data.phone, phoneCode) });
      setStatus("success");
      reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Votre message n’a pas pu être transmis. Veuillez réessayer ultérieurement.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="card contact-form">
        <div className="success" role="status">
          <div className="success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B6B57" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>Message transmis</h2>
          <p className="muted">Merci pour votre message. Notre équipe vous répondra dans les meilleurs délais.</p>
          <button className="btn btn-green" onClick={() => setStatus("idle")}>Envoyer un autre message</button>
        </div>
      </div>
    );
  }

  return (
    <form className="card contact-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {status === "error" && (
        <div className="alert-error" role="alert">
          <strong>Transmission impossible</strong>
          <span>{errorMessage}</span>
        </div>
      )}

      {fields.map((f) => f.name === "phone" ? (
        <PhoneField
          key={f.name}
          id="phone"
          label={f.label}
          countryCode={phoneCode}
          onCountryCodeChange={setPhoneCode}
          error={errors.phone?.message}
          registration={register("phone")}
        />
      ) : (
        <div key={f.name} className="fgroup">
          <label htmlFor={f.name}>{f.label}</label>
          <input
            id={f.name}
            type={f.type}
            placeholder={f.placeholder}
            autoComplete={f.auto}
            aria-invalid={!!errors[f.name]}
            className={errors[f.name] ? "inp bad" : "inp"}
            {...register(f.name)}
          />
          {errors[f.name] && <span className="err">{errors[f.name]?.message}</span>}
        </div>
      ))}

      <div className="fgroup">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          placeholder="Décrivez votre projet : type d'élevage, localisation, besoins…"
          aria-invalid={!!errors.message}
          className={errors.message ? "inp bad" : "inp"}
          {...register("message")}
        />
        {errors.message && <span className="err">{errors.message.message}</span>}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
        <button className="btn btn-amber" type="submit" disabled={isSubmitting}>
          {isSubmitting && (
            <svg className="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E2A26" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M12 3a9 9 0 019 9" /></svg>
          )}
          <span>{isSubmitting ? "Envoi en cours…" : "Envoyer le message"}</span>
        </button>
        <span className="muted" style={{ fontSize: 13 }}>Tous les champs sont obligatoires, sauf indication contraire.</span>
      </div>
    </form>
  );
}