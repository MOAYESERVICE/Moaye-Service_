"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthField from "@/components/auth/AuthField";
import SubmitButton from "@/components/auth/SubmitButton";
import { useAccount } from "@/hooks/useAccount";
import { profileSchema, type ProfileData } from "@/lib/validators";
import { saveProfile } from "@/lib/api";

const PREFS = [
  { id: "mail", label: "Suivi de commande par e-mail", desc: "Recevez un e-mail à chaque changement de statut." },
  { id: "wa", label: "Messages WhatsApp", desc: "Échangez rapidement avec votre conseiller." },
  { id: "promo", label: "Actualités et conseils", desc: "Conseils d'élevage et nouveautés du catalogue." },
];

export default function ProfileView() {
  const { profile, setProfile } = useAccount();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ mail: true, wa: true, promo: false });
  const initials = profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  const onSubmit = async (data: ProfileData) => {
    setSaved(false);
    setError(false);
    try {
      await saveProfile(data);
      setProfile({ name: data.name, email: data.email, phone: data.phone, city: data.city ?? "" });
      setSaved(true);
    } catch {
      setError(true);
    }
  };

  return (
    <div className="pt-flex top">
      <section className="pt-panel pt-pp" style={{ flex: "0 1 300px", minWidth: 260, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
        <span style={{ width: 96, height: 96, borderRadius: 999, background: "#134A3D", color: "#fff", fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{initials}</span>
        <strong style={{ fontSize: 20, fontFamily: "var(--font-display)" }}>{profile.name}</strong>
        <span className="pt-muted" style={{ fontSize: 15 }}>{profile.email}</span>
        <span className="pt-bd in">Compte actif</span>
      </section>

      <div className="pt-stack" style={{ flex: "2 1 460px", minWidth: 0 }}>
        <form className="pt-panel pt-pp pt-stack" style={{ gap: 18 }} onSubmit={handleSubmit(onSubmit)} noValidate>
          <h3 className="pt-h3">Informations personnelles</h3>
          {saved && <div role="status" style={{ padding: "12px 16px", borderRadius: 12, background: "#E3EFE8", color: "#134A3D", fontWeight: 600 }}>Profil mis à jour.</div>}
          {error && <div className="alert-error" role="alert"><strong>Enregistrement impossible</strong><span>Réessayez dans un instant.</span></div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
            <AuthField id="name" label="Nom complet" auto="name" error={errors.name?.message} registration={register("name")} />
            <AuthField id="email" label="E-mail" type="email" auto="email" error={errors.email?.message} registration={register("email")} />
            <AuthField id="phone" label="Téléphone" type="tel" auto="tel" error={errors.phone?.message} registration={register("phone")} />
            <AuthField id="city" label="Ville" auto="address-level2" error={errors.city?.message} registration={register("city")} />
          </div>
          <div><SubmitButton loading={isSubmitting} label="Enregistrer les modifications" loadingLabel="Enregistrement…" /></div>
        </form>

        <section className="pt-panel pt-pp" aria-label="Notifications">
          <h3 className="pt-h3" style={{ marginBottom: 10 }}>Notifications</h3>
          {PREFS.map((p) => (
            <div key={p.id} className="pt-row" style={{ padding: "16px 0" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><strong>{p.label}</strong><span style={{ fontSize: 14.5, color: "#4A625B" }}>{p.desc}</span></span>
              <button
                className="pt-sw" role="switch" aria-checked={prefs[p.id]} aria-label={p.label}
                style={{ justifyContent: prefs[p.id] ? "flex-end" : "flex-start", background: prefs[p.id] ? "#1B6B57" : "#B9CCC1" }}
                onClick={() => setPrefs({ ...prefs, [p.id]: !prefs[p.id] })}
              ><i /></button>
            </div>
          ))}
        </section>

        <section className="pt-panel pt-pp" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><strong>Mot de passe</strong><span style={{ fontSize: 14.5, color: "#4A625B" }}>Modifiez votre mot de passe régulièrement.</span></span>
          <Link className="btn btn-ghost" href="/mot-de-passe-oublie">Changer le mot de passe</Link>
        </section>
      </div>
    </div>
  );
}