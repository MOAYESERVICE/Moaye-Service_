/**
 * CONTROLLER USERS - LOGIQUE MÉTIER
 * ==================================
 * Gère le profil utilisateur
 * - GET /api/profile/me - Récupérer mon profil
 * - PATCH /api/profile - Modifier mon profil
 */

import { prisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";

/**
 * GET /api/profile/me
 * Récupérer le profil de l'utilisateur connecté
 * 
 * Authentification: REQUISE (JWT)
 * Réponse: Données utilisateur (sans password!)
 */
export async function getMe(req, res, next) {
  try {
    // req.user vient du middleware authenticate()
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    logger.info(`📋 Récupération profil utilisateur ${userId}`);

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Ne JAMAIS retourner le password!
      },
    });

    if (!user) {
      logger.warn(`⚠️ Utilisateur ${userId} non trouvé`);
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    logger.info(`✅ Profil récupéré pour ${user.name}`);

    res.json({
      success: true,
      data: user,
      message: "Profil récupéré avec succès",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/profile
 * Modifier le profil de l'utilisateur connecté
 * 
 * Authentification: REQUISE
 * Body optionnel:
 * - name: String
 * - phone: String
 * - email: String (attention: doit être unique!)
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    const { name, phone, email } = req.body;

    logger.info(`✏️ Modification du profil utilisateur ${userId}`);

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Vérifier que le nouvel email n'existe pas déjà
    if (email && email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Cet email est déjà utilisé",
        });
      }
    }

    // Modifier les champs fournis
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    logger.info(`✅ Profil modifié pour ${updatedUser.name}`);

    res.json({
      success: true,
      data: updatedUser,
      message: "Profil modifié avec succès",
    });
  } catch (error) {
    next(error);
  }
}
