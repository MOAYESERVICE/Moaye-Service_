"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import RoleGuard from "@/components/admin/RoleGuard";
import DataTable, { type Column } from "@/components/admin/DataTable";
import ProductForm from "@/components/admin/ProductForm";
import Pill from "@/components/portal/Pill";
import { useAdmin } from "@/hooks/useAdmin";
import { catLabels, stockInfo } from "@/data/products";
import { fcfa, norm } from "@/lib/format";
import type { Product } from "@/types/product";

const FILTERS = [["all", "Tous"], ["in", "En stock"], ["order", "Sur commande"], ["out", "Rupture"]] as const;
const TONE = { in: "in", order: "pr", out: "out" } as const;

export default function AdminProduits() {
  const {
    products, productsLoading, productsError, refreshProducts,
    q, saveProduct, deleteProduct, flash,
  } = useAdmin();
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) return;
    requestAnimationFrame(() => formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" }));
  }, [editing]);

  const rows = products.filter((p) => (filter === "all" || p.stock === filter) && (norm(q) === "" || norm(p.name + " " + catLabels[p.cat]).includes(norm(q))));

  const columns: Column<Product>[] = [
    {
      key: "image", label: "Photo", render: (p) => p.image
        ? <Image src={p.image} alt={`Photo de ${p.name}`} width={52} height={52} unoptimized style={{ objectFit: "cover", borderRadius: 8 }} />
        : <span className="muted">Aucune photo</span>,
    },
    { key: "name", label: "Produit", render: (p) => <strong>{p.name}</strong> },
    { key: "cat", label: "Catégorie", render: (p) => catLabels[p.cat] },
    { key: "price", label: "Prix", render: (p) => fcfa(p.price) },
    { key: "stock", label: "Disponibilité", render: (p) => <Pill tone={TONE[p.stock]}>{stockInfo[p.stock].label}</Pill> },
    {
      key: "actions", label: "Actions", align: "right",
      render: (p) => (
        <span style={{ whiteSpace: "nowrap", display: "inline-flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>Modifier</button>
          <button
            className={confirmId === p.id ? "btn btn-sm pt-danger" : "btn btn-ghost btn-sm"}
            onClick={async () => {
              if (confirmId !== p.id) {
                setConfirmId(p.id);
                return;
              }
              try {
                await deleteProduct(p.id);
                setConfirmId(null);
              } catch (error) {
                flash(error instanceof Error ? error.message : "Le produit n’a pas pu être supprimé.");
              }
            }}
          >
            {confirmId === p.id ? "Confirmer" : "Supprimer"}
          </button>
        </span>
      ),
    },
  ];

  return (
    <RoleGuard module="products">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div className="pt-sg" role="group" aria-label="Filtrer par disponibilité">
          {FILTERS.map(([id, label]) => (
            <button key={id} className={filter === id ? "on" : ""} aria-pressed={filter === id} onClick={() => setFilter(id)}>
              {label} {products.filter((p) => id === "all" || p.stock === id).length}
            </button>
          ))}
        </div>
        <button className="btn btn-amber" onClick={() => setEditing("new")}>+ Ajouter un produit</button>
      </div>

      <div className="pt-flex top">
        <div style={{ flex: "2 1 560px", minWidth: 0 }}>
          {productsLoading ? (
            <p className="muted" role="status">Chargement des produits enregistrés…</p>
          ) : productsError ? (
            <div role="alert">
              <p>{productsError}</p>
              <button className="btn btn-ghost btn-sm" onClick={() => void refreshProducts()}>Réessayer</button>
            </div>
          ) : (
            <DataTable columns={columns} rows={rows} emptyTitle="Aucun produit trouvé" emptyText="Modifiez la recherche ou le filtre, ou ajoutez un produit." />
          )}
        </div>
        {editing && (
          <div ref={formSectionRef} className="pt-edit-form-anchor" style={{ flex: "1 1 320px", minWidth: 0 }}>
            <ProductForm
              key={editing === "new" ? "new" : editing.id}
              initial={editing === "new" ? undefined : editing}
              onSave={async (product) => {
                await saveProduct(product);
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
