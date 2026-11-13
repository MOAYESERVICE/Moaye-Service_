/**
 * CONTROLLER ORDERS - LOGIQUE MÉTIER
 * ===================================
 * Gère les commandes: création, récupération, modification
 */

import { prisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";

/**
 * POST /api/orders
 * Créer une nouvelle commande depuis le panier
 */
export async function createOrder(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    // Utiliser les données validées plutôt que req.body
    const { shippingAddress, shippingCity, shippingZip, shippingPhone, paymentMethod } = req.validated;

    logger.info(`📦 Création commande pour utilisateur ${userId}`);

    // Récupérer le panier de l'utilisateur
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Le panier est vide",
      });
    }

    // Calculer le prix total
    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const price = item.product.price;
      const quantity = item.quantity;
      const subtotal = price * quantity;
      totalPrice += subtotal;

      orderItems.push({
        productId: item.productId,
        quantity,
        price,
      });
    }

    logger.info(`💰 Total commande: ${totalPrice} centimes`);

    // Créer la commande avec ses articles et les informations de livraison/paiement
    const order = await prisma.order.create({
      data: {
        userId,
        shippingAddress,
        shippingCity,
        shippingZip,
        shippingPhone,
        paymentMethod,
        totalPrice,
        status: "PENDING",
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    // Vider le panier après création commande
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    logger.info(`✅ Commande créée: ${order.id}`);

    res.status(201).json({
      success: true,
      message: "Commande créée avec succès",
      data: order,
    });
  } catch (error) {
    logger.error(`❌ Erreur création commande: ${error.message}`);
    next(error);
  }
}

/**
 * GET /api/orders/admin/all
 * Récupérer TOUTES les commandes (ADMIN SEULEMENT)
 */
export async function getAllOrders(req, res, next) {
  try {
    logger.info(`📋 Récupération de TOUTES les commandes (ADMIN)`);

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                category: { select: { name: true } },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    logger.info(`✅ ${orders.length} commandes trouvées (admin)`);

    res.json({
      success: true,
      message: "Toutes les commandes récupérées",
      data: orders,
    });
  } catch (error) {
    logger.error(`❌ Erreur récupération commandes admin: ${error.message}`);
    next(error);
  }
}

/**
 * GET /api/orders
 * Récupérer mes commandes (utilisateur authentifié)
 */
export async function getOrders(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    logger.info(`📋 Récupération commandes utilisateur ${userId}`);

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    logger.info(`✅ ${orders.length} commandes trouvées`);

    res.json({
      success: true,
      message: "Commandes récupérées",
      data: orders,
    });
  } catch (error) {
    logger.error(`❌ Erreur récupération commandes: ${error.message}`);
    next(error);
  }
}

/**
 * GET /api/orders/:id
 * Récupérer une commande spécifique
 */
export async function getOrderById(req, res, next) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    logger.info(`📦 Récupération commande ${id}`);

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée",
      });
    }

    // Vérifier que l'utilisateur est propriétaire de la commande
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas accès à cette commande",
      });
    }

    logger.info(`✅ Commande trouvée: ${order.id}`);

    res.json({
      success: true,
      message: "Commande récupérée",
      data: order,
    });
  } catch (error) {
    logger.error(`❌ Erreur récupération commande: ${error.message}`);
    next(error);
  }
}

/**
 * PATCH /api/orders/:id/status
 * Modifier le statut d'une commande (ADMIN)
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    logger.info(`✏️ Modification statut commande ${id}: ${status}`);

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status,
      },
      include: {
        items: true,
      },
    });

    logger.info(`✅ Statut modifié: ${order.id} → ${status}`);

    res.json({
      success: true,
      message: "Statut de la commande modifié",
      data: order,
    });
  } catch (error) {
    logger.error(`❌ Erreur modification statut: ${error.message}`);
    next(error);
  }
}

/**
 * DELETE /api/orders/:id
 * Annuler une commande (ADMIN)
 */
export async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params;

    logger.info(`🗑️ Suppression commande ${id}`);

    const order = await prisma.order.delete({
      where: { id: parseInt(id) },
    });

    logger.info(`✅ Commande supprimée: ${order.id}`);

    res.json({
      success: true,
      message: "Commande annulée",
      data: order,
    });
  } catch (error) {
    logger.error(`❌ Erreur suppression commande: ${error.message}`);
    next(error);
  }
}
