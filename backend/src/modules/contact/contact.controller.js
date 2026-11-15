/**
 * CONTROLLER CONTACT - MESSAGES DE CONTACT
 * ==========================================
 * Gère les messages de contact des visiteurs
 */

import { prisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";

function serializeContact(contact) {
  const { legacyReplies, threadReplies, ...record } = contact;
  const legacy = Array.isArray(legacyReplies) ? legacyReplies.filter((item) => item && typeof item.message === "string" && item.message.trim()) : [];
  const replies = [
    ...legacy.map((item, index) => ({
      id: String(item.id ?? `legacy-${contact.id}-${index}`),
      sender: item.sender === "ADMIN" ? "ADMIN" : "CUSTOMER",
      name: typeof item.name === "string" ? item.name : item.sender === "ADMIN" ? "Administration" : contact.name,
      message: item.message,
      createdAt: item.createdAt ?? contact.createdAt.toISOString(),
    })),
    ...(threadReplies ?? []).map((reply) => ({
      id: String(reply.id),
      sender: reply.senderRole,
      name: reply.senderName,
      message: reply.message,
      createdAt: reply.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return { ...record, replies };
}

const contactWithReplies = {
  threadReplies: { orderBy: { createdAt: "asc" } },
};

/**
 * POST /api/contact
 * Créer un nouveau message de contact
 */
export async function createContact(req, res, next) {
  try {
    const { name, email, phone, subject, message } = req.validated;

    const contact = await prisma.contact.create({
      data: {
        userId: req.user?.id ?? null,
        name: req.user?.name ?? name,
        email: req.user?.email ?? email,
        phone: (req.user?.phone ?? phone) || null,
        subject,
        message,
        status: "NEW",
      },
    });

    logger.info("Nouveau message de contact enregistré", { contactId: contact.id, userId: req.user?.id ?? null });

    res.status(201).json({
      success: true,
      message: "Votre message a été envoyé avec succès. Nous vous recontacterons rapidement.",
      data: {
        id: contact.id,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    logger.error(`❌ Erreur création contact: ${error.message}`);
    next(error);
  }
}

export async function getMyContacts(req, res, next) {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: "desc" },
      include: contactWithReplies,
    });
    res.json({ success: true, data: contacts.map(serializeContact) });
  } catch (error) {
    next(error);
  }
}

export async function createReply(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Identifiant de conversation invalide." });
    }
    const isAdmin = req.user.role === "ADMIN";
    const result = await prisma.$transaction(async (tx) => {
      const contact = await tx.contact.findUnique({ where: { id }, select: { id: true, userId: true } });
      if (!contact) return { kind: "missing" };
      if (!isAdmin && contact.userId !== req.user.id) return { kind: "forbidden" };

      await tx.contactReply.create({
        data: {
          contactId: id,
          authorId: req.user.id,
          senderRole: isAdmin ? "ADMIN" : "CUSTOMER",
          senderName: req.user.name,
          message: req.validated.message,
        },
      });
      const updated = await tx.contact.update({
        where: { id },
        data: { status: isAdmin ? "VIEWED" : "NEW" },
        include: contactWithReplies,
      });
      return { kind: "updated", contact: updated };
    });
    if (result.kind === "missing") return res.status(404).json({ success: false, message: "Conversation introuvable." });
    if (result.kind === "forbidden") return res.status(403).json({ success: false, message: "Vous ne pouvez pas répondre à cette conversation." });
    res.status(201).json({ success: true, data: serializeContact(result.contact) });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/contact
 * Récupérer tous les messages (ADMIN SEULEMENT)
 */
export async function getContacts(req, res, next) {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: contactWithReplies,
    });

    res.json({
      success: true,
      data: contacts.map(serializeContact),
    });
  } catch (error) {
    logger.error("Erreur récupération contacts", { error });
    next(error);
  }
}

/**
 * PATCH /api/contact/:id/status
 * Changer le statut d'un contact (ADMIN SEULEMENT)
 */
export async function updateContactStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.validated;

    logger.info(`✏️ Modification statut contact ${id}: ${status}`);

    const contact = await prisma.contact.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    logger.info(`✅ Statut modifié: ${contact.id} → ${status}`);

    res.json({
      success: true,
      message: "Statut du message modifié",
      data: contact,
    });
  } catch (error) {
    logger.error(`❌ Erreur modification statut: ${error.message}`);
    next(error);
  }
}

/**
 * DELETE /api/contact/:id
 * Supprimer définitivement un message et ses réponses (ADMIN SEULEMENT).
 */
export async function deleteContact(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Identifiant de conversation invalide." });
    }

    const contact = await prisma.contact.findUnique({ where: { id }, select: { id: true } });
    if (!contact) return res.status(404).json({ success: false, message: "Conversation introuvable." });

    await prisma.contact.delete({ where: { id } });
    logger.info("Conversation supprimée par un administrateur", { contactId: id, adminId: req.user.id });
    return res.json({ success: true, message: "Conversation et réponses supprimées." });
  } catch (error) {
    logger.error("Erreur suppression conversation", { error });
    next(error);
  }
}