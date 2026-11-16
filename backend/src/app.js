

import express from "express"
import { rateLimit } from "express-rate-limit"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { env } from "./config/env.js"
import { logger, httpLogger } from "./config/logger.js"
import { errorHandler, wrap } from "./middlewares/errorHandler.js"
import apiRouter from "./routes/index.js"
import { handleWaveWebhook } from "./modules/payments/wave.controller.js"

const app = express()
const uploadsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../uploads/products",
)


app.disable("x-powered-by")

// Render place l’application derrière son proxy. Faire confiance au premier
// proxy permet au rate limiter de lire l’adresse transmise par X-Forwarded-For.
app.set("trust proxy", 1)


app.use(helmet())

// CORS: autoriser frontend à appeler
const frontendOrigins = new Set(
  env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
)
app.use(
  cors({
    origin(origin, callback) {
      const isLocalFrontend =
        env.NODE_ENV !== "production" &&
        /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || "")

      if (!origin || frontendOrigins.has(origin) || isLocalFrontend) {
        return callback(null, true)
      }

      return callback(new Error("Origine frontend non autorisée par CORS."))
    },
  })
)

// Logger requêtes HTTP
app.use(morgan("combined"))
app.use(httpLogger)

// ============================================
// 3. RATE LIMITING (anti-spam)
// ============================================

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // Fenêtre: 1 minute
  limit: 100, // Max 100 requêtes par IP par minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: "Trop de requêtes. Réessayez dans 1 minute."
    })
  }
})

// Rate limiting seulement sur /api
app.use("/api", apiLimiter)

// Wave signs the exact raw body; this route must run before the JSON parser.
app.post(
  "/api/payments/wave/webhook",
  express.raw({ type: "application/json", limit: "64kb" }),
  wrap(handleWaveWebhook),
)

// Parser JSON for the remaining API routes (max 64KB).
app.use(express.json({ limit: "64kb" }))

// ============================================
// 4. ROUTES
// ============================================

// Rend les photos produits téléversées accessibles au frontend via son proxy.
app.use(
  "/uploads/products",
  express.static(uploadsDirectory, {
    fallthrough: false,
    immutable: true,
    maxAge: "1y",
  }),
)

app.use("/api", apiRouter)

// ============================================
// 5. ROUTE WILDCARD (404)
// ============================================

app.use((req, res) => {
  logger.warn("Route introuvable", { method: req.method, path: req.path })
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} introuvable`
  })
})

// ============================================
// 6. ERROR HANDLER (DOIT être le DERNIER!)
// ============================================

app.use(errorHandler)

export default app
