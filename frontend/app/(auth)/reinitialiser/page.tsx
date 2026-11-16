import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import ResetForm from "@/components/auth/ResetForm";

export const metadata = {
  title: "Nouveau mot de passe — MOAYE SERVICE",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function ReinitialiserPage() {
  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Choisissez un nouveau code à 4 chiffres.">
      <Suspense fallback={<p className="muted" role="status">Chargement du formulaire…</p>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
