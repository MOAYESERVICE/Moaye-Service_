import Image from "next/image";
import type { CSSProperties } from "react";

export default function PhotoSlot({
  label,
  alt = label,
  className = "",
  height,
  src,
  priority = false,
  showLabel = true,
  fit = "cover",
}: {
  label: string;
  alt?: string;
  className?: string;
  height?: number;
  src?: string;
  priority?: boolean;
  showLabel?: boolean;
  fit?: "cover" | "contain";
}) {
  const style: CSSProperties = {};
  if (height) style.height = height;
  if (src && fit === "contain") style.backgroundImage = `url("${src}")`;

  return (
    <div className={`ph ${src ? "has-image" : ""} ${src && fit === "contain" ? "ph-contain" : ""} ${className}`} style={style}>
      {src && (
        <Image
          className="ph-image"
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priority}
        />
      )}
      {showLabel && <span>{src ? label : `Photo à ajouter · ${label}`}</span>}
    </div>
  );
}
