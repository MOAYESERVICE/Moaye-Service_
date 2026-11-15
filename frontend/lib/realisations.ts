import { z } from "zod";
import { projects as existingProjects } from "@/data/home";

const realizationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  domain: z.string(),
  location: z.string(),
  imageUrl: z.string().startsWith("/"),
  imageAlt: z.string(),
  isPublished: z.boolean(),
});

export type PublicRealisation = z.infer<typeof realizationSchema>;

const fallbackProjects: PublicRealisation[] = existingProjects.map((project) => ({
  id: project.slug,
  title: project.title,
  description: project.desc,
  domain: project.domain,
  location: "",
  imageUrl: project.img,
  imageAlt: project.alt,
  isPublished: true,
}));

function endpoint(path: string) {
  const configured = (process.env.MOAYE_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");
  const base = configured.endsWith("/api") ? configured : `${configured}/api`;
  return `${base}/${path}`;
}

export async function getPublishedRealisations(): Promise<PublicRealisation[]> {
  try {
    const response = await fetch(endpoint("realisations"), { cache: "no-store" });
    if (!response.ok) throw new Error("Le catalogue des réalisations est indisponible.");
    const payload: unknown = await response.json();
    const parsed = z.object({ success: z.literal(true), data: z.array(realizationSchema) }).safeParse(payload);
    return parsed.success ? parsed.data.data : fallbackProjects;
  } catch {
    // Garde les réalisations actuelles visibles si l’API est momentanément indisponible.
    return fallbackProjects;
  }
}