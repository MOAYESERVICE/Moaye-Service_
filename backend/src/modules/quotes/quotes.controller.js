/**
 * CONTROLLER QUOTES - DEVIS
 * ==========================
 * Gère les demandes de devis des clients
 */

import { prisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
/**
 * POST /api/quotes
 * Créer une nouvelle demande de devis
 */
export async function createQuote(req, res, next) {
  try {
    const userId = req.user?.id ?? null;
    const { title, description, contactName, contactEmail, contactPhone, location, budgetRange } = req.validated;

    logger.info(`📋 Nouvelle demande de devis${userId ? ` de l'utilisateur ${userId}` : " (visiteur)"}`);

    const quote = await prisma.quote.create({
      data: {
        userId,
        title,
        description,
        contactName,
        contactEmail,
        contactPhone,
        location,
        budgetRange,
        status: "PENDING",
      },
    });

    logger.info(`✅ Devis créé: ${quote.id}`);

    res.status(201).json({
      success: true,
      message: "Votre demande de devis a été créée. Nous vous contacterons très bientôt.",
      data: {
        id: quote.id,
        createdAt: quote.createdAt,
      },
    });
  } catch (error) {
    logger.error(`❌ Erreur création devis: ${error.message}`);
    next(error);
  }
}

/**
 * GET /api/quotes
 * Récupérer mes devis (ou tous si admin)
 */
export async function getQuotes(req, res, next) {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    logger.info(`📋 Récupération devis utilisateur ${userId}`);

    const quotes = await prisma.quote.findMany({
      where: isAdmin ? undefined : { userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    logger.info(`✅ ${quotes.length} devis trouvés`);

    res.json({
      success: true,
      data: quotes,
    });
  } catch (error) {
    logger.error(`❌ Erreur récupération devis: ${error.message}`);
    next(error);
  }
}

/**
 * GET /api/quotes/:id
 * Récupérer un devis spécifique
 */
export async function getQuoteById(req, res, next) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const isAdmin = req.user?.role === "ADMIN";

    logger.info(`📋 Récupération devis ${id}`);

    const quote = await prisma.quote.findUnique({
      where: { id: parseInt(id) },
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Devis non trouvé",
      });
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (!isAdmin && quote.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas accès à ce devis",
      });
    }

    logger.info(`✅ Devis trouvé: ${quote.id}`);

    res.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    logger.error(`❌ Erreur récupération devis: ${error.message}`);
    next(error);
  }
}

/**
 * PATCH /api/quotes/:id/status
 * Modifier le statut d'un devis (ADMIN SEULEMENT)
 */
export async function updateQuoteStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, price } = req.validated;

    logger.info(`✏️ Modification devis ${id}: ${status}`);

    const quote = await prisma.quote.update({
      where: { id: parseInt(id) },
      data: {
        status,
        ...(price && { price }),
      },
    });

    logger.info(`✅ Devis modifié: ${quote.id} → ${status}`);

    res.json({
      success: true,
      message: "Devis modifié avec succès",
      data: quote,
    });
  } catch (error) {
    logger.error(`❌ Erreur modification devis: ${error.message}`);
    next(error);
  }
}
