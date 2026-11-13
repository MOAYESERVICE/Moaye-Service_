"use client";
import Image from "next/image";
import { useState } from "react";
import { uploadAdminProductImage } from "@/lib/api";

export default function ImageUploader({ value, onChange, label = "Photo du produit" }: { value?: string; onChange: (url: string) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  return (
    <div className="fgroup">
      <label htmlFor="photo">{label}</label>
      <input
        id="photo"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={uploading}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;

          setUploading(true);
          setUploadError("");
          try {
            onChange(await uploadAdminProductImage(f));
          } catch (error) {
            setUploadError(error instanceof Error ? error.message : "L’image n’a pas pu être envoyée.");
            e.target.value = "";
          } finally {
            setUploading(false);
          }
        }}
      />
      {value && <Image src={value} alt="Aperçu" width={96} height={96} unoptimized style={{ objectFit: "cover", borderRadius: 12 }} />}
      {uploading && <span className="muted" role="status">Envoi de l’image…</span>}
      {uploadError && <span className="err" role="alert">{uploadError}</span>}
      <span className="muted" style={{ fontSize: 13 }}>Formats acceptés : PNG, JPG ou WEBP, jusqu’à 5 Mo.</span>
    </div>
  );
}
