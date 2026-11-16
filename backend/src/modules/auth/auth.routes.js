// Router permet de regrouper les routes liées à l'authentification.
import { Router } from "express"
import { rateLimit } from "express-rate-limit"

// Importe les fonctions qui traiteront les demandes d'inscription et de connexion.
import { currentUser, login, register, refresh, logout, logoutAll, changePassword, requestPasswordReset, resetPassword } from "./auth.controller.js"
import { requireAuth } from "../../middlewares/auth.middleware.js"

// Importe le middleware qui valide les données reçues.
import { validateBody } from "../../middlewares/validate.middleware.js"

// Importe les règles qui décrivent les données attendues.
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation.js"

// Crée un routeur pour les routes d'authentification.
const authRouter = Router()
const createAuthenticationLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message: "Trop de tentatives. Réessayez dans 15 minutes.",
      })
    },
  })

const registerLimiter = createAuthenticationLimiter()
const loginLimiter = createAuthenticationLimiter()
const refreshLimiter = createAuthenticationLimiter()
const changePasswordLimiter = createAuthenticationLimiter()
const createPasswordRecoveryLimiter = (limit) => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({
    success: false,
    message: "Trop de demandes. Réessayez dans quelques minutes.",
  }),
})
const forgotPasswordLimiter = createPasswordRecoveryLimiter(5)
const resetPasswordLimiter = createPasswordRecoveryLimiter(10)

// POST /register reçoit les informations pour créer un compte.
// validateBody vérifie les données avant que register appelle le contrôleur.
authRouter.post("/register", registerLimiter, validateBody(registerSchema), register)

// POST /login vérifie les identifiants avant d'appeler le contrôleur.
authRouter.post("/login", loginLimiter, validateBody(loginSchema), login)

// La vérification de l'ancien mot de passe précède tout changement de session.
authRouter.post("/change-password", changePasswordLimiter, validateBody(changePasswordSchema), changePassword)

// Envoie un code de récupération sans révéler si l'adresse existe.
authRouter.post("/forgot-password", forgotPasswordLimiter, validateBody(forgotPasswordSchema), requestPasswordReset)

// Vérifie le code secret à usage unique et remplace le mot de passe.
authRouter.post("/reset-password", resetPasswordLimiter, validateBody(resetPasswordSchema), resetPassword)

// GET /me retourne l'utilisateur connecté
authRouter.get("/me", requireAuth, currentUser)

// POST /refresh génère un nouveau access token
authRouter.post("/refresh", refreshLimiter, validateBody(refreshSchema), refresh)

// POST /logout révoque le refresh token
authRouter.post("/logout", validateBody(refreshSchema), logout)

// POST /logout-all révoque tous les tokens
authRouter.post("/logout-all", requireAuth, logoutAll)

// Rend ces routes disponibles pour le routeur principal de l'API.
export default authRouter
