// Charge les variables définies dans le fichier .env.
import "dotenv/config";

// Importe l'outil qui permet de configurer Prisma.
import { defineConfig } from "prisma/config";

// Indique à Prisma où trouver le schéma, les migrations et la base.
export default defineConfig({
  // Fichier qui décrit les modèles, les champs et les relations de la base.
  schema: "prisma/schema.prisma",

  // Dossier dans lequel Prisma enregistrera l'historique des changements.
  migrations: {
    path: "prisma/migrations",
  },

  // Adresse PostgreSQL chargée depuis la variable DATABASE_URL du fichier .env.
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
