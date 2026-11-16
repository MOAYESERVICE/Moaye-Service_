/**
 * ROUTES CONTACT
 * ==============
 * Endpoints pour gérer les messages de contact
 */

import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { optionalAuth } from "../../middlewares/optional-auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/schemaValidator.js";
import { createContactSchema, contactReplySchema, updateContactStatusSchema } from "../../utils/validators.js";
import * as contactController from "./contact.controller.js";

const router = Router();

// Limite les envois par compte authentifié, en plus de la limite générale de l'API.
const contactReplyLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  keyGenerator: (req) => `user:${req.user.id}`,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de messages envoyés. Réessayez dans une minute." },
});

/**
 * POST /api/contact
 * Créer un nouveau message de contact (public)
 */
router.post("/", optionalAuth, validate(createContactSchema), contactController.createContact);

// Création d'une nouvelle demande depuis l'espace client connecté.
router.post("/mine", requireAuth, validate(createContactSchema), contactController.createContact);

// Un client consulte seulement ses propres conversations.
router.get("/mine", requireAuth, contactController.getMyContacts);

// Le client propriétaire ou un administrateur peut répondre au fil.
router.post("/:id/replies", requireAuth, contactReplyLimiter, validate(contactReplySchema), contactController.createReply);

/**
 * GET /api/contact
 * Récupérer tous les messages (ADMIN SEULEMENT)
 */
router.get("/", requireAuth, requireRole("ADMIN"), contactController.getContacts);

/**
 * PATCH /api/contact/:id/status
 * Changer le statut d'un contact (ADMIN SEULEMENT)
 */
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN"),
  validate(updateContactStatusSchema),
  contactController.updateContactStatus,
);


/**
 * DELETE /api/contact/:id
 * Suppression définitive réservée aux administrateurs.
 */
router.delete("/:id", requireAuth, requireRole("ADMIN"), contactController.deleteContact);
export default router;
