/**
 * MIDDLEWARE GESTION DES ERREURS GLOBAL
 * ======================================
 * Capture TOUTES les erreurs du backend
 * Formate une réponse JSON cohérente
 * Enregistre dans les logs
 * 
 * IMPORTANT: Ce middleware DOIT être appliqué APRÈS toutes les autres routes!
 */

import { logger } from '../config/logger.js'

/**
 * Classe pour erreurs API personnalisées
 * Permet de spécifier le code HTTP et message
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

/**
 * Middleware de gestion des erreurs
 * IMPORTANT: DOIT avoir 4 paramètres (err, req, res, next)
 * Express reconnait cela comme error handler
 */
export const errorHandler = (err, req, res, next) => {
  // Déterminer le code HTTP
  let statusCode = err.statusCode || err.status || 500
  let message = err.message || 'Erreur serveur interne'
  let details = err.details || null

  // Erreurs Prisma spéciales
  if (err.code === 'P2002') {
    // Unique constraint violation
    statusCode = 409
    message = `Conflit: ${err.meta?.target?.join(', ')} déjà utilisé`
  }

  if (err.code === 'P2003') {
    // Foreign key constraint failed
    statusCode = 400
    message = 'Référence invalide (parent n\'existe pas)'
  }

  if (err.code === 'P2025') {
    // Record not found
    statusCode = 404
    message = 'Ressource non trouvée'
  }

  // Enregistrer l'erreur dans les logs
  logger.error('Erreur API:', {
    method: req.method,
    path: req.path,
    statusCode,
    message,
    stack: err.stack,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  })

  // En production, ne pas révéler les détails internes
  const isDevelopment = process.env.NODE_ENV === 'development'
  const response = {
    success: false,
    message,
    ...(isDevelopment && { details, stack: err.stack })
  }

  res.status(statusCode).json(response)
}

/**
 * Wrapper pour les routes async
 * Les erreurs async ne sont pas capturées automatiquement
 * 
 * Utilisé: wrap(async (req, res) => { ... })
 */
export const wrap = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
