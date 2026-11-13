// jsonwebtoken crée les jetons signés utilisés pour l'authentification.
import jwt from "jsonwebtoken"

// Importe le secret vérifié depuis la configuration.
import { env } from "../config/env.js"

// Crée un jeton valable 15 minutes pour l'utilisateur connecté.
export function createAccessToken(userId) {
  return jwt.sign(
    { sub: String(userId), type: "access" },
    env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "15m",
    },
  )
}

// Crée un refresh token valable 7 jours pour l'utilisateur connecté.
export function createRefreshToken(userId) {
  return jwt.sign(
    { sub: String(userId), type: "refresh" },
    env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "7d",
    },
  )
}

// Vérifie et décode un access token.
export function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] })
    
    if (typeof payload !== "object" || typeof payload.sub !== "string" || payload.type !== "access") {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

// Vérifie et décode un refresh token.
export function verifyRefreshToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] })
    
    if (typeof payload !== "object" || typeof payload.sub !== "string" || payload.type !== "refresh") {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}