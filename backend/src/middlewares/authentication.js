/**
 * MIDDLEWARE AUTHENTIFICATION JWT
 * ================================
 * Vérifie que l'utilisateur est connecté (JWT valide)
 * Extrait les infos utilisateur du token et les ajoute à req.user
 */

import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

/**
 * Middleware d'authentification JWT
 * Récupère le token depuis "Authorization: Bearer TOKEN"
 * Vérifie la signature du token
 * Ajoute req.user avec {id, email, role}
 */
export const authenticate = (req, res, next) => {
  try {
    // 1. Récupérer le header Authorization
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant. Format: "Authorization: Bearer YOUR_TOKEN"'
      })
    }

    // 2. Extraire le token (enlever "Bearer ")
    const token = authHeader.substring(7)

    // 3. Vérifier et décoder le token
    const decoded = jwt.verify(token, env.JWT_SECRET)

    // 4. Ajouter les infos utilisateur à req
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    }

    // 5. Passer au middleware suivant
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    })
  }
}

/**
 * Middleware d'autorisation (vérifier les rôles)
 * @param {...string} roles - Rôles autorisés ('ADMIN', 'CUSTOMER', etc)
 * @returns {Function} Middleware
 * 
 * Utilisé: router.delete('/...', authenticate, authorize('ADMIN'), controller)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Vérifier que authenticate() a été appelé
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      })
    }

    // Vérifier que le rôle est autorisé
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Rôles autorisés: ${roles.join(', ')}`
      })
    }

    next()
  }
}

/**
 * Vérifier que l'utilisateur est propriétaire de la ressource
 * Utilisé dans les controllers:
 * 
 * const order = await prisma.order.findUnique({ where: { id } })
 * if (!isOwnerOrAdmin(order.userId, req)) {
 *   throw new Error('Non autorisé')
 * }
 */
export const isOwnerOrAdmin = (resourceOwnerId, req) => {
  return req.user.id === resourceOwnerId || req.user.role === 'ADMIN'
}
