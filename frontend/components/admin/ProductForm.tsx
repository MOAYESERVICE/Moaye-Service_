"use client";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ImageUploader from "./ImageUploader";
import { productSchema, type ProductFormData } from "@/lib/validators";
import { catLabels } from "@/data/products";
import type { Product } from "@/types/product";

export default function ProductForm({
  initial, onSave, onCancel,
}: {
  initial?: Product;
  onSave: (p: Omit<Product, "id"> & { id?: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initial
      ? { name: initial.name, cat: initial.cat, price: String(initial.price), stock: initial.stock, image: initial.image ?? "" }
      : { name: "", cat: "aliments", price: "", stock: "in", image: "" },
  });
  const image = useWatch({ control, name: "image" });

  const submit = async (d: ProductFormData) => {
    setIsSaving(true);
    setSaveError("");
    try {
      await onSave({
      id: initial?.id,
      name: d.name.trim(),
      cat: d.cat,
      price: Number(d.price.replace(/\s/g, "")),
      stock: d.stock,
      photo: initial?.photo ?? "",
      desc: initial?.desc ?? "",
      specs: initial?.specs ?? [],
      image: d.image || undefined,
      });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Le produit n’a pas pu être enregistré.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="pt-panel pt-pp pt-stack pt-product-form" style={{ gap: 16, border: "2px solid #1B6B57" }} onSubmit={handleSubmit(submit)} noValidate>
      <h3 className="pt-h3">{initial ? "Modifier le produit" : "Nouveau produit"}</h3>
      <div className="fgroup">
        <label htmlFor="p-name">Nom du produit</label>
        <input id="p-name" className={errors.name ? "inp bad" : "inp"} {...register("name")} />
        {errors.name && <span className="err">{errors.name.message}</span>}
      </div>
      <div className="fgroup">
        <label htmlFor="p-cat">Catégorie</label>
        <select id="p-cat" className="inp" {...register("cat")}>
          {Object.entries(catLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </div>
      <div className="fgroup">
        <label htmlFor="p-price">Prix (FCFA)</label>
        <input id="p-price" inputMode="numeric" className={errors.price ? "inp bad" : "inp"} {...register("price")} />
        {errors.price && <span className="err">{errors.price.message}</span>}
      </div>
      <div className="fgroup">
        <label htmlFor="p-stock">Disponibilité</label>
        <select id="p-stock" className="inp" {...register("stock")}>
          <option value="in">En stock</option>
          <option value="order">Sur commande</option>
          <option value="out">Rupture de stock</option>
        </select>
      </div>
      <ImageUploader value={image} onChange={(url) => setValue("image", url)} />
      {errors.image && <span className="err" role="alert">{errors.image.message}</span>}
      {saveError && <p className="err" role="alert">{saveError}</p>}
      <div className="pt-product-form-actions">
        <button className="btn btn-green" type="submit" disabled={isSaving}>
          {isSaving ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onCancel} disabled={isSaving}>Annuler</button>
      </div>
    </form>
  );
}
