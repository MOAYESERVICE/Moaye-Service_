// Crée les erreurs HTTP prévues par l'application.
import { createHmac, randomInt } from "node:crypto"
import { env } from "../../config/env.js"
import { logger } from "../../utils/logger.js"
import { ApiError } from "../../utils/ApiError.js"

// Hache les mots de passe et compare ceux saisis à leur empreinte.
import { comparePassword, hashPassword } from "../../utils/hash.js"

// Crée les jetons remis après une connexion réussie.
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../../utils/jwt.js"

// Utilise le dépôt pour lire et créer les comptes dans la base.
import {
  createUser,
  findUserByEmail,
  findUserById,
  replaceUserPassword,
} from "../users/user.repository.js"

// Gère les refresh tokens dans la base.
import {
  createRefreshToken as storeRefreshToken,
  findValidRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from "./refreshToken.repository.js"
import {
  consumePasswordResetToken,
  createPasswordResetToken,
  deleteExpiredPasswordResetTokens,
  deletePasswordResetTokenByHash,
  deletePasswordResetTokensForUser,
  findRecentPasswordResetToken,
} from "./passwordReset.repository.js"
import {
  getMissingPasswordResetEmailConfig,
  isPasswordResetEmailConfigured,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
} from "./password-reset-email.service.js"

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  }
}

async function createSession(user) {
  const accessToken = createAccessToken(user.id)
  const refreshToken = createRefreshToken(user.id)
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await storeRefreshToken(user.id, refreshToken, refreshTokenExpiry)

  return { user: safeUser(user), accessToken, refreshToken }
}

// Inscrit un compte client.
// Le rôle n'est pas fourni : Prisma appliquera CUSTOMER par défaut.
export async function registerUser({ name, email, phone, password }) {
  // Vérifie si l'adresse e-mail est déjà utilisée.
  const existingUser = await findUserByEmail(email)

  if (existingUser) {
    throw ApiError.conflict("Cette adresse e-mail est déjà utilisée")
  }

  // Hache le mot de passe avant de l'enregistrer.
  const passwordHash = await hashPassword(password)

  let user

  try {
    // Le client ne choisit pas son rôle.
    user = await createUser({
      name,
      email,
      phone,
      passwordHash,
    })
  } catch (error) {
    // La base possède aussi une contrainte unique sur l'e-mail.
    // Elle protège contre deux inscriptions simultanées avec la même adresse.
    if (error.code === "P2002") {
      throw ApiError.conflict("Cette adresse e-mail est déjà utilisée")
    }

    // Les autres erreurs doivent être traitées par le gestionnaire d'erreurs.
    throw error
  }

  return createSession(user)
}

// Vérifie les identifiants et crée des jetons de connexion.
export async function loginUser({ email, password }) {
  const user = await findUserByEmail(email)

  // Le même message évite d'indiquer si l'adresse existe ou si le mot de passe est faux.
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("E-mail ou mot de passe incorrect")
  }

  const passwordIsValid = await comparePassword(password, user.passwordHash)

  if (!passwordIsValid) {
    throw ApiError.unauthorized("E-mail ou mot de passe incorrect")
  }

  return createSession(user)
}

export async function changePasswordUser({ email, currentPassword, newPassword }) {
  const user = await findUserByEmail(email)
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("E-mail ou mot de passe incorrect")
  }

  const passwordIsValid = await comparePassword(currentPassword, user.passwordHash)
  if (!passwordIsValid) {
    throw ApiError.unauthorized("E-mail ou mot de passe incorrect")
  }
  if (currentPassword === newPassword) {
    throw ApiError.badRequest("Choisissez un mot de passe différent de l’ancien.")
  }

  const passwordHash = await hashPassword(newPassword)
  const updated = await replaceUserPassword(user.id, user.passwordHash, passwordHash)
  if (!updated) {
    throw ApiError.conflict("Le mot de passe a changé entre-temps. Recommencez la procédure.")
  }

  return createSession({ ...user, passwordHash })
}

