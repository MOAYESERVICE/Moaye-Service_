import { z } from "zod";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const homepagePhotosResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.object({
    productKey: z.string(),
    productId: z.number().int().nullable(),
    title: z.string(),
    imageUrl: z.string().startsWith("/"),
    alt: z.string(),
    position: z.number().int(),
  })),
});

export type HomepagePhoto = z.infer<typeof homepagePhotosResponseSchema>["data"][number];

export async function getHomepagePhotos(): Promise<HomepagePhoto[]> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/home/photos`, { cache: "no-store" });
    if (!response.ok) return [];

    const payload: unknown = await response.json();
    const parsed = homepagePhotosResponseSchema.safeParse(payload);
    return parsed.success ? parsed.data.data : [];
  } catch {
    return [];
  }
}
