import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = { title: "Créer un compte — MOAYE SERVICE" };

export default function InscriptionPage() {
  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Suivez vos commandes et vos demandes de devis."
      customerMode="register"
      footer={<Link href="/">← Retour au site</Link>}
    >
      <RegisterForm />
    </AuthShell>
  );
}