import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Connexion — MOAYE SERVICE" };

export default function ConnexionPage() {
  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à vos commandes, devis et messages."
      customerMode="login"
      footer={
        <>
          <Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
          <Link href="/">← Retour au site</Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}