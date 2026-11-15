import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";

const router = Router();

const realizationSchema = z.object({
  title: z.string().trim().min(3, "Le titre doit contenir au moins 3 caractères.").max(160),
  description: z.string().trim().min(20, "La description doit contenir au moins 20 caractères.").max(3000),
  domain: z.string().trim().min(2).max(100),
  location: z.string().trim().max(160),
  imageUrl: z.string().trim().min(1).max(500).refine(
    (value) => value.startsWith("/") && !value.startsWith("//") && !value.includes(".."),
    "La photo doit être envoyée depuis l’administration.",
  ),
  imageAlt: z.string().trim().min(3).max(250),
  isPublished: z.boolean(),
}).strict();

const toResponse = ({ id, title, description, domain, location, imageUrl, imageAlt, isPublished, createdAt, updatedAt }) => ({
  id: String(id), title, description, domain, location: location ?? "", imageUrl,
  imageAlt: imageAlt || title, isPublished, createdAt, updatedAt,
});

function parseId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// Seules les réalisations publiées avec photo sont visibles sur le site public.
router.get("/", async (_req, res) => {
  const rows = await prisma.realization.findMany({
    where: { isPublished: true, imageUrl: { not: null } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: rows.map(toResponse) });
});

// La liste complète est réservée aux administrateurs.
router.get("/admin", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const rows = await prisma.realization.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: rows.map(toResponse) });
});

router.post("/", requireAuth, requireRole("ADMIN"), validateBody(realizationSchema), async (req, res) => {
  const row = await prisma.realization.create({ data: req.body });
  res.status(201).json({ success: true, data: toResponse(row) });
});

router.put("/:id", requireAuth, requireRole("ADMIN"), validateBody(realizationSchema), async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Identifiant de réalisation invalide." });
  const row = await prisma.realization.update({ where: { id }, data: req.body }).catch((error) => {
    if (error?.code === "P2025") return null;
    throw error;
  });
  if (!row) return res.status(404).json({ success: false, message: "Réalisation introuvable." });
  return res.json({ success: true, data: toResponse(row) });
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Identifiant de réalisation invalide." });
  const row = await prisma.realization.delete({ where: { id } }).catch((error) => {
    if (error?.code === "P2025") return null;
    throw error;
  });
  if (!row) return res.status(404).json({ success: false, message: "Réalisation introuvable." });
  return res.json({ success: true, data: toResponse(row) });
});

export default router;