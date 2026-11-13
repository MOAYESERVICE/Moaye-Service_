// Importe le client généré par Prisma à partir du schéma de la base.
import { PrismaClient } from "../../generated/prisma/client.js"

// Importe l'adaptateur qui relie Prisma au pilote PostgreSQL.
import { PrismaPg } from "@prisma/adapter-pg"

// Importe les réglages déjà vérifiés, notamment l'adresse de la base.
import { env } from "./env.js"

// Prépare la connexion PostgreSQL à partir de DATABASE_URL dans .env.
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
})

// Crée un client Prisma que les autres fichiers pourront réutiliser.
export const prisma = new PrismaClient({
  adapter,
})