// Importe Router pour regrouper les routes liées à la santé de l'API.
import { Router } from "express"
// Importe le client qui permet à l'API de communiquer avec PostgreSQL.
import { prisma } from "../config/database.js"
// Crée un groupe de routes Express.
const healthRouter = Router()

// GET demande une information.
// "/health" est le chemin défini à l'intérieur de ce groupe.
// _req représente la requête reçue, inutilisée ici.
// res sert à envoyer la réponse au client.
healthRouter.get("/health", (_req, res) => {
  // Envoie une réponse JSON avec le statut 200 par défaut.
  res.json({
    success: true,
    message: "Le backend fonctionne",
  })
})
// GET demande une information sans modifier les données.
// "/health/db" est le chemin de cette vérification.
// _req représente la demande reçue ; on ne l'utilise pas ici.
// res sert à renvoyer le résultat au client.
healthRouter.get("/health/db", async (_req, res) => {
  // Envoie une requête simple à PostgreSQL.
  // SELECT 1 vérifie la connexion sans lire ni modifier de table.
  await prisma.$queryRaw`SELECT 1`

  // Si la requête réussit, renvoie une réponse JSON avec le statut 200.
  res.json({
    success: true,
    message: "La connexion à PostgreSQL fonctionne",
  })
})
// Rend ce routeur importable depuis app.js.
export default healthRouter