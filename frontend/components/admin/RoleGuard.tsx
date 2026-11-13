"use client";
import Link from "next/link";
import { canAccess } from "@/data/admin";
import { useAdmin } from "@/hooks/useAdmin";

export default function RoleGuard({ module, children }: { module: string; children: React.ReactNode }) {
  const { role } = useAdmin();
  if (!canAccess(role, module)) {
    return (
      <div className="card empty">
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Accès refusé</h2>
        <p className="muted">Votre rôle ne permet pas d&apos;ouvrir cette section.</p>
        <Link className="btn btn-green" href="/admin">Retour au tableau de bord</Link>
      </div>
    );
  }
  return <>{children}</>;
}