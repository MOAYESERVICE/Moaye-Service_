/**
 * ROUTES CART
 * ===========
 * Endpoints pour gérer le panier
 * - GET /api/cart
 * - POST /api/cart/items
 * - PATCH /api/cart/items/:id
 * - DELETE /api/cart/items/:id
 */

import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  replaceCart,
} from "./cart.controller.js";

const cartRouter = Router();

/**
 * GET /api/cart
 * Récupérer le panier complet
 * Authentification: REQUISE
 */
cartRouter.get("/", requireAuth, getCart);

// Remplace le panier enregistré par la sélection complète du frontend.
cartRouter.put("/", requireAuth, replaceCart);

/**
 * POST /api/cart/items
 * Ajouter un produit au panier
 * Authentification: REQUISE
 * Body: { productId: number, quantity: number }
 */
cartRouter.post("/items", requireAuth, addToCart);

/**
 * PATCH /api/cart/items/:id
 * Modifier la quantité d'un article
 * Authentification: REQUISE
 * Body: { quantity: number }
 */
cartRouter.patch("/items/:id", requireAuth, updateCartItem);

/**
 * DELETE /api/cart/items/:id
 * Retirer un article du panier
 * Authentification: REQUISE
 */
cartRouter.delete("/items/:id", requireAuth, removeFromCart);

export default cartRouter;
