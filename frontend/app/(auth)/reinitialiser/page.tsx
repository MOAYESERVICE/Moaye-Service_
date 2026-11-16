import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import ResetForm from "@/components/auth/ResetForm";

export const metadata = {
  title: "Vérifier le code — MOAYE SERVICE",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function ReinitialiserPage() {
  return (
    <AuthShell title="Réinitialiser le mot de passe" subtitle="Saisissez le code reçu par e-mail, puis choisissez un nouveau code à 4 chiffres.">
      <Suspense fallback={<p className="muted" role="status">Chargement du formulaire…</p>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
