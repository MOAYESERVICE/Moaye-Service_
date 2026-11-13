import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";

const router = Router();

const updateHomepageCardSchema = z.object({
  title: z.string().trim().min(1).max(160),
  imageUrl: z.string().trim().min(1).max(500).refine(
    (value) => value.startsWith("/") && !value.startsWith("//") && !value.includes(".."),
    "L’image doit être un chemin local enregistré.",
  ),
  alt: z.string().trim().min(1).max(250),
  isActive: z.boolean(),
}).strict();

// Les photos publiées de l'accueil sont des informations publiques.
router.get("/photos", async (_req, res) => {
  const photos = await prisma.homepagePhoto.findMany({
    where: { isActive: true },
    select: { productKey: true, productId: true, title: true, imageUrl: true, alt: true, position: true },
    orderBy: { position: "asc" },
  });

  res.status(200).json({ success: true, data: photos });
});

// L’administration lit les cartes même lorsqu’elles sont masquées.
router.get("/photos/admin", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const photos = await prisma.homepagePhoto.findMany({ orderBy: { position: "asc" } });
  res.status(200).json({ success: true, data: photos });
});

// Seul un administrateur peut enregistrer le contenu d’une carte d’accueil.
router.put(
  "/photos/:productKey",
  requireAuth,
  requireRole("ADMIN"),
  validateBody(updateHomepageCardSchema),
  async (req, res) => {
    const photo = await prisma.$transaction(async (tx) => {
      const updatedPhoto = await tx.homepagePhoto.update({
        where: { productKey: req.params.productKey },
        data: req.body,
      });
      if (updatedPhoto.productId) {
        await tx.product.update({
          where: { id: updatedPhoto.productId },
          data: { name: updatedPhoto.title, imageUrl: updatedPhoto.imageUrl },
        });
      }
      return updatedPhoto;
    }).catch((error) => {
      if (error?.code === "P2025") return null;
      throw error;
    });

    if (!photo) {
      return res.status(404).json({ success: false, message: "Carte d’accueil introuvable." });
    }
    return res.status(200).json({ success: true, data: photo });
  },
);

export default router;
