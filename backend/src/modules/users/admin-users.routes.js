import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/schemaValidator.js";
import { updateAdminUserSchema } from "../../utils/validators.js";
import { listAdminUsers, updateAdminUser } from "./admin-users.controller.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));
router.get("/", listAdminUsers);
router.patch("/:id", validate(updateAdminUserSchema), updateAdminUser);

export default router;