export async function requestPasswordResetUser(email) {
  if (!isPasswordResetEmailConfigured()) {
    const missing = getMissingPasswordResetEmailConfig()
    throw ApiError.serviceUnavailable(
      `Configuration e-mail incomplète sur Render. Variables manquantes : ${missing.join(", ")}.`,
    )
  }

  const now = new Date()
  await deleteExpiredPasswordResetTokens(now)
  const user = await findUserByEmail(email)
  if (!user || !user.isActive) return

  const cooldownStart = new Date(now.getTime() - 2 * 60 * 1000)
  const recentRequest = await findRecentPasswordResetToken(user.id, cooldownStart)
  if (recentRequest) return

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0")
  const tokenHash = createHmac("sha256", env.JWT_SECRET)
    .update(`${user.id}:${code}`)
    .digest("hex")
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000)

  await deletePasswordResetTokensForUser(user.id)
  await createPasswordResetToken({ userId: user.id, tokenHash, expiresAt })

  try {
    // Attendre le fournisseur SMTP : ne pas annoncer un code envoyé
    // tant que le serveur de messagerie ne l'a pas acceptée.
    await sendPasswordResetEmail(user.email, code)
  } catch (error) {
    logger.error("Échec de l’envoi du code de réinitialisation", {
      userId: user.id,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    })
    try {
      // Un code non envoyé ne doit pas rester utilisable dans la base.
      await deletePasswordResetTokenByHash(tokenHash)
    } catch (cleanupError) {
      logger.error("Échec de suppression du code de réinitialisation non envoyé", {
        userId: user.id,
        error: cleanupError instanceof Error ? cleanupError.message : "Erreur inconnue",
      })
    }
    throw ApiError.serviceUnavailable("Le code n’a pas pu être envoyé. Vérifiez la configuration SMTP du serveur puis réessayez.")
  }
}

export async function resetPasswordUser({ email, code, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await findUserByEmail(normalizedEmail)
  if (!user || !user.isActive) {
    throw ApiError.badRequest("Le code est invalide ou expiré. Demandez un nouveau code.")
  }

  const tokenHash = createHmac("sha256", env.JWT_SECRET)
    .update(`${user.id}:${code}`)
    .digest("hex")
  const passwordHash = await hashPassword(password)
  const consumedEmail = await consumePasswordResetToken(normalizedEmail, tokenHash, passwordHash)

  if (!consumedEmail) {
    throw ApiError.badRequest("Le code est invalide ou expiré. Vérifiez-le ou demandez un nouveau code.")
  }

  void Promise.resolve()
    .then(() => sendPasswordChangedEmail(consumedEmail))
    .catch((error) => {
      logger.error("Échec de l’envoi de l’avis de changement de mot de passe", {
        error: error instanceof Error ? error.message : "Erreur inconnue",
      })
    })

  return { success: true }
}

// Génère un nouveau access token à partir d'un refresh token.
export async function refreshAccessToken(refreshToken) {
  const payload = verifyRefreshToken(refreshToken)
  if (!payload) {
    throw ApiError.unauthorized("Refresh token invalide ou expiré")
  }

  const storedToken = await findValidRefreshToken(refreshToken)
  if (
    !storedToken ||
    storedToken.revokedAt ||
    storedToken.expiresAt <= new Date()
  ) {
    throw ApiError.unauthorized("Refresh token révoqué")
  }

  const userId = Number(payload.sub)
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw ApiError.unauthorized("Refresh token invalide ou expiré")
  }

  const user = await findUserById(userId)
  if (!user || !user.isActive || storedToken.userId !== user.id) {
    throw ApiError.unauthorized("Utilisateur inactif ou supprimé")
  }

  const newRefreshToken = createRefreshToken(user.id)
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const rotated = await rotateRefreshToken(
    user.id,
    refreshToken,
    newRefreshToken,
    refreshTokenExpiry,
  )

  if (!rotated) {
    throw ApiError.unauthorized("Refresh token déjà utilisé ou révoqué")
  }

  return {
    accessToken: createAccessToken(user.id),
    refreshToken: newRefreshToken,
  }
}

// Révoque un refresh token (logout).
export async function logoutUser(refreshToken) {
  await revokeRefreshToken(refreshToken)
  return { success: true }
}

// Révoque tous les tokens d'un utilisateur (logout everywhere).
export async function logoutAllSessions(userId) {
  await revokeAllUserTokens(userId)
  return { success: true }
}
