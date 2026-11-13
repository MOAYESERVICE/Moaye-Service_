import Image from "next/image";

export default function Photo({
  src, alt, height, position, priority = false, sizes = "(max-width: 700px) 100vw, 400px",
}: {
  src: string;
  alt: string;
  height: number;
  position?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className="pic-box" style={{ height }}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover", objectPosition: position }} />
    </div>
  );
}