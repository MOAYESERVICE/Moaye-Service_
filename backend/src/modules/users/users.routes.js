/**
 * ROUTES USERS
 * ============
 * Endpoints pour gérer le profil utilisateur
 * - GET /api/profile/me
 * - PATCH /api/profile
 */

import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { getMe, updateProfile } from "./users.controller.js";

const usersRouter = Router();

/**
 * GET /api/profile/me
 * Récupérer le profil de l'utilisateur connecté
 * Authentification: REQUISE
 */
usersRouter.get("/me", requireAuth, getMe);

/**
 * PATCH /api/profile
 * Modifier le profil de l'utilisateur connecté
 * Authentification: REQUISE
 * Body: { name?, phone?, email? }
 */
usersRouter.patch("/", requireAuth, updateProfile);

export default usersRouter;
