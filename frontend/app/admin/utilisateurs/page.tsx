"use client";

import RoleGuard from "@/components/admin/RoleGuard";
import StatusSelect from "@/components/admin/StatusSelect";
import { useAdmin } from "@/hooks/useAdmin";
import type { AdminUserRole } from "@/data/admin";
import { norm } from "@/lib/format";

const OPTIONS: { id: AdminUserRole; label: string }[] = [
  { id: "ADMIN", label: "Administrateur" },
  { id: "CUSTOMER", label: "Client" },
];

const RIGHTS: { section: string; admin: string; client: string }[] = [
  { section: "Tableau de bord", admin: "Oui", client: "Espace client" },
  { section: "Catalogue public", admin: "Oui", client: "Oui" },
  { section: "Gestion des produits et catégories", admin: "Oui", client: "Non" },
  { section: "Commandes", admin: "Toutes", client: "Les siennes" },
  { section: "Devis et messages", admin: "Tous", client: "Les siens" },
  { section: "Comptes et rôles", admin: "Oui", client: "Non" },
];

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default function AdminUtilisateurs() {
  const { users, usersLoading, usersError, refreshUsers, q, setUserRole, toggleUser } = useAdmin();
  const list = users.filter((user) => norm(q) === "" || norm(`${user.name} ${user.email}`).includes(norm(q)));

  return (
    <RoleGuard module="users">
      <section className="pt-panel pt-admin-users" aria-label="Utilisateurs enregistrés">
        <div className="pt-admin-users-heading">
          <div><h2>Comptes enregistrés</h2><p>{users.length} compte{users.length === 1 ? "" : "s"} réel{users.length === 1 ? "" : "s"} dans la base de données</p></div>
          <button type="button" className="btn btn-ghost" onClick={refreshUsers} disabled={usersLoading}>
            {usersLoading ? "Actualisation…" : "Actualiser"}
          </button>
        </div>

        {usersError && <div className="pt-message-error" role="alert"><div><strong>Impossible de charger les comptes</strong><p>{usersError}</p></div><button type="button" className="pt-message-refresh" onClick={refreshUsers}>Réessayer</button></div>}
        {!usersError && usersLoading && <p className="pt-admin-users-state">Chargement des comptes depuis PostgreSQL…</p>}
        {!usersError && !usersLoading && users.length === 0 && <p className="pt-admin-users-state">Aucun compte enregistré dans cette base.</p>}
        {!usersError && !usersLoading && users.length > 0 && list.length === 0 && <p className="pt-admin-users-state">Aucun compte ne correspond à votre recherche.</p>}

        {!usersError && !usersLoading && list.length > 0 && <div style={{ overflowX: "auto" }}>
          <table className="pt-tbl pt-responsive-table">
            <thead><tr><th>Utilisateur</th><th>E-mail</th><th>Rôle</th><th>Compte créé</th><th>Statut</th></tr></thead>
            <tbody>
              {list.map((user) => (
                <tr key={user.id}>
                  <td data-label="Utilisateur"><strong>{user.name}</strong>{user.isSelf && <small className="pt-admin-users-self">Vous</small>}</td>
                  <td data-label="E-mail">{user.email}</td>
                  <td data-label="Rôle">
                    <StatusSelect
                      label={`Rôle de ${user.name}`}
                      value={user.role}
                      options={OPTIONS}
                      disabled={user.isSelf}
                      onChange={(role) => { void setUserRole(user.id, role).catch(() => undefined); }}
                    />
                  </td>
                  <td data-label="Compte créé">{dateLabel(user.createdAt)}</td>
                  <td data-label="Statut">
                    <button
                      type="button"
                      className={`pt-bd ${user.active ? "in" : "out"}`}
                      aria-pressed={user.active}
                      disabled={user.isSelf}
                      title={user.isSelf ? "Vous ne pouvez pas modifier vos propres accès." : `Cliquer pour ${user.active ? "désactiver" : "activer"} ce compte`}
                      onClick={() => { void toggleUser(user.id).catch(() => undefined); }}
                    >
                      {user.active ? "Actif" : "Désactivé"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </section>

      <section className="pt-panel pt-pp pt-stack" style={{ gap: 14 }} aria-label="Droits des rôles enregistrés">
        <div><h3 className="pt-h3">Droits par rôle</h3><p className="pt-muted">Rôles définis dans la base et contrôlés par l’API.</p></div>
        <div style={{ overflowX: "auto" }}>
          <table className="pt-tbl">
            <thead><tr><th>Section</th><th style={{ textAlign: "center" }}>Administrateur</th><th style={{ textAlign: "center" }}>Client</th></tr></thead>
            <tbody>
              {RIGHTS.map((row) => (
                <tr key={row.section}>
                  <td><strong>{row.section}</strong></td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "#134A3D" }}>{row.admin}</td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "#134A3D" }}>{row.client}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <span className="pt-muted" style={{ fontSize: 14 }}>Le schéma actuel prévoit deux rôles : Administrateur et Client. La dernière connexion n’est pas enregistrée par l’application ; cette page affiche donc la date réelle de création du compte.</span>
      </section>
    </RoleGuard>
  );
}
