/**
 * MIDDLEWARE VALIDATION REQUÊTES AVEC ZOD
 * =========================================
 * Valide que les données envoyées respectent un schéma
 * Si invalide: retourne 400 avec détails
 * Si valide: passe les données à req.validated
 */

import { z } from 'zod'

/**
 * Middleware de validation du body
 * @param {Object} schema - Schéma Zod
 * @returns {Function} Middleware Express
 * 
 * Utilisé: router.post('/...', validate(createOrderSchema), controller)
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Valider req.body contre le schéma
      const validated = schema.parse(req.body)

      // Ajouter les données validées à la requête
      req.validated = validated

      next()
    } catch (error) {
      // Formater les erreurs Zod
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))

        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: formattedErrors
        })
      }

      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        error: error.message
      })
    }
  }
}

/**
 * Valider les paramètres de query
 * Utilisé: router.get('/', validateQuery(searchSchema), controller)
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query)
      req.validated = validated
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Paramètres invalides',
          errors: error.errors
        })
      }
      next(error)
    }
  }
}
