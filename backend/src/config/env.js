// Charge les variables du fichier .env dans process.env
import "dotenv/config"

// Zod sert à vérifier que les réglages ont le bon format
import { z } from "zod"

const optionalEnvString = z.preprocess(
  (value) => value === "" ? undefined : value,
  z.string().trim().min(1).optional(),
)

// Décrit les réglages attendus par le backend
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),

  JWT_SECRET: z.string().regex(/^[a-fA-F0-9]{64}$/),

  DATABASE_URL: z.string().min(1),

  // Le code et l’adresse du compte développeur sont définis uniquement dans l’environnement serveur.
  DEVELOPER_ACTIVATION_CODE: optionalEnvString,
  DEVELOPER_EMAIL: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
  ),

  WAVE_API_KEY: z.preprocess((value) => value === "" ? undefined : value, z.string().optional()),
  WAVE_REQUEST_SIGNING_SECRET: z.preprocess((value) => value === "" ? undefined : value, z.string().optional()),
  WAVE_WEBHOOK_SECRET: z.preprocess((value) => value === "" ? undefined : value, z.string().optional()),
  PUBLIC_FRONTEND_URL: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.string().url().refine((value) => new URL(value).protocol === "https:", "PUBLIC_FRONTEND_URL doit utiliser HTTPS.").optional(),
  ),

  SMTP_HOST: optionalEnvString,
  SMTP_PORT: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.coerce.number().int().min(1).max(65535).optional(),
  ),
  SMTP_SECURE: z.preprocess(
    (value) => value === "" ? undefined : value === "true" ? true : value === "false" ? false : value,
    z.boolean().default(false),
  ),
  SMTP_USER: optionalEnvString,
  SMTP_PASSWORD: optionalEnvString,
  SMTP_FROM: optionalEnvString,
})

// Vérifie les réglages réellement chargés depuis .env
const result = envSchema.safeParse(process.env)

// Si un réglage est absent ou invalide, affiche les erreurs et arrête le serveur
if (!result.success) {
  console.error("Configuration invalide dans le fichier .env :")
  console.error(result.error.issues)
  process.exit(1)
}

// Rend les réglages vérifiés disponibles aux autres fichiers
export const env = result.data
