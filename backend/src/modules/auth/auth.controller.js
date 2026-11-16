// Importe les fonctions qui inscrivent un utilisateur et le connectent.
import {
  loginUser,
  registerUser,
  refreshAccessToken,
  logoutUser,
  logoutAllSessions,
  changePasswordUser,
  requestPasswordResetUser,
  resetPasswordUser,
} from "./auth.service.js"

// Reçoit une demande d'inscription et crée un compte client.
export async function register(req, res) {
  const result = await registerUser(req.body)

  // 201 signifie qu'un nouveau compte a été créé.
  res.status(201).json({
    success: true,
    data: result,
  })
}

// Vérifie les identifiants et renvoie les jetons de connexion.
export async function login(req, res) {
  const result = await loginUser(req.body)

  res.status(200).json({
    success: true,
    data: result,
  })
}

export async function changePassword(req, res) {
  const result = await changePasswordUser(req.body)
  res.status(200).json({ success: true, data: result })
}

export async function requestPasswordReset(req, res) {
  const startedAt = Date.now()
  await requestPasswordResetUser(req.body.email)
  const remaining = 250 - (Date.now() - startedAt)
  if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining))

  res.status(202).json({
    success: true,
    message: "Si un compte existe avec cette adresse, un code de réinitialisation va être envoyé par e-mail.",
  })
}

export async function resetPassword(req, res) {
  await resetPasswordUser(req.body)
  res.status(200).json({ success: true, message: "Votre mot de passe a bien été mis à jour." })
}

export function currentUser(req, res) {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
      },
    },
  })
}

// Génère un nouveau access token à partir d'un refresh token.
export async function refresh(req, res) {
  const result = await refreshAccessToken(req.body.refreshToken)

  res.status(200).json({
    success: true,
    data: result,
  })
}

// Révoque un refresh token (logout).
export async function logout(req, res) {
  await logoutUser(req.body.refreshToken)

  res.status(200).json({
    success: true,
    message: "Déconnecté avec succès",
  })
}

// Révoque tous les tokens d'un utilisateur (logout everywhere).
export async function logoutAll(req, res) {
  await logoutAllSessions(req.user.id)

  res.status(200).json({
    success: true,
    message: "Déconnecté de toutes les sessions",
  })
}
