import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import ProjectAccessNotice from "@/components/auth/ProjectAccessNotice";

export const metadata = { title: "Inscription indisponible — MOAYE SERVICE" };

export default function InscriptionPage() {
  return (
    <AuthShell
      title="Inscription"
      subtitle="L’accès à la création de compte n’est pas disponible."
      customerMode="register"
      footer={<Link href="/connexion">← Retour à la connexion</Link>}
    >
      <ProjectAccessNotice page="inscription" />
    </AuthShell>
  );
}
