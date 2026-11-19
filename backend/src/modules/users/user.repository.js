// Importe le client partagé qui communique avec PostgreSQL.
import { prisma } from "../../config/database.js"

// Cherche un compte par son adresse e-mail.
// Cette fonction servira à vérifier les identifiants lors de la connexion.
export function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  })
}

// Cherche un compte par son identifiant, sans récupérer son mot de passe haché.
// Cette fonction servira à vérifier le compte associé à un jeton.
export function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
    },
  })
}

// Enregistre un nouveau compte dans la base.
// Le service devra fournir un mot de passe déjà haché.
export function createUser(data) {
  return prisma.user.create({
    data,
  })
}

// Donne le rôle administrateur au compte développeur et invalide ses anciennes sessions.
export function activateDeveloperAccount(id) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id },
      data: { role: "ADMIN" },
    })

    await tx.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    return user
  })
}

// Remplace le mot de passe et révoque les sessions existantes atomiquement.
export function replaceUserPassword(id, currentPasswordHash, passwordHash) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({
      where: { id, passwordHash: currentPasswordHash },
      data: { passwordHash },
    })

    if (updated.count !== 1) return false

    await tx.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    return true
  })
}
