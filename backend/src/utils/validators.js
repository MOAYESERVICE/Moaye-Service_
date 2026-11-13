/**
 * SCHÉMAS ZOD RÉUTILISABLES
 * ==========================
 * Tous les schémas de validation en un lieu
 * Utilisés dans middleware validate()
 */

import { z } from 'zod'

/**
 * Schéma: Création d'une commande
 */
export const createOrderSchema = z.object({
  shippingAddress: z.string().trim().min(1, 'Adresse requise'),
  shippingCity: z.string().trim().min(1, 'Ville requise'),
  shippingZip: z.string().trim().min(1, 'Code postal requis'),
  shippingPhone: z.string().trim().min(1, 'Téléphone requis'),
  paymentMethod: z.enum(['CARD', 'BANK_TRANSFER', 'WAVE', 'PAYTECH']),
})

/**
 * Schéma: Ajouter item au panier
 */
export const addToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(999),
  specs: z.array(z.string()).optional()
})

/**
 * Schéma: Modifier quantité panier
 */
export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(999)
})

/**
 * Schéma: Créer un devis
 */
export const createQuoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(10).max(5000),
  contactName: z.string().trim().min(2).max(100),
  contactEmail: z.string().trim().email().max(254),
  contactPhone: z.string().trim().min(8).max(20),
  location: z.string().trim().min(1).max(200),
  budgetRange: z.string().trim().min(1).max(100),
}).strict()

/**
 * Schéma: Modifier un devis (admin)
 */
export const updateQuoteStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED']),
  price: z.number().positive().optional()
})

/**
 * Schéma: Créer demande contact
 */
export const createContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(3).max(100),
  message: z.string().min(10).max(5000)
})

/**
 * Schéma: Modifier statut contact (admin)
 */
export const updateContactStatusSchema = z.object({
  status: z.enum(['NEW', 'VIEWED', 'RESOLVED'])
})

export const contactReplySchema = z.object({
  message: z.string().trim().min(1).max(5000),
})

export const updateAdminUserSchema = z.object({
  role: z.enum(["ADMIN", "CUSTOMER"]).optional(),
  isActive: z.boolean().optional(),
}).strict().refine((data) => data.role !== undefined || data.isActive !== undefined, {
  message: "Indiquez un rôle ou un statut à modifier.",
})

/**
 * Schéma: Modifier profil
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional()
})

/**
 * Schéma: Créer avis
 */
export const createReviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
})
