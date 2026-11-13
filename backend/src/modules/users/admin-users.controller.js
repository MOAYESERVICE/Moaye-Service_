import { prisma } from "../../config/database.js";

const publicUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

function parseUserId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function listAdminUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: publicUserFields,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    res.json({
      success: true,
      data: users.map((user) => ({ ...user, isSelf: user.id === req.user.id })),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminUser(req, res, next) {
  const id = parseUserId(req.params.id);
  if (id === null) {
    return res.status(400).json({ success: false, message: "Identifiant utilisateur invalide." });
  }

  const { role, isActive } = req.validated;
  if (id === req.user.id && ((role && role !== "ADMIN") || isActive === false)) {
    return res.status(409).json({ success: false, message: "Vous ne pouvez pas retirer vos propres accès administrateur." });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.user.findUnique({ where: { id }, select: { id: true, role: true, isActive: true } });
      if (!current) return { kind: "missing" };

      const removingActiveAdmin = current.role === "ADMIN" && current.isActive &&
        ((role !== undefined && role !== "ADMIN") || isActive === false);
      if (removingActiveAdmin) {
        const activeAdminCount = await tx.user.count({ where: { role: "ADMIN", isActive: true } });
        if (activeAdminCount <= 1) return { kind: "last-admin" };
      }

      const user = await tx.user.update({
        where: { id },
        data: { ...(role !== undefined ? { role } : {}), ...(isActive !== undefined ? { isActive } : {}) },
        select: publicUserFields,
      });
      return { kind: "updated", user: { ...user, isSelf: user.id === req.user.id } };
    }, { isolationLevel: "Serializable" });

    if (result.kind === "missing") return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    if (result.kind === "last-admin") return res.status(409).json({ success: false, message: "Le dernier administrateur actif doit être conservé." });
    return res.json({ success: true, data: result.user });
  } catch (error) {
    if (error?.code === "P2034") {
      return res.status(409).json({ success: false, message: "Les accès ont changé simultanément. Actualisez la liste et réessayez." });
    }
    return next(error);
  }
}
