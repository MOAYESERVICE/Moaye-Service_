import AuthShell from "@/components/auth/AuthShell";
import ResetForm from "@/components/auth/ResetForm";

export const metadata = { title: "Nouveau mot de passe — MOAYE SERVICE" };

export default function ReinitialiserPage() {
  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Choisissez un mot de passe d'au moins 12 caractères.">
      <ResetForm />
    </AuthShell>
  );
}