import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import ForgotForm from "@/components/auth/ForgotForm";

export const metadata = { title: "Mot de passe oublié — MOAYE SERVICE" };

export default function MotDePasseOubliePage() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Saisissez l’adresse e-mail associée à votre compte pour recevoir un code de réinitialisation."
      footer={<Link href="/connexion">← Retour à la connexion</Link>}
    >
      <ForgotForm />
    </AuthShell>
  );
}
