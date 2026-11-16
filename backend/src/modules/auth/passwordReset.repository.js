import { prisma } from "../../config/database.js"

export function findRecentPasswordResetToken(userId, since) {
  return prisma.passwordResetToken.findFirst({
    where: {
      userId,
      usedAt: null,
      createdAt: { gt: since },
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  })
}

export function deletePasswordResetTokensForUser(userId) {
  return prisma.passwordResetToken.deleteMany({ where: { userId } })
}

export function deleteExpiredPasswordResetTokens(now = new Date()) {
  return prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lte: now } } })
}

export function createPasswordResetToken({ userId, tokenHash, expiresAt }) {
  return prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } })
}

export function deletePasswordResetTokenByHash(tokenHash) {
  return prisma.passwordResetToken.deleteMany({ where: { tokenHash } })
}

export async function consumePasswordResetToken(email, tokenHash, passwordHash) {
  try {
    return await prisma.$transaction(async (tx) => {
      const now = new Date()
      const reset = await tx.passwordResetToken.findFirst({
        where: {
          user: { email },
          usedAt: null,
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, email: true, isActive: true } } },
      })

      if (!reset || !reset.user.isActive || reset.attempts >= 5) return null

      if (reset.tokenHash !== tokenHash) {
        await tx.passwordResetToken.updateMany({
          where: { id: reset.id, usedAt: null, expiresAt: { gt: now }, attempts: { lt: 5 } },
          data: { attempts: { increment: 1 } },
        })
        return null
      }

      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: reset.id, usedAt: null, expiresAt: { gt: now }, attempts: { lt: 5 }, tokenHash },
        data: { usedAt: now },
      })
      if (claimed.count !== 1) return null

      const changed = await tx.user.updateMany({
        where: { id: reset.userId, isActive: true },
        data: { passwordHash },
      })
      if (changed.count !== 1) throw new Error("PASSWORD_RESET_USER_INVALID")

      await tx.refreshToken.updateMany({
        where: { userId: reset.userId, revokedAt: null },
        data: { revokedAt: now },
      })
      await tx.passwordResetToken.deleteMany({
        where: { userId: reset.userId, id: { not: reset.id } },
      })

      return reset.user.email
    })
  } catch (error) {
    if (error instanceof Error && error.message === "PASSWORD_RESET_USER_INVALID") return null
    throw error
  }
}
