/**
 * ROUTES ORDERS
 * =============
 * Définit les endpoints pour gérer les commandes
 * 
 * Middleware appliqués:
 * - authenticate: JWT requis
 * - authorize('ADMIN'): Rôle admin requis
 * - validate(schema): Validation des données
 */

import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'
import { validate } from '../../middlewares/schemaValidator.js'
import { createOrderSchema } from '../../utils/validators.js'
import { z } from 'zod'
import * as orderController from './orders.controller.js'

const router = Router()

/**
 * POST /api/orders
 * Créer une nouvelle commande
 * 
 * Body:
 * {
 *   "items": [
 *     { "productId": 1, "quantity": 2, "specs": ["color:red"] }
 *   ],
 *   "shippingAddress": "123 Main St",
 *   "shippingCity": "Dakar",
 *   "shippingPostal": "12345",
 *   "shippingPhone": "+221701234567",
 *   "paymentMethod": "WAVE"
 * }
 * 
 * Response: 201 Created
 * {
 *   "success": true,
 *   "data": { order object }
 * }
 */
router.post(
  '/',
  requireAuth,
  validate(createOrderSchema),           // ← Valider body
  orderController.createOrder            // ← Créer commande
)

/**
 * GET /api/orders/admin/all
 * Récupérer TOUTES les commandes (ADMIN SEULEMENT)
 * 
 * Response: 200 OK
 * {
 *   "success": true,
 *   "data": [ order objects ]
 * }
 */
router.get(
  '/admin/all',
  requireAuth,
  requireRole('ADMIN'),
  orderController.getAllOrders           // ← Lister toutes les commandes
)

/**
 * GET /api/orders
 * Récupérer mes commandes
 * 
 * Response: 200 OK
 * {
 *   "success": true,
 *   "data": [ order objects ]
 * }
 */
router.get(
  '/',
  requireAuth,
  orderController.getOrders              // ← Lister mes commandes
)

/**
 * GET /api/orders/:id
 * Récupérer une commande spécifique
 * 
 * Params: id (number)
 * 
 * Response: 200 OK
 * {
 *   "success": true,
 *   "data": { order object }
 * }
 */
router.get(
  '/:id',
  requireAuth,
  orderController.getOrderById           // ← Récupérer
)

/**
 * PATCH /api/orders/:id/status
 * Modifier le status (ADMIN SEULEMENT)
 * 
 * Body:
 * {
 *   "status": "CONFIRMED",
 *   "paymentStatus": "COMPLETED"
 * }
 * 
 * Response: 200 OK
 */
router.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  validate(
    z.object({
      status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
      paymentStatus: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional()
    })
  ),
  orderController.updateOrderStatus      // ← Modifier
)

/**
 * DELETE /api/orders/:id
 * Annuler une commande (ADMIN SEULEMENT)
 * 
 * Response: 200 OK
 */
router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  orderController.deleteOrder            // ← Annuler
)

export default router
