// Importe les fonctions qui inscrivent un utilisateur et le connectent.
import {
  loginUser,
  registerUser,
  refreshAccessToken,
  logoutUser,
  logoutAllSessions,
  changePasswordUser,
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
