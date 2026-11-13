// Zod vérifie les données reçues avant de les utiliser.
import { z } from "zod"

const passwordInputSchema = z.string().regex(/^\d{4}$/, "Le code doit contenir exactement 4 chiffres.")
const loginPasswordSchema = z.string().regex(
  /^(?:\d{4}|\d{12})$/,
  "Saisissez votre code actuel à 4 chiffres ou votre ancien mot de passe à 12 chiffres.",
)

// Vérifie les informations nécessaires pour créer un compte.
export const registerSchema = z
  .object({
    // Nettoie les espaces et met l'e-mail en minuscules.
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email().max(254),
    phone: z.string().regex(/^\+[1-9]\d{7,14}$/),

    password: passwordInputSchema,
  })
  // Refuse notamment qu'une personne fournisse elle-même un rôle ADMIN.
  .strict()

// Vérifie les informations nécessaires pour se connecter.
export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: loginPasswordSchema,
  })
  // Refuse les propriétés supplémentaires.
  .strict()

export const changePasswordSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    currentPassword: loginPasswordSchema,
    newPassword: passwordInputSchema,
  })
  .strict()

// Vérifie le refresh token pour générer un nouveau access token.
export const refreshSchema = z
  .object({
    refreshToken: z.string().min(1),
  })
  .strict()
