"use client";
import Image from "next/image";
import { useState } from "react";
import { uploadAdminProductImage } from "@/lib/api";

export default function ImageUploader({ value, onChange, label = "Photo du produit" }: { value?: string; onChange: (url: string) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  return (
    <div className="fgroup pt-image-uploader">
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
      {value && <Image className="pt-image-uploader-preview" src={value} alt="Aperçu de la photo" width={520} height={300} unoptimized />}
      {uploading && <span className="muted" role="status">Envoi de l’image…</span>}
      {uploadError && <span className="err" role="alert">{uploadError}</span>}
      <span className="muted pt-image-uploader-hint">Formats acceptés : PNG, JPG ou WEBP, jusqu’à 5 Mo.</span>
    </div>
  );
}
