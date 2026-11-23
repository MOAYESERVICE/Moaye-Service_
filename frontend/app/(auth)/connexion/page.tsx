import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import ProjectAccessNotice from "@/components/auth/ProjectAccessNotice";

export const metadata = { title: "Connexion — MOAYE SERVICE" };

export default function ConnexionPage() {
  return (
    <AuthShell
      title="Connexion"
      subtitle="L’accès au compte n’est pas disponible."
      customerMode="login"
      footer={<Link href="/">← Retour au site</Link>}
    >
      <ProjectAccessNotice page="connexion" />
    </AuthShell>
  );
}
