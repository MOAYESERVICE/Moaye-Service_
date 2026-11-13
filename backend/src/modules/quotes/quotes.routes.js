/**
 * ROUTES QUOTES
 * =============
 * Endpoints pour gérer les devis
 */

import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { optionalAuth } from "../../middlewares/optional-auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/schemaValidator.js";
import { createQuoteSchema, updateQuoteStatusSchema } from "../../utils/validators.js";
import * as quoteController from "./quotes.controller.js";

const router = Router();
const createQuoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de demandes. Réessayez dans quelques minutes." },
});

/**
 * POST /api/quotes
 * Créer une demande de devis (visiteur ou client connecté)
 */
router.post("/", createQuoteLimiter, optionalAuth, validate(createQuoteSchema), quoteController.createQuote);

/**
 * GET /api/quotes
 * Récupérer tous mes devis
 */
router.get("/", requireAuth, quoteController.getQuotes);

/**
 * GET /api/quotes/:id
 * Récupérer un devis spécifique
 */
router.get("/:id", requireAuth, quoteController.getQuoteById);

/**
 * PATCH /api/quotes/:id/status
 * Modifier le statut d'un devis (ADMIN SEULEMENT)
 */
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN"),
  validate(updateQuoteStatusSchema),
  quoteController.updateQuoteStatus,
);

export default router;
