// Gère les refresh tokens dans la base de données.
import { prisma } from "../../config/database.js"
import { createHash } from "node:crypto"

function hashToken(token) {
  return createHash("sha256").update(token, "utf8").digest("hex")
}

// Crée un nouveau refresh token dans la DB.
export async function createRefreshToken(userId, token, expiresAt) {
  return prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
    },
  })
}

// Atomically invalidates the previous token and stores its replacement.
export function rotateRefreshToken(userId, oldToken, newToken, expiresAt) {
  return prisma.$transaction(async (tx) => {
    const now = new Date()
    const revoked = await tx.refreshToken.updateMany({
      where: {
        userId,
        tokenHash: hashToken(oldToken),
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { revokedAt: now },
    })

    if (revoked.count !== 1) return false

    await tx.refreshToken.create({
      data: { userId, tokenHash: hashToken(newToken), expiresAt },
    })

    return true
  })
}

// Cherche un refresh token valide (non expiré et non révoqué).
export async function findValidRefreshToken(token) {
  return prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  })
}

// Révoque un refresh token (logout).
export async function revokeRefreshToken(token) {
  return prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

// Révoque tous les tokens d'un utilisateur (logout everywhere).
export async function revokeAllUserTokens(userId) {
  return prisma.refreshToken.updateMany({
    where: { userId },
    data: { revokedAt: new Date() },
  })
}

// Supprime les tokens expirés (nettoyage).
export async function deleteExpiredTokens() {
  return prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
}
