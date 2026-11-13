/**
 * CONTROLLER CART - LOGIQUE MÉTIER
 * ================================
 * Gère le panier de l'utilisateur
 * - GET /api/cart - Récupérer mon panier
 * - POST /api/cart/items - Ajouter un produit
 * - PATCH /api/cart/items/:id - Modifier la quantité
 * - DELETE /api/cart/items/:id - Retirer un produit
 */

import { prisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * GET /api/cart
 * Récupérer le panier de l'utilisateur connecté
 * 
 * Authentification: REQUISE
 * Réponse: Panier avec tous les articles
 */
export async function getCart(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    logger.info(`🛒 Récupération du panier utilisateur ${userId}`);

    // Chercher ou créer le panier
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Si pas de panier, en créer un
    if (!cart) {
      logger.info(`🆕 Création d'un nouveau panier pour ${userId}`);
      cart = await prisma.cart.create({
        data: {
          userId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Calculer le total
    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    logger.info(`✅ Panier récupéré (${cart.items.length} articles)`);

    res.json({
      success: true,
      data: {
        ...cart,
        total, // Total en centimes
      },
      message: "Panier récupéré avec succès",
    });
  } catch (error) {
    next(error);
  }
}

// Remplace le contenu du panier par les articles choisis dans le navigateur.
export async function replaceCart(req, res, next) {
  try {
    const userId = req.user?.id;
    const items = req.body?.items;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }

    if (
      !Array.isArray(items) ||
      items.length > 100 ||
      items.some((item) =>
        !Number.isSafeInteger(item?.productId) ||
        item.productId < 1 ||
        !Number.isSafeInteger(item?.quantity) ||
        item.quantity < 1 ||
        item.quantity > 999
      )
    ) {
      return res.status(400).json({ success: false, message: "Articles du panier invalides." });
    }

    const productIds = items.map((item) => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      return res.status(400).json({ success: false, message: "Un produit apparaît plusieurs fois dans le panier." });
    }

    const cart = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stock: true },
      });

      if (products.length !== productIds.length) {
        throw ApiError.badRequest("Un ou plusieurs produits du panier n’existent plus.");
      }

      if (products.some((product) => product.stock === "OUT_OF_STOCK")) {
        throw ApiError.badRequest("Un ou plusieurs produits du panier ne sont plus disponibles.");
      }

      const savedCart = await tx.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      await tx.cartItem.deleteMany({ where: { cartId: savedCart.id } });
      if (items.length > 0) {
        await tx.cartItem.createMany({
          data: items.map(({ productId, quantity }) => ({
            cartId: savedCart.id,
            productId,
            quantity,
          })),
        });
      }

      return tx.cart.findUnique({
        where: { id: savedCart.id },
        include: { items: { include: { product: true } } },
      });
    });

    return res.json({ success: true, data: cart, message: "Panier synchronisé." });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/cart/items
 * Ajouter un produit au panier
 * 
 * Authentification: REQUISE
 * Body: { productId: number, quantity: number }
 */
export async function addToCart(req, res, next) {
  try {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "productId et quantity requis",
      });
    }

    logger.info(
      `➕ Ajout du produit ${productId} au panier (qty: ${quantity})`
    );

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produit non trouvé",
      });
    }

    // Chercher ou créer le panier
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Chercher si le produit est déjà dans le panier
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: parseInt(productId),
        },
      },
    });

    let cartItem;

    if (existingItem) {
      // Augmenter la quantité
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + parseInt(quantity),
        },
        include: { product: true },
      });
      logger.info(`📈 Quantité augmentée`);
    } else {
      // Créer un nouveau CartItem
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity: parseInt(quantity),
        },
        include: { product: true },
      });
      logger.info(`✅ Produit ajouté au panier`);
    }

    res.status(201).json({
      success: true,
      data: cartItem,
      message: "Produit ajouté au panier",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/cart/items/:id
 * Modifier la quantité d'un produit dans le panier
 * 
 * Authentification: REQUISE
 * Paramètres: id (CartItem ID)
 * Body: { quantity: number }
 */
export async function updateCartItem(req, res, next) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "quantity requis et doit être > 0",
      });
    }

    logger.info(`✏️ Modification du CartItem ${id}`);

    // Vérifier que le CartItem appartient à l'utilisateur
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Article du panier non trouvé",
      });
    }

    if (cartItem.cart.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    // Modifier la quantité
    const updated = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity: parseInt(quantity) },
      include: { product: true },
    });

    logger.info(`✅ CartItem ${id} modifié`);

    res.json({
      success: true,
      data: updated,
      message: "Quantité modifiée",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/cart/items/:id
 * Retirer un produit du panier
 * 
 * Authentification: REQUISE
 * Paramètres: id (CartItem ID)
 */
export async function removeFromCart(req, res, next) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    logger.info(`🗑️ Suppression du CartItem ${id}`);

    // Vérifier que le CartItem appartient à l'utilisateur
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Article du panier non trouvé",
      });
    }

    if (cartItem.cart.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé",
      });
    }

    // Supprimer le CartItem
    await prisma.cartItem.delete({
      where: { id: parseInt(id) },
    });

    logger.info(`✅ CartItem ${id} supprimé`);

    res.json({
      success: true,
      message: "Article retiré du panier",
    });
  } catch (error) {
    next(error);
  }
}
