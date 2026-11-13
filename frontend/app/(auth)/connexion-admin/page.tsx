import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Accès propriétaire — MOAYE SERVICE" };

export default function ConnexionAdminPage() {
  return (
    <AuthShell
      title="Administration"
      subtitle="Connectez-vous avec le compte propriétaire pour accéder au tableau de bord."
      footer={
        <>
          <Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
          <span><Link href="/connexion">Connexion client</Link></span>
        </>
      }
    >
      <LoginForm adminOnly />
    </AuthShell>
  );
}
