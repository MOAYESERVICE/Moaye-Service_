import { z } from "zod";

// Vérifie les champs du formulaire avant tout accès à la base.
export const createProductSchema = z
  .object({
    // Catégories actuellement proposées dans le frontend.
    cat: z.enum([
      "aliments",
      "alevins",
      "animaux",
      "equipements",
      "materiel",
      "intrants",
    ]),

    // Le nom est obligatoire et limité en longueur.
    name: z.string().trim().min(1).max(150),

    // Le prix doit être un nombre entier positif en FCFA.
    price: z.number().int().positive(),

    // Valeurs utilisées par le frontend; le service les convertira pour Prisma.
    stock: z.enum(["in", "order", "out"]),

    // Libellé visuel facultatif; il n'est pas stocké comme image.
    photo: z.string().trim().max(200).optional(),

    // Le formulaire n'a pas encore de champ description.
    desc: z.string().trim().max(2000).optional(),

    // Caractéristiques facultatives, limitées en nombre et en longueur.
    specs: z.array(z.string().trim().min(1).max(200)).max(30).optional(),

    // Accepte un chemin local persistant, jamais une URL temporaire "blob:".
    image: z
      .string()
      .trim()
      .max(500)
      .refine(
        (value) => value.startsWith("/") && !value.startsWith("//"),
        "L'image doit être un chemin local enregistré.",
      )
      .optional(),
  })
  // Refuse les champs imprévus au lieu de les ignorer silencieusement.
  .strict();