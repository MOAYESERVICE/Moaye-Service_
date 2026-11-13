// Crée les erreurs HTTP prévues par l'application.
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
